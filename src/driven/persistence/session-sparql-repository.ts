import { Iri } from "../../core/domain/shared/iri";
import { SessionRepository } from "../../core/port/driven/persistence/session-repository";
import { Session } from "../../core/domain/session";
import { SparqlQuerying } from "./sparql-querying";
import { sparqlEscapeUri } from "../../../mu-helper";
import { PREFIX, USER_SESSIONS_GRAPH } from "../../../config";
import {
  NotFoundError,
  SystemError,
} from "../../core/domain/shared/lpdc-error";
import { uniq } from "lodash";

export class SessionSparqlRepository implements SessionRepository {
  protected readonly querying: SparqlQuerying;
  constructor(endpoint?: string) {
    this.querying = new SparqlQuerying(endpoint);
  }

  async findById(id: Iri): Promise<Session> {
    const query = `
            ${PREFIX.ext}
            ${PREFIX.foaf}
            ${PREFIX.mu}

            SELECT ?bestuurseenheid ?sessionRole ?persoon WHERE {
              GRAPH ${sparqlEscapeUri(USER_SESSIONS_GRAPH)} {
                ${sparqlEscapeUri(id)} ext:sessionGroup ?bestuurseenheid .
                OPTIONAL {
                  ${sparqlEscapeUri(id)} ext:sessionRole ?sessionRole .
                }

                ${sparqlEscapeUri(id)} <http://mu.semte.ch/vocabularies/session/account> ?account.
              }

              # Create the organization graph URI based on the bestuurseenheid
              BIND(IRI(CONCAT("http://mu.semte.ch/graphs/organizations/",
                          REPLACE(STR(?bestuurseenheid), "http://data.lblod.info/id/bestuurseenheden/", "")))
                AS ?orgGraph)

              # Look for person information in their organization graph
              GRAPH ?orgGraph {
                ?persoon foaf:account ?account .
              }
            }
        `;
    const result = await this.querying.list(query);

    if (result.length === 0) {
      throw new NotFoundError(`Geen sessie gevonden voor Iri: ${id}`);
    }

    if (uniq(result.map((r) => r["bestuurseenheid"].value)).length > 1) {
      throw new SystemError(
        `Geen geldige sessie gevonden voor Iri: ${id}: bevat meerdere bestuurseenheden`,
      );
    }

    return new Session(
      id,
      new Iri(result[0]["bestuurseenheid"].value),
      new Iri(result[0]["persoon"].value),
      result
        .map((r) => r["sessionRole"]?.value)
        .filter((sr) => sr !== undefined),
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
