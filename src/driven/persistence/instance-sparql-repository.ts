import {Iri} from "../../core/domain/shared/iri";
import {InstanceRepository} from "../../core/port/driven/persistence/instance-repository";
import {SparqlQuerying} from "./sparql-querying";
import {PREFIX} from "../../../config";
import {sparqlEscapeDateTime, sparqlEscapeUri, uuid} from "../../../mu-helper";
import {Instance, InstanceBuilder} from "../../core/domain/instance";
import {DatastoreToQuadsRecursiveSparqlFetcher} from "./datastore-to-quads-recursive-sparql-fetcher";
import {DomainToQuadsMapper} from "./domain-to-quads-mapper";
import {Bestuurseenheid} from "../../core/domain/bestuurseenheid";
import {DoubleQuadReporter, LoggingDoubleQuadReporter, QuadsToDomainMapper} from "../shared/quads-to-domain-mapper";
import {NS} from "./namespaces";
import {ChosenFormType, InstanceReviewStatusType} from "../../core/domain/types";
import {Logger} from "../../../platform/logger";
import {literal} from "rdflib";
import {isEqual} from "lodash";
import {ConcurrentUpdateError, SystemError} from "../../core/domain/shared/lpdc-error";
import {FormatPreservingDate} from "../../core/domain/format-preserving-date";
import {requiredValue} from "../../core/domain/shared/invariant";
import {PublishedInstanceBuilder} from "../../core/domain/published-instance";

export class InstanceSparqlRepository implements InstanceRepository {
    protected readonly querying: SparqlQuerying;
    protected readonly fetcher: DatastoreToQuadsRecursiveSparqlFetcher;
    protected doubleQuadReporter: DoubleQuadReporter = new LoggingDoubleQuadReporter(new Logger('Instance-QuadsToDomainLogger'));

    constructor(endpoint?: string, doubleQuadReporter?: DoubleQuadReporter) {
        this.querying = new SparqlQuerying(endpoint);
        this.fetcher = new DatastoreToQuadsRecursiveSparqlFetcher(endpoint);
        if (doubleQuadReporter) {
            this.doubleQuadReporter = doubleQuadReporter;
        }
    }

    async findById(bestuurseenheid: Bestuurseenheid, id: Iri): Promise<Instance> {
        const quads = await this.fetcher.fetch(
            bestuurseenheid.userGraph(),
            id,
            [],
            [
                NS.lpdcExt('yourEuropeCategory').value,
                NS.lpdcExt('targetAudience').value,
                NS.m8g('thematicArea').value,
                NS.lpdcExt('competentAuthorityLevel').value,
                NS.m8g('hasCompetentAuthority').value,
                NS.lpdcExt('executingAuthorityLevel').value,
                NS.lpdcExt('hasExecutingAuthority').value,
                NS.lpdcExt('publicationMedium').value,
                NS.dct("type").value,
                NS.lpdcExt("conceptTag").value,
                NS.adms('status').value,
                NS.ext('hasVersionedSource').value,
                NS.dct('source').value,
                NS.dct('spatial').value,
                NS.pav('createdBy').value,
            ],
            [
                NS.skos('Concept').value,
                NS.lpdcExt('ConceptDisplayConfiguration').value,
                NS.besluit('Bestuurseenheid').value,
                NS.m8g('PublicOrganisation').value,
                NS.lpdcExt('InstancePublicServiceSnapshot').value,
                NS.lpdcExt('ConceptualPublicService').value,
                NS.lpdcExt('ConceptualPublicServiceSnapshot').value,
            ]);

        const mapper = new QuadsToDomainMapper(quads, bestuurseenheid.userGraph(), this.doubleQuadReporter);

        return mapper.instance(id);

    }

    async save(bestuurseenheid: Bestuurseenheid, instance: Instance): Promise<void> {
        const quads = new DomainToQuadsMapper(bestuurseenheid.userGraph()).instanceToQuads(instance).map(s => s.toNT());

        const query = `
            INSERT DATA { 
                GRAPH ${sparqlEscapeUri(bestuurseenheid.userGraph())} {
                    ${quads.join("\n")}
                }
            }
        `;
        await this.querying.insert(query);
    }

