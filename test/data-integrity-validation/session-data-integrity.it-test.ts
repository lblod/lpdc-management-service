import { SessionSparqlRepository } from "../../src/driven/persistence/session-sparql-repository";
import { Iri } from "../../src/core/domain/shared/iri";
import { USER_SESSIONS_GRAPH } from "../../config";
import { sparqlEscapeUri } from "../../mu-helper";
import { DirectDatabaseAccess } from "../driven/persistence/direct-database-access";
import { END2END_TEST_SPARQL_ENDPOINT } from "../test.config";

const endPoint = END2END_TEST_SPARQL_ENDPOINT; //Note: replace by END2END_TEST_SPARQL_ENDPOINT to verify all
const sessionRepository = new SessionSparqlRepository(endPoint);
const directDatabaseAccess = new DirectDatabaseAccess(endPoint);

describe("Session data integrity test", () => {
  test.skip(
    "verify all sessions can be fetched",
    async () => {
      const allSessionIds = await findSessionIds();
      console.log(`${allSessionIds.length} sessions found`);
      for (const sessionId of allSessionIds) {
        try {
          const session = await sessionRepository.findById(sessionId);
          expect(session).toBeDefined();
        } catch (e) {
          console.log(sessionId);
          throw e;
        }
      }
    },
    60000 * 10,
  );
});

async function findSessionIds(): Promise<Iri[]> {
  const query = `
            SELECT ?id WHERE {
                GRAPH ${sparqlEscapeUri(USER_SESSIONS_GRAPH)} {
                    ?id <http://mu.semte.ch/vocabularies/session/account> ?account.
                    ?id <http://mu.semte.ch/vocabularies/ext/sessionGroup> ?sessionGroup.
                }
            }
        `;
  const result = await directDatabaseAccess.list(query);
  return result.map((result) => new Iri(result["id"].value));
}
