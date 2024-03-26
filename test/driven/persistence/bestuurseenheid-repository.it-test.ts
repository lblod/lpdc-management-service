import {TEST_SPARQL_ENDPOINT} from "../../test.config";
import {BestuurseenheidClassificatieCodeUri} from "../../../src/driven/persistence/bestuurseenheid-sparql-repository";
import {Bestuurseenheid, BestuurseenheidClassificatieCode} from "../../../src/core/domain/bestuurseenheid";
import {aBestuurseenheid} from "../../core/domain/bestuurseenheid-test-builder";
import {BestuurseenheidSparqlTestRepository} from "./bestuurseenheid-sparql-test-repository";
import {DirectDatabaseAccess} from "./direct-database-access";
import {uuid} from "../../../mu-helper";
import {
    buildBestuurseenheidIri,
    buildSpatialRefNis2019Iri,
    buildWerkingsgebiedenIri,
    randomNumber
} from "../../core/domain/iri-test-builder";
import {Iri} from "../../../src/core/domain/shared/iri";
import {PUBLIC_GRAPH} from "../../../config";
import {NotFoundError} from "../../../src/core/domain/shared/lpdc-error";

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

            await expect(repository.findById(nonExistentBestuurseenheidId)).rejects.toThrowWithMessage(NotFoundError, `Geen bestuurseenheid gevonden voor iri: ${nonExistentBestuurseenheidId}`);

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

            expect(actualBestuurseenheid.id).toEqual(Bestuurseenheid.abb);
            expect(actualBestuurseenheid.prefLabel).toEqual('Agentschap binnenlands bestuur');
            expect(actualBestuurseenheid.classificatieCode).toBeUndefined();
        });
    });

    describe('Verify ontology and mapping', () => {

        test('Verify mappings', async () => {
            const bestuurseenheidUuid = uuid();
            const bestuurseenheidId = new Iri(`http://data.lblod.info/id/bestuurseenheden/${bestuurseenheidUuid}`);

            const werkingsgebied1Id = buildWerkingsgebiedenIri(uuid());
            const werkingsgebied2Id = buildWerkingsgebiedenIri(uuid());

            const spatial1Id = buildSpatialRefNis2019Iri(randomNumber(10000, 19999));
            const spatial2Id = buildSpatialRefNis2019Iri(randomNumber(20000, 29999));
            const spatial3Id = buildSpatialRefNis2019Iri(randomNumber(30000, 39999));
            const spatial4Id = buildSpatialRefNis2019Iri(randomNumber(40000, 49999));

            const bestuurseenheid =
                aBestuurseenheid()
                    .withId(bestuurseenheidId)
                    .withUuid(bestuurseenheidUuid)
                    .withPrefLabel("preferred label")
                    .withClassificatieCode(BestuurseenheidClassificatieCode.GEMEENTE)
                    .withSpatials([
                        spatial1Id,
                        spatial2Id,
                        spatial3Id,
                        spatial4Id,
                    ])
                    .build();

            await directDatabaseAccess.insertData(
                PUBLIC_GRAPH,
                [`<${bestuurseenheidId}> a <http://data.vlaanderen.be/ns/besluit#Bestuurseenheid>`,
                    `<${bestuurseenheidId}> <http://mu.semte.ch/vocabularies/core/uuid> """${bestuurseenheidUuid}"""`,
                    `<${bestuurseenheidId}> <http://www.w3.org/2004/02/skos/core#prefLabel> """preferred label"""`,
                    `<${bestuurseenheidId}> <http://data.vlaanderen.be/ns/besluit#classificatie> <http://data.vlaanderen.be/id/concept/BestuurseenheidClassificatieCode/5ab0e9b8a3b2ca7c5e000001>`,
                    `<${bestuurseenheidId}> <http://data.vlaanderen.be/ns/besluit#werkingsgebied> <${werkingsgebied1Id}>`,
                    `<${bestuurseenheidId}> <http://data.vlaanderen.be/ns/besluit#werkingsgebied> <${werkingsgebied2Id}>`,
                    `<${werkingsgebied1Id}> <http://www.w3.org/2004/02/skos/core#exactMatch> <${spatial1Id}>`,
                    `<${werkingsgebied1Id}> <http://www.w3.org/2004/02/skos/core#exactMatch> <${spatial2Id}>`,
                    `<${werkingsgebied2Id}> <http://www.w3.org/2004/02/skos/core#exactMatch> <${spatial3Id}>`,
                    `<${werkingsgebied2Id}> <http://www.w3.org/2004/02/skos/core#exactMatch> <${spatial4Id}>`,
                    `<${spatial1Id}> <http://www.w3.org/2004/02/skos/core#inScheme> <http://lblod.data.gift/vocabularies/lpdc-ipdc/IPDCLocaties>`,
                    `<${spatial2Id}> <http://www.w3.org/2004/02/skos/core#inScheme> <http://lblod.data.gift/vocabularies/lpdc-ipdc/IPDCLocaties>`,
                    `<${spatial3Id}> <http://www.w3.org/2004/02/skos/core#inScheme> <http://lblod.data.gift/vocabularies/lpdc-ipdc/IPDCLocaties>`,
                    `<${spatial4Id}> <http://www.w3.org/2004/02/skos/core#inScheme> <http://lblod.data.gift/vocabularies/lpdc-ipdc/IPDCLocaties>`,
                ]);

            const actualBestuurseenheid = await repository.findById(bestuurseenheidId);

            expect(actualBestuurseenheid).toEqual(bestuurseenheid);
        });

        test('Only query correct type', async () => {
            const bestuurseenheidId = new Iri(`http://data.lblod.info/id/bestuurseenheden/${uuid()}`);

            await directDatabaseAccess.insertData(
                PUBLIC_GRAPH,
                [`<${bestuurseenheidId}> a <http://example.com/ns#SomeOtherType>`,
                    `<${bestuurseenheidId}> <http://www.w3.org/2004/02/skos/core#prefLabel> """preferred label"""`,
                    `<${bestuurseenheidId}> <http://data.vlaanderen.be/ns/besluit#classificatie> <http://data.vlaanderen.be/id/concept/BestuurseenheidClassificatieCode/5ab0e9b8a3b2ca7c5e000001>`,
                ]);

            await expect(repository.findById(bestuurseenheidId)).rejects.toThrowWithMessage(NotFoundError, `Geen bestuurseenheid gevonden voor iri: ${bestuurseenheidId}`);

        });

        test('a bestuurseenheid not linked to a werkingsgebied is returned', async () => {
            const bestuurseenheidUuid = uuid();
            const bestuurseenheidId = new Iri(`http://data.lblod.info/id/bestuurseenheden/${bestuurseenheidUuid}`);

            await directDatabaseAccess.insertData(
                PUBLIC_GRAPH,
                [`<${bestuurseenheidId}> a <http://data.vlaanderen.be/ns/besluit#Bestuurseenheid>`,
                    `<${bestuurseenheidId}> <http://mu.semte.ch/vocabularies/core/uuid> """${bestuurseenheidUuid}"""`,
                    `<${bestuurseenheidId}> <http://www.w3.org/2004/02/skos/core#prefLabel> """preferred label"""`,
                    `<${bestuurseenheidId}> <http://data.vlaanderen.be/ns/besluit#classificatie> <http://data.vlaanderen.be/id/concept/BestuurseenheidClassificatieCode/5ab0e9b8a3b2ca7c5e000001>`,
                ]);

            const actualBestuurseenheid = await repository.findById(bestuurseenheidId);

            expect(actualBestuurseenheid.id).toEqual(bestuurseenheidId);
        });

        test('a spatial not linked to a ipdc locatie is not returned', async () => {
            const bestuurseenheidUuid = uuid();
            const bestuurseenheidId = new Iri(`http://data.lblod.info/id/bestuurseenheden/${bestuurseenheidUuid}`);

            const werkingsgebied1Id = buildWerkingsgebiedenIri(uuid());

            const spatial1Id = buildSpatialRefNis2019Iri(randomNumber(10000, 19999));

            await directDatabaseAccess.insertData(
                PUBLIC_GRAPH,
                [`<${bestuurseenheidId}> a <http://data.vlaanderen.be/ns/besluit#Bestuurseenheid>`,
                    `<${bestuurseenheidId}> <http://mu.semte.ch/vocabularies/core/uuid> """${bestuurseenheidUuid}"""`,
                    `<${bestuurseenheidId}> <http://www.w3.org/2004/02/skos/core#prefLabel> """preferred label"""`,
                    `<${bestuurseenheidId}> <http://data.vlaanderen.be/ns/besluit#classificatie> <http://data.vlaanderen.be/id/concept/BestuurseenheidClassificatieCode/5ab0e9b8a3b2ca7c5e000001>`,
                    `<${bestuurseenheidId}> <http://data.vlaanderen.be/ns/besluit#werkingsgebied> <${werkingsgebied1Id}>`,
                    `<${werkingsgebied1Id}> <http://www.w3.org/2004/02/skos/core#exactMatch> <${spatial1Id}>`,
                ]);

            const actualBestuurseenheid = await repository.findById(bestuurseenheidId);

            expect(actualBestuurseenheid.spatials).toEqual([]);
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
            expect(() => repository.mapBestuurseenheidClassificatieCodeToUri(nonExistingClassificationCode)).toThrowWithMessage(NotFoundError, `No classification code uri found for: ${nonExistingClassificationCode}`);

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
            expect(() => repository.mapBestuurseenheidClassificatieUriToCode(nonExistingClassificationUri)).toThrowWithMessage(NotFoundError, `Geen classificatiecode gevonden voor: ${nonExistingClassificationUri}`);

        });

    });
});