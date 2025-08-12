import { InstanceRepository } from "../port/driven/persistence/instance-repository";
import { ConceptDisplayConfigurationRepository } from "../port/driven/persistence/concept-display-configuration-repository";
import { Instance, InstanceBuilder } from "./instance";
import { Concept } from "./concept";
import { Bestuurseenheid } from "./bestuurseenheid";
import { FormatPreservingDate } from "./format-preserving-date";
import { ConceptRepository } from "../port/driven/persistence/concept-repository";
import { InvariantError } from "./shared/lpdc-error";
import { Iri } from "./shared/iri";

export class LinkConceptToInstanceDomainService {
  private readonly _instanceRepository: InstanceRepository;
  private readonly _conceptRepository: ConceptRepository;
  private readonly _conceptDisplayConfigurationRepository: ConceptDisplayConfigurationRepository;

  constructor(
    instanceRepository: InstanceRepository,
    conceptRepository: ConceptRepository,
    conceptDisplayConfigurationRepository: ConceptDisplayConfigurationRepository,
  ) {
    this._instanceRepository = instanceRepository;
    this._conceptRepository = conceptRepository;
    this._conceptDisplayConfigurationRepository =
      conceptDisplayConfigurationRepository;
  }

  async link(
    bestuurseenheid: Bestuurseenheid,
    user: Iri,
    instance: Instance,
    instanceVersion: FormatPreservingDate,
    concept: Concept,
  ): Promise<void> {
    if (instance.conceptId) {
      throw new InvariantError("Instantie is reeds gekoppeld aan een concept");
    }

    const updatedInstance = InstanceBuilder.from(instance)
      .withConceptId(concept.id)
      .withConceptSnapshotId(concept.latestConceptSnapshot)
      .withProductId(concept.productId)
      .build();

    await this._instanceRepository.update(
      bestuurseenheid,
      user,
      updatedInstance,
      instanceVersion,
    );
    await this._conceptDisplayConfigurationRepository.syncInstantiatedFlag(
      bestuurseenheid,
      concept.id,
    );
  }

  async unlink(
    bestuurseenheid: Bestuurseenheid,
    user: Iri,
    instance: Instance,
    instanceVersion: FormatPreservingDate,
  ): Promise<void> {
    if (!instance.conceptId) {
      return;
    }

    const updatedInstance = InstanceBuilder.from(instance)
      .withConceptId(undefined)
      .withConceptSnapshotId(undefined)
      .withProductId(undefined)
      .withReviewStatus(undefined)
      .build();

    await this._instanceRepository.update(
      bestuurseenheid,
      user,
      updatedInstance,
      instanceVersion,
    );

    await this._conceptDisplayConfigurationRepository.syncInstantiatedFlag(
      bestuurseenheid,
      instance.conceptId,
    );
  }
}
