import {LanguageString} from "../../../src/core/domain/language-string";
import {CostBuilder} from "../../../src/core/domain/cost";
import {uuid} from "../../../mu-helper";
import {aMinimalLanguageString} from "./language-string-test-builder";


export function aMinimalCostForConceptSnapshot(): CostBuilder {
    return new CostBuilder()
        .withId(CostBuilder.buildIri(uuid()))
        .withTitle(aMinimalLanguageString(CostTestBuilder.TITLE).build())
        .withDescription(aMinimalLanguageString(CostTestBuilder.DESCRIPTION).build());
}

export function aMinimalCostForConcept(): CostBuilder {
    const uniqueId = uuid();
    return new CostBuilder()
        .withId(CostBuilder.buildIri(uniqueId))
        .withUuid(uniqueId)
        .withTitle(aMinimalLanguageString(CostTestBuilder.TITLE).build())
        .withDescription(aMinimalLanguageString(CostTestBuilder.DESCRIPTION).build());
}

export function aFullCost(): CostBuilder {
    return new CostBuilder()
        .withId(CostBuilder.buildIri(uuid()))
        .withUuid(uuid())
        .withTitle(LanguageString.of(
            CostTestBuilder.TITLE_EN,
            CostTestBuilder.TITLE_NL,
            CostTestBuilder.TITLE_NL_FORMAL,
            CostTestBuilder.TITLE_NL_INFORMAL,
            CostTestBuilder.TITLE_NL_GENERATED_FORMAL,
            CostTestBuilder.TITLE_NL_GENERATED_INFORMAL))
        .withDescription(
            LanguageString.of(
                CostTestBuilder.DESCRIPTION_EN,
                CostTestBuilder.DESCRIPTION_NL,
                CostTestBuilder.DESCRIPTION_NL_FORMAL,
                CostTestBuilder.DESCRIPTION_NL_INFORMAL,
                CostTestBuilder.DESCRIPTION_NL_GENERATED_FORMAL,
                CostTestBuilder.DESCRIPTION_NL_GENERATED_INFORMAL));
}

export function anotherFullCost(): CostBuilder {
    return new CostBuilder()
        .withId(CostBuilder.buildIri(uuid()))
        .withUuid(uuid())
        .withTitle(LanguageString.of(
            CostTestBuilder.ANOTHER_TITLE_EN,
            CostTestBuilder.ANOTHER_TITLE_NL,
            CostTestBuilder.ANOTHER_TITLE_NL_FORMAL,
            CostTestBuilder.ANOTHER_TITLE_NL_INFORMAL,
            CostTestBuilder.ANOTHER_TITLE_NL_GENERATED_FORMAL,
            CostTestBuilder.ANOTHER_TITLE_NL_GENERATED_INFORMAL))
        .withDescription(
            LanguageString.of(
                CostTestBuilder.ANOTHER_DESCRIPTION_EN,
                CostTestBuilder.ANOTHER_DESCRIPTION_NL,
                CostTestBuilder.ANOTHER_DESCRIPTION_NL_FORMAL,
                CostTestBuilder.ANOTHER_DESCRIPTION_NL_INFORMAL,
                CostTestBuilder.ANOTHER_DESCRIPTION_NL_GENERATED_FORMAL,
                CostTestBuilder.ANOTHER_DESCRIPTION_NL_GENERATED_INFORMAL));
}

export function aFullCostForInstance(): CostBuilder {
    return new CostBuilder()
        .withId(CostBuilder.buildIri(uuid()))
        .withUuid(uuid())
        .withTitle(LanguageString.of(
            CostTestBuilder.TITLE_EN,
            undefined,
            CostTestBuilder.TITLE_NL_FORMAL))
        .withDescription(LanguageString.of(
            CostTestBuilder.DESCRIPTION_EN,
            undefined,
            CostTestBuilder.DESCRIPTION_NL_FORMAL));
}

export function anotherFullCostForInstance(): CostBuilder {
    return new CostBuilder()
        .withId(CostBuilder.buildIri(uuid()))
        .withUuid(uuid())
        .withTitle(LanguageString.of(
            CostTestBuilder.ANOTHER_TITLE_EN,
            undefined,
            CostTestBuilder.ANOTHER_TITLE_NL_FORMAL))
        .withDescription(LanguageString.of(
            CostTestBuilder.ANOTHER_DESCRIPTION_EN,
            undefined,
            CostTestBuilder.ANOTHER_DESCRIPTION_NL_FORMAL));
}

export class CostTestBuilder {

    public static readonly TITLE = 'Cost Title';
    public static readonly TITLE_EN = 'Cost Title - en';
    public static readonly TITLE_NL = 'Cost Title - nl';
    public static readonly TITLE_NL_FORMAL = 'Cost Title - nl-formal';
    public static readonly TITLE_NL_INFORMAL = 'Cost Title - nl-informal';
    public static readonly TITLE_NL_GENERATED_FORMAL = 'Cost Title - nl-generated-formal';
    public static readonly TITLE_NL_GENERATED_INFORMAL = 'Cost Title - nl-generated-informal';

    public static readonly DESCRIPTION = 'Cost Description';
    public static readonly DESCRIPTION_EN = 'Cost Description - en';
    public static readonly DESCRIPTION_NL = 'Cost Description - nl';
    public static readonly DESCRIPTION_NL_FORMAL = 'Cost Description - nl-formal';
    public static readonly DESCRIPTION_NL_INFORMAL = 'Cost Description - nl-informal';
    public static readonly DESCRIPTION_NL_GENERATED_FORMAL = 'Cost Description - nl-generated-formal';
    public static readonly DESCRIPTION_NL_GENERATED_INFORMAL = 'Cost Description - nl-generated-informal';

    public static readonly ANOTHER_TITLE_EN = 'Cost Another Title - en';
    public static readonly ANOTHER_TITLE_NL = 'Cost Another Title - nl';
    public static readonly ANOTHER_TITLE_NL_FORMAL = 'Cost Another Title - nl-formal';
    public static readonly ANOTHER_TITLE_NL_INFORMAL = 'Cost Another Title - nl-informal';
    public static readonly ANOTHER_TITLE_NL_GENERATED_FORMAL = 'Cost Another Title - nl-generated-formal';
    public static readonly ANOTHER_TITLE_NL_GENERATED_INFORMAL = 'Cost Another Title - nl-generated-informal';

    public static readonly ANOTHER_DESCRIPTION_EN = 'Cost Another Description - en';
    public static readonly ANOTHER_DESCRIPTION_NL = 'Cost Another Description - nl';
    public static readonly ANOTHER_DESCRIPTION_NL_FORMAL = 'Cost Another Description - nl-formal';
    public static readonly ANOTHER_DESCRIPTION_NL_INFORMAL = 'Cost Another Description - nl-informal';
    public static readonly ANOTHER_DESCRIPTION_NL_GENERATED_FORMAL = 'Cost Another Description - nl-generated-formal';
    public static readonly ANOTHER_DESCRIPTION_NL_GENERATED_INFORMAL = 'Cost Another Description - nl-generated-informal';

}