import {Iri} from "../../../src/core/domain/shared/iri";
import {TaalString} from "../../../src/core/domain/taal-string";
import {FinancialAdvantage} from "../../../src/core/domain/financial-advantage";
import {uuid} from "../../../mu-helper";

export function aMinimalFinancialAdvantage(): FinancialAdvantageTestBuilder {
    return new FinancialAdvantageTestBuilder()
        .withId(FinancialAdvantageTestBuilder.buildIri(uuid()));
}

export function aFullFinancialAdvantage(): FinancialAdvantageTestBuilder {
    return new FinancialAdvantageTestBuilder()
        .withId(FinancialAdvantageTestBuilder.buildIri(uuid()))
        .withTitle(TaalString.of(
            FinancialAdvantageTestBuilder.TITLE_EN,
            FinancialAdvantageTestBuilder.TITLE_NL,
            FinancialAdvantageTestBuilder.TITLE_NL_FORMAL,
            FinancialAdvantageTestBuilder.TITLE_NL_INFORMAL,
            FinancialAdvantageTestBuilder.TITLE_NL_GENERATED_FORMAL,
            FinancialAdvantageTestBuilder.TITLE_NL_GENERATED_INFORMAL))
        .withDescription(
            TaalString.of(
                FinancialAdvantageTestBuilder.DESCRIPTION_EN,
                FinancialAdvantageTestBuilder.DESCRIPTION_NL,
                FinancialAdvantageTestBuilder.DESCRIPTION_NL_FORMAL,
                FinancialAdvantageTestBuilder.DESCRIPTION_NL_INFORMAL,
                FinancialAdvantageTestBuilder.DESCRIPTION_NL_GENERATED_FORMAL,
                FinancialAdvantageTestBuilder.DESCRIPTION_NL_GENERATED_INFORMAL));
}

export function anotherFullFinancialAdvantage(): FinancialAdvantageTestBuilder {
    return new FinancialAdvantageTestBuilder()
        .withId(FinancialAdvantageTestBuilder.buildIri(uuid()))
        .withTitle(TaalString.of(
            FinancialAdvantageTestBuilder.ANOTHER_TITLE_EN,
            FinancialAdvantageTestBuilder.ANOTHER_TITLE_NL,
            FinancialAdvantageTestBuilder.ANOTHER_TITLE_NL_FORMAL,
            FinancialAdvantageTestBuilder.ANOTHER_TITLE_NL_INFORMAL,
            FinancialAdvantageTestBuilder.ANOTHER_TITLE_NL_GENERATED_FORMAL,
            FinancialAdvantageTestBuilder.ANOTHER_TITLE_NL_GENERATED_INFORMAL))
        .withDescription(
            TaalString.of(
                FinancialAdvantageTestBuilder.ANOTHER_DESCRIPTION_EN,
                FinancialAdvantageTestBuilder.ANOTHER_DESCRIPTION_NL,
                FinancialAdvantageTestBuilder.ANOTHER_DESCRIPTION_NL_FORMAL,
                FinancialAdvantageTestBuilder.ANOTHER_DESCRIPTION_NL_INFORMAL,
                FinancialAdvantageTestBuilder.ANOTHER_DESCRIPTION_NL_GENERATED_FORMAL,
                FinancialAdvantageTestBuilder.ANOTHER_DESCRIPTION_NL_GENERATED_INFORMAL));
}

export class FinancialAdvantageTestBuilder {

    public static readonly TITLE_EN = 'Financial Advantage Title - en';
    public static readonly TITLE_NL = 'Financial Advantage Title - nl';
    public static readonly TITLE_NL_FORMAL = 'Financial Advantage Title - nl-formal';
    public static readonly TITLE_NL_INFORMAL = 'Financial Advantage Title - nl-informal';
    public static readonly TITLE_NL_GENERATED_FORMAL = 'Financial Advantage Title - nl-generated-formal';
    public static readonly TITLE_NL_GENERATED_INFORMAL = 'Financial Advantage Title - nl-generated-informal';

    public static readonly DESCRIPTION_EN = 'Financial Advantage Description - en';
    public static readonly DESCRIPTION_NL = 'Financial Advantage Description - nl';
    public static readonly DESCRIPTION_NL_FORMAL = 'Financial Advantage Description - nl-formal';
    public static readonly DESCRIPTION_NL_INFORMAL = 'Financial Advantage Description - nl-informal';
    public static readonly DESCRIPTION_NL_GENERATED_FORMAL = 'Financial Advantage Description - nl-generated-formal';
    public static readonly DESCRIPTION_NL_GENERATED_INFORMAL = 'Financial Advantage Description - nl-generated-informal';

    public static readonly ANOTHER_TITLE_EN = 'Financial Advantage Another Title - en';
    public static readonly ANOTHER_TITLE_NL = 'Financial Advantage Another Title - nl';
    public static readonly ANOTHER_TITLE_NL_FORMAL = 'Financial Advantage Another Title - nl-formal';
    public static readonly ANOTHER_TITLE_NL_INFORMAL = 'Financial Advantage Another Title - nl-informal';
    public static readonly ANOTHER_TITLE_NL_GENERATED_FORMAL = 'Financial Advantage Another Title - nl-generated-formal';
    public static readonly ANOTHER_TITLE_NL_GENERATED_INFORMAL = 'Financial Advantage Another Title - nl-generated-informal';

    public static readonly ANOTHER_DESCRIPTION_EN = 'Financial Advantage Another Description - en';
    public static readonly ANOTHER_DESCRIPTION_NL = 'Financial Advantage Another Description - nl';
    public static readonly ANOTHER_DESCRIPTION_NL_FORMAL = 'Financial Advantage Another Description - nl-formal';
    public static readonly ANOTHER_DESCRIPTION_NL_INFORMAL = 'Financial Advantage Another Description - nl-informal';
    public static readonly ANOTHER_DESCRIPTION_NL_GENERATED_FORMAL = 'Financial Advantage Another Description - nl-generated-formal';
    public static readonly ANOTHER_DESCRIPTION_NL_GENERATED_INFORMAL = 'Financial Advantage Another Description - nl-generated-informal';

    private id: Iri;
    private title: TaalString | undefined;
    private description: TaalString | undefined;

    static buildIri(uniqueId: string): Iri {
        return `http://data.lblod.info/id/financial-advantage/${uniqueId}`;
    }

    public withId(id: Iri): FinancialAdvantageTestBuilder {
        this.id = id;
        return this;
    }

    public withTitle(title: TaalString): FinancialAdvantageTestBuilder {
        this.title = title;
        return this;
    }

    public withDescription(description: TaalString): FinancialAdvantageTestBuilder {
        this.description = description;
        return this;
    }

    public build(): FinancialAdvantage {
        return new FinancialAdvantage(
            this.id,
            this.title,
            this.description,
        );
    }
}