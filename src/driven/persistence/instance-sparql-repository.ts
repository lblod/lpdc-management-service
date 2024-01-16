import {Iri} from "../../core/domain/shared/iri";
import {InstanceRepository} from "../../core/port/driven/persistence/instance-repository";
import {SparqlQuerying} from "./sparql-querying";
import {PREFIX} from "../../../config";
import {sparqlEscapeUri} from "../../../mu-helper";
import {Instance} from "../../core/domain/instance";
import {DatastoreToQuadsRecursiveSparqlFetcher} from "./datastore-to-quads-recursive-sparql-fetcher";
import {DomainToTriplesMapper} from "./domain-to-triples-mapper";
import {Bestuurseenheid} from "../../core/domain/bestuurseenheid";
import {QuadsToDomainMapper} from "./quads-to-domain-mapper";

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

    async updateReviewStatusesForInstances(conceptId: Iri, isConceptFunctionallyChanged: boolean, isConceptArchived: boolean): Promise<void> {
        let reviewStatus = undefined;
        if (isConceptArchived) {
            reviewStatus = 'http://lblod.data.gift/concepts/cf22e8d1-23c3-45da-89bc-00826eaf23c3';
        } else if (isConceptFunctionallyChanged) {
            reviewStatus = 'http://lblod.data.gift/concepts/5a3168e2-f39b-4b5d-8638-29f935023c83';
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
                    ?service ext:reviewStatus ${sparqlEscapeUri(reviewStatus)}.
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


}