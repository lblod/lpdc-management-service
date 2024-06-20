import {aBestuurseenheid} from "../../core/domain/bestuurseenheid-test-builder";
import {Iri} from "../../../src/core/domain/shared/iri";
import {INSTANCE_SNAPHOT_LDES_GRAPH} from "../../../config";
import {aFullInstanceSnapshot} from "../../core/domain/instance-snapshot-test-builder";
import {FormatPreservingDate} from "../../../src/core/domain/format-preserving-date";
import {buildInstanceSnapshotIri} from "../../core/domain/iri-test-builder";
import {sparqlEscapeUri, uuid} from "../../../mu-helper";
import {InstanceSnapshotSparqlTestRepository} from "./instance-snapshot-sparql-test-repository";
import {TEST_SPARQL_ENDPOINT} from "../../test.config";
import {
    VersionedLdesSnapshotSparqlRepository
} from "../../../src/driven/persistence/versioned-ldes-snapshot-sparql-repository";
import {DirectDatabaseAccess} from "./direct-database-access";
import {restoreRealTime, setFixedTime} from "../../fixed-time";


describe('VersionedLdesSnapshotRepository', () => {

    const directDatabaseAccess = new DirectDatabaseAccess(TEST_SPARQL_ENDPOINT);
    const instanceSnapshotRepository = new InstanceSnapshotSparqlTestRepository(TEST_SPARQL_ENDPOINT);
    const repository = new VersionedLdesSnapshotSparqlRepository(TEST_SPARQL_ENDPOINT);

    beforeAll(() => {
        setFixedTime();
    });

    afterAll(() => {
        restoreRealTime();
    });

    beforeEach(async () => {
       await instanceSnapshotRepository.clearAllInstanceSnapshotGraphs();
    });

    describe('findToProcessInstanceSnapshots', () => {

        test('When no snapshots processed, then return all', async () => {
            const bestuurseenheid = aBestuurseenheid().build();
            const otherBestuurseenheid = aBestuurseenheid().build();
            const instanceSnapshotGraph = new Iri(INSTANCE_SNAPHOT_LDES_GRAPH('an-integrating-partner'));
            const anotherInstanceSnapshotGraph = new Iri(INSTANCE_SNAPHOT_LDES_GRAPH('another-integrating-partner'));
            const instanceSnapshot1 = aFullInstanceSnapshot().withCreatedBy(bestuurseenheid.id).build();
            const instanceSnapshot2 = aFullInstanceSnapshot().withCreatedBy(bestuurseenheid.id).build();
            const instanceSnapshotOtherBestuurseenheid = aFullInstanceSnapshot().withCreatedBy(otherBestuurseenheid.id).build();
            await instanceSnapshotRepository.save(instanceSnapshotGraph, instanceSnapshot1);
            await instanceSnapshotRepository.save(instanceSnapshotGraph, instanceSnapshot2);
            await instanceSnapshotRepository.save(anotherInstanceSnapshotGraph, instanceSnapshotOtherBestuurseenheid);

            const actual = await repository.findToProcessSnapshots(new Iri('https://productencatalogus.data.vlaanderen.be/ns/ipdc-lpdc#InstancePublicServiceSnapshot'));
            expect(actual).toEqual([
                {
                    snapshotId: instanceSnapshot1.id,
                    snapshotGraph: instanceSnapshotGraph,
                },
                {
                    snapshotId: instanceSnapshot2.id,
                    snapshotGraph: instanceSnapshotGraph,
                },
                {
                    snapshotId: instanceSnapshotOtherBestuurseenheid.id,
                    snapshotGraph: anotherInstanceSnapshotGraph,
                },
            ]);
        });

        test('When some snapshots are already processed, then return only to process instanceSnapshots', async () => {
            const bestuurseenheid = aBestuurseenheid().build();
            const otherBestuurseenheid = aBestuurseenheid().build();
            const instanceSnapshotGraph = new Iri(INSTANCE_SNAPHOT_LDES_GRAPH('an-integrating-partner'));
            const anotherInstanceSnapshotGraph = new Iri(INSTANCE_SNAPHOT_LDES_GRAPH('another-integrating-partner'));
            const instanceSnapshot1 = aFullInstanceSnapshot().withCreatedBy(bestuurseenheid.id).build();
            const instanceSnapshot2 = aFullInstanceSnapshot().withCreatedBy(bestuurseenheid.id).build();
            const instanceSnapshotOtherBestuurseenheid = aFullInstanceSnapshot().withCreatedBy(otherBestuurseenheid.id).build();

            await instanceSnapshotRepository.save(instanceSnapshotGraph, instanceSnapshot1);
            await instanceSnapshotRepository.save(instanceSnapshotGraph, instanceSnapshot2);
            await instanceSnapshotRepository.save(anotherInstanceSnapshotGraph, instanceSnapshotOtherBestuurseenheid);

            await repository.addToSuccessfullyProcessedSnapshots(instanceSnapshotGraph, instanceSnapshot2.id);

            const actual = await repository.findToProcessSnapshots(new Iri('https://productencatalogus.data.vlaanderen.be/ns/ipdc-lpdc#InstancePublicServiceSnapshot'));
            expect(actual).toEqual([
                {
                    snapshotId: instanceSnapshot1.id,
                    snapshotGraph: instanceSnapshotGraph,
                },
                {
                    snapshotId: instanceSnapshotOtherBestuurseenheid.id,
                    snapshotGraph: anotherInstanceSnapshotGraph,
                },
            ]);
        });

        test('should return findToProcessInstanceSnapshots sorted by generatedAt date', async () => {
            const bestuurseenheid = aBestuurseenheid().build();
            const otherBestuurseenheid = aBestuurseenheid().build();
            const instanceSnapshotGraph = new Iri(INSTANCE_SNAPHOT_LDES_GRAPH('an-integrating-partner'));
            const anotherInstanceSnapshotGraph = new Iri(INSTANCE_SNAPHOT_LDES_GRAPH('another-integrating-partner'));
            const instanceSnapshot1 = aFullInstanceSnapshot().withGeneratedAtTime(FormatPreservingDate.of('2024-01-05T00:00:00.657Z')).withCreatedBy(bestuurseenheid.id).build();
            const instanceSnapshot2 = aFullInstanceSnapshot().withGeneratedAtTime(FormatPreservingDate.of('2024-01-07T00:00:00.657Z')).withCreatedBy(bestuurseenheid.id).build();
            const instanceSnapshotOtherBestuurseenheid = aFullInstanceSnapshot().withGeneratedAtTime(FormatPreservingDate.of('2024-01-06T00:00:00.657Z')).withCreatedBy(otherBestuurseenheid.id).build();
            await instanceSnapshotRepository.save(instanceSnapshotGraph, instanceSnapshot1);
            await instanceSnapshotRepository.save(instanceSnapshotGraph, instanceSnapshot2);
            await instanceSnapshotRepository.save(anotherInstanceSnapshotGraph, instanceSnapshotOtherBestuurseenheid);

            const actual = await repository.findToProcessSnapshots(new Iri('https://productencatalogus.data.vlaanderen.be/ns/ipdc-lpdc#InstancePublicServiceSnapshot'));
            expect(actual).toEqual([
                {
                    snapshotId: instanceSnapshot1.id,
                    snapshotGraph: instanceSnapshotGraph,
                },
                {
                    snapshotId: instanceSnapshotOtherBestuurseenheid.id,
                    snapshotGraph: anotherInstanceSnapshotGraph,
                },
                {
                    snapshotId: instanceSnapshot2.id,
                    snapshotGraph: instanceSnapshotGraph,
                },

            ]);
        });

    });

    describe('addToSuccessfullyProcessedSnapshots', () => {

        test('should add to processedSnapshot with status success to given graph', async () => {
            const instanceSnapshotGraph = new Iri(INSTANCE_SNAPHOT_LDES_GRAPH('an-integrating-partner'));
            const instanceSnapshotId = buildInstanceSnapshotIri(uuid());

            await repository.addToSuccessfullyProcessedSnapshots(instanceSnapshotGraph, instanceSnapshotId);

            const query = `
                SELECT ?graph ?markerId ?dateCreated WHERE {
                    GRAPH ?graph {
                        ?markerId a <https://productencatalogus.data.vlaanderen.be/ns/ipdc-lpdc#VersionedLdesSnapshotProcessedMarker> .
                        ?markerId <http://mu.semte.ch/vocabularies/ext/processedSnapshot> ${sparqlEscapeUri(instanceSnapshotId)} .
                        ?markerId <http://schema.org/dateCreated> ?dateCreated.
                        ?markerId <http://schema.org/status> "success" .
                    }
                } 
            `;
            const result = await directDatabaseAccess.list(query);
            expect(result[0]['graph']?.value).toEqual(instanceSnapshotGraph.value);
            expect(result[0]['markerId']?.value).toBeDefined();
            expect(result[0]['dateCreated']?.value).toEqual(FormatPreservingDate.now().value);
        });

    });

    describe('addToFailedProcessedSnapshots', () => {

        test('should add to processedSnapshot with status failed to given graph', async () => {
            const instanceSnapshotGraph = new Iri(INSTANCE_SNAPHOT_LDES_GRAPH('an-integrating-partner'));
            const instanceSnapshotId = buildInstanceSnapshotIri(uuid());

            await repository.addToFailedProcessedSnapshots(instanceSnapshotGraph, instanceSnapshotId, 'error message received and to be saved');

            const query = `
                SELECT ?graph ?markerId ?dateCreated WHERE {
                    GRAPH ?graph {
                        ?markerId a <https://productencatalogus.data.vlaanderen.be/ns/ipdc-lpdc#VersionedLdesSnapshotProcessedMarker> .
                        ?markerId <http://mu.semte.ch/vocabularies/ext/processedSnapshot> ${sparqlEscapeUri(instanceSnapshotId)} .
                        ?markerId <http://schema.org/dateCreated> ?dateCreated.
                        ?markerId <http://schema.org/status> "failed" .
                        ?markerId <http://schema.org/error> "error message received and to be saved" .
                    }
                } 
            `;
            const result = await directDatabaseAccess.list(query);
            expect(result[0]['graph']?.value).toEqual(instanceSnapshotGraph.value);
            expect(result[0]['markerId']?.value).toBeDefined();
            expect(result[0]['dateCreated']?.value).toEqual(FormatPreservingDate.now().value);
        });

    });

});
