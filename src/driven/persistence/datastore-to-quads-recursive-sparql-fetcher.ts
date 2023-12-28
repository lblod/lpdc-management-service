//TODO LPDC-916: put into some generic directory

import {Iri} from "../../core/domain/shared/iri";
import {sparqlEscapeUri} from "../../../mu-helper";
import {SparqlQuerying} from "./sparql-querying";
import {isNamedNode} from "rdflib";
import {Quad} from "rdflib/lib/tf-types";
import {NS} from "./namespaces";

export class DatastoreToQuadsRecursiveSparqlFetcher {

    private readonly querying: SparqlQuerying;

    constructor(endpoint?: string) {
        this.querying = new SparqlQuerying(endpoint);
    }

    //TODO LPDC-916: also add predicatesToNotQuery (and exclude them in a filter (https://productencatalogus.data.vlaanderen.be/ns/ipdc-lpdc#hasConceptDisplayConfiguration comes to mind when querying concepts));
    async fetch(graph: Iri, from: Iri, predicatesToStopRecursion: Iri[], illegalTypesToRecurseInto: Iri[]): Promise<Quad[]> {
        return await this.doFetch(graph, [from], [], predicatesToStopRecursion, illegalTypesToRecurseInto);
    }

    private async doFetch(graph: Iri, subjectIds: Iri[], previouslyQueriedIds: Iri[], predicatesToStopRecursion: Iri[], illegalTypesToRecurseInto: Iri[]): Promise<Quad[]> {
        if (subjectIds.length === 0) {
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

        quads
            .filter(q => q.predicate.value === NS.rdf('type').value)
            .forEach(q => {
                if(illegalTypesToRecurseInto.includes(q.object.value)) {
                    throw Error(`Recursing into <${q.object.value}> from <${q.subject.value}> is not allowed.`);
                }
            });

        const referencedIds =
            quads
                .filter(q => {
                    return isNamedNode(q.object)
                        && q.predicate.value !== NS.rdf('type').value
                        && !previouslyQueriedIds.some(id => id === q.object.value)
                        && !predicatesToStopRecursion.some(id => id === q.predicate.value);
                })
                .map(q => q.object.value);

        const otherIdsToQuery = new Set(referencedIds);

        subjectIds.forEach(subjectId => otherIdsToQuery.delete(subjectId));
        previouslyQueriedIds.forEach(previouslyQueriedId => otherIdsToQuery.delete(previouslyQueriedId));

        return [...quads, ...await this.doFetch(graph, [...otherIdsToQuery], [...subjectIds, ...previouslyQueriedIds], predicatesToStopRecursion, illegalTypesToRecurseInto)];
    }

}
