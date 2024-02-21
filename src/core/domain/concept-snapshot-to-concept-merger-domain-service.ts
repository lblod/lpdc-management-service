import {v4 as uuid} from 'uuid';
import {ConceptSnapshotRepository} from "../port/driven/persistence/concept-snapshot-repository";
import {ConceptSnapshot} from "./concept-snapshot";
import {SnapshotType} from "./types";
import {Iri} from "./shared/iri";
import {Concept} from "./concept";
import {ConceptRepository} from "../port/driven/persistence/concept-repository";
import {Requirement} from "./requirement";
import {Evidence} from "./evidence";
import {Procedure} from "./procedure";
import {Website} from "./website";
import {Cost} from "./cost";
import {FinancialAdvantage} from "./financial-advantage";
import {
    ConceptDisplayConfigurationRepository
} from "../port/driven/persistence/concept-display-configuration-repository";
import {
    BestuurseenheidRegistrationCodeFetcher
} from "../port/driven/external/bestuurseenheid-registration-code-fetcher";
import {CodeRepository, CodeSchema} from "../port/driven/persistence/code-repository";
import {isEqual, uniqWith} from "lodash";
import {InstanceRepository} from "../port/driven/persistence/instance-repository";
import {Logger} from "../../../platform/logger";

export class ConceptSnapshotToConceptMergerDomainService {

    private readonly _conceptSnapshotRepository: ConceptSnapshotRepository;
    private readonly _conceptRepository: ConceptRepository;
    private readonly _conceptDisplayConfigurationRepository: ConceptDisplayConfigurationRepository;
    private readonly _bestuurseenheidRegistrationCodeFetcher: BestuurseenheidRegistrationCodeFetcher;
    private readonly _codeRepository: CodeRepository;
    private readonly _instanceRepository: InstanceRepository;
    private readonly _logger: Logger = new Logger('ConceptSnapshotToConceptMergerDomainService');

    constructor(
        conceptSnapshotRepository: ConceptSnapshotRepository,
        conceptRepository: ConceptRepository,
        conceptDisplayConfigurationRepository: ConceptDisplayConfigurationRepository,
        bestuurseenheidRegistrationCodeFetcher: BestuurseenheidRegistrationCodeFetcher,
        codeRepository: CodeRepository,
        instanceRepository: InstanceRepository,
        logger?: Logger) {
        this._conceptSnapshotRepository = conceptSnapshotRepository;
        this._conceptRepository = conceptRepository;
        this._conceptDisplayConfigurationRepository = conceptDisplayConfigurationRepository;
        this._bestuurseenheidRegistrationCodeFetcher = bestuurseenheidRegistrationCodeFetcher;
        this._codeRepository = codeRepository;
        this._instanceRepository = instanceRepository;

        if(logger) {
            this._logger = logger;
        }
    }

    async merge(conceptSnapshotId: Iri) {
        try {
            const newConceptSnapshot = await this._conceptSnapshotRepository.findById(conceptSnapshotId);
            const conceptId = newConceptSnapshot.isVersionOfConcept;
            const conceptExists = await this._conceptRepository.exists(conceptId);
            const concept: Concept | undefined = conceptExists ? await this._conceptRepository.findById(conceptId) : undefined;

            const newConceptSnapshotAlreadyLinkedToConcept = concept?.appliedConceptSnapshots.map(iri => iri.value).includes(newConceptSnapshot.id.value);

            if (newConceptSnapshotAlreadyLinkedToConcept) {
                //TODO LPDC-848: when doing idempotent implementation, we still need to execute next steps ... (instance review status, ensure concept display configs),
                this._logger.log(`The versioned resource <${conceptSnapshotId}> is already processed on service <${conceptId}>`);

                return;
            }

            const isNewerSnapshotThanAllPreviouslyApplied = await this.isNewerSnapshotThanAllPreviouslyApplied(newConceptSnapshot, concept);
            if (conceptExists && !isNewerSnapshotThanAllPreviouslyApplied) {
                this._logger.log(`The versioned resource <${conceptSnapshotId}> is an older version of service <${conceptId}>`);
                const updatedConcept = this.addAsPreviousConceptSnapshot(newConceptSnapshot, concept);
                await this._conceptRepository.update(updatedConcept, concept);

                return;
            }

            this._logger.log(`New versioned resource found: ${conceptSnapshotId} of service ${conceptId}`);

            const currentConceptSnapshotId: Iri | undefined = concept?.latestConceptSnapshot;
            const isConceptSnapshotFunctionallyChanged = await this.isConceptChanged(newConceptSnapshot, currentConceptSnapshotId);
            const shouldConceptBeArchived = newConceptSnapshot.snapshotType === SnapshotType.DELETE;

            if (!conceptExists) {
                const newConcept = this.asNewConcept(newConceptSnapshot, shouldConceptBeArchived);
                await this._conceptRepository.save(newConcept);
            } else {
                const updatedConcept = this.asMergedConcept(newConceptSnapshot, concept, isConceptSnapshotFunctionallyChanged, shouldConceptBeArchived);
                await this._conceptRepository.update(updatedConcept, concept);
            }

            await this.ensureLinkedAuthoritiesExistAsCodeList(newConceptSnapshot);

            await this._instanceRepository.updateReviewStatusesForInstances(conceptId, isConceptSnapshotFunctionallyChanged, shouldConceptBeArchived);

            await this._conceptDisplayConfigurationRepository.ensureConceptDisplayConfigurationsForAllBestuurseenheden(conceptId);

        } catch (e) {
            this._logger.error(`Error processing: ${JSON.stringify(conceptSnapshotId)}`, e);
        }
    }

