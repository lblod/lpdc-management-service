import {Iri, requiredIri} from "./shared/iri";
import {LanguageString} from "./language-string";
import _ from "lodash";
import {requiredValue} from "./shared/invariant";

export class Cost {

    private readonly _id: Iri;
    private readonly _uuid: string | undefined; //required for mu-cl-resources. //TODO LPDC-916: make required when data is correct.
    private readonly _title: LanguageString;
    private readonly _description: LanguageString;

    constructor(id: Iri,
                uuid: string,
                title: LanguageString,
                description: LanguageString,
    ) {
        //TODO LPDC-917: add invariants
        this._id = requiredIri(id, 'id');
        this._uuid = uuid;
        this._title = requiredValue(title, 'title');
        this._description = requiredValue(description, 'description');
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

    static isFunctionallyChanged(value: Cost[], other: Cost[]): boolean {
        return value.length !== other.length
            || _.zip(value, other).some((costs: [Cost, Cost]) => {
                return LanguageString.isFunctionallyChanged(costs[0].title, costs[1].title)
                    || LanguageString.isFunctionallyChanged(costs[0].description, costs[1].description);
            });
    }

}