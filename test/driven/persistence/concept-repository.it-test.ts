import {TEST_SPARQL_ENDPOINT} from "../../test.config";
import {DirectDatabaseAccess} from "./direct-database-access";
import {uuid} from "../../../mu-helper";
import {LanguageString} from "../../../src/core/domain/language-string";
import {ConceptSparqlTestRepository} from "./concept-sparql-test-repository";
import {aFullConcept, aMinimalConcept, ConceptTestBuilder} from "../../core/domain/concept-test-builder";
import {CONCEPT_GRAPH, PREFIX} from "../../../config";
import {NS} from "../../../src/driven/persistence/namespaces";

import {buildConceptIri} from "../../core/domain/iri-test-builder";

describe('ConceptRepository', () => {
    const repository = new ConceptSparqlTestRepository(TEST_SPARQL_ENDPOINT);
    const directDatabaseAccess = new DirectDatabaseAccess(TEST_SPARQL_ENDPOINT);

    describe('findById', () => {

        test('When full concept exists with id, then return concept', async () => {
            const concept = aFullConcept().withIsArchived(true).build();
            await repository.save(concept);

            const anotherConcept = aFullConcept().build();
            await repository.save(anotherConcept);

            const actualConcept = await repository.findById(concept.id);

            expect(actualConcept).toEqual(concept);
        });

        test('When minimal concept exists with id, then return concept', async () => {
            const concept = aMinimalConcept().build();
            await repository.save(concept);

            const anotherConcept = aMinimalConcept().build();
            await repository.save(anotherConcept);

            const actualConcept = await repository.findById(concept.id);

            expect(actualConcept).toEqual(concept);
        });

        test('When minimal concept with incomplete title exists with id, then return concept', async () => {
            const concept = aMinimalConcept().withTitle(LanguageString.of(undefined, ConceptTestBuilder.TITLE_NL)).build();
            await repository.save(concept);

            const anotherConcept = aMinimalConcept().build();
            await repository.save(anotherConcept);

            const actualConcept = await repository.findById(concept.id);

            expect(actualConcept).toEqual(concept);
        });

        test('When concept does not exist with id, then throw error', async () => {
            const concept = aFullConcept().build();
            await repository.save(concept);

            const nonExistentConceptId = buildConceptIri('thisiddoesnotexist');

            await expect(repository.findById(nonExistentConceptId)).rejects.toThrow(new Error(`Could not find <https://ipdc.tni-vlaanderen.be/id/concept/thisiddoesnotexist> for type <https://productencatalogus.data.vlaanderen.be/ns/ipdc-lpdc#ConceptualPublicService>`));
        });
    });

    describe('exists', () => {
        test('Concept with id exists', async () => {
            const concept = aFullConcept().build();
            await repository.save(concept);

            expect(await repository.exists(concept.id)).toBeTruthy();
        });

        test('Concept with id does not exist', async () => {
            const concept = aFullConcept().build();
            await repository.save(concept);

            const nonExistentConceptId = buildConceptIri('thisiddoesnotexist');

            expect(await repository.exists(nonExistentConceptId)).toBeFalsy();
        });

        test('When concept with id exists with different type then return false ', async () => {
            const conceptId = buildConceptIri(uuid());
            await directDatabaseAccess.insertData(
                CONCEPT_GRAPH,
                [
                    `<${conceptId}> a ex:someType`,
                ],
                [PREFIX.ex]);

            expect(await repository.exists(conceptId)).toBeFalsy();
        });
    });

    describe('Verify ontology and mapping', () => {

        test('Verify correct type', async () => {
            const idForIncorrectType = `https://ipdc.tni-vlaanderen.be/id/rule/${uuid()}`;

            await directDatabaseAccess.insertData(
                CONCEPT_GRAPH,
                [`<${idForIncorrectType}> a <https://productencatalogus.data.vlaanderen.be/ns/ipdc-lpdc#SomeUnkownType>`]);

            await expect(repository.findById(idForIncorrectType)).rejects.toThrow(new Error(`Could not find <${idForIncorrectType}> for type <https://productencatalogus.data.vlaanderen.be/ns/ipdc-lpdc#ConceptualPublicService>, but found with type <https://productencatalogus.data.vlaanderen.be/ns/ipdc-lpdc#SomeUnkownType>`));
        });

        test('Verify minimal mappings', async () => {
            const conceptId = buildConceptIri(uuid());

            const concept =
                aMinimalConcept()
                    .withId(conceptId)
                    .withIsArchived(false)
                    .build();

            await directDatabaseAccess.insertData(
                CONCEPT_GRAPH,
                [
                    `<${conceptId}> a <https://productencatalogus.data.vlaanderen.be/ns/ipdc-lpdc#ConceptualPublicService>`,
                    `<${conceptId}> <http://mu.semte.ch/vocabularies/ext/hasVersionedSource> <${concept.latestConceptSnapshot}>`,
                    `<${conceptId}> <https://productencatalogus.data.vlaanderen.be/ns/ipdc-lpdc#hasLatestFunctionalChange> <${concept.latestFunctionallyChangedConceptSnapshot}>`,
                ]);

            const actualConcept = await repository.findById(conceptId);

            expect(actualConcept).toEqual(concept);
        });

        test('Verify minimal mappings - with incomplete title', async () => {
            const conceptId = buildConceptIri(uuid());

            const concept =
                aMinimalConcept()
                    .withId(conceptId)
                    .withTitle(LanguageString.of(undefined, ConceptTestBuilder.TITLE_NL))
                    .build();

            await directDatabaseAccess.insertData(
                CONCEPT_GRAPH,
                [
                    `<${conceptId}> a <https://productencatalogus.data.vlaanderen.be/ns/ipdc-lpdc#ConceptualPublicService>`,
                    `<${conceptId}> <http://purl.org/dc/terms/title> """${ConceptTestBuilder.TITLE_NL}"""@nl`,
                    `<${conceptId}> <http://mu.semte.ch/vocabularies/ext/hasVersionedSource> <${concept.latestConceptSnapshot}>`,
                    `<${conceptId}> <https://productencatalogus.data.vlaanderen.be/ns/ipdc-lpdc#hasLatestFunctionalChange> <${concept.latestFunctionallyChangedConceptSnapshot}>`,
                ]);

            const actualConcept = await repository.findById(conceptId);

            expect(actualConcept).toEqual(concept);
        });


        test('Verify full mappings', async () => {
            const id = uuid();
            const conceptId = buildConceptIri(id);
            const conceptDisplayConfigurationId = `http://data.lblod.info/id/conceptual-display-configuration/${uuid()}`;

            const concept =
                aFullConcept()
                    .withId(conceptId)
                    .withIsArchived(true)
                    .build();

            await directDatabaseAccess.insertData(
                CONCEPT_GRAPH,
                [`<${conceptId}> a <https://productencatalogus.data.vlaanderen.be/ns/ipdc-lpdc#ConceptualPublicService>`,
                    `<${conceptId}> <http://mu.semte.ch/vocabularies/core/uuid> """${concept.uuid}"""`,
                    `<${conceptId}> <http://purl.org/dc/terms/title> """${ConceptTestBuilder.TITLE_EN}"""@EN`,
                    `<${conceptId}> <http://purl.org/dc/terms/title> """${ConceptTestBuilder.TITLE_NL}"""@NL`,
                    `<${conceptId}> <http://purl.org/dc/terms/title> """${ConceptTestBuilder.TITLE_NL_FORMAL}"""@nl-BE-x-formal`,
                    `<${conceptId}> <http://purl.org/dc/terms/title> """${ConceptTestBuilder.TITLE_NL_INFORMAL}"""@nl-BE-x-informal`,
                    `<${conceptId}> <http://purl.org/dc/terms/title> """${ConceptTestBuilder.TITLE_NL_GENERATED_FORMAL}"""@nl-BE-x-generated-formal`,
                    `<${conceptId}> <http://purl.org/dc/terms/title> """${ConceptTestBuilder.TITLE_NL_GENERATED_INFORMAL}"""@nl-BE-x-generated-informal`,
                    `<${conceptId}> <http://purl.org/dc/terms/title> """Concept Title German language is ignored"""@de`,
                    `<${conceptId}> <http://purl.org/dc/terms/title> """Concept French language is ignored"""@fr`,
                    `<${conceptId}> <http://purl.org/dc/terms/description> """${ConceptTestBuilder.DESCRIPTION_EN}"""@EN`,
                    `<${conceptId}> <http://purl.org/dc/terms/description> """${ConceptTestBuilder.DESCRIPTION_NL}"""@NL`,
                    `<${conceptId}> <http://purl.org/dc/terms/description> """${ConceptTestBuilder.DESCRIPTION_NL_FORMAL}"""@nl-BE-x-formal`,
                    `<${conceptId}> <http://purl.org/dc/terms/description> """${ConceptTestBuilder.DESCRIPTION_NL_INFORMAL}"""@nl-BE-x-informal`,
                    `<${conceptId}> <http://purl.org/dc/terms/description> """${ConceptTestBuilder.DESCRIPTION_NL_GENERATED_FORMAL}"""@nl-BE-x-generated-formal`,
                    `<${conceptId}> <http://purl.org/dc/terms/description> """${ConceptTestBuilder.DESCRIPTION_NL_GENERATED_INFORMAL}"""@nl-BE-x-generated-informal`,
                    `<${conceptId}> <http://purl.org/dc/terms/description> """Concept Description German language is ignored"""@de`,
                    `<${conceptId}> <http://purl.org/dc/terms/description> """Concept Description language is ignored"""@fr`,
                    `<${conceptId}> <https://productencatalogus.data.vlaanderen.be/ns/ipdc-lpdc#additionalDescription> """${ConceptTestBuilder.ADDITIONAL_DESCRIPTION_EN}"""@EN`,
                    `<${conceptId}> <https://productencatalogus.data.vlaanderen.be/ns/ipdc-lpdc#additionalDescription> """${ConceptTestBuilder.ADDITIONAL_DESCRIPTION_NL}"""@NL`,
                    `<${conceptId}> <https://productencatalogus.data.vlaanderen.be/ns/ipdc-lpdc#additionalDescription> """${ConceptTestBuilder.ADDITIONAL_DESCRIPTION_NL_FORMAL}"""@nl-BE-x-formal`,
                    `<${conceptId}> <https://productencatalogus.data.vlaanderen.be/ns/ipdc-lpdc#additionalDescription> """${ConceptTestBuilder.ADDITIONAL_DESCRIPTION_NL_INFORMAL}"""@nl-BE-x-informal`,
                    `<${conceptId}> <https://productencatalogus.data.vlaanderen.be/ns/ipdc-lpdc#additionalDescription> """${ConceptTestBuilder.ADDITIONAL_DESCRIPTION_NL_GENERATED_FORMAL}"""@nl-BE-x-generated-formal`,
                    `<${conceptId}> <https://productencatalogus.data.vlaanderen.be/ns/ipdc-lpdc#additionalDescription> """${ConceptTestBuilder.ADDITIONAL_DESCRIPTION_NL_GENERATED_INFORMAL}"""@nl-BE-x-generated-informal`,
                    `<${conceptId}> <https://productencatalogus.data.vlaanderen.be/ns/ipdc-lpdc#additionalDescription> """Concept Additional Description German language is ignored"""@de`,
                    `<${conceptId}> <https://productencatalogus.data.vlaanderen.be/ns/ipdc-lpdc#additionalDescription> """Concept Additional Description language is ignored"""@fr`,
                    `<${conceptId}> <https://productencatalogus.data.vlaanderen.be/ns/ipdc-lpdc#exception> """${ConceptTestBuilder.EXCEPTION_EN}"""@EN`,
                    `<${conceptId}> <https://productencatalogus.data.vlaanderen.be/ns/ipdc-lpdc#exception> """${ConceptTestBuilder.EXCEPTION_NL}"""@NL`,
                    `<${conceptId}> <https://productencatalogus.data.vlaanderen.be/ns/ipdc-lpdc#exception> """${ConceptTestBuilder.EXCEPTION_NL_FORMAL}"""@nl-BE-x-formal`,
                    `<${conceptId}> <https://productencatalogus.data.vlaanderen.be/ns/ipdc-lpdc#exception> """${ConceptTestBuilder.EXCEPTION_NL_INFORMAL}"""@nl-BE-x-informal`,
                    `<${conceptId}> <https://productencatalogus.data.vlaanderen.be/ns/ipdc-lpdc#exception> """${ConceptTestBuilder.EXCEPTION_NL_GENERATED_FORMAL}"""@nl-BE-x-generated-formal`,
                    `<${conceptId}> <https://productencatalogus.data.vlaanderen.be/ns/ipdc-lpdc#exception> """${ConceptTestBuilder.EXCEPTION_NL_GENERATED_INFORMAL}"""@nl-BE-x-generated-informal`,
                    `<${conceptId}> <https://productencatalogus.data.vlaanderen.be/ns/ipdc-lpdc#exception> """Concept Exception German language is ignored"""@de`,
                    `<${conceptId}> <https://productencatalogus.data.vlaanderen.be/ns/ipdc-lpdc#exception> """Concept Exception language is ignored"""@fr`,
                    `<${conceptId}> <https://productencatalogus.data.vlaanderen.be/ns/ipdc-lpdc#regulation> """${ConceptTestBuilder.REGULATION_EN}"""@EN`,
                    `<${conceptId}> <https://productencatalogus.data.vlaanderen.be/ns/ipdc-lpdc#regulation> """${ConceptTestBuilder.REGULATION_NL}"""@NL`,
                    `<${conceptId}> <https://productencatalogus.data.vlaanderen.be/ns/ipdc-lpdc#regulation> """${ConceptTestBuilder.REGULATION_NL_FORMAL}"""@nl-BE-x-formal`,
                    `<${conceptId}> <https://productencatalogus.data.vlaanderen.be/ns/ipdc-lpdc#regulation> """${ConceptTestBuilder.REGULATION_NL_INFORMAL}"""@nl-BE-x-informal`,
                    `<${conceptId}> <https://productencatalogus.data.vlaanderen.be/ns/ipdc-lpdc#regulation> """${ConceptTestBuilder.REGULATION_NL_GENERATED_FORMAL}"""@nl-BE-x-generated-formal`,
                    `<${conceptId}> <https://productencatalogus.data.vlaanderen.be/ns/ipdc-lpdc#regulation> """${ConceptTestBuilder.REGULATION_NL_GENERATED_INFORMAL}"""@nl-BE-x-generated-informal`,
                    `<${conceptId}> <https://productencatalogus.data.vlaanderen.be/ns/ipdc-lpdc#regulation> """Concept Regulation German language is ignored"""@de`,
                    `<${conceptId}> <https://productencatalogus.data.vlaanderen.be/ns/ipdc-lpdc#regulation> """Concept Regulation  language is ignored"""@fr`,
                    `<${conceptId}> <http://schema.org/startDate> """${ConceptTestBuilder.START_DATE.value}"""^^<http://www.w3.org/2001/XMLSchema#dateTime>`,
                    `<${conceptId}> <http://schema.org/endDate> """${ConceptTestBuilder.END_DATE.value}"""^^<http://www.w3.org/2001/XMLSchema#dateTime>`,
                    `<${conceptId}> <http://purl.org/dc/terms/type> <${NS.concept.type(ConceptTestBuilder.TYPE).value}>`,
                    `<${conceptId}> <https://productencatalogus.data.vlaanderen.be/ns/ipdc-lpdc#targetAudience> <${NS.concept.doelgroep(Array.from(ConceptTestBuilder.TARGET_AUDIENCES)[0]).value}>`,
                    `<${NS.concept.doelgroep(Array.from(ConceptTestBuilder.TARGET_AUDIENCES)[0]).value}> a <http://www.w3.org/2004/02/skos/core#Concept>`,
                    `<${conceptId}> <https://productencatalogus.data.vlaanderen.be/ns/ipdc-lpdc#targetAudience> <${NS.concept.doelgroep(Array.from(ConceptTestBuilder.TARGET_AUDIENCES)[1]).value}>`,
                    `<${NS.concept.doelgroep(Array.from(ConceptTestBuilder.TARGET_AUDIENCES)[1]).value}> a <http://www.w3.org/2004/02/skos/core#Concept>`,
                    `<${conceptId}> <https://productencatalogus.data.vlaanderen.be/ns/ipdc-lpdc#targetAudience> <${NS.concept.doelgroep(Array.from(ConceptTestBuilder.TARGET_AUDIENCES)[2]).value}>`,
                    `<${NS.concept.doelgroep(Array.from(ConceptTestBuilder.TARGET_AUDIENCES)[2]).value}> a <http://www.w3.org/2004/02/skos/core#Concept>`,
                    `<${conceptId}> <http://data.europa.eu/m8g/thematicArea> <${NS.concept.thema(Array.from(ConceptTestBuilder.THEMES)[0]).value}>`,
                    `<${NS.concept.thema(Array.from(ConceptTestBuilder.THEMES)[0]).value}> a <http://www.w3.org/2004/02/skos/core#Concept>`,
                    `<${conceptId}> <http://data.europa.eu/m8g/thematicArea> <${NS.concept.thema(Array.from(ConceptTestBuilder.THEMES)[1]).value}>`,
                    `<${NS.concept.thema(Array.from(ConceptTestBuilder.THEMES)[1]).value}> a <http://www.w3.org/2004/02/skos/core#Concept>`,
                    `<${conceptId}> <http://data.europa.eu/m8g/thematicArea> <${NS.concept.thema(Array.from(ConceptTestBuilder.THEMES)[2]).value}>`,
                    `<${NS.concept.thema(Array.from(ConceptTestBuilder.THEMES)[2]).value}> a <http://www.w3.org/2004/02/skos/core#Concept>`,
                    `<${conceptId}> <https://productencatalogus.data.vlaanderen.be/ns/ipdc-lpdc#competentAuthorityLevel> <${NS.concept.bevoegdBestuursniveau(Array.from(ConceptTestBuilder.COMPETENT_AUTHORITY_LEVELS)[0]).value}>`,
                    `<${NS.concept.bevoegdBestuursniveau(Array.from(ConceptTestBuilder.COMPETENT_AUTHORITY_LEVELS)[0]).value}> a <http://www.w3.org/2004/02/skos/core#Concept>`,
                    `<${conceptId}> <https://productencatalogus.data.vlaanderen.be/ns/ipdc-lpdc#competentAuthorityLevel> <${NS.concept.bevoegdBestuursniveau(Array.from(ConceptTestBuilder.COMPETENT_AUTHORITY_LEVELS)[1]).value}>`,
                    `<${NS.concept.bevoegdBestuursniveau(Array.from(ConceptTestBuilder.COMPETENT_AUTHORITY_LEVELS)[1]).value}> a <http://www.w3.org/2004/02/skos/core#Concept>`,
                    `<${conceptId}> <https://productencatalogus.data.vlaanderen.be/ns/ipdc-lpdc#competentAuthorityLevel> <${NS.concept.bevoegdBestuursniveau(Array.from(ConceptTestBuilder.COMPETENT_AUTHORITY_LEVELS)[2]).value}>`,
                    `<${NS.concept.bevoegdBestuursniveau(Array.from(ConceptTestBuilder.COMPETENT_AUTHORITY_LEVELS)[2]).value}> a <http://www.w3.org/2004/02/skos/core#Concept>`,
                    `<${conceptId}> <http://data.europa.eu/m8g/hasCompetentAuthority> <${Array.from(ConceptTestBuilder.COMPETENT_AUTHORITIES)[0]}>`,
                    `<${Array.from(ConceptTestBuilder.COMPETENT_AUTHORITIES)[0]}> a <http://data.vlaanderen.be/ns/besluit#Bestuurseenheid>`,
                    `<${conceptId}> <http://data.europa.eu/m8g/hasCompetentAuthority> <${Array.from(ConceptTestBuilder.COMPETENT_AUTHORITIES)[1]}>`,
                    `<${Array.from(ConceptTestBuilder.COMPETENT_AUTHORITIES)[1]}> a <http://data.vlaanderen.be/ns/besluit#Bestuurseenheid>`,
                    `<${conceptId}> <http://data.europa.eu/m8g/hasCompetentAuthority> <${Array.from(ConceptTestBuilder.COMPETENT_AUTHORITIES)[2]}>`,
                    `<${Array.from(ConceptTestBuilder.COMPETENT_AUTHORITIES)[2]}> a <http://data.europa.eu/m8g/PublicOrganisation>`,
                    `<${conceptId}> <https://productencatalogus.data.vlaanderen.be/ns/ipdc-lpdc#executingAuthorityLevel> <${NS.concept.uitvoerendBestuursniveau(Array.from(ConceptTestBuilder.EXECUTING_AUTHORITY_LEVELS)[0]).value}>`,
                    `<${NS.concept.uitvoerendBestuursniveau(Array.from(ConceptTestBuilder.EXECUTING_AUTHORITY_LEVELS)[0]).value}> a <http://www.w3.org/2004/02/skos/core#Concept>`,
                    `<${conceptId}> <https://productencatalogus.data.vlaanderen.be/ns/ipdc-lpdc#executingAuthorityLevel> <${NS.concept.uitvoerendBestuursniveau(Array.from(ConceptTestBuilder.EXECUTING_AUTHORITY_LEVELS)[1]).value}>`,
                    `<${NS.concept.uitvoerendBestuursniveau(Array.from(ConceptTestBuilder.EXECUTING_AUTHORITY_LEVELS)[1]).value}> a <http://www.w3.org/2004/02/skos/core#Concept>`,
                    `<${conceptId}> <https://productencatalogus.data.vlaanderen.be/ns/ipdc-lpdc#executingAuthorityLevel> <${NS.concept.uitvoerendBestuursniveau(Array.from(ConceptTestBuilder.EXECUTING_AUTHORITY_LEVELS)[2]).value}>`,
                    `<${NS.concept.uitvoerendBestuursniveau(Array.from(ConceptTestBuilder.EXECUTING_AUTHORITY_LEVELS)[2]).value}> a <http://www.w3.org/2004/02/skos/core#Concept>`,
                    `<${conceptId}> <https://productencatalogus.data.vlaanderen.be/ns/ipdc-lpdc#hasExecutingAuthority> <${Array.from(ConceptTestBuilder.EXECUTING_AUTHORITIES)[0]}>`,
                    `<${Array.from(ConceptTestBuilder.EXECUTING_AUTHORITIES)[0]}> a <http://data.vlaanderen.be/ns/besluit#Bestuurseenheid>`,
                    `<${conceptId}> <https://productencatalogus.data.vlaanderen.be/ns/ipdc-lpdc#hasExecutingAuthority> <${Array.from(ConceptTestBuilder.EXECUTING_AUTHORITIES)[1]}>`,
                    `<${Array.from(ConceptTestBuilder.EXECUTING_AUTHORITIES)[1]}> a <http://data.vlaanderen.be/ns/besluit#Bestuurseenheid>`,
                    `<${conceptId}> <https://productencatalogus.data.vlaanderen.be/ns/ipdc-lpdc#hasExecutingAuthority> <${Array.from(ConceptTestBuilder.EXECUTING_AUTHORITIES)[2]}>`,
                    `<${Array.from(ConceptTestBuilder.EXECUTING_AUTHORITIES)[2]}> a <http://data.europa.eu/m8g/PublicOrganisation>`,
                    `<${conceptId}> <https://productencatalogus.data.vlaanderen.be/ns/ipdc-lpdc#publicationMedium> <${NS.concept.publicatieKanaal(Array.from(ConceptTestBuilder.PUBLICATION_MEDIA)[0]).value}>`,
                    `<${NS.concept.publicatieKanaal(Array.from(ConceptTestBuilder.PUBLICATION_MEDIA)[0]).value}> a <http://www.w3.org/2004/02/skos/core#Concept>`,
                    `<${conceptId}> <https://productencatalogus.data.vlaanderen.be/ns/ipdc-lpdc#publicationMedium> <${NS.concept.publicatieKanaal(Array.from(ConceptTestBuilder.PUBLICATION_MEDIA)[1]).value}>`,
                    `<${NS.concept.publicatieKanaal(Array.from(ConceptTestBuilder.PUBLICATION_MEDIA)[1]).value}> a <http://www.w3.org/2004/02/skos/core#Concept>`,
                    `<${conceptId}> <https://productencatalogus.data.vlaanderen.be/ns/ipdc-lpdc#yourEuropeCategory> <${NS.concept.yourEuropeCategorie(Array.from(ConceptTestBuilder.YOUR_EUROPE_CATEGORIES)[0]).value}>`,
                    `<${NS.concept.yourEuropeCategorie(Array.from(ConceptTestBuilder.YOUR_EUROPE_CATEGORIES)[0]).value}> a <http://www.w3.org/2004/02/skos/core#Concept>`,
                    `<${conceptId}> <https://productencatalogus.data.vlaanderen.be/ns/ipdc-lpdc#yourEuropeCategory> <${NS.concept.yourEuropeCategorie(Array.from(ConceptTestBuilder.YOUR_EUROPE_CATEGORIES)[1]).value}>`,
                    `<${NS.concept.yourEuropeCategorie(Array.from(ConceptTestBuilder.YOUR_EUROPE_CATEGORIES)[1]).value}> a <http://www.w3.org/2004/02/skos/core#Concept>`,
                    `<${conceptId}> <https://productencatalogus.data.vlaanderen.be/ns/ipdc-lpdc#yourEuropeCategory> <${NS.concept.yourEuropeCategorie(Array.from(ConceptTestBuilder.YOUR_EUROPE_CATEGORIES)[2]).value}>`,
                    `<${NS.concept.yourEuropeCategorie(Array.from(ConceptTestBuilder.YOUR_EUROPE_CATEGORIES)[2]).value}> a <http://www.w3.org/2004/02/skos/core#Concept>`,
                    `<${conceptId}> <http://www.w3.org/ns/dcat#keyword> """${Array.from(ConceptTestBuilder.KEYWORDS)[0].en}"""@en`,
                    `<${conceptId}> <http://www.w3.org/ns/dcat#keyword> """${Array.from(ConceptTestBuilder.KEYWORDS)[1].nl}"""@nl`,
                    `<${conceptId}> <http://www.w3.org/ns/dcat#keyword> """${Array.from(ConceptTestBuilder.KEYWORDS)[2].nl}"""@nl`,
                    `<${conceptId}> <http://www.w3.org/ns/dcat#keyword> """${Array.from(ConceptTestBuilder.KEYWORDS)[3].en}"""@en`,
                    `<${conceptId}> <http://vocab.belgif.be/ns/publicservice#hasRequirement> <${ConceptTestBuilder.REQUIREMENTS[1].id}>`,
                    `<${ConceptTestBuilder.REQUIREMENTS[1].id}> a <http://data.europa.eu/m8g/Requirement>`,
                    `<${ConceptTestBuilder.REQUIREMENTS[1].id}> <http://mu.semte.ch/vocabularies/core/uuid> """${ConceptTestBuilder.REQUIREMENTS[1].uuid}"""`,
                    `<${ConceptTestBuilder.REQUIREMENTS[1].id}> <http://purl.org/dc/terms/title> """${ConceptTestBuilder.REQUIREMENTS[1].title.en}"""@EN`,
                    `<${ConceptTestBuilder.REQUIREMENTS[1].id}> <http://purl.org/dc/terms/title> """${ConceptTestBuilder.REQUIREMENTS[1].title.nl}"""@NL`,
                    `<${ConceptTestBuilder.REQUIREMENTS[1].id}> <http://purl.org/dc/terms/title> """${ConceptTestBuilder.REQUIREMENTS[1].title.nlFormal}"""@nl-BE-x-formal`,
                    `<${ConceptTestBuilder.REQUIREMENTS[1].id}> <http://purl.org/dc/terms/title> """${ConceptTestBuilder.REQUIREMENTS[1].title.nlInformal}"""@nl-BE-x-informal`,
                    `<${ConceptTestBuilder.REQUIREMENTS[1].id}> <http://purl.org/dc/terms/title> """${ConceptTestBuilder.REQUIREMENTS[1].title.nlGeneratedFormal}"""@nl-BE-x-generated-formal`,
                    `<${ConceptTestBuilder.REQUIREMENTS[1].id}> <http://purl.org/dc/terms/title> """${ConceptTestBuilder.REQUIREMENTS[1].title.nlGeneratedInformal}"""@nl-BE-x-generated-informal`,
                    `<${ConceptTestBuilder.REQUIREMENTS[1].id}> <http://purl.org/dc/terms/description> """${ConceptTestBuilder.REQUIREMENTS[1].description.en}"""@EN`,
                    `<${ConceptTestBuilder.REQUIREMENTS[1].id}> <http://purl.org/dc/terms/description> """${ConceptTestBuilder.REQUIREMENTS[1].description.nl}"""@NL`,
                    `<${ConceptTestBuilder.REQUIREMENTS[1].id}> <http://purl.org/dc/terms/description> """${ConceptTestBuilder.REQUIREMENTS[1].description.nlFormal}"""@nl-BE-x-formal`,
                    `<${ConceptTestBuilder.REQUIREMENTS[1].id}> <http://purl.org/dc/terms/description> """${ConceptTestBuilder.REQUIREMENTS[1].description.nlInformal}"""@nl-BE-x-informal`,
                    `<${ConceptTestBuilder.REQUIREMENTS[1].id}> <http://purl.org/dc/terms/description> """${ConceptTestBuilder.REQUIREMENTS[1].description.nlGeneratedFormal}"""@nl-BE-x-generated-formal`,
                    `<${ConceptTestBuilder.REQUIREMENTS[1].id}> <http://purl.org/dc/terms/description> """${ConceptTestBuilder.REQUIREMENTS[1].description.nlGeneratedInformal}"""@nl-BE-x-generated-informal`,
                    `<${ConceptTestBuilder.REQUIREMENTS[1].id}> <http://www.w3.org/ns/shacl#order> """1"""^^<http://www.w3.org/2001/XMLSchema#integer>`,
                    `<${ConceptTestBuilder.REQUIREMENTS[1].id}> <http://data.europa.eu/m8g/hasSupportingEvidence> <${ConceptTestBuilder.REQUIREMENTS[1].evidence.id}>`,
                    `<${ConceptTestBuilder.REQUIREMENTS[1].evidence.id}> a <http://data.europa.eu/m8g/Evidence>`,
                    `<${ConceptTestBuilder.REQUIREMENTS[1].evidence.id}> <http://mu.semte.ch/vocabularies/core/uuid> """${ConceptTestBuilder.REQUIREMENTS[1].evidence.uuid}"""`,
                    `<${ConceptTestBuilder.REQUIREMENTS[1].evidence.id}> <http://purl.org/dc/terms/title> """${ConceptTestBuilder.REQUIREMENTS[1].evidence.title.en}"""@EN`,
                    `<${ConceptTestBuilder.REQUIREMENTS[1].evidence.id}> <http://purl.org/dc/terms/title> """${ConceptTestBuilder.REQUIREMENTS[1].evidence.title.nl}"""@NL`,
                    `<${ConceptTestBuilder.REQUIREMENTS[1].evidence.id}> <http://purl.org/dc/terms/title> """${ConceptTestBuilder.REQUIREMENTS[1].evidence.title.nlFormal}"""@nl-BE-x-formal`,
                    `<${ConceptTestBuilder.REQUIREMENTS[1].evidence.id}> <http://purl.org/dc/terms/title> """${ConceptTestBuilder.REQUIREMENTS[1].evidence.title.nlInformal}"""@nl-BE-x-informal`,
                    `<${ConceptTestBuilder.REQUIREMENTS[1].evidence.id}> <http://purl.org/dc/terms/title> """${ConceptTestBuilder.REQUIREMENTS[1].evidence.title.nlGeneratedFormal}"""@nl-BE-x-generated-formal`,
                    `<${ConceptTestBuilder.REQUIREMENTS[1].evidence.id}> <http://purl.org/dc/terms/title> """${ConceptTestBuilder.REQUIREMENTS[1].evidence.title.nlGeneratedInformal}"""@nl-BE-x-generated-informal`,
                    `<${ConceptTestBuilder.REQUIREMENTS[1].evidence.id}> <http://purl.org/dc/terms/description> """${ConceptTestBuilder.REQUIREMENTS[1].evidence.description.en}"""@EN`,
                    `<${ConceptTestBuilder.REQUIREMENTS[1].evidence.id}> <http://purl.org/dc/terms/description> """${ConceptTestBuilder.REQUIREMENTS[1].evidence.description.nl}"""@NL`,
                    `<${ConceptTestBuilder.REQUIREMENTS[1].evidence.id}> <http://purl.org/dc/terms/description> """${ConceptTestBuilder.REQUIREMENTS[1].evidence.description.nlFormal}"""@nl-BE-x-formal`,
                    `<${ConceptTestBuilder.REQUIREMENTS[1].evidence.id}> <http://purl.org/dc/terms/description> """${ConceptTestBuilder.REQUIREMENTS[1].evidence.description.nlInformal}"""@nl-BE-x-informal`,
                    `<${ConceptTestBuilder.REQUIREMENTS[1].evidence.id}> <http://purl.org/dc/terms/description> """${ConceptTestBuilder.REQUIREMENTS[1].evidence.description.nlGeneratedFormal}"""@nl-BE-x-generated-formal`,
                    `<${ConceptTestBuilder.REQUIREMENTS[1].evidence.id}> <http://purl.org/dc/terms/description> """${ConceptTestBuilder.REQUIREMENTS[1].evidence.description.nlGeneratedInformal}"""@nl-BE-x-generated-informal`,
                    `<${conceptId}> <http://vocab.belgif.be/ns/publicservice#hasRequirement> <${ConceptTestBuilder.REQUIREMENTS[0].id}>`,
                    `<${ConceptTestBuilder.REQUIREMENTS[0].id}> a <http://data.europa.eu/m8g/Requirement>`,
                    `<${ConceptTestBuilder.REQUIREMENTS[0].id}> <http://mu.semte.ch/vocabularies/core/uuid> """${ConceptTestBuilder.REQUIREMENTS[0].uuid}"""`,
                    `<${ConceptTestBuilder.REQUIREMENTS[0].id}> <http://purl.org/dc/terms/title> """${ConceptTestBuilder.REQUIREMENTS[0].title.en}"""@EN`,
                    `<${ConceptTestBuilder.REQUIREMENTS[0].id}> <http://purl.org/dc/terms/title> """${ConceptTestBuilder.REQUIREMENTS[0].title.nl}"""@NL`,
                    `<${ConceptTestBuilder.REQUIREMENTS[0].id}> <http://purl.org/dc/terms/title> """${ConceptTestBuilder.REQUIREMENTS[0].title.nlFormal}"""@nl-BE-x-formal`,
                    `<${ConceptTestBuilder.REQUIREMENTS[0].id}> <http://purl.org/dc/terms/title> """${ConceptTestBuilder.REQUIREMENTS[0].title.nlInformal}"""@nl-BE-x-informal`,
                    `<${ConceptTestBuilder.REQUIREMENTS[0].id}> <http://purl.org/dc/terms/title> """${ConceptTestBuilder.REQUIREMENTS[0].title.nlGeneratedFormal}"""@nl-BE-x-generated-formal`,
                    `<${ConceptTestBuilder.REQUIREMENTS[0].id}> <http://purl.org/dc/terms/title> """${ConceptTestBuilder.REQUIREMENTS[0].title.nlGeneratedInformal}"""@nl-BE-x-generated-informal`,
                    `<${ConceptTestBuilder.REQUIREMENTS[0].id}> <http://purl.org/dc/terms/description> """${ConceptTestBuilder.REQUIREMENTS[0].description.en}"""@EN`,
                    `<${ConceptTestBuilder.REQUIREMENTS[0].id}> <http://purl.org/dc/terms/description> """${ConceptTestBuilder.REQUIREMENTS[0].description.nl}"""@NL`,
                    `<${ConceptTestBuilder.REQUIREMENTS[0].id}> <http://purl.org/dc/terms/description> """${ConceptTestBuilder.REQUIREMENTS[0].description.nlFormal}"""@nl-BE-x-formal`,
                    `<${ConceptTestBuilder.REQUIREMENTS[0].id}> <http://purl.org/dc/terms/description> """${ConceptTestBuilder.REQUIREMENTS[0].description.nlInformal}"""@nl-BE-x-informal`,
                    `<${ConceptTestBuilder.REQUIREMENTS[0].id}> <http://purl.org/dc/terms/description> """${ConceptTestBuilder.REQUIREMENTS[0].description.nlGeneratedFormal}"""@nl-BE-x-generated-formal`,
                    `<${ConceptTestBuilder.REQUIREMENTS[0].id}> <http://purl.org/dc/terms/description> """${ConceptTestBuilder.REQUIREMENTS[0].description.nlGeneratedInformal}"""@nl-BE-x-generated-informal`,
                    `<${ConceptTestBuilder.REQUIREMENTS[0].id}> <http://www.w3.org/ns/shacl#order> """0"""^^<http://www.w3.org/2001/XMLSchema#integer>`,
                    `<${ConceptTestBuilder.REQUIREMENTS[0].id}> <http://data.europa.eu/m8g/hasSupportingEvidence> <${ConceptTestBuilder.REQUIREMENTS[0].evidence.id}>`,
                    `<${ConceptTestBuilder.REQUIREMENTS[0].evidence.id}> a <http://data.europa.eu/m8g/Evidence>`,
                    `<${ConceptTestBuilder.REQUIREMENTS[0].evidence.id}> <http://mu.semte.ch/vocabularies/core/uuid> """${ConceptTestBuilder.REQUIREMENTS[0].evidence.uuid}"""`,
                    `<${ConceptTestBuilder.REQUIREMENTS[0].evidence.id}> <http://purl.org/dc/terms/title> """${ConceptTestBuilder.REQUIREMENTS[0].evidence.title.en}"""@EN`,
                    `<${ConceptTestBuilder.REQUIREMENTS[0].evidence.id}> <http://purl.org/dc/terms/title> """${ConceptTestBuilder.REQUIREMENTS[0].evidence.title.nl}"""@NL`,
                    `<${ConceptTestBuilder.REQUIREMENTS[0].evidence.id}> <http://purl.org/dc/terms/title> """${ConceptTestBuilder.REQUIREMENTS[0].evidence.title.nlFormal}"""@nl-BE-x-formal`,
                    `<${ConceptTestBuilder.REQUIREMENTS[0].evidence.id}> <http://purl.org/dc/terms/title> """${ConceptTestBuilder.REQUIREMENTS[0].evidence.title.nlInformal}"""@nl-BE-x-informal`,
                    `<${ConceptTestBuilder.REQUIREMENTS[0].evidence.id}> <http://purl.org/dc/terms/title> """${ConceptTestBuilder.REQUIREMENTS[0].evidence.title.nlGeneratedFormal}"""@nl-BE-x-generated-formal`,
                    `<${ConceptTestBuilder.REQUIREMENTS[0].evidence.id}> <http://purl.org/dc/terms/title> """${ConceptTestBuilder.REQUIREMENTS[0].evidence.title.nlGeneratedInformal}"""@nl-BE-x-generated-informal`,
                    `<${ConceptTestBuilder.REQUIREMENTS[0].evidence.id}> <http://purl.org/dc/terms/description> """${ConceptTestBuilder.REQUIREMENTS[0].evidence.description.en}"""@EN`,
                    `<${ConceptTestBuilder.REQUIREMENTS[0].evidence.id}> <http://purl.org/dc/terms/description> """${ConceptTestBuilder.REQUIREMENTS[0].evidence.description.nl}"""@NL`,
                    `<${ConceptTestBuilder.REQUIREMENTS[0].evidence.id}> <http://purl.org/dc/terms/description> """${ConceptTestBuilder.REQUIREMENTS[0].evidence.description.nlFormal}"""@nl-BE-x-formal`,
                    `<${ConceptTestBuilder.REQUIREMENTS[0].evidence.id}> <http://purl.org/dc/terms/description> """${ConceptTestBuilder.REQUIREMENTS[0].evidence.description.nlInformal}"""@nl-BE-x-informal`,
                    `<${ConceptTestBuilder.REQUIREMENTS[0].evidence.id}> <http://purl.org/dc/terms/description> """${ConceptTestBuilder.REQUIREMENTS[0].evidence.description.nlGeneratedFormal}"""@nl-BE-x-generated-formal`,
                    `<${ConceptTestBuilder.REQUIREMENTS[0].evidence.id}> <http://purl.org/dc/terms/description> """${ConceptTestBuilder.REQUIREMENTS[0].evidence.description.nlGeneratedInformal}"""@nl-BE-x-generated-informal`,
                    `<${conceptId}> <http://purl.org/vocab/cpsv#follows> <${ConceptTestBuilder.PROCEDURES[1].id}>`,
                    `<${ConceptTestBuilder.PROCEDURES[1].id}> a <http://purl.org/vocab/cpsv#Rule>`,
                    `<${ConceptTestBuilder.PROCEDURES[1].id}> <http://mu.semte.ch/vocabularies/core/uuid> """${ConceptTestBuilder.PROCEDURES[1].uuid}"""`,
                    `<${ConceptTestBuilder.PROCEDURES[1].id}> <http://purl.org/dc/terms/title> """${ConceptTestBuilder.PROCEDURES[1].title.en}"""@EN`,
                    `<${ConceptTestBuilder.PROCEDURES[1].id}> <http://purl.org/dc/terms/title> """${ConceptTestBuilder.PROCEDURES[1].title.nl}"""@NL`,
                    `<${ConceptTestBuilder.PROCEDURES[1].id}> <http://purl.org/dc/terms/title> """${ConceptTestBuilder.PROCEDURES[1].title.nlFormal}"""@nl-BE-x-formal`,
                    `<${ConceptTestBuilder.PROCEDURES[1].id}> <http://purl.org/dc/terms/title> """${ConceptTestBuilder.PROCEDURES[1].title.nlInformal}"""@nl-BE-x-informal`,
                    `<${ConceptTestBuilder.PROCEDURES[1].id}> <http://purl.org/dc/terms/title> """${ConceptTestBuilder.PROCEDURES[1].title.nlGeneratedFormal}"""@nl-BE-x-generated-formal`,
                    `<${ConceptTestBuilder.PROCEDURES[1].id}> <http://purl.org/dc/terms/title> """${ConceptTestBuilder.PROCEDURES[1].title.nlGeneratedInformal}"""@nl-BE-x-generated-informal`,
                    `<${ConceptTestBuilder.PROCEDURES[1].id}> <http://purl.org/dc/terms/description> """${ConceptTestBuilder.PROCEDURES[1].description.en}"""@EN`,
                    `<${ConceptTestBuilder.PROCEDURES[1].id}> <http://purl.org/dc/terms/description> """${ConceptTestBuilder.PROCEDURES[1].description.nl}"""@NL`,
                    `<${ConceptTestBuilder.PROCEDURES[1].id}> <http://purl.org/dc/terms/description> """${ConceptTestBuilder.PROCEDURES[1].description.nlFormal}"""@nl-BE-x-formal`,
                    `<${ConceptTestBuilder.PROCEDURES[1].id}> <http://purl.org/dc/terms/description> """${ConceptTestBuilder.PROCEDURES[1].description.nlInformal}"""@nl-BE-x-informal`,
                    `<${ConceptTestBuilder.PROCEDURES[1].id}> <http://purl.org/dc/terms/description> """${ConceptTestBuilder.PROCEDURES[1].description.nlGeneratedFormal}"""@nl-BE-x-generated-formal`,
                    `<${ConceptTestBuilder.PROCEDURES[1].id}> <http://purl.org/dc/terms/description> """${ConceptTestBuilder.PROCEDURES[1].description.nlGeneratedInformal}"""@nl-BE-x-generated-informal`,
                    `<${ConceptTestBuilder.PROCEDURES[1].id}> <http://www.w3.org/ns/shacl#order> """1"""^^<http://www.w3.org/2001/XMLSchema#integer>`,
                    `<${ConceptTestBuilder.PROCEDURES[1].id}> <https://productencatalogus.data.vlaanderen.be/ns/ipdc-lpdc#hasWebsite> <${ConceptTestBuilder.PROCEDURES[1].websites[1].id}>`,
                    `<${ConceptTestBuilder.PROCEDURES[1].websites[1].id}> a <http://schema.org/WebSite>`,
                    `<${ConceptTestBuilder.PROCEDURES[1].websites[1].id}> <http://mu.semte.ch/vocabularies/core/uuid> """${ConceptTestBuilder.PROCEDURES[1].websites[1].uuid}"""`,
                    `<${ConceptTestBuilder.PROCEDURES[1].websites[1].id}> <http://purl.org/dc/terms/title> """${ConceptTestBuilder.PROCEDURES[1].websites[1].title.en}"""@EN`,
                    `<${ConceptTestBuilder.PROCEDURES[1].websites[1].id}> <http://purl.org/dc/terms/title> """${ConceptTestBuilder.PROCEDURES[1].websites[1].title.nl}"""@NL`,
                    `<${ConceptTestBuilder.PROCEDURES[1].websites[1].id}> <http://purl.org/dc/terms/title> """${ConceptTestBuilder.PROCEDURES[1].websites[1].title.nlFormal}"""@nl-BE-x-formal`,
                    `<${ConceptTestBuilder.PROCEDURES[1].websites[1].id}> <http://purl.org/dc/terms/title> """${ConceptTestBuilder.PROCEDURES[1].websites[1].title.nlInformal}"""@nl-BE-x-informal`,
                    `<${ConceptTestBuilder.PROCEDURES[1].websites[1].id}> <http://purl.org/dc/terms/title> """${ConceptTestBuilder.PROCEDURES[1].websites[1].title.nlGeneratedFormal}"""@nl-BE-x-generated-formal`,
                    `<${ConceptTestBuilder.PROCEDURES[1].websites[1].id}> <http://purl.org/dc/terms/title> """${ConceptTestBuilder.PROCEDURES[1].websites[1].title.nlGeneratedInformal}"""@nl-BE-x-generated-informal`,
                    `<${ConceptTestBuilder.PROCEDURES[1].websites[1].id}> <http://purl.org/dc/terms/description> """${ConceptTestBuilder.PROCEDURES[1].websites[1].description.en}"""@EN`,
                    `<${ConceptTestBuilder.PROCEDURES[1].websites[1].id}> <http://purl.org/dc/terms/description> """${ConceptTestBuilder.PROCEDURES[1].websites[1].description.nl}"""@NL`,
                    `<${ConceptTestBuilder.PROCEDURES[1].websites[1].id}> <http://purl.org/dc/terms/description> """${ConceptTestBuilder.PROCEDURES[1].websites[1].description.nlFormal}"""@nl-BE-x-formal`,
                    `<${ConceptTestBuilder.PROCEDURES[1].websites[1].id}> <http://purl.org/dc/terms/description> """${ConceptTestBuilder.PROCEDURES[1].websites[1].description.nlInformal}"""@nl-BE-x-informal`,
                    `<${ConceptTestBuilder.PROCEDURES[1].websites[1].id}> <http://purl.org/dc/terms/description> """${ConceptTestBuilder.PROCEDURES[1].websites[1].description.nlGeneratedFormal}"""@nl-BE-x-generated-formal`,
                    `<${ConceptTestBuilder.PROCEDURES[1].websites[1].id}> <http://purl.org/dc/terms/description> """${ConceptTestBuilder.PROCEDURES[1].websites[1].description.nlGeneratedInformal}"""@nl-BE-x-generated-informal`,
                    `<${ConceptTestBuilder.PROCEDURES[1].websites[1].id}> <http://schema.org/url> """${ConceptTestBuilder.PROCEDURES[1].websites[1].url}"""`,
                    `<${ConceptTestBuilder.PROCEDURES[1].websites[1].id}> <http://www.w3.org/ns/shacl#order> """1"""^^<http://www.w3.org/2001/XMLSchema#integer>`,
                    `<${ConceptTestBuilder.PROCEDURES[1].id}> <https://productencatalogus.data.vlaanderen.be/ns/ipdc-lpdc#hasWebsite> <${ConceptTestBuilder.PROCEDURES[1].websites[0].id}>`,
                    `<${ConceptTestBuilder.PROCEDURES[1].websites[0].id}> a <http://schema.org/WebSite>`,
                    `<${ConceptTestBuilder.PROCEDURES[1].websites[0].id}> <http://mu.semte.ch/vocabularies/core/uuid> """${ConceptTestBuilder.PROCEDURES[1].websites[0].uuid}"""`,
                    `<${ConceptTestBuilder.PROCEDURES[1].websites[0].id}> <http://purl.org/dc/terms/title> """${ConceptTestBuilder.PROCEDURES[1].websites[0].title.en}"""@EN`,
                    `<${ConceptTestBuilder.PROCEDURES[1].websites[0].id}> <http://purl.org/dc/terms/title> """${ConceptTestBuilder.PROCEDURES[1].websites[0].title.nl}"""@NL`,
                    `<${ConceptTestBuilder.PROCEDURES[1].websites[0].id}> <http://purl.org/dc/terms/title> """${ConceptTestBuilder.PROCEDURES[1].websites[0].title.nlFormal}"""@nl-BE-x-formal`,
                    `<${ConceptTestBuilder.PROCEDURES[1].websites[0].id}> <http://purl.org/dc/terms/title> """${ConceptTestBuilder.PROCEDURES[1].websites[0].title.nlInformal}"""@nl-BE-x-informal`,
                    `<${ConceptTestBuilder.PROCEDURES[1].websites[0].id}> <http://purl.org/dc/terms/title> """${ConceptTestBuilder.PROCEDURES[1].websites[0].title.nlGeneratedFormal}"""@nl-BE-x-generated-formal`,
                    `<${ConceptTestBuilder.PROCEDURES[1].websites[0].id}> <http://purl.org/dc/terms/title> """${ConceptTestBuilder.PROCEDURES[1].websites[0].title.nlGeneratedInformal}"""@nl-BE-x-generated-informal`,
                    `<${ConceptTestBuilder.PROCEDURES[1].websites[0].id}> <http://purl.org/dc/terms/description> """${ConceptTestBuilder.PROCEDURES[1].websites[0].description.en}"""@EN`,
                    `<${ConceptTestBuilder.PROCEDURES[1].websites[0].id}> <http://purl.org/dc/terms/description> """${ConceptTestBuilder.PROCEDURES[1].websites[0].description.nl}"""@NL`,
                    `<${ConceptTestBuilder.PROCEDURES[1].websites[0].id}> <http://purl.org/dc/terms/description> """${ConceptTestBuilder.PROCEDURES[1].websites[0].description.nlFormal}"""@nl-BE-x-formal`,
                    `<${ConceptTestBuilder.PROCEDURES[1].websites[0].id}> <http://purl.org/dc/terms/description> """${ConceptTestBuilder.PROCEDURES[1].websites[0].description.nlInformal}"""@nl-BE-x-informal`,
                    `<${ConceptTestBuilder.PROCEDURES[1].websites[0].id}> <http://purl.org/dc/terms/description> """${ConceptTestBuilder.PROCEDURES[1].websites[0].description.nlGeneratedFormal}"""@nl-BE-x-generated-formal`,
                    `<${ConceptTestBuilder.PROCEDURES[1].websites[0].id}> <http://purl.org/dc/terms/description> """${ConceptTestBuilder.PROCEDURES[1].websites[0].description.nlGeneratedInformal}"""@nl-BE-x-generated-informal`,
                    `<${ConceptTestBuilder.PROCEDURES[1].websites[0].id}> <http://schema.org/url> """${ConceptTestBuilder.PROCEDURES[1].websites[0].url}"""`,
                    `<${ConceptTestBuilder.PROCEDURES[1].websites[0].id}> <http://www.w3.org/ns/shacl#order> """0"""^^<http://www.w3.org/2001/XMLSchema#integer>`,
                    `<${conceptId}> <http://purl.org/vocab/cpsv#follows> <${ConceptTestBuilder.PROCEDURES[0].id}>`,
                    `<${ConceptTestBuilder.PROCEDURES[0].id}> a <http://purl.org/vocab/cpsv#Rule>`,
                    `<${ConceptTestBuilder.PROCEDURES[0].id}> <http://mu.semte.ch/vocabularies/core/uuid> """${ConceptTestBuilder.PROCEDURES[0].uuid}"""`,
                    `<${ConceptTestBuilder.PROCEDURES[0].id}> <http://purl.org/dc/terms/title> """${ConceptTestBuilder.PROCEDURES[0].title.en}"""@EN`,
                    `<${ConceptTestBuilder.PROCEDURES[0].id}> <http://purl.org/dc/terms/title> """${ConceptTestBuilder.PROCEDURES[0].title.nl}"""@NL`,
                    `<${ConceptTestBuilder.PROCEDURES[0].id}> <http://purl.org/dc/terms/title> """${ConceptTestBuilder.PROCEDURES[0].title.nlFormal}"""@nl-BE-x-formal`,
                    `<${ConceptTestBuilder.PROCEDURES[0].id}> <http://purl.org/dc/terms/title> """${ConceptTestBuilder.PROCEDURES[0].title.nlInformal}"""@nl-BE-x-informal`,
                    `<${ConceptTestBuilder.PROCEDURES[0].id}> <http://purl.org/dc/terms/title> """${ConceptTestBuilder.PROCEDURES[0].title.nlGeneratedFormal}"""@nl-BE-x-generated-formal`,
                    `<${ConceptTestBuilder.PROCEDURES[0].id}> <http://purl.org/dc/terms/title> """${ConceptTestBuilder.PROCEDURES[0].title.nlGeneratedInformal}"""@nl-BE-x-generated-informal`,
                    `<${ConceptTestBuilder.PROCEDURES[0].id}> <http://purl.org/dc/terms/description> """${ConceptTestBuilder.PROCEDURES[0].description.en}"""@EN`,
                    `<${ConceptTestBuilder.PROCEDURES[0].id}> <http://purl.org/dc/terms/description> """${ConceptTestBuilder.PROCEDURES[0].description.nl}"""@NL`,
                    `<${ConceptTestBuilder.PROCEDURES[0].id}> <http://purl.org/dc/terms/description> """${ConceptTestBuilder.PROCEDURES[0].description.nlFormal}"""@nl-BE-x-formal`,
                    `<${ConceptTestBuilder.PROCEDURES[0].id}> <http://purl.org/dc/terms/description> """${ConceptTestBuilder.PROCEDURES[0].description.nlInformal}"""@nl-BE-x-informal`,
                    `<${ConceptTestBuilder.PROCEDURES[0].id}> <http://purl.org/dc/terms/description> """${ConceptTestBuilder.PROCEDURES[0].description.nlGeneratedFormal}"""@nl-BE-x-generated-formal`,
                    `<${ConceptTestBuilder.PROCEDURES[0].id}> <http://purl.org/dc/terms/description> """${ConceptTestBuilder.PROCEDURES[0].description.nlGeneratedInformal}"""@nl-BE-x-generated-informal`,
                    `<${ConceptTestBuilder.PROCEDURES[0].id}> <http://www.w3.org/ns/shacl#order> """0"""^^<http://www.w3.org/2001/XMLSchema#integer>`,
                    `<${ConceptTestBuilder.PROCEDURES[0].id}> <https://productencatalogus.data.vlaanderen.be/ns/ipdc-lpdc#hasWebsite> <${ConceptTestBuilder.PROCEDURES[0].websites[1].id}>`,
                    `<${ConceptTestBuilder.PROCEDURES[0].websites[1].id}> a <http://schema.org/WebSite>`,
                    `<${ConceptTestBuilder.PROCEDURES[0].websites[1].id}> <http://mu.semte.ch/vocabularies/core/uuid> """${ConceptTestBuilder.PROCEDURES[0].websites[1].uuid}"""`,
                    `<${ConceptTestBuilder.PROCEDURES[0].websites[1].id}> <http://purl.org/dc/terms/title> """${ConceptTestBuilder.PROCEDURES[0].websites[1].title.en}"""@EN`,
                    `<${ConceptTestBuilder.PROCEDURES[0].websites[1].id}> <http://purl.org/dc/terms/title> """${ConceptTestBuilder.PROCEDURES[0].websites[1].title.nl}"""@NL`,
                    `<${ConceptTestBuilder.PROCEDURES[0].websites[1].id}> <http://purl.org/dc/terms/title> """${ConceptTestBuilder.PROCEDURES[0].websites[1].title.nlFormal}"""@nl-BE-x-formal`,
                    `<${ConceptTestBuilder.PROCEDURES[0].websites[1].id}> <http://purl.org/dc/terms/title> """${ConceptTestBuilder.PROCEDURES[0].websites[1].title.nlInformal}"""@nl-BE-x-informal`,
                    `<${ConceptTestBuilder.PROCEDURES[0].websites[1].id}> <http://purl.org/dc/terms/title> """${ConceptTestBuilder.PROCEDURES[0].websites[1].title.nlGeneratedFormal}"""@nl-BE-x-generated-formal`,
                    `<${ConceptTestBuilder.PROCEDURES[0].websites[1].id}> <http://purl.org/dc/terms/title> """${ConceptTestBuilder.PROCEDURES[0].websites[1].title.nlGeneratedInformal}"""@nl-BE-x-generated-informal`,
                    `<${ConceptTestBuilder.PROCEDURES[0].websites[1].id}> <http://purl.org/dc/terms/description> """${ConceptTestBuilder.PROCEDURES[0].websites[1].description.en}"""@EN`,
                    `<${ConceptTestBuilder.PROCEDURES[0].websites[1].id}> <http://purl.org/dc/terms/description> """${ConceptTestBuilder.PROCEDURES[0].websites[1].description.nl}"""@NL`,
                    `<${ConceptTestBuilder.PROCEDURES[0].websites[1].id}> <http://purl.org/dc/terms/description> """${ConceptTestBuilder.PROCEDURES[0].websites[1].description.nlFormal}"""@nl-BE-x-formal`,
                    `<${ConceptTestBuilder.PROCEDURES[0].websites[1].id}> <http://purl.org/dc/terms/description> """${ConceptTestBuilder.PROCEDURES[0].websites[1].description.nlInformal}"""@nl-BE-x-informal`,
                    `<${ConceptTestBuilder.PROCEDURES[0].websites[1].id}> <http://purl.org/dc/terms/description> """${ConceptTestBuilder.PROCEDURES[0].websites[1].description.nlGeneratedFormal}"""@nl-BE-x-generated-formal`,
                    `<${ConceptTestBuilder.PROCEDURES[0].websites[1].id}> <http://purl.org/dc/terms/description> """${ConceptTestBuilder.PROCEDURES[0].websites[1].description.nlGeneratedInformal}"""@nl-BE-x-generated-informal`,
                    `<${ConceptTestBuilder.PROCEDURES[0].websites[1].id}> <http://schema.org/url> """${ConceptTestBuilder.PROCEDURES[0].websites[1].url}"""`,
                    `<${ConceptTestBuilder.PROCEDURES[0].websites[1].id}> <http://www.w3.org/ns/shacl#order> """1"""^^<http://www.w3.org/2001/XMLSchema#integer>`,
                    `<${ConceptTestBuilder.PROCEDURES[0].id}> <https://productencatalogus.data.vlaanderen.be/ns/ipdc-lpdc#hasWebsite> <${ConceptTestBuilder.PROCEDURES[0].websites[0].id}>`,
                    `<${ConceptTestBuilder.PROCEDURES[0].websites[0].id}> a <http://schema.org/WebSite>`,
                    `<${ConceptTestBuilder.PROCEDURES[0].websites[0].id}> <http://mu.semte.ch/vocabularies/core/uuid> """${ConceptTestBuilder.PROCEDURES[0].websites[0].uuid}"""`,
                    `<${ConceptTestBuilder.PROCEDURES[0].websites[0].id}> <http://purl.org/dc/terms/title> """${ConceptTestBuilder.PROCEDURES[0].websites[0].title.en}"""@EN`,
                    `<${ConceptTestBuilder.PROCEDURES[0].websites[0].id}> <http://purl.org/dc/terms/title> """${ConceptTestBuilder.PROCEDURES[0].websites[0].title.nl}"""@NL`,
                    `<${ConceptTestBuilder.PROCEDURES[0].websites[0].id}> <http://purl.org/dc/terms/title> """${ConceptTestBuilder.PROCEDURES[0].websites[0].title.nlFormal}"""@nl-BE-x-formal`,
                    `<${ConceptTestBuilder.PROCEDURES[0].websites[0].id}> <http://purl.org/dc/terms/title> """${ConceptTestBuilder.PROCEDURES[0].websites[0].title.nlInformal}"""@nl-BE-x-informal`,
                    `<${ConceptTestBuilder.PROCEDURES[0].websites[0].id}> <http://purl.org/dc/terms/title> """${ConceptTestBuilder.PROCEDURES[0].websites[0].title.nlGeneratedFormal}"""@nl-BE-x-generated-formal`,
                    `<${ConceptTestBuilder.PROCEDURES[0].websites[0].id}> <http://purl.org/dc/terms/title> """${ConceptTestBuilder.PROCEDURES[0].websites[0].title.nlGeneratedInformal}"""@nl-BE-x-generated-informal`,
                    `<${ConceptTestBuilder.PROCEDURES[0].websites[0].id}> <http://purl.org/dc/terms/description> """${ConceptTestBuilder.PROCEDURES[0].websites[0].description.en}"""@EN`,
                    `<${ConceptTestBuilder.PROCEDURES[0].websites[0].id}> <http://purl.org/dc/terms/description> """${ConceptTestBuilder.PROCEDURES[0].websites[0].description.nl}"""@NL`,
                    `<${ConceptTestBuilder.PROCEDURES[0].websites[0].id}> <http://purl.org/dc/terms/description> """${ConceptTestBuilder.PROCEDURES[0].websites[0].description.nlFormal}"""@nl-BE-x-formal`,
                    `<${ConceptTestBuilder.PROCEDURES[0].websites[0].id}> <http://purl.org/dc/terms/description> """${ConceptTestBuilder.PROCEDURES[0].websites[0].description.nlInformal}"""@nl-BE-x-informal`,
                    `<${ConceptTestBuilder.PROCEDURES[0].websites[0].id}> <http://purl.org/dc/terms/description> """${ConceptTestBuilder.PROCEDURES[0].websites[0].description.nlGeneratedFormal}"""@nl-BE-x-generated-formal`,
                    `<${ConceptTestBuilder.PROCEDURES[0].websites[0].id}> <http://purl.org/dc/terms/description> """${ConceptTestBuilder.PROCEDURES[0].websites[0].description.nlGeneratedInformal}"""@nl-BE-x-generated-informal`,
                    `<${ConceptTestBuilder.PROCEDURES[0].websites[0].id}> <http://schema.org/url> """${ConceptTestBuilder.PROCEDURES[0].websites[0].url}"""`,
                    `<${ConceptTestBuilder.PROCEDURES[0].websites[0].id}> <http://www.w3.org/ns/shacl#order> """0"""^^<http://www.w3.org/2001/XMLSchema#integer>`,
                    `<${conceptId}> <http://www.w3.org/2000/01/rdf-schema#seeAlso> <${ConceptTestBuilder.WEBSITES[1].id}>`,
                    `<${ConceptTestBuilder.WEBSITES[1].id}> a <http://schema.org/WebSite>`,
                    `<${ConceptTestBuilder.WEBSITES[1].id}> <http://mu.semte.ch/vocabularies/core/uuid> """${ConceptTestBuilder.WEBSITES[1].uuid}"""`,
                    `<${ConceptTestBuilder.WEBSITES[1].id}> <http://purl.org/dc/terms/title> """${ConceptTestBuilder.WEBSITES[1].title.en}"""@EN`,
                    `<${ConceptTestBuilder.WEBSITES[1].id}> <http://purl.org/dc/terms/title> """${ConceptTestBuilder.WEBSITES[1].title.nl}"""@NL`,
                    `<${ConceptTestBuilder.WEBSITES[1].id}> <http://purl.org/dc/terms/title> """${ConceptTestBuilder.WEBSITES[1].title.nlFormal}"""@nl-BE-x-formal`,
                    `<${ConceptTestBuilder.WEBSITES[1].id}> <http://purl.org/dc/terms/title> """${ConceptTestBuilder.WEBSITES[1].title.nlInformal}"""@nl-BE-x-informal`,
                    `<${ConceptTestBuilder.WEBSITES[1].id}> <http://purl.org/dc/terms/title> """${ConceptTestBuilder.WEBSITES[1].title.nlGeneratedFormal}"""@nl-BE-x-generated-formal`,
                    `<${ConceptTestBuilder.WEBSITES[1].id}> <http://purl.org/dc/terms/title> """${ConceptTestBuilder.WEBSITES[1].title.nlGeneratedInformal}"""@nl-BE-x-generated-informal`,
                    `<${ConceptTestBuilder.WEBSITES[1].id}> <http://purl.org/dc/terms/description> """${ConceptTestBuilder.WEBSITES[1].description.en}"""@EN`,
                    `<${ConceptTestBuilder.WEBSITES[1].id}> <http://purl.org/dc/terms/description> """${ConceptTestBuilder.WEBSITES[1].description.nl}"""@NL`,
                    `<${ConceptTestBuilder.WEBSITES[1].id}> <http://purl.org/dc/terms/description> """${ConceptTestBuilder.WEBSITES[1].description.nlFormal}"""@nl-BE-x-formal`,
                    `<${ConceptTestBuilder.WEBSITES[1].id}> <http://purl.org/dc/terms/description> """${ConceptTestBuilder.WEBSITES[1].description.nlInformal}"""@nl-BE-x-informal`,
                    `<${ConceptTestBuilder.WEBSITES[1].id}> <http://purl.org/dc/terms/description> """${ConceptTestBuilder.WEBSITES[1].description.nlGeneratedFormal}"""@nl-BE-x-generated-formal`,
                    `<${ConceptTestBuilder.WEBSITES[1].id}> <http://purl.org/dc/terms/description> """${ConceptTestBuilder.WEBSITES[1].description.nlGeneratedInformal}"""@nl-BE-x-generated-informal`,
                    `<${ConceptTestBuilder.WEBSITES[1].id}> <http://schema.org/url> """${ConceptTestBuilder.WEBSITES[1].url}"""`,
                    `<${ConceptTestBuilder.WEBSITES[1].id}> <http://www.w3.org/ns/shacl#order> """1"""^^<http://www.w3.org/2001/XMLSchema#integer>`,
                    `<${conceptId}> <http://www.w3.org/2000/01/rdf-schema#seeAlso> <${ConceptTestBuilder.WEBSITES[0].id}>`,
                    `<${ConceptTestBuilder.WEBSITES[0].id}> a <http://schema.org/WebSite>`,
                    `<${ConceptTestBuilder.WEBSITES[0].id}> <http://mu.semte.ch/vocabularies/core/uuid> """${ConceptTestBuilder.WEBSITES[0].uuid}"""`,
                    `<${ConceptTestBuilder.WEBSITES[0].id}> <http://purl.org/dc/terms/title> """${ConceptTestBuilder.WEBSITES[0].title.en}"""@EN`,
                    `<${ConceptTestBuilder.WEBSITES[0].id}> <http://purl.org/dc/terms/title> """${ConceptTestBuilder.WEBSITES[0].title.nl}"""@NL`,
                    `<${ConceptTestBuilder.WEBSITES[0].id}> <http://purl.org/dc/terms/title> """${ConceptTestBuilder.WEBSITES[0].title.nlFormal}"""@nl-BE-x-formal`,
                    `<${ConceptTestBuilder.WEBSITES[0].id}> <http://purl.org/dc/terms/title> """${ConceptTestBuilder.WEBSITES[0].title.nlInformal}"""@nl-BE-x-informal`,
                    `<${ConceptTestBuilder.WEBSITES[0].id}> <http://purl.org/dc/terms/title> """${ConceptTestBuilder.WEBSITES[0].title.nlGeneratedFormal}"""@nl-BE-x-generated-formal`,
                    `<${ConceptTestBuilder.WEBSITES[0].id}> <http://purl.org/dc/terms/title> """${ConceptTestBuilder.WEBSITES[0].title.nlGeneratedInformal}"""@nl-BE-x-generated-informal`,
                    `<${ConceptTestBuilder.WEBSITES[0].id}> <http://purl.org/dc/terms/description> """${ConceptTestBuilder.WEBSITES[0].description.en}"""@EN`,
                    `<${ConceptTestBuilder.WEBSITES[0].id}> <http://purl.org/dc/terms/description> """${ConceptTestBuilder.WEBSITES[0].description.nl}"""@NL`,
                    `<${ConceptTestBuilder.WEBSITES[0].id}> <http://purl.org/dc/terms/description> """${ConceptTestBuilder.WEBSITES[0].description.nlFormal}"""@nl-BE-x-formal`,
                    `<${ConceptTestBuilder.WEBSITES[0].id}> <http://purl.org/dc/terms/description> """${ConceptTestBuilder.WEBSITES[0].description.nlInformal}"""@nl-BE-x-informal`,
                    `<${ConceptTestBuilder.WEBSITES[0].id}> <http://purl.org/dc/terms/description> """${ConceptTestBuilder.WEBSITES[0].description.nlGeneratedFormal}"""@nl-BE-x-generated-formal`,
                    `<${ConceptTestBuilder.WEBSITES[0].id}> <http://purl.org/dc/terms/description> """${ConceptTestBuilder.WEBSITES[0].description.nlGeneratedInformal}"""@nl-BE-x-generated-informal`,
                    `<${ConceptTestBuilder.WEBSITES[0].id}> <http://schema.org/url> """${ConceptTestBuilder.WEBSITES[0].url}"""`,
                    `<${ConceptTestBuilder.WEBSITES[0].id}> <http://www.w3.org/ns/shacl#order> """0"""^^<http://www.w3.org/2001/XMLSchema#integer>`,
                    `<${conceptId}> <http://data.europa.eu/m8g/hasCost> <${ConceptTestBuilder.COSTS[1].id}>`,
                    `<${ConceptTestBuilder.COSTS[1].id}> a <http://data.europa.eu/m8g/Cost>`,
                    `<${ConceptTestBuilder.COSTS[1].id}> <http://mu.semte.ch/vocabularies/core/uuid> """${ConceptTestBuilder.COSTS[1].uuid}"""`,
                    `<${ConceptTestBuilder.COSTS[1].id}> <http://purl.org/dc/terms/title> """${ConceptTestBuilder.COSTS[1].title.en}"""@EN`,
                    `<${ConceptTestBuilder.COSTS[1].id}> <http://purl.org/dc/terms/title> """${ConceptTestBuilder.COSTS[1].title.nl}"""@NL`,
                    `<${ConceptTestBuilder.COSTS[1].id}> <http://purl.org/dc/terms/title> """${ConceptTestBuilder.COSTS[1].title.nlFormal}"""@nl-BE-x-formal`,
                    `<${ConceptTestBuilder.COSTS[1].id}> <http://purl.org/dc/terms/title> """${ConceptTestBuilder.COSTS[1].title.nlInformal}"""@nl-BE-x-informal`,
                    `<${ConceptTestBuilder.COSTS[1].id}> <http://purl.org/dc/terms/title> """${ConceptTestBuilder.COSTS[1].title.nlGeneratedFormal}"""@nl-BE-x-generated-formal`,
                    `<${ConceptTestBuilder.COSTS[1].id}> <http://purl.org/dc/terms/title> """${ConceptTestBuilder.COSTS[1].title.nlGeneratedInformal}"""@nl-BE-x-generated-informal`,
                    `<${ConceptTestBuilder.COSTS[1].id}> <http://purl.org/dc/terms/description> """${ConceptTestBuilder.COSTS[1].description.en}"""@EN`,
                    `<${ConceptTestBuilder.COSTS[1].id}> <http://purl.org/dc/terms/description> """${ConceptTestBuilder.COSTS[1].description.nl}"""@NL`,
                    `<${ConceptTestBuilder.COSTS[1].id}> <http://purl.org/dc/terms/description> """${ConceptTestBuilder.COSTS[1].description.nlFormal}"""@nl-BE-x-formal`,
                    `<${ConceptTestBuilder.COSTS[1].id}> <http://purl.org/dc/terms/description> """${ConceptTestBuilder.COSTS[1].description.nlInformal}"""@nl-BE-x-informal`,
                    `<${ConceptTestBuilder.COSTS[1].id}> <http://purl.org/dc/terms/description> """${ConceptTestBuilder.COSTS[1].description.nlGeneratedFormal}"""@nl-BE-x-generated-formal`,
                    `<${ConceptTestBuilder.COSTS[1].id}> <http://purl.org/dc/terms/description> """${ConceptTestBuilder.COSTS[1].description.nlGeneratedInformal}"""@nl-BE-x-generated-informal`,
                    `<${ConceptTestBuilder.COSTS[1].id}> <http://www.w3.org/ns/shacl#order> """1"""^^<http://www.w3.org/2001/XMLSchema#integer>`,
                    `<${conceptId}> <http://data.europa.eu/m8g/hasCost> <${ConceptTestBuilder.COSTS[0].id}>`,
                    `<${ConceptTestBuilder.COSTS[0].id}> a <http://data.europa.eu/m8g/Cost>`,
                    `<${ConceptTestBuilder.COSTS[0].id}> <http://mu.semte.ch/vocabularies/core/uuid> """${ConceptTestBuilder.COSTS[0].uuid}"""`,
                    `<${ConceptTestBuilder.COSTS[0].id}> <http://purl.org/dc/terms/title> """${ConceptTestBuilder.COSTS[0].title.en}"""@EN`,
                    `<${ConceptTestBuilder.COSTS[0].id}> <http://purl.org/dc/terms/title> """${ConceptTestBuilder.COSTS[0].title.nl}"""@NL`,
                    `<${ConceptTestBuilder.COSTS[0].id}> <http://purl.org/dc/terms/title> """${ConceptTestBuilder.COSTS[0].title.nlFormal}"""@nl-BE-x-formal`,
                    `<${ConceptTestBuilder.COSTS[0].id}> <http://purl.org/dc/terms/title> """${ConceptTestBuilder.COSTS[0].title.nlInformal}"""@nl-BE-x-informal`,
                    `<${ConceptTestBuilder.COSTS[0].id}> <http://purl.org/dc/terms/title> """${ConceptTestBuilder.COSTS[0].title.nlGeneratedFormal}"""@nl-BE-x-generated-formal`,
                    `<${ConceptTestBuilder.COSTS[0].id}> <http://purl.org/dc/terms/title> """${ConceptTestBuilder.COSTS[0].title.nlGeneratedInformal}"""@nl-BE-x-generated-informal`,
                    `<${ConceptTestBuilder.COSTS[0].id}> <http://purl.org/dc/terms/description> """${ConceptTestBuilder.COSTS[0].description.en}"""@EN`,
                    `<${ConceptTestBuilder.COSTS[0].id}> <http://purl.org/dc/terms/description> """${ConceptTestBuilder.COSTS[0].description.nl}"""@NL`,
                    `<${ConceptTestBuilder.COSTS[0].id}> <http://purl.org/dc/terms/description> """${ConceptTestBuilder.COSTS[0].description.nlFormal}"""@nl-BE-x-formal`,
                    `<${ConceptTestBuilder.COSTS[0].id}> <http://purl.org/dc/terms/description> """${ConceptTestBuilder.COSTS[0].description.nlInformal}"""@nl-BE-x-informal`,
                    `<${ConceptTestBuilder.COSTS[0].id}> <http://purl.org/dc/terms/description> """${ConceptTestBuilder.COSTS[0].description.nlGeneratedFormal}"""@nl-BE-x-generated-formal`,
                    `<${ConceptTestBuilder.COSTS[0].id}> <http://purl.org/dc/terms/description> """${ConceptTestBuilder.COSTS[0].description.nlGeneratedInformal}"""@nl-BE-x-generated-informal`,
                    `<${ConceptTestBuilder.COSTS[0].id}> <http://www.w3.org/ns/shacl#order> """0"""^^<http://www.w3.org/2001/XMLSchema#integer>`,
                    `<${conceptId}> <http://purl.org/vocab/cpsv#produces> <${ConceptTestBuilder.FINANCIAL_ADVANTAGES[1].id}>`,
                    `<${ConceptTestBuilder.FINANCIAL_ADVANTAGES[1].id}> a <https://productencatalogus.data.vlaanderen.be/ns/ipdc-lpdc#FinancialAdvantage>`,
                    `<${ConceptTestBuilder.FINANCIAL_ADVANTAGES[1].id}> <http://mu.semte.ch/vocabularies/core/uuid> """${ConceptTestBuilder.FINANCIAL_ADVANTAGES[1].uuid}"""`,
                    `<${ConceptTestBuilder.FINANCIAL_ADVANTAGES[1].id}> <http://purl.org/dc/terms/title> """${ConceptTestBuilder.FINANCIAL_ADVANTAGES[1].title.en}"""@EN`,
                    `<${ConceptTestBuilder.FINANCIAL_ADVANTAGES[1].id}> <http://purl.org/dc/terms/title> """${ConceptTestBuilder.FINANCIAL_ADVANTAGES[1].title.nl}"""@NL`,
                    `<${ConceptTestBuilder.FINANCIAL_ADVANTAGES[1].id}> <http://purl.org/dc/terms/title> """${ConceptTestBuilder.FINANCIAL_ADVANTAGES[1].title.nlFormal}"""@nl-BE-x-formal`,
                    `<${ConceptTestBuilder.FINANCIAL_ADVANTAGES[1].id}> <http://purl.org/dc/terms/title> """${ConceptTestBuilder.FINANCIAL_ADVANTAGES[1].title.nlInformal}"""@nl-BE-x-informal`,
                    `<${ConceptTestBuilder.FINANCIAL_ADVANTAGES[1].id}> <http://purl.org/dc/terms/title> """${ConceptTestBuilder.FINANCIAL_ADVANTAGES[1].title.nlGeneratedFormal}"""@nl-BE-x-generated-formal`,
                    `<${ConceptTestBuilder.FINANCIAL_ADVANTAGES[1].id}> <http://purl.org/dc/terms/title> """${ConceptTestBuilder.FINANCIAL_ADVANTAGES[1].title.nlGeneratedInformal}"""@nl-BE-x-generated-informal`,
                    `<${ConceptTestBuilder.FINANCIAL_ADVANTAGES[1].id}> <http://purl.org/dc/terms/description> """${ConceptTestBuilder.FINANCIAL_ADVANTAGES[1].description.en}"""@EN`,
                    `<${ConceptTestBuilder.FINANCIAL_ADVANTAGES[1].id}> <http://purl.org/dc/terms/description> """${ConceptTestBuilder.FINANCIAL_ADVANTAGES[1].description.nl}"""@NL`,
                    `<${ConceptTestBuilder.FINANCIAL_ADVANTAGES[1].id}> <http://purl.org/dc/terms/description> """${ConceptTestBuilder.FINANCIAL_ADVANTAGES[1].description.nlFormal}"""@nl-BE-x-formal`,
                    `<${ConceptTestBuilder.FINANCIAL_ADVANTAGES[1].id}> <http://purl.org/dc/terms/description> """${ConceptTestBuilder.FINANCIAL_ADVANTAGES[1].description.nlInformal}"""@nl-BE-x-informal`,
                    `<${ConceptTestBuilder.FINANCIAL_ADVANTAGES[1].id}> <http://purl.org/dc/terms/description> """${ConceptTestBuilder.FINANCIAL_ADVANTAGES[1].description.nlGeneratedFormal}"""@nl-BE-x-generated-formal`,
                    `<${ConceptTestBuilder.FINANCIAL_ADVANTAGES[1].id}> <http://purl.org/dc/terms/description> """${ConceptTestBuilder.FINANCIAL_ADVANTAGES[1].description.nlGeneratedInformal}"""@nl-BE-x-generated-informal`,
                    `<${ConceptTestBuilder.FINANCIAL_ADVANTAGES[1].id}> <http://www.w3.org/ns/shacl#order> """1"""^^<http://www.w3.org/2001/XMLSchema#integer>`,
                    `<${conceptId}> <http://purl.org/vocab/cpsv#produces> <${ConceptTestBuilder.FINANCIAL_ADVANTAGES[0].id}>`,
                    `<${ConceptTestBuilder.FINANCIAL_ADVANTAGES[0].id}> a <https://productencatalogus.data.vlaanderen.be/ns/ipdc-lpdc#FinancialAdvantage>`,
                    `<${ConceptTestBuilder.FINANCIAL_ADVANTAGES[0].id}> <http://mu.semte.ch/vocabularies/core/uuid> """${ConceptTestBuilder.FINANCIAL_ADVANTAGES[0].uuid}"""`,
                    `<${ConceptTestBuilder.FINANCIAL_ADVANTAGES[0].id}> <http://purl.org/dc/terms/title> """${ConceptTestBuilder.FINANCIAL_ADVANTAGES[0].title.en}"""@EN`,
                    `<${ConceptTestBuilder.FINANCIAL_ADVANTAGES[0].id}> <http://purl.org/dc/terms/title> """${ConceptTestBuilder.FINANCIAL_ADVANTAGES[0].title.nl}"""@NL`,
                    `<${ConceptTestBuilder.FINANCIAL_ADVANTAGES[0].id}> <http://purl.org/dc/terms/title> """${ConceptTestBuilder.FINANCIAL_ADVANTAGES[0].title.nlFormal}"""@nl-BE-x-formal`,
                    `<${ConceptTestBuilder.FINANCIAL_ADVANTAGES[0].id}> <http://purl.org/dc/terms/title> """${ConceptTestBuilder.FINANCIAL_ADVANTAGES[0].title.nlInformal}"""@nl-BE-x-informal`,
                    `<${ConceptTestBuilder.FINANCIAL_ADVANTAGES[0].id}> <http://purl.org/dc/terms/title> """${ConceptTestBuilder.FINANCIAL_ADVANTAGES[0].title.nlGeneratedFormal}"""@nl-BE-x-generated-formal`,
                    `<${ConceptTestBuilder.FINANCIAL_ADVANTAGES[0].id}> <http://purl.org/dc/terms/title> """${ConceptTestBuilder.FINANCIAL_ADVANTAGES[0].title.nlGeneratedInformal}"""@nl-BE-x-generated-informal`,
                    `<${ConceptTestBuilder.FINANCIAL_ADVANTAGES[0].id}> <http://purl.org/dc/terms/description> """${ConceptTestBuilder.FINANCIAL_ADVANTAGES[0].description.en}"""@EN`,
                    `<${ConceptTestBuilder.FINANCIAL_ADVANTAGES[0].id}> <http://purl.org/dc/terms/description> """${ConceptTestBuilder.FINANCIAL_ADVANTAGES[0].description.nl}"""@NL`,
                    `<${ConceptTestBuilder.FINANCIAL_ADVANTAGES[0].id}> <http://purl.org/dc/terms/description> """${ConceptTestBuilder.FINANCIAL_ADVANTAGES[0].description.nlFormal}"""@nl-BE-x-formal`,
                    `<${ConceptTestBuilder.FINANCIAL_ADVANTAGES[0].id}> <http://purl.org/dc/terms/description> """${ConceptTestBuilder.FINANCIAL_ADVANTAGES[0].description.nlInformal}"""@nl-BE-x-informal`,
                    `<${ConceptTestBuilder.FINANCIAL_ADVANTAGES[0].id}> <http://purl.org/dc/terms/description> """${ConceptTestBuilder.FINANCIAL_ADVANTAGES[0].description.nlGeneratedFormal}"""@nl-BE-x-generated-formal`,
                    `<${ConceptTestBuilder.FINANCIAL_ADVANTAGES[0].id}> <http://purl.org/dc/terms/description> """${ConceptTestBuilder.FINANCIAL_ADVANTAGES[0].description.nlGeneratedInformal}"""@nl-BE-x-generated-informal`,
                    `<${ConceptTestBuilder.FINANCIAL_ADVANTAGES[0].id}> <http://www.w3.org/ns/shacl#order> """0"""^^<http://www.w3.org/2001/XMLSchema#integer>`,
                    `<${conceptId}> <http://schema.org/productID> """${ConceptTestBuilder.PRODUCT_ID}"""`,
                    `<${conceptId}> <https://productencatalogus.data.vlaanderen.be/ns/ipdc-lpdc#hasWebsite> <${ConceptTestBuilder.PROCEDURES[0].websites[0].id}>`,
                    `<${conceptId}> <https://productencatalogus.data.vlaanderen.be/ns/ipdc-lpdc#hasConceptDisplayConfiguration> <${conceptDisplayConfigurationId}>`,
                    `<${conceptDisplayConfigurationId}> a <https://productencatalogus.data.vlaanderen.be/ns/ipdc-lpdc#ConceptDisplayConfiguration>`,
                    `<${conceptId}> <http://mu.semte.ch/vocabularies/ext/hasVersionedSource> <${concept.latestConceptSnapshot}>`,
                    `<${conceptId}> <http://mu.semte.ch/vocabularies/ext/previousVersionedSource> <${Array.from(concept.previousConceptSnapshots)[0]}>`,
                    `<${conceptId}> <http://mu.semte.ch/vocabularies/ext/previousVersionedSource> <${Array.from(concept.previousConceptSnapshots)[1]}>`,
                    `<${conceptId}> <http://mu.semte.ch/vocabularies/ext/previousVersionedSource> <${Array.from(concept.previousConceptSnapshots)[2]}>`,
                    `<${conceptId}> <https://productencatalogus.data.vlaanderen.be/ns/ipdc-lpdc#hasLatestFunctionalChange> <${concept.latestFunctionallyChangedConceptSnapshot}>`,
                    `<${conceptId}> <https://productencatalogus.data.vlaanderen.be/ns/ipdc-lpdc#conceptTag> <${NS.concept.conceptTag(Array.from(ConceptTestBuilder.CONCEPT_TAGS)[0]).value}>`,
                    `<${conceptId}> <https://productencatalogus.data.vlaanderen.be/ns/ipdc-lpdc#conceptTag> <${NS.concept.conceptTag(Array.from(ConceptTestBuilder.CONCEPT_TAGS)[1]).value}>`,
                    `<${conceptId}> <http://www.w3.org/ns/adms#status> <http://lblod.data.gift/concepts/3f2666df-1dae-4cc2-a8dc-e8213e713081>`,
                    `<${conceptId}> <http://data.europa.eu/m8g/hasLegalResource> <${Array.from(ConceptTestBuilder.LEGAL_RESOURCES)[0]}>`,
                    `<${conceptId}> <http://data.europa.eu/m8g/hasLegalResource> <${Array.from(ConceptTestBuilder.LEGAL_RESOURCES)[1]}>`,
                    `<${conceptId}> <http://data.europa.eu/m8g/hasLegalResource> <${Array.from(ConceptTestBuilder.LEGAL_RESOURCES)[2]}>`,
                ]);

            const actualConcept = await repository.findById(conceptId);

            expect(actualConcept).toEqual(concept);
        });

    });
});