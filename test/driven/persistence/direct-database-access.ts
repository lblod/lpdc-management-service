import {SparqlQuerying} from "../../../src/driven/persistence/sparql-querying";
import {sparqlEscapeUri} from "../../../mu-helper";

export class DirectDatabaseAccess {

    private readonly querying: SparqlQuerying;

    constructor(endpoint?: string) {
        this.querying = new SparqlQuerying(endpoint);
    }

    public async insertData(graph: string, triples: string[], prefixes?: string[]): Promise<void> {

        const query = `
        ${(prefixes ?? []).join("\n")} 
            
        INSERT DATA { 
            GRAPH ${sparqlEscapeUri(graph)} {
                ${triples.join(".\n")}
            }                     
        }
        `;

        //TODO LPDC-916: remove console.log
        //console.log(query);

        await this.querying.update(query);
    }

    public async list(query: string): Promise<unknown[]> {
        return this.querying.list(query);
    }


}