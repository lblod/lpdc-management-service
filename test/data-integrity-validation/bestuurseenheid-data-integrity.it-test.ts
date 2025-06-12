import { END2END_TEST_SPARQL_ENDPOINT } from "../test.config";
import { BestuurseenheidSparqlTestRepository } from "../driven/persistence/bestuurseenheid-sparql-test-repository";
import { DirectDatabaseAccess } from "../driven/persistence/direct-database-access";
import { PREFIX, PUBLIC_GRAPH } from "../../config";
import { Iri } from "../../src/core/domain/shared/iri";
import { sparqlEscapeUri } from "../../mu-helper";

describe("Bestuurseenheid Data Integrity Validation", () => {
  const endPoint = END2END_TEST_SPARQL_ENDPOINT; //Note: replace by END2END_TEST_SPARQL_ENDPOINT to verify all

  const repository = new BestuurseenheidSparqlTestRepository(endPoint);
  const directDatabaseAccess = new DirectDatabaseAccess(endPoint);

  test.skip(
    "Load all bestuurseenheden; print errors to console.log",
    async () => {
      const query = `
            ${PREFIX.besluit}
            SELECT ?id WHERE {
                GRAPH ${sparqlEscapeUri(PUBLIC_GRAPH)} {
                    ?id a besluit:Bestuurseenheid .
                }
            }
        `;
      const bestuurseenheidIds = await directDatabaseAccess.list(query);

      console.log(`Verifying ${bestuurseenheidIds.length} bestuurseenheden`);

      const dataErrors = [];

      for (const result of bestuurseenheidIds) {
        try {
          const id = new Iri(result["id"].value);
          const bestuurseenheidForId = await repository.findById(id);
          expect(bestuurseenheidForId.id).toEqual(id);
          expect(bestuurseenheidForId.uuid).toEqual(deriveUuidFromIri(id));
        } catch (e) {
          console.log(e);
          dataErrors.push(e);
        }
      }

      expect(dataErrors).toEqual([]);
    },
    20000 * 10,
  );
});

function deriveUuidFromIri(id: Iri): string {
  const prefix = "http://data.lblod.info/id/bestuurseenheden/";
  const regex = new RegExp(`^${prefix}(.*)$`);

  return id.value.match(regex)[1];
}
