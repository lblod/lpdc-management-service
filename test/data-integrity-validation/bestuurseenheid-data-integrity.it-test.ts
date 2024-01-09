import {END2END_TEST_SPARQL_ENDPOINT} from "../test.config";
import {BestuurseenheidSparqlTestRepository} from "../driven/persistence/bestuurseenheid-sparql-test-repository";
import {DirectDatabaseAccess} from "../driven/persistence/direct-database-access";
import {PREFIX} from "../../config";
import {Iri} from "../../src/core/domain/shared/iri";

describe('Bestuurseenheid Data Integrity Validation', () => {

    const endPoint = END2END_TEST_SPARQL_ENDPOINT; //Note: replace by END2END_TEST_SPARQL_ENDPOINT to verify all

    const repository = new BestuurseenheidSparqlTestRepository(endPoint);
    const directDatabaseAccess = new DirectDatabaseAccess(endPoint);

    test.skip('Load all bestuurseenheden; print errors to console.log', async () => {

        const query = `
            ${PREFIX.besluit}
            SELECT ?id WHERE {
                GRAPH <http://mu.semte.ch/graphs/public> {
                    ?id a besluit:Bestuurseenheid .
                }
            }
        `;
        const bestuurseenheidIds = await directDatabaseAccess.list(query);

        console.log(`Verifying ${bestuurseenheidIds.length} bestuurseenheden`);

        const dataErrors = [];

        for (const result of bestuurseenheidIds) {
            try {
                const id = new Iri(result['id'].value);
                const bestuursEenheidForId = await repository.findById(id);
                expect(bestuursEenheidForId.id).toEqual(id);
            } catch (e) {
                console.log(e);
                dataErrors.push(e);
            }
        }

        expect(dataErrors).toEqual([]);
    });

});