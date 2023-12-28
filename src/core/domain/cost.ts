import {Iri} from "./shared/iri";
import {TaalString} from "./taal-string";
import _ from "lodash";

export class Cost {

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

    static isFunctionallyChanged(value: Cost[], other: Cost[]): boolean {
        return value.length !== other.length
            || _.zip(value, other).some((costs: [Cost, Cost]) => {
                return TaalString.isFunctionallyChanged(costs[0].title, costs[1].title)
                    || TaalString.isFunctionallyChanged(costs[0].description, costs[1].description);
            });
    }

}