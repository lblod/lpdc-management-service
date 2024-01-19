import {FormDefinitionRepository} from "../../core/port/driven/persistence/form-definition-repository";
import fs from 'fs';
import {FormType} from "../../core/domain/types";

export class FormDefinitionFileRepository implements FormDefinitionRepository {

    //TODO LPDC-917: switch language type to Language
    public loadFormDefinition(formType: FormType, language: string, isEnglishRequired: boolean): string {
        let form = fs.readFileSync(`./src/driven/persistence/forms/${formType}/form.ttl`, 'utf8');
        if (formType === FormType.CONTENT && isEnglishRequired) {
            const englishRequirementFormSnippets = fs.readFileSync(`./src/driven/persistence/forms/${formType}/add-english-requirement.ttl`, 'utf8');
            form += englishRequirementFormSnippets;
        }
        return this.adjustLanguageOfForm(form, language);
    }

    private adjustLanguageOfForm(form: string, newLanguage: string): string {
        return form.replaceAll(`form:language "<FORMAL_INFORMAL_LANGUAGE>"`, `form:language "${newLanguage}"`);
    }


}