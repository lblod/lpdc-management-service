import {FormDefinitionRepository} from "../../core/port/driven/persistence/form-definition-repository";
import fs from 'fs';
import {FORM_MAPPING} from "../../../config";

//TODO LPDC-917: write it tests (instead of only current end to end tests)
export class FormDefinitionFileRepository implements FormDefinitionRepository {

    //TODO LPDC-917: cache static content (maybe even the language replacement result?)
    //TODO LPDC-917: switch language type to Language
    loadFormDefinition(formId: string, language: string, isEnglishRequired: boolean): string {

        let form = fs.readFileSync(`./src/driven/persistence/forms/${FORM_MAPPING[formId]}/form.ttl`, 'utf8');
        // If a user chooses "YourEurope" as their publication channel, load
        // the relevants snippets into the content form that render the English fields obligatory.
        if (FORM_MAPPING[formId] === "content" && isEnglishRequired) {
            const englishRequirementFormSnippets = fs.readFileSync(`./src/driven/persistence/forms/${FORM_MAPPING[formId]}/add-english-requirement.ttl`, 'utf8');
            form += englishRequirementFormSnippets;
        }
        form = this.adjustLanguageOfForm(form, language);
        return form;
    }

    private adjustLanguageOfForm(form: string, newLanguage: string): string {
        return form.replaceAll(`form:language "<FORMAL_INFORMAL_LANGUAGE>"`, `form:language "${newLanguage}"`);
    }


}