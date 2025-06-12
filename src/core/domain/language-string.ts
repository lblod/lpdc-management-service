import { Language } from "./language";
import { uniq } from "lodash";
import { InvariantError } from "./shared/lpdc-error";
import { isNotBlank } from "./shared/string-helper";

export class LanguageString {
  private readonly _nl: string | undefined;
  private readonly _nlFormal: string | undefined;
  private readonly _nlInformal: string | undefined;
  private readonly _nlGeneratedFormal: string | undefined;
  private readonly _nlGeneratedInformal: string | undefined;

  private constructor(
    nl: string | undefined,
    nlFormal: string | undefined,
    nlInformal: string | undefined,
    nlGeneratedFormal: string | undefined,
    nlGeneratedInformal: string | undefined,
  ) {
    //TODO LPDC-968: re-enable when empty triples are fixed in data
    // const invariant = Invariant.require([nl, nlFormal, nlInformal, nlGeneratedFormal, nlGeneratedInformal], 'language list');
    // invariant.to(invariant.haveAtLeastOneValuePresent());
    this._nl = nl;
    this._nlFormal = nlFormal;
    this._nlInformal = nlInformal;
    this._nlGeneratedFormal = nlGeneratedFormal;
    this._nlGeneratedInformal = nlGeneratedInformal;
  }

  public static of(
    nl?: string | undefined,
    nlFormal?: string | undefined,
    nlInformal?: string | undefined,
    nlGeneratedFormal?: string | undefined,
    nlGeneratedInformal?: string | undefined,
  ): LanguageString {
    return new LanguageString(
      nl,
      nlFormal,
      nlInformal,
      nlGeneratedFormal,
      nlGeneratedInformal,
    );
  }

  public static ofValueInLanguage(
    value: string,
    language: Language,
  ): LanguageString {
    return LanguageString.of(
      language === Language.NL ? value : undefined,
      language === Language.FORMAL ? value : undefined,
      language === Language.INFORMAL ? value : undefined,
      language === Language.GENERATED_FORMAL ? value : undefined,
      language === Language.GENERATED_INFORMAL ? value : undefined,
    );
  }

  get nl(): string | undefined {
    return this._nl;
  }

  get nlFormal(): string | undefined {
    return this._nlFormal;
  }

  get nlInformal(): string | undefined {
    return this._nlInformal;
  }

  get nlGeneratedFormal(): string | undefined {
    return this._nlGeneratedFormal;
  }

  get nlGeneratedInformal(): string | undefined {
    return this._nlGeneratedInformal;
  }

  get notBlankLanguages(): Language[] {
    const definedLanguages = [];
    if (isNotBlank(this._nl)) definedLanguages.push(Language.NL);
    if (isNotBlank(this._nlFormal)) definedLanguages.push(Language.FORMAL);
    if (isNotBlank(this._nlInformal)) definedLanguages.push(Language.INFORMAL);
    if (isNotBlank(this._nlGeneratedFormal))
      definedLanguages.push(Language.GENERATED_FORMAL);
    if (isNotBlank(this._nlGeneratedInformal))
      definedLanguages.push(Language.GENERATED_INFORMAL);
    return uniq(definedLanguages);
  }

  get definedLanguages(): Language[] {
    const definedLanguages = [];
    if (this._nl !== undefined) definedLanguages.push(Language.NL);
    if (this._nlFormal !== undefined) definedLanguages.push(Language.FORMAL);
    if (this._nlInformal !== undefined)
      definedLanguages.push(Language.INFORMAL);
    if (this._nlGeneratedFormal !== undefined)
      definedLanguages.push(Language.GENERATED_FORMAL);
    if (this._nlGeneratedInformal !== undefined)
      definedLanguages.push(Language.GENERATED_INFORMAL);
    return uniq(definedLanguages);
  }

  getLanguageValue(language: Language): string | undefined {
    if (language === Language.NL) return this._nl;
    if (language === Language.FORMAL) return this._nlFormal;
    if (language === Language.INFORMAL) return this._nlInformal;
    if (language === Language.GENERATED_FORMAL) return this._nlGeneratedFormal;
    if (language === Language.GENERATED_INFORMAL)
      return this._nlGeneratedInformal;
  }

  transformLanguage(from: Language, to: Language) {
    return LanguageString.ofValueInLanguage(this.getLanguageValue(from), to);
  }

  static extractLanguages(
    languages: (LanguageString | undefined)[],
  ): Language[] {
    return uniq(
      languages
        .filter((ls) => ls !== undefined)
        .flatMap((ls) => ls.definedLanguages),
    );
  }

  static validateUniqueLanguage(values: (LanguageString | undefined)[]): void {
    const languages = uniq(this.extractLanguages(values));

    if (languages.length > 1) {
      throw new InvariantError("Er is meer dan een nl-taal aanwezig");
    }
  }

  static validateUniqueAndCorrectLanguages(
    acceptedLanguages: Language[],
    ...values: (LanguageString | undefined)[]
  ): void {
    LanguageString.validateUniqueLanguage(values);

    const nlLanguage = LanguageString.extractLanguages(values)[0];
    if (!acceptedLanguages.includes(nlLanguage) && nlLanguage !== undefined) {
      throw new InvariantError(
        `De nl-taal verschilt van ${acceptedLanguages.toString()}`,
      );
    }
  }

  static isFunctionallyChanged(
    value: LanguageString | undefined,
    other: LanguageString | undefined,
  ): boolean {
    return value?.nl !== other?.nl;
  }

  static compare(a: LanguageString, b: LanguageString): number {
    let comparison = LanguageString.compareValues(a._nl, b._nl);
    if (comparison !== 0) return comparison;

    comparison = LanguageString.compareValues(a._nlFormal, b._nlFormal);
    if (comparison !== 0) return comparison;

    comparison = LanguageString.compareValues(a._nlInformal, b._nlInformal);
    if (comparison !== 0) return comparison;

    comparison = LanguageString.compareValues(
      a._nlGeneratedFormal,
      b._nlGeneratedFormal,
    );
    if (comparison !== 0) return comparison;

    comparison = LanguageString.compareValues(
      a._nlGeneratedInformal,
      b._nlGeneratedInformal,
    );
    if (comparison !== 0) return comparison;

    return 0;
  }

  static isAbsent(
    value: LanguageString | undefined,
    languageVariant: Language,
  ): boolean {
    return (
      !value ||
      !value.getLanguageValue(languageVariant) ||
      value.getLanguageValue(languageVariant).trim() === ""
    );
  }

  private static compareValues(
    a: string | undefined,
    b: string | undefined,
  ): number {
    const strA = a || "";
    const strB = b || "";
    return strA.localeCompare(strB);
  }
}
