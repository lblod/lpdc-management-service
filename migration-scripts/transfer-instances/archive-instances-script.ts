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

const endPoint = process.env.SPARQL_URL;

const directDatabaseAccess = new DirectDatabaseAccess(endPoint);
const bestuurseenheidRepository = new BestuurseenheidSparqlRepository(endPoint);
const instanceRepository = new InstanceSparqlRepository(endPoint);

async function main(bestuurseenheidId: Iri) {
  const insertTriples = [];
  const deleteTriples = [];
  const bestuurseenheid =
    await bestuurseenheidRepository.findById(bestuurseenheidId);

  const domainToQuadsMerger = new DomainToQuadsMapper(
    bestuurseenheid.userGraph(),
  );

  const instanceIds: Iri[] =
    await getAllInstanceIdsForBestuurseenheid(bestuurseenheid);

  console.log(`Instances to archive: ${instanceIds.length}`);
  for (const instanceId of instanceIds) {
    const instance = await instanceRepository.findById(
      bestuurseenheid,
      instanceId,
    );

    if (instance.dateSent !== undefined) {
      const triples = tombstoneQuads(instance.id.value);
      insertTriples.push(triples);
    }

    const triplesToDelete = domainToQuadsMerger
      .instanceToQuads(instance)
      .map((quad) => quad.toNT())
      .join("\n");
    deleteTriples.push(triplesToDelete);
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
  const query = `
        WITH ${sparqlEscapeUri(bestuurseenheid.userGraph())}
        DELETE {
            ${deleteTriples.join("\n")}
        }
        INSERT {
            ${insertTriples.join("\n")}
        }
        WHERE {
        }
        `;

  fs.writeFileSync(`./migration-results/archive-instances.sparql`, query);
}

const bestuurseenheid = new Iri("");

main(bestuurseenheid);
