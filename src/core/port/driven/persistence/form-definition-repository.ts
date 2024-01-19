import {FormType} from "../../../domain/types";

export interface FormDefinitionRepository {

    //TODO LPDC-917: switch language type to Language
    loadFormDefinition(formType: FormType, language: string, isEnglishRequired: boolean): string;

}