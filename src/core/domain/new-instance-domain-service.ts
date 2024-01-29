import {InstanceRepository} from "../port/driven/persistence/instance-repository";
import {Bestuurseenheid} from "./bestuurseenheid";
import {Instance} from "./instance";
import {uuid} from "../../../mu-helper";
import {FormatPreservingDate} from "./format-preserving-date";
import {ChosenFormType, InstanceStatusType} from "./types";
import {Iri} from "./shared/iri";
import {Concept} from "./concept";
import {LanguageString} from "./language-string";
import {FormalInformalChoiceRepository} from "../port/driven/persistence/formal-informal-choice-repository";
import {Language} from "./language";
import {FormalInformalChoice} from "./formal-informal-choice";
import {Requirement, RequirementBuilder} from "./requirement";
import {Evidence, EvidenceBuilder} from "./evidence";
import {Procedure, ProcedureBuilder} from "./procedure";
import {Website, WebsiteBuilder} from "./website";
import {Cost, CostBuilder} from "./cost";
import {FinancialAdvantage, FinancialAdvantageBuilder} from "./financial-advantage";
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
                now,
                now,
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

        const newInstance =
            new Instance(
                instanceId,
                instanceUuid,
                bestuurseenheid.id,
                this.toInstanceLanguageString(concept.title, conceptLanguageVersion, chosenForm),
                this.toInstanceLanguageString(concept.description, conceptLanguageVersion, chosenForm),
                this.toInstanceLanguageString(concept.additionalDescription, conceptLanguageVersion, chosenForm),
                this.toInstanceLanguageString(concept.exception, conceptLanguageVersion, chosenForm),
                this.toInstanceLanguageString(concept.regulation, conceptLanguageVersion, chosenForm),
                concept.startDate,
                concept.endDate,
                concept.type,
                [...concept.targetAudiences],
                [...concept.themes],
                concept.competentAuthorityLevels,
                concept.competentAuthorities,
                concept.executingAuthorityLevels,
                uniqWith([...concept.executingAuthorities, bestuurseenheid.id], isEqual),
                concept.publicationMedia,
                concept.yourEuropeCategories,
                concept.keywords,
                this.toInstanceRequirements(concept.requirements, conceptLanguageVersion, chosenForm),
                this.toInstanceProcedures(concept.procedures, conceptLanguageVersion, chosenForm),
                this.toInstanceWebsites(concept.websites, conceptLanguageVersion, chosenForm),
                this.toInstanceCosts(concept.costs, conceptLanguageVersion, chosenForm),
                this.toInstanceFinancialAdvantages(concept.financialAdvantages, conceptLanguageVersion, chosenForm),
                [],
                concept.id,
                concept.latestConceptSnapshot,
                concept.productId,
                [],
                now,
                now,
                InstanceStatusType.ONTWERP,
                undefined,
                undefined,
                bestuurseenheid.spatials,
                concept.legalResources,
            );

        await this._instanceRepository.save(bestuurseenheid, newInstance);
        await this._conceptDisplayConfigurationRepository.removeConceptIsNewFlagAndSetInstantiatedFlag(bestuurseenheid, concept.id);

        return newInstance;
    }

    private toInstanceRequirements(conceptRequirements: Requirement[], conceptLanguageVersion: Language, chosenForm: ChosenFormType | undefined): Requirement[] {
        return conceptRequirements.map(conceptRequirement => {
            const uniqueId = uuid();
            return new RequirementBuilder()
                .withId(RequirementBuilder.buildIri(uniqueId))
                .withUuid(uniqueId)
                .withTitle(this.toInstanceLanguageString(conceptRequirement.title, conceptLanguageVersion, chosenForm))
                .withDescription(this.toInstanceLanguageString(conceptRequirement.description, conceptLanguageVersion, chosenForm))
                .withEvidence(conceptRequirement.evidence ? this.toInstanceEvidence(conceptRequirement.evidence, conceptLanguageVersion, chosenForm) : undefined)
                .withConceptId(conceptRequirement.id)
                .buildForInstance();
        });
    }

    private toInstanceEvidence(conceptEvidence: Evidence, conceptLanguageVersion: Language, chosenForm: ChosenFormType | undefined): Evidence {
        const uniqueId = uuid();
        return new EvidenceBuilder()
            .withId(EvidenceBuilder.buildIri(uniqueId))
            .withUuid(uniqueId)
            .withTitle(this.toInstanceLanguageString(conceptEvidence.title, conceptLanguageVersion, chosenForm))
            .withDescription(this.toInstanceLanguageString(conceptEvidence.description, conceptLanguageVersion, chosenForm))
            .withConceptId(conceptEvidence.id)
            .buildForInstance();
    }

    private toInstanceProcedures(conceptProcedures: Procedure[], conceptLanguageVersion: Language, chosenForm: ChosenFormType | undefined): Procedure[] {
        return conceptProcedures.map(conceptProcedure => {
            const uniqueId = uuid();
            return new ProcedureBuilder()
                .withId(ProcedureBuilder.buildIri(uniqueId))
                .withUuid(uniqueId)
                .withTitle(this.toInstanceLanguageString(conceptProcedure.title, conceptLanguageVersion, chosenForm))
                .withDescription(this.toInstanceLanguageString(conceptProcedure.description, conceptLanguageVersion, chosenForm))
                .withWebsites(this.toInstanceWebsites(conceptProcedure.websites, conceptLanguageVersion, chosenForm))
                .withConceptId(conceptProcedure.id)
                .buildForInstance();
        });
    }

    private toInstanceWebsites(conceptWebsites: Website[], conceptLanguageVersion: Language, chosenForm: ChosenFormType | undefined): Website[] {
        return conceptWebsites.map(conceptWebsite => {
            const uniqueId = uuid();
            return new WebsiteBuilder()
                .withId(WebsiteBuilder.buildIri(uniqueId))
                .withUuid(uniqueId)
                .withTitle(this.toInstanceLanguageString(conceptWebsite.title, conceptLanguageVersion, chosenForm))
                .withDescription(this.toInstanceLanguageString(conceptWebsite.description, conceptLanguageVersion, chosenForm))
                .withUrl(conceptWebsite.url)
                .withConceptId(conceptWebsite.id)
                .buildForInstance();
        });
    }

    private toInstanceCosts(conceptCosts: Cost[], conceptLanguageVersion: Language, chosenForm: ChosenFormType | undefined): Cost[] {
        return conceptCosts.map(conceptCost => {
            const uniqueId = uuid();
            return new CostBuilder()
                .withId(CostBuilder.buildIri(uniqueId))
                .withUuid(uniqueId)
                .withTitle(this.toInstanceLanguageString(conceptCost.title, conceptLanguageVersion, chosenForm))
                .withDescription(this.toInstanceLanguageString(conceptCost.description, conceptLanguageVersion, chosenForm))
                .withConceptId(conceptCost.id)
                .buildForInstance();
        });
    }

    private toInstanceFinancialAdvantages(conceptFinancialAdvantages: FinancialAdvantage[], conceptLanguageVersion: Language, chosenForm: ChosenFormType | undefined): FinancialAdvantage[] {
        return conceptFinancialAdvantages.map(conceptFinancialAdvantage => {
            const uniqueId = uuid();
            return new FinancialAdvantageBuilder()
                .withId(FinancialAdvantageBuilder.buildIri(uniqueId))
                .withUuid(uniqueId)
                .withTitle(this.toInstanceLanguageString(conceptFinancialAdvantage.title, conceptLanguageVersion, chosenForm))
                .withDescription(this.toInstanceLanguageString(conceptFinancialAdvantage.description, conceptLanguageVersion, chosenForm))
                .withConceptId(conceptFinancialAdvantage.id)
                .buildForInstance();
        });
    }

    private toInstanceLanguageString(languageString: LanguageString, selectedLanguage: Language, chosenForm: ChosenFormType | undefined): LanguageString {
        if (languageString === undefined) {
            return undefined;
        }
        const selectedVersion = languageString.getLanguageValue(selectedLanguage);

        return LanguageString.of(
            languageString.en,
            undefined,
            chosenForm === ChosenFormType.FORMAL || chosenForm === undefined ? selectedVersion : undefined,
            chosenForm === ChosenFormType.INFORMAL ? selectedVersion : undefined,
            undefined,
            undefined,
        );
    }

    private selectLanguageVersionForConcept(concept: Concept, chosenForm: ChosenFormType | undefined): Language {
        if (chosenForm === ChosenFormType.INFORMAL) {
            if (concept.conceptNlLanguages.includes(Language.INFORMAL)) {
                return Language.INFORMAL;
            } else if (concept.conceptNlLanguages.includes(Language.GENERATED_INFORMAL)) {
                return Language.GENERATED_INFORMAL;
            } else {
                return Language.NL;
            }
        } else {
            if (concept.conceptNlLanguages.includes(Language.FORMAL)) {
                return Language.FORMAL;
            } else if (concept.conceptNlLanguages.includes(Language.GENERATED_FORMAL) && concept.conceptNlLanguages.includes(Language.INFORMAL)) {
                return Language.GENERATED_FORMAL;
            } else {
                return Language.NL;
            }
        }
    }
}