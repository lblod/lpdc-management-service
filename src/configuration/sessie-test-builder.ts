import {Iri} from "../core/domain/shared/iri";
import {Sessie} from "../core/domain/sessie";
import {uuid} from "../../mu-helper";

export class SessieTestBuilder {
    private id: Iri;
    private bestuurseenheidId: Iri;


    public build(): Sessie {
        return new Sessie(this.id, this.bestuurseenheidId);
    }

    static aSessie(): SessieTestBuilder {
        return new SessieTestBuilder()
            .withId(`http://mu.semte.ch/sessions/${uuid()}`)
            .withBestuurseenheidId(`http://data.lblod.info/id/bestuurseenheden/${uuid()}`);
    }

    static aSessieForPepingen(): SessieTestBuilder {
        const pepingen = '73840d393bd94828f0903e8357c7f328d4bf4b8fbd63adbfa443e784f056a589';
        return new SessieTestBuilder()
            .withId(`http://mu.semte.ch/sessions/${uuid()}`)
            .withBestuurseenheidId(`http://data.lblod.info/id/bestuurseenheden/${pepingen}`);
    }

    public withId(id: Iri): SessieTestBuilder {
        this.id = id;
        return this;
    }

    public withBestuurseenheidId(bestuurseenheidId: Iri): SessieTestBuilder {
        this.bestuurseenheidId = bestuurseenheidId;
        return this;
    }

}