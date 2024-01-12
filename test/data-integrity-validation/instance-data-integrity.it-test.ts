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

describe.skip('Instance Data Integrity Validation', () => {

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
            allQuadsOfGraph = allQuadsOfGraph.filter(q => !q.predicate.equals(namedNode('http://purl.org/dc/terms/created')));
            allQuadsOfGraph = allQuadsOfGraph.filter(q => !q.predicate.equals(namedNode('http://purl.org/dc/terms/modified')));
            allQuadsOfGraph = allQuadsOfGraph.filter(q => !q.predicate.equals(namedNode('https://www.w3.org/ns/activitystreams#deleted')));
            allQuadsOfGraph = allQuadsOfGraph.filter(q => !q.predicate.equals(namedNode('http://www.w3.org/ns/dcat#keyword')));
            allQuadsOfGraph = allQuadsOfGraph.filter(q => !q.predicate.equals(namedNode('https://productencatalogus.data.vlaanderen.be/ns/ipdc-lpdc#publicationMedium')));
            allQuadsOfGraph = allQuadsOfGraph.filter(q => !q.predicate.equals(namedNode('https://productencatalogus.data.vlaanderen.be/ns/ipdc-lpdc#executingAuthorityLevel')));
            allQuadsOfGraph = allQuadsOfGraph.filter(q => !q.predicate.equals(namedNode('https://productencatalogus.data.vlaanderen.be/ns/ipdc-lpdc#hasExecutingAuthority')));
            allQuadsOfGraph = allQuadsOfGraph.filter(q => !q.predicate.equals(namedNode('https://productencatalogus.data.vlaanderen.be/ns/ipdc-lpdc#competentAuthorityLevel')));
            allQuadsOfGraph = allQuadsOfGraph.filter(q => !q.predicate.equals(namedNode('http://data.europa.eu/m8g/hasCompetentAuthority')));
            allQuadsOfGraph = allQuadsOfGraph.filter(q => !q.predicate.equals(namedNode('http://data.europa.eu/m8g/hasCost')));
            allQuadsOfGraph = allQuadsOfGraph.filter(q => !q.predicate.equals(namedNode('http://vocab.belgif.be/ns/publicservice#hasRequirement')));
            allQuadsOfGraph = allQuadsOfGraph.filter(q => !q.predicate.equals(namedNode('http://mu.semte.ch/vocabularies/ext/hasVersionedSource')));
            allQuadsOfGraph = allQuadsOfGraph.filter(q => !q.predicate.equals(namedNode('https://productencatalogus.data.vlaanderen.be/ns/ipdc-lpdc#additionalDescription')));
            allQuadsOfGraph = allQuadsOfGraph.filter(q => !q.predicate.equals(namedNode('http://schema.org/productID')));
            allQuadsOfGraph = allQuadsOfGraph.filter(q => !q.predicate.equals(namedNode('http://schema.org/publication')));
            allQuadsOfGraph = allQuadsOfGraph.filter(q => !q.predicate.equals(namedNode('https://productencatalogus.data.vlaanderen.be/ns/ipdc-lpdc#conceptTag')));
            allQuadsOfGraph = allQuadsOfGraph.filter(q => !q.predicate.equals(namedNode('https://productencatalogus.data.vlaanderen.be/ns/ipdc-lpdc#exception')));
            allQuadsOfGraph = allQuadsOfGraph.filter(q => !q.predicate.equals(namedNode('https://productencatalogus.data.vlaanderen.be/ns/ipdc-lpdc#regulation')));
            allQuadsOfGraph = allQuadsOfGraph.filter(q => !q.predicate.equals(namedNode('https://productencatalogus.data.vlaanderen.be/ns/ipdc-lpdc#targetAudience')));
            allQuadsOfGraph = allQuadsOfGraph.filter(q => !q.predicate.equals(namedNode('https://productencatalogus.data.vlaanderen.be/ns/ipdc-lpdc#yourEuropeCategory')));
            allQuadsOfGraph = allQuadsOfGraph.filter(q => !q.predicate.equals(namedNode('http://www.w3.org/ns/shacl#order')));
            allQuadsOfGraph = allQuadsOfGraph.filter(q => !q.predicate.equals(namedNode('http://www.w3.org/2000/01/rdf-schema#seeAlso')));
            allQuadsOfGraph = allQuadsOfGraph.filter(q => !q.predicate.equals(namedNode('http://purl.org/dc/terms/source')));
            allQuadsOfGraph = allQuadsOfGraph.filter(q => !q.predicate.equals(namedNode('http://www.w3.org/ns/adms#status')));
            allQuadsOfGraph = allQuadsOfGraph.filter(q => !q.predicate.equals(namedNode('http://purl.org/dc/terms/type')));
            allQuadsOfGraph = allQuadsOfGraph.filter(q => !q.predicate.equals(namedNode('http://www.w3.org/1999/02/22-rdf-syntax-ns#type')));
            allQuadsOfGraph = allQuadsOfGraph.filter(q => !q.predicate.equals(namedNode('http://data.europa.eu/m8g/hasLegalResource')));
            allQuadsOfGraph = allQuadsOfGraph.filter(q => !q.predicate.equals(namedNode('http://purl.org/vocab/cpsv#produces')));
            allQuadsOfGraph = allQuadsOfGraph.filter(q => !q.predicate.equals(namedNode('http://data.europa.eu/m8g/thematicArea')));
            allQuadsOfGraph = allQuadsOfGraph.filter(q => !q.predicate.equals(namedNode('http://purl.org/vocab/cpsv#follows')));
            allQuadsOfGraph = allQuadsOfGraph.filter(q => !q.predicate.equals(namedNode('http://purl.org/dc/terms/spatial')));
            allQuadsOfGraph = allQuadsOfGraph.filter(q => !q.predicate.equals(namedNode('https://www.w3.org/ns/activitystreams#formerType')));
            allQuadsOfGraph = allQuadsOfGraph.filter(q => !q.predicate.equals(namedNode('http://mu.semte.ch/vocabularies/ext/reviewStatus')));
            allQuadsOfGraph = allQuadsOfGraph.filter(q => !q.predicate.equals(namedNode('http://data.europa.eu/m8g/hasContactPoint')));
            allQuadsOfGraph = allQuadsOfGraph.filter(q => !q.predicate.equals(namedNode('http://publications.europa.eu/resource/authority/language')));
            allQuadsOfGraph = allQuadsOfGraph.filter(q => !q.predicate.equals(namedNode('http://schema.org/startDate')));
            allQuadsOfGraph = allQuadsOfGraph.filter(q => !q.predicate.equals(namedNode('http://schema.org/endDate')));

            allQuadsOfGraph = allQuadsOfGraph.filter(q => !q.object.value.startsWith('http://data.lblod.info/id/website'));

            allQuadsOfGraph = allQuadsOfGraph.filter(q => !q.object.equals(namedNode('http://schema.org/WebSite')));
            allQuadsOfGraph = allQuadsOfGraph.filter(q => !q.object.equals(namedNode('http://data.europa.eu/m8g/Requirement')));
            allQuadsOfGraph = allQuadsOfGraph.filter(q => !q.object.equals(namedNode('http://data.europa.eu/m8g/Cost')));
            allQuadsOfGraph = allQuadsOfGraph.filter(q => !q.object.equals(namedNode('http://data.europa.eu/m8g/FinalncialAdvantage')));
            allQuadsOfGraph = allQuadsOfGraph.filter(q => !q.object.equals(namedNode('http://data.europa.eu/m8g/Procedure')));
            allQuadsOfGraph = allQuadsOfGraph.filter(q => !q.object.equals(namedNode('http://purl.org/vocab/cpsv#Rule')));

            allQuadsOfGraph = allQuadsOfGraph.filter(q => !q.object.equals(namedNode('https://productencatalogus.data.vlaanderen.be/ns/ipdc-lpdc#ConceptDisplayConfiguration')));
            allQuadsOfGraph = allQuadsOfGraph.filter(q => !q.object.equals(namedNode('https://productencatalogus.data.vlaanderen.be/ns/ipdc-lpdc#FormalInformalChoice')));
            allQuadsOfGraph = allQuadsOfGraph.filter(q => !q.subject.value.startsWith('http://data.lblod.info/id/conceptual-display-configuration/'));
            allQuadsOfGraph = allQuadsOfGraph.filter(q => !q.subject.value.startsWith('http://data.lblod.info/id/website/'));
            allQuadsOfGraph = allQuadsOfGraph.filter(q => !q.subject.value.startsWith('http://data.lblod.info/id/requirement/'));
            allQuadsOfGraph = allQuadsOfGraph.filter(q => !q.subject.value.startsWith('http://data.lblod.info/id/cost/'));
            allQuadsOfGraph = allQuadsOfGraph.filter(q => !q.subject.value.startsWith('http://data.lblod.info/form-data/'));
            allQuadsOfGraph = allQuadsOfGraph.filter(q => !q.subject.value.startsWith('http://data.lblod.info/id/formalInformalChoice/'));
            allQuadsOfGraph = allQuadsOfGraph.filter(q => !q.subject.value.startsWith('http://data.lblod.info/id/rule/'));
            allQuadsOfGraph = allQuadsOfGraph.filter(q => !q.subject.value.startsWith('http://data.lblod.info/id/evidence/'));


            const delayTime = 0;
            const numberOfLoops = 1;
            const averageTimes = [];
            const technicalErrors = [];
            const dataErrors = [];

            if (instanceIds.length > 0) {


                for (let i = 0; i < numberOfLoops; i++) {
                    let quadsFromRequeriedInstances: Statement[] = [];

                    const before = new Date().valueOf();

                    console.log(new Date().toISOString());

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
                    expect(sortedUniq(allRemainingQuadsOfGraphAsTurtle)).toEqual([]);

                    const averageTime = (new Date().valueOf() - before - delayTime * instanceIds.length) / instanceIds.length;
                    averageTimes.push(averageTime);

                    console.log(`Verifying in total ${instanceIds.length} instance took on average ${averageTime} ms per instance for bestuurseenheid ${bestuurseenheid.prefLabel}`);
                    // eslint-disable-next-line no-constant-condition

                }

                const totalAverageTime = averageTimes.reduce((accumulator, currentValue) => {
                    return accumulator + currentValue;
                }, 0) / averageTimes.length;
                console.log(`Total average time: ${totalAverageTime}`);
                console.log(`Technical Errors [${technicalErrors}]`);
                console.log(`Data Errors [${dataErrors}]`);

                expect(totalAverageTime).toBeLessThan(250);
                expect(technicalErrors).toEqual([]);

            }

        }
    }, 60000 * 15 * 100);

    function wait(milliseconds: number) {
        return new Promise(resolve => {
            setTimeout(resolve, milliseconds);
        });
    }

});