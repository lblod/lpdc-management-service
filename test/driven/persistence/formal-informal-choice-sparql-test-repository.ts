import {
    FormalInformalChoiceSparqlRepository
} from "../../../src/driven/persistence/formal-informal-choice-sparql-repository";
import {Bestuurseenheid} from "../../../src/core/domain/bestuurseenheid";
import {FormalInformalChoice} from "../../../src/core/domain/formal-informal-choice";
import {Iri} from "../../../src/core/domain/shared/iri";
import {PREFIX} from "../../../config";
import {sparqlEscapeDateTime, sparqlEscapeString, sparqlEscapeUri} from "../../../mu-helper";

export class FormalInformalChoiceSparqlTestRepository extends FormalInformalChoiceSparqlRepository {

    constructor(endpoint?: string) {
        super(endpoint);
    }

    async save(bestuurseenheid: Bestuurseenheid, formalInformalChoice: FormalInformalChoice): Promise<void> {
        const bestuurseenheidGraph: Iri = bestuurseenheid.userGraph();

        const query = `
            ${PREFIX.lpdc}
            ${PREFIX.mu}
            ${PREFIX.schema}
            ${PREFIX.dct}
            
            INSERT DATA { 
                GRAPH ${sparqlEscapeUri(bestuurseenheidGraph)} {
                    ${sparqlEscapeUri(formalInformalChoice.id)} a lpdc:FormalInformalChoice .
                    ${sparqlEscapeUri(formalInformalChoice.id)} mu:uuid ${sparqlEscapeString(formalInformalChoice.uuid)} .
                    ${sparqlEscapeUri(formalInformalChoice.id)} schema:dateCreated ${sparqlEscapeDateTime(formalInformalChoice.dateCreated.value)} .
                    ${sparqlEscapeUri(formalInformalChoice.id)} lpdc:chosenForm ${sparqlEscapeString(formalInformalChoice.chosenForm)} .
                    ${sparqlEscapeUri(formalInformalChoice.id)} dct:relation ${sparqlEscapeUri(bestuurseenheid.id)} .
                }
            }
        `;
        await this.querying.insert(query);
    }
}