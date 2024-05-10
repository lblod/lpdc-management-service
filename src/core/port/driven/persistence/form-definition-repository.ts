import {FormType} from "../../../domain/types";
import {Language} from "../../../domain/language";

export interface FormDefinitionRepository {

    loadFormDefinition(formType: FormType, language: Language): string;

}