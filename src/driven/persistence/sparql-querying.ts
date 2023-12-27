import {querySudo, updateSudo} from '@lblod/mu-auth-sudo';
import {retry} from 'ts-retry-promise';
import {literal, Literal, NamedNode, namedNode, quad} from "rdflib";

export class SparqlQuerying {
    private readonly endpoint: string;

    constructor(endpoint: string = "http://virtuoso:8890/sparql") {
        this.endpoint = endpoint;
    }

    public async update(query: string): Promise<void> {
        //TODO LPDC-916: error handling: we should ensure that we have verified that we did not get any error ...
        await updateSudo(query, {}, {sparqlEndpoint: this.endpoint});
    }

    public async singleRow(query: string): Promise<unknown | undefined> {
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
            logger: (msg: string) => console.log(`Failed, but retrying [${msg}]`)
        });
    }

    public async list(query: string): Promise<unknown[]> {
        return retry(async () => {
            //TODO LPDC-916:remove console.log
            //console.log(query);
            const result = await querySudo(query, {}, {sparqlEndpoint: this.endpoint});
            return result?.results?.bindings || [];
        }, {
            retries: 10,
            delay: 200,
            backoff: "FIXED",
            logger: (msg: string) => console.log(`Failed, but retrying [${msg}]`)
        });
    }

    public asQuads(queryResults: unknown[], graph: string) {
        return queryResults.map(r => {
            const s = this.asNamedNode(r['s']);
            const p = this.asNamedNode(r['p']);
            const o = this.asNamedNodeOrLiteral(r['o']);
            const g = namedNode(graph);
            return quad(s, p, o, g);
        });
    }

    private asNamedNodeOrLiteral(term: any): NamedNode | Literal {
        if (term.type === 'uri') {
            return this.asNamedNode(term);
        }
        if (term.type === 'literal'
            || term.type === 'typed-literal') {
            return this.asLiteral(term);
        }
        throw new Error(`Could not parse ${JSON.stringify(term)} as Named Node Or Literal`);
    }

    private asLiteral(term: any): Literal {
        if (term.type !== 'literal'
            && term.type !== 'typed-literal') {
            throw new Error(`Expecting a literal for ${term.value}`);
        }

        const lang: string | undefined = term['xml:lang'];
        const datatype: string | undefined = term['datatype'];
        return literal(term.value, lang || datatype);
    }

    private asNamedNode(term: any): NamedNode {
        if (term.type !== 'uri') {
            throw new Error(`Expecting an IRI for ${term.value}`);
        }

        return namedNode(term.value);
    }

    //TODO LPDC-916: remove duplication for retry + options ...
}

