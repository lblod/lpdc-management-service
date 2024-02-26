import {END2END_TEST_SPARQL_ENDPOINT} from "../test.config";
import {DirectDatabaseAccess} from "../driven/persistence/direct-database-access";
import {InstanceSnapshotSparqlTestRepository} from "../driven/persistence/instance-snapshot-sparql-test-repository";
import {PREFIX, PUBLIC_GRAPH} from "../../config";
import {sparqlEscapeUri} from "../../mu-helper";
import {Iri} from "../../src/core/domain/shared/iri";
import {BestuurseenheidSparqlTestRepository} from "../driven/persistence/bestuurseenheid-sparql-test-repository";
import {DomainToQuadsMapper} from "../../src/driven/persistence/domain-to-quads-mapper";
import {namedNode, Statement} from "rdflib";
import {sortedUniq, uniq} from "lodash";
import {SparqlQuerying} from "../../src/driven/persistence/sparql-querying";

describe('Instance Snapshot Data Integrity Validation', () => {

    const endPoint = END2END_TEST_SPARQL_ENDPOINT; //Note: replace by END2END_TEST_SPARQL_ENDPOINT to verify all

    const sparqlQuerying = new SparqlQuerying(endPoint);
    const repository = new InstanceSnapshotSparqlTestRepository(endPoint);
    const bestuurseenheidRepository = new BestuurseenheidSparqlTestRepository(endPoint);
    const directDatabaseAccess = new DirectDatabaseAccess(endPoint);

    test('Query for each bestuurseenheid the instance snapshots in the ldes input graph', async () => {
        const bestuurseenheidsQuery = `
            ${PREFIX.besluit}
            SELECT ?id WHERE {
                GRAPH ${sparqlEscapeUri(PUBLIC_GRAPH)} {
                    ?id a besluit:Bestuurseenheid .
                }
            }
        `;
        const bestuurseenheidIds: Iri[] = (await directDatabaseAccess.list(bestuurseenheidsQuery)).map(result => new Iri(result['id'].value));

        const dataErrors = [];

        for (const bestuurseenheidId of bestuurseenheidIds) {
            try {
                const bestuurseenheid = await bestuurseenheidRepository.findById(bestuurseenheidId);

                const query = `
                    ${PREFIX.cpsv}
                    SELECT ?id WHERE {
                        GRAPH ${sparqlEscapeUri(bestuurseenheid.instanceSnapshotsLdesDataGraph())} {
                            ?id a cpsv:PublicService .
                        }
                    }
                `;
                const instanceSnapshotIds = (await directDatabaseAccess.list(query)).map(result => new Iri(result['id'].value));

                const allTriplesOfGraphQuery = `
                    ${PREFIX.lpdcExt}
                    SELECT ?s ?p ?o WHERE {
                        GRAPH ${sparqlEscapeUri(bestuurseenheid.instanceSnapshotsLdesDataGraph())} {
                            ?s ?p ?o
                        }
                    }`;

                const allTriplesOfGraph = await directDatabaseAccess.list(allTriplesOfGraphQuery);
                let allQuadsOfGraph: Statement[] = uniq(sparqlQuerying.asQuads(allTriplesOfGraph, bestuurseenheid.instanceSnapshotsLdesDataGraph().value));

                // filter out processed snapshots list
                allQuadsOfGraph = allQuadsOfGraph.filter(q => !q.predicate.equals(namedNode('http://mu.semte.ch/vocabularies/ext/processed')));

                // filter out ldes state
                allQuadsOfGraph = allQuadsOfGraph.filter(q => !q.predicate.equals(namedNode('http://mu.semte.ch/vocabularies/ext/state')));


                let quadsForQueriedInstanceSnapshots: Statement[] = [];

                for (const instanceSnapshotId of instanceSnapshotIds) {
                    try {

                        const instanceSnapshot = await repository.findById(bestuurseenheid, instanceSnapshotId);
                        expect(instanceSnapshot.id).toEqual(instanceSnapshotId);

                        const quadsForInstanceSnapshotForId = new DomainToQuadsMapper(bestuurseenheid.instanceSnapshotsLdesDataGraph())
                            .instanceSnapshotToQuads(instanceSnapshot);
                        quadsForQueriedInstanceSnapshots = [...quadsForInstanceSnapshotForId, ...quadsForQueriedInstanceSnapshots];

                    } catch (e) {
                        console.error(instanceSnapshotId);
                        console.error(e);
                        dataErrors.push(e);
                    }
                }

                const quadsFromRequeriedInstanceSnapshotsAsStrings = quadsForQueriedInstanceSnapshots.map(quad => quad.toString());

                const allRemainingQuadsOfGraphAsTurtle = allQuadsOfGraph
                    .map(q => q.toString())
                    .filter(q => !quadsFromRequeriedInstanceSnapshotsAsStrings.includes(q));

                expect(sortedUniq(allRemainingQuadsOfGraphAsTurtle)).toEqual([]);

            } catch (e) {
                console.log(e);
                dataErrors.push(e);
            }
        }

        expect(dataErrors).toEqual([]);

    }, 60000 * 15 * 100);


});