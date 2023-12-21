import {TEST_SPARQL_ENDPOINT} from "../test.config";
import {DirectDatabaseAccess} from "../driven/persistence/direct-database-access";
import {PREFIX} from "../../config";
import {ConceptVersieSparqlTestRepository} from "../driven/persistence/concept-versie-sparql-test-repository";

describe('Concept Versie Data Integrity Validation', () => {

    const endPoint = TEST_SPARQL_ENDPOINT; //Note: replace by END2END_TEST_SPARQL_ENDPOINT to verify all

    const repository = new ConceptVersieSparqlTestRepository(endPoint);
    const directDatabaseAccess = new DirectDatabaseAccess(endPoint);

    test('Load all concept versies; print errors to console.log', async () => {

        const query = `
             ${PREFIX.lpdcExt}
            SELECT ?id WHERE {
                GRAPH <http://mu.semte.ch/graphs/lpdc/ldes-data> {
                    ?id a lpdcExt:ConceptualPublicService .
                }
            }
        `;
        const conceptVersieIds = await directDatabaseAccess.queryList(query);

        console.log(`Verifying ${conceptVersieIds.length} concept versies`);

        for (const result of conceptVersieIds) {
            try {
                const id = result['id'].value;
                const conceptVersieForId = await repository.findById(id);
                expect(conceptVersieForId.id).toEqual(id);
            } catch (e) {
                console.log(e);
            }
        }
    });

});