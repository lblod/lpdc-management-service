import { ValidationError } from "./form-application-service";
import { Iri } from "../domain/shared/iri";
import {
  Bestuurseenheid,
  BestuurseenheidClassificatieCode,
} from "../domain/bestuurseenheid";
import { InstanceRepository } from "../port/driven/persistence/instance-repository";
import { SemanticFormsMapper } from "../port/driven/persistence/semantic-forms-mapper";
import {
  ExecutingAuthorityLevelType,
} from "../domain/types";
import { AuthorityLevelRepository } from "../port/driven/persistence/authority-level-repository";

export const EXECUTING_AUTHORITY_MISMATCH_ERROR = `Het uitvoerend bestuursniveau komt niet overeen met de geselecteerde overheid`;
export const COMPETENT_AUTHORITY_MISMATCH_ERROR = `Het bevoegd bestuursniveau komt niet overeen met de geselecteerde overheid`;
export const EXECUTING_AUTHORITY_MISSING_LOCAL_LEVEL_ERROR = `Dienstverlening van bovenlokale overheden kunnen niet worden toegevoegd aan LPDC. Het uitvoerend niveau hoort steeds lokale overheid te bevatten.`;
export const EXECUTING_AUTHORITY_MISSING_PROVINCIAL_LEVEL_ERROR = `Dienstverlening van bovenlokale overheden kunnen niet worden toegevoegd aan LPDC. Het uitvoerend niveau hoort steeds provinciale overheid te bevatten.`;

export class ValidateInstanceForUpdateApplicationService {
  private readonly _instanceRepository: InstanceRepository;
  private readonly _semanticFormsMapper: SemanticFormsMapper;
  private readonly _authorityLevelRepository: AuthorityLevelRepository;

  constructor(
    instanceRepository: InstanceRepository,
    semanticFormsMapper: SemanticFormsMapper,
    authorityLevelRepository: AuthorityLevelRepository
  ) {
    this._instanceRepository = instanceRepository;
    this._semanticFormsMapper = semanticFormsMapper;
    this._authorityLevelRepository = authorityLevelRepository;
  }

  async validate(
    bestuurseenheid: Bestuurseenheid,
    instanceId: Iri,
    removalsAsTurtleFormat: string,
    additionsAsTurtleFormat: string
  ): Promise<ValidationError[]> {
    const errorList: ValidationError[] = [];

    const currentInstance = await this._instanceRepository.findById(
      bestuurseenheid,
      instanceId
    );
    const mergedInstance = this._semanticFormsMapper.mergeInstance(
      bestuurseenheid,
      currentInstance,
      removalsAsTurtleFormat,
      additionsAsTurtleFormat
    );

    // Validate competent authorities
    const competentAuthorityErrors =
      await this.validateAuthoritiesCompetentLevelMapping(
        mergedInstance.competentAuthorityLevels,
        mergedInstance.competentAuthorities
      );
    if (competentAuthorityErrors) {
      errorList.push(...competentAuthorityErrors);
    }

    // Validate executing authorities
    const executingAuthorityErrors =
      await this.validateAuthoritiesExecutingLevelMapping(
        mergedInstance.executingAuthorityLevels,
        mergedInstance.executingAuthorities,
        bestuurseenheid
      );
    if (executingAuthorityErrors) {
      errorList.push(...executingAuthorityErrors);
    }

    return errorList;
  }

  private async validateAuthoritiesExecutingLevelMapping(
    selectedLevels: string[],
    selectedAuthorities: Iri[],
    bestuurseenheid: Bestuurseenheid
  ): Promise<ValidationError[]> {
    const errors = [];

    // 1. Translate the selected executing authorities to their corresponding levels
    const levelsForSelectedAuthorities = await Promise.all(selectedAuthorities.map(
      async (iri) => {
        return await this._authorityLevelRepository.getExecutingAuthorityLevel(iri);
      }
    ));

    // 2. Perform the common validation call
    const hasErrors: boolean = this.hasInvalidAuthorityLevelMapping(
      selectedLevels,
      levelsForSelectedAuthorities
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
    selectedAuthorities: Iri[]
  ): Promise<ValidationError[]> {
    const errors = [];

    // 1. Translate the selected executing authorities to their corresponding levels
    const levelsForSelectedAuthorities = await Promise.all(selectedAuthorities.map(
      async (iri) => {
        return await this._authorityLevelRepository.getCompetentAuthorityLevel(iri);
      }
    ));

    // 2. Perform the common validation call
    const hasErrors: boolean = this.hasInvalidAuthorityLevelMapping(
      selectedLevels,
      levelsForSelectedAuthorities
    );

    if (hasErrors) {
      errors.push({ message: COMPETENT_AUTHORITY_MISMATCH_ERROR });
    }


    return errors;
  }

  private hasInvalidAuthorityLevelMapping(selectedLevels: string[], levelsForSelectedAuthorities: string[]): boolean {
    // Check if every selected level has a matching authority selected with the same level
    const hasLevelWithoutMatchingAuthority = selectedLevels.some((level) => {
      // Skip the validation if the selected authorities has an undefined (the authority doesn't have a level yet) or there are no authorities selected
      if(levelsForSelectedAuthorities.includes(undefined) || levelsForSelectedAuthorities.length === 0) return false;

      return !levelsForSelectedAuthorities.includes(level);
    });

    // Check if every selected authority has a matching level selected
    const hasAuthorityWithoutMatchingLevel = levelsForSelectedAuthorities.some((level) => {
      if (level === undefined) return false;

      return !selectedLevels.includes(level);
    });

    return hasLevelWithoutMatchingAuthority || hasAuthorityWithoutMatchingLevel;
  }
}
