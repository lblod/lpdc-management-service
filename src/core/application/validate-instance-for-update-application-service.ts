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
  OrganizationLevelType,
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
    const { errors, authorityLevels } =
      await this.validateAuthorityLevelMappingCommon(
        selectedLevels,
        selectedAuthorities,
        OrganizationLevelType.EXECUTINGLEVEL
      );

    // Check if every selected level has a corresponding org with an equal level
    if (authorityLevels.size > 0 && !authorityLevels.has(undefined)) {
      const hasLevelWithoutMatchingAuthority = selectedLevels.some((level) => {
        // Exception: skip when 'derden' is filled in as the level, there doesn't need to be a matching org
        if (level === ExecutingAuthorityLevelType.DERDEN) return false;

        return !authorityLevels.has(level);
      });

      if (
        hasLevelWithoutMatchingAuthority &&
        !errors.some((e) => e.message === EXECUTING_AUTHORITY_MISMATCH_ERROR)
      ) {
        errors.push({
          message: EXECUTING_AUTHORITY_MISMATCH_ERROR,
        });
      }
    }

    // if the selectedLevels is filled in, check the Lokaal/Provinciaal or Derden validation
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
    const { errors, authorityLevels } =
      await this.validateAuthorityLevelMappingCommon(
        selectedLevels,
        selectedAuthorities,
        OrganizationLevelType.COMPETENTLEVEL
      );

    // Check if every selected level has a corresponding org with an equal level
    if (authorityLevels.size > 0 && !authorityLevels.has(undefined)) {
      const hasLevelWithoutMatchingAuthority = selectedLevels.some((level) => {
        return !authorityLevels.has(level);
      });

      if (
        hasLevelWithoutMatchingAuthority &&
        !errors.some(
          (e) => e.message === COMPETENT_AUTHORITY_MISMATCH_ERROR
        )
      ) {
        errors.push({
          message: COMPETENT_AUTHORITY_MISMATCH_ERROR,
        });
      }
    }

    return errors;
  }

  /**
   * Helper function to validate the common parts of authority level mapping
   */
  private async validateAuthorityLevelMappingCommon(
    selectedLevels: string[],
    selectedAuthorities: Iri[],
    authorityType: OrganizationLevelType
  ): Promise<{ errors: ValidationError[]; authorityLevels: Set<string> }> {
    const errors: ValidationError[] = [];
    const authorityLevels = new Set<string>();

    // Aggregate levels of selected authorities, if any authorities are selected
    if (selectedAuthorities.length > 0) {
      for (const iri of selectedAuthorities) {
        let authorityLevel: string;

        if (authorityType === OrganizationLevelType.EXECUTINGLEVEL) {
          authorityLevel =
            await this._authorityLevelRepository.getExecutingAuthorityLevel(
              iri
            );
        } else if (authorityType === OrganizationLevelType.COMPETENTLEVEL) {
          authorityLevel =
            await this._authorityLevelRepository.getCompetentAuthorityLevel(
              iri
            );
        }

        authorityLevels.add(authorityLevel);
      }

      // If both levels and authorities are selected: check if every selected org has a corresponding level
      if (selectedLevels.length > 0) {
        const hasAuthorityWithoutMatchingLevel = Array.from(
          authorityLevels
        ).some((level) => {
          // Skip check if no level is found
          if (level === undefined) return false;

          return !selectedLevels.includes(level);
        });

        if (hasAuthorityWithoutMatchingLevel) {
          if (authorityType === OrganizationLevelType.EXECUTINGLEVEL) {
            errors.push({
              message: EXECUTING_AUTHORITY_MISMATCH_ERROR,
            });
          } else if (authorityType === OrganizationLevelType.COMPETENTLEVEL) {
            errors.push({
              message: COMPETENT_AUTHORITY_MISMATCH_ERROR,
            });
          }
        }
      }
    }
    return { errors, authorityLevels };
  }
}
