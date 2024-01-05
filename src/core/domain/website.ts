import {Iri, requiredIri} from "./shared/iri";
import {LanguageString} from "./language-string";
import _ from "lodash";
import {requiredValue} from "./shared/invariant";

export class Website {

    private readonly _id: Iri;
    private readonly _uuid: string | undefined; //required for mu-cl-resources.
    private readonly _title: LanguageString;
    private readonly _description: LanguageString;
    private readonly _url: string;

    constructor(id: Iri,
                uuid: string | undefined,
                title: LanguageString,
                description: LanguageString,
                url: string,
    ) {
        //TODO LPDC-917: add invariants
        this._id = requiredIri(id, 'id');
        this._uuid = uuid;
        this._title = requiredValue(title, 'title');
        this._description = requiredValue(description, 'description');
        this._url = requiredValue(url, 'url');
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

    get url(): string {
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