import {
  FormApplicationService,
  ValidationError,
} from "./form-application-service";
import { Iri } from "../domain/shared/iri";
import {
  Bestuurseenheid,
  BestuurseenheidClassificatieCode,
} from "../domain/bestuurseenheid";
import { InstanceRepository } from "../port/driven/persistence/instance-repository";
import { InvariantError, NotFoundError } from "../domain/shared/lpdc-error";
import { Instance } from "../domain/instance";
import { ENABLE_ADDRESS_VALIDATION } from "../../../config";
import { BestuurseenheidRepository } from "../port/driven/persistence/bestuurseenheid-repository";
import { SpatialRepository } from "../port/driven/persistence/spatial-repository";
import {
  CodeRepository,
  CodeSchema,
} from "../port/driven/persistence/code-repository";
import { ExecutingAuthorityLevelType } from "../domain/types";
import { AuthorityLevelRepository } from "../port/driven/persistence/authority-level-repository";

export const INACTIVE_AUTHORITY_ERROR_MESSAGE =
  "Het product dat je probeert te verzenden, is gelinkt aan een inactief bestuur. Kijk in de tab ‘eigenschappen’ de overheidsorganisatie na.";
export const EXPIRED_SPATIAL_ERROR_MESSAGE =
  "Het product dat je probeert te verzenden, is gelinkt aan een inactief bestuur. Kijk in de tab ‘eigenschappen’ het geografisch toepassingsgebied na.";

export const EXECUTING_AUTHORITY_MISMATCH_ERROR = `Het uitvoerend bestuursniveau komt niet overeen met de geselecteerde overheid`;
export const COMPETENT_AUTHORITY_MISMATCH_ERROR = `Het bevoegd bestuursniveau komt niet overeen met de geselecteerde overheid`;
export const EXECUTING_AUTHORITY_MISSING_LOCAL_LEVEL_ERROR = `Dienstverlening van bovenlokale overheden kunnen niet worden toegevoegd aan LPDC. Het uitvoerend niveau hoort steeds lokale overheid te bevatten.`;
export const EXECUTING_AUTHORITY_MISSING_PROVINCIAL_LEVEL_ERROR = `Dienstverlening van bovenlokale overheden kunnen niet worden toegevoegd aan LPDC. Het uitvoerend niveau hoort steeds provinciale overheid te bevatten.`;

export class ValidateInstanceForPublishApplicationService {
  private readonly _formApplicationService: FormApplicationService;
  private readonly _instanceRepository: InstanceRepository;
  private readonly _bestuurseenheidRepository: BestuurseenheidRepository;
  private readonly _spatialRepository: SpatialRepository;
  private readonly _codeRepository: CodeRepository;
  private readonly _authorityLevelRepository: AuthorityLevelRepository;

  constructor(
    formApplicationService: FormApplicationService,
    instanceRepository: InstanceRepository,
    bestuurseenheidRepository: BestuurseenheidRepository,
    spatialRepository: SpatialRepository,
    codeRepository: CodeRepository,
    authorityLevelRepository: AuthorityLevelRepository,
  ) {
    this._formApplicationService = formApplicationService;
    this._instanceRepository = instanceRepository;
    this._bestuurseenheidRepository = bestuurseenheidRepository;
    this._spatialRepository = spatialRepository;
    this._codeRepository = codeRepository;
    this._authorityLevelRepository = authorityLevelRepository;
  }

  async validate(
    instanceId: Iri,
    bestuurseenheid: Bestuurseenheid,
  ): Promise<ValidationError[]> {
    const errorList = await this._formApplicationService.validateForms(
      instanceId,
      bestuurseenheid,
    );

    if (errorList.length) {
      return errorList;
    }

    const instance = await this._instanceRepository.findById(
      bestuurseenheid,
      instanceId,
    );

    const authorityError = await this.validateAuthorities(instance);
    if (authorityError) {
      errorList.push(authorityError);
    }

    const spatialError = await this.validateSpatials(instance);
    if (spatialError) {
      errorList.push(spatialError);
    }

    // Validate competent authorities
    const competentAuthorityErrors =
      await this.validateAuthoritiesCompetentLevelMapping(
        instance.competentAuthorityLevels,
        instance.competentAuthorities,
      );
    if (competentAuthorityErrors) {
      errorList.push(...competentAuthorityErrors);
    }

    // Validate executing authorities
    const executingAuthorityErrors =
      await this.validateAuthoritiesExecutingLevelMapping(
        instance.executingAuthorityLevels,
        instance.executingAuthorities,
        bestuurseenheid,
      );
    if (executingAuthorityErrors) {
      errorList.push(...executingAuthorityErrors);
    }

    if (errorList.length) {
      return errorList;
    }

    return this.tryValidateForPublish(instance);
  }

  private collectAndGroupAuthorityUris(instance: Instance) {
    const ovoCodeIris = [];
    const administrativeUnitIris = [];

    [
      ...new Set(
        instance.competentAuthorities.concat(instance.executingAuthorities),
      ),
    ].forEach((iri) =>
      iri.isOvoCodeIri
        ? ovoCodeIris.push(iri)
        : administrativeUnitIris.push(iri),
    );

    return { ovoCodeIris, administrativeUnitIris };
  }

