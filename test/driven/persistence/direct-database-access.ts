import {SparqlQuerying} from "../../../src/driven/persistence/sparql-querying";
import {sparqlEscapeUri} from "mu";

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
                ${triples.map(str => str.endsWith('.') ? str.slice(0, -1) : str).join(".\n")}
            }                     
        }
        `;

        await this.querying.insert(query);
    }

    public async list(query: string): Promise<unknown[]> {
        return this.querying.list(query);
    }

    public async clearGraph(graph: string): Promise<void> {
        const query = `
        DELETE WHERE { 
            GRAPH ${sparqlEscapeUri(graph)} {
                ?s ?p ?o .
            }                     
        }`;

        await this.querying.delete(query);
    }


}
