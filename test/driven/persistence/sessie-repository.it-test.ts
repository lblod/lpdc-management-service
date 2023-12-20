import {SessieTestBuilder} from "../../core/domain/sessie-test-builder";
import {TEST_SPARQL_ENDPOINT} from "../../test.config";
import {SessieSparqlTestRepository} from "./sessie-sparql-test-repository";

describe('SessieRepository', () => {
    const repository = new SessieSparqlTestRepository(TEST_SPARQL_ENDPOINT);

    describe('findById', () => {

        //TODO LPDC-894: we should consider having at least one test that inserts directly a set of triples (and not use the save); and then query with findbyid
        test('When sessie exists with id, then return sessie', async () => {
            const sessie = SessieTestBuilder.aSessie().build();
            await repository.save(sessie);

            const expectedSessie = await repository.findById(sessie.id);

            expect(expectedSessie).toEqual(sessie);
        });

        test('When sessie not exists with id, then throw error', async () => {
            const falseSessionId = 'http://mu.semte.ch/sessions/false';

            await expect(repository.findById(falseSessionId)).rejects.toThrow(new Error(`No session found for iri: ${falseSessionId}`));

        });
    });

});