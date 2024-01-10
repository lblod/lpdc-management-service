import {TEST_SPARQL_ENDPOINT} from "../../test.config";
import {BestuurseenheidClassificatieCodeUri} from "../../../src/driven/persistence/bestuurseenheid-sparql-repository";
import {Bestuurseenheid, BestuurseenheidClassificatieCode} from "../../../src/core/domain/bestuurseenheid";
import {aBestuurseenheid} from "../../core/domain/bestuureenheid-test-builder";
import {BestuurseenheidSparqlTestRepository} from "./bestuurseenheid-sparql-test-repository";
import {DirectDatabaseAccess} from "./direct-database-access";
import {uuid} from "../../../mu-helper";
import {buildBestuurseenheidIri} from "../../core/domain/iri-test-builder";
import {Iri} from "../../../src/core/domain/shared/iri";

describe('BestuurseenheidRepository', () => {
    const repository = new BestuurseenheidSparqlTestRepository(TEST_SPARQL_ENDPOINT);
    const directDatabaseAccess = new DirectDatabaseAccess(TEST_SPARQL_ENDPOINT);

    describe('findById', () => {

        test('When bestuurseenheid exists with id, then return bestuurseenheid', async () => {
            const bestuurseenheid = aBestuurseenheid().build();
            await repository.save(bestuurseenheid);

            const anotherBestuurseenheid = aBestuurseenheid().build();
            await repository.save(anotherBestuurseenheid);

            const actualBestuurseenheid = await repository.findById(bestuurseenheid.id);

            expect(actualBestuurseenheid).toEqual(bestuurseenheid);
        });

        test('When bestuurseenheid does not exist with id, then throw error', async () => {
            const bestuurseenheid = aBestuurseenheid().build();
            await repository.save(bestuurseenheid);

            const nonExistentBestuurseenheidId = buildBestuurseenheidIri("thisiddoesnotexist");

            await expect(repository.findById(nonExistentBestuurseenheidId)).rejects.toThrow(new Error(`no bestuurseenheid found for iri: ${nonExistentBestuurseenheidId}`));

        });

        test('When bestuurseenheid abb exists with id, then return bestuurseenheid', async () => {
            const bestuurseenheid =
                aBestuurseenheid()
                    .withId(Bestuurseenheid.abb)
                    .withUuid("141d9d6b-54af-4d17-b313-8d1c30bc3f5b")
                    .withPrefLabel('Agentschap binnenlands bestuur')
                    .withClassificatieCode(undefined)
                    .build();
            await repository.save(bestuurseenheid);

            const actualBestuurseenheid = await repository.findById(bestuurseenheid.id);

            expect(actualBestuurseenheid).toEqual(bestuurseenheid);
        });
    });

    describe('Verify ontology and mapping', () => {

        test('Verify mappings', async () => {
            const bestuurseenheidUuid = uuid();
            const bestuurseenheidId = new Iri(`http://data.lblod.info/id/bestuurseenheden/${bestuurseenheidUuid}`);

            const bestuurseenheid =
                aBestuurseenheid()
                    .withId(bestuurseenheidId)
                    .withUuid(bestuurseenheidUuid)
                    .withPrefLabel("preferred label")
                    .withClassificatieCode(BestuurseenheidClassificatieCode.GEMEENTE)
                    .build();

            await directDatabaseAccess.insertData(
                "http://mu.semte.ch/graphs/public",
                [`<${bestuurseenheidId}> a <http://data.vlaanderen.be/ns/besluit#Bestuurseenheid>`,
                    `<${bestuurseenheidId}> <http://mu.semte.ch/vocabularies/core/uuid> """${bestuurseenheidUuid}"""`,
                    `<${bestuurseenheidId}> <http://www.w3.org/2004/02/skos/core#prefLabel> """preferred label"""`,
                    `<${bestuurseenheidId}> <http://data.vlaanderen.be/ns/besluit#classificatie> <http://data.vlaanderen.be/id/concept/BestuurseenheidClassificatieCode/5ab0e9b8a3b2ca7c5e000001>`,
                ]);

            const actualBestuurseenheid = await repository.findById(bestuurseenheidId);

            expect(actualBestuurseenheid).toEqual(bestuurseenheid);
        });

        test('Verify ontology and mapping - only query correct type', async () => {
            const bestuurseenheidId = new Iri(`http://data.lblod.info/id/bestuurseenheden/${uuid()}`);

            await directDatabaseAccess.insertData(
                "http://mu.semte.ch/graphs/public",
                [`<${bestuurseenheidId}> a <http://example.com/ns#SomeOtherType>`,
                    `<${bestuurseenheidId}> <http://www.w3.org/2004/02/skos/core#prefLabel> """preferred label"""`,
                    `<${bestuurseenheidId}> <http://data.vlaanderen.be/ns/besluit#classificatie> <http://data.vlaanderen.be/id/concept/BestuurseenheidClassificatieCode/5ab0e9b8a3b2ca7c5e000001>`,
                ]);

            await expect(repository.findById(bestuurseenheidId)).rejects.toThrow(new Error(`no bestuurseenheid found for iri: ${bestuurseenheidId}`));

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