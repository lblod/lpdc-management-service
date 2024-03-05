import {Iri} from "../core/domain/shared/iri";
import {SessionRoleType} from "../core/domain/session";
import {SessionRepository} from "../core/port/driven/persistence/session-repository";
import {Forbidden, Unauthorized} from "./http-error";

export async function authenticateAndAuthorizeRequest(req, next, sessionRepository: SessionRepository) {
    const sessionIri: string | undefined = req.headers['mu-session-id'] as string;
    if (!sessionIri) {
        throw new Unauthorized();
    }
    const sessionId = new Iri(sessionIri);
    const sessionExists = await sessionRepository.exists(sessionId);
    if (!sessionExists) {
        throw new Unauthorized();
    }
    const session = await sessionRepository.findById(sessionId);
    if (!session.hasRole(SessionRoleType.LOKETLB_LPDCGEBRUIKER)) {
        throw new Forbidden();
    }

    req['session'] = session;
    next();
}
