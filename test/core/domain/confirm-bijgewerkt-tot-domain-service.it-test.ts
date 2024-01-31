import {ConfirmBijgewerktTotDomainService} from "../../../src/core/domain/confirm-bijgewerkt-tot-domain-service";
import {aFullInstance} from "./instance-test-builder";
import {aFullConceptSnapshot} from "./concept-snapshot-test-builder";
import {InstanceSparqlRepository} from "../../../src/driven/persistence/instance-sparql-repository";
import {aBestuurseenheid} from "./bestuurseenheid-test-builder";
import {InstanceBuilder} from "../../../src/core/domain/instance";
import {aFullConcept} from "./concept-test-builder";
import {END2END_TEST_SPARQL_ENDPOINT} from "../../test.config";
import {InstanceReviewStatusType} from "../../../src/core/domain/types";
import {ConceptSparqlRepository} from "../../../src/driven/persistence/concept-sparql-repository";
import {buildConceptIri} from "./iri-test-builder";
import {uuid} from "../../../mu-helper";
import {FormatPreservingDate} from "../../../src/core/domain/format-preserving-date";
import {ConceptSnapshotSparqlTestRepository} from "../../driven/persistence/concept-snapshot-sparql-test-repository";
import {restoreRealTime, setFixedTime} from "../../fixed-time";


