import {TEST_SPARQL_ENDPOINT} from "../../test.config";
import {ConceptSnapshotSparqlTestRepository} from "../../driven/persistence/concept-snapshot-sparql-test-repository";
import {
    NewConceptSnapshotToConceptMergerDomainService
} from "../../../src/core/domain/new-concept-snapshot-to-concept-merger-domain-service";
import {
    aFullConceptSnapshot,
    aMinimalConceptSnapshot,
    ConceptSnapshotTestBuilder
} from "./concept-snapshot-test-builder";
import {buildCodexVlaanderenIri, buildConceptIri} from "./iri-test-builder";
import {uuid} from "../../../mu-helper";
import {DirectDatabaseAccess} from "../../driven/persistence/direct-database-access";
import {CONCEPT_GRAPH, PREFIX} from "../../../config";
import {NS} from "../../../src/driven/persistence/namespaces";
import {ConceptSnapshot} from "../../../src/core/domain/concept-snapshot";
import {
    CompetentAuthorityLevelType,
    ConceptTagType,
    ExecutingAuthorityLevelType,
    ProductType,
    PublicationMediumType,
    SnapshotType,
    TargetAudienceType,
    ThemeType,
    YourEuropeCategoryType
} from "../../../src/core/domain/types";
import {FormatPreservingDate} from "../../../src/core/domain/format-preserving-date";
import {LanguageString} from "../../../src/core/domain/language-string";
import {BestuurseenheidTestBuilder} from "./bestuureenheid-test-builder";
import {aFullRequirement, anotherFullRequirement} from "./requirement-test-builder";
import {aFullEvidence, anotherFullEvidence} from "./evidence-test-builder";
import {aFullProcedure, anotherFullProcedure} from "./procedure-test-builder";
import {anotherFullWebsite} from "./website-test-builder";
import {aFullCost, anotherFullCost} from "./cost-test-builder";
import {aFullFinancialAdvantage, anotherFullFinancialAdvantage} from "./financial-advantage-test-builder";
import {ConceptSparqlRepository} from "../../../src/driven/persistence/concept-sparql-repository";

