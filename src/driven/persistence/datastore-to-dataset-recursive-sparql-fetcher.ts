//TODO LPDC-916: put into some generic directory

import {Iri} from "../../core/domain/shared/iri";
import {sparqlEscapeUri} from "../../../mu-helper";
import {SparqlQuerying} from "./sparql-querying";
import {Literal, literal, namedNode, NamedNode, quad} from "rdflib";
import {Quad} from "rdflib/lib/tf-types";

export class DatastoreToDatasetRecursiveSparqlFetcher {

    private readonly querying: SparqlQuerying;

    constructor(endpoint) {
        this.querying = new SparqlQuerying(endpoint);
    }

    async fetch(graph: Iri, from: Iri): Promise<Quad[]> {
        const query =
            ` SELECT ?s ?p ?o
              WHERE { 
                    GRAPH ${sparqlEscapeUri(graph)} {
                        VALUES(?s) {
                            (${sparqlEscapeUri(from)})
                        } 
                        ?s ?p ?o
                    }
              }`;

        console.log(query);

        const result = await this.querying.list(query);
        const quads = [];
        result.map(r => {
            const s = this.asNamedNode(r['s']);
            const p = this.asNamedNode(r['p']);
            const o = this.asNamedNodeOrLiteral(r['o']);
            const g = namedNode(graph);
            quads.push(quad(s, p, o, g));
        });

        return quads;
    }

    private asNamedNodeOrLiteral(term: any): NamedNode | Literal {
        if (term.type === 'uri') {
            return this.asNamedNode(term);
        }
        if (term.type === 'literal') {
            return this.asLiteral(term);
        }
        throw new Error(`Could not parse ${term} as Named Node Or Literal`);
    }

    private asLiteral(term: any): Literal {
        if (term.type !== 'literal') {
            throw new Error(`Expecting an literal for ${term.value}`);
        }
        return literal(term.value);
    }

    private asNamedNode(term: any): NamedNode {
        if (term.type !== 'uri') {
            throw new Error(`Expecting an IRI for ${term.value}`);
        }

        return namedNode(term.value);
    }

}
