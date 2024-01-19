import {FormDefinitionRepository} from "../../core/port/driven/persistence/form-definition-repository";
import fs from 'fs';
import {FORM_MAPPING} from "../../../config";

//TODO LPDC-917: write it tests (instead of only current end to end tests)
export class FormDefinitionFileRepository implements FormDefinitionRepository {

    //TODO LPDC-917: create a small object that caches the results (in a general way) - and create a cache key using the args ...
    private readonly cachedDefinitions = {};

    //TODO LPDC-917: switch language type to Language
    public loadFormDefinition(formId: string, language: string, isEnglishRequired: boolean): string {
        const cacheKey = `${formId}-${language}-${isEnglishRequired}`;
        if(this.cachedDefinitions[cacheKey]) {
            return this.cachedDefinitions[cacheKey];
        }

        const result = this.doReadLoadFormDefinition(formId, isEnglishRequired, language);

        this.cachedDefinitions[cacheKey] = result;

        return result;
    }

    private doReadLoadFormDefinition(formId: string, isEnglishRequired: boolean, language: string) {
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