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

  const query = [];

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
  {
    uri: "http://data.lblod.info/id/bestuurseenheden/201519f35e14c5f67d0ae819831be4ad60bbb87fea40dab4ca5ea4eae018b4a7",
    keepMunicipalityMergerInstances: false,
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
