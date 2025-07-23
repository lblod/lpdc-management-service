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
import { buildFilename } from "./util";
import { replace } from "lodash";

const endPoint = process.env.SPARQL_URL;
const args = process.argv.slice(2);
const replaceAuthorities = args.includes("--replace-authorities");
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

const TARGET_DIRECTORY = "./migration-results";

async function generateMigration(
  fromAuthorityId: Iri,
  toAuthorityId: Iri,
  onlyForMunicipalityMergerInstances: boolean,
  copyLocalAuthorities: boolean,
  replaceAuthorities: boolean,
) {
  const insertTriples = [];
  const fromAuthority =
    await bestuurseenheidRepository.findById(fromAuthorityId);
  const toAuthority = await bestuurseenheidRepository.findById(toAuthorityId);

  const domainToQuadsMerger = new DomainToQuadsMapper(toAuthority.userGraph());
  let instanceIds: Iri[] = onlyForMunicipalityMergerInstances
    ? await getAllInstanceIdsWithMunicipalityMergerForBestuurseenheid(
        fromAuthority,
      )
    : await getAllInstanceIdsForBestuurseenheid(fromAuthority);

  if (instanceIds.length > 0) {
    console.log(`Instances to transfer: ${instanceIds.length}`);

    for (const instanceId of instanceIds) {
      const newInstance = await transferInstanceService.transfer(
        instanceId,
        fromAuthority,
        toAuthority,
        copyLocalAuthorities,
        replaceAuthorities,
      );

      const triples = domainToQuadsMerger
        .instanceToQuads(newInstance)
        .map((quad) => quad.toNT())
        .join("\n");
      insertTriples.push(triples);
    }

    console.log(
      `Generating transfer migration from ${fromAuthority.prefLabel} to ${toAuthority.prefLabel}`,
    );

    const filename = buildFilename(
      "transfer-instances",
      fromAuthority.prefLabel,
      toAuthority.prefLabel + "-" + toAuthority.classificatieCode,
    );

    fs.writeFileSync(
      `${TARGET_DIRECTORY}/${filename}.ttl`,
      insertTriples.join("\n"),
    );

    fs.writeFileSync(
      `${TARGET_DIRECTORY}/${filename}.graph`,
      toAuthority.userGraph().toString(),
    );

    console.log(`Instances done: ${insertTriples.length}`);
    console.log(`Wrote transfer migration to ${filename}`);

    // Remove the merger label for all original product instances. Do this for
    // each source authority, irrelevant whether they want to transfer
    // everything or a selection. This prevents that any original products with
    // the merger label remain.
    instanceIds = onlyForMunicipalityMergerInstances
      ? instanceIds
      : await getAllInstanceIdsWithMunicipalityMergerForBestuurseenheid(
          fromAuthority,
        );
    if (instanceIds.length > 0) {
      // Ensure the merger labels on the original product instances are only
      // disabled after these instances were transferred.
      await new Promise((r) => setTimeout(r, 2000));
      disableMergerLabelForOriginalInstances(instanceIds, fromAuthority);
    }
  } else {
    console.log(`No instances found for ${fromAuthority.prefLabel}`);
  }
}

function disableMergerLabelForOriginalInstances(
  instanceIds: Iri[],
  bestuurseenheid: Bestuurseenheid,
) {
  const filename = buildFilename(
    "disable-merger-labels",
    bestuurseenheid.classificatieCode + "-" + bestuurseenheid.prefLabel,
  );

  const mergerLabelPredicate =
    "<https://productencatalogus.data.vlaanderen.be/ns/ipdc-lpdc#forMunicipalityMerger>";

  const deleteTriples = [];
  const insertTriples = [];

  for (const instanceId of instanceIds) {
    deleteTriples.push(
      `${sparqlEscapeUri(instanceId)} ${mergerLabelPredicate} "true"^^<http://www.w3.org/2001/XMLSchema#boolean> .`,
    );
    insertTriples.push(
      `${sparqlEscapeUri(instanceId)} ${mergerLabelPredicate} "false"^^<http://www.w3.org/2001/XMLSchema#boolean> .`,
    );
  }

  const query: string = `
  DELETE DATA {
    GRAPH ${sparqlEscapeUri(bestuurseenheid.userGraph())} {
      ${deleteTriples.join("\n")}
    }
  } INSERT DATA {
    GRAPH ${sparqlEscapeUri(bestuurseenheid.userGraph())} {
      ${insertTriples.join("\n")}
    }
  }
`;

  fs.writeFileSync(`${TARGET_DIRECTORY}/${filename}.sparql`, query);
  console.log(`Wrote disable merger label migration to ${filename}`);
}

async function getAllInstanceIdsForBestuurseenheid(
  bestuurseenheid: Bestuurseenheid,
): Promise<Iri[]> {
  const query = `
            ${PREFIX.lpdcExt}
            SELECT DISTINCT ?id WHERE {
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
            SELECT DISTINCT ?id WHERE {
                GRAPH ${sparqlEscapeUri(bestuurseenheid.userGraph())} {
                    ?id a lpdcExt:InstancePublicService .
                    ?id lpdcExt:forMunicipalityMerger """true"""^^<http://www.w3.org/2001/XMLSchema#boolean>
                }
            }
            `;
  const instanceIds = await directDatabaseAccess.list(query);
  return instanceIds.map((instanceId) => new Iri(instanceId["id"].value));
}

type Configuration = {
  fromAuthority: string; // URI of the administrative unit to transfer from
  toAuthority: string; // URI of the administrative unit to transfer to
  // Optional boolean to indicate whether only product instances with the merger
  // label should be transferred.
  onlyMunicipalityMergerInstances?: boolean;
};

// Configurations for 2025 municipality mergers
const transferConfiguration: Configuration[] = [
  {
    fromAuthority:
      "http://data.lblod.info/id/bestuurseenheden/201519f35e14c5f67d0ae819831be4ad60bbb87fea40dab4ca5ea4eae018b4a7",
    toAuthority:
      "http://data.lblod.info/id/bestuurseenheden/54c9a2a4a577fc2f6888bdf2b43d439ae59ae26a3db344546c7a713f2aab2bce",
  },
];

// const transferConfiguration: Configuration[] = [
//   {
//     fromAuthority: "",
//     toAuthority: "",
//     onlyMunicipalityMergerInstances: true,
//   },
// ];

for (const conf of transferConfiguration) {
  generateMigration(
    new Iri(conf.fromAuthority),
    new Iri(conf.toAuthority),
    conf.onlyMunicipalityMergerInstances
      ? conf.onlyMunicipalityMergerInstances
      : false,
    true, // Update local authorities using migration later
    replaceAuthorities,
  );
}
