import {Iri} from "./shared/iri";
import {LanguageString} from "./language-string";
import {zip} from "lodash";
import {requiredValue} from "./shared/invariant";
import {instanceLanguages, Language} from "./language";

export class Website {

    private readonly _id: Iri;
    private readonly _uuid: string | undefined; //required for mu-cl-resources.
    private readonly _title: LanguageString | undefined;
    private readonly _description: LanguageString | undefined;
    private readonly _order: number;
    private readonly _url: string | undefined;
    private readonly _conceptWebsiteId: Iri | undefined;

    private constructor(id: Iri,
                        uuid: string | undefined,
                        title: LanguageString,
                        description: LanguageString | undefined,
                        order: number,
                        url: string | undefined,
                        conceptWebsiteId: Iri | undefined) {
        this._id = requiredValue(id, 'id');
        this._uuid = uuid;
        this._title = title;
        this._description = description;
        this._order = requiredValue(order, 'order');
        this._url = url;
        this._conceptWebsiteId = conceptWebsiteId;
    }

    static forConcept(website: Website): Website {
        return new Website(
            website.id,
            requiredValue(website.uuid, 'uuid'),
            requiredValue(website.title, 'title'),
            website.description,
            website.order,
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
            website.order,
            requiredValue(website.url, 'url'),
            undefined
        );
    }

    static forInstance(website: Website): Website {
        LanguageString.validateUniqueAndCorrectLanguages(instanceLanguages, website.title, website.description);

        return new Website(
            website.id,
            requiredValue(website.uuid, 'uuid'),
            website.title,
            website.description,
            website.order,
            website.url,
            website.conceptWebsiteId
        );
    }

    static forInstanceSnapshot(website: Website): Website {
        LanguageString.validateUniqueAndCorrectLanguages(instanceLanguages, website.title, website.description);

        return new Website(
            website.id,
            undefined,
            requiredValue(website.title, 'title'),
            website.description,
            website.order,
            requiredValue(website.url, 'url'),
            undefined
        );
    }

    static reconstitute(id: Iri,
                        uuid: string | undefined,
                        title: LanguageString | undefined,
                        description: LanguageString | undefined,
                        order: number,
                        url: string,
                        conceptWebsiteId: Iri | undefined): Website {

        return new Website(id, uuid, title, description, order, url, conceptWebsiteId);
    }

    get nlLanguage(): Language | undefined {
        return LanguageString.extractNlLanguages([this._title, this._description])[0];
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

    get order(): number {
        return this._order;
    }

    get url(): string {
        return this._url;
    }

    get conceptWebsiteId(): Iri | undefined {
        return this._conceptWebsiteId;
    }

    static isFunctionallyChanged(value: Website[], other: Website[]): boolean {
        return value.length !== other.length
            || zip(value, other).some((websites: [Website, Website]) => {
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
    private order: number;
    private url: string | undefined;
    private conceptWebsiteId: Iri | undefined;

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

    public withOrder(order: number): WebsiteBuilder {
        this.order = order;
        return this;
    }

    public withUrl(url: string): WebsiteBuilder {
        this.url = url;
        return this;
    }

    public withConceptWebsiteId(conceptWebsiteId: Iri): WebsiteBuilder {
        this.conceptWebsiteId = conceptWebsiteId;
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
            this.order,
            this.url,
            this.conceptWebsiteId
        );
    }
}