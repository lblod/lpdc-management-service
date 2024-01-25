import {ConceptDisplayConfiguration} from "../../core/domain/concept-display-configuration";
import {
    ConceptDisplayConfigurationRepository
} from "../../core/port/driven/persistence/concept-display-configuration-repository";
import {Iri} from "../../core/domain/shared/iri";
import {SparqlQuerying} from "./sparql-querying";
import {Bestuurseenheid} from "../../core/domain/bestuurseenheid";
import {PREFIX} from "../../../config";
import {sparqlEscapeUri} from "../../../mu-helper";

export class ConceptDisplayConfigurationSparqlRepository implements ConceptDisplayConfigurationRepository {

    protected readonly querying: SparqlQuerying;

    constructor(endpoint?: string) {
        this.querying = new SparqlQuerying(endpoint);
    }

    // TODO LPDC-917: this function should throw error and make existsBy in test repository
    async findByConceptId(bestuurseenheid: Bestuurseenheid, conceptId: Iri): Promise<ConceptDisplayConfiguration | undefined> {
        const query = `
            ${PREFIX.lpdcExt}
            ${PREFIX.mu}
            ${PREFIX.dct}
            
            SELECT ?conceptDisplayConfigurationId ?uuid ?conceptIsNew ?conceptInstantiated ?bestuurseenheidId ?conceptId WHERE {
                GRAPH ${sparqlEscapeUri(bestuurseenheid.userGraph())} {
                    VALUES ?conceptId {
                        ${sparqlEscapeUri(conceptId)}
                    }
                    ?conceptId lpdcExt:hasConceptDisplayConfiguration ?conceptDisplayConfigurationId .
                    ?conceptDisplayConfigurationId a lpdcExt:ConceptDisplayConfiguration ;
                        mu:uuid ?uuid ;
                        lpdcExt:conceptIsNew ?conceptIsNew ;
                        lpdcExt:conceptInstantiated ?conceptInstantiated ;
                        dct:relation ?bestuurseenheidId .
                    
                }
            }
        `;
        const result = await this.querying.singleRow(query);

        if (!result) {
            return undefined;
        }

        const conceptDisplayConfiguration = new ConceptDisplayConfiguration(
            new Iri(result['conceptDisplayConfigurationId'].value),
            result['uuid'].value,
            result['conceptIsNew'].value === 'true',
            result['conceptInstantiated'].value === 'true',
            new Iri(result['bestuurseenheidId'].value),
            new Iri(result['conceptId'].value),
        );

        if(!conceptDisplayConfiguration.bestuurseenheidId.equals(bestuurseenheid.id)) {
            throw Error(`concept display configuration found for concept id ${conceptId} in incorrect user graph`);
        }

        return conceptDisplayConfiguration;
    }

    async removeInstantiatedFlag(bestuurseenheid: Bestuurseenheid, conceptId:Iri): Promise<void>{
      const conceptDisplayConfiguration = await this.findByConceptId(bestuurseenheid,conceptId);

        if (!conceptDisplayConfiguration) {
            throw new Error(`No conceptDisplayConfiguration exists for bestuurseenheid: ${bestuurseenheid.id} and concept ${conceptId}`);
        }

        const query = `
        ${PREFIX.lpdcExt}
    
        DELETE {
          GRAPH ${sparqlEscapeUri(bestuurseenheid.userGraph())} {
            ${sparqlEscapeUri(conceptDisplayConfiguration.id)} lpdcExt:conceptInstantiated ?oldIsInstantiated .
          }
        }
        INSERT {
          GRAPH ${sparqlEscapeUri(bestuurseenheid.userGraph())} {
           ${sparqlEscapeUri(conceptDisplayConfiguration.id)} lpdcExt:conceptInstantiated "false"^^<http://mu.semte.ch/vocabularies/typed-literals/boolean> .
          }
        }
        WHERE {
          GRAPH ${sparqlEscapeUri(bestuurseenheid.userGraph())} {
            ${sparqlEscapeUri(conceptDisplayConfiguration.id)} lpdcExt:conceptInstantiated ?oldIsInstantiated .
          }
        }
      `;

        await this.querying.update(query);
    }

