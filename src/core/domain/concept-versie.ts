import {Iri} from "./shared/iri";


export class ConceptVersie {
    private readonly _id: Iri;
    constructor(id: Iri) {
        //TODO LPDC-916: enforce invariants
        this._id = id;
    }

    get id(): Iri {
        return this._id;
    }


}