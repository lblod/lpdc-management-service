import { Iri } from "../../../domain/shared/iri";
import { Bestuurseenheid } from "../../../domain/bestuurseenheid";

export interface NotificationPreferenceRepository {
  removeNotificationInstance(bestuurseenheid: Bestuurseenheid, instanceId: Iri)
}
