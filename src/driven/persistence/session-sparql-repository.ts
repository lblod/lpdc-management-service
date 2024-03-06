import {Iri} from "../../core/domain/shared/iri";
import {SessionRepository} from "../../core/port/driven/persistence/session-repository";
import {Session} from "../../core/domain/session";
import {SparqlQuerying} from "./sparql-querying";
import {sparqlEscapeUri} from "../../../mu-helper";
import {PREFIX, USER_SESSIONS_GRAPH} from "../../../config";
import {NotFoundError} from "../../core/domain/shared/lpdc-error";

export class SessionSparqlRepository implements SessionRepository {

    protected readonly querying: SparqlQuerying;
    constructor(endpoint?: string) {
        this.querying = new SparqlQuerying(endpoint);
    }

    async findById(id: Iri): Promise<Session> {
        const query = `
            ${PREFIX.ext}
            SELECT ?bestuurseenheid ?sessionRole WHERE {
                GRAPH ${sparqlEscapeUri(USER_SESSIONS_GRAPH)} {
                    ${sparqlEscapeUri(id)} ext:sessionGroup ?bestuurseenheid .
                    OPTIONAL {
                        ${sparqlEscapeUri(id)} ext:sessionRole ?sessionRole .
                    }
                }
            }
        `;
        const result = await this.querying.list(query);

        if (result.length === 0) {
            throw new NotFoundError(`Geen sessie gevonden voor Iri: ${id}`);
        }

        return new Session(
            id,
            new Iri(result[0]['bestuurseenheid'].value),
            result.map(r => r['sessionRole']?.value).filter(sr => sr !== undefined),
        );
    }

    async exists(id: Iri): Promise<boolean> {
        const query = `
            ${PREFIX.ext}
            ASK WHERE {
                GRAPH ${sparqlEscapeUri(USER_SESSIONS_GRAPH)} {
                    ${sparqlEscapeUri(id)} ?p ?s.
                }
            }
        `;
        return this.querying.ask(query);
    }
}