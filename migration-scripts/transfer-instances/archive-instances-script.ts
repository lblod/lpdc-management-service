import { sparqlEscapeDateTime, sparqlEscapeUri, uuid } from "../../mu-helper";
import { Iri } from "../../src/core/domain/shared/iri";
import { InstanceSparqlRepository } from "../../src/driven/persistence/instance-sparql-repository";
import fs from "fs";
import { BestuurseenheidSparqlRepository } from "../../src/driven/persistence/bestuurseenheid-sparql-repository";
import { DomainToQuadsMapper } from "../../src/driven/persistence/domain-to-quads-mapper";
import { Bestuurseenheid } from "../../src/core/domain/bestuurseenheid";
import { PublishedInstanceSnapshotBuilder } from "../../src/core/domain/published-instance-snapshot";
import { PREFIX } from "../../config";
import { DirectDatabaseAccess } from "../../test/driven/persistence/direct-database-access";
import { buildFilename } from "./util";

const endPoint = process.env.SPARQL_URL;

const directDatabaseAccess = new DirectDatabaseAccess(endPoint);
const bestuurseenheidRepository = new BestuurseenheidSparqlRepository(endPoint);
const instanceRepository = new InstanceSparqlRepository(endPoint);

async function archiveProductInstances(
  bestuurseenheidId: Iri,
  keepMunicipalityMergerInstances: boolean,
) {
  const insertTriples = [];
  const deleteTriples = [];
  const bestuurseenheid =
    await bestuurseenheidRepository.findById(bestuurseenheidId);

  console.log(
    `Generating archive migration for ${bestuurseenheid.prefLabel} (${bestuurseenheid.classificatieCode})`,
  );

  const domainToQuadsMerger = new DomainToQuadsMapper(
    bestuurseenheid.userGraph(),
  );

  const instanceIds: Iri[] = keepMunicipalityMergerInstances
    ? await getAllInstanceIdsWithoutMunicipalityMergerForBestuurseenheid(
        bestuurseenheid,
      )
    : await getAllInstanceIdsForBestuurseenheid(bestuurseenheid);

  console.log(
    `Instances to archive for ${bestuurseenheid.prefLabel} (${bestuurseenheid.classificatieCode}): ${instanceIds.length}`,
  );

  for (const instanceId of instanceIds) {
    const instance = await instanceRepository.findById(
      bestuurseenheid,
      instanceId,
    );

    if (instance.dateSent !== undefined) {
      const instanceTriples = tombstoneQuads(instance.id.value);
      insertTriples.push(instanceTriples);
    }

    const instanceTriplesToDelete = domainToQuadsMerger
      .instanceToQuads(instance)
      .map((quad) => quad.toNT())
      .join("\n");
    deleteTriples.push(instanceTriplesToDelete);
  }

  createSparql(bestuurseenheid, insertTriples, deleteTriples);
}

async function getAllInstanceIdsForBestuurseenheid(
  bestuurseenheid: Bestuurseenheid,
): Promise<Iri[]> {
  const query = `
            ${PREFIX.lpdcExt}
            SELECT ?id WHERE {
                GRAPH ${sparqlEscapeUri(bestuurseenheid.userGraph())} {
                    ?id a lpdcExt:InstancePublicService .
                }
            }
            `;
  const instanceIds = await directDatabaseAccess.list(query);
  return instanceIds.map((instanceId) => new Iri(instanceId["id"].value));
}

async function getAllInstanceIdsWithoutMunicipalityMergerForBestuurseenheid(
  bestuurseenheid: Bestuurseenheid,
): Promise<Iri[]> {
  const query = `
            ${PREFIX.lpdcExt}
            SELECT ?id WHERE {
                GRAPH ${sparqlEscapeUri(bestuurseenheid.userGraph())} {
                    ?id a lpdcExt:InstancePublicService .
                    ?id lpdcExt:forMunicipalityMerger """false"""^^<http://www.w3.org/2001/XMLSchema#boolean>
                }
            }
            `;

  const instanceIds = await directDatabaseAccess.list(query);
  return instanceIds.map((instanceId) => new Iri(instanceId["id"].value));
}

function tombstoneQuads(instanceId: string) {
  const uniqueId = uuid();
  const tombstoneId = PublishedInstanceSnapshotBuilder.buildIri(uniqueId);
  const tombstoneQuads = [];
  const now = new Date();

  tombstoneQuads.push(
    `${sparqlEscapeUri(tombstoneId)} a <https://www.w3.org/ns/activitystreams#Tombstone> .`,
  );
  tombstoneQuads.push(
    `${sparqlEscapeUri(tombstoneId)} <https://www.w3.org/ns/activitystreams#formerType> <https://productencatalogus.data.vlaanderen.be/ns/ipdc-lpdc#InstancePublicService> .`,
  );
  tombstoneQuads.push(
    `${sparqlEscapeUri(tombstoneId)} <https://productencatalogus.data.vlaanderen.be/ns/ipdc-lpdc#isPublishedVersionOf> ${sparqlEscapeUri(instanceId)} .`,
  );
  tombstoneQuads.push(
    `${sparqlEscapeUri(tombstoneId)} <https://www.w3.org/ns/activitystreams#deleted> ${sparqlEscapeDateTime(now)} .`,
  );
  tombstoneQuads.push(
    `${sparqlEscapeUri(tombstoneId)} <http://www.w3.org/ns/prov#generatedAtTime> ${sparqlEscapeDateTime(now)} .`,
  );

  return tombstoneQuads.join(`\n`);
}

