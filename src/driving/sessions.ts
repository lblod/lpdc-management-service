import {Iri} from "../core/domain/shared/iri";
import {SessionRoleType} from "../core/domain/session";
import {SessionRepository} from "../core/port/driven/persistence/session-repository";

export const authenticateAndAuthorizeRequest = (sessionRepository: SessionRepository) => async (req, res, next) => {
    try {
        const sessionIri: string | undefined = req.headers['mu-session-id'] as string;
        if (!sessionIri) {
            const response = {
                status: 401,
                message: `Not authenticated for this request`
            };
            return res.status(response.status).set('content-type', 'application/json').send(response.message);
        }
        const sessionId = new Iri(sessionIri);
        const sessionExists = await sessionRepository.exists(sessionId);
        if (!sessionExists) {
            const response = {
                status: 401,
                message: `Not authenticated for this request`
            };
            return res.status(response.status).set('content-type', 'application/json').send(response.message);
        }
        const session = await sessionRepository.findById(sessionId);
        if (!session.hasRole(SessionRoleType.LOKETLB_LPDCGEBRUIKER)) {
            const response = {
                status: 403,
                message: `Forbidden for this request`
            };
            return res.status(response.status).set('content-type', 'application/json').send(response.message);
        }

        req['session'] = session;

        next();
    } catch (e) {
        console.error(e);
        const response = {
            status: 500,
            message: `Could not execute request`
        };
        return res.status(response.status).set('content-type', 'application/json').send(response.message);
    }
};
