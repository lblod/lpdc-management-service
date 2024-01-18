
export interface FormDefinitionRepository {

    //TODO LPDC-917: switch language type to Language
    loadFormDefinition(formId: string, language: string, isEnglishRequired: boolean): string;

}