import { Iri } from "../../../domain/shared/iri";
import { Bestuurseenheid } from "../../../domain/bestuurseenheid";

export interface NotificationPreferenceRepository {
  removeNotificationInstanceLink(
    bestuurseenheid: Bestuurseenheid,
    instanceId: Iri,
  );
}
