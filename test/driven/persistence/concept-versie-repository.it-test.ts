import {TEST_SPARQL_ENDPOINT} from "../../test.config";
import {DirectDatabaseAccess} from "./direct-database-access";
import {uuid} from "../../../mu-helper";
import {ConceptVersieTestBuilder} from "../../core/domain/concept-versie-test-builder";
import {ConceptVersieSparqlTestRepository} from "./concept-versie-sparql-test-repository";

describe('ConceptVersieRepository', () => {
    const repository = new ConceptVersieSparqlTestRepository(TEST_SPARQL_ENDPOINT);
    const directDatabaseAccess = new DirectDatabaseAccess(TEST_SPARQL_ENDPOINT);

    describe('findById', () => {

        test('When concept versie exists with id, then return concept versie', async () => {
            const conceptVersie = ConceptVersieTestBuilder.aConceptVersie().build();
            await repository.save(conceptVersie);

            const anotherConceptVersie = ConceptVersieTestBuilder.aConceptVersie().build();
            await repository.save(anotherConceptVersie);

            const actualConceptVersie = await repository.findById(conceptVersie.id);

            expect(actualConceptVersie).toEqual(conceptVersie);
        });

        test('When concept versie does not exist with id, then throw error', async () => {
            const conceptVersie = ConceptVersieTestBuilder.aConceptVersie().build();
            await repository.save(conceptVersie);
            
            const nonExistentConceptVersieId = ConceptVersieTestBuilder.buildIri('thisiddoesnotexist');

            await expect(repository.findById(nonExistentConceptVersieId)).rejects.toThrow(new Error(`no concept versie found for iri: ${nonExistentConceptVersieId}`));
        });
    });

    describe('Verify ontology and mapping', () => {

        test('Verify mappings', async () => {
            const conceptVersieId = `https://ipdc.tni-vlaanderen.be/id/conceptsnapshot/${uuid()}`;

            const conceptVersie =
                ConceptVersieTestBuilder
                    .aConceptVersie()
                    .withId(conceptVersieId)
                    .build();

            await directDatabaseAccess.insertData(
                "http://mu.semte.ch/graphs/lpdc/ldes-data",
                [`<${conceptVersieId}> a <https://productencatalogus.data.vlaanderen.be/ns/ipdc-lpdc#ConceptualPublicService>`
                ]);

            const actualConceptVersie = await repository.findById(conceptVersieId);

            expect(actualConceptVersie).toEqual(conceptVersie);
        });
    });
});