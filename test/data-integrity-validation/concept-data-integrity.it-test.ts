import {END2END_TEST_SPARQL_ENDPOINT} from "../test.config";
import {DirectDatabaseAccess} from "../driven/persistence/direct-database-access";
import {SparqlQuerying} from "../../src/driven/persistence/sparql-querying";
import {DomainToTriplesMapper} from "../../src/driven/persistence/domain-to-triples-mapper";
import {CONCEPT_GRAPH, PREFIX} from "../../config";
import {Statement} from "rdflib";
import {shuffle, sortedUniq, uniq} from "lodash";
import {ConceptSnapshotSparqlRepository} from "../../src/driven/persistence/concept-snapshot-sparql-repository";
import {ConceptSparqlRepository} from "../../src/driven/persistence/concept-sparql-repository";
import {Iri} from "../../src/core/domain/shared/iri";

describe('Concept Data Integrity Validation', () => {

    const endPoint = END2END_TEST_SPARQL_ENDPOINT; //Note: replace by END2END_TEST_SPARQL_ENDPOINT to verify all

    const repository = new ConceptSparqlRepository(endPoint);
    const snapshotRepository = new ConceptSnapshotSparqlRepository(endPoint);
    const directDatabaseAccess = new DirectDatabaseAccess(endPoint);
    const sparqlQuerying = new SparqlQuerying(endPoint);
    const graph = CONCEPT_GRAPH;
    const domainToTriplesMapper = new DomainToTriplesMapper();

    test.skip('Load all concepts; print errors to console.log', async () => {

        const conceptIdsQuery = `
            ${PREFIX.lpdcExt}
            SELECT ?id WHERE {
                GRAPH <${graph}> {
                    ?id a lpdcExt:ConceptualPublicService .
                }
            }
        `;
        const conceptIds = await directDatabaseAccess.list(conceptIdsQuery);

        const allTriplesOfGraphQuery = `
             ${PREFIX.lpdcExt}
            SELECT ?s ?p ?o WHERE {
                GRAPH <${graph}> {
                    ?s ?p ?o
                }
            }
        `;

        const allTriplesOfGraph = await directDatabaseAccess.list(allTriplesOfGraphQuery);
        let allQuadsOfGraph: Statement[] = uniq(sparqlQuerying.asQuads(allTriplesOfGraph, graph));

        //filter out all triples linked to account subjects
        allQuadsOfGraph = allQuadsOfGraph.filter(q => !q.subject.value.startsWith('http://data.lblod.info/id/account/'));

        //filter out all triples linked to adressen subjects
        allQuadsOfGraph = allQuadsOfGraph.filter(q => !q.subject.value.startsWith('http://data.lblod.info/id/adressen/'))

        //filter out all triples linked to persoon subjects
        allQuadsOfGraph.filter(q => !q.subject.value.startsWith('http://data.lblod.info/id/persoon/'))

        //filter out all triples linked to bestuurseenheden subjects
        allQuadsOfGraph = allQuadsOfGraph.filter(q => !q.subject.value.startsWith('http://data.lblod.info/id/bestuurseenheden/'))

        //filter out all triples linked to werkingsgebieden subjects
        allQuadsOfGraph = allQuadsOfGraph.filter(q => !q.subject.value.startsWith('http://data.lblod.info/id/werkingsgebieden/'))

        //filter out all triples linked to werkingsgebieden subjects
        allQuadsOfGraph = allQuadsOfGraph.filter(q => !q.subject.value.startsWith('http://data.lblod.info/werkingsgebieden/id/'))

        //filter out all triples linked to BestuurseenheidClassificatieCode subjects
        allQuadsOfGraph = allQuadsOfGraph.filter(q => !q.subject.value.startsWith('http://data.vlaanderen.be/id/concept/BestuurseenheidClassificatieCode/'))

        //filter out all triples linked to http://lblod.data.gift/concept-schemes/ subjects
        allQuadsOfGraph = allQuadsOfGraph.filter(q => !q.subject.value.startsWith('http://lblod.data.gift/concept-schemes/'))

        //filter out all triples linked to http://lblod.data.gift/concepts/ subjects
        allQuadsOfGraph = allQuadsOfGraph.filter(q => !q.subject.value.startsWith('http://lblod.data.gift/concepts/'))

        //filter out all triples linked to http://vocab.belgif.be/auth/refnis2019/ subjects
        allQuadsOfGraph = allQuadsOfGraph.filter(q => !q.subject.value.startsWith('http://vocab.belgif.be/auth/refnis2019/'))

        //filter out all triples linked to https://productencatalogus.data.vlaanderen.be/id/concept/ subjects
        allQuadsOfGraph = allQuadsOfGraph.filter(q => !q.subject.value.startsWith('https://productencatalogus.data.vlaanderen.be/id/concept/'))

        //filter out all triples linked to https://productencatalogus.data.vlaanderen.be/id/conceptscheme/ subjects
        allQuadsOfGraph = allQuadsOfGraph.filter(q => !q.subject.value.startsWith('https://productencatalogus.data.vlaanderen.be/id/conceptscheme/'))

        //filter out all triples linked to https://data.vlaanderen.be/id/organisatie/ subjects
        allQuadsOfGraph = allQuadsOfGraph.filter(q => !q.subject.value.startsWith('https://data.vlaanderen.be/id/organisatie/'))

        //filter out all triples linked to http://lblod.data.gift/vocabularies/lpdc-ipdc/IPDCLocaties subjects
        allQuadsOfGraph = allQuadsOfGraph.filter(q => !q.subject.value.startsWith('http://lblod.data.gift/vocabularies/lpdc-ipdc/IPDCLocaties'))

        //filter out all triples linked to http://publications.europa.eu/resource/authority/language/ subjects
        allQuadsOfGraph = allQuadsOfGraph.filter(q => !q.subject.value.startsWith('http://publications.europa.eu/resource/authority/language/'))


        const delayTime = 0;
        const numberOfLoops = 1;
        const alsoLoadRelatedConceptSnapshots = true;
        const averageTimes = [];
        const technicalErrors = [];
        const dataErrors = [];

        for (let i = 0; i < numberOfLoops; i++) {
            let quadsFromRequeriedConcepts = [];

            const before = new Date().valueOf();

            console.log(new Date().toISOString());

            const randomizedConceptIds = [...conceptIds];
            shuffle(randomizedConceptIds);

            for (const result of randomizedConceptIds) {
                try {
                    const id = new Iri(result['id'].value);
                    const conceptForId = await repository.findById(id);
                    expect(conceptForId.id).toEqual(id);
                    const quadsForConceptForId =
                        domainToTriplesMapper.conceptToTriples(conceptForId);
                    quadsFromRequeriedConcepts =
                        [...quadsForConceptForId, ...quadsFromRequeriedConcepts];

                    if(alsoLoadRelatedConceptSnapshots) {
                        const latestConceptSnapshot = await snapshotRepository.findById(conceptForId.latestConceptSnapshot);
                        expect(latestConceptSnapshot.id).toEqual(conceptForId.latestConceptSnapshot);
                        expect(latestConceptSnapshot.isVersionOfConcept).toEqual(id);

                        for(const eachPreviousConceptSnapshotId of conceptForId.previousConceptSnapshots) {
                            const previousConceptSnapshot = await snapshotRepository.findById(eachPreviousConceptSnapshotId);
                            expect(previousConceptSnapshot.id).toEqual(eachPreviousConceptSnapshotId);
                            expect(previousConceptSnapshot.isVersionOfConcept).toEqual(id);
                        }

                        const latestFunctionallyChangedConceptSnapshot = await snapshotRepository.findById((conceptForId.latestFunctionallyChangedConceptSnapshot));
                        expect(latestFunctionallyChangedConceptSnapshot.id).toEqual(conceptForId.latestFunctionallyChangedConceptSnapshot);
                        expect(latestFunctionallyChangedConceptSnapshot.isVersionOfConcept).toEqual(id);
                    }
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

            const allRemainingQuadsOfGraphAsTurtle = allQuadsOfGraph
                .map(q => q.toString())
                .filter(q => !quadsFromRequeriedConcepts.includes(q));

            //uncomment when running against END2END_TEST_SPARQL_ENDPOINT
            //fs.writeFileSync(`/tmp/remaining-quads-concept.txt`, sortedUniq(allRemainingQuadsOfGraphAsTurtle).join('\n'));
            expect(sortedUniq(allRemainingQuadsOfGraphAsTurtle)).toEqual([]);

            const averageTime = (new Date().valueOf() - before - delayTime * conceptIds.length) / conceptIds.length;
            averageTimes.push(averageTime);

            console.log(`Verifying in total ${conceptIds.length} concept took on average ${averageTime} ms per concept`);
            // eslint-disable-next-line no-constant-condition
        }

        const totalAverageTime = averageTimes.reduce((accumulator, currentValue) => {
            return accumulator + currentValue;
        }, 0) / averageTimes.length;
        console.log(`Total average time: ${totalAverageTime}`);
        console.log(`Technical Errors [${technicalErrors}]`);
        console.log(`Data Errors [${dataErrors}]`);

        if (conceptIds.length > 0) {
            expect(totalAverageTime).toBeLessThan(25);
            expect(technicalErrors).toEqual([]);
        }

    }, 60000 * 15 * 100);

    function wait(milliseconds: number) {
        return new Promise(resolve => {
            setTimeout(resolve, milliseconds);
        });
    }

});