import {SparqlQuerying} from "./sparql-querying";
import {GRAPH, PREFIX} from "../../../config";
import {sparqlEscapeUri} from "../../../mu-helper";
import {ConceptVersieRepository} from "../../core/port/driven/persistence/concept-versie-repository";
import {ConceptVersie} from "../../core/domain/concept-versie";
import {TaalString} from "../../core/domain/taal-string";
import {Iri} from "../../core/domain/shared/iri";
import {PromisePool} from '@supercharge/promise-pool';
import {Requirement} from "../../core/domain/requirement";
import {asSortedArray} from "../../core/domain/shared/collections-helper";
import {Evidence} from "../../core/domain/evidence";
import {Procedure} from "../../core/domain/procedure";
import {Website} from "../../core/domain/website";
import {Cost} from "../../core/domain/cost";
import {FinancialAdvantage} from "../../core/domain/financial-advantage";
import {DatastoreToQuadsRecursiveSparqlFetcher} from "./datastore-to-quads-recursive-sparql-fetcher";
import {NAMESPACE, QuadsToDomainMapper} from "./quads-to-domain-mapper";
import {namedNode} from "rdflib";

let OneToManyIdsType: [Iri, Iri[]];

export class ConceptVersieSparqlRepository implements ConceptVersieRepository {

    protected readonly querying: SparqlQuerying;
    protected readonly fetcher: DatastoreToQuadsRecursiveSparqlFetcher;

    constructor(endpoint?: string) {
        this.querying = new SparqlQuerying(endpoint);
        this.fetcher = new DatastoreToQuadsRecursiveSparqlFetcher(endpoint);
    }

