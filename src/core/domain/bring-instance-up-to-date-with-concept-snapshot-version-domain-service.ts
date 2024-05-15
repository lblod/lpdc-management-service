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
import {Language} from "./language";
import {InstanceStatusType} from "./types";

export class BringInstanceUpToDateWithConceptSnapshotVersionDomainService {

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

        const formalInformalChoice: FormalInformalChoice | undefined = await this._formalInformalChoiceRepository.findByBestuurseenheid(bestuurseenheid);
        const conceptSnapshotLanguage = await this._selectConceptLanguageDomainService.select(conceptSnapshot, formalInformalChoice);
        const instanceLanguage = instance.dutchLanguageVariant;

        const instanceInStatusOntwerp = instance.status === InstanceStatusType.VERSTUURD ? instance.reopen() : instance;

        const instanceMergedWithConceptSnapshot = InstanceBuilder.from(instanceInStatusOntwerp)
            .withTitle(conceptSnapshot.title?.transformLanguage(conceptSnapshotLanguage, instanceLanguage))
            .withDescription(conceptSnapshot.description?.transformLanguage(conceptSnapshotLanguage, instanceLanguage))
            .withAdditionalDescription(conceptSnapshot.additionalDescription?.transformLanguage(conceptSnapshotLanguage, instanceLanguage))
            .withException(conceptSnapshot.exception?.transformLanguage(conceptSnapshotLanguage, instanceLanguage))
            .withRegulation(conceptSnapshot.regulation?.transformLanguage(conceptSnapshotLanguage, instanceLanguage))
            .withStartDate(conceptSnapshot.startDate)
            .withEndDate(conceptSnapshot.endDate)
            .withType(conceptSnapshot.type)
            .withTargetAudiences(conceptSnapshot.targetAudiences)
            .withThemes(conceptSnapshot.themes)
            .withCompetentAuthorityLevels(conceptSnapshot.competentAuthorityLevels)
            .withCompetentAuthorities(conceptSnapshot.competentAuthorities)
            .withExecutingAuthorityLevels(conceptSnapshot.executingAuthorityLevels)
            .withPublicationMedia(conceptSnapshot.publicationMedia)
            .withYourEuropeCategories(conceptSnapshot.yourEuropeCategories)
            .withKeywords(conceptSnapshot.keywords.filter(keyword => !!keyword.getLanguageValue(Language.NL)))
            .withRequirements(conceptSnapshot.requirements.map(req => req.transformLanguage(conceptSnapshotLanguage, instanceLanguage).transformWithNewId()))
            .withProcedures(conceptSnapshot.procedures.map(req => req.transformLanguage(conceptSnapshotLanguage, instanceLanguage).transformWithNewId()))
            .withWebsites(conceptSnapshot.websites.map(ws => ws.transformLanguage(conceptSnapshotLanguage, instanceLanguage).transformWithNewId()))
            .withCosts(conceptSnapshot.costs.map(ws => ws.transformLanguage(conceptSnapshotLanguage, instanceLanguage).transformWithNewId()))
            .withFinancialAdvantages(conceptSnapshot.financialAdvantages.map(ws => ws.transformLanguage(conceptSnapshotLanguage, instanceLanguage).transformWithNewId()))
            .withLegalResources(conceptSnapshot.legalResources.map(ws => ws.transformLanguage(conceptSnapshotLanguage, instanceLanguage).transformWithNewId()))
            .withProductId(conceptSnapshot.productId)
            .build();

        await this.confirmUpToDateTill(bestuurseenheid, instanceMergedWithConceptSnapshot, instanceVersion, conceptSnapshot);

    }

    async confirmUpToDateTill(bestuurseenheid: Bestuurseenheid, instance: Instance, instanceVersion: FormatPreservingDate, conceptSnapshot: ConceptSnapshot): Promise<void> {
        if (instance.conceptSnapshotId.equals(conceptSnapshot.id)) {
            return;
        }

        const concept = await this._conceptRepository.findById(instance.conceptId);

        this.errorIfConceptSnapshotDoesNotBelongToConcept(concept, conceptSnapshot);

        const isUpToDateTillLatestFunctionalChange = await this.isUpToDateTillLatestFunctionalChange(concept, conceptSnapshot);

        const updatedInstance = InstanceBuilder.from(instance)
            .withConceptSnapshotId(conceptSnapshot.id)
            .withReviewStatus(isUpToDateTillLatestFunctionalChange ? undefined : instance.reviewStatus)
            .build();

        await this._instanceRepository.update(bestuurseenheid, updatedInstance, instanceVersion);
    }

    private errorIfConceptSnapshotDoesNotBelongToConcept(concept: Concept, conceptSnapshot: ConceptSnapshot): void {
        if (!conceptSnapshot.isVersionOfConcept.equals(concept.id)) {
            throw new InvariantError('BijgewerktTot: concept snapshot hoort niet bij het concept gekoppeld aan de instantie');
        }
    }

    private async isUpToDateTillLatestFunctionalChange(concept: Concept, conceptSnapshot: ConceptSnapshot): Promise<boolean> {
        const latestFunctionalChangedConceptSnapshot = await this._conceptSnapshotRepository.findById(concept.latestFunctionallyChangedConceptSnapshot);
        return !conceptSnapshot.generatedAtTime.before(latestFunctionalChangedConceptSnapshot.generatedAtTime);
    }
}