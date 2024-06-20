import {CONCEPT_SNAPSHOT_LDES_GRAPH} from "../../../config";
import {
    ConceptSnapshotToConceptMergerDomainService
} from "../../../src/core/domain/concept-snapshot-to-concept-merger-domain-service";
import {TEST_SPARQL_ENDPOINT} from "../../test.config";
import {ConceptSparqlRepository} from "../../../src/driven/persistence/concept-sparql-repository";
import {
    ConceptDisplayConfigurationSparqlRepository
} from "../../../src/driven/persistence/concept-display-configuration-sparql-repository";
import {
    EnsureLinkedAuthoritiesExistAsCodeListDomainService
} from "../../../src/core/domain/ensure-linked-authorities-exist-as-code-list-domain-service";
import {CodeSparqlRepository} from "../../../src/driven/persistence/code-sparql-repository";
import {InstanceSparqlRepository} from "../../../src/driven/persistence/instance-sparql-repository";
import {ConceptSnapshotSparqlTestRepository} from "../../driven/persistence/concept-snapshot-sparql-test-repository";
import {aFullConceptSnapshot} from "../domain/concept-snapshot-test-builder";
import {
    ConceptSnapshotProcessorApplicationService
} from "../../../src/core/application/concept-snapshot-processor-application-service";
import {
    VersionedLdesSnapshotSparqlRepository
} from "../../../src/driven/persistence/versioned-ldes-snapshot-sparql-repository";
import {aFullConcept} from "../domain/concept-test-builder";
import {uuid} from "../../../mu-helper";
import {FormatPreservingDate} from "../../../src/core/domain/format-preserving-date";
import {buildConceptIri} from "../domain/iri-test-builder";
import {DirectDatabaseAccess} from "../../driven/persistence/direct-database-access";
import spyOn = jest.spyOn;
import {LanguageString} from "../../../src/core/domain/language-string";

describe('ConceptSnapshotProcessorApplicationService', () => {

    const directDatabaseAccess = new DirectDatabaseAccess(TEST_SPARQL_ENDPOINT);
    const conceptSnapshotRepository = new ConceptSnapshotSparqlTestRepository(TEST_SPARQL_ENDPOINT);
    const conceptRepository = new ConceptSparqlRepository(TEST_SPARQL_ENDPOINT);
    const conceptDisplayConfigurationRepository = new ConceptDisplayConfigurationSparqlRepository(TEST_SPARQL_ENDPOINT);
    const bestuurseenheidRegistrationCodeFetcher = {
        fetchOrgRegistryCodelistEntry: jest.fn().mockReturnValue(Promise.resolve({}))
    };
    const codeRepository = new CodeSparqlRepository(TEST_SPARQL_ENDPOINT);
    const ensureLinkedAuthoritiesExistAsCodeListDomainService = new EnsureLinkedAuthoritiesExistAsCodeListDomainService(
        bestuurseenheidRegistrationCodeFetcher,
        codeRepository
    );
    const instanceSnapshotRepository = new InstanceSparqlRepository(TEST_SPARQL_ENDPOINT);
    const conceptSnapshotMerger = new ConceptSnapshotToConceptMergerDomainService(
        conceptSnapshotRepository,
        conceptRepository,
        conceptDisplayConfigurationRepository,
        ensureLinkedAuthoritiesExistAsCodeListDomainService,
        instanceSnapshotRepository,
    );
    const versionedLdesSnapshotRepository = new VersionedLdesSnapshotSparqlRepository(TEST_SPARQL_ENDPOINT);
    const conceptSnapshotProcessor = new ConceptSnapshotProcessorApplicationService(
        conceptSnapshotMerger,
        versionedLdesSnapshotRepository
    );

    beforeEach(async () => {
        await directDatabaseAccess.clearGraph(CONCEPT_SNAPSHOT_LDES_GRAPH);
    });

    describe('retry merge', () => {

        let spy;

        beforeEach(() => {
            spy = spyOn(conceptSnapshotMerger, "merge").mockRejectedValue({message: 'Some error'});
        });

        afterEach(() => {
            spy.mockRestore();
        });

        test('Should retry unsuccessful merges', async () => {
            const conceptSnapshot = aFullConceptSnapshot().build();
            await conceptSnapshotRepository.save(conceptSnapshot);

            const conceptSnapshotProcessor = new ConceptSnapshotProcessorApplicationService(conceptSnapshotMerger, versionedLdesSnapshotRepository);

            await conceptSnapshotProcessor.process();
            expect(spy).toHaveBeenCalledTimes(10);
            await conceptSnapshotProcessor.process();
            expect(spy).toHaveBeenCalledTimes(10); //spy is no extra times called
        }, 20000);
    });

    test('merge conceptSnapshots with same concept in correct order', async () => {
        const concept = aFullConcept().build();
        await conceptRepository.save(concept);

        await conceptDisplayConfigurationRepository.ensureConceptDisplayConfigurationsForAllBestuurseenheden(concept.id);

        const conceptId = buildConceptIri(uuid());
        const conceptSnapshot1 = aFullConceptSnapshot()
            .withTitle(LanguageString.of('conceptSnapshot 1', 'conceptSnapshot 1', 'conceptSnapshot 1', 'conceptSnapshot 1', 'conceptSnapshot 1'))
            .withGeneratedAtTime(FormatPreservingDate.of('2024-01-16T00:00:00.672Z'))
            .withIsVersionOfConcept(conceptId)
            .build();
        const conceptSnapshot2 = aFullConceptSnapshot()
            .withTitle(LanguageString.of('conceptSnapshot 2', 'conceptSnapshot 2', 'conceptSnapshot 2', 'conceptSnapshot 2', 'conceptSnapshot 2'))
            .withGeneratedAtTime(FormatPreservingDate.of('2024-01-17T00:00:00.672Z'))
            .withIsVersionOfConcept(conceptId)
            .build();
        const conceptSnapshot3 = aFullConceptSnapshot()
            .withTitle(LanguageString.of('conceptSnapshot 3', 'conceptSnapshot 3', 'conceptSnapshot 3', 'conceptSnapshot 3', 'conceptSnapshot 3'))
            .withGeneratedAtTime(FormatPreservingDate.of('2024-01-18T00:00:00.672Z'))
            .withIsVersionOfConcept(conceptId)
            .build();
        await conceptSnapshotRepository.save(conceptSnapshot2);
        await conceptSnapshotRepository.save(conceptSnapshot1);
        await conceptSnapshotRepository.save(conceptSnapshot3);

        await conceptSnapshotProcessor.process();

        const actual = await conceptRepository.findById(conceptId);
        expect(actual.title).toEqual(conceptSnapshot3.title);
        expect(actual.latestConceptSnapshot).toEqual(conceptSnapshot3.id);
        expect(actual.appliedConceptSnapshots).toEqual(expect.arrayContaining([conceptSnapshot1.id, conceptSnapshot2.id]));
    });
});