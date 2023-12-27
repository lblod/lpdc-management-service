import {TEST_SPARQL_ENDPOINT} from "../test.config";
import {DirectDatabaseAccess} from "../driven/persistence/direct-database-access";
import {PREFIX} from "../../config";
import {ConceptVersieSparqlTestRepository} from "../driven/persistence/concept-versie-sparql-test-repository";
import {shuffle} from "lodash";

describe('Concept Versie Data Integrity Validation', () => {

    const endPoint = TEST_SPARQL_ENDPOINT; //Note: replace by END2END_TEST_SPARQL_ENDPOINT to verify all

    const repository = new ConceptVersieSparqlTestRepository(endPoint);
    const directDatabaseAccess = new DirectDatabaseAccess(endPoint);

    //TODO LPDC-916: using a story representation for each queried -> verify with all the raw triples, queried directly from the database -> to ascertain we queried all data ...
    //TODO LPDC-916: load data concurrently ... using PromisePool (10 concurrent users, but each of them with a kinda random wait; so to simulate n concurrent users )
    //TODO LPDC-916: load data from ldes stream of production dump and verify results ...

    test('Load all concept versies; print errors to console.log', async () => {

        const query = `
             ${PREFIX.lpdcExt}
            SELECT ?id WHERE {
                GRAPH <http://mu.semte.ch/graphs/lpdc/ldes-data> {
                    ?id a lpdcExt:ConceptualPublicService .
                }
            }
        `;
        const conceptVersieIds = await directDatabaseAccess.list(query);

        const delayTime = 0;
        const numberOfLoops = 1;
        const averageTimes = [];
        const technicalErrors = [];
        const dataErrors = [];

        for(let i = 0; i < numberOfLoops; i++) {

            const before = new Date().valueOf();

            console.log(new Date().toISOString());

            const randomizedConceptVersieIds = [...conceptVersieIds];
            shuffle(randomizedConceptVersieIds);

            for (const result of randomizedConceptVersieIds) {
                try {
                    const id = result['id'].value;
                    const conceptVersieForId = await repository.findById(id);
                    expect(conceptVersieForId.id).toEqual(id);
                } catch(e) {
                    if(!e.message.startsWith('could not map')) {
                        console.error(e);
                        technicalErrors.push(e);
                    } else {
                        dataErrors.push(e);
                    }
                }
                await wait(delayTime);
            }

            const averageTime = (new Date().valueOf() - before - delayTime * conceptVersieIds.length) / conceptVersieIds.length;
            averageTimes.push(averageTime);

            console.log(`Verifying in total ${conceptVersieIds.length} concept versies took on average ${averageTime} ms per concept`);
            // eslint-disable-next-line no-constant-condition
        }

        const totalAverageTime = averageTimes.reduce((accumulator, currentValue) => {return accumulator + currentValue;}, 0) / averageTimes.length;
        console.log(`Total average time: ${totalAverageTime}`);
        console.log(`Technical Errors [${technicalErrors}]`);
        console.log(`Data Errors Size [${dataErrors}]`);

        if(conceptVersieIds.length > 0) {
            expect(totalAverageTime).toBeLessThan(100); //typically it is a lot less, but when querying only 2 or 3 concept versies, you might end up with more
            expect(technicalErrors).toEqual([]);
        }

    }, 60000 * 15 * 100);

    function wait(milliseconds: number) {
        return new Promise(resolve => {
            setTimeout(resolve, milliseconds);
        });
    }


});