import {SparqlRepository} from "./sparql-repository";
import {PREFIX} from "../../../config";
import {sparqlEscapeUri} from "../../../mu-helper";
import {ConceptVersieRepository} from "../../core/port/driven/persistence/concept-versie-repository";
import {ConceptVersie} from "../../core/domain/concept-versie";
import {TaalString} from "../../core/domain/taal-string";

export class ConceptVersieSparqlRepository extends SparqlRepository implements ConceptVersieRepository {

    async findById(id: string): Promise<ConceptVersie> {

        const findEntityResult = await this.querySingleRow(`
            ${PREFIX.lpdcExt}
            
            SELECT ?id
                WHERE { 
                    GRAPH <http://mu.semte.ch/graphs/lpdc/ldes-data> { 
                        ?id a lpdcExt:ConceptualPublicService . 
                        }
                    FILTER (?id = ${sparqlEscapeUri(id)}) 
                }            
        `);

        if (!findEntityResult) {
            throw new Error(`no concept versie found for iri: ${id}`);
        }

        const titlesQuery = this.queryList(`
            ${PREFIX.dct}
            SELECT ?title
                WHERE { 
                    GRAPH <http://mu.semte.ch/graphs/lpdc/ldes-data> { 
                        ${sparqlEscapeUri(id)} dct:title ?title. 
                    }
                }            
        `);

        const descriptionsQuery = this.queryList(`
            ${PREFIX.dct}
            SELECT ?description
                WHERE { 
                    GRAPH <http://mu.semte.ch/graphs/lpdc/ldes-data> { 
                        ${sparqlEscapeUri(id)} dct:description ?description. 
                    }
                }            
        `);

        const additionalDescriptionsQuery = this.queryList(`
            ${PREFIX.lpdcExt}
            
            SELECT ?additionalDescription
                WHERE { 
                    GRAPH <http://mu.semte.ch/graphs/lpdc/ldes-data> { 
                        ${sparqlEscapeUri(id)} lpdcExt:additionalDescription ?additionalDescription. 
                    }
                }            
        `);

        const exceptionsQuery = this.queryList(`
            ${PREFIX.lpdcExt}
            
            SELECT ?exception
                WHERE { 
                    GRAPH <http://mu.semte.ch/graphs/lpdc/ldes-data> { 
                        ${sparqlEscapeUri(id)} lpdcExt:exception ?exception. 
                    }
                }            
        `);

        const requlationsQuery = this.queryList(`
            ${PREFIX.lpdcExt}
            
            SELECT ?regulation
                WHERE { 
                    GRAPH <http://mu.semte.ch/graphs/lpdc/ldes-data> { 
                        ${sparqlEscapeUri(id)} lpdcExt:regulation ?regulation. 
                    }
                }            
        `);

        const [titles, descriptions, additionalDescriptions, exceptions, regulations] = await Promise.all([titlesQuery, descriptionsQuery, additionalDescriptionsQuery, exceptionsQuery, requlationsQuery]);

        return new ConceptVersie(
            findEntityResult['id'].value,
            this.asTaalString(titles.map(r => r?.['title'])),
            this.asTaalString(descriptions.map(r => r?.['description'])),
            this.asTaalString(additionalDescriptions.map(r => r?.['additionalDescription'])),
            this.asTaalString(exceptions.map(r => r?.['exception'])),
            this.asTaalString(regulations.map(r => r?.['regulation'])),
        );
    }

    private asTaalString(aResult: any[]): TaalString | undefined {
        return TaalString.of(
            aResult.find(t => t['xml:lang'] === 'en')?.value as string | undefined,
            aResult.find(t => t['xml:lang'] === 'nl')?.value as string | undefined,
            aResult.find(t => t['xml:lang'] === 'nl-be-x-formal')?.value as string | undefined,
            aResult.find(t => t['xml:lang'] === 'nl-be-x-informal')?.value as string | undefined,
            aResult.find(t => t['xml:lang'] === 'nl-be-x-generated-formal')?.value as string | undefined,
            aResult.find(t => t['xml:lang'] === 'nl-be-x-generated-informal')?.value as string | undefined);
    }
}
