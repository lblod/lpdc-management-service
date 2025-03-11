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
  `1 Ontbrekende uitvoerende bestuursniveau voor uitvoerende organisatie van bestuursniveau '${level}'`;
export const EXECUTING_AUTHORITY_MISSING_ORGANISATION_ERROR = (level: string) =>
  `2 Ontbrekende uitvoerende organisatie voor uitvoerend bestuursniveau '${level}'`;

export const COMPETENT_AUTHORITY_MISSING_LEVEL_ERROR = (level: string) =>
  `3 Ontbrekende uitvoerende bestuursniveau van bestuursniveau '${level}'`;
export const COMPETENT_AUTHORITY_MISSING_ORGANISATION_ERROR = (level: string) =>
  `4 Ontbrekende uitvoerende organisatie voor uitvoerend bestuursniveau '${level}'`;
export const EXECUTING_AUTHORITY_MISSING_LOCAL_LEVEL_ERROR = `Vlaamse of federale dienstverlening waar het lokaal bestuur geen uitvoerende rol heeft, wordt door de Vlaamse redacteurs aan IPDC toegevoegd. Je hoeft deze informatie niet zelf aan te maken en te onderhouden in LPDC.`;

enum CompetentAuthorityLevels {
  LOKAAL = "https://productencatalogus.data.vlaanderen.be/id/concept/BevoegdBestuursniveau/Lokaal",
  FEDERAAL = "https://productencatalogus.data.vlaanderen.be/id/concept/BevoegdBestuursniveau/Federaal",
  VLAAMS = "https://productencatalogus.data.vlaanderen.be/id/concept/BevoegdBestuursniveau/Vlaams",
  EUROPEES = "https://productencatalogus.data.vlaanderen.be/id/concept/BevoegdBestuursniveau/Europees",
  PROVINCIAAL = "https://productencatalogus.data.vlaanderen.be/id/concept/BevoegdBestuursniveau/Provinciaal",
}

enum ExecutingAuthorityLevels {
  LOKAAL = "https://productencatalogus.data.vlaanderen.be/id/concept/UitvoerendBestuursniveau/Lokaal",
  FEDERAAL = "https://productencatalogus.data.vlaanderen.be/id/concept/UitvoerendBestuursniveau/Federaal",
  VLAAMS = "https://productencatalogus.data.vlaanderen.be/id/concept/UitvoerendBestuursniveau/Vlaams",
  EUROPEES = "https://productencatalogus.data.vlaanderen.be/id/concept/UitvoerendBestuursniveau/Europees",
  PROVINCIAAL = "https://productencatalogus.data.vlaanderen.be/id/concept/UitvoerendBestuursniveau/Provinciaal",
  DERDEN = "https://productencatalogus.data.vlaanderen.be/id/concept/UitvoerendBestuursniveau/Derden",
}


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
        authorityLevel = await this._codeRepository.getExecutionLevelForOvoCode(iri);
      } else {
        const adminUnit = await this._bestuurseenheidRepository.findById(iri);
        authorityLevel = adminUnit.executionLevel;
      }

      switch (authorityLevel) {
        case ExecutingAuthorityLevels.LOKAAL:
          authorityLevels.add(ExecutingAuthorityLevelType.LOKAAL);
          break;
        case ExecutingAuthorityLevels.FEDERAAL:
          authorityLevels.add(ExecutingAuthorityLevelType.FEDERAAL);
          break;
        case ExecutingAuthorityLevels.VLAAMS:
          authorityLevels.add(ExecutingAuthorityLevelType.VLAAMS);
          break;
        case ExecutingAuthorityLevels.EUROPEES:
          authorityLevels.add(ExecutingAuthorityLevelType.EUROPEES);
          break;
        case ExecutingAuthorityLevels.PROVINCIAAL:
          authorityLevels.add(ExecutingAuthorityLevelType.PROVINCIAAL);
          break;
        case ExecutingAuthorityLevels.DERDEN:
          authorityLevels.add(ExecutingAuthorityLevelType.DERDEN);
          break;
      }
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
      if (!authorityLevels.has(level)) {
        // a level is selected with no corresponding organisation
        errors.push({ message: EXECUTING_AUTHORITY_MISSING_ORGANISATION_ERROR(level) });
      }
    });

    // Check if user has *not* selected lokaal or derden
    if(!selectedLevels.includes(ExecutingAuthorityLevelType.LOKAAL) && !selectedLevels.includes(ExecutingAuthorityLevelType.DERDEN)){
      errors.push({ message: EXECUTING_AUTHORITY_MISSING_LOCAL_LEVEL_ERROR });
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
        authorityLevel = await this._codeRepository.getCompetencyLevelForOvoCode(iri);
      } else {
        const adminUnit = await this._bestuurseenheidRepository.findById(iri);
        authorityLevel = adminUnit.competencyLevel;
      }

      switch (authorityLevel) {
        case CompetentAuthorityLevels.LOKAAL:
          authorityLevels.add(CompetentAuthorityLevelType.LOKAAL);
          break;
        case CompetentAuthorityLevels.FEDERAAL:
          authorityLevels.add(CompetentAuthorityLevelType.FEDERAAL);
          break;
        case CompetentAuthorityLevels.VLAAMS:
          authorityLevels.add(CompetentAuthorityLevelType.VLAAMS);
          break;
        case CompetentAuthorityLevels.EUROPEES:
          authorityLevels.add(CompetentAuthorityLevelType.EUROPEES);
          break;
        case CompetentAuthorityLevels.PROVINCIAAL:
          authorityLevels.add(CompetentAuthorityLevelType.PROVINCIAAL);
          break;
      }
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
