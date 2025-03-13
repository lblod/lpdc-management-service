import {
  CodeRepository,
  CodeSchema,
} from "../../core/port/driven/persistence/code-repository";
import { SparqlQuerying } from "./sparql-querying";
import { PREFIX, PUBLIC_GRAPH, WEGWIJS_URL } from "../../../config";
import { sparqlEscapeString, sparqlEscapeUri, uuid } from "../../../mu-helper";
import { Iri } from "../../core/domain/shared/iri";
import { NS } from "./namespaces";
import { extractResultsFromAllSettled } from "../../../platform/promises";
import { NotFoundError } from '../../core/domain/shared/lpdc-error';
import { CompetentAuthorityLevelType, ExecutingAuthorityLevelType } from '../../core/domain/types';
import { CompetentAuthorityLevelUri, ExecutingAuthorityLevelUri } from './bestuurseenheid-sparql-repository';

export class CodeSparqlRepository implements CodeRepository {
  protected readonly querying: SparqlQuerying;

  constructor(endpoint?: string) {
    this.querying = new SparqlQuerying(endpoint);
  }

  async exists(schema: CodeSchema, id: Iri): Promise<boolean> {
    const query = `
        ${PREFIX.skos}

        ASK {
            GRAPH ?g {
                ${sparqlEscapeUri(id)} a skos:Concept;
                    skos:inScheme ${sparqlEscapeUri(NS.dvcs(schema).value)}.
            }
        }`;
    return this.querying.ask(query);
  }

  async save(
    schema: CodeSchema,
    id: Iri,
    prefLabel: string,
    seeAlso: Iri,
  ): Promise<void> {
    const query = `
        ${PREFIX.skos}
        ${PREFIX.mu}
        ${PREFIX.rdfs}
        INSERT DATA {
          GRAPH ${sparqlEscapeUri(PUBLIC_GRAPH)} {
            ${sparqlEscapeUri(id)} a skos:Concept.
            ${sparqlEscapeUri(id)} skos:inScheme ${sparqlEscapeUri(NS.dvcs(schema).value)}.
            ${sparqlEscapeUri(id)} skos:topConceptOf ${sparqlEscapeUri(NS.dvcs(schema).value)}.
            ${sparqlEscapeUri(id)} skos:prefLabel ${sparqlEscapeString(prefLabel)}.
            ${sparqlEscapeUri(id)} mu:uuid ${sparqlEscapeString(uuid())}.
            ${sparqlEscapeUri(id)} rdfs:seeAlso ${sparqlEscapeUri(seeAlso)}.
          }
        }
        `;

    await this.querying.insert(query);
  }

  async loadIPDCOrganisatiesTailoredInTurtleFormat(): Promise<string[]> {
    const bestuurseenheidTailoredAsIpdcOrganisatieConceptQuery = `
            ${PREFIX.skos}
            ${PREFIX.besluit}
            CONSTRUCT {
              ?bestuurseenheid a skos:Concept ;
                skos:inScheme <https://productencatalogus.data.vlaanderen.be/id/conceptscheme/IPDCOrganisaties/tailored> ;
                skos:prefLabel ?newLabel .
            }
            WHERE {
                GRAPH ${sparqlEscapeUri(PUBLIC_GRAPH)} {
                  ?bestuurseenheid a besluit:Bestuurseenheid ;
                    skos:prefLabel ?bestuurseenheidLabel .

                  ?bestuurseenheid besluit:classificatie ?bestuurseenheidClassificatie .
                  ?bestuurseenheidClassificatie skos:prefLabel ?bestuurseenheidClassificatieLabel .

                  BIND(CONCAT(?bestuurseenheidLabel, " (", ?bestuurseenheidClassificatieLabel, ")") as ?newLabel)
               }
            }
          `;

    const ipdcOrganisatiesSchemesAsIpdcOrganisatieConceptQuery = `
            ${PREFIX.skos}
            ${PREFIX.dvcs}
            ${PREFIX.rdfs}

            CONSTRUCT {
              ?s ?p ?o ;
                skos:inScheme <https://productencatalogus.data.vlaanderen.be/id/conceptscheme/IPDCOrganisaties/tailored> .
            }
            WHERE {
                GRAPH ${sparqlEscapeUri(PUBLIC_GRAPH)} {
                  ?s a skos:Concept ;
                    skos:inScheme dvcs:IPDCOrganisaties ;
                rdfs:seeAlso ${sparqlEscapeUri(WEGWIJS_URL)} ;
                    ?p ?o .
                }
            }
          `;

    const [
      bestuurseenheidTailoredAsIpdcOrganisatieConceptResult,
      ipdcOrganisatiesSchemesAsIpdcOrganisatieConceptResult,
    ] = await extractResultsFromAllSettled([
      this.querying.list(bestuurseenheidTailoredAsIpdcOrganisatieConceptQuery),
      this.querying.list(ipdcOrganisatiesSchemesAsIpdcOrganisatieConceptQuery),
    ]);

    const bestuurseenheidTailoredAsIpdcOrganisatieTailoredConceptQuads =
      this.querying.asQuads(
        bestuurseenheidTailoredAsIpdcOrganisatieConceptResult,
        PUBLIC_GRAPH,
      );
    const ipdcOrganisatiesConceptSchemesAsIpdcOrganisatieTailoredConceptQuads =
      this.querying.asQuads(
        ipdcOrganisatiesSchemesAsIpdcOrganisatieConceptResult,
        PUBLIC_GRAPH,
      );

    return [
      ...bestuurseenheidTailoredAsIpdcOrganisatieTailoredConceptQuads.map((q) =>
        q.toNT(),
      ),
      ...ipdcOrganisatiesConceptSchemesAsIpdcOrganisatieTailoredConceptQuads.map(
        (q) => q.toNT(),
      ),
    ];
  }

  async getAuthorityLevelForOvoCode(iri: Iri, typeLevel: "executionLevel" | "competencyLevel"): Promise<ExecutingAuthorityLevelType | CompetentAuthorityLevelUri | undefined> {
    const authorityLevelQuery = `
          ${PREFIX.lpdcExt}

          SELECT ?${typeLevel} WHERE {
            GRAPH <http://mu.semte.ch/graphs/public> {
              ${sparqlEscapeUri(iri)} lpdcExt:${typeLevel} ?${typeLevel} .
            }
          }
          LIMIT 1
      `;

    const result = await this.querying.singleRow(authorityLevelQuery);
    if (typeLevel === 'executionLevel') {
      return this.mapExecutionLevelUriToType(result[typeLevel].value);
    } else {
      return this.mapCompetentLevelUriToType(result[typeLevel].value);
    }
  }

  // FIXME: duplicate of bestuurseenheid-sparql-repository.ts functions, need to consolidate in 1 place
  mapExecutionLevelUriToType(
    executionLevelUri: string | undefined
  ): ExecutingAuthorityLevelType {
    if (!executionLevelUri) return undefined;

    const key: string | undefined = Object.keys(
      ExecutingAuthorityLevelUri
    ).find((key) => ExecutingAuthorityLevelUri[key] === executionLevelUri);

    const executionLevel = ExecutingAuthorityLevelType[key];
    if (!executionLevel) {
      throw new NotFoundError(
        `Geen uitvoerend bestuursniveau gevonden voor: ${executionLevelUri}`
      );
    }

    return executionLevel;
  }

  mapCompetentLevelUriToType(
    competentLevelUri: string | undefined
  ): CompetentAuthorityLevelUri {
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
