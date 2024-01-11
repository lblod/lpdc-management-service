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
import {asSortedArray} from "../../src/core/domain/shared/collections-helper";
import {
    DatastoreToQuadsRecursiveSparqlFetcher
} from "../../src/driven/persistence/datastore-to-quads-recursive-sparql-fetcher";
import {NS} from "../../src/driven/persistence/namespaces";
import {sparqlEscapeUri} from "../../mu-helper";

describe('Concept Data Integrity Validation', () => {

    const endPoint = END2END_TEST_SPARQL_ENDPOINT; //Note: replace by END2END_TEST_SPARQL_ENDPOINT to verify all

    const repository = new ConceptSparqlRepository(endPoint);
    const snapshotRepository = new ConceptSnapshotSparqlRepository(endPoint);
    const directDatabaseAccess = new DirectDatabaseAccess(endPoint);
    const sparqlQuerying = new SparqlQuerying(endPoint);
    const graph = new Iri(CONCEPT_GRAPH);
    const domainToTriplesMapper = new DomainToTriplesMapper(graph);

    test.skip('Load all concepts; print errors to console.log', async () => {

        const conceptIdsQuery = `
            ${PREFIX.lpdcExt}
            SELECT ?id WHERE {
                GRAPH ${sparqlEscapeUri(graph)} {
                    ?id a lpdcExt:ConceptualPublicService .
                }
            }
        `;
        const conceptIds = await directDatabaseAccess.list(conceptIdsQuery);

        const allTriplesOfGraphQuery = `
             ${PREFIX.lpdcExt}
            SELECT ?s ?p ?o WHERE {
                GRAPH ${sparqlEscapeUri(graph)} {
                    ?s ?p ?o
                }
            }
        `;

        const allTriplesOfGraph = await directDatabaseAccess.list(allTriplesOfGraphQuery);
        let allQuadsOfGraph: Statement[] = uniq(sparqlQuerying.asQuads(allTriplesOfGraph, graph.value));

        //filter out all triples linked to account subjects
        allQuadsOfGraph = allQuadsOfGraph.filter(q => !q.subject.value.startsWith('http://data.lblod.info/id/account/'));

        //filter out all triples linked to adressen subjects
        allQuadsOfGraph = allQuadsOfGraph.filter(q => !q.subject.value.startsWith('http://data.lblod.info/id/adressen/'));

        //filter out all triples linked to persoon subjects
        allQuadsOfGraph = allQuadsOfGraph.filter(q => !q.subject.value.startsWith('http://data.lblod.info/id/persoon/'));

        //filter out all triples linked to bestuurseenheden subjects
        allQuadsOfGraph = allQuadsOfGraph.filter(q => !q.subject.value.startsWith('http://data.lblod.info/id/bestuurseenheden/'));

        //filter out all triples linked to werkingsgebieden subjects
        allQuadsOfGraph = allQuadsOfGraph.filter(q => !q.subject.value.startsWith('http://data.lblod.info/id/werkingsgebieden/'));

        //filter out all triples linked to werkingsgebieden subjects
        allQuadsOfGraph = allQuadsOfGraph.filter(q => !q.subject.value.startsWith('http://data.lblod.info/werkingsgebieden/id/'));

        //filter out all triples linked to BestuurseenheidClassificatieCode subjects
        allQuadsOfGraph = allQuadsOfGraph.filter(q => !q.subject.value.startsWith('http://data.vlaanderen.be/id/concept/BestuurseenheidClassificatieCode/'));

        //filter out all triples linked to http://lblod.data.gift/concept-schemes/ subjects
        allQuadsOfGraph = allQuadsOfGraph.filter(q => !q.subject.value.startsWith('http://lblod.data.gift/concept-schemes/'));

        //filter out all triples linked to http://lblod.data.gift/concepts/ subjects
        allQuadsOfGraph = allQuadsOfGraph.filter(q => !q.subject.value.startsWith('http://lblod.data.gift/concepts/'));

        //filter out all triples linked to http://vocab.belgif.be/auth/refnis2019/ subjects
        allQuadsOfGraph = allQuadsOfGraph.filter(q => !q.subject.value.startsWith('http://vocab.belgif.be/auth/refnis2019/'));

        //filter out all triples linked to https://productencatalogus.data.vlaanderen.be/id/concept/ subjects
        allQuadsOfGraph = allQuadsOfGraph.filter(q => !q.subject.value.startsWith('https://productencatalogus.data.vlaanderen.be/id/concept/'));

        //filter out all triples linked to https://productencatalogus.data.vlaanderen.be/id/conceptscheme/ subjects
        allQuadsOfGraph = allQuadsOfGraph.filter(q => !q.subject.value.startsWith('https://productencatalogus.data.vlaanderen.be/id/conceptscheme/'));

        //filter out all triples linked to https://data.vlaanderen.be/id/organisatie/ subjects
        allQuadsOfGraph = allQuadsOfGraph.filter(q => !q.subject.value.startsWith('https://data.vlaanderen.be/id/organisatie/'));

        //filter out all triples linked to http://lblod.data.gift/vocabularies/lpdc-ipdc/IPDCLocaties subjects
        allQuadsOfGraph = allQuadsOfGraph.filter(q => !q.subject.value.startsWith('http://lblod.data.gift/vocabularies/lpdc-ipdc/IPDCLocaties'));

        //filter out all triples linked to http://publications.europa.eu/resource/authority/language/ subjects
        allQuadsOfGraph = allQuadsOfGraph.filter(q => !q.subject.value.startsWith('http://publications.europa.eu/resource/authority/language/'));


        const delayTime = 0;
        const numberOfLoops = 1;
        const alsoLoadRelatedConceptSnapshots = true;
        const averageTimes = [];
        const technicalErrors = [];
        const dataErrors = [];

        for (let i = 0; i < numberOfLoops; i++) {
            let quadsFromRequeriedConcepts: Statement[] = [];

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

                    if (alsoLoadRelatedConceptSnapshots) {
                        const latestConceptSnapshot = await snapshotRepository.findById(conceptForId.latestConceptSnapshot);
                        expect(latestConceptSnapshot.id).toEqual(conceptForId.latestConceptSnapshot);
                        expect(latestConceptSnapshot.isVersionOfConcept).toEqual(id);

                        for (const eachPreviousConceptSnapshotId of conceptForId.previousConceptSnapshots) {
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

            const quadsFromRequeriedConceptsAsStrings = quadsFromRequeriedConcepts.map(quad => quad.toString());

            const allRemainingQuadsOfGraphAsTurtle = allQuadsOfGraph
                .map(q => q.toString())
                .filter(q => !quadsFromRequeriedConceptsAsStrings.includes(q));

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
            expect(totalAverageTime).toBeLessThan(250);
            expect(technicalErrors).toEqual([]);
        }

    }, 60000 * 15 * 100);

    test.skip('Load one concept and print quads', async () => {
        const id = new Iri('https://ipdc.vlaanderen.be/id/concept/0b0b6fe0-995a-49ef-a596-3267d9bf5c97');
        const fetcher = new DatastoreToQuadsRecursiveSparqlFetcher(endPoint);

        const allQuads = await fetcher.fetch(graph, id, [
                NS.lpdcExt('hasConceptDisplayConfiguration').value,
            ],
            [
                NS.lpdcExt('yourEuropeCategory').value,
                NS.lpdcExt('targetAudience').value,
                NS.m8g('thematicArea').value,
                NS.lpdcExt('competentAuthorityLevel').value,
                NS.m8g('hasCompetentAuthority').value,
                NS.lpdcExt('executingAuthorityLevel').value,
                NS.lpdcExt('hasExecutingAuthority').value,
                NS.lpdcExt('publicationMedium').value,
                NS.dct("type").value,
                NS.lpdcExt("conceptTag").value,
                NS.adms('status').value,
                NS.m8g('hasLegalResource').value,
            ],
            [
                NS.skos('Concept').value,
                NS.lpdcExt('ConceptDisplayConfiguration').value,
                NS.besluit('Bestuurseenheid').value,
                NS.m8g('PublicOrganisation').value,
                NS.eli('LegalResource').value,
                NS.eliIncorrectlyInDatabase('LegalResource').value,
            ]);
        console.log('recursive queries');
        const allQuadsAsStrings = asSortedArray(allQuads.map(q => q.toString()));
        console.log(allQuadsAsStrings.join('\n'));

        const concept = await repository.findById(id);
        const conceptToTriples = domainToTriplesMapper.conceptToTriples(concept);
        console.log('saving back');
        const allConceptsToTriplesAsStrings = asSortedArray(conceptToTriples.map(q => q.toString()));
        console.log(allConceptsToTriplesAsStrings.join('\n'));

        expect(allQuadsAsStrings).toEqual(allConceptsToTriplesAsStrings);

    });

    function wait(milliseconds: number) {
        return new Promise(resolve => {
            setTimeout(resolve, milliseconds);
        });
    }

});