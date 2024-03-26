import {querySudo, updateSudo} from '@lblod/mu-auth-sudo';
import {retry} from 'ts-retry-promise';
import {literal, Literal, NamedNode, namedNode, quad} from "rdflib";
import {SystemError} from "../../core/domain/shared/lpdc-error";

export class SparqlQuerying {
    private readonly endpoint: string;

    constructor(endpoint: string = "http://virtuoso:8890/sparql") {
        this.endpoint = endpoint;
    }

    public async insert(query: string): Promise<void> {
        const result = await updateSudo(query, {}, {sparqlEndpoint: this.endpoint});
        this.verifyResultToMatch(query, result, /(Insert into <.*>, \d+ \(or less\) (triples|quads) -- done)|(Insert into <.*>, 0 quads -- nothing to do)|(Insert into \d+ \(or more\) graphs, total \d+ \(or less\) quads -- done)/);
    }

    public async delete(query: string): Promise<void> {
        const result = await updateSudo(query, {}, {sparqlEndpoint: this.endpoint});
        this.verifyResultToMatch(query, result, /Delete from <.*>, \d+ \(or less\) (triples|quads) -- done/);
    }

    public async deleteInsert(query: string, resultVerification?: (deleteInsertResults: string[]) => void): Promise<void> {
        const result = await updateSudo(query, {}, {sparqlEndpoint: this.endpoint});
        this.verifyResultToMatch(query, result, /(Modify <.*>, delete \d+ \(or less\) and insert \d+ \(or less\) triples -- done|(Delete \d+ \(or less\) quads -- done)|(Delete from <.*>, 0 quads -- nothing to do)\n(Insert into <.*>, \d+ \(or less\) quads -- done)|(Insert into <.*>, 0 quads -- nothing to do))/);
        if(resultVerification) {
            const results = result.results.bindings.map(b => b['callret-0'].value);
            resultVerification(results);
        }
    }

    public async singleRow(query: string): Promise<unknown | undefined> {
        return retry(async () => {
            const result = await querySudo(query, {}, {sparqlEndpoint: this.endpoint});
            const bindings = result?.results?.bindings;
            if (bindings) {
                if (bindings.length > 1) {
                    throw new SystemError(`Expecting a single row from query (${query}), got ${bindings.length} results.`);
                }
            }
            return bindings[0];
        }, {
            retries: 10,
            delay: 200,
            backoff: "FIXED",
            logger: (msg: string) => console.log(`Failed, but retrying [${msg}]`),
            retryIf: (error: any) => {
                return !(error instanceof Error);
            },
        });
    }

    public async list(query: string): Promise<unknown[]> {
        return retry(async () => {
            const result = await querySudo(query, {}, {sparqlEndpoint: this.endpoint});
            return result?.results?.bindings || [];
        }, {
            retries: 10,
            delay: 200,
            backoff: "FIXED",
            logger: (msg: string) => console.log(`Failed, but retrying [${msg}]`),
        });
    }

    public async ask(query: string): Promise<boolean> {
        return retry(async () => {
            const result = await querySudo(query, {}, {sparqlEndpoint: this.endpoint});
            return result?.boolean;
        }, {
            retries: 10,
            delay: 200,
            backoff: "FIXED",
            logger: (msg: string) => console.log(`Failed, but retrying [${msg}]`),
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
        throw new SystemError(`Could not parse ${JSON.stringify(term)} as Named Node Or Literal`);
    }

    private asLiteral(term: any): Literal {
        if (term.type !== 'literal'
            && term.type !== 'typed-literal') {
            throw new SystemError(`Expecting a literal for ${term.value}`);
        }

        const lang: string | undefined = term['xml:lang'];
        const datatype: string | undefined = term['datatype'];
        return literal(term.value, lang || datatype);
    }

    private asNamedNode(term: any): NamedNode {
        if (term.type !== 'uri') {
            throw new SystemError(`Expecting an IRI for ${term.value}`);
        }

        return namedNode(term.value);
    }

    private verifyResultToMatch(query: string, result: any, expectedPattern: RegExp) {
        const results = result.results.bindings.map(b => b['callret-0'].value);
        if (!results
            .every(ir => expectedPattern.test(ir))) {
            const msg = `[${query}] gave incorrect result [${results.join(';')}]`;
            console.log(msg);
            throw new SystemError(msg);
        }
    }
}

