import { LegalResourceBuilder } from "../../../src/core/domain/legal-resource";
import { uuid } from "../../../mu-helper";
import { LanguageString } from "../../../src/core/domain/language-string";
import { buildCodexVlaanderenIri } from "./iri-test-builder";

export function aMinimalLegalResourceForConceptSnapshot(): LegalResourceBuilder {
  return new LegalResourceBuilder()
    .withId(LegalResourceBuilder.buildIri(uuid()))
    .withUrl(LegalResourceTestBuilder.URL)
    .withOrder(1);
}

export function aMinimalLegalResourceForConcept(): LegalResourceBuilder {
  const uniqueId = uuid();
  return new LegalResourceBuilder()
    .withId(LegalResourceBuilder.buildIri(uniqueId))
    .withUuid(uniqueId)
    .withUrl(LegalResourceTestBuilder.URL)
    .withOrder(1);
}

export function aMinimalLegalResourceForInstance(): LegalResourceBuilder {
  const uniqueId = uuid();
  return new LegalResourceBuilder()
    .withId(LegalResourceBuilder.buildIri(uniqueId))
    .withUuid(uniqueId)
    .withOrder(1);
}

export function aMinimalLegalResourceForInstanceSnapshot(): LegalResourceBuilder {
  return new LegalResourceBuilder()
    .withId(LegalResourceBuilder.buildIri(uuid()))
    .withUrl(LegalResourceTestBuilder.URL)
    .withOrder(1);
}

export function aFullLegalResourceForConceptSnapshot(): LegalResourceBuilder {
  return new LegalResourceBuilder()
    .withId(LegalResourceBuilder.buildIri(uuid()))
    .withTitle(
      LanguageString.of(
        LegalResourceTestBuilder.TITLE_NL,
        LegalResourceTestBuilder.TITLE_NL_FORMAL,
        LegalResourceTestBuilder.TITLE_NL_INFORMAL,
        LegalResourceTestBuilder.TITLE_NL_GENERATED_FORMAL,
        LegalResourceTestBuilder.TITLE_NL_GENERATED_INFORMAL,
      ),
    )
    .withDescription(
      LanguageString.of(
        LegalResourceTestBuilder.DESCRIPTION_NL,
        LegalResourceTestBuilder.DESCRIPTION_NL_FORMAL,
        LegalResourceTestBuilder.DESCRIPTION_NL_INFORMAL,
        LegalResourceTestBuilder.DESCRIPTION_NL_GENERATED_FORMAL,
        LegalResourceTestBuilder.DESCRIPTION_NL_GENERATED_INFORMAL,
      ),
    )
    .withUrl(LegalResourceTestBuilder.URL)
    .withOrder(1);
}

export function anotherFullLegalResourceForConceptSnapshot(
  aUuid: string,
): LegalResourceBuilder {
  return new LegalResourceBuilder()
    .withId(LegalResourceBuilder.buildIri(aUuid))
    .withTitle(
      LanguageString.of(
        LegalResourceTestBuilder.ANOTHER_TITLE_TEMPLATE_NL(aUuid),
        LegalResourceTestBuilder.ANOTHER_TITLE_TEMPLATE_NL_FORMAL(aUuid),
        LegalResourceTestBuilder.ANOTHER_TITLE_TEMPLATE_NL_INFORMAL(aUuid),
        LegalResourceTestBuilder.ANOTHER_TITLE_TEMPLATE_NL_GENERATED_FORMAL(
          aUuid,
        ),
        LegalResourceTestBuilder.ANOTHER_TITLE_TEMPLATE_NL_GENERATED_INFORMAL(
          aUuid,
        ),
      ),
    )
    .withDescription(
      LanguageString.of(
        LegalResourceTestBuilder.ANOTHER_DESCRIPTION_TEMPLATE_NL(aUuid),
        LegalResourceTestBuilder.ANOTHER_DESCRIPTION_TEMPLATE_NL_FORMAL(aUuid),
        LegalResourceTestBuilder.ANOTHER_DESCRIPTION_TEMPLATE_NL_INFORMAL(
          aUuid,
        ),
        LegalResourceTestBuilder.ANOTHER_DESCRIPTION_TEMPLATE_NL_GENERATED_FORMAL(
          aUuid,
        ),
        LegalResourceTestBuilder.ANOTHER_DESCRIPTION_TEMPLATE_NL_GENERATED_INFORMAL(
          aUuid,
        ),
      ),
    )
    .withUrl(LegalResourceTestBuilder.ANOTHER_URL_TEMPLATE(aUuid))
    .withOrder(2);
}

export function aFullLegalResourceForConcept(): LegalResourceBuilder {
  return aFullLegalResourceForConceptSnapshot().withUuid(uuid());
}

export function anotherFullLegalResourceForConcept(
  aUuid: string,
): LegalResourceBuilder {
  return anotherFullLegalResourceForConceptSnapshot(aUuid).withUuid(aUuid);
}

export function aFullLegalResourceForInstance(): LegalResourceBuilder {
  return new LegalResourceBuilder()
    .withId(LegalResourceBuilder.buildIri(uuid()))
    .withUuid(uuid())
    .withTitle(
      LanguageString.of(undefined, LegalResourceTestBuilder.TITLE_NL_FORMAL),
    )
    .withDescription(
      LanguageString.of(
        undefined,
        LegalResourceTestBuilder.DESCRIPTION_NL_FORMAL,
      ),
    )
    .withUrl(LegalResourceTestBuilder.URL)
    .withOrder(1);
}