function createSparql(
  bestuurseenheid: Bestuurseenheid,
  insertTriples: string[],
  deleteTriples: string[],
) {
  const graphStatement = `GRAPH ${sparqlEscapeUri(bestuurseenheid.userGraph())} {`;
  const deleteHeader = `DELETE DATA {\n  ${graphStatement}`;
  const insertHeader = `INSERT DATA {\n  ${graphStatement}`;

  let query = [];

  // Note: We use separate DELETE (INSERT) queries for each product instance to
  // be removed (tombstoned). Virtuoso can run out of memory when parsing
  // queries with a lot triples, separating into multiple queries avoids this
  // situation. On a local development setup, Virtuoso would crash when deleting
  // the triples for about 60 product instances or more in a single query.
  deleteTriples.forEach((instanceTriples) =>
    query.push(`${deleteHeader}\n${instanceTriples}\n}\n}\n`),
  );

  insertTriples.forEach((instanceTriples) =>
    query.push(`${insertHeader}\n${instanceTriples}\n}\n}\n`),
  );

  const filename = buildFilename(
    "archive-instances",
    bestuurseenheid.prefLabel + "_" + bestuurseenheid.classificatieCode,
  );

  if (deleteTriples.length > 0 || insertTriples.length > 0) {
    fs.writeFileSync(
      `./migration-results/${filename}.sparql`,
      query.join(";\n"),
    );
    console.log(`Wrote migration to ${filename}`);
  } else {
    console.log("No triples to delete or insert, no migration written");
  }
}

// Specify for which administrative unit the product instances should be
// archived
type Configuration = {
  // URI of the administrative unit
  uri: string;
  // An optional boolean to indicate that only product instance that are *not*
  // labelled for merger should be archived
  keepMunicipalityMergerInstances?: boolean;
};

