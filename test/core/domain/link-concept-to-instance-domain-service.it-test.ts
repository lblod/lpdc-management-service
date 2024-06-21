import {aFullInstance} from "./instance-test-builder";
import {aBestuurseenheid} from "./bestuurseenheid-test-builder";
import {aFullConcept} from "./concept-test-builder";
import {LinkConceptToInstanceDomainService} from "../../../src/core/domain/link-concept-to-instance-domain-service";
import {TEST_SPARQL_ENDPOINT} from "../../test.config";
import {InstanceBuilder} from "../../../src/core/domain/instance";
import {FormatPreservingDate} from "../../../src/core/domain/format-preserving-date";
import {aFullConceptDisplayConfiguration} from "./concept-display-configuration-test-builder";
import {
    ConceptDisplayConfigurationSparqlTestRepository
} from "../../driven/persistence/concept-display-configuration-sparql-test-repository";
import {ConceptDisplayConfigurationBuilder} from "../../../src/core/domain/concept-display-configuration";
import {InstanceReviewStatusType} from "../../../src/core/domain/types";
import {ConceptSparqlRepository} from "../../../src/driven/persistence/concept-sparql-repository";
import {restoreRealTime, setFixedTime} from "../../fixed-time";
import {InvariantError} from "../../../src/core/domain/shared/lpdc-error";
import {InstanceSparqlTestRepository} from "../../driven/persistence/instance-sparql-test-repository";


