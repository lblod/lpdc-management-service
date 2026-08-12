import { Iri } from "../../../domain/shared/iri";
import { Bestuurseenheid } from "../../../domain/bestuurseenheid";

export interface NotificationPreferenceRepository {
  addNotificationInstanceLink(
    bestuurseenheid: Bestuurseenheid,
    persoonId: Iri,
    instanceId: Iri,
  );
  removeNotificationInstanceLink(
    bestuurseenheid: Bestuurseenheid,
    instanceId: Iri,
  );
}
