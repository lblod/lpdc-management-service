import {Iri} from "../../core/domain/shared/iri";
import {SessieRepository} from "../../core/port/driven/persistence/sessie-repository";
import {Sessie} from "../../core/domain/sessie";
import {SparqlRepository} from "./sparql-repository";
import {sparqlEscapeUri} from "../../../mu-helper";
import {PREFIX} from "../../../config";

export class SessieSparqlRepository extends SparqlRepository implements SessieRepository {

    constructor(endpoint?: string) {
        super(endpoint);
    }

    async findById(id: Iri): Promise<Sessie> {
        const query = `
            ${PREFIX.ext}
            SELECT ?id ?bestuurseenheid ?sessieRol WHERE {
                GRAPH <http://mu.semte.ch/graphs/sessions> {
                    VALUES ?id {
                        ${sparqlEscapeUri(id)}
                    }
                     ?id ext:sessionGroup  ?bestuurseenheid .
                     ?id ext:sessionRole ?sessieRol .
                }
            }
        `;
        const result = await this.query(query);

        if (!result) {
            throw new Error(`No session found for iri: ${id}`);
        }

        return new Sessie(
            result['id'].value,
            result['bestuurseenheid'].value,
            result['sessieRol'].value
        );
    }
}