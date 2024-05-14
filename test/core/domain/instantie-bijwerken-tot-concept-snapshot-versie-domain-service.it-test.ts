import {
    InstantieBijwerkenTotConceptSnapshotVersieDomainService
} from "../../../src/core/domain/instantie-bijwerken-tot-concept-snapshot-versie-domain-service";
import {aFullInstance} from "./instance-test-builder";
import {aFullConceptSnapshot, ConceptSnapshotTestBuilder} from "./concept-snapshot-test-builder";
import {InstanceSparqlRepository} from "../../../src/driven/persistence/instance-sparql-repository";
import {aBestuurseenheid, BestuurseenheidTestBuilder} from "./bestuurseenheid-test-builder";
import {InstanceBuilder} from "../../../src/core/domain/instance";
import {aFullConcept} from "./concept-test-builder";
import {TEST_SPARQL_ENDPOINT} from "../../test.config";
import {InstanceReviewStatusType, PublicationMediumType} from "../../../src/core/domain/types";
import {ConceptSparqlRepository} from "../../../src/driven/persistence/concept-sparql-repository";
import {buildConceptIri} from "./iri-test-builder";
import {uuid} from "../../../mu-helper";
import {FormatPreservingDate} from "../../../src/core/domain/format-preserving-date";
import {ConceptSnapshotSparqlTestRepository} from "../../driven/persistence/concept-snapshot-sparql-test-repository";
import {restoreRealTime, setFixedTime} from "../../fixed-time";
import {InvariantError} from "../../../src/core/domain/shared/lpdc-error";
import {LanguageString} from "../../../src/core/domain/language-string";
import {Language} from "../../../src/core/domain/language";
import {SelectConceptLanguageDomainService} from "../../../src/core/domain/select-concept-language-domain-service";
import {
    FormalInformalChoiceSparqlRepository
} from "../../../src/driven/persistence/formal-informal-choice-sparql-repository";


