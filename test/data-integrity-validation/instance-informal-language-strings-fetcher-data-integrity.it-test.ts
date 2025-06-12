import { END2END_TEST_SPARQL_ENDPOINT } from "../test.config";
import { DirectDatabaseAccess } from "../driven/persistence/direct-database-access";
import { PREFIX, PUBLIC_GRAPH } from "../../config";
import { sparqlEscapeUri } from "../../mu-helper";
import { BestuurseenheidSparqlTestRepository } from "../driven/persistence/bestuurseenheid-sparql-test-repository";
import { Iri } from "../../src/core/domain/shared/iri";
import { InstanceInformalLanguageStringsFetcherIpdc } from "../../src/driven/external/instance-informal-language-strings-fetcher-ipdc";
import { Bestuurseenheid } from "../../src/core/domain/bestuurseenheid";
import fs from "fs";
import { sortedUniq } from "lodash";
import { Language } from "../../src/core/domain/language";
import { wait } from "ts-retry-promise";
import { InstanceSparqlRepository } from "../../src/driven/persistence/instance-sparql-repository";

const endPoint = END2END_TEST_SPARQL_ENDPOINT;
const directDatabaseAccess = new DirectDatabaseAccess(endPoint);
const bestuurseenheidRepository = new BestuurseenheidSparqlTestRepository(
  endPoint,
);
const instanceRepository = new InstanceSparqlRepository(endPoint);
const ipdcFetcher = new InstanceInformalLanguageStringsFetcherIpdc(
  "https://api.ipdc.vlaanderen.be",
  process.env.IPDC_API_KEY,
);

describe("Instance informal language strings fetcher", () => {
  test.skip(
    "Load all instances; fetch published ones to Ipdc and map to informal",
    async () => {
      const bestuurseenhedenIds: string[] = await getBestuurseenhedenIds();
      let errors: string[] = [];
      let totalInstances = 0;
      let transformedInstances = 0;
      console.log(
        `Total amount of bestuurseenheden: ${bestuurseenhedenIds.length} `,
      );

      if (!fs.existsSync(`/tmp/failing-informals`)) {
        fs.mkdirSync(`/tmp/failing-informals`);
      }

      for (const bestuurseenheidId of bestuurseenhedenIds) {
        const bestuurseenheid: Bestuurseenheid =
          await bestuurseenheidRepository.findById(new Iri(bestuurseenheidId));
        const instanceIds: string[] =
          await getInstancesForBestuurseenheid(bestuurseenheid);
        console.log(
          `Verifying bestuurseenheid ${bestuurseenheidId} with ${instanceIds.length} instances`,
        );

        const instanceErrors = [];
        for (const instanceId of instanceIds) {
          try {
            const instance = await instanceRepository.findById(
              bestuurseenheid,
              new Iri(instanceId),
            );

            if (
              instance.dutchLanguageVariant != Language.INFORMAL &&
              instance.needsConversionFromFormalToInformal &&
              (await instanceRepository.isPublishedToIpdc(
                bestuurseenheid,
                instance,
              ))
            ) {
              transformedInstances += 1;
              await ipdcFetcher.fetchInstanceAndMap(bestuurseenheid, instance);
              await wait(100);
            }
          } catch (e) {
            errors = [
              ...errors,
              `Bestuurseenheid: ${bestuurseenheid.id.value} and instance ${instanceId}`,
            ];
            console.error(e);
            instanceErrors.push(`${e} for instance ${instanceId}`);
          }
        }
        if (instanceErrors.length != 0) {
          fs.writeFileSync(
            `/tmp/failing-informals/${bestuurseenheid.uuid}.txt`,
            sortedUniq(instanceErrors).join("\n"),
          );
        }
        totalInstances += instanceIds.length;
        console.log(`Verified ${totalInstances} instances`);
        console.log(`Transformed ${transformedInstances} instances`);
      }
      expect(errors.length).toEqual(0);
    },
    60000 * 15 * 100 * 10,
  );
});

async function getBestuurseenhedenIds(): Promise<string[]> {
  const query = `
            ${PREFIX.besluit}
            SELECT ?id WHERE {
                GRAPH ${sparqlEscapeUri(PUBLIC_GRAPH)} {
                    ?id a besluit:Bestuurseenheid .
                }
            }
        `;

  const ids = await directDatabaseAccess.list(query);
  return ids.map((id) => id["id"].value);
}

async function getInstancesForBestuurseenheid(
  bestuurseenheid: Bestuurseenheid,
): Promise<string[]> {
  const query = `
            ${PREFIX.lpdcExt}
            SELECT ?id WHERE {
                GRAPH ${sparqlEscapeUri(bestuurseenheid.userGraph())} {
                    ?id a lpdcExt:InstancePublicService .
                }
            }
            `;
  const ids = await directDatabaseAccess.list(query);
  return ids.map((id) => id["id"].value);
}
