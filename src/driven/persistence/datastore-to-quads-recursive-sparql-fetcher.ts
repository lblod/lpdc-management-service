//TODO LPDC-916: put into some generic directory

import {Iri} from "../../core/domain/shared/iri";
import {sparqlEscapeUri} from "../../../mu-helper";
import {SparqlQuerying} from "./sparql-querying";
import {isNamedNode} from "rdflib";
import {Quad} from "rdflib/lib/tf-types";

export class DatastoreToQuadsRecursiveSparqlFetcher {

    private readonly querying: SparqlQuerying;

    constructor(endpoint?: string) {
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
        const quads = this.querying.asQuads(result, graph);

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

}
