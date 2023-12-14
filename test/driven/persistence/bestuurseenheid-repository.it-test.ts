import {TEST_SPARQL_ENDPOINT} from "../../test.config";
import {
    BestuurseenheidClassificatieCodeUri,
    BestuurseenheidSparqlRepository
} from "../../../src/driven/persistence/bestuurseenheid-sparql-repository";
import {BestuurseenheidClassificatieCode} from "../../../src/core/domain/bestuurseenheid";
import {BestuurseenheidTestBuilder} from "../../core/domain/bestuureenheid-test-builder";

describe('BestuurseenheidRepository', () => {
    const repository = new BestuurseenheidSparqlRepository(TEST_SPARQL_ENDPOINT);

    describe('findById', () => {

        test('When bestuurseenheid exists with id, then return bestuurseenheid', async () => {
            const bestuurseenheid = BestuurseenheidTestBuilder.aBestuurseenheid().build();
            await repository.save(bestuurseenheid);

            const expectedBestuurseenheid = await repository.findById(bestuurseenheid.id);

            expect(expectedBestuurseenheid).toEqual(bestuurseenheid);
        });

        test('When bestuurseenheid not exists with id, then throw error', async () => {
            const falseBestuurseenheidId = 'http://data.lblod.info/id/bestuurseenheden/false';

            await expect(repository.findById(falseBestuurseenheidId)).rejects.toThrow(new Error(`no bestuurseenheid found for iri: ${falseBestuurseenheidId}`));

        });
    });

    describe('map bestuurseenheidClassificatieCode to uri', () => {

        test('Check that all bestuurseenheid classification codes can get mapped. ', () => {

            const classificatieCodes = Object.keys(BestuurseenheidClassificatieCode);

            classificatieCodes.forEach(code => {
                expect(repository.mapBestuurseenheidClassificatieCodeToUri(BestuurseenheidClassificatieCode[code])).toEqual(BestuurseenheidClassificatieCodeUri[code]);
            });

        });

        test('Non matched bestuurseenheid classification code throws error. ', () => {
            const nonExistingClassificationCode = 'non-existing' as BestuurseenheidClassificatieCode;
            expect(() => repository.mapBestuurseenheidClassificatieCodeToUri(nonExistingClassificationCode)).toThrow(new Error(`No classification code uri found for: ${nonExistingClassificationCode}`));

        });


        test('Enum of BestuurseenheidClassificatieCode and BestuurseenheidClassificatieCode should contain the same amount of elements   ', () => {

            const classificatieCodeCount = Object.keys(BestuurseenheidClassificatieCode).length;
            const classificatieCodeUrisCount = Object.keys(BestuurseenheidClassificatieCodeUri).length;

            expect(classificatieCodeCount).toBe(classificatieCodeUrisCount);
        });


    });

    describe('map bestuurseenheidClassificatieUri to code', () => {

        test('Check that all bestuurseenheid classification uris can get mapped. ', () => {

            const classificatieCodesUri = Object.keys(BestuurseenheidClassificatieCodeUri);

            classificatieCodesUri.forEach(code => {
                expect(repository.mapBestuurseenheidClassificatieUriToCode(BestuurseenheidClassificatieCodeUri[code])).toEqual(BestuurseenheidClassificatieCode[code]);
            });

        });

        test('Non matched bestuurseenheid classification uri throws error. ', () => {
            const nonExistingClassificationUri = 'non-existing' as BestuurseenheidClassificatieCodeUri;
            expect(() => repository.mapBestuurseenheidClassificatieUriToCode(nonExistingClassificationUri)).toThrow(new Error(`No classification code found for: ${nonExistingClassificationUri}`));

        });

    });
});