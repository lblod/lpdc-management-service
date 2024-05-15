import {
    BringInstanceUpToDateWithConceptSnapshotVersionDomainService
} from "../../../src/core/domain/bring-instance-up-to-date-with-concept-snapshot-version-domain-service";
import {aFullInstance, aMinimalInstance, InstanceTestBuilder} from "./instance-test-builder";
import {
    aFullConceptSnapshot,
    aMinimalConceptSnapshot,
    ConceptSnapshotTestBuilder
} from "./concept-snapshot-test-builder";
import {InstanceSparqlRepository} from "../../../src/driven/persistence/instance-sparql-repository";
import {aBestuurseenheid, BestuurseenheidTestBuilder} from "./bestuurseenheid-test-builder";
import {InstanceBuilder} from "../../../src/core/domain/instance";
import {aFullConcept} from "./concept-test-builder";
import {TEST_SPARQL_ENDPOINT} from "../../test.config";
import {
    ChosenFormType,
    InstancePublicationStatusType,
    InstanceReviewStatusType,
    InstanceStatusType,
    PublicationMediumType
} from "../../../src/core/domain/types";
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
import {anotherFullWebsite} from "./website-test-builder";
import {WebsiteBuilder} from "../../../src/core/domain/website";
import {anotherFullRequirement} from "./requirement-test-builder";
import {RequirementBuilder} from "../../../src/core/domain/requirement";
import {EvidenceBuilder} from "../../../src/core/domain/evidence";
import {anotherFullProcedure} from "./procedure-test-builder";
import {ProcedureBuilder} from "../../../src/core/domain/procedure";
import {anotherFullCost} from "./cost-test-builder";
import {CostBuilder} from "../../../src/core/domain/cost";
import {anotherFullFinancialAdvantage} from "./financial-advantage-test-builder";
import {FinancialAdvantageBuilder} from "../../../src/core/domain/financial-advantage";
import {LegalResourceBuilder} from "../../../src/core/domain/legal-resource";
import {anotherFullLegalResourceForConceptSnapshot} from "./legal-resource-test-builder";
import {aFormalInformalChoice} from "./formal-informal-choice-test-builder";


