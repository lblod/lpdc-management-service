import {TEST_SPARQL_ENDPOINT} from "../../test.config";
import {DirectDatabaseAccess} from "./direct-database-access";
import {uuid} from "../../../mu-helper";
import {
    aFullConceptSnapshot,
    aMinimalConcept,
    ConceptSnapshotTestBuilder
} from "../../core/domain/concept-snapshot-test-builder";
import {ConceptSnapshotSparqlTestRepository} from "./concept-snapshot-sparql-test-repository";
import {TaalString} from "../../../src/core/domain/taal-string";
import {aMinimalRequirement, RequirementTestBuilder} from "../../core/domain/requirement-test-builder";
import {aMinimalEvidence, EvidenceTestBuilder} from "../../core/domain/evidence-test-builder";
import {aMinimalProcedure, ProcedureTestBuilder} from "../../core/domain/procedure-test-builder";
import {aMinimalWebsite, WebsiteTestBuilder} from "../../core/domain/website-test-builder";
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

describe('ConceptSnapshotRepository', () => {
    const repository = new ConceptSnapshotSparqlTestRepository(TEST_SPARQL_ENDPOINT);
    const directDatabaseAccess = new DirectDatabaseAccess(TEST_SPARQL_ENDPOINT);

    describe('findById', () => {

        test('When full concept snapshot exists with id, then return concept snapshot', async () => {
            const conceptConcept = aFullConceptSnapshot().build();
            await repository.save(conceptConcept);

            const anotherConceptSnapshot = aFullConceptSnapshot().build();
            await repository.save(anotherConceptSnapshot);

            const actualConceptSnapshot = await repository.findById(conceptConcept.id);

            expect(actualConceptSnapshot).toEqual(conceptConcept);
        });

        test('When minimal concept snapshot exists with id, then return concept snapshot', async () => {
            const conceptSnapshot = aMinimalConcept().build();
            await repository.save(conceptSnapshot);

            const anotherConceptSnapshot = aMinimalConcept().build();
            await repository.save(anotherConceptSnapshot);

            const actualConceptSnapshot = await repository.findById(conceptSnapshot.id);

            expect(actualConceptSnapshot).toEqual(conceptSnapshot);
        });

        test('When minimal concept snapshot with incomplete title exists with id, then return concept snapshot', async () => {
            const conceptSnapshot = aMinimalConcept().withTitle(TaalString.of(undefined, ConceptSnapshotTestBuilder.TITLE_NL)).build();
            await repository.save(conceptSnapshot);

            const anotherConceptSnapshot = aMinimalConcept().build();
            await repository.save(anotherConceptSnapshot);

            const actualConceptSnapshot = await repository.findById(conceptSnapshot.id);

            expect(actualConceptSnapshot).toEqual(conceptSnapshot);
        });

        test('When concept snapshot does not exist with id, then throw error', async () => {
            const conceptSnapshot = aFullConceptSnapshot().build();
            await repository.save(conceptSnapshot);

            const nonExistentConceptSnapshotId = ConceptSnapshotTestBuilder.buildIri('thisiddoesnotexist');

            await expect(repository.findById(nonExistentConceptSnapshotId)).rejects.toThrow(new Error(`Could not find <https://ipdc.tni-vlaanderen.be/id/conceptsnapshot/thisiddoesnotexist> for type <https://productencatalogus.data.vlaanderen.be/ns/ipdc-lpdc#ConceptualPublicService>`));
        });
    });

    describe('Verify ontology and mapping', () => {

        test('Verify correct type', async () => {
            const idForIncorrectType = `https://ipdc.tni-vlaanderen.be/id/rule/${uuid()}`;

            await directDatabaseAccess.insertData(
                "http://mu.semte.ch/graphs/lpdc/ldes-data",
                [`<${idForIncorrectType}> a <https://productencatalogus.data.vlaanderen.be/ns/ipdc-lpdc#SomeUnkownType>`]);

            await expect(repository.findById(idForIncorrectType)).rejects.toThrow(new Error(`Could not find <${idForIncorrectType}> for type <https://productencatalogus.data.vlaanderen.be/ns/ipdc-lpdc#ConceptualPublicService>, but found with type <https://productencatalogus.data.vlaanderen.be/ns/ipdc-lpdc#SomeUnkownType>`));
        });

        test('Verify minimal mappings', async () => {
            const conceptSnapshotId = ConceptSnapshotTestBuilder.buildIri(uuid());

            const conceptSnapshot =
                aMinimalConcept()
                    .withId(conceptSnapshotId)
                    .build();

            await directDatabaseAccess.insertData(
                "http://mu.semte.ch/graphs/lpdc/ldes-data",
                [`<${conceptSnapshotId}> a <https://productencatalogus.data.vlaanderen.be/ns/ipdc-lpdc#ConceptualPublicService>`]);

            const actualConceptSnapshot = await repository.findById(conceptSnapshotId);

            expect(actualConceptSnapshot).toEqual(conceptSnapshot);
        });

        test('Verify minimal mappings - with incomplete title', async () => {
            const conceptSnapshotId = ConceptSnapshotTestBuilder.buildIri(uuid());

            const conceptSnapshot =
                aMinimalConcept()
                    .withId(conceptSnapshotId)
                    .withTitle(TaalString.of(undefined, ConceptSnapshotTestBuilder.TITLE_NL))
                    .build();

            await directDatabaseAccess.insertData(
                "http://mu.semte.ch/graphs/lpdc/ldes-data",
                [`<${conceptSnapshotId}> a <https://productencatalogus.data.vlaanderen.be/ns/ipdc-lpdc#ConceptualPublicService>`,
                    `<${conceptSnapshotId}> <http://purl.org/dc/terms/title> """${ConceptSnapshotTestBuilder.TITLE_NL}"""@nl`]);

            const actualConceptSnapshot = await repository.findById(conceptSnapshotId);

            expect(actualConceptSnapshot).toEqual(conceptSnapshot);
        });

        test('Verify minimal mappings - with start date but no end date', async () => {
            const conceptSnapshotId = ConceptSnapshotTestBuilder.buildIri(uuid());

            const conceptSnapshot =
                aMinimalConcept()
                    .withId(conceptSnapshotId)
                    .withStartDate(ConceptSnapshotTestBuilder.START_DATE)
                    .withEndDate(undefined)
                    .build();

            await directDatabaseAccess.insertData(
                "http://mu.semte.ch/graphs/lpdc/ldes-data",
                [`<${conceptSnapshotId}> a <https://productencatalogus.data.vlaanderen.be/ns/ipdc-lpdc#ConceptualPublicService>`,
                    `<${conceptSnapshotId}> <http://schema.org/startDate> """${ConceptSnapshotTestBuilder.START_DATE.value}"""^^<http://www.w3.org/2001/XMLSchema#dateTime>`
                ]);

            const actualConceptSnapshot = await repository.findById(conceptSnapshotId);

            expect(actualConceptSnapshot).toEqual(conceptSnapshot);
        });

        test('Verify full mappings', async () => {
            const id = uuid();
            const conceptSnapshotId =  ConceptSnapshotTestBuilder.buildIri(id);

            const conceptSnapshot =
                aFullConceptSnapshot()
                    .withId(conceptSnapshotId)
                    .build();

            await directDatabaseAccess.insertData(
                "http://mu.semte.ch/graphs/lpdc/ldes-data",
                [`<${conceptSnapshotId}> a <https://productencatalogus.data.vlaanderen.be/ns/ipdc-lpdc#ConceptualPublicService>`,
                    `<${conceptSnapshotId}> <http://purl.org/dc/terms/title> """${ConceptSnapshotTestBuilder.TITLE_EN}"""@EN`,
                    `<${conceptSnapshotId}> <http://purl.org/dc/terms/title> """${ConceptSnapshotTestBuilder.TITLE_NL}"""@NL`,
                    `<${conceptSnapshotId}> <http://purl.org/dc/terms/title> """${ConceptSnapshotTestBuilder.TITLE_NL_FORMAL}"""@nl-BE-x-formal`,
                    `<${conceptSnapshotId}> <http://purl.org/dc/terms/title> """${ConceptSnapshotTestBuilder.TITLE_NL_INFORMAL}"""@nl-BE-x-informal`,
                    `<${conceptSnapshotId}> <http://purl.org/dc/terms/title> """${ConceptSnapshotTestBuilder.TITLE_NL_GENERATED_FORMAL}"""@nl-BE-x-generated-formal`,
                    `<${conceptSnapshotId}> <http://purl.org/dc/terms/title> """${ConceptSnapshotTestBuilder.TITLE_NL_GENERATED_INFORMAL}"""@nl-BE-x-generated-informal`,
                    `<${conceptSnapshotId}> <http://purl.org/dc/terms/title> """Concept Snapshot Title German language is ignored"""@de`,
                    `<${conceptSnapshotId}> <http://purl.org/dc/terms/title> """Concept Snapshot French language is ignored"""@fr`,
                    `<${conceptSnapshotId}> <http://purl.org/dc/terms/description> """${ConceptSnapshotTestBuilder.DESCRIPTION_EN}"""@EN`,
                    `<${conceptSnapshotId}> <http://purl.org/dc/terms/description> """${ConceptSnapshotTestBuilder.DESCRIPTION_NL}"""@NL`,
                    `<${conceptSnapshotId}> <http://purl.org/dc/terms/description> """${ConceptSnapshotTestBuilder.DESCRIPTION_NL_FORMAL}"""@nl-BE-x-formal`,
                    `<${conceptSnapshotId}> <http://purl.org/dc/terms/description> """${ConceptSnapshotTestBuilder.DESCRIPTION_NL_INFORMAL}"""@nl-BE-x-informal`,
                    `<${conceptSnapshotId}> <http://purl.org/dc/terms/description> """${ConceptSnapshotTestBuilder.DESCRIPTION_NL_GENERATED_FORMAL}"""@nl-BE-x-generated-formal`,
                    `<${conceptSnapshotId}> <http://purl.org/dc/terms/description> """${ConceptSnapshotTestBuilder.DESCRIPTION_NL_GENERATED_INFORMAL}"""@nl-BE-x-generated-informal`,
                    `<${conceptSnapshotId}> <http://purl.org/dc/terms/description> """Concept Snapshot Description German language is ignored"""@de`,
                    `<${conceptSnapshotId}> <http://purl.org/dc/terms/description> """Concept Snapshot Description language is ignored"""@fr`,
                    `<${conceptSnapshotId}> <https://productencatalogus.data.vlaanderen.be/ns/ipdc-lpdc#additionalDescription> """${ConceptSnapshotTestBuilder.ADDITIONAL_DESCRIPTION_EN}"""@EN`,
                    `<${conceptSnapshotId}> <https://productencatalogus.data.vlaanderen.be/ns/ipdc-lpdc#additionalDescription> """${ConceptSnapshotTestBuilder.ADDITIONAL_DESCRIPTION_NL}"""@NL`,
                    `<${conceptSnapshotId}> <https://productencatalogus.data.vlaanderen.be/ns/ipdc-lpdc#additionalDescription> """${ConceptSnapshotTestBuilder.ADDITIONAL_DESCRIPTION_NL_FORMAL}"""@nl-BE-x-formal`,
                    `<${conceptSnapshotId}> <https://productencatalogus.data.vlaanderen.be/ns/ipdc-lpdc#additionalDescription> """${ConceptSnapshotTestBuilder.ADDITIONAL_DESCRIPTION_NL_INFORMAL}"""@nl-BE-x-informal`,
                    `<${conceptSnapshotId}> <https://productencatalogus.data.vlaanderen.be/ns/ipdc-lpdc#additionalDescription> """${ConceptSnapshotTestBuilder.ADDITIONAL_DESCRIPTION_NL_GENERATED_FORMAL}"""@nl-BE-x-generated-formal`,
                    `<${conceptSnapshotId}> <https://productencatalogus.data.vlaanderen.be/ns/ipdc-lpdc#additionalDescription> """${ConceptSnapshotTestBuilder.ADDITIONAL_DESCRIPTION_NL_GENERATED_INFORMAL}"""@nl-BE-x-generated-informal`,
                    `<${conceptSnapshotId}> <https://productencatalogus.data.vlaanderen.be/ns/ipdc-lpdc#additionalDescription> """Concept Snapshot Additional Description German language is ignored"""@de`,
                    `<${conceptSnapshotId}> <https://productencatalogus.data.vlaanderen.be/ns/ipdc-lpdc#additionalDescription> """Concept Snapshot Additional Description language is ignored"""@fr`,
                    `<${conceptSnapshotId}> <https://productencatalogus.data.vlaanderen.be/ns/ipdc-lpdc#exception> """${ConceptSnapshotTestBuilder.EXCEPTION_EN}"""@EN`,
                    `<${conceptSnapshotId}> <https://productencatalogus.data.vlaanderen.be/ns/ipdc-lpdc#exception> """${ConceptSnapshotTestBuilder.EXCEPTION_NL}"""@NL`,
                    `<${conceptSnapshotId}> <https://productencatalogus.data.vlaanderen.be/ns/ipdc-lpdc#exception> """${ConceptSnapshotTestBuilder.EXCEPTION_NL_FORMAL}"""@nl-BE-x-formal`,
                    `<${conceptSnapshotId}> <https://productencatalogus.data.vlaanderen.be/ns/ipdc-lpdc#exception> """${ConceptSnapshotTestBuilder.EXCEPTION_NL_INFORMAL}"""@nl-BE-x-informal`,
                    `<${conceptSnapshotId}> <https://productencatalogus.data.vlaanderen.be/ns/ipdc-lpdc#exception> """${ConceptSnapshotTestBuilder.EXCEPTION_NL_GENERATED_FORMAL}"""@nl-BE-x-generated-formal`,
                    `<${conceptSnapshotId}> <https://productencatalogus.data.vlaanderen.be/ns/ipdc-lpdc#exception> """${ConceptSnapshotTestBuilder.EXCEPTION_NL_GENERATED_INFORMAL}"""@nl-BE-x-generated-informal`,
                    `<${conceptSnapshotId}> <https://productencatalogus.data.vlaanderen.be/ns/ipdc-lpdc#exception> """Concept Snapshot Exception German language is ignored"""@de`,
                    `<${conceptSnapshotId}> <https://productencatalogus.data.vlaanderen.be/ns/ipdc-lpdc#exception> """Concept Snapshot Exception language is ignored"""@fr`,
                    `<${conceptSnapshotId}> <https://productencatalogus.data.vlaanderen.be/ns/ipdc-lpdc#regulation> """${ConceptSnapshotTestBuilder.REGULATION_EN}"""@EN`,
                    `<${conceptSnapshotId}> <https://productencatalogus.data.vlaanderen.be/ns/ipdc-lpdc#regulation> """${ConceptSnapshotTestBuilder.REGULATION_NL}"""@NL`,
                    `<${conceptSnapshotId}> <https://productencatalogus.data.vlaanderen.be/ns/ipdc-lpdc#regulation> """${ConceptSnapshotTestBuilder.REGULATION_NL_FORMAL}"""@nl-BE-x-formal`,
                    `<${conceptSnapshotId}> <https://productencatalogus.data.vlaanderen.be/ns/ipdc-lpdc#regulation> """${ConceptSnapshotTestBuilder.REGULATION_NL_INFORMAL}"""@nl-BE-x-informal`,
                    `<${conceptSnapshotId}> <https://productencatalogus.data.vlaanderen.be/ns/ipdc-lpdc#regulation> """${ConceptSnapshotTestBuilder.REGULATION_NL_GENERATED_FORMAL}"""@nl-BE-x-generated-formal`,
                    `<${conceptSnapshotId}> <https://productencatalogus.data.vlaanderen.be/ns/ipdc-lpdc#regulation> """${ConceptSnapshotTestBuilder.REGULATION_NL_GENERATED_INFORMAL}"""@nl-BE-x-generated-informal`,
                    `<${conceptSnapshotId}> <https://productencatalogus.data.vlaanderen.be/ns/ipdc-lpdc#regulation> """Concept Snapshot Regulation German language is ignored"""@de`,
                    `<${conceptSnapshotId}> <https://productencatalogus.data.vlaanderen.be/ns/ipdc-lpdc#regulation> """Concept Snapshot Regulation  language is ignored"""@fr`,
                    `<${conceptSnapshotId}> <http://schema.org/startDate> """${ConceptSnapshotTestBuilder.START_DATE.value}"""^^<http://www.w3.org/2001/XMLSchema#dateTime>`,
                    `<${conceptSnapshotId}> <http://schema.org/endDate> """${ConceptSnapshotTestBuilder.END_DATE.value}"""^^<http://www.w3.org/2001/XMLSchema#dateTime>`,
                    `<${conceptSnapshotId}> <http://purl.org/dc/terms/type> <${ConceptSnapshotTestBuilder.TYPE}>`,
                    `<${conceptSnapshotId}> <https://productencatalogus.data.vlaanderen.be/ns/ipdc-lpdc#targetAudience> <${Array.from(ConceptSnapshotTestBuilder.TARGET_AUDIENCES)[0]}>`,
                    `<${conceptSnapshotId}> <https://productencatalogus.data.vlaanderen.be/ns/ipdc-lpdc#targetAudience> <${Array.from(ConceptSnapshotTestBuilder.TARGET_AUDIENCES)[1]}>`,
                    `<${conceptSnapshotId}> <https://productencatalogus.data.vlaanderen.be/ns/ipdc-lpdc#targetAudience> <${Array.from(ConceptSnapshotTestBuilder.TARGET_AUDIENCES)[2]}>`,
                    `<${conceptSnapshotId}> <http://data.europa.eu/m8g/thematicArea> <${Array.from(ConceptSnapshotTestBuilder.THEMES)[0]}>`,
                    `<${conceptSnapshotId}> <http://data.europa.eu/m8g/thematicArea> <${Array.from(ConceptSnapshotTestBuilder.THEMES)[1]}>`,
                    `<${conceptSnapshotId}> <http://data.europa.eu/m8g/thematicArea> <${Array.from(ConceptSnapshotTestBuilder.THEMES)[2]}>`,
                    `<${conceptSnapshotId}> <https://productencatalogus.data.vlaanderen.be/ns/ipdc-lpdc#competentAuthorityLevel> <${Array.from(ConceptSnapshotTestBuilder.COMPETENT_AUTHORITY_LEVELS)[0]}>`,
                    `<${conceptSnapshotId}> <https://productencatalogus.data.vlaanderen.be/ns/ipdc-lpdc#competentAuthorityLevel> <${Array.from(ConceptSnapshotTestBuilder.COMPETENT_AUTHORITY_LEVELS)[1]}>`,
                    `<${conceptSnapshotId}> <https://productencatalogus.data.vlaanderen.be/ns/ipdc-lpdc#competentAuthorityLevel> <${Array.from(ConceptSnapshotTestBuilder.COMPETENT_AUTHORITY_LEVELS)[2]}>`,
                    `<${conceptSnapshotId}> <http://data.europa.eu/m8g/hasCompetentAuthority> <${Array.from(ConceptSnapshotTestBuilder.COMPETENT_AUTHORITIES)[0]}>`,
                    `<${conceptSnapshotId}> <http://data.europa.eu/m8g/hasCompetentAuthority> <${Array.from(ConceptSnapshotTestBuilder.COMPETENT_AUTHORITIES)[1]}>`,
                    `<${conceptSnapshotId}> <http://data.europa.eu/m8g/hasCompetentAuthority> <${Array.from(ConceptSnapshotTestBuilder.COMPETENT_AUTHORITIES)[2]}>`,
                    `<${conceptSnapshotId}> <https://productencatalogus.data.vlaanderen.be/ns/ipdc-lpdc#executingAuthorityLevel> <${Array.from(ConceptSnapshotTestBuilder.EXECUTING_AUTHORITY_LEVELS)[0]}>`,
                    `<${conceptSnapshotId}> <https://productencatalogus.data.vlaanderen.be/ns/ipdc-lpdc#executingAuthorityLevel> <${Array.from(ConceptSnapshotTestBuilder.EXECUTING_AUTHORITY_LEVELS)[1]}>`,
                    `<${conceptSnapshotId}> <https://productencatalogus.data.vlaanderen.be/ns/ipdc-lpdc#executingAuthorityLevel> <${Array.from(ConceptSnapshotTestBuilder.EXECUTING_AUTHORITY_LEVELS)[2]}>`,
                    `<${conceptSnapshotId}> <https://productencatalogus.data.vlaanderen.be/ns/ipdc-lpdc#hasExecutingAuthority> <${Array.from(ConceptSnapshotTestBuilder.EXECUTING_AUTHORITIES)[0]}>`,
                    `<${conceptSnapshotId}> <https://productencatalogus.data.vlaanderen.be/ns/ipdc-lpdc#hasExecutingAuthority> <${Array.from(ConceptSnapshotTestBuilder.EXECUTING_AUTHORITIES)[1]}>`,
                    `<${conceptSnapshotId}> <https://productencatalogus.data.vlaanderen.be/ns/ipdc-lpdc#hasExecutingAuthority> <${Array.from(ConceptSnapshotTestBuilder.EXECUTING_AUTHORITIES)[2]}>`,
                    `<${conceptSnapshotId}> <https://productencatalogus.data.vlaanderen.be/ns/ipdc-lpdc#publicationMedium> <${Array.from(ConceptSnapshotTestBuilder.PUBLICATION_MEDIA)[0]}>`,
                    `<${conceptSnapshotId}> <https://productencatalogus.data.vlaanderen.be/ns/ipdc-lpdc#publicationMedium> <${Array.from(ConceptSnapshotTestBuilder.PUBLICATION_MEDIA)[1]}>`,
                    `<${conceptSnapshotId}> <https://productencatalogus.data.vlaanderen.be/ns/ipdc-lpdc#yourEuropeCategory> <${Array.from(ConceptSnapshotTestBuilder.YOUR_EUROPE_CATEGORIES)[0]}>`,
                    `<${conceptSnapshotId}> <https://productencatalogus.data.vlaanderen.be/ns/ipdc-lpdc#yourEuropeCategory> <${Array.from(ConceptSnapshotTestBuilder.YOUR_EUROPE_CATEGORIES)[1]}>`,
                    `<${conceptSnapshotId}> <https://productencatalogus.data.vlaanderen.be/ns/ipdc-lpdc#yourEuropeCategory> <${Array.from(ConceptSnapshotTestBuilder.YOUR_EUROPE_CATEGORIES)[2]}>`,
                    `<${conceptSnapshotId}> <http://www.w3.org/ns/dcat#keyword> """${Array.from(ConceptSnapshotTestBuilder.KEYWORDS)[0].en}"""@en`,
                    `<${conceptSnapshotId}> <http://www.w3.org/ns/dcat#keyword> """${Array.from(ConceptSnapshotTestBuilder.KEYWORDS)[1].nl}"""@nl`,
                    `<${conceptSnapshotId}> <http://www.w3.org/ns/dcat#keyword> """${Array.from(ConceptSnapshotTestBuilder.KEYWORDS)[2].nl}"""@nl`,
                    `<${conceptSnapshotId}> <http://www.w3.org/ns/dcat#keyword> """${Array.from(ConceptSnapshotTestBuilder.KEYWORDS)[3].en}"""@en`,
                    `<${conceptSnapshotId}> <http://vocab.belgif.be/ns/publicservice#hasRequirement> <${ConceptSnapshotTestBuilder.REQUIREMENTS[1].id}>`,
                    `<${ConceptSnapshotTestBuilder.REQUIREMENTS[1].id}> a <http://data.europa.eu/m8g/Requirement>`,
                    `<${ConceptSnapshotTestBuilder.REQUIREMENTS[1].id}> <http://purl.org/dc/terms/title> """${ConceptSnapshotTestBuilder.REQUIREMENTS[1].title.en}"""@EN`,
                    `<${ConceptSnapshotTestBuilder.REQUIREMENTS[1].id}> <http://purl.org/dc/terms/title> """${ConceptSnapshotTestBuilder.REQUIREMENTS[1].title.nl}"""@NL`,
                    `<${ConceptSnapshotTestBuilder.REQUIREMENTS[1].id}> <http://purl.org/dc/terms/title> """${ConceptSnapshotTestBuilder.REQUIREMENTS[1].title.nlFormal}"""@nl-BE-x-formal`,
                    `<${ConceptSnapshotTestBuilder.REQUIREMENTS[1].id}> <http://purl.org/dc/terms/title> """${ConceptSnapshotTestBuilder.REQUIREMENTS[1].title.nlInformal}"""@nl-BE-x-informal`,
                    `<${ConceptSnapshotTestBuilder.REQUIREMENTS[1].id}> <http://purl.org/dc/terms/title> """${ConceptSnapshotTestBuilder.REQUIREMENTS[1].title.nlGeneratedFormal}"""@nl-BE-x-generated-formal`,
                    `<${ConceptSnapshotTestBuilder.REQUIREMENTS[1].id}> <http://purl.org/dc/terms/title> """${ConceptSnapshotTestBuilder.REQUIREMENTS[1].title.nlGeneratedInformal}"""@nl-BE-x-generated-informal`,
                    `<${ConceptSnapshotTestBuilder.REQUIREMENTS[1].id}> <http://purl.org/dc/terms/description> """${ConceptSnapshotTestBuilder.REQUIREMENTS[1].description.en}"""@EN`,
                    `<${ConceptSnapshotTestBuilder.REQUIREMENTS[1].id}> <http://purl.org/dc/terms/description> """${ConceptSnapshotTestBuilder.REQUIREMENTS[1].description.nl}"""@NL`,
                    `<${ConceptSnapshotTestBuilder.REQUIREMENTS[1].id}> <http://purl.org/dc/terms/description> """${ConceptSnapshotTestBuilder.REQUIREMENTS[1].description.nlFormal}"""@nl-BE-x-formal`,
                    `<${ConceptSnapshotTestBuilder.REQUIREMENTS[1].id}> <http://purl.org/dc/terms/description> """${ConceptSnapshotTestBuilder.REQUIREMENTS[1].description.nlInformal}"""@nl-BE-x-informal`,
                    `<${ConceptSnapshotTestBuilder.REQUIREMENTS[1].id}> <http://purl.org/dc/terms/description> """${ConceptSnapshotTestBuilder.REQUIREMENTS[1].description.nlGeneratedFormal}"""@nl-BE-x-generated-formal`,
                    `<${ConceptSnapshotTestBuilder.REQUIREMENTS[1].id}> <http://purl.org/dc/terms/description> """${ConceptSnapshotTestBuilder.REQUIREMENTS[1].description.nlGeneratedInformal}"""@nl-BE-x-generated-informal`,
                    `<${ConceptSnapshotTestBuilder.REQUIREMENTS[1].id}> <http://www.w3.org/ns/shacl#order> """1"""^^<http://www.w3.org/2001/XMLSchema#integer>`,
                    `<${ConceptSnapshotTestBuilder.REQUIREMENTS[1].id}> <http://data.europa.eu/m8g/hasSupportingEvidence> <${ConceptSnapshotTestBuilder.REQUIREMENTS[1].evidence.id}>`,
                    `<${ConceptSnapshotTestBuilder.REQUIREMENTS[1].evidence.id}> a <http://data.europa.eu/m8g/Evidence>`,
                    `<${ConceptSnapshotTestBuilder.REQUIREMENTS[1].evidence.id}> <http://purl.org/dc/terms/title> """${ConceptSnapshotTestBuilder.REQUIREMENTS[1].evidence.title.en}"""@EN`,
                    `<${ConceptSnapshotTestBuilder.REQUIREMENTS[1].evidence.id}> <http://purl.org/dc/terms/title> """${ConceptSnapshotTestBuilder.REQUIREMENTS[1].evidence.title.nl}"""@NL`,
                    `<${ConceptSnapshotTestBuilder.REQUIREMENTS[1].evidence.id}> <http://purl.org/dc/terms/title> """${ConceptSnapshotTestBuilder.REQUIREMENTS[1].evidence.title.nlFormal}"""@nl-BE-x-formal`,
                    `<${ConceptSnapshotTestBuilder.REQUIREMENTS[1].evidence.id}> <http://purl.org/dc/terms/title> """${ConceptSnapshotTestBuilder.REQUIREMENTS[1].evidence.title.nlInformal}"""@nl-BE-x-informal`,
                    `<${ConceptSnapshotTestBuilder.REQUIREMENTS[1].evidence.id}> <http://purl.org/dc/terms/title> """${ConceptSnapshotTestBuilder.REQUIREMENTS[1].evidence.title.nlGeneratedFormal}"""@nl-BE-x-generated-formal`,
                    `<${ConceptSnapshotTestBuilder.REQUIREMENTS[1].evidence.id}> <http://purl.org/dc/terms/title> """${ConceptSnapshotTestBuilder.REQUIREMENTS[1].evidence.title.nlGeneratedInformal}"""@nl-BE-x-generated-informal`,
                    `<${ConceptSnapshotTestBuilder.REQUIREMENTS[1].evidence.id}> <http://purl.org/dc/terms/description> """${ConceptSnapshotTestBuilder.REQUIREMENTS[1].evidence.description.en}"""@EN`,
                    `<${ConceptSnapshotTestBuilder.REQUIREMENTS[1].evidence.id}> <http://purl.org/dc/terms/description> """${ConceptSnapshotTestBuilder.REQUIREMENTS[1].evidence.description.nl}"""@NL`,
                    `<${ConceptSnapshotTestBuilder.REQUIREMENTS[1].evidence.id}> <http://purl.org/dc/terms/description> """${ConceptSnapshotTestBuilder.REQUIREMENTS[1].evidence.description.nlFormal}"""@nl-BE-x-formal`,
                    `<${ConceptSnapshotTestBuilder.REQUIREMENTS[1].evidence.id}> <http://purl.org/dc/terms/description> """${ConceptSnapshotTestBuilder.REQUIREMENTS[1].evidence.description.nlInformal}"""@nl-BE-x-informal`,
                    `<${ConceptSnapshotTestBuilder.REQUIREMENTS[1].evidence.id}> <http://purl.org/dc/terms/description> """${ConceptSnapshotTestBuilder.REQUIREMENTS[1].evidence.description.nlGeneratedFormal}"""@nl-BE-x-generated-formal`,
                    `<${ConceptSnapshotTestBuilder.REQUIREMENTS[1].evidence.id}> <http://purl.org/dc/terms/description> """${ConceptSnapshotTestBuilder.REQUIREMENTS[1].evidence.description.nlGeneratedInformal}"""@nl-BE-x-generated-informal`,
                    `<${conceptSnapshotId}> <http://vocab.belgif.be/ns/publicservice#hasRequirement> <${ConceptSnapshotTestBuilder.REQUIREMENTS[0].id}>`,
                    `<${ConceptSnapshotTestBuilder.REQUIREMENTS[0].id}> a <http://data.europa.eu/m8g/Requirement>`,
                    `<${ConceptSnapshotTestBuilder.REQUIREMENTS[0].id}> <http://purl.org/dc/terms/title> """${ConceptSnapshotTestBuilder.REQUIREMENTS[0].title.en}"""@EN`,
                    `<${ConceptSnapshotTestBuilder.REQUIREMENTS[0].id}> <http://purl.org/dc/terms/title> """${ConceptSnapshotTestBuilder.REQUIREMENTS[0].title.nl}"""@NL`,
                    `<${ConceptSnapshotTestBuilder.REQUIREMENTS[0].id}> <http://purl.org/dc/terms/title> """${ConceptSnapshotTestBuilder.REQUIREMENTS[0].title.nlFormal}"""@nl-BE-x-formal`,
                    `<${ConceptSnapshotTestBuilder.REQUIREMENTS[0].id}> <http://purl.org/dc/terms/title> """${ConceptSnapshotTestBuilder.REQUIREMENTS[0].title.nlInformal}"""@nl-BE-x-informal`,
                    `<${ConceptSnapshotTestBuilder.REQUIREMENTS[0].id}> <http://purl.org/dc/terms/title> """${ConceptSnapshotTestBuilder.REQUIREMENTS[0].title.nlGeneratedFormal}"""@nl-BE-x-generated-formal`,
                    `<${ConceptSnapshotTestBuilder.REQUIREMENTS[0].id}> <http://purl.org/dc/terms/title> """${ConceptSnapshotTestBuilder.REQUIREMENTS[0].title.nlGeneratedInformal}"""@nl-BE-x-generated-informal`,
                    `<${ConceptSnapshotTestBuilder.REQUIREMENTS[0].id}> <http://purl.org/dc/terms/description> """${ConceptSnapshotTestBuilder.REQUIREMENTS[0].description.en}"""@EN`,
                    `<${ConceptSnapshotTestBuilder.REQUIREMENTS[0].id}> <http://purl.org/dc/terms/description> """${ConceptSnapshotTestBuilder.REQUIREMENTS[0].description.nl}"""@NL`,
                    `<${ConceptSnapshotTestBuilder.REQUIREMENTS[0].id}> <http://purl.org/dc/terms/description> """${ConceptSnapshotTestBuilder.REQUIREMENTS[0].description.nlFormal}"""@nl-BE-x-formal`,
                    `<${ConceptSnapshotTestBuilder.REQUIREMENTS[0].id}> <http://purl.org/dc/terms/description> """${ConceptSnapshotTestBuilder.REQUIREMENTS[0].description.nlInformal}"""@nl-BE-x-informal`,
                    `<${ConceptSnapshotTestBuilder.REQUIREMENTS[0].id}> <http://purl.org/dc/terms/description> """${ConceptSnapshotTestBuilder.REQUIREMENTS[0].description.nlGeneratedFormal}"""@nl-BE-x-generated-formal`,
                    `<${ConceptSnapshotTestBuilder.REQUIREMENTS[0].id}> <http://purl.org/dc/terms/description> """${ConceptSnapshotTestBuilder.REQUIREMENTS[0].description.nlGeneratedInformal}"""@nl-BE-x-generated-informal`,
                    `<${ConceptSnapshotTestBuilder.REQUIREMENTS[0].id}> <http://www.w3.org/ns/shacl#order> """0"""^^<http://www.w3.org/2001/XMLSchema#integer>`,
                    `<${ConceptSnapshotTestBuilder.REQUIREMENTS[0].id}> <http://data.europa.eu/m8g/hasSupportingEvidence> <${ConceptSnapshotTestBuilder.REQUIREMENTS[0].evidence.id}>`,
                    `<${ConceptSnapshotTestBuilder.REQUIREMENTS[0].evidence.id}> a <http://data.europa.eu/m8g/Evidence>`,
                    `<${ConceptSnapshotTestBuilder.REQUIREMENTS[0].evidence.id}> <http://purl.org/dc/terms/title> """${ConceptSnapshotTestBuilder.REQUIREMENTS[0].evidence.title.en}"""@EN`,
                    `<${ConceptSnapshotTestBuilder.REQUIREMENTS[0].evidence.id}> <http://purl.org/dc/terms/title> """${ConceptSnapshotTestBuilder.REQUIREMENTS[0].evidence.title.nl}"""@NL`,
                    `<${ConceptSnapshotTestBuilder.REQUIREMENTS[0].evidence.id}> <http://purl.org/dc/terms/title> """${ConceptSnapshotTestBuilder.REQUIREMENTS[0].evidence.title.nlFormal}"""@nl-BE-x-formal`,
                    `<${ConceptSnapshotTestBuilder.REQUIREMENTS[0].evidence.id}> <http://purl.org/dc/terms/title> """${ConceptSnapshotTestBuilder.REQUIREMENTS[0].evidence.title.nlInformal}"""@nl-BE-x-informal`,
                    `<${ConceptSnapshotTestBuilder.REQUIREMENTS[0].evidence.id}> <http://purl.org/dc/terms/title> """${ConceptSnapshotTestBuilder.REQUIREMENTS[0].evidence.title.nlGeneratedFormal}"""@nl-BE-x-generated-formal`,
                    `<${ConceptSnapshotTestBuilder.REQUIREMENTS[0].evidence.id}> <http://purl.org/dc/terms/title> """${ConceptSnapshotTestBuilder.REQUIREMENTS[0].evidence.title.nlGeneratedInformal}"""@nl-BE-x-generated-informal`,
                    `<${ConceptSnapshotTestBuilder.REQUIREMENTS[0].evidence.id}> <http://purl.org/dc/terms/description> """${ConceptSnapshotTestBuilder.REQUIREMENTS[0].evidence.description.en}"""@EN`,
                    `<${ConceptSnapshotTestBuilder.REQUIREMENTS[0].evidence.id}> <http://purl.org/dc/terms/description> """${ConceptSnapshotTestBuilder.REQUIREMENTS[0].evidence.description.nl}"""@NL`,
                    `<${ConceptSnapshotTestBuilder.REQUIREMENTS[0].evidence.id}> <http://purl.org/dc/terms/description> """${ConceptSnapshotTestBuilder.REQUIREMENTS[0].evidence.description.nlFormal}"""@nl-BE-x-formal`,
                    `<${ConceptSnapshotTestBuilder.REQUIREMENTS[0].evidence.id}> <http://purl.org/dc/terms/description> """${ConceptSnapshotTestBuilder.REQUIREMENTS[0].evidence.description.nlInformal}"""@nl-BE-x-informal`,
                    `<${ConceptSnapshotTestBuilder.REQUIREMENTS[0].evidence.id}> <http://purl.org/dc/terms/description> """${ConceptSnapshotTestBuilder.REQUIREMENTS[0].evidence.description.nlGeneratedFormal}"""@nl-BE-x-generated-formal`,
                    `<${ConceptSnapshotTestBuilder.REQUIREMENTS[0].evidence.id}> <http://purl.org/dc/terms/description> """${ConceptSnapshotTestBuilder.REQUIREMENTS[0].evidence.description.nlGeneratedInformal}"""@nl-BE-x-generated-informal`,
                    `<${conceptSnapshotId}> <http://purl.org/vocab/cpsv#follows> <${ConceptSnapshotTestBuilder.PROCEDURES[1].id}>`,
                    `<${ConceptSnapshotTestBuilder.PROCEDURES[1].id}> a <http://purl.org/vocab/cpsv#Rule>`,
                    `<${ConceptSnapshotTestBuilder.PROCEDURES[1].id}> <http://purl.org/dc/terms/title> """${ConceptSnapshotTestBuilder.PROCEDURES[1].title.en}"""@EN`,
                    `<${ConceptSnapshotTestBuilder.PROCEDURES[1].id}> <http://purl.org/dc/terms/title> """${ConceptSnapshotTestBuilder.PROCEDURES[1].title.nl}"""@NL`,
                    `<${ConceptSnapshotTestBuilder.PROCEDURES[1].id}> <http://purl.org/dc/terms/title> """${ConceptSnapshotTestBuilder.PROCEDURES[1].title.nlFormal}"""@nl-BE-x-formal`,
                    `<${ConceptSnapshotTestBuilder.PROCEDURES[1].id}> <http://purl.org/dc/terms/title> """${ConceptSnapshotTestBuilder.PROCEDURES[1].title.nlInformal}"""@nl-BE-x-informal`,
                    `<${ConceptSnapshotTestBuilder.PROCEDURES[1].id}> <http://purl.org/dc/terms/title> """${ConceptSnapshotTestBuilder.PROCEDURES[1].title.nlGeneratedFormal}"""@nl-BE-x-generated-formal`,
                    `<${ConceptSnapshotTestBuilder.PROCEDURES[1].id}> <http://purl.org/dc/terms/title> """${ConceptSnapshotTestBuilder.PROCEDURES[1].title.nlGeneratedInformal}"""@nl-BE-x-generated-informal`,
                    `<${ConceptSnapshotTestBuilder.PROCEDURES[1].id}> <http://purl.org/dc/terms/description> """${ConceptSnapshotTestBuilder.PROCEDURES[1].description.en}"""@EN`,
                    `<${ConceptSnapshotTestBuilder.PROCEDURES[1].id}> <http://purl.org/dc/terms/description> """${ConceptSnapshotTestBuilder.PROCEDURES[1].description.nl}"""@NL`,
                    `<${ConceptSnapshotTestBuilder.PROCEDURES[1].id}> <http://purl.org/dc/terms/description> """${ConceptSnapshotTestBuilder.PROCEDURES[1].description.nlFormal}"""@nl-BE-x-formal`,
                    `<${ConceptSnapshotTestBuilder.PROCEDURES[1].id}> <http://purl.org/dc/terms/description> """${ConceptSnapshotTestBuilder.PROCEDURES[1].description.nlInformal}"""@nl-BE-x-informal`,
                    `<${ConceptSnapshotTestBuilder.PROCEDURES[1].id}> <http://purl.org/dc/terms/description> """${ConceptSnapshotTestBuilder.PROCEDURES[1].description.nlGeneratedFormal}"""@nl-BE-x-generated-formal`,
                    `<${ConceptSnapshotTestBuilder.PROCEDURES[1].id}> <http://purl.org/dc/terms/description> """${ConceptSnapshotTestBuilder.PROCEDURES[1].description.nlGeneratedInformal}"""@nl-BE-x-generated-informal`,
                    `<${ConceptSnapshotTestBuilder.PROCEDURES[1].id}> <http://www.w3.org/ns/shacl#order> """1"""^^<http://www.w3.org/2001/XMLSchema#integer>`,
                    `<${ConceptSnapshotTestBuilder.PROCEDURES[1].id}> <https://productencatalogus.data.vlaanderen.be/ns/ipdc-lpdc#hasWebsite> <${ConceptSnapshotTestBuilder.PROCEDURES[1].websites[1].id}>`,
                    `<${ConceptSnapshotTestBuilder.PROCEDURES[1].websites[1].id}> a <http://schema.org/WebSite>`,
                    `<${ConceptSnapshotTestBuilder.PROCEDURES[1].websites[1].id}> <http://purl.org/dc/terms/title> """${ConceptSnapshotTestBuilder.PROCEDURES[1].websites[1].title.en}"""@EN`,
                    `<${ConceptSnapshotTestBuilder.PROCEDURES[1].websites[1].id}> <http://purl.org/dc/terms/title> """${ConceptSnapshotTestBuilder.PROCEDURES[1].websites[1].title.nl}"""@NL`,
                    `<${ConceptSnapshotTestBuilder.PROCEDURES[1].websites[1].id}> <http://purl.org/dc/terms/title> """${ConceptSnapshotTestBuilder.PROCEDURES[1].websites[1].title.nlFormal}"""@nl-BE-x-formal`,
                    `<${ConceptSnapshotTestBuilder.PROCEDURES[1].websites[1].id}> <http://purl.org/dc/terms/title> """${ConceptSnapshotTestBuilder.PROCEDURES[1].websites[1].title.nlInformal}"""@nl-BE-x-informal`,
                    `<${ConceptSnapshotTestBuilder.PROCEDURES[1].websites[1].id}> <http://purl.org/dc/terms/title> """${ConceptSnapshotTestBuilder.PROCEDURES[1].websites[1].title.nlGeneratedFormal}"""@nl-BE-x-generated-formal`,
                    `<${ConceptSnapshotTestBuilder.PROCEDURES[1].websites[1].id}> <http://purl.org/dc/terms/title> """${ConceptSnapshotTestBuilder.PROCEDURES[1].websites[1].title.nlGeneratedInformal}"""@nl-BE-x-generated-informal`,
                    `<${ConceptSnapshotTestBuilder.PROCEDURES[1].websites[1].id}> <http://purl.org/dc/terms/description> """${ConceptSnapshotTestBuilder.PROCEDURES[1].websites[1].description.en}"""@EN`,
                    `<${ConceptSnapshotTestBuilder.PROCEDURES[1].websites[1].id}> <http://purl.org/dc/terms/description> """${ConceptSnapshotTestBuilder.PROCEDURES[1].websites[1].description.nl}"""@NL`,
                    `<${ConceptSnapshotTestBuilder.PROCEDURES[1].websites[1].id}> <http://purl.org/dc/terms/description> """${ConceptSnapshotTestBuilder.PROCEDURES[1].websites[1].description.nlFormal}"""@nl-BE-x-formal`,
                    `<${ConceptSnapshotTestBuilder.PROCEDURES[1].websites[1].id}> <http://purl.org/dc/terms/description> """${ConceptSnapshotTestBuilder.PROCEDURES[1].websites[1].description.nlInformal}"""@nl-BE-x-informal`,
                    `<${ConceptSnapshotTestBuilder.PROCEDURES[1].websites[1].id}> <http://purl.org/dc/terms/description> """${ConceptSnapshotTestBuilder.PROCEDURES[1].websites[1].description.nlGeneratedFormal}"""@nl-BE-x-generated-formal`,
                    `<${ConceptSnapshotTestBuilder.PROCEDURES[1].websites[1].id}> <http://purl.org/dc/terms/description> """${ConceptSnapshotTestBuilder.PROCEDURES[1].websites[1].description.nlGeneratedInformal}"""@nl-BE-x-generated-informal`,
                    `<${ConceptSnapshotTestBuilder.PROCEDURES[1].websites[1].id}> <http://schema.org/url> """${ConceptSnapshotTestBuilder.PROCEDURES[1].websites[1].url}"""`,
                    `<${ConceptSnapshotTestBuilder.PROCEDURES[1].websites[1].id}> <http://www.w3.org/ns/shacl#order> """1"""^^<http://www.w3.org/2001/XMLSchema#integer>`,
                    `<${ConceptSnapshotTestBuilder.PROCEDURES[1].id}> <https://productencatalogus.data.vlaanderen.be/ns/ipdc-lpdc#hasWebsite> <${ConceptSnapshotTestBuilder.PROCEDURES[1].websites[0].id}>`,
                    `<${ConceptSnapshotTestBuilder.PROCEDURES[1].websites[0].id}> a <http://schema.org/WebSite>`,
                    `<${ConceptSnapshotTestBuilder.PROCEDURES[1].websites[0].id}> <http://purl.org/dc/terms/title> """${ConceptSnapshotTestBuilder.PROCEDURES[1].websites[0].title.en}"""@EN`,
                    `<${ConceptSnapshotTestBuilder.PROCEDURES[1].websites[0].id}> <http://purl.org/dc/terms/title> """${ConceptSnapshotTestBuilder.PROCEDURES[1].websites[0].title.nl}"""@NL`,
                    `<${ConceptSnapshotTestBuilder.PROCEDURES[1].websites[0].id}> <http://purl.org/dc/terms/title> """${ConceptSnapshotTestBuilder.PROCEDURES[1].websites[0].title.nlFormal}"""@nl-BE-x-formal`,
                    `<${ConceptSnapshotTestBuilder.PROCEDURES[1].websites[0].id}> <http://purl.org/dc/terms/title> """${ConceptSnapshotTestBuilder.PROCEDURES[1].websites[0].title.nlInformal}"""@nl-BE-x-informal`,
                    `<${ConceptSnapshotTestBuilder.PROCEDURES[1].websites[0].id}> <http://purl.org/dc/terms/title> """${ConceptSnapshotTestBuilder.PROCEDURES[1].websites[0].title.nlGeneratedFormal}"""@nl-BE-x-generated-formal`,
                    `<${ConceptSnapshotTestBuilder.PROCEDURES[1].websites[0].id}> <http://purl.org/dc/terms/title> """${ConceptSnapshotTestBuilder.PROCEDURES[1].websites[0].title.nlGeneratedInformal}"""@nl-BE-x-generated-informal`,
                    `<${ConceptSnapshotTestBuilder.PROCEDURES[1].websites[0].id}> <http://purl.org/dc/terms/description> """${ConceptSnapshotTestBuilder.PROCEDURES[1].websites[0].description.en}"""@EN`,
                    `<${ConceptSnapshotTestBuilder.PROCEDURES[1].websites[0].id}> <http://purl.org/dc/terms/description> """${ConceptSnapshotTestBuilder.PROCEDURES[1].websites[0].description.nl}"""@NL`,
                    `<${ConceptSnapshotTestBuilder.PROCEDURES[1].websites[0].id}> <http://purl.org/dc/terms/description> """${ConceptSnapshotTestBuilder.PROCEDURES[1].websites[0].description.nlFormal}"""@nl-BE-x-formal`,
                    `<${ConceptSnapshotTestBuilder.PROCEDURES[1].websites[0].id}> <http://purl.org/dc/terms/description> """${ConceptSnapshotTestBuilder.PROCEDURES[1].websites[0].description.nlInformal}"""@nl-BE-x-informal`,
                    `<${ConceptSnapshotTestBuilder.PROCEDURES[1].websites[0].id}> <http://purl.org/dc/terms/description> """${ConceptSnapshotTestBuilder.PROCEDURES[1].websites[0].description.nlGeneratedFormal}"""@nl-BE-x-generated-formal`,
                    `<${ConceptSnapshotTestBuilder.PROCEDURES[1].websites[0].id}> <http://purl.org/dc/terms/description> """${ConceptSnapshotTestBuilder.PROCEDURES[1].websites[0].description.nlGeneratedInformal}"""@nl-BE-x-generated-informal`,
                    `<${ConceptSnapshotTestBuilder.PROCEDURES[1].websites[0].id}> <http://schema.org/url> """${ConceptSnapshotTestBuilder.PROCEDURES[1].websites[0].url}"""`,
                    `<${ConceptSnapshotTestBuilder.PROCEDURES[1].websites[0].id}> <http://www.w3.org/ns/shacl#order> """0"""^^<http://www.w3.org/2001/XMLSchema#integer>`,
                    `<${conceptSnapshotId}> <http://purl.org/vocab/cpsv#follows> <${ConceptSnapshotTestBuilder.PROCEDURES[0].id}>`,
                    `<${ConceptSnapshotTestBuilder.PROCEDURES[0].id}> a <http://purl.org/vocab/cpsv#Rule>`,
                    `<${ConceptSnapshotTestBuilder.PROCEDURES[0].id}> <http://purl.org/dc/terms/title> """${ConceptSnapshotTestBuilder.PROCEDURES[0].title.en}"""@EN`,
                    `<${ConceptSnapshotTestBuilder.PROCEDURES[0].id}> <http://purl.org/dc/terms/title> """${ConceptSnapshotTestBuilder.PROCEDURES[0].title.nl}"""@NL`,
                    `<${ConceptSnapshotTestBuilder.PROCEDURES[0].id}> <http://purl.org/dc/terms/title> """${ConceptSnapshotTestBuilder.PROCEDURES[0].title.nlFormal}"""@nl-BE-x-formal`,
                    `<${ConceptSnapshotTestBuilder.PROCEDURES[0].id}> <http://purl.org/dc/terms/title> """${ConceptSnapshotTestBuilder.PROCEDURES[0].title.nlInformal}"""@nl-BE-x-informal`,
                    `<${ConceptSnapshotTestBuilder.PROCEDURES[0].id}> <http://purl.org/dc/terms/title> """${ConceptSnapshotTestBuilder.PROCEDURES[0].title.nlGeneratedFormal}"""@nl-BE-x-generated-formal`,
                    `<${ConceptSnapshotTestBuilder.PROCEDURES[0].id}> <http://purl.org/dc/terms/title> """${ConceptSnapshotTestBuilder.PROCEDURES[0].title.nlGeneratedInformal}"""@nl-BE-x-generated-informal`,
                    `<${ConceptSnapshotTestBuilder.PROCEDURES[0].id}> <http://purl.org/dc/terms/description> """${ConceptSnapshotTestBuilder.PROCEDURES[0].description.en}"""@EN`,
                    `<${ConceptSnapshotTestBuilder.PROCEDURES[0].id}> <http://purl.org/dc/terms/description> """${ConceptSnapshotTestBuilder.PROCEDURES[0].description.nl}"""@NL`,
                    `<${ConceptSnapshotTestBuilder.PROCEDURES[0].id}> <http://purl.org/dc/terms/description> """${ConceptSnapshotTestBuilder.PROCEDURES[0].description.nlFormal}"""@nl-BE-x-formal`,
                    `<${ConceptSnapshotTestBuilder.PROCEDURES[0].id}> <http://purl.org/dc/terms/description> """${ConceptSnapshotTestBuilder.PROCEDURES[0].description.nlInformal}"""@nl-BE-x-informal`,
                    `<${ConceptSnapshotTestBuilder.PROCEDURES[0].id}> <http://purl.org/dc/terms/description> """${ConceptSnapshotTestBuilder.PROCEDURES[0].description.nlGeneratedFormal}"""@nl-BE-x-generated-formal`,
                    `<${ConceptSnapshotTestBuilder.PROCEDURES[0].id}> <http://purl.org/dc/terms/description> """${ConceptSnapshotTestBuilder.PROCEDURES[0].description.nlGeneratedInformal}"""@nl-BE-x-generated-informal`,
                    `<${ConceptSnapshotTestBuilder.PROCEDURES[0].id}> <http://www.w3.org/ns/shacl#order> """0"""^^<http://www.w3.org/2001/XMLSchema#integer>`,
                    `<${ConceptSnapshotTestBuilder.PROCEDURES[0].id}> <https://productencatalogus.data.vlaanderen.be/ns/ipdc-lpdc#hasWebsite> <${ConceptSnapshotTestBuilder.PROCEDURES[0].websites[1].id}>`,
                    `<${ConceptSnapshotTestBuilder.PROCEDURES[0].websites[1].id}> a <http://schema.org/WebSite>`,
                    `<${ConceptSnapshotTestBuilder.PROCEDURES[0].websites[1].id}> <http://purl.org/dc/terms/title> """${ConceptSnapshotTestBuilder.PROCEDURES[0].websites[1].title.en}"""@EN`,
                    `<${ConceptSnapshotTestBuilder.PROCEDURES[0].websites[1].id}> <http://purl.org/dc/terms/title> """${ConceptSnapshotTestBuilder.PROCEDURES[0].websites[1].title.nl}"""@NL`,
                    `<${ConceptSnapshotTestBuilder.PROCEDURES[0].websites[1].id}> <http://purl.org/dc/terms/title> """${ConceptSnapshotTestBuilder.PROCEDURES[0].websites[1].title.nlFormal}"""@nl-BE-x-formal`,
                    `<${ConceptSnapshotTestBuilder.PROCEDURES[0].websites[1].id}> <http://purl.org/dc/terms/title> """${ConceptSnapshotTestBuilder.PROCEDURES[0].websites[1].title.nlInformal}"""@nl-BE-x-informal`,
                    `<${ConceptSnapshotTestBuilder.PROCEDURES[0].websites[1].id}> <http://purl.org/dc/terms/title> """${ConceptSnapshotTestBuilder.PROCEDURES[0].websites[1].title.nlGeneratedFormal}"""@nl-BE-x-generated-formal`,
                    `<${ConceptSnapshotTestBuilder.PROCEDURES[0].websites[1].id}> <http://purl.org/dc/terms/title> """${ConceptSnapshotTestBuilder.PROCEDURES[0].websites[1].title.nlGeneratedInformal}"""@nl-BE-x-generated-informal`,
                    `<${ConceptSnapshotTestBuilder.PROCEDURES[0].websites[1].id}> <http://purl.org/dc/terms/description> """${ConceptSnapshotTestBuilder.PROCEDURES[0].websites[1].description.en}"""@EN`,
                    `<${ConceptSnapshotTestBuilder.PROCEDURES[0].websites[1].id}> <http://purl.org/dc/terms/description> """${ConceptSnapshotTestBuilder.PROCEDURES[0].websites[1].description.nl}"""@NL`,
                    `<${ConceptSnapshotTestBuilder.PROCEDURES[0].websites[1].id}> <http://purl.org/dc/terms/description> """${ConceptSnapshotTestBuilder.PROCEDURES[0].websites[1].description.nlFormal}"""@nl-BE-x-formal`,
                    `<${ConceptSnapshotTestBuilder.PROCEDURES[0].websites[1].id}> <http://purl.org/dc/terms/description> """${ConceptSnapshotTestBuilder.PROCEDURES[0].websites[1].description.nlInformal}"""@nl-BE-x-informal`,
                    `<${ConceptSnapshotTestBuilder.PROCEDURES[0].websites[1].id}> <http://purl.org/dc/terms/description> """${ConceptSnapshotTestBuilder.PROCEDURES[0].websites[1].description.nlGeneratedFormal}"""@nl-BE-x-generated-formal`,
                    `<${ConceptSnapshotTestBuilder.PROCEDURES[0].websites[1].id}> <http://purl.org/dc/terms/description> """${ConceptSnapshotTestBuilder.PROCEDURES[0].websites[1].description.nlGeneratedInformal}"""@nl-BE-x-generated-informal`,
                    `<${ConceptSnapshotTestBuilder.PROCEDURES[0].websites[1].id}> <http://schema.org/url> """${ConceptSnapshotTestBuilder.PROCEDURES[0].websites[1].url}"""`,
                    `<${ConceptSnapshotTestBuilder.PROCEDURES[0].websites[1].id}> <http://www.w3.org/ns/shacl#order> """1"""^^<http://www.w3.org/2001/XMLSchema#integer>`,
                    `<${ConceptSnapshotTestBuilder.PROCEDURES[0].id}> <https://productencatalogus.data.vlaanderen.be/ns/ipdc-lpdc#hasWebsite> <${ConceptSnapshotTestBuilder.PROCEDURES[0].websites[0].id}>`,
                    `<${ConceptSnapshotTestBuilder.PROCEDURES[0].websites[0].id}> a <http://schema.org/WebSite>`,
                    `<${ConceptSnapshotTestBuilder.PROCEDURES[0].websites[0].id}> <http://purl.org/dc/terms/title> """${ConceptSnapshotTestBuilder.PROCEDURES[0].websites[0].title.en}"""@EN`,
                    `<${ConceptSnapshotTestBuilder.PROCEDURES[0].websites[0].id}> <http://purl.org/dc/terms/title> """${ConceptSnapshotTestBuilder.PROCEDURES[0].websites[0].title.nl}"""@NL`,
                    `<${ConceptSnapshotTestBuilder.PROCEDURES[0].websites[0].id}> <http://purl.org/dc/terms/title> """${ConceptSnapshotTestBuilder.PROCEDURES[0].websites[0].title.nlFormal}"""@nl-BE-x-formal`,
                    `<${ConceptSnapshotTestBuilder.PROCEDURES[0].websites[0].id}> <http://purl.org/dc/terms/title> """${ConceptSnapshotTestBuilder.PROCEDURES[0].websites[0].title.nlInformal}"""@nl-BE-x-informal`,
                    `<${ConceptSnapshotTestBuilder.PROCEDURES[0].websites[0].id}> <http://purl.org/dc/terms/title> """${ConceptSnapshotTestBuilder.PROCEDURES[0].websites[0].title.nlGeneratedFormal}"""@nl-BE-x-generated-formal`,
                    `<${ConceptSnapshotTestBuilder.PROCEDURES[0].websites[0].id}> <http://purl.org/dc/terms/title> """${ConceptSnapshotTestBuilder.PROCEDURES[0].websites[0].title.nlGeneratedInformal}"""@nl-BE-x-generated-informal`,
                    `<${ConceptSnapshotTestBuilder.PROCEDURES[0].websites[0].id}> <http://purl.org/dc/terms/description> """${ConceptSnapshotTestBuilder.PROCEDURES[0].websites[0].description.en}"""@EN`,
                    `<${ConceptSnapshotTestBuilder.PROCEDURES[0].websites[0].id}> <http://purl.org/dc/terms/description> """${ConceptSnapshotTestBuilder.PROCEDURES[0].websites[0].description.nl}"""@NL`,
                    `<${ConceptSnapshotTestBuilder.PROCEDURES[0].websites[0].id}> <http://purl.org/dc/terms/description> """${ConceptSnapshotTestBuilder.PROCEDURES[0].websites[0].description.nlFormal}"""@nl-BE-x-formal`,
                    `<${ConceptSnapshotTestBuilder.PROCEDURES[0].websites[0].id}> <http://purl.org/dc/terms/description> """${ConceptSnapshotTestBuilder.PROCEDURES[0].websites[0].description.nlInformal}"""@nl-BE-x-informal`,
                    `<${ConceptSnapshotTestBuilder.PROCEDURES[0].websites[0].id}> <http://purl.org/dc/terms/description> """${ConceptSnapshotTestBuilder.PROCEDURES[0].websites[0].description.nlGeneratedFormal}"""@nl-BE-x-generated-formal`,
                    `<${ConceptSnapshotTestBuilder.PROCEDURES[0].websites[0].id}> <http://purl.org/dc/terms/description> """${ConceptSnapshotTestBuilder.PROCEDURES[0].websites[0].description.nlGeneratedInformal}"""@nl-BE-x-generated-informal`,
                    `<${ConceptSnapshotTestBuilder.PROCEDURES[0].websites[0].id}> <http://schema.org/url> """${ConceptSnapshotTestBuilder.PROCEDURES[0].websites[0].url}"""`,
                    `<${ConceptSnapshotTestBuilder.PROCEDURES[0].websites[0].id}> <http://www.w3.org/ns/shacl#order> """0"""^^<http://www.w3.org/2001/XMLSchema#integer>`,
                    `<${conceptSnapshotId}> <http://www.w3.org/2000/01/rdf-schema#seeAlso> <${ConceptSnapshotTestBuilder.WEBSITES[1].id}>`,
                    `<${ConceptSnapshotTestBuilder.WEBSITES[1].id}> a <http://schema.org/WebSite>`,
                    `<${ConceptSnapshotTestBuilder.WEBSITES[1].id}> <http://purl.org/dc/terms/title> """${ConceptSnapshotTestBuilder.WEBSITES[1].title.en}"""@EN`,
                    `<${ConceptSnapshotTestBuilder.WEBSITES[1].id}> <http://purl.org/dc/terms/title> """${ConceptSnapshotTestBuilder.WEBSITES[1].title.nl}"""@NL`,
                    `<${ConceptSnapshotTestBuilder.WEBSITES[1].id}> <http://purl.org/dc/terms/title> """${ConceptSnapshotTestBuilder.WEBSITES[1].title.nlFormal}"""@nl-BE-x-formal`,
                    `<${ConceptSnapshotTestBuilder.WEBSITES[1].id}> <http://purl.org/dc/terms/title> """${ConceptSnapshotTestBuilder.WEBSITES[1].title.nlInformal}"""@nl-BE-x-informal`,
                    `<${ConceptSnapshotTestBuilder.WEBSITES[1].id}> <http://purl.org/dc/terms/title> """${ConceptSnapshotTestBuilder.WEBSITES[1].title.nlGeneratedFormal}"""@nl-BE-x-generated-formal`,
                    `<${ConceptSnapshotTestBuilder.WEBSITES[1].id}> <http://purl.org/dc/terms/title> """${ConceptSnapshotTestBuilder.WEBSITES[1].title.nlGeneratedInformal}"""@nl-BE-x-generated-informal`,
                    `<${ConceptSnapshotTestBuilder.WEBSITES[1].id}> <http://purl.org/dc/terms/description> """${ConceptSnapshotTestBuilder.WEBSITES[1].description.en}"""@EN`,
                    `<${ConceptSnapshotTestBuilder.WEBSITES[1].id}> <http://purl.org/dc/terms/description> """${ConceptSnapshotTestBuilder.WEBSITES[1].description.nl}"""@NL`,
                    `<${ConceptSnapshotTestBuilder.WEBSITES[1].id}> <http://purl.org/dc/terms/description> """${ConceptSnapshotTestBuilder.WEBSITES[1].description.nlFormal}"""@nl-BE-x-formal`,
                    `<${ConceptSnapshotTestBuilder.WEBSITES[1].id}> <http://purl.org/dc/terms/description> """${ConceptSnapshotTestBuilder.WEBSITES[1].description.nlInformal}"""@nl-BE-x-informal`,
                    `<${ConceptSnapshotTestBuilder.WEBSITES[1].id}> <http://purl.org/dc/terms/description> """${ConceptSnapshotTestBuilder.WEBSITES[1].description.nlGeneratedFormal}"""@nl-BE-x-generated-formal`,
                    `<${ConceptSnapshotTestBuilder.WEBSITES[1].id}> <http://purl.org/dc/terms/description> """${ConceptSnapshotTestBuilder.WEBSITES[1].description.nlGeneratedInformal}"""@nl-BE-x-generated-informal`,
                    `<${ConceptSnapshotTestBuilder.WEBSITES[1].id}> <http://schema.org/url> """${ConceptSnapshotTestBuilder.WEBSITES[1].url}"""`,
                    `<${ConceptSnapshotTestBuilder.WEBSITES[1].id}> <http://www.w3.org/ns/shacl#order> """1"""^^<http://www.w3.org/2001/XMLSchema#integer>`,
                    `<${conceptSnapshotId}> <http://www.w3.org/2000/01/rdf-schema#seeAlso> <${ConceptSnapshotTestBuilder.WEBSITES[0].id}>`,
                    `<${ConceptSnapshotTestBuilder.WEBSITES[0].id}> a <http://schema.org/WebSite>`,
                    `<${ConceptSnapshotTestBuilder.WEBSITES[0].id}> <http://purl.org/dc/terms/title> """${ConceptSnapshotTestBuilder.WEBSITES[0].title.en}"""@EN`,
                    `<${ConceptSnapshotTestBuilder.WEBSITES[0].id}> <http://purl.org/dc/terms/title> """${ConceptSnapshotTestBuilder.WEBSITES[0].title.nl}"""@NL`,
                    `<${ConceptSnapshotTestBuilder.WEBSITES[0].id}> <http://purl.org/dc/terms/title> """${ConceptSnapshotTestBuilder.WEBSITES[0].title.nlFormal}"""@nl-BE-x-formal`,
                    `<${ConceptSnapshotTestBuilder.WEBSITES[0].id}> <http://purl.org/dc/terms/title> """${ConceptSnapshotTestBuilder.WEBSITES[0].title.nlInformal}"""@nl-BE-x-informal`,
                    `<${ConceptSnapshotTestBuilder.WEBSITES[0].id}> <http://purl.org/dc/terms/title> """${ConceptSnapshotTestBuilder.WEBSITES[0].title.nlGeneratedFormal}"""@nl-BE-x-generated-formal`,
                    `<${ConceptSnapshotTestBuilder.WEBSITES[0].id}> <http://purl.org/dc/terms/title> """${ConceptSnapshotTestBuilder.WEBSITES[0].title.nlGeneratedInformal}"""@nl-BE-x-generated-informal`,
                    `<${ConceptSnapshotTestBuilder.WEBSITES[0].id}> <http://purl.org/dc/terms/description> """${ConceptSnapshotTestBuilder.WEBSITES[0].description.en}"""@EN`,
                    `<${ConceptSnapshotTestBuilder.WEBSITES[0].id}> <http://purl.org/dc/terms/description> """${ConceptSnapshotTestBuilder.WEBSITES[0].description.nl}"""@NL`,
                    `<${ConceptSnapshotTestBuilder.WEBSITES[0].id}> <http://purl.org/dc/terms/description> """${ConceptSnapshotTestBuilder.WEBSITES[0].description.nlFormal}"""@nl-BE-x-formal`,
                    `<${ConceptSnapshotTestBuilder.WEBSITES[0].id}> <http://purl.org/dc/terms/description> """${ConceptSnapshotTestBuilder.WEBSITES[0].description.nlInformal}"""@nl-BE-x-informal`,
                    `<${ConceptSnapshotTestBuilder.WEBSITES[0].id}> <http://purl.org/dc/terms/description> """${ConceptSnapshotTestBuilder.WEBSITES[0].description.nlGeneratedFormal}"""@nl-BE-x-generated-formal`,
                    `<${ConceptSnapshotTestBuilder.WEBSITES[0].id}> <http://purl.org/dc/terms/description> """${ConceptSnapshotTestBuilder.WEBSITES[0].description.nlGeneratedInformal}"""@nl-BE-x-generated-informal`,
                    `<${ConceptSnapshotTestBuilder.WEBSITES[0].id}> <http://schema.org/url> """${ConceptSnapshotTestBuilder.WEBSITES[0].url}"""`,
                    `<${ConceptSnapshotTestBuilder.WEBSITES[0].id}> <http://www.w3.org/ns/shacl#order> """0"""^^<http://www.w3.org/2001/XMLSchema#integer>`,
                    `<${conceptSnapshotId}> <http://data.europa.eu/m8g/hasCost> <${ConceptSnapshotTestBuilder.COSTS[1].id}>`,
                    `<${ConceptSnapshotTestBuilder.COSTS[1].id}> a <http://data.europa.eu/m8g/Cost>`,
                    `<${ConceptSnapshotTestBuilder.COSTS[1].id}> <http://purl.org/dc/terms/title> """${ConceptSnapshotTestBuilder.COSTS[1].title.en}"""@EN`,
                    `<${ConceptSnapshotTestBuilder.COSTS[1].id}> <http://purl.org/dc/terms/title> """${ConceptSnapshotTestBuilder.COSTS[1].title.nl}"""@NL`,
                    `<${ConceptSnapshotTestBuilder.COSTS[1].id}> <http://purl.org/dc/terms/title> """${ConceptSnapshotTestBuilder.COSTS[1].title.nlFormal}"""@nl-BE-x-formal`,
                    `<${ConceptSnapshotTestBuilder.COSTS[1].id}> <http://purl.org/dc/terms/title> """${ConceptSnapshotTestBuilder.COSTS[1].title.nlInformal}"""@nl-BE-x-informal`,
                    `<${ConceptSnapshotTestBuilder.COSTS[1].id}> <http://purl.org/dc/terms/title> """${ConceptSnapshotTestBuilder.COSTS[1].title.nlGeneratedFormal}"""@nl-BE-x-generated-formal`,
                    `<${ConceptSnapshotTestBuilder.COSTS[1].id}> <http://purl.org/dc/terms/title> """${ConceptSnapshotTestBuilder.COSTS[1].title.nlGeneratedInformal}"""@nl-BE-x-generated-informal`,
                    `<${ConceptSnapshotTestBuilder.COSTS[1].id}> <http://purl.org/dc/terms/description> """${ConceptSnapshotTestBuilder.COSTS[1].description.en}"""@EN`,
                    `<${ConceptSnapshotTestBuilder.COSTS[1].id}> <http://purl.org/dc/terms/description> """${ConceptSnapshotTestBuilder.COSTS[1].description.nl}"""@NL`,
                    `<${ConceptSnapshotTestBuilder.COSTS[1].id}> <http://purl.org/dc/terms/description> """${ConceptSnapshotTestBuilder.COSTS[1].description.nlFormal}"""@nl-BE-x-formal`,
                    `<${ConceptSnapshotTestBuilder.COSTS[1].id}> <http://purl.org/dc/terms/description> """${ConceptSnapshotTestBuilder.COSTS[1].description.nlInformal}"""@nl-BE-x-informal`,
                    `<${ConceptSnapshotTestBuilder.COSTS[1].id}> <http://purl.org/dc/terms/description> """${ConceptSnapshotTestBuilder.COSTS[1].description.nlGeneratedFormal}"""@nl-BE-x-generated-formal`,
                    `<${ConceptSnapshotTestBuilder.COSTS[1].id}> <http://purl.org/dc/terms/description> """${ConceptSnapshotTestBuilder.COSTS[1].description.nlGeneratedInformal}"""@nl-BE-x-generated-informal`,
                    `<${ConceptSnapshotTestBuilder.COSTS[1].id}> <http://www.w3.org/ns/shacl#order> """1"""^^<http://www.w3.org/2001/XMLSchema#integer>`,
                    `<${conceptSnapshotId}> <http://data.europa.eu/m8g/hasCost> <${ConceptSnapshotTestBuilder.COSTS[0].id}>`,
                    `<${ConceptSnapshotTestBuilder.COSTS[0].id}> a <http://data.europa.eu/m8g/Cost>`,
                    `<${ConceptSnapshotTestBuilder.COSTS[0].id}> <http://purl.org/dc/terms/title> """${ConceptSnapshotTestBuilder.COSTS[0].title.en}"""@EN`,
                    `<${ConceptSnapshotTestBuilder.COSTS[0].id}> <http://purl.org/dc/terms/title> """${ConceptSnapshotTestBuilder.COSTS[0].title.nl}"""@NL`,
                    `<${ConceptSnapshotTestBuilder.COSTS[0].id}> <http://purl.org/dc/terms/title> """${ConceptSnapshotTestBuilder.COSTS[0].title.nlFormal}"""@nl-BE-x-formal`,
                    `<${ConceptSnapshotTestBuilder.COSTS[0].id}> <http://purl.org/dc/terms/title> """${ConceptSnapshotTestBuilder.COSTS[0].title.nlInformal}"""@nl-BE-x-informal`,
                    `<${ConceptSnapshotTestBuilder.COSTS[0].id}> <http://purl.org/dc/terms/title> """${ConceptSnapshotTestBuilder.COSTS[0].title.nlGeneratedFormal}"""@nl-BE-x-generated-formal`,
                    `<${ConceptSnapshotTestBuilder.COSTS[0].id}> <http://purl.org/dc/terms/title> """${ConceptSnapshotTestBuilder.COSTS[0].title.nlGeneratedInformal}"""@nl-BE-x-generated-informal`,
                    `<${ConceptSnapshotTestBuilder.COSTS[0].id}> <http://purl.org/dc/terms/description> """${ConceptSnapshotTestBuilder.COSTS[0].description.en}"""@EN`,
                    `<${ConceptSnapshotTestBuilder.COSTS[0].id}> <http://purl.org/dc/terms/description> """${ConceptSnapshotTestBuilder.COSTS[0].description.nl}"""@NL`,
                    `<${ConceptSnapshotTestBuilder.COSTS[0].id}> <http://purl.org/dc/terms/description> """${ConceptSnapshotTestBuilder.COSTS[0].description.nlFormal}"""@nl-BE-x-formal`,
                    `<${ConceptSnapshotTestBuilder.COSTS[0].id}> <http://purl.org/dc/terms/description> """${ConceptSnapshotTestBuilder.COSTS[0].description.nlInformal}"""@nl-BE-x-informal`,
                    `<${ConceptSnapshotTestBuilder.COSTS[0].id}> <http://purl.org/dc/terms/description> """${ConceptSnapshotTestBuilder.COSTS[0].description.nlGeneratedFormal}"""@nl-BE-x-generated-formal`,
                    `<${ConceptSnapshotTestBuilder.COSTS[0].id}> <http://purl.org/dc/terms/description> """${ConceptSnapshotTestBuilder.COSTS[0].description.nlGeneratedInformal}"""@nl-BE-x-generated-informal`,
                    `<${ConceptSnapshotTestBuilder.COSTS[0].id}> <http://www.w3.org/ns/shacl#order> """0"""^^<http://www.w3.org/2001/XMLSchema#integer>`,
                    `<${conceptSnapshotId}> <http://purl.org/vocab/cpsv#produces> <${ConceptSnapshotTestBuilder.FINANCIAL_ADVANTAGES[1].id}>`,
                    `<${ConceptSnapshotTestBuilder.FINANCIAL_ADVANTAGES[1].id}> a <https://productencatalogus.data.vlaanderen.be/ns/ipdc-lpdc#FinancialAdvantage>`,
                    `<${ConceptSnapshotTestBuilder.FINANCIAL_ADVANTAGES[1].id}> <http://purl.org/dc/terms/title> """${ConceptSnapshotTestBuilder.FINANCIAL_ADVANTAGES[1].title.en}"""@EN`,
                    `<${ConceptSnapshotTestBuilder.FINANCIAL_ADVANTAGES[1].id}> <http://purl.org/dc/terms/title> """${ConceptSnapshotTestBuilder.FINANCIAL_ADVANTAGES[1].title.nl}"""@NL`,
                    `<${ConceptSnapshotTestBuilder.FINANCIAL_ADVANTAGES[1].id}> <http://purl.org/dc/terms/title> """${ConceptSnapshotTestBuilder.FINANCIAL_ADVANTAGES[1].title.nlFormal}"""@nl-BE-x-formal`,
                    `<${ConceptSnapshotTestBuilder.FINANCIAL_ADVANTAGES[1].id}> <http://purl.org/dc/terms/title> """${ConceptSnapshotTestBuilder.FINANCIAL_ADVANTAGES[1].title.nlInformal}"""@nl-BE-x-informal`,
                    `<${ConceptSnapshotTestBuilder.FINANCIAL_ADVANTAGES[1].id}> <http://purl.org/dc/terms/title> """${ConceptSnapshotTestBuilder.FINANCIAL_ADVANTAGES[1].title.nlGeneratedFormal}"""@nl-BE-x-generated-formal`,
                    `<${ConceptSnapshotTestBuilder.FINANCIAL_ADVANTAGES[1].id}> <http://purl.org/dc/terms/title> """${ConceptSnapshotTestBuilder.FINANCIAL_ADVANTAGES[1].title.nlGeneratedInformal}"""@nl-BE-x-generated-informal`,
                    `<${ConceptSnapshotTestBuilder.FINANCIAL_ADVANTAGES[1].id}> <http://purl.org/dc/terms/description> """${ConceptSnapshotTestBuilder.FINANCIAL_ADVANTAGES[1].description.en}"""@EN`,
                    `<${ConceptSnapshotTestBuilder.FINANCIAL_ADVANTAGES[1].id}> <http://purl.org/dc/terms/description> """${ConceptSnapshotTestBuilder.FINANCIAL_ADVANTAGES[1].description.nl}"""@NL`,
                    `<${ConceptSnapshotTestBuilder.FINANCIAL_ADVANTAGES[1].id}> <http://purl.org/dc/terms/description> """${ConceptSnapshotTestBuilder.FINANCIAL_ADVANTAGES[1].description.nlFormal}"""@nl-BE-x-formal`,
                    `<${ConceptSnapshotTestBuilder.FINANCIAL_ADVANTAGES[1].id}> <http://purl.org/dc/terms/description> """${ConceptSnapshotTestBuilder.FINANCIAL_ADVANTAGES[1].description.nlInformal}"""@nl-BE-x-informal`,
                    `<${ConceptSnapshotTestBuilder.FINANCIAL_ADVANTAGES[1].id}> <http://purl.org/dc/terms/description> """${ConceptSnapshotTestBuilder.FINANCIAL_ADVANTAGES[1].description.nlGeneratedFormal}"""@nl-BE-x-generated-formal`,
                    `<${ConceptSnapshotTestBuilder.FINANCIAL_ADVANTAGES[1].id}> <http://purl.org/dc/terms/description> """${ConceptSnapshotTestBuilder.FINANCIAL_ADVANTAGES[1].description.nlGeneratedInformal}"""@nl-BE-x-generated-informal`,
                    `<${ConceptSnapshotTestBuilder.FINANCIAL_ADVANTAGES[1].id}> <http://www.w3.org/ns/shacl#order> """1"""^^<http://www.w3.org/2001/XMLSchema#integer>`,
                    `<${conceptSnapshotId}> <http://purl.org/vocab/cpsv#produces> <${ConceptSnapshotTestBuilder.FINANCIAL_ADVANTAGES[0].id}>`,
                    `<${ConceptSnapshotTestBuilder.FINANCIAL_ADVANTAGES[0].id}> a <https://productencatalogus.data.vlaanderen.be/ns/ipdc-lpdc#FinancialAdvantage>`,
                    `<${ConceptSnapshotTestBuilder.FINANCIAL_ADVANTAGES[0].id}> <http://purl.org/dc/terms/title> """${ConceptSnapshotTestBuilder.FINANCIAL_ADVANTAGES[0].title.en}"""@EN`,
                    `<${ConceptSnapshotTestBuilder.FINANCIAL_ADVANTAGES[0].id}> <http://purl.org/dc/terms/title> """${ConceptSnapshotTestBuilder.FINANCIAL_ADVANTAGES[0].title.nl}"""@NL`,
                    `<${ConceptSnapshotTestBuilder.FINANCIAL_ADVANTAGES[0].id}> <http://purl.org/dc/terms/title> """${ConceptSnapshotTestBuilder.FINANCIAL_ADVANTAGES[0].title.nlFormal}"""@nl-BE-x-formal`,
                    `<${ConceptSnapshotTestBuilder.FINANCIAL_ADVANTAGES[0].id}> <http://purl.org/dc/terms/title> """${ConceptSnapshotTestBuilder.FINANCIAL_ADVANTAGES[0].title.nlInformal}"""@nl-BE-x-informal`,
                    `<${ConceptSnapshotTestBuilder.FINANCIAL_ADVANTAGES[0].id}> <http://purl.org/dc/terms/title> """${ConceptSnapshotTestBuilder.FINANCIAL_ADVANTAGES[0].title.nlGeneratedFormal}"""@nl-BE-x-generated-formal`,
                    `<${ConceptSnapshotTestBuilder.FINANCIAL_ADVANTAGES[0].id}> <http://purl.org/dc/terms/title> """${ConceptSnapshotTestBuilder.FINANCIAL_ADVANTAGES[0].title.nlGeneratedInformal}"""@nl-BE-x-generated-informal`,
                    `<${ConceptSnapshotTestBuilder.FINANCIAL_ADVANTAGES[0].id}> <http://purl.org/dc/terms/description> """${ConceptSnapshotTestBuilder.FINANCIAL_ADVANTAGES[0].description.en}"""@EN`,
                    `<${ConceptSnapshotTestBuilder.FINANCIAL_ADVANTAGES[0].id}> <http://purl.org/dc/terms/description> """${ConceptSnapshotTestBuilder.FINANCIAL_ADVANTAGES[0].description.nl}"""@NL`,
                    `<${ConceptSnapshotTestBuilder.FINANCIAL_ADVANTAGES[0].id}> <http://purl.org/dc/terms/description> """${ConceptSnapshotTestBuilder.FINANCIAL_ADVANTAGES[0].description.nlFormal}"""@nl-BE-x-formal`,
                    `<${ConceptSnapshotTestBuilder.FINANCIAL_ADVANTAGES[0].id}> <http://purl.org/dc/terms/description> """${ConceptSnapshotTestBuilder.FINANCIAL_ADVANTAGES[0].description.nlInformal}"""@nl-BE-x-informal`,
                    `<${ConceptSnapshotTestBuilder.FINANCIAL_ADVANTAGES[0].id}> <http://purl.org/dc/terms/description> """${ConceptSnapshotTestBuilder.FINANCIAL_ADVANTAGES[0].description.nlGeneratedFormal}"""@nl-BE-x-generated-formal`,
                    `<${ConceptSnapshotTestBuilder.FINANCIAL_ADVANTAGES[0].id}> <http://purl.org/dc/terms/description> """${ConceptSnapshotTestBuilder.FINANCIAL_ADVANTAGES[0].description.nlGeneratedInformal}"""@nl-BE-x-generated-informal`,
                    `<${ConceptSnapshotTestBuilder.FINANCIAL_ADVANTAGES[0].id}> <http://www.w3.org/ns/shacl#order> """0"""^^<http://www.w3.org/2001/XMLSchema#integer>`,
                    `<${conceptSnapshotId}> <http://purl.org/dc/terms/isVersionOf> <${ConceptSnapshotTestBuilder.IS_VERSION_OF_CONCEPT}>`,
                    `<${conceptSnapshotId}> <http://schema.org/dateCreated> """${ConceptSnapshotTestBuilder.DATE_CREATED.value}"""^^<http://www.w3.org/2001/XMLSchema#dateTime>`,
                    `<${conceptSnapshotId}> <http://schema.org/dateModified> """${ConceptSnapshotTestBuilder.DATE_MODIFIED.value}"""^^<http://www.w3.org/2001/XMLSchema#dateTime>`,
                    `<${conceptSnapshotId}> <http://www.w3.org/ns/prov#generatedAtTime> """${ConceptSnapshotTestBuilder.GENERATED_AT_TIME.value}"""^^<http://www.w3.org/2001/XMLSchema#dateTime>`,
                    `<${conceptSnapshotId}> <http://schema.org/identifier> """${id}"""`,
                    `<${conceptSnapshotId}> <http://schema.org/productID> """${ConceptSnapshotTestBuilder.PRODUCT_ID}"""`,
                    `<${conceptSnapshotId}> <https://productencatalogus.data.vlaanderen.be/ns/ipdc-lpdc#snapshotType> <${ConceptSnapshotTestBuilder.SNAPSHOT_TYPE}>`,
                    `<${conceptSnapshotId}> <https://productencatalogus.data.vlaanderen.be/ns/ipdc-lpdc#conceptTag> <${Array.from(ConceptSnapshotTestBuilder.CONCEPT_TAGS)[0]}>`,
                    `<${conceptSnapshotId}> <https://productencatalogus.data.vlaanderen.be/ns/ipdc-lpdc#conceptTag> <${Array.from(ConceptSnapshotTestBuilder.CONCEPT_TAGS)[1]}>`,
                ]);

            const actualConceptSnapshot = await repository.findById(conceptSnapshotId);

            expect(actualConceptSnapshot).toEqual(conceptSnapshot);
        });

        test('Verify minimal mappings - requirement without evidence', async () => {
            const conceptSnapshotId = ConceptSnapshotTestBuilder.buildIri(uuid());
            const requirementId = RequirementTestBuilder.buildIri(uuid());

            const conceptSnapshot =
                aMinimalConcept()
                    .withId(conceptSnapshotId)
                    .withRequirements([aMinimalRequirement().withId(requirementId).withEvidence(undefined).build()])
                    .build();

            await directDatabaseAccess.insertData(
                "http://mu.semte.ch/graphs/lpdc/ldes-data",
                [`<${conceptSnapshotId}> a <https://productencatalogus.data.vlaanderen.be/ns/ipdc-lpdc#ConceptualPublicService>`,
                        `<${conceptSnapshotId}> <http://vocab.belgif.be/ns/publicservice#hasRequirement> <${requirementId}>`,
                        `<${requirementId}> a <http://data.europa.eu/m8g/Requirement>`,
                        `<${requirementId}> <http://www.w3.org/ns/shacl#order> """0"""^^<http://www.w3.org/2001/XMLSchema#integer>`,
                ]);

            const actualConceptSnapshot = await repository.findById(conceptSnapshotId);

            expect(actualConceptSnapshot).toEqual(conceptSnapshot);
        });

        test('Verify minimal mappings - minimal requirement with minimal evidence', async () => {
            const conceptSnapshotId = ConceptSnapshotTestBuilder.buildIri(uuid());
            const requirementId = RequirementTestBuilder.buildIri(uuid());
            const evidenceId = EvidenceTestBuilder.buildIri(uuid());

            const conceptSnapshot =
                aMinimalConcept()
                    .withId(conceptSnapshotId)
                    .withRequirements([aMinimalRequirement().withId(requirementId).withEvidence(aMinimalEvidence().withId(evidenceId).build()).build()])
                    .build();

            await directDatabaseAccess.insertData(
                "http://mu.semte.ch/graphs/lpdc/ldes-data",
                [`<${conceptSnapshotId}> a <https://productencatalogus.data.vlaanderen.be/ns/ipdc-lpdc#ConceptualPublicService>`,
                    `<${conceptSnapshotId}> <http://vocab.belgif.be/ns/publicservice#hasRequirement> <${requirementId}>`,
                    `<${requirementId}> a <http://data.europa.eu/m8g/Requirement>`,
                    `<${requirementId}> <http://data.europa.eu/m8g/hasSupportingEvidence> <${evidenceId}>`,
                    `<${requirementId}> <http://www.w3.org/ns/shacl#order> """0"""^^<http://www.w3.org/2001/XMLSchema#integer>`,
                    `<${evidenceId}> a <http://data.europa.eu/m8g/Evidence>`,
                ]);

            const actualConceptSnapshot = await repository.findById(conceptSnapshotId);

            expect(actualConceptSnapshot).toEqual(conceptSnapshot);
        });

        test('Verify minimal mappings - procedure without websites', async () => {
            const conceptSnapshotId = ConceptSnapshotTestBuilder.buildIri(uuid());
            const procedureId = ProcedureTestBuilder.buildIri(uuid());

            const conceptSnapshot =
                aMinimalConcept()
                    .withId(conceptSnapshotId)
                    .withProcedures([aMinimalProcedure().withId(procedureId).withWebsites([]).build()])
                    .build();

            await directDatabaseAccess.insertData(
                "http://mu.semte.ch/graphs/lpdc/ldes-data",
                [`<${conceptSnapshotId}> a <https://productencatalogus.data.vlaanderen.be/ns/ipdc-lpdc#ConceptualPublicService>`,
                    `<${conceptSnapshotId}> <http://purl.org/vocab/cpsv#follows> <${procedureId}>`,
                    `<${procedureId}> a <http://purl.org/vocab/cpsv#Rule>`,
                    `<${procedureId}> <http://www.w3.org/ns/shacl#order> """0"""^^<http://www.w3.org/2001/XMLSchema#integer>`,
                ]);

            const actualConceptSnapshot = await repository.findById(conceptSnapshotId);

            expect(actualConceptSnapshot).toEqual(conceptSnapshot);
        });

        test('Verify minimal mappings - procedure with minimal website', async () => {
            const conceptSnapshotId = ConceptSnapshotTestBuilder.buildIri(uuid());
            const procedureId = ProcedureTestBuilder.buildIri(uuid());
            const websiteId = WebsiteTestBuilder.buildIri(uuid());

            const conceptSnapshot =
                aMinimalConcept()
                    .withId(conceptSnapshotId)
                    .withProcedures([aMinimalProcedure().withId(procedureId).withWebsites([aMinimalWebsite().withId(websiteId).build()]).build()])
                    .build();

            await directDatabaseAccess.insertData(
                "http://mu.semte.ch/graphs/lpdc/ldes-data",
                [`<${conceptSnapshotId}> a <https://productencatalogus.data.vlaanderen.be/ns/ipdc-lpdc#ConceptualPublicService>`,
                    `<${conceptSnapshotId}> <http://purl.org/vocab/cpsv#follows> <${procedureId}>`,
                    `<${procedureId}> a <http://purl.org/vocab/cpsv#Rule>`,
                    `<${procedureId}> <http://www.w3.org/ns/shacl#order> """0"""^^<http://www.w3.org/2001/XMLSchema#integer>`,
                    `<${procedureId}> <https://productencatalogus.data.vlaanderen.be/ns/ipdc-lpdc#hasWebsite> <${websiteId}>`,
                    `<${websiteId}> a <http://schema.org/WebSite>`,
                ]);

            const actualConceptSnapshot = await repository.findById(conceptSnapshotId);

            expect(actualConceptSnapshot).toEqual(conceptSnapshot);
        });


        for (const type of Object.values(ProductType)) {
            test(`Product type ${type} can be mapped`, async () => {
                const conceptSnapshot = aMinimalConcept().withType(type).build();
                await repository.save(conceptSnapshot);

                const actualConceptSnapshot = await repository.findById(conceptSnapshot.id);

                expect(actualConceptSnapshot).toEqual(conceptSnapshot);
            });
        }

        test('Unknown Product Type can not be mapped', async () => {
            const conceptSnapshotId = `https://ipdc.tni-vlaanderen.be/id/conceptsnapshot/${uuid()}`;

            await directDatabaseAccess.insertData(
                "http://mu.semte.ch/graphs/lpdc/ldes-data",
                [`<${conceptSnapshotId}> a <https://productencatalogus.data.vlaanderen.be/ns/ipdc-lpdc#ConceptualPublicService>`,
                    `<${conceptSnapshotId}> <http://purl.org/dc/terms/type> <https://productencatalogus.data.vlaanderen.be/id/concept/Type/UnknownProductType>`,
                ]);

            await expect(repository.findById(conceptSnapshotId)).rejects.toThrow(new Error(`could not map <https://productencatalogus.data.vlaanderen.be/id/concept/Type/UnknownProductType> for iri: <${conceptSnapshotId}>`));
        });

        for (const targetAudience of Object.values(TargetAudienceType)) {
            test(`TargetAudienceType ${targetAudience} can be mapped`, async () => {
                const conceptSnapshot = aMinimalConcept().withTargetAudiences(new Set([targetAudience])).build();
                await repository.save(conceptSnapshot);

                const actualConceptSnapshot = await repository.findById(conceptSnapshot.id);

                expect(actualConceptSnapshot).toEqual(conceptSnapshot);
            });
        }

        test('Unknown Target Audience Type can not be mapped', async () => {
            const conceptSnapshotId = `https://ipdc.tni-vlaanderen.be/id/conceptsnapshot/${uuid()}`;

            await directDatabaseAccess.insertData(
                "http://mu.semte.ch/graphs/lpdc/ldes-data",
                [`<${conceptSnapshotId}> a <https://productencatalogus.data.vlaanderen.be/ns/ipdc-lpdc#ConceptualPublicService>`,
                    `<${conceptSnapshotId}> <https://productencatalogus.data.vlaanderen.be/ns/ipdc-lpdc#targetAudience> <https://productencatalogus.data.vlaanderen.be/id/concept/Doelgroep/NonExistingTargetAudience>`,
                ]);

            await expect(repository.findById(conceptSnapshotId)).rejects.toThrow(new Error(`could not map <https://productencatalogus.data.vlaanderen.be/id/concept/Doelgroep/NonExistingTargetAudience> for iri: <${conceptSnapshotId}>`));
        });

        for (const theme of Object.values(ThemeType)) {
            test(`ThemeType ${theme} can be mapped`, async () => {
                const conceptSnapshot = aMinimalConcept().withThemes(new Set([theme])).build();
                await repository.save(conceptSnapshot);

                const actualConceptSnapshot = await repository.findById(conceptSnapshot.id);

                expect(actualConceptSnapshot).toEqual(conceptSnapshot);
            });
        }

        test('Unknown Theme type can not be mapped', async () => {
            const conceptSnapshotId = `https://ipdc.tni-vlaanderen.be/id/conceptsnapshot/${uuid()}`;

            await directDatabaseAccess.insertData(
                "http://mu.semte.ch/graphs/lpdc/ldes-data",
                [`<${conceptSnapshotId}> a <https://productencatalogus.data.vlaanderen.be/ns/ipdc-lpdc#ConceptualPublicService>`,
                    `<${conceptSnapshotId}> <http://data.europa.eu/m8g/thematicArea> <https://productencatalogus.data.vlaanderen.be/id/concept/Thema/NonExistingTheme>`,
                ]);

            await expect(repository.findById(conceptSnapshotId)).rejects.toThrow(new Error(`could not map <https://productencatalogus.data.vlaanderen.be/id/concept/Thema/NonExistingTheme> for iri: <${conceptSnapshotId}>`));
        });

        for (const competentAuthorityLevel of Object.values(CompetentAuthorityLevelType)) {
            test(`CompetentAuthorityLevelType ${competentAuthorityLevel} can be mapped`, async () => {
                const conceptSnapshot = aMinimalConcept().withCompetentAuthorityLevels(new Set([competentAuthorityLevel])).build();
                await repository.save(conceptSnapshot);

                const actualConceptSnapshot = await repository.findById(conceptSnapshot.id);

                expect(actualConceptSnapshot).toEqual(conceptSnapshot);
            });
        }

        test('Unknown Competent Authority Level type can not be mapped', async () => {
            const conceptSnapshotId = `https://ipdc.tni-vlaanderen.be/id/conceptsnapshot/${uuid()}`;

            await directDatabaseAccess.insertData(
                "http://mu.semte.ch/graphs/lpdc/ldes-data",
                [`<${conceptSnapshotId}> a <https://productencatalogus.data.vlaanderen.be/ns/ipdc-lpdc#ConceptualPublicService>`,
                    `<${conceptSnapshotId}> <https://productencatalogus.data.vlaanderen.be/ns/ipdc-lpdc#competentAuthorityLevel> <https://productencatalogus.data.vlaanderen.be/id/concept/BevoegdBestuursniveau/NonExistingCompetentAuthorityLevel>`,
                ]);

            await expect(repository.findById(conceptSnapshotId)).rejects.toThrow(new Error(`could not map <https://productencatalogus.data.vlaanderen.be/id/concept/BevoegdBestuursniveau/NonExistingCompetentAuthorityLevel> for iri: <${conceptSnapshotId}>`));
        });

        for (const executingAuthorityLevel of Object.values(ExecutingAuthorityLevelType)) {
            test(`ExecutingAuthorityLevelType ${executingAuthorityLevel} can be mapped`, async () => {
                const conceptSnapshot = aMinimalConcept().withExecutingAuthorityLevels(new Set([executingAuthorityLevel])).build();
                await repository.save(conceptSnapshot);

                const actualConceptSnapshot = await repository.findById(conceptSnapshot.id);

                expect(actualConceptSnapshot).toEqual(conceptSnapshot);
            });
        }

        test('Unknown ExecutingAuthorityLevelType can not be mapped', async () => {
            const conceptSnapshotId = `https://ipdc.tni-vlaanderen.be/id/conceptsnapshot/${uuid()}`;

            await directDatabaseAccess.insertData(
                "http://mu.semte.ch/graphs/lpdc/ldes-data",
                [`<${conceptSnapshotId}> a <https://productencatalogus.data.vlaanderen.be/ns/ipdc-lpdc#ConceptualPublicService>`,
                    `<${conceptSnapshotId}> <https://productencatalogus.data.vlaanderen.be/ns/ipdc-lpdc#executingAuthorityLevel> <https://productencatalogus.data.vlaanderen.be/id/concept/UitvoerendBestuursniveau/NonExistingExecutingAuthorityLevel>`,
                ]);

            await expect(repository.findById(conceptSnapshotId)).rejects.toThrow(new Error(`could not map <https://productencatalogus.data.vlaanderen.be/id/concept/UitvoerendBestuursniveau/NonExistingExecutingAuthorityLevel> for iri: <${conceptSnapshotId}>`));
        });

        for (const publicationMedium of Object.values(PublicationMediumType)) {
            test(`PublicationMediumType ${publicationMedium} can be mapped`, async () => {
                const conceptSnapshot = aMinimalConcept().withPublicationMedia(new Set([publicationMedium])).build();
                await repository.save(conceptSnapshot);

                const actualConceptSnapshot = await repository.findById(conceptSnapshot.id);

                expect(actualConceptSnapshot).toEqual(conceptSnapshot);
            });
        }

        test('Unknown PublicationMediumType can not be mapped', async () => {
            const conceptSnapshotId = `https://ipdc.tni-vlaanderen.be/id/conceptsnapshot/${uuid()}`;

            await directDatabaseAccess.insertData(
                "http://mu.semte.ch/graphs/lpdc/ldes-data",
                [`<${conceptSnapshotId}> a <https://productencatalogus.data.vlaanderen.be/ns/ipdc-lpdc#ConceptualPublicService>`,
                    `<${conceptSnapshotId}> <https://productencatalogus.data.vlaanderen.be/ns/ipdc-lpdc#publicationMedium> <https://productencatalogus.data.vlaanderen.be/id/concept/PublicatieKanaal/NonExistingPublicationMedium>`,
                ]);

            await expect(repository.findById(conceptSnapshotId)).rejects.toThrow(new Error(`could not map <https://productencatalogus.data.vlaanderen.be/id/concept/PublicatieKanaal/NonExistingPublicationMedium> for iri: <${conceptSnapshotId}>`));
        });

        for (const yourEuropeCategory of Object.values(YourEuropeCategoryType)) {
            test(`YourEuropeCategoryType ${yourEuropeCategory} can be mapped`, async () => {
                const conceptSnapshot = aMinimalConcept().withYourEuropeCategories(new Set([yourEuropeCategory])).build();
                await repository.save(conceptSnapshot);

                const actualConceptSnapshot = await repository.findById(conceptSnapshot.id);

                expect(actualConceptSnapshot).toEqual(conceptSnapshot);
            });
        }

        test('Unknown YourEuropeCategoryType can not be mapped', async () => {
            const conceptSnapshotId = `https://ipdc.tni-vlaanderen.be/id/conceptsnapshot/${uuid()}`;

            await directDatabaseAccess.insertData(
                "http://mu.semte.ch/graphs/lpdc/ldes-data",
                [`<${conceptSnapshotId}> a <https://productencatalogus.data.vlaanderen.be/ns/ipdc-lpdc#ConceptualPublicService>`,
                    `<${conceptSnapshotId}> <https://productencatalogus.data.vlaanderen.be/ns/ipdc-lpdc#yourEuropeCategory> <https://productencatalogus.data.vlaanderen.be/id/concept/YourEuropeCatagory/NonExistingYourEuropeCategory>`,
                ]);

            await expect(repository.findById(conceptSnapshotId)).rejects.toThrow(new Error(`could not map <https://productencatalogus.data.vlaanderen.be/id/concept/YourEuropeCatagory/NonExistingYourEuropeCategory> for iri: <${conceptSnapshotId}>`));
        });

        for (const type of Object.values(SnapshotType)) {
            test(`Snapshot type ${type} can be mapped`, async () => {
                const conceptSnapshot = aMinimalConcept().withSnapshotType(type).build();
                await repository.save(conceptSnapshot);

                const actualConceptSnapshot = await repository.findById(conceptSnapshot.id);

                expect(actualConceptSnapshot).toEqual(conceptSnapshot);
            });
        }

        test('Unknown Snapshot Type can not be mapped', async () => {
            const conceptSnapshotId = `https://ipdc.tni-vlaanderen.be/id/conceptsnapshot/${uuid()}`;

            await directDatabaseAccess.insertData(
                "http://mu.semte.ch/graphs/lpdc/ldes-data",
                [`<${conceptSnapshotId}> a <https://productencatalogus.data.vlaanderen.be/ns/ipdc-lpdc#ConceptualPublicService>`,
                    `<${conceptSnapshotId}> <https://productencatalogus.data.vlaanderen.be/ns/ipdc-lpdc#snapshotType> <https://productencatalogus.data.vlaanderen.be/id/concept/SnapshotType/NonExistingSnapshotType>`,
                ]);

            await expect(repository.findById(conceptSnapshotId)).rejects.toThrow(new Error(`could not map <https://productencatalogus.data.vlaanderen.be/id/concept/SnapshotType/NonExistingSnapshotType> for iri: <${conceptSnapshotId}>`));
        });

        for (const type of Object.values(ConceptTagType)) {
            test(`Concept Tag type ${type} can be mapped`, async () => {
                const conceptSnapshot = aMinimalConcept().withConceptTags(new Set([type])).build();
                await repository.save(conceptSnapshot);

                const actualConceptSnapshot = await repository.findById(conceptSnapshot.id);

                expect(actualConceptSnapshot).toEqual(conceptSnapshot);
            });
        }

        test('Unknown ConceptTag Type can not be mapped', async () => {
            const conceptSnapshotId = `https://ipdc.tni-vlaanderen.be/id/conceptsnapshot/${uuid()}`;

            await directDatabaseAccess.insertData(
                "http://mu.semte.ch/graphs/lpdc/ldes-data",
                [`<${conceptSnapshotId}> a <https://productencatalogus.data.vlaanderen.be/ns/ipdc-lpdc#ConceptualPublicService>`,
                    `<${conceptSnapshotId}> <https://productencatalogus.data.vlaanderen.be/ns/ipdc-lpdc#conceptTag> <https://productencatalogus.data.vlaanderen.be/id/concept/ConceptTag/NonExistingConceptTag>`,
                ]);

            await expect(repository.findById(conceptSnapshotId)).rejects.toThrow(new Error(`could not map <https://productencatalogus.data.vlaanderen.be/id/concept/ConceptTag/NonExistingConceptTag> for iri: <${conceptSnapshotId}>`));
        });
    });
});