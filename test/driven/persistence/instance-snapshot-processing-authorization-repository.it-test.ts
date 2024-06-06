import {TEST_SPARQL_ENDPOINT} from "../../test.config";
import {DirectDatabaseAccess} from "./direct-database-access";
import {
    InstanceSnapshotProcessingAuthorizationSparqlRepository
} from "../../../src/driven/persistence/instance-snapshot-processing-authorization-sparql-repository";
import {aBestuurseenheid} from "../../core/domain/bestuurseenheid-test-builder";
import {Iri} from "../../../src/core/domain/shared/iri";
import {INSTANCE_SNAPHOT_LDES_AUTHORIZATION_GRAPH, INSTANCE_SNAPHOT_LDES_GRAPH} from "../../../config";
import {sparqlEscapeUri} from "../../../mu-helper";
import {InstanceSnapshotSparqlTestRepository} from "./instance-snapshot-sparql-test-repository";

describe('InstanceSnapshotProcessingAuthorizationRepository', () => {

    const repository = new InstanceSnapshotProcessingAuthorizationSparqlRepository(TEST_SPARQL_ENDPOINT);
    const instanceSnapshotRepository = new InstanceSnapshotSparqlTestRepository(TEST_SPARQL_ENDPOINT);
    const directDatabaseAccess = new DirectDatabaseAccess(TEST_SPARQL_ENDPOINT);

    beforeEach(async () => {
        await instanceSnapshotRepository.clearAllInstanceSnapshotGraphs();
    });

    describe('canPublishInstanceToGraph', () => {

        test('can not publish when no entries', async () => {
            const instanceSnapshotGraph = new Iri(INSTANCE_SNAPHOT_LDES_GRAPH('an-integrating-partner'));

            const bestuurseenheid = aBestuurseenheid().build();

            const actual = await repository.canPublishInstanceToGraph(bestuurseenheid, instanceSnapshotGraph);
            expect(actual).toBeFalse();
        });

        test('can publish when bestuurseenheid and instance snapshot graph found', async () => {
            const instanceSnapshotGraph = new Iri(INSTANCE_SNAPHOT_LDES_GRAPH('an-integrating-partner'));

            const bestuurseenheid = aBestuurseenheid().build();

            await directDatabaseAccess.insertData(
                INSTANCE_SNAPHOT_LDES_AUTHORIZATION_GRAPH,
                [
                    `${sparqlEscapeUri(bestuurseenheid.id)} <http://data.lblod.info/vocabularies/lpdc/canPublishInstanceToGraph> ${sparqlEscapeUri(instanceSnapshotGraph)}`,
                ]);

            const actual = await repository.canPublishInstanceToGraph(bestuurseenheid, instanceSnapshotGraph);
            expect(actual).toBeTrue();
        });

        test('can not publish when bestuurseenheid but not instance snapshot graph found', async () => {
            const instanceSnapshotGraph = new Iri(INSTANCE_SNAPHOT_LDES_GRAPH('an-integrating-partner'));
            const anotherInstanceSnapshotGraph = new Iri(INSTANCE_SNAPHOT_LDES_GRAPH('another-integrating-partner'));

            const bestuurseenheid = aBestuurseenheid().build();

            await directDatabaseAccess.insertData(
                INSTANCE_SNAPHOT_LDES_AUTHORIZATION_GRAPH,
                [
                    `${sparqlEscapeUri(bestuurseenheid.id)} <http://data.lblod.info/vocabularies/lpdc/canPublishInstanceToGraph> ${sparqlEscapeUri(instanceSnapshotGraph)}`,
                ]);

            const actual = await repository.canPublishInstanceToGraph(bestuurseenheid, anotherInstanceSnapshotGraph);
            expect(actual).toBeFalse();
        });

        test('can not publish when instance snapshot graph but not bestuurseenheid found', async () => {
            const instanceSnapshotGraph = new Iri(INSTANCE_SNAPHOT_LDES_GRAPH('an-integrating-partner'));

            const bestuurseenheid = aBestuurseenheid().build();
            const anotherBestuurseenheid = aBestuurseenheid().build();

            await directDatabaseAccess.insertData(
                INSTANCE_SNAPHOT_LDES_AUTHORIZATION_GRAPH,
                [
                    `${sparqlEscapeUri(bestuurseenheid.id)} <http://data.lblod.info/vocabularies/lpdc/canPublishInstanceToGraph> ${sparqlEscapeUri(instanceSnapshotGraph)}`,
                ]);

            const actual = await repository.canPublishInstanceToGraph(anotherBestuurseenheid, instanceSnapshotGraph);
            expect(actual).toBeFalse();
        });

        test('can not publish when bestuurseenheid and instance snapshot graph found, but wrong predicate', async () => {
            const instanceSnapshotGraph = new Iri(INSTANCE_SNAPHOT_LDES_GRAPH('an-integrating-partner'));

            const bestuurseenheid = aBestuurseenheid().build();

            await directDatabaseAccess.insertData(
                INSTANCE_SNAPHOT_LDES_AUTHORIZATION_GRAPH,
                [
                    `${sparqlEscapeUri(bestuurseenheid.id)} <ex:analyze-string> ${sparqlEscapeUri(instanceSnapshotGraph)}`,
                ]);

            const actual = await repository.canPublishInstanceToGraph(bestuurseenheid, instanceSnapshotGraph);
            expect(actual).toBeFalse();
        });


    });

});