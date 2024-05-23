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
import {Language} from "./language";
import {InstanceStatusType} from "./types";

export class BringInstanceUpToDateWithConceptSnapshotVersionDomainService {

    private readonly _instanceRepository: InstanceRepository;
    private readonly _conceptRepository: ConceptRepository;
    private readonly _conceptSnapshotRepository: ConceptSnapshotRepository;
    private readonly _selectConceptLanguageDomainService: SelectConceptLanguageDomainService;

    constructor(
        instanceRepository: InstanceRepository,
        conceptRepository: ConceptRepository,
        conceptSnapshotRepository: ConceptSnapshotRepository,
        selectConceptLanguageDomainService: SelectConceptLanguageDomainService) {
        this._instanceRepository = instanceRepository;
        this._conceptRepository = conceptRepository;
        this._conceptSnapshotRepository = conceptSnapshotRepository;
        this._selectConceptLanguageDomainService = selectConceptLanguageDomainService;
    }

    async fullyTakeConceptSnapshotOver(bestuurseenheid: Bestuurseenheid, instance: Instance, instanceVersion: FormatPreservingDate, conceptSnapshot: ConceptSnapshot): Promise<void> {

        const instanceLanguage = instance.dutchLanguageVariant;
        const conceptSnapshotLanguage = this._selectConceptLanguageDomainService.selectAvailableLanguage(conceptSnapshot, instanceLanguage === Language.INFORMAL);

        const instanceInStatusOntwerp = instance.status === InstanceStatusType.VERSTUURD ? instance.reopen() : instance;

        const conceptSnapshotInInstanceLanguage = conceptSnapshot.transformLanguage(conceptSnapshotLanguage, instanceLanguage);

        const instanceMergedWithConceptSnapshot = InstanceBuilder.from(instanceInStatusOntwerp)
            .withTitle(conceptSnapshotInInstanceLanguage.title)
            .withDescription(conceptSnapshotInInstanceLanguage.description)
            .withAdditionalDescription(conceptSnapshotInInstanceLanguage.additionalDescription)
            .withException(conceptSnapshotInInstanceLanguage.exception)
            .withRegulation(conceptSnapshotInInstanceLanguage.regulation)
            .withStartDate(conceptSnapshotInInstanceLanguage.startDate)
            .withEndDate(conceptSnapshotInInstanceLanguage.endDate)
            .withType(conceptSnapshotInInstanceLanguage.type)
            .withTargetAudiences(conceptSnapshotInInstanceLanguage.targetAudiences)
            .withThemes(conceptSnapshotInInstanceLanguage.themes)
            .withCompetentAuthorityLevels(conceptSnapshotInInstanceLanguage.competentAuthorityLevels)
            .withCompetentAuthorities(conceptSnapshotInInstanceLanguage.competentAuthorities)
            .withExecutingAuthorityLevels(conceptSnapshotInInstanceLanguage.executingAuthorityLevels)
            .withPublicationMedia(conceptSnapshotInInstanceLanguage.publicationMedia)
            .withYourEuropeCategories(conceptSnapshotInInstanceLanguage.yourEuropeCategories)
            //TODO LPDC-1171: extract a method to sanitize the keywords ? and reuse on a few places; or put this on LangaugeString ?
            .withKeywords(conceptSnapshotInInstanceLanguage.keywords.filter(keyword => !!keyword.getLanguageValue(Language.NL)))
            .withRequirements(conceptSnapshotInInstanceLanguage.requirements.map(req => req.transformWithNewId()))
            .withProcedures(conceptSnapshotInInstanceLanguage.procedures.map(proc => proc.transformWithNewId()))
            .withCosts(conceptSnapshotInInstanceLanguage.costs.map(co => co.transformWithNewId()))
            .withFinancialAdvantages(conceptSnapshotInInstanceLanguage.financialAdvantages.map(fa => fa.transformWithNewId()))
            .withLegalResources(conceptSnapshotInInstanceLanguage.legalResources.map(lr => lr.transformWithNewId()))
            .withProductId(conceptSnapshotInInstanceLanguage.productId)
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