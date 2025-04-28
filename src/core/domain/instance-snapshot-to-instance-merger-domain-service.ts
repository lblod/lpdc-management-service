import { InstanceSnapshotRepository } from "../port/driven/persistence/instance-snapshot-repository";
import { Iri } from "./shared/iri";
import { InstanceRepository } from "../port/driven/persistence/instance-repository";
import { InstanceSnapshot } from "./instance-snapshot";
import { Instance } from "./instance";
import { sparqlEscapeUri } from "../../../mu-helper";
import { Bestuurseenheid } from "./bestuurseenheid";
import { InstanceStatusType } from "./types";
import { ConceptRepository } from "../port/driven/persistence/concept-repository";
import { Concept } from "./concept";
import { Logger } from "../../../platform/logger";
import { ConceptDisplayConfigurationRepository } from "../port/driven/persistence/concept-display-configuration-repository";
import { EnsureLinkedAuthoritiesExistAsCodeListDomainService } from "./ensure-linked-authorities-exist-as-code-list-domain-service";
import { DeleteInstanceDomainService } from "./delete-instance-domain-service";
import { lastPartAfter } from "./shared/string-helper";
import { InstanceSnapshotProcessingAuthorizationRepository } from "../port/driven/persistence/instance-snapshot-processing-authorization-repository";
import {
  ForbiddenError,
  InstanceSnapshotValidationError,
  NotFoundError,
} from "./shared/lpdc-error";
import { BestuurseenheidRepository } from "../port/driven/persistence/bestuurseenheid-repository";
import { VersionedLdesSnapshot } from "./versioned-ldes-snapshot";
import { SnapshotType } from "../port/driven/persistence/versioned-ldes-snapshot-repository";
import { SpatialRepository } from "../port/driven/persistence/spatial-repository";
import {
  CodeRepository,
  CodeSchema,
} from "../port/driven/persistence/code-repository";
import { Spatial } from "./spatial";
import { Person } from './person';

const VALIDATION_ERROR_MESSAGE_PREFIX = (snapshot: Iri) =>
  `De instantiesnapshot ${snapshot.value}`;

export const UNKNOWN_CREATOR_ERROR_MESSAGE = (snapshot: Iri, creator: Iri) =>
  `${VALIDATION_ERROR_MESSAGE_PREFIX(snapshot)} mag niet aangemaakt zijn door een onbestaand bestuur: ${creator.value}`;

export const INACTIVE_CREATOR_ERROR_MESSAGE = (snapshot: Iri, creator: Iri) =>
  `${VALIDATION_ERROR_MESSAGE_PREFIX(snapshot)} mag niet aangemaakt zijn door een inactief bestuur: ${creator.value}`;

export const UNKNOWN_CONCEPT_ERROR_MESSAGE = (snapshot: Iri, concept: Iri) =>
  `${VALIDATION_ERROR_MESSAGE_PREFIX(snapshot)} is gelinkt aan een onbekend concept: ${concept.value}`;

export const INVALID_AUTHORITY_ERROR_MESSAGE = (
  snapshot: Iri,
  authority: Iri,
) =>
  `${VALIDATION_ERROR_MESSAGE_PREFIX(snapshot)} is gelinkt met een ongeldig bevoegd of uitvoerend bestuur: ${authority.value}`;

export const INACTIVE_AUTHORITY_ERROR_MESSAGE = (
  snapshot: Iri,
  authority: Iri,
) =>
  `${VALIDATION_ERROR_MESSAGE_PREFIX(snapshot)} is gelinkt met een inactief bevoegd of uitvoerend bestuur: ${authority.value}`;

export const EXPIRED_SPATIAL_ERROR_MESSAGE = (snapshot: Iri, spatials: Iri[]) =>
  `${VALIDATION_ERROR_MESSAGE_PREFIX(snapshot)} is gelinkt aan inactieve geografische toepassingsgebieden: ${spatials}`;

export interface NewerProcessedSnapshotPredicate {
  hasNewerProcessedSnapshot(
    snapshotGraph: Iri,
    snapshot: VersionedLdesSnapshot,
    snapshotType: SnapshotType,
  ): Promise<boolean>;
}

export class InstanceSnapshotToInstanceMergerDomainService {
  private readonly _instanceSnapshotRepository: InstanceSnapshotRepository;
  private readonly _instanceRepository: InstanceRepository;
  private readonly _conceptRepository: ConceptRepository;
  private readonly _conceptDisplayConfigurationRepository: ConceptDisplayConfigurationRepository;
  private readonly _deleteInstanceDomainService: DeleteInstanceDomainService;
  private readonly _ensureLinkedAuthoritiesExistAsCodeListDomainService: EnsureLinkedAuthoritiesExistAsCodeListDomainService;
  private readonly _instanceSnapshotProcessingAuthorizationRepository: InstanceSnapshotProcessingAuthorizationRepository;
  private readonly _bestuurseenheidRepository: BestuurseenheidRepository;
  private readonly _spatialRepository: SpatialRepository;
  private readonly _codeRepository: CodeRepository;
  private readonly _logger: Logger = new Logger(
    "InstanceSnapshotToInstanceMergerDomainService",
  );

