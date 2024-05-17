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
import {sanitizeBooleans} from "./helpers/query-helpers";
import {ConceptCodeValidator, extractAllConceptCodesForInstanceSnapshot} from "./helpers/concept-code.validator";

describe('Instance Snapshot Data Integrity Validation', () => {

    const endPoint = END2END_TEST_SPARQL_ENDPOINT; //Note: replace by END2END_TEST_SPARQL_ENDPOINT to verify all

    const sparqlQuerying = new SparqlQuerying(endPoint);
    const repository = new InstanceSnapshotSparqlTestRepository(endPoint);
    const directDatabaseAccess = new DirectDatabaseAccess(endPoint);

    test.skip('Query for each bestuurseenheid the instance snapshots in the ldes input graph', async () => {

        const conceptCodeValidator = new ConceptCodeValidator(sparqlQuerying);

        const dataErrors = [];

        try {

            const instanceSnapshots = await findAllInstanceSnapshots();

            const instanceSnapshotGraphAsStrings: string[] = sortedUniq(instanceSnapshots.map(is => is.instanceSnapshotGraph.value));

            for (const instanceSnapshotGraphStr of instanceSnapshotGraphAsStrings) {

                const instanceSnapshotGraph = new Iri(instanceSnapshotGraphStr);

                const domainToQuadsMapper = new DomainToQuadsMapper(instanceSnapshotGraph);

                const instanceSnapshotIds = instanceSnapshots
                    .filter(is => is.instanceSnapshotGraph.value === instanceSnapshotGraph.value)
                    .map(is => is.instanceSnapshotId);

                console.log(`verifying ${instanceSnapshotIds.length} instance snapshots in <${instanceSnapshotGraph}>`);

                const allTriplesOfGraphQuery = `
                        ${PREFIX.lpdcExt}
                        SELECT ?s ?p ?o WHERE {
                            GRAPH ${sparqlEscapeUri(instanceSnapshotGraph)} {
                                ?s ?p ?o
                            }
                        }`;

                const allTriplesOfGraph = await directDatabaseAccess.list(allTriplesOfGraphQuery);
                let allQuadsOfGraph: Statement[] = uniq(sparqlQuerying.asQuads(allTriplesOfGraph, instanceSnapshotGraph.value));

                allQuadsOfGraph = sanitizeBooleans(allQuadsOfGraph);

                // filter out processed snapshots list
                allQuadsOfGraph = allQuadsOfGraph.filter(q => !q.predicate.equals(namedNode('http://mu.semte.ch/vocabularies/ext/processed')));

                // filter out ldes state
                allQuadsOfGraph = allQuadsOfGraph.filter(q => !q.predicate.equals(namedNode('http://mu.semte.ch/vocabularies/ext/state')));

                //filter out en, fr and de language strings
                allQuadsOfGraph = allQuadsOfGraph.filter(q => !(isLiteral(q.object) && (q.object.language === 'de' || q.object.language === 'fr' || q.object.language === 'en')));


                let quadsForQueriedInstanceSnapshots: Statement[] = [];

                for (const instanceSnapshotId of instanceSnapshotIds) {
                    try {

                        const instanceSnapshot = await repository.findById(instanceSnapshotGraph, instanceSnapshotId);
                        expect(instanceSnapshot.id).toEqual(instanceSnapshotId);

                        const quadsForInstanceSnapshotForId = new DomainToQuadsMapper(instanceSnapshotGraph)
                            .instanceSnapshotToQuads(instanceSnapshot);
                        quadsForQueriedInstanceSnapshots = [...quadsForInstanceSnapshotForId, ...quadsForQueriedInstanceSnapshots];

                        await conceptCodeValidator.validateConceptCodes(extractAllConceptCodesForInstanceSnapshot(domainToQuadsMapper, instanceSnapshot));

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