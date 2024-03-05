import {Iri} from "./shared/iri";
import {requiredValue} from "./shared/invariant";
import {zip} from "lodash";


export class LegalResource {

    private readonly _id: Iri;
    private readonly _uuid: string | undefined;
    private readonly _url: string | undefined;
    private readonly _order: number;

    private constructor(id: Iri,
                        uuid: string | undefined,
                        url: string | undefined,
                        order: number) {
        this._id = requiredValue(id, 'id');
        this._uuid = uuid;
        this._url = url;
        this._order = requiredValue(order, 'order');
    }

    static forConcept(legalResource: LegalResource): LegalResource {
        return new LegalResource(
            legalResource.id,
            requiredValue(legalResource.uuid, 'uuid'),
            requiredValue(legalResource.url, 'url'),
            legalResource.order,
        );
    }

    static forInstance(legalResource: LegalResource): LegalResource {
        return new LegalResource(
            legalResource.id,
            requiredValue(legalResource.uuid, 'uuid'),
            legalResource.url,
            legalResource.order,
        );
    }

    static forInstanceSnapshot(legalResource: LegalResource): LegalResource {
        return new LegalResource(
            legalResource.id,
            undefined,
            requiredValue(legalResource.url, 'url'),
            legalResource.order,
        );
    }

    static reconstitute(id: Iri,
                        uuid: string | undefined,
                        url: string,
                        order: number): LegalResource {
        return new LegalResource(id, uuid, url, order);
    }

    get id(): Iri {
        return this._id;
    }

    get uuid(): string | undefined {
        return this._uuid;
    }

    get url(): string {
        return this._url;
    }

    get order(): number {
        return this._order;
    }

    static isFunctionallyChanged(value: LegalResource[], other: LegalResource[]): boolean {
        return value.length !== other.length
            || zip(value, other).some((legalResources: [LegalResource, LegalResource]) => {
                return legalResources[0].url !== legalResources[1].url;
            });
    }
}

export class LegalResourceBuilder {
    private id: Iri;
    private uuid: string | undefined;
    private url: string | undefined;
    private order: number;

    static buildIri(uniqueId: string): Iri {
        return new Iri(`http://data.lblod.info/id/legal-resource/${uniqueId}`);
    }

    public withId(id: Iri): LegalResourceBuilder {
        this.id = id;
        return this;
    }

    public withUuid(uuid: string): LegalResourceBuilder {
        this.uuid = uuid;
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

    public buildForConcept(): LegalResource {
        return LegalResource.forConcept(this.build());
    }

    public buildForInstance(): LegalResource {
        return LegalResource.forInstance(this.build());
    }

    public build(): LegalResource {
        return LegalResource.reconstitute(
            this.id,
            this.uuid,
            this.url,
            this.order,
        );
    }

}