  constructor(
    instanceSnapshotRepository: InstanceSnapshotRepository,
    instanceRepository: InstanceRepository,
    conceptRepository: ConceptRepository,
    conceptDisplayConfigurationRepository: ConceptDisplayConfigurationRepository,
    deleteInstanceDomainService: DeleteInstanceDomainService,
    ensureLinkedAuthoritiesExistAsCodeListDomainService: EnsureLinkedAuthoritiesExistAsCodeListDomainService,
    instanceSnapshotProcessingAuthorizationRepository: InstanceSnapshotProcessingAuthorizationRepository,
    bestuurseenheidRepository: BestuurseenheidRepository,
    spatialRepository: SpatialRepository,
    codeRepository: CodeRepository,
    logger?: Logger,
  ) {
    this._instanceSnapshotRepository = instanceSnapshotRepository;
    this._instanceRepository = instanceRepository;
    this._conceptRepository = conceptRepository;
    this._conceptDisplayConfigurationRepository =
      conceptDisplayConfigurationRepository;
    this._deleteInstanceDomainService = deleteInstanceDomainService;
    this._ensureLinkedAuthoritiesExistAsCodeListDomainService =
      ensureLinkedAuthoritiesExistAsCodeListDomainService;
    this._instanceSnapshotProcessingAuthorizationRepository =
      instanceSnapshotProcessingAuthorizationRepository;
    this._bestuurseenheidRepository = bestuurseenheidRepository;
    this._spatialRepository = spatialRepository;
    this._codeRepository = codeRepository;
    this._logger = logger ?? this._logger;
  }

  async merge(
    instanceSnapshotGraph: Iri,
    instanceSnapshotId: Iri,
    newProcessedSnapshotPredicate: NewerProcessedSnapshotPredicate,
  ) {
    const instanceSnapshot = await this._instanceSnapshotRepository.findById(
      instanceSnapshotGraph,
      instanceSnapshotId,
    );
    const bestuurseenheid =
      await this.getCreatingOrganization(instanceSnapshot);

    await this.validateLinkedConcept(instanceSnapshot);

    const unknownAuthorities = await this.validateAuthorities(instanceSnapshot);

    await this.validateSpatials(instanceSnapshot);

    if (
      !(await this._instanceSnapshotProcessingAuthorizationRepository.canPublishInstanceToGraph(
        bestuurseenheid,
        instanceSnapshotGraph,
      ))
    ) {
      throw new ForbiddenError(
        `Bestuur ${sparqlEscapeUri(bestuurseenheid.id)} niet toegelaten voor instance snapshot graph ${sparqlEscapeUri(instanceSnapshotGraph)}.`,
      );
    }

    if (
      await newProcessedSnapshotPredicate.hasNewerProcessedSnapshot(
        instanceSnapshotGraph,
        instanceSnapshot,
        SnapshotType.INSTANCE_SNAPSHOT,
      )
    ) {
      this._logger.log(
        `The versioned resource <${instanceSnapshotId}> is an older version, or already processed, of service <${instanceSnapshot.isVersionOf}>`,
      );
    } else {
      const instanceId = instanceSnapshot.isVersionOf;
      const isExistingInstance = await this._instanceRepository.exists(
        bestuurseenheid,
        instanceId,
      );

      const concept: Concept | undefined = await this.getConceptIfSpecified(
        instanceSnapshot.conceptId,
      );

      this._logger.log(
        `New versioned resource found: ${instanceSnapshotId} of service ${instanceSnapshot.isVersionOf}`,
      );

      if (!isExistingInstance && !instanceSnapshot.isArchived) {
        await this.createNewInstance(
          bestuurseenheid,
          instanceSnapshot,
          concept,
        );
      } else if (isExistingInstance && !instanceSnapshot.isArchived) {
        const oldInstance = await this._instanceRepository.findById(
          bestuurseenheid,
          instanceSnapshot.isVersionOf,
        );
        await this.updateInstance(
          bestuurseenheid,
          instanceSnapshot,
          oldInstance,
          concept,
        );
      } else if (isExistingInstance && instanceSnapshot.isArchived) {
        await this._deleteInstanceDomainService.delete(
          bestuurseenheid,
          instanceSnapshot.isVersionOf,
          instanceSnapshot.generatedAtTime,
        );
      }
    }

    if (unknownAuthorities.length > 0) {
      await this._ensureLinkedAuthoritiesExistAsCodeListDomainService.addAuthoritiesToCodeList(
        unknownAuthorities,
      );
    }
  }

