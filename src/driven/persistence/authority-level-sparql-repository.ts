import { SparqlQuerying } from "./sparql-querying";
import { PREFIX } from "../../../config";
import {
  sparqlEscapeUri,
} from "../../../mu-helper";
import { Iri } from "../../core/domain/shared/iri";
import { CompetentAuthorityLevelType, ExecutingAuthorityLevelType } from "../../core/domain/types";
import { NotFoundError } from "../../core/domain/shared/lpdc-error";
import { AuthorityLevelRepository } from '../../core/port/driven/persistence/authority-level-repository';

export class AuthorityLevelSparqlRepository
  implements AuthorityLevelRepository
{
  protected readonly querying: SparqlQuerying;

  constructor(endpoint?: string) {
    this.querying = new SparqlQuerying(endpoint);
  }

  async getExecutingAuthorityLevel(iri: Iri): Promise<ExecutingAuthorityLevelType | undefined> {
    const level = await this.getAuthorityLevel(iri, OrganizationLevelType.EXECUTINGLEVEL);

    return this.mapExecutingLevelUriToType(level);

  }

  async getCompetentAuthorityLevel(iri: Iri): Promise<CompetentAuthorityLevelType | undefined> {
    const level = await this.getAuthorityLevel(iri, OrganizationLevelType.COMPETENTLEVEL);

    return this.mapCompetentLevelUriToType(level);

  }

  private async getAuthorityLevel(iri: Iri, typeLevel: OrganizationLevelType): Promise<string | undefined> {
    const authorityLevelQuery = `
          ${PREFIX.lpdc}

          SELECT ?${typeLevel} WHERE {
            GRAPH <http://mu.semte.ch/graphs/public> {
              ${sparqlEscapeUri(iri)} lpdc:${typeLevel} ?${typeLevel} .
            }
          }
          LIMIT 1
      `;

    const result = await this.querying.singleRow(authorityLevelQuery);

    if (!result || !result[typeLevel]) return undefined;
    return result[typeLevel].value;
  }

  private mapExecutingLevelUriToType(
    executingLevelUri: string | undefined
  ): ExecutingAuthorityLevelType {
    if (!executingLevelUri) return undefined;

    const key: string | undefined = Object.keys(
      ExecutingAuthorityLevelUri
    ).find((key) => ExecutingAuthorityLevelUri[key] === executingLevelUri);

    const executingLevel = ExecutingAuthorityLevelType[key];
    if (!executingLevel) {
      throw new NotFoundError(
        `Geen uitvoerend bestuursniveau gevonden voor: ${executingLevelUri}`
      );
    }

    return executingLevel;
  }

  private mapCompetentLevelUriToType(
    competentLevelUri: string | undefined
  ): CompetentAuthorityLevelType {
    if (!competentLevelUri) return undefined;

    const key: string | undefined = Object.keys(
      CompetentAuthorityLevelUri
    ).find((key) => CompetentAuthorityLevelUri[key] === competentLevelUri);

    const competentLevel = CompetentAuthorityLevelType[key];
    if (!competentLevel) {
      throw new NotFoundError(
        `Geen bevoegd bestuursniveau gevonden voor: ${competentLevelUri}`
      );
    }

    return competentLevel;
  }
}

export enum ExecutingAuthorityLevelUri {
  LOKAAL = "https://productencatalogus.data.vlaanderen.be/id/concept/UitvoerendBestuursniveau/Lokaal",
  FEDERAAL = "https://productencatalogus.data.vlaanderen.be/id/concept/UitvoerendBestuursniveau/Federaal",
  VLAAMS = "https://productencatalogus.data.vlaanderen.be/id/concept/UitvoerendBestuursniveau/Vlaams",
  EUROPEES = "https://productencatalogus.data.vlaanderen.be/id/concept/UitvoerendBestuursniveau/Europees",
  PROVINCIAAL = "https://productencatalogus.data.vlaanderen.be/id/concept/UitvoerendBestuursniveau/Provinciaal",
  DERDEN = "https://productencatalogus.data.vlaanderen.be/id/concept/UitvoerendBestuursniveau/Derden",
}

export enum CompetentAuthorityLevelUri {
  LOKAAL = "https://productencatalogus.data.vlaanderen.be/id/concept/BevoegdBestuursniveau/Lokaal",
  FEDERAAL = "https://productencatalogus.data.vlaanderen.be/id/concept/BevoegdBestuursniveau/Federaal",
  VLAAMS = "https://productencatalogus.data.vlaanderen.be/id/concept/BevoegdBestuursniveau/Vlaams",
  EUROPEES = "https://productencatalogus.data.vlaanderen.be/id/concept/BevoegdBestuursniveau/Europees",
  PROVINCIAAL = "https://productencatalogus.data.vlaanderen.be/id/concept/BevoegdBestuursniveau/Provinciaal",
}


export enum OrganizationLevelType {
  EXECUTINGLEVEL = "organizationExecutingLevel",
  COMPETENTLEVEL = "organizationCompetencyLevel",
}
