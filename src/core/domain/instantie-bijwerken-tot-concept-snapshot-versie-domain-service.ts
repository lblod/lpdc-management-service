import {ConceptSnapshot} from "./concept-snapshot";
import {Instance, InstanceBuilder} from "./instance";
import {InstanceRepository} from "../port/driven/persistence/instance-repository";
import {Bestuurseenheid} from "./bestuurseenheid";
import {ConceptRepository} from "../port/driven/persistence/concept-repository";
import {ConceptSnapshotRepository} from "../port/driven/persistence/concept-snapshot-repository";
import {Concept} from "./concept";
import {FormatPreservingDate} from "./format-preserving-date";
import {InvariantError} from "./shared/lpdc-error";
import {SelectConceptLanguageDomainService} from "./select-concept-language-domain-service";
import {FormalInformalChoiceRepository} from "../port/driven/persistence/formal-informal-choice-repository";
import {FormalInformalChoice} from "./formal-informal-choice";

export class InstantieBijwerkenTotConceptSnapshotVersieDomainService {

    private readonly _instanceRepository: InstanceRepository;
    private readonly _conceptRepository: ConceptRepository;
    private readonly _conceptSnapshotRepository: ConceptSnapshotRepository;
    private readonly _formalInformalChoiceRepository: FormalInformalChoiceRepository;
    private readonly _selectConceptLanguageDomainService: SelectConceptLanguageDomainService;

    constructor(
        instanceRepository: InstanceRepository,
        conceptRepository: ConceptRepository,
        conceptSnapshotRepository: ConceptSnapshotRepository,
        formalInformalChoiceRepository: FormalInformalChoiceRepository,
        selectConceptLanguageDomainService: SelectConceptLanguageDomainService) {
        this._instanceRepository = instanceRepository;
        this._conceptRepository = conceptRepository;
        this._conceptSnapshotRepository = conceptSnapshotRepository;
        this._formalInformalChoiceRepository = formalInformalChoiceRepository;
        this._selectConceptLanguageDomainService = selectConceptLanguageDomainService;
    }

    async conceptSnapshotVolledigOvernemen(bestuurseenheid: Bestuurseenheid, instance: Instance, instanceVersion: FormatPreservingDate, conceptSnapshot: ConceptSnapshot): Promise<void> {
        //TODO LPDC-1168: reopen if needed
        //TODO LPDC-1168: copy relevant fields from concept snapshot

        const formalInformalChoice: FormalInformalChoice | undefined = await this._formalInformalChoiceRepository.findByBestuurseenheid(bestuurseenheid);
        const conceptSnapshotLanguage = await this._selectConceptLanguageDomainService.select(conceptSnapshot, formalInformalChoice);

        const updatedInstance = InstanceBuilder.from(instance)
            .withTitle(conceptSnapshot.title?.transformLanguage(conceptSnapshotLanguage, instance.dutchLanguageVariant))
            .build();

        await this.confirmBijgewerktTot(bestuurseenheid, updatedInstance, instanceVersion, conceptSnapshot);

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