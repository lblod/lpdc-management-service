import {END2END_TEST_SPARQL_ENDPOINT} from "../test.config";
import {DirectDatabaseAccess} from "../driven/persistence/direct-database-access";
import {PREFIX, PUBLIC_GRAPH} from "../../config";
import {isLiteral, namedNode, Statement} from "rdflib";
import {shuffle, sortedUniq, uniq} from "lodash";
import {Iri} from "../../src/core/domain/shared/iri";
import {sparqlEscapeUri} from "../../mu-helper";
import {BestuurseenheidSparqlTestRepository} from "../driven/persistence/bestuurseenheid-sparql-test-repository";
import {DomainToQuadsMapper} from "../../src/driven/persistence/domain-to-quads-mapper";
import {SparqlQuerying} from "../../src/driven/persistence/sparql-querying";
import {
    DatastoreToQuadsRecursiveSparqlFetcher
} from "../../src/driven/persistence/datastore-to-quads-recursive-sparql-fetcher";
import {asSortedArray} from "../../src/core/domain/shared/collections-helper";
import fs from "fs";
import {InstanceSparqlRepository} from "../../src/driven/persistence/instance-sparql-repository";
import {ConceptSparqlRepository} from "../../src/driven/persistence/concept-sparql-repository";
import {ConceptSnapshotSparqlRepository} from "../../src/driven/persistence/concept-snapshot-sparql-repository";
import {DoubleQuadReporter} from "../../src/driven/shared/quads-to-domain-mapper";
import {Bestuurseenheid} from "../../src/core/domain/bestuurseenheid";
import {Instance} from "../../src/core/domain/instance";
import {
    FormalInformalChoiceSparqlRepository
} from "../../src/driven/persistence/formal-informal-choice-sparql-repository";
import {ChosenFormType} from "../../src/core/domain/types";
import {Language} from "../../src/core/domain/language";

class DoubleQuadReporterCapture implements DoubleQuadReporter {

    private readonly _bestuurseenheid: Bestuurseenheid;
    private _logs: string[] = [];

    constructor(bestuurseenheid: Bestuurseenheid) {
        this._bestuurseenheid = bestuurseenheid;
    }