describe('ConfirmBijgewerktTotDomainService', () => {

    const date1 = FormatPreservingDate.of('2023-11-05T00:00:00.657Z');
    const date2 = FormatPreservingDate.of('2023-11-06T00:00:00.657Z');
    const date3 = FormatPreservingDate.of('2023-11-07T00:00:00.657Z');
    const date4 = FormatPreservingDate.of('2023-11-08T00:00:00.657Z');
    const instanceRepository = new InstanceSparqlRepository(END2END_TEST_SPARQL_ENDPOINT);
    const conceptRepository = new ConceptSparqlRepository(END2END_TEST_SPARQL_ENDPOINT);
    const conceptSnapshotRepository = new ConceptSnapshotSparqlTestRepository(END2END_TEST_SPARQL_ENDPOINT);
    const confirmBijgewerktTotDomainService = new ConfirmBijgewerktTotDomainService(instanceRepository, conceptRepository, conceptSnapshotRepository);

    beforeAll(() => setFixedTime());

    afterAll(() => restoreRealTime());

    test('should update conceptSnapshot on instance', async () => {
        const bestuurseenheid = aBestuurseenheid().build();
        const conceptId = buildConceptIri(uuid());
        const conceptSnapshot = aFullConceptSnapshot().withIsVersionOfConcept(conceptId).build();
        const concept = aFullConcept()
            .withId(conceptId)
            .withLatestFunctionallyChangedConceptSnapshot(conceptSnapshot.id)
            .withLatestConceptSnapshot(conceptSnapshot.id)
            .build();
        const instance = aFullInstance()
            .withConceptId(concept.id)
            .withConceptSnapshotId(concept.latestConceptSnapshot)
            .withReviewStatus(undefined)
            .build();
        const newConceptSnapshot = aFullConceptSnapshot().withIsVersionOfConcept(conceptId).build();
        await instanceRepository.save(bestuurseenheid, instance);
        await conceptRepository.save(concept);
        await conceptSnapshotRepository.save(conceptSnapshot);

        await confirmBijgewerktTotDomainService.confirmBijgewerktTot(bestuurseenheid, instance, newConceptSnapshot);

        const actualInstance = await instanceRepository.findById(bestuurseenheid, instance.id);
        const expectedInstance= InstanceBuilder.from(instance)
            .withConceptSnapshotId(newConceptSnapshot.id)
            .withReviewStatus(undefined)
            .withDateModified(FormatPreservingDate.now())
            .build();

        expect(actualInstance).toEqual(expectedInstance);
    });

    test('when new conceptSnapshot is latestFunctionalChangedConceptSnapshot and reviewStatus is set of concept then reviewStatus should be undefined', async () => {
        const bestuurseenheid = aBestuurseenheid().build();
        const conceptId = buildConceptIri(uuid());
        const currentConceptSnapshot = aFullConceptSnapshot().withIsVersionOfConcept(conceptId).build();
        const latestFunctionalChangedSnapshot = aFullConceptSnapshot().withIsVersionOfConcept(conceptId).build();
        const concept = aFullConcept()
            .withId(conceptId)
            .withLatestFunctionallyChangedConceptSnapshot(latestFunctionalChangedSnapshot.id)
            .build();
        const instance = aFullInstance()
            .withConceptId(concept.id)
            .withConceptSnapshotId(currentConceptSnapshot.id)
            .withReviewStatus(InstanceReviewStatusType.CONCEPT_GEWIJZIGD)
            .build();
        await instanceRepository.save(bestuurseenheid, instance);
        await conceptRepository.save(concept);
        await conceptSnapshotRepository.save(latestFunctionalChangedSnapshot);

        await confirmBijgewerktTotDomainService.confirmBijgewerktTot(bestuurseenheid, instance, latestFunctionalChangedSnapshot);

        const actualInstance = await instanceRepository.findById(bestuurseenheid, instance.id);
        const expectedInstance= InstanceBuilder.from(instance)
            .withConceptSnapshotId(latestFunctionalChangedSnapshot.id)
            .withReviewStatus(undefined)
            .withDateModified(FormatPreservingDate.now())
            .build();

        expect(actualInstance).toEqual(expectedInstance);
    });

    test('when new conceptSnapshot is older than latestFunctionalChangedConceptSnapshot of concept then reviewStatus should not be updated', async () => {
        const bestuurseenheid = aBestuurseenheid().build();
        const conceptId = buildConceptIri(uuid());
        const conceptSnapshot1 = aFullConceptSnapshot().withIsVersionOfConcept(conceptId).withGeneratedAtTime(date1).build();
        const conceptSnapshot2 = aFullConceptSnapshot().withIsVersionOfConcept(conceptId).withGeneratedAtTime(date2).build();
        const conceptSnapshot3 = aFullConceptSnapshot().withIsVersionOfConcept(conceptId).withGeneratedAtTime(date3).build();
        const conceptSnapshot4 = aFullConceptSnapshot().withIsVersionOfConcept(conceptId).withGeneratedAtTime(date4).build();
        const concept = aFullConcept()
            .withId(conceptId)
            .withLatestFunctionallyChangedConceptSnapshot(conceptSnapshot3.id)
            .withLatestConceptSnapshot(conceptSnapshot4.id)
            .build();
        const instance = aFullInstance()
            .withConceptId(concept.id)
            .withConceptSnapshotId(conceptSnapshot1.id)
            .withReviewStatus(InstanceReviewStatusType.CONCEPT_GEWIJZIGD)
            .build();
        await instanceRepository.save(bestuurseenheid, instance);
        await conceptRepository.save(concept);
        await conceptSnapshotRepository.save(conceptSnapshot3);

        await confirmBijgewerktTotDomainService.confirmBijgewerktTot(bestuurseenheid, instance, conceptSnapshot2);

        const actualInstance = await instanceRepository.findById(bestuurseenheid, instance.id);
        const expectedInstance= InstanceBuilder.from(instance)
            .withConceptSnapshotId(conceptSnapshot2.id)
            .withReviewStatus(InstanceReviewStatusType.CONCEPT_GEWIJZIGD)
            .withDateModified(FormatPreservingDate.now())
            .build();

        expect(actualInstance).toEqual(expectedInstance);
    });

    test('when conceptSnapshot is newer than latestFunctionalChangedConceptSnapshot of concept then reviewStatus should be undefined', async () => {
        const bestuurseenheid = aBestuurseenheid().build();
        const conceptId = buildConceptIri(uuid());
        const conceptSnapshot1 = aFullConceptSnapshot().withIsVersionOfConcept(conceptId).withGeneratedAtTime(date1).build();
        const conceptSnapshot2 = aFullConceptSnapshot().withIsVersionOfConcept(conceptId).withGeneratedAtTime(date2).build();
        const conceptSnapshot3 = aFullConceptSnapshot().withIsVersionOfConcept(conceptId).withGeneratedAtTime(date3).build();
        const conceptSnapshot4 = aFullConceptSnapshot().withIsVersionOfConcept(conceptId).withGeneratedAtTime(date4).build();
        const concept = aFullConcept()
            .withId(conceptId)
            .withLatestFunctionallyChangedConceptSnapshot(conceptSnapshot2.id)
            .withLatestConceptSnapshot(conceptSnapshot4.id)
            .build();
        const instance = aFullInstance()
            .withConceptId(concept.id)
            .withConceptSnapshotId(conceptSnapshot1.id)
            .withReviewStatus(InstanceReviewStatusType.CONCEPT_GEWIJZIGD)
            .build();
        await instanceRepository.save(bestuurseenheid, instance);
        await conceptRepository.save(concept);
        await conceptSnapshotRepository.save(conceptSnapshot2);

        await confirmBijgewerktTotDomainService.confirmBijgewerktTot(bestuurseenheid, instance, conceptSnapshot3);

        const actualInstance = await instanceRepository.findById(bestuurseenheid, instance.id);
        const expectedInstance= InstanceBuilder.from(instance)
            .withConceptSnapshotId(conceptSnapshot3.id)
            .withReviewStatus(undefined)
            .withDateModified(FormatPreservingDate.now())
            .build();

        expect(actualInstance).toEqual(expectedInstance);
    });

    test('when conceptSnapshot does not belong to concept linked to instance throw error', async () => {
        const bestuurseenheid = aBestuurseenheid().build();
        const conceptId = buildConceptIri(uuid());
        const conceptSnapshot = aFullConceptSnapshot().withIsVersionOfConcept(conceptId).build();
        const concept = aFullConcept()
            .withId(conceptId)
            .withLatestConceptSnapshot(conceptSnapshot.id)
            .withLatestFunctionallyChangedConceptSnapshot(conceptSnapshot.id)
            .build();
        const instance = aFullInstance()
            .withConceptId(concept.id)
            .withConceptSnapshotId(concept.latestConceptSnapshot)
            .withReviewStatus(undefined)
            .build();
        await instanceRepository.save(bestuurseenheid, instance);
        await conceptRepository.save(concept);
        await conceptSnapshotRepository.save(conceptSnapshot);

        await expect(() => confirmBijgewerktTotDomainService.confirmBijgewerktTot(bestuurseenheid, instance, aFullConceptSnapshot().build()))
            .rejects.toThrow(new Error('BijgewerktTot: conceptSnapshot does not belong to concept linked to instance'));
    });

    test('when conceptSnapshot already linked to instance nothing is changed', async () => {
        const bestuurseenheid = aBestuurseenheid().build();
        const conceptId = buildConceptIri(uuid());
        const conceptSnapshot = aFullConceptSnapshot().withIsVersionOfConcept(conceptId).build();
        const concept = aFullConcept()
            .withId(conceptId)
            .withLatestConceptSnapshot(conceptSnapshot.id)
            .withLatestFunctionallyChangedConceptSnapshot(conceptSnapshot.id)
            .build();
        const instance = aFullInstance()
            .withConceptId(concept.id)
            .withConceptSnapshotId(concept.latestConceptSnapshot)
            .withReviewStatus(undefined)
            .build();
        await instanceRepository.save(bestuurseenheid, instance);
        await conceptRepository.save(concept);
        await conceptSnapshotRepository.save(conceptSnapshot);

        await confirmBijgewerktTotDomainService.confirmBijgewerktTot(bestuurseenheid, instance, conceptSnapshot);

        const actualInstance = await instanceRepository.findById(bestuurseenheid, instance.id);
        expect(actualInstance).toEqual(instance);
    });
});
