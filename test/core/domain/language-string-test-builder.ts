import { LanguageString } from "../../../src/core/domain/language-string";

export function aMinimalLanguageString(
  value: string = "",
): LanguageStringTestBuilder {
  return new LanguageStringTestBuilder().withNl(
    `${value}${LanguageStringTestBuilder.NL}`,
  );
}

export function aMinimalFormalLanguageString(
  value: string = "",
): LanguageStringTestBuilder {
  return new LanguageStringTestBuilder().withNlFormal(
    `${value}${LanguageStringTestBuilder.NL_FORMAL}`,
  );
}

export function aMinimalInformalLanguageString(
  value: string = "",
): LanguageStringTestBuilder {
  return new LanguageStringTestBuilder().withNlInformal(
    `${value}${LanguageStringTestBuilder.NL_INFORMAL}`,
  );
}

export function aFullLanguageString(
  value: string = "",
): LanguageStringTestBuilder {
  return new LanguageStringTestBuilder()
    .withNl(`${value}${LanguageStringTestBuilder.NL}`)
    .withNlFormal(`${value}${LanguageStringTestBuilder.NL_FORMAL}`)
    .withNlInformal(`${value}${LanguageStringTestBuilder.NL_INFORMAL}`)
    .withNlGeneratedFormal(
      `${value}${LanguageStringTestBuilder.NL_GENERATED_FORMAL}`,
    )
    .withNlGeneratedInformal(
      `${value}${LanguageStringTestBuilder.NL_GENERATED_INFORMAL}`,
    );
}

export class LanguageStringTestBuilder {
  public static readonly NL = " - nl";
  public static readonly NL_FORMAL = " - nl-formal";
  public static readonly NL_INFORMAL = " - nl-informal";
  public static readonly NL_GENERATED_FORMAL = " - nl-generated-formal";
  public static readonly NL_GENERATED_INFORMAL = " - nl-generated-informal";

  private nl: string | undefined;
  private nlFormal: string | undefined;
  private nlInformal: string | undefined;
  private nlGeneratedFormal: string | undefined;
  private nlGeneratedInformal: string | undefined;

  public withNl(nl: string): LanguageStringTestBuilder {
    this.nl = nl;
    return this;
  }

  public withNlFormal(nlFormal: string): LanguageStringTestBuilder {
    this.nlFormal = nlFormal;
    return this;
  }

  public withNlInformal(nlInformal: string): LanguageStringTestBuilder {
    this.nlInformal = nlInformal;
    return this;
  }

  public withNlGeneratedFormal(
    nlGeneratedFormal: string,
  ): LanguageStringTestBuilder {
    this.nlGeneratedFormal = nlGeneratedFormal;
    return this;
  }

  public withNlGeneratedInformal(
    nlGeneratedInformal: string,
  ): LanguageStringTestBuilder {
    this.nlGeneratedInformal = nlGeneratedInformal;
    return this;
  }

  public build(): LanguageString {
    return LanguageString.of(
      this.nl,
      this.nlFormal,
      this.nlInformal,
      this.nlGeneratedFormal,
      this.nlGeneratedInformal,
    );
  }
}
