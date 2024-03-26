import {InstanceRepository} from "../port/driven/persistence/instance-repository";
import {
    ConceptDisplayConfigurationRepository
} from "../port/driven/persistence/concept-display-configuration-repository";
import {Bestuurseenheid} from "./bestuurseenheid";
import {Iri} from "./shared/iri";

export class DeleteInstanceDomainService {
    private readonly _instanceRepository: InstanceRepository;
    private readonly _conceptDisplayConfigurationRepository: ConceptDisplayConfigurationRepository;


    constructor(instanceRepository: InstanceRepository, conceptDisplayConfigurationRepository: ConceptDisplayConfigurationRepository) {
        this._instanceRepository = instanceRepository;
        this._conceptDisplayConfigurationRepository = conceptDisplayConfigurationRepository;
    }

    public async delete(bestuurseenheid: Bestuurseenheid, instanceId: Iri) {
        const instance = await this._instanceRepository.findById(bestuurseenheid, instanceId);
        await this._instanceRepository.delete(bestuurseenheid, instance.id);

        if (instance.conceptId !== undefined) {
            await this._conceptDisplayConfigurationRepository.syncInstantiatedFlag(bestuurseenheid, instance.conceptId);
        }

    }
}