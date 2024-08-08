import {END2END_TEST_SPARQL_ENDPOINT} from "../test.config";
import {DirectDatabaseAccess} from "../driven/persistence/direct-database-access";
import {CONCEPT_SNAPSHOT_LDES_GRAPH, PREFIX} from "../../config";
import {ConceptSnapshotSparqlTestRepository} from "../driven/persistence/concept-snapshot-sparql-test-repository";
import {shuffle, sortedUniq, uniq} from "lodash";
import {SparqlQuerying} from "../../src/driven/persistence/sparql-querying";
import {DomainToQuadsMapper} from "../../src/driven/persistence/domain-to-quads-mapper";
import {asSortedArray} from "../../src/core/domain/shared/collections-helper";
import {isLiteral, namedNode, Statement} from "rdflib";
import {Iri} from "../../src/core/domain/shared/iri";
import {
    DatastoreToQuadsRecursiveSparqlFetcher
} from "../../src/driven/persistence/datastore-to-quads-recursive-sparql-fetcher";
import {NS} from "../../src/driven/persistence/namespaces";
import {sparqlEscapeUri} from "mu";
import fs from "fs";
import {sanitizeBooleans} from "./helpers/query-helpers";
import {ConceptCodeValidator, extractAllConceptCodesForConceptSnapshot,} from "./helpers/concept-code.validator";

