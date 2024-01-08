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
            result['conceptDisplayConfigurationId'].value,
            result['uuid'].value,
            result['conceptIsNew'].value === 'true',
            result['conceptInstantiated'].value === 'true',
            result['bestuurseenheidId'].value,
            result['conceptId'].value,
        );

        if(conceptDisplayConfiguration.bestuurseenheidId !== bestuurseenheid.id) {
            throw Error(`concept display configuration found for concept id ${conceptId} in incorrect user graph`);
        }

        return conceptDisplayConfiguration;
    }

}