export function anotherFullLegalResourceForInstance(
  aUuid: string,
): LegalResourceBuilder {
  return new LegalResourceBuilder()
    .withId(LegalResourceBuilder.buildIri(aUuid))
    .withUuid(aUuid)
    .withTitle(
      LanguageString.of(
        undefined,
        LegalResourceTestBuilder.ANOTHER_TITLE_TEMPLATE_NL_FORMAL(aUuid),
      ),
    )
    .withDescription(
      LanguageString.of(
        undefined,
        LegalResourceTestBuilder.ANOTHER_DESCRIPTION_TEMPLATE_NL_FORMAL(aUuid),
      ),
    )
    .withUrl(LegalResourceTestBuilder.ANOTHER_URL_TEMPLATE(aUuid))
    .withOrder(2);
}

export function aFullLegalResourceForInstanceSnapshot(): LegalResourceBuilder {
  return new LegalResourceBuilder()
    .withId(LegalResourceBuilder.buildIri(uuid()))
    .withTitle(
      LanguageString.of(
        undefined,
        undefined,
        LegalResourceTestBuilder.TITLE_NL_INFORMAL,
      ),
    )
    .withDescription(
      LanguageString.of(
        undefined,
        undefined,
        LegalResourceTestBuilder.DESCRIPTION_NL_INFORMAL,
      ),
    )
    .withUrl(LegalResourceTestBuilder.URL)
    .withOrder(1);
}

export function anotherFullLegalResourceForInstanceSnapshot(
  aUuid: string,
): LegalResourceBuilder {
  return new LegalResourceBuilder()
    .withId(LegalResourceBuilder.buildIri(aUuid))
    .withTitle(
      LanguageString.of(
        undefined,
        undefined,
        LegalResourceTestBuilder.ANOTHER_TITLE_TEMPLATE_NL_INFORMAL(aUuid),
      ),
    )
    .withDescription(
      LanguageString.of(
        undefined,
        undefined,
        LegalResourceTestBuilder.ANOTHER_DESCRIPTION_TEMPLATE_NL_INFORMAL(
          aUuid,
        ),
      ),
    )
    .withUrl(LegalResourceTestBuilder.ANOTHER_URL_TEMPLATE(aUuid))
    .withOrder(2);
}

export class LegalResourceTestBuilder {
  public static readonly TITLE = "Legal Resource Title";
  public static readonly TITLE_NL = "Legal Resource Title - nl";
  public static readonly TITLE_NL_FORMAL = "Legal Resource Title - nl-formal";
  public static readonly TITLE_NL_INFORMAL =
    "Legal Resource Title - nl-informal";
  public static readonly TITLE_NL_GENERATED_FORMAL =
    "Legal Resource Title - nl-generated-formal";
  public static readonly TITLE_NL_GENERATED_INFORMAL =
    "Legal Resource Title - nl-generated-informal";

  public static readonly DESCRIPTION = "Legal Resource Description";
  public static readonly DESCRIPTION_NL = "Legal Resource Description - nl";
  public static readonly DESCRIPTION_NL_FORMAL =
    "Legal Resource Description - nl-formal";
  public static readonly DESCRIPTION_NL_INFORMAL =
    "Legal Resource Description - nl-informal";
  public static readonly DESCRIPTION_NL_GENERATED_FORMAL =
    "Legal Resource Description - nl-generated-formal";
  public static readonly DESCRIPTION_NL_GENERATED_INFORMAL =
    "Legal Resource Description - nl-generated-informal";

  public static readonly ANOTHER_TITLE_TEMPLATE_NL = (param: string) =>
    `Legal Resource Another Title - nl - ${param}`;
  public static readonly ANOTHER_TITLE_TEMPLATE_NL_FORMAL = (param: string) =>
    `Legal Resource Another Title - nl-formal - ${param}`;
  public static readonly ANOTHER_TITLE_TEMPLATE_NL_INFORMAL = (param: string) =>
    `Legal Resource Another Title - nl-informal - ${param}`;
  public static readonly ANOTHER_TITLE_TEMPLATE_NL_GENERATED_FORMAL = (
    param: string,
  ) => `Legal Resource Another Title - nl-generated-formal - ${param}`;
  public static readonly ANOTHER_TITLE_TEMPLATE_NL_GENERATED_INFORMAL = (
    param: string,
  ) => `Legal Resource Another Title - nl-generated-informal - ${param}`;

  public static readonly ANOTHER_DESCRIPTION_TEMPLATE_NL = (param: string) =>
    `Legal Resource Another Description - nl - ${param}`;
  public static readonly ANOTHER_DESCRIPTION_TEMPLATE_NL_FORMAL = (
    param: string,
  ) => `Legal Resource Another Description - nl-formal - ${param}`;
  public static readonly ANOTHER_DESCRIPTION_TEMPLATE_NL_INFORMAL = (
    param: string,
  ) => `Legal Resource Another Description - nl-informal - ${param}`;
  public static readonly ANOTHER_DESCRIPTION_TEMPLATE_NL_GENERATED_FORMAL = (
    param: string,
  ) => `Legal Resource Another Description - nl-generated-formal - ${param}`;
  public static readonly ANOTHER_DESCRIPTION_TEMPLATE_NL_GENERATED_INFORMAL = (
    param: string,
  ) => `Legal Resource Another Description - nl-generated-informal - ${param}`;

  public static readonly URL = buildCodexVlaanderenIri(uuid()).value;
  public static readonly ANOTHER_URL_TEMPLATE = (param: string) =>
    buildCodexVlaanderenIri(param).value;
}
