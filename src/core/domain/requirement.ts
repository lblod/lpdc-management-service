import {LanguageString} from "./language-string";
import {Iri, requiredIri} from "./shared/iri";
import _ from 'lodash';
import {Evidence} from "./evidence";
import {requiredValue} from "./shared/invariant";

export class Requirement {

    private readonly _id: Iri;
    private readonly _uuid: string | undefined; //required for mu-cl-resources.
    private readonly _title: LanguageString;
    private readonly _description: LanguageString;
    private readonly _evidence: Evidence | undefined;

    //TODO LPDC-917: add invariants
    constructor(id: Iri,
                uuid: string | undefined,
                title: LanguageString,
                description: LanguageString,
                evidence: Evidence | undefined,
    ) {
        this._id = requiredIri(id, 'id');
        this._uuid = uuid;
        this._title = requiredValue(title, 'title');
        this._description = requiredValue(description, 'description');
        this._evidence = evidence;
    }

    get id(): Iri {
        return this._id;
    }

    get uuid(): string | undefined {
        return this._uuid;
    }

    get title(): LanguageString {
        return this._title;
    }

    get description(): LanguageString {
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