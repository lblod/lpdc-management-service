import {aSession, SessionTestBuilder} from "../../core/domain/session-test-builder";
import {TEST_SPARQL_ENDPOINT} from "../../test.config";
import {SessionSparqlTestRepository} from "./session-sparql-test-repository";
import {uuid} from "../../../mu-helper";
import {DirectDatabaseAccess} from "./direct-database-access";
import {SessionRole} from "../../../src/core/domain/session";

describe('SessionRepository', () => {
    const repository = new SessionSparqlTestRepository(TEST_SPARQL_ENDPOINT);
    const directDatabaseAccess = new DirectDatabaseAccess(TEST_SPARQL_ENDPOINT);

    describe('findById', () => {

        test('When session exists with id, then return session', async () => {
            const session = aSession().build();
            await repository.save(session);

            const anotherSession = aSession().build();
            await repository.save(anotherSession);

            const actualSession = await repository.findById(session.id);

            expect(actualSession).toEqual(session);
        });

        test('When session not exists with id, then throw error', async () => {
            const session = aSession().build();
            await repository.save(session);

            const nonExistentSessionId = SessionTestBuilder.buildIri("thisiddoesnotexist");

            await expect(repository.findById(nonExistentSessionId)).rejects.toThrow(new Error(`No session found for iri: ${nonExistentSessionId}`));

        });

        test('Verify ontology and mapping', async () => {
            const sessionId = `http://mu.semte.ch/sessions/${uuid()}`;
            const bestuurseenheidId = `http://data.lblod.info/id/bestuurseenheden/${uuid()}`;

            const session =
                        aSession()
                            .withId(sessionId)
                            .withBestuurseenheidId(bestuurseenheidId)
                            .withSessionRole(SessionRole.LOKETLB_LPDCGEBRUIKER)
                            .build();

            await directDatabaseAccess.insertData(
                "http://mu.semte.ch/graphs/sessions",
                [`<${sessionId}> a <http://data.vlaanderen.be/ns/besluit#Bestuurseenheid>`,
                    `<${sessionId}> <http://mu.semte.ch/vocabularies/ext/sessionGroup> <${bestuurseenheidId}>`,
                    `<${sessionId}> <http://mu.semte.ch/vocabularies/ext/sessionRole> """LoketLB-LPDCGebruiker"""`,
                    `<${sessionId}> <http://mu.semte.ch/vocabularies/ext/sessionRole> """LoketLB-bbcdrGebruiker"""`,
                    `<${sessionId}> <http://mu.semte.ch/vocabularies/ext/sessionRole> """LoketLB-berichtenGebruiker"""`,
                ]);

            const actualSession = await repository.findById(sessionId);

            expect(actualSession).toEqual(session);
        });
    });

});