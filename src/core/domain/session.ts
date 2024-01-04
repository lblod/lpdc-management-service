import {Iri, requiredIri} from "./shared/iri";

export class Session {
    private readonly _id: Iri;
    private readonly _bestuurseenheidId: Iri;
    private readonly _sessionRol: SessionRole;

    constructor(id: Iri, bestuurseenheidId: Iri, sessionRole: SessionRole) {
        this._id = requiredIri(id, 'id');
        this._bestuurseenheidId = requiredIri(bestuurseenheidId, 'bestuurseenheidId');
        this._sessionRol = sessionRole;
    }

    get id(): Iri {
        return this._id;
    }

    get bestuurseenheidId(): Iri {
        return this._bestuurseenheidId;
    }

    get sessionRol(): SessionRole {
        return this._sessionRol;
    }
}

export enum SessionRole {
    LOKETLB_LPDCGEBRUIKER = 'LoketLB-LPDCGebruiker'
}
