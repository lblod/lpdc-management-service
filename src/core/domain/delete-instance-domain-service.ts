import { InstanceRepository } from "../port/driven/persistence/instance-repository";
import { ConceptDisplayConfigurationRepository } from "../port/driven/persistence/concept-display-configuration-repository";
import { NotificationPreferenceRepository } from "../port/driven/persistence/notification-preference-repository";
import { Bestuurseenheid } from "./bestuurseenheid";
import { Iri } from "./shared/iri";
import { FormatPreservingDate } from "./format-preserving-date";

export class DeleteInstanceDomainService {
  private readonly _instanceRepository: InstanceRepository;
  private readonly _conceptDisplayConfigurationRepository: ConceptDisplayConfigurationRepository;
  private readonly _notificationPreferenceRepository: NotificationPreferenceRepository;

  constructor(
    instanceRepository: InstanceRepository,
    conceptDisplayConfigurationRepository: ConceptDisplayConfigurationRepository,
    notificationPreferenceRepository: NotificationPreferenceRepository,
  ) {
    this._instanceRepository = instanceRepository;
    this._conceptDisplayConfigurationRepository =
      conceptDisplayConfigurationRepository;
    this._notificationPreferenceRepository = notificationPreferenceRepository;
  }

  public async delete(
    bestuurseenheid: Bestuurseenheid,
    instanceId: Iri,
    deletionTime?: FormatPreservingDate,
  ): Promise<Iri | undefined> {
    const instance = await this._instanceRepository.findById(
      bestuurseenheid,
      instanceId,
    );
    const tombstoneIdOrUndefined = await this._instanceRepository.delete(
      bestuurseenheid,
      instance.id,
      deletionTime,
    );

    if (instance.conceptId !== undefined) {
      await this._conceptDisplayConfigurationRepository.syncInstantiatedFlag(
        bestuurseenheid,
        instance.conceptId,
      );
    }

    // Cleanup all notificationPreference links to the instance
    await this._notificationPreferenceRepository.removeNotificationInstance(
      bestuurseenheid,
      instance.id,
    );
    return tombstoneIdOrUndefined;
  }
}
