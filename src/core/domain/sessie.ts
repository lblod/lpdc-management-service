import {Iri} from "./shared/iri";

export class Sessie {
    private readonly _id: Iri;
    private readonly _bestuurseenheidId: Iri;
    private readonly _sessieRol: SessieRol;

    constructor(id: Iri, bestuurseenheidId: Iri, sessieRol: SessieRol) {
        this._id = id;
        this._bestuurseenheidId = bestuurseenheidId;
        this._sessieRol = sessieRol;
    }

    get id(): Iri {
        return this._id;
    }

    get bestuurseenheidId(): Iri {
        return this._bestuurseenheidId;
    }

    get sessieRol(): SessieRol {
        return this._sessieRol;
    }
}

export enum SessieRol {
    LOKETLB_LPDCGEBRUIKER = 'LoketLB-LPDCGebruiker'
}
