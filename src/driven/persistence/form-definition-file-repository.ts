import {FormDefinitionRepository} from "../../core/port/driven/persistence/form-definition-repository";
import fs from 'fs';
import {FORM_MAPPING} from "../../../config";

export class FormDefinitionFileRepository implements FormDefinitionRepository {

    //TODO LPDC-917: switch language type to Language
    public loadFormDefinition(formId: string, language: string, isEnglishRequired: boolean): string {
        let form = fs.readFileSync(`./src/driven/persistence/forms/${FORM_MAPPING[formId]}/form.ttl`, 'utf8');
        if (FORM_MAPPING[formId] === "content" && isEnglishRequired) {
            const englishRequirementFormSnippets = fs.readFileSync(`./src/driven/persistence/forms/${FORM_MAPPING[formId]}/add-english-requirement.ttl`, 'utf8');
            form += englishRequirementFormSnippets;
        }
        return this.adjustLanguageOfForm(form, language);
    }

    private adjustLanguageOfForm(form: string, newLanguage: string): string {
        return form.replaceAll(`form:language "<FORMAL_INFORMAL_LANGUAGE>"`, `form:language "${newLanguage}"`);
    }


}