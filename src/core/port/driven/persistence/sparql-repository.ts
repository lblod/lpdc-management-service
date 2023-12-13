import {updateSudo, querySudo} from '@lblod/mu-auth-sudo';

export class SparqlRepository {
    private endpoint: string;


    constructor(endpoint: string = "http://database:8890/sparql") {
        this.endpoint = endpoint;
    }

    async update(query: string): Promise<void> {
        await updateSudo(query, {}, {sparqlEndpoint: this.endpoint});
    }

    async query(query: string): Promise<unknown | undefined> {
        const result = await querySudo(query, {}, {sparqlEndpoint: this.endpoint});
        return result?.results?.bindings[0];
    }

    async queryList(query: string): Promise<unknown[]> {
        return querySudo(query, {}, {sparqlEndpoint: this.endpoint})?.results?.bindings || [];
    }
}