import {TEST_SPARQL_ENDPOINT} from "../../test.config";
import {DirectDatabaseAccess} from "./direct-database-access";
import {uuid} from "../../../mu-helper";
import {
    aFullConceptVersie,
    aMinimalConceptVersie,
    ConceptVersieTestBuilder
} from "../../core/domain/concept-versie-test-builder";
import {ConceptVersieSparqlTestRepository} from "./concept-versie-sparql-test-repository";
import {TaalString} from "../../../src/core/domain/taal-string";
import {
    CompetentAuthorityLevelType,
    ExecutingAuthorityLevelType,
    ProductType,
    PublicationMediumType,
    TargetAudienceType,
    ThemeType,
    YourEuropeCategoryType
} from "../../../src/core/domain/concept-versie";
import {aMinimalRequirement, RequirementTestBuilder} from "../../core/domain/requirement-test-builder";
import {aMinimalEvidence, EvidenceTestBuilder} from "../../core/domain/evidence-test-builder";

describe('ConceptVersieRepository', () => {
    const repository = new ConceptVersieSparqlTestRepository(TEST_SPARQL_ENDPOINT);
    const directDatabaseAccess = new DirectDatabaseAccess(TEST_SPARQL_ENDPOINT);

    describe('findById', () => {

        test('When full concept versie exists with id, then return concept versie', async () => {
            const conceptVersie = aFullConceptVersie().build();
            await repository.save(conceptVersie);

            const anotherConceptVersie = aFullConceptVersie().build();
            await repository.save(anotherConceptVersie);

            const actualConceptVersie = await repository.findById(conceptVersie.id);

            expect(actualConceptVersie).toEqual(conceptVersie);
        });

        test('When minimal concept versie exists with id, then return concept versie', async () => {
            const conceptVersie = aMinimalConceptVersie().build();
            await repository.save(conceptVersie);

            const anotherConceptVersie = aMinimalConceptVersie().build();
            await repository.save(anotherConceptVersie);

            const actualConceptVersie = await repository.findById(conceptVersie.id);

            expect(actualConceptVersie).toEqual(conceptVersie);
        });

        test('When minimal concept versie with incomplete title exists with id, then return concept versie', async () => {
            const conceptVersie = aMinimalConceptVersie().withTitle(TaalString.of(undefined, ConceptVersieTestBuilder.TITLE_NL)).build();
            await repository.save(conceptVersie);

            const anotherConceptVersie = aMinimalConceptVersie().build();
            await repository.save(anotherConceptVersie);

            const actualConceptVersie = await repository.findById(conceptVersie.id);

            expect(actualConceptVersie).toEqual(conceptVersie);
        });

        test('When concept versie does not exist with id, then throw error', async () => {
            const conceptVersie = aFullConceptVersie().build();
            await repository.save(conceptVersie);

            const nonExistentConceptVersieId = ConceptVersieTestBuilder.buildIri('thisiddoesnotexist');

            await expect(repository.findById(nonExistentConceptVersieId)).rejects.toThrow(new Error(`no concept versie found for iri: ${nonExistentConceptVersieId}`));
        });
    });

    describe('Verify ontology and mapping', () => {

        test('Verify minimal mappings', async () => {
            const conceptVersieId = `https://ipdc.tni-vlaanderen.be/id/conceptsnapshot/${uuid()}`;

            const conceptVersie =
                aMinimalConceptVersie()
                    .withId(conceptVersieId)
                    .build();

            await directDatabaseAccess.insertData(
                "http://mu.semte.ch/graphs/lpdc/ldes-data",
                [`<${conceptVersieId}> a <https://productencatalogus.data.vlaanderen.be/ns/ipdc-lpdc#ConceptualPublicService>`]);

            const actualConceptVersie = await repository.findById(conceptVersieId);

            expect(actualConceptVersie).toEqual(conceptVersie);
        });

        test('Verify minimal mappings - with incomplete title', async () => {
            const conceptVersieId = `https://ipdc.tni-vlaanderen.be/id/conceptsnapshot/${uuid()}`;

            const conceptVersie =
                aMinimalConceptVersie()
                    .withId(conceptVersieId)
                    .withTitle(TaalString.of(undefined, ConceptVersieTestBuilder.TITLE_NL))
                    .build();

            await directDatabaseAccess.insertData(
                "http://mu.semte.ch/graphs/lpdc/ldes-data",
                [`<${conceptVersieId}> a <https://productencatalogus.data.vlaanderen.be/ns/ipdc-lpdc#ConceptualPublicService>`,
                    `<${conceptVersieId}> <http://purl.org/dc/terms/title> """${ConceptVersieTestBuilder.TITLE_NL}"""@nl`]);

            const actualConceptVersie = await repository.findById(conceptVersieId);

            expect(actualConceptVersie).toEqual(conceptVersie);
        });

        test('Verify minimal mappings - with start date but no end date', async () => {
            const conceptVersieId = `https://ipdc.tni-vlaanderen.be/id/conceptsnapshot/${uuid()}`;

            const conceptVersie =
                aMinimalConceptVersie()
                    .withId(conceptVersieId)
                    .withStartDate(ConceptVersieTestBuilder.START_DATE)
                    .withEndDate(undefined)
                    .build();

            await directDatabaseAccess.insertData(
                "http://mu.semte.ch/graphs/lpdc/ldes-data",
                [`<${conceptVersieId}> a <https://productencatalogus.data.vlaanderen.be/ns/ipdc-lpdc#ConceptualPublicService>`,
                    `<${conceptVersieId}> <http://schema.org/startDate> """${ConceptVersieTestBuilder.START_DATE.toISOString()}"""^^<http://www.w3.org/2001/XMLSchema#dateTime>`
                ]);

            const actualConceptVersie = await repository.findById(conceptVersieId);

            expect(actualConceptVersie).toEqual(conceptVersie);
        });

        test('Verify full mappings', async () => {
            const conceptVersieId = `https://ipdc.tni-vlaanderen.be/id/conceptsnapshot/${uuid()}`;

            const conceptVersie =
                aFullConceptVersie()
                    .withId(conceptVersieId)
                    .build();

            await directDatabaseAccess.insertData(
                "http://mu.semte.ch/graphs/lpdc/ldes-data",
                [`<${conceptVersieId}> a <https://productencatalogus.data.vlaanderen.be/ns/ipdc-lpdc#ConceptualPublicService>`,
                    `<${conceptVersieId}> <http://purl.org/dc/terms/title> """${ConceptVersieTestBuilder.TITLE_EN}"""@EN`,
                    `<${conceptVersieId}> <http://purl.org/dc/terms/title> """${ConceptVersieTestBuilder.TITLE_NL}"""@NL`,
                    `<${conceptVersieId}> <http://purl.org/dc/terms/title> """${ConceptVersieTestBuilder.TITLE_NL_FORMAL}"""@nl-BE-x-formal`,
                    `<${conceptVersieId}> <http://purl.org/dc/terms/title> """${ConceptVersieTestBuilder.TITLE_NL_INFORMAL}"""@nl-BE-x-informal`,
                    `<${conceptVersieId}> <http://purl.org/dc/terms/title> """${ConceptVersieTestBuilder.TITLE_NL_GENERATED_FORMAL}"""@nl-BE-x-generated-formal`,
                    `<${conceptVersieId}> <http://purl.org/dc/terms/title> """${ConceptVersieTestBuilder.TITLE_NL_GENERATED_INFORMAL}"""@nl-BE-x-generated-informal`,
                    `<${conceptVersieId}> <http://purl.org/dc/terms/title> """Concept Versie Title German language is ignored"""@de`,
                    `<${conceptVersieId}> <http://purl.org/dc/terms/title> """Concept Versie French language is ignored"""@fr`,
                    `<${conceptVersieId}> <http://purl.org/dc/terms/description> """${ConceptVersieTestBuilder.DESCRIPTION_EN}"""@EN`,
                    `<${conceptVersieId}> <http://purl.org/dc/terms/description> """${ConceptVersieTestBuilder.DESCRIPTION_NL}"""@NL`,
                    `<${conceptVersieId}> <http://purl.org/dc/terms/description> """${ConceptVersieTestBuilder.DESCRIPTION_NL_FORMAL}"""@nl-BE-x-formal`,
                    `<${conceptVersieId}> <http://purl.org/dc/terms/description> """${ConceptVersieTestBuilder.DESCRIPTION_NL_INFORMAL}"""@nl-BE-x-informal`,
                    `<${conceptVersieId}> <http://purl.org/dc/terms/description> """${ConceptVersieTestBuilder.DESCRIPTION_NL_GENERATED_FORMAL}"""@nl-BE-x-generated-formal`,
                    `<${conceptVersieId}> <http://purl.org/dc/terms/description> """${ConceptVersieTestBuilder.DESCRIPTION_NL_GENERATED_INFORMAL}"""@nl-BE-x-generated-informal`,
                    `<${conceptVersieId}> <http://purl.org/dc/terms/description> """Concept Versie Description German language is ignored"""@de`,
                    `<${conceptVersieId}> <http://purl.org/dc/terms/description> """Concept Versie Description language is ignored"""@fr`,
                    `<${conceptVersieId}> <https://productencatalogus.data.vlaanderen.be/ns/ipdc-lpdc#additionalDescription> """${ConceptVersieTestBuilder.ADDITIONAL_DESCRIPTION_EN}"""@EN`,
                    `<${conceptVersieId}> <https://productencatalogus.data.vlaanderen.be/ns/ipdc-lpdc#additionalDescription> """${ConceptVersieTestBuilder.ADDITIONAL_DESCRIPTION_NL}"""@NL`,
                    `<${conceptVersieId}> <https://productencatalogus.data.vlaanderen.be/ns/ipdc-lpdc#additionalDescription> """${ConceptVersieTestBuilder.ADDITIONAL_DESCRIPTION_NL_FORMAL}"""@nl-BE-x-formal`,
                    `<${conceptVersieId}> <https://productencatalogus.data.vlaanderen.be/ns/ipdc-lpdc#additionalDescription> """${ConceptVersieTestBuilder.ADDITIONAL_DESCRIPTION_NL_INFORMAL}"""@nl-BE-x-informal`,
                    `<${conceptVersieId}> <https://productencatalogus.data.vlaanderen.be/ns/ipdc-lpdc#additionalDescription> """${ConceptVersieTestBuilder.ADDITIONAL_DESCRIPTION_NL_GENERATED_FORMAL}"""@nl-BE-x-generated-formal`,
                    `<${conceptVersieId}> <https://productencatalogus.data.vlaanderen.be/ns/ipdc-lpdc#additionalDescription> """${ConceptVersieTestBuilder.ADDITIONAL_DESCRIPTION_NL_GENERATED_INFORMAL}"""@nl-BE-x-generated-informal`,
                    `<${conceptVersieId}> <https://productencatalogus.data.vlaanderen.be/ns/ipdc-lpdc#additionalDescription> """Concept Versie Additional Description German language is ignored"""@de`,
                    `<${conceptVersieId}> <https://productencatalogus.data.vlaanderen.be/ns/ipdc-lpdc#additionalDescription> """Concept Versie Additional Description language is ignored"""@fr`,
                    `<${conceptVersieId}> <https://productencatalogus.data.vlaanderen.be/ns/ipdc-lpdc#exception> """${ConceptVersieTestBuilder.EXCEPTION_EN}"""@EN`,
                    `<${conceptVersieId}> <https://productencatalogus.data.vlaanderen.be/ns/ipdc-lpdc#exception> """${ConceptVersieTestBuilder.EXCEPTION_NL}"""@NL`,
                    `<${conceptVersieId}> <https://productencatalogus.data.vlaanderen.be/ns/ipdc-lpdc#exception> """${ConceptVersieTestBuilder.EXCEPTION_NL_FORMAL}"""@nl-BE-x-formal`,
                    `<${conceptVersieId}> <https://productencatalogus.data.vlaanderen.be/ns/ipdc-lpdc#exception> """${ConceptVersieTestBuilder.EXCEPTION_NL_INFORMAL}"""@nl-BE-x-informal`,
                    `<${conceptVersieId}> <https://productencatalogus.data.vlaanderen.be/ns/ipdc-lpdc#exception> """${ConceptVersieTestBuilder.EXCEPTION_NL_GENERATED_FORMAL}"""@nl-BE-x-generated-formal`,
                    `<${conceptVersieId}> <https://productencatalogus.data.vlaanderen.be/ns/ipdc-lpdc#exception> """${ConceptVersieTestBuilder.EXCEPTION_NL_GENERATED_INFORMAL}"""@nl-BE-x-generated-informal`,
                    `<${conceptVersieId}> <https://productencatalogus.data.vlaanderen.be/ns/ipdc-lpdc#exception> """Concept Versie Exception German language is ignored"""@de`,
                    `<${conceptVersieId}> <https://productencatalogus.data.vlaanderen.be/ns/ipdc-lpdc#exception> """Concept Versie Exception language is ignored"""@fr`,
                    `<${conceptVersieId}> <https://productencatalogus.data.vlaanderen.be/ns/ipdc-lpdc#regulation> """${ConceptVersieTestBuilder.REGULATION_EN}"""@EN`,
                    `<${conceptVersieId}> <https://productencatalogus.data.vlaanderen.be/ns/ipdc-lpdc#regulation> """${ConceptVersieTestBuilder.REGULATION_NL}"""@NL`,
                    `<${conceptVersieId}> <https://productencatalogus.data.vlaanderen.be/ns/ipdc-lpdc#regulation> """${ConceptVersieTestBuilder.REGULATION_NL_FORMAL}"""@nl-BE-x-formal`,
                    `<${conceptVersieId}> <https://productencatalogus.data.vlaanderen.be/ns/ipdc-lpdc#regulation> """${ConceptVersieTestBuilder.REGULATION_NL_INFORMAL}"""@nl-BE-x-informal`,
                    `<${conceptVersieId}> <https://productencatalogus.data.vlaanderen.be/ns/ipdc-lpdc#regulation> """${ConceptVersieTestBuilder.REGULATION_NL_GENERATED_FORMAL}"""@nl-BE-x-generated-formal`,
                    `<${conceptVersieId}> <https://productencatalogus.data.vlaanderen.be/ns/ipdc-lpdc#regulation> """${ConceptVersieTestBuilder.REGULATION_NL_GENERATED_INFORMAL}"""@nl-BE-x-generated-informal`,
                    `<${conceptVersieId}> <https://productencatalogus.data.vlaanderen.be/ns/ipdc-lpdc#regulation> """Concept Versie Regulation German language is ignored"""@de`,
                    `<${conceptVersieId}> <https://productencatalogus.data.vlaanderen.be/ns/ipdc-lpdc#regulation> """Concept Versie Regulation  language is ignored"""@fr`,
                    `<${conceptVersieId}> <http://schema.org/startDate> """${ConceptVersieTestBuilder.START_DATE.toISOString()}"""^^<http://www.w3.org/2001/XMLSchema#dateTime>`,
                    `<${conceptVersieId}> <http://schema.org/endDate> """${ConceptVersieTestBuilder.END_DATE.toISOString()}"""^^<http://www.w3.org/2001/XMLSchema#dateTime>`,
                    `<${conceptVersieId}> <http://purl.org/dc/terms/type> <${ConceptVersieTestBuilder.TYPE}>`,
                    `<${conceptVersieId}> <https://productencatalogus.data.vlaanderen.be/ns/ipdc-lpdc#targetAudience> <${Array.from(ConceptVersieTestBuilder.TARGET_AUDIENCES)[0]}>`,
                    `<${conceptVersieId}> <https://productencatalogus.data.vlaanderen.be/ns/ipdc-lpdc#targetAudience> <${Array.from(ConceptVersieTestBuilder.TARGET_AUDIENCES)[1]}>`,
                    `<${conceptVersieId}> <https://productencatalogus.data.vlaanderen.be/ns/ipdc-lpdc#targetAudience> <${Array.from(ConceptVersieTestBuilder.TARGET_AUDIENCES)[2]}>`,
                    `<${conceptVersieId}> <http://data.europa.eu/m8g/thematicArea> <${Array.from(ConceptVersieTestBuilder.THEMES)[0]}>`,
                    `<${conceptVersieId}> <http://data.europa.eu/m8g/thematicArea> <${Array.from(ConceptVersieTestBuilder.THEMES)[1]}>`,
                    `<${conceptVersieId}> <http://data.europa.eu/m8g/thematicArea> <${Array.from(ConceptVersieTestBuilder.THEMES)[2]}>`,
                    `<${conceptVersieId}> <https://productencatalogus.data.vlaanderen.be/ns/ipdc-lpdc#competentAuthorityLevel> <${Array.from(ConceptVersieTestBuilder.COMPETENT_AUTHORITY_LEVELS)[0]}>`,
                    `<${conceptVersieId}> <https://productencatalogus.data.vlaanderen.be/ns/ipdc-lpdc#competentAuthorityLevel> <${Array.from(ConceptVersieTestBuilder.COMPETENT_AUTHORITY_LEVELS)[1]}>`,
                    `<${conceptVersieId}> <https://productencatalogus.data.vlaanderen.be/ns/ipdc-lpdc#competentAuthorityLevel> <${Array.from(ConceptVersieTestBuilder.COMPETENT_AUTHORITY_LEVELS)[2]}>`,
                    `<${conceptVersieId}> <http://data.europa.eu/m8g/hasCompetentAuthority> <${Array.from(ConceptVersieTestBuilder.COMPETENT_AUTHORITIES)[0]}>`,
                    `<${conceptVersieId}> <http://data.europa.eu/m8g/hasCompetentAuthority> <${Array.from(ConceptVersieTestBuilder.COMPETENT_AUTHORITIES)[1]}>`,
                    `<${conceptVersieId}> <http://data.europa.eu/m8g/hasCompetentAuthority> <${Array.from(ConceptVersieTestBuilder.COMPETENT_AUTHORITIES)[2]}>`,
                    `<${conceptVersieId}> <https://productencatalogus.data.vlaanderen.be/ns/ipdc-lpdc#executingAuthorityLevel> <${Array.from(ConceptVersieTestBuilder.EXECUTING_AUTHORITY_LEVELS)[0]}>`,
                    `<${conceptVersieId}> <https://productencatalogus.data.vlaanderen.be/ns/ipdc-lpdc#executingAuthorityLevel> <${Array.from(ConceptVersieTestBuilder.EXECUTING_AUTHORITY_LEVELS)[1]}>`,
                    `<${conceptVersieId}> <https://productencatalogus.data.vlaanderen.be/ns/ipdc-lpdc#executingAuthorityLevel> <${Array.from(ConceptVersieTestBuilder.EXECUTING_AUTHORITY_LEVELS)[2]}>`,
                    `<${conceptVersieId}> <https://productencatalogus.data.vlaanderen.be/ns/ipdc-lpdc#hasExecutingAuthority> <${Array.from(ConceptVersieTestBuilder.EXECUTING_AUTHORITIES)[0]}>`,
                    `<${conceptVersieId}> <https://productencatalogus.data.vlaanderen.be/ns/ipdc-lpdc#hasExecutingAuthority> <${Array.from(ConceptVersieTestBuilder.EXECUTING_AUTHORITIES)[1]}>`,
                    `<${conceptVersieId}> <https://productencatalogus.data.vlaanderen.be/ns/ipdc-lpdc#hasExecutingAuthority> <${Array.from(ConceptVersieTestBuilder.EXECUTING_AUTHORITIES)[2]}>`,
                    `<${conceptVersieId}> <https://productencatalogus.data.vlaanderen.be/ns/ipdc-lpdc#publicationMedium> <${Array.from(ConceptVersieTestBuilder.PUBLICATION_MEDIA)[0]}>`,
                    `<${conceptVersieId}> <https://productencatalogus.data.vlaanderen.be/ns/ipdc-lpdc#publicationMedium> <${Array.from(ConceptVersieTestBuilder.PUBLICATION_MEDIA)[1]}>`,
                    `<${conceptVersieId}> <https://productencatalogus.data.vlaanderen.be/ns/ipdc-lpdc#yourEuropeCategory> <${Array.from(ConceptVersieTestBuilder.YOUR_EUROPE_CATEGORIES)[0]}>`,
                    `<${conceptVersieId}> <https://productencatalogus.data.vlaanderen.be/ns/ipdc-lpdc#yourEuropeCategory> <${Array.from(ConceptVersieTestBuilder.YOUR_EUROPE_CATEGORIES)[1]}>`,
                    `<${conceptVersieId}> <https://productencatalogus.data.vlaanderen.be/ns/ipdc-lpdc#yourEuropeCategory> <${Array.from(ConceptVersieTestBuilder.YOUR_EUROPE_CATEGORIES)[2]}>`,
                    `<${conceptVersieId}> <http://www.w3.org/ns/dcat#keyword> """${Array.from(ConceptVersieTestBuilder.KEYWORDS)[0].en}"""@en`,
                    `<${conceptVersieId}> <http://www.w3.org/ns/dcat#keyword> """${Array.from(ConceptVersieTestBuilder.KEYWORDS)[1].nl}"""@nl`,
                    `<${conceptVersieId}> <http://www.w3.org/ns/dcat#keyword> """${Array.from(ConceptVersieTestBuilder.KEYWORDS)[2].nl}"""@nl`,
                    `<${conceptVersieId}> <http://www.w3.org/ns/dcat#keyword> """${Array.from(ConceptVersieTestBuilder.KEYWORDS)[3].en}"""@en`,
                    `<${conceptVersieId}> <http://vocab.belgif.be/ns/publicservice#hasRequirement> <${ConceptVersieTestBuilder.REQUIREMENTS[1].id}>`,
                    `<${ConceptVersieTestBuilder.REQUIREMENTS[1].id}> a <http://data.europa.eu/m8g/Requirement>`,
                    `<${ConceptVersieTestBuilder.REQUIREMENTS[1].id}> <http://purl.org/dc/terms/title> """${ConceptVersieTestBuilder.REQUIREMENTS[1].title.en}"""@EN`,
                    `<${ConceptVersieTestBuilder.REQUIREMENTS[1].id}> <http://purl.org/dc/terms/title> """${ConceptVersieTestBuilder.REQUIREMENTS[1].title.nl}"""@NL`,
                    `<${ConceptVersieTestBuilder.REQUIREMENTS[1].id}> <http://purl.org/dc/terms/title> """${ConceptVersieTestBuilder.REQUIREMENTS[1].title.nlFormal}"""@nl-BE-x-formal`,
                    `<${ConceptVersieTestBuilder.REQUIREMENTS[1].id}> <http://purl.org/dc/terms/title> """${ConceptVersieTestBuilder.REQUIREMENTS[1].title.nlInformal}"""@nl-BE-x-informal`,
                    `<${ConceptVersieTestBuilder.REQUIREMENTS[1].id}> <http://purl.org/dc/terms/title> """${ConceptVersieTestBuilder.REQUIREMENTS[1].title.nlGeneratedFormal}"""@nl-BE-x-generated-formal`,
                    `<${ConceptVersieTestBuilder.REQUIREMENTS[1].id}> <http://purl.org/dc/terms/title> """${ConceptVersieTestBuilder.REQUIREMENTS[1].title.nlGeneratedInformal}"""@nl-BE-x-generated-informal`,
                    `<${ConceptVersieTestBuilder.REQUIREMENTS[1].id}> <http://purl.org/dc/terms/description> """${ConceptVersieTestBuilder.REQUIREMENTS[1].description.en}"""@EN`,
                    `<${ConceptVersieTestBuilder.REQUIREMENTS[1].id}> <http://purl.org/dc/terms/description> """${ConceptVersieTestBuilder.REQUIREMENTS[1].description.nl}"""@NL`,
                    `<${ConceptVersieTestBuilder.REQUIREMENTS[1].id}> <http://purl.org/dc/terms/description> """${ConceptVersieTestBuilder.REQUIREMENTS[1].description.nlFormal}"""@nl-BE-x-formal`,
                    `<${ConceptVersieTestBuilder.REQUIREMENTS[1].id}> <http://purl.org/dc/terms/description> """${ConceptVersieTestBuilder.REQUIREMENTS[1].description.nlInformal}"""@nl-BE-x-informal`,
                    `<${ConceptVersieTestBuilder.REQUIREMENTS[1].id}> <http://purl.org/dc/terms/description> """${ConceptVersieTestBuilder.REQUIREMENTS[1].description.nlGeneratedFormal}"""@nl-BE-x-generated-formal`,
                    `<${ConceptVersieTestBuilder.REQUIREMENTS[1].id}> <http://purl.org/dc/terms/description> """${ConceptVersieTestBuilder.REQUIREMENTS[1].description.nlGeneratedInformal}"""@nl-BE-x-generated-informal`,
                    `<${ConceptVersieTestBuilder.REQUIREMENTS[1].id}> <http://www.w3.org/ns/shacl#order> """1"""^^<http://www.w3.org/2001/XMLSchema#integer>`,
                    `<${ConceptVersieTestBuilder.REQUIREMENTS[1].id}> <http://data.europa.eu/m8g/hasSupportingEvidence> <${ConceptVersieTestBuilder.REQUIREMENTS[1].evidence.id}>`,
                    `<${ConceptVersieTestBuilder.REQUIREMENTS[1].evidence.id}> a <http://data.europa.eu/m8g/Evidence>`,
                    `<${ConceptVersieTestBuilder.REQUIREMENTS[1].evidence.id}> <http://purl.org/dc/terms/title> """${ConceptVersieTestBuilder.REQUIREMENTS[1].evidence.title.en}"""@EN`,
                    `<${ConceptVersieTestBuilder.REQUIREMENTS[1].evidence.id}> <http://purl.org/dc/terms/title> """${ConceptVersieTestBuilder.REQUIREMENTS[1].evidence.title.nl}"""@NL`,
                    `<${ConceptVersieTestBuilder.REQUIREMENTS[1].evidence.id}> <http://purl.org/dc/terms/title> """${ConceptVersieTestBuilder.REQUIREMENTS[1].evidence.title.nlFormal}"""@nl-BE-x-formal`,
                    `<${ConceptVersieTestBuilder.REQUIREMENTS[1].evidence.id}> <http://purl.org/dc/terms/title> """${ConceptVersieTestBuilder.REQUIREMENTS[1].evidence.title.nlInformal}"""@nl-BE-x-informal`,
                    `<${ConceptVersieTestBuilder.REQUIREMENTS[1].evidence.id}> <http://purl.org/dc/terms/title> """${ConceptVersieTestBuilder.REQUIREMENTS[1].evidence.title.nlGeneratedFormal}"""@nl-BE-x-generated-formal`,
                    `<${ConceptVersieTestBuilder.REQUIREMENTS[1].evidence.id}> <http://purl.org/dc/terms/title> """${ConceptVersieTestBuilder.REQUIREMENTS[1].evidence.title.nlGeneratedInformal}"""@nl-BE-x-generated-informal`,
                    `<${ConceptVersieTestBuilder.REQUIREMENTS[1].evidence.id}> <http://purl.org/dc/terms/description> """${ConceptVersieTestBuilder.REQUIREMENTS[1].evidence.description.en}"""@EN`,
                    `<${ConceptVersieTestBuilder.REQUIREMENTS[1].evidence.id}> <http://purl.org/dc/terms/description> """${ConceptVersieTestBuilder.REQUIREMENTS[1].evidence.description.nl}"""@NL`,
                    `<${ConceptVersieTestBuilder.REQUIREMENTS[1].evidence.id}> <http://purl.org/dc/terms/description> """${ConceptVersieTestBuilder.REQUIREMENTS[1].evidence.description.nlFormal}"""@nl-BE-x-formal`,
                    `<${ConceptVersieTestBuilder.REQUIREMENTS[1].evidence.id}> <http://purl.org/dc/terms/description> """${ConceptVersieTestBuilder.REQUIREMENTS[1].evidence.description.nlInformal}"""@nl-BE-x-informal`,
                    `<${ConceptVersieTestBuilder.REQUIREMENTS[1].evidence.id}> <http://purl.org/dc/terms/description> """${ConceptVersieTestBuilder.REQUIREMENTS[1].evidence.description.nlGeneratedFormal}"""@nl-BE-x-generated-formal`,
                    `<${ConceptVersieTestBuilder.REQUIREMENTS[1].evidence.id}> <http://purl.org/dc/terms/description> """${ConceptVersieTestBuilder.REQUIREMENTS[1].evidence.description.nlGeneratedInformal}"""@nl-BE-x-generated-informal`,
                    `<${conceptVersieId}> <http://vocab.belgif.be/ns/publicservice#hasRequirement> <${ConceptVersieTestBuilder.REQUIREMENTS[0].id}>`,
                    `<${ConceptVersieTestBuilder.REQUIREMENTS[0].id}> a <http://data.europa.eu/m8g/Requirement>`,
                    `<${ConceptVersieTestBuilder.REQUIREMENTS[0].id}> <http://purl.org/dc/terms/title> """${ConceptVersieTestBuilder.REQUIREMENTS[0].title.en}"""@EN`,
                    `<${ConceptVersieTestBuilder.REQUIREMENTS[0].id}> <http://purl.org/dc/terms/title> """${ConceptVersieTestBuilder.REQUIREMENTS[0].title.nl}"""@NL`,
                    `<${ConceptVersieTestBuilder.REQUIREMENTS[0].id}> <http://purl.org/dc/terms/title> """${ConceptVersieTestBuilder.REQUIREMENTS[0].title.nlFormal}"""@nl-BE-x-formal`,
                    `<${ConceptVersieTestBuilder.REQUIREMENTS[0].id}> <http://purl.org/dc/terms/title> """${ConceptVersieTestBuilder.REQUIREMENTS[0].title.nlInformal}"""@nl-BE-x-informal`,
                    `<${ConceptVersieTestBuilder.REQUIREMENTS[0].id}> <http://purl.org/dc/terms/title> """${ConceptVersieTestBuilder.REQUIREMENTS[0].title.nlGeneratedFormal}"""@nl-BE-x-generated-formal`,
                    `<${ConceptVersieTestBuilder.REQUIREMENTS[0].id}> <http://purl.org/dc/terms/title> """${ConceptVersieTestBuilder.REQUIREMENTS[0].title.nlGeneratedInformal}"""@nl-BE-x-generated-informal`,
                    `<${ConceptVersieTestBuilder.REQUIREMENTS[0].id}> <http://purl.org/dc/terms/description> """${ConceptVersieTestBuilder.REQUIREMENTS[0].description.en}"""@EN`,
                    `<${ConceptVersieTestBuilder.REQUIREMENTS[0].id}> <http://purl.org/dc/terms/description> """${ConceptVersieTestBuilder.REQUIREMENTS[0].description.nl}"""@NL`,
                    `<${ConceptVersieTestBuilder.REQUIREMENTS[0].id}> <http://purl.org/dc/terms/description> """${ConceptVersieTestBuilder.REQUIREMENTS[0].description.nlFormal}"""@nl-BE-x-formal`,
                    `<${ConceptVersieTestBuilder.REQUIREMENTS[0].id}> <http://purl.org/dc/terms/description> """${ConceptVersieTestBuilder.REQUIREMENTS[0].description.nlInformal}"""@nl-BE-x-informal`,
                    `<${ConceptVersieTestBuilder.REQUIREMENTS[0].id}> <http://purl.org/dc/terms/description> """${ConceptVersieTestBuilder.REQUIREMENTS[0].description.nlGeneratedFormal}"""@nl-BE-x-generated-formal`,
                    `<${ConceptVersieTestBuilder.REQUIREMENTS[0].id}> <http://purl.org/dc/terms/description> """${ConceptVersieTestBuilder.REQUIREMENTS[0].description.nlGeneratedInformal}"""@nl-BE-x-generated-informal`,
                    `<${ConceptVersieTestBuilder.REQUIREMENTS[0].id}> <http://www.w3.org/ns/shacl#order> """0"""^^<http://www.w3.org/2001/XMLSchema#integer>`,
                    `<${ConceptVersieTestBuilder.REQUIREMENTS[0].id}> <http://data.europa.eu/m8g/hasSupportingEvidence> <${ConceptVersieTestBuilder.REQUIREMENTS[0].evidence.id}>`,
                    `<${ConceptVersieTestBuilder.REQUIREMENTS[0].evidence.id}> a <http://data.europa.eu/m8g/Evidence>`,
                    `<${ConceptVersieTestBuilder.REQUIREMENTS[0].evidence.id}> <http://purl.org/dc/terms/title> """${ConceptVersieTestBuilder.REQUIREMENTS[0].evidence.title.en}"""@EN`,
                    `<${ConceptVersieTestBuilder.REQUIREMENTS[0].evidence.id}> <http://purl.org/dc/terms/title> """${ConceptVersieTestBuilder.REQUIREMENTS[0].evidence.title.nl}"""@NL`,
                    `<${ConceptVersieTestBuilder.REQUIREMENTS[0].evidence.id}> <http://purl.org/dc/terms/title> """${ConceptVersieTestBuilder.REQUIREMENTS[0].evidence.title.nlFormal}"""@nl-BE-x-formal`,
                    `<${ConceptVersieTestBuilder.REQUIREMENTS[0].evidence.id}> <http://purl.org/dc/terms/title> """${ConceptVersieTestBuilder.REQUIREMENTS[0].evidence.title.nlInformal}"""@nl-BE-x-informal`,
                    `<${ConceptVersieTestBuilder.REQUIREMENTS[0].evidence.id}> <http://purl.org/dc/terms/title> """${ConceptVersieTestBuilder.REQUIREMENTS[0].evidence.title.nlGeneratedFormal}"""@nl-BE-x-generated-formal`,
                    `<${ConceptVersieTestBuilder.REQUIREMENTS[0].evidence.id}> <http://purl.org/dc/terms/title> """${ConceptVersieTestBuilder.REQUIREMENTS[0].evidence.title.nlGeneratedInformal}"""@nl-BE-x-generated-informal`,
                    `<${ConceptVersieTestBuilder.REQUIREMENTS[0].evidence.id}> <http://purl.org/dc/terms/description> """${ConceptVersieTestBuilder.REQUIREMENTS[0].evidence.description.en}"""@EN`,
                    `<${ConceptVersieTestBuilder.REQUIREMENTS[0].evidence.id}> <http://purl.org/dc/terms/description> """${ConceptVersieTestBuilder.REQUIREMENTS[0].evidence.description.nl}"""@NL`,
                    `<${ConceptVersieTestBuilder.REQUIREMENTS[0].evidence.id}> <http://purl.org/dc/terms/description> """${ConceptVersieTestBuilder.REQUIREMENTS[0].evidence.description.nlFormal}"""@nl-BE-x-formal`,
                    `<${ConceptVersieTestBuilder.REQUIREMENTS[0].evidence.id}> <http://purl.org/dc/terms/description> """${ConceptVersieTestBuilder.REQUIREMENTS[0].evidence.description.nlInformal}"""@nl-BE-x-informal`,
                    `<${ConceptVersieTestBuilder.REQUIREMENTS[0].evidence.id}> <http://purl.org/dc/terms/description> """${ConceptVersieTestBuilder.REQUIREMENTS[0].evidence.description.nlGeneratedFormal}"""@nl-BE-x-generated-formal`,
                    `<${ConceptVersieTestBuilder.REQUIREMENTS[0].evidence.id}> <http://purl.org/dc/terms/description> """${ConceptVersieTestBuilder.REQUIREMENTS[0].evidence.description.nlGeneratedInformal}"""@nl-BE-x-generated-informal`,
                ]);

            //TODO LPDC-916: more realistic to also save the 'concept type? of an enum' in the database ? e.g. type, etc. (but that should be a separate query then ...)

            const actualConceptVersie = await repository.findById(conceptVersieId);

            expect(actualConceptVersie).toEqual(conceptVersie);
        });

        test('Verify minimal mappings - requirement without evidence', async () => {
            const conceptVersieId = ConceptVersieTestBuilder.buildIri(uuid());
            const requirementId = RequirementTestBuilder.buildIri(uuid());

            const conceptVersie =
                aMinimalConceptVersie()
                    .withId(conceptVersieId)
                    .withRequirements([aMinimalRequirement().withId(requirementId).withEvidence(undefined).build()])
                    .build();

            await directDatabaseAccess.insertData(
                "http://mu.semte.ch/graphs/lpdc/ldes-data",
                [`<${conceptVersieId}> a <https://productencatalogus.data.vlaanderen.be/ns/ipdc-lpdc#ConceptualPublicService>`,
                        `<${conceptVersieId}> <http://vocab.belgif.be/ns/publicservice#hasRequirement> <${requirementId}>`,
                        `<${requirementId}> a <http://data.europa.eu/m8g/Requirement>`,
                        `<${requirementId}> <http://www.w3.org/ns/shacl#order> """0"""^^<http://www.w3.org/2001/XMLSchema#integer>`,
                ]);

            const actualConceptVersie = await repository.findById(conceptVersieId);

            expect(actualConceptVersie).toEqual(conceptVersie);
        });

        test('Verify minimal mappings - minimal requirement with minimal evidence', async () => {
            const conceptVersieId = ConceptVersieTestBuilder.buildIri(uuid());
            const requirementId = RequirementTestBuilder.buildIri(uuid());
            const evidenceId = EvidenceTestBuilder.buildIri(uuid());

            const conceptVersie =
                aMinimalConceptVersie()
                    .withId(conceptVersieId)
                    .withRequirements([aMinimalRequirement().withId(requirementId).withEvidence(aMinimalEvidence().withId(evidenceId).build()).build()])
                    .build();

            await directDatabaseAccess.insertData(
                "http://mu.semte.ch/graphs/lpdc/ldes-data",
                [`<${conceptVersieId}> a <https://productencatalogus.data.vlaanderen.be/ns/ipdc-lpdc#ConceptualPublicService>`,
                    `<${conceptVersieId}> <http://vocab.belgif.be/ns/publicservice#hasRequirement> <${requirementId}>`,
                    `<${requirementId}> a <http://data.europa.eu/m8g/Requirement>`,
                    `<${requirementId}> <http://data.europa.eu/m8g/hasSupportingEvidence> <${evidenceId}>`,
                    `<${requirementId}> <http://www.w3.org/ns/shacl#order> """0"""^^<http://www.w3.org/2001/XMLSchema#integer>`,
                    `<${evidenceId}> a <http://data.europa.eu/m8g/Evidence>`,
                ]);

            const actualConceptVersie = await repository.findById(conceptVersieId);

            expect(actualConceptVersie).toEqual(conceptVersie);
        });


        for (const type of Object.values(ProductType)) {
            test(`Product type ${type} can be mapped`, async () => {
                const conceptVersie = aMinimalConceptVersie().withType(type).build();
                await repository.save(conceptVersie);

                const actualConceptVersie = await repository.findById(conceptVersie.id);

                expect(actualConceptVersie).toEqual(conceptVersie);
            });
        }

        test('Unknown Product Type can not be mapped', async () => {
            const conceptVersieId = `https://ipdc.tni-vlaanderen.be/id/conceptsnapshot/${uuid()}`;

            await directDatabaseAccess.insertData(
                "http://mu.semte.ch/graphs/lpdc/ldes-data",
                [`<${conceptVersieId}> a <https://productencatalogus.data.vlaanderen.be/ns/ipdc-lpdc#ConceptualPublicService>`,
                    `<${conceptVersieId}> <http://purl.org/dc/terms/type> <https://productencatalogus.data.vlaanderen.be/id/concept/Type/UnknownProductType>`,
                ]);

            await expect(repository.findById(conceptVersieId)).rejects.toThrow(new Error(`could not map <https://productencatalogus.data.vlaanderen.be/id/concept/Type/UnknownProductType> for iri: <${conceptVersieId}>`));
        });

        for (const targetAudience of Object.values(TargetAudienceType)) {
            test(`TargetAudienceType ${targetAudience} can be mapped`, async () => {
                const conceptVersie = aMinimalConceptVersie().withTargetAudiences(new Set([targetAudience])).build();
                await repository.save(conceptVersie);

                const actualConceptVersie = await repository.findById(conceptVersie.id);

                expect(actualConceptVersie).toEqual(conceptVersie);
            });
        }

        test('Unknown Target Audience Type can not be mapped', async () => {
            const conceptVersieId = `https://ipdc.tni-vlaanderen.be/id/conceptsnapshot/${uuid()}`;

            await directDatabaseAccess.insertData(
                "http://mu.semte.ch/graphs/lpdc/ldes-data",
                [`<${conceptVersieId}> a <https://productencatalogus.data.vlaanderen.be/ns/ipdc-lpdc#ConceptualPublicService>`,
                    `<${conceptVersieId}> <https://productencatalogus.data.vlaanderen.be/ns/ipdc-lpdc#targetAudience> <https://productencatalogus.data.vlaanderen.be/id/concept/Doelgroep/NonExistingTargetAudience>`,
                ]);

            await expect(repository.findById(conceptVersieId)).rejects.toThrow(new Error(`could not map <https://productencatalogus.data.vlaanderen.be/id/concept/Doelgroep/NonExistingTargetAudience> for iri: <${conceptVersieId}>`));
        });

        for (const theme of Object.values(ThemeType)) {
            test(`ThemeType ${theme} can be mapped`, async () => {
                const conceptVersie = aMinimalConceptVersie().withThemes(new Set([theme])).build();
                await repository.save(conceptVersie);

                const actualConceptVersie = await repository.findById(conceptVersie.id);

                expect(actualConceptVersie).toEqual(conceptVersie);
            });
        }

        test('Unknown Theme type can not be mapped', async () => {
            const conceptVersieId = `https://ipdc.tni-vlaanderen.be/id/conceptsnapshot/${uuid()}`;

            await directDatabaseAccess.insertData(
                "http://mu.semte.ch/graphs/lpdc/ldes-data",
                [`<${conceptVersieId}> a <https://productencatalogus.data.vlaanderen.be/ns/ipdc-lpdc#ConceptualPublicService>`,
                    `<${conceptVersieId}> <http://data.europa.eu/m8g/thematicArea> <https://productencatalogus.data.vlaanderen.be/id/concept/Thema/NonExistingTheme>`,
                ]);

            await expect(repository.findById(conceptVersieId)).rejects.toThrow(new Error(`could not map <https://productencatalogus.data.vlaanderen.be/id/concept/Thema/NonExistingTheme> for iri: <${conceptVersieId}>`));
        });

        for (const competentAuthorityLevel of Object.values(CompetentAuthorityLevelType)) {
            test(`CompetentAuthorityLevelType ${competentAuthorityLevel} can be mapped`, async () => {
                const conceptVersie = aMinimalConceptVersie().withCompetentAuthorityLevels(new Set([competentAuthorityLevel])).build();
                await repository.save(conceptVersie);

                const actualConceptVersie = await repository.findById(conceptVersie.id);

                expect(actualConceptVersie).toEqual(conceptVersie);
            });
        }

        test('Unknown Competent Authority Level type can not be mapped', async () => {
            const conceptVersieId = `https://ipdc.tni-vlaanderen.be/id/conceptsnapshot/${uuid()}`;

            await directDatabaseAccess.insertData(
                "http://mu.semte.ch/graphs/lpdc/ldes-data",
                [`<${conceptVersieId}> a <https://productencatalogus.data.vlaanderen.be/ns/ipdc-lpdc#ConceptualPublicService>`,
                    `<${conceptVersieId}> <https://productencatalogus.data.vlaanderen.be/ns/ipdc-lpdc#competentAuthorityLevel> <https://productencatalogus.data.vlaanderen.be/id/concept/BevoegdBestuursniveau/NonExistingCompetentAuthorityLevel>`,
                ]);

            await expect(repository.findById(conceptVersieId)).rejects.toThrow(new Error(`could not map <https://productencatalogus.data.vlaanderen.be/id/concept/BevoegdBestuursniveau/NonExistingCompetentAuthorityLevel> for iri: <${conceptVersieId}>`));
        });

        for (const executingAuthorityLevel of Object.values(ExecutingAuthorityLevelType)) {
            test(`ExecutingAuthorityLevelType ${executingAuthorityLevel} can be mapped`, async () => {
                const conceptVersie = aMinimalConceptVersie().withExecutingAuthorityLevels(new Set([executingAuthorityLevel])).build();
                await repository.save(conceptVersie);

                const actualConceptVersie = await repository.findById(conceptVersie.id);

                expect(actualConceptVersie).toEqual(conceptVersie);
            });
        }

        test('Unknown ExecutingAuthorityLevelType can not be mapped', async () => {
            const conceptVersieId = `https://ipdc.tni-vlaanderen.be/id/conceptsnapshot/${uuid()}`;

            await directDatabaseAccess.insertData(
                "http://mu.semte.ch/graphs/lpdc/ldes-data",
                [`<${conceptVersieId}> a <https://productencatalogus.data.vlaanderen.be/ns/ipdc-lpdc#ConceptualPublicService>`,
                    `<${conceptVersieId}> <https://productencatalogus.data.vlaanderen.be/ns/ipdc-lpdc#executingAuthorityLevel> <https://productencatalogus.data.vlaanderen.be/id/concept/UitvoerendBestuursniveau/NonExistingExecutingAuthorityLevel>`,
                ]);

            await expect(repository.findById(conceptVersieId)).rejects.toThrow(new Error(`could not map <https://productencatalogus.data.vlaanderen.be/id/concept/UitvoerendBestuursniveau/NonExistingExecutingAuthorityLevel> for iri: <${conceptVersieId}>`));
        });

        for (const publicationMedium of Object.values(PublicationMediumType)) {
            test(`PublicationMediumType ${publicationMedium} can be mapped`, async () => {
                const conceptVersie = aMinimalConceptVersie().withPublicationMedia(new Set([publicationMedium])).build();
                await repository.save(conceptVersie);

                const actualConceptVersie = await repository.findById(conceptVersie.id);

                expect(actualConceptVersie).toEqual(conceptVersie);
            });
        }

        test('Unknown PublicationMediumType can not be mapped', async () => {
            const conceptVersieId = `https://ipdc.tni-vlaanderen.be/id/conceptsnapshot/${uuid()}`;

            await directDatabaseAccess.insertData(
                "http://mu.semte.ch/graphs/lpdc/ldes-data",
                [`<${conceptVersieId}> a <https://productencatalogus.data.vlaanderen.be/ns/ipdc-lpdc#ConceptualPublicService>`,
                    `<${conceptVersieId}> <https://productencatalogus.data.vlaanderen.be/ns/ipdc-lpdc#publicationMedium> <https://productencatalogus.data.vlaanderen.be/id/concept/PublicatieKanaal/NonExistingPublicationMedium>`,
                ]);

            await expect(repository.findById(conceptVersieId)).rejects.toThrow(new Error(`could not map <https://productencatalogus.data.vlaanderen.be/id/concept/PublicatieKanaal/NonExistingPublicationMedium> for iri: <${conceptVersieId}>`));
        });

        for (const yourEuropeCategory of Object.values(YourEuropeCategoryType)) {
            test(`YourEuropeCategoryType ${yourEuropeCategory} can be mapped`, async () => {
                const conceptVersie = aMinimalConceptVersie().withYourEuropeCategories(new Set([yourEuropeCategory])).build();
                await repository.save(conceptVersie);

                const actualConceptVersie = await repository.findById(conceptVersie.id);

                expect(actualConceptVersie).toEqual(conceptVersie);
            });
        }

        test('Unknown YourEuropeCategoryType can not be mapped', async () => {
            const conceptVersieId = `https://ipdc.tni-vlaanderen.be/id/conceptsnapshot/${uuid()}`;

            await directDatabaseAccess.insertData(
                "http://mu.semte.ch/graphs/lpdc/ldes-data",
                [`<${conceptVersieId}> a <https://productencatalogus.data.vlaanderen.be/ns/ipdc-lpdc#ConceptualPublicService>`,
                    `<${conceptVersieId}> <https://productencatalogus.data.vlaanderen.be/ns/ipdc-lpdc#yourEuropeCategory> <https://productencatalogus.data.vlaanderen.be/id/concept/YourEuropeCatagory/NonExistingYourEuropeCategory>`,
                ]);

            await expect(repository.findById(conceptVersieId)).rejects.toThrow(new Error(`could not map <https://productencatalogus.data.vlaanderen.be/id/concept/YourEuropeCatagory/NonExistingYourEuropeCategory> for iri: <${conceptVersieId}>`));
        });
    });
});