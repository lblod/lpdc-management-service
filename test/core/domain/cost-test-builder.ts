import {Iri} from "../../../src/core/domain/shared/iri";
import {TaalString} from "../../../src/core/domain/taal-string";
import {Cost} from "../../../src/core/domain/cost";
import {uuid} from "../../../mu-helper";

export function aMinimalCost(): CostTestBuilder {
    return new CostTestBuilder()
        .withId(CostTestBuilder.buildIri(uuid()));
}

export function aFullCost(): CostTestBuilder {
    return new CostTestBuilder()
        .withId(CostTestBuilder.buildIri(uuid()))
        .withTitle(TaalString.of(
            CostTestBuilder.TITLE_EN,
            CostTestBuilder.TITLE_NL,
            CostTestBuilder.TITLE_NL_FORMAL,
            CostTestBuilder.TITLE_NL_INFORMAL,
            CostTestBuilder.TITLE_NL_GENERATED_FORMAL,
            CostTestBuilder.TITLE_NL_GENERATED_INFORMAL))
        .withDescription(
            TaalString.of(
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
        .withTitle(TaalString.of(
            CostTestBuilder.ANOTHER_TITLE_EN,
            CostTestBuilder.ANOTHER_TITLE_NL,
            CostTestBuilder.ANOTHER_TITLE_NL_FORMAL,
            CostTestBuilder.ANOTHER_TITLE_NL_INFORMAL,
            CostTestBuilder.ANOTHER_TITLE_NL_GENERATED_FORMAL,
            CostTestBuilder.ANOTHER_TITLE_NL_GENERATED_INFORMAL))
        .withDescription(
            TaalString.of(
                CostTestBuilder.ANOTHER_DESCRIPTION_EN,
                CostTestBuilder.ANOTHER_DESCRIPTION_NL,
                CostTestBuilder.ANOTHER_DESCRIPTION_NL_FORMAL,
                CostTestBuilder.ANOTHER_DESCRIPTION_NL_INFORMAL,
                CostTestBuilder.ANOTHER_DESCRIPTION_NL_GENERATED_FORMAL,
                CostTestBuilder.ANOTHER_DESCRIPTION_NL_GENERATED_INFORMAL));
}

export class CostTestBuilder {

    public static readonly TITLE_EN = 'Cost Title - en';
    public static readonly TITLE_NL = 'Cost Title - nl';
    public static readonly TITLE_NL_FORMAL = 'Cost Title - nl-formal';
    public static readonly TITLE_NL_INFORMAL = 'Cost Title - nl-informal';
    public static readonly TITLE_NL_GENERATED_FORMAL = 'Cost Title - nl-generated-formal';
    public static readonly TITLE_NL_GENERATED_INFORMAL = 'Cost Title - nl-generated-informal';

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
    private title: TaalString | undefined;
    private description: TaalString | undefined;

    static buildIri(uniqueId: string): Iri {
        return `http://data.lblod.info/id/cost/${uniqueId}`;
    }

    public withId(id: Iri): CostTestBuilder {
        this.id = id;
        return this;
    }

    public withTitle(title: TaalString): CostTestBuilder {
        this.title = title;
        return this;
    }

    public withDescription(description: TaalString): CostTestBuilder {
        this.description = description;
        return this;
    }

    public build(): Cost {
        return new Cost(
            this.id,
            this.title,
            this.description,
        );
    }

}