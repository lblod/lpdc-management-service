import {querySudo, updateSudo} from '@lblod/mu-auth-sudo';
import {retry} from 'ts-retry-promise';

export class SparqlRepository {
    private readonly endpoint: string;

    constructor(endpoint: string = "http://virtuoso:8890/sparql") {
        this.endpoint = endpoint;
    }

    protected async update(query: string): Promise<void> {
        //TODO LPDC-916: error handling: we should ensure that we have verified that we did not get any error ...
        await updateSudo(query, {}, {sparqlEndpoint: this.endpoint});
    }

    protected async querySingleRow(query: string): Promise<unknown | undefined> {
        return retry(async () => {
            const result = await querySudo(query, {}, {sparqlEndpoint: this.endpoint});
            const bindings = result?.results?.bindings;
            if (bindings) {
                if (bindings.length > 1) {
                    throw new Error(`Expecting a single row from query (${query}), got ${bindings.length} results.`);
                }
            }
            return bindings[0];
        }, {
            retries: 10,
            delay: 200,
            backoff: "FIXED",
            logger: (msg: string) => console.log(`Failing, but retrying ${msg}`)
        });
    }

    protected async queryList(query: string): Promise<unknown[]> {
        return retry(async () => {
            //TODO LPDC-916:remove console.log
            //console.log(query);
            const result = await querySudo(query, {}, {sparqlEndpoint: this.endpoint});
            return result?.results?.bindings || [];
        }, {
            retries: 10,
            delay: 200,
            backoff: "FIXED",
            logger: (msg: string) => console.log(`Failing, but retrying ${msg}`)
        });
    }

    //TODO LPDC-916: remove duplication for retry + options ...
}