import { Iri } from "../../../src/core/domain/shared/iri";
import { PREFIX, PUBLIC_GRAPH } from "../../../config";
import { sparqlEscapeUri } from "../../../mu-helper";
import {
  AuthorityLevelSparqlRepository,
  CompetentAuthorityLevelUri,
  ExecutingAuthorityLevelUri,
  OrganizationLevelType,
} from "../../../src/driven/persistence/authority-level-sparql-repository";

export class AuthorityLevelSparqlTestRepository extends AuthorityLevelSparqlRepository {
  constructor(endpoint?: string) {
    super(endpoint);
  }

  async saveExecutingAuthorityLevel(
    iri: Iri,
    level: ExecutingAuthorityLevelUri,
  ) {
    this.saveAuthorityLevel(iri, OrganizationLevelType.EXECUTINGLEVEL, level);
  }

  async saveCompetentAuthorityLevel(
    iri: Iri,
    level: CompetentAuthorityLevelUri,
  ) {
    this.saveAuthorityLevel(iri, OrganizationLevelType.COMPETENTLEVEL, level);
  }

  private async saveAuthorityLevel(
    iri: Iri,
    typeLevel: OrganizationLevelType,
    level: ExecutingAuthorityLevelUri | CompetentAuthorityLevelUri,
  ) {
    const query = `
      ${PREFIX.lpdc}

      INSERT DATA {
        GRAPH ${sparqlEscapeUri(PUBLIC_GRAPH)} {
          ${sparqlEscapeUri(iri.value)} lpdc:${typeLevel} ${sparqlEscapeUri(level)} .
        }
    }`;

    await this.querying.insert(query);
  }
}
