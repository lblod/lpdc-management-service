import {SessieTestBuilder} from "../../core/domain/sessie-test-builder";
import {TEST_SPARQL_ENDPOINT} from "../../test.config";
import {SessieSparqlTestRepository} from "./sessie-sparql-test-repository";
import {uuid} from "../../../mu-helper";
import {DirectDatabaseAccess} from "./direct-database-access";
import {SessieRol} from "../../../src/core/domain/sessie";

describe('SessieRepository', () => {
    const repository = new SessieSparqlTestRepository(TEST_SPARQL_ENDPOINT);
    const directDatabaseAccess = new DirectDatabaseAccess(TEST_SPARQL_ENDPOINT);

    describe('findById', () => {

        test('When sessie exists with id, then return sessie', async () => {
            const sessie = SessieTestBuilder.aSessie().build();
            await repository.save(sessie);

            const anotherSessie = SessieTestBuilder.aSessie().build();
            await repository.save(anotherSessie);

            const actualSessie = await repository.findById(sessie.id);

            expect(actualSessie).toEqual(sessie);
        });

        test('When sessie not exists with id, then throw error', async () => {
            const sessie = SessieTestBuilder.aSessie().build();
            await repository.save(sessie);

            const nonExistentSessieId = SessieTestBuilder.buildIri("thisiddoesnotexist");

            await expect(repository.findById(nonExistentSessieId)).rejects.toThrow(new Error(`No session found for iri: ${nonExistentSessieId}`));

        });

        test('Verify ontology and mapping', async () => {
            const sessieId = `http://mu.semte.ch/sessions/${uuid()}`;
            const bestuurseenheidId = `http://data.lblod.info/id/bestuurseenheden/${uuid()}`;

            const sessie =
                        SessieTestBuilder
                            .aSessie()
                            .withId(sessieId)
                            .withBestuurseenheidId(bestuurseenheidId)
                            .withSessieRol(SessieRol.LOKETLB_LPDCGEBRUIKER)
                            .build();

            await directDatabaseAccess.insertData(
                "http://mu.semte.ch/graphs/sessions",
                [`<${sessieId}> a <http://data.vlaanderen.be/ns/besluit#Bestuurseenheid>`,
                    `<${sessieId}> <http://mu.semte.ch/vocabularies/ext/sessionGroup> <${bestuurseenheidId}>`,
                    `<${sessieId}> <http://mu.semte.ch/vocabularies/ext/sessionRole> """LoketLB-LPDCGebruiker"""`,
                    `<${sessieId}> <http://mu.semte.ch/vocabularies/ext/sessionRole> """LoketLB-bbcdrGebruiker"""`,
                    `<${sessieId}> <http://mu.semte.ch/vocabularies/ext/sessionRole> """LoketLB-berichtenGebruiker"""`,
                ]);

            const actualSessie = await repository.findById(sessieId);

            expect(actualSessie).toEqual(sessie);
        });
    });

});