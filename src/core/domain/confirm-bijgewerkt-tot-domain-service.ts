import {ConceptSnapshot} from "./concept-snapshot";
import {Instance, InstanceBuilder} from "./instance";
import {InstanceRepository} from "../port/driven/persistence/instance-repository";
import {Bestuurseenheid} from "./bestuurseenheid";
import {ConceptRepository} from "../port/driven/persistence/concept-repository";
import {ConceptSnapshotRepository} from "../port/driven/persistence/concept-snapshot-repository";
import {Concept} from "./concept";
import {FormatPreservingDate} from "./format-preserving-date";
import {InvariantError} from "./shared/lpdc-error";


export class ConfirmBijgewerktTotDomainService {

    private readonly _instanceRepository: InstanceRepository;
    private readonly _conceptRepository: ConceptRepository;
    private readonly _conceptSnapshotRepository: ConceptSnapshotRepository;

    constructor(
        instanceRepository: InstanceRepository,
        conceptRepository: ConceptRepository,
        conceptSnapshotRepository: ConceptSnapshotRepository) {
        this._instanceRepository = instanceRepository;
        this._conceptRepository = conceptRepository;
        this._conceptSnapshotRepository = conceptSnapshotRepository;
    }

    async confirmBijgewerktTot(bestuurseenheid: Bestuurseenheid, instance: Instance, instanceVersion: FormatPreservingDate, conceptSnapshot: ConceptSnapshot): Promise<void> {
        if (instance.conceptSnapshotId.equals(conceptSnapshot.id)) {
            return;
        }

        const concept = await this._conceptRepository.findById(instance.conceptId);

        this.verifyConceptSnapshotBelongsToConcept(concept, conceptSnapshot);

        const isBijgewerktTotLatestFunctionalChange = await this.isBijgewerktTotLatestFunctionalChange(concept, conceptSnapshot);

        const updatedInstance = InstanceBuilder.from(instance)
            .withConceptSnapshotId(conceptSnapshot.id)
            .withReviewStatus(isBijgewerktTotLatestFunctionalChange ? undefined : instance.reviewStatus)
            .build();

        await this._instanceRepository.update(bestuurseenheid, updatedInstance, instanceVersion);
    }

    private verifyConceptSnapshotBelongsToConcept(concept: Concept, conceptSnapshot: ConceptSnapshot): void {
        if (!conceptSnapshot.isVersionOfConcept.equals(concept.id)) {
            throw new InvariantError('BijgewerktTot: concept snapshot hoort niet bij het concept gekoppeld aan de instantie');
        }
    }

    private async isBijgewerktTotLatestFunctionalChange(concept: Concept, conceptSnapshot: ConceptSnapshot): Promise<boolean> {
        const latestFunctionalChangedConceptSnapshot = await this._conceptSnapshotRepository.findById(concept.latestFunctionallyChangedConceptSnapshot);
        return !conceptSnapshot.generatedAtTime.before(latestFunctionalChangedConceptSnapshot.generatedAtTime);
    }
}