import {TEST_SPARQL_ENDPOINT} from "../../test.config";
import {aFullConceptDisplayConfiguration} from "../../core/domain/concept-display-configuration-test-builder";
import {ConceptDisplayConfigurationSparqlTestRepository} from "./concept-display-configuration-sparql-test-repository";
import {aBestuurseenheid} from "../../core/domain/bestuureenheid-test-builder";
import {BestuurseenheidSparqlTestRepository} from "./bestuurseenheid-sparql-test-repository";
import {buildBestuurseenheidIri, buildConceptIri} from "../../core/domain/iri-test-builder";
import {uuid} from "../../../mu-helper";


describe('ConceptDisplayConfigurationRepository', () => {

    const repository = new ConceptDisplayConfigurationSparqlTestRepository(TEST_SPARQL_ENDPOINT);
    const bestuurseenheidRepository = new BestuurseenheidSparqlTestRepository(TEST_SPARQL_ENDPOINT);

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

});