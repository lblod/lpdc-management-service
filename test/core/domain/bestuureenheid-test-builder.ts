import {Iri} from "../../../src/core/domain/shared/iri";
import {Bestuurseenheid, BestuurseenheidClassificatieCode} from "../../../src/core/domain/bestuurseenheid";
import {uuid} from "../../../mu-helper";

export class BestuurseenheidTestBuilder {
    private id: Iri;
    private prefLabel: string;
    private classificatieCode: BestuurseenheidClassificatieCode;

    static buildIri(uniqueId: string): Iri {
        return `http://data.lblod.info/id/bestuurseenheden/${uniqueId}`;
    }

    static aBestuurseenheid(): BestuurseenheidTestBuilder {
        return new BestuurseenheidTestBuilder()
            .withId(BestuurseenheidTestBuilder.buildIri(uuid()))
            .withPrefLabel('Aarschot')
            .withClassificatieCode(BestuurseenheidClassificatieCode.GEMEENTE);
    }

    static aPepingen(): BestuurseenheidTestBuilder {
        return new BestuurseenheidTestBuilder()
            .withId(BestuurseenheidTestBuilder.buildIri('73840d393bd94828f0903e8357c7f328d4bf4b8fbd63adbfa443e784f056a589'))
            .withPrefLabel('Pepingen')
            .withClassificatieCode(BestuurseenheidClassificatieCode.GEMEENTE);
    }

    public withId(id: Iri): BestuurseenheidTestBuilder {
        this.id = id;
        return this;
    }

    public withPrefLabel(prefLabel: string): BestuurseenheidTestBuilder {
        this.prefLabel = prefLabel;
        return this;
    }

    public withClassificatieCode(classificatieCode: BestuurseenheidClassificatieCode): BestuurseenheidTestBuilder {
        this.classificatieCode = classificatieCode;
        return this;
    }

    public build(): Bestuurseenheid {
        return new Bestuurseenheid(this.id, this.prefLabel, this.classificatieCode);
    }
}