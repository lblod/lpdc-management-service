import {SparqlRepository} from "./sparql-repository";
import {PREFIX} from "../../../config";
import {sparqlEscapeUri} from "../../../mu-helper";
import {ConceptVersieRepository} from "../../core/port/driven/persistence/concept-versie-repository";
import {ConceptVersie} from "../../core/domain/concept-versie";

export class ConceptVersieSparqlRepository extends SparqlRepository implements ConceptVersieRepository {

    async findById(id: string): Promise<ConceptVersie> {
        const query = `
            ${PREFIX.lpdcExt}
            SELECT ?id WHERE {
                GRAPH <http://mu.semte.ch/graphs/lpdc/ldes-data> {
                    VALUES ?id {
                        ${sparqlEscapeUri(id)}
                    }
                    ?id a lpdcExt:ConceptualPublicService.
                }
            }
        `;

        const result = await this.querySingleRow(query);

        if (!result) {
            throw new Error(`no concept versie found for iri: ${id}`);
        }

        return new ConceptVersie(
            result['id'].value
        );
    }

}
