import {END2END_TEST_SPARQL_ENDPOINT} from "../test.config";
import {DirectDatabaseAccess} from "../driven/persistence/direct-database-access";
import {PREFIX} from "../../config";
import {namedNode, Statement} from "rdflib";
import {shuffle, sortedUniq, uniq} from "lodash";
import {Iri} from "../../src/core/domain/shared/iri";
import {sparqlEscapeUri} from "../../mu-helper";
import {InstanceSparqlTestRepository} from "../driven/persistence/instance-sparql-test-repository";
import {BestuurseenheidSparqlTestRepository} from "../driven/persistence/bestuurseenheid-sparql-test-repository";
import {DomainToTriplesMapper} from "../../src/driven/persistence/domain-to-triples-mapper";
import {SparqlQuerying} from "../../src/driven/persistence/sparql-querying";
import {
    DatastoreToQuadsRecursiveSparqlFetcher
} from "../../src/driven/persistence/datastore-to-quads-recursive-sparql-fetcher";
import {asSortedArray} from "../../src/core/domain/shared/collections-helper";
import fs from "fs";

describe('Instance Data Integrity Validation', () => {

    const endPoint = END2END_TEST_SPARQL_ENDPOINT; //Note: replace by END2END_TEST_SPARQL_ENDPOINT to verify all

    const repository = new InstanceSparqlTestRepository(endPoint);
    const bestuurseenheidRepository = new BestuurseenheidSparqlTestRepository(endPoint);

    const directDatabaseAccess = new DirectDatabaseAccess(endPoint);
    const sparqlQuerying = new SparqlQuerying(endPoint);

    test('Load all instances; print errors to console.log', async () => {

        const query = `
            ${PREFIX.besluit}
            SELECT ?id WHERE {
                GRAPH <http://mu.semte.ch/graphs/public> {
                    ?id a besluit:Bestuurseenheid .
                }
            }
        `;
        const bestuurseenheidIdsResult = await directDatabaseAccess.list(query);
        let verfifiedBestuurseenheden = 0;
        let verifiedInstances = 0;
        const totalErrors = [];
        const totalStartTime = new Date();


        console.log(`Verifying ${bestuurseenheidIdsResult.length} bestuurseenheden`);
        for (const bestuurseenheidId of bestuurseenheidIdsResult) {

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
            allQuadsOfGraph = allQuadsOfGraph.filter(q => !q.predicate.equals(namedNode('http://data.europa.eu/m8g/hasCost')));
            allQuadsOfGraph = allQuadsOfGraph.filter(q => !q.predicate.equals(namedNode('http://mu.semte.ch/vocabularies/ext/hasVersionedSource')));
            allQuadsOfGraph = allQuadsOfGraph.filter(q => !q.predicate.equals(namedNode('http://data.europa.eu/m8g/hasLegalResource')));
            allQuadsOfGraph = allQuadsOfGraph.filter(q => !q.predicate.equals(namedNode('http://data.europa.eu/m8g/hasContactPoint')));
            allQuadsOfGraph = allQuadsOfGraph.filter(q => !q.predicate.equals(namedNode('http://data.europa.eu/m8g/hasCompetentAuthority')));
            allQuadsOfGraph = allQuadsOfGraph.filter(q => !q.predicate.equals(namedNode('http://schema.org/productID')));
            allQuadsOfGraph = allQuadsOfGraph.filter(q => !q.predicate.equals(namedNode('http://schema.org/publication')));
            allQuadsOfGraph = allQuadsOfGraph.filter(q => !q.predicate.equals(namedNode('https://productencatalogus.data.vlaanderen.be/ns/ipdc-lpdc#conceptTag')));
            allQuadsOfGraph = allQuadsOfGraph.filter(q => !q.predicate.equals(namedNode('https://productencatalogus.data.vlaanderen.be/ns/ipdc-lpdc#yourEuropeCategory')));
            allQuadsOfGraph = allQuadsOfGraph.filter(q => !q.predicate.equals(namedNode('http://www.w3.org/2000/01/rdf-schema#seeAlso')));
            allQuadsOfGraph = allQuadsOfGraph.filter(q => !q.predicate.equals(namedNode('http://purl.org/dc/terms/source')));
            allQuadsOfGraph = allQuadsOfGraph.filter(q => !q.predicate.equals(namedNode('http://purl.org/vocab/cpsv#produces')));
            allQuadsOfGraph = allQuadsOfGraph.filter(q => !q.predicate.equals(namedNode('http://purl.org/vocab/cpsv#follows')));
            allQuadsOfGraph = allQuadsOfGraph.filter(q => !q.predicate.equals(namedNode('https://www.w3.org/ns/activitystreams#formerType')));
            allQuadsOfGraph = allQuadsOfGraph.filter(q => !q.predicate.equals(namedNode('http://mu.semte.ch/vocabularies/ext/reviewStatus')));
            allQuadsOfGraph = allQuadsOfGraph.filter(q => !q.predicate.equals(namedNode('http://publications.europa.eu/resource/authority/language')));

            allQuadsOfGraph = allQuadsOfGraph.filter(q => !q.object.equals(namedNode('http://schema.org/WebSite')));
            allQuadsOfGraph = allQuadsOfGraph.filter(q => !q.object.equals(namedNode('http://data.europa.eu/m8g/Cost')));
            allQuadsOfGraph = allQuadsOfGraph.filter(q => !q.object.equals(namedNode('http://data.europa.eu/m8g/FinancialAdvantage')));
            allQuadsOfGraph = allQuadsOfGraph.filter(q => !q.object.equals(namedNode('http://data.europa.eu/m8g/Procedure')));
            allQuadsOfGraph = allQuadsOfGraph.filter(q => !q.object.equals(namedNode('http://purl.org/vocab/cpsv#Rule')));
            allQuadsOfGraph = allQuadsOfGraph.filter(q => !q.object.equals(namedNode('https://productencatalogus.data.vlaanderen.be/ns/ipdc-lpdc#ConceptDisplayConfiguration')));
            allQuadsOfGraph = allQuadsOfGraph.filter(q => !q.object.equals(namedNode('https://productencatalogus.data.vlaanderen.be/ns/ipdc-lpdc#FormalInformalChoice')));
            allQuadsOfGraph = allQuadsOfGraph.filter(q => !q.object.equals(namedNode('https://www.w3.org/ns/activitystreams#Tombstone')));
            allQuadsOfGraph = allQuadsOfGraph.filter(
                q => (!q.subject.value.startsWith('http://data.lblod.info/id/evidence/') && !q.predicate.equals(namedNode('http://www.w3.org/ns/shacl#order')))
            );


            allQuadsOfGraph = allQuadsOfGraph.filter(q => !q.subject.value.startsWith('http://data.lblod.info/id/conceptual-display-configuration/'));
            allQuadsOfGraph = allQuadsOfGraph.filter(q => !q.subject.value.startsWith('http://data.lblod.info/id/website/'));
            allQuadsOfGraph = allQuadsOfGraph.filter(q => !q.subject.value.startsWith('http://data.lblod.info/id/cost/'));
            allQuadsOfGraph = allQuadsOfGraph.filter(q => !q.subject.value.startsWith('http://data.lblod.info/id/formalInformalChoice/'));
            allQuadsOfGraph = allQuadsOfGraph.filter(q => !q.subject.value.startsWith('http://data.lblod.info/id/rule/'));
            allQuadsOfGraph = allQuadsOfGraph.filter(q => !q.subject.value.startsWith('http://data.lblod.info/id/financial-advantage/'));
            allQuadsOfGraph = allQuadsOfGraph.filter(q => !q.subject.value.startsWith('http://data.lblod.info/id/adressen/'));
            allQuadsOfGraph = allQuadsOfGraph.filter(q => !q.subject.value.startsWith('http://data.lblod.info/id/contact-punten/'));
            allQuadsOfGraph = allQuadsOfGraph.filter(q => !q.subject.value.startsWith('http://data.lblod.info/form-data/'));


            const delayTime = 0;
            const numberOfLoops = 1;
            const averageTimes = [];
            const technicalErrors = [];
            const dataErrors = [];
            if (instanceIds.length > 0) {


                for (let i = 0; i < numberOfLoops; i++) {
                    let quadsFromRequeriedInstances: Statement[] = [];

                    const before = new Date().valueOf();

                    const randomizedInstanceIds = [...instanceIds];
                    shuffle(randomizedInstanceIds);

                    for (const result of randomizedInstanceIds) {
                        try {
                            const id = new Iri(result['id'].value);
                            const instanceForId = await repository.findById(bestuurseenheid, id);

                            expect(instanceForId.id).toEqual(id);
                            const quadsForInstanceForId =
                                domainToTriplesMapper.instanceToTriples(instanceForId);
                            quadsFromRequeriedInstances =
                                [...quadsForInstanceForId, ...quadsFromRequeriedInstances];

                        } catch (e) {
                            console.error(e);
                            if (!e.message.startsWith('could not map')) {
                                console.error(e);
                                technicalErrors.push(e);
                            } else {
                                dataErrors.push(e);
                            }
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
                        totalErrors.push(...allRemainingQuadsOfGraphAsTurtle);
                        console.log(`Remaining errors [${allRemainingQuadsOfGraphAsTurtle}]`);
                        console.log(`total errors  ${totalErrors}`);

                    }
                    // expect(sortedUniq(allRemainingQuadsOfGraphAsTurtle)).toEqual([]);

                    const averageTime = (new Date().valueOf() - before - delayTime * instanceIds.length) / instanceIds.length;
                    averageTimes.push(averageTime);


                }

                const totalAverageTime = averageTimes.reduce((accumulator, currentValue) => {
                    return accumulator + currentValue;
                }, 0) / averageTimes.length;
                if (technicalErrors.length > 0) {
                    console.log(`Technical Errors [${technicalErrors}]`);
                    totalErrors.push(technicalErrors);
                    console.log("totalErrors" + totalErrors);
                }
                if (dataErrors.length > 0) {
                    console.log(`Data Errors [${dataErrors}]`);
                    totalErrors.push(dataErrors);
                    console.log("totalErrors" + totalErrors);
                }
                // console.log(`Total average time: ${totalAverageTime}`);

                expect(totalAverageTime).toBeLessThan(250);
            }

            verfifiedBestuurseenheden++;
            // console.log(`Verifying in total ${instanceIds.length} instance took on average ${averageTime} ms per instance for bestuurseenheid ${bestuurseenheid.prefLabel}`);
            const timeInMs = new Date().getTime() - totalStartTime.valueOf();
            const timeInSeconds = timeInMs / 1000;
            const timeInMinutes = Math.round(timeInSeconds / 60);
            console.log(
                '\n', `- Verified ${bestuurseenheid.userGraph()}`,
                '\n', `- Verified ${verfifiedBestuurseenheden} of the ${bestuurseenheidIdsResult.length} bestuurseenheden`,
                '\n', `- Verified ${verifiedInstances} instances`,
                '\n', `- Total time:  ${timeInMs} ms or ${timeInSeconds} seconds or ${timeInMinutes} minutes `);

        }
        expect(totalErrors).toEqual([]);
    }, 60000 * 15 * 100);

    test.skip('Find all triples for instance', async () => {
        const bestuurseenheidGraph = new Iri("http://mu.semte.ch/graphs/organizations/d9f7c0ab4920fdecf3f9a60b92e921b5ca07248fcb0eac2113eb97392ddd6c6c/LoketLB-LPDCGebruiker");
        const instanceUUID = new Iri("http://data.lblod.info/id/public-service/144c7496-bb5e-47d2-8874-a2c9efc0ac0d");
        const triples = await getInstanceTriples(endPoint, bestuurseenheidGraph, instanceUUID);
        console.log(triples);
        fs.writeFileSync(`/tmp/remaining-quads-instance.txt`, sortedUniq(triples).join('\n'));

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
