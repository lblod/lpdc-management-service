import {Iri} from "../../../src/core/domain/shared/iri";
import {LanguageString} from "../../../src/core/domain/language-string";
import {Cost} from "../../../src/core/domain/cost";
import {uuid} from "../../../mu-helper";
import {aMinimalLanguageString} from "./language-string-test-builder";


export function aMinimalCostForConceptSnapshot(): CostTestBuilder {
    return new CostTestBuilder()
        .withId(CostTestBuilder.buildIri(uuid()))
        .withTitle(aMinimalLanguageString(CostTestBuilder.TITLE).build())
        .withDescription(aMinimalLanguageString(CostTestBuilder.DESCRIPTION).build());
}

export function aMinimalCostForConcept(): CostTestBuilder {
    const uniqueId = uuid();
    return new CostTestBuilder()
        .withId(CostTestBuilder.buildIri(uniqueId))
        .withUuid(uniqueId)
        .withTitle(aMinimalLanguageString(CostTestBuilder.TITLE).build())
        .withDescription(aMinimalLanguageString(CostTestBuilder.DESCRIPTION).build());
}

export function aFullCost(): CostTestBuilder {
    return new CostTestBuilder()
        .withId(CostTestBuilder.buildIri(uuid()))
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

export function anotherFullCost(): CostTestBuilder {
    return new CostTestBuilder()
        .withId(CostTestBuilder.buildIri(uuid()))
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

export function aFullCostForInstance(): CostTestBuilder {
    return new CostTestBuilder()
        .withId(CostTestBuilder.buildIri(uuid()))
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

export function anotherFullCostForInstance(): CostTestBuilder {
    return new CostTestBuilder()
        .withId(CostTestBuilder.buildIri(uuid()))
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

    private id: Iri;
    private uuid: string | undefined;
    private title: LanguageString | undefined;
    private description: LanguageString | undefined;

    static buildIri(uniqueId: string): Iri {
        return new Iri(`http://data.lblod.info/id/cost/${uniqueId}`);
    }

    public withId(id: Iri): CostTestBuilder {
        this.id = id;
        return this;
    }

    public withUuid(uuid: string): CostTestBuilder {
        this.uuid = uuid;
        return this;
    }

    public withTitle(title: LanguageString): CostTestBuilder {
        this.title = title;
        return this;
    }

    public withDescription(description: LanguageString): CostTestBuilder {
        this.description = description;
        return this;
    }

    public build(): Cost {
        return Cost.reconstitute(
            this.id,
            this.uuid,
            this.title,
            this.description,
        );
    }
}