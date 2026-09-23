import {
  CodeRepository,
  CodeSchema,
} from "../../core/port/driven/persistence/code-repository";
import { SparqlQuerying } from "./sparql-querying";
import { PREFIX, PUBLIC_GRAPH, WEGWIJS_URL } from "../../../config";
import { sparqlEscapeString, sparqlEscapeUri, uuid } from "../../../mu-helper";
import { Iri } from "../../core/domain/shared/iri";
import { NS } from "./namespaces";
import { ExecutingAuthorityLevelUri } from "./authority-level-sparql-repository";
import { extractResultsFromAllSettled } from "../../../platform/promises";
import { BestuurseenheidStatusCodeUri } from "./bestuurseenheid-sparql-repository";

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

  // Create the tailored codelists used by the form dropdowns
  // -> executing codelist: active bestuurseenheden + ipdc orgs (all)
  // -> competent codelist: active bestuurseenheden + ipdc orgs (without 'derden')
  async loadIPDCOrganisatiesTailoredInTurtleFormat(): Promise<string[]> {
    const bestuurseenheidTailoredAsIpdcOrganisatieConceptQuery = `
            ${PREFIX.skos}
            ${PREFIX.besluit}
            ${PREFIX.regorg}

            CONSTRUCT {
              ?bestuurseenheid a skos:Concept ;
                skos:inScheme <https://productencatalogus.data.vlaanderen.be/id/conceptscheme/IPDCOrganisaties/tailoredCompetent> ;
                skos:inScheme <https://productencatalogus.data.vlaanderen.be/id/conceptscheme/IPDCOrganisaties/tailoredExecuting> ;
                skos:prefLabel ?newLabel .
            }
            WHERE {
                GRAPH ${sparqlEscapeUri(PUBLIC_GRAPH)} {
                  ?bestuurseenheid a besluit:Bestuurseenheid ;
                    skos:prefLabel ?bestuurseenheidLabel .

                  ?bestuurseenheid besluit:classificatie ?bestuurseenheidClassificatie .
                  ?bestuurseenheidClassificatie skos:prefLabel ?bestuurseenheidClassificatieLabel .

                  FILTER NOT EXISTS {
                    ?bestuurseenheid regorg:orgStatus ${sparqlEscapeUri(BestuurseenheidStatusCodeUri.INACTIVE)} .
                  }

                  BIND(CONCAT(?bestuurseenheidLabel, " (", ?bestuurseenheidClassificatieLabel, ")") as ?newLabel)
              }
            }
          `;

    const ipdcOrganisatiesSchemesAsIpdcOrganisatieConceptQuery = `
            ${PREFIX.skos}
            ${PREFIX.dvcs}
            ${PREFIX.rdfs}
            ${PREFIX.lpdc}

            CONSTRUCT {
              ?s ?p ?o ;
                skos:inScheme <https://productencatalogus.data.vlaanderen.be/id/conceptscheme/IPDCOrganisaties/tailoredExecuting> ;
                skos:inScheme ?competentScheme .
            }
            WHERE {
                GRAPH ${sparqlEscapeUri(PUBLIC_GRAPH)} {
                  ?s a skos:Concept ;
                    skos:inScheme dvcs:IPDCOrganisaties ;
                    rdfs:seeAlso ${sparqlEscapeUri(WEGWIJS_URL)} ;
                    ?p ?o .

                  OPTIONAL {
                    ?s a skos:Concept .
                    FILTER NOT EXISTS {
                      ?s lpdc:organizationExecutingLevel ${sparqlEscapeUri(ExecutingAuthorityLevelUri.DERDEN)} .
                    }
                    BIND(<https://productencatalogus.data.vlaanderen.be/id/conceptscheme/IPDCOrganisaties/tailoredCompetent> AS ?competentScheme)
                  }
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
}
