import {TEST_SPARQL_ENDPOINT} from "../../test.config";
import {ConceptSnapshotSparqlTestRepository} from "../../driven/persistence/concept-snapshot-sparql-test-repository";
import {
    ConceptSnapshotToConceptMergerDomainService
} from "../../../src/core/domain/concept-snapshot-to-concept-merger-domain-service";
import {
    aFullConceptSnapshot,
    aMinimalConceptSnapshot,
    ConceptSnapshotTestBuilder
} from "./concept-snapshot-test-builder";
import {buildBestuurseenheidIri, buildConceptIri} from "./iri-test-builder";
import {sparqlEscapeDateTime, sparqlEscapeUri, uuid} from "../../../mu-helper";
import {DirectDatabaseAccess} from "../../driven/persistence/direct-database-access";
import {PREFIX, PUBLIC_GRAPH} from "../../../config";
import {NS} from "../../../src/driven/persistence/namespaces";
import {ConceptSnapshot} from "../../../src/core/domain/concept-snapshot";
import {
    CompetentAuthorityLevelType,
    ConceptTagType,
    ExecutingAuthorityLevelType,
    InstanceReviewStatusType,
    ProductType,
    PublicationMediumType,
    TargetAudienceType,
    ThemeType,
    YourEuropeCategoryType
} from "../../../src/core/domain/types";
import {FormatPreservingDate} from "../../../src/core/domain/format-preserving-date";
import {LanguageString} from "../../../src/core/domain/language-string";
import {aBestuurseenheid, BestuurseenheidTestBuilder} from "./bestuurseenheid-test-builder";
import {aFullRequirement, anotherFullRequirement} from "./requirement-test-builder";
import {aFullEvidence, anotherFullEvidence} from "./evidence-test-builder";
import {aFullProcedure, anotherFullProcedure} from "./procedure-test-builder";
import {anotherFullWebsite} from "./website-test-builder";
import {aFullCost, anotherFullCost} from "./cost-test-builder";
import {aFullFinancialAdvantage, anotherFullFinancialAdvantage} from "./financial-advantage-test-builder";
import {ConceptSparqlRepository} from "../../../src/driven/persistence/concept-sparql-repository";
import {aMinimalLanguageString} from "./language-string-test-builder";
import {BestuurseenheidSparqlTestRepository} from "../../driven/persistence/bestuurseenheid-sparql-test-repository";
import {
    ConceptDisplayConfigurationSparqlRepository
} from "../../../src/driven/persistence/concept-display-configuration-sparql-repository";
import {Iri} from "../../../src/core/domain/shared/iri";
import {CodeSparqlRepository} from "../../../src/driven/persistence/code-sparql-repository";
import {CodeSchema} from "../../../src/core/port/driven/persistence/code-repository";
import {Bestuurseenheid} from "../../../src/core/domain/bestuurseenheid";
import {
    EnsureLinkedAuthoritiesExistAsCodeListDomainService
} from "../../../src/core/domain/ensure-linked-authorities-exist-as-code-list-domain-service";
import {anotherFullLegalResourceForConceptSnapshot} from "./legal-resource-test-builder";
import {InstanceBuilder} from "../../../src/core/domain/instance";
import {InstanceSparqlRepository} from "../../../src/driven/persistence/instance-sparql-repository";

