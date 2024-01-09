import {Iri} from "./shared/iri";
import {LanguageString} from "./language-string";
import _ from "lodash";
import {Website} from "./website";
import {requiredValue} from "./shared/invariant";

export class Procedure {

    private readonly _id: Iri;
    private readonly _uuid: string | undefined; //required for mu-cl-resources.
    private readonly _title: LanguageString;
    private readonly _description: LanguageString;
    private readonly _websites: Website[];

    constructor(id: Iri,
                uuid: string | undefined,
                title: LanguageString,
                description: LanguageString,
                websites: Website[],
    ) {
//TODO LPDC-917: add invariants
        this._id = requiredValue(id, 'id');
        this._uuid = uuid;
        this._title = requiredValue(title, 'title');
        this._description = requiredValue(description, 'description');
        this._websites = [...websites];
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

    get websites(): Website[] {
        return this._websites;
    }

    static isFunctionallyChanged(value: Procedure[], other: Procedure[]): boolean {
        return value.length !== other.length
            || _.zip(value, other).some((procs: [Procedure, Procedure]) => {
                return LanguageString.isFunctionallyChanged(procs[0].title, procs[1].title)
                    || LanguageString.isFunctionallyChanged(procs[0].description, procs[1].description)
                    || Website.isFunctionallyChanged(procs[0].websites, procs[1].websites);
            });
    }
}