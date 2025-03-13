import { ValidationError } from "./form-application-service";
import { Iri } from "../domain/shared/iri";
import { Bestuurseenheid } from "../domain/bestuurseenheid";
import { InstanceRepository } from "../port/driven/persistence/instance-repository";
import { BestuurseenheidRepository } from "../port/driven/persistence/bestuurseenheid-repository";
import { SemanticFormsMapper } from "../port/driven/persistence/semantic-forms-mapper";
import {
  ExecutingAuthorityLevelType,
  CompetentAuthorityLevelType,
} from "../domain/types";
import { CodeRepository } from '../port/driven/persistence/code-repository';

// A level is selected
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
  private readonly _bestuurseenheidRepository: BestuurseenheidRepository;
  private readonly _semanticFormsMapper: SemanticFormsMapper;
  private readonly _codeRepository: CodeRepository;

  constructor(
    instanceRepository: InstanceRepository,
    bestuurseenheidRepository: BestuurseenheidRepository,
    semanticFormsMapper: SemanticFormsMapper,
    codeRepository: CodeRepository
  ) {
    this._instanceRepository = instanceRepository;
    this._bestuurseenheidRepository = bestuurseenheidRepository;
    this._semanticFormsMapper = semanticFormsMapper;
    this._codeRepository = codeRepository;
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
    const competentAuthorityErrors = await this.validateAuthoritiesCompetentLevelMapping(mergedInstance.competentAuthorityLevels, mergedInstance.competentAuthorities);
    if (competentAuthorityErrors){
      errorList.push(...competentAuthorityErrors);
    }

    // Validate executing authorities
    const executingAuthorityErrors = await this.validateAuthoritiesExecutionLevelMapping(
      mergedInstance.executingAuthorityLevels,
      mergedInstance.executingAuthorities,
    );
    if (executingAuthorityErrors) {
      errorList.push(...executingAuthorityErrors);
    }

    return errorList;
  }

  private async validateAuthoritiesExecutionLevelMapping(
    selectedLevels: string[],
    selectedAuthorities: Iri[],
  ): Promise<ValidationError[]> {
    const errors: ValidationError[] = [];
    const authorityLevels = new Set<string>();

    for(const iri of selectedAuthorities){
      let authorityLevel;
      if(iri.isOvoCodeIri){
        authorityLevel = await this._codeRepository.getAuthorityLevelForOvoCode(iri, 'executionLevel');
      } else {
        const adminUnit = await this._bestuurseenheidRepository.findById(iri);
        authorityLevel = adminUnit.executionLevel;
      }

      authorityLevels.add(authorityLevel);
    }
    console.log('execution authority levels:', authorityLevels);

    // Check if every selected org has a corresponding level
    authorityLevels.forEach((level) => {
      if (!selectedLevels.includes(level)) {
        // an organisation is selected, with no corresponding level
        errors.push({ message: EXECUTING_AUTHORITY_MISSING_LEVEL_ERROR(level) });
      }
    });

    // Check if every selected level has a corresponding org with an equal level
    selectedLevels.forEach((level) => {
      // Exception: skip when 'derden' is filled in as the level, there doesn't need to be a matching org
      if(level === ExecutingAuthorityLevelType.DERDEN) return;

      if (!authorityLevels.has(level)) {
        // a level is selected with no corresponding organisation
        errors.push({ message: EXECUTING_AUTHORITY_MISSING_ORGANISATION_ERROR(level) });
      }
    });

    // Check if user has *not* selected lokaal or derden
    if(!selectedLevels.includes(ExecutingAuthorityLevelType.LOKAAL) && !selectedLevels.includes(ExecutingAuthorityLevelType.DERDEN)){
      errors.push({ message: EXECUTING_AUTHORITY_MISSING_LOCAL_LEVEL_ERROR, isBlocking: true });
    }

    return errors;
  }

  private async validateAuthoritiesCompetentLevelMapping(
    selectedLevels: string[],
    selectedAuthorities: Iri[],
  ): Promise<ValidationError[]> {
    const errors: ValidationError[] = [];
    const authorityLevels = new Set<string>();

    for(const iri of selectedAuthorities){
      let authorityLevel;
      if(iri.isOvoCodeIri){
        authorityLevel = await this._codeRepository.getAuthorityLevelForOvoCode(iri, "competencyLevel");
      } else {
        const adminUnit = await this._bestuurseenheidRepository.findById(iri);
        authorityLevel = adminUnit.competencyLevel;
      }

      authorityLevels.add(authorityLevel);
    }
    console.log('Competent authority levels:', authorityLevels);

    // Check if every selected org has a corresponding level
    authorityLevels.forEach((level) => {
      if (!selectedLevels.includes(level)) {
        // an organisation is selected, with no corresponding level
        errors.push({ message: COMPETENT_AUTHORITY_MISSING_LEVEL_ERROR(level) });
      }
    });

    // Check if every selected level has a corresponding org with an equal level
    selectedLevels.forEach((level) => {
      if (!authorityLevels.has(level)) {
        // a level is selected with no corresponding organisation
        errors.push({ message: COMPETENT_AUTHORITY_MISSING_ORGANISATION_ERROR(level) });
      }
    });

    return errors;
  }
}
