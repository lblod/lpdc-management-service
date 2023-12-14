import {Iri} from "./shared/iri";

export class Sessie {
    private readonly _id: Iri;
    private readonly _bestuurseenheidId: Iri;


    constructor(id: Iri, bestuurseenheidId: Iri) {
        this._id = id;
        this._bestuurseenheidId = bestuurseenheidId;
    }

    get id(): Iri {
        return this._id;
    }

    get bestuurseenheidId(): Iri {
        return this._bestuurseenheidId;
    }
}