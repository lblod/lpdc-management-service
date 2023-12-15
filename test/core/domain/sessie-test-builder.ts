import {Iri} from "../../../src/core/domain/shared/iri";
import {Sessie, SessieRol} from "../../../src/core/domain/sessie";
import {uuid} from "../../../mu-helper";

export class SessieTestBuilder {
    private id: Iri;
    private bestuurseenheidId: Iri;
    private sessieRol: SessieRol;

    static aSessie(): SessieTestBuilder {
        return new SessieTestBuilder()
            .withId(`http://mu.semte.ch/sessions/${uuid()}`)
            .withBestuurseenheidId(`http://data.lblod.info/id/bestuurseenheden/${uuid()}`)
            .withSessieRol(SessieRol.LOKETLB_LPDCGEBRUIKER);
    }

    static aSessieForPepingen(): SessieTestBuilder {
        const pepingen = '73840d393bd94828f0903e8357c7f328d4bf4b8fbd63adbfa443e784f056a589';
        return this.aSessie()
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

    public withSessieRol(sessieRol: SessieRol): SessieTestBuilder {
        this.sessieRol = sessieRol;
        return this;
    }

    public build(): Sessie {
        return new Sessie(this.id, this.bestuurseenheidId, this.sessieRol);
    }

}