import { TEST_SPARQL_ENDPOINT } from "../../test.config";
import { DirectDatabaseAccess } from "./direct-database-access";
import { aBestuurseenheid } from "../../core/domain/bestuurseenheid-test-builder";
import { buildPersonIri } from "../../core/domain/iri-test-builder";
import { uuid, sparqlEscapeUri } from "../../../mu-helper";
import { PREFIX } from "../../../config";
import { InstanceBuilder } from "../../../src/core/domain/instance";
import { NotificationPreferenceSparqlRepository } from "../../../src/driven/persistence/notification-preference-sparql-repository";
import { Iri } from "../../../src/core/domain/shared/iri";
import { Bestuurseenheid } from "../../../src/core/domain/bestuurseenheid";

describe("NotificationPreferenceRepository", () => {
  const repository = new NotificationPreferenceSparqlRepository(
    TEST_SPARQL_ENDPOINT,
  );
  const directDatabaseAccess = new DirectDatabaseAccess(TEST_SPARQL_ENDPOINT);

  const buildNotificationPreferenceIri = (uniqueId: string): Iri =>
    new Iri(`http://data.lblod.info/id/notification-preference/${uniqueId}`);

  async function insertNotificationPreference(
    bestuurseenheid: Bestuurseenheid,
    preferenceIri: Iri,
    persoonId: Iri,
    notificationsEnabled: string,
  ): Promise<void> {
    await directDatabaseAccess.insertData(
      bestuurseenheid.userGraph().value,
      [
        `${sparqlEscapeUri(preferenceIri)} a lpdcExt:NotificationPreference`,
        `${sparqlEscapeUri(preferenceIri)} dct:creator ${sparqlEscapeUri(persoonId.value)}`,
        `${sparqlEscapeUri(preferenceIri)} lpdcExt:notificationsEnabled ${notificationsEnabled}`,
      ],
      [PREFIX.lpdcExt, PREFIX.dct, PREFIX.xsd],
    );
  }

  async function findNotificationInstanceLink(
    bestuurseenheid: Bestuurseenheid,
    instanceId: Iri,
  ): Promise<unknown[]> {
    const query = `
        ${PREFIX.lpdcExt}
        SELECT ?preference WHERE {
            GRAPH ${sparqlEscapeUri(bestuurseenheid.userGraph())} {
                ?preference lpdcExt:notificationInstance ${sparqlEscapeUri(instanceId.value)} .
            }
        }
    `;
    return directDatabaseAccess.list(query);
  }

  describe("addNotificationInstanceLink", () => {
    test("When user has a notificationPreference with notifications enabled, the instance is automatically subscribed", async () => {
      const bestuurseenheid = aBestuurseenheid().build();
      const persoonId = buildPersonIri(uuid());
      const instanceId = InstanceBuilder.buildIri(uuid());
      const preferenceIri = buildNotificationPreferenceIri(uuid());

      await insertNotificationPreference(
        bestuurseenheid,
        preferenceIri,
        persoonId,
        '"true"^^xsd:boolean',
      );

      await repository.addNotificationInstanceLink(
        bestuurseenheid,
        persoonId,
        instanceId,
      );

      const result = await findNotificationInstanceLink(
        bestuurseenheid,
        instanceId,
      );
      expect(result).toHaveLength(1);
      expect(result[0]["preference"].value).toEqual(preferenceIri.value);
    });

    test("When user has a notificationPreference with notifications disabled, the instance is not subscribed and no error is thrown", async () => {
      const bestuurseenheid = aBestuurseenheid().build();
      const persoonId = buildPersonIri(uuid());
      const instanceId = InstanceBuilder.buildIri(uuid());
      const preferenceIri = buildNotificationPreferenceIri(uuid());

      await insertNotificationPreference(
        bestuurseenheid,
        preferenceIri,
        persoonId,
        '"false"^^xsd:boolean',
      );

      await expect(
        repository.addNotificationInstanceLink(
          bestuurseenheid,
          persoonId,
          instanceId,
        ),
      ).resolves.toBeUndefined();

      const result = await findNotificationInstanceLink(
        bestuurseenheid,
        instanceId,
      );
      expect(result).toHaveLength(0);
    });

    test("When user has no notificationPreference, the instance is not subscribed and no error is thrown", async () => {
      const bestuurseenheid = aBestuurseenheid().build();
      const persoonId = buildPersonIri(uuid());
      const instanceId = InstanceBuilder.buildIri(uuid());

      await expect(
        repository.addNotificationInstanceLink(
          bestuurseenheid,
          persoonId,
          instanceId,
        ),
      ).resolves.toBeUndefined();

      const result = await findNotificationInstanceLink(
        bestuurseenheid,
        instanceId,
      );
      expect(result).toHaveLength(0);
    });
  });
});
