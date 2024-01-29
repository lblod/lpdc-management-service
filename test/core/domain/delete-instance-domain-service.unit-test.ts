import {InstanceSparqlRepository} from "../../../src/driven/persistence/instance-sparql-repository";
import {aBestuurseenheid} from "./bestuurseenheid-test-builder";
import {buildInstanceIri} from "./iri-test-builder";
import {uuid} from "../../../mu-helper";
import {aFullInstance, aMinimalInstance} from "./instance-test-builder";
import {TEST_SPARQL_ENDPOINT} from "../../test.config";
import {DeleteInstanceDomainService} from "../../../src/core/domain/delete-instance-domain-service";
import {
    ConceptDisplayConfigurationSparqlRepository
} from "../../../src/driven/persistence/concept-display-configuration-sparql-repository";
import {aFullConcept} from "./concept-test-builder";
import {ConceptSparqlRepository} from "../../../src/driven/persistence/concept-sparql-repository";
import {aFullConceptDisplayConfiguration} from "./concept-display-configuration-test-builder";
import {
    ConceptDisplayConfigurationSparqlTestRepository
} from "../../driven/persistence/concept-display-configuration-sparql-test-repository";

describe('Deleting a new Instance domain service', () => {

    const instanceRepository = new InstanceSparqlRepository(TEST_SPARQL_ENDPOINT);
    const conceptRepository = new ConceptSparqlRepository(TEST_SPARQL_ENDPOINT);
    const conceptDisplayConfigurationSparqlRepository = new ConceptDisplayConfigurationSparqlRepository(TEST_SPARQL_ENDPOINT);
    const conceptDisplayConfigurationSparqlTestRepository = new ConceptDisplayConfigurationSparqlTestRepository(TEST_SPARQL_ENDPOINT);

    const deleteInstanceDomainService = new DeleteInstanceDomainService(instanceRepository,conceptRepository,conceptDisplayConfigurationSparqlRepository);
    const fixedToday = '2023-12-13T14:23:54.768Z';

    beforeAll(() => {
        jest.useFakeTimers();
        const fixedTodayAsDate = new Date(fixedToday);
        jest.spyOn(global, 'Date').mockImplementation(() => fixedTodayAsDate);
    });

    afterAll(() => {
        jest.clearAllTimers();
        jest.useRealTimers();
        jest.restoreAllMocks();
    });

    test('if exists and in deletable state, Removes the instance', async () => {
        const bestuurseenheid = aBestuurseenheid().build();

        const concept = aFullConcept().build();
        await conceptRepository.save(concept);

        const instanceId = buildInstanceIri(uuid());
        const instance = aFullInstance().withId(instanceId).withCreatedBy(bestuurseenheid.id).withConceptId(concept.id).build();

        const anotherInstanceUUID = uuid();
        const anotherInstance =
            aMinimalInstance()
                .withId(buildInstanceIri(anotherInstanceUUID))
                .withUuid(anotherInstanceUUID)
                .withCreatedBy(bestuurseenheid.id)
                .withConceptId(concept.id)
                .withConceptSnapshotId(concept.latestConceptSnapshot)
                .build();

        await instanceRepository.save(bestuurseenheid, instance);
        await instanceRepository.save(bestuurseenheid, anotherInstance);


        const conceptualDisplayConfiguration = aFullConceptDisplayConfiguration()
            .withConceptId(concept.id)
            .withBestuurseenheidId(bestuurseenheid.id)
            .withConceptIsInstantiated(true).build();
        await conceptDisplayConfigurationSparqlTestRepository.save(bestuurseenheid,conceptualDisplayConfiguration);


        await deleteInstanceDomainService.delete(bestuurseenheid, instanceId);

        await expect(instanceRepository.findById(bestuurseenheid,instance.id)).rejects.toThrow();
        expect(await instanceRepository.findById(bestuurseenheid,anotherInstance.id)).toEqual(anotherInstance);
    });

    test('if instance does not exists, throw error',async()=>{
        const bestuurseenheid = aBestuurseenheid().build();
        const nonExistingInstanceId = buildInstanceIri(uuid());
        const instanceId = buildInstanceIri(uuid());
        const instance = aFullInstance().withId(instanceId).withCreatedBy(bestuurseenheid.id).build();
        await instanceRepository.save(bestuurseenheid,instance);


        await expect( deleteInstanceDomainService.delete(bestuurseenheid,nonExistingInstanceId)).rejects.toThrow();
    });

    test('if instance exists, but for other bestuurseenheid, then does not remove and throws error',async()=>{
        const bestuurseenheid = aBestuurseenheid().build();
        const anotherBestuurseenheid = aBestuurseenheid().build();
        const instance = aFullInstance().withCreatedBy(bestuurseenheid.id).build();
        const anotherInstance = aFullInstance().withCreatedBy(anotherBestuurseenheid.id).build();

        await instanceRepository.save(bestuurseenheid,instance);
        await instanceRepository.save(anotherBestuurseenheid,anotherInstance);

        await expect( deleteInstanceDomainService.delete(bestuurseenheid,anotherInstance.id)).rejects.toThrow();

        expect(await instanceRepository.findById(anotherBestuurseenheid, anotherInstance.id)).toEqual(anotherInstance);


    });

    test('if instance exists, and no other instance is based on the same concept, isInstantiated flag is updated to false,',async()=>{
        const bestuurseenheid = aBestuurseenheid().build();

        const concept = aFullConcept().build();
        await conceptRepository.save(concept);

        const instance = aFullInstance().withConceptId(concept.id).withCreatedBy(bestuurseenheid.id).build();
        await instanceRepository.save(bestuurseenheid, instance);

        const conceptualDisplayConfiguration = aFullConceptDisplayConfiguration()
            .withConceptId(concept.id)
            .withBestuurseenheidId(bestuurseenheid.id)
            .withConceptIsInstantiated(true).build();

        await conceptDisplayConfigurationSparqlTestRepository.save(bestuurseenheid,conceptualDisplayConfiguration);

        await deleteInstanceDomainService.delete(bestuurseenheid, instance.id);
        const actualConceptualDisplayConfiguration = await conceptDisplayConfigurationSparqlRepository.findByConceptId(bestuurseenheid,instance.conceptId);

        expect(actualConceptualDisplayConfiguration.conceptIsInstantiated).toBeFalsy();
    });

    test('if instance exists, and other instance are based on the same concept, isInstantiated flag is not updated and stays on true,',async()=>{
        const bestuurseenheid = aBestuurseenheid().build();

        const concept = aFullConcept().build();
        await conceptRepository.save(concept);

        const instance = aFullInstance().withConceptId(concept.id).withCreatedBy(bestuurseenheid.id).build();
        const anotherInstance = aFullInstance().withConceptId(concept.id).withCreatedBy(bestuurseenheid.id).build();

        await instanceRepository.save(bestuurseenheid, instance);
        await instanceRepository.save(bestuurseenheid, anotherInstance);

        const conceptualDisplayConfiguration = aFullConceptDisplayConfiguration()
            .withConceptId(concept.id)
            .withBestuurseenheidId(bestuurseenheid.id)
            .withConceptIsInstantiated(true).build();
        await conceptDisplayConfigurationSparqlTestRepository.save(bestuurseenheid,conceptualDisplayConfiguration);

        await deleteInstanceDomainService.delete(bestuurseenheid, instance.id);
        const actualConceptualDisplayConfiguration = await conceptDisplayConfigurationSparqlRepository.findByConceptId(bestuurseenheid,instance.conceptId);

        expect(actualConceptualDisplayConfiguration.conceptIsInstantiated).toBeTruthy();
    });


});