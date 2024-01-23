import {NewInstanceDomainService} from "../../../src/core/domain/new-instance-domain-service";
import {InstanceSparqlRepository} from "../../../src/driven/persistence/instance-sparql-repository";
import {aBestuurseenheid} from "./bestuurseenheid-test-builder";
import {buildBestuurseenheidIri, buildSpatialRefNis2019Iri} from "./iri-test-builder";
import {uuid} from "../../../mu-helper";
import {ChosenFormType, InstanceStatusType} from "../../../src/core/domain/types";
import {InstanceTestBuilder} from "./instance-test-builder";
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
import {
    FormalInformalChoiceSparqlTestRepository
} from "../../driven/persistence/formal-informal-choice-sparql-test-repository";
import {aFormalInformalChoice} from "./formal-informal-choice-test-builder";

describe('Creating a new Instance domain service', () => {

    const instanceRepository = new InstanceSparqlRepository(TEST_SPARQL_ENDPOINT);
    const formalInformalChoiceRepository = new FormalInformalChoiceSparqlRepository(TEST_SPARQL_ENDPOINT);
    const formalInformalChoiceTestRepository = new FormalInformalChoiceSparqlTestRepository(TEST_SPARQL_ENDPOINT);
    const newInstanceDomainService = new NewInstanceDomainService(instanceRepository, formalInformalChoiceRepository);
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

    test('Create new empty', async () => {
        const spatial1 = buildSpatialRefNis2019Iri(12345);
        const spatial2 = buildSpatialRefNis2019Iri(67890);
        const bestuurseenheid =
            aBestuurseenheid()
                .withId(buildBestuurseenheidIri(uuid()))
                .withSpatials([spatial1, spatial2])
                .build();

        const createdInstance = await newInstanceDomainService.createNewEmpty(bestuurseenheid);

        const reloadedInstance = await instanceRepository.findById(bestuurseenheid, createdInstance.id);

        expect(createdInstance).toEqual(reloadedInstance);
        expect(createdInstance.id).not.toBeUndefined();
        expect(createdInstance.uuid).not.toBeUndefined();

        const expectedInstance =
            new InstanceTestBuilder()
                .withId(createdInstance.id)
                .withUuid(createdInstance.uuid)
                .withCreatedBy(bestuurseenheid.id)
                .withDateCreated(FormatPreservingDate.of(fixedToday))
                .withDateModified(FormatPreservingDate.of(fixedToday))
                .withStatus(InstanceStatusType.ONTWERP)
                .withSpatials([spatial1, spatial2])
                .withCompetentAuthorities([bestuurseenheid.id])
                .withExecutingAuthorities([bestuurseenheid.id])
                .build();
        expect(createdInstance).toEqual(expectedInstance);
        expect(reloadedInstance).toEqual(expectedInstance);
    });

    test('Create new from concept', async () => {
        const concept = aFullConcept().build();
        const spatial1 = buildSpatialRefNis2019Iri(12345);
        const spatial2 = buildSpatialRefNis2019Iri(67890);
        const bestuurseenheid = aBestuurseenheid()
            .withSpatials([spatial1, spatial2])
            .build();

        const createdInstance = await newInstanceDomainService.createNewFromConcept(bestuurseenheid, concept);

        const reloadedInstance = await instanceRepository.findById(bestuurseenheid, createdInstance.id);

        expect(createdInstance).toEqual(reloadedInstance);
        expect(createdInstance.id).not.toBeUndefined();
        expect(createdInstance.uuid).not.toBeUndefined();

        const expectedInstance =
            new InstanceTestBuilder()
                .withId(createdInstance.id)
                .withUuid(createdInstance.uuid)
                .withCreatedBy(bestuurseenheid.id)
                .withDateCreated(FormatPreservingDate.of(fixedToday))
                .withDateModified(FormatPreservingDate.of(fixedToday))
                .withStatus(InstanceStatusType.ONTWERP)
                .withSpatials([spatial1, spatial2])
                .withCompetentAuthorities([bestuurseenheid.id])
                .withExecutingAuthorities([bestuurseenheid.id])
                .withTitle(LanguageString.of(concept.title.en, undefined, concept.title.nlFormal))
                .withDescription(LanguageString.of(concept.description.en, undefined, concept.description.nlFormal))
                .withAdditionalDescription(LanguageString.of(concept.additionalDescription.en, undefined, concept.additionalDescription.nlFormal))
                .withException(LanguageString.of(concept.exception.en, undefined, concept.exception.nlFormal))
                .withRegulation(LanguageString.of(concept.regulation.en, undefined, concept.regulation.nlFormal))
                .withStartDate(concept.startDate)
                .withEndDate(concept.endDate)
                .withType(concept.type)
                .withTargetAudiences(concept.targetAudiences)
                .withThemes(concept.themes)
                .withCompetentAuthorityLevels(concept.competentAuthorityLevels)
                .withExecutingAuthorityLevels(concept.executingAuthorityLevels)
                .withPublicationMedia(concept.publicationMedia)
                .withYourEuropeCategories(concept.yourEuropeCategories)
                .withKeywords(concept.keywords)
                .withRequirements([
                    new RequirementBuilder()
                        .withId(createdInstance.requirements[0].id)
                        .withUuid(createdInstance.requirements[0].uuid)
                        .withTitle(LanguageString.of(concept.requirements[0].title.en, undefined, concept.requirements[0].title.nlFormal))
                        .withDescription(LanguageString.of(concept.requirements[0].description.en, undefined, concept.requirements[0].description.nlFormal))
                        .withEvidence(new EvidenceBuilder()
                            .withId(createdInstance.requirements[0].evidence.id)
                            .withUuid(createdInstance.requirements[0].evidence.uuid)
                            .withTitle(LanguageString.of(concept.requirements[0].evidence.title.en, undefined, concept.requirements[0].evidence.title.nlFormal))
                            .withDescription(LanguageString.of(concept.requirements[0].evidence.description.en, undefined, concept.requirements[0].evidence.description.nlFormal))
                            .withSource(concept.requirements[0].evidence.id)
                            .buildForInstance()
                        )
                        .withSource(concept.requirements[0].id)
                        .buildForInstance()
                    ,
                    new RequirementBuilder()
                        .withId(createdInstance.requirements[1].id)
                        .withUuid(createdInstance.requirements[1].uuid)
                        .withTitle(LanguageString.of(concept.requirements[1].title.en, undefined, concept.requirements[1].title.nlFormal))
                        .withDescription(LanguageString.of(concept.requirements[1].description.en, undefined, concept.requirements[1].description.nlFormal))
                        .withEvidence(new EvidenceBuilder()
                            .withId(createdInstance.requirements[1].evidence.id)
                            .withUuid(createdInstance.requirements[1].evidence.uuid)
                            .withTitle(LanguageString.of(concept.requirements[1].evidence.title.en, undefined, concept.requirements[1].evidence.title.nlFormal))
                            .withDescription(LanguageString.of(concept.requirements[1].evidence.description.en, undefined, concept.requirements[1].evidence.description.nlFormal))
                            .withSource(concept.requirements[1].evidence.id)
                            .buildForInstance()
                        )
                        .withSource(concept.requirements[1].id)
                        .buildForInstance()
                ])
                .withProcedures([
                    new ProcedureBuilder()
                        .withId(createdInstance.procedures[0].id)
                        .withUuid(createdInstance.procedures[0].uuid)
                        .withTitle(LanguageString.of(concept.procedures[0].title.en, undefined, concept.procedures[0].title.nlFormal))
                        .withDescription(LanguageString.of(concept.procedures[0].description.en, undefined, concept.procedures[0].description.nlFormal))
                        .withWebsites([
                            new WebsiteBuilder()
                                .withId(createdInstance.procedures[0].websites[0].id)
                                .withUuid(createdInstance.procedures[0].websites[0].uuid)
                                .withTitle(LanguageString.of(concept.procedures[0].websites[0].title.en, undefined, concept.procedures[0].websites[0].title.nlFormal))
                                .withDescription(LanguageString.of(concept.procedures[0].websites[0].description.en, undefined, concept.procedures[0].websites[0].description.nlFormal))
                                .withUrl(concept.procedures[0].websites[0].url)
                                .withSource(concept.procedures[0].websites[0].id)
                                .buildForInstance(),
                            new WebsiteBuilder()
                                .withId(createdInstance.procedures[0].websites[1].id)
                                .withUuid(createdInstance.procedures[0].websites[1].uuid)
                                .withTitle(LanguageString.of(concept.procedures[0].websites[1].title.en, undefined, concept.procedures[0].websites[1].title.nlFormal))
                                .withDescription(LanguageString.of(concept.procedures[0].websites[1].description.en, undefined, concept.procedures[0].websites[1].description.nlFormal))
                                .withUrl(concept.procedures[0].websites[1].url)
                                .withSource(concept.procedures[0].websites[1].id)
                                .buildForInstance(),
                        ])
                        .withSource(concept.procedures[0].id)
                        .buildForInstance(),
                    new ProcedureBuilder()
                        .withId(createdInstance.procedures[1].id)
                        .withUuid(createdInstance.procedures[1].uuid)
                        .withTitle(LanguageString.of(concept.procedures[1].title.en, undefined, concept.procedures[1].title.nlFormal))
                        .withDescription(LanguageString.of(concept.procedures[1].description.en, undefined, concept.procedures[1].description.nlFormal))
                        .withWebsites([
                            new WebsiteBuilder()
                                .withId(createdInstance.procedures[1].websites[0].id)
                                .withUuid(createdInstance.procedures[1].websites[0].uuid)
                                .withTitle(LanguageString.of(concept.procedures[1].websites[0].title.en, undefined, concept.procedures[1].websites[0].title.nlFormal))
                                .withDescription(LanguageString.of(concept.procedures[1].websites[0].description.en, undefined, concept.procedures[1].websites[0].description.nlFormal))
                                .withUrl(concept.procedures[1].websites[0].url)
                                .withSource(concept.procedures[1].websites[0].id)
                                .buildForInstance(),
                            new WebsiteBuilder()
                                .withId(createdInstance.procedures[1].websites[1].id)
                                .withUuid(createdInstance.procedures[1].websites[1].uuid)
                                .withTitle(LanguageString.of(concept.procedures[1].websites[1].title.en, undefined, concept.procedures[1].websites[1].title.nlFormal))
                                .withDescription(LanguageString.of(concept.procedures[1].websites[1].description.en, undefined, concept.procedures[1].websites[1].description.nlFormal))
                                .withUrl(concept.procedures[1].websites[1].url)
                                .withSource(concept.procedures[1].websites[1].id)
                                .buildForInstance(),
                        ])
                        .withSource(concept.procedures[1].id)
                        .buildForInstance()
                ])
                .withWebsites([
                    new WebsiteBuilder()
                        .withId(createdInstance.websites[0].id)
                        .withUuid(createdInstance.websites[0].uuid)
                        .withTitle(LanguageString.of(concept.websites[0].title.en, undefined, concept.websites[0].title.nlFormal))
                        .withDescription(LanguageString.of(concept.websites[0].description.en, undefined, concept.websites[0].description.nlFormal))
                        .withUrl(concept.websites[0].url)
                        .withSource(concept.websites[0].id)
                        .buildForInstance(),
                    new WebsiteBuilder()
                        .withId(createdInstance.websites[1].id)
                        .withUuid(createdInstance.websites[1].uuid)
                        .withTitle(LanguageString.of(concept.websites[1].title.en, undefined, concept.websites[1].title.nlFormal))
                        .withDescription(LanguageString.of(concept.websites[1].description.en, undefined, concept.websites[1].description.nlFormal))
                        .withUrl(concept.websites[1].url)
                        .withSource(concept.websites[1].id)
                        .buildForInstance(),
                ])
                .withCosts([
                    new CostBuilder()
                        .withId(createdInstance.costs[0].id)
                        .withUuid(createdInstance.costs[0].uuid)
                        .withTitle(LanguageString.of(concept.costs[0].title.en, undefined, concept.costs[0].title.nlFormal))
                        .withDescription(LanguageString.of(concept.costs[0].description.en, undefined, concept.costs[0].description.nlFormal))
                        .withSource(concept.costs[0].id)
                        .buildForInstance(),
                    new CostBuilder()
                        .withId(createdInstance.costs[1].id)
                        .withUuid(createdInstance.costs[1].uuid)
                        .withTitle(LanguageString.of(concept.costs[1].title.en, undefined, concept.costs[1].title.nlFormal))
                        .withDescription(LanguageString.of(concept.costs[1].description.en, undefined, concept.costs[1].description.nlFormal))
                        .withSource(concept.costs[1].id)
                        .buildForInstance(),
                ])
                .withFinancialAdvantages([
                    new FinancialAdvantageBuilder()
                        .withId(createdInstance.financialAdvantages[0].id)
                        .withUuid(createdInstance.financialAdvantages[0].uuid)
                        .withTitle(LanguageString.of(concept.financialAdvantages[0].title.en, undefined, concept.financialAdvantages[0].title.nlFormal))
                        .withDescription(LanguageString.of(concept.financialAdvantages[0].description.en, undefined, concept.financialAdvantages[0].description.nlFormal))
                        .withSource(concept.financialAdvantages[0].id)
                        .buildForInstance(),
                    new FinancialAdvantageBuilder()
                        .withId(createdInstance.financialAdvantages[1].id)
                        .withUuid(createdInstance.financialAdvantages[1].uuid)
                        .withTitle(LanguageString.of(concept.financialAdvantages[1].title.en, undefined, concept.financialAdvantages[1].title.nlFormal))
                        .withDescription(LanguageString.of(concept.financialAdvantages[1].description.en, undefined, concept.financialAdvantages[1].description.nlFormal))
                        .withSource(concept.financialAdvantages[1].id)
                        .buildForInstance(),
                ])
                .withContactPoints([])
                .withSource(concept.id)
                .withVersionedSource(concept.latestConceptSnapshot)
                .withLanguages([])
                .withReviewStatus(undefined)
                .withPublicationStatus(undefined)
                .withLegalResources(concept.legalResources)
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
    });

    test('Create new from concept when chosen form is formal', async () => {
        const concept = aFullConcept().build();
        const spatial1 = buildSpatialRefNis2019Iri(12345);
        const spatial2 = buildSpatialRefNis2019Iri(67890);
        const bestuurseenheid = aBestuurseenheid()
            .withSpatials([spatial1, spatial2])
            .build();

        const formalInformalChoice = aFormalInformalChoice()
            .withChosenForm(ChosenFormType.FORMAL)
            .withBestuurseenheidId(bestuurseenheid.id)
            .build();

        await formalInformalChoiceTestRepository.save(bestuurseenheid, formalInformalChoice);

        const createdInstance = await newInstanceDomainService.createNewFromConcept(bestuurseenheid, concept);

        const reloadedInstance = await instanceRepository.findById(bestuurseenheid, createdInstance.id);

        expect(createdInstance).toEqual(reloadedInstance);
        expect(createdInstance.id).not.toBeUndefined();
        expect(createdInstance.uuid).not.toBeUndefined();

        const expectedInstance =
            new InstanceTestBuilder()
                .withId(createdInstance.id)
                .withUuid(createdInstance.uuid)
                .withCreatedBy(bestuurseenheid.id)
                .withDateCreated(FormatPreservingDate.of(fixedToday))
                .withDateModified(FormatPreservingDate.of(fixedToday))
                .withStatus(InstanceStatusType.ONTWERP)
                .withSpatials([spatial1, spatial2])
                .withCompetentAuthorities([bestuurseenheid.id])
                .withExecutingAuthorities([bestuurseenheid.id])
                .withTitle(LanguageString.of(concept.title.en, undefined, concept.title.nlFormal))
                .withDescription(LanguageString.of(concept.description.en, undefined, concept.description.nlFormal))
                .withAdditionalDescription(LanguageString.of(concept.additionalDescription.en, undefined, concept.additionalDescription.nlFormal))
                .withException(LanguageString.of(concept.exception.en, undefined, concept.exception.nlFormal))
                .withRegulation(LanguageString.of(concept.regulation.en, undefined, concept.regulation.nlFormal))
                .withStartDate(concept.startDate)
                .withEndDate(concept.endDate)
                .withType(concept.type)
                .withTargetAudiences(concept.targetAudiences)
                .withThemes(concept.themes)
                .withCompetentAuthorityLevels(concept.competentAuthorityLevels)
                .withExecutingAuthorityLevels(concept.executingAuthorityLevels)
                .withPublicationMedia(concept.publicationMedia)
                .withYourEuropeCategories(concept.yourEuropeCategories)
                .withKeywords(concept.keywords)
                .withRequirements([
                    new RequirementBuilder()
                        .withId(createdInstance.requirements[0].id)
                        .withUuid(createdInstance.requirements[0].uuid)
                        .withTitle(LanguageString.of(concept.requirements[0].title.en, undefined, concept.requirements[0].title.nlFormal))
                        .withDescription(LanguageString.of(concept.requirements[0].description.en, undefined, concept.requirements[0].description.nlFormal))
                        .withEvidence(new EvidenceBuilder()
                            .withId(createdInstance.requirements[0].evidence.id)
                            .withUuid(createdInstance.requirements[0].evidence.uuid)
                            .withTitle(LanguageString.of(concept.requirements[0].evidence.title.en, undefined, concept.requirements[0].evidence.title.nlFormal))
                            .withDescription(LanguageString.of(concept.requirements[0].evidence.description.en, undefined, concept.requirements[0].evidence.description.nlFormal))
                            .withSource(concept.requirements[0].evidence.id)
                            .buildForInstance()
                        )
                        .withSource(concept.requirements[0].id)
                        .buildForInstance()
                    ,
                    new RequirementBuilder()
                        .withId(createdInstance.requirements[1].id)
                        .withUuid(createdInstance.requirements[1].uuid)
                        .withTitle(LanguageString.of(concept.requirements[1].title.en, undefined, concept.requirements[1].title.nlFormal))
                        .withDescription(LanguageString.of(concept.requirements[1].description.en, undefined, concept.requirements[1].description.nlFormal))
                        .withEvidence(new EvidenceBuilder()
                            .withId(createdInstance.requirements[1].evidence.id)
                            .withUuid(createdInstance.requirements[1].evidence.uuid)
                            .withTitle(LanguageString.of(concept.requirements[1].evidence.title.en, undefined, concept.requirements[1].evidence.title.nlFormal))
                            .withDescription(LanguageString.of(concept.requirements[1].evidence.description.en, undefined, concept.requirements[1].evidence.description.nlFormal))
                            .withSource(concept.requirements[1].evidence.id)
                            .buildForInstance()
                        )
                        .withSource(concept.requirements[1].id)
                        .buildForInstance()
                ])
                .withProcedures([
                    new ProcedureBuilder()
                        .withId(createdInstance.procedures[0].id)
                        .withUuid(createdInstance.procedures[0].uuid)
                        .withTitle(LanguageString.of(concept.procedures[0].title.en, undefined, concept.procedures[0].title.nlFormal))
                        .withDescription(LanguageString.of(concept.procedures[0].description.en, undefined, concept.procedures[0].description.nlFormal))
                        .withWebsites([
                            new WebsiteBuilder()
                                .withId(createdInstance.procedures[0].websites[0].id)
                                .withUuid(createdInstance.procedures[0].websites[0].uuid)
                                .withTitle(LanguageString.of(concept.procedures[0].websites[0].title.en, undefined, concept.procedures[0].websites[0].title.nlFormal))
                                .withDescription(LanguageString.of(concept.procedures[0].websites[0].description.en, undefined, concept.procedures[0].websites[0].description.nlFormal))
                                .withUrl(concept.procedures[0].websites[0].url)
                                .withSource(concept.procedures[0].websites[0].id)
                                .buildForInstance(),
                            new WebsiteBuilder()
                                .withId(createdInstance.procedures[0].websites[1].id)
                                .withUuid(createdInstance.procedures[0].websites[1].uuid)
                                .withTitle(LanguageString.of(concept.procedures[0].websites[1].title.en, undefined, concept.procedures[0].websites[1].title.nlFormal))
                                .withDescription(LanguageString.of(concept.procedures[0].websites[1].description.en, undefined, concept.procedures[0].websites[1].description.nlFormal))
                                .withUrl(concept.procedures[0].websites[1].url)
                                .withSource(concept.procedures[0].websites[1].id)
                                .buildForInstance(),
                        ])
                        .withSource(concept.procedures[0].id)
                        .buildForInstance(),
                    new ProcedureBuilder()
                        .withId(createdInstance.procedures[1].id)
                        .withUuid(createdInstance.procedures[1].uuid)
                        .withTitle(LanguageString.of(concept.procedures[1].title.en, undefined, concept.procedures[1].title.nlFormal))
                        .withDescription(LanguageString.of(concept.procedures[1].description.en, undefined, concept.procedures[1].description.nlFormal))
                        .withWebsites([
                            new WebsiteBuilder()
                                .withId(createdInstance.procedures[1].websites[0].id)
                                .withUuid(createdInstance.procedures[1].websites[0].uuid)
                                .withTitle(LanguageString.of(concept.procedures[1].websites[0].title.en, undefined, concept.procedures[1].websites[0].title.nlFormal))
                                .withDescription(LanguageString.of(concept.procedures[1].websites[0].description.en, undefined, concept.procedures[1].websites[0].description.nlFormal))
                                .withUrl(concept.procedures[1].websites[0].url)
                                .withSource(concept.procedures[1].websites[0].id)
                                .buildForInstance(),
                            new WebsiteBuilder()
                                .withId(createdInstance.procedures[1].websites[1].id)
                                .withUuid(createdInstance.procedures[1].websites[1].uuid)
                                .withTitle(LanguageString.of(concept.procedures[1].websites[1].title.en, undefined, concept.procedures[1].websites[1].title.nlFormal))
                                .withDescription(LanguageString.of(concept.procedures[1].websites[1].description.en, undefined, concept.procedures[1].websites[1].description.nlFormal))
                                .withUrl(concept.procedures[1].websites[1].url)
                                .withSource(concept.procedures[1].websites[1].id)
                                .buildForInstance(),
                        ])
                        .withSource(concept.procedures[1].id)
                        .buildForInstance()
                ])
                .withWebsites([
                    new WebsiteBuilder()
                        .withId(createdInstance.websites[0].id)
                        .withUuid(createdInstance.websites[0].uuid)
                        .withTitle(LanguageString.of(concept.websites[0].title.en, undefined, concept.websites[0].title.nlFormal))
                        .withDescription(LanguageString.of(concept.websites[0].description.en, undefined, concept.websites[0].description.nlFormal))
                        .withUrl(concept.websites[0].url)
                        .withSource(concept.websites[0].id)
                        .buildForInstance(),
                    new WebsiteBuilder()
                        .withId(createdInstance.websites[1].id)
                        .withUuid(createdInstance.websites[1].uuid)
                        .withTitle(LanguageString.of(concept.websites[1].title.en, undefined, concept.websites[1].title.nlFormal))
                        .withDescription(LanguageString.of(concept.websites[1].description.en, undefined, concept.websites[1].description.nlFormal))
                        .withUrl(concept.websites[1].url)
                        .withSource(concept.websites[1].id)
                        .buildForInstance(),
                ])
                .withCosts([
                    new CostBuilder()
                        .withId(createdInstance.costs[0].id)
                        .withUuid(createdInstance.costs[0].uuid)
                        .withTitle(LanguageString.of(concept.costs[0].title.en, undefined, concept.costs[0].title.nlFormal))
                        .withDescription(LanguageString.of(concept.costs[0].description.en, undefined, concept.costs[0].description.nlFormal))
                        .withSource(concept.costs[0].id)
                        .buildForInstance(),
                    new CostBuilder()
                        .withId(createdInstance.costs[1].id)
                        .withUuid(createdInstance.costs[1].uuid)
                        .withTitle(LanguageString.of(concept.costs[1].title.en, undefined, concept.costs[1].title.nlFormal))
                        .withDescription(LanguageString.of(concept.costs[1].description.en, undefined, concept.costs[1].description.nlFormal))
                        .withSource(concept.costs[1].id)
                        .buildForInstance(),
                ])
                .withFinancialAdvantages([
                    new FinancialAdvantageBuilder()
                        .withId(createdInstance.financialAdvantages[0].id)
                        .withUuid(createdInstance.financialAdvantages[0].uuid)
                        .withTitle(LanguageString.of(concept.financialAdvantages[0].title.en, undefined, concept.financialAdvantages[0].title.nlFormal))
                        .withDescription(LanguageString.of(concept.financialAdvantages[0].description.en, undefined, concept.financialAdvantages[0].description.nlFormal))
                        .withSource(concept.financialAdvantages[0].id)
                        .buildForInstance(),
                    new FinancialAdvantageBuilder()
                        .withId(createdInstance.financialAdvantages[1].id)
                        .withUuid(createdInstance.financialAdvantages[1].uuid)
                        .withTitle(LanguageString.of(concept.financialAdvantages[1].title.en, undefined, concept.financialAdvantages[1].title.nlFormal))
                        .withDescription(LanguageString.of(concept.financialAdvantages[1].description.en, undefined, concept.financialAdvantages[1].description.nlFormal))
                        .withSource(concept.financialAdvantages[1].id)
                        .buildForInstance(),
                ])
                .withContactPoints([])
                .withSource(concept.id)
                .withVersionedSource(concept.latestConceptSnapshot)
                .withLanguages([])
                .withReviewStatus(undefined)
                .withPublicationStatus(undefined)
                .withLegalResources(concept.legalResources)
                .build();

        expect(createdInstance).toEqual(expectedInstance);
        expect(reloadedInstance).toEqual(expectedInstance);
    });

    test('Create new from concept when chosen form is informal', async () => {
        const concept = aFullConcept().build();
        const spatial1 = buildSpatialRefNis2019Iri(12345);
        const spatial2 = buildSpatialRefNis2019Iri(67890);
        const bestuurseenheid = aBestuurseenheid()
            .withSpatials([spatial1, spatial2])
            .build();

        const formalInformalChoice = aFormalInformalChoice()
            .withChosenForm(ChosenFormType.INFORMAL)
            .withBestuurseenheidId(bestuurseenheid.id)
            .build();

        await formalInformalChoiceTestRepository.save(bestuurseenheid, formalInformalChoice);
        const createdInstance = await newInstanceDomainService.createNewFromConcept(bestuurseenheid, concept);

        const reloadedInstance = await instanceRepository.findById(bestuurseenheid, createdInstance.id);

        expect(createdInstance).toEqual(reloadedInstance);
        expect(createdInstance.id).not.toBeUndefined();
        expect(createdInstance.uuid).not.toBeUndefined();

        const expectedInstance =
            new InstanceTestBuilder()
                .withId(createdInstance.id)
                .withUuid(createdInstance.uuid)
                .withCreatedBy(bestuurseenheid.id)
                .withDateCreated(FormatPreservingDate.of(fixedToday))
                .withDateModified(FormatPreservingDate.of(fixedToday))
                .withStatus(InstanceStatusType.ONTWERP)
                .withSpatials([spatial1, spatial2])
                .withCompetentAuthorities([bestuurseenheid.id])
                .withExecutingAuthorities([bestuurseenheid.id])
                .withTitle(LanguageString.of(concept.title.en, undefined, undefined, concept.title.nlInformal))
                .withDescription(LanguageString.of(concept.description.en, undefined, undefined, concept.description.nlInformal))
                .withAdditionalDescription(LanguageString.of(concept.additionalDescription.en, undefined, undefined, concept.additionalDescription.nlInformal))
                .withException(LanguageString.of(concept.exception.en, undefined, undefined, concept.exception.nlInformal))
                .withRegulation(LanguageString.of(concept.regulation.en, undefined, undefined, concept.regulation.nlInformal))
                .withStartDate(concept.startDate)
                .withEndDate(concept.endDate)
                .withType(concept.type)
                .withTargetAudiences(concept.targetAudiences)
                .withThemes(concept.themes)
                .withCompetentAuthorityLevels(concept.competentAuthorityLevels)
                .withExecutingAuthorityLevels(concept.executingAuthorityLevels)
                .withPublicationMedia(concept.publicationMedia)
                .withYourEuropeCategories(concept.yourEuropeCategories)
                .withKeywords(concept.keywords)
                .withRequirements([
                    new RequirementBuilder()
                        .withId(createdInstance.requirements[0].id)
                        .withUuid(createdInstance.requirements[0].uuid)
                        .withTitle(LanguageString.of(concept.requirements[0].title.en, undefined, undefined, concept.requirements[0].title.nlInformal))
                        .withDescription(LanguageString.of(concept.requirements[0].description.en, undefined, undefined, concept.requirements[0].description.nlInformal))
                        .withEvidence(new EvidenceBuilder()
                            .withId(createdInstance.requirements[0].evidence.id)
                            .withUuid(createdInstance.requirements[0].evidence.uuid)
                            .withTitle(LanguageString.of(concept.requirements[0].evidence.title.en, undefined, undefined, concept.requirements[0].evidence.title.nlInformal))
                            .withDescription(LanguageString.of(concept.requirements[0].evidence.description.en, undefined, undefined, concept.requirements[0].evidence.description.nlInformal))
                            .withSource(concept.requirements[0].evidence.id)
                            .buildForInstance()
                        )
                        .withSource(concept.requirements[0].id)
                        .buildForInstance()
                    ,
                    new RequirementBuilder()
                        .withId(createdInstance.requirements[1].id)
                        .withUuid(createdInstance.requirements[1].uuid)
                        .withTitle(LanguageString.of(concept.requirements[1].title.en, undefined, undefined, concept.requirements[1].title.nlInformal))
                        .withDescription(LanguageString.of(concept.requirements[1].description.en, undefined, undefined, concept.requirements[1].description.nlInformal))
                        .withEvidence(new EvidenceBuilder()
                            .withId(createdInstance.requirements[1].evidence.id)
                            .withUuid(createdInstance.requirements[1].evidence.uuid)
                            .withTitle(LanguageString.of(concept.requirements[1].evidence.title.en, undefined, undefined, concept.requirements[1].evidence.title.nlInformal))
                            .withDescription(LanguageString.of(concept.requirements[1].evidence.description.en, undefined, undefined, concept.requirements[1].evidence.description.nlInformal))
                            .withSource(concept.requirements[1].evidence.id)
                            .buildForInstance()
                        )
                        .withSource(concept.requirements[1].id)
                        .buildForInstance()
                ])
                .withProcedures([
                    new ProcedureBuilder()
                        .withId(createdInstance.procedures[0].id)
                        .withUuid(createdInstance.procedures[0].uuid)
                        .withTitle(LanguageString.of(concept.procedures[0].title.en, undefined, undefined, concept.procedures[0].title.nlInformal))
                        .withDescription(LanguageString.of(concept.procedures[0].description.en, undefined, undefined, concept.procedures[0].description.nlInformal))
                        .withWebsites([
                            new WebsiteBuilder()
                                .withId(createdInstance.procedures[0].websites[0].id)
                                .withUuid(createdInstance.procedures[0].websites[0].uuid)
                                .withTitle(LanguageString.of(concept.procedures[0].websites[0].title.en, undefined, undefined, concept.procedures[0].websites[0].title.nlInformal))
                                .withDescription(LanguageString.of(concept.procedures[0].websites[0].description.en, undefined, undefined, concept.procedures[0].websites[0].description.nlInformal))
                                .withUrl(concept.procedures[0].websites[0].url)
                                .withSource(concept.procedures[0].websites[0].id)
                                .buildForInstance(),
                            new WebsiteBuilder()
                                .withId(createdInstance.procedures[0].websites[1].id)
                                .withUuid(createdInstance.procedures[0].websites[1].uuid)
                                .withTitle(LanguageString.of(concept.procedures[0].websites[1].title.en, undefined, undefined, concept.procedures[0].websites[1].title.nlInformal))
                                .withDescription(LanguageString.of(concept.procedures[0].websites[1].description.en, undefined, undefined, concept.procedures[0].websites[1].description.nlInformal))
                                .withUrl(concept.procedures[0].websites[1].url)
                                .withSource(concept.procedures[0].websites[1].id)
                                .buildForInstance(),
                        ])
                        .withSource(concept.procedures[0].id)
                        .buildForInstance(),
                    new ProcedureBuilder()
                        .withId(createdInstance.procedures[1].id)
                        .withUuid(createdInstance.procedures[1].uuid)
                        .withTitle(LanguageString.of(concept.procedures[1].title.en, undefined, undefined, concept.procedures[1].title.nlInformal))
                        .withDescription(LanguageString.of(concept.procedures[1].description.en, undefined, undefined, concept.procedures[1].description.nlInformal))
                        .withWebsites([
                            new WebsiteBuilder()
                                .withId(createdInstance.procedures[1].websites[0].id)
                                .withUuid(createdInstance.procedures[1].websites[0].uuid)
                                .withTitle(LanguageString.of(concept.procedures[1].websites[0].title.en, undefined, undefined, concept.procedures[1].websites[0].title.nlInformal))
                                .withDescription(LanguageString.of(concept.procedures[1].websites[0].description.en, undefined, undefined, concept.procedures[1].websites[0].description.nlInformal))
                                .withUrl(concept.procedures[1].websites[0].url)
                                .withSource(concept.procedures[1].websites[0].id)
                                .buildForInstance(),
                            new WebsiteBuilder()
                                .withId(createdInstance.procedures[1].websites[1].id)
                                .withUuid(createdInstance.procedures[1].websites[1].uuid)
                                .withTitle(LanguageString.of(concept.procedures[1].websites[1].title.en, undefined, undefined, concept.procedures[1].websites[1].title.nlInformal))
                                .withDescription(LanguageString.of(concept.procedures[1].websites[1].description.en, undefined, undefined, concept.procedures[1].websites[1].description.nlInformal))
                                .withUrl(concept.procedures[1].websites[1].url)
                                .withSource(concept.procedures[1].websites[1].id)
                                .buildForInstance(),
                        ])
                        .withSource(concept.procedures[1].id)
                        .buildForInstance()
                ])
                .withWebsites([
                    new WebsiteBuilder()
                        .withId(createdInstance.websites[0].id)
                        .withUuid(createdInstance.websites[0].uuid)
                        .withTitle(LanguageString.of(concept.websites[0].title.en, undefined, undefined, concept.websites[0].title.nlInformal))
                        .withDescription(LanguageString.of(concept.websites[0].description.en, undefined, undefined, concept.websites[0].description.nlInformal))
                        .withUrl(concept.websites[0].url)
                        .withSource(concept.websites[0].id)
                        .buildForInstance(),
                    new WebsiteBuilder()
                        .withId(createdInstance.websites[1].id)
                        .withUuid(createdInstance.websites[1].uuid)
                        .withTitle(LanguageString.of(concept.websites[1].title.en, undefined, undefined, concept.websites[1].title.nlInformal))
                        .withDescription(LanguageString.of(concept.websites[1].description.en, undefined, undefined, concept.websites[1].description.nlInformal))
                        .withUrl(concept.websites[1].url)
                        .withSource(concept.websites[1].id)
                        .buildForInstance(),
                ])
                .withCosts([
                    new CostBuilder()
                        .withId(createdInstance.costs[0].id)
                        .withUuid(createdInstance.costs[0].uuid)
                        .withTitle(LanguageString.of(concept.costs[0].title.en, undefined, undefined, concept.costs[0].title.nlInformal))
                        .withDescription(LanguageString.of(concept.costs[0].description.en, undefined, undefined, concept.costs[0].description.nlInformal))
                        .withSource(concept.costs[0].id)
                        .buildForInstance(),
                    new CostBuilder()
                        .withId(createdInstance.costs[1].id)
                        .withUuid(createdInstance.costs[1].uuid)
                        .withTitle(LanguageString.of(concept.costs[1].title.en, undefined, undefined, concept.costs[1].title.nlInformal))
                        .withDescription(LanguageString.of(concept.costs[1].description.en, undefined, undefined, concept.costs[1].description.nlInformal))
                        .withSource(concept.costs[1].id)
                        .buildForInstance(),
                ])
                .withFinancialAdvantages([
                    new FinancialAdvantageBuilder()
                        .withId(createdInstance.financialAdvantages[0].id)
                        .withUuid(createdInstance.financialAdvantages[0].uuid)
                        .withTitle(LanguageString.of(concept.financialAdvantages[0].title.en, undefined, undefined, concept.financialAdvantages[0].title.nlInformal))
                        .withDescription(LanguageString.of(concept.financialAdvantages[0].description.en, undefined, undefined, concept.financialAdvantages[0].description.nlInformal))
                        .withSource(concept.financialAdvantages[0].id)
                        .buildForInstance(),
                    new FinancialAdvantageBuilder()
                        .withId(createdInstance.financialAdvantages[1].id)
                        .withUuid(createdInstance.financialAdvantages[1].uuid)
                        .withTitle(LanguageString.of(concept.financialAdvantages[1].title.en, undefined, undefined, concept.financialAdvantages[1].title.nlInformal))
                        .withDescription(LanguageString.of(concept.financialAdvantages[1].description.en, undefined, undefined, concept.financialAdvantages[1].description.nlInformal))
                        .withSource(concept.financialAdvantages[1].id)
                        .buildForInstance(),
                ])
                .withContactPoints([])
                .withSource(concept.id)
                .withVersionedSource(concept.latestConceptSnapshot)
                .withLanguages([])
                .withReviewStatus(undefined)
                .withPublicationStatus(undefined)
                .withLegalResources(concept.legalResources)
                .build();

        expect(createdInstance).toEqual(expectedInstance);
        expect(reloadedInstance).toEqual(expectedInstance);
    });

    test('Create new from minimal concept', async () => {
        const concept = aMinimalConcept().build();
        const spatial1 = buildSpatialRefNis2019Iri(12345);
        const spatial2 = buildSpatialRefNis2019Iri(67890);
        const bestuurseenheid = aBestuurseenheid()
            .withSpatials([spatial1, spatial2])
            .build();

        const formalInformalChoice = aFormalInformalChoice()
            .withChosenForm(ChosenFormType.INFORMAL)
            .withBestuurseenheidId(bestuurseenheid.id)
            .build();

        await formalInformalChoiceTestRepository.save(bestuurseenheid, formalInformalChoice);
        const createdInstance = await newInstanceDomainService.createNewFromConcept(bestuurseenheid, concept);

        const reloadedInstance = await instanceRepository.findById(bestuurseenheid, createdInstance.id);

        expect(createdInstance).toEqual(reloadedInstance);
        expect(createdInstance.id).not.toBeUndefined();
        expect(createdInstance.uuid).not.toBeUndefined();
    });

});