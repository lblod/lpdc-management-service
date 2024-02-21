import {END2END_TEST_SPARQL_ENDPOINT} from "../test.config";
import {DirectDatabaseAccess} from "../driven/persistence/direct-database-access";
import {InstanceSnapshotSparqlTestRepository} from "../driven/persistence/instance-snapshot-sparql-test-repository";
import {PREFIX, PUBLIC_GRAPH} from "../../config";
import {sparqlEscapeUri} from "../../mu-helper";
import {Iri} from "../../src/core/domain/shared/iri";
import {BestuurseenheidSparqlTestRepository} from "../driven/persistence/bestuurseenheid-sparql-test-repository";

describe('Instance Snapshot Data Integrity Validation', () => {

    const endPoint = END2END_TEST_SPARQL_ENDPOINT; //Note: replace by END2END_TEST_SPARQL_ENDPOINT to verify all

    const repository = new InstanceSnapshotSparqlTestRepository(endPoint);
    const bestuurseenheidRepository = new BestuurseenheidSparqlTestRepository(endPoint);
    const directDatabaseAccess = new DirectDatabaseAccess(endPoint);

    test.skip('Query for each bestuurseenheid the instance snapshots in the ldes input graph', async () => {
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

                for (const instanceSnapshotId of instanceSnapshotIds) {
                    try {

                        const instanceSnapshot = await repository.findById(bestuurseenheid, instanceSnapshotId);
                        expect(instanceSnapshot.id).toEqual(instanceSnapshotId);

                        //TODO LPDC-910: also verify if all quads are mapped

                    } catch (e) {
                        console.error(instanceSnapshotId);
                        console.error(e);
                        dataErrors.push(e);
                    }

                }

            } catch (e) {
                console.log(e);
                dataErrors.push(e);
            }
        }

        expect(dataErrors).toEqual([]);

    }, 60000 * 15 * 100);


});