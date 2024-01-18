import {TEST_SPARQL_ENDPOINT} from "../../test.config";
import {DirectDatabaseAccess} from "./direct-database-access";
import {FormalInformalChoiceSparqlTestRepository} from "./formal-informal-choice-sparql-test-repository";
import {aBestuurseenheid} from "../../core/domain/bestuureenheid-test-builder";
import {aFormalInformalChoice} from "../../core/domain/formal-informal-choice-test-builder";
import {buildBestuurseenheidIri, buildFormalInformalChoiceIri} from "../../core/domain/iri-test-builder";
import {uuid} from "../../../mu-helper";
import {PREFIX} from "../../../config";
import {BestuurseenheidSparqlTestRepository} from "./bestuurseenheid-sparql-test-repository";
import {FormatPreservingDate} from "../../../src/core/domain/format-preserving-date";
import {ChosenFormType} from "../../../src/core/domain/types";

describe('FormalInformalChoiceRepository', () => {

    const repository = new FormalInformalChoiceSparqlTestRepository(TEST_SPARQL_ENDPOINT);
    const bestuurseenheidRepository = new BestuurseenheidSparqlTestRepository(TEST_SPARQL_ENDPOINT);
    const directDatabaseAccess = new DirectDatabaseAccess(TEST_SPARQL_ENDPOINT);

    describe('findById', () => {

        test('When formal informal choice exists with id, then return formal informal choice', async () => {
            const bestuurseenheid = aBestuurseenheid().build();

            const formalInformalChoice = aFormalInformalChoice().withBestuurseenheidId(bestuurseenheid.id).build();
            await repository.save(bestuurseenheid, formalInformalChoice);

            const anotherBestuurseenheid = aBestuurseenheid().build();
            const anotherFormalInformalChoice = aFormalInformalChoice().withBestuurseenheidId(anotherBestuurseenheid.id).build();
            await repository.save(anotherBestuurseenheid, anotherFormalInformalChoice);

            const actualFormalInformalChoice = await repository.findByBestuurseenheid(bestuurseenheid);

            expect(actualFormalInformalChoice).toEqual(formalInformalChoice);
        });

        test('When formal informal choice not made yet for bestuurseenheid, then return undefined', async () => {
            const bestuurseenheid = aBestuurseenheid().build();

            const actualFormalInformalChoice = await repository.findByBestuurseenheid(bestuurseenheid);

            expect(actualFormalInformalChoice).toBeUndefined();
        });

    });

    describe('Verify ontology and mapping', () => {

        test('Verify mappings', async () => {
            const bestuurseenheid =
                aBestuurseenheid()
                    .withId(buildBestuurseenheidIri(uuid()))
                    .build();
            await bestuurseenheidRepository.save(bestuurseenheid);

            const formalInformalChoice =
                aFormalInformalChoice()
                    .withBestuurseenheidId(bestuurseenheid.id)
                    .withChosenForm(ChosenFormType.INFORMAL)
                    .withDateCreated(FormatPreservingDate.of('2024-01-23T12:05:46.654Z'))
                    .build();

            await directDatabaseAccess.insertData(
                bestuurseenheid.userGraph().value,
                [
                    `<${formalInformalChoice.id}> a lpdcExt:FormalInformalChoice`,
                    `<${formalInformalChoice.id}> mu:uuid """${formalInformalChoice.uuid}"""`,
                    `<${formalInformalChoice.id}> schema:dateCreated "2024-01-23T12:05:46.654Z"^^xsd:dateTime`,
                    `<${formalInformalChoice.id}> lpdcExt:chosenForm "informal"`,
                    `<${formalInformalChoice.id}> dct:relation <${formalInformalChoice.bestuurseenheidId}>`,
                ],
                [
                    PREFIX.lpdcExt,
                    PREFIX.mu,
                    PREFIX.schema,
                    PREFIX.dct
                ]);

            const actualFormalInformalChoice = await repository.findByBestuurseenheid(bestuurseenheid);

            expect(actualFormalInformalChoice).toEqual(formalInformalChoice);
        });

        test('formal informal choice in incorrect user graph throws error', async () => {
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

            const formalInformalChoice =
                aFormalInformalChoice()
                    .withBestuurseenheidId(bestuurseenheid.id)
                    .withChosenForm(ChosenFormType.INFORMAL)
                    .withDateCreated(FormatPreservingDate.of('2024-01-23T12:05:46.654Z'))
                    .build();

            await directDatabaseAccess.insertData(
                bestuurseenheid.userGraph().value,
                [
                    `<${formalInformalChoice.id}> a lpdcExt:FormalInformalChoice`,
                    `<${formalInformalChoice.id}> mu:uuid """${formalInformalChoice.uuid}"""`,
                    `<${formalInformalChoice.id}> schema:dateCreated "2024-01-23T12:05:46.654Z"^^xsd:dateTime`,
                    `<${formalInformalChoice.id}> lpdcExt:chosenForm "informal"`,
                    `<${formalInformalChoice.id}> dct:relation <${anotherBestuurseenheid.id}>`,
                ],
                [
                    PREFIX.lpdcExt,
                    PREFIX.mu,
                    PREFIX.schema,
                    PREFIX.dct
                ]);

            await expect(repository.findByBestuurseenheid(bestuurseenheid)).rejects.toThrow(`formal informal choice found <${formalInformalChoice.id}> in incorrect user graph`);
        });

        for (const chosenForm of Object.values(ChosenFormType)) {
            test(`ChosenForm ${chosenForm} can be mapped`, async () => {
                const bestuurseenheid = aBestuurseenheid().build();

                const formalInformalChoice = aFormalInformalChoice().withChosenForm(chosenForm).withBestuurseenheidId(bestuurseenheid.id).build();
                await repository.save(bestuurseenheid, formalInformalChoice);

                const actualFormalInformalChoice = await repository.findByBestuurseenheid(bestuurseenheid);

                expect(actualFormalInformalChoice).toEqual(formalInformalChoice);
            });
        }

        test('Unknown ChosenForm can not be mapped', async () => {
            const bestuurseenheid = aBestuurseenheid().build();
            const formalInformalChoiceIri = buildFormalInformalChoiceIri(uuid());

            await directDatabaseAccess.insertData(
                bestuurseenheid.userGraph().value,
                [
                    `<${formalInformalChoiceIri}> a lpdcExt:FormalInformalChoice`,
                    `<${formalInformalChoiceIri}> mu:uuid """${uuid()}"""`,
                    `<${formalInformalChoiceIri}> schema:dateCreated "2024-01-23T12:05:46.654Z"^^xsd:dateTime`,
                    `<${formalInformalChoiceIri}> lpdcExt:chosenForm """non-existing-choice"""`,
                    `<${formalInformalChoiceIri}> dct:relation <${bestuurseenheid.id}>`,
                ],
                [
                    PREFIX.lpdcExt,
                    PREFIX.mu,
                    PREFIX.schema,
                    PREFIX.dct
                ]);

            await expect(repository.findByBestuurseenheid(bestuurseenheid)).rejects.toThrow(new Error(`could not map 'non-existing-choice' for iri: <${formalInformalChoiceIri}>`));
        });

    });

});