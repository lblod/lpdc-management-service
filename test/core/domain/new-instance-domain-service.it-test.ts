import {NewInstanceDomainService} from "../../../src/core/domain/new-instance-domain-service";
import {InstanceSparqlRepository} from "../../../src/driven/persistence/instance-sparql-repository";
import {aBestuurseenheid, BestuurseenheidTestBuilder} from "./bestuurseenheid-test-builder";
import {buildBestuurseenheidIri, buildNutsCodeIri} from "./iri-test-builder";
import {uuid} from "../../../mu-helper";
import {
    ChosenFormType,
    CompetentAuthorityLevelType,
    InstancePublicationStatusType,
    InstanceStatusType
} from "../../../src/core/domain/types";
import {FormatPreservingDate} from "../../../src/core/domain/format-preserving-date";
import {TEST_SPARQL_ENDPOINT} from "../../test.config";
import {aFullConcept, aMinimalConcept} from "./concept-test-builder";
import {LanguageString} from "../../../src/core/domain/language-string";
import {
    FormalInformalChoiceSparqlRepository
} from "../../../src/driven/persistence/formal-informal-choice-sparql-repository";
import {RequirementBuilder} from "../../../src/core/domain/requirement";
import {EvidenceBuilder} from "../../../src/core/domain/evidence";
import {ProcedureBuilder} from "../../../src/core/domain/procedure";
import {WebsiteBuilder} from "../../../src/core/domain/website";
import {CostBuilder} from "../../../src/core/domain/cost";
import {FinancialAdvantageBuilder} from "../../../src/core/domain/financial-advantage";
import {aFormalInformalChoice} from "./formal-informal-choice-test-builder";
import {aFullConceptDisplayConfiguration} from "./concept-display-configuration-test-builder";
import {
    ConceptDisplayConfigurationSparqlRepository
} from "../../../src/driven/persistence/concept-display-configuration-sparql-repository";
import {
    ConceptDisplayConfigurationSparqlTestRepository
} from "../../driven/persistence/concept-display-configuration-sparql-test-repository";
import {InstanceBuilder} from "../../../src/core/domain/instance";
import {restoreRealTime, setFixedTime} from "../../fixed-time";
import {LegalResourceBuilder} from "../../../src/core/domain/legal-resource";
import {Language} from "../../../src/core/domain/language";
import {SelectConceptLanguageDomainService} from "../../../src/core/domain/select-concept-language-domain-service";
import {aFullInstance, aMinimalInstance, InstanceTestBuilder} from "./instance-test-builder";
import {BestuurseenheidSparqlTestRepository} from "../../driven/persistence/bestuurseenheid-sparql-test-repository";
import {InvariantError} from "../../../src/core/domain/shared/lpdc-error";