    async findById(id: Iri): Promise<ConceptVersie> {
        const quads = await this.fetcher.fetch('http://mu.semte.ch/graphs/lpdc/ldes-data', id);

        const mapper = new QuadsToDomainMapper(quads, 'http://mu.semte.ch/graphs/lpdc/ldes-data');

        mapper.errorIfMissingOrIncorrectType(id, namedNode(NAMESPACE.lpdcExt('ConceptualPublicService').value));

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

        const procedureAndWebsiteIdsQuery = `
            ${PREFIX.cpsv}
            ${PREFIX.lpdcExt}
            ${PREFIX.schema}
            
            SELECT ?procedureId ?websiteId
                WHERE {
                    GRAPH ${GRAPH.ldesData} {
                        ${sparqlEscapeUri(id)} cpsv:follows ?procedureId.
                        ?procedureId a cpsv:Rule.
                        OPTIONAL {
                            ?procedureId lpdcExt:hasWebsite ?websiteId.
                            ?websiteId a schema:WebSite.  
                        }
                    }
                }
        `;

        const websiteIdsQuery = `
            ${PREFIX.rdfs}
            ${PREFIX.schema}
            
            SELECT ?websiteId
                WHERE {
                    GRAPH ${GRAPH.ldesData} {
                        ${sparqlEscapeUri(id)} rdfs:seeAlso ?websiteId.
                        ?websiteId a schema:WebSite.
                    }
                }
        `;

        const costIdsQuery = `
            ${PREFIX.m8g}
            
            SELECT ?costId
                WHERE {
                    GRAPH ${GRAPH.ldesData} {
                        ${sparqlEscapeUri(id)} m8g:hasCost ?costId.
                        ?costId a m8g:Cost.
                    }
                }
        `;

        const financialAdvantageIdsQuery = `
            ${PREFIX.lpdcExt}
            ${PREFIX.cpsv}
            
            SELECT ?financialAdvantageId
                WHERE {
                    GRAPH ${GRAPH.ldesData} {
                        ${sparqlEscapeUri(id)} cpsv:produces ?financialAdvantageId.
                        ?financialAdvantageId a lpdcExt:FinancialAdvantage.
                    }
                }
        `;

        const dependentEntityIdsQueries =
            [
                requirementAndEvidenceIdsQuery,
                procedureAndWebsiteIdsQuery,
                websiteIdsQuery,
                costIdsQuery,
                financialAdvantageIdsQuery,
            ];

        const {results: resultsDependentEntityIds, errors: errorsDependentEntityIds} = await PromisePool
            .withConcurrency(5)
            .for(dependentEntityIdsQueries)
            .useCorrespondingResults()
            .process(async (query) => {
                return await this.querying.list(query);
            });

        if (resultsDependentEntityIds.some(r => r === PromisePool.failed || r === PromisePool.notRun)) {
            console.log(errorsDependentEntityIds);
            throw new Error(`Could not query all for iri: ${id}`);
        }
        const [
            requirementAndEvidenceIdsResults,
            procedureAndWebsiteIdsResults,
            websiteIdsResults,
            costIdsResults,
            financialAdvantageIdsResults,
        ] = resultsDependentEntityIds.map(r => r as any []);

        const requirementIds: Iri[] = requirementAndEvidenceIdsResults.map(r => r?.['requirementId'].value);
        //TODO LPDC-916: rewrite using a tuple structure (requirement -> evidence ...) (don't depend on index of arrays) + remove the
        const evidenceIds: Iri[] = requirementAndEvidenceIdsResults.map(r => r?.['evidenceId']?.value);

        const procedureAndWebsiteIds: typeof OneToManyIdsType []
            = Array.from(new Set(procedureAndWebsiteIdsResults.map(r => r?.['procedureId'].value as Iri)))
            .map(procedureId =>
                [procedureId,
                    Array.from(
                        new Set(procedureAndWebsiteIdsResults
                            .filter(r => r?.['procedureId'].value === procedureId)
                            .flatMap(r => r?.['websiteId']?.value as Iri | undefined)
                            .filter(v => v !== undefined)))]
            );
        const procedureIds = procedureAndWebsiteIds.map(prodAndWebsite => prodAndWebsite[0]);
        const websitesIdsForProcedures = procedureAndWebsiteIds.flatMap(prodAndWebsite => prodAndWebsite[1]);

        const websiteIds: Iri[] = websiteIdsResults.map(r => r?.['websiteId'].value);

        const costIds: Iri[] = costIdsResults.map(r => r?.['costId'].value);

        const financialAdvantageIds = financialAdvantageIdsResults.map(r => r?.['financialAdvantageId'].value);

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

        const urlsQueryBuilder = (subjectIds: Iri[]) => `
            ${PREFIX.schema}
            
            SELECT ?subjectId ?url
                WHERE { 
                    GRAPH ${GRAPH.ldesData} {
                        VALUES(?subjectId) {
                            ${subjectIds.map(subjectId => `(${sparqlEscapeUri(subjectId)}) `).join(' ')}
                        } 
                        ?subjectId schema:url ?url. 
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
                ordersQueryBuilder([...requirementIds, ...procedureIds, ...websitesIdsForProcedures, ...websiteIds, ...costIds, ...financialAdvantageIds]),
                urlsQueryBuilder([...websitesIdsForProcedures, ...websiteIds]),
                keywordsQuery,
            ];

        const {results, errors} = await PromisePool
            .withConcurrency(5)
            .for(listQueries)
            .useCorrespondingResults()
            .process(async (query) => {
                return await this.querying.list(query);
            });

        if (results.some(r => r === PromisePool.failed || r === PromisePool.notRun)) {
            console.log(errors);
            throw new Error(`Could not query all for iri: ${id}`);
        }
        const [
            allOrders,
            allUrls,
            keywords,
        ] = results.map(r => r as any []);

        return new ConceptVersie(
            id,
            mapper.title(id),
            mapper.description(id),
            mapper.additionalDescription(id),
            mapper.exception(id),
            mapper.regulation(id),
            mapper.startDate(id),
            mapper.endDate(id),
            mapper.productType(id),
            mapper.targetAudiences(id),
            mapper.themes(id),
            mapper.competentAuthorityLevels(id),
            mapper.competentAuthorities(id),
            mapper.executingAuthorityLevels(id),
            mapper.executingAuthorities(id),
            mapper.publicationMedia(id),
            mapper.yourEuropeCategories(id),
            keywords.map(keyword => [keyword]).flatMap(keywordsRow => this.asTaalString(keywordsRow.map(r => r?.['keyword']))),
            this.asRequirements(requirementIds, evidenceIds, mapper, allOrders),
            this.asProcedures(procedureAndWebsiteIds, mapper, allOrders, allUrls),
            this.asWebsites(websiteIds, mapper, allOrders, allUrls),
            this.asCosts(costIds, mapper, allOrders),
            this.asFinancialAdvantages(financialAdvantageIds, mapper, allOrders),
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

    private asRequirements(requirementIds: Iri[], evidenceIds: Iri[], mapper: QuadsToDomainMapper, allOrders: any[]): Requirement[] {
        const result = requirementIds.map((reqId, index) => {
                const title = mapper.title(reqId);
                const description = mapper.description(reqId);
                const evidenceIdForRequirement = evidenceIds[index];
                const evidence = evidenceIdForRequirement !== undefined ?
                    new Evidence(evidenceIdForRequirement,
                        mapper.title(evidenceIdForRequirement),
                        mapper.description(evidenceIdForRequirement))
                    : undefined;
                return new Requirement(reqId, title, description, evidence);
            }
        );
        return this.sort(result, allOrders);
    }

    private asProcedures(procedureAndWebsiteIds: typeof OneToManyIdsType [], mapper: QuadsToDomainMapper, allOrders: any[], allUrls: any[]): Procedure[] {
        const result = procedureAndWebsiteIds.map((procAndWebsitesId) => {
                const procId: Iri = procAndWebsitesId[0];
                const websiteIds: Iri[] = procAndWebsitesId[1];
                const title = mapper.title(procId);
                const description = mapper.description(procId);
                const websites = this.asWebsites(websiteIds, mapper, allOrders, allUrls);
                return new Procedure(procId, title, description, websites);
            }
        );
        return this.sort(result, allOrders);
    }

    private asWebsites(websiteIds: Iri[], mapper: QuadsToDomainMapper, allOrders: any[], allUrls: any[]): Website[] {
        return this.sort(
            websiteIds.map(websiteId =>
                new Website(
                    websiteId,
                    mapper.title(websiteId),
                    mapper.description(websiteId),
                    allUrls.filter(r => r?.['subjectId'].value === websiteId).map(r => r?.['url'])[0]?.value)
            ), allOrders);

    }

    private asCosts(costIds: Iri[], mapper: QuadsToDomainMapper, allOrders: any[]): Cost[] {
        const result = costIds.map(costId => {
                const title = mapper.title(costId);
                const description = mapper.description(costId);
                return new Cost(costId, title, description);
            }
        );
        return this.sort(result, allOrders);
    }

    private asFinancialAdvantages(financialAdvantageIds: Iri[], mapper: QuadsToDomainMapper, allOrders: any[]): FinancialAdvantage[] {
        const result = financialAdvantageIds.map(financialAdvantageId => {
                const title = mapper.title(financialAdvantageId);
                const description = mapper.description(financialAdvantageId);
                return new FinancialAdvantage(financialAdvantageId, title, description);
            }
        );
        return this.sort(result, allOrders);
    }


    private sort(anArray: any[], allOrders: any[]) {
        return asSortedArray(anArray, (a, b) => {
            const orderA = Number.parseInt(allOrders.filter(r => r?.['subjectId'].value === a.id)[0].order.value);
            const orderB = Number.parseInt(allOrders.filter(r => r?.['subjectId'].value === b.id)[0].order.value);
            return orderA - orderB;
        });
    }

}
