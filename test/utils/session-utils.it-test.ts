import {authenticateAndAuthorizeRequest} from "../../utils/session-utils";
import {SessionSparqlTestRepository} from "../driven/persistence/session-sparql-test-repository";
import {TEST_SPARQL_ENDPOINT} from "../test.config";
import {buildSessionIri} from "../core/domain/iri-test-builder";
import {uuid} from "../../mu-helper";
import {aSession} from "../core/domain/session-test-builder";

describe('authenticateAndAuthorizeRequest', () => {

    const mockResponse = () => {
        const res = {};
        res['status'] = jest.fn().mockReturnValue(res);
        res['set'] = jest.fn().mockReturnValue(res);
        res['send'] = jest.fn().mockReturnValue(res);
        return res;
    };

    const sessionRepository = new SessionSparqlTestRepository(TEST_SPARQL_ENDPOINT);

    afterEach(() => {
        jest.restoreAllMocks();
    });

    test('Mission mu-session-id header returns http 401', async() => {
        const req = { headers: {}};
        const res = mockResponse();
        const next = jest.fn();
        await authenticateAndAuthorizeRequest(sessionRepository)(req, res, next);

        expect(req['session']).toBeUndefined();
        expect(res['status']).toHaveBeenCalledWith(401);
        expect(res['set']).toHaveBeenCalledWith('content-type', 'application/json');
        expect(res['send']).toHaveBeenCalledWith('Not authenticated for this request');
        expect(next).not.toHaveBeenCalled();
    });

    test('When referenced session id in mu-session-id does not exist, returns http 401', async() => {
        const req = { headers: {'mu-session-id': buildSessionIri(uuid()).value}};

        const res = mockResponse();
        const next = jest.fn();
        await authenticateAndAuthorizeRequest(sessionRepository)(req, res, next);

        expect(req['session']).toBeUndefined();
        expect(res['status']).toHaveBeenCalledWith(401);
        expect(res['set']).toHaveBeenCalledWith('content-type', 'application/json');
        expect(res['send']).toHaveBeenCalledWith('Not authenticated for this request');
        expect(next).not.toHaveBeenCalled();
    });

    test('When referenced session mu-session-id has no lpdc rights, returns http 403', async() => {
        const sessionWithNoLpdcRights = aSession()
            .withSessionRoles([])
            .build();
        await sessionRepository.save(sessionWithNoLpdcRights);

        const req = { headers: {'mu-session-id': sessionWithNoLpdcRights.id.value}};

        const res = mockResponse();
        const next = jest.fn();
        await authenticateAndAuthorizeRequest(sessionRepository)(req, res, next);

        expect(req['session']).toBeUndefined();
        expect(res['status']).toHaveBeenCalledWith(403);
        expect(res['set']).toHaveBeenCalledWith('content-type', 'application/json');
        expect(res['send']).toHaveBeenCalledWith('Forbidden for this request');
        expect(next).not.toHaveBeenCalled();
    });

    test('When referenced session mu-session-id has lpdc rights, continue request', async() => {
        const session = aSession()
            .build();
        await sessionRepository.save(session);

        const req = { headers: {'mu-session-id': session.id.value}};

        const res = mockResponse();
        const next = jest.fn();
        await authenticateAndAuthorizeRequest(sessionRepository)(req, res, next);

        expect(req['session']).toEqual(session);
        expect(res['status']).not.toHaveBeenCalled();
        expect(res['set']).not.toHaveBeenCalled();
        expect(res['send']).not.toHaveBeenCalled();
        expect(next).toHaveBeenCalled();
    });

    test('When exception occurs, send error response', async() => {
        const session = aSession()
            .build();
        await sessionRepository.save(session);

        const req = { headers: {'mu-session-id': session.id.value}};

        const res = mockResponse();
        const next = jest.fn();
        await authenticateAndAuthorizeRequest(undefined)(req, res, next); // mimic crash by passing in undefined ...

        expect(req['session']).toBeUndefined();
        expect(res['status']).toHaveBeenCalledWith(500);
        expect(res['set']).toHaveBeenCalledWith('content-type', 'application/json');
        expect(res['send']).toHaveBeenCalledWith('Could not execute request');
        expect(next).not.toHaveBeenCalled();
    });

});