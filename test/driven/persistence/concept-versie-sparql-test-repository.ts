import {ConceptVersieSparqlRepository} from "../../../src/driven/persistence/concept-versie-sparql-repository";
import {PREFIX} from "../../../config";
import {sparqlEscapeUri} from "../../../mu-helper";
import {ConceptVersie} from "../../../src/core/domain/concept-versie";

export class ConceptVersieSparqlTestRepository extends ConceptVersieSparqlRepository {

    constructor(endpoint?: string) {
        super(endpoint);
    }

    async save(conceptVersie: ConceptVersie): Promise<void> {
        //TODO LPDC-916: extract graphs into a javascript object (like PREFIX.)-> so to have them on one place ...
        const query = `
            ${PREFIX.lpdcExt}
            INSERT DATA { 
                GRAPH <http://mu.semte.ch/graphs/lpdc/ldes-data> {
                    ${sparqlEscapeUri(conceptVersie.id)} a lpdcExt:ConceptualPublicService.
                }
            }
        `;
        await this.update(query);
    }


}