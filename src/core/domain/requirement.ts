import {TaalString} from "./taal-string";
import {Iri} from "./shared/iri";
import _ from 'lodash';

export class Requirement {

    //TODO LPDC-916: should not be here ... accepted compromise ?
    private readonly _id: Iri;
    private readonly _title: TaalString | undefined;
    private readonly _description: TaalString | undefined;

    constructor(id: Iri,
                title: TaalString | undefined,
                description: TaalString | undefined,
    ) {
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

    static isFunctionallyChanged(value: Requirement[], other: Requirement[]): boolean {
        return value.length !== other.length
            || _.zip(value, other).some((reqs: [Requirement, Requirement]) => {
                return TaalString.isFunctionallyChanged(reqs[0].title, reqs[1].title)
                    || TaalString.isFunctionallyChanged(reqs[0].description, reqs[1].description); });
    }
}