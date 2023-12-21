import {SparqlRepository} from "./sparql-repository";
import {PREFIX} from "../../../config";
import {sparqlEscapeUri} from "../../../mu-helper";
import {ConceptVersieRepository} from "../../core/port/driven/persistence/concept-versie-repository";
import {ConceptVersie} from "../../core/domain/concept-versie";
import {TaalString} from "../../core/domain/taal-string";

export class ConceptVersieSparqlRepository extends SparqlRepository implements ConceptVersieRepository {

    async findById(id: string): Promise<ConceptVersie> {

        const findEntityQuery = `
            ${PREFIX.lpdcExt}
            
            SELECT ?id
                WHERE { 
                    GRAPH <http://mu.semte.ch/graphs/lpdc/ldes-data> { 
                        ?id a lpdcExt:ConceptualPublicService . 
                        }
                    FILTER (?id = ${sparqlEscapeUri(id)}) 
                }            
        `;

        const result = await this.querySingleRow(findEntityQuery);

        if (!result) {
            throw new Error(`no concept versie found for iri: ${id}`);
        }

        const findTitlesQuery = `
            ${PREFIX.dct}
            
            SELECT ?title
                WHERE { 
                    GRAPH <http://mu.semte.ch/graphs/lpdc/ldes-data> { 
                        ${sparqlEscapeUri(id)} dct:title ?title. 
                    }
                }            
        `;
        const titles = await this.queryList(findTitlesQuery);

        const findDescriptionsQuery = `
            ${PREFIX.dct}
            
            SELECT ?description
                WHERE { 
                    GRAPH <http://mu.semte.ch/graphs/lpdc/ldes-data> { 
                        ${sparqlEscapeUri(id)} dct:description ?description. 
                    }
                }            
        `;
        const descriptions = await this.queryList(findDescriptionsQuery);

        const findAdditionalDescriptionsQuery = `
            ${PREFIX.lpdcExt}
            
            SELECT ?additionalDescription
                WHERE { 
                    GRAPH <http://mu.semte.ch/graphs/lpdc/ldes-data> { 
                        ${sparqlEscapeUri(id)} lpdcExt:additionalDescription ?additionalDescription. 
                    }
                }            
        `;
        const additionalDescriptions = await this.queryList(findAdditionalDescriptionsQuery);

        return new ConceptVersie(
            result['id'].value,
            TaalString.of(
                titles.find(t => t['title']['xml:lang'] === 'en')?.['title']?.value as string | undefined,
                titles.find(t => t['title']['xml:lang'] === 'nl')?.['title']?.value as string | undefined,
                titles.find(t => t['title']['xml:lang'] === 'nl-be-x-formal')?.['title']?.value as string | undefined,
                titles.find(t => t['title']['xml:lang'] === 'nl-be-x-informal')?.['title']?.value as string | undefined,
                titles.find(t => t['title']['xml:lang'] === 'nl-be-x-generated-formal')?.['title']?.value as string | undefined,
                titles.find(t => t['title']['xml:lang'] === 'nl-be-x-generated-informal')?.['title']?.value as string | undefined),
            TaalString.of(
                descriptions.find(t => t['description']['xml:lang'] === 'en')?.['description']?.value as string | undefined,
                descriptions.find(t => t['description']['xml:lang'] === 'nl')?.['description']?.value as string | undefined,
                descriptions.find(t => t['description']['xml:lang'] === 'nl-be-x-formal')?.['description']?.value as string | undefined,
                descriptions.find(t => t['description']['xml:lang'] === 'nl-be-x-informal')?.['description']?.value as string | undefined,
                descriptions.find(t => t['description']['xml:lang'] === 'nl-be-x-generated-formal')?.['description']?.value as string | undefined,
                descriptions.find(t => t['description']['xml:lang'] === 'nl-be-x-generated-informal')?.['description']?.value as string | undefined),
            TaalString.of(
                additionalDescriptions.find(t => t['additionalDescription']['xml:lang'] === 'en')?.['additionalDescription']?.value as string | undefined,
                additionalDescriptions.find(t => t['additionalDescription']['xml:lang'] === 'nl')?.['additionalDescription']?.value as string | undefined,
                additionalDescriptions.find(t => t['additionalDescription']['xml:lang'] === 'nl-be-x-formal')?.['additionalDescription']?.value as string | undefined,
                additionalDescriptions.find(t => t['additionalDescription']['xml:lang'] === 'nl-be-x-informal')?.['additionalDescription']?.value as string | undefined,
                additionalDescriptions.find(t => t['additionalDescription']['xml:lang'] === 'nl-be-x-generated-formal')?.['additionalDescription']?.value as string | undefined,
                additionalDescriptions.find(t => t['additionalDescription']['xml:lang'] === 'nl-be-x-generated-informal')?.['additionalDescription']?.value as string | undefined),
        );
    }

}
