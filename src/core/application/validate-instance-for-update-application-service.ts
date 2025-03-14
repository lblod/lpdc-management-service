import { ValidationError } from "./form-application-service";
import { Iri } from "../domain/shared/iri";
import { Bestuurseenheid } from "../domain/bestuurseenheid";
import { InstanceRepository } from "../port/driven/persistence/instance-repository";
import { SemanticFormsMapper } from "../port/driven/persistence/semantic-forms-mapper";
import { ExecutingAuthorityLevelType } from "../domain/types";
import { AuthorityLevelRepository } from "../port/driven/persistence/authority-level-repository";

export const EXECUTING_AUTHORITY_MISSING_LEVEL_ERROR = (level: string) =>
  `Ontbrekende uitvoerende bestuursniveau: ${level}`;
export const EXECUTING_AUTHORITY_MISSING_ORGANISATION_ERROR = (level: string) =>
  `Ontbrekende uitvoerende organisatie met bestuursniveau: ${level}`;

export const COMPETENT_AUTHORITY_MISSING_LEVEL_ERROR = (level: string) =>
  `Ontbrekende uitvoerende bestuursniveau: ${level}`;
export const COMPETENT_AUTHORITY_MISSING_ORGANISATION_ERROR = (level: string) =>
  `Ontbrekende uitvoerende organisatie met bestuursniveau: ${level}`;
export const EXECUTING_AUTHORITY_MISSING_LOCAL_LEVEL_ERROR = `Vlaamse of federale dienstverlening waar het lokaal bestuur geen uitvoerende rol heeft, wordt door de Vlaamse redacteurs aan IPDC toegevoegd. Je hoeft deze informatie niet zelf aan te maken en te onderhouden in LPDC.`;

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
      await this.validateAuthoritiesExecutionLevelMapping(
        mergedInstance.executingAuthorityLevels,
        mergedInstance.executingAuthorities
      );
    if (executingAuthorityErrors) {
      errorList.push(...executingAuthorityErrors);
    }

    return errorList;
  }

  private async validateAuthoritiesExecutionLevelMapping(
    selectedLevels: string[],
    selectedAuthorities: Iri[]
  ): Promise<ValidationError[]> {
    const errors: ValidationError[] = [];
    const authorityLevels = new Set<string>();

    // Aggregate levels of selected authorities, if any authorities are selected
    if (selectedAuthorities.length > 0) {
      for (const iri of selectedAuthorities) {
        const authorityLevel =
          await this._authorityLevelRepository.getAuthorityLevel(
            iri,
            "executionLevel"
          );

        authorityLevels.add(authorityLevel);

        // Check if we have authorities, but no levels (non-blocking)
        if (selectedLevels.length === 0) {
          errors.push({
            message: EXECUTING_AUTHORITY_MISSING_LEVEL_ERROR(authorityLevel),
            isBlocking: false,
          });
        }
      }
      console.log("execution authority levels:", authorityLevels);
    }

    // If both levels and authorities are selected: check if every selected org has a corresponding level
    if (selectedLevels.length > 0 && selectedAuthorities.length > 0) {
      authorityLevels.forEach((level) => {
        if (!selectedLevels.includes(level)) {
          // an organisation is selected, with no corresponding level
          errors.push({
            message: EXECUTING_AUTHORITY_MISSING_LEVEL_ERROR(level),
            isBlocking: true,
          });
        }
      });
    }

    // Check if every selected level has a corresponding org with an equal level
    selectedLevels.forEach((level) => {
      // Exception: skip when 'derden' is filled in as the level, there doesn't need to be a matching org
      if (level === ExecutingAuthorityLevelType.DERDEN) return;

      // Check if we have levels, but no authorities (non-blocking)
      if (selectedAuthorities.length === 0) {
        errors.push({
          message: EXECUTING_AUTHORITY_MISSING_ORGANISATION_ERROR(level),
          isBlocking: false,
        });
      } else {
        if (!authorityLevels.has(level)) {
          // a level is selected with no corresponding organisation
          errors.push({
            message: EXECUTING_AUTHORITY_MISSING_ORGANISATION_ERROR(level),
            isBlocking: true,
          });
        }
      }
    });

    // if the selectedLevels is filled in, check if user has *not* selected lokaal or derden (blocking)
    if (
      selectedLevels.length > 0 &&
      !selectedLevels.includes(ExecutingAuthorityLevelType.LOKAAL) &&
      !selectedLevels.includes(ExecutingAuthorityLevelType.DERDEN)
    ) {
      errors.push({
        message: EXECUTING_AUTHORITY_MISSING_LOCAL_LEVEL_ERROR,
        isBlocking: true,
      });
    }

    return errors;
  }

  private async validateAuthoritiesCompetentLevelMapping(
    selectedLevels: string[],
    selectedAuthorities: Iri[]
  ): Promise<ValidationError[]> {
    const errors: ValidationError[] = [];
    const authorityLevels = new Set<string>();

    // Aggreggate levels of selected authorities, if any authorities are selected
    if (selectedAuthorities.length > 0) {
      for (const iri of selectedAuthorities) {
        const authorityLevel =
          await this._authorityLevelRepository.getAuthorityLevel(
            iri,
            "competencyLevel"
          );

        authorityLevels.add(authorityLevel);

        // Check if we have authorities, but no levels (non-blocking)
        if (selectedLevels.length === 0) {
          errors.push({
            message: COMPETENT_AUTHORITY_MISSING_LEVEL_ERROR(authorityLevel),
            isBlocking: false,
          });
        }
      }
      console.log("Competent authority levels:", authorityLevels);
    }

    // If both levels and authorities are selected: check if every selected org has a corresponding level
    if (selectedLevels.length > 0 && selectedAuthorities.length > 0) {
      authorityLevels.forEach((level) => {
        if (!selectedLevels.includes(level)) {
          // an organisation is selected, with no corresponding level
          errors.push({
            message: COMPETENT_AUTHORITY_MISSING_LEVEL_ERROR(level),
            isBlocking: true,
          });
        }
      });
    }

    // Check if every selected level has a corresponding org with an equal level
    selectedLevels.forEach((level) => {
      // Check is we have levels, but no authorities (non-blocking)
      if (selectedAuthorities.length === 0) {
        errors.push({
          message: COMPETENT_AUTHORITY_MISSING_ORGANISATION_ERROR(level),
          isBlocking: false,
        });
      } else {
        if (!authorityLevels.has(level)) {
          // a level is selected with no corresponding organisation
          errors.push({
            message: COMPETENT_AUTHORITY_MISSING_ORGANISATION_ERROR(level),
            isBlocking: true,
          });
        }
      }
    });

    return errors;
  }
}