describe('Instantie bijwerken tot concept snapshot versie domain service ', () => {

    const instanceRepository = new InstanceSparqlRepository(TEST_SPARQL_ENDPOINT);
    const conceptRepository = new ConceptSparqlRepository(TEST_SPARQL_ENDPOINT);
    const conceptSnapshotRepository = new ConceptSnapshotSparqlTestRepository(TEST_SPARQL_ENDPOINT);
    const formalInformalChoiceRepository = new FormalInformalChoiceSparqlRepository(TEST_SPARQL_ENDPOINT);
    const selectConceptLanguageDomainService = new SelectConceptLanguageDomainService();
    const instantieBijwerkenTotConceptSnapshotVersieDomainService = new InstantieBijwerkenTotConceptSnapshotVersieDomainService(instanceRepository, conceptRepository, conceptSnapshotRepository, formalInformalChoiceRepository, selectConceptLanguageDomainService);

    const date1 = FormatPreservingDate.of('2023-11-05T00:00:00.657Z');
    const date2 = FormatPreservingDate.of('2023-11-06T00:00:00.657Z');
    const date3 = FormatPreservingDate.of('2023-11-07T00:00:00.657Z');
    const date4 = FormatPreservingDate.of('2023-11-08T00:00:00.657Z');

    beforeAll(() => setFixedTime());

    afterAll(() => restoreRealTime());

    describe('ConfirmBijgewerktTot', () => {

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

            await instantieBijwerkenTotConceptSnapshotVersieDomainService.confirmBijgewerktTot(bestuurseenheid, instance, instance.dateModified, newConceptSnapshot);

            const actualInstance = await instanceRepository.findById(bestuurseenheid, instance.id);
            const expectedInstance = InstanceBuilder.from(instance)
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

            await instantieBijwerkenTotConceptSnapshotVersieDomainService.confirmBijgewerktTot(bestuurseenheid, instance, instance.dateModified, latestFunctionalChangedSnapshot);

            const actualInstance = await instanceRepository.findById(bestuurseenheid, instance.id);
            const expectedInstance = InstanceBuilder.from(instance)
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

            await instantieBijwerkenTotConceptSnapshotVersieDomainService.confirmBijgewerktTot(bestuurseenheid, instance, instance.dateModified, conceptSnapshot2);

            const actualInstance = await instanceRepository.findById(bestuurseenheid, instance.id);
            const expectedInstance = InstanceBuilder.from(instance)
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

            await instantieBijwerkenTotConceptSnapshotVersieDomainService.confirmBijgewerktTot(bestuurseenheid, instance, instance.dateModified, conceptSnapshot3);

            const actualInstance = await instanceRepository.findById(bestuurseenheid, instance.id);
            const expectedInstance = InstanceBuilder.from(instance)
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

            await expect(() => instantieBijwerkenTotConceptSnapshotVersieDomainService.confirmBijgewerktTot(bestuurseenheid, instance, instance.dateModified, aFullConceptSnapshot().build()))
                .rejects.toThrowWithMessage(InvariantError, 'BijgewerktTot: concept snapshot hoort niet bij het concept gekoppeld aan de instantie');
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

            await instantieBijwerkenTotConceptSnapshotVersieDomainService.confirmBijgewerktTot(bestuurseenheid, instance, instance.dateModified, conceptSnapshot);

            const actualInstance = await instanceRepository.findById(bestuurseenheid, instance.id);
            expect(actualInstance).toEqual(instance);
        });
    });

    describe('ConceptSnapshotVolledigOvernemen', () => {

        test('should override instance fields with fields from concept snapshot', async () => {
            const bestuurseenheid = aBestuurseenheid().build();
            const conceptId = buildConceptIri(uuid());
            const conceptSnapshot =
                aFullConceptSnapshot()
                    .withIsVersionOfConcept(conceptId)
                    .build();
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
            const newConceptSnapshot =
                aFullConceptSnapshot()
                    .withIsVersionOfConcept(conceptId)
                    .withCompetentAuthorities([BestuurseenheidTestBuilder.OUD_HEVERLEE_IRI, BestuurseenheidTestBuilder.ASSENEDE_IRI])
                    .withExecutingAuthorities([BestuurseenheidTestBuilder.OUD_HEVERLEE_IRI, BestuurseenheidTestBuilder.ASSENEDE_IRI, BestuurseenheidTestBuilder.PEPINGEN_IRI])
                    .withPublicationMedia([PublicationMediumType.YOUREUROPE])
                    .withKeywords([LanguageString.of('buitenland'), LanguageString.of('levensloos'), LanguageString.of(undefined, 'not nl')])
                    .build();
            await instanceRepository.save(bestuurseenheid, instance);
            await conceptRepository.save(concept);
            await conceptSnapshotRepository.save(conceptSnapshot);
            await conceptSnapshotRepository.save(newConceptSnapshot);

            await instantieBijwerkenTotConceptSnapshotVersieDomainService.conceptSnapshotVolledigOvernemen(bestuurseenheid, instance, instance.dateModified, newConceptSnapshot);

            const actualInstance = await instanceRepository.findById(bestuurseenheid, instance.id);
            const expectedInstance = InstanceBuilder.from(instance)
                .withConceptSnapshotId(newConceptSnapshot.id)
                .withReviewStatus(undefined)
                .withDateModified(FormatPreservingDate.now())
                .withTitle(LanguageString.ofValueInLanguage(ConceptSnapshotTestBuilder.TITLE_NL_FORMAL, Language.FORMAL))
                .withDescription(LanguageString.ofValueInLanguage(ConceptSnapshotTestBuilder.DESCRIPTION_NL_FORMAL, Language.FORMAL))
                .withAdditionalDescription(LanguageString.ofValueInLanguage(ConceptSnapshotTestBuilder.ADDITIONAL_DESCRIPTION_NL_FORMAL, Language.FORMAL))
                .withException(LanguageString.ofValueInLanguage(ConceptSnapshotTestBuilder.EXCEPTION_NL_FORMAL, Language.FORMAL))
                .withRegulation(LanguageString.ofValueInLanguage(ConceptSnapshotTestBuilder.REGULATION_NL_FORMAL, Language.FORMAL))
                .withStartDate(ConceptSnapshotTestBuilder.START_DATE)
                .withEndDate(ConceptSnapshotTestBuilder.END_DATE)
                .withType(ConceptSnapshotTestBuilder.TYPE)
                .withTargetAudiences(ConceptSnapshotTestBuilder.TARGET_AUDIENCES)
                .withThemes(ConceptSnapshotTestBuilder.THEMES)
                .withCompetentAuthorityLevels(ConceptSnapshotTestBuilder.COMPETENT_AUTHORITY_LEVELS)
                .withCompetentAuthorities([BestuurseenheidTestBuilder.OUD_HEVERLEE_IRI, BestuurseenheidTestBuilder.ASSENEDE_IRI])
                .withExecutingAuthorityLevels(ConceptSnapshotTestBuilder.EXECUTING_AUTHORITY_LEVELS)
                .withPublicationMedia([PublicationMediumType.YOUREUROPE])
                .withYourEuropeCategories(ConceptSnapshotTestBuilder.YOUR_EUROPE_CATEGORIES)
                .withKeywords([LanguageString.of('buitenland'), LanguageString.of('levensloos')])
                //TODO LPDC-1168: add requirements
                //TODO LPDC-1168: add procedures
                //TODO LPDC-1168: add websites
                //TODO LPDC-1168: add costs
                //TODO LPDC-1168: add financial advantages
                //TODO LPDC-1168: add legal resources
                .build();

            expect(actualInstance).toEqual(expectedInstance);
        });

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

            await instantieBijwerkenTotConceptSnapshotVersieDomainService.conceptSnapshotVolledigOvernemen(bestuurseenheid, instance, instance.dateModified, newConceptSnapshot);

            const actualInstance = await instanceRepository.findById(bestuurseenheid, instance.id);

            expect(actualInstance.conceptSnapshotId).toEqual(newConceptSnapshot.id);
            expect(actualInstance.reviewStatus).toBeUndefined();
            expect(actualInstance.dateModified).toEqual(FormatPreservingDate.now());
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

            await instantieBijwerkenTotConceptSnapshotVersieDomainService.conceptSnapshotVolledigOvernemen(bestuurseenheid, instance, instance.dateModified, latestFunctionalChangedSnapshot);

            const actualInstance = await instanceRepository.findById(bestuurseenheid, instance.id);

            expect(actualInstance.conceptSnapshotId).toEqual(latestFunctionalChangedSnapshot.id);
            expect(actualInstance.reviewStatus).toBeUndefined();
            expect(actualInstance.dateModified).toEqual(FormatPreservingDate.now());
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

            await instantieBijwerkenTotConceptSnapshotVersieDomainService.conceptSnapshotVolledigOvernemen(bestuurseenheid, instance, instance.dateModified, conceptSnapshot2);

            const actualInstance = await instanceRepository.findById(bestuurseenheid, instance.id);

            expect(actualInstance.conceptSnapshotId).toEqual(conceptSnapshot2.id);
            expect(actualInstance.reviewStatus).toEqual(InstanceReviewStatusType.CONCEPT_GEWIJZIGD);
            expect(actualInstance.dateModified).toEqual(FormatPreservingDate.now());
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

            await instantieBijwerkenTotConceptSnapshotVersieDomainService.conceptSnapshotVolledigOvernemen(bestuurseenheid, instance, instance.dateModified, conceptSnapshot3);

            const actualInstance = await instanceRepository.findById(bestuurseenheid, instance.id);

            expect(actualInstance.conceptSnapshotId).toEqual(conceptSnapshot3.id);
            expect(actualInstance.reviewStatus).toBeUndefined();
            expect(actualInstance.dateModified).toEqual(FormatPreservingDate.now());
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

            await expect(() => instantieBijwerkenTotConceptSnapshotVersieDomainService.conceptSnapshotVolledigOvernemen(bestuurseenheid, instance, instance.dateModified, aFullConceptSnapshot().build()))
                .rejects.toThrowWithMessage(InvariantError, 'BijgewerktTot: concept snapshot hoort niet bij het concept gekoppeld aan de instantie');
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

            await instantieBijwerkenTotConceptSnapshotVersieDomainService.conceptSnapshotVolledigOvernemen(bestuurseenheid, instance, instance.dateModified, conceptSnapshot);

            const actualInstance = await instanceRepository.findById(bestuurseenheid, instance.id);
            expect(actualInstance).toEqual(instance);
        });

    });

});

