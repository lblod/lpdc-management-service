import {TEST_SPARQL_ENDPOINT} from "../../test.config";
import {
    aFullConceptDisplayConfiguration,
    ConceptDisplayConfigurationTestBuilder
} from "../../core/domain/concept-display-configuration-test-builder";
import {ConceptDisplayConfigurationSparqlTestRepository} from "./concept-display-configuration-sparql-test-repository";
import {aBestuurseenheid} from "../../core/domain/bestuurseenheid-test-builder";
import {BestuurseenheidSparqlTestRepository} from "./bestuurseenheid-sparql-test-repository";
import {
    buildBestuurseenheidIri,
    buildConceptDisplayConfigurationIri,
    buildConceptIri
} from "../../core/domain/iri-test-builder";
import {uuid} from "../../../mu-helper";
import {DirectDatabaseAccess} from "./direct-database-access";
import {PREFIX} from "../../../config";
import {ConceptSparqlRepository} from "../../../src/driven/persistence/concept-sparql-repository";
import {aFullConcept} from "../../core/domain/concept-test-builder";
import {ConceptDisplayConfigurationBuilder} from "../../../src/core/domain/concept-display-configuration";

describe('ConceptDisplayConfigurationRepository', () => {

    const directDatabaseAccess = new DirectDatabaseAccess(TEST_SPARQL_ENDPOINT);
    const repository = new ConceptDisplayConfigurationSparqlTestRepository(TEST_SPARQL_ENDPOINT);
    const bestuurseenheidRepository = new BestuurseenheidSparqlTestRepository(TEST_SPARQL_ENDPOINT);
    const conceptRepository = new ConceptSparqlRepository(TEST_SPARQL_ENDPOINT);

    describe('findByConceptId', () => {

        test('Is returned when found', async () => {
            const bestuurseenheid =
                aBestuurseenheid()
                    .withId(buildBestuurseenheidIri(uuid()))
                    .build();
            await bestuurseenheidRepository.save(bestuurseenheid);

            const conceptDisplayConfiguration =
                aFullConceptDisplayConfiguration()
                    .withBestuurseenheidId(bestuurseenheid.id)
                    .build();

            await repository.save(bestuurseenheid, conceptDisplayConfiguration);

            const actualConceptDisplayConfiguration = await repository.findByConceptId(bestuurseenheid, conceptDisplayConfiguration.conceptId);
            expect(actualConceptDisplayConfiguration).toEqual(conceptDisplayConfiguration);
        });

        test('throws error when not found', async () => {
            const bestuurseenheid = aBestuurseenheid()
                .withId(buildBestuurseenheidIri(uuid()))
                .build();
            await bestuurseenheidRepository.save(bestuurseenheid);

            const conceptDisplayConfiguration =
                aFullConceptDisplayConfiguration()
                    .withBestuurseenheidId(bestuurseenheid.id)
                    .withConceptId(buildConceptIri(uuid()))
                    .build();

            await repository.save(bestuurseenheid, conceptDisplayConfiguration);

            const anotherConceptId = buildConceptIri(uuid());

            await expect(() => repository.findByConceptId(bestuurseenheid, anotherConceptId)).rejects.toThrow(new Error(`No conceptDisplayConfiguration exists for bestuurseenheid: ${bestuurseenheid.id} and concept ${anotherConceptId}`));
        });

        test('filters on concept id', async () => {
            const bestuurseenheid =
                aBestuurseenheid()
                    .withId(buildBestuurseenheidIri(uuid()))
                    .build();
            await bestuurseenheidRepository.save(bestuurseenheid);

            const conceptDisplayConfiguration =
                aFullConceptDisplayConfiguration()
                    .withBestuurseenheidId(bestuurseenheid.id)
                    .withConceptId(buildConceptIri(uuid()))
                    .build();

            await repository.save(bestuurseenheid, conceptDisplayConfiguration);

            const anotherConceptDisplayConfiguration =
                aFullConceptDisplayConfiguration()
                    .withBestuurseenheidId(bestuurseenheid.id)
                    .withConceptId(buildConceptIri(uuid()))
                    .build();

            await repository.save(bestuurseenheid, anotherConceptDisplayConfiguration);

            const actualConceptDisplayConfiguration = await repository.findByConceptId(bestuurseenheid, conceptDisplayConfiguration.conceptId);
            expect(actualConceptDisplayConfiguration).toEqual(conceptDisplayConfiguration);
        });

        test('filters on bestuurseenheid id', async () => {
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

            const conceptId = buildConceptIri(uuid());

            const conceptDisplayConfiguration =
                aFullConceptDisplayConfiguration()
                    .withBestuurseenheidId(bestuurseenheid.id)
                    .withConceptId(conceptId)
                    .build();

            await repository.save(bestuurseenheid, conceptDisplayConfiguration);

            const anotherConceptDisplayConfiguration =
                aFullConceptDisplayConfiguration()
                    .withBestuurseenheidId(anotherBestuurseenheid.id)
                    .withConceptId(conceptId)
                    .build();

            await repository.save(anotherBestuurseenheid, anotherConceptDisplayConfiguration);

            const actualConceptDisplayConfiguration = await repository.findByConceptId(bestuurseenheid, conceptDisplayConfiguration.conceptId);
            expect(actualConceptDisplayConfiguration).toEqual(conceptDisplayConfiguration);

        });

        test('only searches in configured bestuurseenheid graph of bestuurseenheid', async () => {
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

            const conceptId = buildConceptIri(uuid());

            const conceptDisplayConfiguration =
                aFullConceptDisplayConfiguration()
                    .withBestuurseenheidId(anotherBestuurseenheid.id)
                    .withConceptId(conceptId)
                    .build();
            await repository.save(anotherBestuurseenheid, conceptDisplayConfiguration);

            await expect(() => repository.findByConceptId(bestuurseenheid, conceptId)).rejects.toThrow(new Error(`No conceptDisplayConfiguration exists for bestuurseenheid: ${bestuurseenheid.id} and concept ${conceptId}`));
        });

    });

    describe('removeInstantiatedFlag', () => {

        test('if exists, conceptIsInstantiated is false ', async () => {
            const bestuurseenheid =
                aBestuurseenheid()
                    .withId(buildBestuurseenheidIri(uuid()))
                    .build();
            await bestuurseenheidRepository.save(bestuurseenheid);

            const conceptDisplayConfiguration =
                aFullConceptDisplayConfiguration()
                    .withBestuurseenheidId(bestuurseenheid.id)
                    .withConceptIsInstantiated(true)
                    .build();

            await repository.save(bestuurseenheid, conceptDisplayConfiguration);
            await repository.removeInstantiatedFlag(bestuurseenheid, conceptDisplayConfiguration.conceptId);
            const actualConceptDisplayConfiguration = await repository.findByConceptId(bestuurseenheid, conceptDisplayConfiguration.conceptId);

            expect(actualConceptDisplayConfiguration.conceptIsInstantiated).toBeFalsy();
        });

        test('if not-exists, throws error', async () => {
            const bestuurseenheid = aBestuurseenheid().build();
            const conceptId = buildConceptIri(uuid());

            await expect(repository.removeInstantiatedFlag(bestuurseenheid, conceptId))
                .rejects.toThrow(new Error(`No conceptDisplayConfiguration exists for bestuurseenheid: ${bestuurseenheid.id} and concept ${conceptId}`));
        });
    });

    describe('removeConceptIsNewFlagAndSetInstantiatedFlag', () => {

        test('When conceptIsNew is true and conceptIsInstantiated is false ', async () => {
            const bestuurseenheid = aBestuurseenheid().build();
            const conceptDisplayConfiguration =
                aFullConceptDisplayConfiguration()
                    .withBestuurseenheidId(bestuurseenheid.id)
                    .withConceptIsNew(true)
                    .withConceptIsInstantiated(false)
                    .build();
            await repository.save(bestuurseenheid, conceptDisplayConfiguration);

            await repository.removeConceptIsNewFlagAndSetInstantiatedFlag(bestuurseenheid, conceptDisplayConfiguration.conceptId);

            const actualConceptDisplayConfiguration = await repository.findByConceptId(bestuurseenheid, conceptDisplayConfiguration.conceptId);
            const expectedConceptDisplayConfiguration = new ConceptDisplayConfigurationBuilder()
                .withId(conceptDisplayConfiguration.id)
                .withBestuurseenheidId(conceptDisplayConfiguration.bestuurseenheidId)
                .withConceptId(conceptDisplayConfiguration.conceptId)
                .withUuid(conceptDisplayConfiguration.uuid)
                .withConceptIsNew(false)
                .withConceptIsInstantiated(true)
                .build();

            expect(actualConceptDisplayConfiguration).toEqual(expectedConceptDisplayConfiguration);
        });

        test('When conceptIsNew is false and conceptIsInstantiated false', async () => {
            const bestuurseenheid = aBestuurseenheid().build();
            const conceptDisplayConfiguration = aFullConceptDisplayConfiguration()
                .withBestuurseenheidId(bestuurseenheid.id)
                .withConceptIsNew(false)
                .withConceptIsInstantiated(false)
                .build();

            await repository.save(bestuurseenheid, conceptDisplayConfiguration);
            await repository.removeConceptIsNewFlagAndSetInstantiatedFlag(bestuurseenheid, conceptDisplayConfiguration.conceptId);
            const actualConceptDisplayConfiguration = await repository.findByConceptId(bestuurseenheid, conceptDisplayConfiguration.conceptId);

            const expectedConceptDisplayConfiguration = ConceptDisplayConfigurationBuilder.from(conceptDisplayConfiguration)
                .withConceptIsNew(false)
                .withConceptIsInstantiated(true)
                .build();

            expect(actualConceptDisplayConfiguration).toEqual(expectedConceptDisplayConfiguration);
        });

        test('When conceptIsNew is false and conceptIsInstantiated true', async () => {
            const bestuurseenheid = aBestuurseenheid().build();

            const conceptDisplayConfiguration =
                aFullConceptDisplayConfiguration()
                    .withBestuurseenheidId(bestuurseenheid.id)
                    .withConceptIsNew(false)
                    .withConceptIsInstantiated(true)
                    .build();

            await repository.save(bestuurseenheid, conceptDisplayConfiguration);
            await repository.removeConceptIsNewFlagAndSetInstantiatedFlag(bestuurseenheid, conceptDisplayConfiguration.conceptId);
            const actualConceptDisplayConfiguration = await repository.findByConceptId(bestuurseenheid, conceptDisplayConfiguration.conceptId);

            expect(actualConceptDisplayConfiguration).toEqual(conceptDisplayConfiguration);
        });

        test('if concept-displayConfig does not exists, throws error', async () => {
            const bestuurseenheid = aBestuurseenheid().build();
            const conceptId = buildConceptIri(uuid());

            await expect(repository.removeConceptIsNewFlagAndSetInstantiatedFlag(bestuurseenheid, conceptId))
                .rejects.toThrow(new Error(`No conceptDisplayConfiguration exists for bestuurseenheid: ${bestuurseenheid.id} and concept ${conceptId}`));
        });
    });

    describe('Verify ontology and mapping', () => {

        test('Verify correct type', async () => {
            const bestuurseenheid =
                aBestuurseenheid()
                    .withId(buildBestuurseenheidIri(uuid()))
                    .build();
            await bestuurseenheidRepository.save(bestuurseenheid);

            const idForIncorrectType = buildConceptDisplayConfigurationIri(uuid());
            const conceptDisplayConfiguration =
                aFullConceptDisplayConfiguration()
                    .withId(idForIncorrectType)
                    .withConceptIsNew(true)
                    .withConceptIsInstantiated(false)
                    .withBestuurseenheidId(bestuurseenheid.id)
                    .build();

            await directDatabaseAccess.insertData(
                bestuurseenheid.userGraph().value,
                [
                    `<${conceptDisplayConfiguration.conceptId}> lpdcExt:hasConceptDisplayConfiguration <${idForIncorrectType}>`,
                    `<${idForIncorrectType}> a <https://productencatalogus.data.vlaanderen.be/ns/ipdc-lpdc#SomeUnkownType>`,
                    `<${idForIncorrectType}> mu:uuid """${conceptDisplayConfiguration.uuid}"""`,
                    `<${idForIncorrectType}> lpdcExt:conceptIsNew "true"^^<http://mu.semte.ch/vocabularies/typed-literals/boolean>`,
                    `<${idForIncorrectType}> lpdcExt:conceptInstantiated "false"^^<http://mu.semte.ch/vocabularies/typed-literals/boolean>`,
                    `<${idForIncorrectType}> dct:relation <${conceptDisplayConfiguration.bestuurseenheidId}>`,
                ],
                [
                    PREFIX.lpdcExt,
                    PREFIX.mu,
                    PREFIX.dct
                ]);

            await expect(() => repository.findByConceptId(bestuurseenheid, conceptDisplayConfiguration.conceptId)).rejects.toThrow(new Error(`No conceptDisplayConfiguration exists for bestuurseenheid: ${bestuurseenheid.id} and concept ${conceptDisplayConfiguration.conceptId}`));
        });

        test('Verify mappings', async () => {
            const bestuurseenheid =
                aBestuurseenheid()
                    .withId(buildBestuurseenheidIri(uuid()))
                    .build();
            await bestuurseenheidRepository.save(bestuurseenheid);

            const conceptDisplayConfiguration =
                aFullConceptDisplayConfiguration()
                    .withConceptIsNew(true)
                    .withConceptIsInstantiated(false)
                    .withBestuurseenheidId(bestuurseenheid.id)
                    .build();

            await directDatabaseAccess.insertData(
                bestuurseenheid.userGraph().value,
                [
                    `<${conceptDisplayConfiguration.conceptId}> lpdcExt:hasConceptDisplayConfiguration <${conceptDisplayConfiguration.id}>`,
                    `<${conceptDisplayConfiguration.id}> a lpdcExt:ConceptDisplayConfiguration`,
                    `<${conceptDisplayConfiguration.id}> mu:uuid """${conceptDisplayConfiguration.uuid}"""`,
                    `<${conceptDisplayConfiguration.id}> lpdcExt:conceptIsNew "true"^^<http://mu.semte.ch/vocabularies/typed-literals/boolean>`,
                    `<${conceptDisplayConfiguration.id}> lpdcExt:conceptInstantiated "false"^^<http://mu.semte.ch/vocabularies/typed-literals/boolean>`,
                    `<${conceptDisplayConfiguration.id}> dct:relation <${conceptDisplayConfiguration.bestuurseenheidId}>`,
                ],
                [
                    PREFIX.lpdcExt,
                    PREFIX.mu,
                    PREFIX.dct
                ]);

            const actualConceptDisplayConfiguration = await repository.findByConceptId(bestuurseenheid, conceptDisplayConfiguration.conceptId);
            expect(actualConceptDisplayConfiguration).toEqual(conceptDisplayConfiguration);
        });

    });

    describe('ensure concept display configurations for all bestuurseenheden', () => {

        test('Creates new concept display configurations for a concept if not existing for bestuurseenheid', async () => {
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

            const concept =
                aFullConcept()
                    .build();
            await conceptRepository.save(concept);

            await repository.ensureConceptDisplayConfigurationsForAllBestuurseenheden(concept.id);

            const createdConceptDisplayConfigurationForBestuurseenheid = await repository.findByConceptId(bestuurseenheid, concept.id);
            expect(createdConceptDisplayConfigurationForBestuurseenheid.id).not.toBeUndefined();
            expect(createdConceptDisplayConfigurationForBestuurseenheid.uuid).not.toBeUndefined();
            expect(createdConceptDisplayConfigurationForBestuurseenheid.conceptIsNew).toEqual(true);
            expect(createdConceptDisplayConfigurationForBestuurseenheid.conceptIsInstantiated).toEqual(false);
            expect(createdConceptDisplayConfigurationForBestuurseenheid.bestuurseenheidId).toEqual(bestuurseenheid.id);
            expect(createdConceptDisplayConfigurationForBestuurseenheid.conceptId).toEqual(concept.id);

            const createdConceptDisplayConfigurationForAnotherBestuurseenheid = await repository.findByConceptId(anotherBestuurseenheid, concept.id);
            expect(createdConceptDisplayConfigurationForAnotherBestuurseenheid.id).not.toBeUndefined();
            expect(createdConceptDisplayConfigurationForAnotherBestuurseenheid.uuid).not.toBeUndefined();
            expect(createdConceptDisplayConfigurationForAnotherBestuurseenheid.conceptIsNew).toEqual(true);
            expect(createdConceptDisplayConfigurationForAnotherBestuurseenheid.conceptIsInstantiated).toEqual(false);
            expect(createdConceptDisplayConfigurationForAnotherBestuurseenheid.bestuurseenheidId).toEqual(anotherBestuurseenheid.id);
            expect(createdConceptDisplayConfigurationForAnotherBestuurseenheid.conceptId).toEqual(concept.id);

        }, 10000);

        test('Does not create new or update concept display configurations for a concept if already exists for bestuurseenheid', async () => {
            const bestuurseenheid =
                aBestuurseenheid()
                    .withId(buildBestuurseenheidIri(uuid()))
                    .build();
            await bestuurseenheidRepository.save(bestuurseenheid);

            const concept =
                aFullConcept()
                    .build();
            await conceptRepository.save(concept);

            const conceptDisplayConfiguration =
                aFullConceptDisplayConfiguration()
                    .withConceptId(concept.id)
                    .withConceptIsNew(false)
                    .withConceptIsInstantiated(true)
                    .withBestuurseenheidId(bestuurseenheid.id)
                    .build();
            await repository.save(bestuurseenheid, conceptDisplayConfiguration);

            await repository.ensureConceptDisplayConfigurationsForAllBestuurseenheden(concept.id);

            const createdConceptDisplayConfigurationForBestuurseenheid = await repository.findByConceptId(bestuurseenheid, concept.id);
            expect(createdConceptDisplayConfigurationForBestuurseenheid.id).toEqual(conceptDisplayConfiguration.id);
            expect(createdConceptDisplayConfigurationForBestuurseenheid.uuid).toEqual(conceptDisplayConfiguration.uuid);
            expect(createdConceptDisplayConfigurationForBestuurseenheid.conceptIsNew).toEqual(false);
            expect(createdConceptDisplayConfigurationForBestuurseenheid.conceptIsInstantiated).toEqual(true);
            expect(createdConceptDisplayConfigurationForBestuurseenheid.bestuurseenheidId).toEqual(bestuurseenheid.id);
            expect(createdConceptDisplayConfigurationForBestuurseenheid.conceptId).toEqual(concept.id);
        }, 10000);

    });

});