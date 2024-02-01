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
import {ConceptSparqlRepository} from "../../src/driven/persistence/concept-sparql-repository";
import {ConceptSnapshotSparqlRepository} from "../../src/driven/persistence/concept-snapshot-sparql-repository";
import {InstanceReviewStatusType} from "../../src/core/domain/types";
import {DoubleTripleReporter} from "../../src/driven/persistence/quads-to-domain-mapper";
import {Bestuurseenheid} from "../../src/core/domain/bestuurseenheid";
import {Instance} from "../../src/core/domain/instance";

class DoubleTripleReporterCapture implements DoubleTripleReporter{

    private readonly _bestuurseenheid: Bestuurseenheid;
    private _logs: string[] = [];

    constructor(bestuurseenheid: Bestuurseenheid) {
        this._bestuurseenheid = bestuurseenheid;
    }

    report(subject: string, predicate: string, object: string, expectedCount: number, actualCount: number, triples: string[]): void {
        this._logs.push(`${this._bestuurseenheid.id.value}|${this._bestuurseenheid.prefLabel}|INSTANCE_MARKER|${subject}|${predicate}|${object}|${expectedCount}|${actualCount}|${triples.join('|')}`);
    }

    logs(instance: Instance): string [] {
        return this._logs.map(str => str.replace('INSTANCE_MARKER', `${instance.id}|${instance.title?.nl}`));
    }
}

describe('Instance Data Integrity Validation', () => {

    const endPoint = END2END_TEST_SPARQL_ENDPOINT; //Note: replace by END2END_TEST_SPARQL_ENDPOINT to verify all

    const bestuurseenheidRepository = new BestuurseenheidSparqlTestRepository(endPoint);

    const directDatabaseAccess = new DirectDatabaseAccess(endPoint);
    const sparqlQuerying = new SparqlQuerying(endPoint);

    const conceptRepository = new ConceptSparqlRepository(endPoint);
    const conceptSnapshotRepository = new ConceptSnapshotSparqlRepository(endPoint);

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
        const totalDoubleTriples: string[] = [];

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
                            const doubleTripleReporterCapture = new DoubleTripleReporterCapture(bestuurseenheid);
                            const repository = new InstanceSparqlRepository(endPoint, doubleTripleReporterCapture);

                            const id = new Iri(instanceId['id'].value);
                            const instance = await repository.findById(bestuurseenheid, id);

                            expect(instance.id).toEqual(id);
                            const quadsForInstanceForId =
                                domainToTriplesMapper.instanceToTriples(instance);
                            quadsFromRequeriedInstances =
                                [...quadsForInstanceForId, ...quadsFromRequeriedInstances];

                            if (instance.conceptId) {
                                const concept = await conceptRepository.findById(instance.conceptId);
                                await conceptSnapshotRepository.findById(instance.conceptSnapshotId);

                                expect(instance.productId).toEqual(concept.productId);

                                if (!instance.conceptSnapshotId.equals(concept.latestFunctionallyChangedConceptSnapshot)) {
                                    if (concept.isArchived) {
                                        expect(instance.reviewStatus).toEqual(InstanceReviewStatusType.CONCEPT_GEARCHIVEERD);
                                    } else {
                                        expect(instance.reviewStatus).toEqual(InstanceReviewStatusType.CONCEPT_GEWIJZIGD);
                                    }
                                }
                            }

                            expect(instance.createdBy).toEqual(bestuurseenheid.id);

                            const doubleTripleErrorsForInstance = doubleTripleReporterCapture.logs(instance);
                            totalDoubleTriples.push(...doubleTripleErrorsForInstance);

                        } catch (e) {
                            console.error(e);
                            dataErrors.push({
                                bestuurseenheidId: bestuurseenheidId,
                                instanceId: instanceId,
                                error: e.stack
                            });
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

                    }
                    //TODO LPDC-1003: in the end this should be enabled
                    // expect(sortedUniq(allRemainingQuadsOfGraphAsTurtle)).toEqual([]);

                    const averageTime = (new Date().valueOf() - before - delayTime * instanceIds.length) / instanceIds.length;
                    averageTimes.push(averageTime);

                }

                const totalAverageTime = averageTimes.reduce((accumulator, currentValue) => {
                    return accumulator + currentValue;
                }, 0) / averageTimes.length;
                if (dataErrors.length > 0) {
                    console.log(`Data Errors [${dataErrors.map(o => JSON.stringify(o))}]`);
                    totalErrors.push(dataErrors);
                    console.log("totalErrors" + totalErrors.map(o => JSON.stringify(o)));
                }

                console.log(`Total average time: ${totalAverageTime}`);
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
        fs.writeFileSync(`/tmp/instance-total-double-triples.csv`, totalDoubleTriples.join('\n'));
        expect(totalErrors).toEqual([]);
    }, 60000 * 15 * 100);

    test.skip('Find all triples for instance', async () => {
        const bestuurseenheidId = new Iri("http://data.lblod.info/id/bestuurseenheden/17e71437ad9e1abbfd416b7bcb1485c0e6e21ac4f65f2a1584eb0985e246b1c9");
        const bestuurseenheid = await bestuurseenheidRepository.findById(bestuurseenheidId);
        const instanceId = new Iri("http://data.lblod.info/id/public-service/e239d70b-252c-4175-81ca-1c5ee30f89a9");
        const triples = await getInstanceTriples(endPoint, bestuurseenheid.userGraph(), instanceId);
        console.log(triples);

        const repository = new InstanceSparqlRepository(endPoint);
        const instance = await repository.findById(bestuurseenheid, instanceId);
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

