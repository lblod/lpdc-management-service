import {Iri} from "./shared/iri";

export class ConceptDisplayConfiguration {

    private readonly _id: Iri;
    private readonly _uuid: string; //required for mu-cl-resources.
    private readonly _conceptIsNew: boolean;
    private readonly _conceptIsInstantiated: boolean;
    private readonly _bestuurseenheidId: Iri;

    public constructor(id: Iri,
                       uuid: string,
                       conceptIsNew: boolean,
                       conceptIsInstantiated: boolean,
                       bestuurseenheidId: Iri) {
        this._id = id;
        this._uuid = uuid;
        this._conceptIsNew = conceptIsNew;
        this._conceptIsInstantiated = conceptIsInstantiated;
        this._bestuurseenheidId = bestuurseenheidId;
        //TODO LPDC-916: invariants
    }

    get id(): Iri {
        return this._id;
    }

    get uuid(): string {
        return this._uuid;
    }

    get conceptIsNew(): boolean {
        return this._conceptIsNew;
    }

    get conceptIsInstantiated(): boolean {
        return this._conceptIsInstantiated;
    }

    get bestuurseenheidId(): Iri {
        return this._bestuurseenheidId;
    }

}