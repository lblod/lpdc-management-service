import { ConceptDisplayConfigurationSparqlRepository } from "../../../src/driven/persistence/concept-display-configuration-sparql-repository";
import { ConceptDisplayConfiguration } from "../../../src/core/domain/concept-display-configuration";
import { PREFIX } from "../../../config";
import { sparqlEscapeString, sparqlEscapeUri } from "../../../mu-helper";
import { Bestuurseenheid } from "../../../src/core/domain/bestuurseenheid";
import { Iri } from "../../../src/core/domain/shared/iri";

export class ConceptDisplayConfigurationSparqlTestRepository extends ConceptDisplayConfigurationSparqlRepository {
  constructor(endpoint?: string) {
    super(endpoint);
  }

  async save(
    bestuurseenheid: Bestuurseenheid,
    conceptDisplayConfiguration: ConceptDisplayConfiguration,
  ): Promise<void> {
    const bestuurseenheidGraph: Iri = bestuurseenheid.userGraph();

    const query = `
            ${PREFIX.lpdc}
            ${PREFIX.mu}
            ${PREFIX.dct}
            
            INSERT DATA { 
                GRAPH ${sparqlEscapeUri(bestuurseenheidGraph)} {
                    ${sparqlEscapeUri(conceptDisplayConfiguration.conceptId)} lpdc:hasConceptDisplayConfiguration ${sparqlEscapeUri(conceptDisplayConfiguration.id)} . 
                    ${sparqlEscapeUri(conceptDisplayConfiguration.id)} a lpdc:ConceptDisplayConfiguration .
                    ${sparqlEscapeUri(conceptDisplayConfiguration.id)} mu:uuid ${sparqlEscapeString(conceptDisplayConfiguration.uuid)} .
                    ${sparqlEscapeUri(conceptDisplayConfiguration.id)} lpdc:conceptIsNew ${this.sparqlEscapeTypedBool(conceptDisplayConfiguration.conceptIsNew)} .
                    ${sparqlEscapeUri(conceptDisplayConfiguration.id)} lpdc:conceptInstantiated ${this.sparqlEscapeTypedBool(conceptDisplayConfiguration.conceptIsInstantiated)} .
                    ${sparqlEscapeUri(conceptDisplayConfiguration.id)} dct:relation ${sparqlEscapeUri(conceptDisplayConfiguration.bestuurseenheidId)} . 
                }
            }
        `;
    await this.querying.insert(query);
  }

  private sparqlEscapeTypedBool(value: boolean) {
    return value
      ? '"true"^^<http://mu.semte.ch/vocabularies/typed-literals/boolean>'
      : '"false"^^<http://mu.semte.ch/vocabularies/typed-literals/boolean>';
  }
}
