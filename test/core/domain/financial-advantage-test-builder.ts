import {LanguageString} from "../../../src/core/domain/language-string";
import {FinancialAdvantageBuilder} from "../../../src/core/domain/financial-advantage";
import {uuid} from "mu";
import {aMinimalInformalLanguageString, aMinimalLanguageString} from "./language-string-test-builder";

export function aMinimalFinancialAdvantageForConceptSnapshot(): FinancialAdvantageBuilder {
    return new FinancialAdvantageBuilder()
        .withId(FinancialAdvantageBuilder.buildIri(uuid()))
        .withTitle(aMinimalLanguageString(FinancialAdvantageTestBuilder.TITLE).build())
        .withDescription(aMinimalLanguageString(FinancialAdvantageTestBuilder.DESCRIPTION).build())
        .withOrder(1);
}

export function aMinimalFinancialAdvantageForConcept(): FinancialAdvantageBuilder {
    const uniqueId = uuid();
    return new FinancialAdvantageBuilder()
        .withId(FinancialAdvantageBuilder.buildIri(uniqueId))
        .withUuid(uniqueId)
        .withTitle(aMinimalLanguageString(FinancialAdvantageTestBuilder.TITLE).build())
        .withDescription(aMinimalLanguageString(FinancialAdvantageTestBuilder.DESCRIPTION).build())
        .withOrder(1);
}

export function aMinimalFinancialAdvantageForInstance(): FinancialAdvantageBuilder {
    const uniqueId = uuid();
    return new FinancialAdvantageBuilder()
        .withId(FinancialAdvantageBuilder.buildIri(uniqueId))
        .withUuid(uniqueId)
        .withOrder(1);
}

export function aMinimalFinancialAdvantageForInstanceSnapshot(): FinancialAdvantageBuilder {
    const uniqueId = uuid();
    return new FinancialAdvantageBuilder()
        .withId(FinancialAdvantageBuilder.buildIri(uniqueId))
        .withTitle(aMinimalInformalLanguageString(FinancialAdvantageTestBuilder.TITLE).build())
        .withDescription(aMinimalInformalLanguageString(FinancialAdvantageTestBuilder.DESCRIPTION).build())
        .withOrder(1);
}

export function aFullFinancialAdvantage(): FinancialAdvantageBuilder {
    const uniqueId = uuid();
    return new FinancialAdvantageBuilder()
        .withId(FinancialAdvantageBuilder.buildIri(uniqueId))
        .withUuid(uniqueId)
        .withTitle(LanguageString.of(
            FinancialAdvantageTestBuilder.TITLE_NL,
            FinancialAdvantageTestBuilder.TITLE_NL_FORMAL,
            FinancialAdvantageTestBuilder.TITLE_NL_INFORMAL,
            FinancialAdvantageTestBuilder.TITLE_NL_GENERATED_FORMAL,
            FinancialAdvantageTestBuilder.TITLE_NL_GENERATED_INFORMAL))
        .withDescription(
            LanguageString.of(
                FinancialAdvantageTestBuilder.DESCRIPTION_NL,
                FinancialAdvantageTestBuilder.DESCRIPTION_NL_FORMAL,
                FinancialAdvantageTestBuilder.DESCRIPTION_NL_INFORMAL,
                FinancialAdvantageTestBuilder.DESCRIPTION_NL_GENERATED_FORMAL,
                FinancialAdvantageTestBuilder.DESCRIPTION_NL_GENERATED_INFORMAL))
        .withOrder(1);
}

export function anotherFullFinancialAdvantage(): FinancialAdvantageBuilder {
    return new FinancialAdvantageBuilder()
        .withId(FinancialAdvantageBuilder.buildIri(uuid()))
        .withTitle(LanguageString.of(
            FinancialAdvantageTestBuilder.ANOTHER_TITLE_NL,
            FinancialAdvantageTestBuilder.ANOTHER_TITLE_NL_FORMAL,
            FinancialAdvantageTestBuilder.ANOTHER_TITLE_NL_INFORMAL,
            FinancialAdvantageTestBuilder.ANOTHER_TITLE_NL_GENERATED_FORMAL,
            FinancialAdvantageTestBuilder.ANOTHER_TITLE_NL_GENERATED_INFORMAL))
        .withDescription(
            LanguageString.of(
                FinancialAdvantageTestBuilder.ANOTHER_DESCRIPTION_NL,
                FinancialAdvantageTestBuilder.ANOTHER_DESCRIPTION_NL_FORMAL,
                FinancialAdvantageTestBuilder.ANOTHER_DESCRIPTION_NL_INFORMAL,
                FinancialAdvantageTestBuilder.ANOTHER_DESCRIPTION_NL_GENERATED_FORMAL,
                FinancialAdvantageTestBuilder.ANOTHER_DESCRIPTION_NL_GENERATED_INFORMAL))
        .withOrder(2);
}

