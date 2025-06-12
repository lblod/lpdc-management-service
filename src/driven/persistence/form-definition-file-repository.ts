import { FormDefinitionRepository } from "../../core/port/driven/persistence/form-definition-repository";
import fs from "fs";
import { FormType } from "../../core/domain/types";
import { Language } from "../../core/domain/language";
import { ENABLE_MUNICIPALITY_MERGER_FLAG, NUTS_VERSION } from "../../../config";

export class FormDefinitionFileRepository implements FormDefinitionRepository {
  contactpoint = "CONTACTPOINT";
  municipalityMerger = "MUNICIPALITY_MERGER_FILTER";
  language = "FORMAL_INFORMAL_LANGUAGE";
  nuts_version = "NUTS_VERSION";

  public loadInstanceFormDefinition(
    formType: FormType,
    language: Language,
  ): string {
    let form = this.readForm(formType);
    form = this.replaceInForm(
      form,
      this.contactpoint,
      "form:includes ext:contactpointsL;",
    );

    const municipalityMergerReplacement = ENABLE_MUNICIPALITY_MERGER_FLAG
      ? "form:includes ext:forMunicipalityMergerF."
      : ".";
    form = this.replaceInForm(
      form,
      this.municipalityMerger,
      municipalityMergerReplacement,
    );
    form = this.replaceInForm(form, this.language, language);
    form = this.replaceInForm(form, this.nuts_version, NUTS_VERSION);
    return form;
  }

  public loadConceptFormDefinition(
    formType: FormType,
    language: Language,
  ): string {
    let form = this.readForm(formType);
    form = this.replaceInForm(form, this.contactpoint, "");
    form = this.replaceInForm(form, this.municipalityMerger, ".");
    form = this.replaceInForm(form, this.language, language);
    form = this.replaceInForm(form, this.nuts_version, NUTS_VERSION);
    return form;
  }

  private readForm(formType: string): string {
    return fs.readFileSync(
      `./src/driven/persistence/forms/${formType}/form.ttl`,
      "utf8",
    );
  }

  private replaceInForm(form, field: string, value: string) {
    return form.replaceAll(`<${field}>`, value);
  }
}
