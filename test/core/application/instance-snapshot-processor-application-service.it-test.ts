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
import {uuid} from "../../../mu-helper";
import {LanguageString} from "../../../src/core/domain/language-string";
import {
    ConceptDisplayConfigurationSparqlTestRepository
} from "../../driven/persistence/concept-display-configuration-sparql-test-repository";
import {
    EnsureLinkedAuthoritiesExistAsCodeListDomainService
} from "../../../src/core/domain/ensure-linked-authorities-exist-as-code-list-domain-service";
import {CodeSparqlRepository} from "../../../src/driven/persistence/code-sparql-repository";
import {DeleteInstanceDomainService} from "../../../src/core/domain/delete-instance-domain-service";
import {aFullConcept} from "../domain/concept-test-builder";
import {Iri} from "../../../src/core/domain/shared/iri";
import {INSTANCE_SNAPHOT_LDES_GRAPH} from "../../../config";
import {
    InstanceSnapshotProcessingAuthorizationSparqlTestRepository
} from "../../driven/persistence/instance-snapshot-processing-authorization-sparql-test-repository";
import {InstanceBuilder} from "../../../src/core/domain/instance";
import {
    VersionedLdesSnapshotSparqlRepository
} from "../../../src/driven/persistence/versioned-ldes-snapshot-sparql-repository";
import spyOn = jest.spyOn;


describe('InstanceSnapshotProcessorApplicationService', () => {

    beforeEach(async () => {
        await instanceSnapshotRepository.clearAllInstanceSnapshotGraphs();
    });

    const instanceSnapshotRepository = new InstanceSnapshotSparqlTestRepository(TEST_SPARQL_ENDPOINT);
    const instanceRepository = new InstanceSparqlRepository(TEST_SPARQL_ENDPOINT);
    const bestuurseenheidRepository = new BestuurseenheidSparqlTestRepository(TEST_SPARQL_ENDPOINT);
    const conceptRepository = new ConceptSparqlRepository(TEST_SPARQL_ENDPOINT);
    const conceptDisplayConfigurationRepository = new ConceptDisplayConfigurationSparqlTestRepository(TEST_SPARQL_ENDPOINT);
    const deleteInstanceDomainService = new DeleteInstanceDomainService(instanceRepository, conceptDisplayConfigurationRepository);
    const bestuurseenheidRegistrationCodeFetcher = {
        fetchOrgRegistryCodelistEntry: jest.fn().mockReturnValue(Promise.resolve({}))
    };
    const codeRepository = new CodeSparqlRepository(TEST_SPARQL_ENDPOINT);
    const linkedAuthoritiesDomainService = new EnsureLinkedAuthoritiesExistAsCodeListDomainService(bestuurseenheidRegistrationCodeFetcher, codeRepository);
    const instanceSnapshotProcessingAuthorizationRepository = new InstanceSnapshotProcessingAuthorizationSparqlTestRepository(TEST_SPARQL_ENDPOINT);
    const instanceSnapshotMerger = new InstanceSnapshotToInstanceMergerDomainService(
        instanceSnapshotRepository,
        instanceRepository,
        conceptRepository,
        conceptDisplayConfigurationRepository,
        deleteInstanceDomainService,
        linkedAuthoritiesDomainService,
        instanceSnapshotProcessingAuthorizationRepository,
        bestuurseenheidRepository);
    const versionedLdesSnapshotRepository = new VersionedLdesSnapshotSparqlRepository(TEST_SPARQL_ENDPOINT);
    const instanceSnapshotProcessor = new InstanceSnapshotProcessorApplicationService(instanceSnapshotMerger, versionedLdesSnapshotRepository);

    describe('retry merge', () => {

        let spy;

        beforeEach(() => {
            spy = spyOn(instanceSnapshotMerger, "merge").mockRejectedValue({message: 'Some error'});
        });

        afterEach(() => {
            spy.mockRestore();
        });

        test('Should retry unsuccessful merges', async () => {
            const instanceSnapshot = aFullInstanceSnapshot().build();
            const instanceSnapshotGraph = new Iri(INSTANCE_SNAPHOT_LDES_GRAPH('an-integrating-partner'));
            await instanceSnapshotRepository.save(instanceSnapshotGraph, instanceSnapshot);

            const instanceSnapshotProcessor = new InstanceSnapshotProcessorApplicationService(instanceSnapshotMerger, versionedLdesSnapshotRepository);

            await instanceSnapshotProcessor.process();
            expect(spy).toHaveBeenCalledTimes(10);
            await instanceSnapshotProcessor.process();
            expect(spy).toHaveBeenCalledTimes(10); //spy is no extra times called
        });
    });



    test('merge instanceSnapshots with same instance in correct order', async () => {
        const bestuurseenheid = aBestuurseenheid().build();
        await bestuurseenheidRepository.save(bestuurseenheid);

        const concept = aFullConcept().build();
        await conceptRepository.save(concept);
        await conceptDisplayConfigurationRepository.ensureConceptDisplayConfigurationsForAllBestuurseenheden(concept.id);

        const instanceId = InstanceBuilder.buildIri(uuid());
        const instanceSnapshot1 = aFullInstanceSnapshot()
            .withTitle(LanguageString.of(undefined, undefined, 'snapshot 1'))
            .withGeneratedAtTime(FormatPreservingDate.of('2024-01-16T00:00:00.672Z'))
            .withCreatedBy(bestuurseenheid.id)
            .withIsVersionOfInstance(instanceId)
            .withConceptId(concept.id)
            .build();
        const instanceSnapshot2 = aFullInstanceSnapshot()
            .withTitle(LanguageString.of(undefined, undefined, 'snapshot 2'))
            .withGeneratedAtTime(FormatPreservingDate.of('2024-01-17T00:00:00.672Z'))
            .withCreatedBy(bestuurseenheid.id)
            .withIsVersionOfInstance(instanceId)
            .withConceptId(concept.id)
            .build();
        const instanceSnapshot3 = aFullInstanceSnapshot()
            .withTitle(LanguageString.of(undefined, undefined, 'snapshot 3'))
            .withGeneratedAtTime(FormatPreservingDate.of('2024-01-18T00:00:00.672Z'))
            .withCreatedBy(bestuurseenheid.id)
            .withIsVersionOfInstance(instanceId)
            .withConceptId(concept.id)
            .build();

        const instanceSnapshotGraph = new Iri(INSTANCE_SNAPHOT_LDES_GRAPH('an-integrating-partner'));

        await instanceSnapshotRepository.save(instanceSnapshotGraph, instanceSnapshot2);
        await instanceSnapshotRepository.save(instanceSnapshotGraph, instanceSnapshot1);
        await instanceSnapshotRepository.save(instanceSnapshotGraph, instanceSnapshot3);

        await instanceSnapshotProcessingAuthorizationRepository.save(bestuurseenheid, instanceSnapshotGraph);

        await instanceSnapshotProcessor.process();

        const actual = await instanceRepository.findById(bestuurseenheid, instanceId);
        expect(actual.title).toEqual(instanceSnapshot3.title);
    });
});