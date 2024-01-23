import {Iri} from "./shared/iri";
import {LanguageString} from "./language-string";
import _ from "lodash";
import {requiredValue} from "./shared/invariant";
import {Procedure} from "./procedure";

export class Website {

    private readonly _id: Iri;
    private readonly _uuid: string | undefined; //required for mu-cl-resources.
    private readonly _title: LanguageString | undefined;
    private readonly _description: LanguageString | undefined;
    private readonly _url: string;
    private readonly _source: Iri | undefined;

    private constructor(id: Iri,
                        uuid: string | undefined,
                        title: LanguageString,
                        description: LanguageString | undefined,
                        url: string,
                        source: Iri | undefined
    ) {
        this._id = requiredValue(id, 'id');
        this._uuid = uuid;
        this._title = title;
        this._description = description;
        this._url = url;
        this._source = source;
    }

    static forConcept(website: Website): Website {
        return new Website(
            website.id,
            requiredValue(website.uuid, 'uuid'),
            requiredValue(website.title, 'title'),
            website.description,
            requiredValue(website.url, 'url'),
            undefined
        );
    }

    static forConceptSnapshot(website: Website): Website {
        return new Website(
            website.id,
            undefined,
            requiredValue(website.title, 'title'),
            website.description,
            requiredValue(website.url, 'url'),
            undefined
        );
    }

    static forInstance(website: Website): Website {
        return new Website(
            website.id,
            requiredValue(website.uuid, 'uuid'),
            website.title,
            website.description,
            website.url,
            website.source
        );
    }

    static reconstitute(id: Iri,
                        uuid: string | undefined,
                        title: LanguageString | undefined,
                        description: LanguageString | undefined,
                        url: string,
                        source: Iri | undefined): Website {

        return new Website(id, uuid, title, description, url, source);
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

    get source(): Iri | undefined {
        return this._source;
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

export class WebsiteBuilder {

    private id: Iri;
    private uuid: string | undefined;
    private title: LanguageString | undefined;
    private description: LanguageString | undefined;
    private url: string | undefined;
    private source: Iri | undefined;

    static buildIri(uniqueId: string): Iri {
        return new Iri(`http://data.lblod.info/id/website/${uniqueId}`);
    }

    public withId(id: Iri): WebsiteBuilder {
        this.id = id;
        return this;
    }

    public withUuid(uuid: string): WebsiteBuilder {
        this.uuid = uuid;
        return this;
    }

    public withTitle(title: LanguageString): WebsiteBuilder {
        this.title = title;
        return this;
    }

    public withDescription(description: LanguageString): WebsiteBuilder {
        this.description = description;
        return this;
    }

    public withUrl(url: string): WebsiteBuilder {
        this.url = url;
        return this;
    }

    public withSource(source: Iri): WebsiteBuilder {
        this.source = source;
        return this;
    }

    public buildForInstance(): Website {
        return Website.forInstance(this.build());
    }

    public buildForConcept(): Website {
        return Website.forConcept(this.build());
    }

    public buildForConceptSnapshot(): Website {
        return Website.forConceptSnapshot(this.build());
    }

    public build(): Website {
        return Website.reconstitute(
            this.id,
            this.uuid,
            this.title,
            this.description,
            this.url,
            this.source
        );
    }
}