import {TEST_SPARQL_ENDPOINT} from "../../test.config";
import {aFullConceptDisplayConfiguration} from "../../core/domain/concept-display-configuration-test-builder";
import {ConceptDisplayConfigurationSparqlTestRepository} from "./concept-display-configuration-sparql-test-repository";
import {aBestuurseenheid} from "../../core/domain/bestuureenheid-test-builder";
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

        test('returns undefined when not found', async () => {
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

            const anotherConceptId = buildConceptIri(uuid());

            const actualConceptDisplayConfiguration = await repository.findByConceptId(bestuurseenheid, anotherConceptId);
            expect(actualConceptDisplayConfiguration).toBeUndefined();
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

            const actualConceptDisplayConfiguration = await repository.findByConceptId(bestuurseenheid, conceptId);
            expect(actualConceptDisplayConfiguration).toBeUndefined();
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

            const actualConceptDisplayConfiguration = await repository.findByConceptId(bestuurseenheid, conceptDisplayConfiguration.conceptId);
            expect(actualConceptDisplayConfiguration).toBeUndefined();
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

        });

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
        });

    });

});