    async removeConceptIsNewFlagAndSetInstantiatedFlag(bestuurseenheid: Bestuurseenheid, conceptId: Iri): Promise<void> {
        const conceptDisplayConfiguration = await this.findByConceptId(bestuurseenheid, conceptId);

        if (!conceptDisplayConfiguration) {
            throw new Error(`No conceptDisplayConfiguration exists for bestuurseenheid: ${bestuurseenheid.id} and concept ${conceptId}`);
        }

        const updateQuery = `
        ${PREFIX.lpdcExt}
        DELETE {
            GRAPH ?bestuurseenheidGraph {
                ${sparqlEscapeUri(conceptDisplayConfiguration.id)} lpdcExt:conceptIsNew ?oldIsNew .
                ${sparqlEscapeUri(conceptDisplayConfiguration.id)} lpdcExt:conceptInstantiated ?oldIsInstantiated .
            }
        }
        INSERT {
            GRAPH ?bestuurseenheidGraph {
                ${sparqlEscapeUri(conceptDisplayConfiguration.id)} lpdcExt:conceptIsNew "false"^^<http://mu.semte.ch/vocabularies/typed-literals/boolean> .
                ${sparqlEscapeUri(conceptDisplayConfiguration.id)} lpdcExt:conceptInstantiated "true"^^<http://mu.semte.ch/vocabularies/typed-literals/boolean> .
            }
        } 
        WHERE {
            GRAPH ?bestuurseenheidGraph {
                ${sparqlEscapeUri(conceptDisplayConfiguration.id)} lpdcExt:conceptIsNew ?oldIsNew .
                ${sparqlEscapeUri(conceptDisplayConfiguration.id)} lpdcExt:conceptInstantiated ?oldIsInstantiated .
            }
        }`;

        await this.querying.update(updateQuery);
    }

    // TODO LPDC-917: move to test repository
    async ensureConceptDisplayConfigurationsForAllBestuurseenheden(conceptId: Iri): Promise<void> {
        const insertQuery = `
        ${PREFIX.lpdcExt}
        ${PREFIX.mu}
        ${PREFIX.dct}
        ${PREFIX.besluit}
        
        INSERT {
          GRAPH ?bestuurseenheidGraph {
            ?conceptId lpdcExt:hasConceptDisplayConfiguration ?conceptDisplayConfigurationId .
            ?conceptDisplayConfigurationId a lpdcExt:ConceptDisplayConfiguration ;
              mu:uuid ?conceptDisplayConfigurationUuid ;
              lpdcExt:conceptIsNew "true"^^<http://mu.semte.ch/vocabularies/typed-literals/boolean> ;
              lpdcExt:conceptInstantiated "false"^^<http://mu.semte.ch/vocabularies/typed-literals/boolean> ;
              dct:relation ?bestuurseenheidId .
          }
        }
        WHERE {
          ?bestuurseenheidId a besluit:Bestuurseenheid ;
            mu:uuid ?bestuurseenheidUuid .
        
          BIND(IRI(CONCAT("http://mu.semte.ch/graphs/organizations/", STR(?bestuurseenheidUuid), "/LoketLB-LPDCGebruiker")) as ?bestuurseenheidGraph)
          BIND(${sparqlEscapeUri(conceptId)} as ?conceptId)
        
          GRAPH ?bestuurseenheidGraph {
            FILTER NOT EXISTS {
              ?conceptId lpdcExt:hasConceptDisplayConfiguration ?conceptDisplayConfigurationId .
              ?conceptDisplayConfigurationId dct:relation ?bestuurseenheidId .
            }
          }
        
          ${/*this is a bit of trickery to generate UUID and URI's since STRUUID doesn't work properly in Virtuoso: https://github.com/openlink/virtuoso-opensource/issues/515#issuecomment-456848368 */''}
          BIND(SHA512(CONCAT(STR(?conceptId), STR(?bestuurseenheidUuid))) as ?conceptDisplayConfigurationUuid) ${/* conceptId + bestuurseenheidId should be unique per config object */''}
          BIND(IRI(CONCAT('http://data.lblod.info/id/conceptual-display-configuration/', STR(?conceptDisplayConfigurationUuid))) as ?conceptDisplayConfigurationId)
        }
      `;

        await this.querying.update(insertQuery);
    }

}