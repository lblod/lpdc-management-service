import {ConceptDisplayConfiguration} from "../../core/domain/concept-display-configuration";
import {
    ConceptDisplayConfigurationRepository
} from "../../core/port/driven/persistence/concept-display-configuration-repository";
import {Iri} from "../../core/domain/shared/iri";
import {SparqlQuerying} from "./sparql-querying";
import {Bestuurseenheid} from "../../core/domain/bestuurseenheid";
import {PREFIX} from "../../../config";
import {sparqlEscapeUri} from "../../../mu-helper";
import {NotFoundError, SystemError} from "../../core/domain/shared/lpdc-error";

export class ConceptDisplayConfigurationSparqlRepository implements ConceptDisplayConfigurationRepository {

    protected readonly querying: SparqlQuerying;

    constructor(endpoint?: string) {
        this.querying = new SparqlQuerying(endpoint);
    }

    async findById(bestuurseenheid: Bestuurseenheid, conceptDisplayConfigurationId: Iri): Promise<ConceptDisplayConfiguration> {
        const query = `
            ${PREFIX.lpdc}
            ${PREFIX.mu}
            ${PREFIX.dct}
            
            SELECT ?conceptDisplayConfigurationId ?uuid ?conceptIsNew ?conceptInstantiated ?bestuurseenheidId ?conceptId WHERE {
                GRAPH ${sparqlEscapeUri(bestuurseenheid.userGraph())} {
                    VALUES ?conceptDisplayConfigurationId {
                        ${sparqlEscapeUri(conceptDisplayConfigurationId)}
                    }
                    ?conceptId lpdc:hasConceptDisplayConfiguration ?conceptDisplayConfigurationId .
                    ?conceptDisplayConfigurationId a lpdc:ConceptDisplayConfiguration ;
                        mu:uuid ?uuid ;
                        lpdc:conceptIsNew ?conceptIsNew ;
                        lpdc:conceptInstantiated ?conceptInstantiated ;
                        dct:relation ?bestuurseenheidId .
                    
                }
            }
        `;
        const result = await this.querying.singleRow(query);

        if (!result) {
            throw new NotFoundError(`Geen conceptDisplayConfiguratie gevonden voor id: ${conceptDisplayConfigurationId}`);
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
            throw new SystemError(`Concept display configuration ${conceptDisplayConfigurationId} gevonden in de foute gebruikers graph`);
        }

        return conceptDisplayConfiguration;
    }

    async findByConceptId(bestuurseenheid: Bestuurseenheid, conceptId: Iri): Promise<ConceptDisplayConfiguration> {
        const query = `
            ${PREFIX.lpdc}
            ${PREFIX.mu}
            ${PREFIX.dct}
            
            SELECT ?conceptDisplayConfigurationId ?uuid ?conceptIsNew ?conceptInstantiated ?bestuurseenheidId ?conceptId WHERE {
                GRAPH ${sparqlEscapeUri(bestuurseenheid.userGraph())} {
                    VALUES ?conceptId {
                        ${sparqlEscapeUri(conceptId)}
                    }
                    ?conceptId lpdc:hasConceptDisplayConfiguration ?conceptDisplayConfigurationId .
                    ?conceptDisplayConfigurationId a lpdc:ConceptDisplayConfiguration ;
                        mu:uuid ?uuid ;
                        lpdc:conceptIsNew ?conceptIsNew ;
                        lpdc:conceptInstantiated ?conceptInstantiated ;
                        dct:relation ?bestuurseenheidId .
                    
                }
            }
        `;
        const result = await this.querying.singleRow(query);

        if (!result) {
            throw new NotFoundError(`Geen conceptDisplayConfiguration gevonden voor bestuurseenheid: ${bestuurseenheid.id} en concept ${conceptId}`);
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
            throw new SystemError(`Concept display configuration gevonden voor concept met id ${conceptId} in de foute gebruikers graph`);
        }

        return conceptDisplayConfiguration;
    }

    async syncInstantiatedFlag(bestuurseenheid: Bestuurseenheid, conceptId: Iri): Promise<void> {
        const query = `
        ${PREFIX.lpdcExt}
        ${PREFIX.dct}
        ASK WHERE {
            GRAPH ${sparqlEscapeUri(bestuurseenheid.userGraph())} {
               ?instance a lpdcExt:InstancePublicService ;
                    dct:source ${sparqlEscapeUri(conceptId)} .
          }
        }
      `;
        const hasInstanceForConceptId = await this.querying.ask(query);

        if (hasInstanceForConceptId) {
            await this.removeConceptIsNewFlagAndSetInstantiatedFlag(bestuurseenheid, conceptId);
        } else {
            await this.removeInstantiatedFlag(bestuurseenheid, conceptId);
        }
    }

