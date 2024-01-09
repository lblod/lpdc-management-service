import {END2END_TEST_SPARQL_ENDPOINT} from "../test.config";
import {BestuurseenheidSparqlTestRepository} from "../driven/persistence/bestuurseenheid-sparql-test-repository";
import {DirectDatabaseAccess} from "../driven/persistence/direct-database-access";
import {CONCEPT_GRAPH, PREFIX} from "../../config";
import {
    ConceptDisplayConfigurationSparqlTestRepository
} from "../driven/persistence/concept-display-configuration-sparql-test-repository";

describe('Concept Display Configuration Data Integrity Validation', () => {

    const endPoint = END2END_TEST_SPARQL_ENDPOINT; //Note: replace by END2END_TEST_SPARQL_ENDPOINT to verify all

    const bestuurseenheidRepository = new BestuurseenheidSparqlTestRepository(endPoint);
    const conceptDisplayConfigurationRepository = new ConceptDisplayConfigurationSparqlTestRepository(endPoint);
    const directDatabaseAccess = new DirectDatabaseAccess(endPoint);

    test.skip('Load all concept display configurations; print errors to console.log', async () => {

        const query = `
            ${PREFIX.besluit}
            SELECT ?id WHERE {
                GRAPH <http://mu.semte.ch/graphs/public> {
                    ?id a besluit:Bestuurseenheid .
                }
            }
        `;
        const bestuurseenheidIdsResult = await directDatabaseAccess.list(query);

        console.log(`Verifying Concept Display Configurations for ${bestuurseenheidIdsResult.length} bestuurseenheden`);

        const conceptIdsQuery = `
            ${PREFIX.lpdcExt}
            SELECT ?id WHERE {
                GRAPH <${CONCEPT_GRAPH}> {
                    ?id a lpdcExt:ConceptualPublicService .
                }
            }
        `;
        const conceptIdsResult = await directDatabaseAccess.list(conceptIdsQuery);

        console.log(`Verifying Concept Display Configurations for ${conceptIdsResult.length} concepts`);

        const dataErrors = [];

        const before = new Date().valueOf();
        console.log(new Date().toISOString());

        for (const bestuursEenheidResult of bestuurseenheidIdsResult) {
            try {
                const bestuurseenheidId = bestuursEenheidResult['id'].value;
                const bestuurseenheid = await bestuurseenheidRepository.findById(bestuurseenheidId);

                console.log(`Verifying for ${bestuurseenheid.id}`);

                for(const conceptResult of conceptIdsResult) {
                    const conceptId = conceptResult['id'].value;

                    const conceptDisplayConfiguration = await conceptDisplayConfigurationRepository.findByConceptId(bestuurseenheid, conceptId);
                    expect(`concept display configuration found for ${conceptDisplayConfiguration?.conceptId} - ${conceptDisplayConfiguration?.bestuurseenheidId}`)
                        .toEqual(`concept display configuration found for ${conceptId} - ${bestuurseenheid.id}`);
                }
            } catch (e) {
                console.log(e);
                dataErrors.push(e);
            }
        }

        expect(dataErrors).toEqual([]);

        const totalAverageTime = (new Date().valueOf() - before) / (bestuurseenheidIdsResult.length * conceptIdsResult.length);
        console.log(`Total average time: ${totalAverageTime} ms`);
    }, 60000 * 15 * 100);

});