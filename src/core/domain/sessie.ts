import {Iri} from "./shared/iri";

export class Sessie {
    private id: Iri;
    private bestuurseenheidId: Iri;


    constructor(id: Iri, bestuurseenheidId: Iri) {
        this.id = id;
        this.bestuurseenheidId = bestuurseenheidId;
    }

    getId(): Iri {
        return this.id;
    }

    getBestuurseenheidId(): Iri {
        return this.bestuurseenheidId;
    }
}