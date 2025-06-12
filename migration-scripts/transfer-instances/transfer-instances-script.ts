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

const TARGET_DIRECTORY = "./migration-results";

async function generateMigration(
  fromAuthorityId: Iri,
  toAuthorityId: Iri,
  onlyForMunicipalityMergerInstances: boolean,
  copyLocalAuthorities: boolean,
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
  // Antwerpen -> Antwerpen
  // Requested to transfer *no* product instances
  // Borsbeek -> Antwerpen
  // Requested to transfer *no* product instances

  // Beveren -> Beveren-Kruibeke-Zwijndrecht
  // Requested to transfer *no* product instances
  // Kruibeke -> Beveren-Kruibeke-Zwijndrecht
  // Requested to transfer *no* product instances
  // Zwijndrecht -> Beveren-Kruibeke-Zwijndrecht
  // Requested to transfer *selected* product instances
  {
    fromAuthority:
      "http://data.lblod.info/id/bestuurseenheden/c362abc58ac4579ff417824ce620962ac57bc344b34fe8f51d21b35ef54da36d",
    toAuthority:
      "http://data.lblod.info/id/bestuurseenheden/19483103-318e-435a-aa37-45e485406ee9",
    onlyMunicipalityMergerInstances: true,
  },

  // Bilzen -> Bilzen
  // Requested to transfer *all* product instances
  {
    fromAuthority:
      "http://data.lblod.info/id/bestuurseenheden/99da98a7a0087d3429b084ebfc4eb5d488c593790d4d5af7253982a2e21a6a5f",
    toAuthority:
      "http://data.lblod.info/id/bestuurseenheden/99da98a7a0087d3429b084ebfc4eb5d488c593790d4d5af7253982a2e21a6a5f",
  },
  // Hoeselt -> Bilzen
  // Requested to transfer *no* product instances

  // Borgloon -> Tongeren
  // Requested to transfer *all* product instances
  {
    fromAuthority:
      "http://data.lblod.info/id/bestuurseenheden/05441122597e0b20b61a8968ea1247c07f9014aad1f1f0709d0b1234e3dfbc2f",
    toAuthority:
      "http://data.lblod.info/id/bestuurseenheden/104f32d7fb8d4b8b61b71717301656f136fe046eabaf126fb3325896b5c2d625",
  },
  // Tongeren -> Tongeren
  // Requested to transfer *all* product instances
  {
    fromAuthority:
      "http://data.lblod.info/id/bestuurseenheden/104f32d7fb8d4b8b61b71717301656f136fe046eabaf126fb3325896b5c2d625",
    toAuthority:
      "http://data.lblod.info/id/bestuurseenheden/104f32d7fb8d4b8b61b71717301656f136fe046eabaf126fb3325896b5c2d625",
  },

  // De Pinte -> Nazareth-De Pinte
  // Requested to transfer *no* product instances
  // Nazareth -> Nazareth-De Pinte
  // Requested to transfer *selected* product instances
  {
    fromAuthority:
      "http://data.lblod.info/id/bestuurseenheden/0327a51548f73607f8a5ec11b36711a3c96703686ad93a3d632718c135c295db",
    toAuthority:
      "http://data.lblod.info/id/bestuurseenheden/1ca65d65-54ff-4b44-b750-bd70c91191af",
    onlyMunicipalityMergerInstances: true,
  },

  // Galmaarden -> Pajottegem
  // Requested to transfer *no* product instances
  // Gooik -> Pajottegem
  // Requested to transfer *no* product instances
  // Herne -> Pajottegem
  // Requested to transfer *no* product instances

  // Ham -> Tessenderlo-Ham
  // Requested to transfer *no* product instances
  // Tessenderlo -> Tessenderlo-Ham
  // Requested to transfer *no* product instances

  // Kortessem -> Hasselt
  // Requested to transfer *no* product instances
  // Hasselt -> Hasselt
  // Requested to transfer *all* product instances
  {
    fromAuthority:
      "http://data.lblod.info/id/bestuurseenheden/9db1b46874a57fe63c08fb5f16b117e6f61fdd98e7f64f745d0fceb9d3731169",
    toAuthority:
      "http://data.lblod.info/id/bestuurseenheden/9db1b46874a57fe63c08fb5f16b117e6f61fdd98e7f64f745d0fceb9d3731169",
  },
  // Hasselt (OCMW) -> Hasselt (OCMW)
  // Requested to transfer *all* product instances
  {
    fromAuthority:
      "http://data.lblod.info/id/bestuurseenheden/026509cf3b4eeb7ad88fe57a270060574f60abd1c3524837d36700e40809d210",
    toAuthority:
      "http://data.lblod.info/id/bestuurseenheden/026509cf3b4eeb7ad88fe57a270060574f60abd1c3524837d36700e40809d210",
  },

  // Lochristi -> Lochristi
  // Requested to transfer *selected* product instances
  {
    fromAuthority:
      "http://data.lblod.info/id/bestuurseenheden/2ac1bb2a7d7bbd98e2e7a24be2c67e42171788a71c2436a33060626593bb2f78",
    toAuthority:
      "http://data.lblod.info/id/bestuurseenheden/2ac1bb2a7d7bbd98e2e7a24be2c67e42171788a71c2436a33060626593bb2f78",
    onlyMunicipalityMergerInstances: true,
  },
  // Wachtebeke -> Lochristi
  // Requested to transfer *selected* product instances
  {
    fromAuthority:
      "http://data.lblod.info/id/bestuurseenheden/1313d4a58f9ecf52cc7e274e3549a759b35e731973cc9f5e07562e5650f594dd",
    toAuthority:
      "http://data.lblod.info/id/bestuurseenheden/2ac1bb2a7d7bbd98e2e7a24be2c67e42171788a71c2436a33060626593bb2f78",
    onlyMunicipalityMergerInstances: true,
  },

  // Lokeren -> Lokeren
  // Requested to transfer *all* product instances
  {
    fromAuthority:
      "http://data.lblod.info/id/bestuurseenheden/cb2a6e0a490ee881ddd0d9ded7f2b3d1dc2df7e57a19d014caac054bfa355f5a",
    toAuthority:
      "http://data.lblod.info/id/bestuurseenheden/cb2a6e0a490ee881ddd0d9ded7f2b3d1dc2df7e57a19d014caac054bfa355f5a",
  },
  // Lokeren (OCMW) -> Lokeren (OCMW)
  // Requested to transfer *all* product instances
  {
    fromAuthority:
      "http://data.lblod.info/id/bestuurseenheden/323a24f2fe81ee0b6586ec78be36760e478092e07386b2785992ea8b61941833",
    toAuthority:
      "http://data.lblod.info/id/bestuurseenheden/323a24f2fe81ee0b6586ec78be36760e478092e07386b2785992ea8b61941833",
  },
  // Moerbeke -> Lokeren
  // Requested to transfer *no* product instances

  // Melle -> Merelbeke-Melle
  // Requested to transfer *no* product instances
  // Merelbeke -> Merelbeke-Melle
  // Requested to transfer *selected* product instances
  {
    fromAuthority:
      "http://data.lblod.info/id/bestuurseenheden/8ef1e4a43efd913e6b09b0ddea344b7b5d723a344ad559389a55ae1ff0bebc8f",
    toAuthority:
      "http://data.lblod.info/id/bestuurseenheden/b8bb293d-aa22-4b43-bda4-0b6af76e9493",
    onlyMunicipalityMergerInstances: true,
  },

  // Meulebeke -> Tielt
  // Requested to transfer *all* product instances
  {
    fromAuthority:
      "http://data.lblod.info/id/bestuurseenheden/5a4b2b4f1de1f3b91b0348a7eb6d6aa0ef9420b8ec31374970c9ffe933a79515",
    toAuthority:
      "http://data.lblod.info/id/bestuurseenheden/b36da606fba6dd4dc99ae1ef5f4a52bba3268d33f4bc2cd1e65b87f01f35101a",
  },
  // Tielt -> Tielt
  // Requested to transfer *all* product instances
  {
    fromAuthority:
      "http://data.lblod.info/id/bestuurseenheden/b36da606fba6dd4dc99ae1ef5f4a52bba3268d33f4bc2cd1e65b87f01f35101a",
    toAuthority:
      "http://data.lblod.info/id/bestuurseenheden/b36da606fba6dd4dc99ae1ef5f4a52bba3268d33f4bc2cd1e65b87f01f35101a",
  },

  // Ruiselede -> Wingene
  // Requested to transfer *selected* product instances
  {
    fromAuthority:
      "http://data.lblod.info/id/bestuurseenheden/2564e21e3650f91625189ccb7eb055e47754a0633c54c7582a899171fef60c52",
    toAuthority:
      "http://data.lblod.info/id/bestuurseenheden/99ed6eee81a7aca47517cbffb46eaba38f3987eeb4ad32c020898644769eb615",
    onlyMunicipalityMergerInstances: true,
  },
  // Wingene -> Wingene
  // Requested to transfer *selected* product instances
  {
    fromAuthority:
      "http://data.lblod.info/id/bestuurseenheden/99ed6eee81a7aca47517cbffb46eaba38f3987eeb4ad32c020898644769eb615",
    toAuthority:
      "http://data.lblod.info/id/bestuurseenheden/99ed6eee81a7aca47517cbffb46eaba38f3987eeb4ad32c020898644769eb615",
    onlyMunicipalityMergerInstances: true,
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
  );
}