    private async isNewerSnapshotThanAllPreviouslyApplied(conceptSnapshot: ConceptSnapshot, concept: Concept | undefined): Promise<boolean> {
        if (concept) {
            for (const appliedSnapshotId of concept.appliedConceptSnapshots) {
                const alreadyAppliedSnapshot = await this._conceptSnapshotRepository.findById(appliedSnapshotId);
                if (conceptSnapshot.generatedAtTime.before(alreadyAppliedSnapshot.generatedAtTime)) {
                    return false;
                }
            }
        }
        return true;
    }

    private asNewConcept(conceptSnapshot: ConceptSnapshot, shouldConceptBeArchived: boolean): Concept {
        return new Concept(
            conceptSnapshot.isVersionOfConcept,
            uuid(),
            conceptSnapshot.title,
            conceptSnapshot.description,
            conceptSnapshot.additionalDescription,
            conceptSnapshot.exception,
            conceptSnapshot.regulation,
            conceptSnapshot.startDate,
            conceptSnapshot.endDate,
            conceptSnapshot.type,
            conceptSnapshot.targetAudiences,
            conceptSnapshot.themes,
            conceptSnapshot.competentAuthorityLevels,
            conceptSnapshot.competentAuthorities,
            conceptSnapshot.executingAuthorityLevels,
            conceptSnapshot.executingAuthorities,
            conceptSnapshot.publicationMedia,
            conceptSnapshot.yourEuropeCategories,
            conceptSnapshot.keywords,
            this.copyRequirements(conceptSnapshot.requirements),
            this.copyProcedures(conceptSnapshot.procedures),
            this.copyWebsites(conceptSnapshot.websites),
            this.copyCosts(conceptSnapshot.costs),
            this.copyFinancialAdvantages(conceptSnapshot.financialAdvantages),
            conceptSnapshot.productId,
            conceptSnapshot.id,
            [],
            conceptSnapshot.id,
            conceptSnapshot.conceptTags,
            shouldConceptBeArchived,
            conceptSnapshot.legalResources,
        );
    }

    private asMergedConcept(conceptSnapshot: ConceptSnapshot, concept: Concept, isConceptSnapshotFunctionallyChanged: boolean, shouldConceptBeArchived: boolean): Concept {
        return new Concept(
            concept.id,
            concept.uuid,
            conceptSnapshot.title,
            conceptSnapshot.description,
            conceptSnapshot.additionalDescription,
            conceptSnapshot.exception,
            conceptSnapshot.regulation,
            conceptSnapshot.startDate,
            conceptSnapshot.endDate,
            conceptSnapshot.type,
            conceptSnapshot.targetAudiences,
            conceptSnapshot.themes,
            conceptSnapshot.competentAuthorityLevels,
            conceptSnapshot.competentAuthorities,
            conceptSnapshot.executingAuthorityLevels,
            conceptSnapshot.executingAuthorities,
            conceptSnapshot.publicationMedia,
            conceptSnapshot.yourEuropeCategories,
            conceptSnapshot.keywords,
            this.copyRequirements(conceptSnapshot.requirements),
            this.copyProcedures(conceptSnapshot.procedures),
            this.copyWebsites(conceptSnapshot.websites),
            this.copyCosts(conceptSnapshot.costs),
            this.copyFinancialAdvantages(conceptSnapshot.financialAdvantages),
            conceptSnapshot.productId,
            conceptSnapshot.id,
            concept.appliedConceptSnapshots,
            (isConceptSnapshotFunctionallyChanged || shouldConceptBeArchived) ? conceptSnapshot.id : concept.latestConceptSnapshot,
            conceptSnapshot.conceptTags,
            shouldConceptBeArchived,
            conceptSnapshot.legalResources,
        );
    }

