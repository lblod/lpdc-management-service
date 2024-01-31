import {InstanceRepository} from "../port/driven/persistence/instance-repository";
import {
    ConceptDisplayConfigurationRepository
} from "../port/driven/persistence/concept-display-configuration-repository";
import {Instance, InstanceBuilder} from "./instance";
import {Concept} from "./concept";
import {Bestuurseenheid} from "./bestuurseenheid";
import {FormatPreservingDate} from "./format-preserving-date";
import {ConceptRepository} from "../port/driven/persistence/concept-repository";

export class LinkConceptToInstanceDomainService {

    private readonly _instanceRepository: InstanceRepository;
    private readonly _conceptRepository: ConceptRepository;
    private readonly _conceptDisplayConfigurationRepository: ConceptDisplayConfigurationRepository;

    constructor(instanceRepository: InstanceRepository,
                conceptRepository: ConceptRepository,
                conceptDisplayConfigurationRepository: ConceptDisplayConfigurationRepository) {
        this._instanceRepository = instanceRepository;
        this._conceptRepository = conceptRepository;
        this._conceptDisplayConfigurationRepository = conceptDisplayConfigurationRepository;
    }

    async link(bestuurseenheid: Bestuurseenheid, instance: Instance, concept: Concept): Promise<void> {
        if (instance.conceptId) {
            await this.unlink(bestuurseenheid, instance);
            instance = await this._instanceRepository.findById(bestuurseenheid, instance.id);
        }

        const updatedInstance = InstanceBuilder.from(instance)
            .withConceptId(concept.id)
            .withConceptSnapshotId(concept.latestConceptSnapshot)
            .withProductId(concept.productId)
            .withDateModified(FormatPreservingDate.now())
            .build();

        await this._instanceRepository.update(bestuurseenheid, updatedInstance, instance);
        await this._conceptDisplayConfigurationRepository.removeConceptIsNewFlagAndSetInstantiatedFlag(bestuurseenheid, concept.id);
    }

    async unlink(bestuurseenheid: Bestuurseenheid, instance: Instance): Promise<void> {
        if (!instance.conceptId) {
            return;
        }

        const updatedInstance = InstanceBuilder.from(instance)
            .withConceptId(undefined)
            .withConceptSnapshotId(undefined)
            .withProductId(undefined)
            .withReviewStatus(undefined)
            .withDateModified(FormatPreservingDate.now())
            .build();

        await this._instanceRepository.update(bestuurseenheid, updatedInstance, instance);

        const conceptHasInstances = await this._conceptRepository.conceptHasInstancesInBestuurseenheid(instance.conceptId, bestuurseenheid.userGraph());
        if (!conceptHasInstances) {
            await this._conceptDisplayConfigurationRepository.removeInstantiatedFlag(bestuurseenheid, instance.conceptId);
        }
    }
}