  private async validateAuthorities(
    instance: Instance,
  ): Promise<ValidationError> {
    try {
      const { ovoCodeIris, administrativeUnitIris } =
        this.collectAndGroupAuthorityUris(instance);

      const ovoCodeAuthorities = await Promise.all(
        ovoCodeIris.flatMap(
          async (uri) =>
            await this._codeRepository.exists(CodeSchema.IPDCOrganisaties, uri),
        ),
      );

      if (ovoCodeAuthorities.includes(false)) {
        return { message: INACTIVE_AUTHORITY_ERROR_MESSAGE };
      }

      const authorityUnits = await Promise.all(
        administrativeUnitIris.flatMap(
          async (uri) => await this._bestuurseenheidRepository.findById(uri),
        ),
      );

      const hasInvalidAuthority = authorityUnits.some(
        (authority) => !authority.isValidAuthority,
      );

      if (hasInvalidAuthority) {
        return { message: INACTIVE_AUTHORITY_ERROR_MESSAGE };
      }
    } catch (e) {
      if (e instanceof NotFoundError) {
        return { message: INACTIVE_AUTHORITY_ERROR_MESSAGE };
      }
    }
  }

  private async validateSpatials(instance: Instance): Promise<ValidationError> {
    try {
      const spatials = await Promise.all(
        instance.spatials.flatMap((uri) =>
          this._spatialRepository.findById(uri),
        ),
      );

      const hasExpiredSpatial = spatials.some((spatial) => spatial.isExpired);
      if (hasExpiredSpatial) {
        return { message: EXPIRED_SPATIAL_ERROR_MESSAGE };
      }
    } catch (e) {
      if (e instanceof NotFoundError) {
        return { message: EXPIRED_SPATIAL_ERROR_MESSAGE };
      }
    }
  }

  private tryValidateForPublish(instance: Instance): ValidationError[] {
    try {
      instance.validateForPublish(ENABLE_ADDRESS_VALIDATION);
      return [];
    } catch (e) {
      if (e instanceof InvariantError) {
        return [
          {
            message: e.message,
          },
        ];
      } else {
        throw e;
      }
    }
  }

  private async validateAuthoritiesExecutingLevelMapping(
    selectedLevels: string[],
    selectedAuthorities: Iri[],
    bestuurseenheid: Bestuurseenheid,
  ): Promise<ValidationError[]> {
    const errors = [];

    // 1. Translate the selected executing authorities to their corresponding levels
    const levelsForSelectedAuthorities = await Promise.all(
      selectedAuthorities.map(async (iri) => {
        return await this._authorityLevelRepository.getExecutingAuthorityLevel(
          iri,
        );
      }),
    );

    // 2. Perform the common validation call
    const hasErrors: boolean = this.hasInvalidAuthorityLevelMapping(
      selectedLevels,
      levelsForSelectedAuthorities,
    );

    if (hasErrors) {
      errors.push({ message: EXECUTING_AUTHORITY_MISMATCH_ERROR });
    }

    // 3. The additional validations for lokaal/provinciaal & derden
    if (selectedLevels.length > 0) {
      const isProvince =
        bestuurseenheid.classificatieCode ===
        BestuurseenheidClassificatieCode.PROVINCIE;
      const requiredLevel = isProvince
        ? ExecutingAuthorityLevelType.PROVINCIAAL
        : ExecutingAuthorityLevelType.LOKAAL;
      const errorMessage = isProvince
        ? EXECUTING_AUTHORITY_MISSING_PROVINCIAL_LEVEL_ERROR
        : EXECUTING_AUTHORITY_MISSING_LOCAL_LEVEL_ERROR;

      // Check if neither the required level nor DERDEN is selected
      if (
        !selectedLevels.includes(requiredLevel) &&
        !selectedLevels.includes(ExecutingAuthorityLevelType.DERDEN)
      ) {
        errors.push({ message: errorMessage });
      }
    }

    return errors;
  }

  private async validateAuthoritiesCompetentLevelMapping(
    selectedLevels: string[],
    selectedAuthorities: Iri[],
  ): Promise<ValidationError[]> {
    const errors = [];

    // 1. Translate the selected executing authorities to their corresponding levels
    const levelsForSelectedAuthorities = await Promise.all(
      selectedAuthorities.map(async (iri) => {
        return await this._authorityLevelRepository.getCompetentAuthorityLevel(
          iri,
        );
      }),
    );

    // 2. Perform the common validation call
    const hasErrors: boolean = this.hasInvalidAuthorityLevelMapping(
      selectedLevels,
      levelsForSelectedAuthorities,
    );

    if (hasErrors) {
      errors.push({ message: COMPETENT_AUTHORITY_MISMATCH_ERROR });
    }

    return errors;
  }

  private hasInvalidAuthorityLevelMapping(
    selectedLevels: string[],
    levelsForSelectedAuthorities: string[],
  ): boolean {
    const validAuthorityLevels = levelsForSelectedAuthorities.filter(
      (level) => level !== undefined,
    );

    // If either list is empty skip validations
    if (selectedLevels.length === 0 || validAuthorityLevels.length === 0) {
      return false;
    }

    // Check if every selected level has a corresponding authority level or is unmatchable
    const hasInvalidLevel = selectedLevels.some(
      (level) => !validAuthorityLevels.includes(level), // not matching
    );

    const hasInvalidAuthority = validAuthorityLevels.some(
      (authLevel) => !selectedLevels.includes(authLevel), // not matching
    );

    // Now only return invalid if both sides contain at least one value that does not match
    return hasInvalidLevel && hasInvalidAuthority;
  }
}
