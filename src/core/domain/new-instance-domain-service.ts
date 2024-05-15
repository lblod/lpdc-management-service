import {InstanceRepository} from "../port/driven/persistence/instance-repository";
import {Bestuurseenheid} from "./bestuurseenheid";
import {Instance} from "./instance";
import {uuid} from "../../../mu-helper";
import {FormatPreservingDate} from "./format-preserving-date";
import {ChosenFormType, InstanceStatusType} from "./types";
import {Iri} from "./shared/iri";
import {Concept} from "./concept";
import {FormalInformalChoiceRepository} from "../port/driven/persistence/formal-informal-choice-repository";
import {Language} from "./language";
import {FormalInformalChoice} from "./formal-informal-choice";
import {isEqual, uniqWith} from "lodash";
import {
    ConceptDisplayConfigurationRepository
} from "../port/driven/persistence/concept-display-configuration-repository";
import {SelectConceptLanguageDomainService} from "./select-concept-language-domain-service";

export class NewInstanceDomainService {

    private readonly _instanceRepository: InstanceRepository;
    private readonly _formalInformalChoiceRepository: FormalInformalChoiceRepository;
    private readonly _selectConceptLanguageDomainService: SelectConceptLanguageDomainService;
    private readonly _conceptDisplayConfigurationRepository: ConceptDisplayConfigurationRepository;

    constructor(instanceRepository: InstanceRepository,
                formalInformalChoiceRepository: FormalInformalChoiceRepository,
                selectConceptLanguageDomainService: SelectConceptLanguageDomainService,
                conceptDisplayConfigurationRepository: ConceptDisplayConfigurationRepository) {
        this._instanceRepository = instanceRepository;
        this._formalInformalChoiceRepository = formalInformalChoiceRepository;
        this._selectConceptLanguageDomainService = selectConceptLanguageDomainService;
        this._conceptDisplayConfigurationRepository = conceptDisplayConfigurationRepository;
    }

    public async createNewEmpty(bestuurseenheid: Bestuurseenheid): Promise<Instance> {
        const instanceUuid = uuid();
        const instanceId = new Iri(`http://data.lblod.info/id/public-service/${instanceUuid}`);

        const now = FormatPreservingDate.of(new Date().toISOString());
        const formalInformalChoice = await this._formalInformalChoiceRepository.findByBestuurseenheid(bestuurseenheid);
        const chosenForm = formalInformalChoice?.chosenForm;

        const newInstance =
            new Instance(
                instanceId,
                instanceUuid,
                bestuurseenheid.id,
                undefined,
                undefined,
                undefined,
                undefined,
                undefined,
                undefined,
                undefined,
                undefined,
                [],
                [],
                [],
                [bestuurseenheid.id],
                [],
                [bestuurseenheid.id],
                [],
                [],
                [],
                [],
                [],
                [],
                [],
                [],
                [],
                undefined,
                undefined,
                undefined,
                [],
                this.toDutchLanguageVariant(chosenForm),
                false,
                now,
                now,
                undefined,
                undefined,
                InstanceStatusType.ONTWERP,
                undefined,
                undefined,
                bestuurseenheid.spatials,
                [],
            );

        await this._instanceRepository.save(bestuurseenheid, newInstance);

        return newInstance;
    }

    public async createNewFromConcept(bestuurseenheid: Bestuurseenheid, concept: Concept): Promise<Instance> {
        const instanceUuid = uuid();
        const instanceId = new Iri(`http://data.lblod.info/id/public-service/${instanceUuid}`);
        const now = FormatPreservingDate.of(new Date().toISOString());

        const formalInformalChoice: FormalInformalChoice | undefined = await this._formalInformalChoiceRepository.findByBestuurseenheid(bestuurseenheid);
        const conceptLanguage = this._selectConceptLanguageDomainService.selectAvailableLanguageUsingFormalInformalChoice(concept, formalInformalChoice);

        const dutchLanguageVariant = this.toDutchLanguageVariant(formalInformalChoice?.chosenForm);

        const newInstance =
            new Instance(
                instanceId,
                instanceUuid,
                bestuurseenheid.id,
                concept.title?.transformLanguage(conceptLanguage, dutchLanguageVariant),
                concept.description?.transformLanguage(conceptLanguage, dutchLanguageVariant),
                concept.additionalDescription?.transformLanguage(conceptLanguage, dutchLanguageVariant),
                concept.exception?.transformLanguage(conceptLanguage, dutchLanguageVariant),
                concept.regulation?.transformLanguage(conceptLanguage, dutchLanguageVariant),
                concept.startDate,
                concept.endDate,
                concept.type,
                concept.targetAudiences,
                concept.themes,
                concept.competentAuthorityLevels,
                concept.competentAuthorities,
                concept.executingAuthorityLevels,
                uniqWith([...concept.executingAuthorities, bestuurseenheid.id], isEqual),
                concept.publicationMedia,
                concept.yourEuropeCategories,
                concept.keywords,
                concept.requirements.map(r => r.transformLanguage(conceptLanguage, dutchLanguageVariant).transformWithNewId()),
                concept.procedures.map(proc => proc.transformLanguage(conceptLanguage, dutchLanguageVariant).transformWithNewId()),
                concept.websites.map(ws => ws.transformLanguage(conceptLanguage, dutchLanguageVariant).transformWithNewId()),
                concept.costs.map(c => c.transformLanguage(conceptLanguage, dutchLanguageVariant).transformWithNewId()),
                concept.financialAdvantages.map(fa => fa.transformLanguage(conceptLanguage, dutchLanguageVariant).transformWithNewId()),
                [],
                concept.id,
                concept.latestConceptSnapshot,
                concept.productId,
                [],
                dutchLanguageVariant,
                false,
                now,
                now,
                undefined,
                undefined,
                InstanceStatusType.ONTWERP,
                undefined,
                undefined,
                bestuurseenheid.spatials,
                concept.legalResources.map(lr => lr.transformLanguage(conceptLanguage, dutchLanguageVariant).transformWithNewId()),
            );

        await this._instanceRepository.save(bestuurseenheid, newInstance);
        await this._conceptDisplayConfigurationRepository.syncInstantiatedFlag(bestuurseenheid, concept.id);

        return newInstance;
    }

    private toDutchLanguageVariant(chosenForm: ChosenFormType | undefined): Language {
        return chosenForm === ChosenFormType.INFORMAL ? Language.INFORMAL : Language.FORMAL;
    }
}