  private async getCreatingOrganization(instanceSnapshot: InstanceSnapshot) {
    let bestuurseenheid: Bestuurseenheid;
    try {
      bestuurseenheid = await this._bestuurseenheidRepository.findById(
        instanceSnapshot.createdBy,
      );
    } catch (e) {
      if (e instanceof NotFoundError) {
        throw new InstanceSnapshotValidationError(
          UNKNOWN_CREATOR_ERROR_MESSAGE(
            instanceSnapshot.id,
            instanceSnapshot.createdBy,
          ),
        );
      } else {
        throw e;
      }
    }

    if (bestuurseenheid && !bestuurseenheid.isActive) {
      throw new InstanceSnapshotValidationError(
        INACTIVE_CREATOR_ERROR_MESSAGE(instanceSnapshot.id, bestuurseenheid.id),
      );
    }

    return bestuurseenheid;
  }

  private async validateLinkedConcept(instanceSnapshot: InstanceSnapshot) {
    if (
      instanceSnapshot.conceptId &&
      !(await this._conceptRepository.exists(instanceSnapshot.conceptId))
    ) {
      throw new InstanceSnapshotValidationError(
        UNKNOWN_CONCEPT_ERROR_MESSAGE(
          instanceSnapshot.id,
          instanceSnapshot.conceptId,
        ),
      );
    }
  }

  private collectAuthorityUris(instanceSnapshot: InstanceSnapshot) {
    return [
      ...new Set(
        instanceSnapshot.competentAuthorities.concat(
          instanceSnapshot.executingAuthorities,
        ),
      ),
    ];
  }

  private async validateKnownAuthority(
    instanceSnapshot: InstanceSnapshot,
    authority: Iri,
  ) {
    if (authority.isAdministrativeUnitIri) {
      try {
        const unit = await this._bestuurseenheidRepository.findById(authority);

        if (!unit.isValidAuthority) {
          throw new InstanceSnapshotValidationError(
            INACTIVE_AUTHORITY_ERROR_MESSAGE(instanceSnapshot.id, authority),
          );
        }
      } catch (e) {
        if (e instanceof NotFoundError) {
          throw new InstanceSnapshotValidationError(
            INVALID_AUTHORITY_ERROR_MESSAGE(instanceSnapshot.id, authority),
          );
        } else {
          throw e;
        }
      }
    }
  }

  private async validateAuthorities(instanceSnapshot: InstanceSnapshot) {
    const authorities = this.collectAuthorityUris(instanceSnapshot);

    const unknownAuthorities = [];

    for (const authority of authorities) {
      if (!authority.isValidAuthorityIri) {
        throw new InstanceSnapshotValidationError(
          INVALID_AUTHORITY_ERROR_MESSAGE(instanceSnapshot.id, authority),
        );
      }

      const isKnownAuthority = await this._codeRepository.exists(
        CodeSchema.IPDCOrganisaties,
        authority,
      );

      if (isKnownAuthority) {
        await this.validateKnownAuthority(instanceSnapshot, authority);
      } else {
        const fetchedResult =
          await this._ensureLinkedAuthoritiesExistAsCodeListDomainService.getLinkedAuthority(
            authority,
          );

        if (fetchedResult.uri && fetchedResult.prefLabel) {
          unknownAuthorities.push(fetchedResult);
        } else {
          throw new InstanceSnapshotValidationError(
            INVALID_AUTHORITY_ERROR_MESSAGE(instanceSnapshot.id, authority),
          );
        }
      }
    }

    return unknownAuthorities;
  }

  private async validateSpatials(instanceSnapshot: InstanceSnapshot) {
    let spatials: Spatial[];
    try {
      spatials = await Promise.all(
        instanceSnapshot.spatials.flatMap((iri) =>
          this._spatialRepository.findById(iri),
        ),
      );
    } catch (e) {
      if (e instanceof NotFoundError) {
        throw new InstanceSnapshotValidationError(e.message);
      } else {
        throw e;
      }
    }

    const expiredSpatialIris = spatials
      .filter((spatial) => spatial.isExpired)
      .flatMap((spatial) => spatial.id);

    if (expiredSpatialIris.length > 0) {
      throw new InstanceSnapshotValidationError(
        EXPIRED_SPATIAL_ERROR_MESSAGE(instanceSnapshot.id, expiredSpatialIris),
      );
    }
  }