describe('merges a new concept snapshot into a concept', () => {

    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

    const conceptSnapshotRepository = new ConceptSnapshotSparqlTestRepository(TEST_SPARQL_ENDPOINT);
    const conceptRepository = new ConceptSparqlRepository(TEST_SPARQL_ENDPOINT);
    const bestuurseenheidRepository = new BestuurseenheidSparqlTestRepository(TEST_SPARQL_ENDPOINT);
    const conceptDisplayConfigurationRepository = new ConceptDisplayConfigurationSparqlRepository(TEST_SPARQL_ENDPOINT);
    const bestuurseenheidRegistrationCodeFetcher = {
        fetchOrgRegistryCodelistEntry: jest.fn().mockReturnValue(Promise.resolve({}))
    };
    const directDatabaseAccess = new DirectDatabaseAccess(TEST_SPARQL_ENDPOINT);
    const codeRepository = new CodeSparqlRepository(TEST_SPARQL_ENDPOINT);
    const instanceRepository = new InstanceSparqlRepository(TEST_SPARQL_ENDPOINT);

    const ensureLinkedAuthoritiesExistAsCodeListDomainService = new EnsureLinkedAuthoritiesExistAsCodeListDomainService(bestuurseenheidRegistrationCodeFetcher, codeRepository);

    const merger = new ConceptSnapshotToConceptMergerDomainService(
        conceptSnapshotRepository,
        conceptRepository,
        conceptDisplayConfigurationRepository,
        ensureLinkedAuthoritiesExistAsCodeListDomainService,
        instanceRepository);

    describe('create a new concept', () => {

        test('Creates a new concept from a concept snapshot', async () => {
            const isVersionOfConceptId = buildConceptIri(uuid());
            const conceptSnapshot =
                aFullConceptSnapshot()
                    .withIsVersionOfConcept(isVersionOfConceptId)
                    .build();
            await conceptSnapshotRepository.save(conceptSnapshot);

            await insertAllConceptSchemeLinksToGoOverGraphBoundaryVerifyConceptSchemesOfEnums(conceptSnapshot);

            await merger.merge(conceptSnapshot.id);

            const createdConcept = await conceptRepository.findById(isVersionOfConceptId);
            expect(createdConcept.id).toEqual(isVersionOfConceptId);
            expect(createdConcept.uuid).toMatch(uuidRegex);
            expect(createdConcept.title).toEqual(conceptSnapshot.title);
            expect(createdConcept.description).toEqual(conceptSnapshot.description);
            expect(createdConcept.additionalDescription).toEqual(conceptSnapshot.additionalDescription);
            expect(createdConcept.exception).toEqual(conceptSnapshot.exception);
            expect(createdConcept.regulation).toEqual(conceptSnapshot.regulation);
            expect(createdConcept.startDate).toEqual(conceptSnapshot.startDate);
            expect(createdConcept.endDate).toEqual(conceptSnapshot.endDate);
            expect(createdConcept.type).toEqual(conceptSnapshot.type);
            expect(createdConcept.targetAudiences).toEqual(conceptSnapshot.targetAudiences);
            expect(createdConcept.themes).toEqual(conceptSnapshot.themes);
            expect(createdConcept.competentAuthorityLevels).toEqual(conceptSnapshot.competentAuthorityLevels);
            expect(createdConcept.competentAuthorities).toEqual(conceptSnapshot.competentAuthorities);
            expect(createdConcept.executingAuthorityLevels).toEqual(conceptSnapshot.executingAuthorityLevels);
            expect(createdConcept.executingAuthorities).toEqual(conceptSnapshot.executingAuthorities);
            expect(createdConcept.publicationMedia).toEqual(conceptSnapshot.publicationMedia);
            expect(createdConcept.yourEuropeCategories).toEqual(conceptSnapshot.yourEuropeCategories);
            expect(createdConcept.keywords).toEqual(conceptSnapshot.keywords);
            expect(createdConcept.requirements)
                .toEqual(expect.arrayContaining([
                    expect.objectContaining({
                        _id: expect.not.objectContaining(conceptSnapshot.requirements[0].id),
                        _uuid: expect.stringMatching(uuidRegex),
                        _title: conceptSnapshot.requirements[0].title,
                        _description: conceptSnapshot.requirements[0].description,
                        _order: conceptSnapshot.requirements[0].order,
                        _evidence: expect.objectContaining({
                            _id: expect.not.objectContaining(conceptSnapshot.requirements[0].evidence.id),
                            _uuid: expect.stringMatching(uuidRegex),
                            _title: conceptSnapshot.requirements[0].evidence.title,
                            _description: conceptSnapshot.requirements[0].evidence.description,
                        })
                    }),
                    expect.objectContaining({
                        _id: expect.not.objectContaining(conceptSnapshot.requirements[1].id),
                        _uuid: expect.stringMatching(uuidRegex),
                        _title: conceptSnapshot.requirements[1].title,
                        _description: conceptSnapshot.requirements[1].description,
                        _order: conceptSnapshot.requirements[1].order,
                        _evidence: expect.objectContaining({
                            _id: expect.not.objectContaining(conceptSnapshot.requirements[1].evidence.id),
                            _uuid: expect.stringMatching(uuidRegex),
                            _title: conceptSnapshot.requirements[1].evidence.title,
                            _description: conceptSnapshot.requirements[1].evidence.description,
                        })
                    })
                ]));
            expect(createdConcept.procedures)
                .toEqual(expect.arrayContaining([
                    expect.objectContaining({
                        _id: expect.not.objectContaining(conceptSnapshot.procedures[0].id),
                        _uuid: expect.stringMatching(uuidRegex),
                        _title: conceptSnapshot.procedures[0].title,
                        _description: conceptSnapshot.procedures[0].description,
                        _order: conceptSnapshot.procedures[0].order,
                        _websites: expect.arrayContaining([
                            expect.objectContaining({
                                _id: expect.not.objectContaining(conceptSnapshot.procedures[0].websites[0].id),
                                _uuid: expect.stringMatching(uuidRegex),
                                _title: conceptSnapshot.procedures[0].websites[0].title,
                                _description: conceptSnapshot.procedures[0].websites[0].description,
                                _order: conceptSnapshot.procedures[0].websites[0].order,
                                _url: conceptSnapshot.procedures[0].websites[0].url,
                            }),
                            expect.objectContaining({
                                _id: expect.not.objectContaining(conceptSnapshot.procedures[0].websites[1].id),
                                _uuid: expect.stringMatching(uuidRegex),
                                _title: conceptSnapshot.procedures[0].websites[1].title,
                                _description: conceptSnapshot.procedures[0].websites[1].description,
                                _order: conceptSnapshot.procedures[0].websites[1].order,
                                _url: conceptSnapshot.procedures[0].websites[1].url,
                            })
                        ])
                    }),
                    expect.objectContaining({
                        _id: expect.not.objectContaining(conceptSnapshot.procedures[1].id),
                        _uuid: expect.stringMatching(uuidRegex),
                        _title: conceptSnapshot.procedures[1].title,
                        _description: conceptSnapshot.procedures[1].description,
                        _order: conceptSnapshot.procedures[1].order,
                        _websites: expect.arrayContaining([
                            expect.objectContaining({
                                _id: expect.not.objectContaining(conceptSnapshot.procedures[1].websites[0].id),
                                _uuid: expect.stringMatching(uuidRegex),
                                _title: conceptSnapshot.procedures[1].websites[0].title,
                                _description: conceptSnapshot.procedures[1].websites[0].description,
                                _order: conceptSnapshot.procedures[1].websites[0].order,
                                _url: conceptSnapshot.procedures[1].websites[0].url,
                            }),
                            expect.objectContaining({
                                _id: expect.not.objectContaining(conceptSnapshot.procedures[1].websites[1].id),
                                _uuid: expect.stringMatching(uuidRegex),
                                _title: conceptSnapshot.procedures[1].websites[1].title,
                                _description: conceptSnapshot.procedures[1].websites[1].description,
                                _order: conceptSnapshot.procedures[1].websites[1].order,
                                _url: conceptSnapshot.procedures[1].websites[1].url,
                            })
                        ])
                    })
                ]));

            expect(createdConcept.websites)
                .toEqual(expect.arrayContaining([
                    expect.objectContaining({
                        _id: expect.not.objectContaining(conceptSnapshot.websites[0].id),
                        _uuid: expect.stringMatching(uuidRegex),
                        _title: conceptSnapshot.websites[0].title,
                        _description: conceptSnapshot.websites[0].description,
                        _order: conceptSnapshot.websites[0].order,
                        _url: conceptSnapshot.websites[0].url,
                    }),
                    expect.objectContaining({
                        _id: expect.not.objectContaining(conceptSnapshot.websites[1].id),
                        _uuid: expect.stringMatching(uuidRegex),
                        _title: conceptSnapshot.websites[1].title,
                        _description: conceptSnapshot.websites[1].description,
                        _order: conceptSnapshot.websites[1].order,
                        _url: conceptSnapshot.websites[1].url,
                    })
                ]));

            expect(createdConcept.costs)
                .toEqual(expect.arrayContaining([
                    expect.objectContaining({
                        _id: expect.not.objectContaining(conceptSnapshot.costs[0].id),
                        _uuid: expect.stringMatching(uuidRegex),
                        _title: conceptSnapshot.costs[0].title,
                        _description: conceptSnapshot.costs[0].description,
                        _order: conceptSnapshot.costs[0].order
                    }),
                    expect.objectContaining({
                        _id: expect.not.objectContaining(conceptSnapshot.costs[1].id),
                        _uuid: expect.stringMatching(uuidRegex),
                        _title: conceptSnapshot.costs[1].title,
                        _description: conceptSnapshot.costs[1].description,
                        _order: conceptSnapshot.costs[1].order
                    })
                ]));
            expect(createdConcept.financialAdvantages)
                .toEqual(expect.arrayContaining([
                    expect.objectContaining({
                        _id: expect.not.objectContaining(conceptSnapshot.financialAdvantages[0].id),
                        _uuid: expect.stringMatching(uuidRegex),
                        _title: conceptSnapshot.financialAdvantages[0].title,
                        _description: conceptSnapshot.financialAdvantages[0].description,
                        _order: conceptSnapshot.financialAdvantages[0].order
                    }),
                    expect.objectContaining({
                        _id: expect.not.objectContaining(conceptSnapshot.financialAdvantages[1].id),
                        _uuid: expect.stringMatching(uuidRegex),
                        _title: conceptSnapshot.financialAdvantages[1].title,
                        _description: conceptSnapshot.financialAdvantages[1].description,
                        _order: conceptSnapshot.financialAdvantages[1].order
                    })
                ]));
            expect(createdConcept.productId).toEqual(conceptSnapshot.productId);
            expect(createdConcept.latestConceptSnapshot).toEqual(conceptSnapshot.id);
            expect(createdConcept.previousConceptSnapshots).toEqual([]);
            expect(createdConcept.latestFunctionallyChangedConceptSnapshot).toEqual(conceptSnapshot.id);
            expect(createdConcept.conceptTags).toEqual(conceptSnapshot.conceptTags);
            expect(createdConcept.isArchived).toBeFalsy();
            expect(createdConcept.legalResources).toEqual(expect.arrayContaining([
                expect.objectContaining({
                    _id: expect.not.objectContaining(conceptSnapshot.legalResources[0]),
                    _uuid: expect.stringMatching(uuidRegex),
                    _title: conceptSnapshot.legalResources[0].title,
                    _description: conceptSnapshot.legalResources[0].description,
                    _url: conceptSnapshot.legalResources[0].url,
                    _order: 1
                }),
                expect.objectContaining({
                    _id: expect.not.objectContaining(conceptSnapshot.legalResources[1]),
                    _uuid: expect.stringMatching(uuidRegex),
                    _title: conceptSnapshot.legalResources[1].title,
                    _description: conceptSnapshot.legalResources[1].description,
                    _url: conceptSnapshot.legalResources[1].url,
                    _order: 2
                }),
            ]));
        }, 10000);

        test('Creates a new concept from a concept snapshot with minimal data', async () => {
            const isVersionOfConceptId = buildConceptIri(uuid());
            const conceptSnapshot =
                aMinimalConceptSnapshot()
                    .withIsVersionOfConcept(isVersionOfConceptId)
                    .build();
            await conceptSnapshotRepository.save(conceptSnapshot);

            await insertAllConceptSchemeLinksToGoOverGraphBoundaryVerifyConceptSchemesOfEnums(conceptSnapshot);

            await merger.merge(conceptSnapshot.id);

            const createdConcept = await conceptRepository.findById(isVersionOfConceptId);
            expect(createdConcept.id).toEqual(isVersionOfConceptId);
            expect(createdConcept.uuid).toMatch(uuidRegex);
            expect(createdConcept.title).toEqual(conceptSnapshot.title);
            expect(createdConcept.description).toEqual(conceptSnapshot.description);
            expect(createdConcept.additionalDescription).toBeUndefined();
            expect(createdConcept.exception).toBeUndefined();
            expect(createdConcept.regulation).toBeUndefined();
            expect(createdConcept.startDate).toBeUndefined();
            expect(createdConcept.endDate).toBeUndefined();
            expect(createdConcept.type).toBeUndefined();
            expect(createdConcept.targetAudiences).toEqual([]);
            expect(createdConcept.themes).toEqual([]);
            expect(createdConcept.competentAuthorityLevels).toEqual([]);
            expect(createdConcept.competentAuthorities).toEqual([]);
            expect(createdConcept.executingAuthorityLevels).toEqual([]);
            expect(createdConcept.executingAuthorities).toEqual([]);
            expect(createdConcept.publicationMedia).toEqual([]);
            expect(createdConcept.yourEuropeCategories).toEqual([]);
            expect(createdConcept.keywords).toEqual([]);
            expect(createdConcept.requirements).toEqual([]);
            expect(createdConcept.procedures).toEqual([]);
            expect(createdConcept.websites).toEqual([]);
            expect(createdConcept.costs).toEqual([]);
            expect(createdConcept.financialAdvantages).toEqual([]);
            expect(createdConcept.productId).toEqual(conceptSnapshot.productId);
            expect(createdConcept.latestConceptSnapshot).toEqual(conceptSnapshot.id);
            expect(createdConcept.previousConceptSnapshots).toEqual([]);
            expect(createdConcept.latestFunctionallyChangedConceptSnapshot).toEqual(conceptSnapshot.id);
            expect(createdConcept.conceptTags).toEqual([]);
            expect(createdConcept.isArchived).toBeFalsy();
            expect(createdConcept.legalResources).toEqual([]);
        }, 10000);

        test('Creates a new concept from a concept snapshot that is archived', async () => {
            const isVersionOfConceptId = buildConceptIri(uuid());
            const conceptSnapshot =
                aMinimalConceptSnapshot()
                    .withIsVersionOfConcept(isVersionOfConceptId)
                    .withIsArchived(true)
                    .build();
            await conceptSnapshotRepository.save(conceptSnapshot);

            await insertAllConceptSchemeLinksToGoOverGraphBoundaryVerifyConceptSchemesOfEnums(conceptSnapshot);

            await merger.merge(conceptSnapshot.id);

            const createdConcept = await conceptRepository.findById(isVersionOfConceptId);
            expect(createdConcept.id).toEqual(isVersionOfConceptId);
            expect(createdConcept.uuid).toMatch(uuidRegex);
            expect(createdConcept.isArchived).toBeTruthy();
        }, 10000);

        test('Creates a new concept from a concept snapshot with keywords with other nl languages than nl ', async () => {
            const isVersionOfConceptId = buildConceptIri(uuid());
            const conceptSnapshot =
                aMinimalConceptSnapshot()
                    .withIsVersionOfConcept(isVersionOfConceptId)
                    .withKeywords([LanguageString.of(undefined, 'formal keyword')])
                    .build();
            await conceptSnapshotRepository.save(conceptSnapshot);

            insertAllConceptSchemeLinksToGoOverGraphBoundaryVerifyConceptSchemesOfEnums(conceptSnapshot);

            await merger.merge(conceptSnapshot.id);

            const createdConcept = await conceptRepository.findById(isVersionOfConceptId);
            expect(createdConcept.id).toEqual(isVersionOfConceptId);
            expect(createdConcept.uuid).toMatch(uuidRegex);
            expect(createdConcept.keywords).toEqual([]);
        }, 10000);

    });

    describe('updates a concept', () => {

        test('Updates a concept with all new data of a new version of a concept snapshot', async () => {
            const isVersionOfConceptId = buildConceptIri(uuid());
            const conceptSnapshot =
                aFullConceptSnapshot()
                    .withIsVersionOfConcept(isVersionOfConceptId)
                    .withStartDate(FormatPreservingDate.of('2019-07-13T00:00:00Z'))
                    .withEndDate(FormatPreservingDate.of('2023-12-03T00:00:00Z'))
                    .withType(ProductType.ADVIESBEGELEIDING)
                    .withTargetAudiences([TargetAudienceType.BURGER, TargetAudienceType.VLAAMSEOVERHEID, TargetAudienceType.ORGANISATIE])
                    .withThemes([ThemeType.CULTUURSPORTVRIJETIJD, ThemeType.MOBILITEITOPENBAREWERKEN, ThemeType.WELZIJNGEZONDHEID])
                    .withCompetentAuthorityLevels([CompetentAuthorityLevelType.LOKAAL, CompetentAuthorityLevelType.PROVINCIAAL, CompetentAuthorityLevelType.EUROPEES])
                    .withCompetentAuthorities([BestuurseenheidTestBuilder.PEPINGEN_IRI, BestuurseenheidTestBuilder.HOUTHALEN_HELCHTEREN_IRI, BestuurseenheidTestBuilder.BORGLOON_IRI])
                    .withExecutingAuthorityLevels([ExecutingAuthorityLevelType.LOKAAL, ExecutingAuthorityLevelType.PROVINCIAAL, ExecutingAuthorityLevelType.DERDEN])
                    .withExecutingAuthorities([BestuurseenheidTestBuilder.PEPINGEN_IRI, BestuurseenheidTestBuilder.OUD_HEVERLEE_IRI, BestuurseenheidTestBuilder.ASSENEDE_IRI])
                    .withPublicationMedia([PublicationMediumType.YOUREUROPE])
                    .withYourEuropeCategories([YourEuropeCategoryType.BEDRIJFINSOLVENTIELIQUIDATIE, YourEuropeCategoryType.PROCEDUREPENSIONERING, YourEuropeCategoryType.GOEDERENRECYCLAGE])
                    .withKeywords([LanguageString.of('buitenland'), LanguageString.of('ambulante activiteit'), LanguageString.of('levensloos')])
                    .withGeneratedAtTime(FormatPreservingDate.of('2023-12-10T00:00:00Z'))
                    .withConceptTags([ConceptTagType.YOUREUROPEVERPLICHT])
                    .withLegalResources([anotherFullLegalResourceForConceptSnapshot(uuid()).withOrder(1).build(), anotherFullLegalResourceForConceptSnapshot(uuid()).withOrder(2).build()])
                    .build();
            await conceptSnapshotRepository.save(conceptSnapshot);

            await insertAllConceptSchemeLinksToGoOverGraphBoundaryVerifyConceptSchemesOfEnums(conceptSnapshot);

            await merger.merge(conceptSnapshot.id);

            const updatedConceptSnapshot =
                aMinimalConceptSnapshot()
                    .withIsVersionOfConcept(isVersionOfConceptId)
                    .withTitle(suffixUnique(conceptSnapshot.title))
                    .withDescription(suffixUnique(conceptSnapshot.description))
                    .withAdditionalDescription(suffixUnique(conceptSnapshot.additionalDescription))
                    .withException(suffixUnique(conceptSnapshot.exception))
                    .withRegulation(suffixUnique(conceptSnapshot.regulation))
                    .withStartDate(FormatPreservingDate.of('2024-01-06T00:00:00Z'))
                    .withEndDate(FormatPreservingDate.of('2025-04-17T00:00:00Z'))
                    .withType(ProductType.FINANCIEELVOORDEEL)
                    .withTargetAudiences([TargetAudienceType.ONDERNEMING, TargetAudienceType.VERENIGING])
                    .withThemes([ThemeType.BOUWENWONEN, ThemeType.ONDERWIJSWETENSCHAP, ThemeType.MILIEUENERGIE])
                    .withCompetentAuthorityLevels([CompetentAuthorityLevelType.FEDERAAL, CompetentAuthorityLevelType.VLAAMS])
                    .withCompetentAuthorities([BestuurseenheidTestBuilder.ASSENEDE_IRI, BestuurseenheidTestBuilder.OUD_HEVERLEE_IRI])
                    .withExecutingAuthorityLevels([ExecutingAuthorityLevelType.VLAAMS, ExecutingAuthorityLevelType.FEDERAAL, ExecutingAuthorityLevelType.EUROPEES])
                    .withExecutingAuthorities([BestuurseenheidTestBuilder.BORGLOON_IRI, BestuurseenheidTestBuilder.ASSENEDE_IRI, BestuurseenheidTestBuilder.HOUTHALEN_HELCHTEREN_IRI])
                    .withPublicationMedia([PublicationMediumType.RECHTENVERKENNER])
                    .withYourEuropeCategories([YourEuropeCategoryType.CONSUMENTENRECHTEN, YourEuropeCategoryType.PROCEDURESTARTENEXPLOITERENSLUITENBEDRIJFKENNISGEVING, YourEuropeCategoryType.BURGERENFAMILIERECHTEN])
                    .withKeywords([LanguageString.of('groenvoorziening'), LanguageString.of('green'), LanguageString.of('huis en tuin verwerking')])
                    .withRequirements([
                        anotherFullRequirement()
                            .withTitle(suffixUnique(conceptSnapshot.requirements[1].title))
                            .withDescription(suffixUnique(conceptSnapshot.requirements[1].description))
                            .withOrder(1)
                            .withEvidence(
                                aFullEvidence()
                                    .withTitle(suffixUnique(conceptSnapshot.requirements[1].evidence.title))
                                    .withDescription(suffixUnique(conceptSnapshot.requirements[1].evidence.description))
                                    .build())
                            .build(),
                        aFullRequirement()
                            .withTitle(suffixUnique(conceptSnapshot.requirements[0].title))
                            .withDescription(suffixUnique(conceptSnapshot.requirements[0].description))
                            .withOrder(2)
                            .withEvidence(
                                anotherFullEvidence()
                                    .withTitle(suffixUnique(conceptSnapshot.requirements[0].evidence.title))
                                    .withDescription(suffixUnique(conceptSnapshot.requirements[0].evidence.description))
                                    .build())
                            .build()])
                    .withProcedures([
                        anotherFullProcedure()
                            .withTitle(suffixUnique(conceptSnapshot.procedures[1].title))
                            .withDescription(suffixUnique(conceptSnapshot.procedures[1].description))
                            .withOrder(1)
                            .withWebsites([anotherFullWebsite(uuid()).withOrder(1).build(), anotherFullWebsite(uuid()).withOrder(2).build(), anotherFullWebsite(uuid()).withOrder(3).build()])
                            .build(),
                        aFullProcedure()
                            .withTitle(suffixUnique(conceptSnapshot.procedures[0].title))
                            .withDescription(suffixUnique(conceptSnapshot.procedures[0].description))
                            .withOrder(2)
                            .withWebsites([anotherFullWebsite(uuid()).withOrder(1).build(), anotherFullWebsite(uuid()).withOrder(2).build()])
                            .build()])
                    .withWebsites([anotherFullWebsite(uuid()).withOrder(1).build(), anotherFullWebsite(uuid()).withOrder(2).build()])
                    .withCosts([
                        anotherFullCost()
                            .withTitle(suffixUnique(conceptSnapshot.costs[1].title))
                            .withDescription(suffixUnique(conceptSnapshot.costs[1].description))
                            .withOrder(1)
                            .build(),
                        aFullCost()
                            .withTitle(suffixUnique(conceptSnapshot.costs[0].title))
                            .withDescription(suffixUnique(conceptSnapshot.costs[0].description))
                            .withOrder(2)
                            .build()])
                    .withFinancialAdvantages(
                        [
                            anotherFullFinancialAdvantage()
                                .withTitle(suffixUnique(conceptSnapshot.financialAdvantages[1].title))
                                .withDescription(suffixUnique(conceptSnapshot.financialAdvantages[1].description))
                                .withOrder(1)
                                .build(),
                            aFullFinancialAdvantage()
                                .withTitle(suffixUnique(conceptSnapshot.financialAdvantages[0].title))
                                .withDescription(suffixUnique(conceptSnapshot.financialAdvantages[0].description))
                                .withOrder(2)
                                .build()
                        ])
                    .withProductId(conceptSnapshot.productId + uuid())
                    .withGeneratedAtTime(FormatPreservingDate.of('2023-12-11T00:00:00Z'))
                    .withConceptTags([ConceptTagType.YOUREUROPEAANBEVOLEN])
                    .withLegalResources(
                        [
                            anotherFullLegalResourceForConceptSnapshot(uuid()).withOrder(1).build(),
                            anotherFullLegalResourceForConceptSnapshot(uuid()).withOrder(2).build(),
                            anotherFullLegalResourceForConceptSnapshot(uuid()).withOrder(3).build()])
                    .build();

            await insertAllConceptSchemeLinksToGoOverGraphBoundaryVerifyConceptSchemesOfEnums(updatedConceptSnapshot);

            await conceptSnapshotRepository.save(updatedConceptSnapshot);

            await merger.merge(updatedConceptSnapshot.id);

            const updatedConcept = await conceptRepository.findById(isVersionOfConceptId);
            expect(updatedConcept.id).toEqual(updatedConceptSnapshot.isVersionOf);
            expect(updatedConcept.uuid).toMatch(uuidRegex);
            expect(updatedConcept.title).toEqual(updatedConceptSnapshot.title);
            expect(updatedConcept.description).toEqual(updatedConceptSnapshot.description);
            expect(updatedConcept.additionalDescription).toEqual(updatedConceptSnapshot.additionalDescription);
            expect(updatedConcept.exception).toEqual(updatedConceptSnapshot.exception);
            expect(updatedConcept.regulation).toEqual(updatedConceptSnapshot.regulation);
            expect(updatedConcept.startDate).toEqual(updatedConceptSnapshot.startDate);
            expect(updatedConcept.endDate).toEqual(updatedConceptSnapshot.endDate);
            expect(updatedConcept.type).toEqual(updatedConceptSnapshot.type);
            expect(updatedConcept.targetAudiences).toEqual(updatedConceptSnapshot.targetAudiences);
            expect(updatedConcept.themes).toEqual(updatedConceptSnapshot.themes);
            expect(updatedConcept.competentAuthorityLevels).toEqual(updatedConceptSnapshot.competentAuthorityLevels);
            expect(updatedConcept.competentAuthorities).toEqual(updatedConceptSnapshot.competentAuthorities);
            expect(updatedConcept.executingAuthorityLevels).toEqual(updatedConceptSnapshot.executingAuthorityLevels);
            expect(updatedConcept.executingAuthorities).toEqual(updatedConceptSnapshot.executingAuthorities);
            expect(updatedConcept.publicationMedia).toEqual(updatedConceptSnapshot.publicationMedia);
            expect(updatedConcept.yourEuropeCategories).toEqual(updatedConceptSnapshot.yourEuropeCategories);
            expect(updatedConcept.keywords).toEqual(updatedConceptSnapshot.keywords);
            expect(updatedConcept.requirements)
                .toEqual(expect.arrayContaining([
                    expect.objectContaining({
                        _id: expect.not.objectContaining(updatedConceptSnapshot.requirements[0].id),
                        _uuid: expect.stringMatching(uuidRegex),
                        _title: updatedConceptSnapshot.requirements[0].title,
                        _description: updatedConceptSnapshot.requirements[0].description,
                        _order: 1,
                        _evidence: expect.objectContaining({
                            _id: expect.not.objectContaining(updatedConceptSnapshot.requirements[0].evidence.id),
                            _uuid: expect.stringMatching(uuidRegex),
                            _title: updatedConceptSnapshot.requirements[0].evidence.title,
                            _description: updatedConceptSnapshot.requirements[0].evidence.description,
                        })
                    }),
                    expect.objectContaining({
                        _id: expect.not.objectContaining(updatedConceptSnapshot.requirements[1].id),
                        _uuid: expect.stringMatching(uuidRegex),
                        _title: updatedConceptSnapshot.requirements[1].title,
                        _description: updatedConceptSnapshot.requirements[1].description,
                        _order: 2,
                        _evidence: expect.objectContaining({
                            _id: expect.not.objectContaining(updatedConceptSnapshot.requirements[1].evidence.id),
                            _uuid: expect.stringMatching(uuidRegex),
                            _title: updatedConceptSnapshot.requirements[1].evidence.title,
                            _description: updatedConceptSnapshot.requirements[1].evidence.description,
                        })
                    })
                ]));

            expect(updatedConcept.procedures)
                .toEqual(expect.arrayContaining([
                    expect.objectContaining({
                        _id: expect.not.objectContaining(updatedConceptSnapshot.procedures[0].id),
                        _uuid: expect.stringMatching(uuidRegex),
                        _title: updatedConceptSnapshot.procedures[0].title,
                        _description: updatedConceptSnapshot.procedures[0].description,
                        _order: 1,
                        _websites: expect.arrayContaining([
                            expect.objectContaining({
                                _id: expect.not.objectContaining(updatedConceptSnapshot.procedures[0].websites[0].id),
                                _uuid: expect.stringMatching(uuidRegex),
                                _title: updatedConceptSnapshot.procedures[0].websites[0].title,
                                _description: updatedConceptSnapshot.procedures[0].websites[0].description,
                                _order: 1,
                                _url: updatedConceptSnapshot.procedures[0].websites[0].url,
                            }),
                            expect.objectContaining({
                                _id: expect.not.objectContaining(updatedConceptSnapshot.procedures[0].websites[1].id),
                                _uuid: expect.stringMatching(uuidRegex),
                                _title: updatedConceptSnapshot.procedures[0].websites[1].title,
                                _description: updatedConceptSnapshot.procedures[0].websites[1].description,
                                _order: 2,
                                _url: updatedConceptSnapshot.procedures[0].websites[1].url,
                            }),
                            expect.objectContaining({
                                _id: expect.not.objectContaining(updatedConceptSnapshot.procedures[0].websites[2].id),
                                _uuid: expect.stringMatching(uuidRegex),
                                _title: updatedConceptSnapshot.procedures[0].websites[2].title,
                                _description: updatedConceptSnapshot.procedures[0].websites[2].description,
                                _order: 3,
                                _url: updatedConceptSnapshot.procedures[0].websites[2].url,
                            })
                        ])
                    }),
                    expect.objectContaining({
                        _id: expect.not.objectContaining(updatedConceptSnapshot.procedures[1].id),
                        _uuid: expect.stringMatching(uuidRegex),
                        _title: updatedConceptSnapshot.procedures[1].title,
                        _description: updatedConceptSnapshot.procedures[1].description,
                        _order: 2,
                        _websites: expect.arrayContaining([
                            expect.objectContaining({
                                _id: expect.not.objectContaining(updatedConceptSnapshot.procedures[1].websites[0].id),
                                _uuid: expect.stringMatching(uuidRegex),
                                _title: updatedConceptSnapshot.procedures[1].websites[0].title,
                                _description: updatedConceptSnapshot.procedures[1].websites[0].description,
                                _order: 1,
                                _url: updatedConceptSnapshot.procedures[1].websites[0].url,
                            }),
                            expect.objectContaining({
                                _id: expect.not.objectContaining(updatedConceptSnapshot.procedures[1].websites[1].id),
                                _uuid: expect.stringMatching(uuidRegex),
                                _title: updatedConceptSnapshot.procedures[1].websites[1].title,
                                _description: updatedConceptSnapshot.procedures[1].websites[1].description,
                                _order: 2,
                                _url: updatedConceptSnapshot.procedures[1].websites[1].url,
                            })
                        ])
                    })
                ]));

            expect(updatedConcept.websites)
                .toEqual(expect.arrayContaining([
                    expect.objectContaining({
                        _id: expect.not.objectContaining(updatedConceptSnapshot.websites[0].id),
                        _uuid: expect.stringMatching(uuidRegex),
                        _title: updatedConceptSnapshot.websites[0].title,
                        _description: updatedConceptSnapshot.websites[0].description,
                        _order: 1,
                        _url: updatedConceptSnapshot.websites[0].url,
                    }),
                    expect.objectContaining({
                        _id: expect.not.objectContaining(updatedConceptSnapshot.websites[1].id),
                        _uuid: expect.stringMatching(uuidRegex),
                        _title: updatedConceptSnapshot.websites[1].title,
                        _description: updatedConceptSnapshot.websites[1].description,
                        _order: 2,
                        _url: updatedConceptSnapshot.websites[1].url,
                    })
                ]));

            expect(updatedConcept.costs)
                .toEqual(expect.arrayContaining([
                    expect.objectContaining({
                        _id: expect.not.objectContaining(updatedConceptSnapshot.costs[0].id),
                        _uuid: expect.stringMatching(uuidRegex),
                        _title: updatedConceptSnapshot.costs[0].title,
                        _description: updatedConceptSnapshot.costs[0].description,
                        _order: 1
                    }),
                    expect.objectContaining({
                        _id: expect.not.objectContaining(updatedConceptSnapshot.costs[1].id),
                        _uuid: expect.stringMatching(uuidRegex),
                        _title: updatedConceptSnapshot.costs[1].title,
                        _description: updatedConceptSnapshot.costs[1].description,
                        _order: 2
                    })
                ]));

            expect(updatedConcept.financialAdvantages)
                .toEqual(expect.arrayContaining([
                    expect.objectContaining({
                        _id: expect.not.objectContaining(updatedConceptSnapshot.financialAdvantages[0].id),
                        _uuid: expect.stringMatching(uuidRegex),
                        _title: updatedConceptSnapshot.financialAdvantages[0].title,
                        _description: updatedConceptSnapshot.financialAdvantages[0].description
                    }),
                    expect.objectContaining({
                        _id: expect.not.objectContaining(updatedConceptSnapshot.financialAdvantages[1].id),
                        _uuid: expect.stringMatching(uuidRegex),
                        _title: updatedConceptSnapshot.financialAdvantages[1].title,
                        _description: updatedConceptSnapshot.financialAdvantages[1].description
                    })
                ]));

            expect(updatedConcept.productId).toEqual(updatedConceptSnapshot.productId);
            expect(updatedConcept.latestConceptSnapshot).toEqual(updatedConceptSnapshot.id);
            expect(updatedConcept.previousConceptSnapshots.sort()).toEqual([conceptSnapshot.id].sort());
            expect(updatedConcept.latestFunctionallyChangedConceptSnapshot).toEqual(updatedConceptSnapshot.id);
            expect(updatedConcept.conceptTags).toEqual(updatedConceptSnapshot.conceptTags);
            expect(updatedConcept.legalResources).toEqual(expect.arrayContaining([
                expect.objectContaining({
                    _id: expect.not.objectContaining(updatedConceptSnapshot.legalResources[0]),
                    _uuid: expect.stringMatching(uuidRegex),
                    _title: updatedConceptSnapshot.legalResources[0].title,
                    _description: updatedConceptSnapshot.legalResources[0].description,
                    _url: updatedConceptSnapshot.legalResources[0].url,
                    _order: 1
                }),
                expect.objectContaining({
                    _id: expect.not.objectContaining(updatedConceptSnapshot.legalResources[1]),
                    _uuid: expect.stringMatching(uuidRegex),
                    _title: updatedConceptSnapshot.legalResources[1].title,
                    _description: updatedConceptSnapshot.legalResources[1].description,
                    _url: updatedConceptSnapshot.legalResources[1].url,
                    _order: 2
                }),
                expect.objectContaining({
                    _id: expect.not.objectContaining(updatedConceptSnapshot.legalResources[2]),
                    _uuid: expect.stringMatching(uuidRegex),
                    _title: updatedConceptSnapshot.legalResources[2].title,
                    _description: updatedConceptSnapshot.legalResources[2].description,
                    _url: updatedConceptSnapshot.legalResources[2].url,
                    _order: 3
                })
            ]));
        }, 20000);

        test('Updates a concept with minimal new data of a new version of a concept snapshot', async () => {
            const isVersionOfConceptId = buildConceptIri(uuid());
            const title = ConceptSnapshotTestBuilder.MINIMAL_TITLE;
            const description = aMinimalLanguageString('description').build();
            const conceptSnapshot =
                aFullConceptSnapshot()
                    .withTitle(title)
                    .withDescription(description)
                    .withIsVersionOfConcept(isVersionOfConceptId)
                    .withGeneratedAtTime(FormatPreservingDate.of('2023-12-10T00:00:00Z'))
                    .build();
            await conceptSnapshotRepository.save(conceptSnapshot);

            await insertAllConceptSchemeLinksToGoOverGraphBoundaryVerifyConceptSchemesOfEnums(conceptSnapshot);

            await merger.merge(conceptSnapshot.id);

            const updatedConceptSnapshot =
                aMinimalConceptSnapshot()
                    .withTitle(title)
                    .withDescription(description)
                    .withIsVersionOfConcept(isVersionOfConceptId)
                    .withGeneratedAtTime(FormatPreservingDate.of('2023-12-11T00:00:00Z'))
                    .build();

            await insertAllConceptSchemeLinksToGoOverGraphBoundaryVerifyConceptSchemesOfEnums(updatedConceptSnapshot);

            await conceptSnapshotRepository.save(updatedConceptSnapshot);

            await merger.merge(updatedConceptSnapshot.id);

            const updatedConcept = await conceptRepository.findById(isVersionOfConceptId);
            expect(updatedConcept.id).toEqual(isVersionOfConceptId);
            expect(updatedConcept.uuid).toMatch(uuidRegex);
            expect(updatedConcept.title).toEqual(conceptSnapshot.title);
            expect(updatedConcept.description).toEqual(conceptSnapshot.description);
            expect(updatedConcept.additionalDescription).toBeUndefined();
            expect(updatedConcept.exception).toBeUndefined();
            expect(updatedConcept.regulation).toBeUndefined();
            expect(updatedConcept.startDate).toBeUndefined();
            expect(updatedConcept.endDate).toBeUndefined();
            expect(updatedConcept.type).toBeUndefined();
            expect(updatedConcept.targetAudiences).toEqual([]);
            expect(updatedConcept.themes).toEqual([]);
            expect(updatedConcept.competentAuthorityLevels).toEqual([]);
            expect(updatedConcept.competentAuthorities).toEqual([]);
            expect(updatedConcept.executingAuthorityLevels).toEqual([]);
            expect(updatedConcept.executingAuthorities).toEqual([]);
            expect(updatedConcept.publicationMedia).toEqual([]);
            expect(updatedConcept.yourEuropeCategories).toEqual([]);
            expect(updatedConcept.keywords).toEqual([]);
            expect(updatedConcept.requirements).toEqual([]);
            expect(updatedConcept.procedures).toEqual([]);
            expect(updatedConcept.websites).toEqual([]);
            expect(updatedConcept.costs).toEqual([]);
            expect(updatedConcept.financialAdvantages).toEqual([]);
            expect(updatedConcept.productId).toEqual(conceptSnapshot.productId);
            expect(updatedConcept.latestConceptSnapshot).toEqual(updatedConceptSnapshot.id);
            expect(updatedConcept.previousConceptSnapshots.sort()).toEqual([conceptSnapshot.id].sort());
            expect(updatedConcept.latestFunctionallyChangedConceptSnapshot).toEqual(updatedConceptSnapshot.id);
            expect(updatedConcept.conceptTags).toEqual([]);
            expect(updatedConcept.isArchived).toBeFalsy();
            expect(updatedConcept.legalResources).toEqual([]);
        }, 20000);

        test('Does not update a latestFunctionallyChangedConceptSnapshot link when new version is not functionally changed', async () => {
            const isVersionOfConceptId = buildConceptIri(uuid());
            const conceptSnapshot =
                aMinimalConceptSnapshot()
                    .withIsVersionOfConcept(isVersionOfConceptId)
                    .withGeneratedAtTime(FormatPreservingDate.of('2023-12-10T00:00:00Z'))
                    .build();
            await conceptSnapshotRepository.save(conceptSnapshot);

            await insertAllConceptSchemeLinksToGoOverGraphBoundaryVerifyConceptSchemesOfEnums(conceptSnapshot);

            await merger.merge(conceptSnapshot.id);

            const updatedConceptSnapshot =
                aMinimalConceptSnapshot()
                    .withIsVersionOfConcept(isVersionOfConceptId)
                    .withGeneratedAtTime(FormatPreservingDate.of('2023-12-11T00:00:00Z'))
                    .build();

            await insertAllConceptSchemeLinksToGoOverGraphBoundaryVerifyConceptSchemesOfEnums(updatedConceptSnapshot);

            await conceptSnapshotRepository.save(updatedConceptSnapshot);

            await merger.merge(updatedConceptSnapshot.id);

            const updatedConcept = await conceptRepository.findById(isVersionOfConceptId);
            expect(updatedConcept.latestConceptSnapshot).toEqual(updatedConceptSnapshot.id);
            expect(updatedConcept.previousConceptSnapshots.sort()).toEqual([conceptSnapshot.id].sort());
            expect(updatedConcept.latestFunctionallyChangedConceptSnapshot).toEqual(conceptSnapshot.id);
        }, 20000);

        test('Does not update a concept when same version is merged again', async () => {
            const isVersionOfConceptId = buildConceptIri(uuid());
            const conceptSnapshot =
                aMinimalConceptSnapshot()
                    .withIsVersionOfConcept(isVersionOfConceptId)
                    .withGeneratedAtTime(FormatPreservingDate.of('2023-12-10T00:00:00Z'))
                    .build();
            await conceptSnapshotRepository.save(conceptSnapshot);

            await insertAllConceptSchemeLinksToGoOverGraphBoundaryVerifyConceptSchemesOfEnums(conceptSnapshot);

            await merger.merge(conceptSnapshot.id);

            await merger.merge(conceptSnapshot.id);

            const updatedConcept = await conceptRepository.findById(isVersionOfConceptId);
            expect(updatedConcept.latestConceptSnapshot).toEqual(conceptSnapshot.id);
            expect(updatedConcept.previousConceptSnapshots).toEqual([]);
            expect(updatedConcept.latestFunctionallyChangedConceptSnapshot).toEqual(conceptSnapshot.id);
        }, 10000);

        test('Only updates the previousConceptSnapshot data of the concept when newer version already processed', async () => {
            const isVersionOfConceptId = buildConceptIri(uuid());
            const conceptSnapshot =
                aMinimalConceptSnapshot()
                    .withTitle(
                        LanguageString.of(
                            ConceptSnapshotTestBuilder.TITLE_NL,
                            ConceptSnapshotTestBuilder.TITLE_NL_FORMAL,
                            ConceptSnapshotTestBuilder.TITLE_NL_INFORMAL,
                            ConceptSnapshotTestBuilder.TITLE_NL_GENERATED_FORMAL,
                            ConceptSnapshotTestBuilder.TITLE_NL_GENERATED_INFORMAL))
                    .withIsVersionOfConcept(isVersionOfConceptId)
                    .withGeneratedAtTime(FormatPreservingDate.of('2023-12-11T00:00:00Z'))
                    .build();
            await conceptSnapshotRepository.save(conceptSnapshot);

            await insertAllConceptSchemeLinksToGoOverGraphBoundaryVerifyConceptSchemesOfEnums(conceptSnapshot);

            await merger.merge(conceptSnapshot.id);

            const updatedConceptSnapshot =
                aMinimalConceptSnapshot()
                    .withTitle(suffixUnique(conceptSnapshot.title))
                    .withIsVersionOfConcept(isVersionOfConceptId)
                    .withGeneratedAtTime(FormatPreservingDate.of('2023-12-10T00:00:00Z'))
                    .build();

            await insertAllConceptSchemeLinksToGoOverGraphBoundaryVerifyConceptSchemesOfEnums(updatedConceptSnapshot);

            await conceptSnapshotRepository.save(updatedConceptSnapshot);

            await merger.merge(updatedConceptSnapshot.id);

            const notUpdatedConcept = await conceptRepository.findById(isVersionOfConceptId);
            expect(notUpdatedConcept.title).toEqual(conceptSnapshot.title);
            expect(notUpdatedConcept.latestConceptSnapshot).toEqual(conceptSnapshot.id);
            expect(notUpdatedConcept.previousConceptSnapshots.sort()).toEqual([updatedConceptSnapshot.id].sort());
            expect(notUpdatedConcept.latestFunctionallyChangedConceptSnapshot).toEqual(conceptSnapshot.id);

            const anotherOldUpdatedConceptSnapshot =
                aMinimalConceptSnapshot()
                    .withTitle(suffixUnique(conceptSnapshot.title))
                    .withIsVersionOfConcept(isVersionOfConceptId)
                    .withGeneratedAtTime(FormatPreservingDate.of('2023-12-10T00:00:00Z'))
                    .build();

            await insertAllConceptSchemeLinksToGoOverGraphBoundaryVerifyConceptSchemesOfEnums(anotherOldUpdatedConceptSnapshot);

            await conceptSnapshotRepository.save(anotherOldUpdatedConceptSnapshot);

            await merger.merge(anotherOldUpdatedConceptSnapshot.id);

            const againNotUpdatedConcept = await conceptRepository.findById(isVersionOfConceptId);
            expect(againNotUpdatedConcept.title).toEqual(conceptSnapshot.title);
            expect(againNotUpdatedConcept.latestConceptSnapshot).toEqual(conceptSnapshot.id);
            expect(againNotUpdatedConcept.previousConceptSnapshots.sort()).toEqual([anotherOldUpdatedConceptSnapshot.id, updatedConceptSnapshot.id].sort());
            expect(againNotUpdatedConcept.latestFunctionallyChangedConceptSnapshot).toEqual(conceptSnapshot.id);
        }, 10000);

        test('Updates a concept from a concept snapshot that is archived', async () => {
            const isVersionOfConceptId = buildConceptIri(uuid());
            const conceptSnapshot =
                aMinimalConceptSnapshot()
                    .withIsVersionOfConcept(isVersionOfConceptId)
                    .withIsArchived(true)
                    .withGeneratedAtTime(FormatPreservingDate.of('2023-12-10T00:00:00Z'))
                    .build();
            await conceptSnapshotRepository.save(conceptSnapshot);

            await insertAllConceptSchemeLinksToGoOverGraphBoundaryVerifyConceptSchemesOfEnums(conceptSnapshot);

            await merger.merge(conceptSnapshot.id);

            const updatedConceptSnapshot =
                aMinimalConceptSnapshot()
                    .withIsVersionOfConcept(isVersionOfConceptId)
                    .withIsArchived(true)
                    .withCosts([aFullCost().build()])
                    .withGeneratedAtTime(FormatPreservingDate.of('2023-12-11T00:00:00Z'))
                    .build();

            await insertAllConceptSchemeLinksToGoOverGraphBoundaryVerifyConceptSchemesOfEnums(updatedConceptSnapshot);

            await conceptSnapshotRepository.save(updatedConceptSnapshot);

            await merger.merge(updatedConceptSnapshot.id);

            const updatedConcept = await conceptRepository.findById(isVersionOfConceptId);
            expect(updatedConcept.isArchived).toBeTruthy();
            expect(updatedConcept.latestConceptSnapshot).toEqual(updatedConceptSnapshot.id);
            expect(updatedConcept.latestFunctionallyChangedConceptSnapshot).toEqual(updatedConceptSnapshot.id);
        }, 20000);

        test('Updates a concept from a concept snapshot that is archived and then unarchived', async () => {
            const isVersionOfConceptId = buildConceptIri(uuid());
            const conceptSnapshot =
                aMinimalConceptSnapshot()
                    .withIsVersionOfConcept(isVersionOfConceptId)
                    .withIsArchived(true)
                    .withGeneratedAtTime(FormatPreservingDate.of('2023-12-10T00:00:00Z'))
                    .build();
            await conceptSnapshotRepository.save(conceptSnapshot);

            await insertAllConceptSchemeLinksToGoOverGraphBoundaryVerifyConceptSchemesOfEnums(conceptSnapshot);

            await merger.merge(conceptSnapshot.id);

            const archivedConceptSnapshot =
                aMinimalConceptSnapshot()
                    .withIsVersionOfConcept(isVersionOfConceptId)
                    .withIsArchived(true)
                    .withCosts([aFullCost().build()])
                    .withGeneratedAtTime(FormatPreservingDate.of('2023-12-11T00:00:00Z'))
                    .build();

            await insertAllConceptSchemeLinksToGoOverGraphBoundaryVerifyConceptSchemesOfEnums(archivedConceptSnapshot);

            await conceptSnapshotRepository.save(archivedConceptSnapshot);

            await merger.merge(archivedConceptSnapshot.id);

            const unarchivedConceptSnapshot =
                aMinimalConceptSnapshot()
                    .withIsVersionOfConcept(isVersionOfConceptId)
                    .withIsArchived(false)
                    .withCosts([aFullCost().build()])
                    .withGeneratedAtTime(FormatPreservingDate.of('2023-12-12T00:00:00Z'))
                    .build();

            await insertAllConceptSchemeLinksToGoOverGraphBoundaryVerifyConceptSchemesOfEnums(unarchivedConceptSnapshot);

            await conceptSnapshotRepository.save(unarchivedConceptSnapshot);

            await merger.merge(unarchivedConceptSnapshot.id);

            const updatedConcept = await conceptRepository.findById(isVersionOfConceptId);
            expect(updatedConcept.isArchived).toBeFalse();
            expect(updatedConcept.latestConceptSnapshot).toEqual(unarchivedConceptSnapshot.id);
            expect(updatedConcept.latestFunctionallyChangedConceptSnapshot).toEqual(unarchivedConceptSnapshot.id);
        }, 20000);

        test('Multiple consecutive updates to a concept', async () => {
            const isVersionOfConceptId = buildConceptIri(uuid());
            const conceptSnapshot =
                aFullConceptSnapshot()
                    .withIsVersionOfConcept(isVersionOfConceptId)
                    .withGeneratedAtTime(FormatPreservingDate.of('2023-12-10T00:00:00Z'))
                    .build();
            await conceptSnapshotRepository.save(conceptSnapshot);

            await insertAllConceptSchemeLinksToGoOverGraphBoundaryVerifyConceptSchemesOfEnums(conceptSnapshot);

            await merger.merge(conceptSnapshot.id);

            const updatedConceptSnapshot =
                aMinimalConceptSnapshot()
                    .withIsVersionOfConcept(isVersionOfConceptId)
                    .withTitle(suffixUnique(conceptSnapshot.title))
                    .withGeneratedAtTime(FormatPreservingDate.of('2023-12-11T00:00:00Z'))
                    .build();

            await insertAllConceptSchemeLinksToGoOverGraphBoundaryVerifyConceptSchemesOfEnums(updatedConceptSnapshot);

            await conceptSnapshotRepository.save(updatedConceptSnapshot);

            await merger.merge(updatedConceptSnapshot.id);

            const updatedConcept = await conceptRepository.findById(isVersionOfConceptId);
            expect(updatedConcept.id).toEqual(isVersionOfConceptId);
            expect(updatedConcept.uuid).toMatch(uuidRegex);
            expect(updatedConcept.title).toEqual(updatedConceptSnapshot.title);
            expect(updatedConcept.latestConceptSnapshot).toEqual(updatedConceptSnapshot.id);
            expect(updatedConcept.previousConceptSnapshots.sort()).toEqual([conceptSnapshot.id].sort());
            expect(updatedConcept.latestFunctionallyChangedConceptSnapshot).toEqual(updatedConceptSnapshot.id);

            const secondTimeUpdatedConceptSnapshot =
                aMinimalConceptSnapshot()
                    .withIsVersionOfConcept(isVersionOfConceptId)
                    .withTitle(suffixUnique(updatedConceptSnapshot.title))
                    .withGeneratedAtTime(FormatPreservingDate.of('2023-12-18T00:00:00Z'))
                    .build();

            await insertAllConceptSchemeLinksToGoOverGraphBoundaryVerifyConceptSchemesOfEnums(secondTimeUpdatedConceptSnapshot);

            await conceptSnapshotRepository.save(secondTimeUpdatedConceptSnapshot);

            await merger.merge(secondTimeUpdatedConceptSnapshot.id);

            const secondTimeUpdatedConcept = await conceptRepository.findById(isVersionOfConceptId);
            expect(secondTimeUpdatedConcept.id).toEqual(isVersionOfConceptId);
            expect(secondTimeUpdatedConcept.uuid).toMatch(uuidRegex);
            expect(secondTimeUpdatedConcept.title).toEqual(secondTimeUpdatedConceptSnapshot.title);
            expect(secondTimeUpdatedConcept.latestConceptSnapshot).toEqual(secondTimeUpdatedConceptSnapshot.id);
            expect(secondTimeUpdatedConcept.previousConceptSnapshots.sort()).toEqual([conceptSnapshot.id, updatedConceptSnapshot.id].sort());
            expect(secondTimeUpdatedConcept.latestFunctionallyChangedConceptSnapshot).toEqual(secondTimeUpdatedConceptSnapshot.id);

            const thirdTimeButOlderUpdatedConceptSnapshot =
                aMinimalConceptSnapshot()
                    .withIsVersionOfConcept(isVersionOfConceptId)
                    .withTitle(suffixUnique(updatedConceptSnapshot.title))
                    .withGeneratedAtTime(FormatPreservingDate.of('2023-12-10T12:00:00Z'))
                    .build();

            await insertAllConceptSchemeLinksToGoOverGraphBoundaryVerifyConceptSchemesOfEnums(thirdTimeButOlderUpdatedConceptSnapshot);

            await conceptSnapshotRepository.save(thirdTimeButOlderUpdatedConceptSnapshot);

            await merger.merge(thirdTimeButOlderUpdatedConceptSnapshot.id);

            const notUpdatedForThirdTimeUpdatedConcept = await conceptRepository.findById(isVersionOfConceptId);
            expect(notUpdatedForThirdTimeUpdatedConcept.id).toEqual(isVersionOfConceptId);
            expect(notUpdatedForThirdTimeUpdatedConcept.uuid).toMatch(uuidRegex);
            expect(notUpdatedForThirdTimeUpdatedConcept.title).toEqual(secondTimeUpdatedConceptSnapshot.title);
            expect(notUpdatedForThirdTimeUpdatedConcept.latestConceptSnapshot).toEqual(secondTimeUpdatedConceptSnapshot.id);
            expect(notUpdatedForThirdTimeUpdatedConcept.previousConceptSnapshots.sort()).toEqual([conceptSnapshot.id, updatedConceptSnapshot.id, thirdTimeButOlderUpdatedConceptSnapshot.id].sort());
            expect(notUpdatedForThirdTimeUpdatedConcept.latestFunctionallyChangedConceptSnapshot).toEqual(secondTimeUpdatedConceptSnapshot.id);

            const fourthTimeUpdatedConceptSnapshot =
                aMinimalConceptSnapshot()
                    .withIsVersionOfConcept(isVersionOfConceptId)
                    .withTitle(suffixUnique(secondTimeUpdatedConceptSnapshot.title))
                    .withGeneratedAtTime(FormatPreservingDate.of('2023-12-19T00:00:00Z'))
                    .build();

            await insertAllConceptSchemeLinksToGoOverGraphBoundaryVerifyConceptSchemesOfEnums(fourthTimeUpdatedConceptSnapshot);

            await conceptSnapshotRepository.save(fourthTimeUpdatedConceptSnapshot);

            await merger.merge(fourthTimeUpdatedConceptSnapshot.id);

            const fourthTimeUpdatedConcept = await conceptRepository.findById(isVersionOfConceptId);
            expect(fourthTimeUpdatedConcept.id).toEqual(isVersionOfConceptId);
            expect(fourthTimeUpdatedConcept.uuid).toMatch(uuidRegex);
            expect(fourthTimeUpdatedConcept.title).toEqual(fourthTimeUpdatedConceptSnapshot.title);
            expect(fourthTimeUpdatedConcept.latestConceptSnapshot).toEqual(fourthTimeUpdatedConceptSnapshot.id);
            expect(fourthTimeUpdatedConcept.previousConceptSnapshots.sort()).toEqual([conceptSnapshot.id, updatedConceptSnapshot.id, secondTimeUpdatedConceptSnapshot.id, thirdTimeButOlderUpdatedConceptSnapshot.id].sort());
            expect(fourthTimeUpdatedConcept.latestFunctionallyChangedConceptSnapshot).toEqual(fourthTimeUpdatedConceptSnapshot.id);

        }, 30000);

        test('Creates a new concept from a concept snapshot with keywords with other nl languages than nl ', async () => {
            const isVersionOfConceptId = buildConceptIri(uuid());
            const conceptSnapshot =
                aMinimalConceptSnapshot()
                    .withIsVersionOfConcept(isVersionOfConceptId)
                    .withKeywords([LanguageString.of('keyword')])
                    .withGeneratedAtTime(FormatPreservingDate.of('2023-12-10T00:00:00Z'))
                    .build();
            await conceptSnapshotRepository.save(conceptSnapshot);

            insertAllConceptSchemeLinksToGoOverGraphBoundaryVerifyConceptSchemesOfEnums(conceptSnapshot);

            await merger.merge(conceptSnapshot.id);

            const updatedConceptSnapshot =
                aMinimalConceptSnapshot()
                    .withIsVersionOfConcept(isVersionOfConceptId)
                    .withTitle(suffixUnique(conceptSnapshot.title))
                    .withGeneratedAtTime(FormatPreservingDate.of('2023-12-11T00:00:00Z'))
                    .withKeywords([LanguageString.of(undefined, 'formal keyword')])
                    .build();

            insertAllConceptSchemeLinksToGoOverGraphBoundaryVerifyConceptSchemesOfEnums(updatedConceptSnapshot);

            await conceptSnapshotRepository.save(updatedConceptSnapshot);

            await merger.merge(updatedConceptSnapshot.id);

            const updatedConcept = await conceptRepository.findById(isVersionOfConceptId);
            expect(updatedConcept.id).toEqual(isVersionOfConceptId);
            expect(updatedConcept.uuid).toMatch(uuidRegex);
            expect(updatedConcept.title).toEqual(updatedConceptSnapshot.title);
            expect(updatedConcept.keywords).toEqual([]);
        }, 10000);

    });

    test('Creates a concept display configuration for each bestuurseenheid', async () => {
        const bestuurseenheid =
            aBestuurseenheid()
                .withId(buildBestuurseenheidIri(uuid()))
                .build();
        await bestuurseenheidRepository.save(bestuurseenheid);

        const anotherBestuurseenheid =
            aBestuurseenheid()
                .withId(buildBestuurseenheidIri(uuid()))
                .build();
        await bestuurseenheidRepository.save(anotherBestuurseenheid);

        const isVersionOfConceptId = buildConceptIri(uuid());
        const conceptSnapshot =
            aMinimalConceptSnapshot()
                .withIsVersionOfConcept(isVersionOfConceptId)
                .build();
        await conceptSnapshotRepository.save(conceptSnapshot);

        await insertAllConceptSchemeLinksToGoOverGraphBoundaryVerifyConceptSchemesOfEnums(conceptSnapshot);

        await merger.merge(conceptSnapshot.id);

        const createdConcept = await conceptRepository.findById(isVersionOfConceptId);
        expect(createdConcept.id).toEqual(isVersionOfConceptId);
        expect(createdConcept.uuid).toMatch(uuidRegex);

        const createdConceptDisplayConfigurationForBestuurseenheid = await conceptDisplayConfigurationRepository.findByConceptId(bestuurseenheid, isVersionOfConceptId);
        expect(createdConceptDisplayConfigurationForBestuurseenheid.id).not.toBeUndefined();
        expect(createdConceptDisplayConfigurationForBestuurseenheid.uuid).not.toBeUndefined();
        expect(createdConceptDisplayConfigurationForBestuurseenheid.conceptIsNew).toEqual(true);
        expect(createdConceptDisplayConfigurationForBestuurseenheid.conceptIsInstantiated).toEqual(false);
        expect(createdConceptDisplayConfigurationForBestuurseenheid.bestuurseenheidId).toEqual(bestuurseenheid.id);
        expect(createdConceptDisplayConfigurationForBestuurseenheid.conceptId).toEqual(isVersionOfConceptId);

        const createdConceptDisplayConfigurationForAnotherBestuurseenheid = await conceptDisplayConfigurationRepository.findByConceptId(anotherBestuurseenheid, isVersionOfConceptId);
        expect(createdConceptDisplayConfigurationForAnotherBestuurseenheid.id).not.toBeUndefined();
        expect(createdConceptDisplayConfigurationForAnotherBestuurseenheid.uuid).not.toBeUndefined();
        expect(createdConceptDisplayConfigurationForAnotherBestuurseenheid.conceptIsNew).toEqual(true);
        expect(createdConceptDisplayConfigurationForAnotherBestuurseenheid.conceptIsInstantiated).toEqual(false);
        expect(createdConceptDisplayConfigurationForAnotherBestuurseenheid.bestuurseenheidId).toEqual(anotherBestuurseenheid.id);
        expect(createdConceptDisplayConfigurationForAnotherBestuurseenheid.conceptId).toEqual(isVersionOfConceptId);

    }, 10000);

    test('Inserts Code Lists for competent and executing authorities if not existing', async () => {
        const bestuurseenheidRegistrationCodeFetcher = {
            fetchOrgRegistryCodelistEntry: jest.fn().mockImplementation((uriEntry: Iri) => Promise.resolve({
                uri: uriEntry,
                prefLabel: `preferred label for: ${uriEntry}`
            }))
        };
        const ensureLinkedAuthoritiesExistAsCodeListDomainService = new EnsureLinkedAuthoritiesExistAsCodeListDomainService(bestuurseenheidRegistrationCodeFetcher, codeRepository);
        const merger = new ConceptSnapshotToConceptMergerDomainService(
            conceptSnapshotRepository,
            conceptRepository,
            conceptDisplayConfigurationRepository,
            ensureLinkedAuthoritiesExistAsCodeListDomainService,
            instanceRepository);

        await directDatabaseAccess.insertData(
            PUBLIC_GRAPH,
            [
                `${sparqlEscapeUri(NS.dvcs(CodeSchema.IPDCOrganisaties).value)} a skos:ConceptScheme`,
            ],
            [
                PREFIX.skos,
            ],
        );

        const competentAuthorityWithoutCodeList = buildBestuurseenheidIri(uuid());
        const executingAuthorityWithoutCodeList = buildBestuurseenheidIri(uuid());

        const isVersionOfConceptId = buildConceptIri(uuid());
        const conceptSnapshot =
            aMinimalConceptSnapshot()
                .withIsVersionOfConcept(isVersionOfConceptId)
                .withCompetentAuthorities([competentAuthorityWithoutCodeList])
                .withExecutingAuthorities([executingAuthorityWithoutCodeList])
                .build();
        await conceptSnapshotRepository.save(conceptSnapshot);

        await merger.merge(conceptSnapshot.id);

        const createdConcept = await conceptRepository.findById(isVersionOfConceptId);
        expect(createdConcept.id).toEqual(isVersionOfConceptId);
        expect(createdConcept.uuid).toMatch(uuidRegex);

        const createdCompetentAuthorityCode = await codeRepository.exists(CodeSchema.IPDCOrganisaties, competentAuthorityWithoutCodeList);
        expect(createdCompetentAuthorityCode).toBeTruthy();

        const createdExecutingAuthorityCode = await codeRepository.exists(CodeSchema.IPDCOrganisaties, executingAuthorityWithoutCodeList);
        expect(createdExecutingAuthorityCode).toBeTruthy();

    }, 10000);

    describe('Update instance review statuses', () => {

        test('Updates instance review status to updated for each linked instance if concept is FunctionallyModified', async () => {
            const isVersionOfConceptId = buildConceptIri(uuid());
            const title = ConceptSnapshotTestBuilder.MINIMAL_TITLE;
            const description = aMinimalLanguageString('description').build();
            const conceptSnapshot =
                aFullConceptSnapshot()
                    .withTitle(title)
                    .withDescription(description)
                    .withIsVersionOfConcept(isVersionOfConceptId)
                    .withGeneratedAtTime(FormatPreservingDate.of('2023-12-10T00:00:00Z'))
                    .build();
            await conceptSnapshotRepository.save(conceptSnapshot);

            await insertAllConceptSchemeLinksToGoOverGraphBoundaryVerifyConceptSchemesOfEnums(conceptSnapshot);

            await merger.merge(conceptSnapshot.id);

            const createdConcept = await conceptRepository.findById(isVersionOfConceptId);
            expect(createdConcept.id).toEqual(isVersionOfConceptId);

            const bestuurseenheid =
                aBestuurseenheid()
                    .withId(buildBestuurseenheidIri(uuid()))
                    .build();
            await bestuurseenheidRepository.save(bestuurseenheid);

            const anotherBestuurseenheid =
                aBestuurseenheid()
                    .withId(buildBestuurseenheidIri(uuid()))
                    .build();
            await bestuurseenheidRepository.save(anotherBestuurseenheid);

            const instanceId = InstanceBuilder.buildIri(uuid());
            const previousDateModified = new Date('2024-06-01T12:54:54.005');
            await directDatabaseAccess.insertData(
                bestuurseenheid.userGraph().value,
                [
                    `${sparqlEscapeUri(instanceId)} a lpdcExt:InstancePublicService`,
                    `${sparqlEscapeUri(instanceId)} dct:source ${sparqlEscapeUri(isVersionOfConceptId)}`,
                    `${sparqlEscapeUri(instanceId)} schema:dateModified ${sparqlEscapeDateTime(previousDateModified)}`,
                ],
                [
                    PREFIX.lpdcExt,
                    PREFIX.dct,
                    PREFIX.schema,
                ],
            );

            const anotherInstanceId = InstanceBuilder.buildIri(uuid());

            await directDatabaseAccess.insertData(
                anotherBestuurseenheid.userGraph().value,
                [
                    `${sparqlEscapeUri(anotherInstanceId)} a lpdcExt:InstancePublicService`,
                    `${sparqlEscapeUri(anotherInstanceId)} dct:source ${sparqlEscapeUri(isVersionOfConceptId)}`,
                    `${sparqlEscapeUri(anotherInstanceId)} schema:dateModified ${sparqlEscapeDateTime(previousDateModified)}`,
                ],
                [
                    PREFIX.lpdcExt,
                    PREFIX.dct,
                    PREFIX.schema,
                ],
            );

            const updatedConceptSnapshot =
                aMinimalConceptSnapshot()
                    .withTitle(title)
                    .withDescription(description)
                    .withIsVersionOfConcept(isVersionOfConceptId)
                    .withGeneratedAtTime(FormatPreservingDate.of('2023-12-11T00:00:00Z'))
                    .build();

            await insertAllConceptSchemeLinksToGoOverGraphBoundaryVerifyConceptSchemesOfEnums(updatedConceptSnapshot);

            await conceptSnapshotRepository.save(updatedConceptSnapshot);

            await merger.merge(updatedConceptSnapshot.id);

            const updatedConcept = await conceptRepository.findById(isVersionOfConceptId);
            expect(updatedConcept.id).toEqual(isVersionOfConceptId);

            const reviewStatusAndDateModifiedForConceptInGraph = (be: Bestuurseenheid) => `           
                ${PREFIX.lpdcExt}
                ${PREFIX.dct}
                ${PREFIX.ext}
                ${PREFIX.schema}
                
                SELECT ?reviewStatus ?dateModified WHERE {
                    GRAPH ${sparqlEscapeUri(be.userGraph())} {
                        ?instanceId a lpdcExt:InstancePublicService ;
                            dct:source ${sparqlEscapeUri(isVersionOfConceptId)} ;
                            ext:reviewStatus ?reviewStatus;
                            schema:dateModified ?dateModified .
                    }
                }
            `;
            const reviewStatusAndDateModifiedResultForInstanceOfBestuurseenheid = await directDatabaseAccess.list(reviewStatusAndDateModifiedForConceptInGraph(bestuurseenheid));
            expect(reviewStatusAndDateModifiedResultForInstanceOfBestuurseenheid.length).toEqual(1);

            const reviewStatusForInstanceOfBestuurseenheid = reviewStatusAndDateModifiedResultForInstanceOfBestuurseenheid[0]['reviewStatus'].value;
            expect(reviewStatusForInstanceOfBestuurseenheid).toEqual(NS.concepts.reviewStatus(InstanceReviewStatusType.CONCEPT_GEWIJZIGD).value);

            const dateModifiedForInstanceOfBestuurseenheid = reviewStatusAndDateModifiedResultForInstanceOfBestuurseenheid[0]['dateModified'].value;
            expect(dateModifiedForInstanceOfBestuurseenheid).toEqual(previousDateModified.toISOString());

            const reviewStatusResultForInstanceOfAnotherBestuurseenheid = await directDatabaseAccess.list(reviewStatusAndDateModifiedForConceptInGraph(anotherBestuurseenheid));
            expect(reviewStatusResultForInstanceOfAnotherBestuurseenheid.length).toEqual(1);

            const reviewStatusForInstanceOfAnotherBestuurseenheid = reviewStatusResultForInstanceOfAnotherBestuurseenheid[0]['reviewStatus'].value;
            expect(reviewStatusForInstanceOfAnotherBestuurseenheid).toEqual(NS.concepts.reviewStatus(InstanceReviewStatusType.CONCEPT_GEWIJZIGD).value);

            const dateModifiedForInstanceOfAnotherBestuurseenheid = reviewStatusResultForInstanceOfAnotherBestuurseenheid[0]['dateModified'].value;
            expect(dateModifiedForInstanceOfAnotherBestuurseenheid).toEqual(previousDateModified.toISOString());

        }, 20000);

        test('Does not updates instance review status to updated for each linked instance if concept is not FunctionallyModified', async () => {
            const isVersionOfConceptId = buildConceptIri(uuid());
            const conceptSnapshot =
                aFullConceptSnapshot()
                    .withIsVersionOfConcept(isVersionOfConceptId)
                    .withGeneratedAtTime(FormatPreservingDate.of('2023-12-10T00:00:00Z'))
                    .build();
            await conceptSnapshotRepository.save(conceptSnapshot);

            await insertAllConceptSchemeLinksToGoOverGraphBoundaryVerifyConceptSchemesOfEnums(conceptSnapshot);

            await merger.merge(conceptSnapshot.id);

            const createdConcept = await conceptRepository.findById(isVersionOfConceptId);
            expect(createdConcept.id).toEqual(isVersionOfConceptId);

            const bestuurseenheid =
                aBestuurseenheid()
                    .withId(buildBestuurseenheidIri(uuid()))
                    .build();
            await bestuurseenheidRepository.save(bestuurseenheid);

            const instanceId = InstanceBuilder.buildIri(uuid());
            await directDatabaseAccess.insertData(
                bestuurseenheid.userGraph().value,
                [
                    `${sparqlEscapeUri(instanceId)} a lpdcExt:InstancePublicService`,
                    `${sparqlEscapeUri(instanceId)} dct:source ${sparqlEscapeUri(isVersionOfConceptId)}`
                ],
                [
                    PREFIX.lpdcExt,
                    PREFIX.dct,
                ],
            );

            const updatedConceptSnapshot =
                aFullConceptSnapshot()
                    .withIsVersionOfConcept(isVersionOfConceptId)
                    .withGeneratedAtTime(FormatPreservingDate.of('2023-12-11T00:00:00Z'))
                    .build();

            await conceptSnapshotRepository.save(updatedConceptSnapshot);

            await merger.merge(updatedConceptSnapshot.id);

            const updatedConcept = await conceptRepository.findById(isVersionOfConceptId);
            expect(updatedConcept.id).toEqual(isVersionOfConceptId);

            const reviewStatusForConceptInGraph = (be: Bestuurseenheid) => `           
                ${PREFIX.lpdcExt}
                ${PREFIX.dct}
                ${PREFIX.ext}
                SELECT ?reviewStatus WHERE {
                    GRAPH ${sparqlEscapeUri(be.userGraph())} {
                        ?instanceId a lpdcExt:InstancePublicService ;
                            dct:source ${sparqlEscapeUri(isVersionOfConceptId)} ;
                            ext:reviewStatus ?reviewStatus .
                    }
                }
            `;
            const reviewStatusResultForInstance = await directDatabaseAccess.list(reviewStatusForConceptInGraph(bestuurseenheid));
            expect(reviewStatusResultForInstance.length).toEqual(0);
        }, 20000);

        test('Updates instance review status to archived for each linked instance if concept is archived', async () => {
            const isVersionOfConceptId = buildConceptIri(uuid());
            const conceptSnapshot =
                aFullConceptSnapshot()
                    .withIsVersionOfConcept(isVersionOfConceptId)
                    .withGeneratedAtTime(FormatPreservingDate.of('2023-12-10T00:00:00Z'))
                    .build();
            await conceptSnapshotRepository.save(conceptSnapshot);

            await insertAllConceptSchemeLinksToGoOverGraphBoundaryVerifyConceptSchemesOfEnums(conceptSnapshot);

            await merger.merge(conceptSnapshot.id);

            const createdConcept = await conceptRepository.findById(isVersionOfConceptId);
            expect(createdConcept.id).toEqual(isVersionOfConceptId);

            const bestuurseenheid =
                aBestuurseenheid()
                    .withId(buildBestuurseenheidIri(uuid()))
                    .build();
            await bestuurseenheidRepository.save(bestuurseenheid);

            const instanceId = InstanceBuilder.buildIri(uuid());

            const previousDateModified = new Date('2024-06-01T12:54:54.004');

            await directDatabaseAccess.insertData(
                bestuurseenheid.userGraph().value,
                [
                    `${sparqlEscapeUri(instanceId)} a lpdcExt:InstancePublicService`,
                    `${sparqlEscapeUri(instanceId)} dct:source ${sparqlEscapeUri(isVersionOfConceptId)}`,
                    `${sparqlEscapeUri(instanceId)} schema:dateModified ${sparqlEscapeDateTime(previousDateModified)}`
                ],
                [
                    PREFIX.lpdcExt,
                    PREFIX.dct,
                    PREFIX.schema,
                ],
            );

            const updatedConceptSnapshot =
                aFullConceptSnapshot()
                    .withIsVersionOfConcept(isVersionOfConceptId)
                    .withIsArchived(true)
                    .withGeneratedAtTime(FormatPreservingDate.of('2023-12-11T00:00:00Z'))
                    .build();

            await conceptSnapshotRepository.save(updatedConceptSnapshot);

            await merger.merge(updatedConceptSnapshot.id);

            const updatedConcept = await conceptRepository.findById(isVersionOfConceptId);
            expect(updatedConcept.id).toEqual(isVersionOfConceptId);

            const reviewStatusAndDateModifiedForConceptInGraph = (be: Bestuurseenheid) => `           
                ${PREFIX.lpdcExt}
                ${PREFIX.dct}
                ${PREFIX.ext}
                ${PREFIX.schema}
                
                SELECT ?reviewStatus ?dateModified WHERE {
                    GRAPH ${sparqlEscapeUri(be.userGraph())} {
                        ?instanceId a lpdcExt:InstancePublicService ;
                            dct:source ${sparqlEscapeUri(isVersionOfConceptId)} ;
                            ext:reviewStatus ?reviewStatus ; 
                            schema:dateModified ?dateModified .
                    }
                }
            `;
            const reviewStatusAndDateModifiedResultForInstance = await directDatabaseAccess.list(reviewStatusAndDateModifiedForConceptInGraph(bestuurseenheid));
            expect(reviewStatusAndDateModifiedResultForInstance.length).toEqual(1);

            const reviewStatusForInstance = reviewStatusAndDateModifiedResultForInstance[0]['reviewStatus'].value;
            expect(reviewStatusForInstance).toEqual(NS.concepts.reviewStatus(InstanceReviewStatusType.CONCEPT_GEARCHIVEERD).value);

            const dateModifiedForInstance = reviewStatusAndDateModifiedResultForInstance[0]['dateModified'].value;
            expect(dateModifiedForInstance).toEqual(previousDateModified.toISOString());

        });

        test('Updates instance review status to Concept gewijzigd for each linked instance if concept is archived and then unarchived', async () => {
            const isVersionOfConceptId = buildConceptIri(uuid());
            const conceptSnapshot =
                aFullConceptSnapshot()
                    .withIsVersionOfConcept(isVersionOfConceptId)
                    .withGeneratedAtTime(FormatPreservingDate.of('2023-12-10T00:00:00Z'))
                    .build();
            await conceptSnapshotRepository.save(conceptSnapshot);

            await insertAllConceptSchemeLinksToGoOverGraphBoundaryVerifyConceptSchemesOfEnums(conceptSnapshot);

            await merger.merge(conceptSnapshot.id);

            const createdConcept = await conceptRepository.findById(isVersionOfConceptId);
            expect(createdConcept.id).toEqual(isVersionOfConceptId);

            const bestuurseenheid =
                aBestuurseenheid()
                    .withId(buildBestuurseenheidIri(uuid()))
                    .build();
            await bestuurseenheidRepository.save(bestuurseenheid);

            const instanceId = InstanceBuilder.buildIri(uuid());
            const previousDateModified = new Date('2024-06-01T12:54:54.003');
            await directDatabaseAccess.insertData(
                bestuurseenheid.userGraph().value,
                [
                    `${sparqlEscapeUri(instanceId)} a lpdcExt:InstancePublicService`,
                    `${sparqlEscapeUri(instanceId)} dct:source ${sparqlEscapeUri(isVersionOfConceptId)}`,
                    `${sparqlEscapeUri(instanceId)} schema:dateModified ${sparqlEscapeDateTime(previousDateModified)}`
                ],
                [
                    PREFIX.lpdcExt,
                    PREFIX.dct,
                    PREFIX.schema,
                ],
            );

            const archivedConceptSnapshot =
                aFullConceptSnapshot()
                    .withIsVersionOfConcept(isVersionOfConceptId)
                    .withIsArchived(true)
                    .withGeneratedAtTime(FormatPreservingDate.of('2023-12-11T00:00:00Z'))
                    .build();

            await conceptSnapshotRepository.save(archivedConceptSnapshot);

            await merger.merge(archivedConceptSnapshot.id);
            const reviewStatusForConceptInGraph = (be: Bestuurseenheid) => `           
                ${PREFIX.lpdcExt}
                ${PREFIX.dct}
                ${PREFIX.ext}
                SELECT ?reviewStatus WHERE {
                    GRAPH ${sparqlEscapeUri(be.userGraph())} {
                        ?instanceId a lpdcExt:InstancePublicService ;
                            dct:source ${sparqlEscapeUri(isVersionOfConceptId)} ;
                            ext:reviewStatus ?reviewStatus .
                    }
                }
            `;
            const reviewStatusResultForInstance = await directDatabaseAccess.list(reviewStatusForConceptInGraph(bestuurseenheid));
            expect(reviewStatusResultForInstance.length).toEqual(1);

            const reviewStatusForInstance = reviewStatusResultForInstance[0]['reviewStatus'].value;
            expect(reviewStatusForInstance).toEqual(NS.concepts.reviewStatus(InstanceReviewStatusType.CONCEPT_GEARCHIVEERD).value);

            const unarchivedConceptSnapshot =
                aFullConceptSnapshot()
                    .withIsVersionOfConcept(isVersionOfConceptId)
                    .withIsArchived(false)
                    .withGeneratedAtTime(FormatPreservingDate.of('2023-12-12T00:00:00Z'))
                    .build();

            await conceptSnapshotRepository.save(unarchivedConceptSnapshot);

            await merger.merge(unarchivedConceptSnapshot.id);

            const reviewStatusAndDateModifiedForConceptInGraphAfterUnarchive = (be: Bestuurseenheid) => `           
                ${PREFIX.lpdcExt}
                ${PREFIX.dct}
                ${PREFIX.ext}
                ${PREFIX.schema}
                
                SELECT ?reviewStatus ?dateModified WHERE {
                    GRAPH ${sparqlEscapeUri(be.userGraph())} {
                        ?instanceId a lpdcExt:InstancePublicService ;
                            dct:source ${sparqlEscapeUri(isVersionOfConceptId)} ;
                            ext:reviewStatus ?reviewStatus;
                            schema:dateModified ?dateModified .
                    }
                }
            `;
            const reviewStatusAndDateModifiedResultForInstanceAfterUnarchive = await directDatabaseAccess.list(reviewStatusAndDateModifiedForConceptInGraphAfterUnarchive(bestuurseenheid));
            expect(reviewStatusAndDateModifiedResultForInstanceAfterUnarchive.length).toEqual(1);

            const reviewStatusForInstanceAfterUnarchive = reviewStatusAndDateModifiedResultForInstanceAfterUnarchive[0]['reviewStatus'].value;
            expect(reviewStatusForInstanceAfterUnarchive).toEqual(NS.concepts.reviewStatus(InstanceReviewStatusType.CONCEPT_GEWIJZIGD).value);

            const dateModifiedForInstanceAfterUnarchive = reviewStatusAndDateModifiedResultForInstanceAfterUnarchive[0]['dateModified'].value;
            expect(dateModifiedForInstanceAfterUnarchive).toEqual(previousDateModified.toISOString());

        });

    });

    function suffixUnique(aLangString: LanguageString): LanguageString {
        return LanguageString.of(
            aLangString.nl + '-' + uuid(),
            aLangString.nlFormal + '-' + uuid(),
            aLangString.nlInformal + '-' + uuid(),
            aLangString.nlGeneratedFormal + '-' + uuid(),
            aLangString.nlGeneratedInformal + '-' + uuid());
    }


    async function insertAllConceptSchemeLinksToGoOverGraphBoundaryVerifyConceptSchemesOfEnums(conceptSnapshot: ConceptSnapshot) {
        const triples = [
            conceptSnapshot.type ? `<${NS.dvc.type(conceptSnapshot.type).value}> skos:inScheme <${NS.dvcs('Type').value}>` : undefined,
            conceptSnapshot.type ? `<${NS.dvc.type(conceptSnapshot.type).value}> a skos:Concept` : undefined,
            ...conceptSnapshot.targetAudiences
                .flatMap(v => [
                    `<${NS.dvc.doelgroep(v).value}> skos:inScheme <${NS.dvcs('Doelgroep').value}>`,
                    `<${NS.dvc.doelgroep(v).value}> a skos:Concept`]),
            ...conceptSnapshot.themes
                .flatMap(v => [
                    `<${NS.dvc.thema(v).value}> skos:inScheme <${NS.dvcs('Thema').value}>`,
                    `<${NS.dvc.thema(v).value}> a skos:Concept`]),
            ...conceptSnapshot.competentAuthorityLevels
                .flatMap(v => [
                    `<${NS.dvc.bevoegdBestuursniveau(v).value}> skos:inScheme <${NS.dvcs('BevoegdBestuursniveau').value}>`,
                    `<${NS.dvc.bevoegdBestuursniveau(v).value}> a skos:Concept`,
                ]),
            ...[...conceptSnapshot.competentAuthorities, ...conceptSnapshot.executingAuthorities]
                .flatMap(v => [
                    `<${v}> skos:inScheme <${NS.dvcs('IPDCOrganisaties').value}>`,
                    `<${v}> a besluit:Bestuurseenheid`,
                    `<${v}> a skos:Concept`]),
            ...conceptSnapshot.executingAuthorityLevels
                .flatMap(v =>
                    [`<${NS.dvc.uitvoerendBestuursniveau(v).value}> skos:inScheme <${NS.dvcs('UitvoerendBestuursniveau').value}>`,
                        `<${NS.dvc.uitvoerendBestuursniveau(v).value}> a skos:Concept`]),
            ...conceptSnapshot.publicationMedia
                .flatMap(v => [
                    `<${NS.dvc.publicatieKanaal(v).value}> skos:inScheme <${NS.dvcs('PublicatieKanaal').value}>`,
                    `<${NS.dvc.publicatieKanaal(v).value}> a skos:Concept`]),
            ...conceptSnapshot.yourEuropeCategories
                .flatMap(v => [
                    `<${NS.dvc.yourEuropeCategorie(v).value}> skos:inScheme <${NS.dvcs('YourEuropeCategorie').value}>`,
                    `<${NS.dvc.yourEuropeCategorie(v).value}> a skos:Concept`]),
            ...conceptSnapshot.conceptTags
                .flatMap(v => [
                    `<${NS.dvc.conceptTag(v).value}> skos:inScheme <${NS.dvcs('ConceptTag').value}>`,
                    `<${NS.dvc.conceptTag(v).value}> a skos:Concept`]),
        ].filter(t => t !== undefined);
        if (triples.length > 0) {
            await directDatabaseAccess.insertData(
                PUBLIC_GRAPH,
                triples,
                [
                    PREFIX.skos,
                    PREFIX.besluit
                ]
            );
        }
    }

});