describe('Bring instance up to date with concept snapshot version domain service ', () => {

    const instanceRepository = new InstanceSparqlRepository(TEST_SPARQL_ENDPOINT);
    const conceptRepository = new ConceptSparqlRepository(TEST_SPARQL_ENDPOINT);
    const conceptSnapshotRepository = new ConceptSnapshotSparqlTestRepository(TEST_SPARQL_ENDPOINT);
    const formalInformalChoiceRepository = new FormalInformalChoiceSparqlRepository(TEST_SPARQL_ENDPOINT);
    const selectConceptLanguageDomainService = new SelectConceptLanguageDomainService();
    const bringInstanceUpToDateWithConceptSnapshotVersionDomainService = new BringInstanceUpToDateWithConceptSnapshotVersionDomainService(instanceRepository, conceptRepository, conceptSnapshotRepository, selectConceptLanguageDomainService);

    const date1 = FormatPreservingDate.of('2023-11-05T00:00:00.657Z');
    const date2 = FormatPreservingDate.of('2023-11-06T00:00:00.657Z');
    const date3 = FormatPreservingDate.of('2023-11-07T00:00:00.657Z');
    const date4 = FormatPreservingDate.of('2023-11-08T00:00:00.657Z');

    beforeAll(() => setFixedTime());

    afterAll(() => restoreRealTime());

    describe('ConfirmUpToDateTill', () => {

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

            await bringInstanceUpToDateWithConceptSnapshotVersionDomainService.confirmUpToDateTill(bestuurseenheid, instance, instance.dateModified, newConceptSnapshot);

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

            await bringInstanceUpToDateWithConceptSnapshotVersionDomainService.confirmUpToDateTill(bestuurseenheid, instance, instance.dateModified, latestFunctionalChangedSnapshot);

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

            await bringInstanceUpToDateWithConceptSnapshotVersionDomainService.confirmUpToDateTill(bestuurseenheid, instance, instance.dateModified, conceptSnapshot2);

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

            await bringInstanceUpToDateWithConceptSnapshotVersionDomainService.confirmUpToDateTill(bestuurseenheid, instance, instance.dateModified, conceptSnapshot3);

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

            await expect(() => bringInstanceUpToDateWithConceptSnapshotVersionDomainService.confirmUpToDateTill(bestuurseenheid, instance, instance.dateModified, aFullConceptSnapshot().build()))
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

            await bringInstanceUpToDateWithConceptSnapshotVersionDomainService.confirmUpToDateTill(bestuurseenheid, instance, instance.dateModified, conceptSnapshot);

            const actualInstance = await instanceRepository.findById(bestuurseenheid, instance.id);
            expect(actualInstance).toEqual(instance);
        });
    });

    describe('Fully Take Concept Snapshot Over', () => {

        test('should override instance fields with fields from concept snapshot, takes over formal when instance has dutch language variant formal', async () => {
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
            const formalInformalChoice = aFormalInformalChoice()
                .withBestuurseenheidId(bestuurseenheid.id)
                .withChosenForm(ChosenFormType.INFORMAL)
                .build();
            const instance = aFullInstance()
                .withConceptId(concept.id)
                .withConceptSnapshotId(concept.latestConceptSnapshot)
                .withReviewStatus(undefined)
                .withDutchLanguageVariant(Language.FORMAL)
                .build();
            const newConceptSnapshot =
                aFullConceptSnapshot()
                    .withIsVersionOfConcept(conceptId)
                    .withCompetentAuthorities([BestuurseenheidTestBuilder.OUD_HEVERLEE_IRI, BestuurseenheidTestBuilder.ASSENEDE_IRI])
                    .withExecutingAuthorities([BestuurseenheidTestBuilder.OUD_HEVERLEE_IRI, BestuurseenheidTestBuilder.ASSENEDE_IRI, BestuurseenheidTestBuilder.PEPINGEN_IRI])
                    .withPublicationMedia([PublicationMediumType.YOUREUROPE])
                    .withKeywords([LanguageString.of('buitenland'), LanguageString.of('levensloos'), LanguageString.of(undefined, 'not nl')])
                    .withRequirements([anotherFullRequirement().withOrder(1).build()])
                    .withProcedures([anotherFullProcedure().withOrder(1).withWebsites([anotherFullWebsite(uuid()).withOrder(1).build()]).build()])
                    .withWebsites([anotherFullWebsite(uuid()).withOrder(1).build(), anotherFullWebsite(uuid()).withOrder(2).build()])
                    .withCosts([anotherFullCost().withOrder(1).build()])
                    .withFinancialAdvantages([anotherFullFinancialAdvantage().withOrder(1).build()])
                    .withLegalResources([anotherFullLegalResourceForConceptSnapshot(uuid()).withOrder(1).build()])
                    .withProductId('new-product-id')
                    .build();
            await instanceRepository.save(bestuurseenheid, instance);
            await conceptRepository.save(concept);
            await conceptSnapshotRepository.save(conceptSnapshot);
            await conceptSnapshotRepository.save(newConceptSnapshot);
            await formalInformalChoiceRepository.save(bestuurseenheid, formalInformalChoice);

            await bringInstanceUpToDateWithConceptSnapshotVersionDomainService.fullyTakeConceptSnapshotOver(bestuurseenheid, instance, instance.dateModified, newConceptSnapshot);

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
                .withRequirements([
                    RequirementBuilder.from(newConceptSnapshot.requirements[0])
                        .withId(expect.any(Object))
                        .withUuid(expect.any(String))
                        .withTitle(LanguageString.ofValueInLanguage(newConceptSnapshot.requirements[0].title.nlFormal, Language.FORMAL))
                        .withDescription(LanguageString.ofValueInLanguage(newConceptSnapshot.requirements[0].description.nlFormal, Language.FORMAL))
                        .withEvidence(
                            EvidenceBuilder.from(newConceptSnapshot.requirements[0].evidence)
                                .withId(expect.any(Object))
                                .withUuid(expect.any(String))
                                .withTitle(LanguageString.ofValueInLanguage(newConceptSnapshot.requirements[0].evidence.title.nlFormal, Language.FORMAL))
                                .withDescription(LanguageString.ofValueInLanguage(newConceptSnapshot.requirements[0].evidence.description.nlFormal, Language.FORMAL))
                                .build())
                        .build()
                ])
                .withProcedures([
                    ProcedureBuilder.from(newConceptSnapshot.procedures[0])
                        .withId(expect.any(Object))
                        .withUuid(expect.any(String))
                        .withTitle(LanguageString.ofValueInLanguage(newConceptSnapshot.procedures[0].title.nlFormal, Language.FORMAL))
                        .withDescription(LanguageString.ofValueInLanguage(newConceptSnapshot.procedures[0].description.nlFormal, Language.FORMAL))
                        .withWebsites([
                            WebsiteBuilder.from(newConceptSnapshot.procedures[0].websites[0])
                                .withId(expect.any(Object))
                                .withUuid(expect.any(String))
                                .withTitle(LanguageString.ofValueInLanguage(newConceptSnapshot.procedures[0].websites[0].title.nlFormal, Language.FORMAL))
                                .withDescription(LanguageString.ofValueInLanguage(newConceptSnapshot.procedures[0].websites[0].description.nlFormal, Language.FORMAL))
                                .build()
                        ])
                        .build()
                ])
                .withWebsites([
                    WebsiteBuilder.from(newConceptSnapshot.websites[0])
                        .withId(expect.any(Object))
                        .withUuid(expect.any(String))
                        .withTitle(LanguageString.ofValueInLanguage(newConceptSnapshot.websites[0].title.nlFormal, Language.FORMAL))
                        .withDescription(LanguageString.ofValueInLanguage(newConceptSnapshot.websites[0].description.nlFormal, Language.FORMAL))
                        .build(),
                    WebsiteBuilder.from(newConceptSnapshot.websites[1])
                        .withId(expect.any(Object))
                        .withUuid(expect.any(String))
                        .withTitle(LanguageString.ofValueInLanguage(newConceptSnapshot.websites[1].title.nlFormal, Language.FORMAL))
                        .withDescription(LanguageString.ofValueInLanguage(newConceptSnapshot.websites[1].description.nlFormal, Language.FORMAL))
                        .build(),
                ])
                .withCosts([
                    CostBuilder.from(newConceptSnapshot.costs[0])
                        .withId(expect.any(Object))
                        .withUuid(expect.any(String))
                        .withTitle(LanguageString.ofValueInLanguage(newConceptSnapshot.costs[0].title.nlFormal, Language.FORMAL))
                        .withDescription(LanguageString.ofValueInLanguage(newConceptSnapshot.costs[0].description.nlFormal, Language.FORMAL))
                        .build()
                ])
                .withFinancialAdvantages([
                    FinancialAdvantageBuilder.from(newConceptSnapshot.financialAdvantages[0])
                        .withId(expect.any(Object))
                        .withUuid(expect.any(String))
                        .withTitle(LanguageString.ofValueInLanguage(newConceptSnapshot.financialAdvantages[0].title.nlFormal, Language.FORMAL))
                        .withDescription(LanguageString.ofValueInLanguage(newConceptSnapshot.financialAdvantages[0].description.nlFormal, Language.FORMAL))
                        .build()
                ])
                .withLegalResources([
                    LegalResourceBuilder.from(newConceptSnapshot.legalResources[0])
                        .withId(expect.any(Object))
                        .withUuid(expect.any(String))
                        .withTitle(LanguageString.ofValueInLanguage(newConceptSnapshot.legalResources[0].title.nlFormal, Language.FORMAL))
                        .withDescription(LanguageString.ofValueInLanguage(newConceptSnapshot.legalResources[0].description.nlFormal, Language.FORMAL))
                        .build()
                ])
                .withProductId('new-product-id')
                .build();

            expect(actualInstance).toEqual(expectedInstance);
        });

        test('should override instance fields with fields from concept snapshot, takes over informal when instance has dutch language variant informal', async () => {
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
            const formalInformalChoice = aFormalInformalChoice()
                .withBestuurseenheidId(bestuurseenheid.id)
                .withChosenForm(ChosenFormType.FORMAL)
                .build();
            const instance = aMinimalInstance()
                .withConceptId(concept.id)
                .withConceptSnapshotId(concept.latestConceptSnapshot)
                .withReviewStatus(undefined)
                .withDutchLanguageVariant(Language.INFORMAL)
                .withNeedsConversionFromFormalToInformal(false)
                .withTitle(LanguageString.ofValueInLanguage('title that needs updating', Language.INFORMAL))
                .withProductId(InstanceTestBuilder.PRODUCT_ID)
                .build();
            const newConceptSnapshot =
                aMinimalConceptSnapshot()
                    .withIsVersionOfConcept(conceptId)
                    .withTitle(
                        LanguageString.of(
                            ConceptSnapshotTestBuilder.TITLE_NL,
                            ConceptSnapshotTestBuilder.TITLE_NL_FORMAL,
                            ConceptSnapshotTestBuilder.TITLE_NL_INFORMAL,
                            ConceptSnapshotTestBuilder.TITLE_NL_GENERATED_FORMAL,
                            ConceptSnapshotTestBuilder.TITLE_NL_GENERATED_INFORMAL))
                    .build();
            await instanceRepository.save(bestuurseenheid, instance);
            await conceptRepository.save(concept);
            await conceptSnapshotRepository.save(conceptSnapshot);
            await conceptSnapshotRepository.save(newConceptSnapshot);
            await formalInformalChoiceRepository.save(bestuurseenheid, formalInformalChoice);

            await bringInstanceUpToDateWithConceptSnapshotVersionDomainService.fullyTakeConceptSnapshotOver(bestuurseenheid, instance, instance.dateModified, newConceptSnapshot);

            const actualInstance = await instanceRepository.findById(bestuurseenheid, instance.id);
            const expectedInstance = InstanceBuilder.from(instance)
                .withConceptSnapshotId(newConceptSnapshot.id)
                .withReviewStatus(undefined)
                .withDateModified(FormatPreservingDate.now())
                .withTitle(LanguageString.ofValueInLanguage(ConceptSnapshotTestBuilder.TITLE_NL_INFORMAL, Language.INFORMAL))
                .withProductId(ConceptSnapshotTestBuilder.PRODUCT_ID)
                .build();

            expect(actualInstance).toEqual(expectedInstance);
        });

        test('should override instance fields with fields from concept snapshot, takes over nl when instance has dutch language variant undetermined', async () => {
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
            const formalInformalChoice = aFormalInformalChoice()
                .withBestuurseenheidId(bestuurseenheid.id)
                .withChosenForm(ChosenFormType.FORMAL)
                .build();
            const instance = aMinimalInstance()
                .withConceptId(concept.id)
                .withConceptSnapshotId(concept.latestConceptSnapshot)
                .withReviewStatus(undefined)
                .withDutchLanguageVariant(Language.NL)
                .withNeedsConversionFromFormalToInformal(false)
                .withTitle(LanguageString.ofValueInLanguage('title that needs updating', Language.NL))
                .withProductId(InstanceTestBuilder.PRODUCT_ID)
                .build();
            const newConceptSnapshot =
                aMinimalConceptSnapshot()
                    .withIsVersionOfConcept(conceptId)
                    .withTitle(
                        LanguageString.of(
                            ConceptSnapshotTestBuilder.TITLE_NL,
                            ConceptSnapshotTestBuilder.TITLE_NL_FORMAL,
                            ConceptSnapshotTestBuilder.TITLE_NL_INFORMAL,
                            ConceptSnapshotTestBuilder.TITLE_NL_GENERATED_FORMAL,
                            ConceptSnapshotTestBuilder.TITLE_NL_GENERATED_INFORMAL))
                    .build();
            await instanceRepository.save(bestuurseenheid, instance);
            await conceptRepository.save(concept);
            await conceptSnapshotRepository.save(conceptSnapshot);
            await conceptSnapshotRepository.save(newConceptSnapshot);
            await formalInformalChoiceRepository.save(bestuurseenheid, formalInformalChoice);

            await bringInstanceUpToDateWithConceptSnapshotVersionDomainService.fullyTakeConceptSnapshotOver(bestuurseenheid, instance, instance.dateModified, newConceptSnapshot);

            const actualInstance = await instanceRepository.findById(bestuurseenheid, instance.id);
            const expectedInstance = InstanceBuilder.from(instance)
                .withConceptSnapshotId(newConceptSnapshot.id)
                .withReviewStatus(undefined)
                .withDateModified(FormatPreservingDate.now())
                .withTitle(LanguageString.ofValueInLanguage(ConceptSnapshotTestBuilder.TITLE_NL_FORMAL, Language.NL))
                .withProductId(ConceptSnapshotTestBuilder.PRODUCT_ID)
                .build();

            expect(actualInstance).toEqual(expectedInstance);
        });

        test('should reopen instance if verstuurd', async () => {
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
                .withStatus(InstanceStatusType.VERSTUURD)
                .withPublicationStatus(InstancePublicationStatusType.GEPUBLICEERD)
                .build();
            const newConceptSnapshot = aFullConceptSnapshot().withIsVersionOfConcept(conceptId).build();
            await instanceRepository.save(bestuurseenheid, instance);
            await conceptRepository.save(concept);
            await conceptSnapshotRepository.save(conceptSnapshot);

            await bringInstanceUpToDateWithConceptSnapshotVersionDomainService.fullyTakeConceptSnapshotOver(bestuurseenheid, instance, instance.dateModified, newConceptSnapshot);

            const actualInstance = await instanceRepository.findById(bestuurseenheid, instance.id);

            expect(actualInstance.conceptSnapshotId).toEqual(newConceptSnapshot.id);
            expect(actualInstance.reviewStatus).toBeUndefined();
            expect(actualInstance.dateModified).toEqual(FormatPreservingDate.now());
            expect(actualInstance.status).toEqual(InstanceStatusType.ONTWERP);
            expect(actualInstance.publicationStatus).toEqual(InstancePublicationStatusType.TE_HERPUBLICEREN);
        });

        test('should remain in ontwerp if in status ontwerp', async () => {
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
                .withStatus(InstanceStatusType.ONTWERP)
                .withPublicationStatus(InstancePublicationStatusType.TE_HERPUBLICEREN)
                .build();
            const newConceptSnapshot = aFullConceptSnapshot().withIsVersionOfConcept(conceptId).build();
            await instanceRepository.save(bestuurseenheid, instance);
            await conceptRepository.save(concept);
            await conceptSnapshotRepository.save(conceptSnapshot);

            await bringInstanceUpToDateWithConceptSnapshotVersionDomainService.fullyTakeConceptSnapshotOver(bestuurseenheid, instance, instance.dateModified, newConceptSnapshot);

            const actualInstance = await instanceRepository.findById(bestuurseenheid, instance.id);

            expect(actualInstance.conceptSnapshotId).toEqual(newConceptSnapshot.id);
            expect(actualInstance.reviewStatus).toBeUndefined();
            expect(actualInstance.dateModified).toEqual(FormatPreservingDate.now());
            expect(actualInstance.status).toEqual(InstanceStatusType.ONTWERP);
            expect(actualInstance.publicationStatus).toEqual(InstancePublicationStatusType.TE_HERPUBLICEREN);
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

            await bringInstanceUpToDateWithConceptSnapshotVersionDomainService.fullyTakeConceptSnapshotOver(bestuurseenheid, instance, instance.dateModified, newConceptSnapshot);

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

            await bringInstanceUpToDateWithConceptSnapshotVersionDomainService.fullyTakeConceptSnapshotOver(bestuurseenheid, instance, instance.dateModified, latestFunctionalChangedSnapshot);

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

            await bringInstanceUpToDateWithConceptSnapshotVersionDomainService.fullyTakeConceptSnapshotOver(bestuurseenheid, instance, instance.dateModified, conceptSnapshot2);

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

            await bringInstanceUpToDateWithConceptSnapshotVersionDomainService.fullyTakeConceptSnapshotOver(bestuurseenheid, instance, instance.dateModified, conceptSnapshot3);

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

            await expect(() => bringInstanceUpToDateWithConceptSnapshotVersionDomainService.fullyTakeConceptSnapshotOver(bestuurseenheid, instance, instance.dateModified, aFullConceptSnapshot().build()))
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

            await bringInstanceUpToDateWithConceptSnapshotVersionDomainService.fullyTakeConceptSnapshotOver(bestuurseenheid, instance, instance.dateModified, conceptSnapshot);

            const actualInstance = await instanceRepository.findById(bestuurseenheid, instance.id);
            expect(actualInstance).toEqual(instance);
        });

    });

});