    async update(bestuurseenheid: Bestuurseenheid, instance: Instance, instanceVersion: FormatPreservingDate, dontUpdateDateModified: boolean = false): Promise<void> {

        requiredValue(instanceVersion, "Instantie versie");
        const oldInstance = await this.findById(bestuurseenheid, instance.id);

        if (FormatPreservingDate.isFunctionallyChanged(instanceVersion, oldInstance.dateModified)) {
            throw new ConcurrentUpdateError("De productfiche is gelijktijdig aangepast door een andere gebruiker. Herlaad de pagina en geef je aanpassingen opnieuw in");
        }

        const newInstance = dontUpdateDateModified ? instance : InstanceBuilder.from(instance).withDateModified(FormatPreservingDate.now()).build();

        const oldTriples = new DomainToQuadsMapper(bestuurseenheid.userGraph()).instanceToQuads(oldInstance).map(s => s.toNT());
        const newTriples = new DomainToQuadsMapper(bestuurseenheid.userGraph()).instanceToQuads(newInstance).map(s => s.toNT());

        // Virtuoso bug: when triples in delete part and insert part of query are exactly the same, virtuoso will only execute the delete, hence all data will be deleted.
        if (isEqual(oldTriples, newTriples)) {
            throw new SystemError('Geen wijzigingen');
        }

        const query = `
            WITH <${bestuurseenheid.userGraph()}>
            DELETE {
                ${[...oldTriples].join('\n')}
            }
            INSERT {
                ${[...newTriples].join('\n')}
            }
            WHERE {
                <${instance.id}> <${NS.schema('dateModified').value}> ${literal(instanceVersion.value, NS.xsd('dateTime')).toNT()} .
            }
        `;

        await this.querying.deleteInsert(query, (deleteInsertResults: string[]) => {

            if (deleteInsertResults.length != 1) {
                throw new SystemError('Meer dan 1 graph wordt tegelijk aangepast');
            }
            if (deleteInsertResults[0].includes("delete 0 (or less) and insert 0 (or less) triples")) {
                throw new ConcurrentUpdateError("De productfiche is gelijktijdig aangepast door een andere gebruiker. Herlaad de pagina en geef je aanpassingen opnieuw in");
            }
        });
    }

    //TODO LPDC-1236: verify deletion time parameter
    async delete(bestuurseenheid: Bestuurseenheid, id: Iri, deletionTime?: FormatPreservingDate): Promise<void> {
        const instance = await this.findById(bestuurseenheid, id);
        if (instance != undefined) {

            const triples = new DomainToQuadsMapper(bestuurseenheid.userGraph()).instanceToQuads(instance).map(s => s.toNT());

            if (deletionTime === undefined) {
                deletionTime = FormatPreservingDate.now();
            }

            if (instance.dateSent !== undefined) {

                const uniqueId = uuid();
                const tombstoneId = PublishedInstanceBuilder.buildIri(uniqueId);

                const query = `
                ${PREFIX.as}
                ${PREFIX.lpdcExt}
                ${PREFIX.schema}
                ${PREFIX.dct}
                ${PREFIX.prov}
                
                WITH ${sparqlEscapeUri(bestuurseenheid.userGraph())}
                DELETE {            
                    ${triples.join("\n")}
                }
                INSERT {
                    ${sparqlEscapeUri(tombstoneId)} a as:Tombstone;
                        as:formerType lpdcExt:InstancePublicService;
                        lpdcExt:isPublishedVersionOf ${sparqlEscapeUri(instance.id)};
                        as:deleted ${sparqlEscapeDateTime(deletionTime.value)};
                        prov:generatedAtTime ${sparqlEscapeDateTime(deletionTime.value)}.
                }`;
                await this.querying.deleteInsert(query);
            } else {
                const query = `

                    DELETE
                    DATA FROM
                    ${sparqlEscapeUri(bestuurseenheid.userGraph())}
                    {
                    ${triples.join("\n")}
                    };
                `;

                await this.querying.delete(query);
            }
        }
    }

