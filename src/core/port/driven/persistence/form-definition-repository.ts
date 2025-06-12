import { FormType } from "../../../domain/types";
import { Language } from "../../../domain/language";

export interface FormDefinitionRepository {
  loadInstanceFormDefinition(formType: FormType, language: Language): string;

  loadConceptFormDefinition(formType: FormType, language: Language): string;
}
