import {END2END_TEST_SPARQL_ENDPOINT} from "../test.config";
import {DirectDatabaseAccess} from "../driven/persistence/direct-database-access";
import {PREFIX} from "../../config";
import {ConceptVersieSparqlTestRepository} from "../driven/persistence/concept-versie-sparql-test-repository";
import {shuffle} from "lodash";
import {SparqlQuerying} from "../../src/driven/persistence/sparql-querying";
import {DomainToTriplesMapper} from "../../src/driven/persistence/domain-to-triples-mapper";
import {asSortedArray, asSortedSet} from "../../src/core/domain/shared/collections-helper";
import fs from "fs";
import {isLiteral, namedNode} from "rdflib";
import {Iri} from "../../src/core/domain/shared/iri";
import {
    DatastoreToQuadsRecursiveSparqlFetcher
} from "../../src/driven/persistence/datastore-to-quads-recursive-sparql-fetcher";

describe('Concept Versie Data Integrity Validation', () => {

    const endPoint = END2END_TEST_SPARQL_ENDPOINT; //Note: replace by END2END_TEST_SPARQL_ENDPOINT to verify all

    const repository = new ConceptVersieSparqlTestRepository(endPoint);
    const directDatabaseAccess = new DirectDatabaseAccess(endPoint);
    const sparqlQuerying = new SparqlQuerying(endPoint);
    const fetcher = new DatastoreToQuadsRecursiveSparqlFetcher(endPoint);
    const graph = 'http://mu.semte.ch/graphs/lpdc/ldes-data';
    const domainToTriplesMapper = new DomainToTriplesMapper();

    //TODO LPDC-916: using a story representation for each queried -> verify with all the raw triples, queried directly from the database -> to ascertain we queried all data ...
    //TODO LPDC-916: load data concurrently ... using PromisePool (10 concurrent users, but each of them with a kinda random wait; so to simulate n concurrent users )
    //TODO LPDC-916: load data from ldes stream of production dump and verify results ...

    test.skip('Load all concept versies; print errors to console.log', async () => {

        const conceptVersieIdsQuery = `
             ${PREFIX.lpdcExt}
            SELECT ?id WHERE {
                GRAPH <${graph}> {
                    ?id a lpdcExt:ConceptualPublicService .
                }
            }
        `;
        const conceptVersieIds = await directDatabaseAccess.list(conceptVersieIdsQuery);

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

        //filter out legal resources
        Array.from(allQuadsOfGraph).filter(q => q.subject.value.startsWith("https://codex.vlaanderen.be/") || q.predicate.equals(namedNode('http://data.europa.eu/m8g/hasLegalResource')))
            .forEach(q => allQuadsOfGraph.delete(q));

        const delayTime = 0;
        const numberOfLoops = 1;
        const averageTimes = [];
        const technicalErrors = [];
        const dataErrors = [];

        for(let i = 0; i < numberOfLoops; i++) {
            let quadsFromRequeriedConceptVersies = [];

            const before = new Date().valueOf();

            console.log(new Date().toISOString());

            const randomizedConceptVersieIds = [...conceptVersieIds];
            shuffle(randomizedConceptVersieIds);

            for (const result of randomizedConceptVersieIds) {
                try {
                    const id = result['id'].value;
                    const conceptVersieForId = await repository.findById(id);
                    expect(conceptVersieForId.id).toEqual(id);
                    const quadsForConceptVersieForId =
                        new DomainToTriplesMapper().conceptVersieToTriples(conceptVersieForId);
                    quadsFromRequeriedConceptVersies =
                        [...quadsForConceptVersieForId, ...quadsFromRequeriedConceptVersies];
                } catch(e) {
                    console.error(e);
                    if(!e.message.startsWith('could not map')) {
                        console.error(e);
                        technicalErrors.push(e);
                    } else {
                        dataErrors.push(e);
                    }
                }
                await wait(delayTime);
            }

            const allQuadsOfGraphAsTurtle = new Set(Array.from(allQuadsOfGraph).map(q => q.toString()));
            quadsFromRequeriedConceptVersies.map(q => q.toString())
                .forEach(q => allQuadsOfGraphAsTurtle.delete(q));

            //uncomment when running against END2END_TEST_SPARQL_ENDPOINT
            fs.writeFileSync(`/tmp/remaining-quads.txt`, Array.from(asSortedSet(allQuadsOfGraphAsTurtle)).join('\n'));
            //expect(asSortedSet(allQuadsOfGraphAsSet)).toEqual(new Set());

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

    test.skip('Load one concept versie and print quads', async() => {
        const id: Iri = 'https://ipdc.vlaanderen.be/id/conceptsnapshot/00215468-5567-41a0-8e3b-3eb3ef62c33f';

        const allQuads = await fetcher.fetch(graph, id);
        console.log('recursive queries');
        const allQuadsAsStrings = asSortedArray(allQuads.map(q => q.toString()));
        console.log(allQuadsAsStrings.join('\n'));

        const conceptVersie = await repository.findById(id);
        const conceptVersieToTriples = domainToTriplesMapper.conceptVersieToTriples(conceptVersie);
        console.log('saving back');
        const allConceptVersieToTriplesAsStrings = asSortedArray(conceptVersieToTriples.map(q => q.toString()));
        console.log(allConceptVersieToTriplesAsStrings.join('\n'));

        expect(allQuadsAsStrings).toEqual(allConceptVersieToTriplesAsStrings);

    });

    function wait(milliseconds: number) {
        return new Promise(resolve => {
            setTimeout(resolve, milliseconds);
        });
    }


});