import {SparqlRepository} from "./sparql-repository";
import {PREFIX} from "../../../config";
import {sparqlEscapeUri} from "../../../mu-helper";
import {ConceptVersieRepository} from "../../core/port/driven/persistence/concept-versie-repository";
import {ConceptVersie} from "../../core/domain/concept-versie";
import {TaalString} from "../../core/domain/taal-string";

export class ConceptVersieSparqlRepository extends SparqlRepository implements ConceptVersieRepository {

    async findById(id: string): Promise<ConceptVersie> {
        const query = `
            ${PREFIX.lpdcExt}
            ${PREFIX.dct}
            SELECT ?id ?titleEn ?titleNl ?titleNlFormal ?titleNlInformal ?titleNlGeneratedFormal ?titleNlGeneratedInformal WHERE {
                GRAPH <http://mu.semte.ch/graphs/lpdc/ldes-data> {
                    VALUES ?id {
                        ${sparqlEscapeUri(id)}
                    }
                    ?id a lpdcExt:ConceptualPublicService .
                    OPTIONAL {
                        ?id dct:title ?titleEn .
                        FILTER(lang(?titleEn) = "en")
                    }
                    OPTIONAL {
                        ?id dct:title ?titleNl .
                        FILTER(lang(?titleNl) = "nl")
                    }
                    OPTIONAL {
                        ?id dct:title ?titleNlFormal .
                        FILTER(lang(?titleNlFormal) = "nl-be-x-formal")
                    }
                    OPTIONAL {
                        ?id dct:title ?titleNlInformal .
                        FILTER(lang(?titleNlInformal) = "nl-be-x-informal")
                    }
                    OPTIONAL {
                        ?id dct:title ?titleNlGeneratedFormal .
                        FILTER(lang(?titleNlGeneratedFormal) = "nl-be-x-generated-formal")
                    }
                    OPTIONAL {
                        ?id dct:title ?titleNlGeneratedInformal .
                        FILTER(lang(?titleNlGeneratedInformal) = "nl-be-x-generated-informal")
                    }
                }
            }
        `;

        //TODO LPDC-916: remove console.log
        console.log(query);

        const result = await this.querySingleRow(query);

        if (!result) {
            throw new Error(`no concept versie found for iri: ${id}`);
        }

        return new ConceptVersie(
            result['id'].value,
            TaalString.of(
                result['titleEn']?.value,
                result['titleNl']?.value,
                result['titleNlFormal']?.value,
                result['titleNlInformal']?.value,
                result['titleNlGeneratedFormal']?.value,
                result['titleNlGeneratedInformal']?.value)
        );
    }

}
