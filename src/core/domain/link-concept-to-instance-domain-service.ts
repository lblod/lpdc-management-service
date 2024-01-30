import {InstanceRepository} from "../port/driven/persistence/instance-repository";
import {
    ConceptDisplayConfigurationRepository
} from "../port/driven/persistence/concept-display-configuration-repository";
import {Instance, InstanceBuilder} from "./instance";
import {Concept} from "./concept";
import {Bestuurseenheid} from "./bestuurseenheid";
import {FormatPreservingDate} from "./format-preserving-date";

export class LinkConceptToInstanceDomainService {

    private readonly _instanceRepository: InstanceRepository;
    private readonly _conceptDisplayConfigurationRepository: ConceptDisplayConfigurationRepository;

    constructor(instanceRepository: InstanceRepository,
                conceptDisplayConfigurationRepository: ConceptDisplayConfigurationRepository) {
        this._instanceRepository = instanceRepository;
        this._conceptDisplayConfigurationRepository = conceptDisplayConfigurationRepository;
    }

    async link(bestuurseenheid: Bestuurseenheid, instance: Instance, concept: Concept): Promise<void> {
        const updatedInstance = InstanceBuilder.from(instance)
            .withConceptId(concept.id)
            .withConceptSnapshotId(concept.latestConceptSnapshot)
            .withProductId(concept.productId)
            .withDateModified(FormatPreservingDate.now())
            .build();

        await this._instanceRepository.update(bestuurseenheid, updatedInstance, instance);
        await this._conceptDisplayConfigurationRepository.removeConceptIsNewFlagAndSetInstantiatedFlag(bestuurseenheid, concept.id);
    }
}