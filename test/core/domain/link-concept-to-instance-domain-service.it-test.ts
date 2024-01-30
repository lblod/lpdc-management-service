import {aFullInstance} from "./instance-test-builder";
import {aBestuurseenheid} from "./bestuurseenheid-test-builder";
import {aFullConcept} from "./concept-test-builder";
import {LinkConceptToInstanceDomainService} from "../../../src/core/domain/link-concept-to-instance-domain-service";
import {InstanceSparqlRepository} from "../../../src/driven/persistence/instance-sparql-repository";
import {END2END_TEST_SPARQL_ENDPOINT} from "../../test.config";
import {InstanceBuilder} from "../../../src/core/domain/instance";
import {FormatPreservingDate} from "../../../src/core/domain/format-preserving-date";
import {aFullConceptDisplayConfiguration} from "./concept-display-configuration-test-builder";
import {
    ConceptDisplayConfigurationSparqlTestRepository
} from "../../driven/persistence/concept-display-configuration-sparql-test-repository";
import {ConceptDisplayConfigurationBuilder} from "../../../src/core/domain/concept-display-configuration";


describe('LinkConceptToInstanceDomainService', () => {

    const instanceRepository = new InstanceSparqlRepository(END2END_TEST_SPARQL_ENDPOINT);
    const conceptDisplayConfigurationRepository = new ConceptDisplayConfigurationSparqlTestRepository(END2END_TEST_SPARQL_ENDPOINT);
    const linkConceptToInstanceDomainService = new LinkConceptToInstanceDomainService(instanceRepository, conceptDisplayConfigurationRepository);

    beforeAll(() => {
        jest.useFakeTimers();
        const fixedTodayAsDate = new Date();
        jest.spyOn(global, 'Date').mockImplementation(() => fixedTodayAsDate);
    });

    afterAll(() => {
        jest.clearAllTimers();
        jest.useRealTimers();
        jest.restoreAllMocks();
    });

    test('linking concept should add conceptId, conceptSnapshotId and productId to instance and update modified date', async () => {
        const bestuurseenheid = aBestuurseenheid().build();
        const instance = aFullInstance()
            .withConceptId(undefined)
            .withConceptSnapshotId(undefined)
            .withProductId(undefined)
            .withCreatedBy(bestuurseenheid.id)
            .build();
        const concept = aFullConcept().build();
        const conceptDisplayConfiguration = aFullConceptDisplayConfiguration()
            .withConceptId(concept.id)
            .withBestuurseenheidId(bestuurseenheid.id)
            .build();
        await instanceRepository.save(bestuurseenheid, instance);
        await conceptDisplayConfigurationRepository.save(bestuurseenheid, conceptDisplayConfiguration);

        await linkConceptToInstanceDomainService.link(bestuurseenheid, instance, concept);

        const updatedInstance = await instanceRepository.findById(bestuurseenheid, instance.id);
        const expectedInstance = InstanceBuilder.from(instance)
            .withConceptId(concept.id)
            .withConceptSnapshotId(concept.latestConceptSnapshot)
            .withProductId(concept.productId)
            .withDateModified(FormatPreservingDate.now())
            .build();

        expect(updatedInstance).toEqual(expectedInstance);
    });

    test('linking concept should update conceptDisplayConfiguration', async () => {
        const bestuurseenheid = aBestuurseenheid().build();
        const instance = aFullInstance()
            .withConceptId(undefined)
            .withConceptSnapshotId(undefined)
            .withProductId(undefined)
            .withCreatedBy(bestuurseenheid.id)
            .build();
        const concept = aFullConcept().build();
        const conceptDisplayConfiguration = aFullConceptDisplayConfiguration()
            .withConceptId(concept.id)
            .withBestuurseenheidId(bestuurseenheid.id)
            .withConceptIsNew(true)
            .withConceptIsInstantiated(false)
            .build();
        await instanceRepository.save(bestuurseenheid, instance);
        await conceptDisplayConfigurationRepository.save(bestuurseenheid, conceptDisplayConfiguration);

        await linkConceptToInstanceDomainService.link(bestuurseenheid, instance, concept);

        const updatedConceptDisplayConfiguration = await conceptDisplayConfigurationRepository.findByConceptId(bestuurseenheid, concept.id);
        const expectedConceptDisplayConfiguration = ConceptDisplayConfigurationBuilder.from(conceptDisplayConfiguration)
            .withConceptIsNew(false)
            .withConceptIsInstantiated(true)
            .build();
        expect(updatedConceptDisplayConfiguration).toEqual(expectedConceptDisplayConfiguration);

    });

});