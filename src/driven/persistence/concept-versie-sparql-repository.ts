import {SparqlRepository} from "./sparql-repository";
import {PREFIX} from "../../../config";
import {sparqlEscapeUri} from "../../../mu-helper";
import {ConceptVersieRepository} from "../../core/port/driven/persistence/concept-versie-repository";
import {
    CompetentAuthorityLevelType,
    ConceptVersie,
    ExecutingAuthorityLevelType,
    ProductType,
    PublicationMediumType,
    TargetAudienceType,
    ThemeType
} from "../../core/domain/concept-versie";
import {TaalString} from "../../core/domain/taal-string";
import {Iri} from "../../core/domain/shared/iri";

export class ConceptVersieSparqlRepository extends SparqlRepository implements ConceptVersieRepository {

    async findById(id: string): Promise<ConceptVersie> {

        //TODO LPDC-916: verify the cost of these OPTIONAL blocks ... and if more performant, do separate queries ...
        const findEntityAndUniqueTriplesResult = await this.querySingleRow(`
            ${PREFIX.lpdcExt}
            ${PREFIX.schema}
            ${PREFIX.dct}
            
            SELECT ?id ?startDate ?endDate ?type
                WHERE { 
                    GRAPH <http://mu.semte.ch/graphs/lpdc/ldes-data> { 
                        ?id a lpdcExt:ConceptualPublicService .
                        OPTIONAL {
                            ?id schema:startDate ?startDate .
                        }
                        OPTIONAL {
                            ?id schema:endDate ?endDate .
                        }
                        OPTIONAL {
                            ?id dct:type ?type . 
                        }
                    }
                    FILTER (?id = ${sparqlEscapeUri(id)}) 
                }            
        `);

        if (!findEntityAndUniqueTriplesResult) {
            throw new Error(`no concept versie found for iri: ${id}`);
        }

        //TODO LPDC-916: add to query a VALUES (id's / IRIs): so we can reuse for others that have a title?
        //TODO LPDC-916: extract these queries into SparqlQueryFragments functions
        //TODO LPDC-916: interface: titles(ids: Iri[]): returns an object with as key an IRI, and as Value: TaalString | undefined ...

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

        const targetAudiencesQuery = this.queryList(`
            ${PREFIX.lpdcExt}
            
            SELECT ?targetAudience
                WHERE { 
                    GRAPH <http://mu.semte.ch/graphs/lpdc/ldes-data> { 
                        ${sparqlEscapeUri(id)} lpdcExt:targetAudience ?targetAudience. 
                    }
                }            
        `);

        const themesQuery = this.queryList(`
            ${PREFIX.m8g}
            
            SELECT ?theme
                WHERE { 
                    GRAPH <http://mu.semte.ch/graphs/lpdc/ldes-data> { 
                        ${sparqlEscapeUri(id)} m8g:thematicArea ?theme. 
                    }
                }            
        `);

        const competentAuthorityLevelQuery = this.queryList(`
           ${PREFIX.lpdcExt}
            
            SELECT ?competentAuthorityLevel
                WHERE { 
                    GRAPH <http://mu.semte.ch/graphs/lpdc/ldes-data> { 
                        ${sparqlEscapeUri(id)} lpdcExt:competentAuthorityLevel ?competentAuthorityLevel. 
                    }
                }            
        `);

        const competentAuthoritiesQuery = this.queryList(`
           ${PREFIX.m8g}
            
            SELECT ?competentAuthority
                WHERE { 
                    GRAPH <http://mu.semte.ch/graphs/lpdc/ldes-data> { 
                        ${sparqlEscapeUri(id)} m8g:hasCompetentAuthority ?competentAuthority. 
                    }
                }            
        `);

        const executingAuthorityLevelQuery = this.queryList(`
           ${PREFIX.lpdcExt}
            
            SELECT ?executingAuthorityLevel
                WHERE { 
                    GRAPH <http://mu.semte.ch/graphs/lpdc/ldes-data> { 
                        ${sparqlEscapeUri(id)} lpdcExt:executingAuthorityLevel ?executingAuthorityLevel. 
                    }
                }            
        `);

        const executingAuthoritiesQuery = this.queryList(`
           ${PREFIX.lpdcExt}
            
            SELECT ?executingAuthority
                WHERE { 
                    GRAPH <http://mu.semte.ch/graphs/lpdc/ldes-data> { 
                        ${sparqlEscapeUri(id)} lpdcExt:hasExecutingAuthority ?executingAuthority. 
                    }
                }            
        `);

        const publicationMediaQuery = this.queryList(`
           ${PREFIX.lpdcExt}
            
            SELECT ?publicationMedium
                WHERE { 
                    GRAPH <http://mu.semte.ch/graphs/lpdc/ldes-data> { 
                        ${sparqlEscapeUri(id)} lpdcExt:publicationMedium ?publicationMedium. 
                    }
                }            
        `);


        const [titles,
            descriptions,
            additionalDescriptions,
            exceptions,
            regulations,
            targetAudiences,
            themes,
            competentAuthorityLevels,
            competentAuthorities,
            executingAuthorityLevels,
            executingAuthorities,
            publicationMedia,
        ] =
            await Promise.all([
                titlesQuery,
                descriptionsQuery,
                additionalDescriptionsQuery,
                exceptionsQuery,
                requlationsQuery,
                targetAudiencesQuery,
                themesQuery,
                competentAuthorityLevelQuery,
                competentAuthoritiesQuery,
                executingAuthorityLevelQuery,
                executingAuthoritiesQuery,
                publicationMediaQuery,
            ]);

        return new ConceptVersie(
            findEntityAndUniqueTriplesResult['id'].value,
            this.asTaalString(titles.map(r => r?.['title'])),
            this.asTaalString(descriptions.map(r => r?.['description'])),
            this.asTaalString(additionalDescriptions.map(r => r?.['additionalDescription'])),
            this.asTaalString(exceptions.map(r => r?.['exception'])),
            this.asTaalString(regulations.map(r => r?.['regulation'])),
            this.asDate(findEntityAndUniqueTriplesResult['startDate']?.value),
            this.asDate(findEntityAndUniqueTriplesResult['endDate']?.value),
            this.asEnum(ProductType, findEntityAndUniqueTriplesResult['type']?.value, id),
            this.asEnums(TargetAudienceType, targetAudiences.map(r => r?.['targetAudience']), id),
            this.asEnums(ThemeType, themes.map(r => r?.['theme']), id),
            this.asEnums(CompetentAuthorityLevelType, competentAuthorityLevels.map(r => r?.['competentAuthorityLevel']), id),
            this.asIris(competentAuthorities.map(r => r?.['competentAuthority'])),
            this.asEnums(ExecutingAuthorityLevelType, executingAuthorityLevels.map(r => r?.['executingAuthorityLevel']), id),
            this.asIris(executingAuthorities.map(r => r?.['executingAuthority'])),
            this.asEnums(PublicationMediumType, publicationMedia.map(r => r?.['publicationMedium']), id),
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

    private asDate(aValue: string | undefined): Date | undefined {
        return aValue ? new Date(aValue) : undefined;
    }

    private asEnums<T>(enumObj: T, values: any[], id: string): Set<T[keyof T]> {
        return new Set(values.map(value => this.asEnum(enumObj, value?.value, id)));
    }

    //TODO LPDC-916: generalize ; extract in shared sparql toolkit?
    private asEnum<T>(enumObj: T, value: any, id: string): T[keyof T] | undefined {
        for (const key in enumObj) {
            if (enumObj[key] === value) {
                return value;
            }
        }
        if (value) {
            throw new Error(`could not map <${value}> for iri: <${id}>`);
        }
        return undefined;
    }

    private asIris(values: any[]): Set<Iri> {
        return new Set(values.map(value => value.value));
    }

}
