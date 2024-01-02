import {Iri} from "../../core/domain/shared/iri";
import {SessionRepository} from "../../core/port/driven/persistence/session-repository";
import {Session, SessionRole} from "../../core/domain/session";
import {SparqlQuerying} from "./sparql-querying";
import {sparqlEscapeUri} from "../../../mu-helper";
import {PREFIX} from "../../../config";

export class SessionSparqlRepository implements SessionRepository {

    protected readonly querying: SparqlQuerying;
    constructor(endpoint?: string) {
        this.querying = new SparqlQuerying(endpoint);
    }

    async findById(id: Iri): Promise<Session> {
        const query = `
            ${PREFIX.ext}
            SELECT ?id ?bestuurseenheid ?sessionRole WHERE {
                GRAPH <http://mu.semte.ch/graphs/sessions> {
                    VALUES (?id ?sessionRole) {
                        (${sparqlEscapeUri(id)} """${SessionRole.LOKETLB_LPDCGEBRUIKER}""")
                    }
                    ?id ext:sessionGroup ?bestuurseenheid .
                    ?id ext:sessionRole ?sessionRole .
                }
            }
        `;
        const result = await this.querying.singleRow(query);

        if (!result) {
            throw new Error(`No session found for iri: ${id}`);
        }

        return new Session(
            result['id'].value,
            result['bestuurseenheid'].value,
            result['sessionRole'].value
        );
    }
}