    async updateReviewStatusesForInstances(conceptId: Iri, isConceptFunctionallyChanged: boolean, isConceptArchived: boolean): Promise<void> {
        let reviewStatus = undefined;
        if (isConceptArchived) {
            reviewStatus = InstanceReviewStatusType.CONCEPT_GEARCHIVEERD;
        } else if (isConceptFunctionallyChanged) {
            reviewStatus = InstanceReviewStatusType.CONCEPT_GEWIJZIGD;
        }

        if (reviewStatus) {
            const updateReviewStatusesQuery = `
            ${PREFIX.ext}
            ${PREFIX.lpdcExt}
            ${PREFIX.dct}
            
            DELETE {
                GRAPH ?g {
                    ?service ext:reviewStatus ?status.
                }
            }
            INSERT {
                GRAPH ?g {
                    ?service ext:reviewStatus ${NS.concepts.reviewStatus(reviewStatus)}.
                }
            }
            WHERE {
                GRAPH ?g {
                    ?service a lpdcExt:InstancePublicService;
                        dct:source ${sparqlEscapeUri(conceptId)}.
                    OPTIONAL {
                        ?service ext:reviewStatus ?status.
                    }    
                }
            }`;
            await this.querying.deleteInsert(updateReviewStatusesQuery);
        }
    }

    async exists(bestuurseenheid: Bestuurseenheid, instanceId: Iri): Promise<boolean> {
        const query = `
            ${PREFIX.lpdcExt}
            ASK WHERE {
                GRAPH <${bestuurseenheid.userGraph()}> {
                    ${sparqlEscapeUri(instanceId)} a lpdcExt:InstancePublicService .
                }
            }
        `;
        return this.querying.ask(query);
    }

    //TODO LPDC-1236: can remove method
    async isDeleted(bestuurseenheid: Bestuurseenheid, instanceId: Iri): Promise<boolean> {
        const query = `
            ${PREFIX.as}
            ASK WHERE {
                GRAPH <${bestuurseenheid.userGraph()}> {
                    ${sparqlEscapeUri(instanceId)} a as:Tombstone .
                }
            }
        `;
        return this.querying.ask(query);
    }

    //TODO LPDC-1236: remove recreate ; we can use save a new one...
    async recreate(bestuurseenheid: Bestuurseenheid, instance: Instance): Promise<void> {
        const quads = new DomainToQuadsMapper(bestuurseenheid.userGraph()).instanceToQuads(instance).map(s => s.toNT());

        const query = `
        ${PREFIX.as}
        ${PREFIX.lpdcExt}
        ${PREFIX.rdf}
        ${PREFIX.schema}
        WITH ${sparqlEscapeUri(bestuurseenheid.userGraph())}
        DELETE {
                ${sparqlEscapeUri(instance.id)} a as:Tombstone.
                ${sparqlEscapeUri(instance.id)} as:formerType lpdcExt:InstancePublicService.
                ${sparqlEscapeUri(instance.id)} as:deleted ?deleteTime.
        }            
        INSERT { 
                ${quads.join("\n")}        
        }     
        WHERE {
               ${sparqlEscapeUri(instance.id)} a as:Tombstone.
               ${sparqlEscapeUri(instance.id)} as:deleted ?deleteTime.
        }
            
        `;
        await this.querying.deleteInsert(query);
    }

    async syncNeedsConversionFromFormalToInformal(bestuurseenheid: Bestuurseenheid, chosenType: ChosenFormType) {
        const now = new Date();

        const query = `
        ${PREFIX.lpdcExt}
        WITH ${sparqlEscapeUri(bestuurseenheid.userGraph())}
        
        DELETE {
           ?instance lpdcExt:needsConversionFromFormalToInformal """false"""^^<http://www.w3.org/2001/XMLSchema#boolean>;
                     <${NS.schema('dateModified').value}> ?previousDateModified.
        }
        INSERT { 
            ?instance lpdcExt:needsConversionFromFormalToInformal """true"""^^<http://www.w3.org/2001/XMLSchema#boolean>;
                    <${NS.schema('dateModified').value}> ${sparqlEscapeDateTime(now)}.     
        }     
        WHERE {
            ?instance a lpdcExt:InstancePublicService;
                   lpdcExt:dutchLanguageVariant ?variant;
                   <${NS.schema('dateModified').value}> ?previousDateModified .
            FILTER (?variant != "nl-be-x-informal" && CONCAT("nl-be-x-", "${chosenType}") = "nl-be-x-informal")
        }
           
        `;
        await this.querying.deleteInsert(query);

    }
}
