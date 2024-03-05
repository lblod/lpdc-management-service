import {Iri} from "./shared/iri";
import {requiredValue} from "./shared/invariant";
import {InvariantError} from "./shared/lpdc-error";

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
        this.conceptIsNewAndInstantiatedCantBothBeTrue();
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

    conceptIsNewAndInstantiatedCantBothBeTrue(){
        if(this.conceptIsNew===true && this.conceptIsInstantiated){
            throw new InvariantError('ConceptIsNew and conceptIsInstantiated cant both be true');
        }
    }
}

export class ConceptDisplayConfigurationBuilder {
    private id: Iri;
    private uuid: string;
    private conceptIsNew: boolean;
    private conceptIsInstantiated: boolean;
    private bestuurseenheidId: Iri;
    private conceptId: Iri;

    public static from(conceptDisplayConfiguration: ConceptDisplayConfiguration): ConceptDisplayConfigurationBuilder {
        return new ConceptDisplayConfigurationBuilder()
            .withId(conceptDisplayConfiguration.id)
            .withUuid(conceptDisplayConfiguration.uuid)
            .withConceptIsNew(conceptDisplayConfiguration.conceptIsNew)
            .withConceptIsInstantiated(conceptDisplayConfiguration.conceptIsInstantiated)
            .withBestuurseenheidId(conceptDisplayConfiguration.bestuurseenheidId)
            .withConceptId(conceptDisplayConfiguration.conceptId);
    }

    public withId(id: Iri): ConceptDisplayConfigurationBuilder {
        this.id = id;
        return this;
    }

    public withUuid(uuid: string): ConceptDisplayConfigurationBuilder {
        this.uuid = uuid;
        return this;
    }

    public withConceptIsNew(conceptIsNew: boolean): ConceptDisplayConfigurationBuilder {
        this.conceptIsNew = conceptIsNew;
        return this;
    }

    public withConceptIsInstantiated(conceptIsInstantiated: boolean): ConceptDisplayConfigurationBuilder {
        this.conceptIsInstantiated = conceptIsInstantiated;
        return this;
    }

    public withBestuurseenheidId(bestuurseenheidId: Iri): ConceptDisplayConfigurationBuilder {
        this.bestuurseenheidId = bestuurseenheidId;
        return this;
    }

    public withConceptId(conceptId: Iri): ConceptDisplayConfigurationBuilder {
        this.conceptId = conceptId;
        return this;
    }

    public build(): ConceptDisplayConfiguration {
        return new ConceptDisplayConfiguration(
            this.id,
            this.uuid,
            this.conceptIsNew,
            this.conceptIsInstantiated,
            this.bestuurseenheidId,
            this.conceptId,
        );
    }
}