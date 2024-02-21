import {
    InstanceSnapshotProcessorApplicationService
} from "../../../src/core/application/instance-snapshot-processor-application-service";
import {InstanceSnapshotSparqlTestRepository} from "../../driven/persistence/instance-snapshot-sparql-test-repository";
import {TEST_SPARQL_ENDPOINT} from "../../test.config";
import {
    InstanceSnapshotToInstanceMergerDomainService
} from "../../../src/core/domain/instance-snapshot-to-instance-merger-domain-service";
import {InstanceSparqlRepository} from "../../../src/driven/persistence/instance-sparql-repository";
import {BestuurseenheidSparqlTestRepository} from "../../driven/persistence/bestuurseenheid-sparql-test-repository";
import {ConceptSparqlRepository} from "../../../src/driven/persistence/concept-sparql-repository";
import {aBestuurseenheid} from "../domain/bestuurseenheid-test-builder";
import {aFullInstanceSnapshot} from "../domain/instance-snapshot-test-builder";
import {FormatPreservingDate} from "../../../src/core/domain/format-preserving-date";
import {DirectDatabaseAccess} from "../../driven/persistence/direct-database-access";
import {sparqlEscapeUri, uuid} from "../../../mu-helper";
import {buildInstanceIri, buildInstanceSnapshotIri} from "../domain/iri-test-builder";
import {LanguageString} from "../../../src/core/domain/language-string";


describe('InstanceSnapshotProcessorApplicationService', () => {

    beforeEach(async () => {
       await instanceSnapshotRepository.clearAllInstanceSnapshotGraphs();
    });

    const directDatabaseAccess = new DirectDatabaseAccess(TEST_SPARQL_ENDPOINT);
    const instanceSnapshotRepository = new InstanceSnapshotSparqlTestRepository(TEST_SPARQL_ENDPOINT);
    const instanceRepository = new InstanceSparqlRepository(TEST_SPARQL_ENDPOINT);
    const bestuurseenheidRepository = new BestuurseenheidSparqlTestRepository(TEST_SPARQL_ENDPOINT);
    const conceptRepository = new ConceptSparqlRepository(TEST_SPARQL_ENDPOINT);
    const instanceSnapshotMerger = new InstanceSnapshotToInstanceMergerDomainService(instanceSnapshotRepository, instanceRepository, conceptRepository);
    const instanceSnapshotProcessor = new InstanceSnapshotProcessorApplicationService(instanceSnapshotRepository, instanceSnapshotMerger, bestuurseenheidRepository);

    test('Should retry unsuccessful merges', async () => {
        const bestuurseenheid = aBestuurseenheid().build();
        await bestuurseenheidRepository.save(bestuurseenheid);
        const instanceSnapshot  = aFullInstanceSnapshot().withGeneratedAtTime(FormatPreservingDate.of('2024-01-16T00:00:00.672Z')).withCreatedBy(bestuurseenheid.id).build();
        await instanceSnapshotRepository.save(bestuurseenheid, instanceSnapshot);

        const invalidInstanceSnapshotId = buildInstanceSnapshotIri(uuid());
        await directDatabaseAccess.insertData(
            `${bestuurseenheid.instanceSnapshotsLdesDataGraph()}`,
            [
                `${sparqlEscapeUri(invalidInstanceSnapshotId)} a <http://purl.org/vocab/cpsv#PublicService>`,
                `${sparqlEscapeUri(invalidInstanceSnapshotId)} <http://purl.org/pav/createdBy> ${sparqlEscapeUri(bestuurseenheid.id)}`,
                `${sparqlEscapeUri(invalidInstanceSnapshotId)} <http://www.w3.org/ns/prov#generatedAtTime> """${FormatPreservingDate.of('2024-01-15T00:00:00.672Z').value}"""^^<http://www.w3.org/2001/XMLSchema#dateTime>`,
            ]);

        await instanceSnapshotProcessor.process();

        const snapshots = await instanceSnapshotRepository.findToProcessInstanceSnapshots();
        expect(snapshots).toEqual([
            {bestuurseenheidId: bestuurseenheid.id, instanceSnapshotId: invalidInstanceSnapshotId}
        ]);

    });

    test('merge instanceSnapshots with same instance in correct order', async () => {
        const bestuurseenheid = aBestuurseenheid().build();
        await bestuurseenheidRepository.save(bestuurseenheid);
        const instanceId = buildInstanceIri(uuid());
        const instanceSnapshot1  = aFullInstanceSnapshot()
            .withTitle(LanguageString.of('snapshot 1', undefined, undefined, 'snapshot 1'))
            .withGeneratedAtTime(FormatPreservingDate.of('2024-01-16T00:00:00.672Z'))
            .withCreatedBy(bestuurseenheid.id)
            .withIsVersionOfInstance(instanceId)
            .build();
        const instanceSnapshot2  = aFullInstanceSnapshot()
            .withTitle(LanguageString.of('snapshot 2', undefined, undefined, 'snapshot 2'))
            .withGeneratedAtTime(FormatPreservingDate.of('2024-01-17T00:00:00.672Z'))
            .withCreatedBy(bestuurseenheid.id)
            .withIsVersionOfInstance(instanceId)
            .build();
        const instanceSnapshot3  = aFullInstanceSnapshot()
            .withTitle(LanguageString.of('snapshot 3', undefined, undefined, 'snapshot 3'))
            .withGeneratedAtTime(FormatPreservingDate.of('2024-01-18T00:00:00.672Z'))
            .withCreatedBy(bestuurseenheid.id)
            .withIsVersionOfInstance(instanceId)
            .build();
        await instanceSnapshotRepository.save(bestuurseenheid, instanceSnapshot2);
        await instanceSnapshotRepository.save(bestuurseenheid, instanceSnapshot1);
        await instanceSnapshotRepository.save(bestuurseenheid, instanceSnapshot3);

        await instanceSnapshotProcessor.process();

        const actual = await instanceRepository.findById(bestuurseenheid, instanceId);
        expect(actual.title).toEqual(instanceSnapshot3.title);
    });
});