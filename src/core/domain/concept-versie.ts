import {Iri} from "./shared/iri";
import {TaalString} from "./taal-string";


export class ConceptVersie {

    private readonly _id: Iri;
    private readonly _title: TaalString | undefined;

    constructor(id: Iri,
                title: TaalString | undefined) {
        //TODO LPDC-916: enforce invariants
        this._id = id;
        this._title = title;
    }

    get id(): Iri {
        return this._id;
    }

    get title(): TaalString | undefined {
        return this._title;
    }

}