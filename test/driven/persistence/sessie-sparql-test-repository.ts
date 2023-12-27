import {SessieSparqlRepository} from "../../../src/driven/persistence/sessie-sparql-repository";
import {Sessie} from "../../../src/core/domain/sessie";
import {PREFIX} from "../../../config";
import {sparqlEscapeString, sparqlEscapeUri} from "../../../mu-helper";

export class SessieSparqlTestRepository extends SessieSparqlRepository {

    constructor(endpoint?: string) {
        super(endpoint);
    }

    async save(sessie: Sessie): Promise<void> {
        const query = `
            ${PREFIX.ext}
            INSERT DATA { 
                GRAPH <http://mu.semte.ch/graphs/sessions> {
                    ${sparqlEscapeUri(sessie.id)} ext:sessionGroup ${sparqlEscapeUri(sessie.bestuurseenheidId)}.
                    ${sparqlEscapeUri(sessie.id)} ext:sessionRole ${sparqlEscapeString(sessie.sessieRol)}.
                }
            }
        `;
        await this.querying.update(query);
    }

}