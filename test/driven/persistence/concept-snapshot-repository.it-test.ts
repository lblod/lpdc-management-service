import {TEST_SPARQL_ENDPOINT} from "../../test.config";
import {DirectDatabaseAccess} from "./direct-database-access";
import {uuid} from "../../../mu-helper";
import {
    aFullConceptSnapshot,
    aMinimalConceptSnapshot,
    ConceptSnapshotTestBuilder
} from "../../core/domain/concept-snapshot-test-builder";
import {ConceptSnapshotSparqlTestRepository} from "./concept-snapshot-sparql-test-repository";
import {
    aMinimalRequirementForConceptSnapshot,
    anotherFullRequirement,
    RequirementTestBuilder
} from "../../core/domain/requirement-test-builder";
import {aMinimalEvidenceForConceptSnapshot, EvidenceTestBuilder} from "../../core/domain/evidence-test-builder";
import {
    aMinimalProcedureForConceptSnapshot,
    anotherFullProcedure,
    ProcedureTestBuilder
} from "../../core/domain/procedure-test-builder";
import {
    aMinimalWebsiteForConceptSnapshot,
    anotherFullWebsite,
    WebsiteTestBuilder
} from "../../core/domain/website-test-builder";
import {
    CompetentAuthorityLevelType,
    ConceptTagType,
    ExecutingAuthorityLevelType,
    ProductType,
    PublicationMediumType,
    TargetAudienceType,
    ThemeType,
    YourEuropeCategoryType
} from "../../../src/core/domain/types";
import {buildConceptSnapshotIri} from "../../core/domain/iri-test-builder";
import {NS} from "../../../src/driven/persistence/namespaces";
import {aMinimalLanguageString} from "../../core/domain/language-string-test-builder";
import {Iri} from "../../../src/core/domain/shared/iri";
import {LanguageString} from "../../../src/core/domain/language-string";
import {CONCEPT_SNAPSHOT_LDES_GRAPH} from "../../../config";
import {EvidenceBuilder} from "../../../src/core/domain/evidence";
import {RequirementBuilder} from "../../../src/core/domain/requirement";
import {ProcedureBuilder} from "../../../src/core/domain/procedure";
import {WebsiteBuilder} from "../../../src/core/domain/website";
import {InvariantError, NotFoundError, SystemError} from "../../../src/core/domain/shared/lpdc-error";
import {anotherFullCost} from "../../core/domain/cost-test-builder";
import {CostBuilder} from "../../../src/core/domain/cost";
import {anotherFullFinancialAdvantage} from "../../core/domain/financial-advantage-test-builder";
import {FinancialAdvantageBuilder} from "../../../src/core/domain/financial-advantage";

describe('ConceptSnapshotRepository', () => {
    const repository = new ConceptSnapshotSparqlTestRepository(TEST_SPARQL_ENDPOINT);
    const directDatabaseAccess = new DirectDatabaseAccess(TEST_SPARQL_ENDPOINT);

    describe('findById', () => {

        test('When full concept snapshot exists with id, then return concept snapshot', async () => {
            const conceptSnapshot = aFullConceptSnapshot().build();
            await repository.save(conceptSnapshot);

            const anotherConceptSnapshot = aFullConceptSnapshot().build();
            await repository.save(anotherConceptSnapshot);

            const actualConceptSnapshot = await repository.findById(conceptSnapshot.id);

            expect(actualConceptSnapshot).toEqual(conceptSnapshot);
        });

        test('When minimal concept snapshot exists with id, then return concept snapshot', async () => {
            const conceptSnapshot = aMinimalConceptSnapshot().build();
            await repository.save(conceptSnapshot);

            const anotherConceptSnapshot = aMinimalConceptSnapshot().build();
            await repository.save(anotherConceptSnapshot);

            const actualConceptSnapshot = await repository.findById(conceptSnapshot.id);

            expect(actualConceptSnapshot).toEqual(conceptSnapshot);
        });

        test('When minimal concept snapshot with incomplete title exists with id, then return concept snapshot', async () => {
            const conceptSnapshot = aMinimalConceptSnapshot().withTitle(LanguageString.of(ConceptSnapshotTestBuilder.TITLE_NL)).build();
            await repository.save(conceptSnapshot);

            const anotherConceptSnapshot = aMinimalConceptSnapshot().build();
            await repository.save(anotherConceptSnapshot);

            const actualConceptSnapshot = await repository.findById(conceptSnapshot.id);

            expect(actualConceptSnapshot).toEqual(conceptSnapshot);
        });

        test('When concept snapshot does not exist with id, then throw error', async () => {
            const conceptSnapshot = aFullConceptSnapshot().build();
            await repository.save(conceptSnapshot);

            const nonExistentConceptSnapshotId = buildConceptSnapshotIri('thisiddoesnotexist');

            await expect(repository.findById(nonExistentConceptSnapshotId)).rejects.toThrowWithMessage(NotFoundError, `Kan <https://ipdc.tni-vlaanderen.be/id/conceptsnapshot/thisiddoesnotexist> niet vinden voor type <https://productencatalogus.data.vlaanderen.be/ns/ipdc-lpdc#ConceptualPublicServiceSnapshot> in graph <http://mu.semte.ch/graphs/lpdc/conceptsnapshots-ldes-data/ipdc>`);
        });
    });

    describe('Verify ontology and mapping', () => {

        test('Verify correct type', async () => {
            const idForIncorrectType = new Iri(`https://ipdc.tni-vlaanderen.be/id/rule/${uuid()}`);

            await directDatabaseAccess.insertData(
                CONCEPT_SNAPSHOT_LDES_GRAPH,
                [`<${idForIncorrectType}> a <https://productencatalogus.data.vlaanderen.be/ns/ipdc-lpdc#SomeUnkownType>`]);

            await expect(repository.findById(idForIncorrectType)).rejects.toThrowWithMessage(NotFoundError, `Kan <${idForIncorrectType}> niet vinden voor type <https://productencatalogus.data.vlaanderen.be/ns/ipdc-lpdc#ConceptualPublicServiceSnapshot>, maar wel gevonden met type <https://productencatalogus.data.vlaanderen.be/ns/ipdc-lpdc#SomeUnkownType> in graph <http://mu.semte.ch/graphs/lpdc/conceptsnapshots-ldes-data/ipdc>`);
        });

        test('Verify minimal mappings', async () => {
            const conceptSnapshotId = buildConceptSnapshotIri(uuid());
            const conceptSnapshotTitle = ConceptSnapshotTestBuilder.MINIMAL_TITLE;
            const conceptSnapshotDescription = aMinimalLanguageString('description').build();
            const conceptSnapshotProductId = ConceptSnapshotTestBuilder.PRODUCT_ID;
            const conceptSnapshotDateCreated = ConceptSnapshotTestBuilder.DATE_CREATED;
            const conceptSnapshotDateModified = ConceptSnapshotTestBuilder.DATE_MODIFIED;
            const conceptSnapshotGeneratedAtTime = ConceptSnapshotTestBuilder.GENERATED_AT_TIME;


            const conceptSnapshot =
                aMinimalConceptSnapshot()
                    .withId(conceptSnapshotId)
                    .withTitle(conceptSnapshotTitle)
                    .withDescription(conceptSnapshotDescription)
                    .withProductId(conceptSnapshotProductId)
                    .withDateCreated(conceptSnapshotDateCreated)
                    .withDateModified(conceptSnapshotDateModified)
                    .withGeneratedAtTime(conceptSnapshotGeneratedAtTime)
                    .build();

            await directDatabaseAccess.insertData(
                CONCEPT_SNAPSHOT_LDES_GRAPH,
                [
                    `<${conceptSnapshotId}> a <https://productencatalogus.data.vlaanderen.be/ns/ipdc-lpdc#ConceptualPublicServiceSnapshot>`,
                    `<${conceptSnapshotId}> <http://purl.org/dc/terms/title> """${conceptSnapshotTitle.nl}"""@nl`,
                    `<${conceptSnapshotId}> <http://purl.org/dc/terms/description> """${conceptSnapshotDescription.nl}"""@nl`,
                    `<${conceptSnapshotId}> <http://schema.org/productID> """${conceptSnapshotProductId}"""`,
                    `<${conceptSnapshotId}> <https://productencatalogus.data.vlaanderen.be/ns/ipdc-lpdc#isArchived> """false"""^^<http://www.w3.org/2001/XMLSchema#boolean>`,
                    `<${conceptSnapshotId}> <http://schema.org/dateCreated> """${conceptSnapshotDateCreated.value}"""^^<http://www.w3.org/2001/XMLSchema#dateTime>`,
                    `<${conceptSnapshotId}> <http://schema.org/dateModified> """${conceptSnapshotDateModified.value}"""^^<http://www.w3.org/2001/XMLSchema#dateTime>`,
                    `<${conceptSnapshotId}> <http://www.w3.org/ns/prov#generatedAtTime> """${conceptSnapshotGeneratedAtTime.value}"""^^<http://www.w3.org/2001/XMLSchema#dateTime>`
                ]);

            const actualConceptSnapshot = await repository.findById(conceptSnapshotId);

            expect(actualConceptSnapshot).toEqual(conceptSnapshot);
        });

        test('Verify minimal mappings - with start date but no end date', async () => {
            const conceptSnapshotId = buildConceptSnapshotIri(uuid());
            const conceptSnapshotTitle = ConceptSnapshotTestBuilder.MINIMAL_TITLE;
            const conceptSnapshotDescription = aMinimalLanguageString('description').build();
            const conceptSnapshotProductId = ConceptSnapshotTestBuilder.PRODUCT_ID;
            const conceptSnapshotDateCreated = ConceptSnapshotTestBuilder.DATE_CREATED;
            const conceptSnapshotDateModified = ConceptSnapshotTestBuilder.DATE_MODIFIED;
            const conceptSnapshotGeneratedAtTime = ConceptSnapshotTestBuilder.GENERATED_AT_TIME;


            const conceptSnapshot =
                aMinimalConceptSnapshot()
                    .withId(conceptSnapshotId)
                    .withTitle(conceptSnapshotTitle)
                    .withDescription(conceptSnapshotDescription)
                    .withProductId(conceptSnapshotProductId)
                    .withStartDate(ConceptSnapshotTestBuilder.START_DATE)
                    .withEndDate(undefined)
                    .withDateCreated(conceptSnapshotDateCreated)
                    .withDateModified(conceptSnapshotDateModified)
                    .withGeneratedAtTime(conceptSnapshotGeneratedAtTime)
                    .build();

            await directDatabaseAccess.insertData(
                CONCEPT_SNAPSHOT_LDES_GRAPH,
                [
                    `<${conceptSnapshotId}> a <https://productencatalogus.data.vlaanderen.be/ns/ipdc-lpdc#ConceptualPublicServiceSnapshot>`,
                    `<${conceptSnapshotId}> <http://purl.org/dc/terms/title> """${conceptSnapshotTitle.nl}"""@nl`,
                    `<${conceptSnapshotId}> <http://purl.org/dc/terms/description> """${conceptSnapshotDescription.nl}"""@nl`,
                    `<${conceptSnapshotId}> <http://schema.org/productID> """${conceptSnapshotProductId}"""`,
                    `<${conceptSnapshotId}> <http://schema.org/startDate> """${ConceptSnapshotTestBuilder.START_DATE.value}"""^^<http://www.w3.org/2001/XMLSchema#dateTime>`,
                    `<${conceptSnapshotId}> <http://schema.org/dateCreated> """${conceptSnapshotDateCreated.value}"""^^<http://www.w3.org/2001/XMLSchema#dateTime>`,
                    `<${conceptSnapshotId}> <http://schema.org/dateModified> """${conceptSnapshotDateModified.value}"""^^<http://www.w3.org/2001/XMLSchema#dateTime>`,
                    `<${conceptSnapshotId}> <https://productencatalogus.data.vlaanderen.be/ns/ipdc-lpdc#isArchived> """false"""^^<http://www.w3.org/2001/XMLSchema#boolean>`,
                    `<${conceptSnapshotId}> <http://www.w3.org/ns/prov#generatedAtTime> """${conceptSnapshotGeneratedAtTime.value}"""^^<http://www.w3.org/2001/XMLSchema#dateTime>`
                ]);

            const actualConceptSnapshot = await repository.findById(conceptSnapshotId);

            expect(actualConceptSnapshot).toEqual(conceptSnapshot);
        });

        test('Verify full mappings', async () => {
            const id = uuid();
            const conceptSnapshotId = buildConceptSnapshotIri(id);

            const conceptSnapshot =
                aFullConceptSnapshot()
                    .withId(conceptSnapshotId)
                    .build();

            await directDatabaseAccess.insertData(
                CONCEPT_SNAPSHOT_LDES_GRAPH,
                [`<${conceptSnapshotId}> a <https://productencatalogus.data.vlaanderen.be/ns/ipdc-lpdc#ConceptualPublicServiceSnapshot>`,
                    `<${conceptSnapshotId}> <http://purl.org/dc/terms/title> """${ConceptSnapshotTestBuilder.TITLE_NL}"""@NL`,
                    `<${conceptSnapshotId}> <http://purl.org/dc/terms/title> """${ConceptSnapshotTestBuilder.TITLE_NL_FORMAL}"""@nl-BE-x-formal`,
                    `<${conceptSnapshotId}> <http://purl.org/dc/terms/title> """${ConceptSnapshotTestBuilder.TITLE_NL_INFORMAL}"""@nl-BE-x-informal`,
                    `<${conceptSnapshotId}> <http://purl.org/dc/terms/title> """${ConceptSnapshotTestBuilder.TITLE_NL_GENERATED_FORMAL}"""@nl-BE-x-generated-formal`,
                    `<${conceptSnapshotId}> <http://purl.org/dc/terms/title> """${ConceptSnapshotTestBuilder.TITLE_NL_GENERATED_INFORMAL}"""@nl-BE-x-generated-informal`,
                    `<${conceptSnapshotId}> <http://purl.org/dc/terms/title> """Concept Snapshot Title German language is ignored"""@de`,
                    `<${conceptSnapshotId}> <http://purl.org/dc/terms/title> """Concept Snapshot French language is ignored"""@fr`,
                    `<${conceptSnapshotId}> <http://purl.org/dc/terms/description> """${ConceptSnapshotTestBuilder.DESCRIPTION_NL}"""@NL`,
                    `<${conceptSnapshotId}> <http://purl.org/dc/terms/description> """${ConceptSnapshotTestBuilder.DESCRIPTION_NL_FORMAL}"""@nl-BE-x-formal`,
                    `<${conceptSnapshotId}> <http://purl.org/dc/terms/description> """${ConceptSnapshotTestBuilder.DESCRIPTION_NL_INFORMAL}"""@nl-BE-x-informal`,
                    `<${conceptSnapshotId}> <http://purl.org/dc/terms/description> """${ConceptSnapshotTestBuilder.DESCRIPTION_NL_GENERATED_FORMAL}"""@nl-BE-x-generated-formal`,
                    `<${conceptSnapshotId}> <http://purl.org/dc/terms/description> """${ConceptSnapshotTestBuilder.DESCRIPTION_NL_GENERATED_INFORMAL}"""@nl-BE-x-generated-informal`,
                    `<${conceptSnapshotId}> <http://purl.org/dc/terms/description> """Concept Snapshot Description German language is ignored"""@de`,
                    `<${conceptSnapshotId}> <http://purl.org/dc/terms/description> """Concept Snapshot Description language is ignored"""@fr`,
                    `<${conceptSnapshotId}> <https://productencatalogus.data.vlaanderen.be/ns/ipdc-lpdc#additionalDescription> """${ConceptSnapshotTestBuilder.ADDITIONAL_DESCRIPTION_NL}"""@NL`,
                    `<${conceptSnapshotId}> <https://productencatalogus.data.vlaanderen.be/ns/ipdc-lpdc#additionalDescription> """${ConceptSnapshotTestBuilder.ADDITIONAL_DESCRIPTION_NL_FORMAL}"""@nl-BE-x-formal`,
                    `<${conceptSnapshotId}> <https://productencatalogus.data.vlaanderen.be/ns/ipdc-lpdc#additionalDescription> """${ConceptSnapshotTestBuilder.ADDITIONAL_DESCRIPTION_NL_INFORMAL}"""@nl-BE-x-informal`,
                    `<${conceptSnapshotId}> <https://productencatalogus.data.vlaanderen.be/ns/ipdc-lpdc#additionalDescription> """${ConceptSnapshotTestBuilder.ADDITIONAL_DESCRIPTION_NL_GENERATED_FORMAL}"""@nl-BE-x-generated-formal`,
                    `<${conceptSnapshotId}> <https://productencatalogus.data.vlaanderen.be/ns/ipdc-lpdc#additionalDescription> """${ConceptSnapshotTestBuilder.ADDITIONAL_DESCRIPTION_NL_GENERATED_INFORMAL}"""@nl-BE-x-generated-informal`,
                    `<${conceptSnapshotId}> <https://productencatalogus.data.vlaanderen.be/ns/ipdc-lpdc#additionalDescription> """Concept Snapshot Additional Description German language is ignored"""@de`,
                    `<${conceptSnapshotId}> <https://productencatalogus.data.vlaanderen.be/ns/ipdc-lpdc#additionalDescription> """Concept Snapshot Additional Description language is ignored"""@fr`,
                    `<${conceptSnapshotId}> <https://productencatalogus.data.vlaanderen.be/ns/ipdc-lpdc#exception> """${ConceptSnapshotTestBuilder.EXCEPTION_NL}"""@NL`,
                    `<${conceptSnapshotId}> <https://productencatalogus.data.vlaanderen.be/ns/ipdc-lpdc#exception> """${ConceptSnapshotTestBuilder.EXCEPTION_NL_FORMAL}"""@nl-BE-x-formal`,
                    `<${conceptSnapshotId}> <https://productencatalogus.data.vlaanderen.be/ns/ipdc-lpdc#exception> """${ConceptSnapshotTestBuilder.EXCEPTION_NL_INFORMAL}"""@nl-BE-x-informal`,
                    `<${conceptSnapshotId}> <https://productencatalogus.data.vlaanderen.be/ns/ipdc-lpdc#exception> """${ConceptSnapshotTestBuilder.EXCEPTION_NL_GENERATED_FORMAL}"""@nl-BE-x-generated-formal`,
                    `<${conceptSnapshotId}> <https://productencatalogus.data.vlaanderen.be/ns/ipdc-lpdc#exception> """${ConceptSnapshotTestBuilder.EXCEPTION_NL_GENERATED_INFORMAL}"""@nl-BE-x-generated-informal`,
                    `<${conceptSnapshotId}> <https://productencatalogus.data.vlaanderen.be/ns/ipdc-lpdc#exception> """Concept Snapshot Exception German language is ignored"""@de`,
                    `<${conceptSnapshotId}> <https://productencatalogus.data.vlaanderen.be/ns/ipdc-lpdc#exception> """Concept Snapshot Exception language is ignored"""@fr`,
                    `<${conceptSnapshotId}> <https://productencatalogus.data.vlaanderen.be/ns/ipdc-lpdc#regulation> """${ConceptSnapshotTestBuilder.REGULATION_NL}"""@NL`,
                    `<${conceptSnapshotId}> <https://productencatalogus.data.vlaanderen.be/ns/ipdc-lpdc#regulation> """${ConceptSnapshotTestBuilder.REGULATION_NL_FORMAL}"""@nl-BE-x-formal`,
                    `<${conceptSnapshotId}> <https://productencatalogus.data.vlaanderen.be/ns/ipdc-lpdc#regulation> """${ConceptSnapshotTestBuilder.REGULATION_NL_INFORMAL}"""@nl-BE-x-informal`,
                    `<${conceptSnapshotId}> <https://productencatalogus.data.vlaanderen.be/ns/ipdc-lpdc#regulation> """${ConceptSnapshotTestBuilder.REGULATION_NL_GENERATED_FORMAL}"""@nl-BE-x-generated-formal`,
                    `<${conceptSnapshotId}> <https://productencatalogus.data.vlaanderen.be/ns/ipdc-lpdc#regulation> """${ConceptSnapshotTestBuilder.REGULATION_NL_GENERATED_INFORMAL}"""@nl-BE-x-generated-informal`,
                    `<${conceptSnapshotId}> <https://productencatalogus.data.vlaanderen.be/ns/ipdc-lpdc#regulation> """Concept Snapshot Regulation German language is ignored"""@de`,
                    `<${conceptSnapshotId}> <https://productencatalogus.data.vlaanderen.be/ns/ipdc-lpdc#regulation> """Concept Snapshot Regulation  language is ignored"""@fr`,
                    `<${conceptSnapshotId}> <http://schema.org/startDate> """${ConceptSnapshotTestBuilder.START_DATE.value}"""^^<http://www.w3.org/2001/XMLSchema#dateTime>`,
                    `<${conceptSnapshotId}> <http://schema.org/endDate> """${ConceptSnapshotTestBuilder.END_DATE.value}"""^^<http://www.w3.org/2001/XMLSchema#dateTime>`,
                    `<${conceptSnapshotId}> <http://purl.org/dc/terms/type> <${NS.dvc.type(ConceptSnapshotTestBuilder.TYPE).value}>`,
                    `<${conceptSnapshotId}> <https://productencatalogus.data.vlaanderen.be/ns/ipdc-lpdc#targetAudience> <${NS.dvc.doelgroep(ConceptSnapshotTestBuilder.TARGET_AUDIENCES[0]).value}>`,
                    `<${conceptSnapshotId}> <https://productencatalogus.data.vlaanderen.be/ns/ipdc-lpdc#targetAudience> <${NS.dvc.doelgroep(ConceptSnapshotTestBuilder.TARGET_AUDIENCES[1]).value}>`,
                    `<${conceptSnapshotId}> <https://productencatalogus.data.vlaanderen.be/ns/ipdc-lpdc#targetAudience> <${NS.dvc.doelgroep(ConceptSnapshotTestBuilder.TARGET_AUDIENCES[2]).value}>`,
                    `<${conceptSnapshotId}> <http://data.europa.eu/m8g/thematicArea> <${NS.dvc.thema(ConceptSnapshotTestBuilder.THEMES[0]).value}>`,
                    `<${conceptSnapshotId}> <http://data.europa.eu/m8g/thematicArea> <${NS.dvc.thema(ConceptSnapshotTestBuilder.THEMES[1]).value}>`,
                    `<${conceptSnapshotId}> <http://data.europa.eu/m8g/thematicArea> <${NS.dvc.thema(ConceptSnapshotTestBuilder.THEMES[2]).value}>`,
                    `<${conceptSnapshotId}> <https://productencatalogus.data.vlaanderen.be/ns/ipdc-lpdc#competentAuthorityLevel> <${NS.dvc.bevoegdBestuursniveau(ConceptSnapshotTestBuilder.COMPETENT_AUTHORITY_LEVELS[0]).value}>`,
                    `<${conceptSnapshotId}> <https://productencatalogus.data.vlaanderen.be/ns/ipdc-lpdc#competentAuthorityLevel> <${NS.dvc.bevoegdBestuursniveau(ConceptSnapshotTestBuilder.COMPETENT_AUTHORITY_LEVELS[1]).value}>`,
                    `<${conceptSnapshotId}> <https://productencatalogus.data.vlaanderen.be/ns/ipdc-lpdc#competentAuthorityLevel> <${NS.dvc.bevoegdBestuursniveau(ConceptSnapshotTestBuilder.COMPETENT_AUTHORITY_LEVELS[2]).value}>`,
                    `<${conceptSnapshotId}> <http://data.europa.eu/m8g/hasCompetentAuthority> <${ConceptSnapshotTestBuilder.COMPETENT_AUTHORITIES[0]}>`,
                    `<${conceptSnapshotId}> <http://data.europa.eu/m8g/hasCompetentAuthority> <${ConceptSnapshotTestBuilder.COMPETENT_AUTHORITIES[1]}>`,
                    `<${conceptSnapshotId}> <http://data.europa.eu/m8g/hasCompetentAuthority> <${ConceptSnapshotTestBuilder.COMPETENT_AUTHORITIES[2]}>`,
                    `<${conceptSnapshotId}> <https://productencatalogus.data.vlaanderen.be/ns/ipdc-lpdc#executingAuthorityLevel> <${NS.dvc.uitvoerendBestuursniveau(ConceptSnapshotTestBuilder.EXECUTING_AUTHORITY_LEVELS[0]).value}>`,
                    `<${conceptSnapshotId}> <https://productencatalogus.data.vlaanderen.be/ns/ipdc-lpdc#executingAuthorityLevel> <${NS.dvc.uitvoerendBestuursniveau(ConceptSnapshotTestBuilder.EXECUTING_AUTHORITY_LEVELS[1]).value}>`,
                    `<${conceptSnapshotId}> <https://productencatalogus.data.vlaanderen.be/ns/ipdc-lpdc#executingAuthorityLevel> <${NS.dvc.uitvoerendBestuursniveau(ConceptSnapshotTestBuilder.EXECUTING_AUTHORITY_LEVELS[2]).value}>`,
                    `<${conceptSnapshotId}> <https://productencatalogus.data.vlaanderen.be/ns/ipdc-lpdc#hasExecutingAuthority> <${ConceptSnapshotTestBuilder.EXECUTING_AUTHORITIES[0]}>`,
                    `<${conceptSnapshotId}> <https://productencatalogus.data.vlaanderen.be/ns/ipdc-lpdc#hasExecutingAuthority> <${ConceptSnapshotTestBuilder.EXECUTING_AUTHORITIES[1]}>`,
                    `<${conceptSnapshotId}> <https://productencatalogus.data.vlaanderen.be/ns/ipdc-lpdc#hasExecutingAuthority> <${ConceptSnapshotTestBuilder.EXECUTING_AUTHORITIES[2]}>`,
                    `<${conceptSnapshotId}> <https://productencatalogus.data.vlaanderen.be/ns/ipdc-lpdc#publicationMedium> <${NS.dvc.publicatieKanaal(ConceptSnapshotTestBuilder.PUBLICATION_MEDIA[0]).value}>`,
                    `<${conceptSnapshotId}> <https://productencatalogus.data.vlaanderen.be/ns/ipdc-lpdc#publicationMedium> <${NS.dvc.publicatieKanaal(ConceptSnapshotTestBuilder.PUBLICATION_MEDIA[1]).value}>`,
                    `<${conceptSnapshotId}> <https://productencatalogus.data.vlaanderen.be/ns/ipdc-lpdc#yourEuropeCategory> <${NS.dvc.yourEuropeCategorie(ConceptSnapshotTestBuilder.YOUR_EUROPE_CATEGORIES[0]).value}>`,
                    `<${conceptSnapshotId}> <https://productencatalogus.data.vlaanderen.be/ns/ipdc-lpdc#yourEuropeCategory> <${NS.dvc.yourEuropeCategorie(ConceptSnapshotTestBuilder.YOUR_EUROPE_CATEGORIES[1]).value}>`,
                    `<${conceptSnapshotId}> <https://productencatalogus.data.vlaanderen.be/ns/ipdc-lpdc#yourEuropeCategory> <${NS.dvc.yourEuropeCategorie(ConceptSnapshotTestBuilder.YOUR_EUROPE_CATEGORIES[2]).value}>`,
                    `<${conceptSnapshotId}> <http://www.w3.org/ns/dcat#keyword> """${ConceptSnapshotTestBuilder.KEYWORDS[0].nl}"""@nl`,
                    `<${conceptSnapshotId}> <http://www.w3.org/ns/dcat#keyword> """${ConceptSnapshotTestBuilder.KEYWORDS[1].nl}"""@nl`,
                    `<${conceptSnapshotId}> <http://www.w3.org/ns/dcat#keyword> """english keyword is ignored"""@en`,
                    `<${conceptSnapshotId}> <http://vocab.belgif.be/ns/publicservice#hasRequirement> <${ConceptSnapshotTestBuilder.REQUIREMENTS[1].id}>`,
                    `<${ConceptSnapshotTestBuilder.REQUIREMENTS[1].id}> a <http://data.europa.eu/m8g/Requirement>`,
                    `<${ConceptSnapshotTestBuilder.REQUIREMENTS[1].id}> <http://purl.org/dc/terms/title> """${ConceptSnapshotTestBuilder.REQUIREMENTS[1].title.nl}"""@NL`,
                    `<${ConceptSnapshotTestBuilder.REQUIREMENTS[1].id}> <http://purl.org/dc/terms/title> """${ConceptSnapshotTestBuilder.REQUIREMENTS[1].title.nlFormal}"""@nl-BE-x-formal`,
                    `<${ConceptSnapshotTestBuilder.REQUIREMENTS[1].id}> <http://purl.org/dc/terms/title> """${ConceptSnapshotTestBuilder.REQUIREMENTS[1].title.nlInformal}"""@nl-BE-x-informal`,
                    `<${ConceptSnapshotTestBuilder.REQUIREMENTS[1].id}> <http://purl.org/dc/terms/title> """${ConceptSnapshotTestBuilder.REQUIREMENTS[1].title.nlGeneratedFormal}"""@nl-BE-x-generated-formal`,
                    `<${ConceptSnapshotTestBuilder.REQUIREMENTS[1].id}> <http://purl.org/dc/terms/title> """${ConceptSnapshotTestBuilder.REQUIREMENTS[1].title.nlGeneratedInformal}"""@nl-BE-x-generated-informal`,
                    `<${ConceptSnapshotTestBuilder.REQUIREMENTS[1].id}> <http://purl.org/dc/terms/description> """${ConceptSnapshotTestBuilder.REQUIREMENTS[1].description.nl}"""@NL`,
                    `<${ConceptSnapshotTestBuilder.REQUIREMENTS[1].id}> <http://purl.org/dc/terms/description> """${ConceptSnapshotTestBuilder.REQUIREMENTS[1].description.nlFormal}"""@nl-BE-x-formal`,
                    `<${ConceptSnapshotTestBuilder.REQUIREMENTS[1].id}> <http://purl.org/dc/terms/description> """${ConceptSnapshotTestBuilder.REQUIREMENTS[1].description.nlInformal}"""@nl-BE-x-informal`,
                    `<${ConceptSnapshotTestBuilder.REQUIREMENTS[1].id}> <http://purl.org/dc/terms/description> """${ConceptSnapshotTestBuilder.REQUIREMENTS[1].description.nlGeneratedFormal}"""@nl-BE-x-generated-formal`,
                    `<${ConceptSnapshotTestBuilder.REQUIREMENTS[1].id}> <http://purl.org/dc/terms/description> """${ConceptSnapshotTestBuilder.REQUIREMENTS[1].description.nlGeneratedInformal}"""@nl-BE-x-generated-informal`,
                    `<${ConceptSnapshotTestBuilder.REQUIREMENTS[1].id}> <http://www.w3.org/ns/shacl#order> """2"""^^<http://www.w3.org/2001/XMLSchema#integer>`,
                    `<${ConceptSnapshotTestBuilder.REQUIREMENTS[1].id}> <http://data.europa.eu/m8g/hasSupportingEvidence> <${ConceptSnapshotTestBuilder.REQUIREMENTS[1].evidence.id}>`,
                    `<${ConceptSnapshotTestBuilder.REQUIREMENTS[1].evidence.id}> a <http://data.europa.eu/m8g/Evidence>`,
                    `<${ConceptSnapshotTestBuilder.REQUIREMENTS[1].evidence.id}> <http://purl.org/dc/terms/title> """${ConceptSnapshotTestBuilder.REQUIREMENTS[1].evidence.title.nl}"""@NL`,
                    `<${ConceptSnapshotTestBuilder.REQUIREMENTS[1].evidence.id}> <http://purl.org/dc/terms/title> """${ConceptSnapshotTestBuilder.REQUIREMENTS[1].evidence.title.nlFormal}"""@nl-BE-x-formal`,
                    `<${ConceptSnapshotTestBuilder.REQUIREMENTS[1].evidence.id}> <http://purl.org/dc/terms/title> """${ConceptSnapshotTestBuilder.REQUIREMENTS[1].evidence.title.nlInformal}"""@nl-BE-x-informal`,
                    `<${ConceptSnapshotTestBuilder.REQUIREMENTS[1].evidence.id}> <http://purl.org/dc/terms/title> """${ConceptSnapshotTestBuilder.REQUIREMENTS[1].evidence.title.nlGeneratedFormal}"""@nl-BE-x-generated-formal`,
                    `<${ConceptSnapshotTestBuilder.REQUIREMENTS[1].evidence.id}> <http://purl.org/dc/terms/title> """${ConceptSnapshotTestBuilder.REQUIREMENTS[1].evidence.title.nlGeneratedInformal}"""@nl-BE-x-generated-informal`,
                    `<${ConceptSnapshotTestBuilder.REQUIREMENTS[1].evidence.id}> <http://purl.org/dc/terms/description> """${ConceptSnapshotTestBuilder.REQUIREMENTS[1].evidence.description.nl}"""@NL`,
                    `<${ConceptSnapshotTestBuilder.REQUIREMENTS[1].evidence.id}> <http://purl.org/dc/terms/description> """${ConceptSnapshotTestBuilder.REQUIREMENTS[1].evidence.description.nlFormal}"""@nl-BE-x-formal`,
                    `<${ConceptSnapshotTestBuilder.REQUIREMENTS[1].evidence.id}> <http://purl.org/dc/terms/description> """${ConceptSnapshotTestBuilder.REQUIREMENTS[1].evidence.description.nlInformal}"""@nl-BE-x-informal`,
                    `<${ConceptSnapshotTestBuilder.REQUIREMENTS[1].evidence.id}> <http://purl.org/dc/terms/description> """${ConceptSnapshotTestBuilder.REQUIREMENTS[1].evidence.description.nlGeneratedFormal}"""@nl-BE-x-generated-formal`,
                    `<${ConceptSnapshotTestBuilder.REQUIREMENTS[1].evidence.id}> <http://purl.org/dc/terms/description> """${ConceptSnapshotTestBuilder.REQUIREMENTS[1].evidence.description.nlGeneratedInformal}"""@nl-BE-x-generated-informal`,
                    `<${conceptSnapshotId}> <http://vocab.belgif.be/ns/publicservice#hasRequirement> <${ConceptSnapshotTestBuilder.REQUIREMENTS[0].id}>`,
                    `<${ConceptSnapshotTestBuilder.REQUIREMENTS[0].id}> a <http://data.europa.eu/m8g/Requirement>`,
                    `<${ConceptSnapshotTestBuilder.REQUIREMENTS[0].id}> <http://purl.org/dc/terms/title> """${ConceptSnapshotTestBuilder.REQUIREMENTS[0].title.nl}"""@NL`,
                    `<${ConceptSnapshotTestBuilder.REQUIREMENTS[0].id}> <http://purl.org/dc/terms/title> """${ConceptSnapshotTestBuilder.REQUIREMENTS[0].title.nlFormal}"""@nl-BE-x-formal`,
                    `<${ConceptSnapshotTestBuilder.REQUIREMENTS[0].id}> <http://purl.org/dc/terms/title> """${ConceptSnapshotTestBuilder.REQUIREMENTS[0].title.nlInformal}"""@nl-BE-x-informal`,
                    `<${ConceptSnapshotTestBuilder.REQUIREMENTS[0].id}> <http://purl.org/dc/terms/title> """${ConceptSnapshotTestBuilder.REQUIREMENTS[0].title.nlGeneratedFormal}"""@nl-BE-x-generated-formal`,
                    `<${ConceptSnapshotTestBuilder.REQUIREMENTS[0].id}> <http://purl.org/dc/terms/title> """${ConceptSnapshotTestBuilder.REQUIREMENTS[0].title.nlGeneratedInformal}"""@nl-BE-x-generated-informal`,
                    `<${ConceptSnapshotTestBuilder.REQUIREMENTS[0].id}> <http://purl.org/dc/terms/description> """${ConceptSnapshotTestBuilder.REQUIREMENTS[0].description.nl}"""@NL`,
                    `<${ConceptSnapshotTestBuilder.REQUIREMENTS[0].id}> <http://purl.org/dc/terms/description> """${ConceptSnapshotTestBuilder.REQUIREMENTS[0].description.nlFormal}"""@nl-BE-x-formal`,
                    `<${ConceptSnapshotTestBuilder.REQUIREMENTS[0].id}> <http://purl.org/dc/terms/description> """${ConceptSnapshotTestBuilder.REQUIREMENTS[0].description.nlInformal}"""@nl-BE-x-informal`,
                    `<${ConceptSnapshotTestBuilder.REQUIREMENTS[0].id}> <http://purl.org/dc/terms/description> """${ConceptSnapshotTestBuilder.REQUIREMENTS[0].description.nlGeneratedFormal}"""@nl-BE-x-generated-formal`,
                    `<${ConceptSnapshotTestBuilder.REQUIREMENTS[0].id}> <http://purl.org/dc/terms/description> """${ConceptSnapshotTestBuilder.REQUIREMENTS[0].description.nlGeneratedInformal}"""@nl-BE-x-generated-informal`,
                    `<${ConceptSnapshotTestBuilder.REQUIREMENTS[0].id}> <http://www.w3.org/ns/shacl#order> """1"""^^<http://www.w3.org/2001/XMLSchema#integer>`,
                    `<${ConceptSnapshotTestBuilder.REQUIREMENTS[0].id}> <http://data.europa.eu/m8g/hasSupportingEvidence> <${ConceptSnapshotTestBuilder.REQUIREMENTS[0].evidence.id}>`,
                    `<${ConceptSnapshotTestBuilder.REQUIREMENTS[0].evidence.id}> a <http://data.europa.eu/m8g/Evidence>`,
                    `<${ConceptSnapshotTestBuilder.REQUIREMENTS[0].evidence.id}> <http://purl.org/dc/terms/title> """${ConceptSnapshotTestBuilder.REQUIREMENTS[0].evidence.title.nl}"""@NL`,
                    `<${ConceptSnapshotTestBuilder.REQUIREMENTS[0].evidence.id}> <http://purl.org/dc/terms/title> """${ConceptSnapshotTestBuilder.REQUIREMENTS[0].evidence.title.nlFormal}"""@nl-BE-x-formal`,
                    `<${ConceptSnapshotTestBuilder.REQUIREMENTS[0].evidence.id}> <http://purl.org/dc/terms/title> """${ConceptSnapshotTestBuilder.REQUIREMENTS[0].evidence.title.nlInformal}"""@nl-BE-x-informal`,
                    `<${ConceptSnapshotTestBuilder.REQUIREMENTS[0].evidence.id}> <http://purl.org/dc/terms/title> """${ConceptSnapshotTestBuilder.REQUIREMENTS[0].evidence.title.nlGeneratedFormal}"""@nl-BE-x-generated-formal`,
                    `<${ConceptSnapshotTestBuilder.REQUIREMENTS[0].evidence.id}> <http://purl.org/dc/terms/title> """${ConceptSnapshotTestBuilder.REQUIREMENTS[0].evidence.title.nlGeneratedInformal}"""@nl-BE-x-generated-informal`,
                    `<${ConceptSnapshotTestBuilder.REQUIREMENTS[0].evidence.id}> <http://purl.org/dc/terms/description> """${ConceptSnapshotTestBuilder.REQUIREMENTS[0].evidence.description.nl}"""@NL`,
                    `<${ConceptSnapshotTestBuilder.REQUIREMENTS[0].evidence.id}> <http://purl.org/dc/terms/description> """${ConceptSnapshotTestBuilder.REQUIREMENTS[0].evidence.description.nlFormal}"""@nl-BE-x-formal`,
                    `<${ConceptSnapshotTestBuilder.REQUIREMENTS[0].evidence.id}> <http://purl.org/dc/terms/description> """${ConceptSnapshotTestBuilder.REQUIREMENTS[0].evidence.description.nlInformal}"""@nl-BE-x-informal`,
                    `<${ConceptSnapshotTestBuilder.REQUIREMENTS[0].evidence.id}> <http://purl.org/dc/terms/description> """${ConceptSnapshotTestBuilder.REQUIREMENTS[0].evidence.description.nlGeneratedFormal}"""@nl-BE-x-generated-formal`,
                    `<${ConceptSnapshotTestBuilder.REQUIREMENTS[0].evidence.id}> <http://purl.org/dc/terms/description> """${ConceptSnapshotTestBuilder.REQUIREMENTS[0].evidence.description.nlGeneratedInformal}"""@nl-BE-x-generated-informal`,
                    `<${conceptSnapshotId}> <http://purl.org/vocab/cpsv#follows> <${ConceptSnapshotTestBuilder.PROCEDURES[1].id}>`,
                    `<${ConceptSnapshotTestBuilder.PROCEDURES[1].id}> a <http://purl.org/vocab/cpsv#Rule>`,
                    `<${ConceptSnapshotTestBuilder.PROCEDURES[1].id}> <http://purl.org/dc/terms/title> """${ConceptSnapshotTestBuilder.PROCEDURES[1].title.nl}"""@NL`,
                    `<${ConceptSnapshotTestBuilder.PROCEDURES[1].id}> <http://purl.org/dc/terms/title> """${ConceptSnapshotTestBuilder.PROCEDURES[1].title.nlFormal}"""@nl-BE-x-formal`,
                    `<${ConceptSnapshotTestBuilder.PROCEDURES[1].id}> <http://purl.org/dc/terms/title> """${ConceptSnapshotTestBuilder.PROCEDURES[1].title.nlInformal}"""@nl-BE-x-informal`,
                    `<${ConceptSnapshotTestBuilder.PROCEDURES[1].id}> <http://purl.org/dc/terms/title> """${ConceptSnapshotTestBuilder.PROCEDURES[1].title.nlGeneratedFormal}"""@nl-BE-x-generated-formal`,
                    `<${ConceptSnapshotTestBuilder.PROCEDURES[1].id}> <http://purl.org/dc/terms/title> """${ConceptSnapshotTestBuilder.PROCEDURES[1].title.nlGeneratedInformal}"""@nl-BE-x-generated-informal`,
                    `<${ConceptSnapshotTestBuilder.PROCEDURES[1].id}> <http://purl.org/dc/terms/description> """${ConceptSnapshotTestBuilder.PROCEDURES[1].description.nl}"""@NL`,
                    `<${ConceptSnapshotTestBuilder.PROCEDURES[1].id}> <http://purl.org/dc/terms/description> """${ConceptSnapshotTestBuilder.PROCEDURES[1].description.nlFormal}"""@nl-BE-x-formal`,
                    `<${ConceptSnapshotTestBuilder.PROCEDURES[1].id}> <http://purl.org/dc/terms/description> """${ConceptSnapshotTestBuilder.PROCEDURES[1].description.nlInformal}"""@nl-BE-x-informal`,
                    `<${ConceptSnapshotTestBuilder.PROCEDURES[1].id}> <http://purl.org/dc/terms/description> """${ConceptSnapshotTestBuilder.PROCEDURES[1].description.nlGeneratedFormal}"""@nl-BE-x-generated-formal`,
                    `<${ConceptSnapshotTestBuilder.PROCEDURES[1].id}> <http://purl.org/dc/terms/description> """${ConceptSnapshotTestBuilder.PROCEDURES[1].description.nlGeneratedInformal}"""@nl-BE-x-generated-informal`,
                    `<${ConceptSnapshotTestBuilder.PROCEDURES[1].id}> <http://www.w3.org/ns/shacl#order> """2"""^^<http://www.w3.org/2001/XMLSchema#integer>`,
                    `<${ConceptSnapshotTestBuilder.PROCEDURES[1].id}> <https://productencatalogus.data.vlaanderen.be/ns/ipdc-lpdc#hasWebsite> <${ConceptSnapshotTestBuilder.PROCEDURES[1].websites[1].id}>`,
                    `<${ConceptSnapshotTestBuilder.PROCEDURES[1].websites[1].id}> a <http://schema.org/WebSite>`,
                    `<${ConceptSnapshotTestBuilder.PROCEDURES[1].websites[1].id}> <http://purl.org/dc/terms/title> """${ConceptSnapshotTestBuilder.PROCEDURES[1].websites[1].title.nl}"""@NL`,
                    `<${ConceptSnapshotTestBuilder.PROCEDURES[1].websites[1].id}> <http://purl.org/dc/terms/title> """${ConceptSnapshotTestBuilder.PROCEDURES[1].websites[1].title.nlFormal}"""@nl-BE-x-formal`,
                    `<${ConceptSnapshotTestBuilder.PROCEDURES[1].websites[1].id}> <http://purl.org/dc/terms/title> """${ConceptSnapshotTestBuilder.PROCEDURES[1].websites[1].title.nlInformal}"""@nl-BE-x-informal`,
                    `<${ConceptSnapshotTestBuilder.PROCEDURES[1].websites[1].id}> <http://purl.org/dc/terms/title> """${ConceptSnapshotTestBuilder.PROCEDURES[1].websites[1].title.nlGeneratedFormal}"""@nl-BE-x-generated-formal`,
                    `<${ConceptSnapshotTestBuilder.PROCEDURES[1].websites[1].id}> <http://purl.org/dc/terms/title> """${ConceptSnapshotTestBuilder.PROCEDURES[1].websites[1].title.nlGeneratedInformal}"""@nl-BE-x-generated-informal`,
                    `<${ConceptSnapshotTestBuilder.PROCEDURES[1].websites[1].id}> <http://purl.org/dc/terms/description> """${ConceptSnapshotTestBuilder.PROCEDURES[1].websites[1].description.nl}"""@NL`,
                    `<${ConceptSnapshotTestBuilder.PROCEDURES[1].websites[1].id}> <http://purl.org/dc/terms/description> """${ConceptSnapshotTestBuilder.PROCEDURES[1].websites[1].description.nlFormal}"""@nl-BE-x-formal`,
                    `<${ConceptSnapshotTestBuilder.PROCEDURES[1].websites[1].id}> <http://purl.org/dc/terms/description> """${ConceptSnapshotTestBuilder.PROCEDURES[1].websites[1].description.nlInformal}"""@nl-BE-x-informal`,
                    `<${ConceptSnapshotTestBuilder.PROCEDURES[1].websites[1].id}> <http://purl.org/dc/terms/description> """${ConceptSnapshotTestBuilder.PROCEDURES[1].websites[1].description.nlGeneratedFormal}"""@nl-BE-x-generated-formal`,
                    `<${ConceptSnapshotTestBuilder.PROCEDURES[1].websites[1].id}> <http://purl.org/dc/terms/description> """${ConceptSnapshotTestBuilder.PROCEDURES[1].websites[1].description.nlGeneratedInformal}"""@nl-BE-x-generated-informal`,
                    `<${ConceptSnapshotTestBuilder.PROCEDURES[1].websites[1].id}> <http://schema.org/url> """${ConceptSnapshotTestBuilder.PROCEDURES[1].websites[1].url}"""`,
                    `<${ConceptSnapshotTestBuilder.PROCEDURES[1].websites[1].id}> <http://www.w3.org/ns/shacl#order> """2"""^^<http://www.w3.org/2001/XMLSchema#integer>`,
                    `<${ConceptSnapshotTestBuilder.PROCEDURES[1].id}> <https://productencatalogus.data.vlaanderen.be/ns/ipdc-lpdc#hasWebsite> <${ConceptSnapshotTestBuilder.PROCEDURES[1].websites[0].id}>`,
                    `<${ConceptSnapshotTestBuilder.PROCEDURES[1].websites[0].id}> a <http://schema.org/WebSite>`,
                    `<${ConceptSnapshotTestBuilder.PROCEDURES[1].websites[0].id}> <http://purl.org/dc/terms/title> """${ConceptSnapshotTestBuilder.PROCEDURES[1].websites[0].title.nl}"""@NL`,
                    `<${ConceptSnapshotTestBuilder.PROCEDURES[1].websites[0].id}> <http://purl.org/dc/terms/title> """${ConceptSnapshotTestBuilder.PROCEDURES[1].websites[0].title.nlFormal}"""@nl-BE-x-formal`,
                    `<${ConceptSnapshotTestBuilder.PROCEDURES[1].websites[0].id}> <http://purl.org/dc/terms/title> """${ConceptSnapshotTestBuilder.PROCEDURES[1].websites[0].title.nlInformal}"""@nl-BE-x-informal`,
                    `<${ConceptSnapshotTestBuilder.PROCEDURES[1].websites[0].id}> <http://purl.org/dc/terms/title> """${ConceptSnapshotTestBuilder.PROCEDURES[1].websites[0].title.nlGeneratedFormal}"""@nl-BE-x-generated-formal`,
                    `<${ConceptSnapshotTestBuilder.PROCEDURES[1].websites[0].id}> <http://purl.org/dc/terms/title> """${ConceptSnapshotTestBuilder.PROCEDURES[1].websites[0].title.nlGeneratedInformal}"""@nl-BE-x-generated-informal`,
                    `<${ConceptSnapshotTestBuilder.PROCEDURES[1].websites[0].id}> <http://purl.org/dc/terms/description> """${ConceptSnapshotTestBuilder.PROCEDURES[1].websites[0].description.nl}"""@NL`,
                    `<${ConceptSnapshotTestBuilder.PROCEDURES[1].websites[0].id}> <http://purl.org/dc/terms/description> """${ConceptSnapshotTestBuilder.PROCEDURES[1].websites[0].description.nlFormal}"""@nl-BE-x-formal`,
                    `<${ConceptSnapshotTestBuilder.PROCEDURES[1].websites[0].id}> <http://purl.org/dc/terms/description> """${ConceptSnapshotTestBuilder.PROCEDURES[1].websites[0].description.nlInformal}"""@nl-BE-x-informal`,
                    `<${ConceptSnapshotTestBuilder.PROCEDURES[1].websites[0].id}> <http://purl.org/dc/terms/description> """${ConceptSnapshotTestBuilder.PROCEDURES[1].websites[0].description.nlGeneratedFormal}"""@nl-BE-x-generated-formal`,
                    `<${ConceptSnapshotTestBuilder.PROCEDURES[1].websites[0].id}> <http://purl.org/dc/terms/description> """${ConceptSnapshotTestBuilder.PROCEDURES[1].websites[0].description.nlGeneratedInformal}"""@nl-BE-x-generated-informal`,
                    `<${ConceptSnapshotTestBuilder.PROCEDURES[1].websites[0].id}> <http://schema.org/url> """${ConceptSnapshotTestBuilder.PROCEDURES[1].websites[0].url}"""`,
                    `<${ConceptSnapshotTestBuilder.PROCEDURES[1].websites[0].id}> <http://www.w3.org/ns/shacl#order> """1"""^^<http://www.w3.org/2001/XMLSchema#integer>`,
                    `<${conceptSnapshotId}> <http://purl.org/vocab/cpsv#follows> <${ConceptSnapshotTestBuilder.PROCEDURES[0].id}>`,
                    `<${ConceptSnapshotTestBuilder.PROCEDURES[0].id}> a <http://purl.org/vocab/cpsv#Rule>`,
                    `<${ConceptSnapshotTestBuilder.PROCEDURES[0].id}> <http://purl.org/dc/terms/title> """${ConceptSnapshotTestBuilder.PROCEDURES[0].title.nl}"""@NL`,
                    `<${ConceptSnapshotTestBuilder.PROCEDURES[0].id}> <http://purl.org/dc/terms/title> """${ConceptSnapshotTestBuilder.PROCEDURES[0].title.nlFormal}"""@nl-BE-x-formal`,
                    `<${ConceptSnapshotTestBuilder.PROCEDURES[0].id}> <http://purl.org/dc/terms/title> """${ConceptSnapshotTestBuilder.PROCEDURES[0].title.nlInformal}"""@nl-BE-x-informal`,
                    `<${ConceptSnapshotTestBuilder.PROCEDURES[0].id}> <http://purl.org/dc/terms/title> """${ConceptSnapshotTestBuilder.PROCEDURES[0].title.nlGeneratedFormal}"""@nl-BE-x-generated-formal`,
                    `<${ConceptSnapshotTestBuilder.PROCEDURES[0].id}> <http://purl.org/dc/terms/title> """${ConceptSnapshotTestBuilder.PROCEDURES[0].title.nlGeneratedInformal}"""@nl-BE-x-generated-informal`,
                    `<${ConceptSnapshotTestBuilder.PROCEDURES[0].id}> <http://purl.org/dc/terms/description> """${ConceptSnapshotTestBuilder.PROCEDURES[0].description.nl}"""@NL`,
                    `<${ConceptSnapshotTestBuilder.PROCEDURES[0].id}> <http://purl.org/dc/terms/description> """${ConceptSnapshotTestBuilder.PROCEDURES[0].description.nlFormal}"""@nl-BE-x-formal`,
                    `<${ConceptSnapshotTestBuilder.PROCEDURES[0].id}> <http://purl.org/dc/terms/description> """${ConceptSnapshotTestBuilder.PROCEDURES[0].description.nlInformal}"""@nl-BE-x-informal`,
                    `<${ConceptSnapshotTestBuilder.PROCEDURES[0].id}> <http://purl.org/dc/terms/description> """${ConceptSnapshotTestBuilder.PROCEDURES[0].description.nlGeneratedFormal}"""@nl-BE-x-generated-formal`,
                    `<${ConceptSnapshotTestBuilder.PROCEDURES[0].id}> <http://purl.org/dc/terms/description> """${ConceptSnapshotTestBuilder.PROCEDURES[0].description.nlGeneratedInformal}"""@nl-BE-x-generated-informal`,
                    `<${ConceptSnapshotTestBuilder.PROCEDURES[0].id}> <http://www.w3.org/ns/shacl#order> """1"""^^<http://www.w3.org/2001/XMLSchema#integer>`,
                    `<${ConceptSnapshotTestBuilder.PROCEDURES[0].id}> <https://productencatalogus.data.vlaanderen.be/ns/ipdc-lpdc#hasWebsite> <${ConceptSnapshotTestBuilder.PROCEDURES[0].websites[1].id}>`,
                    `<${ConceptSnapshotTestBuilder.PROCEDURES[0].websites[1].id}> a <http://schema.org/WebSite>`,
                    `<${ConceptSnapshotTestBuilder.PROCEDURES[0].websites[1].id}> <http://purl.org/dc/terms/title> """${ConceptSnapshotTestBuilder.PROCEDURES[0].websites[1].title.nl}"""@NL`,
                    `<${ConceptSnapshotTestBuilder.PROCEDURES[0].websites[1].id}> <http://purl.org/dc/terms/title> """${ConceptSnapshotTestBuilder.PROCEDURES[0].websites[1].title.nlFormal}"""@nl-BE-x-formal`,
                    `<${ConceptSnapshotTestBuilder.PROCEDURES[0].websites[1].id}> <http://purl.org/dc/terms/title> """${ConceptSnapshotTestBuilder.PROCEDURES[0].websites[1].title.nlInformal}"""@nl-BE-x-informal`,
                    `<${ConceptSnapshotTestBuilder.PROCEDURES[0].websites[1].id}> <http://purl.org/dc/terms/title> """${ConceptSnapshotTestBuilder.PROCEDURES[0].websites[1].title.nlGeneratedFormal}"""@nl-BE-x-generated-formal`,
                    `<${ConceptSnapshotTestBuilder.PROCEDURES[0].websites[1].id}> <http://purl.org/dc/terms/title> """${ConceptSnapshotTestBuilder.PROCEDURES[0].websites[1].title.nlGeneratedInformal}"""@nl-BE-x-generated-informal`,
                    `<${ConceptSnapshotTestBuilder.PROCEDURES[0].websites[1].id}> <http://purl.org/dc/terms/description> """${ConceptSnapshotTestBuilder.PROCEDURES[0].websites[1].description.nl}"""@NL`,
                    `<${ConceptSnapshotTestBuilder.PROCEDURES[0].websites[1].id}> <http://purl.org/dc/terms/description> """${ConceptSnapshotTestBuilder.PROCEDURES[0].websites[1].description.nlFormal}"""@nl-BE-x-formal`,
                    `<${ConceptSnapshotTestBuilder.PROCEDURES[0].websites[1].id}> <http://purl.org/dc/terms/description> """${ConceptSnapshotTestBuilder.PROCEDURES[0].websites[1].description.nlInformal}"""@nl-BE-x-informal`,
                    `<${ConceptSnapshotTestBuilder.PROCEDURES[0].websites[1].id}> <http://purl.org/dc/terms/description> """${ConceptSnapshotTestBuilder.PROCEDURES[0].websites[1].description.nlGeneratedFormal}"""@nl-BE-x-generated-formal`,
                    `<${ConceptSnapshotTestBuilder.PROCEDURES[0].websites[1].id}> <http://purl.org/dc/terms/description> """${ConceptSnapshotTestBuilder.PROCEDURES[0].websites[1].description.nlGeneratedInformal}"""@nl-BE-x-generated-informal`,
                    `<${ConceptSnapshotTestBuilder.PROCEDURES[0].websites[1].id}> <http://schema.org/url> """${ConceptSnapshotTestBuilder.PROCEDURES[0].websites[1].url}"""`,
                    `<${ConceptSnapshotTestBuilder.PROCEDURES[0].websites[1].id}> <http://www.w3.org/ns/shacl#order> """2"""^^<http://www.w3.org/2001/XMLSchema#integer>`,
                    `<${ConceptSnapshotTestBuilder.PROCEDURES[0].id}> <https://productencatalogus.data.vlaanderen.be/ns/ipdc-lpdc#hasWebsite> <${ConceptSnapshotTestBuilder.PROCEDURES[0].websites[0].id}>`,
                    `<${ConceptSnapshotTestBuilder.PROCEDURES[0].websites[0].id}> a <http://schema.org/WebSite>`,
                    `<${ConceptSnapshotTestBuilder.PROCEDURES[0].websites[0].id}> <http://purl.org/dc/terms/title> """${ConceptSnapshotTestBuilder.PROCEDURES[0].websites[0].title.nl}"""@NL`,
                    `<${ConceptSnapshotTestBuilder.PROCEDURES[0].websites[0].id}> <http://purl.org/dc/terms/title> """${ConceptSnapshotTestBuilder.PROCEDURES[0].websites[0].title.nlFormal}"""@nl-BE-x-formal`,
                    `<${ConceptSnapshotTestBuilder.PROCEDURES[0].websites[0].id}> <http://purl.org/dc/terms/title> """${ConceptSnapshotTestBuilder.PROCEDURES[0].websites[0].title.nlInformal}"""@nl-BE-x-informal`,
                    `<${ConceptSnapshotTestBuilder.PROCEDURES[0].websites[0].id}> <http://purl.org/dc/terms/title> """${ConceptSnapshotTestBuilder.PROCEDURES[0].websites[0].title.nlGeneratedFormal}"""@nl-BE-x-generated-formal`,
                    `<${ConceptSnapshotTestBuilder.PROCEDURES[0].websites[0].id}> <http://purl.org/dc/terms/title> """${ConceptSnapshotTestBuilder.PROCEDURES[0].websites[0].title.nlGeneratedInformal}"""@nl-BE-x-generated-informal`,
                    `<${ConceptSnapshotTestBuilder.PROCEDURES[0].websites[0].id}> <http://purl.org/dc/terms/description> """${ConceptSnapshotTestBuilder.PROCEDURES[0].websites[0].description.nl}"""@NL`,
                    `<${ConceptSnapshotTestBuilder.PROCEDURES[0].websites[0].id}> <http://purl.org/dc/terms/description> """${ConceptSnapshotTestBuilder.PROCEDURES[0].websites[0].description.nlFormal}"""@nl-BE-x-formal`,
                    `<${ConceptSnapshotTestBuilder.PROCEDURES[0].websites[0].id}> <http://purl.org/dc/terms/description> """${ConceptSnapshotTestBuilder.PROCEDURES[0].websites[0].description.nlInformal}"""@nl-BE-x-informal`,
                    `<${ConceptSnapshotTestBuilder.PROCEDURES[0].websites[0].id}> <http://purl.org/dc/terms/description> """${ConceptSnapshotTestBuilder.PROCEDURES[0].websites[0].description.nlGeneratedFormal}"""@nl-BE-x-generated-formal`,
                    `<${ConceptSnapshotTestBuilder.PROCEDURES[0].websites[0].id}> <http://purl.org/dc/terms/description> """${ConceptSnapshotTestBuilder.PROCEDURES[0].websites[0].description.nlGeneratedInformal}"""@nl-BE-x-generated-informal`,
                    `<${ConceptSnapshotTestBuilder.PROCEDURES[0].websites[0].id}> <http://schema.org/url> """${ConceptSnapshotTestBuilder.PROCEDURES[0].websites[0].url}"""`,
                    `<${ConceptSnapshotTestBuilder.PROCEDURES[0].websites[0].id}> <http://www.w3.org/ns/shacl#order> """1"""^^<http://www.w3.org/2001/XMLSchema#integer>`,
                    `<${conceptSnapshotId}> <http://www.w3.org/2000/01/rdf-schema#seeAlso> <${ConceptSnapshotTestBuilder.WEBSITES[1].id}>`,
                    `<${ConceptSnapshotTestBuilder.WEBSITES[1].id}> a <http://schema.org/WebSite>`,
                    `<${ConceptSnapshotTestBuilder.WEBSITES[1].id}> <http://purl.org/dc/terms/title> """${ConceptSnapshotTestBuilder.WEBSITES[1].title.nl}"""@NL`,
                    `<${ConceptSnapshotTestBuilder.WEBSITES[1].id}> <http://purl.org/dc/terms/title> """${ConceptSnapshotTestBuilder.WEBSITES[1].title.nlFormal}"""@nl-BE-x-formal`,
                    `<${ConceptSnapshotTestBuilder.WEBSITES[1].id}> <http://purl.org/dc/terms/title> """${ConceptSnapshotTestBuilder.WEBSITES[1].title.nlInformal}"""@nl-BE-x-informal`,
                    `<${ConceptSnapshotTestBuilder.WEBSITES[1].id}> <http://purl.org/dc/terms/title> """${ConceptSnapshotTestBuilder.WEBSITES[1].title.nlGeneratedFormal}"""@nl-BE-x-generated-formal`,
                    `<${ConceptSnapshotTestBuilder.WEBSITES[1].id}> <http://purl.org/dc/terms/title> """${ConceptSnapshotTestBuilder.WEBSITES[1].title.nlGeneratedInformal}"""@nl-BE-x-generated-informal`,
                    `<${ConceptSnapshotTestBuilder.WEBSITES[1].id}> <http://purl.org/dc/terms/description> """${ConceptSnapshotTestBuilder.WEBSITES[1].description.nl}"""@NL`,
                    `<${ConceptSnapshotTestBuilder.WEBSITES[1].id}> <http://purl.org/dc/terms/description> """${ConceptSnapshotTestBuilder.WEBSITES[1].description.nlFormal}"""@nl-BE-x-formal`,
                    `<${ConceptSnapshotTestBuilder.WEBSITES[1].id}> <http://purl.org/dc/terms/description> """${ConceptSnapshotTestBuilder.WEBSITES[1].description.nlInformal}"""@nl-BE-x-informal`,
                    `<${ConceptSnapshotTestBuilder.WEBSITES[1].id}> <http://purl.org/dc/terms/description> """${ConceptSnapshotTestBuilder.WEBSITES[1].description.nlGeneratedFormal}"""@nl-BE-x-generated-formal`,
                    `<${ConceptSnapshotTestBuilder.WEBSITES[1].id}> <http://purl.org/dc/terms/description> """${ConceptSnapshotTestBuilder.WEBSITES[1].description.nlGeneratedInformal}"""@nl-BE-x-generated-informal`,
                    `<${ConceptSnapshotTestBuilder.WEBSITES[1].id}> <http://schema.org/url> """${ConceptSnapshotTestBuilder.WEBSITES[1].url}"""`,
                    `<${ConceptSnapshotTestBuilder.WEBSITES[1].id}> <http://www.w3.org/ns/shacl#order> """2"""^^<http://www.w3.org/2001/XMLSchema#integer>`,
                    `<${conceptSnapshotId}> <http://www.w3.org/2000/01/rdf-schema#seeAlso> <${ConceptSnapshotTestBuilder.WEBSITES[0].id}>`,
                    `<${ConceptSnapshotTestBuilder.WEBSITES[0].id}> a <http://schema.org/WebSite>`,
                    `<${ConceptSnapshotTestBuilder.WEBSITES[0].id}> <http://purl.org/dc/terms/title> """${ConceptSnapshotTestBuilder.WEBSITES[0].title.nl}"""@NL`,
                    `<${ConceptSnapshotTestBuilder.WEBSITES[0].id}> <http://purl.org/dc/terms/title> """${ConceptSnapshotTestBuilder.WEBSITES[0].title.nlFormal}"""@nl-BE-x-formal`,
                    `<${ConceptSnapshotTestBuilder.WEBSITES[0].id}> <http://purl.org/dc/terms/title> """${ConceptSnapshotTestBuilder.WEBSITES[0].title.nlInformal}"""@nl-BE-x-informal`,
                    `<${ConceptSnapshotTestBuilder.WEBSITES[0].id}> <http://purl.org/dc/terms/title> """${ConceptSnapshotTestBuilder.WEBSITES[0].title.nlGeneratedFormal}"""@nl-BE-x-generated-formal`,
                    `<${ConceptSnapshotTestBuilder.WEBSITES[0].id}> <http://purl.org/dc/terms/title> """${ConceptSnapshotTestBuilder.WEBSITES[0].title.nlGeneratedInformal}"""@nl-BE-x-generated-informal`,
                    `<${ConceptSnapshotTestBuilder.WEBSITES[0].id}> <http://purl.org/dc/terms/description> """${ConceptSnapshotTestBuilder.WEBSITES[0].description.nl}"""@NL`,
                    `<${ConceptSnapshotTestBuilder.WEBSITES[0].id}> <http://purl.org/dc/terms/description> """${ConceptSnapshotTestBuilder.WEBSITES[0].description.nlFormal}"""@nl-BE-x-formal`,
                    `<${ConceptSnapshotTestBuilder.WEBSITES[0].id}> <http://purl.org/dc/terms/description> """${ConceptSnapshotTestBuilder.WEBSITES[0].description.nlInformal}"""@nl-BE-x-informal`,
                    `<${ConceptSnapshotTestBuilder.WEBSITES[0].id}> <http://purl.org/dc/terms/description> """${ConceptSnapshotTestBuilder.WEBSITES[0].description.nlGeneratedFormal}"""@nl-BE-x-generated-formal`,
                    `<${ConceptSnapshotTestBuilder.WEBSITES[0].id}> <http://purl.org/dc/terms/description> """${ConceptSnapshotTestBuilder.WEBSITES[0].description.nlGeneratedInformal}"""@nl-BE-x-generated-informal`,
                    `<${ConceptSnapshotTestBuilder.WEBSITES[0].id}> <http://schema.org/url> """${ConceptSnapshotTestBuilder.WEBSITES[0].url}"""`,
                    `<${ConceptSnapshotTestBuilder.WEBSITES[0].id}> <http://www.w3.org/ns/shacl#order> """1"""^^<http://www.w3.org/2001/XMLSchema#integer>`,
                    `<${conceptSnapshotId}> <http://data.europa.eu/m8g/hasCost> <${ConceptSnapshotTestBuilder.COSTS[1].id}>`,
                    `<${ConceptSnapshotTestBuilder.COSTS[1].id}> a <http://data.europa.eu/m8g/Cost>`,
                    `<${ConceptSnapshotTestBuilder.COSTS[1].id}> <http://purl.org/dc/terms/title> """${ConceptSnapshotTestBuilder.COSTS[1].title.nl}"""@NL`,
                    `<${ConceptSnapshotTestBuilder.COSTS[1].id}> <http://purl.org/dc/terms/title> """${ConceptSnapshotTestBuilder.COSTS[1].title.nlFormal}"""@nl-BE-x-formal`,
                    `<${ConceptSnapshotTestBuilder.COSTS[1].id}> <http://purl.org/dc/terms/title> """${ConceptSnapshotTestBuilder.COSTS[1].title.nlInformal}"""@nl-BE-x-informal`,
                    `<${ConceptSnapshotTestBuilder.COSTS[1].id}> <http://purl.org/dc/terms/title> """${ConceptSnapshotTestBuilder.COSTS[1].title.nlGeneratedFormal}"""@nl-BE-x-generated-formal`,
                    `<${ConceptSnapshotTestBuilder.COSTS[1].id}> <http://purl.org/dc/terms/title> """${ConceptSnapshotTestBuilder.COSTS[1].title.nlGeneratedInformal}"""@nl-BE-x-generated-informal`,
                    `<${ConceptSnapshotTestBuilder.COSTS[1].id}> <http://purl.org/dc/terms/description> """${ConceptSnapshotTestBuilder.COSTS[1].description.nl}"""@NL`,
                    `<${ConceptSnapshotTestBuilder.COSTS[1].id}> <http://purl.org/dc/terms/description> """${ConceptSnapshotTestBuilder.COSTS[1].description.nlFormal}"""@nl-BE-x-formal`,
                    `<${ConceptSnapshotTestBuilder.COSTS[1].id}> <http://purl.org/dc/terms/description> """${ConceptSnapshotTestBuilder.COSTS[1].description.nlInformal}"""@nl-BE-x-informal`,
                    `<${ConceptSnapshotTestBuilder.COSTS[1].id}> <http://purl.org/dc/terms/description> """${ConceptSnapshotTestBuilder.COSTS[1].description.nlGeneratedFormal}"""@nl-BE-x-generated-formal`,
                    `<${ConceptSnapshotTestBuilder.COSTS[1].id}> <http://purl.org/dc/terms/description> """${ConceptSnapshotTestBuilder.COSTS[1].description.nlGeneratedInformal}"""@nl-BE-x-generated-informal`,
                    `<${ConceptSnapshotTestBuilder.COSTS[1].id}> <http://www.w3.org/ns/shacl#order> """2"""^^<http://www.w3.org/2001/XMLSchema#integer>`,
                    `<${conceptSnapshotId}> <http://data.europa.eu/m8g/hasCost> <${ConceptSnapshotTestBuilder.COSTS[0].id}>`,
                    `<${ConceptSnapshotTestBuilder.COSTS[0].id}> a <http://data.europa.eu/m8g/Cost>`,
                    `<${ConceptSnapshotTestBuilder.COSTS[0].id}> <http://purl.org/dc/terms/title> """${ConceptSnapshotTestBuilder.COSTS[0].title.nl}"""@NL`,
                    `<${ConceptSnapshotTestBuilder.COSTS[0].id}> <http://purl.org/dc/terms/title> """${ConceptSnapshotTestBuilder.COSTS[0].title.nlFormal}"""@nl-BE-x-formal`,
                    `<${ConceptSnapshotTestBuilder.COSTS[0].id}> <http://purl.org/dc/terms/title> """${ConceptSnapshotTestBuilder.COSTS[0].title.nlInformal}"""@nl-BE-x-informal`,
                    `<${ConceptSnapshotTestBuilder.COSTS[0].id}> <http://purl.org/dc/terms/title> """${ConceptSnapshotTestBuilder.COSTS[0].title.nlGeneratedFormal}"""@nl-BE-x-generated-formal`,
                    `<${ConceptSnapshotTestBuilder.COSTS[0].id}> <http://purl.org/dc/terms/title> """${ConceptSnapshotTestBuilder.COSTS[0].title.nlGeneratedInformal}"""@nl-BE-x-generated-informal`,
                    `<${ConceptSnapshotTestBuilder.COSTS[0].id}> <http://purl.org/dc/terms/description> """${ConceptSnapshotTestBuilder.COSTS[0].description.nl}"""@NL`,
                    `<${ConceptSnapshotTestBuilder.COSTS[0].id}> <http://purl.org/dc/terms/description> """${ConceptSnapshotTestBuilder.COSTS[0].description.nlFormal}"""@nl-BE-x-formal`,
                    `<${ConceptSnapshotTestBuilder.COSTS[0].id}> <http://purl.org/dc/terms/description> """${ConceptSnapshotTestBuilder.COSTS[0].description.nlInformal}"""@nl-BE-x-informal`,
                    `<${ConceptSnapshotTestBuilder.COSTS[0].id}> <http://purl.org/dc/terms/description> """${ConceptSnapshotTestBuilder.COSTS[0].description.nlGeneratedFormal}"""@nl-BE-x-generated-formal`,
                    `<${ConceptSnapshotTestBuilder.COSTS[0].id}> <http://purl.org/dc/terms/description> """${ConceptSnapshotTestBuilder.COSTS[0].description.nlGeneratedInformal}"""@nl-BE-x-generated-informal`,
                    `<${ConceptSnapshotTestBuilder.COSTS[0].id}> <http://www.w3.org/ns/shacl#order> """1"""^^<http://www.w3.org/2001/XMLSchema#integer>`,
                    `<${conceptSnapshotId}> <http://purl.org/vocab/cpsv#produces> <${ConceptSnapshotTestBuilder.FINANCIAL_ADVANTAGES[1].id}>`,
                    `<${ConceptSnapshotTestBuilder.FINANCIAL_ADVANTAGES[1].id}> a <https://productencatalogus.data.vlaanderen.be/ns/ipdc-lpdc#FinancialAdvantage>`,
                    `<${ConceptSnapshotTestBuilder.FINANCIAL_ADVANTAGES[1].id}> <http://purl.org/dc/terms/title> """${ConceptSnapshotTestBuilder.FINANCIAL_ADVANTAGES[1].title.nl}"""@NL`,
                    `<${ConceptSnapshotTestBuilder.FINANCIAL_ADVANTAGES[1].id}> <http://purl.org/dc/terms/title> """${ConceptSnapshotTestBuilder.FINANCIAL_ADVANTAGES[1].title.nlFormal}"""@nl-BE-x-formal`,
                    `<${ConceptSnapshotTestBuilder.FINANCIAL_ADVANTAGES[1].id}> <http://purl.org/dc/terms/title> """${ConceptSnapshotTestBuilder.FINANCIAL_ADVANTAGES[1].title.nlInformal}"""@nl-BE-x-informal`,
                    `<${ConceptSnapshotTestBuilder.FINANCIAL_ADVANTAGES[1].id}> <http://purl.org/dc/terms/title> """${ConceptSnapshotTestBuilder.FINANCIAL_ADVANTAGES[1].title.nlGeneratedFormal}"""@nl-BE-x-generated-formal`,
                    `<${ConceptSnapshotTestBuilder.FINANCIAL_ADVANTAGES[1].id}> <http://purl.org/dc/terms/title> """${ConceptSnapshotTestBuilder.FINANCIAL_ADVANTAGES[1].title.nlGeneratedInformal}"""@nl-BE-x-generated-informal`,
                    `<${ConceptSnapshotTestBuilder.FINANCIAL_ADVANTAGES[1].id}> <http://purl.org/dc/terms/description> """${ConceptSnapshotTestBuilder.FINANCIAL_ADVANTAGES[1].description.nl}"""@NL`,
                    `<${ConceptSnapshotTestBuilder.FINANCIAL_ADVANTAGES[1].id}> <http://purl.org/dc/terms/description> """${ConceptSnapshotTestBuilder.FINANCIAL_ADVANTAGES[1].description.nlFormal}"""@nl-BE-x-formal`,
                    `<${ConceptSnapshotTestBuilder.FINANCIAL_ADVANTAGES[1].id}> <http://purl.org/dc/terms/description> """${ConceptSnapshotTestBuilder.FINANCIAL_ADVANTAGES[1].description.nlInformal}"""@nl-BE-x-informal`,
                    `<${ConceptSnapshotTestBuilder.FINANCIAL_ADVANTAGES[1].id}> <http://purl.org/dc/terms/description> """${ConceptSnapshotTestBuilder.FINANCIAL_ADVANTAGES[1].description.nlGeneratedFormal}"""@nl-BE-x-generated-formal`,
                    `<${ConceptSnapshotTestBuilder.FINANCIAL_ADVANTAGES[1].id}> <http://purl.org/dc/terms/description> """${ConceptSnapshotTestBuilder.FINANCIAL_ADVANTAGES[1].description.nlGeneratedInformal}"""@nl-BE-x-generated-informal`,
                    `<${ConceptSnapshotTestBuilder.FINANCIAL_ADVANTAGES[1].id}> <http://www.w3.org/ns/shacl#order> """2"""^^<http://www.w3.org/2001/XMLSchema#integer>`,
                    `<${conceptSnapshotId}> <http://purl.org/vocab/cpsv#produces> <${ConceptSnapshotTestBuilder.FINANCIAL_ADVANTAGES[0].id}>`,
                    `<${ConceptSnapshotTestBuilder.FINANCIAL_ADVANTAGES[0].id}> a <https://productencatalogus.data.vlaanderen.be/ns/ipdc-lpdc#FinancialAdvantage>`,
                    `<${ConceptSnapshotTestBuilder.FINANCIAL_ADVANTAGES[0].id}> <http://purl.org/dc/terms/title> """${ConceptSnapshotTestBuilder.FINANCIAL_ADVANTAGES[0].title.nl}"""@NL`,
                    `<${ConceptSnapshotTestBuilder.FINANCIAL_ADVANTAGES[0].id}> <http://purl.org/dc/terms/title> """${ConceptSnapshotTestBuilder.FINANCIAL_ADVANTAGES[0].title.nlFormal}"""@nl-BE-x-formal`,
                    `<${ConceptSnapshotTestBuilder.FINANCIAL_ADVANTAGES[0].id}> <http://purl.org/dc/terms/title> """${ConceptSnapshotTestBuilder.FINANCIAL_ADVANTAGES[0].title.nlInformal}"""@nl-BE-x-informal`,
                    `<${ConceptSnapshotTestBuilder.FINANCIAL_ADVANTAGES[0].id}> <http://purl.org/dc/terms/title> """${ConceptSnapshotTestBuilder.FINANCIAL_ADVANTAGES[0].title.nlGeneratedFormal}"""@nl-BE-x-generated-formal`,
                    `<${ConceptSnapshotTestBuilder.FINANCIAL_ADVANTAGES[0].id}> <http://purl.org/dc/terms/title> """${ConceptSnapshotTestBuilder.FINANCIAL_ADVANTAGES[0].title.nlGeneratedInformal}"""@nl-BE-x-generated-informal`,
                    `<${ConceptSnapshotTestBuilder.FINANCIAL_ADVANTAGES[0].id}> <http://purl.org/dc/terms/description> """${ConceptSnapshotTestBuilder.FINANCIAL_ADVANTAGES[0].description.nl}"""@NL`,
                    `<${ConceptSnapshotTestBuilder.FINANCIAL_ADVANTAGES[0].id}> <http://purl.org/dc/terms/description> """${ConceptSnapshotTestBuilder.FINANCIAL_ADVANTAGES[0].description.nlFormal}"""@nl-BE-x-formal`,
                    `<${ConceptSnapshotTestBuilder.FINANCIAL_ADVANTAGES[0].id}> <http://purl.org/dc/terms/description> """${ConceptSnapshotTestBuilder.FINANCIAL_ADVANTAGES[0].description.nlInformal}"""@nl-BE-x-informal`,
                    `<${ConceptSnapshotTestBuilder.FINANCIAL_ADVANTAGES[0].id}> <http://purl.org/dc/terms/description> """${ConceptSnapshotTestBuilder.FINANCIAL_ADVANTAGES[0].description.nlGeneratedFormal}"""@nl-BE-x-generated-formal`,
                    `<${ConceptSnapshotTestBuilder.FINANCIAL_ADVANTAGES[0].id}> <http://purl.org/dc/terms/description> """${ConceptSnapshotTestBuilder.FINANCIAL_ADVANTAGES[0].description.nlGeneratedInformal}"""@nl-BE-x-generated-informal`,
                    `<${ConceptSnapshotTestBuilder.FINANCIAL_ADVANTAGES[0].id}> <http://www.w3.org/ns/shacl#order> """1"""^^<http://www.w3.org/2001/XMLSchema#integer>`,
                    `<${conceptSnapshotId}> <http://purl.org/dc/terms/isVersionOf> <${ConceptSnapshotTestBuilder.IS_VERSION_OF_CONCEPT}>`,
                    `<${conceptSnapshotId}> <http://schema.org/dateCreated> """${ConceptSnapshotTestBuilder.DATE_CREATED.value}"""^^<http://www.w3.org/2001/XMLSchema#dateTime>`,
                    `<${conceptSnapshotId}> <http://schema.org/dateModified> """${ConceptSnapshotTestBuilder.DATE_MODIFIED.value}"""^^<http://www.w3.org/2001/XMLSchema#dateTime>`,
                    `<${conceptSnapshotId}> <http://www.w3.org/ns/prov#generatedAtTime> """${ConceptSnapshotTestBuilder.GENERATED_AT_TIME.value}"""^^<http://www.w3.org/2001/XMLSchema#dateTime>`,
                    `<${conceptSnapshotId}> <http://schema.org/identifier> """${id}"""`,
                    `<${conceptSnapshotId}> <http://schema.org/productID> """${ConceptSnapshotTestBuilder.PRODUCT_ID}"""`,
                    `<${conceptSnapshotId}> <https://productencatalogus.data.vlaanderen.be/ns/ipdc-lpdc#isArchived> """false"""^^<http://www.w3.org/2001/XMLSchema#boolean>`,
                    `<${conceptSnapshotId}> <https://productencatalogus.data.vlaanderen.be/ns/ipdc-lpdc#conceptTag> <${NS.dvc.conceptTag(ConceptSnapshotTestBuilder.CONCEPT_TAGS[0]).value}>`,
                    `<${conceptSnapshotId}> <https://productencatalogus.data.vlaanderen.be/ns/ipdc-lpdc#conceptTag> <${NS.dvc.conceptTag(ConceptSnapshotTestBuilder.CONCEPT_TAGS[1]).value}>`,
                    `<${conceptSnapshotId}> <http://data.europa.eu/m8g/hasLegalResource> <${ConceptSnapshotTestBuilder.LEGAL_RESOURCES[0].id}>`,
                    `<${ConceptSnapshotTestBuilder.LEGAL_RESOURCES[0].id}> a <http://data.europa.eu/eli/ontology#LegalResource>`,
                    `<${ConceptSnapshotTestBuilder.LEGAL_RESOURCES[0].id}> <http://purl.org/dc/terms/title> """${ConceptSnapshotTestBuilder.LEGAL_RESOURCES[0].title.nl}"""@NL`,
                    `<${ConceptSnapshotTestBuilder.LEGAL_RESOURCES[0].id}> <http://purl.org/dc/terms/title> """${ConceptSnapshotTestBuilder.LEGAL_RESOURCES[0].title.nlFormal}"""@nl-BE-x-formal`,
                    `<${ConceptSnapshotTestBuilder.LEGAL_RESOURCES[0].id}> <http://purl.org/dc/terms/title> """${ConceptSnapshotTestBuilder.LEGAL_RESOURCES[0].title.nlInformal}"""@nl-BE-x-informal`,
                    `<${ConceptSnapshotTestBuilder.LEGAL_RESOURCES[0].id}> <http://purl.org/dc/terms/title> """${ConceptSnapshotTestBuilder.LEGAL_RESOURCES[0].title.nlGeneratedFormal}"""@nl-BE-x-generated-formal`,
                    `<${ConceptSnapshotTestBuilder.LEGAL_RESOURCES[0].id}> <http://purl.org/dc/terms/title> """${ConceptSnapshotTestBuilder.LEGAL_RESOURCES[0].title.nlGeneratedInformal}"""@nl-BE-x-generated-informal`,
                    `<${ConceptSnapshotTestBuilder.LEGAL_RESOURCES[0].id}> <http://purl.org/dc/terms/description> """${ConceptSnapshotTestBuilder.LEGAL_RESOURCES[0].description.nl}"""@NL`,
                    `<${ConceptSnapshotTestBuilder.LEGAL_RESOURCES[0].id}> <http://purl.org/dc/terms/description> """${ConceptSnapshotTestBuilder.LEGAL_RESOURCES[0].description.nlFormal}"""@nl-BE-x-formal`,
                    `<${ConceptSnapshotTestBuilder.LEGAL_RESOURCES[0].id}> <http://purl.org/dc/terms/description> """${ConceptSnapshotTestBuilder.LEGAL_RESOURCES[0].description.nlInformal}"""@nl-BE-x-informal`,
                    `<${ConceptSnapshotTestBuilder.LEGAL_RESOURCES[0].id}> <http://purl.org/dc/terms/description> """${ConceptSnapshotTestBuilder.LEGAL_RESOURCES[0].description.nlGeneratedFormal}"""@nl-BE-x-generated-formal`,
                    `<${ConceptSnapshotTestBuilder.LEGAL_RESOURCES[0].id}> <http://purl.org/dc/terms/description> """${ConceptSnapshotTestBuilder.LEGAL_RESOURCES[0].description.nlGeneratedInformal}"""@nl-BE-x-generated-informal`,
                    `<${ConceptSnapshotTestBuilder.LEGAL_RESOURCES[0].id}> <http://schema.org/url> """${ConceptSnapshotTestBuilder.LEGAL_RESOURCES[0].url}"""`,
                    `<${ConceptSnapshotTestBuilder.LEGAL_RESOURCES[0].id}> <http://www.w3.org/ns/shacl#order> """1"""^^<http://www.w3.org/2001/XMLSchema#integer>`,
                    `<${conceptSnapshotId}> <http://data.europa.eu/m8g/hasLegalResource> <${ConceptSnapshotTestBuilder.LEGAL_RESOURCES[1].id}>`,
                    `<${ConceptSnapshotTestBuilder.LEGAL_RESOURCES[1].id}> a <http://data.europa.eu/eli/ontology#LegalResource>`,
                    `<${ConceptSnapshotTestBuilder.LEGAL_RESOURCES[1].id}> <http://purl.org/dc/terms/title> """${ConceptSnapshotTestBuilder.LEGAL_RESOURCES[1].title.nl}"""@NL`,
                    `<${ConceptSnapshotTestBuilder.LEGAL_RESOURCES[1].id}> <http://purl.org/dc/terms/title> """${ConceptSnapshotTestBuilder.LEGAL_RESOURCES[1].title.nlFormal}"""@nl-BE-x-formal`,
                    `<${ConceptSnapshotTestBuilder.LEGAL_RESOURCES[1].id}> <http://purl.org/dc/terms/title> """${ConceptSnapshotTestBuilder.LEGAL_RESOURCES[1].title.nlInformal}"""@nl-BE-x-informal`,
                    `<${ConceptSnapshotTestBuilder.LEGAL_RESOURCES[1].id}> <http://purl.org/dc/terms/title> """${ConceptSnapshotTestBuilder.LEGAL_RESOURCES[1].title.nlGeneratedFormal}"""@nl-BE-x-generated-formal`,
                    `<${ConceptSnapshotTestBuilder.LEGAL_RESOURCES[1].id}> <http://purl.org/dc/terms/title> """${ConceptSnapshotTestBuilder.LEGAL_RESOURCES[1].title.nlGeneratedInformal}"""@nl-BE-x-generated-informal`,
                    `<${ConceptSnapshotTestBuilder.LEGAL_RESOURCES[1].id}> <http://purl.org/dc/terms/description> """${ConceptSnapshotTestBuilder.LEGAL_RESOURCES[1].description.nl}"""@NL`,
                    `<${ConceptSnapshotTestBuilder.LEGAL_RESOURCES[1].id}> <http://purl.org/dc/terms/description> """${ConceptSnapshotTestBuilder.LEGAL_RESOURCES[1].description.nlFormal}"""@nl-BE-x-formal`,
                    `<${ConceptSnapshotTestBuilder.LEGAL_RESOURCES[1].id}> <http://purl.org/dc/terms/description> """${ConceptSnapshotTestBuilder.LEGAL_RESOURCES[1].description.nlInformal}"""@nl-BE-x-informal`,
                    `<${ConceptSnapshotTestBuilder.LEGAL_RESOURCES[1].id}> <http://purl.org/dc/terms/description> """${ConceptSnapshotTestBuilder.LEGAL_RESOURCES[1].description.nlGeneratedFormal}"""@nl-BE-x-generated-formal`,
                    `<${ConceptSnapshotTestBuilder.LEGAL_RESOURCES[1].id}> <http://purl.org/dc/terms/description> """${ConceptSnapshotTestBuilder.LEGAL_RESOURCES[1].description.nlGeneratedInformal}"""@nl-BE-x-generated-informal`,
                    `<${ConceptSnapshotTestBuilder.LEGAL_RESOURCES[1].id}> <http://schema.org/url> """${ConceptSnapshotTestBuilder.LEGAL_RESOURCES[1].url}"""`,
                    `<${ConceptSnapshotTestBuilder.LEGAL_RESOURCES[1].id}> <http://www.w3.org/ns/shacl#order> """2"""^^<http://www.w3.org/2001/XMLSchema#integer>`,
                ]);

            const actualConceptSnapshot = await repository.findById(conceptSnapshotId);

            expect(actualConceptSnapshot).toEqual(conceptSnapshot);
        });

        test('Verify full mappings - unknown language strings', async () => {
            const id = uuid();
            const conceptSnapshotId = buildConceptSnapshotIri(id);

            const conceptSnapshot =
                aFullConceptSnapshot()
                    .withId(conceptSnapshotId)
                    .build();

            await directDatabaseAccess.insertData(
                CONCEPT_SNAPSHOT_LDES_GRAPH,
                [
                    `<${conceptSnapshotId}> a <https://productencatalogus.data.vlaanderen.be/ns/ipdc-lpdc#ConceptualPublicServiceSnapshot>`,
                    `<${conceptSnapshotId}> <http://purl.org/dc/terms/title> """${ConceptSnapshotTestBuilder.TITLE_NL}"""@NL`,
                    `<${conceptSnapshotId}> <http://purl.org/dc/terms/title> """${ConceptSnapshotTestBuilder.TITLE_NL_FORMAL}"""@nl-BE-x-formal`,
                    `<${conceptSnapshotId}> <http://purl.org/dc/terms/title> """${ConceptSnapshotTestBuilder.TITLE_NL_INFORMAL}"""@nl-BE-x-informal`,
                    `<${conceptSnapshotId}> <http://purl.org/dc/terms/title> """${ConceptSnapshotTestBuilder.TITLE_NL_GENERATED_FORMAL}"""@nl-BE-x-generated-formal`,
                    `<${conceptSnapshotId}> <http://purl.org/dc/terms/title> """${ConceptSnapshotTestBuilder.TITLE_NL_GENERATED_INFORMAL}"""@nl-BE-x-generated-informal`,
                    `<${conceptSnapshotId}> <http://purl.org/dc/terms/title> """Concept Snapshot title english language is ignored"""@EN`,
                    `<${conceptSnapshotId}> <http://purl.org/dc/terms/title> """Concept Snapshot Title German language is ignored"""@de`,
                    `<${conceptSnapshotId}> <http://purl.org/dc/terms/title> """Concept Snapshot French language is ignored"""@fr`,
                    `<${conceptSnapshotId}> <http://purl.org/dc/terms/description> """Concept Snapshot description english language is ignored"""@EN`,
                    `<${conceptSnapshotId}> <http://purl.org/dc/terms/description> """${ConceptSnapshotTestBuilder.DESCRIPTION_NL}"""@NL`,
                    `<${conceptSnapshotId}> <http://purl.org/dc/terms/description> """${ConceptSnapshotTestBuilder.DESCRIPTION_NL_FORMAL}"""@nl-BE-x-formal`,
                    `<${conceptSnapshotId}> <http://purl.org/dc/terms/description> """${ConceptSnapshotTestBuilder.DESCRIPTION_NL_INFORMAL}"""@nl-BE-x-informal`,
                    `<${conceptSnapshotId}> <http://purl.org/dc/terms/description> """${ConceptSnapshotTestBuilder.DESCRIPTION_NL_GENERATED_FORMAL}"""@nl-BE-x-generated-formal`,
                    `<${conceptSnapshotId}> <http://purl.org/dc/terms/description> """${ConceptSnapshotTestBuilder.DESCRIPTION_NL_GENERATED_INFORMAL}"""@nl-BE-x-generated-informal`,
                    `<${conceptSnapshotId}> <http://purl.org/dc/terms/description> """Concept Snapshot Description German language is ignored"""@de`,
                    `<${conceptSnapshotId}> <http://purl.org/dc/terms/description> """Concept Snapshot Description language is ignored"""@fr`,
                    `<${conceptSnapshotId}> <https://productencatalogus.data.vlaanderen.be/ns/ipdc-lpdc#additionalDescription> """${ConceptSnapshotTestBuilder.ADDITIONAL_DESCRIPTION_NL}"""@NL`,
                    `<${conceptSnapshotId}> <https://productencatalogus.data.vlaanderen.be/ns/ipdc-lpdc#additionalDescription> """${ConceptSnapshotTestBuilder.ADDITIONAL_DESCRIPTION_NL_FORMAL}"""@nl-BE-x-formal`,
                    `<${conceptSnapshotId}> <https://productencatalogus.data.vlaanderen.be/ns/ipdc-lpdc#additionalDescription> """${ConceptSnapshotTestBuilder.ADDITIONAL_DESCRIPTION_NL_INFORMAL}"""@nl-BE-x-informal`,
                    `<${conceptSnapshotId}> <https://productencatalogus.data.vlaanderen.be/ns/ipdc-lpdc#additionalDescription> """${ConceptSnapshotTestBuilder.ADDITIONAL_DESCRIPTION_NL_GENERATED_FORMAL}"""@nl-BE-x-generated-formal`,
                    `<${conceptSnapshotId}> <https://productencatalogus.data.vlaanderen.be/ns/ipdc-lpdc#additionalDescription> """${ConceptSnapshotTestBuilder.ADDITIONAL_DESCRIPTION_NL_GENERATED_INFORMAL}"""@nl-BE-x-generated-informal`,
                    `<${conceptSnapshotId}> <https://productencatalogus.data.vlaanderen.be/ns/ipdc-lpdc#additionalDescription> """Concept Snapshot Additional Description German language is ignored"""@de`,
                    `<${conceptSnapshotId}> <https://productencatalogus.data.vlaanderen.be/ns/ipdc-lpdc#additionalDescription> """Concept Snapshot Additional Description language is ignored"""@fr`,
                    `<${conceptSnapshotId}> <https://productencatalogus.data.vlaanderen.be/ns/ipdc-lpdc#exception> """${ConceptSnapshotTestBuilder.EXCEPTION_NL}"""@NL`,
                    `<${conceptSnapshotId}> <https://productencatalogus.data.vlaanderen.be/ns/ipdc-lpdc#exception> """${ConceptSnapshotTestBuilder.EXCEPTION_NL_FORMAL}"""@nl-BE-x-formal`,
                    `<${conceptSnapshotId}> <https://productencatalogus.data.vlaanderen.be/ns/ipdc-lpdc#exception> """${ConceptSnapshotTestBuilder.EXCEPTION_NL_INFORMAL}"""@nl-BE-x-informal`,
                    `<${conceptSnapshotId}> <https://productencatalogus.data.vlaanderen.be/ns/ipdc-lpdc#exception> """${ConceptSnapshotTestBuilder.EXCEPTION_NL_GENERATED_FORMAL}"""@nl-BE-x-generated-formal`,
                    `<${conceptSnapshotId}> <https://productencatalogus.data.vlaanderen.be/ns/ipdc-lpdc#exception> """${ConceptSnapshotTestBuilder.EXCEPTION_NL_GENERATED_INFORMAL}"""@nl-BE-x-generated-informal`,
                    `<${conceptSnapshotId}> <https://productencatalogus.data.vlaanderen.be/ns/ipdc-lpdc#exception> """Concept Snapshot Exception German language is ignored"""@de`,
                    `<${conceptSnapshotId}> <https://productencatalogus.data.vlaanderen.be/ns/ipdc-lpdc#exception> """Concept Snapshot Exception language is ignored"""@fr`,
                    `<${conceptSnapshotId}> <https://productencatalogus.data.vlaanderen.be/ns/ipdc-lpdc#regulation> """${ConceptSnapshotTestBuilder.REGULATION_NL}"""@NL`,
                    `<${conceptSnapshotId}> <https://productencatalogus.data.vlaanderen.be/ns/ipdc-lpdc#regulation> """${ConceptSnapshotTestBuilder.REGULATION_NL_FORMAL}"""@nl-BE-x-formal`,
                    `<${conceptSnapshotId}> <https://productencatalogus.data.vlaanderen.be/ns/ipdc-lpdc#regulation> """${ConceptSnapshotTestBuilder.REGULATION_NL_INFORMAL}"""@nl-BE-x-informal`,
                    `<${conceptSnapshotId}> <https://productencatalogus.data.vlaanderen.be/ns/ipdc-lpdc#regulation> """${ConceptSnapshotTestBuilder.REGULATION_NL_GENERATED_FORMAL}"""@nl-BE-x-generated-formal`,
                    `<${conceptSnapshotId}> <https://productencatalogus.data.vlaanderen.be/ns/ipdc-lpdc#regulation> """${ConceptSnapshotTestBuilder.REGULATION_NL_GENERATED_INFORMAL}"""@nl-BE-x-generated-informal`,
                    `<${conceptSnapshotId}> <https://productencatalogus.data.vlaanderen.be/ns/ipdc-lpdc#regulation> """Concept Snapshot Regulation German language is ignored"""@de`,
                    `<${conceptSnapshotId}> <https://productencatalogus.data.vlaanderen.be/ns/ipdc-lpdc#regulation> """Concept Snapshot Regulation  language is ignored"""@fr`,
                    `<${conceptSnapshotId}> <http://schema.org/startDate> """${ConceptSnapshotTestBuilder.START_DATE.value}"""^^<http://www.w3.org/2001/XMLSchema#dateTime>`,
                    `<${conceptSnapshotId}> <http://schema.org/endDate> """${ConceptSnapshotTestBuilder.END_DATE.value}"""^^<http://www.w3.org/2001/XMLSchema#dateTime>`,
                    `<${conceptSnapshotId}> <http://purl.org/dc/terms/type> <${NS.dvc.type(ConceptSnapshotTestBuilder.TYPE).value}>`,
                    `<${conceptSnapshotId}> <https://productencatalogus.data.vlaanderen.be/ns/ipdc-lpdc#targetAudience> <${NS.dvc.doelgroep(ConceptSnapshotTestBuilder.TARGET_AUDIENCES[0]).value}>`,
                    `<${conceptSnapshotId}> <https://productencatalogus.data.vlaanderen.be/ns/ipdc-lpdc#targetAudience> <${NS.dvc.doelgroep(ConceptSnapshotTestBuilder.TARGET_AUDIENCES[1]).value}>`,
                    `<${conceptSnapshotId}> <https://productencatalogus.data.vlaanderen.be/ns/ipdc-lpdc#targetAudience> <${NS.dvc.doelgroep(ConceptSnapshotTestBuilder.TARGET_AUDIENCES[2]).value}>`,
                    `<${conceptSnapshotId}> <http://data.europa.eu/m8g/thematicArea> <${NS.dvc.thema(ConceptSnapshotTestBuilder.THEMES[0]).value}>`,
                    `<${conceptSnapshotId}> <http://data.europa.eu/m8g/thematicArea> <${NS.dvc.thema(ConceptSnapshotTestBuilder.THEMES[1]).value}>`,
                    `<${conceptSnapshotId}> <http://data.europa.eu/m8g/thematicArea> <${NS.dvc.thema(ConceptSnapshotTestBuilder.THEMES[2]).value}>`,
                    `<${conceptSnapshotId}> <https://productencatalogus.data.vlaanderen.be/ns/ipdc-lpdc#competentAuthorityLevel> <${NS.dvc.bevoegdBestuursniveau(ConceptSnapshotTestBuilder.COMPETENT_AUTHORITY_LEVELS[0]).value}>`,
                    `<${conceptSnapshotId}> <https://productencatalogus.data.vlaanderen.be/ns/ipdc-lpdc#competentAuthorityLevel> <${NS.dvc.bevoegdBestuursniveau(ConceptSnapshotTestBuilder.COMPETENT_AUTHORITY_LEVELS[1]).value}>`,
                    `<${conceptSnapshotId}> <https://productencatalogus.data.vlaanderen.be/ns/ipdc-lpdc#competentAuthorityLevel> <${NS.dvc.bevoegdBestuursniveau(ConceptSnapshotTestBuilder.COMPETENT_AUTHORITY_LEVELS[2]).value}>`,
                    `<${conceptSnapshotId}> <http://data.europa.eu/m8g/hasCompetentAuthority> <${ConceptSnapshotTestBuilder.COMPETENT_AUTHORITIES[0]}>`,
                    `<${conceptSnapshotId}> <http://data.europa.eu/m8g/hasCompetentAuthority> <${ConceptSnapshotTestBuilder.COMPETENT_AUTHORITIES[1]}>`,
                    `<${conceptSnapshotId}> <http://data.europa.eu/m8g/hasCompetentAuthority> <${ConceptSnapshotTestBuilder.COMPETENT_AUTHORITIES[2]}>`,
                    `<${conceptSnapshotId}> <https://productencatalogus.data.vlaanderen.be/ns/ipdc-lpdc#executingAuthorityLevel> <${NS.dvc.uitvoerendBestuursniveau(ConceptSnapshotTestBuilder.EXECUTING_AUTHORITY_LEVELS[0]).value}>`,
                    `<${conceptSnapshotId}> <https://productencatalogus.data.vlaanderen.be/ns/ipdc-lpdc#executingAuthorityLevel> <${NS.dvc.uitvoerendBestuursniveau(ConceptSnapshotTestBuilder.EXECUTING_AUTHORITY_LEVELS[1]).value}>`,
                    `<${conceptSnapshotId}> <https://productencatalogus.data.vlaanderen.be/ns/ipdc-lpdc#executingAuthorityLevel> <${NS.dvc.uitvoerendBestuursniveau(ConceptSnapshotTestBuilder.EXECUTING_AUTHORITY_LEVELS[2]).value}>`,
                    `<${conceptSnapshotId}> <https://productencatalogus.data.vlaanderen.be/ns/ipdc-lpdc#hasExecutingAuthority> <${ConceptSnapshotTestBuilder.EXECUTING_AUTHORITIES[0]}>`,
                    `<${conceptSnapshotId}> <https://productencatalogus.data.vlaanderen.be/ns/ipdc-lpdc#hasExecutingAuthority> <${ConceptSnapshotTestBuilder.EXECUTING_AUTHORITIES[1]}>`,
                    `<${conceptSnapshotId}> <https://productencatalogus.data.vlaanderen.be/ns/ipdc-lpdc#hasExecutingAuthority> <${ConceptSnapshotTestBuilder.EXECUTING_AUTHORITIES[2]}>`,
                    `<${conceptSnapshotId}> <https://productencatalogus.data.vlaanderen.be/ns/ipdc-lpdc#publicationMedium> <${NS.dvc.publicatieKanaal(ConceptSnapshotTestBuilder.PUBLICATION_MEDIA[0]).value}>`,
                    `<${conceptSnapshotId}> <https://productencatalogus.data.vlaanderen.be/ns/ipdc-lpdc#publicationMedium> <${NS.dvc.publicatieKanaal(ConceptSnapshotTestBuilder.PUBLICATION_MEDIA[1]).value}>`,
                    `<${conceptSnapshotId}> <https://productencatalogus.data.vlaanderen.be/ns/ipdc-lpdc#yourEuropeCategory> <${NS.dvc.yourEuropeCategorie(ConceptSnapshotTestBuilder.YOUR_EUROPE_CATEGORIES[0]).value}>`,
                    `<${conceptSnapshotId}> <https://productencatalogus.data.vlaanderen.be/ns/ipdc-lpdc#yourEuropeCategory> <${NS.dvc.yourEuropeCategorie(ConceptSnapshotTestBuilder.YOUR_EUROPE_CATEGORIES[1]).value}>`,
                    `<${conceptSnapshotId}> <https://productencatalogus.data.vlaanderen.be/ns/ipdc-lpdc#yourEuropeCategory> <${NS.dvc.yourEuropeCategorie(ConceptSnapshotTestBuilder.YOUR_EUROPE_CATEGORIES[2]).value}>`,
                    `<${conceptSnapshotId}> <http://www.w3.org/ns/dcat#keyword> """${ConceptSnapshotTestBuilder.KEYWORDS[0].nl}"""@nl`,
                    `<${conceptSnapshotId}> <http://www.w3.org/ns/dcat#keyword> """${ConceptSnapshotTestBuilder.KEYWORDS[1].nl}"""@nl`,
                    `<${conceptSnapshotId}> <http://www.w3.org/ns/dcat#keyword> """english keyword is ignored"""@en`,
                    `<${conceptSnapshotId}> <http://vocab.belgif.be/ns/publicservice#hasRequirement> <${ConceptSnapshotTestBuilder.REQUIREMENTS[1].id}>`,
                    `<${ConceptSnapshotTestBuilder.REQUIREMENTS[1].id}> a <http://data.europa.eu/m8g/Requirement>`,
                    `<${ConceptSnapshotTestBuilder.REQUIREMENTS[1].id}> <http://purl.org/dc/terms/title> """${ConceptSnapshotTestBuilder.REQUIREMENTS[1].title.nl}"""@NL`,
                    `<${ConceptSnapshotTestBuilder.REQUIREMENTS[1].id}> <http://purl.org/dc/terms/title> """${ConceptSnapshotTestBuilder.REQUIREMENTS[1].title.nlFormal}"""@nl-BE-x-formal`,
                    `<${ConceptSnapshotTestBuilder.REQUIREMENTS[1].id}> <http://purl.org/dc/terms/title> """${ConceptSnapshotTestBuilder.REQUIREMENTS[1].title.nlInformal}"""@nl-BE-x-informal`,
                    `<${ConceptSnapshotTestBuilder.REQUIREMENTS[1].id}> <http://purl.org/dc/terms/title> """${ConceptSnapshotTestBuilder.REQUIREMENTS[1].title.nlGeneratedFormal}"""@nl-BE-x-generated-formal`,
                    `<${ConceptSnapshotTestBuilder.REQUIREMENTS[1].id}> <http://purl.org/dc/terms/title> """${ConceptSnapshotTestBuilder.REQUIREMENTS[1].title.nlGeneratedInformal}"""@nl-BE-x-generated-informal`,
                    `<${ConceptSnapshotTestBuilder.REQUIREMENTS[1].id}> <http://purl.org/dc/terms/description> """${ConceptSnapshotTestBuilder.REQUIREMENTS[1].description.nl}"""@NL`,
                    `<${ConceptSnapshotTestBuilder.REQUIREMENTS[1].id}> <http://purl.org/dc/terms/description> """${ConceptSnapshotTestBuilder.REQUIREMENTS[1].description.nlFormal}"""@nl-BE-x-formal`,
                    `<${ConceptSnapshotTestBuilder.REQUIREMENTS[1].id}> <http://purl.org/dc/terms/description> """${ConceptSnapshotTestBuilder.REQUIREMENTS[1].description.nlInformal}"""@nl-BE-x-informal`,
                    `<${ConceptSnapshotTestBuilder.REQUIREMENTS[1].id}> <http://purl.org/dc/terms/description> """${ConceptSnapshotTestBuilder.REQUIREMENTS[1].description.nlGeneratedFormal}"""@nl-BE-x-generated-formal`,
                    `<${ConceptSnapshotTestBuilder.REQUIREMENTS[1].id}> <http://purl.org/dc/terms/description> """${ConceptSnapshotTestBuilder.REQUIREMENTS[1].description.nlGeneratedInformal}"""@nl-BE-x-generated-informal`,
                    `<${ConceptSnapshotTestBuilder.REQUIREMENTS[1].id}> <http://www.w3.org/ns/shacl#order> """2"""^^<http://www.w3.org/2001/XMLSchema#integer>`,
                    `<${ConceptSnapshotTestBuilder.REQUIREMENTS[1].id}> <http://data.europa.eu/m8g/hasSupportingEvidence> <${ConceptSnapshotTestBuilder.REQUIREMENTS[1].evidence.id}>`,
                    `<${ConceptSnapshotTestBuilder.REQUIREMENTS[1].evidence.id}> a <http://data.europa.eu/m8g/Evidence>`,
                    `<${ConceptSnapshotTestBuilder.REQUIREMENTS[1].evidence.id}> <http://purl.org/dc/terms/title> """${ConceptSnapshotTestBuilder.REQUIREMENTS[1].evidence.title.nl}"""@NL`,
                    `<${ConceptSnapshotTestBuilder.REQUIREMENTS[1].evidence.id}> <http://purl.org/dc/terms/title> """${ConceptSnapshotTestBuilder.REQUIREMENTS[1].evidence.title.nlFormal}"""@nl-BE-x-formal`,
                    `<${ConceptSnapshotTestBuilder.REQUIREMENTS[1].evidence.id}> <http://purl.org/dc/terms/title> """${ConceptSnapshotTestBuilder.REQUIREMENTS[1].evidence.title.nlInformal}"""@nl-BE-x-informal`,
                    `<${ConceptSnapshotTestBuilder.REQUIREMENTS[1].evidence.id}> <http://purl.org/dc/terms/title> """${ConceptSnapshotTestBuilder.REQUIREMENTS[1].evidence.title.nlGeneratedFormal}"""@nl-BE-x-generated-formal`,
                    `<${ConceptSnapshotTestBuilder.REQUIREMENTS[1].evidence.id}> <http://purl.org/dc/terms/title> """${ConceptSnapshotTestBuilder.REQUIREMENTS[1].evidence.title.nlGeneratedInformal}"""@nl-BE-x-generated-informal`,
                    `<${ConceptSnapshotTestBuilder.REQUIREMENTS[1].evidence.id}> <http://purl.org/dc/terms/description> """${ConceptSnapshotTestBuilder.REQUIREMENTS[1].evidence.description.nl}"""@NL`,
                    `<${ConceptSnapshotTestBuilder.REQUIREMENTS[1].evidence.id}> <http://purl.org/dc/terms/description> """${ConceptSnapshotTestBuilder.REQUIREMENTS[1].evidence.description.nlFormal}"""@nl-BE-x-formal`,
                    `<${ConceptSnapshotTestBuilder.REQUIREMENTS[1].evidence.id}> <http://purl.org/dc/terms/description> """${ConceptSnapshotTestBuilder.REQUIREMENTS[1].evidence.description.nlInformal}"""@nl-BE-x-informal`,
                    `<${ConceptSnapshotTestBuilder.REQUIREMENTS[1].evidence.id}> <http://purl.org/dc/terms/description> """${ConceptSnapshotTestBuilder.REQUIREMENTS[1].evidence.description.nlGeneratedFormal}"""@nl-BE-x-generated-formal`,
                    `<${ConceptSnapshotTestBuilder.REQUIREMENTS[1].evidence.id}> <http://purl.org/dc/terms/description> """${ConceptSnapshotTestBuilder.REQUIREMENTS[1].evidence.description.nlGeneratedInformal}"""@nl-BE-x-generated-informal`,
                    `<${conceptSnapshotId}> <http://vocab.belgif.be/ns/publicservice#hasRequirement> <${ConceptSnapshotTestBuilder.REQUIREMENTS[0].id}>`,
                    `<${ConceptSnapshotTestBuilder.REQUIREMENTS[0].id}> a <http://data.europa.eu/m8g/Requirement>`,
                    `<${ConceptSnapshotTestBuilder.REQUIREMENTS[0].id}> <http://purl.org/dc/terms/title> """${ConceptSnapshotTestBuilder.REQUIREMENTS[0].title.nl}"""@NL`,
                    `<${ConceptSnapshotTestBuilder.REQUIREMENTS[0].id}> <http://purl.org/dc/terms/title> """${ConceptSnapshotTestBuilder.REQUIREMENTS[0].title.nlFormal}"""@nl-BE-x-formal`,
                    `<${ConceptSnapshotTestBuilder.REQUIREMENTS[0].id}> <http://purl.org/dc/terms/title> """${ConceptSnapshotTestBuilder.REQUIREMENTS[0].title.nlInformal}"""@nl-BE-x-informal`,
                    `<${ConceptSnapshotTestBuilder.REQUIREMENTS[0].id}> <http://purl.org/dc/terms/title> """${ConceptSnapshotTestBuilder.REQUIREMENTS[0].title.nlGeneratedFormal}"""@nl-BE-x-generated-formal`,
                    `<${ConceptSnapshotTestBuilder.REQUIREMENTS[0].id}> <http://purl.org/dc/terms/title> """${ConceptSnapshotTestBuilder.REQUIREMENTS[0].title.nlGeneratedInformal}"""@nl-BE-x-generated-informal`,
                    `<${ConceptSnapshotTestBuilder.REQUIREMENTS[0].id}> <http://purl.org/dc/terms/description> """${ConceptSnapshotTestBuilder.REQUIREMENTS[0].description.nl}"""@NL`,
                    `<${ConceptSnapshotTestBuilder.REQUIREMENTS[0].id}> <http://purl.org/dc/terms/description> """${ConceptSnapshotTestBuilder.REQUIREMENTS[0].description.nlFormal}"""@nl-BE-x-formal`,
                    `<${ConceptSnapshotTestBuilder.REQUIREMENTS[0].id}> <http://purl.org/dc/terms/description> """${ConceptSnapshotTestBuilder.REQUIREMENTS[0].description.nlInformal}"""@nl-BE-x-informal`,
                    `<${ConceptSnapshotTestBuilder.REQUIREMENTS[0].id}> <http://purl.org/dc/terms/description> """${ConceptSnapshotTestBuilder.REQUIREMENTS[0].description.nlGeneratedFormal}"""@nl-BE-x-generated-formal`,
                    `<${ConceptSnapshotTestBuilder.REQUIREMENTS[0].id}> <http://purl.org/dc/terms/description> """${ConceptSnapshotTestBuilder.REQUIREMENTS[0].description.nlGeneratedInformal}"""@nl-BE-x-generated-informal`,
                    `<${ConceptSnapshotTestBuilder.REQUIREMENTS[0].id}> <http://www.w3.org/ns/shacl#order> """1"""^^<http://www.w3.org/2001/XMLSchema#integer>`,
                    `<${ConceptSnapshotTestBuilder.REQUIREMENTS[0].id}> <http://data.europa.eu/m8g/hasSupportingEvidence> <${ConceptSnapshotTestBuilder.REQUIREMENTS[0].evidence.id}>`,
                    `<${ConceptSnapshotTestBuilder.REQUIREMENTS[0].evidence.id}> a <http://data.europa.eu/m8g/Evidence>`,
                    `<${ConceptSnapshotTestBuilder.REQUIREMENTS[0].evidence.id}> <http://purl.org/dc/terms/title> """${ConceptSnapshotTestBuilder.REQUIREMENTS[0].evidence.title.nl}"""@NL`,
                    `<${ConceptSnapshotTestBuilder.REQUIREMENTS[0].evidence.id}> <http://purl.org/dc/terms/title> """${ConceptSnapshotTestBuilder.REQUIREMENTS[0].evidence.title.nlFormal}"""@nl-BE-x-formal`,
                    `<${ConceptSnapshotTestBuilder.REQUIREMENTS[0].evidence.id}> <http://purl.org/dc/terms/title> """${ConceptSnapshotTestBuilder.REQUIREMENTS[0].evidence.title.nlInformal}"""@nl-BE-x-informal`,
                    `<${ConceptSnapshotTestBuilder.REQUIREMENTS[0].evidence.id}> <http://purl.org/dc/terms/title> """${ConceptSnapshotTestBuilder.REQUIREMENTS[0].evidence.title.nlGeneratedFormal}"""@nl-BE-x-generated-formal`,
                    `<${ConceptSnapshotTestBuilder.REQUIREMENTS[0].evidence.id}> <http://purl.org/dc/terms/title> """${ConceptSnapshotTestBuilder.REQUIREMENTS[0].evidence.title.nlGeneratedInformal}"""@nl-BE-x-generated-informal`,
                    `<${ConceptSnapshotTestBuilder.REQUIREMENTS[0].evidence.id}> <http://purl.org/dc/terms/description> """${ConceptSnapshotTestBuilder.REQUIREMENTS[0].evidence.description.nl}"""@NL`,
                    `<${ConceptSnapshotTestBuilder.REQUIREMENTS[0].evidence.id}> <http://purl.org/dc/terms/description> """${ConceptSnapshotTestBuilder.REQUIREMENTS[0].evidence.description.nlFormal}"""@nl-BE-x-formal`,
                    `<${ConceptSnapshotTestBuilder.REQUIREMENTS[0].evidence.id}> <http://purl.org/dc/terms/description> """${ConceptSnapshotTestBuilder.REQUIREMENTS[0].evidence.description.nlInformal}"""@nl-BE-x-informal`,
                    `<${ConceptSnapshotTestBuilder.REQUIREMENTS[0].evidence.id}> <http://purl.org/dc/terms/description> """${ConceptSnapshotTestBuilder.REQUIREMENTS[0].evidence.description.nlGeneratedFormal}"""@nl-BE-x-generated-formal`,
                    `<${ConceptSnapshotTestBuilder.REQUIREMENTS[0].evidence.id}> <http://purl.org/dc/terms/description> """${ConceptSnapshotTestBuilder.REQUIREMENTS[0].evidence.description.nlGeneratedInformal}"""@nl-BE-x-generated-informal`,
                    `<${conceptSnapshotId}> <http://purl.org/vocab/cpsv#follows> <${ConceptSnapshotTestBuilder.PROCEDURES[1].id}>`,
                    `<${ConceptSnapshotTestBuilder.PROCEDURES[1].id}> a <http://purl.org/vocab/cpsv#Rule>`,
                    `<${ConceptSnapshotTestBuilder.PROCEDURES[1].id}> <http://purl.org/dc/terms/title> """${ConceptSnapshotTestBuilder.PROCEDURES[1].title.nl}"""@NL`,
                    `<${ConceptSnapshotTestBuilder.PROCEDURES[1].id}> <http://purl.org/dc/terms/title> """${ConceptSnapshotTestBuilder.PROCEDURES[1].title.nlFormal}"""@nl-BE-x-formal`,
                    `<${ConceptSnapshotTestBuilder.PROCEDURES[1].id}> <http://purl.org/dc/terms/title> """${ConceptSnapshotTestBuilder.PROCEDURES[1].title.nlInformal}"""@nl-BE-x-informal`,
                    `<${ConceptSnapshotTestBuilder.PROCEDURES[1].id}> <http://purl.org/dc/terms/title> """${ConceptSnapshotTestBuilder.PROCEDURES[1].title.nlGeneratedFormal}"""@nl-BE-x-generated-formal`,
                    `<${ConceptSnapshotTestBuilder.PROCEDURES[1].id}> <http://purl.org/dc/terms/title> """${ConceptSnapshotTestBuilder.PROCEDURES[1].title.nlGeneratedInformal}"""@nl-BE-x-generated-informal`,
                    `<${ConceptSnapshotTestBuilder.PROCEDURES[1].id}> <http://purl.org/dc/terms/description> """${ConceptSnapshotTestBuilder.PROCEDURES[1].description.nl}"""@NL`,
                    `<${ConceptSnapshotTestBuilder.PROCEDURES[1].id}> <http://purl.org/dc/terms/description> """${ConceptSnapshotTestBuilder.PROCEDURES[1].description.nlFormal}"""@nl-BE-x-formal`,
                    `<${ConceptSnapshotTestBuilder.PROCEDURES[1].id}> <http://purl.org/dc/terms/description> """${ConceptSnapshotTestBuilder.PROCEDURES[1].description.nlInformal}"""@nl-BE-x-informal`,
                    `<${ConceptSnapshotTestBuilder.PROCEDURES[1].id}> <http://purl.org/dc/terms/description> """${ConceptSnapshotTestBuilder.PROCEDURES[1].description.nlGeneratedFormal}"""@nl-BE-x-generated-formal`,
                    `<${ConceptSnapshotTestBuilder.PROCEDURES[1].id}> <http://purl.org/dc/terms/description> """${ConceptSnapshotTestBuilder.PROCEDURES[1].description.nlGeneratedInformal}"""@nl-BE-x-generated-informal`,
                    `<${ConceptSnapshotTestBuilder.PROCEDURES[1].id}> <http://www.w3.org/ns/shacl#order> """2"""^^<http://www.w3.org/2001/XMLSchema#integer>`,
                    `<${ConceptSnapshotTestBuilder.PROCEDURES[1].id}> <https://productencatalogus.data.vlaanderen.be/ns/ipdc-lpdc#hasWebsite> <${ConceptSnapshotTestBuilder.PROCEDURES[1].websites[1].id}>`,
                    `<${ConceptSnapshotTestBuilder.PROCEDURES[1].websites[1].id}> a <http://schema.org/WebSite>`,
                    `<${ConceptSnapshotTestBuilder.PROCEDURES[1].websites[1].id}> <http://purl.org/dc/terms/title> """${ConceptSnapshotTestBuilder.PROCEDURES[1].websites[1].title.nl}"""@NL`,
                    `<${ConceptSnapshotTestBuilder.PROCEDURES[1].websites[1].id}> <http://purl.org/dc/terms/title> """${ConceptSnapshotTestBuilder.PROCEDURES[1].websites[1].title.nlFormal}"""@nl-BE-x-formal`,
                    `<${ConceptSnapshotTestBuilder.PROCEDURES[1].websites[1].id}> <http://purl.org/dc/terms/title> """${ConceptSnapshotTestBuilder.PROCEDURES[1].websites[1].title.nlInformal}"""@nl-BE-x-informal`,
                    `<${ConceptSnapshotTestBuilder.PROCEDURES[1].websites[1].id}> <http://purl.org/dc/terms/title> """${ConceptSnapshotTestBuilder.PROCEDURES[1].websites[1].title.nlGeneratedFormal}"""@nl-BE-x-generated-formal`,
                    `<${ConceptSnapshotTestBuilder.PROCEDURES[1].websites[1].id}> <http://purl.org/dc/terms/title> """${ConceptSnapshotTestBuilder.PROCEDURES[1].websites[1].title.nlGeneratedInformal}"""@nl-BE-x-generated-informal`,
                    `<${ConceptSnapshotTestBuilder.PROCEDURES[1].websites[1].id}> <http://purl.org/dc/terms/description> """${ConceptSnapshotTestBuilder.PROCEDURES[1].websites[1].description.nl}"""@NL`,
                    `<${ConceptSnapshotTestBuilder.PROCEDURES[1].websites[1].id}> <http://purl.org/dc/terms/description> """${ConceptSnapshotTestBuilder.PROCEDURES[1].websites[1].description.nlFormal}"""@nl-BE-x-formal`,
                    `<${ConceptSnapshotTestBuilder.PROCEDURES[1].websites[1].id}> <http://purl.org/dc/terms/description> """${ConceptSnapshotTestBuilder.PROCEDURES[1].websites[1].description.nlInformal}"""@nl-BE-x-informal`,
                    `<${ConceptSnapshotTestBuilder.PROCEDURES[1].websites[1].id}> <http://purl.org/dc/terms/description> """${ConceptSnapshotTestBuilder.PROCEDURES[1].websites[1].description.nlGeneratedFormal}"""@nl-BE-x-generated-formal`,
                    `<${ConceptSnapshotTestBuilder.PROCEDURES[1].websites[1].id}> <http://purl.org/dc/terms/description> """${ConceptSnapshotTestBuilder.PROCEDURES[1].websites[1].description.nlGeneratedInformal}"""@nl-BE-x-generated-informal`,
                    `<${ConceptSnapshotTestBuilder.PROCEDURES[1].websites[1].id}> <http://schema.org/url> """${ConceptSnapshotTestBuilder.PROCEDURES[1].websites[1].url}"""`,
                    `<${ConceptSnapshotTestBuilder.PROCEDURES[1].websites[1].id}> <http://www.w3.org/ns/shacl#order> """2"""^^<http://www.w3.org/2001/XMLSchema#integer>`,
                    `<${ConceptSnapshotTestBuilder.PROCEDURES[1].id}> <https://productencatalogus.data.vlaanderen.be/ns/ipdc-lpdc#hasWebsite> <${ConceptSnapshotTestBuilder.PROCEDURES[1].websites[0].id}>`,
                    `<${ConceptSnapshotTestBuilder.PROCEDURES[1].websites[0].id}> a <http://schema.org/WebSite>`,
                    `<${ConceptSnapshotTestBuilder.PROCEDURES[1].websites[0].id}> <http://purl.org/dc/terms/title> """${ConceptSnapshotTestBuilder.PROCEDURES[1].websites[0].title.nl}"""@NL`,
                    `<${ConceptSnapshotTestBuilder.PROCEDURES[1].websites[0].id}> <http://purl.org/dc/terms/title> """${ConceptSnapshotTestBuilder.PROCEDURES[1].websites[0].title.nlFormal}"""@nl-BE-x-formal`,
                    `<${ConceptSnapshotTestBuilder.PROCEDURES[1].websites[0].id}> <http://purl.org/dc/terms/title> """${ConceptSnapshotTestBuilder.PROCEDURES[1].websites[0].title.nlInformal}"""@nl-BE-x-informal`,
                    `<${ConceptSnapshotTestBuilder.PROCEDURES[1].websites[0].id}> <http://purl.org/dc/terms/title> """${ConceptSnapshotTestBuilder.PROCEDURES[1].websites[0].title.nlGeneratedFormal}"""@nl-BE-x-generated-formal`,
                    `<${ConceptSnapshotTestBuilder.PROCEDURES[1].websites[0].id}> <http://purl.org/dc/terms/title> """${ConceptSnapshotTestBuilder.PROCEDURES[1].websites[0].title.nlGeneratedInformal}"""@nl-BE-x-generated-informal`,
                    `<${ConceptSnapshotTestBuilder.PROCEDURES[1].websites[0].id}> <http://purl.org/dc/terms/description> """${ConceptSnapshotTestBuilder.PROCEDURES[1].websites[0].description.nl}"""@NL`,
                    `<${ConceptSnapshotTestBuilder.PROCEDURES[1].websites[0].id}> <http://purl.org/dc/terms/description> """${ConceptSnapshotTestBuilder.PROCEDURES[1].websites[0].description.nlFormal}"""@nl-BE-x-formal`,
                    `<${ConceptSnapshotTestBuilder.PROCEDURES[1].websites[0].id}> <http://purl.org/dc/terms/description> """${ConceptSnapshotTestBuilder.PROCEDURES[1].websites[0].description.nlInformal}"""@nl-BE-x-informal`,
                    `<${ConceptSnapshotTestBuilder.PROCEDURES[1].websites[0].id}> <http://purl.org/dc/terms/description> """${ConceptSnapshotTestBuilder.PROCEDURES[1].websites[0].description.nlGeneratedFormal}"""@nl-BE-x-generated-formal`,
                    `<${ConceptSnapshotTestBuilder.PROCEDURES[1].websites[0].id}> <http://purl.org/dc/terms/description> """${ConceptSnapshotTestBuilder.PROCEDURES[1].websites[0].description.nlGeneratedInformal}"""@nl-BE-x-generated-informal`,
                    `<${ConceptSnapshotTestBuilder.PROCEDURES[1].websites[0].id}> <http://schema.org/url> """${ConceptSnapshotTestBuilder.PROCEDURES[1].websites[0].url}"""`,
                    `<${ConceptSnapshotTestBuilder.PROCEDURES[1].websites[0].id}> <http://www.w3.org/ns/shacl#order> """1"""^^<http://www.w3.org/2001/XMLSchema#integer>`,
                    `<${conceptSnapshotId}> <http://purl.org/vocab/cpsv#follows> <${ConceptSnapshotTestBuilder.PROCEDURES[0].id}>`,
                    `<${ConceptSnapshotTestBuilder.PROCEDURES[0].id}> a <http://purl.org/vocab/cpsv#Rule>`,
                    `<${ConceptSnapshotTestBuilder.PROCEDURES[0].id}> <http://purl.org/dc/terms/title> """${ConceptSnapshotTestBuilder.PROCEDURES[0].title.nl}"""@NL`,
                    `<${ConceptSnapshotTestBuilder.PROCEDURES[0].id}> <http://purl.org/dc/terms/title> """${ConceptSnapshotTestBuilder.PROCEDURES[0].title.nlFormal}"""@nl-BE-x-formal`,
                    `<${ConceptSnapshotTestBuilder.PROCEDURES[0].id}> <http://purl.org/dc/terms/title> """${ConceptSnapshotTestBuilder.PROCEDURES[0].title.nlInformal}"""@nl-BE-x-informal`,
                    `<${ConceptSnapshotTestBuilder.PROCEDURES[0].id}> <http://purl.org/dc/terms/title> """${ConceptSnapshotTestBuilder.PROCEDURES[0].title.nlGeneratedFormal}"""@nl-BE-x-generated-formal`,
                    `<${ConceptSnapshotTestBuilder.PROCEDURES[0].id}> <http://purl.org/dc/terms/title> """${ConceptSnapshotTestBuilder.PROCEDURES[0].title.nlGeneratedInformal}"""@nl-BE-x-generated-informal`,
                    `<${ConceptSnapshotTestBuilder.PROCEDURES[0].id}> <http://purl.org/dc/terms/description> """${ConceptSnapshotTestBuilder.PROCEDURES[0].description.nl}"""@NL`,
                    `<${ConceptSnapshotTestBuilder.PROCEDURES[0].id}> <http://purl.org/dc/terms/description> """${ConceptSnapshotTestBuilder.PROCEDURES[0].description.nlFormal}"""@nl-BE-x-formal`,
                    `<${ConceptSnapshotTestBuilder.PROCEDURES[0].id}> <http://purl.org/dc/terms/description> """${ConceptSnapshotTestBuilder.PROCEDURES[0].description.nlInformal}"""@nl-BE-x-informal`,
                    `<${ConceptSnapshotTestBuilder.PROCEDURES[0].id}> <http://purl.org/dc/terms/description> """${ConceptSnapshotTestBuilder.PROCEDURES[0].description.nlGeneratedFormal}"""@nl-BE-x-generated-formal`,
                    `<${ConceptSnapshotTestBuilder.PROCEDURES[0].id}> <http://purl.org/dc/terms/description> """${ConceptSnapshotTestBuilder.PROCEDURES[0].description.nlGeneratedInformal}"""@nl-BE-x-generated-informal`,
                    `<${ConceptSnapshotTestBuilder.PROCEDURES[0].id}> <http://www.w3.org/ns/shacl#order> """1"""^^<http://www.w3.org/2001/XMLSchema#integer>`,
                    `<${ConceptSnapshotTestBuilder.PROCEDURES[0].id}> <https://productencatalogus.data.vlaanderen.be/ns/ipdc-lpdc#hasWebsite> <${ConceptSnapshotTestBuilder.PROCEDURES[0].websites[1].id}>`,
                    `<${ConceptSnapshotTestBuilder.PROCEDURES[0].websites[1].id}> a <http://schema.org/WebSite>`,
                    `<${ConceptSnapshotTestBuilder.PROCEDURES[0].websites[1].id}> <http://purl.org/dc/terms/title> """${ConceptSnapshotTestBuilder.PROCEDURES[0].websites[1].title.nl}"""@NL`,
                    `<${ConceptSnapshotTestBuilder.PROCEDURES[0].websites[1].id}> <http://purl.org/dc/terms/title> """${ConceptSnapshotTestBuilder.PROCEDURES[0].websites[1].title.nlFormal}"""@nl-BE-x-formal`,
                    `<${ConceptSnapshotTestBuilder.PROCEDURES[0].websites[1].id}> <http://purl.org/dc/terms/title> """${ConceptSnapshotTestBuilder.PROCEDURES[0].websites[1].title.nlInformal}"""@nl-BE-x-informal`,
                    `<${ConceptSnapshotTestBuilder.PROCEDURES[0].websites[1].id}> <http://purl.org/dc/terms/title> """${ConceptSnapshotTestBuilder.PROCEDURES[0].websites[1].title.nlGeneratedFormal}"""@nl-BE-x-generated-formal`,
                    `<${ConceptSnapshotTestBuilder.PROCEDURES[0].websites[1].id}> <http://purl.org/dc/terms/title> """${ConceptSnapshotTestBuilder.PROCEDURES[0].websites[1].title.nlGeneratedInformal}"""@nl-BE-x-generated-informal`,
                    `<${ConceptSnapshotTestBuilder.PROCEDURES[0].websites[1].id}> <http://purl.org/dc/terms/description> """${ConceptSnapshotTestBuilder.PROCEDURES[0].websites[1].description.nl}"""@NL`,
                    `<${ConceptSnapshotTestBuilder.PROCEDURES[0].websites[1].id}> <http://purl.org/dc/terms/description> """${ConceptSnapshotTestBuilder.PROCEDURES[0].websites[1].description.nlFormal}"""@nl-BE-x-formal`,
                    `<${ConceptSnapshotTestBuilder.PROCEDURES[0].websites[1].id}> <http://purl.org/dc/terms/description> """${ConceptSnapshotTestBuilder.PROCEDURES[0].websites[1].description.nlInformal}"""@nl-BE-x-informal`,
                    `<${ConceptSnapshotTestBuilder.PROCEDURES[0].websites[1].id}> <http://purl.org/dc/terms/description> """${ConceptSnapshotTestBuilder.PROCEDURES[0].websites[1].description.nlGeneratedFormal}"""@nl-BE-x-generated-formal`,
                    `<${ConceptSnapshotTestBuilder.PROCEDURES[0].websites[1].id}> <http://purl.org/dc/terms/description> """${ConceptSnapshotTestBuilder.PROCEDURES[0].websites[1].description.nlGeneratedInformal}"""@nl-BE-x-generated-informal`,
                    `<${ConceptSnapshotTestBuilder.PROCEDURES[0].websites[1].id}> <http://schema.org/url> """${ConceptSnapshotTestBuilder.PROCEDURES[0].websites[1].url}"""`,
                    `<${ConceptSnapshotTestBuilder.PROCEDURES[0].websites[1].id}> <http://www.w3.org/ns/shacl#order> """2"""^^<http://www.w3.org/2001/XMLSchema#integer>`,
                    `<${ConceptSnapshotTestBuilder.PROCEDURES[0].id}> <https://productencatalogus.data.vlaanderen.be/ns/ipdc-lpdc#hasWebsite> <${ConceptSnapshotTestBuilder.PROCEDURES[0].websites[0].id}>`,
                    `<${ConceptSnapshotTestBuilder.PROCEDURES[0].websites[0].id}> a <http://schema.org/WebSite>`,
                    `<${ConceptSnapshotTestBuilder.PROCEDURES[0].websites[0].id}> <http://purl.org/dc/terms/title> """${ConceptSnapshotTestBuilder.PROCEDURES[0].websites[0].title.nl}"""@NL`,
                    `<${ConceptSnapshotTestBuilder.PROCEDURES[0].websites[0].id}> <http://purl.org/dc/terms/title> """${ConceptSnapshotTestBuilder.PROCEDURES[0].websites[0].title.nlFormal}"""@nl-BE-x-formal`,
                    `<${ConceptSnapshotTestBuilder.PROCEDURES[0].websites[0].id}> <http://purl.org/dc/terms/title> """${ConceptSnapshotTestBuilder.PROCEDURES[0].websites[0].title.nlInformal}"""@nl-BE-x-informal`,
                    `<${ConceptSnapshotTestBuilder.PROCEDURES[0].websites[0].id}> <http://purl.org/dc/terms/title> """${ConceptSnapshotTestBuilder.PROCEDURES[0].websites[0].title.nlGeneratedFormal}"""@nl-BE-x-generated-formal`,
                    `<${ConceptSnapshotTestBuilder.PROCEDURES[0].websites[0].id}> <http://purl.org/dc/terms/title> """${ConceptSnapshotTestBuilder.PROCEDURES[0].websites[0].title.nlGeneratedInformal}"""@nl-BE-x-generated-informal`,
                    `<${ConceptSnapshotTestBuilder.PROCEDURES[0].websites[0].id}> <http://purl.org/dc/terms/description> """${ConceptSnapshotTestBuilder.PROCEDURES[0].websites[0].description.nl}"""@NL`,
                    `<${ConceptSnapshotTestBuilder.PROCEDURES[0].websites[0].id}> <http://purl.org/dc/terms/description> """${ConceptSnapshotTestBuilder.PROCEDURES[0].websites[0].description.nlFormal}"""@nl-BE-x-formal`,
                    `<${ConceptSnapshotTestBuilder.PROCEDURES[0].websites[0].id}> <http://purl.org/dc/terms/description> """${ConceptSnapshotTestBuilder.PROCEDURES[0].websites[0].description.nlInformal}"""@nl-BE-x-informal`,
                    `<${ConceptSnapshotTestBuilder.PROCEDURES[0].websites[0].id}> <http://purl.org/dc/terms/description> """${ConceptSnapshotTestBuilder.PROCEDURES[0].websites[0].description.nlGeneratedFormal}"""@nl-BE-x-generated-formal`,
                    `<${ConceptSnapshotTestBuilder.PROCEDURES[0].websites[0].id}> <http://purl.org/dc/terms/description> """${ConceptSnapshotTestBuilder.PROCEDURES[0].websites[0].description.nlGeneratedInformal}"""@nl-BE-x-generated-informal`,
                    `<${ConceptSnapshotTestBuilder.PROCEDURES[0].websites[0].id}> <http://schema.org/url> """${ConceptSnapshotTestBuilder.PROCEDURES[0].websites[0].url}"""`,
                    `<${ConceptSnapshotTestBuilder.PROCEDURES[0].websites[0].id}> <http://www.w3.org/ns/shacl#order> """1"""^^<http://www.w3.org/2001/XMLSchema#integer>`,
                    `<${conceptSnapshotId}> <http://www.w3.org/2000/01/rdf-schema#seeAlso> <${ConceptSnapshotTestBuilder.WEBSITES[1].id}>`,
                    `<${ConceptSnapshotTestBuilder.WEBSITES[1].id}> a <http://schema.org/WebSite>`,
                    `<${ConceptSnapshotTestBuilder.WEBSITES[1].id}> <http://purl.org/dc/terms/title> """${ConceptSnapshotTestBuilder.WEBSITES[1].title.nl}"""@NL`,
                    `<${ConceptSnapshotTestBuilder.WEBSITES[1].id}> <http://purl.org/dc/terms/title> """${ConceptSnapshotTestBuilder.WEBSITES[1].title.nlFormal}"""@nl-BE-x-formal`,
                    `<${ConceptSnapshotTestBuilder.WEBSITES[1].id}> <http://purl.org/dc/terms/title> """${ConceptSnapshotTestBuilder.WEBSITES[1].title.nlInformal}"""@nl-BE-x-informal`,
                    `<${ConceptSnapshotTestBuilder.WEBSITES[1].id}> <http://purl.org/dc/terms/title> """${ConceptSnapshotTestBuilder.WEBSITES[1].title.nlGeneratedFormal}"""@nl-BE-x-generated-formal`,
                    `<${ConceptSnapshotTestBuilder.WEBSITES[1].id}> <http://purl.org/dc/terms/title> """${ConceptSnapshotTestBuilder.WEBSITES[1].title.nlGeneratedInformal}"""@nl-BE-x-generated-informal`,
                    `<${ConceptSnapshotTestBuilder.WEBSITES[1].id}> <http://purl.org/dc/terms/description> """${ConceptSnapshotTestBuilder.WEBSITES[1].description.nl}"""@NL`,
                    `<${ConceptSnapshotTestBuilder.WEBSITES[1].id}> <http://purl.org/dc/terms/description> """${ConceptSnapshotTestBuilder.WEBSITES[1].description.nlFormal}"""@nl-BE-x-formal`,
                    `<${ConceptSnapshotTestBuilder.WEBSITES[1].id}> <http://purl.org/dc/terms/description> """${ConceptSnapshotTestBuilder.WEBSITES[1].description.nlInformal}"""@nl-BE-x-informal`,
                    `<${ConceptSnapshotTestBuilder.WEBSITES[1].id}> <http://purl.org/dc/terms/description> """${ConceptSnapshotTestBuilder.WEBSITES[1].description.nlGeneratedFormal}"""@nl-BE-x-generated-formal`,
                    `<${ConceptSnapshotTestBuilder.WEBSITES[1].id}> <http://purl.org/dc/terms/description> """${ConceptSnapshotTestBuilder.WEBSITES[1].description.nlGeneratedInformal}"""@nl-BE-x-generated-informal`,
                    `<${ConceptSnapshotTestBuilder.WEBSITES[1].id}> <http://schema.org/url> """${ConceptSnapshotTestBuilder.WEBSITES[1].url}"""`,
                    `<${ConceptSnapshotTestBuilder.WEBSITES[1].id}> <http://www.w3.org/ns/shacl#order> """2"""^^<http://www.w3.org/2001/XMLSchema#integer>`,
                    `<${conceptSnapshotId}> <http://www.w3.org/2000/01/rdf-schema#seeAlso> <${ConceptSnapshotTestBuilder.WEBSITES[0].id}>`,
                    `<${ConceptSnapshotTestBuilder.WEBSITES[0].id}> a <http://schema.org/WebSite>`,
                    `<${ConceptSnapshotTestBuilder.WEBSITES[0].id}> <http://purl.org/dc/terms/title> """${ConceptSnapshotTestBuilder.WEBSITES[0].title.nl}"""@NL`,
                    `<${ConceptSnapshotTestBuilder.WEBSITES[0].id}> <http://purl.org/dc/terms/title> """${ConceptSnapshotTestBuilder.WEBSITES[0].title.nlFormal}"""@nl-BE-x-formal`,
                    `<${ConceptSnapshotTestBuilder.WEBSITES[0].id}> <http://purl.org/dc/terms/title> """${ConceptSnapshotTestBuilder.WEBSITES[0].title.nlInformal}"""@nl-BE-x-informal`,
                    `<${ConceptSnapshotTestBuilder.WEBSITES[0].id}> <http://purl.org/dc/terms/title> """${ConceptSnapshotTestBuilder.WEBSITES[0].title.nlGeneratedFormal}"""@nl-BE-x-generated-formal`,
                    `<${ConceptSnapshotTestBuilder.WEBSITES[0].id}> <http://purl.org/dc/terms/title> """${ConceptSnapshotTestBuilder.WEBSITES[0].title.nlGeneratedInformal}"""@nl-BE-x-generated-informal`,
                    `<${ConceptSnapshotTestBuilder.WEBSITES[0].id}> <http://purl.org/dc/terms/description> """${ConceptSnapshotTestBuilder.WEBSITES[0].description.nl}"""@NL`,
                    `<${ConceptSnapshotTestBuilder.WEBSITES[0].id}> <http://purl.org/dc/terms/description> """${ConceptSnapshotTestBuilder.WEBSITES[0].description.nlFormal}"""@nl-BE-x-formal`,
                    `<${ConceptSnapshotTestBuilder.WEBSITES[0].id}> <http://purl.org/dc/terms/description> """${ConceptSnapshotTestBuilder.WEBSITES[0].description.nlInformal}"""@nl-BE-x-informal`,
                    `<${ConceptSnapshotTestBuilder.WEBSITES[0].id}> <http://purl.org/dc/terms/description> """${ConceptSnapshotTestBuilder.WEBSITES[0].description.nlGeneratedFormal}"""@nl-BE-x-generated-formal`,
                    `<${ConceptSnapshotTestBuilder.WEBSITES[0].id}> <http://purl.org/dc/terms/description> """${ConceptSnapshotTestBuilder.WEBSITES[0].description.nlGeneratedInformal}"""@nl-BE-x-generated-informal`,
                    `<${ConceptSnapshotTestBuilder.WEBSITES[0].id}> <http://schema.org/url> """${ConceptSnapshotTestBuilder.WEBSITES[0].url}"""`,
                    `<${ConceptSnapshotTestBuilder.WEBSITES[0].id}> <http://www.w3.org/ns/shacl#order> """1"""^^<http://www.w3.org/2001/XMLSchema#integer>`,
                    `<${conceptSnapshotId}> <http://data.europa.eu/m8g/hasCost> <${ConceptSnapshotTestBuilder.COSTS[1].id}>`,
                    `<${ConceptSnapshotTestBuilder.COSTS[1].id}> a <http://data.europa.eu/m8g/Cost>`,
                    `<${ConceptSnapshotTestBuilder.COSTS[1].id}> <http://purl.org/dc/terms/title> """${ConceptSnapshotTestBuilder.COSTS[1].title.nl}"""@NL`,
                    `<${ConceptSnapshotTestBuilder.COSTS[1].id}> <http://purl.org/dc/terms/title> """${ConceptSnapshotTestBuilder.COSTS[1].title.nlFormal}"""@nl-BE-x-formal`,
                    `<${ConceptSnapshotTestBuilder.COSTS[1].id}> <http://purl.org/dc/terms/title> """${ConceptSnapshotTestBuilder.COSTS[1].title.nlInformal}"""@nl-BE-x-informal`,
                    `<${ConceptSnapshotTestBuilder.COSTS[1].id}> <http://purl.org/dc/terms/title> """${ConceptSnapshotTestBuilder.COSTS[1].title.nlGeneratedFormal}"""@nl-BE-x-generated-formal`,
                    `<${ConceptSnapshotTestBuilder.COSTS[1].id}> <http://purl.org/dc/terms/title> """${ConceptSnapshotTestBuilder.COSTS[1].title.nlGeneratedInformal}"""@nl-BE-x-generated-informal`,
                    `<${ConceptSnapshotTestBuilder.COSTS[1].id}> <http://purl.org/dc/terms/description> """${ConceptSnapshotTestBuilder.COSTS[1].description.nl}"""@NL`,
                    `<${ConceptSnapshotTestBuilder.COSTS[1].id}> <http://purl.org/dc/terms/description> """${ConceptSnapshotTestBuilder.COSTS[1].description.nlFormal}"""@nl-BE-x-formal`,
                    `<${ConceptSnapshotTestBuilder.COSTS[1].id}> <http://purl.org/dc/terms/description> """${ConceptSnapshotTestBuilder.COSTS[1].description.nlInformal}"""@nl-BE-x-informal`,
                    `<${ConceptSnapshotTestBuilder.COSTS[1].id}> <http://purl.org/dc/terms/description> """${ConceptSnapshotTestBuilder.COSTS[1].description.nlGeneratedFormal}"""@nl-BE-x-generated-formal`,
                    `<${ConceptSnapshotTestBuilder.COSTS[1].id}> <http://purl.org/dc/terms/description> """${ConceptSnapshotTestBuilder.COSTS[1].description.nlGeneratedInformal}"""@nl-BE-x-generated-informal`,
                    `<${ConceptSnapshotTestBuilder.COSTS[1].id}> <http://www.w3.org/ns/shacl#order> """2"""^^<http://www.w3.org/2001/XMLSchema#integer>`,
                    `<${conceptSnapshotId}> <http://data.europa.eu/m8g/hasCost> <${ConceptSnapshotTestBuilder.COSTS[0].id}>`,
                    `<${ConceptSnapshotTestBuilder.COSTS[0].id}> a <http://data.europa.eu/m8g/Cost>`,
                    `<${ConceptSnapshotTestBuilder.COSTS[0].id}> <http://purl.org/dc/terms/title> """${ConceptSnapshotTestBuilder.COSTS[0].title.nl}"""@NL`,
                    `<${ConceptSnapshotTestBuilder.COSTS[0].id}> <http://purl.org/dc/terms/title> """${ConceptSnapshotTestBuilder.COSTS[0].title.nlFormal}"""@nl-BE-x-formal`,
                    `<${ConceptSnapshotTestBuilder.COSTS[0].id}> <http://purl.org/dc/terms/title> """${ConceptSnapshotTestBuilder.COSTS[0].title.nlInformal}"""@nl-BE-x-informal`,
                    `<${ConceptSnapshotTestBuilder.COSTS[0].id}> <http://purl.org/dc/terms/title> """${ConceptSnapshotTestBuilder.COSTS[0].title.nlGeneratedFormal}"""@nl-BE-x-generated-formal`,
                    `<${ConceptSnapshotTestBuilder.COSTS[0].id}> <http://purl.org/dc/terms/title> """${ConceptSnapshotTestBuilder.COSTS[0].title.nlGeneratedInformal}"""@nl-BE-x-generated-informal`,
                    `<${ConceptSnapshotTestBuilder.COSTS[0].id}> <http://purl.org/dc/terms/description> """${ConceptSnapshotTestBuilder.COSTS[0].description.nl}"""@NL`,
                    `<${ConceptSnapshotTestBuilder.COSTS[0].id}> <http://purl.org/dc/terms/description> """${ConceptSnapshotTestBuilder.COSTS[0].description.nlFormal}"""@nl-BE-x-formal`,
                    `<${ConceptSnapshotTestBuilder.COSTS[0].id}> <http://purl.org/dc/terms/description> """${ConceptSnapshotTestBuilder.COSTS[0].description.nlInformal}"""@nl-BE-x-informal`,
                    `<${ConceptSnapshotTestBuilder.COSTS[0].id}> <http://purl.org/dc/terms/description> """${ConceptSnapshotTestBuilder.COSTS[0].description.nlGeneratedFormal}"""@nl-BE-x-generated-formal`,
                    `<${ConceptSnapshotTestBuilder.COSTS[0].id}> <http://purl.org/dc/terms/description> """${ConceptSnapshotTestBuilder.COSTS[0].description.nlGeneratedInformal}"""@nl-BE-x-generated-informal`,
                    `<${ConceptSnapshotTestBuilder.COSTS[0].id}> <http://www.w3.org/ns/shacl#order> """1"""^^<http://www.w3.org/2001/XMLSchema#integer>`,
                    `<${conceptSnapshotId}> <http://purl.org/vocab/cpsv#produces> <${ConceptSnapshotTestBuilder.FINANCIAL_ADVANTAGES[1].id}>`,
                    `<${ConceptSnapshotTestBuilder.FINANCIAL_ADVANTAGES[1].id}> a <https://productencatalogus.data.vlaanderen.be/ns/ipdc-lpdc#FinancialAdvantage>`,
                    `<${ConceptSnapshotTestBuilder.FINANCIAL_ADVANTAGES[1].id}> <http://purl.org/dc/terms/title> """${ConceptSnapshotTestBuilder.FINANCIAL_ADVANTAGES[1].title.nl}"""@NL`,
                    `<${ConceptSnapshotTestBuilder.FINANCIAL_ADVANTAGES[1].id}> <http://purl.org/dc/terms/title> """${ConceptSnapshotTestBuilder.FINANCIAL_ADVANTAGES[1].title.nlFormal}"""@nl-BE-x-formal`,
                    `<${ConceptSnapshotTestBuilder.FINANCIAL_ADVANTAGES[1].id}> <http://purl.org/dc/terms/title> """${ConceptSnapshotTestBuilder.FINANCIAL_ADVANTAGES[1].title.nlInformal}"""@nl-BE-x-informal`,
                    `<${ConceptSnapshotTestBuilder.FINANCIAL_ADVANTAGES[1].id}> <http://purl.org/dc/terms/title> """${ConceptSnapshotTestBuilder.FINANCIAL_ADVANTAGES[1].title.nlGeneratedFormal}"""@nl-BE-x-generated-formal`,
                    `<${ConceptSnapshotTestBuilder.FINANCIAL_ADVANTAGES[1].id}> <http://purl.org/dc/terms/title> """${ConceptSnapshotTestBuilder.FINANCIAL_ADVANTAGES[1].title.nlGeneratedInformal}"""@nl-BE-x-generated-informal`,
                    `<${ConceptSnapshotTestBuilder.FINANCIAL_ADVANTAGES[1].id}> <http://purl.org/dc/terms/description> """${ConceptSnapshotTestBuilder.FINANCIAL_ADVANTAGES[1].description.nl}"""@NL`,
                    `<${ConceptSnapshotTestBuilder.FINANCIAL_ADVANTAGES[1].id}> <http://purl.org/dc/terms/description> """${ConceptSnapshotTestBuilder.FINANCIAL_ADVANTAGES[1].description.nlFormal}"""@nl-BE-x-formal`,
                    `<${ConceptSnapshotTestBuilder.FINANCIAL_ADVANTAGES[1].id}> <http://purl.org/dc/terms/description> """${ConceptSnapshotTestBuilder.FINANCIAL_ADVANTAGES[1].description.nlInformal}"""@nl-BE-x-informal`,
                    `<${ConceptSnapshotTestBuilder.FINANCIAL_ADVANTAGES[1].id}> <http://purl.org/dc/terms/description> """${ConceptSnapshotTestBuilder.FINANCIAL_ADVANTAGES[1].description.nlGeneratedFormal}"""@nl-BE-x-generated-formal`,
                    `<${ConceptSnapshotTestBuilder.FINANCIAL_ADVANTAGES[1].id}> <http://purl.org/dc/terms/description> """${ConceptSnapshotTestBuilder.FINANCIAL_ADVANTAGES[1].description.nlGeneratedInformal}"""@nl-BE-x-generated-informal`,
                    `<${ConceptSnapshotTestBuilder.FINANCIAL_ADVANTAGES[1].id}> <http://www.w3.org/ns/shacl#order> """2"""^^<http://www.w3.org/2001/XMLSchema#integer>`,
                    `<${conceptSnapshotId}> <http://purl.org/vocab/cpsv#produces> <${ConceptSnapshotTestBuilder.FINANCIAL_ADVANTAGES[0].id}>`,
                    `<${ConceptSnapshotTestBuilder.FINANCIAL_ADVANTAGES[0].id}> a <https://productencatalogus.data.vlaanderen.be/ns/ipdc-lpdc#FinancialAdvantage>`,
                    `<${ConceptSnapshotTestBuilder.FINANCIAL_ADVANTAGES[0].id}> <http://purl.org/dc/terms/title> """${ConceptSnapshotTestBuilder.FINANCIAL_ADVANTAGES[0].title.nl}"""@NL`,
                    `<${ConceptSnapshotTestBuilder.FINANCIAL_ADVANTAGES[0].id}> <http://purl.org/dc/terms/title> """${ConceptSnapshotTestBuilder.FINANCIAL_ADVANTAGES[0].title.nlFormal}"""@nl-BE-x-formal`,
                    `<${ConceptSnapshotTestBuilder.FINANCIAL_ADVANTAGES[0].id}> <http://purl.org/dc/terms/title> """${ConceptSnapshotTestBuilder.FINANCIAL_ADVANTAGES[0].title.nlInformal}"""@nl-BE-x-informal`,
                    `<${ConceptSnapshotTestBuilder.FINANCIAL_ADVANTAGES[0].id}> <http://purl.org/dc/terms/title> """${ConceptSnapshotTestBuilder.FINANCIAL_ADVANTAGES[0].title.nlGeneratedFormal}"""@nl-BE-x-generated-formal`,
                    `<${ConceptSnapshotTestBuilder.FINANCIAL_ADVANTAGES[0].id}> <http://purl.org/dc/terms/title> """${ConceptSnapshotTestBuilder.FINANCIAL_ADVANTAGES[0].title.nlGeneratedInformal}"""@nl-BE-x-generated-informal`,
                    `<${ConceptSnapshotTestBuilder.FINANCIAL_ADVANTAGES[0].id}> <http://purl.org/dc/terms/description> """${ConceptSnapshotTestBuilder.FINANCIAL_ADVANTAGES[0].description.nl}"""@NL`,
                    `<${ConceptSnapshotTestBuilder.FINANCIAL_ADVANTAGES[0].id}> <http://purl.org/dc/terms/description> """${ConceptSnapshotTestBuilder.FINANCIAL_ADVANTAGES[0].description.nlFormal}"""@nl-BE-x-formal`,
                    `<${ConceptSnapshotTestBuilder.FINANCIAL_ADVANTAGES[0].id}> <http://purl.org/dc/terms/description> """${ConceptSnapshotTestBuilder.FINANCIAL_ADVANTAGES[0].description.nlInformal}"""@nl-BE-x-informal`,
                    `<${ConceptSnapshotTestBuilder.FINANCIAL_ADVANTAGES[0].id}> <http://purl.org/dc/terms/description> """${ConceptSnapshotTestBuilder.FINANCIAL_ADVANTAGES[0].description.nlGeneratedFormal}"""@nl-BE-x-generated-formal`,
                    `<${ConceptSnapshotTestBuilder.FINANCIAL_ADVANTAGES[0].id}> <http://purl.org/dc/terms/description> """${ConceptSnapshotTestBuilder.FINANCIAL_ADVANTAGES[0].description.nlGeneratedInformal}"""@nl-BE-x-generated-informal`,
                    `<${ConceptSnapshotTestBuilder.FINANCIAL_ADVANTAGES[0].id}> <http://www.w3.org/ns/shacl#order> """1"""^^<http://www.w3.org/2001/XMLSchema#integer>`,
                    `<${conceptSnapshotId}> <http://purl.org/dc/terms/isVersionOf> <${ConceptSnapshotTestBuilder.IS_VERSION_OF_CONCEPT}>`,
                    `<${conceptSnapshotId}> <http://schema.org/dateCreated> """${ConceptSnapshotTestBuilder.DATE_CREATED.value}"""^^<http://www.w3.org/2001/XMLSchema#dateTime>`,
                    `<${conceptSnapshotId}> <http://schema.org/dateModified> """${ConceptSnapshotTestBuilder.DATE_MODIFIED.value}"""^^<http://www.w3.org/2001/XMLSchema#dateTime>`,
                    `<${conceptSnapshotId}> <http://www.w3.org/ns/prov#generatedAtTime> """${ConceptSnapshotTestBuilder.GENERATED_AT_TIME.value}"""^^<http://www.w3.org/2001/XMLSchema#dateTime>`,
                    `<${conceptSnapshotId}> <http://schema.org/identifier> """${id}"""`,
                    `<${conceptSnapshotId}> <http://schema.org/productID> """${ConceptSnapshotTestBuilder.PRODUCT_ID}"""`,
                    `<${conceptSnapshotId}> <https://productencatalogus.data.vlaanderen.be/ns/ipdc-lpdc#isArchived> """false"""^^<http://www.w3.org/2001/XMLSchema#boolean>`,
                    `<${conceptSnapshotId}> <https://productencatalogus.data.vlaanderen.be/ns/ipdc-lpdc#conceptTag> <${NS.dvc.conceptTag(ConceptSnapshotTestBuilder.CONCEPT_TAGS[0]).value}>`,
                    `<${conceptSnapshotId}> <https://productencatalogus.data.vlaanderen.be/ns/ipdc-lpdc#conceptTag> <${NS.dvc.conceptTag(ConceptSnapshotTestBuilder.CONCEPT_TAGS[1]).value}>`,
                    `<${conceptSnapshotId}> <http://data.europa.eu/m8g/hasLegalResource> <${ConceptSnapshotTestBuilder.LEGAL_RESOURCES[0].id}>`,
                    `<${ConceptSnapshotTestBuilder.LEGAL_RESOURCES[0].id}> a <http://data.europa.eu/eli/ontology#LegalResource>`,
                    `<${ConceptSnapshotTestBuilder.LEGAL_RESOURCES[0].id}> <http://purl.org/dc/terms/title> """${ConceptSnapshotTestBuilder.LEGAL_RESOURCES[0].title.nl}"""@NL`,
                    `<${ConceptSnapshotTestBuilder.LEGAL_RESOURCES[0].id}> <http://purl.org/dc/terms/title> """${ConceptSnapshotTestBuilder.LEGAL_RESOURCES[0].title.nlFormal}"""@nl-BE-x-formal`,
                    `<${ConceptSnapshotTestBuilder.LEGAL_RESOURCES[0].id}> <http://purl.org/dc/terms/title> """${ConceptSnapshotTestBuilder.LEGAL_RESOURCES[0].title.nlInformal}"""@nl-BE-x-informal`,
                    `<${ConceptSnapshotTestBuilder.LEGAL_RESOURCES[0].id}> <http://purl.org/dc/terms/title> """${ConceptSnapshotTestBuilder.LEGAL_RESOURCES[0].title.nlGeneratedFormal}"""@nl-BE-x-generated-formal`,
                    `<${ConceptSnapshotTestBuilder.LEGAL_RESOURCES[0].id}> <http://purl.org/dc/terms/title> """${ConceptSnapshotTestBuilder.LEGAL_RESOURCES[0].title.nlGeneratedInformal}"""@nl-BE-x-generated-informal`,
                    `<${ConceptSnapshotTestBuilder.LEGAL_RESOURCES[0].id}> <http://purl.org/dc/terms/description> """${ConceptSnapshotTestBuilder.LEGAL_RESOURCES[0].description.nl}"""@NL`,
                    `<${ConceptSnapshotTestBuilder.LEGAL_RESOURCES[0].id}> <http://purl.org/dc/terms/description> """${ConceptSnapshotTestBuilder.LEGAL_RESOURCES[0].description.nlFormal}"""@nl-BE-x-formal`,
                    `<${ConceptSnapshotTestBuilder.LEGAL_RESOURCES[0].id}> <http://purl.org/dc/terms/description> """${ConceptSnapshotTestBuilder.LEGAL_RESOURCES[0].description.nlInformal}"""@nl-BE-x-informal`,
                    `<${ConceptSnapshotTestBuilder.LEGAL_RESOURCES[0].id}> <http://purl.org/dc/terms/description> """${ConceptSnapshotTestBuilder.LEGAL_RESOURCES[0].description.nlGeneratedFormal}"""@nl-BE-x-generated-formal`,
                    `<${ConceptSnapshotTestBuilder.LEGAL_RESOURCES[0].id}> <http://purl.org/dc/terms/description> """${ConceptSnapshotTestBuilder.LEGAL_RESOURCES[0].description.nlGeneratedInformal}"""@nl-BE-x-generated-informal`,
                    `<${ConceptSnapshotTestBuilder.LEGAL_RESOURCES[0].id}> <http://schema.org/url> """${ConceptSnapshotTestBuilder.LEGAL_RESOURCES[0].url}"""`,
                    `<${ConceptSnapshotTestBuilder.LEGAL_RESOURCES[0].id}> <http://www.w3.org/ns/shacl#order> """1"""^^<http://www.w3.org/2001/XMLSchema#integer>`,
                    `<${conceptSnapshotId}> <http://data.europa.eu/m8g/hasLegalResource> <${ConceptSnapshotTestBuilder.LEGAL_RESOURCES[1].id}>`,
                    `<${ConceptSnapshotTestBuilder.LEGAL_RESOURCES[1].id}> a <http://data.europa.eu/eli/ontology#LegalResource>`,
                    `<${ConceptSnapshotTestBuilder.LEGAL_RESOURCES[1].id}> <http://purl.org/dc/terms/title> """${ConceptSnapshotTestBuilder.LEGAL_RESOURCES[1].title.nl}"""@NL`,
                    `<${ConceptSnapshotTestBuilder.LEGAL_RESOURCES[1].id}> <http://purl.org/dc/terms/title> """${ConceptSnapshotTestBuilder.LEGAL_RESOURCES[1].title.nlFormal}"""@nl-BE-x-formal`,
                    `<${ConceptSnapshotTestBuilder.LEGAL_RESOURCES[1].id}> <http://purl.org/dc/terms/title> """${ConceptSnapshotTestBuilder.LEGAL_RESOURCES[1].title.nlInformal}"""@nl-BE-x-informal`,
                    `<${ConceptSnapshotTestBuilder.LEGAL_RESOURCES[1].id}> <http://purl.org/dc/terms/title> """${ConceptSnapshotTestBuilder.LEGAL_RESOURCES[1].title.nlGeneratedFormal}"""@nl-BE-x-generated-formal`,
                    `<${ConceptSnapshotTestBuilder.LEGAL_RESOURCES[1].id}> <http://purl.org/dc/terms/title> """${ConceptSnapshotTestBuilder.LEGAL_RESOURCES[1].title.nlGeneratedInformal}"""@nl-BE-x-generated-informal`,
                    `<${ConceptSnapshotTestBuilder.LEGAL_RESOURCES[1].id}> <http://purl.org/dc/terms/description> """${ConceptSnapshotTestBuilder.LEGAL_RESOURCES[1].description.nl}"""@NL`,
                    `<${ConceptSnapshotTestBuilder.LEGAL_RESOURCES[1].id}> <http://purl.org/dc/terms/description> """${ConceptSnapshotTestBuilder.LEGAL_RESOURCES[1].description.nlFormal}"""@nl-BE-x-formal`,
                    `<${ConceptSnapshotTestBuilder.LEGAL_RESOURCES[1].id}> <http://purl.org/dc/terms/description> """${ConceptSnapshotTestBuilder.LEGAL_RESOURCES[1].description.nlInformal}"""@nl-BE-x-informal`,
                    `<${ConceptSnapshotTestBuilder.LEGAL_RESOURCES[1].id}> <http://purl.org/dc/terms/description> """${ConceptSnapshotTestBuilder.LEGAL_RESOURCES[1].description.nlGeneratedFormal}"""@nl-BE-x-generated-formal`,
                    `<${ConceptSnapshotTestBuilder.LEGAL_RESOURCES[1].id}> <http://purl.org/dc/terms/description> """${ConceptSnapshotTestBuilder.LEGAL_RESOURCES[1].description.nlGeneratedInformal}"""@nl-BE-x-generated-informal`,
                    `<${ConceptSnapshotTestBuilder.LEGAL_RESOURCES[1].id}> <http://schema.org/url> """${ConceptSnapshotTestBuilder.LEGAL_RESOURCES[1].url}"""`,
                    `<${ConceptSnapshotTestBuilder.LEGAL_RESOURCES[1].id}> <http://www.w3.org/ns/shacl#order> """2"""^^<http://www.w3.org/2001/XMLSchema#integer>`,
                ]);

            const actualConceptSnapshot = await repository.findById(conceptSnapshotId);

            expect(actualConceptSnapshot).toEqual(conceptSnapshot);
        });

        test('Verify minimal mappings - requirement without evidence', async () => {
            const conceptSnapshotId = buildConceptSnapshotIri(uuid());
            const conceptSnapshotTitle = ConceptSnapshotTestBuilder.MINIMAL_TITLE;
            const conceptSnapshotDescription = aMinimalLanguageString(ConceptSnapshotTestBuilder.DESCRIPTION).build();
            const conceptSnapshotProductId = ConceptSnapshotTestBuilder.PRODUCT_ID;
            const conceptSnapshotDateCreated = ConceptSnapshotTestBuilder.DATE_CREATED;
            const conceptSnapshotDateModified = ConceptSnapshotTestBuilder.DATE_MODIFIED;
            const conceptSnapshotGeneratedAtTime = ConceptSnapshotTestBuilder.GENERATED_AT_TIME;


            const requirementId = RequirementBuilder.buildIri(uuid());
            const requirementTitle = aMinimalLanguageString(RequirementTestBuilder.TITLE).build();
            const requirementDescription = aMinimalLanguageString(ConceptSnapshotTestBuilder.DESCRIPTION).build();

            const conceptSnapshot =
                aMinimalConceptSnapshot()
                    .withId(conceptSnapshotId)
                    .withTitle(conceptSnapshotTitle)
                    .withDescription(conceptSnapshotDescription)
                    .withProductId(conceptSnapshotProductId)
                    .withDateCreated(conceptSnapshotDateCreated)
                    .withDateModified(conceptSnapshotDateModified)
                    .withGeneratedAtTime(conceptSnapshotGeneratedAtTime)
                    .withRequirements([
                        aMinimalRequirementForConceptSnapshot()
                            .withId(requirementId)
                            .withTitle(requirementTitle)
                            .withDescription(requirementDescription)
                            .withEvidence(undefined).build()])
                    .build();

            await directDatabaseAccess.insertData(
                CONCEPT_SNAPSHOT_LDES_GRAPH,
                [`<${conceptSnapshotId}> a <https://productencatalogus.data.vlaanderen.be/ns/ipdc-lpdc#ConceptualPublicServiceSnapshot>`,
                    `<${conceptSnapshotId}> <http://purl.org/dc/terms/title> """${conceptSnapshotTitle.nl}"""@nl`,
                    `<${conceptSnapshotId}> <http://purl.org/dc/terms/description> """${conceptSnapshotDescription.nl}"""@nl`,
                    `<${conceptSnapshotId}> <http://schema.org/productID> """${conceptSnapshotProductId}"""`,
                    `<${conceptSnapshotId}> <https://productencatalogus.data.vlaanderen.be/ns/ipdc-lpdc#isArchived> """false"""^^<http://www.w3.org/2001/XMLSchema#boolean>`,
                    `<${conceptSnapshotId}> <http://vocab.belgif.be/ns/publicservice#hasRequirement> <${requirementId}>`,
                    `<${conceptSnapshotId}> <http://schema.org/dateCreated> """${conceptSnapshotDateCreated.value}"""^^<http://www.w3.org/2001/XMLSchema#dateTime>`,
                    `<${conceptSnapshotId}> <http://schema.org/dateModified> """${conceptSnapshotDateModified.value}"""^^<http://www.w3.org/2001/XMLSchema#dateTime>`,
                    `<${conceptSnapshotId}> <http://www.w3.org/ns/prov#generatedAtTime> """${conceptSnapshotGeneratedAtTime.value}"""^^<http://www.w3.org/2001/XMLSchema#dateTime>`,
                    `<${requirementId}> a <http://data.europa.eu/m8g/Requirement>`,
                    `<${requirementId}> <http://www.w3.org/ns/shacl#order> """1"""^^<http://www.w3.org/2001/XMLSchema#integer>`,
                    `<${requirementId}> <http://purl.org/dc/terms/title> """${requirementTitle.nl}"""@nl`,
                    `<${requirementId}> <http://purl.org/dc/terms/description> """${requirementDescription.nl}"""@nl`,
                ]);

            const actualConceptSnapshot = await repository.findById(conceptSnapshotId);

            expect(actualConceptSnapshot).toEqual(conceptSnapshot);
        });

        test('Verify minimal mappings - minimal requirement with minimal evidence', async () => {
            const conceptSnapshotId = buildConceptSnapshotIri(uuid());
            const conceptSnapshotTitle = ConceptSnapshotTestBuilder.MINIMAL_TITLE;
            const conceptSnapshotDescription = aMinimalLanguageString(ConceptSnapshotTestBuilder.DESCRIPTION).build();
            const conceptSnapshotProductId = ConceptSnapshotTestBuilder.PRODUCT_ID;
            const conceptSnapshotDateCreated = ConceptSnapshotTestBuilder.DATE_CREATED;
            const conceptSnapshotDateModified = ConceptSnapshotTestBuilder.DATE_MODIFIED;
            const conceptSnapshotGeneratedAtTime = ConceptSnapshotTestBuilder.GENERATED_AT_TIME;


            const requirementId = RequirementBuilder.buildIri(uuid());
            const requirementTitle = aMinimalLanguageString(RequirementTestBuilder.TITLE).build();
            const requirementDescription = aMinimalLanguageString(ConceptSnapshotTestBuilder.DESCRIPTION).build();
            const evidenceId = EvidenceBuilder.buildIri(uuid());
            const evidenceTitle = aMinimalLanguageString(EvidenceTestBuilder.TITLE).build();
            const evidenceDescription = aMinimalLanguageString(EvidenceTestBuilder.DESCRIPTION).build();

            const conceptSnapshot =
                aMinimalConceptSnapshot()
                    .withId(conceptSnapshotId)
                    .withTitle(conceptSnapshotTitle)
                    .withDescription(conceptSnapshotDescription)
                    .withProductId(conceptSnapshotProductId)
                    .withDateCreated(conceptSnapshotDateCreated)
                    .withDateModified(conceptSnapshotDateModified)
                    .withGeneratedAtTime(conceptSnapshotGeneratedAtTime)
                    .withRequirements([
                        aMinimalRequirementForConceptSnapshot()
                            .withId(requirementId)
                            .withTitle(requirementTitle)
                            .withDescription(requirementDescription)
                            .withEvidence(
                                aMinimalEvidenceForConceptSnapshot()
                                    .withId(evidenceId)
                                    .withTitle(evidenceTitle)
                                    .withDescription(evidenceDescription)
                                    .build()).build()])
                    .build();

            await directDatabaseAccess.insertData(
                CONCEPT_SNAPSHOT_LDES_GRAPH,
                [`<${conceptSnapshotId}> a <https://productencatalogus.data.vlaanderen.be/ns/ipdc-lpdc#ConceptualPublicServiceSnapshot>`,
                    `<${conceptSnapshotId}> <http://vocab.belgif.be/ns/publicservice#hasRequirement> <${requirementId}>`,
                    `<${conceptSnapshotId}> <http://purl.org/dc/terms/title> """${conceptSnapshotTitle.nl}"""@nl`,
                    `<${conceptSnapshotId}> <http://purl.org/dc/terms/description> """${conceptSnapshotDescription.nl}"""@nl`,
                    `<${conceptSnapshotId}> <http://schema.org/productID> """${conceptSnapshotProductId}"""`,
                    `<${conceptSnapshotId}> <https://productencatalogus.data.vlaanderen.be/ns/ipdc-lpdc#isArchived> """false"""^^<http://www.w3.org/2001/XMLSchema#boolean>`,
                    `<${conceptSnapshotId}> <http://schema.org/dateCreated> """${conceptSnapshotDateCreated.value}"""^^<http://www.w3.org/2001/XMLSchema#dateTime>`,
                    `<${conceptSnapshotId}> <http://schema.org/dateModified> """${conceptSnapshotDateModified.value}"""^^<http://www.w3.org/2001/XMLSchema#dateTime>`,
                    `<${conceptSnapshotId}> <http://www.w3.org/ns/prov#generatedAtTime> """${conceptSnapshotGeneratedAtTime.value}"""^^<http://www.w3.org/2001/XMLSchema#dateTime>`,
                    `<${requirementId}> a <http://data.europa.eu/m8g/Requirement>`,
                    `<${requirementId}> <http://data.europa.eu/m8g/hasSupportingEvidence> <${evidenceId}>`,
                    `<${requirementId}> <http://www.w3.org/ns/shacl#order> """1"""^^<http://www.w3.org/2001/XMLSchema#integer>`,
                    `<${requirementId}> <http://purl.org/dc/terms/title> """${requirementTitle.nl}"""@nl`,
                    `<${requirementId}> <http://purl.org/dc/terms/description> """${requirementDescription.nl}"""@nl`,
                    `<${evidenceId}> a <http://data.europa.eu/m8g/Evidence>`,
                    `<${evidenceId}> <http://purl.org/dc/terms/title> """${evidenceTitle.nl}"""@nl`,
                    `<${evidenceId}> <http://purl.org/dc/terms/description> """${evidenceDescription.nl}"""@nl`,
                ]);

            const actualConceptSnapshot = await repository.findById(conceptSnapshotId);

            expect(actualConceptSnapshot).toEqual(conceptSnapshot);
        });

        test('Verify minimal mappings - procedure without websites', async () => {
            const conceptSnapshotId = buildConceptSnapshotIri(uuid());
            const conceptSnapshotTitle = ConceptSnapshotTestBuilder.MINIMAL_TITLE;
            const conceptSnapshotDescription = aMinimalLanguageString(ConceptSnapshotTestBuilder.DESCRIPTION).build();
            const conceptSnapshotProductId = ConceptSnapshotTestBuilder.PRODUCT_ID;
            const conceptSnapshotDateCreated = ConceptSnapshotTestBuilder.DATE_CREATED;
            const conceptSnapshotDateModified = ConceptSnapshotTestBuilder.DATE_MODIFIED;
            const conceptSnapshotGeneratedAtTime = ConceptSnapshotTestBuilder.GENERATED_AT_TIME;


            const procedureId = ProcedureBuilder.buildIri(uuid());
            const procedureTitle = aMinimalLanguageString(ProcedureTestBuilder.TITLE).build();
            const procedureDescription = aMinimalLanguageString(ProcedureTestBuilder.DESCRIPTION).build();

            const conceptSnapshot =
                aMinimalConceptSnapshot()
                    .withId(conceptSnapshotId)
                    .withTitle(conceptSnapshotTitle)
                    .withDescription(conceptSnapshotDescription)
                    .withProductId(conceptSnapshotProductId)
                    .withDateCreated(conceptSnapshotDateCreated)
                    .withDateModified(conceptSnapshotDateModified)
                    .withGeneratedAtTime(conceptSnapshotGeneratedAtTime)
                    .withProcedures([
                        aMinimalProcedureForConceptSnapshot()
                            .withId(procedureId)
                            .withTitle(procedureTitle)
                            .withDescription(procedureDescription)
                            .withWebsites([]).build()
                    ])
                    .build();

            await directDatabaseAccess.insertData(
                CONCEPT_SNAPSHOT_LDES_GRAPH,
                [`<${conceptSnapshotId}> a <https://productencatalogus.data.vlaanderen.be/ns/ipdc-lpdc#ConceptualPublicServiceSnapshot>`,
                    `<${conceptSnapshotId}> <http://purl.org/dc/terms/title> """${conceptSnapshotTitle.nl}"""@nl`,
                    `<${conceptSnapshotId}> <http://purl.org/dc/terms/description> """${conceptSnapshotDescription.nl}"""@nl`,
                    `<${conceptSnapshotId}> <http://schema.org/productID> """${conceptSnapshotProductId}"""`,
                    `<${conceptSnapshotId}> <http://purl.org/vocab/cpsv#follows> <${procedureId}>`,
                    `<${conceptSnapshotId}> <https://productencatalogus.data.vlaanderen.be/ns/ipdc-lpdc#isArchived> """false"""^^<http://www.w3.org/2001/XMLSchema#boolean>`,
                    `<${conceptSnapshotId}> <http://schema.org/dateCreated> """${conceptSnapshotDateCreated.value}"""^^<http://www.w3.org/2001/XMLSchema#dateTime>`,
                    `<${conceptSnapshotId}> <http://schema.org/dateModified> """${conceptSnapshotDateModified.value}"""^^<http://www.w3.org/2001/XMLSchema#dateTime>`,
                    `<${conceptSnapshotId}> <http://www.w3.org/ns/prov#generatedAtTime> """${conceptSnapshotGeneratedAtTime.value}"""^^<http://www.w3.org/2001/XMLSchema#dateTime>`,
                    `<${procedureId}> a <http://purl.org/vocab/cpsv#Rule>`,
                    `<${procedureId}> <http://www.w3.org/ns/shacl#order> """1"""^^<http://www.w3.org/2001/XMLSchema#integer>`,
                    `<${procedureId}> <http://purl.org/dc/terms/title> """${procedureTitle.nl}"""@nl`,
                    `<${procedureId}> <http://purl.org/dc/terms/description> """${procedureDescription.nl}"""@nl`,

                ]);

            const actualConceptSnapshot = await repository.findById(conceptSnapshotId);

            expect(actualConceptSnapshot).toEqual(conceptSnapshot);
        });

        test('Verify minimal mappings - procedure with minimal website', async () => {
            const conceptSnapshotId = buildConceptSnapshotIri(uuid());
            const conceptSnapshotTitle = ConceptSnapshotTestBuilder.MINIMAL_TITLE;
            const conceptSnapshotDescription = aMinimalLanguageString(ConceptSnapshotTestBuilder.DESCRIPTION).build();
            const conceptSnapshotProductId = ConceptSnapshotTestBuilder.PRODUCT_ID;
            const conceptSnapshotDateCreated = ConceptSnapshotTestBuilder.DATE_CREATED;
            const conceptSnapshotDateModified = ConceptSnapshotTestBuilder.DATE_MODIFIED;
            const conceptSnapshotGeneratedAtTime = ConceptSnapshotTestBuilder.GENERATED_AT_TIME;


            const procedureId = ProcedureBuilder.buildIri(uuid());
            const procedureTitle = aMinimalLanguageString(ProcedureTestBuilder.TITLE).build();
            const procedureDescription = aMinimalLanguageString(ProcedureTestBuilder.DESCRIPTION).build();
            const websiteId = WebsiteBuilder.buildIri(uuid());
            const websiteTitle = aMinimalLanguageString(WebsiteTestBuilder.TITLE).build();
            const websiteUrl = WebsiteTestBuilder.URL;

            const conceptSnapshot =
                aMinimalConceptSnapshot()
                    .withId(conceptSnapshotId)
                    .withTitle(conceptSnapshotTitle)
                    .withDescription(conceptSnapshotDescription)
                    .withProductId(conceptSnapshotProductId)
                    .withDateCreated(conceptSnapshotDateCreated)
                    .withDateModified(conceptSnapshotDateModified)
                    .withGeneratedAtTime(conceptSnapshotGeneratedAtTime)
                    .withProcedures([
                        aMinimalProcedureForConceptSnapshot()
                            .withId(procedureId)
                            .withTitle(procedureTitle)
                            .withDescription(procedureDescription)
                            .withWebsites([
                                aMinimalWebsiteForConceptSnapshot()
                                    .withId(websiteId)
                                    .withTitle(websiteTitle)
                                    .withUrl(websiteUrl).build()]).build()])
                    .build();
            await directDatabaseAccess.insertData(
                CONCEPT_SNAPSHOT_LDES_GRAPH,
                [`<${conceptSnapshotId}> a <https://productencatalogus.data.vlaanderen.be/ns/ipdc-lpdc#ConceptualPublicServiceSnapshot>`,
                    `<${conceptSnapshotId}> <http://purl.org/dc/terms/title> """${conceptSnapshotTitle.nl}"""@nl`,
                    `<${conceptSnapshotId}> <http://purl.org/dc/terms/description> """${conceptSnapshotDescription.nl}"""@nl`,
                    `<${conceptSnapshotId}> <http://schema.org/productID> """${conceptSnapshotProductId}"""`,
                    `<${conceptSnapshotId}> <http://purl.org/vocab/cpsv#follows> <${procedureId}>`,
                    `<${conceptSnapshotId}> <https://productencatalogus.data.vlaanderen.be/ns/ipdc-lpdc#isArchived> """false"""^^<http://www.w3.org/2001/XMLSchema#boolean>`,
                    `<${conceptSnapshotId}> <http://schema.org/dateCreated> """${conceptSnapshotDateCreated.value}"""^^<http://www.w3.org/2001/XMLSchema#dateTime>`,
                    `<${conceptSnapshotId}> <http://schema.org/dateModified> """${conceptSnapshotDateModified.value}"""^^<http://www.w3.org/2001/XMLSchema#dateTime>`,
                    `<${conceptSnapshotId}> <http://www.w3.org/ns/prov#generatedAtTime> """${conceptSnapshotGeneratedAtTime.value}"""^^<http://www.w3.org/2001/XMLSchema#dateTime>`,
                    `<${procedureId}> a <http://purl.org/vocab/cpsv#Rule>`,
                    `<${procedureId}> <http://www.w3.org/ns/shacl#order> """1"""^^<http://www.w3.org/2001/XMLSchema#integer>`,
                    `<${procedureId}> <http://purl.org/dc/terms/title> """${procedureTitle.nl}"""@nl`,
                    `<${procedureId}> <http://purl.org/dc/terms/description> """${procedureDescription.nl}"""@nl`,
                    `<${procedureId}> <https://productencatalogus.data.vlaanderen.be/ns/ipdc-lpdc#hasWebsite> <${websiteId}>`,
                    `<${websiteId}> a <http://schema.org/WebSite>`,
                    `<${websiteId}> <http://purl.org/dc/terms/title> """${websiteTitle.nl}"""@nl`,
                    `<${websiteId}> <http://schema.org/url> <${websiteUrl}>`,
                    `<${websiteId}> <http://www.w3.org/ns/shacl#order> """1"""^^<http://www.w3.org/2001/XMLSchema#integer>`,
                ]);

            const actualConceptSnapshot = await repository.findById(conceptSnapshotId);

            expect(actualConceptSnapshot).toEqual(conceptSnapshot);
        });

        describe('Verify mappings with some nested value objects having only non - dutch values', () => {

            describe('for websites', () => {
                for (const nonDutchLanguage of ['de', 'fr', 'en']) {
                    test(`Filters out websites when title only available in language ${nonDutchLanguage}`, async () => {
                        const conceptSnapshotId = buildConceptSnapshotIri(uuid());
                        const conceptSnapshotTitle = ConceptSnapshotTestBuilder.MINIMAL_TITLE;
                        const conceptSnapshotDescription = aMinimalLanguageString('description').build();
                        const conceptSnapshotProductId = ConceptSnapshotTestBuilder.PRODUCT_ID;
                        const conceptSnapshotDateCreated = ConceptSnapshotTestBuilder.DATE_CREATED;
                        const conceptSnapshotDateModified = ConceptSnapshotTestBuilder.DATE_MODIFIED;
                        const conceptSnapshotGeneratedAtTime = ConceptSnapshotTestBuilder.GENERATED_AT_TIME;
                        const conceptSnapshotRetainedWebsite = anotherFullWebsite(uuid()).withOrder(2).build();
                        const conceptSnapshotNotRetainedWebsiteId = WebsiteBuilder.buildIri(uuid());


                        const conceptSnapshot =
                            aMinimalConceptSnapshot()
                                .withId(conceptSnapshotId)
                                .withTitle(conceptSnapshotTitle)
                                .withDescription(conceptSnapshotDescription)
                                .withProductId(conceptSnapshotProductId)
                                .withDateCreated(conceptSnapshotDateCreated)
                                .withDateModified(conceptSnapshotDateModified)
                                .withGeneratedAtTime(conceptSnapshotGeneratedAtTime)
                                .withWebsites([conceptSnapshotRetainedWebsite])
                                .build();

                        await directDatabaseAccess.insertData(
                            CONCEPT_SNAPSHOT_LDES_GRAPH,
                            [
                                `<${conceptSnapshotId}> a <https://productencatalogus.data.vlaanderen.be/ns/ipdc-lpdc#ConceptualPublicServiceSnapshot>`,
                                `<${conceptSnapshotId}> <http://purl.org/dc/terms/title> """${conceptSnapshotTitle.nl}"""@nl`,
                                `<${conceptSnapshotId}> <http://purl.org/dc/terms/description> """${conceptSnapshotDescription.nl}"""@nl`,
                                `<${conceptSnapshotId}> <http://schema.org/productID> """${conceptSnapshotProductId}"""`,
                                `<${conceptSnapshotId}> <https://productencatalogus.data.vlaanderen.be/ns/ipdc-lpdc#isArchived> """false"""^^<http://www.w3.org/2001/XMLSchema#boolean>`,
                                `<${conceptSnapshotId}> <http://schema.org/dateCreated> """${conceptSnapshotDateCreated.value}"""^^<http://www.w3.org/2001/XMLSchema#dateTime>`,
                                `<${conceptSnapshotId}> <http://schema.org/dateModified> """${conceptSnapshotDateModified.value}"""^^<http://www.w3.org/2001/XMLSchema#dateTime>`,
                                `<${conceptSnapshotId}> <http://www.w3.org/ns/prov#generatedAtTime> """${conceptSnapshotGeneratedAtTime.value}"""^^<http://www.w3.org/2001/XMLSchema#dateTime>`,
                                `<${conceptSnapshotId}> <http://www.w3.org/2000/01/rdf-schema#seeAlso> <${conceptSnapshotRetainedWebsite.id}>`,
                                `<${conceptSnapshotRetainedWebsite.id}> a <http://schema.org/WebSite>`,
                                `<${conceptSnapshotRetainedWebsite.id}> <http://purl.org/dc/terms/title> """${conceptSnapshotRetainedWebsite.title.nl}"""@NL`,
                                `<${conceptSnapshotRetainedWebsite.id}> <http://purl.org/dc/terms/title> """${conceptSnapshotRetainedWebsite.title.nlFormal}"""@nl-BE-x-formal`,
                                `<${conceptSnapshotRetainedWebsite.id}> <http://purl.org/dc/terms/title> """${conceptSnapshotRetainedWebsite.title.nlInformal}"""@nl-BE-x-informal`,
                                `<${conceptSnapshotRetainedWebsite.id}> <http://purl.org/dc/terms/title> """${conceptSnapshotRetainedWebsite.title.nlGeneratedFormal}"""@nl-BE-x-generated-formal`,
                                `<${conceptSnapshotRetainedWebsite.id}> <http://purl.org/dc/terms/title> """${conceptSnapshotRetainedWebsite.title.nlGeneratedInformal}"""@nl-BE-x-generated-informal`,
                                `<${conceptSnapshotRetainedWebsite.id}> <http://purl.org/dc/terms/description> """${conceptSnapshotRetainedWebsite.description.nl}"""@NL`,
                                `<${conceptSnapshotRetainedWebsite.id}> <http://purl.org/dc/terms/description> """${conceptSnapshotRetainedWebsite.description.nlFormal}"""@nl-BE-x-formal`,
                                `<${conceptSnapshotRetainedWebsite.id}> <http://purl.org/dc/terms/description> """${conceptSnapshotRetainedWebsite.description.nlInformal}"""@nl-BE-x-informal`,
                                `<${conceptSnapshotRetainedWebsite.id}> <http://purl.org/dc/terms/description> """${conceptSnapshotRetainedWebsite.description.nlGeneratedFormal}"""@nl-BE-x-generated-formal`,
                                `<${conceptSnapshotRetainedWebsite.id}> <http://purl.org/dc/terms/description> """${conceptSnapshotRetainedWebsite.description.nlGeneratedInformal}"""@nl-BE-x-generated-informal`,
                                `<${conceptSnapshotRetainedWebsite.id}> <http://schema.org/url> """${conceptSnapshotRetainedWebsite.url}"""`,
                                `<${conceptSnapshotRetainedWebsite.id}> <http://www.w3.org/ns/shacl#order> """2"""^^<http://www.w3.org/2001/XMLSchema#integer>`,
                                `<${conceptSnapshotId}> <http://www.w3.org/2000/01/rdf-schema#seeAlso> <${conceptSnapshotNotRetainedWebsiteId}>`,
                                `<${conceptSnapshotNotRetainedWebsiteId}> a <http://schema.org/WebSite>`,
                                `<${conceptSnapshotNotRetainedWebsiteId}> <http://purl.org/dc/terms/title> """title only available in non-dutch language"""@${nonDutchLanguage}`,
                                `<${conceptSnapshotNotRetainedWebsiteId}> <http://purl.org/dc/terms/description> """conceptSnapshotNotRetainedWebsiteId.description.nl"""@NL`,
                                `<${conceptSnapshotNotRetainedWebsiteId}> <http://purl.org/dc/terms/description> """conceptSnapshotNotRetainedWebsiteId.description.nlFormal"""@nl-BE-x-formal`,
                                `<${conceptSnapshotNotRetainedWebsiteId}> <http://purl.org/dc/terms/description> """conceptSnapshotNotRetainedWebsiteId.description.nlInformal"""@nl-BE-x-informal`,
                                `<${conceptSnapshotNotRetainedWebsiteId}> <http://purl.org/dc/terms/description> """conceptSnapshotNotRetainedWebsiteId.description.nlGeneratedFormal"""@nl-BE-x-generated-formal`,
                                `<${conceptSnapshotNotRetainedWebsiteId}> <http://purl.org/dc/terms/description> """conceptSnapshotNotRetainedWebsiteId.description.nlGeneratedInformal"""@nl-BE-x-generated-informal`,
                                `<${conceptSnapshotNotRetainedWebsiteId}> <http://schema.org/url> """http://some-url.com"""`,
                                `<${conceptSnapshotNotRetainedWebsiteId}> <http://www.w3.org/ns/shacl#order> """1"""^^<http://www.w3.org/2001/XMLSchema#integer>`,
                            ]);

                        const actualConceptSnapshot = await repository.findById(conceptSnapshotId);

                        expect(actualConceptSnapshot).toEqual(conceptSnapshot);
                    });
                }

                for (const nonDutchLanguage of ['de', 'fr', 'en']) {
                    test(`Filters out description when description only available in language ${nonDutchLanguage}`, async () => {
                        const conceptSnapshotId = buildConceptSnapshotIri(uuid());
                        const conceptSnapshotTitle = ConceptSnapshotTestBuilder.MINIMAL_TITLE;
                        const conceptSnapshotDescription = aMinimalLanguageString('description').build();
                        const conceptSnapshotProductId = ConceptSnapshotTestBuilder.PRODUCT_ID;
                        const conceptSnapshotDateCreated = ConceptSnapshotTestBuilder.DATE_CREATED;
                        const conceptSnapshotDateModified = ConceptSnapshotTestBuilder.DATE_MODIFIED;
                        const conceptSnapshotGeneratedAtTime = ConceptSnapshotTestBuilder.GENERATED_AT_TIME;
                        const conceptSnapshotRetainedWebsite = anotherFullWebsite(uuid()).withDescription(undefined).withOrder(2).build();

                        const conceptSnapshot =
                            aMinimalConceptSnapshot()
                                .withId(conceptSnapshotId)
                                .withTitle(conceptSnapshotTitle)
                                .withDescription(conceptSnapshotDescription)
                                .withProductId(conceptSnapshotProductId)
                                .withDateCreated(conceptSnapshotDateCreated)
                                .withDateModified(conceptSnapshotDateModified)
                                .withGeneratedAtTime(conceptSnapshotGeneratedAtTime)
                                .withWebsites([conceptSnapshotRetainedWebsite])
                                .build();

                        await directDatabaseAccess.insertData(
                            CONCEPT_SNAPSHOT_LDES_GRAPH,
                            [
                                `<${conceptSnapshotId}> a <https://productencatalogus.data.vlaanderen.be/ns/ipdc-lpdc#ConceptualPublicServiceSnapshot>`,
                                `<${conceptSnapshotId}> <http://purl.org/dc/terms/title> """${conceptSnapshotTitle.nl}"""@nl`,
                                `<${conceptSnapshotId}> <http://purl.org/dc/terms/description> """${conceptSnapshotDescription.nl}"""@nl`,
                                `<${conceptSnapshotId}> <http://schema.org/productID> """${conceptSnapshotProductId}"""`,
                                `<${conceptSnapshotId}> <https://productencatalogus.data.vlaanderen.be/ns/ipdc-lpdc#isArchived> """false"""^^<http://www.w3.org/2001/XMLSchema#boolean>`,
                                `<${conceptSnapshotId}> <http://schema.org/dateCreated> """${conceptSnapshotDateCreated.value}"""^^<http://www.w3.org/2001/XMLSchema#dateTime>`,
                                `<${conceptSnapshotId}> <http://schema.org/dateModified> """${conceptSnapshotDateModified.value}"""^^<http://www.w3.org/2001/XMLSchema#dateTime>`,
                                `<${conceptSnapshotId}> <http://www.w3.org/ns/prov#generatedAtTime> """${conceptSnapshotGeneratedAtTime.value}"""^^<http://www.w3.org/2001/XMLSchema#dateTime>`,
                                `<${conceptSnapshotId}> <http://www.w3.org/2000/01/rdf-schema#seeAlso> <${conceptSnapshotRetainedWebsite.id}>`,
                                `<${conceptSnapshotRetainedWebsite.id}> a <http://schema.org/WebSite>`,
                                `<${conceptSnapshotRetainedWebsite.id}> <http://purl.org/dc/terms/title> """${conceptSnapshotRetainedWebsite.title.nl}"""@NL`,
                                `<${conceptSnapshotRetainedWebsite.id}> <http://purl.org/dc/terms/title> """${conceptSnapshotRetainedWebsite.title.nlFormal}"""@nl-BE-x-formal`,
                                `<${conceptSnapshotRetainedWebsite.id}> <http://purl.org/dc/terms/title> """${conceptSnapshotRetainedWebsite.title.nlInformal}"""@nl-BE-x-informal`,
                                `<${conceptSnapshotRetainedWebsite.id}> <http://purl.org/dc/terms/title> """${conceptSnapshotRetainedWebsite.title.nlGeneratedFormal}"""@nl-BE-x-generated-formal`,
                                `<${conceptSnapshotRetainedWebsite.id}> <http://purl.org/dc/terms/title> """${conceptSnapshotRetainedWebsite.title.nlGeneratedInformal}"""@nl-BE-x-generated-informal`,
                                `<${conceptSnapshotRetainedWebsite.id}> <http://purl.org/dc/terms/description> """description in non-dutch language"""@${nonDutchLanguage}`,
                                `<${conceptSnapshotRetainedWebsite.id}> <http://schema.org/url> """${conceptSnapshotRetainedWebsite.url}"""`,
                                `<${conceptSnapshotRetainedWebsite.id}> <http://www.w3.org/ns/shacl#order> """2"""^^<http://www.w3.org/2001/XMLSchema#integer>`,
                            ]);

                        const actualConceptSnapshot = await repository.findById(conceptSnapshotId);

                        expect(actualConceptSnapshot).toEqual(conceptSnapshot);
                    });
                }

                test(`Throws error if required fields are missing on website`, async () => {
                    const conceptSnapshotId = buildConceptSnapshotIri(uuid());
                    const conceptSnapshotTitle = ConceptSnapshotTestBuilder.MINIMAL_TITLE;
                    const conceptSnapshotDescription = aMinimalLanguageString('description').build();
                    const conceptSnapshotProductId = ConceptSnapshotTestBuilder.PRODUCT_ID;
                    const conceptSnapshotDateCreated = ConceptSnapshotTestBuilder.DATE_CREATED;
                    const conceptSnapshotDateModified = ConceptSnapshotTestBuilder.DATE_MODIFIED;
                    const conceptSnapshotGeneratedAtTime = ConceptSnapshotTestBuilder.GENERATED_AT_TIME;
                    const conceptSnapshotRetainedWebsite = anotherFullWebsite(uuid()).withOrder(2).build();

                    await directDatabaseAccess.insertData(
                        CONCEPT_SNAPSHOT_LDES_GRAPH,
                        [
                            `<${conceptSnapshotId}> a <https://productencatalogus.data.vlaanderen.be/ns/ipdc-lpdc#ConceptualPublicServiceSnapshot>`,
                            `<${conceptSnapshotId}> <http://purl.org/dc/terms/title> """${conceptSnapshotTitle.nl}"""@nl`,
                            `<${conceptSnapshotId}> <http://purl.org/dc/terms/description> """${conceptSnapshotDescription.nl}"""@nl`,
                            `<${conceptSnapshotId}> <http://schema.org/productID> """${conceptSnapshotProductId}"""`,
                            `<${conceptSnapshotId}> <https://productencatalogus.data.vlaanderen.be/ns/ipdc-lpdc#isArchived> """false"""^^<http://www.w3.org/2001/XMLSchema#boolean>`,
                            `<${conceptSnapshotId}> <http://schema.org/dateCreated> """${conceptSnapshotDateCreated.value}"""^^<http://www.w3.org/2001/XMLSchema#dateTime>`,
                            `<${conceptSnapshotId}> <http://schema.org/dateModified> """${conceptSnapshotDateModified.value}"""^^<http://www.w3.org/2001/XMLSchema#dateTime>`,
                            `<${conceptSnapshotId}> <http://www.w3.org/ns/prov#generatedAtTime> """${conceptSnapshotGeneratedAtTime.value}"""^^<http://www.w3.org/2001/XMLSchema#dateTime>`,
                            `<${conceptSnapshotId}> <http://www.w3.org/2000/01/rdf-schema#seeAlso> <${conceptSnapshotRetainedWebsite.id}>`,
                            `<${conceptSnapshotRetainedWebsite.id}> a <http://schema.org/WebSite>`,
                            `<${conceptSnapshotRetainedWebsite.id}> <http://purl.org/dc/terms/title> """${conceptSnapshotRetainedWebsite.title.nl}"""@NL`,
                            `<${conceptSnapshotRetainedWebsite.id}> <http://purl.org/dc/terms/title> """${conceptSnapshotRetainedWebsite.title.nlFormal}"""@nl-BE-x-formal`,
                            `<${conceptSnapshotRetainedWebsite.id}> <http://purl.org/dc/terms/title> """${conceptSnapshotRetainedWebsite.title.nlInformal}"""@nl-BE-x-informal`,
                            `<${conceptSnapshotRetainedWebsite.id}> <http://purl.org/dc/terms/title> """${conceptSnapshotRetainedWebsite.title.nlGeneratedFormal}"""@nl-BE-x-generated-formal`,
                            `<${conceptSnapshotRetainedWebsite.id}> <http://purl.org/dc/terms/title> """${conceptSnapshotRetainedWebsite.title.nlGeneratedInformal}"""@nl-BE-x-generated-informal`,
                            `<${conceptSnapshotRetainedWebsite.id}> <http://purl.org/dc/terms/description> """${conceptSnapshotRetainedWebsite.description.nl}"""@NL`,
                            `<${conceptSnapshotRetainedWebsite.id}> <http://purl.org/dc/terms/description> """${conceptSnapshotRetainedWebsite.description.nlFormal}"""@nl-BE-x-formal`,
                            `<${conceptSnapshotRetainedWebsite.id}> <http://purl.org/dc/terms/description> """${conceptSnapshotRetainedWebsite.description.nlInformal}"""@nl-BE-x-informal`,
                            `<${conceptSnapshotRetainedWebsite.id}> <http://purl.org/dc/terms/description> """${conceptSnapshotRetainedWebsite.description.nlGeneratedFormal}"""@nl-BE-x-generated-formal`,
                            `<${conceptSnapshotRetainedWebsite.id}> <http://purl.org/dc/terms/description> """${conceptSnapshotRetainedWebsite.description.nlGeneratedInformal}"""@nl-BE-x-generated-informal`,
                        ]);

                    await expect(repository.findById(conceptSnapshotId)).rejects.toThrowWithMessage(InvariantError, `order mag niet ontbreken`);
                });

            });

            describe('for websites under procedures', () => {
                for (const nonDutchLanguage of ['de', 'fr', 'en']) {
                    test(`Filters out websites when title only available in language ${nonDutchLanguage}`, async () => {
                        const conceptSnapshotId = buildConceptSnapshotIri(uuid());
                        const conceptSnapshotTitle = ConceptSnapshotTestBuilder.MINIMAL_TITLE;
                        const conceptSnapshotDescription = aMinimalLanguageString('description').build();
                        const conceptSnapshotProductId = ConceptSnapshotTestBuilder.PRODUCT_ID;
                        const conceptSnapshotDateCreated = ConceptSnapshotTestBuilder.DATE_CREATED;
                        const conceptSnapshotDateModified = ConceptSnapshotTestBuilder.DATE_MODIFIED;
                        const conceptSnapshotGeneratedAtTime = ConceptSnapshotTestBuilder.GENERATED_AT_TIME;
                        const conceptSnapshotRetainedWebsite = anotherFullWebsite(uuid()).withOrder(2).build();
                        const conceptSnapshotProcedure = anotherFullProcedure().withOrder(1).withWebsites([conceptSnapshotRetainedWebsite]).build();
                        const conceptSnapshotNotRetainedWebsiteId = WebsiteBuilder.buildIri(uuid());

                        const conceptSnapshot =
                            aMinimalConceptSnapshot()
                                .withId(conceptSnapshotId)
                                .withTitle(conceptSnapshotTitle)
                                .withDescription(conceptSnapshotDescription)
                                .withProductId(conceptSnapshotProductId)
                                .withDateCreated(conceptSnapshotDateCreated)
                                .withDateModified(conceptSnapshotDateModified)
                                .withGeneratedAtTime(conceptSnapshotGeneratedAtTime)
                                .withProcedures([conceptSnapshotProcedure])
                                .build();

                        await directDatabaseAccess.insertData(
                            CONCEPT_SNAPSHOT_LDES_GRAPH,
                            [
                                `<${conceptSnapshotId}> a <https://productencatalogus.data.vlaanderen.be/ns/ipdc-lpdc#ConceptualPublicServiceSnapshot>`,
                                `<${conceptSnapshotId}> <http://purl.org/dc/terms/title> """${conceptSnapshotTitle.nl}"""@nl`,
                                `<${conceptSnapshotId}> <http://purl.org/dc/terms/description> """${conceptSnapshotDescription.nl}"""@nl`,
                                `<${conceptSnapshotId}> <http://schema.org/productID> """${conceptSnapshotProductId}"""`,
                                `<${conceptSnapshotId}> <https://productencatalogus.data.vlaanderen.be/ns/ipdc-lpdc#isArchived> """false"""^^<http://www.w3.org/2001/XMLSchema#boolean>`,
                                `<${conceptSnapshotId}> <http://schema.org/dateCreated> """${conceptSnapshotDateCreated.value}"""^^<http://www.w3.org/2001/XMLSchema#dateTime>`,
                                `<${conceptSnapshotId}> <http://schema.org/dateModified> """${conceptSnapshotDateModified.value}"""^^<http://www.w3.org/2001/XMLSchema#dateTime>`,
                                `<${conceptSnapshotId}> <http://www.w3.org/ns/prov#generatedAtTime> """${conceptSnapshotGeneratedAtTime.value}"""^^<http://www.w3.org/2001/XMLSchema#dateTime>`,

                                `<${conceptSnapshotId}> <http://purl.org/vocab/cpsv#follows> <${conceptSnapshotProcedure.id}>`,
                                `<${conceptSnapshotProcedure.id}> a <http://purl.org/vocab/cpsv#Rule>`,
                                `<${conceptSnapshotProcedure.id}> <http://purl.org/dc/terms/title> """${conceptSnapshotProcedure.title.nl}"""@NL`,
                                `<${conceptSnapshotProcedure.id}> <http://purl.org/dc/terms/title> """${conceptSnapshotProcedure.title.nlFormal}"""@nl-BE-x-formal`,
                                `<${conceptSnapshotProcedure.id}> <http://purl.org/dc/terms/title> """${conceptSnapshotProcedure.title.nlInformal}"""@nl-BE-x-informal`,
                                `<${conceptSnapshotProcedure.id}> <http://purl.org/dc/terms/title> """${conceptSnapshotProcedure.title.nlGeneratedFormal}"""@nl-BE-x-generated-formal`,
                                `<${conceptSnapshotProcedure.id}> <http://purl.org/dc/terms/title> """${conceptSnapshotProcedure.title.nlGeneratedInformal}"""@nl-BE-x-generated-informal`,
                                `<${conceptSnapshotProcedure.id}> <http://purl.org/dc/terms/description> """${conceptSnapshotProcedure.description.nl}"""@NL`,
                                `<${conceptSnapshotProcedure.id}> <http://purl.org/dc/terms/description> """${conceptSnapshotProcedure.description.nlFormal}"""@nl-BE-x-formal`,
                                `<${conceptSnapshotProcedure.id}> <http://purl.org/dc/terms/description> """${conceptSnapshotProcedure.description.nlInformal}"""@nl-BE-x-informal`,
                                `<${conceptSnapshotProcedure.id}> <http://purl.org/dc/terms/description> """${conceptSnapshotProcedure.description.nlGeneratedFormal}"""@nl-BE-x-generated-formal`,
                                `<${conceptSnapshotProcedure.id}> <http://purl.org/dc/terms/description> """${conceptSnapshotProcedure.description.nlGeneratedInformal}"""@nl-BE-x-generated-informal`,
                                `<${conceptSnapshotProcedure.id}> <http://www.w3.org/ns/shacl#order> """1"""^^<http://www.w3.org/2001/XMLSchema#integer>`,

                                `<${conceptSnapshotProcedure.id}> <https://productencatalogus.data.vlaanderen.be/ns/ipdc-lpdc#hasWebsite> <${conceptSnapshotRetainedWebsite.id}>`,
                                `<${conceptSnapshotRetainedWebsite.id}> a <http://schema.org/WebSite>`,
                                `<${conceptSnapshotRetainedWebsite.id}> <http://purl.org/dc/terms/title> """${conceptSnapshotRetainedWebsite.title.nl}"""@NL`,
                                `<${conceptSnapshotRetainedWebsite.id}> <http://purl.org/dc/terms/title> """${conceptSnapshotRetainedWebsite.title.nlFormal}"""@nl-BE-x-formal`,
                                `<${conceptSnapshotRetainedWebsite.id}> <http://purl.org/dc/terms/title> """${conceptSnapshotRetainedWebsite.title.nlInformal}"""@nl-BE-x-informal`,
                                `<${conceptSnapshotRetainedWebsite.id}> <http://purl.org/dc/terms/title> """${conceptSnapshotRetainedWebsite.title.nlGeneratedFormal}"""@nl-BE-x-generated-formal`,
                                `<${conceptSnapshotRetainedWebsite.id}> <http://purl.org/dc/terms/title> """${conceptSnapshotRetainedWebsite.title.nlGeneratedInformal}"""@nl-BE-x-generated-informal`,
                                `<${conceptSnapshotRetainedWebsite.id}> <http://purl.org/dc/terms/description> """${conceptSnapshotRetainedWebsite.description.nl}"""@NL`,
                                `<${conceptSnapshotRetainedWebsite.id}> <http://purl.org/dc/terms/description> """${conceptSnapshotRetainedWebsite.description.nlFormal}"""@nl-BE-x-formal`,
                                `<${conceptSnapshotRetainedWebsite.id}> <http://purl.org/dc/terms/description> """${conceptSnapshotRetainedWebsite.description.nlInformal}"""@nl-BE-x-informal`,
                                `<${conceptSnapshotRetainedWebsite.id}> <http://purl.org/dc/terms/description> """${conceptSnapshotRetainedWebsite.description.nlGeneratedFormal}"""@nl-BE-x-generated-formal`,
                                `<${conceptSnapshotRetainedWebsite.id}> <http://purl.org/dc/terms/description> """${conceptSnapshotRetainedWebsite.description.nlGeneratedInformal}"""@nl-BE-x-generated-informal`,
                                `<${conceptSnapshotRetainedWebsite.id}> <http://schema.org/url> """${conceptSnapshotRetainedWebsite.url}"""`,
                                `<${conceptSnapshotRetainedWebsite.id}> <http://www.w3.org/ns/shacl#order> """2"""^^<http://www.w3.org/2001/XMLSchema#integer>`,

                                `<${conceptSnapshotProcedure.id}> <https://productencatalogus.data.vlaanderen.be/ns/ipdc-lpdc#hasWebsite> <${conceptSnapshotNotRetainedWebsiteId}>`,
                                `<${conceptSnapshotNotRetainedWebsiteId}> a <http://schema.org/WebSite>`,
                                `<${conceptSnapshotNotRetainedWebsiteId}> <http://purl.org/dc/terms/title> """title only available in non-dutch language"""@${nonDutchLanguage}`,
                                `<${conceptSnapshotNotRetainedWebsiteId}> <http://purl.org/dc/terms/description> """conceptSnapshotNotRetainedWebsiteId.description.nl"""@NL`,
                                `<${conceptSnapshotNotRetainedWebsiteId}> <http://purl.org/dc/terms/description> """conceptSnapshotNotRetainedWebsiteId.description.nlFormal"""@nl-BE-x-formal`,
                                `<${conceptSnapshotNotRetainedWebsiteId}> <http://purl.org/dc/terms/description> """conceptSnapshotNotRetainedWebsiteId.description.nlInformal"""@nl-BE-x-informal`,
                                `<${conceptSnapshotNotRetainedWebsiteId}> <http://purl.org/dc/terms/description> """conceptSnapshotNotRetainedWebsiteId.description.nlGeneratedFormal"""@nl-BE-x-generated-formal`,
                                `<${conceptSnapshotNotRetainedWebsiteId}> <http://purl.org/dc/terms/description> """conceptSnapshotNotRetainedWebsiteId.description.nlGeneratedInformal"""@nl-BE-x-generated-informal`,
                                `<${conceptSnapshotNotRetainedWebsiteId}> <http://schema.org/url> """http://some-url.com"""`,
                                `<${conceptSnapshotNotRetainedWebsiteId}> <http://www.w3.org/ns/shacl#order> """1"""^^<http://www.w3.org/2001/XMLSchema#integer>`,
                            ]);

                        const actualConceptSnapshot = await repository.findById(conceptSnapshotId);

                        expect(actualConceptSnapshot).toEqual(conceptSnapshot);
                    });
                }
            });

            describe('for procedures', () => {
                for (const nonDutchLanguage of ['de', 'fr', 'en']) {
                    test(`Filters out procedures when title only available in language ${nonDutchLanguage}`, async () => {
                        const conceptSnapshotId = buildConceptSnapshotIri(uuid());
                        const conceptSnapshotTitle = ConceptSnapshotTestBuilder.MINIMAL_TITLE;
                        const conceptSnapshotDescription = aMinimalLanguageString('description').build();
                        const conceptSnapshotProductId = ConceptSnapshotTestBuilder.PRODUCT_ID;
                        const conceptSnapshotDateCreated = ConceptSnapshotTestBuilder.DATE_CREATED;
                        const conceptSnapshotDateModified = ConceptSnapshotTestBuilder.DATE_MODIFIED;
                        const conceptSnapshotGeneratedAtTime = ConceptSnapshotTestBuilder.GENERATED_AT_TIME;
                        const conceptSnapshotRetainedWebsite = anotherFullWebsite(uuid()).withOrder(2).build();
                        const conceptSnapshotProcedure = anotherFullProcedure().withOrder(1).withWebsites([conceptSnapshotRetainedWebsite]).build();
                        const conceptSnapshotNotRetainedProcedureId = ProcedureBuilder.buildIri(uuid());

                        const conceptSnapshot =
                            aMinimalConceptSnapshot()
                                .withId(conceptSnapshotId)
                                .withTitle(conceptSnapshotTitle)
                                .withDescription(conceptSnapshotDescription)
                                .withProductId(conceptSnapshotProductId)
                                .withDateCreated(conceptSnapshotDateCreated)
                                .withDateModified(conceptSnapshotDateModified)
                                .withGeneratedAtTime(conceptSnapshotGeneratedAtTime)
                                .withProcedures([conceptSnapshotProcedure])
                                .build();

                        await directDatabaseAccess.insertData(
                            CONCEPT_SNAPSHOT_LDES_GRAPH,
                            [
                                `<${conceptSnapshotId}> a <https://productencatalogus.data.vlaanderen.be/ns/ipdc-lpdc#ConceptualPublicServiceSnapshot>`,
                                `<${conceptSnapshotId}> <http://purl.org/dc/terms/title> """${conceptSnapshotTitle.nl}"""@nl`,
                                `<${conceptSnapshotId}> <http://purl.org/dc/terms/description> """${conceptSnapshotDescription.nl}"""@nl`,
                                `<${conceptSnapshotId}> <http://schema.org/productID> """${conceptSnapshotProductId}"""`,
                                `<${conceptSnapshotId}> <https://productencatalogus.data.vlaanderen.be/ns/ipdc-lpdc#isArchived> """false"""^^<http://www.w3.org/2001/XMLSchema#boolean>`,
                                `<${conceptSnapshotId}> <http://schema.org/dateCreated> """${conceptSnapshotDateCreated.value}"""^^<http://www.w3.org/2001/XMLSchema#dateTime>`,
                                `<${conceptSnapshotId}> <http://schema.org/dateModified> """${conceptSnapshotDateModified.value}"""^^<http://www.w3.org/2001/XMLSchema#dateTime>`,
                                `<${conceptSnapshotId}> <http://www.w3.org/ns/prov#generatedAtTime> """${conceptSnapshotGeneratedAtTime.value}"""^^<http://www.w3.org/2001/XMLSchema#dateTime>`,

                                `<${conceptSnapshotId}> <http://purl.org/vocab/cpsv#follows> <${conceptSnapshotProcedure.id}>`,
                                `<${conceptSnapshotProcedure.id}> a <http://purl.org/vocab/cpsv#Rule>`,
                                `<${conceptSnapshotProcedure.id}> <http://purl.org/dc/terms/title> """${conceptSnapshotProcedure.title.nl}"""@NL`,
                                `<${conceptSnapshotProcedure.id}> <http://purl.org/dc/terms/title> """${conceptSnapshotProcedure.title.nlFormal}"""@nl-BE-x-formal`,
                                `<${conceptSnapshotProcedure.id}> <http://purl.org/dc/terms/title> """${conceptSnapshotProcedure.title.nlInformal}"""@nl-BE-x-informal`,
                                `<${conceptSnapshotProcedure.id}> <http://purl.org/dc/terms/title> """${conceptSnapshotProcedure.title.nlGeneratedFormal}"""@nl-BE-x-generated-formal`,
                                `<${conceptSnapshotProcedure.id}> <http://purl.org/dc/terms/title> """${conceptSnapshotProcedure.title.nlGeneratedInformal}"""@nl-BE-x-generated-informal`,
                                `<${conceptSnapshotProcedure.id}> <http://purl.org/dc/terms/description> """${conceptSnapshotProcedure.description.nl}"""@NL`,
                                `<${conceptSnapshotProcedure.id}> <http://purl.org/dc/terms/description> """${conceptSnapshotProcedure.description.nlFormal}"""@nl-BE-x-formal`,
                                `<${conceptSnapshotProcedure.id}> <http://purl.org/dc/terms/description> """${conceptSnapshotProcedure.description.nlInformal}"""@nl-BE-x-informal`,
                                `<${conceptSnapshotProcedure.id}> <http://purl.org/dc/terms/description> """${conceptSnapshotProcedure.description.nlGeneratedFormal}"""@nl-BE-x-generated-formal`,
                                `<${conceptSnapshotProcedure.id}> <http://purl.org/dc/terms/description> """${conceptSnapshotProcedure.description.nlGeneratedInformal}"""@nl-BE-x-generated-informal`,
                                `<${conceptSnapshotProcedure.id}> <http://www.w3.org/ns/shacl#order> """1"""^^<http://www.w3.org/2001/XMLSchema#integer>`,

                                `<${conceptSnapshotProcedure.id}> <https://productencatalogus.data.vlaanderen.be/ns/ipdc-lpdc#hasWebsite> <${conceptSnapshotRetainedWebsite.id}>`,
                                `<${conceptSnapshotRetainedWebsite.id}> a <http://schema.org/WebSite>`,
                                `<${conceptSnapshotRetainedWebsite.id}> <http://purl.org/dc/terms/title> """${conceptSnapshotRetainedWebsite.title.nl}"""@NL`,
                                `<${conceptSnapshotRetainedWebsite.id}> <http://purl.org/dc/terms/title> """${conceptSnapshotRetainedWebsite.title.nlFormal}"""@nl-BE-x-formal`,
                                `<${conceptSnapshotRetainedWebsite.id}> <http://purl.org/dc/terms/title> """${conceptSnapshotRetainedWebsite.title.nlInformal}"""@nl-BE-x-informal`,
                                `<${conceptSnapshotRetainedWebsite.id}> <http://purl.org/dc/terms/title> """${conceptSnapshotRetainedWebsite.title.nlGeneratedFormal}"""@nl-BE-x-generated-formal`,
                                `<${conceptSnapshotRetainedWebsite.id}> <http://purl.org/dc/terms/title> """${conceptSnapshotRetainedWebsite.title.nlGeneratedInformal}"""@nl-BE-x-generated-informal`,
                                `<${conceptSnapshotRetainedWebsite.id}> <http://purl.org/dc/terms/description> """${conceptSnapshotRetainedWebsite.description.nl}"""@NL`,
                                `<${conceptSnapshotRetainedWebsite.id}> <http://purl.org/dc/terms/description> """${conceptSnapshotRetainedWebsite.description.nlFormal}"""@nl-BE-x-formal`,
                                `<${conceptSnapshotRetainedWebsite.id}> <http://purl.org/dc/terms/description> """${conceptSnapshotRetainedWebsite.description.nlInformal}"""@nl-BE-x-informal`,
                                `<${conceptSnapshotRetainedWebsite.id}> <http://purl.org/dc/terms/description> """${conceptSnapshotRetainedWebsite.description.nlGeneratedFormal}"""@nl-BE-x-generated-formal`,
                                `<${conceptSnapshotRetainedWebsite.id}> <http://purl.org/dc/terms/description> """${conceptSnapshotRetainedWebsite.description.nlGeneratedInformal}"""@nl-BE-x-generated-informal`,
                                `<${conceptSnapshotRetainedWebsite.id}> <http://schema.org/url> """${conceptSnapshotRetainedWebsite.url}"""`,
                                `<${conceptSnapshotRetainedWebsite.id}> <http://www.w3.org/ns/shacl#order> """2"""^^<http://www.w3.org/2001/XMLSchema#integer>`,

                                `<${conceptSnapshotId}> <http://purl.org/vocab/cpsv#follows> <${conceptSnapshotNotRetainedProcedureId}>`,
                                `<${conceptSnapshotNotRetainedProcedureId}> a <http://purl.org/vocab/cpsv#Rule>`,
                                `<${conceptSnapshotNotRetainedProcedureId}> <http://purl.org/dc/terms/title> """title only available in non-dutch language"""@${nonDutchLanguage}`,
                                `<${conceptSnapshotNotRetainedProcedureId}> <http://purl.org/dc/terms/description> """conceptSnapshotProcedure.description.nl"""@NL`,
                                `<${conceptSnapshotNotRetainedProcedureId}> <http://purl.org/dc/terms/description> """conceptSnapshotProcedure.description.nlFormal"""@nl-BE-x-formal`,
                                `<${conceptSnapshotNotRetainedProcedureId}> <http://purl.org/dc/terms/description> """conceptSnapshotProcedure.description.nlInformal"""@nl-BE-x-informal`,
                                `<${conceptSnapshotNotRetainedProcedureId}> <http://purl.org/dc/terms/description> """conceptSnapshotProcedure.description.nlGeneratedFormal"""@nl-BE-x-generated-formal`,
                                `<${conceptSnapshotNotRetainedProcedureId}> <http://purl.org/dc/terms/description> """conceptSnapshotProcedure.description.nlGeneratedInformal"""@nl-BE-x-generated-informal`,
                                `<${conceptSnapshotNotRetainedProcedureId}> <http://www.w3.org/ns/shacl#order> """2"""^^<http://www.w3.org/2001/XMLSchema#integer>`,
                            ]);

                        const actualConceptSnapshot = await repository.findById(conceptSnapshotId);

                        expect(actualConceptSnapshot).toEqual(conceptSnapshot);
                    });

                    test(`Filters out procedures when description only available in language ${nonDutchLanguage}`, async () => {
                        const conceptSnapshotId = buildConceptSnapshotIri(uuid());
                        const conceptSnapshotTitle = ConceptSnapshotTestBuilder.MINIMAL_TITLE;
                        const conceptSnapshotDescription = aMinimalLanguageString('description').build();
                        const conceptSnapshotProductId = ConceptSnapshotTestBuilder.PRODUCT_ID;
                        const conceptSnapshotDateCreated = ConceptSnapshotTestBuilder.DATE_CREATED;
                        const conceptSnapshotDateModified = ConceptSnapshotTestBuilder.DATE_MODIFIED;
                        const conceptSnapshotGeneratedAtTime = ConceptSnapshotTestBuilder.GENERATED_AT_TIME;
                        const conceptSnapshotRetainedWebsite = anotherFullWebsite(uuid()).withOrder(2).build();
                        const conceptSnapshotProcedure = anotherFullProcedure().withOrder(1).withWebsites([conceptSnapshotRetainedWebsite]).build();
                        const conceptSnapshotNotRetainedProcedureId = ProcedureBuilder.buildIri(uuid());

                        const conceptSnapshot =
                            aMinimalConceptSnapshot()
                                .withId(conceptSnapshotId)
                                .withTitle(conceptSnapshotTitle)
                                .withDescription(conceptSnapshotDescription)
                                .withProductId(conceptSnapshotProductId)
                                .withDateCreated(conceptSnapshotDateCreated)
                                .withDateModified(conceptSnapshotDateModified)
                                .withGeneratedAtTime(conceptSnapshotGeneratedAtTime)
                                .withProcedures([conceptSnapshotProcedure])
                                .build();

                        await directDatabaseAccess.insertData(
                            CONCEPT_SNAPSHOT_LDES_GRAPH,
                            [
                                `<${conceptSnapshotId}> a <https://productencatalogus.data.vlaanderen.be/ns/ipdc-lpdc#ConceptualPublicServiceSnapshot>`,
                                `<${conceptSnapshotId}> <http://purl.org/dc/terms/title> """${conceptSnapshotTitle.nl}"""@nl`,
                                `<${conceptSnapshotId}> <http://purl.org/dc/terms/description> """${conceptSnapshotDescription.nl}"""@nl`,
                                `<${conceptSnapshotId}> <http://schema.org/productID> """${conceptSnapshotProductId}"""`,
                                `<${conceptSnapshotId}> <https://productencatalogus.data.vlaanderen.be/ns/ipdc-lpdc#isArchived> """false"""^^<http://www.w3.org/2001/XMLSchema#boolean>`,
                                `<${conceptSnapshotId}> <http://schema.org/dateCreated> """${conceptSnapshotDateCreated.value}"""^^<http://www.w3.org/2001/XMLSchema#dateTime>`,
                                `<${conceptSnapshotId}> <http://schema.org/dateModified> """${conceptSnapshotDateModified.value}"""^^<http://www.w3.org/2001/XMLSchema#dateTime>`,
                                `<${conceptSnapshotId}> <http://www.w3.org/ns/prov#generatedAtTime> """${conceptSnapshotGeneratedAtTime.value}"""^^<http://www.w3.org/2001/XMLSchema#dateTime>`,

                                `<${conceptSnapshotId}> <http://purl.org/vocab/cpsv#follows> <${conceptSnapshotProcedure.id}>`,
                                `<${conceptSnapshotProcedure.id}> a <http://purl.org/vocab/cpsv#Rule>`,
                                `<${conceptSnapshotProcedure.id}> <http://purl.org/dc/terms/title> """${conceptSnapshotProcedure.title.nl}"""@NL`,
                                `<${conceptSnapshotProcedure.id}> <http://purl.org/dc/terms/title> """${conceptSnapshotProcedure.title.nlFormal}"""@nl-BE-x-formal`,
                                `<${conceptSnapshotProcedure.id}> <http://purl.org/dc/terms/title> """${conceptSnapshotProcedure.title.nlInformal}"""@nl-BE-x-informal`,
                                `<${conceptSnapshotProcedure.id}> <http://purl.org/dc/terms/title> """${conceptSnapshotProcedure.title.nlGeneratedFormal}"""@nl-BE-x-generated-formal`,
                                `<${conceptSnapshotProcedure.id}> <http://purl.org/dc/terms/title> """${conceptSnapshotProcedure.title.nlGeneratedInformal}"""@nl-BE-x-generated-informal`,
                                `<${conceptSnapshotProcedure.id}> <http://purl.org/dc/terms/description> """${conceptSnapshotProcedure.description.nl}"""@NL`,
                                `<${conceptSnapshotProcedure.id}> <http://purl.org/dc/terms/description> """${conceptSnapshotProcedure.description.nlFormal}"""@nl-BE-x-formal`,
                                `<${conceptSnapshotProcedure.id}> <http://purl.org/dc/terms/description> """${conceptSnapshotProcedure.description.nlInformal}"""@nl-BE-x-informal`,
                                `<${conceptSnapshotProcedure.id}> <http://purl.org/dc/terms/description> """${conceptSnapshotProcedure.description.nlGeneratedFormal}"""@nl-BE-x-generated-formal`,
                                `<${conceptSnapshotProcedure.id}> <http://purl.org/dc/terms/description> """${conceptSnapshotProcedure.description.nlGeneratedInformal}"""@nl-BE-x-generated-informal`,
                                `<${conceptSnapshotProcedure.id}> <http://www.w3.org/ns/shacl#order> """1"""^^<http://www.w3.org/2001/XMLSchema#integer>`,

                                `<${conceptSnapshotProcedure.id}> <https://productencatalogus.data.vlaanderen.be/ns/ipdc-lpdc#hasWebsite> <${conceptSnapshotRetainedWebsite.id}>`,
                                `<${conceptSnapshotRetainedWebsite.id}> a <http://schema.org/WebSite>`,
                                `<${conceptSnapshotRetainedWebsite.id}> <http://purl.org/dc/terms/title> """${conceptSnapshotRetainedWebsite.title.nl}"""@NL`,
                                `<${conceptSnapshotRetainedWebsite.id}> <http://purl.org/dc/terms/title> """${conceptSnapshotRetainedWebsite.title.nlFormal}"""@nl-BE-x-formal`,
                                `<${conceptSnapshotRetainedWebsite.id}> <http://purl.org/dc/terms/title> """${conceptSnapshotRetainedWebsite.title.nlInformal}"""@nl-BE-x-informal`,
                                `<${conceptSnapshotRetainedWebsite.id}> <http://purl.org/dc/terms/title> """${conceptSnapshotRetainedWebsite.title.nlGeneratedFormal}"""@nl-BE-x-generated-formal`,
                                `<${conceptSnapshotRetainedWebsite.id}> <http://purl.org/dc/terms/title> """${conceptSnapshotRetainedWebsite.title.nlGeneratedInformal}"""@nl-BE-x-generated-informal`,
                                `<${conceptSnapshotRetainedWebsite.id}> <http://purl.org/dc/terms/description> """${conceptSnapshotRetainedWebsite.description.nl}"""@NL`,
                                `<${conceptSnapshotRetainedWebsite.id}> <http://purl.org/dc/terms/description> """${conceptSnapshotRetainedWebsite.description.nlFormal}"""@nl-BE-x-formal`,
                                `<${conceptSnapshotRetainedWebsite.id}> <http://purl.org/dc/terms/description> """${conceptSnapshotRetainedWebsite.description.nlInformal}"""@nl-BE-x-informal`,
                                `<${conceptSnapshotRetainedWebsite.id}> <http://purl.org/dc/terms/description> """${conceptSnapshotRetainedWebsite.description.nlGeneratedFormal}"""@nl-BE-x-generated-formal`,
                                `<${conceptSnapshotRetainedWebsite.id}> <http://purl.org/dc/terms/description> """${conceptSnapshotRetainedWebsite.description.nlGeneratedInformal}"""@nl-BE-x-generated-informal`,
                                `<${conceptSnapshotRetainedWebsite.id}> <http://schema.org/url> """${conceptSnapshotRetainedWebsite.url}"""`,
                                `<${conceptSnapshotRetainedWebsite.id}> <http://www.w3.org/ns/shacl#order> """2"""^^<http://www.w3.org/2001/XMLSchema#integer>`,

                                `<${conceptSnapshotId}> <http://purl.org/vocab/cpsv#follows> <${conceptSnapshotNotRetainedProcedureId}>`,
                                `<${conceptSnapshotNotRetainedProcedureId}> a <http://purl.org/vocab/cpsv#Rule>`,
                                `<${conceptSnapshotNotRetainedProcedureId}> <http://purl.org/dc/terms/title> """conceptSnapshotProcedure.title.nl"""@NL`,
                                `<${conceptSnapshotNotRetainedProcedureId}> <http://purl.org/dc/terms/title> """conceptSnapshotProcedure.title.nlFormal"""@nl-BE-x-formal`,
                                `<${conceptSnapshotNotRetainedProcedureId}> <http://purl.org/dc/terms/title> """conceptSnapshotProcedure.title.nlInformal"""@nl-BE-x-informal`,
                                `<${conceptSnapshotNotRetainedProcedureId}> <http://purl.org/dc/terms/title> """conceptSnapshotProcedure.title.nlGeneratedFormal"""@nl-BE-x-generated-formal`,
                                `<${conceptSnapshotNotRetainedProcedureId}> <http://purl.org/dc/terms/title> """conceptSnapshotProcedure.title.nlGeneratedInformal"""@nl-BE-x-generated-informal`,
                                `<${conceptSnapshotNotRetainedProcedureId}> <http://purl.org/dc/terms/description> """description only available in non-dutch language"""@${nonDutchLanguage}`,
                                `<${conceptSnapshotNotRetainedProcedureId}> <http://www.w3.org/ns/shacl#order> """2"""^^<http://www.w3.org/2001/XMLSchema#integer>`,
                            ]);

                        const actualConceptSnapshot = await repository.findById(conceptSnapshotId);

                        expect(actualConceptSnapshot).toEqual(conceptSnapshot);
                    });

                    test(`Filters out procedures when both title and description only available in language ${nonDutchLanguage}`, async () => {
                        const conceptSnapshotId = buildConceptSnapshotIri(uuid());
                        const conceptSnapshotTitle = ConceptSnapshotTestBuilder.MINIMAL_TITLE;
                        const conceptSnapshotDescription = aMinimalLanguageString('description').build();
                        const conceptSnapshotProductId = ConceptSnapshotTestBuilder.PRODUCT_ID;
                        const conceptSnapshotDateCreated = ConceptSnapshotTestBuilder.DATE_CREATED;
                        const conceptSnapshotDateModified = ConceptSnapshotTestBuilder.DATE_MODIFIED;
                        const conceptSnapshotGeneratedAtTime = ConceptSnapshotTestBuilder.GENERATED_AT_TIME;
                        const conceptSnapshotRetainedWebsite = anotherFullWebsite(uuid()).withOrder(2).build();
                        const conceptSnapshotProcedure = anotherFullProcedure().withOrder(1).withWebsites([conceptSnapshotRetainedWebsite]).build();
                        const conceptSnapshotNotRetainedProcedureId = ProcedureBuilder.buildIri(uuid());

                        const conceptSnapshot =
                            aMinimalConceptSnapshot()
                                .withId(conceptSnapshotId)
                                .withTitle(conceptSnapshotTitle)
                                .withDescription(conceptSnapshotDescription)
                                .withProductId(conceptSnapshotProductId)
                                .withDateCreated(conceptSnapshotDateCreated)
                                .withDateModified(conceptSnapshotDateModified)
                                .withGeneratedAtTime(conceptSnapshotGeneratedAtTime)
                                .withProcedures([conceptSnapshotProcedure])
                                .build();

                        await directDatabaseAccess.insertData(
                            CONCEPT_SNAPSHOT_LDES_GRAPH,
                            [
                                `<${conceptSnapshotId}> a <https://productencatalogus.data.vlaanderen.be/ns/ipdc-lpdc#ConceptualPublicServiceSnapshot>`,
                                `<${conceptSnapshotId}> <http://purl.org/dc/terms/title> """${conceptSnapshotTitle.nl}"""@nl`,
                                `<${conceptSnapshotId}> <http://purl.org/dc/terms/description> """${conceptSnapshotDescription.nl}"""@nl`,
                                `<${conceptSnapshotId}> <http://schema.org/productID> """${conceptSnapshotProductId}"""`,
                                `<${conceptSnapshotId}> <https://productencatalogus.data.vlaanderen.be/ns/ipdc-lpdc#isArchived> """false"""^^<http://www.w3.org/2001/XMLSchema#boolean>`,
                                `<${conceptSnapshotId}> <http://schema.org/dateCreated> """${conceptSnapshotDateCreated.value}"""^^<http://www.w3.org/2001/XMLSchema#dateTime>`,
                                `<${conceptSnapshotId}> <http://schema.org/dateModified> """${conceptSnapshotDateModified.value}"""^^<http://www.w3.org/2001/XMLSchema#dateTime>`,
                                `<${conceptSnapshotId}> <http://www.w3.org/ns/prov#generatedAtTime> """${conceptSnapshotGeneratedAtTime.value}"""^^<http://www.w3.org/2001/XMLSchema#dateTime>`,

                                `<${conceptSnapshotId}> <http://purl.org/vocab/cpsv#follows> <${conceptSnapshotProcedure.id}>`,
                                `<${conceptSnapshotProcedure.id}> a <http://purl.org/vocab/cpsv#Rule>`,
                                `<${conceptSnapshotProcedure.id}> <http://purl.org/dc/terms/title> """${conceptSnapshotProcedure.title.nl}"""@NL`,
                                `<${conceptSnapshotProcedure.id}> <http://purl.org/dc/terms/title> """${conceptSnapshotProcedure.title.nlFormal}"""@nl-BE-x-formal`,
                                `<${conceptSnapshotProcedure.id}> <http://purl.org/dc/terms/title> """${conceptSnapshotProcedure.title.nlInformal}"""@nl-BE-x-informal`,
                                `<${conceptSnapshotProcedure.id}> <http://purl.org/dc/terms/title> """${conceptSnapshotProcedure.title.nlGeneratedFormal}"""@nl-BE-x-generated-formal`,
                                `<${conceptSnapshotProcedure.id}> <http://purl.org/dc/terms/title> """${conceptSnapshotProcedure.title.nlGeneratedInformal}"""@nl-BE-x-generated-informal`,
                                `<${conceptSnapshotProcedure.id}> <http://purl.org/dc/terms/description> """${conceptSnapshotProcedure.description.nl}"""@NL`,
                                `<${conceptSnapshotProcedure.id}> <http://purl.org/dc/terms/description> """${conceptSnapshotProcedure.description.nlFormal}"""@nl-BE-x-formal`,
                                `<${conceptSnapshotProcedure.id}> <http://purl.org/dc/terms/description> """${conceptSnapshotProcedure.description.nlInformal}"""@nl-BE-x-informal`,
                                `<${conceptSnapshotProcedure.id}> <http://purl.org/dc/terms/description> """${conceptSnapshotProcedure.description.nlGeneratedFormal}"""@nl-BE-x-generated-formal`,
                                `<${conceptSnapshotProcedure.id}> <http://purl.org/dc/terms/description> """${conceptSnapshotProcedure.description.nlGeneratedInformal}"""@nl-BE-x-generated-informal`,
                                `<${conceptSnapshotProcedure.id}> <http://www.w3.org/ns/shacl#order> """1"""^^<http://www.w3.org/2001/XMLSchema#integer>`,

                                `<${conceptSnapshotProcedure.id}> <https://productencatalogus.data.vlaanderen.be/ns/ipdc-lpdc#hasWebsite> <${conceptSnapshotRetainedWebsite.id}>`,
                                `<${conceptSnapshotRetainedWebsite.id}> a <http://schema.org/WebSite>`,
                                `<${conceptSnapshotRetainedWebsite.id}> <http://purl.org/dc/terms/title> """${conceptSnapshotRetainedWebsite.title.nl}"""@NL`,
                                `<${conceptSnapshotRetainedWebsite.id}> <http://purl.org/dc/terms/title> """${conceptSnapshotRetainedWebsite.title.nlFormal}"""@nl-BE-x-formal`,
                                `<${conceptSnapshotRetainedWebsite.id}> <http://purl.org/dc/terms/title> """${conceptSnapshotRetainedWebsite.title.nlInformal}"""@nl-BE-x-informal`,
                                `<${conceptSnapshotRetainedWebsite.id}> <http://purl.org/dc/terms/title> """${conceptSnapshotRetainedWebsite.title.nlGeneratedFormal}"""@nl-BE-x-generated-formal`,
                                `<${conceptSnapshotRetainedWebsite.id}> <http://purl.org/dc/terms/title> """${conceptSnapshotRetainedWebsite.title.nlGeneratedInformal}"""@nl-BE-x-generated-informal`,
                                `<${conceptSnapshotRetainedWebsite.id}> <http://purl.org/dc/terms/description> """${conceptSnapshotRetainedWebsite.description.nl}"""@NL`,
                                `<${conceptSnapshotRetainedWebsite.id}> <http://purl.org/dc/terms/description> """${conceptSnapshotRetainedWebsite.description.nlFormal}"""@nl-BE-x-formal`,
                                `<${conceptSnapshotRetainedWebsite.id}> <http://purl.org/dc/terms/description> """${conceptSnapshotRetainedWebsite.description.nlInformal}"""@nl-BE-x-informal`,
                                `<${conceptSnapshotRetainedWebsite.id}> <http://purl.org/dc/terms/description> """${conceptSnapshotRetainedWebsite.description.nlGeneratedFormal}"""@nl-BE-x-generated-formal`,
                                `<${conceptSnapshotRetainedWebsite.id}> <http://purl.org/dc/terms/description> """${conceptSnapshotRetainedWebsite.description.nlGeneratedInformal}"""@nl-BE-x-generated-informal`,
                                `<${conceptSnapshotRetainedWebsite.id}> <http://schema.org/url> """${conceptSnapshotRetainedWebsite.url}"""`,
                                `<${conceptSnapshotRetainedWebsite.id}> <http://www.w3.org/ns/shacl#order> """2"""^^<http://www.w3.org/2001/XMLSchema#integer>`,

                                `<${conceptSnapshotId}> <http://purl.org/vocab/cpsv#follows> <${conceptSnapshotNotRetainedProcedureId}>`,
                                `<${conceptSnapshotNotRetainedProcedureId}> a <http://purl.org/vocab/cpsv#Rule>`,
                                `<${conceptSnapshotNotRetainedProcedureId}> <http://purl.org/dc/terms/title> """title only available in non-dutch language"""@${nonDutchLanguage}`,
                                `<${conceptSnapshotNotRetainedProcedureId}> <http://purl.org/dc/terms/description> """description only available in non-dutch language"""@${nonDutchLanguage}`,
                                `<${conceptSnapshotNotRetainedProcedureId}> <http://www.w3.org/ns/shacl#order> """2"""^^<http://www.w3.org/2001/XMLSchema#integer>`,
                            ]);

                        const actualConceptSnapshot = await repository.findById(conceptSnapshotId);

                        expect(actualConceptSnapshot).toEqual(conceptSnapshot);
                    });

                }

                test(`Throws Error if required fields are missing for procedure`, async () => {
                    const conceptSnapshotId = buildConceptSnapshotIri(uuid());
                    const conceptSnapshotTitle = ConceptSnapshotTestBuilder.MINIMAL_TITLE;
                    const conceptSnapshotDescription = aMinimalLanguageString('description').build();
                    const conceptSnapshotProductId = ConceptSnapshotTestBuilder.PRODUCT_ID;
                    const conceptSnapshotDateCreated = ConceptSnapshotTestBuilder.DATE_CREATED;
                    const conceptSnapshotDateModified = ConceptSnapshotTestBuilder.DATE_MODIFIED;
                    const conceptSnapshotGeneratedAtTime = ConceptSnapshotTestBuilder.GENERATED_AT_TIME;
                    const conceptSnapshotProcedureId = ProcedureBuilder.buildIri(uuid());

                    await directDatabaseAccess.insertData(
                        CONCEPT_SNAPSHOT_LDES_GRAPH,
                        [
                            `<${conceptSnapshotId}> a <https://productencatalogus.data.vlaanderen.be/ns/ipdc-lpdc#ConceptualPublicServiceSnapshot>`,
                            `<${conceptSnapshotId}> <http://purl.org/dc/terms/title> """${conceptSnapshotTitle.nl}"""@nl`,
                            `<${conceptSnapshotId}> <http://purl.org/dc/terms/description> """${conceptSnapshotDescription.nl}"""@nl`,
                            `<${conceptSnapshotId}> <http://schema.org/productID> """${conceptSnapshotProductId}"""`,
                            `<${conceptSnapshotId}> <https://productencatalogus.data.vlaanderen.be/ns/ipdc-lpdc#isArchived> """false"""^^<http://www.w3.org/2001/XMLSchema#boolean>`,
                            `<${conceptSnapshotId}> <http://schema.org/dateCreated> """${conceptSnapshotDateCreated.value}"""^^<http://www.w3.org/2001/XMLSchema#dateTime>`,
                            `<${conceptSnapshotId}> <http://schema.org/dateModified> """${conceptSnapshotDateModified.value}"""^^<http://www.w3.org/2001/XMLSchema#dateTime>`,
                            `<${conceptSnapshotId}> <http://www.w3.org/ns/prov#generatedAtTime> """${conceptSnapshotGeneratedAtTime.value}"""^^<http://www.w3.org/2001/XMLSchema#dateTime>`,

                            `<${conceptSnapshotId}> <http://purl.org/vocab/cpsv#follows> <${conceptSnapshotProcedureId}>`,
                            `<${conceptSnapshotProcedureId}> a <http://purl.org/vocab/cpsv#Rule>`,

                        ]);

                    await expect(repository.findById(conceptSnapshotId)).rejects.toThrowWithMessage(InvariantError, `order mag niet ontbreken`);
                });

            });

            describe('for requirements', () => {
                for (const nonDutchLanguage of ['de', 'fr', 'en']) {
                    test(`Filters out requirement when title only available in language ${nonDutchLanguage}`, async () => {
                        const conceptSnapshotId = buildConceptSnapshotIri(uuid());
                        const conceptSnapshotTitle = ConceptSnapshotTestBuilder.MINIMAL_TITLE;
                        const conceptSnapshotDescription = aMinimalLanguageString('description').build();
                        const conceptSnapshotProductId = ConceptSnapshotTestBuilder.PRODUCT_ID;
                        const conceptSnapshotDateCreated = ConceptSnapshotTestBuilder.DATE_CREATED;
                        const conceptSnapshotDateModified = ConceptSnapshotTestBuilder.DATE_MODIFIED;
                        const conceptSnapshotGeneratedAtTime = ConceptSnapshotTestBuilder.GENERATED_AT_TIME;
                        const conceptSnapshotRequirement = anotherFullRequirement().withOrder(2).build();
                        const conceptSnapshotNotRetainedRequirementId = RequirementBuilder.buildIri(uuid());

                        const conceptSnapshot =
                            aMinimalConceptSnapshot()
                                .withId(conceptSnapshotId)
                                .withTitle(conceptSnapshotTitle)
                                .withDescription(conceptSnapshotDescription)
                                .withProductId(conceptSnapshotProductId)
                                .withDateCreated(conceptSnapshotDateCreated)
                                .withDateModified(conceptSnapshotDateModified)
                                .withGeneratedAtTime(conceptSnapshotGeneratedAtTime)
                                .withRequirements([conceptSnapshotRequirement])
                                .build();

                        await directDatabaseAccess.insertData(
                            CONCEPT_SNAPSHOT_LDES_GRAPH,
                            [
                                `<${conceptSnapshotId}> a <https://productencatalogus.data.vlaanderen.be/ns/ipdc-lpdc#ConceptualPublicServiceSnapshot>`,
                                `<${conceptSnapshotId}> <http://purl.org/dc/terms/title> """${conceptSnapshotTitle.nl}"""@nl`,
                                `<${conceptSnapshotId}> <http://purl.org/dc/terms/description> """${conceptSnapshotDescription.nl}"""@nl`,
                                `<${conceptSnapshotId}> <http://schema.org/productID> """${conceptSnapshotProductId}"""`,
                                `<${conceptSnapshotId}> <https://productencatalogus.data.vlaanderen.be/ns/ipdc-lpdc#isArchived> """false"""^^<http://www.w3.org/2001/XMLSchema#boolean>`,
                                `<${conceptSnapshotId}> <http://schema.org/dateCreated> """${conceptSnapshotDateCreated.value}"""^^<http://www.w3.org/2001/XMLSchema#dateTime>`,
                                `<${conceptSnapshotId}> <http://schema.org/dateModified> """${conceptSnapshotDateModified.value}"""^^<http://www.w3.org/2001/XMLSchema#dateTime>`,
                                `<${conceptSnapshotId}> <http://www.w3.org/ns/prov#generatedAtTime> """${conceptSnapshotGeneratedAtTime.value}"""^^<http://www.w3.org/2001/XMLSchema#dateTime>`,

                                `<${conceptSnapshotId}> <http://vocab.belgif.be/ns/publicservice#hasRequirement> <${conceptSnapshotRequirement.id}>`,
                                `<${conceptSnapshotRequirement.id}> a <http://data.europa.eu/m8g/Requirement>`,
                                `<${conceptSnapshotRequirement.id}> <http://purl.org/dc/terms/title> """${conceptSnapshotRequirement.title.nl}"""@NL`,
                                `<${conceptSnapshotRequirement.id}> <http://purl.org/dc/terms/title> """${conceptSnapshotRequirement.title.nlFormal}"""@nl-BE-x-formal`,
                                `<${conceptSnapshotRequirement.id}> <http://purl.org/dc/terms/title> """${conceptSnapshotRequirement.title.nlInformal}"""@nl-BE-x-informal`,
                                `<${conceptSnapshotRequirement.id}> <http://purl.org/dc/terms/title> """${conceptSnapshotRequirement.title.nlGeneratedFormal}"""@nl-BE-x-generated-formal`,
                                `<${conceptSnapshotRequirement.id}> <http://purl.org/dc/terms/title> """${conceptSnapshotRequirement.title.nlGeneratedInformal}"""@nl-BE-x-generated-informal`,
                                `<${conceptSnapshotRequirement.id}> <http://purl.org/dc/terms/description> """${conceptSnapshotRequirement.description.nl}"""@NL`,
                                `<${conceptSnapshotRequirement.id}> <http://purl.org/dc/terms/description> """${conceptSnapshotRequirement.description.nlFormal}"""@nl-BE-x-formal`,
                                `<${conceptSnapshotRequirement.id}> <http://purl.org/dc/terms/description> """${conceptSnapshotRequirement.description.nlInformal}"""@nl-BE-x-informal`,
                                `<${conceptSnapshotRequirement.id}> <http://purl.org/dc/terms/description> """${conceptSnapshotRequirement.description.nlGeneratedFormal}"""@nl-BE-x-generated-formal`,
                                `<${conceptSnapshotRequirement.id}> <http://purl.org/dc/terms/description> """${conceptSnapshotRequirement.description.nlGeneratedInformal}"""@nl-BE-x-generated-informal`,
                                `<${conceptSnapshotRequirement.id}> <http://www.w3.org/ns/shacl#order> """2"""^^<http://www.w3.org/2001/XMLSchema#integer>`,
                                `<${conceptSnapshotRequirement.id}> <http://data.europa.eu/m8g/hasSupportingEvidence> <${conceptSnapshotRequirement.evidence.id}>`,
                                `<${conceptSnapshotRequirement.evidence.id}> a <http://data.europa.eu/m8g/Evidence>`,
                                `<${conceptSnapshotRequirement.evidence.id}> <http://purl.org/dc/terms/title> """${conceptSnapshotRequirement.evidence.title.nl}"""@NL`,
                                `<${conceptSnapshotRequirement.evidence.id}> <http://purl.org/dc/terms/title> """${conceptSnapshotRequirement.evidence.title.nlFormal}"""@nl-BE-x-formal`,
                                `<${conceptSnapshotRequirement.evidence.id}> <http://purl.org/dc/terms/title> """${conceptSnapshotRequirement.evidence.title.nlInformal}"""@nl-BE-x-informal`,
                                `<${conceptSnapshotRequirement.evidence.id}> <http://purl.org/dc/terms/title> """${conceptSnapshotRequirement.evidence.title.nlGeneratedFormal}"""@nl-BE-x-generated-formal`,
                                `<${conceptSnapshotRequirement.evidence.id}> <http://purl.org/dc/terms/title> """${conceptSnapshotRequirement.evidence.title.nlGeneratedInformal}"""@nl-BE-x-generated-informal`,
                                `<${conceptSnapshotRequirement.evidence.id}> <http://purl.org/dc/terms/description> """${conceptSnapshotRequirement.evidence.description.nl}"""@NL`,
                                `<${conceptSnapshotRequirement.evidence.id}> <http://purl.org/dc/terms/description> """${conceptSnapshotRequirement.evidence.description.nlFormal}"""@nl-BE-x-formal`,
                                `<${conceptSnapshotRequirement.evidence.id}> <http://purl.org/dc/terms/description> """${conceptSnapshotRequirement.evidence.description.nlInformal}"""@nl-BE-x-informal`,
                                `<${conceptSnapshotRequirement.evidence.id}> <http://purl.org/dc/terms/description> """${conceptSnapshotRequirement.evidence.description.nlGeneratedFormal}"""@nl-BE-x-generated-formal`,
                                `<${conceptSnapshotRequirement.evidence.id}> <http://purl.org/dc/terms/description> """${conceptSnapshotRequirement.evidence.description.nlGeneratedInformal}"""@nl-BE-x-generated-informal`,

                                `<${conceptSnapshotId}> <http://vocab.belgif.be/ns/publicservice#hasRequirement> <${conceptSnapshotNotRetainedRequirementId}>`,
                                `<${conceptSnapshotNotRetainedRequirementId}> a <http://data.europa.eu/m8g/Requirement>`,
                                `<${conceptSnapshotNotRetainedRequirementId}> <http://purl.org/dc/terms/title> """title only available in non-dutch language"""@${nonDutchLanguage}`,
                                `<${conceptSnapshotNotRetainedRequirementId}> <http://purl.org/dc/terms/description> """conceptSnapshotRequirement.description.nl"""@NL`,
                                `<${conceptSnapshotNotRetainedRequirementId}> <http://purl.org/dc/terms/description> """conceptSnapshotRequirement.description.nlFormal"""@nl-BE-x-formal`,
                                `<${conceptSnapshotNotRetainedRequirementId}> <http://purl.org/dc/terms/description> """conceptSnapshotRequirement.description.nlInformal"""@nl-BE-x-informal`,
                                `<${conceptSnapshotNotRetainedRequirementId}> <http://purl.org/dc/terms/description> """conceptSnapshotRequirement.description.nlGeneratedFormal"""@nl-BE-x-generated-formal`,
                                `<${conceptSnapshotNotRetainedRequirementId}> <http://purl.org/dc/terms/description> """conceptSnapshotRequirement.description.nlGeneratedInformal"""@nl-BE-x-generated-informal`,
                                `<${conceptSnapshotNotRetainedRequirementId}> <http://www.w3.org/ns/shacl#order> """1"""^^<http://www.w3.org/2001/XMLSchema#integer>`,

                            ]);

                        const actualConceptSnapshot = await repository.findById(conceptSnapshotId);

                        expect(actualConceptSnapshot).toEqual(conceptSnapshot);
                    });

                    test(`Filters out requirement when description only available in language ${nonDutchLanguage}`, async () => {
                        const conceptSnapshotId = buildConceptSnapshotIri(uuid());
                        const conceptSnapshotTitle = ConceptSnapshotTestBuilder.MINIMAL_TITLE;
                        const conceptSnapshotDescription = aMinimalLanguageString('description').build();
                        const conceptSnapshotProductId = ConceptSnapshotTestBuilder.PRODUCT_ID;
                        const conceptSnapshotDateCreated = ConceptSnapshotTestBuilder.DATE_CREATED;
                        const conceptSnapshotDateModified = ConceptSnapshotTestBuilder.DATE_MODIFIED;
                        const conceptSnapshotGeneratedAtTime = ConceptSnapshotTestBuilder.GENERATED_AT_TIME;
                        const conceptSnapshotRequirement = anotherFullRequirement().withOrder(2).build();
                        const conceptSnapshotNotRetainedRequirementId = RequirementBuilder.buildIri(uuid());

                        const conceptSnapshot =
                            aMinimalConceptSnapshot()
                                .withId(conceptSnapshotId)
                                .withTitle(conceptSnapshotTitle)
                                .withDescription(conceptSnapshotDescription)
                                .withProductId(conceptSnapshotProductId)
                                .withDateCreated(conceptSnapshotDateCreated)
                                .withDateModified(conceptSnapshotDateModified)
                                .withGeneratedAtTime(conceptSnapshotGeneratedAtTime)
                                .withRequirements([conceptSnapshotRequirement])
                                .build();

                        await directDatabaseAccess.insertData(
                            CONCEPT_SNAPSHOT_LDES_GRAPH,
                            [
                                `<${conceptSnapshotId}> a <https://productencatalogus.data.vlaanderen.be/ns/ipdc-lpdc#ConceptualPublicServiceSnapshot>`,
                                `<${conceptSnapshotId}> <http://purl.org/dc/terms/title> """${conceptSnapshotTitle.nl}"""@nl`,
                                `<${conceptSnapshotId}> <http://purl.org/dc/terms/description> """${conceptSnapshotDescription.nl}"""@nl`,
                                `<${conceptSnapshotId}> <http://schema.org/productID> """${conceptSnapshotProductId}"""`,
                                `<${conceptSnapshotId}> <https://productencatalogus.data.vlaanderen.be/ns/ipdc-lpdc#isArchived> """false"""^^<http://www.w3.org/2001/XMLSchema#boolean>`,
                                `<${conceptSnapshotId}> <http://schema.org/dateCreated> """${conceptSnapshotDateCreated.value}"""^^<http://www.w3.org/2001/XMLSchema#dateTime>`,
                                `<${conceptSnapshotId}> <http://schema.org/dateModified> """${conceptSnapshotDateModified.value}"""^^<http://www.w3.org/2001/XMLSchema#dateTime>`,
                                `<${conceptSnapshotId}> <http://www.w3.org/ns/prov#generatedAtTime> """${conceptSnapshotGeneratedAtTime.value}"""^^<http://www.w3.org/2001/XMLSchema#dateTime>`,

                                `<${conceptSnapshotId}> <http://vocab.belgif.be/ns/publicservice#hasRequirement> <${conceptSnapshotRequirement.id}>`,
                                `<${conceptSnapshotRequirement.id}> a <http://data.europa.eu/m8g/Requirement>`,
                                `<${conceptSnapshotRequirement.id}> <http://purl.org/dc/terms/title> """${conceptSnapshotRequirement.title.nl}"""@NL`,
                                `<${conceptSnapshotRequirement.id}> <http://purl.org/dc/terms/title> """${conceptSnapshotRequirement.title.nlFormal}"""@nl-BE-x-formal`,
                                `<${conceptSnapshotRequirement.id}> <http://purl.org/dc/terms/title> """${conceptSnapshotRequirement.title.nlInformal}"""@nl-BE-x-informal`,
                                `<${conceptSnapshotRequirement.id}> <http://purl.org/dc/terms/title> """${conceptSnapshotRequirement.title.nlGeneratedFormal}"""@nl-BE-x-generated-formal`,
                                `<${conceptSnapshotRequirement.id}> <http://purl.org/dc/terms/title> """${conceptSnapshotRequirement.title.nlGeneratedInformal}"""@nl-BE-x-generated-informal`,
                                `<${conceptSnapshotRequirement.id}> <http://purl.org/dc/terms/description> """${conceptSnapshotRequirement.description.nl}"""@NL`,
                                `<${conceptSnapshotRequirement.id}> <http://purl.org/dc/terms/description> """${conceptSnapshotRequirement.description.nlFormal}"""@nl-BE-x-formal`,
                                `<${conceptSnapshotRequirement.id}> <http://purl.org/dc/terms/description> """${conceptSnapshotRequirement.description.nlInformal}"""@nl-BE-x-informal`,
                                `<${conceptSnapshotRequirement.id}> <http://purl.org/dc/terms/description> """${conceptSnapshotRequirement.description.nlGeneratedFormal}"""@nl-BE-x-generated-formal`,
                                `<${conceptSnapshotRequirement.id}> <http://purl.org/dc/terms/description> """${conceptSnapshotRequirement.description.nlGeneratedInformal}"""@nl-BE-x-generated-informal`,
                                `<${conceptSnapshotRequirement.id}> <http://www.w3.org/ns/shacl#order> """2"""^^<http://www.w3.org/2001/XMLSchema#integer>`,
                                `<${conceptSnapshotRequirement.id}> <http://data.europa.eu/m8g/hasSupportingEvidence> <${conceptSnapshotRequirement.evidence.id}>`,
                                `<${conceptSnapshotRequirement.evidence.id}> a <http://data.europa.eu/m8g/Evidence>`,
                                `<${conceptSnapshotRequirement.evidence.id}> <http://purl.org/dc/terms/title> """${conceptSnapshotRequirement.evidence.title.nl}"""@NL`,
                                `<${conceptSnapshotRequirement.evidence.id}> <http://purl.org/dc/terms/title> """${conceptSnapshotRequirement.evidence.title.nlFormal}"""@nl-BE-x-formal`,
                                `<${conceptSnapshotRequirement.evidence.id}> <http://purl.org/dc/terms/title> """${conceptSnapshotRequirement.evidence.title.nlInformal}"""@nl-BE-x-informal`,
                                `<${conceptSnapshotRequirement.evidence.id}> <http://purl.org/dc/terms/title> """${conceptSnapshotRequirement.evidence.title.nlGeneratedFormal}"""@nl-BE-x-generated-formal`,
                                `<${conceptSnapshotRequirement.evidence.id}> <http://purl.org/dc/terms/title> """${conceptSnapshotRequirement.evidence.title.nlGeneratedInformal}"""@nl-BE-x-generated-informal`,
                                `<${conceptSnapshotRequirement.evidence.id}> <http://purl.org/dc/terms/description> """${conceptSnapshotRequirement.evidence.description.nl}"""@NL`,
                                `<${conceptSnapshotRequirement.evidence.id}> <http://purl.org/dc/terms/description> """${conceptSnapshotRequirement.evidence.description.nlFormal}"""@nl-BE-x-formal`,
                                `<${conceptSnapshotRequirement.evidence.id}> <http://purl.org/dc/terms/description> """${conceptSnapshotRequirement.evidence.description.nlInformal}"""@nl-BE-x-informal`,
                                `<${conceptSnapshotRequirement.evidence.id}> <http://purl.org/dc/terms/description> """${conceptSnapshotRequirement.evidence.description.nlGeneratedFormal}"""@nl-BE-x-generated-formal`,
                                `<${conceptSnapshotRequirement.evidence.id}> <http://purl.org/dc/terms/description> """${conceptSnapshotRequirement.evidence.description.nlGeneratedInformal}"""@nl-BE-x-generated-informal`,

                                `<${conceptSnapshotId}> <http://vocab.belgif.be/ns/publicservice#hasRequirement> <${conceptSnapshotNotRetainedRequirementId}>`,
                                `<${conceptSnapshotNotRetainedRequirementId}> a <http://data.europa.eu/m8g/Requirement>`,
                                `<${conceptSnapshotNotRetainedRequirementId}> <http://purl.org/dc/terms/title> """conceptSnapshotRequirement.title.nl"""@NL`,
                                `<${conceptSnapshotNotRetainedRequirementId}> <http://purl.org/dc/terms/title> """conceptSnapshotRequirement.title.nlFormal"""@nl-BE-x-formal`,
                                `<${conceptSnapshotNotRetainedRequirementId}> <http://purl.org/dc/terms/title> """conceptSnapshotRequirement.title.nlInformal"""@nl-BE-x-informal`,
                                `<${conceptSnapshotNotRetainedRequirementId}> <http://purl.org/dc/terms/title> """conceptSnapshotRequirement.title.nlGeneratedFormal"""@nl-BE-x-generated-formal`,
                                `<${conceptSnapshotNotRetainedRequirementId}> <http://purl.org/dc/terms/title> """conceptSnapshotRequirement.title.nlGeneratedInformal"""@nl-BE-x-generated-informal`,
                                `<${conceptSnapshotNotRetainedRequirementId}> <http://purl.org/dc/terms/description> """description only available in non-dutch language"""@${nonDutchLanguage}`,
                                `<${conceptSnapshotNotRetainedRequirementId}> <http://www.w3.org/ns/shacl#order> """1"""^^<http://www.w3.org/2001/XMLSchema#integer>`,

                            ]);

                        const actualConceptSnapshot = await repository.findById(conceptSnapshotId);

                        expect(actualConceptSnapshot).toEqual(conceptSnapshot);
                    });

                    test(`Filters out requirement when both title and description only available in language ${nonDutchLanguage}`, async () => {
                        const conceptSnapshotId = buildConceptSnapshotIri(uuid());
                        const conceptSnapshotTitle = ConceptSnapshotTestBuilder.MINIMAL_TITLE;
                        const conceptSnapshotDescription = aMinimalLanguageString('description').build();
                        const conceptSnapshotProductId = ConceptSnapshotTestBuilder.PRODUCT_ID;
                        const conceptSnapshotDateCreated = ConceptSnapshotTestBuilder.DATE_CREATED;
                        const conceptSnapshotDateModified = ConceptSnapshotTestBuilder.DATE_MODIFIED;
                        const conceptSnapshotGeneratedAtTime = ConceptSnapshotTestBuilder.GENERATED_AT_TIME;
                        const conceptSnapshotRequirement = anotherFullRequirement().withOrder(2).build();
                        const conceptSnapshotNotRetainedRequirementId = RequirementBuilder.buildIri(uuid());

                        const conceptSnapshot =
                            aMinimalConceptSnapshot()
                                .withId(conceptSnapshotId)
                                .withTitle(conceptSnapshotTitle)
                                .withDescription(conceptSnapshotDescription)
                                .withProductId(conceptSnapshotProductId)
                                .withDateCreated(conceptSnapshotDateCreated)
                                .withDateModified(conceptSnapshotDateModified)
                                .withGeneratedAtTime(conceptSnapshotGeneratedAtTime)
                                .withRequirements([conceptSnapshotRequirement])
                                .build();

                        await directDatabaseAccess.insertData(
                            CONCEPT_SNAPSHOT_LDES_GRAPH,
                            [
                                `<${conceptSnapshotId}> a <https://productencatalogus.data.vlaanderen.be/ns/ipdc-lpdc#ConceptualPublicServiceSnapshot>`,
                                `<${conceptSnapshotId}> <http://purl.org/dc/terms/title> """${conceptSnapshotTitle.nl}"""@nl`,
                                `<${conceptSnapshotId}> <http://purl.org/dc/terms/description> """${conceptSnapshotDescription.nl}"""@nl`,
                                `<${conceptSnapshotId}> <http://schema.org/productID> """${conceptSnapshotProductId}"""`,
                                `<${conceptSnapshotId}> <https://productencatalogus.data.vlaanderen.be/ns/ipdc-lpdc#isArchived> """false"""^^<http://www.w3.org/2001/XMLSchema#boolean>`,
                                `<${conceptSnapshotId}> <http://schema.org/dateCreated> """${conceptSnapshotDateCreated.value}"""^^<http://www.w3.org/2001/XMLSchema#dateTime>`,
                                `<${conceptSnapshotId}> <http://schema.org/dateModified> """${conceptSnapshotDateModified.value}"""^^<http://www.w3.org/2001/XMLSchema#dateTime>`,
                                `<${conceptSnapshotId}> <http://www.w3.org/ns/prov#generatedAtTime> """${conceptSnapshotGeneratedAtTime.value}"""^^<http://www.w3.org/2001/XMLSchema#dateTime>`,

                                `<${conceptSnapshotId}> <http://vocab.belgif.be/ns/publicservice#hasRequirement> <${conceptSnapshotRequirement.id}>`,
                                `<${conceptSnapshotRequirement.id}> a <http://data.europa.eu/m8g/Requirement>`,
                                `<${conceptSnapshotRequirement.id}> <http://purl.org/dc/terms/title> """${conceptSnapshotRequirement.title.nl}"""@NL`,
                                `<${conceptSnapshotRequirement.id}> <http://purl.org/dc/terms/title> """${conceptSnapshotRequirement.title.nlFormal}"""@nl-BE-x-formal`,
                                `<${conceptSnapshotRequirement.id}> <http://purl.org/dc/terms/title> """${conceptSnapshotRequirement.title.nlInformal}"""@nl-BE-x-informal`,
                                `<${conceptSnapshotRequirement.id}> <http://purl.org/dc/terms/title> """${conceptSnapshotRequirement.title.nlGeneratedFormal}"""@nl-BE-x-generated-formal`,
                                `<${conceptSnapshotRequirement.id}> <http://purl.org/dc/terms/title> """${conceptSnapshotRequirement.title.nlGeneratedInformal}"""@nl-BE-x-generated-informal`,
                                `<${conceptSnapshotRequirement.id}> <http://purl.org/dc/terms/description> """${conceptSnapshotRequirement.description.nl}"""@NL`,
                                `<${conceptSnapshotRequirement.id}> <http://purl.org/dc/terms/description> """${conceptSnapshotRequirement.description.nlFormal}"""@nl-BE-x-formal`,
                                `<${conceptSnapshotRequirement.id}> <http://purl.org/dc/terms/description> """${conceptSnapshotRequirement.description.nlInformal}"""@nl-BE-x-informal`,
                                `<${conceptSnapshotRequirement.id}> <http://purl.org/dc/terms/description> """${conceptSnapshotRequirement.description.nlGeneratedFormal}"""@nl-BE-x-generated-formal`,
                                `<${conceptSnapshotRequirement.id}> <http://purl.org/dc/terms/description> """${conceptSnapshotRequirement.description.nlGeneratedInformal}"""@nl-BE-x-generated-informal`,
                                `<${conceptSnapshotRequirement.id}> <http://www.w3.org/ns/shacl#order> """2"""^^<http://www.w3.org/2001/XMLSchema#integer>`,
                                `<${conceptSnapshotRequirement.id}> <http://data.europa.eu/m8g/hasSupportingEvidence> <${conceptSnapshotRequirement.evidence.id}>`,
                                `<${conceptSnapshotRequirement.evidence.id}> a <http://data.europa.eu/m8g/Evidence>`,
                                `<${conceptSnapshotRequirement.evidence.id}> <http://purl.org/dc/terms/title> """${conceptSnapshotRequirement.evidence.title.nl}"""@NL`,
                                `<${conceptSnapshotRequirement.evidence.id}> <http://purl.org/dc/terms/title> """${conceptSnapshotRequirement.evidence.title.nlFormal}"""@nl-BE-x-formal`,
                                `<${conceptSnapshotRequirement.evidence.id}> <http://purl.org/dc/terms/title> """${conceptSnapshotRequirement.evidence.title.nlInformal}"""@nl-BE-x-informal`,
                                `<${conceptSnapshotRequirement.evidence.id}> <http://purl.org/dc/terms/title> """${conceptSnapshotRequirement.evidence.title.nlGeneratedFormal}"""@nl-BE-x-generated-formal`,
                                `<${conceptSnapshotRequirement.evidence.id}> <http://purl.org/dc/terms/title> """${conceptSnapshotRequirement.evidence.title.nlGeneratedInformal}"""@nl-BE-x-generated-informal`,
                                `<${conceptSnapshotRequirement.evidence.id}> <http://purl.org/dc/terms/description> """${conceptSnapshotRequirement.evidence.description.nl}"""@NL`,
                                `<${conceptSnapshotRequirement.evidence.id}> <http://purl.org/dc/terms/description> """${conceptSnapshotRequirement.evidence.description.nlFormal}"""@nl-BE-x-formal`,
                                `<${conceptSnapshotRequirement.evidence.id}> <http://purl.org/dc/terms/description> """${conceptSnapshotRequirement.evidence.description.nlInformal}"""@nl-BE-x-informal`,
                                `<${conceptSnapshotRequirement.evidence.id}> <http://purl.org/dc/terms/description> """${conceptSnapshotRequirement.evidence.description.nlGeneratedFormal}"""@nl-BE-x-generated-formal`,
                                `<${conceptSnapshotRequirement.evidence.id}> <http://purl.org/dc/terms/description> """${conceptSnapshotRequirement.evidence.description.nlGeneratedInformal}"""@nl-BE-x-generated-informal`,

                                `<${conceptSnapshotId}> <http://vocab.belgif.be/ns/publicservice#hasRequirement> <${conceptSnapshotNotRetainedRequirementId}>`,
                                `<${conceptSnapshotNotRetainedRequirementId}> a <http://data.europa.eu/m8g/Requirement>`,
                                `<${conceptSnapshotNotRetainedRequirementId}> <http://purl.org/dc/terms/title> """title only available in non-dutch language"""@${nonDutchLanguage}`,
                                `<${conceptSnapshotNotRetainedRequirementId}> <http://purl.org/dc/terms/description> """description only available in non-dutch language"""@${nonDutchLanguage}`,
                                `<${conceptSnapshotNotRetainedRequirementId}> <http://www.w3.org/ns/shacl#order> """1"""^^<http://www.w3.org/2001/XMLSchema#integer>`,

                            ]);

                        const actualConceptSnapshot = await repository.findById(conceptSnapshotId);

                        expect(actualConceptSnapshot).toEqual(conceptSnapshot);
                    });
                }

                test(`Throws Error if required fields are missing for requirements`, async () => {
                    const conceptSnapshotId = buildConceptSnapshotIri(uuid());
                    const conceptSnapshotTitle = ConceptSnapshotTestBuilder.MINIMAL_TITLE;
                    const conceptSnapshotDescription = aMinimalLanguageString('description').build();
                    const conceptSnapshotProductId = ConceptSnapshotTestBuilder.PRODUCT_ID;
                    const conceptSnapshotDateCreated = ConceptSnapshotTestBuilder.DATE_CREATED;
                    const conceptSnapshotDateModified = ConceptSnapshotTestBuilder.DATE_MODIFIED;
                    const conceptSnapshotGeneratedAtTime = ConceptSnapshotTestBuilder.GENERATED_AT_TIME;
                    const conceptSnapshotRequirementId = RequirementBuilder.buildIri(uuid());

                    await directDatabaseAccess.insertData(
                        CONCEPT_SNAPSHOT_LDES_GRAPH,
                        [
                            `<${conceptSnapshotId}> a <https://productencatalogus.data.vlaanderen.be/ns/ipdc-lpdc#ConceptualPublicServiceSnapshot>`,
                            `<${conceptSnapshotId}> <http://purl.org/dc/terms/title> """${conceptSnapshotTitle.nl}"""@nl`,
                            `<${conceptSnapshotId}> <http://purl.org/dc/terms/description> """${conceptSnapshotDescription.nl}"""@nl`,
                            `<${conceptSnapshotId}> <http://schema.org/productID> """${conceptSnapshotProductId}"""`,
                            `<${conceptSnapshotId}> <https://productencatalogus.data.vlaanderen.be/ns/ipdc-lpdc#isArchived> """false"""^^<http://www.w3.org/2001/XMLSchema#boolean>`,
                            `<${conceptSnapshotId}> <http://schema.org/dateCreated> """${conceptSnapshotDateCreated.value}"""^^<http://www.w3.org/2001/XMLSchema#dateTime>`,
                            `<${conceptSnapshotId}> <http://schema.org/dateModified> """${conceptSnapshotDateModified.value}"""^^<http://www.w3.org/2001/XMLSchema#dateTime>`,
                            `<${conceptSnapshotId}> <http://www.w3.org/ns/prov#generatedAtTime> """${conceptSnapshotGeneratedAtTime.value}"""^^<http://www.w3.org/2001/XMLSchema#dateTime>`,

                            `<${conceptSnapshotId}> <http://vocab.belgif.be/ns/publicservice#hasRequirement> <${conceptSnapshotRequirementId}>`,
                            `<${conceptSnapshotRequirementId}> a <http://data.europa.eu/m8g/Requirement>`,

                        ]);

                    await expect(repository.findById(conceptSnapshotId)).rejects.toThrowWithMessage(InvariantError, `order mag niet ontbreken`);
                });
            });

            describe('for evidence', () => {
                for (const nonDutchLanguage of ['de', 'fr', 'en']) {
                    test(`Filters out evidence when title only available in language ${nonDutchLanguage}`, async () => {
                        const conceptSnapshotId = buildConceptSnapshotIri(uuid());
                        const conceptSnapshotTitle = ConceptSnapshotTestBuilder.MINIMAL_TITLE;
                        const conceptSnapshotDescription = aMinimalLanguageString('description').build();
                        const conceptSnapshotProductId = ConceptSnapshotTestBuilder.PRODUCT_ID;
                        const conceptSnapshotDateCreated = ConceptSnapshotTestBuilder.DATE_CREATED;
                        const conceptSnapshotDateModified = ConceptSnapshotTestBuilder.DATE_MODIFIED;
                        const conceptSnapshotGeneratedAtTime = ConceptSnapshotTestBuilder.GENERATED_AT_TIME;
                        const conceptSnapshotRequirement = anotherFullRequirement().withEvidence(undefined).withOrder(2).build();
                        const conceptSnapshotNotRetainedEvidenceId = EvidenceBuilder.buildIri(uuid());

                        const conceptSnapshot =
                            aMinimalConceptSnapshot()
                                .withId(conceptSnapshotId)
                                .withTitle(conceptSnapshotTitle)
                                .withDescription(conceptSnapshotDescription)
                                .withProductId(conceptSnapshotProductId)
                                .withDateCreated(conceptSnapshotDateCreated)
                                .withDateModified(conceptSnapshotDateModified)
                                .withGeneratedAtTime(conceptSnapshotGeneratedAtTime)
                                .withRequirements([conceptSnapshotRequirement])
                                .build();

                        await directDatabaseAccess.insertData(
                            CONCEPT_SNAPSHOT_LDES_GRAPH,
                            [
                                `<${conceptSnapshotId}> a <https://productencatalogus.data.vlaanderen.be/ns/ipdc-lpdc#ConceptualPublicServiceSnapshot>`,
                                `<${conceptSnapshotId}> <http://purl.org/dc/terms/title> """${conceptSnapshotTitle.nl}"""@nl`,
                                `<${conceptSnapshotId}> <http://purl.org/dc/terms/description> """${conceptSnapshotDescription.nl}"""@nl`,
                                `<${conceptSnapshotId}> <http://schema.org/productID> """${conceptSnapshotProductId}"""`,
                                `<${conceptSnapshotId}> <https://productencatalogus.data.vlaanderen.be/ns/ipdc-lpdc#isArchived> """false"""^^<http://www.w3.org/2001/XMLSchema#boolean>`,
                                `<${conceptSnapshotId}> <http://schema.org/dateCreated> """${conceptSnapshotDateCreated.value}"""^^<http://www.w3.org/2001/XMLSchema#dateTime>`,
                                `<${conceptSnapshotId}> <http://schema.org/dateModified> """${conceptSnapshotDateModified.value}"""^^<http://www.w3.org/2001/XMLSchema#dateTime>`,
                                `<${conceptSnapshotId}> <http://www.w3.org/ns/prov#generatedAtTime> """${conceptSnapshotGeneratedAtTime.value}"""^^<http://www.w3.org/2001/XMLSchema#dateTime>`,

                                `<${conceptSnapshotId}> <http://vocab.belgif.be/ns/publicservice#hasRequirement> <${conceptSnapshotRequirement.id}>`,
                                `<${conceptSnapshotRequirement.id}> a <http://data.europa.eu/m8g/Requirement>`,
                                `<${conceptSnapshotRequirement.id}> <http://purl.org/dc/terms/title> """${conceptSnapshotRequirement.title.nl}"""@NL`,
                                `<${conceptSnapshotRequirement.id}> <http://purl.org/dc/terms/title> """${conceptSnapshotRequirement.title.nlFormal}"""@nl-BE-x-formal`,
                                `<${conceptSnapshotRequirement.id}> <http://purl.org/dc/terms/title> """${conceptSnapshotRequirement.title.nlInformal}"""@nl-BE-x-informal`,
                                `<${conceptSnapshotRequirement.id}> <http://purl.org/dc/terms/title> """${conceptSnapshotRequirement.title.nlGeneratedFormal}"""@nl-BE-x-generated-formal`,
                                `<${conceptSnapshotRequirement.id}> <http://purl.org/dc/terms/title> """${conceptSnapshotRequirement.title.nlGeneratedInformal}"""@nl-BE-x-generated-informal`,
                                `<${conceptSnapshotRequirement.id}> <http://purl.org/dc/terms/description> """${conceptSnapshotRequirement.description.nl}"""@NL`,
                                `<${conceptSnapshotRequirement.id}> <http://purl.org/dc/terms/description> """${conceptSnapshotRequirement.description.nlFormal}"""@nl-BE-x-formal`,
                                `<${conceptSnapshotRequirement.id}> <http://purl.org/dc/terms/description> """${conceptSnapshotRequirement.description.nlInformal}"""@nl-BE-x-informal`,
                                `<${conceptSnapshotRequirement.id}> <http://purl.org/dc/terms/description> """${conceptSnapshotRequirement.description.nlGeneratedFormal}"""@nl-BE-x-generated-formal`,
                                `<${conceptSnapshotRequirement.id}> <http://purl.org/dc/terms/description> """${conceptSnapshotRequirement.description.nlGeneratedInformal}"""@nl-BE-x-generated-informal`,
                                `<${conceptSnapshotRequirement.id}> <http://www.w3.org/ns/shacl#order> """2"""^^<http://www.w3.org/2001/XMLSchema#integer>`,
                                `<${conceptSnapshotRequirement.id}> <http://data.europa.eu/m8g/hasSupportingEvidence> <${conceptSnapshotNotRetainedEvidenceId}>`,
                                `<${conceptSnapshotNotRetainedEvidenceId}> a <http://data.europa.eu/m8g/Evidence>`,
                                `<${conceptSnapshotNotRetainedEvidenceId}> <http://purl.org/dc/terms/title> """title only available in non-dutch language"""@${nonDutchLanguage}`,
                                `<${conceptSnapshotNotRetainedEvidenceId}> <http://purl.org/dc/terms/description> """conceptSnapshotRequirement.evidence.description.nl"""@NL`,
                                `<${conceptSnapshotNotRetainedEvidenceId}> <http://purl.org/dc/terms/description> """conceptSnapshotRequirement.evidence.description.nlFormal"""@nl-BE-x-formal`,
                                `<${conceptSnapshotNotRetainedEvidenceId}> <http://purl.org/dc/terms/description> """conceptSnapshotRequirement.evidence.description.nlInformal"""@nl-BE-x-informal`,
                                `<${conceptSnapshotNotRetainedEvidenceId}> <http://purl.org/dc/terms/description> """conceptSnapshotRequirement.evidence.description.nlGeneratedFormal"""@nl-BE-x-generated-formal`,
                                `<${conceptSnapshotNotRetainedEvidenceId}> <http://purl.org/dc/terms/description> """conceptSnapshotRequirement.evidence.description.nlGeneratedInformal"""@nl-BE-x-generated-informal`,

                            ]);

                        const actualConceptSnapshot = await repository.findById(conceptSnapshotId);

                        expect(actualConceptSnapshot).toEqual(conceptSnapshot);
                    });

                    test(`Filters out evidence when description only available in language ${nonDutchLanguage}`, async () => {
                        const conceptSnapshotId = buildConceptSnapshotIri(uuid());
                        const conceptSnapshotTitle = ConceptSnapshotTestBuilder.MINIMAL_TITLE;
                        const conceptSnapshotDescription = aMinimalLanguageString('description').build();
                        const conceptSnapshotProductId = ConceptSnapshotTestBuilder.PRODUCT_ID;
                        const conceptSnapshotDateCreated = ConceptSnapshotTestBuilder.DATE_CREATED;
                        const conceptSnapshotDateModified = ConceptSnapshotTestBuilder.DATE_MODIFIED;
                        const conceptSnapshotGeneratedAtTime = ConceptSnapshotTestBuilder.GENERATED_AT_TIME;
                        const conceptSnapshotRequirement = anotherFullRequirement().withEvidence(undefined).withOrder(2).build();
                        const conceptSnapshotNotRetainedEvidenceId = EvidenceBuilder.buildIri(uuid());

                        const conceptSnapshot =
                            aMinimalConceptSnapshot()
                                .withId(conceptSnapshotId)
                                .withTitle(conceptSnapshotTitle)
                                .withDescription(conceptSnapshotDescription)
                                .withProductId(conceptSnapshotProductId)
                                .withDateCreated(conceptSnapshotDateCreated)
                                .withDateModified(conceptSnapshotDateModified)
                                .withGeneratedAtTime(conceptSnapshotGeneratedAtTime)
                                .withRequirements([conceptSnapshotRequirement])
                                .build();

                        await directDatabaseAccess.insertData(
                            CONCEPT_SNAPSHOT_LDES_GRAPH,
                            [
                                `<${conceptSnapshotId}> a <https://productencatalogus.data.vlaanderen.be/ns/ipdc-lpdc#ConceptualPublicServiceSnapshot>`,
                                `<${conceptSnapshotId}> <http://purl.org/dc/terms/title> """${conceptSnapshotTitle.nl}"""@nl`,
                                `<${conceptSnapshotId}> <http://purl.org/dc/terms/description> """${conceptSnapshotDescription.nl}"""@nl`,
                                `<${conceptSnapshotId}> <http://schema.org/productID> """${conceptSnapshotProductId}"""`,
                                `<${conceptSnapshotId}> <https://productencatalogus.data.vlaanderen.be/ns/ipdc-lpdc#isArchived> """false"""^^<http://www.w3.org/2001/XMLSchema#boolean>`,
                                `<${conceptSnapshotId}> <http://schema.org/dateCreated> """${conceptSnapshotDateCreated.value}"""^^<http://www.w3.org/2001/XMLSchema#dateTime>`,
                                `<${conceptSnapshotId}> <http://schema.org/dateModified> """${conceptSnapshotDateModified.value}"""^^<http://www.w3.org/2001/XMLSchema#dateTime>`,
                                `<${conceptSnapshotId}> <http://www.w3.org/ns/prov#generatedAtTime> """${conceptSnapshotGeneratedAtTime.value}"""^^<http://www.w3.org/2001/XMLSchema#dateTime>`,

                                `<${conceptSnapshotId}> <http://vocab.belgif.be/ns/publicservice#hasRequirement> <${conceptSnapshotRequirement.id}>`,
                                `<${conceptSnapshotRequirement.id}> a <http://data.europa.eu/m8g/Requirement>`,
                                `<${conceptSnapshotRequirement.id}> <http://purl.org/dc/terms/title> """${conceptSnapshotRequirement.title.nl}"""@NL`,
                                `<${conceptSnapshotRequirement.id}> <http://purl.org/dc/terms/title> """${conceptSnapshotRequirement.title.nlFormal}"""@nl-BE-x-formal`,
                                `<${conceptSnapshotRequirement.id}> <http://purl.org/dc/terms/title> """${conceptSnapshotRequirement.title.nlInformal}"""@nl-BE-x-informal`,
                                `<${conceptSnapshotRequirement.id}> <http://purl.org/dc/terms/title> """${conceptSnapshotRequirement.title.nlGeneratedFormal}"""@nl-BE-x-generated-formal`,
                                `<${conceptSnapshotRequirement.id}> <http://purl.org/dc/terms/title> """${conceptSnapshotRequirement.title.nlGeneratedInformal}"""@nl-BE-x-generated-informal`,
                                `<${conceptSnapshotRequirement.id}> <http://purl.org/dc/terms/description> """${conceptSnapshotRequirement.description.nl}"""@NL`,
                                `<${conceptSnapshotRequirement.id}> <http://purl.org/dc/terms/description> """${conceptSnapshotRequirement.description.nlFormal}"""@nl-BE-x-formal`,
                                `<${conceptSnapshotRequirement.id}> <http://purl.org/dc/terms/description> """${conceptSnapshotRequirement.description.nlInformal}"""@nl-BE-x-informal`,
                                `<${conceptSnapshotRequirement.id}> <http://purl.org/dc/terms/description> """${conceptSnapshotRequirement.description.nlGeneratedFormal}"""@nl-BE-x-generated-formal`,
                                `<${conceptSnapshotRequirement.id}> <http://purl.org/dc/terms/description> """${conceptSnapshotRequirement.description.nlGeneratedInformal}"""@nl-BE-x-generated-informal`,
                                `<${conceptSnapshotRequirement.id}> <http://www.w3.org/ns/shacl#order> """2"""^^<http://www.w3.org/2001/XMLSchema#integer>`,
                                `<${conceptSnapshotRequirement.id}> <http://data.europa.eu/m8g/hasSupportingEvidence> <${conceptSnapshotNotRetainedEvidenceId}>`,
                                `<${conceptSnapshotNotRetainedEvidenceId}> a <http://data.europa.eu/m8g/Evidence>`,
                                `<${conceptSnapshotNotRetainedEvidenceId}> <http://purl.org/dc/terms/title> """conceptSnapshotRequirement.evidence.title.nl"""@NL`,
                                `<${conceptSnapshotNotRetainedEvidenceId}> <http://purl.org/dc/terms/title> """conceptSnapshotRequirement.evidence.title.nlFormal"""@nl-BE-x-formal`,
                                `<${conceptSnapshotNotRetainedEvidenceId}> <http://purl.org/dc/terms/title> """conceptSnapshotRequirement.evidence.title.nlInformal"""@nl-BE-x-informal`,
                                `<${conceptSnapshotNotRetainedEvidenceId}> <http://purl.org/dc/terms/title> """conceptSnapshotRequirement.evidence.title.nlGeneratedFormal"""@nl-BE-x-generated-formal`,
                                `<${conceptSnapshotNotRetainedEvidenceId}> <http://purl.org/dc/terms/title> """conceptSnapshotRequirement.evidence.title.nlGeneratedInformal"""@nl-BE-x-generated-informal`,
                                `<${conceptSnapshotNotRetainedEvidenceId}> <http://purl.org/dc/terms/description> """description only available in non-dutch language"""@${nonDutchLanguage}`,
                            ]);

                        const actualConceptSnapshot = await repository.findById(conceptSnapshotId);

                        expect(actualConceptSnapshot).toEqual(conceptSnapshot);
                    });

                    test(`Filters out evidence when both title and description only available in language ${nonDutchLanguage}`, async () => {
                        const conceptSnapshotId = buildConceptSnapshotIri(uuid());
                        const conceptSnapshotTitle = ConceptSnapshotTestBuilder.MINIMAL_TITLE;
                        const conceptSnapshotDescription = aMinimalLanguageString('description').build();
                        const conceptSnapshotProductId = ConceptSnapshotTestBuilder.PRODUCT_ID;
                        const conceptSnapshotDateCreated = ConceptSnapshotTestBuilder.DATE_CREATED;
                        const conceptSnapshotDateModified = ConceptSnapshotTestBuilder.DATE_MODIFIED;
                        const conceptSnapshotGeneratedAtTime = ConceptSnapshotTestBuilder.GENERATED_AT_TIME;
                        const conceptSnapshotRequirement = anotherFullRequirement().withEvidence(undefined).withOrder(2).build();
                        const conceptSnapshotNotRetainedEvidenceId = EvidenceBuilder.buildIri(uuid());

                        const conceptSnapshot =
                            aMinimalConceptSnapshot()
                                .withId(conceptSnapshotId)
                                .withTitle(conceptSnapshotTitle)
                                .withDescription(conceptSnapshotDescription)
                                .withProductId(conceptSnapshotProductId)
                                .withDateCreated(conceptSnapshotDateCreated)
                                .withDateModified(conceptSnapshotDateModified)
                                .withGeneratedAtTime(conceptSnapshotGeneratedAtTime)
                                .withRequirements([conceptSnapshotRequirement])
                                .build();

                        await directDatabaseAccess.insertData(
                            CONCEPT_SNAPSHOT_LDES_GRAPH,
                            [
                                `<${conceptSnapshotId}> a <https://productencatalogus.data.vlaanderen.be/ns/ipdc-lpdc#ConceptualPublicServiceSnapshot>`,
                                `<${conceptSnapshotId}> <http://purl.org/dc/terms/title> """${conceptSnapshotTitle.nl}"""@nl`,
                                `<${conceptSnapshotId}> <http://purl.org/dc/terms/description> """${conceptSnapshotDescription.nl}"""@nl`,
                                `<${conceptSnapshotId}> <http://schema.org/productID> """${conceptSnapshotProductId}"""`,
                                `<${conceptSnapshotId}> <https://productencatalogus.data.vlaanderen.be/ns/ipdc-lpdc#isArchived> """false"""^^<http://www.w3.org/2001/XMLSchema#boolean>`,
                                `<${conceptSnapshotId}> <http://schema.org/dateCreated> """${conceptSnapshotDateCreated.value}"""^^<http://www.w3.org/2001/XMLSchema#dateTime>`,
                                `<${conceptSnapshotId}> <http://schema.org/dateModified> """${conceptSnapshotDateModified.value}"""^^<http://www.w3.org/2001/XMLSchema#dateTime>`,
                                `<${conceptSnapshotId}> <http://www.w3.org/ns/prov#generatedAtTime> """${conceptSnapshotGeneratedAtTime.value}"""^^<http://www.w3.org/2001/XMLSchema#dateTime>`,

                                `<${conceptSnapshotId}> <http://vocab.belgif.be/ns/publicservice#hasRequirement> <${conceptSnapshotRequirement.id}>`,
                                `<${conceptSnapshotRequirement.id}> a <http://data.europa.eu/m8g/Requirement>`,
                                `<${conceptSnapshotRequirement.id}> <http://purl.org/dc/terms/title> """${conceptSnapshotRequirement.title.nl}"""@NL`,
                                `<${conceptSnapshotRequirement.id}> <http://purl.org/dc/terms/title> """${conceptSnapshotRequirement.title.nlFormal}"""@nl-BE-x-formal`,
                                `<${conceptSnapshotRequirement.id}> <http://purl.org/dc/terms/title> """${conceptSnapshotRequirement.title.nlInformal}"""@nl-BE-x-informal`,
                                `<${conceptSnapshotRequirement.id}> <http://purl.org/dc/terms/title> """${conceptSnapshotRequirement.title.nlGeneratedFormal}"""@nl-BE-x-generated-formal`,
                                `<${conceptSnapshotRequirement.id}> <http://purl.org/dc/terms/title> """${conceptSnapshotRequirement.title.nlGeneratedInformal}"""@nl-BE-x-generated-informal`,
                                `<${conceptSnapshotRequirement.id}> <http://purl.org/dc/terms/description> """${conceptSnapshotRequirement.description.nl}"""@NL`,
                                `<${conceptSnapshotRequirement.id}> <http://purl.org/dc/terms/description> """${conceptSnapshotRequirement.description.nlFormal}"""@nl-BE-x-formal`,
                                `<${conceptSnapshotRequirement.id}> <http://purl.org/dc/terms/description> """${conceptSnapshotRequirement.description.nlInformal}"""@nl-BE-x-informal`,
                                `<${conceptSnapshotRequirement.id}> <http://purl.org/dc/terms/description> """${conceptSnapshotRequirement.description.nlGeneratedFormal}"""@nl-BE-x-generated-formal`,
                                `<${conceptSnapshotRequirement.id}> <http://purl.org/dc/terms/description> """${conceptSnapshotRequirement.description.nlGeneratedInformal}"""@nl-BE-x-generated-informal`,
                                `<${conceptSnapshotRequirement.id}> <http://www.w3.org/ns/shacl#order> """2"""^^<http://www.w3.org/2001/XMLSchema#integer>`,
                                `<${conceptSnapshotRequirement.id}> <http://data.europa.eu/m8g/hasSupportingEvidence> <${conceptSnapshotNotRetainedEvidenceId}>`,
                                `<${conceptSnapshotNotRetainedEvidenceId}> a <http://data.europa.eu/m8g/Evidence>`,
                                `<${conceptSnapshotNotRetainedEvidenceId}> <http://purl.org/dc/terms/title> """title only available in non-dutch language"""@${nonDutchLanguage}`,
                                `<${conceptSnapshotNotRetainedEvidenceId}> <http://purl.org/dc/terms/description> """description only available in non-dutch language"""@${nonDutchLanguage}`,
                            ]);

                        const actualConceptSnapshot = await repository.findById(conceptSnapshotId);

                        expect(actualConceptSnapshot).toEqual(conceptSnapshot);
                    });
                }

            });

            describe('for costs', () => {
                for (const nonDutchLanguage of ['de', 'fr', 'en']) {
                    test(`Filters out costs when title only available in language ${nonDutchLanguage}`, async () => {
                        const conceptSnapshotId = buildConceptSnapshotIri(uuid());
                        const conceptSnapshotTitle = ConceptSnapshotTestBuilder.MINIMAL_TITLE;
                        const conceptSnapshotDescription = aMinimalLanguageString('description').build();
                        const conceptSnapshotProductId = ConceptSnapshotTestBuilder.PRODUCT_ID;
                        const conceptSnapshotDateCreated = ConceptSnapshotTestBuilder.DATE_CREATED;
                        const conceptSnapshotDateModified = ConceptSnapshotTestBuilder.DATE_MODIFIED;
                        const conceptSnapshotGeneratedAtTime = ConceptSnapshotTestBuilder.GENERATED_AT_TIME;
                        const conceptSnapshotCost = anotherFullCost().withOrder(2).build();
                        const conceptSnapshotNotRetainedCostId = CostBuilder.buildIri(uuid());

                        const conceptSnapshot =
                            aMinimalConceptSnapshot()
                                .withId(conceptSnapshotId)
                                .withTitle(conceptSnapshotTitle)
                                .withDescription(conceptSnapshotDescription)
                                .withProductId(conceptSnapshotProductId)
                                .withDateCreated(conceptSnapshotDateCreated)
                                .withDateModified(conceptSnapshotDateModified)
                                .withGeneratedAtTime(conceptSnapshotGeneratedAtTime)
                                .withCosts([conceptSnapshotCost])
                                .build();

                        await directDatabaseAccess.insertData(
                            CONCEPT_SNAPSHOT_LDES_GRAPH,
                            [
                                `<${conceptSnapshotId}> a <https://productencatalogus.data.vlaanderen.be/ns/ipdc-lpdc#ConceptualPublicServiceSnapshot>`,
                                `<${conceptSnapshotId}> <http://purl.org/dc/terms/title> """${conceptSnapshotTitle.nl}"""@nl`,
                                `<${conceptSnapshotId}> <http://purl.org/dc/terms/description> """${conceptSnapshotDescription.nl}"""@nl`,
                                `<${conceptSnapshotId}> <http://schema.org/productID> """${conceptSnapshotProductId}"""`,
                                `<${conceptSnapshotId}> <https://productencatalogus.data.vlaanderen.be/ns/ipdc-lpdc#isArchived> """false"""^^<http://www.w3.org/2001/XMLSchema#boolean>`,
                                `<${conceptSnapshotId}> <http://schema.org/dateCreated> """${conceptSnapshotDateCreated.value}"""^^<http://www.w3.org/2001/XMLSchema#dateTime>`,
                                `<${conceptSnapshotId}> <http://schema.org/dateModified> """${conceptSnapshotDateModified.value}"""^^<http://www.w3.org/2001/XMLSchema#dateTime>`,
                                `<${conceptSnapshotId}> <http://www.w3.org/ns/prov#generatedAtTime> """${conceptSnapshotGeneratedAtTime.value}"""^^<http://www.w3.org/2001/XMLSchema#dateTime>`,

                                `<${conceptSnapshotId}> <http://data.europa.eu/m8g/hasCost> <${conceptSnapshotCost.id}>`,
                                `<${conceptSnapshotCost.id}> a <http://data.europa.eu/m8g/Cost>`,
                                `<${conceptSnapshotCost.id}> <http://purl.org/dc/terms/title> """${conceptSnapshotCost.title.nl}"""@NL`,
                                `<${conceptSnapshotCost.id}> <http://purl.org/dc/terms/title> """${conceptSnapshotCost.title.nlFormal}"""@nl-BE-x-formal`,
                                `<${conceptSnapshotCost.id}> <http://purl.org/dc/terms/title> """${conceptSnapshotCost.title.nlInformal}"""@nl-BE-x-informal`,
                                `<${conceptSnapshotCost.id}> <http://purl.org/dc/terms/title> """${conceptSnapshotCost.title.nlGeneratedFormal}"""@nl-BE-x-generated-formal`,
                                `<${conceptSnapshotCost.id}> <http://purl.org/dc/terms/title> """${conceptSnapshotCost.title.nlGeneratedInformal}"""@nl-BE-x-generated-informal`,
                                `<${conceptSnapshotCost.id}> <http://purl.org/dc/terms/description> """${conceptSnapshotCost.description.nl}"""@NL`,
                                `<${conceptSnapshotCost.id}> <http://purl.org/dc/terms/description> """${conceptSnapshotCost.description.nlFormal}"""@nl-BE-x-formal`,
                                `<${conceptSnapshotCost.id}> <http://purl.org/dc/terms/description> """${conceptSnapshotCost.description.nlInformal}"""@nl-BE-x-informal`,
                                `<${conceptSnapshotCost.id}> <http://purl.org/dc/terms/description> """${conceptSnapshotCost.description.nlGeneratedFormal}"""@nl-BE-x-generated-formal`,
                                `<${conceptSnapshotCost.id}> <http://purl.org/dc/terms/description> """${conceptSnapshotCost.description.nlGeneratedInformal}"""@nl-BE-x-generated-informal`,
                                `<${conceptSnapshotCost.id}> <http://www.w3.org/ns/shacl#order> """2"""^^<http://www.w3.org/2001/XMLSchema#integer>`,

                                `<${conceptSnapshotId}> <http://data.europa.eu/m8g/hasCost> <${conceptSnapshotNotRetainedCostId}>`,
                                `<${conceptSnapshotNotRetainedCostId}> a <http://data.europa.eu/m8g/Cost>`,
                                `<${conceptSnapshotNotRetainedCostId}> <http://purl.org/dc/terms/title> """title only available in non-dutch language"""@${nonDutchLanguage}`,
                                `<${conceptSnapshotNotRetainedCostId}> <http://purl.org/dc/terms/description> """conceptSnapshotCost.description.nl"""@NL`,
                                `<${conceptSnapshotNotRetainedCostId}> <http://purl.org/dc/terms/description> """conceptSnapshotCost.description.nlFormal"""@nl-BE-x-formal`,
                                `<${conceptSnapshotNotRetainedCostId}> <http://purl.org/dc/terms/description> """conceptSnapshotCost.description.nlInformal"""@nl-BE-x-informal`,
                                `<${conceptSnapshotNotRetainedCostId}> <http://purl.org/dc/terms/description> """conceptSnapshotCost.description.nlGeneratedFormal"""@nl-BE-x-generated-formal`,
                                `<${conceptSnapshotNotRetainedCostId}> <http://purl.org/dc/terms/description> """conceptSnapshotCost.description.nlGeneratedInformal"""@nl-BE-x-generated-informal`,
                                `<${conceptSnapshotNotRetainedCostId}> <http://www.w3.org/ns/shacl#order> """1"""^^<http://www.w3.org/2001/XMLSchema#integer>`,

                            ]);

                        const actualConceptSnapshot = await repository.findById(conceptSnapshotId);

                        expect(actualConceptSnapshot).toEqual(conceptSnapshot);
                    });

                    test(`Filters out costs when description only available in language ${nonDutchLanguage}`, async () => {
                        const conceptSnapshotId = buildConceptSnapshotIri(uuid());
                        const conceptSnapshotTitle = ConceptSnapshotTestBuilder.MINIMAL_TITLE;
                        const conceptSnapshotDescription = aMinimalLanguageString('description').build();
                        const conceptSnapshotProductId = ConceptSnapshotTestBuilder.PRODUCT_ID;
                        const conceptSnapshotDateCreated = ConceptSnapshotTestBuilder.DATE_CREATED;
                        const conceptSnapshotDateModified = ConceptSnapshotTestBuilder.DATE_MODIFIED;
                        const conceptSnapshotGeneratedAtTime = ConceptSnapshotTestBuilder.GENERATED_AT_TIME;
                        const conceptSnapshotCost = anotherFullCost().withOrder(2).build();
                        const conceptSnapshotNotRetainedCostId = CostBuilder.buildIri(uuid());

                        const conceptSnapshot =
                            aMinimalConceptSnapshot()
                                .withId(conceptSnapshotId)
                                .withTitle(conceptSnapshotTitle)
                                .withDescription(conceptSnapshotDescription)
                                .withProductId(conceptSnapshotProductId)
                                .withDateCreated(conceptSnapshotDateCreated)
                                .withDateModified(conceptSnapshotDateModified)
                                .withGeneratedAtTime(conceptSnapshotGeneratedAtTime)
                                .withCosts([conceptSnapshotCost])
                                .build();

                        await directDatabaseAccess.insertData(
                            CONCEPT_SNAPSHOT_LDES_GRAPH,
                            [
                                `<${conceptSnapshotId}> a <https://productencatalogus.data.vlaanderen.be/ns/ipdc-lpdc#ConceptualPublicServiceSnapshot>`,
                                `<${conceptSnapshotId}> <http://purl.org/dc/terms/title> """${conceptSnapshotTitle.nl}"""@nl`,
                                `<${conceptSnapshotId}> <http://purl.org/dc/terms/description> """${conceptSnapshotDescription.nl}"""@nl`,
                                `<${conceptSnapshotId}> <http://schema.org/productID> """${conceptSnapshotProductId}"""`,
                                `<${conceptSnapshotId}> <https://productencatalogus.data.vlaanderen.be/ns/ipdc-lpdc#isArchived> """false"""^^<http://www.w3.org/2001/XMLSchema#boolean>`,
                                `<${conceptSnapshotId}> <http://schema.org/dateCreated> """${conceptSnapshotDateCreated.value}"""^^<http://www.w3.org/2001/XMLSchema#dateTime>`,
                                `<${conceptSnapshotId}> <http://schema.org/dateModified> """${conceptSnapshotDateModified.value}"""^^<http://www.w3.org/2001/XMLSchema#dateTime>`,
                                `<${conceptSnapshotId}> <http://www.w3.org/ns/prov#generatedAtTime> """${conceptSnapshotGeneratedAtTime.value}"""^^<http://www.w3.org/2001/XMLSchema#dateTime>`,

                                `<${conceptSnapshotId}> <http://data.europa.eu/m8g/hasCost> <${conceptSnapshotCost.id}>`,
                                `<${conceptSnapshotCost.id}> a <http://data.europa.eu/m8g/Cost>`,
                                `<${conceptSnapshotCost.id}> <http://purl.org/dc/terms/title> """${conceptSnapshotCost.title.nl}"""@NL`,
                                `<${conceptSnapshotCost.id}> <http://purl.org/dc/terms/title> """${conceptSnapshotCost.title.nlFormal}"""@nl-BE-x-formal`,
                                `<${conceptSnapshotCost.id}> <http://purl.org/dc/terms/title> """${conceptSnapshotCost.title.nlInformal}"""@nl-BE-x-informal`,
                                `<${conceptSnapshotCost.id}> <http://purl.org/dc/terms/title> """${conceptSnapshotCost.title.nlGeneratedFormal}"""@nl-BE-x-generated-formal`,
                                `<${conceptSnapshotCost.id}> <http://purl.org/dc/terms/title> """${conceptSnapshotCost.title.nlGeneratedInformal}"""@nl-BE-x-generated-informal`,
                                `<${conceptSnapshotCost.id}> <http://purl.org/dc/terms/description> """${conceptSnapshotCost.description.nl}"""@NL`,
                                `<${conceptSnapshotCost.id}> <http://purl.org/dc/terms/description> """${conceptSnapshotCost.description.nlFormal}"""@nl-BE-x-formal`,
                                `<${conceptSnapshotCost.id}> <http://purl.org/dc/terms/description> """${conceptSnapshotCost.description.nlInformal}"""@nl-BE-x-informal`,
                                `<${conceptSnapshotCost.id}> <http://purl.org/dc/terms/description> """${conceptSnapshotCost.description.nlGeneratedFormal}"""@nl-BE-x-generated-formal`,
                                `<${conceptSnapshotCost.id}> <http://purl.org/dc/terms/description> """${conceptSnapshotCost.description.nlGeneratedInformal}"""@nl-BE-x-generated-informal`,
                                `<${conceptSnapshotCost.id}> <http://www.w3.org/ns/shacl#order> """2"""^^<http://www.w3.org/2001/XMLSchema#integer>`,

                                `<${conceptSnapshotId}> <http://data.europa.eu/m8g/hasCost> <${conceptSnapshotNotRetainedCostId}>`,
                                `<${conceptSnapshotNotRetainedCostId}> a <http://data.europa.eu/m8g/Cost>`,
                                `<${conceptSnapshotNotRetainedCostId}> <http://purl.org/dc/terms/title> """conceptSnapshotCost.title.nl"""@NL`,
                                `<${conceptSnapshotNotRetainedCostId}> <http://purl.org/dc/terms/title> """conceptSnapshotCost.title.nlFormal"""@nl-BE-x-formal`,
                                `<${conceptSnapshotNotRetainedCostId}> <http://purl.org/dc/terms/title> """conceptSnapshotCost.title.nlInformal"""@nl-BE-x-informal`,
                                `<${conceptSnapshotNotRetainedCostId}> <http://purl.org/dc/terms/title> """conceptSnapshotCost.title.nlGeneratedFormal"""@nl-BE-x-generated-formal`,
                                `<${conceptSnapshotNotRetainedCostId}> <http://purl.org/dc/terms/title> """conceptSnapshotCost.title.nlGeneratedInformal"""@nl-BE-x-generated-informal`,
                                `<${conceptSnapshotNotRetainedCostId}> <http://purl.org/dc/terms/description> """description only available in non-dutch language"""@${nonDutchLanguage}`,
                                `<${conceptSnapshotNotRetainedCostId}> <http://www.w3.org/ns/shacl#order> """1"""^^<http://www.w3.org/2001/XMLSchema#integer>`,

                            ]);

                        const actualConceptSnapshot = await repository.findById(conceptSnapshotId);

                        expect(actualConceptSnapshot).toEqual(conceptSnapshot);
                    });

                    test(`Filters out costs when both title and description only available in language ${nonDutchLanguage}`, async () => {
                        const conceptSnapshotId = buildConceptSnapshotIri(uuid());
                        const conceptSnapshotTitle = ConceptSnapshotTestBuilder.MINIMAL_TITLE;
                        const conceptSnapshotDescription = aMinimalLanguageString('description').build();
                        const conceptSnapshotProductId = ConceptSnapshotTestBuilder.PRODUCT_ID;
                        const conceptSnapshotDateCreated = ConceptSnapshotTestBuilder.DATE_CREATED;
                        const conceptSnapshotDateModified = ConceptSnapshotTestBuilder.DATE_MODIFIED;
                        const conceptSnapshotGeneratedAtTime = ConceptSnapshotTestBuilder.GENERATED_AT_TIME;
                        const conceptSnapshotCost = anotherFullCost().withOrder(2).build();
                        const conceptSnapshotNotRetainedCostId = CostBuilder.buildIri(uuid());

                        const conceptSnapshot =
                            aMinimalConceptSnapshot()
                                .withId(conceptSnapshotId)
                                .withTitle(conceptSnapshotTitle)
                                .withDescription(conceptSnapshotDescription)
                                .withProductId(conceptSnapshotProductId)
                                .withDateCreated(conceptSnapshotDateCreated)
                                .withDateModified(conceptSnapshotDateModified)
                                .withGeneratedAtTime(conceptSnapshotGeneratedAtTime)
                                .withCosts([conceptSnapshotCost])
                                .build();

                        await directDatabaseAccess.insertData(
                            CONCEPT_SNAPSHOT_LDES_GRAPH,
                            [
                                `<${conceptSnapshotId}> a <https://productencatalogus.data.vlaanderen.be/ns/ipdc-lpdc#ConceptualPublicServiceSnapshot>`,
                                `<${conceptSnapshotId}> <http://purl.org/dc/terms/title> """${conceptSnapshotTitle.nl}"""@nl`,
                                `<${conceptSnapshotId}> <http://purl.org/dc/terms/description> """${conceptSnapshotDescription.nl}"""@nl`,
                                `<${conceptSnapshotId}> <http://schema.org/productID> """${conceptSnapshotProductId}"""`,
                                `<${conceptSnapshotId}> <https://productencatalogus.data.vlaanderen.be/ns/ipdc-lpdc#isArchived> """false"""^^<http://www.w3.org/2001/XMLSchema#boolean>`,
                                `<${conceptSnapshotId}> <http://schema.org/dateCreated> """${conceptSnapshotDateCreated.value}"""^^<http://www.w3.org/2001/XMLSchema#dateTime>`,
                                `<${conceptSnapshotId}> <http://schema.org/dateModified> """${conceptSnapshotDateModified.value}"""^^<http://www.w3.org/2001/XMLSchema#dateTime>`,
                                `<${conceptSnapshotId}> <http://www.w3.org/ns/prov#generatedAtTime> """${conceptSnapshotGeneratedAtTime.value}"""^^<http://www.w3.org/2001/XMLSchema#dateTime>`,

                                `<${conceptSnapshotId}> <http://data.europa.eu/m8g/hasCost> <${conceptSnapshotCost.id}>`,
                                `<${conceptSnapshotCost.id}> a <http://data.europa.eu/m8g/Cost>`,
                                `<${conceptSnapshotCost.id}> <http://purl.org/dc/terms/title> """${conceptSnapshotCost.title.nl}"""@NL`,
                                `<${conceptSnapshotCost.id}> <http://purl.org/dc/terms/title> """${conceptSnapshotCost.title.nlFormal}"""@nl-BE-x-formal`,
                                `<${conceptSnapshotCost.id}> <http://purl.org/dc/terms/title> """${conceptSnapshotCost.title.nlInformal}"""@nl-BE-x-informal`,
                                `<${conceptSnapshotCost.id}> <http://purl.org/dc/terms/title> """${conceptSnapshotCost.title.nlGeneratedFormal}"""@nl-BE-x-generated-formal`,
                                `<${conceptSnapshotCost.id}> <http://purl.org/dc/terms/title> """${conceptSnapshotCost.title.nlGeneratedInformal}"""@nl-BE-x-generated-informal`,
                                `<${conceptSnapshotCost.id}> <http://purl.org/dc/terms/description> """${conceptSnapshotCost.description.nl}"""@NL`,
                                `<${conceptSnapshotCost.id}> <http://purl.org/dc/terms/description> """${conceptSnapshotCost.description.nlFormal}"""@nl-BE-x-formal`,
                                `<${conceptSnapshotCost.id}> <http://purl.org/dc/terms/description> """${conceptSnapshotCost.description.nlInformal}"""@nl-BE-x-informal`,
                                `<${conceptSnapshotCost.id}> <http://purl.org/dc/terms/description> """${conceptSnapshotCost.description.nlGeneratedFormal}"""@nl-BE-x-generated-formal`,
                                `<${conceptSnapshotCost.id}> <http://purl.org/dc/terms/description> """${conceptSnapshotCost.description.nlGeneratedInformal}"""@nl-BE-x-generated-informal`,
                                `<${conceptSnapshotCost.id}> <http://www.w3.org/ns/shacl#order> """2"""^^<http://www.w3.org/2001/XMLSchema#integer>`,

                                `<${conceptSnapshotId}> <http://data.europa.eu/m8g/hasCost> <${conceptSnapshotNotRetainedCostId}>`,
                                `<${conceptSnapshotNotRetainedCostId}> a <http://data.europa.eu/m8g/Cost>`,
                                `<${conceptSnapshotNotRetainedCostId}> <http://purl.org/dc/terms/title> """title only available in non-dutch language"""@${nonDutchLanguage}`,
                                `<${conceptSnapshotNotRetainedCostId}> <http://purl.org/dc/terms/description> """description only available in non-dutch language"""@${nonDutchLanguage}`,
                                `<${conceptSnapshotNotRetainedCostId}> <http://www.w3.org/ns/shacl#order> """1"""^^<http://www.w3.org/2001/XMLSchema#integer>`,

                            ]);

                        const actualConceptSnapshot = await repository.findById(conceptSnapshotId);

                        expect(actualConceptSnapshot).toEqual(conceptSnapshot);
                    });
                }

                test(`Throws Error if required fields are missing for costs`, async () => {
                    const conceptSnapshotId = buildConceptSnapshotIri(uuid());
                    const conceptSnapshotTitle = ConceptSnapshotTestBuilder.MINIMAL_TITLE;
                    const conceptSnapshotDescription = aMinimalLanguageString('description').build();
                    const conceptSnapshotProductId = ConceptSnapshotTestBuilder.PRODUCT_ID;
                    const conceptSnapshotDateCreated = ConceptSnapshotTestBuilder.DATE_CREATED;
                    const conceptSnapshotDateModified = ConceptSnapshotTestBuilder.DATE_MODIFIED;
                    const conceptSnapshotGeneratedAtTime = ConceptSnapshotTestBuilder.GENERATED_AT_TIME;
                    const conceptSnapshotCostId = CostBuilder.buildIri(uuid());

                    await directDatabaseAccess.insertData(
                        CONCEPT_SNAPSHOT_LDES_GRAPH,
                        [
                            `<${conceptSnapshotId}> a <https://productencatalogus.data.vlaanderen.be/ns/ipdc-lpdc#ConceptualPublicServiceSnapshot>`,
                            `<${conceptSnapshotId}> <http://purl.org/dc/terms/title> """${conceptSnapshotTitle.nl}"""@nl`,
                            `<${conceptSnapshotId}> <http://purl.org/dc/terms/description> """${conceptSnapshotDescription.nl}"""@nl`,
                            `<${conceptSnapshotId}> <http://schema.org/productID> """${conceptSnapshotProductId}"""`,
                            `<${conceptSnapshotId}> <https://productencatalogus.data.vlaanderen.be/ns/ipdc-lpdc#isArchived> """false"""^^<http://www.w3.org/2001/XMLSchema#boolean>`,
                            `<${conceptSnapshotId}> <http://schema.org/dateCreated> """${conceptSnapshotDateCreated.value}"""^^<http://www.w3.org/2001/XMLSchema#dateTime>`,
                            `<${conceptSnapshotId}> <http://schema.org/dateModified> """${conceptSnapshotDateModified.value}"""^^<http://www.w3.org/2001/XMLSchema#dateTime>`,
                            `<${conceptSnapshotId}> <http://www.w3.org/ns/prov#generatedAtTime> """${conceptSnapshotGeneratedAtTime.value}"""^^<http://www.w3.org/2001/XMLSchema#dateTime>`,

                            `<${conceptSnapshotId}> <http://data.europa.eu/m8g/hasCost> <${conceptSnapshotCostId}>`,
                            `<${conceptSnapshotCostId}> a <http://data.europa.eu/m8g/Cost>`,

                        ]);

                    await expect(repository.findById(conceptSnapshotId)).rejects.toThrowWithMessage(InvariantError, `order mag niet ontbreken`);
                });
            });

            describe('for financial advantages', () => {
                for (const nonDutchLanguage of ['de', 'fr', 'en']) {
                    test(`Filters out financial advantages when title only available in language ${nonDutchLanguage}`, async () => {
                        const conceptSnapshotId = buildConceptSnapshotIri(uuid());
                        const conceptSnapshotTitle = ConceptSnapshotTestBuilder.MINIMAL_TITLE;
                        const conceptSnapshotDescription = aMinimalLanguageString('description').build();
                        const conceptSnapshotProductId = ConceptSnapshotTestBuilder.PRODUCT_ID;
                        const conceptSnapshotDateCreated = ConceptSnapshotTestBuilder.DATE_CREATED;
                        const conceptSnapshotDateModified = ConceptSnapshotTestBuilder.DATE_MODIFIED;
                        const conceptSnapshotGeneratedAtTime = ConceptSnapshotTestBuilder.GENERATED_AT_TIME;
                        const conceptSnapshotFinancialAdvantage = anotherFullFinancialAdvantage().withOrder(2).build();
                        const conceptSnapshotNotRetainedFinancialAdvantageId = CostBuilder.buildIri(uuid());

                        const conceptSnapshot =
                            aMinimalConceptSnapshot()
                                .withId(conceptSnapshotId)
                                .withTitle(conceptSnapshotTitle)
                                .withDescription(conceptSnapshotDescription)
                                .withProductId(conceptSnapshotProductId)
                                .withDateCreated(conceptSnapshotDateCreated)
                                .withDateModified(conceptSnapshotDateModified)
                                .withGeneratedAtTime(conceptSnapshotGeneratedAtTime)
                                .withFinancialAdvantages([conceptSnapshotFinancialAdvantage])
                                .build();

                        await directDatabaseAccess.insertData(
                            CONCEPT_SNAPSHOT_LDES_GRAPH,
                            [
                                `<${conceptSnapshotId}> a <https://productencatalogus.data.vlaanderen.be/ns/ipdc-lpdc#ConceptualPublicServiceSnapshot>`,
                                `<${conceptSnapshotId}> <http://purl.org/dc/terms/title> """${conceptSnapshotTitle.nl}"""@nl`,
                                `<${conceptSnapshotId}> <http://purl.org/dc/terms/description> """${conceptSnapshotDescription.nl}"""@nl`,
                                `<${conceptSnapshotId}> <http://schema.org/productID> """${conceptSnapshotProductId}"""`,
                                `<${conceptSnapshotId}> <https://productencatalogus.data.vlaanderen.be/ns/ipdc-lpdc#isArchived> """false"""^^<http://www.w3.org/2001/XMLSchema#boolean>`,
                                `<${conceptSnapshotId}> <http://schema.org/dateCreated> """${conceptSnapshotDateCreated.value}"""^^<http://www.w3.org/2001/XMLSchema#dateTime>`,
                                `<${conceptSnapshotId}> <http://schema.org/dateModified> """${conceptSnapshotDateModified.value}"""^^<http://www.w3.org/2001/XMLSchema#dateTime>`,
                                `<${conceptSnapshotId}> <http://www.w3.org/ns/prov#generatedAtTime> """${conceptSnapshotGeneratedAtTime.value}"""^^<http://www.w3.org/2001/XMLSchema#dateTime>`,

                                `<${conceptSnapshotId}> <http://purl.org/vocab/cpsv#produces> <${conceptSnapshotFinancialAdvantage.id}>`,
                                `<${conceptSnapshotFinancialAdvantage.id}> a <https://productencatalogus.data.vlaanderen.be/ns/ipdc-lpdc#FinancialAdvantage>`,
                                `<${conceptSnapshotFinancialAdvantage.id}> <http://purl.org/dc/terms/title> """${conceptSnapshotFinancialAdvantage.title.nl}"""@NL`,
                                `<${conceptSnapshotFinancialAdvantage.id}> <http://purl.org/dc/terms/title> """${conceptSnapshotFinancialAdvantage.title.nlFormal}"""@nl-BE-x-formal`,
                                `<${conceptSnapshotFinancialAdvantage.id}> <http://purl.org/dc/terms/title> """${conceptSnapshotFinancialAdvantage.title.nlInformal}"""@nl-BE-x-informal`,
                                `<${conceptSnapshotFinancialAdvantage.id}> <http://purl.org/dc/terms/title> """${conceptSnapshotFinancialAdvantage.title.nlGeneratedFormal}"""@nl-BE-x-generated-formal`,
                                `<${conceptSnapshotFinancialAdvantage.id}> <http://purl.org/dc/terms/title> """${conceptSnapshotFinancialAdvantage.title.nlGeneratedInformal}"""@nl-BE-x-generated-informal`,
                                `<${conceptSnapshotFinancialAdvantage.id}> <http://purl.org/dc/terms/description> """${conceptSnapshotFinancialAdvantage.description.nl}"""@NL`,
                                `<${conceptSnapshotFinancialAdvantage.id}> <http://purl.org/dc/terms/description> """${conceptSnapshotFinancialAdvantage.description.nlFormal}"""@nl-BE-x-formal`,
                                `<${conceptSnapshotFinancialAdvantage.id}> <http://purl.org/dc/terms/description> """${conceptSnapshotFinancialAdvantage.description.nlInformal}"""@nl-BE-x-informal`,
                                `<${conceptSnapshotFinancialAdvantage.id}> <http://purl.org/dc/terms/description> """${conceptSnapshotFinancialAdvantage.description.nlGeneratedFormal}"""@nl-BE-x-generated-formal`,
                                `<${conceptSnapshotFinancialAdvantage.id}> <http://purl.org/dc/terms/description> """${conceptSnapshotFinancialAdvantage.description.nlGeneratedInformal}"""@nl-BE-x-generated-informal`,
                                `<${conceptSnapshotFinancialAdvantage.id}> <http://www.w3.org/ns/shacl#order> """2"""^^<http://www.w3.org/2001/XMLSchema#integer>`,

                                `<${conceptSnapshotId}> <http://purl.org/vocab/cpsv#produces> <${conceptSnapshotNotRetainedFinancialAdvantageId}>`,
                                `<${conceptSnapshotNotRetainedFinancialAdvantageId}> a <https://productencatalogus.data.vlaanderen.be/ns/ipdc-lpdc#FinancialAdvantage>`,
                                `<${conceptSnapshotNotRetainedFinancialAdvantageId}> <http://purl.org/dc/terms/title> """title only available in non-dutch language"""@${nonDutchLanguage}`,
                                `<${conceptSnapshotNotRetainedFinancialAdvantageId}> <http://purl.org/dc/terms/description> """conceptSnapshotCost.description.nl"""@NL`,
                                `<${conceptSnapshotNotRetainedFinancialAdvantageId}> <http://purl.org/dc/terms/description> """conceptSnapshotCost.description.nlFormal"""@nl-BE-x-formal`,
                                `<${conceptSnapshotNotRetainedFinancialAdvantageId}> <http://purl.org/dc/terms/description> """conceptSnapshotCost.description.nlInformal"""@nl-BE-x-informal`,
                                `<${conceptSnapshotNotRetainedFinancialAdvantageId}> <http://purl.org/dc/terms/description> """conceptSnapshotCost.description.nlGeneratedFormal"""@nl-BE-x-generated-formal`,
                                `<${conceptSnapshotNotRetainedFinancialAdvantageId}> <http://purl.org/dc/terms/description> """conceptSnapshotCost.description.nlGeneratedInformal"""@nl-BE-x-generated-informal`,
                                `<${conceptSnapshotNotRetainedFinancialAdvantageId}> <http://www.w3.org/ns/shacl#order> """1"""^^<http://www.w3.org/2001/XMLSchema#integer>`,

                            ]);

                        const actualConceptSnapshot = await repository.findById(conceptSnapshotId);

                        expect(actualConceptSnapshot).toEqual(conceptSnapshot);
                    });

                    test(`Filters out financial advantages when description only available in language ${nonDutchLanguage}`, async () => {
                        const conceptSnapshotId = buildConceptSnapshotIri(uuid());
                        const conceptSnapshotTitle = ConceptSnapshotTestBuilder.MINIMAL_TITLE;
                        const conceptSnapshotDescription = aMinimalLanguageString('description').build();
                        const conceptSnapshotProductId = ConceptSnapshotTestBuilder.PRODUCT_ID;
                        const conceptSnapshotDateCreated = ConceptSnapshotTestBuilder.DATE_CREATED;
                        const conceptSnapshotDateModified = ConceptSnapshotTestBuilder.DATE_MODIFIED;
                        const conceptSnapshotGeneratedAtTime = ConceptSnapshotTestBuilder.GENERATED_AT_TIME;
                        const conceptSnapshotFinancialAdvantage = anotherFullFinancialAdvantage().withOrder(2).build();
                        const conceptSnapshotNotRetainedFinancialAdvantageId = CostBuilder.buildIri(uuid());

                        const conceptSnapshot =
                            aMinimalConceptSnapshot()
                                .withId(conceptSnapshotId)
                                .withTitle(conceptSnapshotTitle)
                                .withDescription(conceptSnapshotDescription)
                                .withProductId(conceptSnapshotProductId)
                                .withDateCreated(conceptSnapshotDateCreated)
                                .withDateModified(conceptSnapshotDateModified)
                                .withGeneratedAtTime(conceptSnapshotGeneratedAtTime)
                                .withFinancialAdvantages([conceptSnapshotFinancialAdvantage])
                                .build();

                        await directDatabaseAccess.insertData(
                            CONCEPT_SNAPSHOT_LDES_GRAPH,
                            [
                                `<${conceptSnapshotId}> a <https://productencatalogus.data.vlaanderen.be/ns/ipdc-lpdc#ConceptualPublicServiceSnapshot>`,
                                `<${conceptSnapshotId}> <http://purl.org/dc/terms/title> """${conceptSnapshotTitle.nl}"""@nl`,
                                `<${conceptSnapshotId}> <http://purl.org/dc/terms/description> """${conceptSnapshotDescription.nl}"""@nl`,
                                `<${conceptSnapshotId}> <http://schema.org/productID> """${conceptSnapshotProductId}"""`,
                                `<${conceptSnapshotId}> <https://productencatalogus.data.vlaanderen.be/ns/ipdc-lpdc#isArchived> """false"""^^<http://www.w3.org/2001/XMLSchema#boolean>`,
                                `<${conceptSnapshotId}> <http://schema.org/dateCreated> """${conceptSnapshotDateCreated.value}"""^^<http://www.w3.org/2001/XMLSchema#dateTime>`,
                                `<${conceptSnapshotId}> <http://schema.org/dateModified> """${conceptSnapshotDateModified.value}"""^^<http://www.w3.org/2001/XMLSchema#dateTime>`,
                                `<${conceptSnapshotId}> <http://www.w3.org/ns/prov#generatedAtTime> """${conceptSnapshotGeneratedAtTime.value}"""^^<http://www.w3.org/2001/XMLSchema#dateTime>`,

                                `<${conceptSnapshotId}> <http://purl.org/vocab/cpsv#produces> <${conceptSnapshotFinancialAdvantage.id}>`,
                                `<${conceptSnapshotFinancialAdvantage.id}> a <https://productencatalogus.data.vlaanderen.be/ns/ipdc-lpdc#FinancialAdvantage>`,
                                `<${conceptSnapshotFinancialAdvantage.id}> <http://purl.org/dc/terms/title> """${conceptSnapshotFinancialAdvantage.title.nl}"""@NL`,
                                `<${conceptSnapshotFinancialAdvantage.id}> <http://purl.org/dc/terms/title> """${conceptSnapshotFinancialAdvantage.title.nlFormal}"""@nl-BE-x-formal`,
                                `<${conceptSnapshotFinancialAdvantage.id}> <http://purl.org/dc/terms/title> """${conceptSnapshotFinancialAdvantage.title.nlInformal}"""@nl-BE-x-informal`,
                                `<${conceptSnapshotFinancialAdvantage.id}> <http://purl.org/dc/terms/title> """${conceptSnapshotFinancialAdvantage.title.nlGeneratedFormal}"""@nl-BE-x-generated-formal`,
                                `<${conceptSnapshotFinancialAdvantage.id}> <http://purl.org/dc/terms/title> """${conceptSnapshotFinancialAdvantage.title.nlGeneratedInformal}"""@nl-BE-x-generated-informal`,
                                `<${conceptSnapshotFinancialAdvantage.id}> <http://purl.org/dc/terms/description> """${conceptSnapshotFinancialAdvantage.description.nl}"""@NL`,
                                `<${conceptSnapshotFinancialAdvantage.id}> <http://purl.org/dc/terms/description> """${conceptSnapshotFinancialAdvantage.description.nlFormal}"""@nl-BE-x-formal`,
                                `<${conceptSnapshotFinancialAdvantage.id}> <http://purl.org/dc/terms/description> """${conceptSnapshotFinancialAdvantage.description.nlInformal}"""@nl-BE-x-informal`,
                                `<${conceptSnapshotFinancialAdvantage.id}> <http://purl.org/dc/terms/description> """${conceptSnapshotFinancialAdvantage.description.nlGeneratedFormal}"""@nl-BE-x-generated-formal`,
                                `<${conceptSnapshotFinancialAdvantage.id}> <http://purl.org/dc/terms/description> """${conceptSnapshotFinancialAdvantage.description.nlGeneratedInformal}"""@nl-BE-x-generated-informal`,
                                `<${conceptSnapshotFinancialAdvantage.id}> <http://www.w3.org/ns/shacl#order> """2"""^^<http://www.w3.org/2001/XMLSchema#integer>`,

                                `<${conceptSnapshotId}> <http://purl.org/vocab/cpsv#produces> <${conceptSnapshotNotRetainedFinancialAdvantageId}>`,
                                `<${conceptSnapshotNotRetainedFinancialAdvantageId}> a <https://productencatalogus.data.vlaanderen.be/ns/ipdc-lpdc#FinancialAdvantage>`,
                                `<${conceptSnapshotNotRetainedFinancialAdvantageId}> <http://purl.org/dc/terms/title> """conceptSnapshotCost.title.nl"""@NL`,
                                `<${conceptSnapshotNotRetainedFinancialAdvantageId}> <http://purl.org/dc/terms/title> """conceptSnapshotCost.title.nlFormal"""@nl-BE-x-formal`,
                                `<${conceptSnapshotNotRetainedFinancialAdvantageId}> <http://purl.org/dc/terms/title> """conceptSnapshotCost.title.nlInformal"""@nl-BE-x-informal`,
                                `<${conceptSnapshotNotRetainedFinancialAdvantageId}> <http://purl.org/dc/terms/title> """conceptSnapshotCost.title.nlGeneratedFormal"""@nl-BE-x-generated-formal`,
                                `<${conceptSnapshotNotRetainedFinancialAdvantageId}> <http://purl.org/dc/terms/title> """conceptSnapshotCost.title.nlGeneratedInformal"""@nl-BE-x-generated-informal`,
                                `<${conceptSnapshotNotRetainedFinancialAdvantageId}> <http://purl.org/dc/terms/description> """description only available in non-dutch language"""@${nonDutchLanguage}`,
                                `<${conceptSnapshotNotRetainedFinancialAdvantageId}> <http://www.w3.org/ns/shacl#order> """1"""^^<http://www.w3.org/2001/XMLSchema#integer>`,

                            ]);

                        const actualConceptSnapshot = await repository.findById(conceptSnapshotId);

                        expect(actualConceptSnapshot).toEqual(conceptSnapshot);
                    });

                    test(`Filters out financial advantages when title and description only available in language ${nonDutchLanguage}`, async () => {
                        const conceptSnapshotId = buildConceptSnapshotIri(uuid());
                        const conceptSnapshotTitle = ConceptSnapshotTestBuilder.MINIMAL_TITLE;
                        const conceptSnapshotDescription = aMinimalLanguageString('description').build();
                        const conceptSnapshotProductId = ConceptSnapshotTestBuilder.PRODUCT_ID;
                        const conceptSnapshotDateCreated = ConceptSnapshotTestBuilder.DATE_CREATED;
                        const conceptSnapshotDateModified = ConceptSnapshotTestBuilder.DATE_MODIFIED;
                        const conceptSnapshotGeneratedAtTime = ConceptSnapshotTestBuilder.GENERATED_AT_TIME;
                        const conceptSnapshotFinancialAdvantage = anotherFullFinancialAdvantage().withOrder(2).build();
                        const conceptSnapshotNotRetainedFinancialAdvantageId = CostBuilder.buildIri(uuid());

                        const conceptSnapshot =
                            aMinimalConceptSnapshot()
                                .withId(conceptSnapshotId)
                                .withTitle(conceptSnapshotTitle)
                                .withDescription(conceptSnapshotDescription)
                                .withProductId(conceptSnapshotProductId)
                                .withDateCreated(conceptSnapshotDateCreated)
                                .withDateModified(conceptSnapshotDateModified)
                                .withGeneratedAtTime(conceptSnapshotGeneratedAtTime)
                                .withFinancialAdvantages([conceptSnapshotFinancialAdvantage])
                                .build();

                        await directDatabaseAccess.insertData(
                            CONCEPT_SNAPSHOT_LDES_GRAPH,
                            [
                                `<${conceptSnapshotId}> a <https://productencatalogus.data.vlaanderen.be/ns/ipdc-lpdc#ConceptualPublicServiceSnapshot>`,
                                `<${conceptSnapshotId}> <http://purl.org/dc/terms/title> """${conceptSnapshotTitle.nl}"""@nl`,
                                `<${conceptSnapshotId}> <http://purl.org/dc/terms/description> """${conceptSnapshotDescription.nl}"""@nl`,
                                `<${conceptSnapshotId}> <http://schema.org/productID> """${conceptSnapshotProductId}"""`,
                                `<${conceptSnapshotId}> <https://productencatalogus.data.vlaanderen.be/ns/ipdc-lpdc#isArchived> """false"""^^<http://www.w3.org/2001/XMLSchema#boolean>`,
                                `<${conceptSnapshotId}> <http://schema.org/dateCreated> """${conceptSnapshotDateCreated.value}"""^^<http://www.w3.org/2001/XMLSchema#dateTime>`,
                                `<${conceptSnapshotId}> <http://schema.org/dateModified> """${conceptSnapshotDateModified.value}"""^^<http://www.w3.org/2001/XMLSchema#dateTime>`,
                                `<${conceptSnapshotId}> <http://www.w3.org/ns/prov#generatedAtTime> """${conceptSnapshotGeneratedAtTime.value}"""^^<http://www.w3.org/2001/XMLSchema#dateTime>`,

                                `<${conceptSnapshotId}> <http://purl.org/vocab/cpsv#produces> <${conceptSnapshotFinancialAdvantage.id}>`,
                                `<${conceptSnapshotFinancialAdvantage.id}> a <https://productencatalogus.data.vlaanderen.be/ns/ipdc-lpdc#FinancialAdvantage>`,
                                `<${conceptSnapshotFinancialAdvantage.id}> <http://purl.org/dc/terms/title> """${conceptSnapshotFinancialAdvantage.title.nl}"""@NL`,
                                `<${conceptSnapshotFinancialAdvantage.id}> <http://purl.org/dc/terms/title> """${conceptSnapshotFinancialAdvantage.title.nlFormal}"""@nl-BE-x-formal`,
                                `<${conceptSnapshotFinancialAdvantage.id}> <http://purl.org/dc/terms/title> """${conceptSnapshotFinancialAdvantage.title.nlInformal}"""@nl-BE-x-informal`,
                                `<${conceptSnapshotFinancialAdvantage.id}> <http://purl.org/dc/terms/title> """${conceptSnapshotFinancialAdvantage.title.nlGeneratedFormal}"""@nl-BE-x-generated-formal`,
                                `<${conceptSnapshotFinancialAdvantage.id}> <http://purl.org/dc/terms/title> """${conceptSnapshotFinancialAdvantage.title.nlGeneratedInformal}"""@nl-BE-x-generated-informal`,
                                `<${conceptSnapshotFinancialAdvantage.id}> <http://purl.org/dc/terms/description> """${conceptSnapshotFinancialAdvantage.description.nl}"""@NL`,
                                `<${conceptSnapshotFinancialAdvantage.id}> <http://purl.org/dc/terms/description> """${conceptSnapshotFinancialAdvantage.description.nlFormal}"""@nl-BE-x-formal`,
                                `<${conceptSnapshotFinancialAdvantage.id}> <http://purl.org/dc/terms/description> """${conceptSnapshotFinancialAdvantage.description.nlInformal}"""@nl-BE-x-informal`,
                                `<${conceptSnapshotFinancialAdvantage.id}> <http://purl.org/dc/terms/description> """${conceptSnapshotFinancialAdvantage.description.nlGeneratedFormal}"""@nl-BE-x-generated-formal`,
                                `<${conceptSnapshotFinancialAdvantage.id}> <http://purl.org/dc/terms/description> """${conceptSnapshotFinancialAdvantage.description.nlGeneratedInformal}"""@nl-BE-x-generated-informal`,
                                `<${conceptSnapshotFinancialAdvantage.id}> <http://www.w3.org/ns/shacl#order> """2"""^^<http://www.w3.org/2001/XMLSchema#integer>`,

                                `<${conceptSnapshotId}> <http://purl.org/vocab/cpsv#produces> <${conceptSnapshotNotRetainedFinancialAdvantageId}>`,
                                `<${conceptSnapshotNotRetainedFinancialAdvantageId}> a <https://productencatalogus.data.vlaanderen.be/ns/ipdc-lpdc#FinancialAdvantage>`,
                                `<${conceptSnapshotNotRetainedFinancialAdvantageId}> <http://purl.org/dc/terms/title> """title only available in non-dutch language"""@${nonDutchLanguage}`,
                                `<${conceptSnapshotNotRetainedFinancialAdvantageId}> <http://purl.org/dc/terms/description> """description only available in non-dutch language"""@${nonDutchLanguage}`,
                                `<${conceptSnapshotNotRetainedFinancialAdvantageId}> <http://www.w3.org/ns/shacl#order> """1"""^^<http://www.w3.org/2001/XMLSchema#integer>`,

                            ]);

                        const actualConceptSnapshot = await repository.findById(conceptSnapshotId);

                        expect(actualConceptSnapshot).toEqual(conceptSnapshot);
                    });
                }

                test(`Throws Error if required fields are missing for financial advantages`, async () => {
                    const conceptSnapshotId = buildConceptSnapshotIri(uuid());
                    const conceptSnapshotTitle = ConceptSnapshotTestBuilder.MINIMAL_TITLE;
                    const conceptSnapshotDescription = aMinimalLanguageString('description').build();
                    const conceptSnapshotProductId = ConceptSnapshotTestBuilder.PRODUCT_ID;
                    const conceptSnapshotDateCreated = ConceptSnapshotTestBuilder.DATE_CREATED;
                    const conceptSnapshotDateModified = ConceptSnapshotTestBuilder.DATE_MODIFIED;
                    const conceptSnapshotGeneratedAtTime = ConceptSnapshotTestBuilder.GENERATED_AT_TIME;
                    const conceptSnapshotFinancialAdvantageId = FinancialAdvantageBuilder.buildIri(uuid());

                    await directDatabaseAccess.insertData(
                        CONCEPT_SNAPSHOT_LDES_GRAPH,
                        [
                            `<${conceptSnapshotId}> a <https://productencatalogus.data.vlaanderen.be/ns/ipdc-lpdc#ConceptualPublicServiceSnapshot>`,
                            `<${conceptSnapshotId}> <http://purl.org/dc/terms/title> """${conceptSnapshotTitle.nl}"""@nl`,
                            `<${conceptSnapshotId}> <http://purl.org/dc/terms/description> """${conceptSnapshotDescription.nl}"""@nl`,
                            `<${conceptSnapshotId}> <http://schema.org/productID> """${conceptSnapshotProductId}"""`,
                            `<${conceptSnapshotId}> <https://productencatalogus.data.vlaanderen.be/ns/ipdc-lpdc#isArchived> """false"""^^<http://www.w3.org/2001/XMLSchema#boolean>`,
                            `<${conceptSnapshotId}> <http://schema.org/dateCreated> """${conceptSnapshotDateCreated.value}"""^^<http://www.w3.org/2001/XMLSchema#dateTime>`,
                            `<${conceptSnapshotId}> <http://schema.org/dateModified> """${conceptSnapshotDateModified.value}"""^^<http://www.w3.org/2001/XMLSchema#dateTime>`,
                            `<${conceptSnapshotId}> <http://www.w3.org/ns/prov#generatedAtTime> """${conceptSnapshotGeneratedAtTime.value}"""^^<http://www.w3.org/2001/XMLSchema#dateTime>`,

                            `<${conceptSnapshotId}> <http://purl.org/vocab/cpsv#produces> <${conceptSnapshotFinancialAdvantageId}>`,
                            `<${conceptSnapshotFinancialAdvantageId}> a <https://productencatalogus.data.vlaanderen.be/ns/ipdc-lpdc#FinancialAdvantage>`,

                        ]);

                    await expect(repository.findById(conceptSnapshotId)).rejects.toThrowWithMessage(InvariantError, `order mag niet ontbreken`);
                });
            });

        });

        for (const type of Object.values(ProductType)) {
            test(`Producttype ${type} can be mapped`, async () => {
                const conceptSnapshot = aMinimalConceptSnapshot().withType(type).build();
                await repository.save(conceptSnapshot);

                const actualConceptSnapshot = await repository.findById(conceptSnapshot.id);

                expect(actualConceptSnapshot).toEqual(conceptSnapshot);
            });
        }

        test('Unknown ProductType can not be mapped', async () => {
            const conceptSnapshotId = buildConceptSnapshotIri(uuid());

            await directDatabaseAccess.insertData(
                CONCEPT_SNAPSHOT_LDES_GRAPH,
                [`<${conceptSnapshotId}> a <https://productencatalogus.data.vlaanderen.be/ns/ipdc-lpdc#ConceptualPublicServiceSnapshot>`,
                    `<${conceptSnapshotId}> <http://purl.org/dc/terms/type> <https://productencatalogus.data.vlaanderen.be/id/concept/Type/UnknownProductType>`,
                ]);

            await expect(repository.findById(conceptSnapshotId)).rejects.toThrowWithMessage(SystemError, `Kan '<${conceptSnapshotId}> <http://purl.org/dc/terms/type> <https://productencatalogus.data.vlaanderen.be/id/concept/Type/UnknownProductType> .' niet mappen.`);
        });

        for (const targetAudience of Object.values(TargetAudienceType)) {
            test(`TargetAudienceType ${targetAudience} can be mapped`, async () => {
                const conceptSnapshot = aMinimalConceptSnapshot().withTargetAudiences([targetAudience]).build();
                await repository.save(conceptSnapshot);

                const actualConceptSnapshot = await repository.findById(conceptSnapshot.id);

                expect(actualConceptSnapshot).toEqual(conceptSnapshot);
            });
        }

        test('Unknown Target Audience Type can not be mapped', async () => {
            const conceptSnapshotId = new Iri(`https://ipdc.tni-vlaanderen.be/id/conceptsnapshot/${uuid()}`);

            await directDatabaseAccess.insertData(
                CONCEPT_SNAPSHOT_LDES_GRAPH,
                [`<${conceptSnapshotId}> a <https://productencatalogus.data.vlaanderen.be/ns/ipdc-lpdc#ConceptualPublicServiceSnapshot>`,
                    `<${conceptSnapshotId}> <https://productencatalogus.data.vlaanderen.be/ns/ipdc-lpdc#targetAudience> <https://productencatalogus.data.vlaanderen.be/id/concept/Doelgroep/NonExistingTargetAudience>`,
                ]);

            await expect(repository.findById(conceptSnapshotId)).rejects.toThrowWithMessage(SystemError, `Kan '<${conceptSnapshotId}> <https://productencatalogus.data.vlaanderen.be/ns/ipdc-lpdc#targetAudience> <https://productencatalogus.data.vlaanderen.be/id/concept/Doelgroep/NonExistingTargetAudience> .' niet mappen.`);
        });

        for (const theme of Object.values(ThemeType)) {
            test(`ThemeType ${theme} can be mapped`, async () => {
                const conceptSnapshot = aMinimalConceptSnapshot().withThemes([theme]).build();
                await repository.save(conceptSnapshot);

                const actualConceptSnapshot = await repository.findById(conceptSnapshot.id);

                expect(actualConceptSnapshot).toEqual(conceptSnapshot);
            });
        }

        test('Unknown Theme type can not be mapped', async () => {
            const conceptSnapshotId = new Iri(`https://ipdc.tni-vlaanderen.be/id/conceptsnapshot/${uuid()}`);

            await directDatabaseAccess.insertData(
                CONCEPT_SNAPSHOT_LDES_GRAPH,
                [`<${conceptSnapshotId}> a <https://productencatalogus.data.vlaanderen.be/ns/ipdc-lpdc#ConceptualPublicServiceSnapshot>`,
                    `<${conceptSnapshotId}> <http://data.europa.eu/m8g/thematicArea> <https://productencatalogus.data.vlaanderen.be/id/concept/Thema/NonExistingTheme>`,
                ]);

            await expect(repository.findById(conceptSnapshotId)).rejects.toThrowWithMessage(SystemError, `Kan '<${conceptSnapshotId}> <http://data.europa.eu/m8g/thematicArea> <https://productencatalogus.data.vlaanderen.be/id/concept/Thema/NonExistingTheme> .' niet mappen.`);
        });

        for (const competentAuthorityLevel of Object.values(CompetentAuthorityLevelType)) {
            test(`CompetentAuthorityLevelType ${competentAuthorityLevel} can be mapped`, async () => {
                const conceptSnapshot = aMinimalConceptSnapshot().withCompetentAuthorityLevels([competentAuthorityLevel]).build();
                await repository.save(conceptSnapshot);

                const actualConceptSnapshot = await repository.findById(conceptSnapshot.id);

                expect(actualConceptSnapshot).toEqual(conceptSnapshot);
            });
        }

        test('Unknown Competent Authority Level type can not be mapped', async () => {
            const conceptSnapshotId = new Iri(`https://ipdc.tni-vlaanderen.be/id/conceptsnapshot/${uuid()}`);

            await directDatabaseAccess.insertData(
                CONCEPT_SNAPSHOT_LDES_GRAPH,
                [`<${conceptSnapshotId}> a <https://productencatalogus.data.vlaanderen.be/ns/ipdc-lpdc#ConceptualPublicServiceSnapshot>`,
                    `<${conceptSnapshotId}> <https://productencatalogus.data.vlaanderen.be/ns/ipdc-lpdc#competentAuthorityLevel> <https://productencatalogus.data.vlaanderen.be/id/concept/BevoegdBestuursniveau/NonExistingCompetentAuthorityLevel>`,
                ]);

            await expect(repository.findById(conceptSnapshotId)).rejects.toThrowWithMessage(SystemError, `Kan '<${conceptSnapshotId}> <https://productencatalogus.data.vlaanderen.be/ns/ipdc-lpdc#competentAuthorityLevel> <https://productencatalogus.data.vlaanderen.be/id/concept/BevoegdBestuursniveau/NonExistingCompetentAuthorityLevel> .' niet mappen.`);

        });

        for (const executingAuthorityLevel of Object.values(ExecutingAuthorityLevelType)) {
            test(`ExecutingAuthorityLevelType ${executingAuthorityLevel} can be mapped`, async () => {
                const conceptSnapshot = aMinimalConceptSnapshot().withExecutingAuthorityLevels([executingAuthorityLevel]).build();
                await repository.save(conceptSnapshot);

                const actualConceptSnapshot = await repository.findById(conceptSnapshot.id);

                expect(actualConceptSnapshot).toEqual(conceptSnapshot);
            });
        }

        test('Unknown ExecutingAuthorityLevelType can not be mapped', async () => {
            const conceptSnapshotId = new Iri(`https://ipdc.tni-vlaanderen.be/id/conceptsnapshot/${uuid()}`);

            await directDatabaseAccess.insertData(
                CONCEPT_SNAPSHOT_LDES_GRAPH,
                [`<${conceptSnapshotId}> a <https://productencatalogus.data.vlaanderen.be/ns/ipdc-lpdc#ConceptualPublicServiceSnapshot>`,
                    `<${conceptSnapshotId}> <https://productencatalogus.data.vlaanderen.be/ns/ipdc-lpdc#executingAuthorityLevel> <https://productencatalogus.data.vlaanderen.be/id/concept/UitvoerendBestuursniveau/NonExistingExecutingAuthorityLevel>`,
                ]);

            await expect(repository.findById(conceptSnapshotId)).rejects.toThrowWithMessage(SystemError, `Kan '<${conceptSnapshotId}> <https://productencatalogus.data.vlaanderen.be/ns/ipdc-lpdc#executingAuthorityLevel> <https://productencatalogus.data.vlaanderen.be/id/concept/UitvoerendBestuursniveau/NonExistingExecutingAuthorityLevel> .' niet mappen.`);
        });

        for (const publicationMedium of Object.values(PublicationMediumType)) {
            test(`PublicationMediumType ${publicationMedium} can be mapped`, async () => {
                const conceptSnapshot = aMinimalConceptSnapshot().withPublicationMedia([publicationMedium]).build();
                await repository.save(conceptSnapshot);

                const actualConceptSnapshot = await repository.findById(conceptSnapshot.id);

                expect(actualConceptSnapshot).toEqual(conceptSnapshot);
            });
        }

        test('Unknown PublicationMediumType can not be mapped', async () => {
            const conceptSnapshotId = new Iri(`https://ipdc.tni-vlaanderen.be/id/conceptsnapshot/${uuid()}`);

            await directDatabaseAccess.insertData(
                CONCEPT_SNAPSHOT_LDES_GRAPH,
                [`<${conceptSnapshotId}> a <https://productencatalogus.data.vlaanderen.be/ns/ipdc-lpdc#ConceptualPublicServiceSnapshot>`,
                    `<${conceptSnapshotId}> <https://productencatalogus.data.vlaanderen.be/ns/ipdc-lpdc#publicationMedium> <https://productencatalogus.data.vlaanderen.be/id/concept/PublicatieKanaal/NonExistingPublicationMedium>`,
                ]);

            await expect(repository.findById(conceptSnapshotId)).rejects.toThrowWithMessage(SystemError, `Kan '<${conceptSnapshotId}> <https://productencatalogus.data.vlaanderen.be/ns/ipdc-lpdc#publicationMedium> <https://productencatalogus.data.vlaanderen.be/id/concept/PublicatieKanaal/NonExistingPublicationMedium> .' niet mappen.`);
        });

        for (const yourEuropeCategory of Object.values(YourEuropeCategoryType)) {
            test(`YourEuropeCategoryType ${yourEuropeCategory} can be mapped`, async () => {
                const conceptSnapshot = aMinimalConceptSnapshot().withYourEuropeCategories([yourEuropeCategory]).build();
                await repository.save(conceptSnapshot);

                const actualConceptSnapshot = await repository.findById(conceptSnapshot.id);

                expect(actualConceptSnapshot).toEqual(conceptSnapshot);
            });
        }

        test('Unknown YourEuropeCategoryType can not be mapped', async () => {
            const conceptSnapshotId = new Iri(`https://ipdc.tni-vlaanderen.be/id/conceptsnapshot/${uuid()}`);

            await directDatabaseAccess.insertData(
                CONCEPT_SNAPSHOT_LDES_GRAPH,
                [`<${conceptSnapshotId}> a <https://productencatalogus.data.vlaanderen.be/ns/ipdc-lpdc#ConceptualPublicServiceSnapshot>`,
                    `<${conceptSnapshotId}> <https://productencatalogus.data.vlaanderen.be/ns/ipdc-lpdc#yourEuropeCategory> <https://productencatalogus.data.vlaanderen.be/id/concept/YourEuropeCatagory/NonExistingYourEuropeCategory>`,
                ]);

            await expect(repository.findById(conceptSnapshotId)).rejects.toThrowWithMessage(SystemError, `Kan '<${conceptSnapshotId}> <https://productencatalogus.data.vlaanderen.be/ns/ipdc-lpdc#yourEuropeCategory> <https://productencatalogus.data.vlaanderen.be/id/concept/YourEuropeCatagory/NonExistingYourEuropeCategory> .' niet mappen.`);
        });
        describe('isArchived', () => {

            test('Absent isArchived maps to false', async () => {
                const conceptSnapshotId = buildConceptSnapshotIri(uuid());

                await directDatabaseAccess.insertData(
                    CONCEPT_SNAPSHOT_LDES_GRAPH,
                    [
                        `<${conceptSnapshotId}> a <https://productencatalogus.data.vlaanderen.be/ns/ipdc-lpdc#ConceptualPublicServiceSnapshot>`,
                        `<${conceptSnapshotId}> <http://purl.org/dc/terms/title> """${ConceptSnapshotTestBuilder.TITLE_NL}"""@nl`,
                        `<${conceptSnapshotId}> <http://purl.org/dc/terms/description> """${ConceptSnapshotTestBuilder.DESCRIPTION_NL}"""@nl`,
                        `<${conceptSnapshotId}> <http://schema.org/productID> """${ConceptSnapshotTestBuilder.PRODUCT_ID}"""`,
                        `<${conceptSnapshotId}> <http://schema.org/dateCreated> """${ConceptSnapshotTestBuilder.DATE_CREATED.value}"""^^<http://www.w3.org/2001/XMLSchema#dateTime>`,
                        `<${conceptSnapshotId}> <http://schema.org/dateModified> """${ConceptSnapshotTestBuilder.DATE_CREATED.value}"""^^<http://www.w3.org/2001/XMLSchema#dateTime>`,
                        `<${conceptSnapshotId}> <http://www.w3.org/ns/prov#generatedAtTime> """${ConceptSnapshotTestBuilder.GENERATED_AT_TIME.value}"""^^<http://www.w3.org/2001/XMLSchema#dateTime>`
                    ]);

                const actualConceptSnapshot = await repository.findById(conceptSnapshotId);

                expect(actualConceptSnapshot.isArchived).toBeFalse();


            });

            test('Present, but false isArchived maps to false', async () => {
                const conceptSnapshotId = buildConceptSnapshotIri(uuid());

                await directDatabaseAccess.insertData(
                    CONCEPT_SNAPSHOT_LDES_GRAPH,
                    [
                        `<${conceptSnapshotId}> a <https://productencatalogus.data.vlaanderen.be/ns/ipdc-lpdc#ConceptualPublicServiceSnapshot>`,
                        `<${conceptSnapshotId}> <http://purl.org/dc/terms/title> """${ConceptSnapshotTestBuilder.TITLE_NL}"""@nl`,
                        `<${conceptSnapshotId}> <http://purl.org/dc/terms/description> """${ConceptSnapshotTestBuilder.DESCRIPTION_NL}"""@nl`,
                        `<${conceptSnapshotId}> <http://schema.org/productID> """${ConceptSnapshotTestBuilder.PRODUCT_ID}"""`,
                        `<${conceptSnapshotId}> <http://schema.org/dateCreated> """${ConceptSnapshotTestBuilder.DATE_CREATED.value}"""^^<http://www.w3.org/2001/XMLSchema#dateTime>`,
                        `<${conceptSnapshotId}> <http://schema.org/dateModified> """${ConceptSnapshotTestBuilder.DATE_CREATED.value}"""^^<http://www.w3.org/2001/XMLSchema#dateTime>`,
                        `<${conceptSnapshotId}> <https://productencatalogus.data.vlaanderen.be/ns/ipdc-lpdc#isArchived> """false"""^^<http://www.w3.org/2001/XMLSchema#boolean>`,
                        `<${conceptSnapshotId}> <http://www.w3.org/ns/prov#generatedAtTime> """${ConceptSnapshotTestBuilder.GENERATED_AT_TIME.value}"""^^<http://www.w3.org/2001/XMLSchema#dateTime>`
                    ]);

                const actualConceptSnapshot = await repository.findById(conceptSnapshotId);

                expect(actualConceptSnapshot.isArchived).toBeFalse();
            });

            test('Present, and true, isArchived maps to true', async () => {
                const conceptSnapshotId = buildConceptSnapshotIri(uuid());

                await directDatabaseAccess.insertData(
                    CONCEPT_SNAPSHOT_LDES_GRAPH,
                    [
                        `<${conceptSnapshotId}> a <https://productencatalogus.data.vlaanderen.be/ns/ipdc-lpdc#ConceptualPublicServiceSnapshot>`,
                        `<${conceptSnapshotId}> <http://purl.org/dc/terms/title> """${ConceptSnapshotTestBuilder.TITLE_NL}"""@nl`,
                        `<${conceptSnapshotId}> <http://purl.org/dc/terms/description> """${ConceptSnapshotTestBuilder.DESCRIPTION_NL}"""@nl`,
                        `<${conceptSnapshotId}> <http://schema.org/productID> """${ConceptSnapshotTestBuilder.PRODUCT_ID}"""`,
                        `<${conceptSnapshotId}> <http://schema.org/dateCreated> """${ConceptSnapshotTestBuilder.DATE_CREATED.value}"""^^<http://www.w3.org/2001/XMLSchema#dateTime>`,
                        `<${conceptSnapshotId}> <http://schema.org/dateModified> """${ConceptSnapshotTestBuilder.DATE_CREATED.value}"""^^<http://www.w3.org/2001/XMLSchema#dateTime>`,
                        `<${conceptSnapshotId}> <https://productencatalogus.data.vlaanderen.be/ns/ipdc-lpdc#isArchived> """true"""^^<http://www.w3.org/2001/XMLSchema#boolean>`,
                        `<${conceptSnapshotId}> <http://www.w3.org/ns/prov#generatedAtTime> """${ConceptSnapshotTestBuilder.GENERATED_AT_TIME.value}"""^^<http://www.w3.org/2001/XMLSchema#dateTime>`
                    ]);

                const actualConceptSnapshot = await repository.findById(conceptSnapshotId);

                expect(actualConceptSnapshot.isArchived).toBeTrue();
            });

        });

        for (const type of Object.values(ConceptTagType)) {
            test(`Concept Tag type ${type} can be mapped`, async () => {
                const conceptSnapshot = aMinimalConceptSnapshot().withConceptTags([type]).build();
                await repository.save(conceptSnapshot);

                const actualConceptSnapshot = await repository.findById(conceptSnapshot.id);

                expect(actualConceptSnapshot).toEqual(conceptSnapshot);
            });
        }

        test('Unknown ConceptTag Type can not be mapped', async () => {
            const conceptSnapshotId = new Iri(`https://ipdc.tni-vlaanderen.be/id/conceptsnapshot/${uuid()}`);

            await directDatabaseAccess.insertData(
                CONCEPT_SNAPSHOT_LDES_GRAPH,
                [`<${conceptSnapshotId}> a <https://productencatalogus.data.vlaanderen.be/ns/ipdc-lpdc#ConceptualPublicServiceSnapshot>`,
                    `<${conceptSnapshotId}> <https://productencatalogus.data.vlaanderen.be/ns/ipdc-lpdc#conceptTag> <https://productencatalogus.data.vlaanderen.be/id/concept/ConceptTag/NonExistingConceptTag>`,
                ]);

            await expect(repository.findById(conceptSnapshotId)).rejects.toThrowWithMessage(SystemError, `Kan '<${conceptSnapshotId}> <https://productencatalogus.data.vlaanderen.be/ns/ipdc-lpdc#conceptTag> <https://productencatalogus.data.vlaanderen.be/id/concept/ConceptTag/NonExistingConceptTag> .' niet mappen.`);
        });
    });
});
