import { DirectDatabaseAccess } from "../../test/driven/persistence/direct-database-access";
import { PREFIX } from "../../config";
import { sparqlEscapeUri } from "../../mu-helper";
import { Bestuurseenheid } from "../../src/core/domain/bestuurseenheid";
import { Iri } from "../../src/core/domain/shared/iri";
import { InstanceSparqlRepository } from "../../src/driven/persistence/instance-sparql-repository";
import fs from "fs";
import { BestuurseenheidSparqlRepository } from "../../src/driven/persistence/bestuurseenheid-sparql-repository";
import { DomainToQuadsMapper } from "../../src/driven/persistence/domain-to-quads-mapper";
import { FormalInformalChoiceSparqlRepository } from "../../src/driven/persistence/formal-informal-choice-sparql-repository";
import { TransferInstanceService } from "./transfer-instance-service";
import { AdressenRegisterFetcher } from "../../src/driven/external/adressen-register-fetcher";

const endPoint = process.env.SPARQL_URL;
const directDatabaseAccess = new DirectDatabaseAccess(endPoint);
const bestuurseenheidRepository = new BestuurseenheidSparqlRepository(endPoint);
const instanceRepository = new InstanceSparqlRepository(endPoint);
const formalInformalChoiceRepository = new FormalInformalChoiceSparqlRepository(
  endPoint,
);
const adressenRegister = new AdressenRegisterFetcher();

const transferInstanceService = new TransferInstanceService(
  bestuurseenheidRepository,
  instanceRepository,
  formalInformalChoiceRepository,
  adressenRegister,
);

async function main(
  fromAuthorityId: Iri,
  toAuthorityId: Iri,
  onlyForMunicipalityMergerInstances: boolean,
) {
  const insertQuads = [];
  const fromAuthority =
    await bestuurseenheidRepository.findById(fromAuthorityId);
  const toAuthority = await bestuurseenheidRepository.findById(toAuthorityId);
  const domainToQuadsMerger = new DomainToQuadsMapper(toAuthority.userGraph());

  const instanceIds: Iri[] = onlyForMunicipalityMergerInstances
    ? await getAllInstanceIdsWithMunicipalityMergerForBestuurseenheid(
        fromAuthority,
      )
    : await getAllInstanceIdsForBestuurseenheid(fromAuthority);

  console.log(`Instances to transfer: ${instanceIds.length}`);
  for (const instanceId of instanceIds) {
    const newInstance = await transferInstanceService.transfer(
      instanceId,
      fromAuthority,
      toAuthority,
    );

    const quads = domainToQuadsMerger
      .instanceToQuads(newInstance)
      .map((quad) => quad.toCanonical())
      .join("\n");
    insertQuads.push(quads);
  }
  fs.writeFileSync(
    `./migration-results/transfer-instances.ttl`,
    insertQuads.join("\n"),
  );
  console.log(`Instances done: ${insertQuads.length}`);
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

async function getAllInstanceIdsWithMunicipalityMergerForBestuurseenheid(
  bestuurseenheid: Bestuurseenheid,
): Promise<Iri[]> {
  const query = `
            ${PREFIX.lpdcExt}
            SELECT ?id WHERE {
                GRAPH ${sparqlEscapeUri(bestuurseenheid.userGraph())} {
                    ?id a lpdcExt:InstancePublicService .
                    ?id lpdcExt:forMunicipalityMerger """true"""^^<http://www.w3.org/2001/XMLSchema#boolean>
                }
            }
            `;
  const instanceIds = await directDatabaseAccess.list(query);
  return instanceIds.map((instanceId) => new Iri(instanceId["id"].value));
}

const fromAuthority = new Iri("");
const toAuthority = new Iri("");
const onlyForMunicipalityMergerInstances: boolean = true;

main(fromAuthority, toAuthority, onlyForMunicipalityMergerInstances);
