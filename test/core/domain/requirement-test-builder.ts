import {Iri} from "../../../src/core/domain/shared/iri";
import {uuid} from "../../../mu-helper";
import {TaalString} from "../../../src/core/domain/taal-string";
import {Requirement} from "../../../src/core/domain/requirement";


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

    static aMinimalRequirement(): RequirementTestBuilder {
        return new RequirementTestBuilder()
            .withId(RequirementTestBuilder.buildIri(uuid()));
    }

    static aFullRequirement(): RequirementTestBuilder {
        return new RequirementTestBuilder()
            .withId(RequirementTestBuilder.buildIri(uuid()))
            .withTitle(TaalString.of(
                this.TITLE_EN,
                this.TITLE_NL,
                this.TITLE_NL_FORMAL,
                this.TITLE_NL_INFORMAL,
                this.TITLE_NL_GENERATED_FORMAL,
                this.TITLE_NL_GENERATED_INFORMAL))
            .withDescription(
                TaalString.of(
                    this.DESCRIPTION_EN,
                    this.DESCRIPTION_NL,
                    this.DESCRIPTION_NL_FORMAL,
                    this.DESCRIPTION_NL_INFORMAL,
                    this.DESCRIPTION_NL_GENERATED_FORMAL,
                    this.DESCRIPTION_NL_GENERATED_INFORMAL));
    }

    static anotherFullRequirement(): RequirementTestBuilder {
        return new RequirementTestBuilder()
            .withId(RequirementTestBuilder.buildIri(uuid()))
            .withTitle(TaalString.of(
                this.ANOTHER_TITLE_EN,
                this.ANOTHER_TITLE_NL,
                this.ANOTHER_TITLE_NL_FORMAL,
                this.ANOTHER_TITLE_NL_INFORMAL,
                this.ANOTHER_TITLE_NL_GENERATED_FORMAL,
                this.ANOTHER_TITLE_NL_GENERATED_INFORMAL))
            .withDescription(
                TaalString.of(
                    this.ANOTHER_DESCRIPTION_EN,
                    this.ANOTHER_DESCRIPTION_NL,
                    this.ANOTHER_DESCRIPTION_NL_FORMAL,
                    this.ANOTHER_DESCRIPTION_NL_INFORMAL,
                    this.ANOTHER_DESCRIPTION_NL_GENERATED_FORMAL,
                    this.ANOTHER_DESCRIPTION_NL_GENERATED_INFORMAL));
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