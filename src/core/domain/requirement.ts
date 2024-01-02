import {LanguageString} from "./language-string";
import {Iri} from "./shared/iri";
import _ from 'lodash';
import {Evidence} from "./evidence";

export class Requirement {

    private readonly _id: Iri;
    private readonly _uuid: string | undefined; //required for mu-cl-resources.
    private readonly _title: LanguageString | undefined;
    private readonly _description: LanguageString | undefined;
    private readonly _evidence: Evidence | undefined;

    //TODO LPDC-917: add invariants
    constructor(id: Iri,
                uuid: string | undefined,
                title: LanguageString | undefined,
                description: LanguageString | undefined,
                evidence: Evidence | undefined,
    ) {
        this._id = id;
        this._uuid = uuid;
        this._title = title;
        this._description = description;
        this._evidence = evidence;
    }

    get id(): Iri {
        return this._id;
    }

    get uuid(): string | undefined {
        return this._uuid;
    }

    get title(): LanguageString | undefined {
        return this._title;
    }

    get description(): LanguageString | undefined {
        return this._description;
    }

    get evidence(): Evidence | undefined {
        return this._evidence;
    }

    static isFunctionallyChanged(value: Requirement[], other: Requirement[]): boolean {
        return value.length !== other.length
            || _.zip(value, other).some((reqs: [Requirement, Requirement]) => {
                return LanguageString.isFunctionallyChanged(reqs[0].title, reqs[1].title)
                    || LanguageString.isFunctionallyChanged(reqs[0].description, reqs[1].description)
                    || Evidence.isFunctionallyChanged(reqs[0].evidence, reqs[1].evidence);
            });
    }
}