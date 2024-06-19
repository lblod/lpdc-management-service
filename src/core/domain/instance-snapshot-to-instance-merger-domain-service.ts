import {InstanceSnapshotRepository} from "../port/driven/persistence/instance-snapshot-repository";
import {Iri} from "./shared/iri";
import {InstanceRepository} from "../port/driven/persistence/instance-repository";
import {InstanceSnapshot} from "./instance-snapshot";
import {Instance} from "./instance";
import {sparqlEscapeUri} from "../../../mu-helper";
import {Bestuurseenheid} from "./bestuurseenheid";
import {InstancePublicationStatusType, InstanceStatusType} from "./types";
import {FormatPreservingDate} from "./format-preserving-date";
import {ConceptRepository} from "../port/driven/persistence/concept-repository";
import {Concept} from "./concept";
import {Logger} from "../../../platform/logger";
import {
    ConceptDisplayConfigurationRepository
} from "../port/driven/persistence/concept-display-configuration-repository";
import {
    EnsureLinkedAuthoritiesExistAsCodeListDomainService
} from "./ensure-linked-authorities-exist-as-code-list-domain-service";
import {DeleteInstanceDomainService} from "./delete-instance-domain-service";
import {lastPartAfter} from "./shared/string-helper";
import {
    InstanceSnapshotProcessingAuthorizationRepository
} from "../port/driven/persistence/instance-snapshot-processing-authorization-repository";
import {ForbiddenError} from "./shared/lpdc-error";

export class InstanceSnapshotToInstanceMergerDomainService {
    private readonly _instanceSnapshotRepository: InstanceSnapshotRepository;
    private readonly _instanceRepository: InstanceRepository;
    private readonly _conceptRepository: ConceptRepository;
    private readonly _conceptDisplayConfigurationRepository: ConceptDisplayConfigurationRepository;
    private readonly _deleteInstanceDomainService: DeleteInstanceDomainService;
    private readonly _ensureLinkedAuthoritiesExistAsCodeListDomainService: EnsureLinkedAuthoritiesExistAsCodeListDomainService;
    private readonly _instanceSnapshotProcessingAuthorizationRepository: InstanceSnapshotProcessingAuthorizationRepository;
    private readonly _logger: Logger = new Logger('InstanceSnapshotToInstanceMergerDomainService');

    constructor(
        instanceSnapshotRepository: InstanceSnapshotRepository,
        instanceRepository: InstanceRepository,
        conceptRepository: ConceptRepository,
        conceptDisplayConfigurationRepository: ConceptDisplayConfigurationRepository,
        deleteInstanceDomainService: DeleteInstanceDomainService,
        ensureLinkedAuthoritiesExistAsCodeListDomainService: EnsureLinkedAuthoritiesExistAsCodeListDomainService,
        instanceSnapshotProcessingAuthorizationRepository: InstanceSnapshotProcessingAuthorizationRepository,
        logger?: Logger) {
        this._instanceSnapshotRepository = instanceSnapshotRepository;
        this._instanceRepository = instanceRepository;
        this._conceptRepository = conceptRepository;
        this._conceptDisplayConfigurationRepository = conceptDisplayConfigurationRepository;
        this._deleteInstanceDomainService = deleteInstanceDomainService;
        this._ensureLinkedAuthoritiesExistAsCodeListDomainService = ensureLinkedAuthoritiesExistAsCodeListDomainService;
        this._instanceSnapshotProcessingAuthorizationRepository = instanceSnapshotProcessingAuthorizationRepository;
        this._logger = logger ?? this._logger;
    }

