import {Iri} from "./shared/iri";
import {LanguageString} from "./language-string";
import _ from "lodash";
import {Website} from "./website";

export class Procedure {

    private readonly _id: Iri;
    private readonly _title: LanguageString | undefined;
    private readonly _description: LanguageString | undefined;
    private readonly _websites: Website[];

    constructor(id: Iri,
                title: LanguageString | undefined,
                description: LanguageString | undefined,
                websites: Website[],
    ) {
//TODO LPDC-917: add invariants
        this._id = id;
        this._title = title;
        this._description = description;
        this._websites = [...websites];
    }

    get id(): Iri {
        return this._id;
    }

    get title(): LanguageString | undefined {
        return this._title;
    }

    get description(): LanguageString | undefined {
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