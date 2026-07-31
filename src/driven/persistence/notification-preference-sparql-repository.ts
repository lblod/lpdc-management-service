import { NotificationPreferenceRepository } from "../../core/port/driven/persistence/notification-preference-repository";
import { Iri } from "../../core/domain/shared/iri";
import { SparqlQuerying } from "./sparql-querying";
import { Bestuurseenheid } from "../../core/domain/bestuurseenheid";
import { PREFIX } from "../../../config";
import { sparqlEscapeUri } from "../../../mu-helper";

export class NotificationPreferenceSparqlRepository
  implements NotificationPreferenceRepository
{
  protected readonly querying: SparqlQuerying;

  constructor(endpoint?: string) {
    this.querying = new SparqlQuerying(endpoint);
  }

  async removeNotificationInstance(
    bestuurseenheid: Bestuurseenheid,
    instanceId: Iri,
  ) {
    const query = `
        ${PREFIX.lpdcExt}
        WITH ${sparqlEscapeUri(bestuurseenheid.userGraph())}
        DELETE {
          ?preference lpdcExt:notificationInstance ${sparqlEscapeUri(instanceId.value)} .
        }
        WHERE {
          ?preference a lpdcExt:NotificationPreference ;
                      lpdcExt:notificationInstance ${sparqlEscapeUri(instanceId.value)} .
        }`;

    await this.querying.delete(query);
  }
}
