import {CodeRepository, CodeSchema} from "../../core/port/driven/persistence/code-repository";
import {SparqlQuerying} from "./sparql-querying";
import {PREFIX} from "../../../config";
import {sparqlEscapeString, sparqlEscapeUri, uuid} from "../../../mu-helper";
import {Iri} from "../../core/domain/shared/iri";
import {NS} from "./namespaces";

export class CodeSparqlRepository implements CodeRepository {

    protected readonly querying: SparqlQuerying;

    constructor(endpoint?: string) {
        this.querying = new SparqlQuerying(endpoint);
    }

    async exists(schema: CodeSchema, id: Iri): Promise<boolean> {
        const query = `
        ${PREFIX.skos}
        
        ASK {
            GRAPH ?g {
                ${sparqlEscapeUri(id)} a skos:Concept;
                    skos:inScheme ${sparqlEscapeUri(NS.dvcs(schema).value)}.
            }
        }`;
        return this.querying.ask(query);
    }

    async save(schema: CodeSchema, id: Iri, prefLabel: string, seeAlso: Iri): Promise<void> {
        const query = `
        ${PREFIX.skos}
        ${PREFIX.mu}
        ${PREFIX.rdfs}
        INSERT DATA {
          GRAPH <http://mu.semte.ch/graphs/public> {
            ${sparqlEscapeUri(id)} a skos:Concept.
            ${sparqlEscapeUri(id)} skos:inScheme ${sparqlEscapeUri(NS.dvcs(schema).value)}.
            ${sparqlEscapeUri(id)} skos:topConceptOf ${sparqlEscapeUri(NS.dvcs(schema).value)}.
            ${sparqlEscapeUri(id)} skos:prefLabel ${sparqlEscapeString(prefLabel)}.
            ${sparqlEscapeUri(id)} mu:uuid ${sparqlEscapeString(uuid())}.
            ${sparqlEscapeUri(id)} rdfs:seeAlso ${sparqlEscapeUri(seeAlso)}.
          }
        }
        `;

        await this.querying.update(query);
    }


}