  private async updateInstance(
    bestuurseenheid: Bestuurseenheid,
    instanceSnapshot: InstanceSnapshot,
    oldInstance: Instance,
    concept: Concept,
  ) {
    const updatedInstance = this.asMergedInstance(
      bestuurseenheid,
      instanceSnapshot,
      oldInstance,
      concept,
    );
    await this._instanceRepository.update(
      bestuurseenheid,
      null, //not relevant here?
      updatedInstance,
      oldInstance.dateModified,
      true,
    );

    if (oldInstance.conceptId) {
      await this._conceptDisplayConfigurationRepository.syncInstantiatedFlag(
        bestuurseenheid,
        oldInstance.conceptId,
      );
    }
    if (instanceSnapshot.conceptId) {
      await this._conceptDisplayConfigurationRepository.syncInstantiatedFlag(
        bestuurseenheid,
        instanceSnapshot.conceptId,
      );
    }
  }

  private async createNewInstance(
    bestuurseenheid: Bestuurseenheid,
    instanceSnapshot: InstanceSnapshot,
    concept: Concept | undefined,
  ) {
    const instance = this.asNewInstance(
      bestuurseenheid,
      instanceSnapshot,
      concept,
    );
    await this._instanceRepository.save(bestuurseenheid, instance);

    if (instanceSnapshot.conceptId) {
      await this._conceptDisplayConfigurationRepository.syncInstantiatedFlag(
        bestuurseenheid,
        instanceSnapshot.conceptId,
      );
    }
  }

  private asNewInstance(
    bestuurseenheid: Bestuurseenheid,
    instanceSnapshot: InstanceSnapshot,
    concept: Concept | undefined,
  ) {
    const instance = new Instance(
      instanceSnapshot.isVersionOf,
      lastPartAfter(instanceSnapshot.isVersionOf.value, "/"),
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
      instanceSnapshot.requirements.map((req) => req.transformWithNewId()),
      instanceSnapshot.procedures.map((proc) => proc.transformWithNewId()),
      instanceSnapshot.websites.map((ws) => ws.transformWithNewId()),
      instanceSnapshot.costs.map((c) => c.transformWithNewId()),
      instanceSnapshot.financialAdvantages.map((fa) => fa.transformWithNewId()),
      instanceSnapshot.contactPoints.map((cp) => cp.transformWithNewId()),
      concept?.id,
      concept?.latestConceptSnapshot,
      concept?.productId,
      instanceSnapshot.languages,
      instanceSnapshot.dutchLanguageVariant,
      false,
      instanceSnapshot.dateCreated,
      instanceSnapshot.dateModified,
      null,
      null,
      instanceSnapshot.generatedAtTime,
      InstanceStatusType.VERZONDEN,
      undefined,
      instanceSnapshot.spatials,
      instanceSnapshot.legalResources.map((lr) => lr.transformWithNewId()),
      false,
      undefined,
    );
    instance.validateForPublish(false);
    return instance;
  }

  private asMergedInstance(
    bestuurseenheid: Bestuurseenheid,
    instanceSnapshot: InstanceSnapshot,
    instance: Instance,
    concept: Concept | undefined,
  ) {
    const mergedInstance = new Instance(
      instanceSnapshot.isVersionOf,
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
      instanceSnapshot.requirements.map((req) => req.transformWithNewId()),
      instanceSnapshot.procedures.map((proc) => proc.transformWithNewId()),
      instanceSnapshot.websites.map((ws) => ws.transformWithNewId()),
      instanceSnapshot.costs.map((c) => c.transformWithNewId()),
      instanceSnapshot.financialAdvantages.map((fa) => fa.transformWithNewId()),
      instanceSnapshot.contactPoints.map((cp) => cp.transformWithNewId()),
      concept?.id,
      concept?.latestConceptSnapshot,
      concept?.productId,
      instanceSnapshot.languages,
      instanceSnapshot.dutchLanguageVariant,
      false,
      instanceSnapshot.dateCreated,
      instanceSnapshot.dateModified,
      instance.creator,
      instance.lastModifier,
      instanceSnapshot.generatedAtTime,
      InstanceStatusType.VERZONDEN,
      undefined,
      instanceSnapshot.spatials,
      instanceSnapshot.legalResources.map((lr) => lr.transformWithNewId()),
      false,
      undefined,
    );
    mergedInstance.validateForPublish(false);
    return mergedInstance;
  }

  private async getConceptIfSpecified(
    conceptId: Iri | undefined,
  ): Promise<Concept | undefined> {
    if (conceptId) {
      return await this._conceptRepository.findById(conceptId);
    }
    return undefined;
  }
}
