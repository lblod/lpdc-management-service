import {Iri} from "../../core/domain/shared/iri";
import {InstanceRepository} from "../../core/port/driven/persistence/instance-repository";
import {SparqlQuerying} from "./sparql-querying";
import {PREFIX} from "../../../config";
import {sparqlEscapeDateTime, sparqlEscapeUri} from "../../../mu-helper";
import {Instance} from "../../core/domain/instance";
import {DatastoreToQuadsRecursiveSparqlFetcher} from "./datastore-to-quads-recursive-sparql-fetcher";
import {DomainToTriplesMapper} from "./domain-to-triples-mapper";
import {Bestuurseenheid} from "../../core/domain/bestuurseenheid";
import {QuadsToDomainMapper} from "./quads-to-domain-mapper";
import {NS} from "./namespaces";
import {InstanceReviewStatusType} from "../../core/domain/types";

export class InstanceSparqlRepository implements InstanceRepository {
    protected readonly querying: SparqlQuerying;
    protected readonly fetcher: DatastoreToQuadsRecursiveSparqlFetcher;

    constructor(endpoint?: string) {
        this.querying = new SparqlQuerying(endpoint);
        this.fetcher = new DatastoreToQuadsRecursiveSparqlFetcher(endpoint);
    }

    async findById(bestuurseenheid: Bestuurseenheid, id: Iri): Promise<Instance> {


        const quads = await this.fetcher.fetch(
            bestuurseenheid.userGraph(),
            id,
            //TODO LPDC-917: add a list of predicatesToNotQuery
            [],
            //TODO LPDC-917: add a list of predicatesToStopRecursion
            [],
            //TODO LPDC-917: add a list of illegalTypesToRecurseInto
            []);

        const mapper = new QuadsToDomainMapper(quads, bestuurseenheid.userGraph());

        return mapper.instance(id);

    }

    async save(bestuurseenheid: Bestuurseenheid, instance: Instance): Promise<void> {
        const triples = new DomainToTriplesMapper(bestuurseenheid.userGraph()).instanceToTriples(instance).map(s => s.toNT());

        const query = `
            INSERT DATA { 
                GRAPH ${sparqlEscapeUri(bestuurseenheid.userGraph())} {
                    ${triples.join("\n")}
                }
            }
        `;
        await this.querying.update(query);
    }

    async delete(bestuurseenheid: Bestuurseenheid, id: Iri): Promise<void> {
        const instance = await this.findById(bestuurseenheid, id);
        if (instance != undefined) {
            const triples = new DomainToTriplesMapper(bestuurseenheid.userGraph()).instanceToTriples(instance).map(s => s.toNT());

            const now = new Date();
            //TODO: add publicatieStatus + api testen
            const query = `
                ${PREFIX.as}
                ${PREFIX.cpsv}
                
                DELETE DATA FROM ${sparqlEscapeUri(bestuurseenheid.userGraph())}{
                    ${triples.join("\n")}
                };

                INSERT DATA {
                    GRAPH ${sparqlEscapeUri(bestuurseenheid.userGraph())}{
                        ${sparqlEscapeUri(instance.id)} a  as:Tombstone;
                        as:formerType cpsv:PublicService;
                        as:deleted ${sparqlEscapeDateTime(now)}.
                   }   
                }
            `;
            await this.querying.update(query);
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
            ${PREFIX.cpsv}
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
                    ?service a cpsv:PublicService;
                        <http://purl.org/dc/terms/source> ${sparqlEscapeUri(conceptId)}.
                }
            }`;
            await this.querying.update(updateReviewStatusesQuery);
        }
    }

    asTurtleFormat(bestuurseenheid: Bestuurseenheid, instance: Instance): string[] {
        return new DomainToTriplesMapper(bestuurseenheid.userGraph()).instanceToTriples(instance).map(s => s.toNT());
    }


}