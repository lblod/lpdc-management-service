import {Iri} from "./shared/iri";
import {LanguageString} from "./language-string";
import _ from "lodash";
import {requiredValue} from "./shared/invariant";

export class Website {

    private readonly _id: Iri;
    private readonly _uuid: string | undefined; //required for mu-cl-resources.
    private readonly _title: LanguageString | undefined;
    private readonly _description: LanguageString | undefined;
    private readonly _url: string;

    private constructor(id: Iri,
                        uuid: string | undefined,
                        title: LanguageString,
                        description: LanguageString | undefined,
                        url: string,
    ) {
        this._id = requiredValue(id, 'id');
        this._uuid = uuid;
        this._title = title;
        this._description = description;
        this._url = requiredValue(url, 'url');
    }

    static forConcept(website: Website): Website {
        return new Website(
            website.id,
            requiredValue(website.uuid, 'uuid'),
            requiredValue(website.title, 'title'),
            website.description,
            website.url
        );
    }

    static forConceptSnapshot(website: Website): Website {
        return new Website(
            website.id,
            undefined,
            requiredValue(website.title, 'title'),
            website.description,
            website.url
        );
    }

    static reconstitute(id: Iri,
                        uuid: string | undefined,
                        title: LanguageString | undefined,
                        description: LanguageString | undefined,
                        url: string): Website {

        return new Website(id, uuid, title, description, url);
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