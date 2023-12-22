import {TEST_SPARQL_ENDPOINT} from "../test.config";
import {DirectDatabaseAccess} from "../driven/persistence/direct-database-access";
import {PREFIX} from "../../config";
import {ConceptVersieSparqlTestRepository} from "../driven/persistence/concept-versie-sparql-test-repository";

describe('Concept Versie Data Integrity Validation', () => {

    const endPoint = TEST_SPARQL_ENDPOINT; //Note: replace by END2END_TEST_SPARQL_ENDPOINT to verify all

    const repository = new ConceptVersieSparqlTestRepository(endPoint);
    const directDatabaseAccess = new DirectDatabaseAccess(endPoint);

    //TODO LPDC-916: using a story representation for each queried -> verify with all the raw triples, queried directly from the database -> to ascertain we queried all data ...
    //TODO LPDC-916: load data concurrently ... using PromisePool (10 concurrent users, but each of them with a kinda random wait; so to simulate n concurrent users )
    //TODO LPDC-916: load data from ldes stream of production dump and verify results ...

    test('Load all concept versies; print errors to console.log', async () => {
        //do {

            const query = `
             ${PREFIX.lpdcExt}
            SELECT ?id WHERE {
                GRAPH <http://mu.semte.ch/graphs/lpdc/ldes-data> {
                    ?id a lpdcExt:ConceptualPublicService .
                }
            }
        `;
            const conceptVersieIds = await directDatabaseAccess.queryList(query);

            const before = new Date().valueOf();
            const delayTime = 20;

            console.log(new Date().toISOString());

            for (const result of conceptVersieIds) {
                try {
                    const id = result['id'].value;
                    const conceptVersieForId = await repository.findById(id);
                    expect(conceptVersieForId.id).toEqual(id);
                } catch(e) {
                    if(!e.message.startsWith('could not map')) {
                        console.error(e);
                    }
                }
                await wait(delayTime);
            }

            console.log(`Verifying in total ${conceptVersieIds.length} concept versies took on average ${(new Date().valueOf() - before - delayTime * conceptVersieIds.length) / conceptVersieIds.length} ms per concept`);
            // eslint-disable-next-line no-constant-condition
        //} while (true);
    }, 60000 * 5);

    function wait(milliseconds: number) {
        return new Promise(resolve => {
            setTimeout(resolve, milliseconds);
        });
    }


});