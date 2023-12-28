import {Iri} from "./shared/iri";
import {TaalString} from "./taal-string";
import _ from "lodash";

export class Website {

    private readonly _id: Iri;
    private readonly _title: TaalString | undefined;
    private readonly _description: TaalString | undefined;
    private readonly _url: string | undefined;

    constructor(id: Iri,
                title: TaalString | undefined,
                description: TaalString | undefined,
                url: string | undefined,
    ) {
        //TODO LPDC-916: add invariants
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

    static isFunctionallyChanged(value: Website[], other: Website[]): boolean {
        return value.length !== other.length
            || _.zip(value, other).some((websites: [Website, Website]) => {
                return TaalString.isFunctionallyChanged(websites[0].title, websites[1].title)
                    || TaalString.isFunctionallyChanged(websites[0].description, websites[1].description)
                    || websites[0].url !== websites[1].url;
            });

    }

}