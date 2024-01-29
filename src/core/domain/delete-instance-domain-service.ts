import {InstanceRepository} from "../port/driven/persistence/instance-repository";
import {
    ConceptDisplayConfigurationRepository
} from "../port/driven/persistence/concept-display-configuration-repository";
import {Bestuurseenheid} from "./bestuurseenheid";
import {Iri} from "./shared/iri";
import {ConceptRepository} from "../port/driven/persistence/concept-repository";

export class DeleteInstanceDomainService {
    private readonly _instanceRepository: InstanceRepository;
    private readonly _conceptRepository: ConceptRepository;
    private readonly _conceptDisplayConfigurationRepository: ConceptDisplayConfigurationRepository;


    constructor(instanceRepository: InstanceRepository, conceptRepository: ConceptRepository, conceptDisplayConfigurationRepository: ConceptDisplayConfigurationRepository) {
        this._instanceRepository = instanceRepository;
        this._conceptRepository = conceptRepository;
        this._conceptDisplayConfigurationRepository = conceptDisplayConfigurationRepository;
    }


    public async delete(bestuurseenheid: Bestuurseenheid, instanceId: Iri) {
        const instance = await this._instanceRepository.findById(bestuurseenheid, instanceId);
        await this._instanceRepository.delete(bestuurseenheid, instance.id);

        if (instance.conceptId != undefined) {
            const conceptHasInstances = await this._conceptRepository.conceptHasInstancesInBestuurseenheid(instance.conceptId, bestuurseenheid.userGraph());
            if (conceptHasInstances === false) {
                await this._conceptDisplayConfigurationRepository.removeInstantiatedFlag(bestuurseenheid, instance.conceptId);
            }
        }

    }
}