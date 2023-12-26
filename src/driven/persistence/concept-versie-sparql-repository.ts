import {SparqlRepository} from "./sparql-repository";
import {GRAPH, PREFIX} from "../../../config";
import {sparqlEscapeUri} from "../../../mu-helper";
import {ConceptVersieRepository} from "../../core/port/driven/persistence/concept-versie-repository";
import {
    CompetentAuthorityLevelType,
    ConceptVersie,
    ExecutingAuthorityLevelType,
    ProductType,
    PublicationMediumType,
    TargetAudienceType,
    ThemeType,
    YourEuropeCategoryType
} from "../../core/domain/concept-versie";
import {TaalString} from "../../core/domain/taal-string";
import {Iri} from "../../core/domain/shared/iri";
import {PromisePool} from '@supercharge/promise-pool';
import {Requirement} from "../../core/domain/requirement";
import {asSortedArray} from "../../core/domain/shared/collections-helper";
import {Evidence} from "../../core/domain/evidence";

export class ConceptVersieSparqlRepository extends SparqlRepository implements ConceptVersieRepository {

    async findById(id: Iri): Promise<ConceptVersie> {

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


        const requirementAndEvidenceIdsQuery = `
            ${PREFIX.ps}
            ${PREFIX.m8g}
            SELECT ?requirementId ?evidenceId
                WHERE {
                    GRAPH ${GRAPH.ldesData} {
                        ${sparqlEscapeUri(id)} ps:hasRequirement ?requirementId.
                        ?requirementId a m8g:Requirement.
                        OPTIONAL {
                            ?requirementId m8g:hasSupportingEvidence ?evidenceId.
                            ?evidenceId a m8g:Evidence.
                        }
                    }
                }
        `;

        const dependentEntityIdsQueries =
            [
                requirementAndEvidenceIdsQuery,
            ];

        const {results: resultsDependentEntityIds, errors: errorsDependentEntityIds} = await PromisePool
            .withConcurrency(5)
            .for(dependentEntityIdsQueries)
            .useCorrespondingResults()
            .process(async (query) => {
                return await this.queryList(query);
            });

        if (resultsDependentEntityIds.some(r => r === PromisePool.failed || r === PromisePool.notRun)) {
            console.log(errorsDependentEntityIds);
            throw new Error(`Could not query all for iri: ${id}`);
        }
        const [
            requirementAndEvidenceIdsResults,
        ] = resultsDependentEntityIds.map(r => r as any []);

        const requirementIds: Iri[] = requirementAndEvidenceIdsResults.map(r => r?.['requirementId'].value);
        const evidenceIds: Iri[] = requirementAndEvidenceIdsResults.map(r => r?.['evidenceId']?.value);

        //TODO LPDC-916: extract these queries into SparqlQueryFragments functions
        //TODO LPDC-916: interface: titlesQuery(ids: Iri[]): returns an object with as key an IRI, and as Value: TaalString | undefined ...

        const titlesQueryBuilder = (subjectIds: Iri[]) => `
            ${PREFIX.dct}
            SELECT ?subjectId ?title
                WHERE {                    
                    GRAPH ${GRAPH.ldesData} {
                        VALUES(?subjectId) {
                            ${subjectIds.map(subjectId => `(${sparqlEscapeUri(subjectId)}) `).join(' ')}
                         } 
                        ?subjectId dct:title ?title. 
                    }
                }            
        `;

        const descriptionsQueryBuilder = (subjectIds: Iri[]) => `
            ${PREFIX.dct}
            SELECT ?subjectId ?description
                WHERE { 
                    GRAPH ${GRAPH.ldesData} {
                        VALUES(?subjectId) {
                            ${subjectIds.map(subjectId => `(${sparqlEscapeUri(subjectId)}) `).join(' ')}
                        } 
                        ?subjectId dct:description ?description. 
                    }
                }            
        `;

        const ordersQueryBuilder = (subjectIds: Iri[]) => `
            ${PREFIX.sh}
            SELECT ?subjectId ?order
                WHERE { 
                    GRAPH ${GRAPH.ldesData} {
                        VALUES(?subjectId) {
                            ${subjectIds.map(subjectId => `(${sparqlEscapeUri(subjectId)}) `).join(' ')}
                        } 
                        ?subjectId sh:order ?order. 
                    }
                }            
        `;

        const additionalDescriptionsQuery = `
            ${PREFIX.lpdcExt}
            
            SELECT ?additionalDescription
                WHERE { 
                    GRAPH ${GRAPH.ldesData} { 
                        ${sparqlEscapeUri(id)} lpdcExt:additionalDescription ?additionalDescription. 
                    }
                }            
        `;

        const exceptionsQuery = `
            ${PREFIX.lpdcExt}
            
            SELECT ?exception
                WHERE { 
                    GRAPH ${GRAPH.ldesData} { 
                        ${sparqlEscapeUri(id)} lpdcExt:exception ?exception. 
                    }
                }            
        `;

        const requlationsQuery = `
            ${PREFIX.lpdcExt}
            
            SELECT ?regulation
                WHERE { 
                    GRAPH ${GRAPH.ldesData} { 
                        ${sparqlEscapeUri(id)} lpdcExt:regulation ?regulation. 
                    }
                }            
        `;

        const targetAudiencesQuery = `
            ${PREFIX.lpdcExt}
            
            SELECT ?targetAudience
                WHERE { 
                    GRAPH ${GRAPH.ldesData} { 
                        ${sparqlEscapeUri(id)} lpdcExt:targetAudience ?targetAudience. 
                    }
                }            
        `;

        const themesQuery = `
            ${PREFIX.m8g}
            
            SELECT ?theme
                WHERE { 
                    GRAPH ${GRAPH.ldesData} { 
                        ${sparqlEscapeUri(id)} m8g:thematicArea ?theme. 
                    }
                }            
        `;

        const competentAuthorityLevelQuery = `
           ${PREFIX.lpdcExt}
            
            SELECT ?competentAuthorityLevel
                WHERE { 
                    GRAPH ${GRAPH.ldesData} { 
                        ${sparqlEscapeUri(id)} lpdcExt:competentAuthorityLevel ?competentAuthorityLevel. 
                    }
                }            
        `;

        const competentAuthoritiesQuery = `
           ${PREFIX.m8g}
            
            SELECT ?competentAuthority
                WHERE { 
                    GRAPH ${GRAPH.ldesData} { 
                        ${sparqlEscapeUri(id)} m8g:hasCompetentAuthority ?competentAuthority. 
                    }
                }            
        `;

        const executingAuthorityLevelQuery = `
           ${PREFIX.lpdcExt}
            
            SELECT ?executingAuthorityLevel
                WHERE { 
                    GRAPH ${GRAPH.ldesData} { 
                        ${sparqlEscapeUri(id)} lpdcExt:executingAuthorityLevel ?executingAuthorityLevel. 
                    }
                }            
        `;

        const executingAuthoritiesQuery = `
           ${PREFIX.lpdcExt}
            
            SELECT ?executingAuthority
                WHERE { 
                    GRAPH ${GRAPH.ldesData} { 
                        ${sparqlEscapeUri(id)} lpdcExt:hasExecutingAuthority ?executingAuthority. 
                    }
                }            
        `;

        const publicationMediaQuery = `
           ${PREFIX.lpdcExt}
            
            SELECT ?publicationMedium
                WHERE { 
                    GRAPH ${GRAPH.ldesData} { 
                        ${sparqlEscapeUri(id)} lpdcExt:publicationMedium ?publicationMedium. 
                    }
                }            
        `;

        const yourEuropeCategoriesQuery = `
           ${PREFIX.lpdcExt}
            
            SELECT ?yourEuropeCategory
                WHERE { 
                    GRAPH ${GRAPH.ldesData} { 
                        ${sparqlEscapeUri(id)} lpdcExt:yourEuropeCategory ?yourEuropeCategory. 
                    }
                }            
        `;

        const keywordsQuery = `
           ${PREFIX.dcat}
            
            SELECT ?keyword
                WHERE { 
                    GRAPH ${GRAPH.ldesData} { 
                        ${sparqlEscapeUri(id)} dcat:keyword ?keyword. 
                    }
                }            
        `;

        const listQueries =
            [
                titlesQueryBuilder([id, ...requirementIds, ...evidenceIds].filter(ids => ids !== undefined)),
                descriptionsQueryBuilder([id, ...requirementIds, ...evidenceIds].filter(ids => ids !== undefined)),
                ordersQueryBuilder([...requirementIds]),
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
                yourEuropeCategoriesQuery,
                keywordsQuery,
            ];

        const {results, errors} = await PromisePool
            .withConcurrency(5)
            .for(listQueries)
            .useCorrespondingResults()
            .process(async (query) => {
                return await this.queryList(query);
            });

        if (results.some(r => r === PromisePool.failed || r === PromisePool.notRun)) {
            console.log(errors);
            throw new Error(`Could not query all for iri: ${id}`);
        }
        const [
            allTitles,
            allDescriptions,
            allOrders,
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
            yourEuropeCategories,
            keywords,
        ] = results.map(r => r as any []);

        return new ConceptVersie(
            findEntityAndUniqueTriplesResult['id'].value,
            this.asTaalString(allTitles.filter(r => r?.['subjectId'].value === id).map(r => r?.['title'])),
            this.asTaalString(allDescriptions.filter(r => r?.['subjectId'].value === id).map(r => r?.['description'])),
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
            this.asEnums(YourEuropeCategoryType, yourEuropeCategories.map(r => r?.['yourEuropeCategory']), id),
            keywords.map(keyword => [keyword]).flatMap(keywordsRow => this.asTaalString(keywordsRow.map(r => r?.['keyword']))),
            this.asRequirements(requirementIds, evidenceIds, allTitles, allDescriptions, allOrders),
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

    private asRequirements(requirementIds: Iri[], evidenceIds: Iri[], allTitles: any[], allDescriptions: any[], allOrders: any[]): Requirement[] {
        const result = requirementIds.map((reqId, index) => {
                const title = this.asTaalString(allTitles.filter(r => r?.['subjectId'].value === reqId).map(r => r?.['title']));
                const description = this.asTaalString(allDescriptions.filter(r => r?.['subjectId'].value === reqId).map(r => r?.['description']));
                const evidenceIdForRequirement = evidenceIds[index];
                const evidence = evidenceIdForRequirement !== undefined ?
                    new Evidence(evidenceIdForRequirement,
                        this.asTaalString(allTitles.filter(r => r?.['subjectId'].value === evidenceIdForRequirement).map(r => r?.['title'])),
                        this.asTaalString(allDescriptions.filter(r => r?.['subjectId'].value === evidenceIdForRequirement).map(r => r?.['description'])))
                    : undefined;
                return new Requirement(reqId, title, description, evidence);
            }
        );
        return asSortedArray(result, (a, b) => {
            const orderA = Number.parseInt(allOrders.filter(r => r?.['subjectId'].value === a.id)[0].order.value);
            const orderB = Number.parseInt(allOrders.filter(r => r?.['subjectId'].value === b.id)[0].order.value);
            return orderA - orderB;
        });
    }

}
