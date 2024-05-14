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

export class NewInstanceDomainService {

    private readonly _instanceRepository: InstanceRepository;
    private readonly _formalInformalChoiceRepository: FormalInformalChoiceRepository;
    private readonly _conceptDisplayConfigurationRepository: ConceptDisplayConfigurationRepository;

    constructor(instanceRepository: InstanceRepository,
                formalInformalChoiceRepository: FormalInformalChoiceRepository,
                conceptDisplayConfigurationRepository: ConceptDisplayConfigurationRepository) {
        this._instanceRepository = instanceRepository;
        this._formalInformalChoiceRepository = formalInformalChoiceRepository;
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
        const chosenForm = formalInformalChoice?.chosenForm;
        const conceptLanguageVersion = this.selectLanguageVersionForConcept(concept, chosenForm);
        const dutchLanguageVariant = this.toDutchLanguageVariant(chosenForm);

        const newInstance =
            new Instance(
                instanceId,
                instanceUuid,
                bestuurseenheid.id,
                concept.title?.transformLanguage(conceptLanguageVersion, dutchLanguageVariant),
                concept.description?.transformLanguage(conceptLanguageVersion, dutchLanguageVariant),
                concept.additionalDescription?.transformLanguage(conceptLanguageVersion, dutchLanguageVariant),
                concept.exception?.transformLanguage(conceptLanguageVersion, dutchLanguageVariant),
                concept.regulation?.transformLanguage(conceptLanguageVersion, dutchLanguageVariant),
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
                concept.requirements.map(r => r.transformLanguage(conceptLanguageVersion, dutchLanguageVariant).transformWithNewId()),
                concept.procedures.map(proc => proc.transformLanguage(conceptLanguageVersion, dutchLanguageVariant).transformWithNewId()),
                concept.websites.map(ws => ws.transformLanguage(conceptLanguageVersion, dutchLanguageVariant).transformWithNewId()),
                concept.costs.map(c => c.transformLanguage(conceptLanguageVersion, dutchLanguageVariant).transformWithNewId()),
                concept.financialAdvantages.map(fa => fa.transformLanguage(conceptLanguageVersion, dutchLanguageVariant).transformWithNewId()),
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
                concept.legalResources.map(lr => lr.transformLanguage(conceptLanguageVersion, dutchLanguageVariant).transformWithNewId()),
            );

        await this._instanceRepository.save(bestuurseenheid, newInstance);
        await this._conceptDisplayConfigurationRepository.syncInstantiatedFlag(bestuurseenheid, concept.id);

        return newInstance;
    }

    private selectLanguageVersionForConcept(concept: Concept, chosenForm: ChosenFormType | undefined): Language {
        if (chosenForm === ChosenFormType.INFORMAL) {
            if (concept.conceptLanguages.includes(Language.INFORMAL)) {
                return Language.INFORMAL;
            } else if (concept.conceptLanguages.includes(Language.GENERATED_INFORMAL)) {
                return Language.GENERATED_INFORMAL;
            } else {
                return Language.NL;
            }
        } else {
            if (concept.conceptLanguages.includes(Language.FORMAL)) {
                return Language.FORMAL;
            } else if (concept.conceptLanguages.includes(Language.GENERATED_FORMAL) && concept.conceptLanguages.includes(Language.INFORMAL)) {
                return Language.GENERATED_FORMAL;
            } else {
                return Language.NL;
            }
        }
    }

    private toDutchLanguageVariant(chosenForm: ChosenFormType | undefined): Language {
        return chosenForm === ChosenFormType.INFORMAL ? Language.INFORMAL : Language.FORMAL;
    }
}
