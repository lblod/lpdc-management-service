import {querySudo} from '@lblod/mu-auth-sudo';
import {sparqlEscapeUri} from '../mu-helper';
import {Iri} from "../src/core/domain/shared/iri";
import {SessionRoleType} from "../src/core/domain/session";
import {SessionRepository} from "../src/core/port/driven/persistence/session-repository";

//TODO LPDC-917: remove ...
export async function isAllowedForLPDC(sessionUri: string): Promise<boolean> {
    const queryStr = `
    ASK {
      ${sparqlEscapeUri(sessionUri)} <http://mu.semte.ch/vocabularies/ext/sessionRole> "LoketLB-LPDCGebruiker".
    }
  `;
    return (await querySudo(queryStr)).boolean;
}

//TODO LPDC-917: find a better place for these type of functions ...
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
            message: `Could not validate session`
        };
        return res.status(response.status).set('content-type', 'application/json').send(response.message);
    }
};
