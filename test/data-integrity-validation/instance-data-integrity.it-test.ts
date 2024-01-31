import {END2END_TEST_SPARQL_ENDPOINT} from "../test.config";
import {DirectDatabaseAccess} from "../driven/persistence/direct-database-access";
import {PREFIX, PUBLIC_GRAPH} from "../../config";
import {namedNode, Statement} from "rdflib";
import {shuffle, sortedUniq, uniq} from "lodash";
import {Iri} from "../../src/core/domain/shared/iri";
import {sparqlEscapeUri} from "../../mu-helper";
import {BestuurseenheidSparqlTestRepository} from "../driven/persistence/bestuurseenheid-sparql-test-repository";
import {DomainToTriplesMapper} from "../../src/driven/persistence/domain-to-triples-mapper";
import {SparqlQuerying} from "../../src/driven/persistence/sparql-querying";
import {
    DatastoreToQuadsRecursiveSparqlFetcher
} from "../../src/driven/persistence/datastore-to-quads-recursive-sparql-fetcher";
import {asSortedArray} from "../../src/core/domain/shared/collections-helper";
import fs from "fs";
import {InstanceSparqlRepository} from "../../src/driven/persistence/instance-sparql-repository";

describe('Instance Data Integrity Validation', () => {

    const endPoint = END2END_TEST_SPARQL_ENDPOINT; //Note: replace by END2END_TEST_SPARQL_ENDPOINT to verify all

    const repository = new InstanceSparqlRepository(endPoint);
    const bestuurseenheidRepository = new BestuurseenheidSparqlTestRepository(endPoint);

    const directDatabaseAccess = new DirectDatabaseAccess(endPoint);
    const sparqlQuerying = new SparqlQuerying(endPoint);

    test.skip('Load all instances; print errors to console.log', async () => {

        const query = `
            ${PREFIX.besluit}
            SELECT ?id WHERE {
                GRAPH ${sparqlEscapeUri(PUBLIC_GRAPH)} {
                    ?id a besluit:Bestuurseenheid .
                }
            }
        `;
        const bestuurseenheidIdsResult = await directDatabaseAccess.list(query);
        let randomizedInstanceIds = shuffle([...bestuurseenheidIdsResult]);
        //TODO LPDC-1003: take them all eventually, for now take the first n (from a randomized list).
        //randomizedInstanceIds = randomizedInstanceIds.slice(0, 100);

        let verifiedBestuurseenheden = 0;
        let verifiedInstances = 0;
        const totalErrors = [];
        const totalStartTime = new Date();


        console.log(`Verifying ${randomizedInstanceIds.length} bestuurseenheden`);
        for (const bestuurseenheidId of randomizedInstanceIds) {

            const bestuurseenheid = await bestuurseenheidRepository.findById(new Iri(bestuurseenheidId['id'].value));
            const domainToTriplesMapper = new DomainToTriplesMapper(bestuurseenheid.userGraph());

            const instanceIdsQuery = `
            ${PREFIX.cpsv}
            SELECT ?id WHERE {
                GRAPH ${sparqlEscapeUri(bestuurseenheid.userGraph())} {
                    ?id a cpsv:PublicService .
                }
            }
            `;
            const instanceIds = await directDatabaseAccess.list(instanceIdsQuery);

            verifiedInstances += instanceIds.length;
            const allTriplesOfGraphQuery = `
             ${PREFIX.cpsv}
            SELECT ?s ?p ?o WHERE {
                GRAPH ${sparqlEscapeUri(bestuurseenheid.userGraph())} {
                    ?s ?p ?o
                }
            }
            `;

            const allTriplesOfGraph = await directDatabaseAccess.list(allTriplesOfGraphQuery);
            let allQuadsOfGraph: Statement[] = uniq(sparqlQuerying.asQuads(allTriplesOfGraph, bestuurseenheid.userGraph().value));

            allQuadsOfGraph = allQuadsOfGraph.filter(q => !q.predicate.equals(namedNode('https://productencatalogus.data.vlaanderen.be/ns/ipdc-lpdc#hasConceptDisplayConfiguration')));
            allQuadsOfGraph = allQuadsOfGraph.filter(q => !q.predicate.equals(namedNode('https://www.w3.org/ns/activitystreams#deleted')));
            allQuadsOfGraph = allQuadsOfGraph.filter(q => !q.predicate.equals(namedNode('http://mu.semte.ch/vocabularies/ext/hasVersionedSource')));
            allQuadsOfGraph = allQuadsOfGraph.filter(q => !q.predicate.equals(namedNode('http://schema.org/publication')));
            allQuadsOfGraph = allQuadsOfGraph.filter(q => !q.predicate.equals(namedNode('https://productencatalogus.data.vlaanderen.be/ns/ipdc-lpdc#conceptTag')));
            allQuadsOfGraph = allQuadsOfGraph.filter(q => !q.predicate.equals(namedNode('http://www.w3.org/2000/01/rdf-schema#seeAlso')));
            allQuadsOfGraph = allQuadsOfGraph.filter(q => !q.predicate.equals(namedNode('https://www.w3.org/ns/activitystreams#formerType')));
            allQuadsOfGraph = allQuadsOfGraph.filter(q => !q.predicate.equals(namedNode('http://publications.europa.eu/resource/authority/language')));

            allQuadsOfGraph = allQuadsOfGraph.filter(q => !q.object.equals(namedNode('https://productencatalogus.data.vlaanderen.be/ns/ipdc-lpdc#ConceptDisplayConfiguration')));
            allQuadsOfGraph = allQuadsOfGraph.filter(q => !q.object.equals(namedNode('https://productencatalogus.data.vlaanderen.be/ns/ipdc-lpdc#FormalInformalChoice')));
            allQuadsOfGraph = allQuadsOfGraph.filter(q => !q.object.equals(namedNode('https://www.w3.org/ns/activitystreams#Tombstone')));

            allQuadsOfGraph = allQuadsOfGraph.filter(q => !q.subject.value.startsWith('http://data.lblod.info/id/conceptual-display-configuration/'));
            allQuadsOfGraph = allQuadsOfGraph.filter(q => !q.subject.value.startsWith('http://data.lblod.info/id/formalInformalChoice/'));

            const delayTime = 0;
            const numberOfLoops = 1;
            const averageTimes = [];
            const dataErrors = [];
            if (instanceIds.length > 0) {

                for (let i = 0; i < numberOfLoops; i++) {
                    let quadsFromRequeriedInstances: Statement[] = [];

                    const before = new Date().valueOf();

                    const randomizedInstanceIds = shuffle([...instanceIds]);

                    for (const instanceId of randomizedInstanceIds) {
                        try {
                            const id = new Iri(instanceId['id'].value);
                            const instanceForId = await repository.findById(bestuurseenheid, id);

                            expect(instanceForId.id).toEqual(id);
                            const quadsForInstanceForId =
                                domainToTriplesMapper.instanceToTriples(instanceForId);
                            quadsFromRequeriedInstances =
                                [...quadsForInstanceForId, ...quadsFromRequeriedInstances];

                            //TODO LPDC-1003: add extra deep integrity checks
                            //TODO LPDC-1003: can we load linked concept ?
                            //TODO LPDC-1003: can we load linked conceptsnapshot ?
                            //TODO LPDC-1003: product id from instance should match that of the concept ?

                            //TODO LPDC-1003: if latestfunctionally changed snapshot from linked snapshot is not the same as the linked one from instantie -> reviewstatus should be enabled on instantie
                            //TODO LPDC-1003: if latestfunctionally changed snapshot from linked snapshot is not the same as the linked one from instantie and concept is archived -> reviewstatus archived should be enabled on instantie
                            //TODO LPDC-1003: is the created by the same as the bestuurseenheid ?
                            //TODO LPDC-1003: can we load all competentAuthorities ?
                            //TODO LPDC-1003: can we load all executingAuthorities ?

                        } catch (e) {
                            console.error(e);
                            dataErrors.push({bestuurseenheidId: bestuurseenheidId, instanceId: instanceId, error: e.stack});
                        }
                        await wait(delayTime);
                    }

                    const quadsFromRequeriedInstancesAsStrings = quadsFromRequeriedInstances.map(quad => quad.toString());

                    const allRemainingQuadsOfGraphAsTurtle = allQuadsOfGraph
                        .map(q => q.toString())
                        .filter(q => !quadsFromRequeriedInstancesAsStrings.includes(q));


                    //uncomment when running against END2END_TEST_SPARQL_ENDPOINT
                    //fs.writeFileSync(`/tmp/remaining-quads-instance.txt`, sortedUniq(allRemainingQuadsOfGraphAsTurtle).join('\n'));

                    if (allRemainingQuadsOfGraphAsTurtle.length > 0) {
                        //TODO LPDC-1003: also verify the remaining quads ... (after first loading all succesfully)
                        //totalErrors.push(...allRemainingQuadsOfGraphAsTurtle);
                        //console.log(`Remaining errors [${allRemainingQuadsOfGraphAsTurtle}]`);
                        //console.log(`total errors  ${totalErrors}`);

                    }
                    // expect(sortedUniq(allRemainingQuadsOfGraphAsTurtle)).toEqual([]);

                    const averageTime = (new Date().valueOf() - before - delayTime * instanceIds.length) / instanceIds.length;
                    averageTimes.push(averageTime);

                }

                const totalAverageTime = averageTimes.reduce((accumulator, currentValue) => {
                    return accumulator + currentValue;
                }, 0) / averageTimes.length;
                if (dataErrors.length > 0) {
                    console.log(`Data Errors [${dataErrors}]`);
                    totalErrors.push(dataErrors);
                    console.log("totalErrors" + totalErrors);
                }

                console.log(`Total average time: ${totalAverageTime}`);
                //expect(totalAverageTime).toBeLessThan(100);
            }

            verifiedBestuurseenheden++;
            const timeInMs = new Date().getTime() - totalStartTime.valueOf();
            const timeInSeconds = timeInMs / 1000;
            const timeInMinutes = Math.round(timeInSeconds / 60);
            console.log(
                '\n', `- Verified ${bestuurseenheid.userGraph()}`,
                '\n', `- Verified ${verifiedBestuurseenheden} of the ${randomizedInstanceIds.length} bestuurseenheden`,
                '\n', `- Verified ${verifiedInstances} instances`,
                '\n', `- Total time:  ${timeInMs} ms or ${timeInSeconds} seconds or ${timeInMinutes} minutes `);

        }
        fs.writeFileSync(`/tmp/instance-total-errors.json`, sortedUniq(totalErrors.map(o => JSON.stringify(o))).join('\n'));
        expect(totalErrors).toEqual([]);
    }, 60000 * 15 * 100);

    test.skip('Find all triples for instance', async () => {
        const bestuurseenheidId = new Iri("http://data.lblod.info/id/bestuurseenheden/2d6f7aa09c55d347a56da51c583f762843fca5da4acd824ee2dede879a197a7a");
        const bestuurseenheid = await bestuurseenheidRepository.findById(bestuurseenheidId);
        const instanceId = new Iri("http://data.lblod.info/id/public-service/ffc962f5-bb4f-4045-9288-0ff48408e9da");
        const triples = await getInstanceTriples(endPoint, bestuurseenheid.userGraph(), instanceId);
        console.log(triples);

        const instance = await repository.findById(bestuurseenheid, instanceId);
        instance.title;
    });

    function wait(milliseconds: number) {
        return new Promise(resolve => {
            setTimeout(resolve, milliseconds);
        });
    }

    async function getInstanceTriples(endpoint: string, bestuurseenheidUserGraph: Iri, instanceUUID: Iri): Promise<string[]> {
        const fetcher = new DatastoreToQuadsRecursiveSparqlFetcher(endpoint);
        const quads = await fetcher.fetch(
            bestuurseenheidUserGraph,
            instanceUUID,
            ["https://productencatalogus.data.vlaanderen.be/ns/ipdc-lpdc#hasConceptDisplayConfiguration"],
            [],
            []);

        const allQuadsAsStrings: string[] = asSortedArray(quads.map(q => q.toString()));

        console.log(allQuadsAsStrings);
        return allQuadsAsStrings;
    }

});
