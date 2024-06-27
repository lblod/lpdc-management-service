import {v4 as uuid} from 'uuid';
import {ConceptSnapshotRepository} from "../port/driven/persistence/concept-snapshot-repository";
import {ConceptSnapshot} from "./concept-snapshot";
import {Iri} from "./shared/iri";
import {Concept} from "./concept";
import {ConceptRepository} from "../port/driven/persistence/concept-repository";
import {
    ConceptDisplayConfigurationRepository
} from "../port/driven/persistence/concept-display-configuration-repository";
import {isEqual, uniqWith} from "lodash";
import {InstanceRepository} from "../port/driven/persistence/instance-repository";
import {Logger} from "../../../platform/logger";
import {
    EnsureLinkedAuthoritiesExistAsCodeListDomainService
} from "./ensure-linked-authorities-exist-as-code-list-domain-service";

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
        const newConceptSnapshot = await this._conceptSnapshotRepository.findById(conceptSnapshotId);
        const conceptId = newConceptSnapshot.isVersionOf;
        const conceptExists = await this._conceptRepository.exists(conceptId);
        const concept: Concept | undefined = conceptExists ? await this._conceptRepository.findById(conceptId) : undefined;

        const newConceptSnapshotAlreadyLinkedToConcept = concept?.appliedConceptSnapshots.map(iri => iri.value).includes(newConceptSnapshot.id.value);

        if (newConceptSnapshotAlreadyLinkedToConcept) {
            this._logger.log(`The versioned resource <${conceptSnapshotId}> is already processed on service <${conceptId}>`);

            await this._ensureLinkedAuthoritiesExistsAsCodeListDomainService.ensureLinkedAuthoritiesExistAsCodeList([...newConceptSnapshot.competentAuthorities, ...newConceptSnapshot.executingAuthorities]);

            return;
        }

        const isNewerSnapshotThanAllPreviouslyApplied = await this.isNewerSnapshotThanAllPreviouslyApplied(newConceptSnapshot, concept);
        if (conceptExists && !isNewerSnapshotThanAllPreviouslyApplied) {
            this._logger.log(`The versioned resource <${conceptSnapshotId}> is an older version of service <${conceptId}>`);
            const updatedConcept = this.addAsPreviousConceptSnapshot(newConceptSnapshot, concept);
            await this._conceptRepository.update(updatedConcept, concept);

            await this._ensureLinkedAuthoritiesExistsAsCodeListDomainService.ensureLinkedAuthoritiesExistAsCodeList([...newConceptSnapshot.competentAuthorities, ...newConceptSnapshot.executingAuthorities]);

            return;
        }

        this._logger.log(`New versioned resource found: ${conceptSnapshotId} of service ${conceptId}`);

        const currentConceptSnapshotId: Iri | undefined = concept?.latestConceptSnapshot;
        const isConceptSnapshotFunctionallyChanged = await this.isConceptChanged(newConceptSnapshot, currentConceptSnapshotId);

        if (!conceptExists) {
            const newConcept = this.asNewConcept(newConceptSnapshot);
            await this._conceptRepository.save(newConcept);
        } else {
            const updatedConcept = this.asMergedConcept(newConceptSnapshot, concept, isConceptSnapshotFunctionallyChanged);
            await this._conceptRepository.update(updatedConcept, concept);
        }

        await this._instanceRepository.updateReviewStatusesForInstances(conceptId, isConceptSnapshotFunctionallyChanged, newConceptSnapshot.isArchived);

        await this._ensureLinkedAuthoritiesExistsAsCodeListDomainService.ensureLinkedAuthoritiesExistAsCodeList([...newConceptSnapshot.competentAuthorities, ...newConceptSnapshot.executingAuthorities]);

        await this._conceptDisplayConfigurationRepository.ensureConceptDisplayConfigurationsForAllBestuurseenheden(conceptId);
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

    private asNewConcept(conceptSnapshot: ConceptSnapshot,): Concept {
        return new Concept(
            conceptSnapshot.isVersionOf,
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
            conceptSnapshot.requirements.map(req => req.transformWithNewId()),
            conceptSnapshot.procedures.map(proc => proc.transformWithNewId()),
            conceptSnapshot.websites.map(ws => ws.transformWithNewId()),
            conceptSnapshot.costs.map(c => c.transformWithNewId()),
            conceptSnapshot.financialAdvantages.map(fa => fa.transformWithNewId()),
            conceptSnapshot.productId,
            conceptSnapshot.id,
            [],
            conceptSnapshot.id,
            conceptSnapshot.conceptTags,
            conceptSnapshot.isArchived,
            conceptSnapshot.legalResources.map(lr => lr.transformWithNewId()),
        );
    }

    private asMergedConcept(conceptSnapshot: ConceptSnapshot, concept: Concept, isConceptSnapshotFunctionallyChanged: boolean): Concept {
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
            conceptSnapshot.requirements.map(req => req.transformWithNewId()),
            conceptSnapshot.procedures.map(proc => proc.transformWithNewId()),
            conceptSnapshot.websites.map(ws => ws.transformWithNewId()),
            conceptSnapshot.costs.map(c => c.transformWithNewId()),
            conceptSnapshot.financialAdvantages.map(fa => fa.transformWithNewId()),
            conceptSnapshot.productId,
            conceptSnapshot.id,
            concept.appliedConceptSnapshots,
            isConceptSnapshotFunctionallyChanged ? conceptSnapshot.id : concept.latestConceptSnapshot,
            conceptSnapshot.conceptTags,
            conceptSnapshot.isArchived,
            conceptSnapshot.legalResources.map(lr => lr.transformWithNewId()),
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

    private async isConceptChanged(newConceptSnapshot: ConceptSnapshot, currentSnapshotId: Iri): Promise<boolean> {
        if (!currentSnapshotId) {
            return false;
        }

        const currentConceptSnapshot = await this._conceptSnapshotRepository.findById(currentSnapshotId);

        return ConceptSnapshot.isFunctionallyChanged(currentConceptSnapshot, newConceptSnapshot).length != 0;
    }

}
