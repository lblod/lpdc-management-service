import {v4 as uuid} from 'uuid';
import {ConceptSnapshotRepository} from "../port/driven/persistence/concept-snapshot-repository";
import {ConceptSnapshot} from "./concept-snapshot";
import {SnapshotType} from "./types";
import {Iri} from "./shared/iri";
import {Concept} from "./concept";
import {ConceptRepository} from "../port/driven/persistence/concept-repository";
import {Requirement, RequirementBuilder} from "./requirement";
import {Evidence, EvidenceBuilder} from "./evidence";
import {Procedure, ProcedureBuilder} from "./procedure";
import {Website, WebsiteBuilder} from "./website";
import {Cost, CostBuilder} from "./cost";
import {FinancialAdvantage, FinancialAdvantageBuilder} from "./financial-advantage";
import {
    ConceptDisplayConfigurationRepository
} from "../port/driven/persistence/concept-display-configuration-repository";
import {isEqual, uniqWith} from "lodash";
import {InstanceRepository} from "../port/driven/persistence/instance-repository";
import {Logger} from "../../../platform/logger";
import {
    EnsureLinkedAuthoritiesExistAsCodeListDomainService
} from "./ensure-linked-authorities-exist-as-code-list-domain-service";
import {LegalResource, LegalResourceBuilder} from "./legal-resource";

export class ConceptSnapshotToConceptMergerDomainService {

    private readonly _conceptSnapshotRepository: ConceptSnapshotRepository;
    private readonly _conceptRepository: ConceptRepository;
    private readonly _conceptDisplayConfigurationRepository: ConceptDisplayConfigurationRepository;
    private readonly _ensureLinkedAuthoritiesExistsAsCodeListDomainService: EnsureLinkedAuthoritiesExistAsCodeListDomainService;
    private readonly _instanceRepository: InstanceRepository;
    private readonly _logger: Logger = new Logger('ConceptSnapshotToConceptMergerDomainService');

    constructor(
        conceptSnapshotRepository: ConceptSnapshotRepository,
        conceptRepository: ConceptRepository,
        conceptDisplayConfigurationRepository: ConceptDisplayConfigurationRepository,
        ensureLinkedAuthoritiesExistAsCodeListDomainService: EnsureLinkedAuthoritiesExistAsCodeListDomainService,
        instanceRepository: InstanceRepository,
        logger?: Logger) {
        this._conceptSnapshotRepository = conceptSnapshotRepository;
        this._conceptRepository = conceptRepository;
        this._conceptDisplayConfigurationRepository = conceptDisplayConfigurationRepository;
        this._ensureLinkedAuthoritiesExistsAsCodeListDomainService = ensureLinkedAuthoritiesExistAsCodeListDomainService;
        this._instanceRepository = instanceRepository;

        if (logger) {
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
                //TODO LPDC-1002: when doing idempotent implementation, we still need to execute next steps ... (instance review status, ensure concept display configs),
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

            await this._ensureLinkedAuthoritiesExistsAsCodeListDomainService.ensureLinkedAuthoritiesExistAsCodeList([...newConceptSnapshot.competentAuthorities, ...newConceptSnapshot.executingAuthorities]);

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
            this.copyLegalResources(conceptSnapshot.legalResources),
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
            this.copyLegalResources(conceptSnapshot.legalResources),
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
                return Requirement.reconstitute(
                    RequirementBuilder.buildIri(newUuid),
                    newUuid,
                    r.title,
                    r.description,
                    r.order,
                    r.evidence ? this.copyEvidence(r.evidence) : undefined,
                    undefined
                );
            }
        );
    }

    private copyProcedures(procedures: Procedure[]) {
        return procedures.map(p => {
                const newUuid = uuid();
                return Procedure.forConcept(
                    Procedure.reconstitute(
                        ProcedureBuilder.buildIri(newUuid),
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
                return Website.reconstitute(
                    WebsiteBuilder.buildIri(newUuid),
                    newUuid,
                    w.title,
                    w.description,
                    w.order,
                    w.url,
                    undefined);
            }
        );
    }

    private copyCosts(costs: Cost[]) {
        return costs.map(c => {
            const newUuid = uuid();
            return Cost.reconstitute(
                CostBuilder.buildIri(newUuid),
                newUuid,
                c.title,
                c.description,
                c.order,
                undefined);
        });
    }

    private copyFinancialAdvantages(financialAdvantages: FinancialAdvantage[]) {
        return financialAdvantages.map(fa => {
                const newUuid = uuid();
                return FinancialAdvantage.reconstitute(
                    FinancialAdvantageBuilder.buildIri(newUuid),
                    newUuid,
                    fa.title,
                    fa.description,
                    fa.order,
                    undefined);
            }
        );
    }

    private copyEvidence(evidence: Evidence): Evidence {
        const newUuid = uuid();
        return Evidence.reconstitute(
            EvidenceBuilder.buildIri(newUuid),
            newUuid,
            evidence.title,
            evidence.description,
            undefined);
    }

    private copyLegalResources(legalResourceUrls: Iri[]): LegalResource[] {
        return legalResourceUrls.map((lr, index) => {
            const newUuid = uuid();
            return LegalResource.reconstitute(
                LegalResourceBuilder.buildIri(newUuid),
                newUuid,
                lr.value,
                index + 1
            );
        });
    }

    private async isConceptChanged(newConceptSnapshot: ConceptSnapshot, currentSnapshotId: Iri): Promise<boolean> {
        if (!currentSnapshotId) {
            return false;
        }

        const currentConceptSnapshot = await this._conceptSnapshotRepository.findById(currentSnapshotId);

        return ConceptSnapshot.isFunctionallyChanged(currentConceptSnapshot, newConceptSnapshot);
    }

}
