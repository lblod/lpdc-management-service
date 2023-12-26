import {Iri} from "../../../src/core/domain/shared/iri";
import {Sessie, SessieRol} from "../../../src/core/domain/sessie";
import {uuid} from "../../../mu-helper";
import {BestuurseenheidTestBuilder} from "./bestuureenheid-test-builder";

export function aSessie(): SessieTestBuilder {
    return new SessieTestBuilder()
        .withId(SessieTestBuilder.buildIri(uuid()))
        .withBestuurseenheidId(BestuurseenheidTestBuilder.buildIri(uuid()))
        .withSessieRol(SessieRol.LOKETLB_LPDCGEBRUIKER);
}
export class SessieTestBuilder {
    private id: Iri;
    private bestuurseenheidId: Iri;
    private sessieRol: SessieRol;

    static buildIri(uniqueId: string): Iri {
        return `http://mu.semte.ch/sessions/${uniqueId}`;
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