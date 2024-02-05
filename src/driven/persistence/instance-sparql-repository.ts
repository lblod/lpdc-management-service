import {Iri} from "../../core/domain/shared/iri";
import {InstanceRepository} from "../../core/port/driven/persistence/instance-repository";
import {SparqlQuerying} from "./sparql-querying";
import {PREFIX} from "../../../config";
import {sparqlEscapeDateTime, sparqlEscapeUri} from "../../../mu-helper";
import {Instance} from "../../core/domain/instance";
import {DatastoreToQuadsRecursiveSparqlFetcher} from "./datastore-to-quads-recursive-sparql-fetcher";
import {DomainToQuadsMapper} from "./domain-to-quads-mapper";
import {Bestuurseenheid} from "../../core/domain/bestuurseenheid";
import {DoubleQuadReporter, LoggingDoubleQuadReporter, QuadsToDomainMapper} from "./quads-to-domain-mapper";
import {NS} from "./namespaces";
import {InstanceReviewStatusType} from "../../core/domain/types";
import {Logger} from "../../../platform/logger";
import {literal} from "rdflib";
import LPDCError from "../../../platform/lpdc-error";
import {isEqual} from "lodash";

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

    async update(bestuurseenheid: Bestuurseenheid, instance: Instance, old: Instance): Promise<void> {
        const oldTriples = new DomainToQuadsMapper(bestuurseenheid.userGraph()).instanceToQuads(old).map(s => s.toNT());
        const newTriples = new DomainToQuadsMapper(bestuurseenheid.userGraph()).instanceToQuads(instance).map(s => s.toNT());

        // Virtuoso bug: when triples in delete part and insert part of query are exactly the same, virtuoso will only execute the delete, hence all data will be deleted.
        if (isEqual(oldTriples, newTriples)) {
            throw new Error('no change');
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
                <${instance.id}> <${NS.dct('modified').value}> ${literal(old.dateModified.value, NS.xsd('dateTime')).toNT()} .
            }
        `;

        await this.querying.deleteInsert(query, (deleteInsertResults: string[]) => {

            if (deleteInsertResults.length != 1) {
                throw new Error('Updating for more than 1 graph');
            }
            if (deleteInsertResults[0].includes("delete 0 (or less) and insert 0 (or less) triples")) {
                throw new LPDCError(400, "De productfiche is gelijktijdig aangepast door een andere gebruiker. Herlaad de pagina en geef je aanpassingen opnieuw in.");
            }
        });
    }

    async delete(bestuurseenheid: Bestuurseenheid, id: Iri): Promise<void> {
        const instance = await this.findById(bestuurseenheid, id);
        if (instance != undefined) {
            const publicationStatus = instance.publicationStatus;

            if (!instance.isInDeletableState()) {
                throw new Error(`Cannot delete a published instance`);
            }

            const triples = new DomainToQuadsMapper(bestuurseenheid.userGraph()).instanceToQuads(instance).map(s => s.toNT());

            const now = new Date();
            let query: string;

            if (publicationStatus === undefined) {
                query = `
                    ${PREFIX.as}
                    ${PREFIX.cpsv}
                
                DELETE
                    DATA FROM
                    ${sparqlEscapeUri(bestuurseenheid.userGraph())}
                    {
                    ${triples.join("\n")}
                    };
                `;

                await this.querying.delete(query);
            } else {
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

}