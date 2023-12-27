//TODO LPDC-916: put into some generic directory

import {Iri} from "../../core/domain/shared/iri";
import {sparqlEscapeUri} from "../../../mu-helper";
import {SparqlQuerying} from "./sparql-querying";
import {isNamedNode, Literal, literal, namedNode, NamedNode, quad} from "rdflib";
import {Quad} from "rdflib/lib/tf-types";

export class DatastoreToDatasetRecursiveSparqlFetcher {

    private readonly querying: SparqlQuerying;

    constructor(endpoint) {
        this.querying = new SparqlQuerying(endpoint);
    }

    async fetch(graph: Iri, from: Iri): Promise<Quad[]> {
        return await this.doFetch(graph, [from], []);
    }

    private async doFetch(graph: Iri, subjectIds: Iri[], previouslyQueriedIds: Iri[]): Promise<Quad[]> {
        if(subjectIds.length === 0) {
            return [];
        }
        const query =
            ` SELECT ?s ?p ?o
              WHERE { 
                    GRAPH ${sparqlEscapeUri(graph)} {
                        VALUES(?s) {
                            ${subjectIds.map(subjectId => `(${sparqlEscapeUri(subjectId)}) `).join(' ')}
                        } 
                        ?s ?p ?o
                    }
              }`;

        const result = await this.querying.list(query);
        const quads = this.asQuads(result, graph);

        const referencedIds =
            quads
                .filter(q => isNamedNode(q.object)
                    && q.predicate.value !== `http://www.w3.org/1999/02/22-rdf-syntax-ns#type`
                    && !previouslyQueriedIds.some(id => id === q.object.value))
                .map(q => q.object.value);

        const otherIdsToQuery = new Set(referencedIds);
        subjectIds.forEach(subjectId => otherIdsToQuery.delete(subjectId));
        previouslyQueriedIds.forEach(previouslyQueriedId => otherIdsToQuery.delete(previouslyQueriedId));

        return [...quads, ...await this.doFetch(graph, [...otherIdsToQuery], [...subjectIds, ...previouslyQueriedIds])];
    }

    private asQuads(queryResults: unknown[], graph: string) {
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

}
