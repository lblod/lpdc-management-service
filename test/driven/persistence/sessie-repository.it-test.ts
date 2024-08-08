import {aSession} from "../../core/domain/session-test-builder";
import {TEST_SPARQL_ENDPOINT} from "../../test.config";
import {SessionSparqlTestRepository} from "./session-sparql-test-repository";
import {uuid} from "../../../mu-helper";
import {DirectDatabaseAccess} from "./direct-database-access";
import {SessionRoleType} from "../../../src/core/domain/session";
import {USER_SESSIONS_GRAPH} from "../../../config";
import {buildBestuurseenheidIri, buildSessionIri} from "../../core/domain/iri-test-builder";
import {NotFoundError} from "../../../src/core/domain/shared/lpdc-error";

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

            const nonExistentSessionId = buildSessionIri("thisiddoesnotexist");

            await expect(repository.findById(nonExistentSessionId)).rejects.toThrowWithMessage(NotFoundError, `Geen sessie gevonden voor Iri: ${nonExistentSessionId}`);

        });

        test('Verify ontology and mapping', async () => {
            const sessionId = buildSessionIri(uuid());
            const bestuurseenheidId = buildBestuurseenheidIri(uuid());

            const session =
                aSession()
                    .withId(sessionId)
                    .withBestuurseenheidId(bestuurseenheidId)
                    .withSessionRoles([
                        SessionRoleType.LOKETLB_LPDCGEBRUIKER,
                        'LoketLB-bbcdrGebruiker',
                        'LoketLB-berichtenGebruiker'])
                    .build();

            await directDatabaseAccess.insertData(
                USER_SESSIONS_GRAPH,
                [`<${sessionId}> a <http://data.vlaanderen.be/ns/besluit#Bestuurseenheid>`,
                    `<${sessionId}> <http://mu.semte.ch/vocabularies/ext/sessionGroup> <${bestuurseenheidId}>`,
                    `<${sessionId}> <http://mu.semte.ch/vocabularies/ext/sessionRole> """LoketLB-LPDCGebruiker"""`,
                    `<${sessionId}> <http://mu.semte.ch/vocabularies/ext/sessionRole> """LoketLB-bbcdrGebruiker"""`,
                    `<${sessionId}> <http://mu.semte.ch/vocabularies/ext/sessionRole> """LoketLB-berichtenGebruiker"""`,
                ]);

            const actualSession = await repository.findById(sessionId);

            expect(actualSession).toEqual(session);
        });

        test('Can load a session without a session role', async () => {
            const sessionId = buildSessionIri(uuid());
            const bestuurseenheidId = buildBestuurseenheidIri(uuid());

            const session =
                aSession()
                    .withId(sessionId)
                    .withBestuurseenheidId(bestuurseenheidId)
                    .withSessionRoles([])
                    .build();

            await directDatabaseAccess.insertData(
                USER_SESSIONS_GRAPH,
                [`<${sessionId}> a <http://data.vlaanderen.be/ns/besluit#Bestuurseenheid>`,
                    `<${sessionId}> <http://mu.semte.ch/vocabularies/ext/sessionGroup> <${bestuurseenheidId}>`,
                ]);

            const actualSession = await repository.findById(sessionId);

            expect(actualSession).toEqual(session);
            expect(actualSession.sessionRoles.length).toEqual(0);
        });

        test('Can load a session without a LoketLB-LPDCGebruiker session role', async () => {
            const sessionId = buildSessionIri(uuid());
            const bestuurseenheidId = buildBestuurseenheidIri(uuid());

            const session =
                aSession()
                    .withId(sessionId)
                    .withBestuurseenheidId(bestuurseenheidId)
                    .withSessionRoles([
                        'AnyOtherRole'
                    ])
                    .build();

            await directDatabaseAccess.insertData(
                USER_SESSIONS_GRAPH,
                [`<${sessionId}> a <http://data.vlaanderen.be/ns/besluit#Bestuurseenheid>`,
                    `<${sessionId}> <http://mu.semte.ch/vocabularies/ext/sessionGroup> <${bestuurseenheidId}>`,
                    `<${sessionId}> <http://mu.semte.ch/vocabularies/ext/sessionRole> """AnyOtherRole"""`,
                ]);

            const actualSession = await repository.findById(sessionId);

            expect(actualSession).toEqual(session);
        });
    });

    describe('exists', () => {

        test('When session exists with id, then return true', async () => {
            const session = aSession().build();
            await repository.save(session);

            expect(await repository.exists(session.id)).toBeTruthy();
        });

        test('When session not exists with id, then throw error', async () => {
            const session = aSession().build();
            await repository.save(session);

            const nonExistentSessionId = buildSessionIri("thisiddoesnotexist");

            expect(await repository.exists(nonExistentSessionId)).toBeFalsy();

        });

    });

});