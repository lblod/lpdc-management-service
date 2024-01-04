import {END2END_TEST_SPARQL_ENDPOINT} from "../test.config";
import {DirectDatabaseAccess} from "../driven/persistence/direct-database-access";
import {PREFIX} from "../../config";
import {ConceptSnapshotSparqlTestRepository} from "../driven/persistence/concept-snapshot-sparql-test-repository";
import {shuffle} from "lodash";
import {SparqlQuerying} from "../../src/driven/persistence/sparql-querying";
import {DomainToTriplesMapper} from "../../src/driven/persistence/domain-to-triples-mapper";
import {asSortedArray, asSortedSet} from "../../src/core/domain/shared/collections-helper";
import {isLiteral, namedNode} from "rdflib";
import {Iri} from "../../src/core/domain/shared/iri";
import {
    DatastoreToQuadsRecursiveSparqlFetcher
} from "../../src/driven/persistence/datastore-to-quads-recursive-sparql-fetcher";

describe('Concept Snapshot Data Integrity Validation', () => {

    const endPoint = END2END_TEST_SPARQL_ENDPOINT; //Note: replace by END2END_TEST_SPARQL_ENDPOINT to verify all

    const repository = new ConceptSnapshotSparqlTestRepository(endPoint);
    const directDatabaseAccess = new DirectDatabaseAccess(endPoint);
    const sparqlQuerying = new SparqlQuerying(endPoint);
    const fetcher = new DatastoreToQuadsRecursiveSparqlFetcher(endPoint);
    const graph = 'http://mu.semte.ch/graphs/lpdc/ldes-data';
    const domainToTriplesMapper = new DomainToTriplesMapper();

    test.skip('Load all concept snapshots; print errors to console.log', async () => {

        const conceptSnapshotIdsQuery = `
             ${PREFIX.lpdcExt}
            SELECT ?id WHERE {
                GRAPH <${graph}> {
                    ?id a lpdcExt:ConceptualPublicService .
                }
            }
        `;
        const conceptSnapshotIds = await directDatabaseAccess.list(conceptSnapshotIdsQuery);

        const allTriplesOfGraphQuery = `
             ${PREFIX.lpdcExt}
            SELECT ?s ?p ?o WHERE {
                GRAPH <${graph}> {
                    ?s ?p ?o
                }
            }
        `;

        const allTriplesOfGraph = await directDatabaseAccess.list(allTriplesOfGraphQuery);
        const allQuadsOfGraph = new Set(sparqlQuerying.asQuads(allTriplesOfGraph, graph));

        //filter out fr and de language strings
        Array.from(allQuadsOfGraph).filter(q => isLiteral(q.object) && (q.object.language === 'de' || q.object.language === 'fr'))
            .forEach(q => allQuadsOfGraph.delete(q));

        //filter out the saving state of the ldes stream read
        Array.from(allQuadsOfGraph).filter(q => q.predicate.equals(namedNode('http://mu.semte.ch/vocabularies/ext/state')))
            .forEach(q => allQuadsOfGraph.delete(q));

        //filter out language on conceptSnapshot
        Array.from(allQuadsOfGraph).filter(q => q.predicate.equals(namedNode('https://publications.europa.eu/resource/authority/language')))
            .forEach(q => allQuadsOfGraph.delete(q));

        //filter out legal resources data (iri reference still exists)
        Array.from(allQuadsOfGraph).filter(q => q.subject.value.startsWith("https://codex.vlaanderen.be/"))
            .forEach(q => allQuadsOfGraph.delete(q));

        Array.from(allQuadsOfGraph).filter(q => q.subject.value.startsWith("https://ipdc.be/regelgeving"))
            .forEach(q => allQuadsOfGraph.delete(q));


        const delayTime = 0;
        const numberOfLoops = 1;
        const averageTimes = [];
        const technicalErrors = [];
        const dataErrors = [];

        for (let i = 0; i < numberOfLoops; i++) {
            let quadsFromRequeriedConceptSnapshots = [];

            const before = new Date().valueOf();

            console.log(new Date().toISOString());

            const randomizedConceptSnapshotIds = [...conceptSnapshotIds];
            shuffle(randomizedConceptSnapshotIds);

            for (const result of randomizedConceptSnapshotIds) {
                try {
                    const id = result['id'].value;
                    const conceptSnapshotForId = await repository.findById(id);
                    expect(conceptSnapshotForId.id).toEqual(id);
                    const quadsForConceptSnapshotForId =
                        new DomainToTriplesMapper().conceptSnapshotToTriples(conceptSnapshotForId);
                    quadsFromRequeriedConceptSnapshots =
                        [...quadsForConceptSnapshotForId, ...quadsFromRequeriedConceptSnapshots];
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

            const allRemainingQuadsOfGraphAsTurtle = new Set(Array.from(allQuadsOfGraph).map(q => q.toString()));
            quadsFromRequeriedConceptSnapshots.map(q => q.toString())
                .forEach(q => allRemainingQuadsOfGraphAsTurtle.delete(q));

            //uncomment when running against END2END_TEST_SPARQL_ENDPOINT
            //fs.writeFileSync(`/tmp/remaining-quads.txt`, Array.from(asSortedSet(allRemainingQuadsOfGraphAsTurtle)).join('\n'));
            expect(asSortedSet(allRemainingQuadsOfGraphAsTurtle)).toEqual(new Set());

            const averageTime = (new Date().valueOf() - before - delayTime * conceptSnapshotIds.length) / conceptSnapshotIds.length;
            averageTimes.push(averageTime);

            console.log(`Verifying in total ${conceptSnapshotIds.length} concept snapshots took on average ${averageTime} ms per concept`);
            // eslint-disable-next-line no-constant-condition
        }

        const totalAverageTime = averageTimes.reduce((accumulator, currentValue) => {
            return accumulator + currentValue;
        }, 0) / averageTimes.length;
        console.log(`Total average time: ${totalAverageTime}`);
        console.log(`Technical Errors [${technicalErrors}]`);
        console.log(`Data Errors Size [${dataErrors}]`);

        if (conceptSnapshotIds.length > 0) {
            expect(totalAverageTime).toBeLessThan(25);
            expect(technicalErrors).toEqual([]);
        }

    }, 60000 * 15 * 100);

    test.skip('Load one concept snapshot and print quads', async () => {
        const id: Iri = 'https://ipdc.vlaanderen.be/id/conceptsnapshot/0d2a2f5a-7213-483d-9fb9-abe0cbac0348';

        const allQuads = await fetcher.fetch(graph, id, [], [], []);
        console.log('recursive queries');
        const allQuadsAsStrings = asSortedArray(allQuads.map(q => q.toString()));
        console.log(allQuadsAsStrings.join('\n'));

        const conceptSnapshot = await repository.findById(id);
        const conceptSnapshotToTriples = domainToTriplesMapper.conceptSnapshotToTriples(conceptSnapshot);
        console.log('saving back');
        const allConceptSnapshotToTriplesAsStrings = asSortedArray(conceptSnapshotToTriples.map(q => q.toString()));
        console.log(allConceptSnapshotToTriplesAsStrings.join('\n'));

        expect(allQuadsAsStrings).toEqual(allConceptSnapshotToTriplesAsStrings);

    });

    function wait(milliseconds: number) {
        return new Promise(resolve => {
            setTimeout(resolve, milliseconds);
        });
    }


});