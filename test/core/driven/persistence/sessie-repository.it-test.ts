import {SessieTestBuilder} from "../../../test-builders/sessie-test-builder";
import {SessieSparqlRepository} from "../../../../src/driven/persistence/sessie-sparql-repository";
import {TEST_SPARQL_ENDPOINT} from "../../../test.config";

describe('SessieRepository', () => {
    const repository = new SessieSparqlRepository(TEST_SPARQL_ENDPOINT);

    describe('findById', () => {

        test('When sessie exists with id, then return sessie', async () => {
            const sessie = SessieTestBuilder.aSessie().build();
            await repository.save(sessie);

            const expectedSessie = await repository.findById(sessie.getId());

            expect(expectedSessie).toEqual(sessie);
        });

        test('When sessie not exists with id, then throw error', async () => {
            const falseSessionId = 'http://mu.semte.ch/sessions/false';

            await expect(repository.findById(falseSessionId)).rejects.toThrow(new Error(`No session found for iri: ${falseSessionId}`));

        });
    });

});