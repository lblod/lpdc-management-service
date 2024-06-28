import {TEST_SPARQL_ENDPOINT} from "../../test.config";
import {aFullConceptDisplayConfiguration} from "../../core/domain/concept-display-configuration-test-builder";
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
import {aFullInstance} from "../../core/domain/instance-test-builder";
import {ConceptDisplayConfigurationBuilder} from "../../../src/core/domain/concept-display-configuration";
import {NotFoundError, SystemError} from "../../../src/core/domain/shared/lpdc-error";
import {InstanceSparqlRepository} from "../../../src/driven/persistence/instance-sparql-repository";

describe('ConceptDisplayConfigurationRepository', () => {

    const directDatabaseAccess = new DirectDatabaseAccess(TEST_SPARQL_ENDPOINT);
    const repository = new ConceptDisplayConfigurationSparqlTestRepository(TEST_SPARQL_ENDPOINT);
    const bestuurseenheidRepository = new BestuurseenheidSparqlTestRepository(TEST_SPARQL_ENDPOINT);
    const conceptRepository = new ConceptSparqlRepository(TEST_SPARQL_ENDPOINT);
    const instanceRepository = new InstanceSparqlRepository(TEST_SPARQL_ENDPOINT);

    describe('findById', () => {

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

            const actualConceptDisplayConfiguration = await repository.findById(bestuurseenheid, conceptDisplayConfiguration.id);
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

            const anotherConceptDisplayConfigurationId = buildConceptDisplayConfigurationIri(uuid());

            await expect(() => repository.findById(bestuurseenheid, anotherConceptDisplayConfigurationId)).rejects.toThrowWithMessage(NotFoundError, `Geen conceptDisplayConfiguratie gevonden voor id: ${anotherConceptDisplayConfigurationId}`);
        });

        test('only searches in configured bestuurseenheid graph of bestuurseenheid', async () => {
            const bestuurseenheid = aBestuurseenheid()
                .withId(buildBestuurseenheidIri(uuid()))
                .build();
            await bestuurseenheidRepository.save(bestuurseenheid);

            const anotherBestuurseenheid = aBestuurseenheid()
                .withId(buildBestuurseenheidIri(uuid()))
                .build();
            await bestuurseenheidRepository.save(anotherBestuurseenheid);

            const conceptId = buildConceptIri(uuid());

            const conceptDisplayConfiguration =
                aFullConceptDisplayConfiguration()
                    .withBestuurseenheidId(anotherBestuurseenheid.id)
                    .withConceptId(conceptId)
                    .build();
            await repository.save(bestuurseenheid, conceptDisplayConfiguration);

            await expect(() => repository.findById(bestuurseenheid, conceptDisplayConfiguration.id)).rejects.toThrowWithMessage(SystemError, `Concept display configuration ${conceptDisplayConfiguration.id} gevonden in de foute gebruikers graph`);
        });

    });

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

            await expect(() => repository.findByConceptId(bestuurseenheid, anotherConceptId)).rejects.toThrowWithMessage(NotFoundError, `Geen conceptDisplayConfiguration gevonden voor bestuurseenheid: ${bestuurseenheid.id} en concept ${anotherConceptId}`);
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
            await repository.save(bestuurseenheid, conceptDisplayConfiguration);

            await expect(() => repository.findByConceptId(bestuurseenheid, conceptId)).rejects.toThrowWithMessage(SystemError, `Concept display configuration gevonden voor concept met id ${conceptId} in de foute gebruikers graph`);
        });

    });

    describe('removeConceptIsNewFlag', () => {

        test('When conceptIsNew is true', async () => {
            const bestuurseenheid = aBestuurseenheid().build();
            const conceptDisplayConfiguration =
                aFullConceptDisplayConfiguration()
                    .withBestuurseenheidId(bestuurseenheid.id)
                    .withConceptIsNew(true)
                    .build();
            await repository.save(bestuurseenheid, conceptDisplayConfiguration);

            await repository.removeConceptIsNewFlag(bestuurseenheid, conceptDisplayConfiguration.id);

            const actualConceptDisplayConfiguration = await repository.findById(bestuurseenheid, conceptDisplayConfiguration.id);
            const expectedConceptDisplayConfiguration = ConceptDisplayConfigurationBuilder
                .from(conceptDisplayConfiguration)
                .withConceptIsNew(false)
                .build();

            expect(actualConceptDisplayConfiguration).toEqual(expectedConceptDisplayConfiguration);
        });

        test('When conceptIsNew is false', async () => {
            const bestuurseenheid = aBestuurseenheid().build();
            const conceptDisplayConfiguration = aFullConceptDisplayConfiguration()
                .withBestuurseenheidId(bestuurseenheid.id)
                .withConceptIsNew(false)
                .build();

            await repository.save(bestuurseenheid, conceptDisplayConfiguration);
            await repository.removeConceptIsNewFlag(bestuurseenheid, conceptDisplayConfiguration.id);
            const actualConceptDisplayConfiguration = await repository.findById(bestuurseenheid, conceptDisplayConfiguration.id);

            const expectedConceptDisplayConfiguration = ConceptDisplayConfigurationBuilder.from(conceptDisplayConfiguration)
                .withConceptIsNew(false)
                .build();

            expect(actualConceptDisplayConfiguration).toEqual(expectedConceptDisplayConfiguration);
        });

        test('if concept-displayConfig does not exists, throws error', async () => {
            const bestuurseenheid = aBestuurseenheid().build();
            const conceptDisplayConfigurationIri = buildConceptDisplayConfigurationIri(uuid());

            await expect(repository.removeConceptIsNewFlag(bestuurseenheid, conceptDisplayConfigurationIri))
                .rejects.toThrowWithMessage(NotFoundError, `Geen conceptDisplayConfiguratie gevonden voor id: ${conceptDisplayConfigurationIri}`);
        });
    });

    describe('syncInstantiatedFlag', () => {

        test('When instance exists for concept, Then conceptIsInstantiated is true and conceptIsNew false', async () => {
            const bestuurseenheid = aBestuurseenheid().build();
            await bestuurseenheidRepository.save(bestuurseenheid);
            const conceptId = buildConceptIri(uuid());
            const instance = aFullInstance().withConceptId(conceptId).build();
            await instanceRepository.save(bestuurseenheid, instance);

            const conceptDisplayConfiguration =
                aFullConceptDisplayConfiguration()
                    .withBestuurseenheidId(bestuurseenheid.id)
                    .withConceptIsNew(true)
                    .withConceptIsInstantiated(false)
                    .withConceptId(conceptId)
                    .build();
            await repository.save(bestuurseenheid, conceptDisplayConfiguration);

            await repository.syncInstantiatedFlag(bestuurseenheid, conceptId);

            const actualConceptDisplayConfiguration = await repository.findByConceptId(bestuurseenheid, conceptDisplayConfiguration.conceptId);
            expect(actualConceptDisplayConfiguration.conceptIsInstantiated).toEqual(true);
            expect(actualConceptDisplayConfiguration.conceptIsNew).toEqual(false);
        });

        test('When no instance exists for concept & conceptIsNew false & conceptIsInstantiated true, Then conceptIsInstantiated is false and conceptIsNew is false', async () => {
            const bestuurseenheid = aBestuurseenheid().build();
            await bestuurseenheidRepository.save(bestuurseenheid);

            const conceptDisplayConfiguration =
                aFullConceptDisplayConfiguration()
                    .withBestuurseenheidId(bestuurseenheid.id)
                    .withConceptIsNew(false)
                    .withConceptIsInstantiated(true)
                    .build();
            await repository.save(bestuurseenheid, conceptDisplayConfiguration);

            await repository.syncInstantiatedFlag(bestuurseenheid, conceptDisplayConfiguration.conceptId);

            const actualConceptDisplayConfiguration = await repository.findByConceptId(bestuurseenheid, conceptDisplayConfiguration.conceptId);
            expect(actualConceptDisplayConfiguration.conceptIsInstantiated).toEqual(false);
            expect(actualConceptDisplayConfiguration.conceptIsNew).toEqual(false);
        });

        test('When no instance exists for concept & conceptIsNew true & conceptIsInstantiated false, Then conceptIsInstantiated is false and conceptIsNew is true', async () => {
            const bestuurseenheid = aBestuurseenheid().build();
            await bestuurseenheidRepository.save(bestuurseenheid);

            const conceptDisplayConfiguration =
                aFullConceptDisplayConfiguration()
                    .withBestuurseenheidId(bestuurseenheid.id)
                    .withConceptIsNew(true)
                    .withConceptIsInstantiated(false)
                    .build();
            await repository.save(bestuurseenheid, conceptDisplayConfiguration);

            await repository.syncInstantiatedFlag(bestuurseenheid, conceptDisplayConfiguration.conceptId);

            const actualConceptDisplayConfiguration = await repository.findByConceptId(bestuurseenheid, conceptDisplayConfiguration.conceptId);
            expect(actualConceptDisplayConfiguration.conceptIsInstantiated).toEqual(false);
            expect(actualConceptDisplayConfiguration.conceptIsNew).toEqual(true);
        });

        test('if concept-display-configuration does not exists, throws error', async () => {
            const bestuurseenheid = aBestuurseenheid().build();
            const conceptId = buildConceptIri(uuid());

            await expect(repository.syncInstantiatedFlag(bestuurseenheid, conceptId))
                .rejects.toThrowWithMessage(NotFoundError, `Geen conceptDisplayConfiguration gevonden voor bestuurseenheid: ${bestuurseenheid.id} en concept ${conceptId}`);
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
                    `<${conceptDisplayConfiguration.conceptId}> lpdc:hasConceptDisplayConfiguration <${idForIncorrectType}>`,
                    `<${idForIncorrectType}> a <https://productencatalogus.data.vlaanderen.be/ns/ipdc-lpdc#SomeUnkownType>`,
                    `<${idForIncorrectType}> mu:uuid """${conceptDisplayConfiguration.uuid}"""`,
                    `<${idForIncorrectType}> lpdc:conceptIsNew "true"^^<http://mu.semte—.ch/vocabularies/typed-literals/boolean>`,
                    `<${idForIncorrectType}> lpdc:conceptInstantiated "false"^^<http://mu.semte.ch/vocabularies/typed-literals/boolean>`,
                    `<${idForIncorrectType}> dct:relation <${conceptDisplayConfiguration.bestuurseenheidId}>`,
                ],
                [
                    PREFIX.lpdc,
                    PREFIX.mu,
                    PREFIX.dct
                ]);

            await expect(() => repository.findByConceptId(bestuurseenheid, conceptDisplayConfiguration.conceptId)).rejects.toThrowWithMessage(NotFoundError, `Geen conceptDisplayConfiguration gevonden voor bestuurseenheid: ${bestuurseenheid.id} en concept ${conceptDisplayConfiguration.conceptId}`);
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
                    `<${conceptDisplayConfiguration.conceptId}> lpdc:hasConceptDisplayConfiguration <${conceptDisplayConfiguration.id}>`,
                    `<${conceptDisplayConfiguration.id}> a lpdc:ConceptDisplayConfiguration`,
                    `<${conceptDisplayConfiguration.id}> mu:uuid """${conceptDisplayConfiguration.uuid}"""`,
                    `<${conceptDisplayConfiguration.id}> lpdc:conceptIsNew "true"^^<http://mu.semte.ch/vocabularies/typed-literals/boolean>`,
                    `<${conceptDisplayConfiguration.id}> lpdc:conceptInstantiated "false"^^<http://mu.semte.ch/vocabularies/typed-literals/boolean>`,
                    `<${conceptDisplayConfiguration.id}> dct:relation <${conceptDisplayConfiguration.bestuurseenheidId}>`,
                ],
                [
                    PREFIX.lpdc,
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