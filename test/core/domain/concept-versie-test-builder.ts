import {Iri} from "../../../src/core/domain/shared/iri";
import {uuid} from "../../../mu-helper";
import {ConceptVersie} from "../../../src/core/domain/concept-versie";
import {TaalString} from "../../../src/core/domain/taal-string";

export class ConceptVersieTestBuilder {

    public static TITLE_EN = 'Concept Versie Title - en';
    public static TITLE_NL = 'Concept Versie Title - nl';
    public static TITLE_NL_FORMAL = 'Concept Versie Title - nl-formal';
    public static TITLE_NL_INFORMAL = 'Concept Versie Title - nl-informal';
    public static TITLE_NL_GENERATED_FORMAL = 'Concept Versie Title - nl-generated-formal';
    public static TITLE_NL_GENERATED_INFORMAL = 'Concept Versie Title - nl-generated-informal';

    public static DESCRIPTION_EN = 'Concept Versie Description - en';
    public static DESCRIPTION_NL = 'Concept Versie Description - nl';
    public static DESCRIPTION_NL_FORMAL = 'Concept Versie Description - nl-formal';
    public static DESCRIPTION_NL_INFORMAL = 'Concept Versie Description - nl-informal';
    public static DESCRIPTION_NL_GENERATED_FORMAL = 'Concept Versie Description - nl-generated-formal';
    public static DESCRIPTION_NL_GENERATED_INFORMAL = 'Concept Versie Description - nl-generated-informal';

    private id: Iri;
    private title: TaalString;
    private description: TaalString;

    static buildIri(uniqueId: string): Iri {
        return `https://ipdc.tni-vlaanderen.be/id/conceptsnapshot/${uniqueId}`;
    }

    static aMinimalConceptVersie(): ConceptVersieTestBuilder {
        return new ConceptVersieTestBuilder()
            .withId(ConceptVersieTestBuilder.buildIri(uuid()));
    }

    static aFullConceptVersie(): ConceptVersieTestBuilder {
        return new ConceptVersieTestBuilder()
            .withId(ConceptVersieTestBuilder.buildIri(uuid()))
            .withTitle(
                TaalString.of(this.TITLE_EN,
                    this.TITLE_NL,
                    this.TITLE_NL_FORMAL,
                    this.TITLE_NL_INFORMAL,
                    this.TITLE_NL_GENERATED_FORMAL,
                    this.TITLE_NL_GENERATED_INFORMAL))
            .withDescription(
                TaalString.of(this.DESCRIPTION_EN,
                    this.DESCRIPTION_NL,
                    this.DESCRIPTION_NL_FORMAL,
                    this.DESCRIPTION_NL_INFORMAL,
                    this.DESCRIPTION_NL_GENERATED_FORMAL,
                    this.DESCRIPTION_NL_GENERATED_INFORMAL)
            );
    }

    public withId(id: Iri): ConceptVersieTestBuilder {
        this.id = id;
        return this;
    }

    public withTitle(title: TaalString): ConceptVersieTestBuilder {
        this.title = title;
        return this;
    }

    public withDescription(description: TaalString): ConceptVersieTestBuilder {
        this.description = description;
        return this;
    }

    public build(): ConceptVersie {
        return new ConceptVersie(
            this.id,
            this.title,
            this.description);
    }

}