    report(graph: string, subject: string, predicate: string, object: string, expectedCount: number, actualCount: number, triples: string[]): void {
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
    const informalFormalChoiceRepository = new FormalInformalChoiceSparqlRepository(endPoint);

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
        const randomizedBestuurseenheidsIds = shuffle([...bestuurseenheidIdsResult]);
        //randomizedBestuurseenheidsIds = randomizedBestuurseenheidsIds.slice(0, 50);

        let verifiedBestuurseenheden = 0;
        let verifiedInstances = 0;
        const totalErrors = [];
        const totalRemainingQuadsInstance = [];
        const totalStartTime = new Date();
        const totalDoubleQuads: string[] = [];

        console.log(`Verifying ${randomizedBestuurseenheidsIds.length} bestuurseenheden`);

        if (!fs.existsSync(`/tmp/remaining-quads-instance`)) {
            fs.mkdirSync(`/tmp/remaining-quads-instance`);
        }

        for (const bestuurseenheidId of randomizedBestuurseenheidsIds) {

            const bestuurseenheid = await bestuurseenheidRepository.findById(new Iri(bestuurseenheidId['id'].value));
            const domainToQuadsMapper = new DomainToQuadsMapper(bestuurseenheid.userGraph());

            const instanceIdsQuery = `
            ${PREFIX.lpdcExt}
            SELECT ?id WHERE {
                GRAPH ${sparqlEscapeUri(bestuurseenheid.userGraph())} {
                    ?id a lpdcExt:InstancePublicService .
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

            allQuadsOfGraph.map(q => {
                if (isLiteral(q.object) && q.object.datatype.value === 'http://www.w3.org/2001/XMLSchema#boolean') {
                    q.object.value === "1" ? q.object.value = "true" : q.object.value = "false";
                }
                return q;
            });

            const tombStonesSubjects = new Set([...allQuadsOfGraph.filter(q => q.object.equals(namedNode('https://www.w3.org/ns/activitystreams#Tombstone'))).map(q => q.subject.value)]);

            //filter out tombstones triples
            allQuadsOfGraph = allQuadsOfGraph.filter(q => !tombStonesSubjects.has(q.subject.value));

            //filter out conceptual display configurations and formal informal choices
            allQuadsOfGraph = allQuadsOfGraph.filter(q => !q.subject.value.startsWith('http://data.lblod.info/id/conceptual-display-configuration/'));
            allQuadsOfGraph = allQuadsOfGraph.filter(q => !q.predicate.equals(namedNode('http://data.lblod.info/vocabularies/lpdc/hasConceptDisplayConfiguration')));
            allQuadsOfGraph = allQuadsOfGraph.filter(q => !q.subject.value.startsWith('http://data.lblod.info/id/formalInformalChoice/'));

            const delayTime = 0;
            const numberOfLoops = 1;
            const averageTimes = [];
            const dataErrors = [];

            if (instanceIds.length > 0) {

                for (let i = 0; i < numberOfLoops; i++) {
                    const quadsFromRequeriedInstances: Statement[] = [];

                    const before = new Date().valueOf();

                    const randomizedInstanceIds = shuffle([...instanceIds]);

                    for (const instanceId of randomizedInstanceIds) {
                        try {
                            const doubleQuadReporterCapture = new DoubleQuadReporterCapture(bestuurseenheid);
                            const repository = new InstanceSparqlRepository(endPoint, doubleQuadReporterCapture);

                            const id = new Iri(instanceId['id'].value);
                            const instance = await repository.findById(bestuurseenheid, id);

                            expect(instance.id).toEqual(id);
                            const quadsForInstanceForId = domainToQuadsMapper.instanceToQuads(instance);

                            quadsFromRequeriedInstances.push(...quadsForInstanceForId);

                            if (instance.conceptId) {
                                const concept = await conceptRepository.findById(instance.conceptId);
                                await conceptSnapshotRepository.findById(instance.conceptSnapshotId);

                                expect(instance.productId).toEqual(concept.productId);

                                // TODO 1038: when conceptSnapshot linked to instance is not same as latestFunctionallyChanged OR A LATER snapshot concept gewijzigd flag should be on
                                /*if (!instance.conceptSnapshotId.equals(concept.latestFunctionallyChangedConceptSnapshot)) {
                                    if (concept.isArchived) {
                                        expect(instance.reviewStatus).toEqual(InstanceReviewStatusType.CONCEPT_GEARCHIVEERD);
                                    } else {
                                        expect(instance.reviewStatus).toEqual(InstanceReviewStatusType.CONCEPT_GEWIJZIGD);
                                    }
                                }*/
                            }

                            expect(instance.createdBy).toEqual(bestuurseenheid.id);

                            await validateNeedsConversionFromFormalToInformalFlag(instance, bestuurseenheid);

                            const doubleQuadsErrorsForInstance = doubleQuadReporterCapture.logs(instance);
                            totalDoubleQuads.push(...doubleQuadsErrorsForInstance);

                        } catch (e) {
                            console.error(instanceId);
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


                    if (allRemainingQuadsOfGraphAsTurtle.length > 0) {
                        fs.writeFileSync(`/tmp/remaining-quads-instance/remaining-quads-instance-${bestuurseenheid.uuid}.txt`, sortedUniq(allRemainingQuadsOfGraphAsTurtle).join('\n'));
                        totalRemainingQuadsInstance.push(...allRemainingQuadsOfGraphAsTurtle);
                    }
                    //in the end this should be enabled
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
                '\n', `- Verified ${verifiedBestuurseenheden} of the ${randomizedBestuurseenheidsIds.length} bestuurseenheden`,
                '\n', `- Verified ${verifiedInstances} instances`,
                '\n', `- Total time:  ${timeInMs} ms or ${timeInSeconds} seconds or ${timeInMinutes} minutes `);

        }

        fs.writeFileSync(`/tmp/instance-total-errors.json`, sortedUniq(totalErrors.map(o => JSON.stringify(o))).join('\n'));
        fs.writeFileSync(`/tmp/instance-total-double-triples.csv`, totalDoubleQuads.join('\n'));
        fs.writeFileSync(`/tmp/instance-total-remaining-quads.txt`, totalRemainingQuadsInstance.join('\n'));
        expect(totalErrors).toEqual([]);
    }, 60000 * 15 * 100 * 10);

    test.skip('Find all triples for instance', async () => {
        const bestuurseenheidId = new Iri("http://data.lblod.info/id/bestuurseenheden/0916618d3560fe5a168ef536c25ffaddb15ef6ce43105d3ed20df38615803c77");
        const bestuurseenheid = await bestuurseenheidRepository.findById(bestuurseenheidId);
        const instanceId = new Iri("http://data.lblod.info/id/public-service/38c47504-7e2c-4290-a2fb-778b7f5ca05c");
        const triples = await getInstanceTriples(endPoint, bestuurseenheid.userGraph(), instanceId);
        console.log(triples);

        const repository = new InstanceSparqlRepository(endPoint);
        const instance = await repository.findById(bestuurseenheid, instanceId);
        instance.id;
        const domainToTriplesMapper = new DomainToQuadsMapper(bestuurseenheid.userGraph());

        const quadsForInstanceForId =
            domainToTriplesMapper.instanceToQuads(instance);

        quadsForInstanceForId.toString();
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


    async function validateNeedsConversionFromFormalToInformalFlag(instance: Instance, bestuurseenheid: Bestuurseenheid) {
        const formalInformalChoice = await informalFormalChoiceRepository.findByBestuurseenheid(bestuurseenheid);
        if (formalInformalChoice?.chosenForm === ChosenFormType.INFORMAL) {
            if (instance.dutchLanguageVariant != Language.INFORMAL) {
                expect(instance.needsConversionFromFormalToInformal).toBeTrue();
            } else {
                expect(instance.needsConversionFromFormalToInformal).toBeFalse();
            }
        } else {
            expect(instance.needsConversionFromFormalToInformal).toBeFalse();
        }
    }

});

