import {Iri} from "./shared/iri";
import {LanguageString} from "./language-string";

export class Evidence {

    private readonly _id: Iri;
    private readonly _title: LanguageString | undefined;
    private readonly _description: LanguageString | undefined;

    constructor(id: Iri,
                title: LanguageString | undefined,
                description: LanguageString | undefined,
    ) {
//TODO LPDC-916: add invariants
        this._id = id;
        this._title = title;
        this._description = description;
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

    static isFunctionallyChanged(value: Evidence | undefined, other: Evidence | undefined): boolean {
        return LanguageString.isFunctionallyChanged(value?.title, other?.title)
            || LanguageString.isFunctionallyChanged(value?.description, other?.description);
    }

}