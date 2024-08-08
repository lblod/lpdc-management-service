import {END2END_TEST_SPARQL_ENDPOINT} from "../test.config";
import {BestuurseenheidSparqlTestRepository} from "../driven/persistence/bestuurseenheid-sparql-test-repository";
import {DirectDatabaseAccess} from "../driven/persistence/direct-database-access";
import {PREFIX, PUBLIC_GRAPH} from "../../config";
import {sparqlEscapeUri} from "mu";
import {Iri} from "../../src/core/domain/shared/iri";
import {
    FormalInformalChoiceSparqlRepository
} from "../../src/driven/persistence/formal-informal-choice-sparql-repository";

describe('Formal Informal Choice Data Integrity Validation', () => {

    const endPoint = END2END_TEST_SPARQL_ENDPOINT; //Note: replace by END2END_TEST_SPARQL_ENDPOINT to verify all

    const bestuurseenheidRepository = new BestuurseenheidSparqlTestRepository(endPoint);
    const formalInformalChoiceRepository = new FormalInformalChoiceSparqlRepository(endPoint);
    const directDatabaseAccess = new DirectDatabaseAccess(endPoint);

    test.skip('Load all formal informal choice; print errors to console.log', async () => {

        const query = `
            ${PREFIX.besluit}
            SELECT ?id WHERE {
                GRAPH ${sparqlEscapeUri(PUBLIC_GRAPH)} {
                    ?id a besluit:Bestuurseenheid .
                }
            }
        `;
        const bestuurseenheidIdsResult = await directDatabaseAccess.list(query);

        console.log(`Verifying Formal Informal Choice for ${bestuurseenheidIdsResult.length} bestuurseenheden`);

        const dataErrors = [];

        const before = new Date().valueOf();
        console.log(new Date().toISOString());

        for (const bestuurseenheidResult of bestuurseenheidIdsResult) {
            try {
                const bestuurseenheidId = new Iri(bestuurseenheidResult['id'].value);
                const bestuurseenheid = await bestuurseenheidRepository.findById(bestuurseenheidId);

                const formalInformalChoice = await formalInformalChoiceRepository.findByBestuurseenheid(bestuurseenheid);
                if(formalInformalChoice) {
                    expect(formalInformalChoice.bestuurseenheidId).toEqual(bestuurseenheid.id);
                }
            } catch (e) {
                console.log(e);
                dataErrors.push(e);
            }
        }

        expect(dataErrors).toEqual([]);

        const totalAverageTime = (new Date().valueOf() - before) / (bestuurseenheidIdsResult.length);
        console.log(`Total average time: ${totalAverageTime} ms`);
    }, 60000 * 15 * 100);

});
