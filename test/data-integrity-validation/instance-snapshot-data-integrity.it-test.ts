import {END2END_TEST_SPARQL_ENDPOINT} from "../test.config";
import {DirectDatabaseAccess} from "../driven/persistence/direct-database-access";
import {InstanceSnapshotSparqlTestRepository} from "../driven/persistence/instance-snapshot-sparql-test-repository";
import {INSTANCE_SNAPHOT_LDES_GRAPH, PREFIX} from "../../config";
import {sparqlEscapeUri} from "../../mu-helper";
import {Iri} from "../../src/core/domain/shared/iri";
import {DomainToQuadsMapper} from "../../src/driven/persistence/domain-to-quads-mapper";
import {isLiteral, namedNode, Statement} from "rdflib";
import {sortedUniq, uniq} from "lodash";
import {SparqlQuerying} from "../../src/driven/persistence/sparql-querying";

//TODO LPDC-981: fix test
describe('Instance Snapshot Data Integrity Validation', () => {

    const endPoint = END2END_TEST_SPARQL_ENDPOINT; //Note: replace by END2END_TEST_SPARQL_ENDPOINT to verify all

    const sparqlQuerying = new SparqlQuerying(endPoint);
    const repository = new InstanceSnapshotSparqlTestRepository(endPoint);
    const directDatabaseAccess = new DirectDatabaseAccess(endPoint);

    test.skip('Query for each bestuurseenheid the instance snapshots in the ldes input graph', async () => {
        const dataErrors = [];

        try {

            const instanceSnapshots = await findAllInstanceSnapshots();

            const instanceSnapshotGraphs = sortedUniq(instanceSnapshots.map(is => is.instanceSnapshotGraph));

            for (const instanceSnapshotGraph of instanceSnapshotGraphs) {

                const allTriplesOfGraphQuery = `
                        ${PREFIX.lpdcExt}
                        SELECT ?s ?p ?o WHERE {
                            GRAPH ${sparqlEscapeUri(instanceSnapshotGraph)} {
                                ?s ?p ?o
                            }
                        }`;

                const allTriplesOfGraph = await directDatabaseAccess.list(allTriplesOfGraphQuery);
                let allQuadsOfGraph: Statement[] = uniq(sparqlQuerying.asQuads(allTriplesOfGraph, instanceSnapshotGraph.value));

                //map booleans
                allQuadsOfGraph.map(q => {
                    if (isLiteral(q.object) && q.object.datatype.value === 'http://www.w3.org/2001/XMLSchema#boolean') {
                        q.object.value === "1" ? q.object.value = "true" : q.object.value = "false";
                    }
                    return q;
                });

                // filter out processed snapshots list
                allQuadsOfGraph = allQuadsOfGraph.filter(q => !q.predicate.equals(namedNode('http://mu.semte.ch/vocabularies/ext/processed')));

                // filter out ldes state
                allQuadsOfGraph = allQuadsOfGraph.filter(q => !q.predicate.equals(namedNode('http://mu.semte.ch/vocabularies/ext/state')));


                let quadsForQueriedInstanceSnapshots: Statement[] = [];

                const instanceSnapshotIds = instanceSnapshots
                    .filter(is => is.instanceSnapshotGraph === instanceSnapshotGraph)
                    .map(is => is.instanceSnapshotId);

                for (const instanceSnapshotId of instanceSnapshotIds) {
                    try {

                        const instanceSnapshot = await repository.findById(instanceSnapshotGraph, instanceSnapshotId);
                        expect(instanceSnapshot.id).toEqual(instanceSnapshotId);

                        const quadsForInstanceSnapshotForId = new DomainToQuadsMapper(instanceSnapshotGraph)
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
            }

        } catch (e) {
            console.log(e);
            dataErrors.push(e);
        }

        expect(dataErrors).toEqual([]);

    }, 60000 * 15 * 100);

    //inspired by instance-snapshot-sparql-repository>findToProcessInstanceSnapshots
    async function findAllInstanceSnapshots(): Promise<{ bestuurseenheidId: Iri, instanceSnapshotGraph: Iri, instanceSnapshotId: Iri }[]> {
        const query = `
            SELECT ?instanceSnapshotIri ?createdBy ?instanceSnapshotGraph WHERE {
                GRAPH ?instanceSnapshotGraph {
                     ?instanceSnapshotIri a <https://productencatalogus.data.vlaanderen.be/ns/ipdc-lpdc#InstancePublicServiceSnapshot> .
                     ?instanceSnapshotIri <http://purl.org/pav/createdBy> ?createdBy .
                     ?instanceSnapshotIri <http://www.w3.org/ns/prov#generatedAtTime> ?generatedAtTime .
                }
                FILTER(STRSTARTS(STR(?instanceSnapshotGraph), "${INSTANCE_SNAPHOT_LDES_GRAPH()}"))
            } ORDER BY ?generatedAtTime
        `;

        const result = await sparqlQuerying.list(query);

        return result.map(item => ({
            bestuurseenheidId: new Iri(item['createdBy'].value),
            instanceSnapshotGraph: new Iri(item['instanceSnapshotGraph'].value),
            instanceSnapshotId: new Iri(item['instanceSnapshotIri'].value)
        }));
    }


});