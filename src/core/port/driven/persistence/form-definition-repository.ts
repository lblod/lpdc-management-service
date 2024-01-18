export interface FormDefinitionRepository {

    loadFormDefinition(formId: string, language: string, isEnglishRequired: boolean): string;

}