describe('merges a new concept snapshot into a concept', () => {

    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

    const conceptSnapshotRepository = new ConceptSnapshotSparqlTestRepository(TEST_SPARQL_ENDPOINT);
    const conceptRepository = new ConceptSparqlRepository(TEST_SPARQL_ENDPOINT);

    const directDatabaseAccess = new DirectDatabaseAccess(TEST_SPARQL_ENDPOINT);

    const merger = new NewConceptSnapshotToConceptMergerDomainService(conceptSnapshotRepository, conceptRepository, TEST_SPARQL_ENDPOINT);

    describe('create a new concept', () => {

        test('Creates a new concept from a concept snapshot', async () => {
            const isVersionOfConceptId = buildConceptIri(uuid());
            const conceptSnapshot =
                aFullConceptSnapshot()
                    .withIsVersionOfConcept(isVersionOfConceptId)
                    .build();
            await conceptSnapshotRepository.save(conceptSnapshot);

            insertAllConceptSchemeLinksToGoOverGraphBoundaryVerifyConceptSchemesOfEnums(conceptSnapshot);

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
                        _id: conceptSnapshot.requirements[0].id,
                        _uuid: expect.stringMatching(uuidRegex),
                        _title: conceptSnapshot.requirements[0].title,
                        _description: conceptSnapshot.requirements[0].description,
                        _evidence: expect.objectContaining({
                            _id: conceptSnapshot.requirements[0].evidence.id,
                            _uuid: expect.stringMatching(uuidRegex),
                            _title: conceptSnapshot.requirements[0].evidence.title,
                            _description: conceptSnapshot.requirements[0].evidence.description,
                        })
                    }),
                    expect.objectContaining({
                        _id: conceptSnapshot.requirements[1].id,
                        _uuid: expect.stringMatching(uuidRegex),
                        _title: conceptSnapshot.requirements[1].title,
                        _description: conceptSnapshot.requirements[1].description,
                        _evidence: expect.objectContaining({
                            _id: conceptSnapshot.requirements[1].evidence.id,
                            _uuid: expect.stringMatching(uuidRegex),
                            _title: conceptSnapshot.requirements[1].evidence.title,
                            _description: conceptSnapshot.requirements[1].evidence.description,
                        })
                    })
                ]));
            expect(createdConcept.procedures)
                .toEqual(expect.arrayContaining([
                    expect.objectContaining({
                        _id: conceptSnapshot.procedures[0].id,
                        _uuid: expect.stringMatching(uuidRegex),
                        _title: conceptSnapshot.procedures[0].title,
                        _description: conceptSnapshot.procedures[0].description,
                        _websites: expect.arrayContaining([
                            expect.objectContaining({
                                _id: conceptSnapshot.procedures[0].websites[0].id,
                                _uuid: expect.stringMatching(uuidRegex),
                                _title: conceptSnapshot.procedures[0].websites[0].title,
                                _description: conceptSnapshot.procedures[0].websites[0].description,
                                _url: conceptSnapshot.procedures[0].websites[0].url,
                            }),
                            expect.objectContaining({
                                _id: conceptSnapshot.procedures[0].websites[1].id,
                                _uuid: expect.stringMatching(uuidRegex),
                                _title: conceptSnapshot.procedures[0].websites[1].title,
                                _description: conceptSnapshot.procedures[0].websites[1].description,
                                _url: conceptSnapshot.procedures[0].websites[1].url,
                            })
                        ])
                    }),
                    expect.objectContaining({
                        _id: conceptSnapshot.procedures[1].id,
                        _uuid: expect.stringMatching(uuidRegex),
                        _title: conceptSnapshot.procedures[1].title,
                        _description: conceptSnapshot.procedures[1].description,
                        _websites: expect.arrayContaining([
                            expect.objectContaining({
                                _id: conceptSnapshot.procedures[1].websites[0].id,
                                _uuid: expect.stringMatching(uuidRegex),
                                _title: conceptSnapshot.procedures[1].websites[0].title,
                                _description: conceptSnapshot.procedures[1].websites[0].description,
                                _url: conceptSnapshot.procedures[1].websites[0].url,
                            }),
                            expect.objectContaining({
                                _id: conceptSnapshot.procedures[1].websites[1].id,
                                _uuid: expect.stringMatching(uuidRegex),
                                _title: conceptSnapshot.procedures[1].websites[1].title,
                                _description: conceptSnapshot.procedures[1].websites[1].description,
                                _url: conceptSnapshot.procedures[1].websites[1].url,
                            })
                        ])
                    })
                ]));

            expect(createdConcept.websites)
                .toEqual(expect.arrayContaining([
                    expect.objectContaining({
                        _id: conceptSnapshot.websites[0].id,
                        _uuid: expect.stringMatching(uuidRegex),
                        _title: conceptSnapshot.websites[0].title,
                        _description: conceptSnapshot.websites[0].description,
                        _url: conceptSnapshot.websites[0].url,
                    }),
                    expect.objectContaining({
                        _id: conceptSnapshot.websites[1].id,
                        _uuid: expect.stringMatching(uuidRegex),
                        _title: conceptSnapshot.websites[1].title,
                        _description: conceptSnapshot.websites[1].description,
                        _url: conceptSnapshot.websites[1].url,
                    })
                ]));

            expect(createdConcept.costs)
                .toEqual(expect.arrayContaining([
                    expect.objectContaining({
                        _id: conceptSnapshot.costs[0].id,
                        _uuid: expect.stringMatching(uuidRegex),
                        _title: conceptSnapshot.costs[0].title,
                        _description: conceptSnapshot.costs[0].description
                    }),
                    expect.objectContaining({
                        _id: conceptSnapshot.costs[1].id,
                        _uuid: expect.stringMatching(uuidRegex),
                        _title: conceptSnapshot.costs[1].title,
                        _description: conceptSnapshot.costs[1].description
                    })
                ]));
            expect(createdConcept.financialAdvantages)
                .toEqual(expect.arrayContaining([
                    expect.objectContaining({
                        _id: conceptSnapshot.financialAdvantages[0].id,
                        _uuid: expect.stringMatching(uuidRegex),
                        _title: conceptSnapshot.financialAdvantages[0].title,
                        _description: conceptSnapshot.financialAdvantages[0].description
                    }),
                    expect.objectContaining({
                        _id: conceptSnapshot.financialAdvantages[1].id,
                        _uuid: expect.stringMatching(uuidRegex),
                        _title: conceptSnapshot.financialAdvantages[1].title,
                        _description: conceptSnapshot.financialAdvantages[1].description
                    })
                ]));
            expect(createdConcept.productId).toEqual(conceptSnapshot.productId);
            expect(createdConcept.latestConceptSnapshot).toEqual(conceptSnapshot.id);
            expect(createdConcept.previousConceptSnapshots).toEqual(new Set());
            expect(createdConcept.latestFunctionallyChangedConceptSnapshot).toEqual(conceptSnapshot.id);
            expect(createdConcept.conceptTags).toEqual(conceptSnapshot.conceptTags);
            expect(createdConcept.isArchived).toBeFalsy();
            expect(createdConcept.legalResources).toEqual(conceptSnapshot.legalResources);
        });

        test('Creates a new concept from a concept snapshot with minimal data', async () => {
            const isVersionOfConceptId = buildConceptIri(uuid());
            const conceptSnapshot =
                aMinimalConceptSnapshot()
                    .withIsVersionOfConcept(isVersionOfConceptId)
                    .build();
            await conceptSnapshotRepository.save(conceptSnapshot);

            insertAllConceptSchemeLinksToGoOverGraphBoundaryVerifyConceptSchemesOfEnums(conceptSnapshot);

            await merger.merge(conceptSnapshot.id);

            const createdConcept = await conceptRepository.findById(isVersionOfConceptId);
            expect(createdConcept.id).toEqual(isVersionOfConceptId);
            expect(createdConcept.uuid).toMatch(uuidRegex);
            expect(createdConcept.title).toBeUndefined();
            expect(createdConcept.description).toBeUndefined();
            expect(createdConcept.additionalDescription).toBeUndefined();
            expect(createdConcept.exception).toBeUndefined();
            expect(createdConcept.regulation).toBeUndefined();
            expect(createdConcept.startDate).toBeUndefined();
            expect(createdConcept.endDate).toBeUndefined();
            expect(createdConcept.type).toBeUndefined();
            expect(createdConcept.targetAudiences).toEqual(new Set());
            expect(createdConcept.themes).toEqual(new Set());
            expect(createdConcept.competentAuthorityLevels).toEqual(new Set());
            expect(createdConcept.competentAuthorities).toEqual(new Set());
            expect(createdConcept.executingAuthorityLevels).toEqual(new Set());
            expect(createdConcept.executingAuthorities).toEqual(new Set());
            expect(createdConcept.publicationMedia).toEqual(new Set());
            expect(createdConcept.yourEuropeCategories).toEqual(new Set());
            expect(createdConcept.keywords).toEqual(new Set());
            expect(createdConcept.requirements).toEqual([]);
            expect(createdConcept.procedures).toEqual([]);
            expect(createdConcept.websites).toEqual([]);
            expect(createdConcept.costs).toEqual([]);
            expect(createdConcept.financialAdvantages).toEqual([]);
            expect(createdConcept.productId).toBeUndefined();
            expect(createdConcept.latestConceptSnapshot).toEqual(conceptSnapshot.id);
            expect(createdConcept.previousConceptSnapshots).toEqual(new Set());
            expect(createdConcept.latestFunctionallyChangedConceptSnapshot).toEqual(conceptSnapshot.id);
            expect(createdConcept.conceptTags).toEqual(new Set());
            expect(createdConcept.isArchived).toBeFalsy();
            expect(createdConcept.legalResources).toEqual(new Set());
        });

        test('Creates a new concept from a concept snapshot that is archived', async () => {
            const isVersionOfConceptId = buildConceptIri(uuid());
            const conceptSnapshot =
                aMinimalConceptSnapshot()
                    .withIsVersionOfConcept(isVersionOfConceptId)
                    .withSnapshotType(SnapshotType.DELETE)
                    .build();
            await conceptSnapshotRepository.save(conceptSnapshot);

            insertAllConceptSchemeLinksToGoOverGraphBoundaryVerifyConceptSchemesOfEnums(conceptSnapshot);

            await merger.merge(conceptSnapshot.id);

            const createdConcept = await conceptRepository.findById(isVersionOfConceptId);
            expect(createdConcept.id).toEqual(isVersionOfConceptId);
            expect(createdConcept.uuid).toMatch(uuidRegex);
            expect(createdConcept.isArchived).toBeTruthy();
        });

    });

    describe('updates a concept', () => {

        //TODO LPDC-916: when previousVersions is fixed, add tests that mimic more concept versions (combined with newer, not newer, not functionally changed, functinoally changed, etc)

        test('Updates a concept with all new data of a new version of a concept snapshot', async () => {
            const isVersionOfConceptId = buildConceptIri(uuid());
            const conceptSnapshot =
                aFullConceptSnapshot()
                    .withIsVersionOfConcept(isVersionOfConceptId)
                    .withStartDate(FormatPreservingDate.of('2019-07-13T00:00:00'))
                    .withEndDate(FormatPreservingDate.of('2023-12-03T00:00:00'))
                    .withType(ProductType.ADVIESBEGELEIDING)
                    .withTargetAudiences(new Set([TargetAudienceType.BURGER, TargetAudienceType.VLAAMSEOVERHEID, TargetAudienceType.ORGANISATIE]))
                    .withThemes(new Set([ThemeType.CULTUURSPORTVRIJETIJD, ThemeType.MOBILITEITOPENBAREWERKEN, ThemeType.WELZIJNGEZONDHEID]))
                    .withCompetentAuthorityLevels(new Set([CompetentAuthorityLevelType.LOKAAL, CompetentAuthorityLevelType.PROVINCIAAL, CompetentAuthorityLevelType.EUROPEES]))
                    .withCompetentAuthorities(new Set([BestuurseenheidTestBuilder.PEPINGEN_IRI, BestuurseenheidTestBuilder.HOUTHALEN_HELCHTEREN_IRI, BestuurseenheidTestBuilder.BORGLOON_IRI]))
                    .withExecutingAuthorityLevels(new Set([ExecutingAuthorityLevelType.LOKAAL, ExecutingAuthorityLevelType.PROVINCIAAL, ExecutingAuthorityLevelType.DERDEN]))
                    .withExecutingAuthorities(new Set([BestuurseenheidTestBuilder.PEPINGEN_IRI, BestuurseenheidTestBuilder.OUD_HEVERLEE_IRI, BestuurseenheidTestBuilder.ASSENEDE_IRI]))
                    .withPublicationMedia(new Set([PublicationMediumType.YOUREUROPE]))
                    .withYourEuropeCategories(new Set([YourEuropeCategoryType.BEDRIJFINSOLVENTIELIQUIDATIE, YourEuropeCategoryType.PROCEDUREPENSIONERING, YourEuropeCategoryType.GOEDERENRECYCLAGE]))
                    .withKeywords(new Set([LanguageString.of('buitenland'), LanguageString.of(undefined, 'buitenland'), LanguageString.of(undefined, 'ambulante activiteit'), LanguageString.of('levensloos')]))
                    .withGeneratedAtTime(FormatPreservingDate.of('2023-12-10T00:00:00'))
                    .withConceptTags(new Set([ConceptTagType.YOUREUROPEVERPLICHT]))
                    .withLegalResources(new Set([buildCodexVlaanderenIri(uuid()), buildCodexVlaanderenIri(uuid()), buildCodexVlaanderenIri(uuid())]))
                    .build();
            await conceptSnapshotRepository.save(conceptSnapshot);

            insertAllConceptSchemeLinksToGoOverGraphBoundaryVerifyConceptSchemesOfEnums(conceptSnapshot);

            await merger.merge(conceptSnapshot.id);

            const updatedConceptSnapshot =
                aMinimalConceptSnapshot()
                    .withIsVersionOfConcept(isVersionOfConceptId)
                    .withTitle(suffixUnique(conceptSnapshot.title))
                    .withDescription(suffixUnique(conceptSnapshot.description))
                    .withAdditionalDescription(suffixUnique(conceptSnapshot.additionalDescription))
                    .withException(suffixUnique(conceptSnapshot.exception))
                    .withRegulation(suffixUnique(conceptSnapshot.regulation))
                    .withStartDate(FormatPreservingDate.of('2024-01-06T00:00:00'))
                    .withEndDate(FormatPreservingDate.of('2025-04-17T00:00:00'))
                    .withType(ProductType.FINANCIEELVOORDEEL)
                    .withTargetAudiences(new Set([TargetAudienceType.ONDERNEMING, TargetAudienceType.VERENIGING]))
                    .withThemes(new Set([ThemeType.BOUWENWONEN, ThemeType.ONDERWIJSWETENSCHAP, ThemeType.MILIEUENERGIE]))
                    .withCompetentAuthorityLevels(new Set([CompetentAuthorityLevelType.FEDERAAL, CompetentAuthorityLevelType.VLAAMS]))
                    .withCompetentAuthorities(new Set([BestuurseenheidTestBuilder.ASSENEDE_IRI, BestuurseenheidTestBuilder.OUD_HEVERLEE_IRI]))
                    .withExecutingAuthorityLevels(new Set([ExecutingAuthorityLevelType.VLAAMS, ExecutingAuthorityLevelType.FEDERAAL, ExecutingAuthorityLevelType.EUROPEES]))
                    .withExecutingAuthorities(new Set([BestuurseenheidTestBuilder.BORGLOON_IRI, BestuurseenheidTestBuilder.ASSENEDE_IRI, BestuurseenheidTestBuilder.HOUTHALEN_HELCHTEREN_IRI]))
                    .withPublicationMedia(new Set([PublicationMediumType.RECHTENVERKENNER]))
                    .withYourEuropeCategories(new Set([YourEuropeCategoryType.CONSUMENTENRECHTEN, YourEuropeCategoryType.PROCEDURESTARTENEXPLOITERENSLUITENBEDRIJFKENNISGEVING, YourEuropeCategoryType.BURGERENFAMILIERECHTEN]))
                    .withKeywords(new Set([LanguageString.of('groenvoorziening'), LanguageString.of(undefined, 'green'), LanguageString.of(undefined, 'huis en tuin verwerking')]))
                    .withRequirements([
                        anotherFullRequirement()
                            .withTitle(suffixUnique(conceptSnapshot.requirements[1].title))
                            .withDescription(suffixUnique(conceptSnapshot.requirements[1].description))
                            .withEvidence(
                                aFullEvidence()
                                    .withTitle(suffixUnique(conceptSnapshot.requirements[1].evidence.title))
                                    .withDescription(suffixUnique(conceptSnapshot.requirements[1].evidence.description))
                                    .build())
                            .build(),
                        aFullRequirement()
                            .withTitle(suffixUnique(conceptSnapshot.requirements[0].title))
                            .withDescription(suffixUnique(conceptSnapshot.requirements[0].description))
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
                            .withWebsites([anotherFullWebsite(uuid()).build(), anotherFullWebsite(uuid()).build(), anotherFullWebsite(uuid()).build()])
                            .build(),
                        aFullProcedure()
                            .withTitle(suffixUnique(conceptSnapshot.procedures[0].title))
                            .withDescription(suffixUnique(conceptSnapshot.procedures[0].description))
                            .withWebsites([anotherFullWebsite(uuid()).build(), anotherFullWebsite(uuid()).build()])
                            .build()])
                    .withWebsites([anotherFullWebsite(uuid()).build(), anotherFullWebsite(uuid()).build()])
                    .withCosts([
                        anotherFullCost()
                            .withTitle(suffixUnique(conceptSnapshot.costs[1].title))
                            .withDescription(suffixUnique(conceptSnapshot.costs[1].description))
                            .build(),
                        aFullCost()
                            .withTitle(suffixUnique(conceptSnapshot.costs[0].title))
                            .withDescription(suffixUnique(conceptSnapshot.costs[0].description))
                            .build()])
                    .withFinancialAdvantages(
                        [
                            anotherFullFinancialAdvantage()
                                .withTitle(suffixUnique(conceptSnapshot.financialAdvantages[1].title))
                                .withDescription(suffixUnique(conceptSnapshot.financialAdvantages[1].description))
                                .build(),
                            aFullFinancialAdvantage()
                                .withTitle(suffixUnique(conceptSnapshot.financialAdvantages[0].title))
                                .withDescription(suffixUnique(conceptSnapshot.financialAdvantages[0].description))
                                .build()
                        ])
                    .withProductId(conceptSnapshot.productId + uuid())
                    .withGeneratedAtTime(FormatPreservingDate.of('2023-12-11T00:00:00'))
                    .withConceptTags(new Set([ConceptTagType.YOUREUROPEAANBEVOLEN]))
                    .withLegalResources(new Set([buildCodexVlaanderenIri(uuid()), buildCodexVlaanderenIri(uuid()), buildCodexVlaanderenIri(uuid())]))
                    .build();

            insertAllConceptSchemeLinksToGoOverGraphBoundaryVerifyConceptSchemesOfEnums(updatedConceptSnapshot);

            await conceptSnapshotRepository.save(updatedConceptSnapshot);

            await merger.merge(updatedConceptSnapshot.id);

            const updatedConcept = await conceptRepository.findById(isVersionOfConceptId);
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
                        _id: updatedConceptSnapshot.requirements[0].id,
                        _uuid: expect.stringMatching(uuidRegex),
                        _title: updatedConceptSnapshot.requirements[0].title,
                        _description: updatedConceptSnapshot.requirements[0].description,
                        _evidence: expect.objectContaining({
                            _id: updatedConceptSnapshot.requirements[0].evidence.id,
                            _uuid: expect.stringMatching(uuidRegex),
                            _title: updatedConceptSnapshot.requirements[0].evidence.title,
                            _description: updatedConceptSnapshot.requirements[0].evidence.description,
                        })
                    }),
                    expect.objectContaining({
                        _id: updatedConceptSnapshot.requirements[1].id,
                        _uuid: expect.stringMatching(uuidRegex),
                        _title: updatedConceptSnapshot.requirements[1].title,
                        _description: updatedConceptSnapshot.requirements[1].description,
                        _evidence: expect.objectContaining({
                            _id: updatedConceptSnapshot.requirements[1].evidence.id,
                            _uuid: expect.stringMatching(uuidRegex),
                            _title: updatedConceptSnapshot.requirements[1].evidence.title,
                            _description: updatedConceptSnapshot.requirements[1].evidence.description,
                        })
                    })
                ]));

            expect(updatedConcept.procedures)
                .toEqual(expect.arrayContaining([
                    expect.objectContaining({
                        _id: updatedConceptSnapshot.procedures[0].id,
                        _uuid: expect.stringMatching(uuidRegex),
                        _title: updatedConceptSnapshot.procedures[0].title,
                        _description: updatedConceptSnapshot.procedures[0].description,
                        _websites: expect.arrayContaining([
                            expect.objectContaining({
                                _id: updatedConceptSnapshot.procedures[0].websites[0].id,
                                _uuid: expect.stringMatching(uuidRegex),
                                _title: updatedConceptSnapshot.procedures[0].websites[0].title,
                                _description: updatedConceptSnapshot.procedures[0].websites[0].description,
                                _url: updatedConceptSnapshot.procedures[0].websites[0].url,
                            }),
                            expect.objectContaining({
                                _id: updatedConceptSnapshot.procedures[0].websites[1].id,
                                _uuid: expect.stringMatching(uuidRegex),
                                _title: updatedConceptSnapshot.procedures[0].websites[1].title,
                                _description: updatedConceptSnapshot.procedures[0].websites[1].description,
                                _url: updatedConceptSnapshot.procedures[0].websites[1].url,
                            }),
                            expect.objectContaining({
                                _id: updatedConceptSnapshot.procedures[0].websites[2].id,
                                _uuid: expect.stringMatching(uuidRegex),
                                _title: updatedConceptSnapshot.procedures[0].websites[2].title,
                                _description: updatedConceptSnapshot.procedures[0].websites[2].description,
                                _url: updatedConceptSnapshot.procedures[0].websites[2].url,
                            })
                        ])
                    }),
                    expect.objectContaining({
                        _id: updatedConceptSnapshot.procedures[1].id,
                        _uuid: expect.stringMatching(uuidRegex),
                        _title: updatedConceptSnapshot.procedures[1].title,
                        _description: updatedConceptSnapshot.procedures[1].description,
                        _websites: expect.arrayContaining([
                            expect.objectContaining({
                                _id: updatedConceptSnapshot.procedures[1].websites[0].id,
                                _uuid: expect.stringMatching(uuidRegex),
                                _title: updatedConceptSnapshot.procedures[1].websites[0].title,
                                _description: updatedConceptSnapshot.procedures[1].websites[0].description,
                                _url: updatedConceptSnapshot.procedures[1].websites[0].url,
                            }),
                            expect.objectContaining({
                                _id: updatedConceptSnapshot.procedures[1].websites[1].id,
                                _uuid: expect.stringMatching(uuidRegex),
                                _title: updatedConceptSnapshot.procedures[1].websites[1].title,
                                _description: updatedConceptSnapshot.procedures[1].websites[1].description,
                                _url: updatedConceptSnapshot.procedures[1].websites[1].url,
                            })
                        ])
                    })
                ]));

            expect(updatedConcept.websites)
                .toEqual(expect.arrayContaining([
                    expect.objectContaining({
                        _id: updatedConceptSnapshot.websites[0].id,
                        _uuid: expect.stringMatching(uuidRegex),
                        _title: updatedConceptSnapshot.websites[0].title,
                        _description: updatedConceptSnapshot.websites[0].description,
                        _url: updatedConceptSnapshot.websites[0].url,
                    }),
                    expect.objectContaining({
                        _id: updatedConceptSnapshot.websites[1].id,
                        _uuid: expect.stringMatching(uuidRegex),
                        _title: updatedConceptSnapshot.websites[1].title,
                        _description: updatedConceptSnapshot.websites[1].description,
                        _url: updatedConceptSnapshot.websites[1].url,
                    })
                ]));

            expect(updatedConcept.costs)
                .toEqual(expect.arrayContaining([
                    expect.objectContaining({
                        _id: updatedConceptSnapshot.costs[0].id,
                        _uuid: expect.stringMatching(uuidRegex),
                        _title: updatedConceptSnapshot.costs[0].title,
                        _description: updatedConceptSnapshot.costs[0].description
                    }),
                    expect.objectContaining({
                        _id: updatedConceptSnapshot.costs[1].id,
                        _uuid: expect.stringMatching(uuidRegex),
                        _title: updatedConceptSnapshot.costs[1].title,
                        _description: updatedConceptSnapshot.costs[1].description
                    })
                ]));

            expect(updatedConcept.financialAdvantages)
                .toEqual(expect.arrayContaining([
                    expect.objectContaining({
                        _id: updatedConceptSnapshot.financialAdvantages[0].id,
                        _uuid: expect.stringMatching(uuidRegex),
                        _title: updatedConceptSnapshot.financialAdvantages[0].title,
                        _description: updatedConceptSnapshot.financialAdvantages[0].description
                    }),
                    expect.objectContaining({
                        _id: updatedConceptSnapshot.financialAdvantages[1].id,
                        _uuid: expect.stringMatching(uuidRegex),
                        _title: updatedConceptSnapshot.financialAdvantages[1].title,
                        _description: updatedConceptSnapshot.financialAdvantages[1].description
                    })
                ]));

            expect(updatedConcept.productId).toEqual(updatedConceptSnapshot.productId);
            expect(updatedConcept.latestConceptSnapshot).toEqual(updatedConceptSnapshot.id);
            //TODO LPDC-916: fails ?
            //expect(updatedConcept.previousConceptSnapshots).toEqual(new Set(conceptSnapshot.id));
            expect(updatedConcept.latestFunctionallyChangedConceptSnapshot).toEqual(updatedConceptSnapshot.id);
            expect(updatedConcept.conceptTags).toEqual(updatedConceptSnapshot.conceptTags);
            expect(updatedConcept.legalResources).toEqual(updatedConceptSnapshot.legalResources);
        }, 10000); //TODO LPDC-916: why is this test so slow?

        test('Updates a concept with minimal new data of a new version of a concept snapshot', async () => {
            const isVersionOfConceptId = buildConceptIri(uuid());
            const conceptSnapshot =
                aFullConceptSnapshot()
                    .withIsVersionOfConcept(isVersionOfConceptId)
                    .withGeneratedAtTime(FormatPreservingDate.of('2023-12-10T00:00:00'))
                    .build();
            await conceptSnapshotRepository.save(conceptSnapshot);

            insertAllConceptSchemeLinksToGoOverGraphBoundaryVerifyConceptSchemesOfEnums(conceptSnapshot);

            await merger.merge(conceptSnapshot.id);

            const updatedConceptSnapshot =
                aMinimalConceptSnapshot()
                    .withIsVersionOfConcept(isVersionOfConceptId)
                    .withGeneratedAtTime(FormatPreservingDate.of('2023-12-11T00:00:00'))
                    .build();

            insertAllConceptSchemeLinksToGoOverGraphBoundaryVerifyConceptSchemesOfEnums(updatedConceptSnapshot);

            await conceptSnapshotRepository.save(updatedConceptSnapshot);

            await merger.merge(updatedConceptSnapshot.id);

            const updatedConcept = await conceptRepository.findById(isVersionOfConceptId);
            expect(updatedConcept.id).toEqual(isVersionOfConceptId);
            expect(updatedConcept.uuid).toMatch(uuidRegex);
            expect(updatedConcept.title).toBeUndefined();
            expect(updatedConcept.description).toBeUndefined();
            expect(updatedConcept.additionalDescription).toBeUndefined();
            expect(updatedConcept.exception).toBeUndefined();
            expect(updatedConcept.regulation).toBeUndefined();
            expect(updatedConcept.startDate).toBeUndefined();
            expect(updatedConcept.endDate).toBeUndefined();
            expect(updatedConcept.type).toBeUndefined();
            expect(updatedConcept.targetAudiences).toEqual(new Set());
            expect(updatedConcept.themes).toEqual(new Set());
            expect(updatedConcept.competentAuthorityLevels).toEqual(new Set());
            expect(updatedConcept.competentAuthorities).toEqual(new Set());
            expect(updatedConcept.executingAuthorityLevels).toEqual(new Set());
            expect(updatedConcept.executingAuthorities).toEqual(new Set());
            expect(updatedConcept.publicationMedia).toEqual(new Set());
            expect(updatedConcept.yourEuropeCategories).toEqual(new Set());
            expect(updatedConcept.keywords).toEqual(new Set());
            expect(updatedConcept.requirements).toEqual([]);
            expect(updatedConcept.procedures).toEqual([]);
            expect(updatedConcept.websites).toEqual([]);
            expect(updatedConcept.costs).toEqual([]);
            expect(updatedConcept.financialAdvantages).toEqual([]);
            expect(updatedConcept.productId).toBeUndefined();
            expect(updatedConcept.latestConceptSnapshot).toEqual(updatedConceptSnapshot.id);
            //TODO LPDC-916: fails ?
            //expect(updatedConcept.previousConceptSnapshots).toEqual(new Set(conceptSnapshot.id));
            expect(updatedConcept.latestFunctionallyChangedConceptSnapshot).toEqual(updatedConceptSnapshot.id);
            expect(updatedConcept.conceptTags).toEqual(new Set());
            expect(updatedConcept.isArchived).toBeFalsy();
            expect(updatedConcept.legalResources).toEqual(new Set());
        }, 10000);  //TODO LPDC-916: why is this test so slow?

        test('Does not update a latestFunctionallyChangedConceptSnapshot link when new version is not functionally changed', async () => {
            const isVersionOfConceptId = buildConceptIri(uuid());
            const conceptSnapshot =
                aMinimalConceptSnapshot()
                    .withIsVersionOfConcept(isVersionOfConceptId)
                    .withGeneratedAtTime(FormatPreservingDate.of('2023-12-10T00:00:00'))
                    .build();
            await conceptSnapshotRepository.save(conceptSnapshot);

            insertAllConceptSchemeLinksToGoOverGraphBoundaryVerifyConceptSchemesOfEnums(conceptSnapshot);

            await merger.merge(conceptSnapshot.id);

            const updatedConceptSnapshot =
                aMinimalConceptSnapshot()
                    .withIsVersionOfConcept(isVersionOfConceptId)
                    .withGeneratedAtTime(FormatPreservingDate.of('2023-12-11T00:00:00'))
                    .build();

            insertAllConceptSchemeLinksToGoOverGraphBoundaryVerifyConceptSchemesOfEnums(updatedConceptSnapshot);

            await conceptSnapshotRepository.save(updatedConceptSnapshot);

            await merger.merge(updatedConceptSnapshot.id);

            const updatedConcept = await conceptRepository.findById(isVersionOfConceptId);
            expect(updatedConcept.latestConceptSnapshot).toEqual(updatedConceptSnapshot.id);
            //TODO LPDC-916: fails ?
            //expect(updatedConcept.previousConceptSnapshots).toEqual(new Set(conceptSnapshot.id));
            expect(updatedConcept.latestFunctionallyChangedConceptSnapshot).toEqual(conceptSnapshot.id);
        });

        test('Does not update a concept when same version is merged again', async () => {
            const isVersionOfConceptId = buildConceptIri(uuid());
            const conceptSnapshot =
                aMinimalConceptSnapshot()
                    .withIsVersionOfConcept(isVersionOfConceptId)
                    .withGeneratedAtTime(FormatPreservingDate.of('2023-12-10T00:00:00'))
                    .build();
            await conceptSnapshotRepository.save(conceptSnapshot);

            insertAllConceptSchemeLinksToGoOverGraphBoundaryVerifyConceptSchemesOfEnums(conceptSnapshot);

            await merger.merge(conceptSnapshot.id);

            await merger.merge(conceptSnapshot.id);

            const updatedConcept = await conceptRepository.findById(isVersionOfConceptId);
            expect(updatedConcept.latestConceptSnapshot).toEqual(conceptSnapshot.id);
            expect(updatedConcept.previousConceptSnapshots).toEqual(new Set());
            expect(updatedConcept.latestFunctionallyChangedConceptSnapshot).toEqual(conceptSnapshot.id);
        });

        test('Does not update a concept when newer version already processed functionally changed', async () => {
            const isVersionOfConceptId = buildConceptIri(uuid());
            const conceptSnapshot =
                aMinimalConceptSnapshot()
                    .withTitle(
                        LanguageString.of(
                            ConceptSnapshotTestBuilder.TITLE_EN,
                            ConceptSnapshotTestBuilder.TITLE_NL,
                            ConceptSnapshotTestBuilder.TITLE_NL_FORMAL,
                            ConceptSnapshotTestBuilder.TITLE_NL_INFORMAL,
                            ConceptSnapshotTestBuilder.TITLE_NL_GENERATED_FORMAL,
                            ConceptSnapshotTestBuilder.TITLE_NL_GENERATED_INFORMAL))
                    .withIsVersionOfConcept(isVersionOfConceptId)
                    .withGeneratedAtTime(FormatPreservingDate.of('2023-12-11T00:00:00'))
                    .build();
            await conceptSnapshotRepository.save(conceptSnapshot);

            insertAllConceptSchemeLinksToGoOverGraphBoundaryVerifyConceptSchemesOfEnums(conceptSnapshot);

            await merger.merge(conceptSnapshot.id);

            const updatedConceptSnapshot =
                aMinimalConceptSnapshot()
                    .withTitle(suffixUnique(conceptSnapshot.title))
                    .withIsVersionOfConcept(isVersionOfConceptId)
                    .withGeneratedAtTime(FormatPreservingDate.of('2023-12-10T00:00:00'))
                    .build();

            insertAllConceptSchemeLinksToGoOverGraphBoundaryVerifyConceptSchemesOfEnums(updatedConceptSnapshot);

            await conceptSnapshotRepository.save(updatedConceptSnapshot);

            await merger.merge(updatedConceptSnapshot.id);

            const updatedConcept = await conceptRepository.findById(isVersionOfConceptId);
            expect(updatedConcept.title).toEqual(conceptSnapshot.title);
            expect(updatedConcept.latestConceptSnapshot).toEqual(conceptSnapshot.id);
            //TODO LPDC-916: fails ?
            //expect(updatedConcept.previousConceptSnapshots).toEqual(new Set(conceptSnapshot.id));
            expect(updatedConcept.latestFunctionallyChangedConceptSnapshot).toEqual(conceptSnapshot.id);
        });

        test('Updates a concept from a concept snapshot that is archived', async () => {
            const isVersionOfConceptId = buildConceptIri(uuid());
            const conceptSnapshot =
                aMinimalConceptSnapshot()
                    .withIsVersionOfConcept(isVersionOfConceptId)
                    .withGeneratedAtTime(FormatPreservingDate.of('2023-12-10T00:00:00'))
                    .build();
            await conceptSnapshotRepository.save(conceptSnapshot);

            insertAllConceptSchemeLinksToGoOverGraphBoundaryVerifyConceptSchemesOfEnums(conceptSnapshot);

            await merger.merge(conceptSnapshot.id);

            const updatedConceptSnapshot =
                aMinimalConceptSnapshot()
                    .withIsVersionOfConcept(isVersionOfConceptId)
                    .withGeneratedAtTime(FormatPreservingDate.of('2023-12-11T00:00:00'))
                    .withSnapshotType(SnapshotType.DELETE)
                    .build();

            insertAllConceptSchemeLinksToGoOverGraphBoundaryVerifyConceptSchemesOfEnums(updatedConceptSnapshot);

            await conceptSnapshotRepository.save(updatedConceptSnapshot);

            await merger.merge(updatedConceptSnapshot.id);

            const updatedConcept = await conceptRepository.findById(isVersionOfConceptId);
            expect(updatedConcept.isArchived).toBeTruthy();
        });

    });

    function suffixUnique(aLangString: LanguageString): LanguageString {
        return LanguageString.of(
            aLangString.en + uuid(),
            aLangString.nl + uuid(),
            aLangString.nlFormal + uuid(),
            aLangString.nlInformal + uuid(),
            aLangString.nlGeneratedFormal + uuid(),
            aLangString.nlGeneratedInformal + uuid());
    }


    function insertAllConceptSchemeLinksToGoOverGraphBoundaryVerifyConceptSchemesOfEnums(conceptSnapshot: ConceptSnapshot) {
        const triples = [
            conceptSnapshot.type ? `<${NS.concept.type(conceptSnapshot.type).value}> skos:inScheme <${NS.conceptscheme('Type').value}>` : undefined,
            ...Array.from(conceptSnapshot.targetAudiences)
                .map(v => `<${NS.concept.doelgroep(v).value}> skos:inScheme <${NS.conceptscheme('Doelgroep').value}>`),
            ...Array.from(conceptSnapshot.themes)
                .map(v => `<${NS.concept.thema(v).value}> skos:inScheme <${NS.conceptscheme('Thema').value}>`),
            ...Array.from(conceptSnapshot.competentAuthorityLevels)
                .map(v => `<${NS.concept.bevoegdBestuursniveau(v).value}> skos:inScheme <${NS.conceptscheme('BevoegdBestuursniveau').value}>`),
            ...Array.from([...conceptSnapshot.competentAuthorities, ...conceptSnapshot.executingAuthorities])
                .map(v => `<${v}> skos:inScheme <${NS.conceptscheme('IPDCOrganisaties').value}>`),
            ...Array.from(conceptSnapshot.executingAuthorityLevels)
                .map(v => `<${NS.concept.uitvoerendBestuursniveau(v).value}> skos:inScheme <${NS.conceptscheme('UitvoerendBestuursniveau').value}>`),
            ...Array.from(conceptSnapshot.publicationMedia)
                .map(v => `<${NS.concept.publicatieKanaal(v).value}> skos:inScheme <${NS.conceptscheme('PublicatieKanaal').value}>`),
            ...Array.from(conceptSnapshot.yourEuropeCategories)
                .map(v => `<${NS.concept.yourEuropeCategorie(v).value}> skos:inScheme <${NS.conceptscheme('YourEuropeCategorie').value}>`),
            ...Array.from(conceptSnapshot.conceptTags)
                .map(v => `<${NS.concept.conceptTag(v).value}> skos:inScheme <${NS.conceptscheme('ConceptTag').value}>`),
        ].filter(t => t !== undefined);
        if (triples.length > 0) {
            directDatabaseAccess.insertData(
                CONCEPT_GRAPH,
                triples,
                [
                    PREFIX.skos,
                ]
            );
        }
    }

});