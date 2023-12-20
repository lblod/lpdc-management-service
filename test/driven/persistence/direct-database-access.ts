import {SparqlRepository} from "../../../src/driven/persistence/sparql-repository";
import {sparqlEscapeUri} from "../../../mu-helper";

export class DirectDatabaseAccess extends SparqlRepository {

    constructor(endpoint?: string) {
        super(endpoint);
    }

    async insertData(graph: string, triples: string[]): Promise<void> {
        const query = `           
            INSERT DATA { 
                GRAPH ${sparqlEscapeUri(graph)} {
                     ${triples.join(".\n")}
                }                     
            }
        `;
        await this.update(query);
    }

}