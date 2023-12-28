import {Iri} from "./shared/iri";
import {TaalString} from "./taal-string";

export class Evidence {

    private readonly _id: Iri;
    private readonly _title: TaalString | undefined;
    private readonly _description: TaalString | undefined;

    constructor(id: Iri,
                title: TaalString | undefined,
                description: TaalString | undefined,
    ) {
//TODO LPDC-916: add invariants
        this._id = id;
        this._title = title;
        this._description = description;
    }

    get id(): Iri {
        return this._id;
    }

    get title(): TaalString | undefined {
        return this._title;
    }

    get description(): TaalString | undefined {
        return this._description;
    }

    static isFunctionallyChanged(value: Evidence | undefined, other: Evidence | undefined): boolean {
        return TaalString.isFunctionallyChanged(value?.title, other?.title)
            || TaalString.isFunctionallyChanged(value?.description, other?.description);
    }

}