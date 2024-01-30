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
import {Logger} from "../../../platform/logger";

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
                NS.m8g('hasLegalResource').value,
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
                NS.eli('LegalResource').value,
                NS.eliIncorrectlyInDatabase('LegalResource').value,
            ]);

        const mapper = new QuadsToDomainMapper(quads, bestuurseenheid.userGraph(), new Logger('Instance-QuadsToDomainLogger'));

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
        await this.querying.insert(query);
    }

    async delete(bestuurseenheid: Bestuurseenheid, id: Iri): Promise<void> {
        const instance = await this.findById(bestuurseenheid, id);
        if (instance != undefined) {
            const publicationStatus = instance.publicationStatus;

            if(!instance.isInDeletableState()){
                throw new Error(`Cannot delete a published instance`);
            }

            const triples = new DomainToTriplesMapper(bestuurseenheid.userGraph()).instanceToTriples(instance).map(s => s.toNT());

            const now = new Date();
            let query='';

            if(publicationStatus === undefined){
                query = `
                ${PREFIX.as}
                ${PREFIX.cpsv}
                
                DELETE DATA FROM ${sparqlEscapeUri(bestuurseenheid.userGraph())}{
                    ${triples.join("\n")}
                };
                `;

                await this.querying.delete(query);
            }
            else {
                query = `
                ${PREFIX.as}
                ${PREFIX.cpsv}
                ${PREFIX.schema}
                
                WITH ${sparqlEscapeUri(bestuurseenheid.userGraph())}
                DELETE {            
                    ${triples.join("\n")}
                }
                INSERT {
                    ${sparqlEscapeUri(instance.id)} a  as:Tombstone;
                    as:formerType cpsv:PublicService;
                    as:deleted ${sparqlEscapeDateTime(now)};
                    schema:publication ${NS.concepts.publicationStatus('te-herpubliceren')} .
                }`;

                await this.querying.deleteInsert(query);
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
            await this.querying.deleteInsert(updateReviewStatusesQuery);
        }
    }

    asTurtleFormat(bestuurseenheid: Bestuurseenheid, instance: Instance): string[] {
        return new DomainToTriplesMapper(bestuurseenheid.userGraph()).instanceToTriples(instance).map(s => s.toNT());
    }


}