    async merge(bestuurseenheid: Bestuurseenheid, instanceSnapshotGraph: Iri, instanceSnapshotId: Iri) {

        if (!await this._instanceSnapshotProcessingAuthorizationRepository.canPublishInstanceToGraph(bestuurseenheid, instanceSnapshotGraph)) {
            throw new ForbiddenError(`Bestuur ${sparqlEscapeUri(bestuurseenheid.id)} niet toegelaten voor instance snapshot graph ${sparqlEscapeUri(instanceSnapshotGraph)}.`);
        }

        const instanceSnapshot = await this._instanceSnapshotRepository.findById(instanceSnapshotGraph, instanceSnapshotId);

        const hasNewerProcessedInstanceSnapshot = await this._instanceSnapshotRepository.hasNewerProcessedInstanceSnapshot(instanceSnapshotGraph, instanceSnapshot);

        if (hasNewerProcessedInstanceSnapshot) {
            this._logger.log(`The versioned resource <${instanceSnapshotId}> is an older version, or already processed, of service <${instanceSnapshot.isVersionOfInstance}>`);
        } else {
            const instanceId = instanceSnapshot.isVersionOfInstance;
            const isExistingInstance = await this._instanceRepository.exists(bestuurseenheid, instanceId);
            const concept: Concept | undefined = await this.getConceptIfSpecified(instanceSnapshot.conceptId);

            this._logger.log(`New versioned resource found: ${instanceSnapshotId} of service ${instanceSnapshot.isVersionOfInstance}`);

            if (!isExistingInstance && !instanceSnapshot.isArchived) {
                await this.createNewInstance(bestuurseenheid, instanceSnapshot, concept);
            } else if (isExistingInstance && !instanceSnapshot.isArchived) {
                const oldInstance = await this._instanceRepository.findById(bestuurseenheid, instanceSnapshot.isVersionOfInstance);
                await this.updateInstance(bestuurseenheid, instanceSnapshot, oldInstance, concept);

            } else if (isExistingInstance && instanceSnapshot.isArchived) {
                await this._deleteInstanceDomainService.delete(bestuurseenheid, instanceSnapshot.isVersionOfInstance);
            }
        }
        await this._ensureLinkedAuthoritiesExistAsCodeListDomainService.ensureLinkedAuthoritiesExistAsCodeList([...instanceSnapshot.competentAuthorities, ...instanceSnapshot.executingAuthorities]);
    }

    private async updateInstance(bestuurseenheid: Bestuurseenheid, instanceSnapshot: InstanceSnapshot, oldInstance: Instance, concept: Concept) {
        const newInstance = this.asMergedInstance(bestuurseenheid, instanceSnapshot, oldInstance, concept);
        await this._instanceRepository.update(bestuurseenheid, newInstance, oldInstance.dateModified);

        if (oldInstance.conceptId) {
            await this._conceptDisplayConfigurationRepository.syncInstantiatedFlag(bestuurseenheid, oldInstance.conceptId);
        }
        if (instanceSnapshot.conceptId) {
            await this._conceptDisplayConfigurationRepository.syncInstantiatedFlag(bestuurseenheid, instanceSnapshot.conceptId);
        }
    }

    private async createNewInstance(bestuurseenheid: Bestuurseenheid, instanceSnapshot: InstanceSnapshot, concept: Concept | undefined) {
        const instance = this.asNewInstance(bestuurseenheid, instanceSnapshot, concept);
        const isDeleted = await this._instanceRepository.isDeleted(bestuurseenheid, instance.id);

        isDeleted ? await this._instanceRepository.recreate(bestuurseenheid, instance) : await this._instanceRepository.save(bestuurseenheid, instance);

        if (instanceSnapshot.conceptId) {
            await this._conceptDisplayConfigurationRepository.syncInstantiatedFlag(bestuurseenheid, instanceSnapshot.conceptId);
        }
    }

