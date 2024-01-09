import {Iri} from "./shared/iri";
import {requiredValue} from "./shared/invariant";

export class ConceptDisplayConfiguration {

    private readonly _id: Iri;
    private readonly _uuid: string; //required for mu-cl-resources.
    private readonly _conceptIsNew: boolean;
    private readonly _conceptIsInstantiated: boolean;
    private readonly _bestuurseenheidId: Iri;
    private readonly _conceptId: Iri;

    public constructor(id: Iri,
                       uuid: string,
                       conceptIsNew: boolean,
                       conceptIsInstantiated: boolean,
                       bestuurseenheidId: Iri,
                       conceptId: Iri) {
        this._id = requiredValue(id, 'id');
        this._uuid = requiredValue(uuid, 'uuid');
        this._conceptIsNew = requiredValue(conceptIsNew, 'conceptIsNew');
        this._conceptIsInstantiated = requiredValue(conceptIsInstantiated, 'conceptIsInstantiated');
        this._bestuurseenheidId = requiredValue(bestuurseenheidId, 'bestuurseenheidId');
        this._conceptId = requiredValue(conceptId, 'conceptId');
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

    get conceptId(): Iri {
        return this._conceptId;
    }

}