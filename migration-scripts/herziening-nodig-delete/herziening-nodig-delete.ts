import { DirectDatabaseAccess } from "../../test/driven/persistence/direct-database-access";
import { SparqlQuerying } from "../../src/driven/persistence/sparql-querying";
import { ConceptSnapshot } from "../../src/core/domain/concept-snapshot";
import { ConceptSnapshotSparqlRepository } from "../../src/driven/persistence/concept-snapshot-sparql-repository";
import { Iri } from "../../src/core/domain/shared/iri";
import { PREFIX } from "../../config";
import { sparqlEscapeUri } from "../../mu-helper";

const endPoint = process.env.SPARQL_URL!;

const directDb = new DirectDatabaseAccess(endPoint);
const sparqlQuerying = new SparqlQuerying(endPoint);
const snapshotRepo = new ConceptSnapshotSparqlRepository(endPoint);

async function getAllInstancesWithReviewStatus(): Promise<{ id: Iri; conceptId: Iri; upToDateSnapshotId: Iri }[]> {
  const query = `
    ${PREFIX.lpdcExt}
    ${PREFIX.dct}
    ${PREFIX.ext}

    SELECT ?id ?conceptId ?upToDateSnapshotId WHERE {
      GRAPH ?g {
        ?id a lpdcExt:InstancePublicService ;
            dct:source ?conceptId ;
            ext:reviewStatus ?status ;
            ext:hasVersionedSource ?upToDateSnapshotId .
      }
    }
  `;

  const results = await directDb.list(query);

  return (results as any[]).map(r => ({
    id: new Iri(r.id.value),
    conceptId: new Iri(r.conceptId.value),
    upToDateSnapshotId: new Iri(r.upToDateSnapshotId.value),
  }));
}

async function getLatestSnapshotId(conceptId: Iri): Promise<Iri | undefined> {
  const query = `
    ${PREFIX.lpdcExt}
    ${PREFIX.dct}
    ${PREFIX.prov}

    SELECT ?snapshotId WHERE {
      GRAPH ?g {
        ?snapshotId a lpdcExt:ConceptualPublicServiceSnapshot ;
                    dct:isVersionOf ${sparqlEscapeUri(conceptId)} ;
                    prov:generatedAtTime ?time .
      }
    }
    ORDER BY DESC(?time)
    LIMIT 1
  `;

  const results = await directDb.list(query);
  if ((results as any[]).length === 0) return undefined;
  return new Iri((results as any[])[0].snapshotId.value);
}

async function removeReviewStatus(instanceId: Iri) {
  const query = `
    ${PREFIX.ext}
    ${PREFIX.lpdcExt}

    DELETE {
      GRAPH ?g {
        ${sparqlEscapeUri(instanceId)} ext:reviewStatus ?status.
      }
    }
    WHERE {
      GRAPH ?g {
        ${sparqlEscapeUri(instanceId)} a lpdcExt:InstancePublicService ;
                 ext:reviewStatus ?status .
      }
    }
  `;

  await sparqlQuerying.deleteInsert(query);
}

async function main() {
  const instances = await getAllInstancesWithReviewStatus();

  console.log(`Found ${instances.length} instances with review status`);

  let removed = 0;

  for (const instance of instances) {
    const latestSnapshotId = await getLatestSnapshotId(instance.conceptId);
    if (!latestSnapshotId) {
      console.log(`No latest snapshot found for concept ${instance.conceptId.value}, skipping`);
      continue;
    }

    const upToDateSnapshot = await snapshotRepo.findById(instance.upToDateSnapshotId);
    const latestSnapshot = await snapshotRepo.findById(latestSnapshotId);

    const isArchived = latestSnapshot.isArchived;
    const isFunctionallyChanged = ConceptSnapshot.isFunctionallyChanged(upToDateSnapshot, latestSnapshot).length !== 0;

    if (!isArchived && !isFunctionallyChanged) {
      console.log(`Removing review status from instance ${instance.id.value}`);
      await removeReviewStatus(instance.id);
      removed++;
    }
  }

  console.log(`Done. Removed review status from ${removed} instances.`);
}

main()
  .then(() => process.exit(0))
  .catch(err => {
    console.error(err);
    process.exit(1);
  });