const archiveConfigurations: Configuration[] = [
  // Antwerpen (municipality and OCMW): nothing
  // Borsbeek (municipaity): everything
  {
    uri: "http://data.lblod.info/id/bestuurseenheden/e41ffa04f94bb450a79793020e70d55b5fee5033a5280277998608a9d0913117",
  },

  // Beveren (municipality): everything
  {
    uri: "http://data.lblod.info/id/bestuurseenheden/4f0eb4436c88cf831c35f84e7c34ce32f9ee4e99c5139aff62990e5e531aa1e7",
  },
  // Kruibeke (municipality): everything
  {
    uri: "http://data.lblod.info/id/bestuurseenheden/6af55cecaea3621f53bb32417a36ed6e3d41b2aa5b9f6d62ab3d80cc8ec11539",
  },
  // Zwijndrecht (municipality): everything
  {
    uri: "http://data.lblod.info/id/bestuurseenheden/c362abc58ac4579ff417824ce620962ac57bc344b34fe8f51d21b35ef54da36d",
  },

  // Bilzen-Hoeselt (municipality): selection
  {
    uri: "http://data.lblod.info/id/bestuurseenheden/99da98a7a0087d3429b084ebfc4eb5d488c593790d4d5af7253982a2e21a6a5f",
    keepMunicipalityMergerInstances: true,
  },
  // Hoeselt (municipality): everything
  {
    uri: "http://data.lblod.info/id/bestuurseenheden/a3bd0845853278f478f90b14436d3efa99e73249a84d462f0ddc2e5b6e37a156",
  },

  // Borgloon (municipality): everything
  {
    uri: "http://data.lblod.info/id/bestuurseenheden/05441122597e0b20b61a8968ea1247c07f9014aad1f1f0709d0b1234e3dfbc2f",
  },
  // Tongeren-Borgloon (municipality): selection
  {
    uri: "http://data.lblod.info/id/bestuurseenheden/104f32d7fb8d4b8b61b71717301656f136fe046eabaf126fb3325896b5c2d625",
    keepMunicipalityMergerInstances: true,
  },

  // De Pinte (municipality): everything
  {
    uri: "http://data.lblod.info/id/bestuurseenheden/e39bc997aa6dd9f240277735efd745b6a0422614d2b36cf01825c86b1b91a9ee",
  },
  // Nazareth (municipality): everything
  {
    uri: "http://data.lblod.info/id/bestuurseenheden/0327a51548f73607f8a5ec11b36711a3c96703686ad93a3d632718c135c295db",
  },

  // Galmaarden (municipality): everything
  {
    uri: "http://data.lblod.info/id/bestuurseenheden/00eb231f51bd6b4f5dcc6536b2d09a174ea8583f5bf28b10bc4fc769a07e511d",
  },
  // Gooik (municipality): everything
  {
    uri: "http://data.lblod.info/id/bestuurseenheden/c69192b973a3ca11531b9657b3ee20aa6688fa33ea1ef1392310fec751980ab2",
  },
  // Herne (municipality): everything
  {
    uri: "http://data.lblod.info/id/bestuurseenheden/3eb8c9fae32d02359dcd7b22e2a74e67a5b48388df31ad819c27c688fedd10b0",
  },

  // Tessenderlo-Ham (municipality): nothing
  // Tessenderlo (municipalty): everything
  {
    uri: "http://data.lblod.info/id/bestuurseenheden/af8969752f6b28c66b6bc402d7987fa38774901ac72b95c5cb7976570487c3c9",
  },
  // Tessenderlo (OCMW): everything
  {
    uri: "http://data.lblod.info/id/bestuurseenheden/fb1be873c4b31e391613dfae8e68edd694b1fdf126eeecb502b1e5cad6f2f682",
  },

  // Kortessem (municipality): everything
  {
    uri: "http://data.lblod.info/id/bestuurseenheden/f6b131de5e40a0dfd4fc93fedf3b95c9bf156ece718b87fe00469dea2564b3fb",
  },
  // Hasselt (municipality): selection
  {
    uri: "http://data.lblod.info/id/bestuurseenheden/9db1b46874a57fe63c08fb5f16b117e6f61fdd98e7f64f745d0fceb9d3731169",
    keepMunicipalityMergerInstances: true,
  },
  // Hasselt (OCMW): selection
  {
    uri: "http://data.lblod.info/id/bestuurseenheden/026509cf3b4eeb7ad88fe57a270060574f60abd1c3524837d36700e40809d210",
    keepMunicipalityMergerInstances: true,
  },

  // Lochristi (municipality): selection
  {
    uri: "http://data.lblod.info/id/bestuurseenheden/2ac1bb2a7d7bbd98e2e7a24be2c67e42171788a71c2436a33060626593bb2f78",
    keepMunicipalityMergerInstances: true,
  },
  // Wachtebeke (municipality): everything
  {
    uri: "http://data.lblod.info/id/bestuurseenheden/1313d4a58f9ecf52cc7e274e3549a759b35e731973cc9f5e07562e5650f594dd",
  },

  // Lokeren (municipality): selection
  {
    uri: "http://data.lblod.info/id/bestuurseenheden/cb2a6e0a490ee881ddd0d9ded7f2b3d1dc2df7e57a19d014caac054bfa355f5a",
    keepMunicipalityMergerInstances: true,
  },
  // Lokeren (OCMW): selection
  {
    uri: "http://data.lblod.info/id/bestuurseenheden/323a24f2fe81ee0b6586ec78be36760e478092e07386b2785992ea8b61941833",
    keepMunicipalityMergerInstances: true,
  },
  // Moerbeke (municipality): everything
  {
    uri: "http://data.lblod.info/id/bestuurseenheden/c5dbb08e35e2d090a05d119fef4cc161b5ee1f322698cb8ea3c8c6643a521cf2",
  },

  // Melle (municipality): everything
  {
    uri: "http://data.lblod.info/id/bestuurseenheden/c0b6b5cf198cd939251dff8ed052177cfff245074c6b8d43394c8c97f7b6e945",
  },
  // Melle (OCMW): everything
  {
    uri: "http://data.lblod.info/id/bestuurseenheden/04895013fe6301f32aa46deae98abfb833a717ece5a33b6c453674c6d0f4cc5e",
  },
  // Merelbeke (municipality): everything
  {
    uri: "http://data.lblod.info/id/bestuurseenheden/8ef1e4a43efd913e6b09b0ddea344b7b5d723a344ad559389a55ae1ff0bebc8f",
  },

  // Meulebeke (municipality): everything
  {
    uri: "http://data.lblod.info/id/bestuurseenheden/5a4b2b4f1de1f3b91b0348a7eb6d6aa0ef9420b8ec31374970c9ffe933a79515",
  },
  // Tielt (municipality): selection
  {
    uri: "http://data.lblod.info/id/bestuurseenheden/b36da606fba6dd4dc99ae1ef5f4a52bba3268d33f4bc2cd1e65b87f01f35101a",
    keepMunicipalityMergerInstances: true,
  },

  // Ruiselede (municipality): everything
  {
    uri: "http://data.lblod.info/id/bestuurseenheden/2564e21e3650f91625189ccb7eb055e47754a0633c54c7582a899171fef60c52",
  },
  // Wingene (municipality): selection
  {
    uri: "http://data.lblod.info/id/bestuurseenheden/99ed6eee81a7aca47517cbffb46eaba38f3987eeb4ad32c020898644769eb615",
    keepMunicipalityMergerInstances: true,
  },
];

for (const conf of archiveConfigurations) {
  archiveProductInstances(
    new Iri(conf.uri),
    conf.keepMunicipalityMergerInstances
      ? conf.keepMunicipalityMergerInstances
      : false,
  );
}
