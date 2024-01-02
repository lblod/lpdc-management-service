import {SessionSparqlRepository} from "../../../src/driven/persistence/session-sparql-repository";
import {Session} from "../../../src/core/domain/session";
import {PREFIX} from "../../../config";
import {sparqlEscapeString, sparqlEscapeUri} from "../../../mu-helper";

export class SessionSparqlTestRepository extends SessionSparqlRepository {

    constructor(endpoint?: string) {
        super(endpoint);
    }

    async save(session: Session): Promise<void> {
        const query = `
            ${PREFIX.ext}
            INSERT DATA { 
                GRAPH <http://mu.semte.ch/graphs/sessions> {
                    ${sparqlEscapeUri(session.id)} ext:sessionGroup ${sparqlEscapeUri(session.bestuurseenheidId)}.
                    ${sparqlEscapeUri(session.id)} ext:sessionRole ${sparqlEscapeString(session.sessionRol)}.
                }
            }
        `;
        await this.querying.update(query);
    }

}