    private addAsPreviousConceptSnapshot(conceptSnapshot: ConceptSnapshot, concept: Concept): Concept {
        return new Concept(
            concept.id,
            concept.uuid,
            concept.title,
            concept.description,
            concept.additionalDescription,
            concept.exception,
            concept.regulation,
            concept.startDate,
            concept.endDate,
            concept.type,
            concept.targetAudiences,
            concept.themes,
            concept.competentAuthorityLevels,
            concept.competentAuthorities,
            concept.executingAuthorityLevels,
            concept.executingAuthorities,
            concept.publicationMedia,
            concept.yourEuropeCategories,
            concept.keywords,
            concept.requirements,
            concept.procedures,
            concept.websites,
            concept.costs,
            concept.financialAdvantages,
            concept.productId,
            concept.latestConceptSnapshot,
            uniqWith([...concept.previousConceptSnapshots, conceptSnapshot.id], isEqual),
            concept.latestConceptSnapshot,
            concept.conceptTags,
            concept.isArchived,
            concept.legalResources,
        );
    }

    private copyRequirements(requirements: Requirement[]) {
        return requirements.map(r => {
                const newUuid = uuid();
                return Requirement.forConcept(
                    Requirement.reconstitute(
                        new Iri(`http://data.lblod.info/id/requirement/${newUuid}`),
                        newUuid,
                        r.title,
                        r.description,
                        r.order,
                        r.evidence ? this.copyEvidence(r.evidence) : undefined,
                        undefined
                    )
                );
            }
        );
    }

    private copyProcedures(procedures: Procedure[]) {
        return procedures.map(p => {
                const newUuid = uuid();
                return Procedure.forConcept(
                    Procedure.reconstitute(
                        new Iri(`http://data.lblod.info/id/rule/${newUuid}`),
                        newUuid,
                        p.title,
                        p.description,
                        p.order,
                        this.copyWebsites(p.websites),
                        undefined
                    )
                );
            }
        );
    }

    private copyWebsites(websites: Website[]) {
        return websites.map(w => {
                const newUuid = uuid();
                return Website.forConcept(
                    Website.reconstitute(new Iri(`http://data.lblod.info/id/website/${newUuid}`), newUuid, w.title, w.description, w.order, w.url, undefined)
                );
            }
        );
    }

    private copyCosts(costs: Cost[]) {
        return costs.map(c => {
            const newUuid = uuid();
            return Cost.forConcept(Cost.reconstitute(new Iri(`http://data.lblod.info/id/cost/${newUuid}`), newUuid, c.title, c.description, c.order, undefined));
        });
    }

    private copyFinancialAdvantages(financialAdvantages: FinancialAdvantage[]) {
        return financialAdvantages.map(fa => {
                const newUuid = uuid();
                return FinancialAdvantage.forConcept(
                    FinancialAdvantage.reconstitute(new Iri(`http://data.lblod.info/id/financial-advantage/${newUuid}`), newUuid, fa.title, fa.description, fa.order, undefined)
                );
            }
        );
    }

    private copyEvidence(evidence: Evidence): Evidence {
        const newUuid = uuid();
        return Evidence.forConcept(
            Evidence.reconstitute(new Iri(`http://data.lblod.info/id/evidence/${newUuid}`), newUuid, evidence.title, evidence.description, undefined)
        );
    }

    private async ensureLinkedAuthoritiesExistAsCodeList(conceptSnapshot: ConceptSnapshot): Promise<void> {
        const linkedAuthorities = [...conceptSnapshot.competentAuthorities, ...conceptSnapshot.executingAuthorities];
        for (const code of linkedAuthorities) {
            if (!await this._codeRepository.exists(CodeSchema.IPDCOrganisaties, code)) {
                const codeListData: any = await this._bestuurseenheidRegistrationCodeFetcher.fetchOrgRegistryCodelistEntry(code.value);
                if (codeListData.prefLabel) {
                    this._logger.log(`Inserting new codeList ${code}`);
                    await this.insertCodeListData(codeListData);
                }
            }
        }
    }

    private async insertCodeListData(codeListData: { uri?: Iri, prefLabel?: string }): Promise<void> {
        return this._codeRepository.save(CodeSchema.IPDCOrganisaties, codeListData.uri, codeListData.prefLabel, new Iri('https://wegwijs.vlaanderen.be'));
    }

    private async isConceptChanged(newConceptSnapshot: ConceptSnapshot, currentSnapshotId: Iri): Promise<boolean> {
        if (!currentSnapshotId) {
            return false;
        }

        const currentConceptSnapshot = await this._conceptSnapshotRepository.findById(currentSnapshotId);

        return ConceptSnapshot.isFunctionallyChanged(currentConceptSnapshot, newConceptSnapshot);
    }

}
