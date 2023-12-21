import {Iri} from "../../../src/core/domain/shared/iri";
import {uuid} from "../../../mu-helper";
import {ConceptVersie} from "../../../src/core/domain/concept-versie";
import {TaalString} from "../../../src/core/domain/taal-string";

export class ConceptVersieTestBuilder {

    public static TITLE_EN = 'Akte van Belgische nationaliteit - en';
    public static TITLE_NL = 'Akte van Belgische nationaliteit - nl';
    public static TITLE_NL_FORMAL = 'Akte van Belgische nationaliteit - nl-formal';
    public static TITLE_NL_INFORMAL = 'Akte van Belgische nationaliteit - nl-informal';
    public static TITLE_NL_GENERATED_FORMAL = 'Akte van Belgische nationaliteit - nl-generated-formal';
    public static TITLE_NL_GENERATED_INFORMAL = 'Akte van Belgische nationaliteit - nl-generated-informal';


    private id: Iri;
    private title: TaalString;

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
            .withTitle(TaalString.of(this.TITLE_EN, this.TITLE_NL, this.TITLE_NL_FORMAL, this.TITLE_NL_INFORMAL, this.TITLE_NL_GENERATED_FORMAL, this.TITLE_NL_GENERATED_INFORMAL));
    }

    public withId(id: Iri): ConceptVersieTestBuilder {
        this.id = id;
        return this;
    }

    public withTitle(title: TaalString): ConceptVersieTestBuilder {
        this.title = title;
        return this;
    }

    public build(): ConceptVersie {
        return new ConceptVersie(
            this.id,
            this.title);
    }

}