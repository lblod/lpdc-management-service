import {Iri, iriAsId} from "./shared/iri";
import {LanguageString} from "./language-string";
import _ from "lodash";

export class Website {

    private readonly _id: Iri;
    private readonly _uuid: string | undefined; //required for mu-cl-resources.
    private readonly _title: LanguageString | undefined;
    private readonly _description: LanguageString | undefined;
    private readonly _url: string | undefined;

    constructor(id: Iri,
                uuid: string | undefined,
                title: LanguageString | undefined,
                description: LanguageString | undefined,
                url: string | undefined,
    ) {
        //TODO LPDC-917: add invariants
        this._id = iriAsId(id);
        this._uuid = uuid;
        this._title = title;
        this._description = description;
        this._url = url;
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

    get url(): string | undefined {
        return this._url;
    }

    static isFunctionallyChanged(value: Website[], other: Website[]): boolean {
        return value.length !== other.length
            || _.zip(value, other).some((websites: [Website, Website]) => {
                return LanguageString.isFunctionallyChanged(websites[0].title, websites[1].title)
                    || LanguageString.isFunctionallyChanged(websites[0].description, websites[1].description)
                    || websites[0].url !== websites[1].url;
            });

    }

}