describe('Creating a new Instance domain service', () => {

    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

    const bestuurseenheidRepository = new BestuurseenheidSparqlTestRepository(TEST_SPARQL_ENDPOINT);
    const instanceRepository = new InstanceSparqlRepository(TEST_SPARQL_ENDPOINT);
    const formalInformalChoiceRepository = new FormalInformalChoiceSparqlRepository(TEST_SPARQL_ENDPOINT);
    const formalInformalChoiceTestRepository = new FormalInformalChoiceSparqlRepository(TEST_SPARQL_ENDPOINT);
    const conceptDisplayConfigurationRepository = new ConceptDisplayConfigurationSparqlRepository(TEST_SPARQL_ENDPOINT);
    const conceptDisplayConfigurationTestRepository = new ConceptDisplayConfigurationSparqlTestRepository(TEST_SPARQL_ENDPOINT);
    const selectConceptLanguageDomainService = new SelectConceptLanguageDomainService();
    const newInstanceDomainService = new NewInstanceDomainService(instanceRepository, formalInformalChoiceRepository, selectConceptLanguageDomainService, conceptDisplayConfigurationRepository);

    beforeAll(() => setFixedTime());

    afterAll(() => restoreRealTime());

    describe('create new empty', () => {

        test('Create new empty', async () => {
            const spatial1 = buildNutsCodeIri(12345);
            const spatial2 = buildNutsCodeIri(67890);
            const bestuurseenheid = aBestuurseenheid()
                .withId(buildBestuurseenheidIri(uuid()))
                .withSpatials([spatial1, spatial2])
                .build();

            const createdInstance = await newInstanceDomainService.createNewEmpty(bestuurseenheid);

            const reloadedInstance = await instanceRepository.findById(bestuurseenheid, createdInstance.id);

            expect(createdInstance).toEqual(reloadedInstance);
            expect(createdInstance.id).not.toBeUndefined();
            expect(createdInstance.uuid).not.toBeUndefined();

            const expectedInstance =
                new InstanceBuilder()
                    .withId(createdInstance.id)
                    .withUuid(createdInstance.uuid)
                    .withCreatedBy(bestuurseenheid.id)
                    .withDateCreated(FormatPreservingDate.now())
                    .withDateModified(FormatPreservingDate.now())
                    .withStatus(InstanceStatusType.ONTWERP)
                    .withDutchLanguageVariant(Language.FORMAL)
                    .withNeedsConversionFromFormalToInformal(false)
                    .withSpatials([spatial1, spatial2])
                    .withCompetentAuthorities([bestuurseenheid.id])
                    .withExecutingAuthorities([bestuurseenheid.id])
                    .withForMunicipalityMerger(false)
                    .build();
            expect(createdInstance).toEqual(expectedInstance);
            expect(reloadedInstance).toEqual(expectedInstance);
        });

        test('Create new empty, when formalChoice is informal, instance dutchLanguageVersion is informal', async () => {
            const spatial1 = buildNutsCodeIri(12345);
            const spatial2 = buildNutsCodeIri(67890);
            const bestuurseenheid = aBestuurseenheid()
                .withId(buildBestuurseenheidIri(uuid()))
                .withSpatials([spatial1, spatial2])
                .build();

            await formalInformalChoiceRepository.save(bestuurseenheid, aFormalInformalChoice().withChosenForm(ChosenFormType.INFORMAL).build());
            const createdInstance = await newInstanceDomainService.createNewEmpty(bestuurseenheid);

            const reloadedInstance = await instanceRepository.findById(bestuurseenheid, createdInstance.id);

            expect(createdInstance).toEqual(reloadedInstance);
            expect(createdInstance.id).not.toBeUndefined();
            expect(createdInstance.uuid).not.toBeUndefined();

            const expectedInstance =
                new InstanceBuilder()
                    .withId(createdInstance.id)
                    .withUuid(createdInstance.uuid)
                    .withCreatedBy(bestuurseenheid.id)
                    .withDateCreated(FormatPreservingDate.now())
                    .withDateModified(FormatPreservingDate.now())
                    .withStatus(InstanceStatusType.ONTWERP)
                    .withDutchLanguageVariant(Language.INFORMAL)
                    .withNeedsConversionFromFormalToInformal(false)
                    .withSpatials([spatial1, spatial2])
                    .withCompetentAuthorities([bestuurseenheid.id])
                    .withExecutingAuthorities([bestuurseenheid.id])
                    .withForMunicipalityMerger(false)
                    .build();
            expect(createdInstance).toEqual(expectedInstance);
            expect(reloadedInstance).toEqual(expectedInstance);
        });

    });

    describe('Create new from concept', () => {

        test('Create new from concept', async () => {
            const concept = aFullConcept().build();
            const spatial1 = buildNutsCodeIri(12345);
            const spatial2 = buildNutsCodeIri(67890);
            const bestuurseenheid = aBestuurseenheid()
                .withSpatials([spatial1, spatial2])
                .build();

            const displayConfiguration = aFullConceptDisplayConfiguration()
                .withBestuurseenheidId(bestuurseenheid.id)
                .withConceptId(concept.id)
                .withConceptIsNew(true)
                .withConceptIsInstantiated(false)
                .build();
            await conceptDisplayConfigurationTestRepository.save(bestuurseenheid, displayConfiguration);

            const createdInstance = await newInstanceDomainService.createNewFromConcept(bestuurseenheid, concept);

            const reloadedInstance = await instanceRepository.findById(bestuurseenheid, createdInstance.id);

            expect(createdInstance).toEqual(reloadedInstance);
            expect(createdInstance.id).not.toBeUndefined();
            expect(createdInstance.uuid).not.toBeUndefined();

            const expectedInstance =
                new InstanceBuilder()
                    .withId(createdInstance.id)
                    .withUuid(createdInstance.uuid)
                    .withCreatedBy(bestuurseenheid.id)
                    .withDateCreated(FormatPreservingDate.now())
                    .withDateModified(FormatPreservingDate.now())
                    .withStatus(InstanceStatusType.ONTWERP)
                    .withDutchLanguageVariant(Language.FORMAL)
                    .withNeedsConversionFromFormalToInformal(false)
                    .withSpatials([spatial1, spatial2])
                    .withTitle(LanguageString.of(undefined, concept.title.nlFormal))
                    .withDescription(LanguageString.of(undefined, concept.description.nlFormal))
                    .withAdditionalDescription(LanguageString.of(undefined, concept.additionalDescription.nlFormal))
                    .withException(LanguageString.of(undefined, concept.exception.nlFormal))
                    .withRegulation(LanguageString.of(undefined, concept.regulation.nlFormal))
                    .withStartDate(concept.startDate)
                    .withEndDate(concept.endDate)
                    .withType(concept.type)
                    .withTargetAudiences(concept.targetAudiences)
                    .withThemes(concept.themes)
                    .withCompetentAuthorityLevels(concept.competentAuthorityLevels)
                    .withCompetentAuthorities(concept.competentAuthorities)
                    .withExecutingAuthorityLevels(concept.executingAuthorityLevels)
                    .withExecutingAuthorities([...concept.executingAuthorities, bestuurseenheid.id])
                    .withPublicationMedia(concept.publicationMedia)
                    .withYourEuropeCategories(concept.yourEuropeCategories)
                    .withKeywords(concept.keywords)
                    .withRequirements([
                        new RequirementBuilder()
                            .withId(createdInstance.requirements[0].id)
                            .withUuid(createdInstance.requirements[0].uuid)
                            .withTitle(LanguageString.of(undefined, concept.requirements[0].title.nlFormal))
                            .withDescription(LanguageString.of(undefined, concept.requirements[0].description.nlFormal))
                            .withOrder(1)
                            .withEvidence(new EvidenceBuilder()
                                .withId(createdInstance.requirements[0].evidence.id)
                                .withUuid(createdInstance.requirements[0].evidence.uuid)
                                .withTitle(LanguageString.of(undefined, concept.requirements[0].evidence.title.nlFormal))
                                .withDescription(LanguageString.of(undefined, concept.requirements[0].evidence.description.nlFormal))
                                .build()
                            )
                            .build()
                        ,
                        new RequirementBuilder()
                            .withId(createdInstance.requirements[1].id)
                            .withUuid(createdInstance.requirements[1].uuid)
                            .withTitle(LanguageString.of(undefined, concept.requirements[1].title.nlFormal))
                            .withDescription(LanguageString.of(undefined, concept.requirements[1].description.nlFormal))
                            .withOrder(2)
                            .withEvidence(new EvidenceBuilder()
                                .withId(createdInstance.requirements[1].evidence.id)
                                .withUuid(createdInstance.requirements[1].evidence.uuid)
                                .withTitle(LanguageString.of(undefined, concept.requirements[1].evidence.title.nlFormal))
                                .withDescription(LanguageString.of(undefined, concept.requirements[1].evidence.description.nlFormal))
                                .build()
                            )
                            .build()
                    ])
                    .withProcedures([
                        new ProcedureBuilder()
                            .withId(createdInstance.procedures[0].id)
                            .withUuid(createdInstance.procedures[0].uuid)
                            .withTitle(LanguageString.of(undefined, concept.procedures[0].title.nlFormal))
                            .withDescription(LanguageString.of(undefined, concept.procedures[0].description.nlFormal))
                            .withOrder(1)
                            .withWebsites([
                                new WebsiteBuilder()
                                    .withId(createdInstance.procedures[0].websites[0].id)
                                    .withUuid(createdInstance.procedures[0].websites[0].uuid)
                                    .withTitle(LanguageString.of(undefined, concept.procedures[0].websites[0].title.nlFormal))
                                    .withDescription(LanguageString.of(undefined, concept.procedures[0].websites[0].description.nlFormal))
                                    .withOrder(1)
                                    .withUrl(concept.procedures[0].websites[0].url)
                                    .build(),
                                new WebsiteBuilder()
                                    .withId(createdInstance.procedures[0].websites[1].id)
                                    .withUuid(createdInstance.procedures[0].websites[1].uuid)
                                    .withTitle(LanguageString.of(undefined, concept.procedures[0].websites[1].title.nlFormal))
                                    .withDescription(LanguageString.of(undefined, concept.procedures[0].websites[1].description.nlFormal))
                                    .withOrder(2)
                                    .withUrl(concept.procedures[0].websites[1].url)
                                    .build(),
                            ])
                            .build(),
                        new ProcedureBuilder()
                            .withId(createdInstance.procedures[1].id)
                            .withUuid(createdInstance.procedures[1].uuid)
                            .withTitle(LanguageString.of(undefined, concept.procedures[1].title.nlFormal))
                            .withDescription(LanguageString.of(undefined, concept.procedures[1].description.nlFormal))
                            .withOrder(2)
                            .withWebsites([
                                new WebsiteBuilder()
                                    .withId(createdInstance.procedures[1].websites[0].id)
                                    .withUuid(createdInstance.procedures[1].websites[0].uuid)
                                    .withTitle(LanguageString.of(undefined, concept.procedures[1].websites[0].title.nlFormal))
                                    .withDescription(LanguageString.of(undefined, concept.procedures[1].websites[0].description.nlFormal))
                                    .withOrder(1)
                                    .withUrl(concept.procedures[1].websites[0].url)
                                    .build(),
                                new WebsiteBuilder()
                                    .withId(createdInstance.procedures[1].websites[1].id)
                                    .withUuid(createdInstance.procedures[1].websites[1].uuid)
                                    .withTitle(LanguageString.of(undefined, concept.procedures[1].websites[1].title.nlFormal))
                                    .withDescription(LanguageString.of(undefined, concept.procedures[1].websites[1].description.nlFormal))
                                    .withOrder(2)
                                    .withUrl(concept.procedures[1].websites[1].url)
                                    .build(),
                            ])
                            .build()
                    ])
                    .withWebsites([
                        new WebsiteBuilder()
                            .withId(createdInstance.websites[0].id)
                            .withUuid(createdInstance.websites[0].uuid)
                            .withTitle(LanguageString.of(undefined, concept.websites[0].title.nlFormal))
                            .withDescription(LanguageString.of(undefined, concept.websites[0].description.nlFormal))
                            .withOrder(1)
                            .withUrl(concept.websites[0].url)
                            .build(),
                        new WebsiteBuilder()
                            .withId(createdInstance.websites[1].id)
                            .withUuid(createdInstance.websites[1].uuid)
                            .withTitle(LanguageString.of(undefined, concept.websites[1].title.nlFormal))
                            .withDescription(LanguageString.of(undefined, concept.websites[1].description.nlFormal))
                            .withOrder(2)
                            .withUrl(concept.websites[1].url)
                            .build(),
                    ])
                    .withCosts([
                        new CostBuilder()
                            .withId(createdInstance.costs[0].id)
                            .withUuid(createdInstance.costs[0].uuid)
                            .withTitle(LanguageString.of(undefined, concept.costs[0].title.nlFormal))
                            .withDescription(LanguageString.of(undefined, concept.costs[0].description.nlFormal))
                            .withOrder(1)
                            .build(),
                        new CostBuilder()
                            .withId(createdInstance.costs[1].id)
                            .withUuid(createdInstance.costs[1].uuid)
                            .withTitle(LanguageString.of(undefined, concept.costs[1].title.nlFormal))
                            .withDescription(LanguageString.of(undefined, concept.costs[1].description.nlFormal))
                            .withOrder(2)
                            .build(),
                    ])
                    .withFinancialAdvantages([
                        new FinancialAdvantageBuilder()
                            .withId(createdInstance.financialAdvantages[0].id)
                            .withUuid(createdInstance.financialAdvantages[0].uuid)
                            .withTitle(LanguageString.of(undefined, concept.financialAdvantages[0].title.nlFormal))
                            .withDescription(LanguageString.of(undefined, concept.financialAdvantages[0].description.nlFormal))
                            .withOrder(1)
                            .build(),
                        new FinancialAdvantageBuilder()
                            .withId(createdInstance.financialAdvantages[1].id)
                            .withUuid(createdInstance.financialAdvantages[1].uuid)
                            .withTitle(LanguageString.of(undefined, concept.financialAdvantages[1].title.nlFormal))
                            .withDescription(LanguageString.of(undefined, concept.financialAdvantages[1].description.nlFormal))
                            .withOrder(2)
                            .build(),
                    ])
                    .withContactPoints([])
                    .withConceptId(concept.id)
                    .withConceptSnapshotId(concept.latestConceptSnapshot)
                    .withProductId(concept.productId)
                    .withLanguages([])
                    .withReviewStatus(undefined)
                    .withPublicationStatus(undefined)
                    .withLegalResources([
                        new LegalResourceBuilder()
                            .withId(createdInstance.legalResources[0].id)
                            .withUuid(createdInstance.legalResources[0].uuid)
                            .withTitle(LanguageString.of(undefined, concept.legalResources[0].title.nlFormal))
                            .withDescription(LanguageString.of(undefined, concept.legalResources[0].description.nlFormal))
                            .withUrl(concept.legalResources[0].url)
                            .withOrder(1)
                            .build(),
                        new LegalResourceBuilder()
                            .withId(createdInstance.legalResources[1].id)
                            .withUuid(createdInstance.legalResources[1].uuid)
                            .withTitle(LanguageString.of(undefined, concept.legalResources[1].title.nlFormal))
                            .withDescription(LanguageString.of(undefined, concept.legalResources[1].description.nlFormal))
                            .withUrl(concept.legalResources[1].url)
                            .withOrder(2)
                            .build(),
                    ])
                    .withForMunicipalityMerger(false)
                    .build();

            expect(createdInstance).toEqual(expectedInstance);
            expect(reloadedInstance).toEqual(expectedInstance);
            expect(createdInstance.requirements[0].id).not.toEqual(concept.requirements[0].id);
            expect(createdInstance.requirements[0].uuid).not.toEqual(concept.requirements[0].uuid);
            expect(createdInstance.requirements[1].id).not.toEqual(concept.requirements[1].id);
            expect(createdInstance.requirements[1].uuid).not.toEqual(concept.requirements[1].uuid);
            expect(createdInstance.requirements[0].evidence.id).not.toEqual(concept.requirements[0].evidence.id);
            expect(createdInstance.requirements[0].evidence.uuid).not.toEqual(concept.requirements[0].evidence.uuid);
            expect(createdInstance.requirements[1].evidence.id).not.toEqual(concept.requirements[1].evidence.id);
            expect(createdInstance.requirements[1].evidence.uuid).not.toEqual(concept.requirements[1].evidence.uuid);
            expect(createdInstance.procedures[0].id).not.toEqual(concept.procedures[0].id);
            expect(createdInstance.procedures[0].uuid).not.toEqual(concept.procedures[0].uuid);
            expect(createdInstance.procedures[1].id).not.toEqual(concept.procedures[1].id);
            expect(createdInstance.procedures[1].uuid).not.toEqual(concept.procedures[1].uuid);
            expect(createdInstance.procedures[0].websites[0].id).not.toEqual(concept.procedures[0].websites[0].id);
            expect(createdInstance.procedures[0].websites[0].uuid).not.toEqual(concept.procedures[0].websites[0].uuid);
            expect(createdInstance.procedures[0].websites[1].id).not.toEqual(concept.procedures[0].websites[1].id);
            expect(createdInstance.procedures[0].websites[1].uuid).not.toEqual(concept.procedures[0].websites[1].uuid);
            expect(createdInstance.procedures[1].websites[0].id).not.toEqual(concept.procedures[1].websites[0].id);
            expect(createdInstance.procedures[1].websites[0].uuid).not.toEqual(concept.procedures[1].websites[0].uuid);
            expect(createdInstance.procedures[1].websites[1].id).not.toEqual(concept.procedures[1].websites[1].id);
            expect(createdInstance.procedures[1].websites[1].uuid).not.toEqual(concept.procedures[1].websites[1].uuid);
            expect(createdInstance.websites[0].id).not.toEqual(concept.websites[0].id);
            expect(createdInstance.websites[0].uuid).not.toEqual(concept.websites[0].uuid);
            expect(createdInstance.websites[1].id).not.toEqual(concept.websites[1].id);
            expect(createdInstance.websites[1].uuid).not.toEqual(concept.websites[1].uuid);
            expect(createdInstance.costs[0].id).not.toEqual(concept.costs[0].id);
            expect(createdInstance.costs[0].uuid).not.toEqual(concept.costs[0].uuid);
            expect(createdInstance.costs[1].id).not.toEqual(concept.costs[1].id);
            expect(createdInstance.costs[1].uuid).not.toEqual(concept.costs[1].uuid);
            expect(createdInstance.financialAdvantages[0].id).not.toEqual(concept.financialAdvantages[0].id);
            expect(createdInstance.financialAdvantages[0].uuid).not.toEqual(concept.financialAdvantages[0].uuid);
            expect(createdInstance.financialAdvantages[1].id).not.toEqual(concept.financialAdvantages[1].id);
            expect(createdInstance.financialAdvantages[1].uuid).not.toEqual(concept.financialAdvantages[1].uuid);
            expect(createdInstance.legalResources[0].id).not.toEqual(concept.legalResources[0].id);
            expect(createdInstance.legalResources[0].uuid).not.toEqual(concept.legalResources[0].uuid);
            expect(createdInstance.legalResources[1].id).not.toEqual(concept.legalResources[1].id);
            expect(createdInstance.legalResources[1].uuid).not.toEqual(concept.legalResources[1].uuid);
        });

        test('Create new from concept when chosen form is formal', async () => {
            const concept = aFullConcept().build();
            const spatial1 = buildNutsCodeIri(12345);
            const spatial2 = buildNutsCodeIri(67890);
            const bestuurseenheid = aBestuurseenheid()
                .withSpatials([spatial1, spatial2])
                .build();

            const formalInformalChoice = aFormalInformalChoice()
                .withChosenForm(ChosenFormType.FORMAL)
                .withBestuurseenheidId(bestuurseenheid.id)
                .build();

            await formalInformalChoiceTestRepository.save(bestuurseenheid, formalInformalChoice);

            const displayConfiguration = aFullConceptDisplayConfiguration()
                .withBestuurseenheidId(bestuurseenheid.id)
                .withConceptId(concept.id)
                .withConceptIsNew(true)
                .withConceptIsInstantiated(false)
                .build();
            await conceptDisplayConfigurationTestRepository.save(bestuurseenheid, displayConfiguration);

            const createdInstance = await newInstanceDomainService.createNewFromConcept(bestuurseenheid, concept);

            const reloadedInstance = await instanceRepository.findById(bestuurseenheid, createdInstance.id);

            expect(createdInstance).toEqual(reloadedInstance);
            expect(createdInstance.id).not.toBeUndefined();
            expect(createdInstance.uuid).not.toBeUndefined();

            const expectedInstance =
                new InstanceBuilder()
                    .withId(createdInstance.id)
                    .withUuid(createdInstance.uuid)
                    .withCreatedBy(bestuurseenheid.id)
                    .withDateCreated(FormatPreservingDate.now())
                    .withDateModified(FormatPreservingDate.now())
                    .withStatus(InstanceStatusType.ONTWERP)
                    .withDutchLanguageVariant(Language.FORMAL)
                    .withNeedsConversionFromFormalToInformal(false)
                    .withSpatials([spatial1, spatial2])
                    .withTitle(LanguageString.of(undefined, concept.title.nlFormal))
                    .withDescription(LanguageString.of(undefined, concept.description.nlFormal))
                    .withAdditionalDescription(LanguageString.of(undefined, concept.additionalDescription.nlFormal))
                    .withException(LanguageString.of(undefined, concept.exception.nlFormal))
                    .withRegulation(LanguageString.of(undefined, concept.regulation.nlFormal))
                    .withStartDate(concept.startDate)
                    .withEndDate(concept.endDate)
                    .withType(concept.type)
                    .withTargetAudiences(concept.targetAudiences)
                    .withThemes(concept.themes)
                    .withCompetentAuthorityLevels(concept.competentAuthorityLevels)
                    .withCompetentAuthorities(concept.competentAuthorities)
                    .withExecutingAuthorityLevels(concept.executingAuthorityLevels)
                    .withExecutingAuthorities([...concept.executingAuthorities, bestuurseenheid.id])
                    .withPublicationMedia(concept.publicationMedia)
                    .withYourEuropeCategories(concept.yourEuropeCategories)
                    .withKeywords(concept.keywords)
                    .withRequirements([
                        new RequirementBuilder()
                            .withId(createdInstance.requirements[0].id)
                            .withUuid(createdInstance.requirements[0].uuid)
                            .withTitle(LanguageString.of(undefined, concept.requirements[0].title.nlFormal))
                            .withDescription(LanguageString.of(undefined, concept.requirements[0].description.nlFormal))
                            .withOrder(1)
                            .withEvidence(new EvidenceBuilder()
                                .withId(createdInstance.requirements[0].evidence.id)
                                .withUuid(createdInstance.requirements[0].evidence.uuid)
                                .withTitle(LanguageString.of(undefined, concept.requirements[0].evidence.title.nlFormal))
                                .withDescription(LanguageString.of(undefined, concept.requirements[0].evidence.description.nlFormal))
                                .build()
                            )
                            .build()
                        ,
                        new RequirementBuilder()
                            .withId(createdInstance.requirements[1].id)
                            .withUuid(createdInstance.requirements[1].uuid)
                            .withTitle(LanguageString.of(undefined, concept.requirements[1].title.nlFormal))
                            .withDescription(LanguageString.of(undefined, concept.requirements[1].description.nlFormal))
                            .withOrder(2)
                            .withEvidence(new EvidenceBuilder()
                                .withId(createdInstance.requirements[1].evidence.id)
                                .withUuid(createdInstance.requirements[1].evidence.uuid)
                                .withTitle(LanguageString.of(undefined, concept.requirements[1].evidence.title.nlFormal))
                                .withDescription(LanguageString.of(undefined, concept.requirements[1].evidence.description.nlFormal))
                                .build()
                            )
                            .build()
                    ])
                    .withProcedures([
                        new ProcedureBuilder()
                            .withId(createdInstance.procedures[0].id)
                            .withUuid(createdInstance.procedures[0].uuid)
                            .withTitle(LanguageString.of(undefined, concept.procedures[0].title.nlFormal))
                            .withDescription(LanguageString.of(undefined, concept.procedures[0].description.nlFormal))
                            .withOrder(1)
                            .withWebsites([
                                new WebsiteBuilder()
                                    .withId(createdInstance.procedures[0].websites[0].id)
                                    .withUuid(createdInstance.procedures[0].websites[0].uuid)
                                    .withTitle(LanguageString.of(undefined, concept.procedures[0].websites[0].title.nlFormal))
                                    .withDescription(LanguageString.of(undefined, concept.procedures[0].websites[0].description.nlFormal))
                                    .withOrder(1)
                                    .withUrl(concept.procedures[0].websites[0].url)
                                    .build(),
                                new WebsiteBuilder()
                                    .withId(createdInstance.procedures[0].websites[1].id)
                                    .withUuid(createdInstance.procedures[0].websites[1].uuid)
                                    .withTitle(LanguageString.of(undefined, concept.procedures[0].websites[1].title.nlFormal))
                                    .withDescription(LanguageString.of(undefined, concept.procedures[0].websites[1].description.nlFormal))
                                    .withOrder(2)
                                    .withUrl(concept.procedures[0].websites[1].url)
                                    .build(),
                            ])
                            .build(),
                        new ProcedureBuilder()
                            .withId(createdInstance.procedures[1].id)
                            .withUuid(createdInstance.procedures[1].uuid)
                            .withTitle(LanguageString.of(undefined, concept.procedures[1].title.nlFormal))
                            .withDescription(LanguageString.of(undefined, concept.procedures[1].description.nlFormal))
                            .withOrder(2)
                            .withWebsites([
                                new WebsiteBuilder()
                                    .withId(createdInstance.procedures[1].websites[0].id)
                                    .withUuid(createdInstance.procedures[1].websites[0].uuid)
                                    .withTitle(LanguageString.of(undefined, concept.procedures[1].websites[0].title.nlFormal))
                                    .withDescription(LanguageString.of(undefined, concept.procedures[1].websites[0].description.nlFormal))
                                    .withOrder(1)
                                    .withUrl(concept.procedures[1].websites[0].url)
                                    .build(),
                                new WebsiteBuilder()
                                    .withId(createdInstance.procedures[1].websites[1].id)
                                    .withUuid(createdInstance.procedures[1].websites[1].uuid)
                                    .withTitle(LanguageString.of(undefined, concept.procedures[1].websites[1].title.nlFormal))
                                    .withDescription(LanguageString.of(undefined, concept.procedures[1].websites[1].description.nlFormal))
                                    .withOrder(2)
                                    .withUrl(concept.procedures[1].websites[1].url)
                                    .build(),
                            ])
                            .build()
                    ])
                    .withWebsites([
                        new WebsiteBuilder()
                            .withId(createdInstance.websites[0].id)
                            .withUuid(createdInstance.websites[0].uuid)
                            .withTitle(LanguageString.of(undefined, concept.websites[0].title.nlFormal))
                            .withDescription(LanguageString.of(undefined, concept.websites[0].description.nlFormal))
                            .withOrder(1)
                            .withUrl(concept.websites[0].url)
                            .build(),
                        new WebsiteBuilder()
                            .withId(createdInstance.websites[1].id)
                            .withUuid(createdInstance.websites[1].uuid)
                            .withTitle(LanguageString.of(undefined, concept.websites[1].title.nlFormal))
                            .withDescription(LanguageString.of(undefined, concept.websites[1].description.nlFormal))
                            .withOrder(2)
                            .withUrl(concept.websites[1].url)
                            .build(),
                    ])
                    .withCosts([
                        new CostBuilder()
                            .withId(createdInstance.costs[0].id)
                            .withUuid(createdInstance.costs[0].uuid)
                            .withTitle(LanguageString.of(undefined, concept.costs[0].title.nlFormal))
                            .withDescription(LanguageString.of(undefined, concept.costs[0].description.nlFormal))
                            .withOrder(1)
                            .build(),
                        new CostBuilder()
                            .withId(createdInstance.costs[1].id)
                            .withUuid(createdInstance.costs[1].uuid)
                            .withTitle(LanguageString.of(undefined, concept.costs[1].title.nlFormal))
                            .withDescription(LanguageString.of(undefined, concept.costs[1].description.nlFormal))
                            .withOrder(2)
                            .build(),
                    ])
                    .withFinancialAdvantages([
                        new FinancialAdvantageBuilder()
                            .withId(createdInstance.financialAdvantages[0].id)
                            .withUuid(createdInstance.financialAdvantages[0].uuid)
                            .withTitle(LanguageString.of(undefined, concept.financialAdvantages[0].title.nlFormal))
                            .withDescription(LanguageString.of(undefined, concept.financialAdvantages[0].description.nlFormal))
                            .withOrder(1)
                            .build(),
                        new FinancialAdvantageBuilder()
                            .withId(createdInstance.financialAdvantages[1].id)
                            .withUuid(createdInstance.financialAdvantages[1].uuid)
                            .withTitle(LanguageString.of(undefined, concept.financialAdvantages[1].title.nlFormal))
                            .withDescription(LanguageString.of(undefined, concept.financialAdvantages[1].description.nlFormal))
                            .withOrder(2)
                            .build(),
                    ])
                    .withContactPoints([])
                    .withConceptId(concept.id)
                    .withConceptSnapshotId(concept.latestConceptSnapshot)
                    .withProductId(concept.productId)
                    .withLanguages([])
                    .withReviewStatus(undefined)
                    .withPublicationStatus(undefined)
                    .withLegalResources([
                        new LegalResourceBuilder()
                            .withId(createdInstance.legalResources[0].id)
                            .withUuid(createdInstance.legalResources[0].uuid)
                            .withTitle(LanguageString.of(undefined, concept.legalResources[0].title.nlFormal))
                            .withDescription(LanguageString.of(undefined, concept.legalResources[0].description.nlFormal))
                            .withUrl(concept.legalResources[0].url)
                            .withOrder(1)
                            .build(),
                        new LegalResourceBuilder()
                            .withId(createdInstance.legalResources[1].id)
                            .withUuid(createdInstance.legalResources[1].uuid)
                            .withTitle(LanguageString.of(undefined, concept.legalResources[1].title.nlFormal))
                            .withDescription(LanguageString.of(undefined, concept.legalResources[1].description.nlFormal))
                            .withUrl(concept.legalResources[1].url)
                            .withOrder(2)
                            .build(),
                    ])
                    .withForMunicipalityMerger(false)
                    .build();

            expect(createdInstance).toEqual(expectedInstance);
            expect(reloadedInstance).toEqual(expectedInstance);
        });

        test('Create new from concept when chosen form is informal', async () => {
            const concept = aFullConcept().build();
            const spatial1 = buildNutsCodeIri(12345);
            const spatial2 = buildNutsCodeIri(67890);
            const bestuurseenheid = aBestuurseenheid()
                .withSpatials([spatial1, spatial2])
                .build();

            const formalInformalChoice = aFormalInformalChoice()
                .withChosenForm(ChosenFormType.INFORMAL)
                .withBestuurseenheidId(bestuurseenheid.id)
                .build();

            await formalInformalChoiceTestRepository.save(bestuurseenheid, formalInformalChoice);

            const displayConfiguration = aFullConceptDisplayConfiguration()
                .withBestuurseenheidId(bestuurseenheid.id)
                .withConceptId(concept.id)
                .withConceptIsNew(true)
                .withConceptIsInstantiated(false)
                .build();
            await conceptDisplayConfigurationTestRepository.save(bestuurseenheid, displayConfiguration);

            const createdInstance = await newInstanceDomainService.createNewFromConcept(bestuurseenheid, concept);

            const reloadedInstance = await instanceRepository.findById(bestuurseenheid, createdInstance.id);

            expect(createdInstance).toEqual(reloadedInstance);
            expect(createdInstance.id).not.toBeUndefined();
            expect(createdInstance.uuid).not.toBeUndefined();

            const expectedInstance =
                new InstanceBuilder()
                    .withId(createdInstance.id)
                    .withUuid(createdInstance.uuid)
                    .withCreatedBy(bestuurseenheid.id)
                    .withDateCreated(FormatPreservingDate.now())
                    .withDateModified(FormatPreservingDate.now())
                    .withStatus(InstanceStatusType.ONTWERP)
                    .withDutchLanguageVariant(Language.INFORMAL)
                    .withNeedsConversionFromFormalToInformal(false)
                    .withSpatials([spatial1, spatial2])
                    .withTitle(LanguageString.of(undefined, undefined, concept.title.nlInformal))
                    .withDescription(LanguageString.of(undefined, undefined, concept.description.nlInformal))
                    .withAdditionalDescription(LanguageString.of(undefined, undefined, concept.additionalDescription.nlInformal))
                    .withException(LanguageString.of(undefined, undefined, concept.exception.nlInformal))
                    .withRegulation(LanguageString.of(undefined, undefined, concept.regulation.nlInformal))
                    .withStartDate(concept.startDate)
                    .withEndDate(concept.endDate)
                    .withType(concept.type)
                    .withTargetAudiences(concept.targetAudiences)
                    .withThemes(concept.themes)
                    .withCompetentAuthorityLevels(concept.competentAuthorityLevels)
                    .withCompetentAuthorities(concept.competentAuthorities)
                    .withExecutingAuthorityLevels(concept.executingAuthorityLevels)
                    .withExecutingAuthorities([bestuurseenheid.id, ...concept.executingAuthorities])
                    .withPublicationMedia(concept.publicationMedia)
                    .withYourEuropeCategories(concept.yourEuropeCategories)
                    .withKeywords(concept.keywords)
                    .withRequirements([
                        new RequirementBuilder()
                            .withId(createdInstance.requirements[0].id)
                            .withUuid(createdInstance.requirements[0].uuid)
                            .withTitle(LanguageString.of(undefined, undefined, concept.requirements[0].title.nlInformal))
                            .withDescription(LanguageString.of(undefined, undefined, concept.requirements[0].description.nlInformal))
                            .withOrder(1)
                            .withEvidence(new EvidenceBuilder()
                                .withId(createdInstance.requirements[0].evidence.id)
                                .withUuid(createdInstance.requirements[0].evidence.uuid)
                                .withTitle(LanguageString.of(undefined, undefined, concept.requirements[0].evidence.title.nlInformal))
                                .withDescription(LanguageString.of(undefined, undefined, concept.requirements[0].evidence.description.nlInformal))
                                .build()
                            )
                            .build()
                        ,
                        new RequirementBuilder()
                            .withId(createdInstance.requirements[1].id)
                            .withUuid(createdInstance.requirements[1].uuid)
                            .withTitle(LanguageString.of(undefined, undefined, concept.requirements[1].title.nlInformal))
                            .withDescription(LanguageString.of(undefined, undefined, concept.requirements[1].description.nlInformal))
                            .withOrder(2)
                            .withEvidence(new EvidenceBuilder()
                                .withId(createdInstance.requirements[1].evidence.id)
                                .withUuid(createdInstance.requirements[1].evidence.uuid)
                                .withTitle(LanguageString.of(undefined, undefined, concept.requirements[1].evidence.title.nlInformal))
                                .withDescription(LanguageString.of(undefined, undefined, concept.requirements[1].evidence.description.nlInformal))
                                .build()
                            )
                            .build()
                    ])
                    .withProcedures([
                        new ProcedureBuilder()
                            .withId(createdInstance.procedures[0].id)
                            .withUuid(createdInstance.procedures[0].uuid)
                            .withTitle(LanguageString.of(undefined, undefined, concept.procedures[0].title.nlInformal))
                            .withDescription(LanguageString.of(undefined, undefined, concept.procedures[0].description.nlInformal))
                            .withOrder(1)
                            .withWebsites([
                                new WebsiteBuilder()
                                    .withId(createdInstance.procedures[0].websites[0].id)
                                    .withUuid(createdInstance.procedures[0].websites[0].uuid)
                                    .withTitle(LanguageString.of(undefined, undefined, concept.procedures[0].websites[0].title.nlInformal))
                                    .withDescription(LanguageString.of(undefined, undefined, concept.procedures[0].websites[0].description.nlInformal))
                                    .withOrder(1)
                                    .withUrl(concept.procedures[0].websites[0].url)
                                    .build(),
                                new WebsiteBuilder()
                                    .withId(createdInstance.procedures[0].websites[1].id)
                                    .withUuid(createdInstance.procedures[0].websites[1].uuid)
                                    .withTitle(LanguageString.of(undefined, undefined, concept.procedures[0].websites[1].title.nlInformal))
                                    .withDescription(LanguageString.of(undefined, undefined, concept.procedures[0].websites[1].description.nlInformal))
                                    .withOrder(2)
                                    .withUrl(concept.procedures[0].websites[1].url)
                                    .build(),
                            ])
                            .build(),
                        new ProcedureBuilder()
                            .withId(createdInstance.procedures[1].id)
                            .withUuid(createdInstance.procedures[1].uuid)
                            .withTitle(LanguageString.of(undefined, undefined, concept.procedures[1].title.nlInformal))
                            .withDescription(LanguageString.of(undefined, undefined, concept.procedures[1].description.nlInformal))
                            .withOrder(2)
                            .withWebsites([
                                new WebsiteBuilder()
                                    .withId(createdInstance.procedures[1].websites[0].id)
                                    .withUuid(createdInstance.procedures[1].websites[0].uuid)
                                    .withTitle(LanguageString.of(undefined, undefined, concept.procedures[1].websites[0].title.nlInformal))
                                    .withDescription(LanguageString.of(undefined, undefined, concept.procedures[1].websites[0].description.nlInformal))
                                    .withOrder(1)
                                    .withUrl(concept.procedures[1].websites[0].url)
                                    .build(),
                                new WebsiteBuilder()
                                    .withId(createdInstance.procedures[1].websites[1].id)
                                    .withUuid(createdInstance.procedures[1].websites[1].uuid)
                                    .withTitle(LanguageString.of(undefined, undefined, concept.procedures[1].websites[1].title.nlInformal))
                                    .withDescription(LanguageString.of(undefined, undefined, concept.procedures[1].websites[1].description.nlInformal))
                                    .withOrder(2)
                                    .withUrl(concept.procedures[1].websites[1].url)
                                    .build(),
                            ])
                            .build()
                    ])
                    .withWebsites([
                        new WebsiteBuilder()
                            .withId(createdInstance.websites[0].id)
                            .withUuid(createdInstance.websites[0].uuid)
                            .withTitle(LanguageString.of(undefined, undefined, concept.websites[0].title.nlInformal))
                            .withDescription(LanguageString.of(undefined, undefined, concept.websites[0].description.nlInformal))
                            .withOrder(1)
                            .withUrl(concept.websites[0].url)
                            .build(),
                        new WebsiteBuilder()
                            .withId(createdInstance.websites[1].id)
                            .withUuid(createdInstance.websites[1].uuid)
                            .withTitle(LanguageString.of(undefined, undefined, concept.websites[1].title.nlInformal))
                            .withDescription(LanguageString.of(undefined, undefined, concept.websites[1].description.nlInformal))
                            .withOrder(2)
                            .withUrl(concept.websites[1].url)
                            .build(),
                    ])
                    .withCosts([
                        new CostBuilder()
                            .withId(createdInstance.costs[0].id)
                            .withUuid(createdInstance.costs[0].uuid)
                            .withTitle(LanguageString.of(undefined, undefined, concept.costs[0].title.nlInformal))
                            .withDescription(LanguageString.of(undefined, undefined, concept.costs[0].description.nlInformal))
                            .withOrder(1)
                            .build(),
                        new CostBuilder()
                            .withId(createdInstance.costs[1].id)
                            .withUuid(createdInstance.costs[1].uuid)
                            .withTitle(LanguageString.of(undefined, undefined, concept.costs[1].title.nlInformal))
                            .withDescription(LanguageString.of(undefined, undefined, concept.costs[1].description.nlInformal))
                            .withOrder(2)
                            .build(),
                    ])
                    .withFinancialAdvantages([
                        new FinancialAdvantageBuilder()
                            .withId(createdInstance.financialAdvantages[0].id)
                            .withUuid(createdInstance.financialAdvantages[0].uuid)
                            .withTitle(LanguageString.of(undefined, undefined, concept.financialAdvantages[0].title.nlInformal))
                            .withDescription(LanguageString.of(undefined, undefined, concept.financialAdvantages[0].description.nlInformal))
                            .withOrder(1)
                            .build(),
                        new FinancialAdvantageBuilder()
                            .withId(createdInstance.financialAdvantages[1].id)
                            .withUuid(createdInstance.financialAdvantages[1].uuid)
                            .withTitle(LanguageString.of(undefined, undefined, concept.financialAdvantages[1].title.nlInformal))
                            .withDescription(LanguageString.of(undefined, undefined, concept.financialAdvantages[1].description.nlInformal))
                            .withOrder(2)
                            .build(),
                    ])
                    .withContactPoints([])
                    .withConceptId(concept.id)
                    .withConceptSnapshotId(concept.latestConceptSnapshot)
                    .withProductId(concept.productId)
                    .withLanguages([])
                    .withReviewStatus(undefined)
                    .withPublicationStatus(undefined)
                    .withLegalResources([
                        new LegalResourceBuilder()
                            .withId(createdInstance.legalResources[0].id)
                            .withUuid(createdInstance.legalResources[0].uuid)
                            .withTitle(LanguageString.of(undefined, undefined, concept.legalResources[0].title.nlInformal))
                            .withDescription(LanguageString.of(undefined, undefined, concept.legalResources[0].description.nlInformal))
                            .withUrl(concept.legalResources[0].url)
                            .withOrder(1)
                            .build(),
                        new LegalResourceBuilder()
                            .withId(createdInstance.legalResources[1].id)
                            .withUuid(createdInstance.legalResources[1].uuid)
                            .withTitle(LanguageString.of(undefined, undefined, concept.legalResources[1].title.nlInformal))
                            .withDescription(LanguageString.of(undefined, undefined, concept.legalResources[1].description.nlInformal))
                            .withUrl(concept.legalResources[1].url)
                            .withOrder(2)
                            .build(),
                    ])
                    .withForMunicipalityMerger(false)
                    .build();

            expect(createdInstance).toEqual(expectedInstance);
            expect(reloadedInstance).toEqual(expectedInstance);
        });

        test('Create new from minimal concept', async () => {
            const concept = aMinimalConcept().build();
            const spatial1 = buildNutsCodeIri(12345);
            const spatial2 = buildNutsCodeIri(67890);
            const bestuurseenheid = aBestuurseenheid()
                .withSpatials([spatial1, spatial2])
                .build();

            const displayConfiguration = aFullConceptDisplayConfiguration()
                .withBestuurseenheidId(bestuurseenheid.id)
                .withConceptId(concept.id)
                .withConceptIsNew(true)
                .withConceptIsInstantiated(false)
                .build();
            await conceptDisplayConfigurationTestRepository.save(bestuurseenheid, displayConfiguration);

            const createdInstance = await newInstanceDomainService.createNewFromConcept(bestuurseenheid, concept);

            const reloadedInstance = await instanceRepository.findById(bestuurseenheid, createdInstance.id);

            expect(createdInstance).toEqual(reloadedInstance);
            expect(createdInstance.id).not.toBeUndefined();
            expect(createdInstance.uuid).not.toBeUndefined();
        });

        test('Create new from concept where concept already includes competent authority of bestuurseenheid', async () => {
            const spatial1 = buildNutsCodeIri(12345);
            const spatial2 = buildNutsCodeIri(67890);
            const bestuurseenheid = aBestuurseenheid()
                .withId(BestuurseenheidTestBuilder.BORGLOON_IRI)
                .withSpatials([spatial1, spatial2])
                .build();

            const concept = aMinimalConcept()
                .withCompetentAuthorities([bestuurseenheid.id, BestuurseenheidTestBuilder.PEPINGEN_IRI])
                .withExecutingAuthorities([bestuurseenheid.id, BestuurseenheidTestBuilder.ASSENEDE_IRI])
                .build();

            const displayConfiguration = aFullConceptDisplayConfiguration()
                .withBestuurseenheidId(bestuurseenheid.id)
                .withConceptId(concept.id)
                .withConceptIsNew(true)
                .withConceptIsInstantiated(false)
                .build();
            await conceptDisplayConfigurationTestRepository.save(bestuurseenheid, displayConfiguration);

            const createdInstance = await newInstanceDomainService.createNewFromConcept(bestuurseenheid, concept);

            expect(createdInstance.competentAuthorities).toEqual([bestuurseenheid.id, BestuurseenheidTestBuilder.PEPINGEN_IRI]);
            expect(createdInstance.executingAuthorities).toEqual([bestuurseenheid.id, BestuurseenheidTestBuilder.ASSENEDE_IRI]);
        });

        test('Create new from concept should update displayConfiguration', async () => {
            const spatial1 = buildNutsCodeIri(12345);
            const spatial2 = buildNutsCodeIri(67890);
            const bestuurseenheid = aBestuurseenheid()
                .withSpatials([spatial1, spatial2])
                .build();

            const concept = aMinimalConcept()
                .withCompetentAuthorities([bestuurseenheid.id, BestuurseenheidTestBuilder.PEPINGEN_IRI])
                .withExecutingAuthorities([bestuurseenheid.id, BestuurseenheidTestBuilder.ASSENEDE_IRI])
                .build();

            const displayConfiguration = aFullConceptDisplayConfiguration()
                .withBestuurseenheidId(bestuurseenheid.id)
                .withConceptId(concept.id)
                .withConceptIsNew(true)
                .withConceptIsInstantiated(false)
                .build();

            await conceptDisplayConfigurationTestRepository.save(bestuurseenheid, displayConfiguration);

            await newInstanceDomainService.createNewFromConcept(bestuurseenheid, concept);

            const updatedConceptDisplayConfiguration = await conceptDisplayConfigurationTestRepository.findByConceptId(bestuurseenheid, concept.id);

            expect(updatedConceptDisplayConfiguration.conceptIsNew).toEqual(false);
            expect(updatedConceptDisplayConfiguration.conceptIsInstantiated).toEqual(true);
        });

    });

    describe('copy instance', () => {

        test('Copy instance, when instance is a full instance', async () => {
            const bestuurseenheid = aBestuurseenheid()
                .build();

            const instance = aFullInstance().withForMunicipalityMerger(true).withCreatedBy(bestuurseenheid.id).build();

            await bestuurseenheidRepository.save(bestuurseenheid);
            await instanceRepository.save(bestuurseenheid, instance);

            const copiedInstance = await newInstanceDomainService.copyFrom(bestuurseenheid, instance, false);

            const reloadedCopiedInstance = await instanceRepository.findById(bestuurseenheid, copiedInstance.id);

            expect(copiedInstance).toEqual(reloadedCopiedInstance);
            expect(copiedInstance.id).not.toEqual(instance.id);
            expect(copiedInstance.uuid).not.toEqual(instance.uuid);
            expect(copiedInstance.createdBy).toEqual(instance.createdBy);
            expect(copiedInstance.title).toEqual(LanguageString.ofValueInLanguage('Kopie van ' + instance.title.nlFormal, Language.FORMAL));
            expect(copiedInstance.description).toEqual(instance.description);
            expect(copiedInstance.additionalDescription).toEqual(instance.additionalDescription);
            expect(copiedInstance.exception).toEqual(instance.exception);
            expect(copiedInstance.regulation).toEqual(instance.regulation);
            expect(copiedInstance.startDate).toEqual(instance.startDate);
            expect(copiedInstance.endDate).toEqual(instance.endDate);
            expect(copiedInstance.type).toEqual(instance.type);
            expect(copiedInstance.targetAudiences).toEqual(instance.targetAudiences);
            expect(copiedInstance.themes).toEqual(instance.themes);
            expect(copiedInstance.competentAuthorityLevels).toEqual(instance.competentAuthorityLevels);
            expect(copiedInstance.competentAuthorities).toEqual(instance.competentAuthorities);
            expect(copiedInstance.executingAuthorityLevels).toEqual(instance.executingAuthorityLevels);
            expect(copiedInstance.executingAuthorities).toEqual(instance.executingAuthorities);
            expect(copiedInstance.publicationMedia).toEqual(instance.publicationMedia);
            expect(copiedInstance.yourEuropeCategories).toEqual(instance.yourEuropeCategories);
            expect(copiedInstance.keywords).toEqual(instance.keywords);
            expect(copiedInstance.requirements)
                .toEqual(expect.arrayContaining([
                    expect.objectContaining({
                        _id: expect.not.objectContaining(instance.requirements[0].id),
                        _uuid: expect.stringMatching(uuidRegex),
                        _title: instance.requirements[0].title,
                        _description: instance.requirements[0].description,
                        _order: 1,
                        _evidence: expect.objectContaining({
                            _id: expect.not.objectContaining(instance.requirements[0].evidence.id),
                            _uuid: expect.stringMatching(uuidRegex),
                            _title: instance.requirements[0].evidence.title,
                            _description: instance.requirements[0].evidence.description,
                        })
                    }),
                    expect.objectContaining({
                        _id: expect.not.objectContaining(instance.requirements[1].id),
                        _uuid: expect.stringMatching(uuidRegex),
                        _title: instance.requirements[1].title,
                        _description: instance.requirements[1].description,
                        _order: 2,
                        _evidence: expect.objectContaining({
                            _id: expect.not.objectContaining(instance.requirements[1].evidence.id),
                            _uuid: expect.stringMatching(uuidRegex),
                            _title: instance.requirements[1].evidence.title,
                            _description: instance.requirements[1].evidence.description,
                        })
                    })
                ]));
            expect(copiedInstance.procedures)
                .toEqual(expect.arrayContaining([
                    expect.objectContaining({
                        _id: expect.not.objectContaining(instance.procedures[0].id),
                        _uuid: expect.stringMatching(uuidRegex),
                        _title: instance.procedures[0].title,
                        _description: instance.procedures[0].description,
                        _order: instance.procedures[0].order,
                        _websites: expect.arrayContaining([
                            expect.objectContaining({
                                _id: expect.not.objectContaining(instance.procedures[0].websites[0].id),
                                _uuid: expect.stringMatching(uuidRegex),
                                _title: instance.procedures[0].websites[0].title,
                                _description: instance.procedures[0].websites[0].description,
                                _order: instance.procedures[0].websites[0].order,
                                _url: instance.procedures[0].websites[0].url,
                            }),
                            expect.objectContaining({
                                _id: expect.not.objectContaining(instance.procedures[0].websites[1].id),
                                _uuid: expect.stringMatching(uuidRegex),
                                _title: instance.procedures[0].websites[1].title,
                                _description: instance.procedures[0].websites[1].description,
                                _order: instance.procedures[0].websites[1].order,
                                _url: instance.procedures[0].websites[1].url,
                            })
                        ])
                    }),
                    expect.objectContaining({
                        _id: expect.not.objectContaining(instance.procedures[1].id),
                        _uuid: expect.stringMatching(uuidRegex),
                        _title: instance.procedures[1].title,
                        _description: instance.procedures[1].description,
                        _order: instance.procedures[1].order,
                        _websites: expect.arrayContaining([
                            expect.objectContaining({
                                _id: expect.not.objectContaining(instance.procedures[1].websites[0].id),
                                _uuid: expect.stringMatching(uuidRegex),
                                _title: instance.procedures[1].websites[0].title,
                                _description: instance.procedures[1].websites[0].description,
                                _order: instance.procedures[1].websites[0].order,
                                _url: instance.procedures[1].websites[0].url,
                            }),
                            expect.objectContaining({
                                _id: expect.not.objectContaining(instance.procedures[1].websites[1].id),
                                _uuid: expect.stringMatching(uuidRegex),
                                _title: instance.procedures[1].websites[1].title,
                                _description: instance.procedures[1].websites[1].description,
                                _order: instance.procedures[1].websites[1].order,
                                _url: instance.procedures[1].websites[1].url,
                            })
                        ])
                    })
                ]));
            expect(copiedInstance.websites)
                .toEqual(expect.arrayContaining([
                    expect.objectContaining({
                        _id: expect.not.objectContaining(instance.websites[0].id),
                        _uuid: expect.stringMatching(uuidRegex),
                        _title: instance.websites[0].title,
                        _description: instance.websites[0].description,
                        _order: instance.websites[0].order,
                        _url: instance.websites[0].url,
                    }),
                    expect.objectContaining({
                        _id: expect.not.objectContaining(instance.websites[1].id),
                        _uuid: expect.stringMatching(uuidRegex),
                        _title: instance.websites[1].title,
                        _description: instance.websites[1].description,
                        _order: instance.websites[1].order,
                        _url: instance.websites[1].url,
                    })
                ]));
            expect(copiedInstance.costs)
                .toEqual(expect.arrayContaining([
                    expect.objectContaining({
                        _id: expect.not.objectContaining(instance.costs[0].id),
                        _uuid: expect.stringMatching(uuidRegex),
                        _title: instance.costs[0].title,
                        _description: instance.costs[0].description,
                        _order: instance.costs[0].order
                    }),
                    expect.objectContaining({
                        _id: expect.not.objectContaining(instance.costs[1].id),
                        _uuid: expect.stringMatching(uuidRegex),
                        _title: instance.costs[1].title,
                        _description: instance.costs[1].description,
                        _order: instance.costs[1].order
                    })
                ]));
            expect(copiedInstance.financialAdvantages)
                .toEqual(expect.arrayContaining([
                    expect.objectContaining({
                        _id: expect.not.objectContaining(instance.financialAdvantages[0].id),
                        _uuid: expect.stringMatching(uuidRegex),
                        _title: instance.financialAdvantages[0].title,
                        _description: instance.financialAdvantages[0].description,
                        _order: instance.financialAdvantages[0].order
                    }),
                    expect.objectContaining({
                        _id: expect.not.objectContaining(instance.financialAdvantages[1].id),
                        _uuid: expect.stringMatching(uuidRegex),
                        _title: instance.financialAdvantages[1].title,
                        _description: instance.financialAdvantages[1].description,
                        _order: instance.financialAdvantages[1].order
                    })
                ]));
            expect(copiedInstance.contactPoints)
                .toEqual(expect.arrayContaining([
                    expect.objectContaining({
                        _id: expect.not.objectContaining(instance.contactPoints[0].id),
                        _uuid: expect.stringMatching(uuidRegex),
                        _url: instance.contactPoints[0].url,
                        _email: instance.contactPoints[0].email,
                        _telephone: instance.contactPoints[0].telephone,
                        _openingHours: instance.contactPoints[0].openingHours,
                        _address: expect.objectContaining({
                            _id: expect.not.objectContaining(instance.contactPoints[0].address.id),
                            _uuid: expect.stringMatching(uuidRegex),
                            _gemeentenaam: instance.contactPoints[0].address.gemeentenaam,
                            _land: instance.contactPoints[0].address.land,
                            _huisnummer: instance.contactPoints[0].address.huisnummer,
                            _busnummer: instance.contactPoints[0].address.busnummer,
                            _postcode: instance.contactPoints[0].address.postcode,
                            _straatnaam: instance.contactPoints[0].address.straatnaam,
                            _verwijstNaar: instance.contactPoints[0].address.verwijstNaar,
                        }),
                        _order: instance.contactPoints[0].order
                    }),
                    expect.objectContaining({
                        _id: expect.not.objectContaining(instance.contactPoints[1].id),
                        _uuid: expect.stringMatching(uuidRegex),
                        _url: instance.contactPoints[1].url,
                        _email: instance.contactPoints[1].email,
                        _telephone: instance.contactPoints[1].telephone,
                        _openingHours: instance.contactPoints[1].openingHours,
                        _address: expect.objectContaining({
                            _id: expect.not.objectContaining(instance.contactPoints[1].address.id),
                            _uuid: expect.stringMatching(uuidRegex),
                            _gemeentenaam: instance.contactPoints[1].address.gemeentenaam,
                            _land: instance.contactPoints[1].address.land,
                            _huisnummer: instance.contactPoints[1].address.huisnummer,
                            _busnummer: instance.contactPoints[1].address.busnummer,
                            _postcode: instance.contactPoints[1].address.postcode,
                            _straatnaam: instance.contactPoints[1].address.straatnaam,
                            _verwijstNaar: instance.contactPoints[1].address.verwijstNaar,
                        }),
                        _order: instance.contactPoints[1].order
                    })
                ]));
            expect(copiedInstance.conceptId).toEqual(instance.conceptId);
            expect(copiedInstance.conceptSnapshotId).toEqual(instance.conceptSnapshotId);
            expect(copiedInstance.productId).toEqual(instance.productId);
            expect(copiedInstance.languages).toEqual(instance.languages);
            expect(copiedInstance.dutchLanguageVariant).toEqual(instance.dutchLanguageVariant);
            expect(copiedInstance.needsConversionFromFormalToInformal).toEqual(instance.needsConversionFromFormalToInformal);
            expect(copiedInstance.dateCreated).toEqual(FormatPreservingDate.now());
            expect(copiedInstance.dateModified).toEqual(FormatPreservingDate.now());
            expect(copiedInstance.dateSent).toBeUndefined();
            expect(copiedInstance.datePublished).toBeUndefined();
            expect(copiedInstance.datePublished).toBeUndefined();
            expect(copiedInstance.status).toEqual(InstanceStatusType.ONTWERP);
            expect(copiedInstance.reviewStatus).toEqual(instance.reviewStatus);
            expect(copiedInstance.publicationStatus).toBeUndefined();
            expect(copiedInstance.spatials).toEqual(instance.spatials);
            expect(copiedInstance.legalResources).toEqual(expect.arrayContaining([
                expect.objectContaining({
                    _id: expect.not.objectContaining(instance.legalResources[0].id),
                    _uuid: expect.stringMatching(uuidRegex),
                    _title: instance.legalResources[0].title,
                    _description: instance.legalResources[0].description,
                    _url: instance.legalResources[0].url,
                    _order: 1
                }),
                expect.objectContaining({
                    _id: expect.not.objectContaining(instance.legalResources[1].id),
                    _uuid: expect.stringMatching(uuidRegex),
                    _title: instance.legalResources[1].title,
                    _description: instance.legalResources[1].description,
                    _url: instance.legalResources[1].url,
                    _order: 2
                })]));
            expect(copiedInstance.forMunicipalityMerger).toBeFalse();
        });

        test('Copy instance, when instance is a minimal instance', async () => {
            const bestuurseenheid = aBestuurseenheid()
                .build();

            const instance = aMinimalInstance().withCreatedBy(bestuurseenheid.id).build();

            await bestuurseenheidRepository.save(bestuurseenheid);
            await instanceRepository.save(bestuurseenheid, instance);

            const copiedInstance = await newInstanceDomainService.copyFrom(bestuurseenheid, instance, false);

            const reloadedCopiedInstance = await instanceRepository.findById(bestuurseenheid, copiedInstance.id);

            expect(copiedInstance).toEqual(reloadedCopiedInstance);
            expect(copiedInstance.id).not.toEqual(instance.id);
            expect(copiedInstance.uuid).not.toEqual(instance.uuid);
            expect(copiedInstance.createdBy).toEqual(instance.createdBy);
            expect(copiedInstance.title).toEqual(LanguageString.ofValueInLanguage('Kopie van ', Language.FORMAL));
            expect(copiedInstance.description).toEqual(instance.description);
            expect(copiedInstance.additionalDescription).toEqual(instance.additionalDescription);
            expect(copiedInstance.exception).toEqual(instance.exception);
            expect(copiedInstance.regulation).toEqual(instance.regulation);
            expect(copiedInstance.startDate).toEqual(instance.startDate);
            expect(copiedInstance.endDate).toEqual(instance.endDate);
            expect(copiedInstance.type).toEqual(instance.type);
            expect(copiedInstance.targetAudiences).toEqual(instance.targetAudiences);
            expect(copiedInstance.themes).toEqual(instance.themes);
            expect(copiedInstance.competentAuthorityLevels).toEqual(instance.competentAuthorityLevels);
            expect(copiedInstance.competentAuthorities).toEqual(instance.competentAuthorities);
            expect(copiedInstance.executingAuthorityLevels).toEqual(instance.executingAuthorityLevels);
            expect(copiedInstance.executingAuthorities).toEqual(instance.executingAuthorities);
            expect(copiedInstance.publicationMedia).toEqual(instance.publicationMedia);
            expect(copiedInstance.yourEuropeCategories).toEqual(instance.yourEuropeCategories);
            expect(copiedInstance.keywords).toEqual(instance.keywords);
            expect(copiedInstance.requirements).toEqual(instance.requirements);
            expect(copiedInstance.procedures).toEqual(instance.procedures);
            expect(copiedInstance.websites).toEqual(instance.websites);
            expect(copiedInstance.costs).toEqual(instance.costs);
            expect(copiedInstance.financialAdvantages).toEqual(instance.financialAdvantages);
            expect(copiedInstance.contactPoints).toEqual(instance.contactPoints);
            expect(copiedInstance.conceptId).toEqual(instance.conceptId);
            expect(copiedInstance.conceptSnapshotId).toEqual(instance.conceptSnapshotId);
            expect(copiedInstance.productId).toEqual(instance.productId);
            expect(copiedInstance.languages).toEqual(instance.languages);
            expect(copiedInstance.dutchLanguageVariant).toEqual(instance.dutchLanguageVariant);
            expect(copiedInstance.needsConversionFromFormalToInformal).toEqual(instance.needsConversionFromFormalToInformal);
            expect(copiedInstance.dateCreated).toEqual(FormatPreservingDate.now());
            expect(copiedInstance.dateModified).toEqual(FormatPreservingDate.now());
            expect(copiedInstance.dateSent).toBeUndefined();
            expect(copiedInstance.datePublished).toBeUndefined();
            expect(copiedInstance.datePublished).toBeUndefined();
            expect(copiedInstance.status).toEqual(InstanceStatusType.ONTWERP);
            expect(copiedInstance.reviewStatus).toEqual(instance.reviewStatus);
            expect(copiedInstance.publicationStatus).toBeUndefined();
            expect(copiedInstance.spatials).toEqual(instance.spatials);
            expect(copiedInstance.legalResources).toEqual(instance.legalResources);
            expect(copiedInstance.forMunicipalityMerger).toBeFalse();
        });

        test('Copy instance clears statuses', async () => {
            const bestuurseenheid = aBestuurseenheid()
                .build();

            const instance = aMinimalInstance()
                .withStatus(InstanceStatusType.VERZONDEN)
                .withDateSent(InstanceTestBuilder.DATE_SENT)
                .withPublicationStatus(InstancePublicationStatusType.GEPUBLICEERD)
                .withDatePublished(InstanceTestBuilder.DATE_PUBLISHED)
                .withCreatedBy(bestuurseenheid.id).build();

            await bestuurseenheidRepository.save(bestuurseenheid);
            await instanceRepository.save(bestuurseenheid, instance);

            const copiedInstance = await newInstanceDomainService.copyFrom(bestuurseenheid, instance, false);

            const reloadedCopiedInstance = await instanceRepository.findById(bestuurseenheid, copiedInstance.id);

            expect(copiedInstance).toEqual(reloadedCopiedInstance);
            expect(copiedInstance.id).not.toEqual(instance.id);
            expect(copiedInstance.uuid).not.toEqual(instance.uuid);
            expect(copiedInstance.createdBy).toEqual(instance.createdBy);
            expect(copiedInstance.status).toEqual(InstanceStatusType.ONTWERP);
            expect(copiedInstance.dateSent).toBeUndefined();
            expect(copiedInstance.publicationStatus).toBeUndefined();
            expect(copiedInstance.datePublished).toBeUndefined();
        });

        test('for municipality merger is required', async () => {
            const bestuurseenheid = aBestuurseenheid()
                .build();

            const instance = aMinimalInstance().withCreatedBy(bestuurseenheid.id).build();

            await bestuurseenheidRepository.save(bestuurseenheid);
            await instanceRepository.save(bestuurseenheid, instance);

            await expect(newInstanceDomainService.copyFrom(bestuurseenheid, instance, undefined)).rejects.toThrowWithMessage(InvariantError, `'forMunicipalityMerger' mag niet ontbreken`);

        });

        test('copy instance for municipality merger, competent authority level not Lokaal', async () => {
            const bestuurseenheid = aBestuurseenheid()
                .build();

            const instance = aMinimalInstance()
                .withCreatedBy(bestuurseenheid.id)
                .withExecutingAuthorityLevels(InstanceTestBuilder.EXECUTING_AUTHORITY_LEVELS)
                .withExecutingAuthorities(InstanceTestBuilder.EXECUTING_AUTHORITIES)
                .withCompetentAuthorityLevels([CompetentAuthorityLevelType.EUROPEES, CompetentAuthorityLevelType.FEDERAAL])
                .withCompetentAuthorities(InstanceTestBuilder.COMPETENT_AUTHORITIES)
                .withSpatials(InstanceTestBuilder.SPATIALS)
                .build();

            await bestuurseenheidRepository.save(bestuurseenheid);
            await instanceRepository.save(bestuurseenheid, instance);

            const copiedInstance = await newInstanceDomainService.copyFrom(bestuurseenheid, instance, true);

            const reloadedCopiedInstance = await instanceRepository.findById(bestuurseenheid, copiedInstance.id);

            expect(copiedInstance).toEqual(reloadedCopiedInstance);
            expect(copiedInstance.id).not.toEqual(instance.id);
            expect(copiedInstance.uuid).not.toEqual(instance.uuid);
            expect(copiedInstance.executingAuthorityLevels).toEqual(instance.executingAuthorityLevels);
            expect(copiedInstance.executingAuthorities).toBeEmpty();
            expect(copiedInstance.competentAuthorityLevels).toEqual(instance.competentAuthorityLevels);
            expect(copiedInstance.competentAuthorities).toEqual(instance.competentAuthorities);
            expect(copiedInstance.spatials).toBeEmpty();
            expect(copiedInstance.forMunicipalityMerger).toBeTrue();
        });

        test('copy instance for municipality merger, competent authority level also Lokaal', async () => {
            const bestuurseenheid = aBestuurseenheid()
                .build();

            const instance = aMinimalInstance()
                .withCreatedBy(bestuurseenheid.id)
                .withExecutingAuthorityLevels(InstanceTestBuilder.EXECUTING_AUTHORITY_LEVELS)
                .withExecutingAuthorities(InstanceTestBuilder.EXECUTING_AUTHORITIES)
                .withCompetentAuthorityLevels([CompetentAuthorityLevelType.EUROPEES, CompetentAuthorityLevelType.LOKAAL, CompetentAuthorityLevelType.FEDERAAL])
                .withCompetentAuthorities(InstanceTestBuilder.COMPETENT_AUTHORITIES)
                .withSpatials(InstanceTestBuilder.SPATIALS)
                .build();

            await bestuurseenheidRepository.save(bestuurseenheid);
            await instanceRepository.save(bestuurseenheid, instance);

            const copiedInstance = await newInstanceDomainService.copyFrom(bestuurseenheid, instance, true);

            const reloadedCopiedInstance = await instanceRepository.findById(bestuurseenheid, copiedInstance.id);

            expect(copiedInstance).toEqual(reloadedCopiedInstance);
            expect(copiedInstance.id).not.toEqual(instance.id);
            expect(copiedInstance.uuid).not.toEqual(instance.uuid);
            expect(copiedInstance.executingAuthorityLevels).toEqual(instance.executingAuthorityLevels);
            expect(copiedInstance.executingAuthorities).toBeEmpty();
            expect(copiedInstance.competentAuthorityLevels).toEqual(instance.competentAuthorityLevels);
            expect(copiedInstance.competentAuthorities).toBeEmpty();
            expect(copiedInstance.spatials).toBeEmpty();
            expect(copiedInstance.forMunicipalityMerger).toBeTrue();
        });

    });


});