describe('Concept Snapshot Data Integrity Validation', () => {

    const endPoint = END2END_TEST_SPARQL_ENDPOINT; //Note: replace by END2END_TEST_SPARQL_ENDPOINT to verify all

    const repository = new ConceptSnapshotSparqlTestRepository(endPoint);
    const directDatabaseAccess = new DirectDatabaseAccess(endPoint);
    const sparqlQuerying = new SparqlQuerying(endPoint);
    const fetcher = new DatastoreToQuadsRecursiveSparqlFetcher(endPoint);
    const graph = new Iri(CONCEPT_SNAPSHOT_LDES_GRAPH);
    const domainToQuadsMapper = new DomainToQuadsMapper(graph);

    test.skip('Load all concept snapshots; print errors to console.log', async () => {

        const conceptCodeValidator = new ConceptCodeValidator(sparqlQuerying);

        const conceptSnapshotIdsQuery = `
             ${PREFIX.lpdcExt}
            SELECT ?id WHERE {
                GRAPH ${sparqlEscapeUri(graph)} {
                    ?id a lpdcExt:ConceptualPublicServiceSnapshot .
                }
            }
        `;
        const conceptSnapshotIds = await directDatabaseAccess.list(conceptSnapshotIdsQuery);

        console.log(`Verifying ${conceptSnapshotIds.length} concept snapshots`);

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

        allQuadsOfGraph = sanitizeBooleans(allQuadsOfGraph);

        //filter out en, fr and de language strings
        allQuadsOfGraph = allQuadsOfGraph.filter(q => !(isLiteral(q.object) && (q.object.language === 'de' || q.object.language === 'fr' || q.object.language === 'en')));

        //filter out languages of the ldes stream read
        allQuadsOfGraph = allQuadsOfGraph.filter(q => !q.predicate.equals(namedNode('http://purl.org/dc/terms/language')));

        //filter out the saving state of the ldes stream read
        allQuadsOfGraph = allQuadsOfGraph.filter(q => !q.predicate.equals(namedNode('http://mu.semte.ch/vocabularies/ext/state')));

        //we don't use https://productencatalogus.data.vlaanderen.be/ns/ipdc-lpdc#snapshotType anymore ...
        allQuadsOfGraph = allQuadsOfGraph.filter(q => !q.predicate.equals(namedNode('https://productencatalogus.data.vlaanderen.be/ns/ipdc-lpdc#snapshotType')));

        const averageTimes = [];
        const technicalErrors = [];
        const dataErrors = [];

        let quadsFromRequeriedConceptSnapshots: Statement[] = [];

        const before = new Date().valueOf();

        console.log(new Date().toISOString());

        const randomizedConceptSnapshotIds = shuffle([...conceptSnapshotIds]);

        for (const result of randomizedConceptSnapshotIds) {
            try {
                const id = new Iri(result['id'].value);
                const conceptSnapshotForId = await repository.findById(id);
                expect(conceptSnapshotForId.id).toEqual(id);
                const quadsForConceptSnapshotForId =
                    new DomainToQuadsMapper(graph).conceptSnapshotToQuads(conceptSnapshotForId);
                quadsFromRequeriedConceptSnapshots =
                    [...quadsForConceptSnapshotForId, ...quadsFromRequeriedConceptSnapshots];

                await conceptCodeValidator.validateConceptCodes(extractAllConceptCodesForConceptSnapshot(domainToQuadsMapper, conceptSnapshotForId));

            } catch (e) {
                console.error(e);
                if (!e.message.startsWith('could not map')) {
                    console.error(e);
                    technicalErrors.push(e);
                } else {
                    dataErrors.push(e);
                }
            }
        }
        const quadsFromRequeriedConceptSnapshotsAsStrings = quadsFromRequeriedConceptSnapshots.map(quad => quad.toString());

        const allRemainingQuadsOfGraphAsTurtle = allQuadsOfGraph
            .map(q => q.toString())
            .filter(q => !quadsFromRequeriedConceptSnapshotsAsStrings.includes(q));

        //uncomment when running against END2END_TEST_SPARQL_ENDPOINT
        fs.writeFileSync(`/tmp/remaining-quads-concept-snapshot.txt`, sortedUniq(allRemainingQuadsOfGraphAsTurtle).join('\n'));
        expect(sortedUniq(allRemainingQuadsOfGraphAsTurtle)).toEqual([]);

        const averageTime = ((new Date().valueOf() - before) * conceptSnapshotIds.length) / conceptSnapshotIds.length;
        averageTimes.push(averageTime);

        console.log(`Verifying in total ${conceptSnapshotIds.length} concept snapshots took on average ${averageTime} ms per concept`);
        // eslint-disable-next-line no-constant-condition

        const totalAverageTime = averageTimes.reduce((accumulator, currentValue) => {
            return accumulator + currentValue;
        }, 0) / averageTimes.length;
        console.log(`Total average time: ${totalAverageTime}`);
        console.log(`Technical Errors [${technicalErrors}]`);
        console.log(`Data Errors Size [${dataErrors}]`);

        if (conceptSnapshotIds.length > 0) {
            expect(technicalErrors).toEqual([]);
            expect(totalAverageTime).toBeLessThan(35);
        }

    }, 60000 * 15 * 100 * 10);

    test.skip('Load one concept snapshot and print quads', async () => {
        const id = new Iri('https://ipdc.vlaanderen.be/id/conceptsnapshot/ca9849fd-c842-4950-8dfe-baa347e0879a');

        const allQuads = await fetcher.fetch(graph, id, [],
            [
                NS.m8g('hasLegalResource').value,
            ],
            [
                NS.skos('Concept').value,
                NS.lpdcExt('ConceptDisplayConfiguration').value,
                NS.besluit('Bestuurseenheid').value,
                NS.m8g('PublicOrganisation').value,
            ]);
        console.log('recursive queries');
        const allQuadsAsStrings = asSortedArray(allQuads.map(q => q.toString()));
        console.log(allQuadsAsStrings.join('\n'));

        const conceptSnapshot = await repository.findById(id);
        const conceptSnapshotToQuads = domainToQuadsMapper.conceptSnapshotToQuads(conceptSnapshot);
        console.log('saving back');
        const allConceptSnapshotToQuadsAsStrings = asSortedArray(conceptSnapshotToQuads.map(q => q.toString()));
        console.log(allConceptSnapshotToQuadsAsStrings.join('\n'));

        expect(allQuadsAsStrings).toEqual(allConceptSnapshotToQuadsAsStrings);

    });

});
