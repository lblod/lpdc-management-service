import {Iri} from "../../../domain/shared/iri";
import {SessieRepository} from "../../../domain/sessie-repository";
import {Sessie} from "../../../domain/sessie";
import {SparqlRepository} from "./sparql-repository";
import {sparqlEscapeUri} from "../../../../../mu-helper";

export class SessieSparqlRepository extends SparqlRepository implements SessieRepository {

    constructor(endpoint?: string) {
        super(endpoint);
    }

    async findById(id: Iri): Promise<Sessie> {
        const query = `
            SELECT ?id ?bestuurseenheid WHERE {
                GRAPH <http://mu.semte.ch/graphs/sessions> {
                    VALUES ?id {
                        ${sparqlEscapeUri(id)}
                    }
                     ?id <http://mu.semte.ch/vocabularies/ext/sessionGroup>  ?bestuurseenheid 
                }
            }
        `;
        const result = await this.query(query);

        if (!result) {
            throw new Error(`No session found for iri: ${id}`);
        }

        return new Sessie(
            result['id'].value,
            result['bestuurseenheid'].value
        );
    }

    async save(sessie: Sessie): Promise<void> {
        const query = `
            INSERT DATA { 
                GRAPH <http://mu.semte.ch/graphs/sessions> {
                    ${sparqlEscapeUri(sessie.getId())} <http://mu.semte.ch/vocabularies/ext/sessionGroup>  ${sparqlEscapeUri(sessie.getBestuurseenheidId())} 
                }
            }
        `;
        await this.update(query);
    }


}