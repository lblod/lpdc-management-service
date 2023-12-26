import {Iri} from "../../../src/core/domain/shared/iri";
import {uuid} from "../../../mu-helper";
import {TaalString} from "../../../src/core/domain/taal-string";
import {Requirement} from "../../../src/core/domain/requirement";


export function aMinimalRequirement(): RequirementTestBuilder {
    return new RequirementTestBuilder()
        .withId(RequirementTestBuilder.buildIri(uuid()));
}

export function aFullRequirement(): RequirementTestBuilder {
    return new RequirementTestBuilder()
        .withId(RequirementTestBuilder.buildIri(uuid()))
        .withTitle(TaalString.of(
            RequirementTestBuilder.TITLE_EN,
            RequirementTestBuilder.TITLE_NL,
            RequirementTestBuilder.TITLE_NL_FORMAL,
            RequirementTestBuilder.TITLE_NL_INFORMAL,
            RequirementTestBuilder.TITLE_NL_GENERATED_FORMAL,
            RequirementTestBuilder.TITLE_NL_GENERATED_INFORMAL))
        .withDescription(
            TaalString.of(
                RequirementTestBuilder.DESCRIPTION_EN,
                RequirementTestBuilder.DESCRIPTION_NL,
                RequirementTestBuilder.DESCRIPTION_NL_FORMAL,
                RequirementTestBuilder.DESCRIPTION_NL_INFORMAL,
                RequirementTestBuilder.DESCRIPTION_NL_GENERATED_FORMAL,
                RequirementTestBuilder.DESCRIPTION_NL_GENERATED_INFORMAL));
}

export function anotherFullRequirement(): RequirementTestBuilder {
    return new RequirementTestBuilder()
        .withId(RequirementTestBuilder.buildIri(uuid()))
        .withTitle(TaalString.of(
            RequirementTestBuilder.ANOTHER_TITLE_EN,
            RequirementTestBuilder.ANOTHER_TITLE_NL,
            RequirementTestBuilder.ANOTHER_TITLE_NL_FORMAL,
            RequirementTestBuilder.ANOTHER_TITLE_NL_INFORMAL,
            RequirementTestBuilder.ANOTHER_TITLE_NL_GENERATED_FORMAL,
            RequirementTestBuilder.ANOTHER_TITLE_NL_GENERATED_INFORMAL))
        .withDescription(
            TaalString.of(
                RequirementTestBuilder.ANOTHER_DESCRIPTION_EN,
                RequirementTestBuilder.ANOTHER_DESCRIPTION_NL,
                RequirementTestBuilder.ANOTHER_DESCRIPTION_NL_FORMAL,
                RequirementTestBuilder.ANOTHER_DESCRIPTION_NL_INFORMAL,
                RequirementTestBuilder.ANOTHER_DESCRIPTION_NL_GENERATED_FORMAL,
                RequirementTestBuilder.ANOTHER_DESCRIPTION_NL_GENERATED_INFORMAL));
}

export class RequirementTestBuilder {

    public static readonly TITLE_EN = 'Requirement Title - en';
    public static readonly TITLE_NL = 'Requirement Title - nl';
    public static readonly TITLE_NL_FORMAL = 'Requirement Title - nl-formal';
    public static readonly TITLE_NL_INFORMAL = 'Requirement Title - nl-informal';
    public static readonly TITLE_NL_GENERATED_FORMAL = 'Requirement Title - nl-generated-formal';
    public static readonly TITLE_NL_GENERATED_INFORMAL = 'Requirement Title - nl-generated-informal';

    public static readonly DESCRIPTION_EN = 'Requirement Description - en';
    public static readonly DESCRIPTION_NL = 'Requirement Description - nl';
    public static readonly DESCRIPTION_NL_FORMAL = 'Requirement Description - nl-formal';
    public static readonly DESCRIPTION_NL_INFORMAL = 'Requirement Description - nl-informal';
    public static readonly DESCRIPTION_NL_GENERATED_FORMAL = 'Requirement Description - nl-generated-formal';
    public static readonly DESCRIPTION_NL_GENERATED_INFORMAL = 'Requirement Description - nl-generated-informal';

    public static readonly ANOTHER_TITLE_EN = 'Requirement Another Title - en';
    public static readonly ANOTHER_TITLE_NL = 'Requirement Another Title - nl';
    public static readonly ANOTHER_TITLE_NL_FORMAL = 'Requirement Another Title - nl-formal';
    public static readonly ANOTHER_TITLE_NL_INFORMAL = 'Requirement Another Title - nl-informal';
    public static readonly ANOTHER_TITLE_NL_GENERATED_FORMAL = 'Requirement Another Title - nl-generated-formal';
    public static readonly ANOTHER_TITLE_NL_GENERATED_INFORMAL = 'Requirement Another Title - nl-generated-informal';

    public static readonly ANOTHER_DESCRIPTION_EN = 'Requirement Another Description - en';
    public static readonly ANOTHER_DESCRIPTION_NL = 'Requirement Another Description - nl';
    public static readonly ANOTHER_DESCRIPTION_NL_FORMAL = 'Requirement Another Description - nl-formal';
    public static readonly ANOTHER_DESCRIPTION_NL_INFORMAL = 'Requirement Another Description - nl-informal';
    public static readonly ANOTHER_DESCRIPTION_NL_GENERATED_FORMAL = 'Requirement Another Description - nl-generated-formal';
    public static readonly ANOTHER_DESCRIPTION_NL_GENERATED_INFORMAL = 'Requirement Another Description - nl-generated-informal';

    private id: Iri;
    private title: TaalString | undefined;
    private description: TaalString | undefined;

    static buildIri(uniqueId: string): Iri {
        return `http://data.lblod.info/id/requirement/${uniqueId}`;
    }

    public withId(id: Iri): RequirementTestBuilder {
        this.id = id;
        return this;
    }

    public withTitle(title: TaalString): RequirementTestBuilder {
        this.title = title;
        return this;
    }

    public withDescription(description: TaalString): RequirementTestBuilder {
        this.description = description;
        return this;
    }

    public build(): Requirement {
        return new Requirement(
            this.id,
            this.title,
            this.description,
        );
    }

}