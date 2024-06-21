import {aBestuurseenheid} from "./bestuurseenheid-test-builder";
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
import {restoreRealTime, setFixedTime} from "../../fixed-time";
import {NotFoundError} from "../../../src/core/domain/shared/lpdc-error";
import {InstanceBuilder} from "../../../src/core/domain/instance";
import {InstanceSparqlTestRepository} from "../../driven/persistence/instance-sparql-test-repository";

describe('Deleting a new Instance domain service', () => {

    const instanceRepository = new InstanceSparqlTestRepository(TEST_SPARQL_ENDPOINT);
    const conceptRepository = new ConceptSparqlRepository(TEST_SPARQL_ENDPOINT);
    const conceptDisplayConfigurationSparqlRepository = new ConceptDisplayConfigurationSparqlRepository(TEST_SPARQL_ENDPOINT);
    const conceptDisplayConfigurationSparqlTestRepository = new ConceptDisplayConfigurationSparqlTestRepository(TEST_SPARQL_ENDPOINT);

    const deleteInstanceDomainService = new DeleteInstanceDomainService(instanceRepository, conceptDisplayConfigurationSparqlRepository);

    beforeAll(() => setFixedTime());

    afterAll(() => restoreRealTime());

    test('if exists and in deletable state, Removes the instance', async () => {
        const bestuurseenheid = aBestuurseenheid().build();

        const concept = aFullConcept().build();
        await conceptRepository.save(concept);

        const instance = aFullInstance().withCreatedBy(bestuurseenheid.id).withConceptId(concept.id).build();
        const instanceId = instance.id;

        const anotherInstanceUUID = uuid();
        const anotherInstance =
            aMinimalInstance()
                .withId(InstanceBuilder.buildIri(anotherInstanceUUID))
                .withUuid(anotherInstanceUUID)
                .withCreatedBy(bestuurseenheid.id)
                .withConceptId(concept.id)
                .withConceptSnapshotId(concept.latestConceptSnapshot)
                .withProductId(concept.productId)
                .build();

        await instanceRepository.save(bestuurseenheid, instance);
        await instanceRepository.save(bestuurseenheid, anotherInstance);


        const conceptualDisplayConfiguration = aFullConceptDisplayConfiguration()
            .withConceptId(concept.id)
            .withBestuurseenheidId(bestuurseenheid.id)
            .withConceptIsNew(false)
            .withConceptIsInstantiated(true).build();
        await conceptDisplayConfigurationSparqlTestRepository.save(bestuurseenheid, conceptualDisplayConfiguration);


        await deleteInstanceDomainService.delete(bestuurseenheid, instanceId);

        await expect(instanceRepository.findById(bestuurseenheid, instance.id)).rejects.toThrowWithMessage(NotFoundError,
            `Kan <${instanceId}> niet vinden voor type <https://productencatalogus.data.vlaanderen.be/ns/ipdc-lpdc#InstancePublicService>, maar wel gevonden met type <https://www.w3.org/ns/activitystreams#Tombstone> in graph <${bestuurseenheid.userGraph()}>`);
        expect(await instanceRepository.findById(bestuurseenheid, anotherInstance.id)).toEqual(anotherInstance);
    });

    test('if instance does not exists, throw error', async () => {
        const bestuurseenheid = aBestuurseenheid().build();
        const nonExistingInstanceId = InstanceBuilder.buildIri(uuid());
        const instance = aFullInstance().withCreatedBy(bestuurseenheid.id).build();
        await instanceRepository.save(bestuurseenheid, instance);


        await expect(deleteInstanceDomainService.delete(bestuurseenheid, nonExistingInstanceId)).rejects.toThrowWithMessage(NotFoundError,
            `Kan <${nonExistingInstanceId}> niet vinden voor type <https://productencatalogus.data.vlaanderen.be/ns/ipdc-lpdc#InstancePublicService> in graph <${bestuurseenheid.userGraph()}>`);
    });

    test('if instance exists, but for other bestuurseenheid, then does not remove and throws error', async () => {
        const bestuurseenheid = aBestuurseenheid().build();
        const anotherBestuurseenheid = aBestuurseenheid().build();
        const instance = aFullInstance().withCreatedBy(bestuurseenheid.id).build();
        const anotherInstance = aFullInstance().withCreatedBy(anotherBestuurseenheid.id).build();

        await instanceRepository.save(bestuurseenheid, instance);
        await instanceRepository.save(anotherBestuurseenheid, anotherInstance);

        await expect(deleteInstanceDomainService.delete(bestuurseenheid, anotherInstance.id)).rejects.toThrowWithMessage(NotFoundError,
            `Kan <${anotherInstance.id}> niet vinden voor type <https://productencatalogus.data.vlaanderen.be/ns/ipdc-lpdc#InstancePublicService> in graph <${bestuurseenheid.userGraph()}>`);

        expect(await instanceRepository.findById(anotherBestuurseenheid, anotherInstance.id)).toEqual(anotherInstance);


    });

    test('if instance exists, and no other instance is based on the same concept, isInstantiated flag is updated to false,', async () => {
        const bestuurseenheid = aBestuurseenheid().build();

        const concept = aFullConcept().build();
        await conceptRepository.save(concept);

        const instance = aFullInstance().withConceptId(concept.id).withCreatedBy(bestuurseenheid.id).build();
        await instanceRepository.save(bestuurseenheid, instance);

        const conceptualDisplayConfiguration = aFullConceptDisplayConfiguration()
            .withConceptId(concept.id)
            .withBestuurseenheidId(bestuurseenheid.id)
            .withConceptIsNew(false)
            .withConceptIsInstantiated(true).build();

        await conceptDisplayConfigurationSparqlTestRepository.save(bestuurseenheid, conceptualDisplayConfiguration);

        await deleteInstanceDomainService.delete(bestuurseenheid, instance.id);
        const actualConceptualDisplayConfiguration = await conceptDisplayConfigurationSparqlRepository.findByConceptId(bestuurseenheid, instance.conceptId);

        expect(actualConceptualDisplayConfiguration.conceptIsInstantiated).toBeFalsy();
    });

    test('if instance exists, and other instance are based on the same concept, isInstantiated flag is not updated and stays on true,', async () => {
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
            .withConceptIsNew(false)
            .withConceptIsInstantiated(true).build();
        await conceptDisplayConfigurationSparqlTestRepository.save(bestuurseenheid, conceptualDisplayConfiguration);

        await deleteInstanceDomainService.delete(bestuurseenheid, instance.id);
        const actualConceptualDisplayConfiguration = await conceptDisplayConfigurationSparqlRepository.findByConceptId(bestuurseenheid, instance.conceptId);

        expect(actualConceptualDisplayConfiguration.conceptIsInstantiated).toBeTruthy();
    });


});