import {Iri} from "../../core/domain/shared/iri";
import {SessieRepository} from "../../core/port/driven/persistence/sessie-repository";
import {Sessie, SessieRol} from "../../core/domain/sessie";
import {SparqlQuerying} from "./sparql-querying";
import {sparqlEscapeUri} from "../../../mu-helper";
import {PREFIX} from "../../../config";

export class SessieSparqlRepository implements SessieRepository {

    protected readonly querying: SparqlQuerying;
    constructor(endpoint?: string) {
        this.querying = new SparqlQuerying(endpoint);
    }

    async findById(id: Iri): Promise<Sessie> {
        const query = `
            ${PREFIX.ext}
            SELECT ?id ?bestuurseenheid ?sessieRol WHERE {
                GRAPH <http://mu.semte.ch/graphs/sessions> {
                    VALUES (?id ?sessieRol) {
                        (${sparqlEscapeUri(id)} """${SessieRol.LOKETLB_LPDCGEBRUIKER}""")
                    }
                    ?id ext:sessionGroup ?bestuurseenheid .
                    ?id ext:sessionRole ?sessieRol .
                }
            }
        `;
        const result = await this.querying.singleRow(query);

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