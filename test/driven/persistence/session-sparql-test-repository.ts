import { SessionSparqlRepository } from "../../../src/driven/persistence/session-sparql-repository";
import { Session } from "../../../src/core/domain/session";
import { PREFIX, USER_SESSIONS_GRAPH } from "../../../config";
import { sparqlEscapeString, sparqlEscapeUri } from "../../../mu-helper";
import { DirectDatabaseAccess } from "./direct-database-access";

export class SessionSparqlTestRepository extends SessionSparqlRepository {
  private readonly directDatabaseAccess: DirectDatabaseAccess;

  constructor(endpoint?: string) {
    super(endpoint);
    this.directDatabaseAccess = new DirectDatabaseAccess(endpoint);
  }

  async save(session: Session): Promise<void> {
    await this.directDatabaseAccess.insertData(
      USER_SESSIONS_GRAPH,
      [
        `${sparqlEscapeUri(session.id)} ext:sessionGroup ${sparqlEscapeUri(session.bestuurseenheidId)}`,
        `${sparqlEscapeUri(session.id)} session:account ${sparqlEscapeUri(session.accountId)}`,
        ...session.sessionRoles.map(
          (sr) =>
            `${sparqlEscapeUri(session.id)} ext:sessionRole ${sparqlEscapeString(sr)}`,
        ),
      ],
      [PREFIX.ext, PREFIX.session],
    );
  }
}