export function aFullFinancialAdvantageForInstance(): FinancialAdvantageBuilder {
    const uniqueId = uuid();
    return new FinancialAdvantageBuilder()
        .withId(FinancialAdvantageBuilder.buildIri(uniqueId))
        .withUuid(uniqueId)
        .withTitle(LanguageString.of(
            undefined,
            FinancialAdvantageTestBuilder.TITLE_NL_FORMAL))
        .withDescription(LanguageString.of(
            undefined,
            FinancialAdvantageTestBuilder.DESCRIPTION_NL_FORMAL))
        .withOrder(1);
}

export function anotherFullFinancialAdvantageForInstance(): FinancialAdvantageBuilder {
    const uniqueId = uuid();
    return new FinancialAdvantageBuilder()
        .withId(FinancialAdvantageBuilder.buildIri(uniqueId))
        .withUuid(uniqueId)
        .withTitle(LanguageString.of(
            undefined,
            FinancialAdvantageTestBuilder.ANOTHER_TITLE_NL_FORMAL))
        .withDescription(LanguageString.of(
            undefined,
            FinancialAdvantageTestBuilder.ANOTHER_DESCRIPTION_NL_FORMAL))
        .withOrder(2);
}

export function aFullFinancialAdvantageForInstanceSnapshot(): FinancialAdvantageBuilder {
    const uniqueId = uuid();
    return new FinancialAdvantageBuilder()
        .withId(FinancialAdvantageBuilder.buildIri(uniqueId))
        .withTitle(LanguageString.of(
            undefined,
            undefined,
            FinancialAdvantageTestBuilder.TITLE_NL_INFORMAL))
        .withDescription(LanguageString.of(
            undefined,
            undefined,
            FinancialAdvantageTestBuilder.DESCRIPTION_NL_INFORMAL))
        .withOrder(1);
}

export function anotherFullFinancialAdvantageForInstanceSnapshot(): FinancialAdvantageBuilder {
    const uniqueId = uuid();
    return new FinancialAdvantageBuilder()
        .withId(FinancialAdvantageBuilder.buildIri(uniqueId))
        .withTitle(LanguageString.of(
            undefined,
            undefined,
            FinancialAdvantageTestBuilder.ANOTHER_TITLE_NL_INFORMAL))
        .withDescription(LanguageString.of(
            undefined,
            undefined,
            FinancialAdvantageTestBuilder.ANOTHER_DESCRIPTION_NL_INFORMAL))
        .withOrder(2);
}

export class FinancialAdvantageTestBuilder {

    public static readonly TITLE = 'Financial Advantage Title';
    public static readonly TITLE_NL = 'Financial Advantage Title - nl';
    public static readonly TITLE_NL_FORMAL = 'Financial Advantage Title - nl-formal';
    public static readonly TITLE_NL_INFORMAL = 'Financial Advantage Title - nl-informal';
    public static readonly TITLE_NL_GENERATED_FORMAL = 'Financial Advantage Title - nl-generated-formal';
    public static readonly TITLE_NL_GENERATED_INFORMAL = 'Financial Advantage Title - nl-generated-informal';

    public static readonly DESCRIPTION = 'Financial Advantage Description';
    public static readonly DESCRIPTION_NL = 'Financial Advantage Description - nl';
    public static readonly DESCRIPTION_NL_FORMAL = 'Financial Advantage Description - nl-formal';
    public static readonly DESCRIPTION_NL_INFORMAL = 'Financial Advantage Description - nl-informal';
    public static readonly DESCRIPTION_NL_GENERATED_FORMAL = 'Financial Advantage Description - nl-generated-formal';
    public static readonly DESCRIPTION_NL_GENERATED_INFORMAL = 'Financial Advantage Description - nl-generated-informal';

    public static readonly ANOTHER_TITLE_NL = 'Financial Advantage Another Title - nl';
    public static readonly ANOTHER_TITLE_NL_FORMAL = 'Financial Advantage Another Title - nl-formal';
    public static readonly ANOTHER_TITLE_NL_INFORMAL = 'Financial Advantage Another Title - nl-informal';
    public static readonly ANOTHER_TITLE_NL_GENERATED_FORMAL = 'Financial Advantage Another Title - nl-generated-formal';
    public static readonly ANOTHER_TITLE_NL_GENERATED_INFORMAL = 'Financial Advantage Another Title - nl-generated-informal';

    public static readonly ANOTHER_DESCRIPTION_NL = 'Financial Advantage Another Description - nl';
    public static readonly ANOTHER_DESCRIPTION_NL_FORMAL = 'Financial Advantage Another Description - nl-formal';
    public static readonly ANOTHER_DESCRIPTION_NL_INFORMAL = 'Financial Advantage Another Description - nl-informal';
    public static readonly ANOTHER_DESCRIPTION_NL_GENERATED_FORMAL = 'Financial Advantage Another Description - nl-generated-formal';
    public static readonly ANOTHER_DESCRIPTION_NL_GENERATED_INFORMAL = 'Financial Advantage Another Description - nl-generated-informal';
}
