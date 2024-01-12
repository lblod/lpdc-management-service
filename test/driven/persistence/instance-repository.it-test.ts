import {TEST_SPARQL_ENDPOINT} from "../../test.config";
import {aFullInstance} from "../../core/domain/instance-test-builder";
import {InstanceSparqlTestRepository} from "./instance-sparql-test-repository";
import {BestuurseenheidSparqlTestRepository} from "./bestuurseenheid-sparql-test-repository";
import {aBestuurseenheid} from "../../core/domain/bestuureenheid-test-builder";

describe('InstanceRepository', () => {
    const repository = new InstanceSparqlTestRepository(TEST_SPARQL_ENDPOINT);
    const bestuurseenheidRepository = new BestuurseenheidSparqlTestRepository(TEST_SPARQL_ENDPOINT);


    describe('findById', () => {

        test('When full instance exists with id, then return instance', async () => {
            const bestuurseenheid = aBestuurseenheid().build();
            const anotherBestuurseenheid = aBestuurseenheid().build();
            await bestuurseenheidRepository.save(bestuurseenheid);
            await bestuurseenheidRepository.save(anotherBestuurseenheid);

            const instance = aFullInstance().withBestuurseenheidId(bestuurseenheid.id).build();

            await repository.save(bestuurseenheid, instance);

            const anotherInstance = aFullInstance().withBestuurseenheidId(anotherBestuurseenheid.id).build();
            await repository.save(bestuurseenheid, anotherInstance);

            const actualConcept = await repository.findById(bestuurseenheid, instance.id);

            expect(actualConcept).toEqual(instance);
        });
    });
});