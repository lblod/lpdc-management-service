import {FormDefinitionRepository} from "../../core/port/driven/persistence/form-definition-repository";
import fs from 'fs';
import {FormType} from "../../core/domain/types";
import {Language} from "../../core/domain/language";

export class FormDefinitionFileRepository implements FormDefinitionRepository {

    contactpoint = 'CONTACTPOINT';
    municipalityMerger = 'MUNICIPALITY_MERGER_FILTER';
    language = "FORMAL_INFORMAL_LANGUAGE";

    public loadInstanceFormDefinition(formType: FormType, language: Language): string {
        let form = this.readForm(formType);
        form = this.replaceInForm(form, this.contactpoint, 'form:includes ext:contactpointsL;');
        form = this.replaceInForm(form, this.municipalityMerger, 'form:includes ext:forMunicipalityMergerF.');
        form = this.replaceInForm(form, this.language, language);
        return form;
    }

    public loadConceptFormDefinition(formType: FormType, language: Language): string {
        let form = this.readForm(formType);
        form = this.replaceInForm(form, this.contactpoint, '');
        form = this.replaceInForm(form, this.municipalityMerger, '.');
        form = this.replaceInForm(form, this.language, language);
        return form;
    }

    private readForm(formType: string): string {
        return fs.readFileSync(`./src/driven/persistence/forms/${formType}/form.ttl`, 'utf8');
    }

    private replaceInForm(form, field: string, value: string) {
        return form.replaceAll(`<${field}>`, value);
    }

}