    private asNewInstance(bestuurseenheid: Bestuurseenheid, instanceSnapshot: InstanceSnapshot, concept: Concept | undefined) {
        const instance = new Instance(
            instanceSnapshot.isVersionOfInstance,
            lastPartAfter(instanceSnapshot.isVersionOfInstance.value, '/'),
            bestuurseenheid.id,
            instanceSnapshot.title,
            instanceSnapshot.description,
            instanceSnapshot.additionalDescription,
            instanceSnapshot.exception,
            instanceSnapshot.regulation,
            instanceSnapshot.startDate,
            instanceSnapshot.endDate,
            instanceSnapshot.type,
            instanceSnapshot.targetAudiences,
            instanceSnapshot.themes,
            instanceSnapshot.competentAuthorityLevels,
            instanceSnapshot.competentAuthorities,
            instanceSnapshot.executingAuthorityLevels,
            instanceSnapshot.executingAuthorities,
            instanceSnapshot.publicationMedia,
            instanceSnapshot.yourEuropeCategories,
            instanceSnapshot.keywords,
            instanceSnapshot.requirements.map(req => req.transformWithNewId()),
            instanceSnapshot.procedures.map(proc => proc.transformWithNewId()),
            instanceSnapshot.websites.map(ws => ws.transformWithNewId()),
            instanceSnapshot.costs.map(c => c.transformWithNewId()),
            instanceSnapshot.financialAdvantages.map(fa => fa.transformWithNewId()),
            instanceSnapshot.contactPoints.map(cp => cp.transformWithNewId()),
            concept?.id,
            concept?.latestConceptSnapshot,
            concept?.productId,
            instanceSnapshot.languages,
            instanceSnapshot.dutchLanguageVariant,
            false,
            instanceSnapshot.dateCreated,
            instanceSnapshot.dateModified,
            FormatPreservingDate.now(),
            undefined,
            InstanceStatusType.VERZONDEN,
            undefined,
            undefined,
            instanceSnapshot.spatials,
            instanceSnapshot.legalResources.map(lr => lr.transformWithNewId()),
            false,
            undefined,
        );
        instance.validateForPublish(false);
        return instance;
    }

    private asMergedInstance(bestuurseenheid: Bestuurseenheid, instanceSnapshot: InstanceSnapshot, instance: Instance, concept: Concept | undefined) {
        const mergedInstance = new Instance(
            instanceSnapshot.isVersionOfInstance,
            instance.uuid,
            bestuurseenheid.id,
            instanceSnapshot.title,
            instanceSnapshot.description,
            instanceSnapshot.additionalDescription,
            instanceSnapshot.exception,
            instanceSnapshot.regulation,
            instanceSnapshot.startDate,
            instanceSnapshot.endDate,
            instanceSnapshot.type,
            instanceSnapshot.targetAudiences,
            instanceSnapshot.themes,
            instanceSnapshot.competentAuthorityLevels,
            instanceSnapshot.competentAuthorities,
            instanceSnapshot.executingAuthorityLevels,
            instanceSnapshot.executingAuthorities,
            instanceSnapshot.publicationMedia,
            instanceSnapshot.yourEuropeCategories,
            instanceSnapshot.keywords,
            instanceSnapshot.requirements.map(req => req.transformWithNewId()),
            instanceSnapshot.procedures.map(proc => proc.transformWithNewId()),
            instanceSnapshot.websites.map(ws => ws.transformWithNewId()),
            instanceSnapshot.costs.map(c => c.transformWithNewId()),
            instanceSnapshot.financialAdvantages.map(fa => fa.transformWithNewId()),
            instanceSnapshot.contactPoints.map(cp => cp.transformWithNewId()),
            concept?.id,
            concept?.latestConceptSnapshot,
            concept?.productId,
            instanceSnapshot.languages,
            instanceSnapshot.dutchLanguageVariant,
            false,
            instanceSnapshot.dateCreated,
            instanceSnapshot.dateModified,
            FormatPreservingDate.now(),
            instance.datePublished,
            InstanceStatusType.VERZONDEN,
            undefined,
            instance.datePublished ? InstancePublicationStatusType.TE_HERPUBLICEREN : undefined,
            instanceSnapshot.spatials,
            instanceSnapshot.legalResources.map(lr => lr.transformWithNewId()),
            false,
            undefined,
        );
        mergedInstance.validateForPublish(false);
        return mergedInstance;
    }

    private async getConceptIfSpecified(conceptId: Iri | undefined): Promise<Concept | undefined> {
        if (conceptId) {
            return await this._conceptRepository.findById(conceptId);
        }
        return undefined;
    }
}
