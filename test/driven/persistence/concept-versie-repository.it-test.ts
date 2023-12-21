import {TEST_SPARQL_ENDPOINT} from "../../test.config";
import {DirectDatabaseAccess} from "./direct-database-access";
import {uuid} from "../../../mu-helper";
import {ConceptVersieTestBuilder} from "../../core/domain/concept-versie-test-builder";
import {ConceptVersieSparqlTestRepository} from "./concept-versie-sparql-test-repository";
import {TaalString} from "../../../src/core/domain/taal-string";

describe('ConceptVersieRepository', () => {
    const repository = new ConceptVersieSparqlTestRepository(TEST_SPARQL_ENDPOINT);
    const directDatabaseAccess = new DirectDatabaseAccess(TEST_SPARQL_ENDPOINT);

    describe('findById', () => {

        test('When full concept versie exists with id, then return concept versie', async () => {
            const conceptVersie = ConceptVersieTestBuilder.aFullConceptVersie().build();
            await repository.save(conceptVersie);

            const anotherConceptVersie = ConceptVersieTestBuilder.aFullConceptVersie().build();
            await repository.save(anotherConceptVersie);

            const actualConceptVersie = await repository.findById(conceptVersie.id);

            expect(actualConceptVersie).toEqual(conceptVersie);
        });

        test('When minimal concept versie exists with id, then return concept versie', async () => {
            const conceptVersie = ConceptVersieTestBuilder.aMinimalConceptVersie().build();
            await repository.save(conceptVersie);

            const anotherConceptVersie = ConceptVersieTestBuilder.aMinimalConceptVersie().build();
            await repository.save(anotherConceptVersie);

            const actualConceptVersie = await repository.findById(conceptVersie.id);

            expect(actualConceptVersie).toEqual(conceptVersie);
        });

        test('When minimal concept versie with incomplete title exists with id, then return concept versie', async () => {
            const conceptVersie = ConceptVersieTestBuilder.aMinimalConceptVersie().withTitle(TaalString.of(undefined, ConceptVersieTestBuilder.TITLE_NL)).build();
            await repository.save(conceptVersie);

            const anotherConceptVersie = ConceptVersieTestBuilder.aMinimalConceptVersie().build();
            await repository.save(anotherConceptVersie);

            const actualConceptVersie = await repository.findById(conceptVersie.id);

            expect(actualConceptVersie).toEqual(conceptVersie);
        });

        test('When concept versie does not exist with id, then throw error', async () => {
            const conceptVersie = ConceptVersieTestBuilder.aFullConceptVersie().build();
            await repository.save(conceptVersie);

            const nonExistentConceptVersieId = ConceptVersieTestBuilder.buildIri('thisiddoesnotexist');

            await expect(repository.findById(nonExistentConceptVersieId)).rejects.toThrow(new Error(`no concept versie found for iri: ${nonExistentConceptVersieId}`));
        });
    });

    describe('Verify ontology and mapping', () => {

        test('Verify minimal mappings', async () => {
            const conceptVersieId = `https://ipdc.tni-vlaanderen.be/id/conceptsnapshot/${uuid()}`;

            const conceptVersie =
                ConceptVersieTestBuilder
                    .aMinimalConceptVersie()
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
                ConceptVersieTestBuilder
                    .aMinimalConceptVersie()
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

        test('Verify full mappings', async () => {
            const conceptVersieId = `https://ipdc.tni-vlaanderen.be/id/conceptsnapshot/${uuid()}`;

            const conceptVersie =
                ConceptVersieTestBuilder
                    .aFullConceptVersie()
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
                ]);

            const actualConceptVersie = await repository.findById(conceptVersieId);

            expect(actualConceptVersie).toEqual(conceptVersie);
        });
    });
});