describe('LinkConceptToInstanceDomainService', () => {

    const instanceRepository = new InstanceSparqlTestRepository(TEST_SPARQL_ENDPOINT);
    const conceptRepository = new ConceptSparqlRepository(TEST_SPARQL_ENDPOINT);
    const conceptDisplayConfigurationRepository = new ConceptDisplayConfigurationSparqlTestRepository(TEST_SPARQL_ENDPOINT);
    const linkConceptToInstanceDomainService = new LinkConceptToInstanceDomainService(instanceRepository, conceptRepository, conceptDisplayConfigurationRepository);

    beforeAll(() => setFixedTime());

    afterAll(() => restoreRealTime());

    describe('link', () => {

        test('linking concept should add conceptId, conceptSnapshotId and productId on instance and update modified date', async () => {
            const bestuurseenheid = aBestuurseenheid().build();
            const instance = aFullInstance()
                .withConceptId(undefined)
                .withConceptSnapshotId(undefined)
                .withProductId(undefined)
                .withReviewStatus(undefined)
                .withCreatedBy(bestuurseenheid.id)
                .build();
            const concept = aFullConcept().build();
            const conceptDisplayConfiguration = aFullConceptDisplayConfiguration()
                .withConceptId(concept.id)
                .withBestuurseenheidId(bestuurseenheid.id)
                .build();
            await instanceRepository.save(bestuurseenheid, instance);
            await conceptDisplayConfigurationRepository.save(bestuurseenheid, conceptDisplayConfiguration);

            await linkConceptToInstanceDomainService.link(bestuurseenheid, instance, instance.dateModified, concept);

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
                .withReviewStatus(undefined)
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

            await linkConceptToInstanceDomainService.link(bestuurseenheid, instance, instance.dateModified, concept);

            const updatedConceptDisplayConfiguration = await conceptDisplayConfigurationRepository.findByConceptId(bestuurseenheid, concept.id);
            const expectedConceptDisplayConfiguration = ConceptDisplayConfigurationBuilder.from(conceptDisplayConfiguration)
                .withConceptIsNew(false)
                .withConceptIsInstantiated(true)
                .build();
            expect(updatedConceptDisplayConfiguration).toEqual(expectedConceptDisplayConfiguration);
        });

        test('linking concept which is already linked should ,throws error', async () => {
            const bestuurseenheid = aBestuurseenheid().build();
            const alreadyLinkedConcept = aFullConcept().build();
            const instance = aFullInstance()
                .withConceptId(alreadyLinkedConcept.id)
                .withConceptSnapshotId(alreadyLinkedConcept.latestConceptSnapshot)
                .withProductId(alreadyLinkedConcept.productId)
                .withCreatedBy(bestuurseenheid.id)
                .build();
            await instanceRepository.save(bestuurseenheid, instance);
            const concept = aFullConcept().build();

            await conceptDisplayConfigurationRepository.save(bestuurseenheid, aFullConceptDisplayConfiguration().withConceptId(alreadyLinkedConcept.id).withBestuurseenheidId(bestuurseenheid.id).build());
            await conceptDisplayConfigurationRepository.save(bestuurseenheid, aFullConceptDisplayConfiguration().withConceptId(concept.id).withBestuurseenheidId(bestuurseenheid.id).build());

            expect(async () => await linkConceptToInstanceDomainService.link(bestuurseenheid, instance, instance.dateModified, concept)).rejects.toThrowWithMessage(InvariantError, 'Instantie is reeds gekoppeld aan een concept');

        });
    });

    describe('unlink', () => {

        test('unlinking should remove conceptId, conceptSnapshotId and productId and reviewStatus on instance and update modified date', async () => {
            const bestuurseenheid = aBestuurseenheid().build();
            const concept = aFullConcept().build();
            const instance = aFullInstance()
                .withConceptId(concept.id)
                .withConceptSnapshotId(concept.latestConceptSnapshot)
                .withProductId(concept.productId)
                .withCreatedBy(bestuurseenheid.id)
                .withReviewStatus(InstanceReviewStatusType.CONCEPT_GEWIJZIGD)
                .build();
            const conceptDisplayConfiguration = aFullConceptDisplayConfiguration()
                .withConceptId(concept.id)
                .withBestuurseenheidId(bestuurseenheid.id)
                .build();
            await instanceRepository.save(bestuurseenheid, instance);
            await conceptDisplayConfigurationRepository.save(bestuurseenheid, conceptDisplayConfiguration);

            await linkConceptToInstanceDomainService.unlink(bestuurseenheid, instance, instance.dateModified);

            const updatedInstance = await instanceRepository.findById(bestuurseenheid, instance.id);
            const expectedInstance = InstanceBuilder.from(instance)
                .withConceptId(undefined)
                .withConceptSnapshotId(undefined)
                .withProductId(undefined)
                .withReviewStatus(undefined)
                .withDateModified(FormatPreservingDate.now())
                .build();

            expect(updatedInstance).toEqual(expectedInstance);
        });

        test('unlinking concept should update conceptDisplayConfiguration', async () => {
            const bestuurseenheid = aBestuurseenheid().build();
            const concept = aFullConcept().build();
            const instance = aFullInstance()
                .withConceptId(concept.id)
                .withConceptSnapshotId(concept.latestConceptSnapshot)
                .withProductId(concept.productId)
                .withCreatedBy(bestuurseenheid.id)
                .build();
            const conceptDisplayConfiguration = aFullConceptDisplayConfiguration()
                .withConceptId(concept.id)
                .withBestuurseenheidId(bestuurseenheid.id)
                .withConceptIsNew(false)
                .withConceptIsInstantiated(true)
                .build();
            await instanceRepository.save(bestuurseenheid, instance);
            await conceptDisplayConfigurationRepository.save(bestuurseenheid, conceptDisplayConfiguration);

            await linkConceptToInstanceDomainService.unlink(bestuurseenheid, instance, instance.dateModified);

            const updatedConceptDisplayConfiguration = await conceptDisplayConfigurationRepository.findByConceptId(bestuurseenheid, concept.id);
            const expectedConceptDisplayConfiguration = ConceptDisplayConfigurationBuilder.from(conceptDisplayConfiguration)
                .withConceptIsNew(false)
                .withConceptIsInstantiated(false)
                .build();

            expect(updatedConceptDisplayConfiguration).toEqual(expectedConceptDisplayConfiguration);
        });

        test('unlinking concept should leave conceptDisplayConfiguration conceptIsInstantiated on true when other instance exists for concept', async () => {
            const bestuurseenheid = aBestuurseenheid().build();
            const concept = aFullConcept().build();
            const instance = aFullInstance()
                .withConceptId(concept.id)
                .withConceptSnapshotId(concept.latestConceptSnapshot)
                .withProductId(concept.productId)
                .withCreatedBy(bestuurseenheid.id)
                .build();
            const otherInstanceForConcept = aFullInstance()
                .withConceptId(concept.id)
                .withConceptSnapshotId(concept.latestConceptSnapshot)
                .withProductId(concept.productId)
                .withCreatedBy(bestuurseenheid.id)
                .build();
            const conceptDisplayConfiguration = aFullConceptDisplayConfiguration()
                .withConceptId(concept.id)
                .withBestuurseenheidId(bestuurseenheid.id)
                .withConceptIsNew(false)
                .withConceptIsInstantiated(true)
                .build();

            await instanceRepository.save(bestuurseenheid, instance);
            await instanceRepository.save(bestuurseenheid, otherInstanceForConcept);
            await conceptDisplayConfigurationRepository.save(bestuurseenheid, conceptDisplayConfiguration);

            await linkConceptToInstanceDomainService.unlink(bestuurseenheid, instance, instance.dateModified);

            const updatedConceptDisplayConfiguration = await conceptDisplayConfigurationRepository.findByConceptId(bestuurseenheid, concept.id);
            const expectedConceptDisplayConfiguration = ConceptDisplayConfigurationBuilder.from(conceptDisplayConfiguration)
                .withConceptIsNew(false)
                .withConceptIsInstantiated(true)
                .build();

            expect(updatedConceptDisplayConfiguration).toEqual(expectedConceptDisplayConfiguration);
        });

        test('unlinking concept which is already unlinked should not update instance', async () => {
            const bestuurseenheid = aBestuurseenheid().build();
            const concept = aFullConcept().build();
            const instance = aFullInstance()
                .withConceptId(undefined)
                .withConceptSnapshotId(undefined)
                .withProductId(undefined)
                .withReviewStatus(undefined)
                .withCreatedBy(bestuurseenheid.id)
                .build();

            const conceptDisplayConfiguration = aFullConceptDisplayConfiguration()
                .withConceptId(concept.id)
                .withBestuurseenheidId(bestuurseenheid.id)
                .build();

            await instanceRepository.save(bestuurseenheid, instance);
            await conceptDisplayConfigurationRepository.save(bestuurseenheid, conceptDisplayConfiguration);

            await linkConceptToInstanceDomainService.unlink(bestuurseenheid, instance, instance.dateModified);

            const updatedInstance = await instanceRepository.findById(bestuurseenheid, instance.id);

            expect(updatedInstance).toEqual(instance);
        });
    });

});