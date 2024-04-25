import {Iri} from "./shared/iri";
import {requiredValue} from "./shared/invariant";
import {zip} from "lodash";
import {LanguageString} from "./language-string";


export class LegalResource {

    private readonly _id: Iri;
    private readonly _uuid: string | undefined;
    private readonly _title: LanguageString | undefined;
    private readonly _description: LanguageString | undefined;
    private readonly _url: string | undefined;
    private readonly _order: number;

    private constructor(id: Iri,
                        uuid: string | undefined,
                        title: LanguageString | undefined,
                        description: LanguageString | undefined,
                        url: string | undefined,
                        order: number) {
        this._id = requiredValue(id, 'id');
        this._uuid = uuid;
        this._title = title;
        this._description = description;
        this._url = url;
        this._order = requiredValue(order, 'order');
    }

    static forConcept(legalResource: LegalResource): LegalResource {
        return new LegalResource(
            legalResource.id,
            requiredValue(legalResource.uuid, 'uuid'),
            legalResource.title,
            legalResource.description,
            requiredValue(legalResource.url, 'url'),
            legalResource.order,
        );
    }

    static forConceptSnapshot(legalResource: LegalResource): LegalResource {
        return new LegalResource(
            legalResource.id,
            undefined,
            legalResource.title,
            legalResource.description,
            requiredValue(legalResource.url, 'url'),
            legalResource.order,
        );
    }

    static forInstance(legalResource: LegalResource): LegalResource {
        return new LegalResource(
            legalResource.id,
            requiredValue(legalResource.uuid, 'uuid'),
            legalResource.title,
            legalResource.description,
            legalResource.url,
            legalResource.order,
        );
    }

    static forInstanceSnapshot(legalResource: LegalResource): LegalResource {
        return new LegalResource(
            legalResource.id,
            undefined,
            legalResource.title,
            legalResource.description,
            requiredValue(legalResource.url, 'url'),
            legalResource.order,
        );
    }

    static reconstitute(id: Iri,
                        uuid: string | undefined,
                        title: LanguageString | undefined,
                        description: LanguageString | undefined,
                        url: string,
                        order: number): LegalResource {
        return new LegalResource(id, uuid, title, description, url, order);
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

    get order(): number {
        return this._order;
    }

    static isFunctionallyChanged(value: LegalResource[], other: LegalResource[]): boolean {
        return value.length !== other.length
            || zip(value, other).some((lr: [LegalResource, LegalResource]) => {
                return LanguageString.isFunctionallyChanged(lr[0].title, lr[1].title)
                    || LanguageString.isFunctionallyChanged(lr[0].description, lr[1].description)
                    || lr[0].url !== lr[1].url;
            });
    }
}

export class LegalResourceBuilder {
    private id: Iri;
    private uuid: string | undefined;
    private title: LanguageString | undefined;
    private description: LanguageString | undefined;
    private url: string | undefined;
    private order: number;

    static buildIri(uniqueId: string): Iri {
        return new Iri(`http://data.lblod.info/id/legal-resource/${uniqueId}`);
    }

    static from(legalResource: LegalResource): LegalResourceBuilder {
        return new LegalResourceBuilder()
            .withId(legalResource.id)
            .withUuid(legalResource.uuid)
            .withTitle(legalResource.title)
            .withDescription(legalResource.description)
            .withUrl(legalResource.url)
            .withOrder(legalResource.order);
    }
    public withId(id: Iri): LegalResourceBuilder {
        this.id = id;
        return this;
    }

    public withUuid(uuid: string): LegalResourceBuilder {
        this.uuid = uuid;
        return this;
    }

    public withTitle(title: LanguageString): LegalResourceBuilder {
        this.title = title;
        return this;
    }

    public withDescription(description: LanguageString): LegalResourceBuilder {
        this.description = description;
        return this;
    }

    public withUrl(url: string): LegalResourceBuilder {
        this.url = url;
        return this;
    }

    public withOrder(order: number): LegalResourceBuilder {
        this.order = order;
        return this;
    }

    public build(): LegalResource {
        return LegalResource.reconstitute(
            this.id,
            this.uuid,
            this.title,
            this.description,
            this.url,
            this.order,
        );
    }

}
