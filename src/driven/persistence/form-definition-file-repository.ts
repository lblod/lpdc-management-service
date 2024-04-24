import {FormDefinitionRepository} from "../../core/port/driven/persistence/form-definition-repository";
import fs from 'fs';
import {FormType} from "../../core/domain/types";
import {Language} from "../../core/domain/language";

export class FormDefinitionFileRepository implements FormDefinitionRepository {

    public loadFormDefinition(formType: FormType, language: Language): string {
        const form = fs.readFileSync(`./src/driven/persistence/forms/${formType}/form.ttl`, 'utf8');
        return this.adjustLanguageOfForm(form, language);
    }

    private adjustLanguageOfForm(form: string, newLanguage: Language): string {
        return form.replaceAll(`form:language "<FORMAL_INFORMAL_LANGUAGE>"`, `form:language "${newLanguage}"`);
    }


}