import {Iri} from "../../../src/core/domain/shared/iri";
import {uuid} from "../../../mu-helper";
import {ConceptVersie} from "../../../src/core/domain/concept-versie";

export class ConceptVersieTestBuilder {

    private id: Iri;

    static buildIri(uniqueId: string): Iri {
        return `https://ipdc.tni-vlaanderen.be/id/conceptsnapshot/${uniqueId}`;
    }

    static aConceptVersie(): ConceptVersieTestBuilder {
        return new ConceptVersieTestBuilder()
            .withId(ConceptVersieTestBuilder.buildIri(uuid()));
    }

    public withId(id: Iri): ConceptVersieTestBuilder {
        this.id = id;
        return this;
    }

    public build(): ConceptVersie {
        return new ConceptVersie(this.id);
    }

}