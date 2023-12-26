import {Iri} from "./shared/iri";
import {TaalString} from "./taal-string";

export class Website {

    //TODO LPDC-916: should not be here ... accepted compromise ?
    private readonly _id: Iri;
    private readonly _title: TaalString | undefined;
    private readonly _description: TaalString | undefined;
    private readonly _url: string | undefined;

    constructor(id: Iri,
                title: TaalString | undefined,
                description: TaalString | undefined,
                url: string | undefined,
    ) {
        this._id = id;
        this._title = title;
        this._description = description;
        this._url = url;
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

    get url(): string | undefined {
        return this._url;
    }

}