    async ensureConceptDisplayConfigurationsForAllBestuurseenheden(conceptId: Iri): Promise<void> {
        const query = `
        ${PREFIX.lpdc}
        ${PREFIX.mu}
        ${PREFIX.dct}
        ${PREFIX.besluit}
        
        INSERT {
          GRAPH ?bestuurseenheidGraph {
            ?conceptId lpdc:hasConceptDisplayConfiguration ?conceptDisplayConfigurationId .
            ?conceptDisplayConfigurationId a lpdc:ConceptDisplayConfiguration ;
              mu:uuid ?conceptDisplayConfigurationUuid ;
              lpdc:conceptIsNew "true"^^<http://mu.semte.ch/vocabularies/typed-literals/boolean> ;
              lpdc:conceptInstantiated "false"^^<http://mu.semte.ch/vocabularies/typed-literals/boolean> ;
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
              ?conceptId lpdc:hasConceptDisplayConfiguration ?conceptDisplayConfigurationId .
              ?conceptDisplayConfigurationId dct:relation ?bestuurseenheidId .
            }
          }
        
          ${/*this is a bit of trickery to generate UUID and URI's since STRUUID doesn't work properly in Virtuoso: https://github.com/openlink/virtuoso-opensource/issues/515#issuecomment-456848368 */''}
          BIND(SHA512(CONCAT(STR(?conceptId), STR(?bestuurseenheidUuid))) as ?conceptDisplayConfigurationUuid) ${/* conceptId + bestuurseenheidId should be unique per config object */''}
          BIND(IRI(CONCAT('http://data.lblod.info/id/conceptual-display-configuration/', STR(?conceptDisplayConfigurationUuid))) as ?conceptDisplayConfigurationId)
        }
      `;

        await this.querying.insert(query);
    }

    async removeConceptIsNewFlag(bestuurseenheid: Bestuurseenheid, conceptDisplayConfigurationId: Iri): Promise<void> {
        const conceptDisplayConfiguration = await this.findById(bestuurseenheid, conceptDisplayConfigurationId);

        const query = `
        ${PREFIX.lpdc}
        DELETE {
            GRAPH <${bestuurseenheid.userGraph()}> {
                ${sparqlEscapeUri(conceptDisplayConfiguration.id)} lpdc:conceptIsNew ?oldIsNew .
            }
        }
        INSERT {
            GRAPH <${bestuurseenheid.userGraph()}> {
                ${sparqlEscapeUri(conceptDisplayConfiguration.id)} lpdc:conceptIsNew "false"^^<http://mu.semte.ch/vocabularies/typed-literals/boolean> .
            }
        } 
        WHERE {
            GRAPH <${bestuurseenheid.userGraph()}> {
                ${sparqlEscapeUri(conceptDisplayConfiguration.id)} lpdc:conceptIsNew ?oldIsNew .
            }
        }`;

        await this.querying.deleteInsert(query);
    }

    private async removeInstantiatedFlag(bestuurseenheid: Bestuurseenheid, conceptId:Iri): Promise<void> {
        const conceptDisplayConfiguration = await this.findByConceptId(bestuurseenheid,conceptId);

        const query = `
        ${PREFIX.lpdc}
    
        DELETE {
          GRAPH ${sparqlEscapeUri(bestuurseenheid.userGraph())} {
            ${sparqlEscapeUri(conceptDisplayConfiguration.id)} lpdc:conceptInstantiated ?oldIsInstantiated .
          }
        }
        INSERT {
          GRAPH ${sparqlEscapeUri(bestuurseenheid.userGraph())} {
           ${sparqlEscapeUri(conceptDisplayConfiguration.id)} lpdc:conceptInstantiated "false"^^<http://mu.semte.ch/vocabularies/typed-literals/boolean> .
          }
        }
        WHERE {
          GRAPH ${sparqlEscapeUri(bestuurseenheid.userGraph())} {
            ${sparqlEscapeUri(conceptDisplayConfiguration.id)} lpdc:conceptInstantiated ?oldIsInstantiated .
          }
        }
      `;

        await this.querying.deleteInsert(query);
    }

    private async removeConceptIsNewFlagAndSetInstantiatedFlag(bestuurseenheid: Bestuurseenheid, conceptId: Iri): Promise<void> {
        const conceptDisplayConfiguration = await this.findByConceptId(bestuurseenheid, conceptId);

        const query = `
        ${PREFIX.lpdc}
        DELETE {
            GRAPH <${bestuurseenheid.userGraph()}> {
                ${sparqlEscapeUri(conceptDisplayConfiguration.id)} lpdc:conceptIsNew ?oldIsNew .
                ${sparqlEscapeUri(conceptDisplayConfiguration.id)} lpdc:conceptInstantiated ?oldIsInstantiated .
            }
        }
        INSERT {
            GRAPH <${bestuurseenheid.userGraph()}> {
                ${sparqlEscapeUri(conceptDisplayConfiguration.id)} lpdc:conceptIsNew "false"^^<http://mu.semte.ch/vocabularies/typed-literals/boolean> .
                ${sparqlEscapeUri(conceptDisplayConfiguration.id)} lpdc:conceptInstantiated "true"^^<http://mu.semte.ch/vocabularies/typed-literals/boolean> .
            }
        } 
        WHERE {
            GRAPH <${bestuurseenheid.userGraph()}> {
                ${sparqlEscapeUri(conceptDisplayConfiguration.id)} lpdc:conceptIsNew ?oldIsNew .
                ${sparqlEscapeUri(conceptDisplayConfiguration.id)} lpdc:conceptInstantiated ?oldIsInstantiated .
            }
        }`;

        await this.querying.deleteInsert(query);
    }
}