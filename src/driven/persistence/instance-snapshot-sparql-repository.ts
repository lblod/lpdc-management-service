import {InstanceSnapshot} from "../../core/domain/instance-snapshot";
import {Iri} from "../../core/domain/shared/iri";
import {InstanceSnapshotRepository} from "../../core/port/driven/persistence/instance-snapshot-repository";
import {SparqlQuerying} from "./sparql-querying";
import {DatastoreToQuadsRecursiveSparqlFetcher} from "./datastore-to-quads-recursive-sparql-fetcher";
import {DoubleQuadReporter, LoggingDoubleQuadReporter, QuadsToDomainMapper} from "../shared/quads-to-domain-mapper";
import {Logger} from "../../../platform/logger";
import {NS} from "./namespaces";
import {sparqlEscapeUri} from "../../../mu-helper";
import {INSTANCE_SNAPHOT_LDES_GRAPH} from "../../../config";
import {SystemError} from "../../core/domain/shared/lpdc-error";

export class InstanceSnapshotSparqlRepository implements InstanceSnapshotRepository {

    protected readonly querying: SparqlQuerying;
    protected readonly fetcher: DatastoreToQuadsRecursiveSparqlFetcher;
    protected doubleQuadReporter: DoubleQuadReporter = new LoggingDoubleQuadReporter(new Logger('InstanceSnapshot-QuadsToDomainLogger'));

    constructor(endpoint?: string, doubleQuadReporter?: DoubleQuadReporter) {
        this.querying = new SparqlQuerying(endpoint);
        this.fetcher = new DatastoreToQuadsRecursiveSparqlFetcher(endpoint);
        if (doubleQuadReporter) {
            this.doubleQuadReporter = doubleQuadReporter;
        }
    }

    async findById(instanceSnapshotGraph: Iri, id: Iri): Promise<InstanceSnapshot> {
        this.errorIfNoInstanceSnapshotGraph(instanceSnapshotGraph);

        const quads = await this.fetcher.fetch(
            instanceSnapshotGraph,
            id,
            [],
            [
                NS.pav('createdBy').value,
                NS.dct("type").value,
                NS.lpdcExt('targetAudience').value,
                NS.m8g('thematicArea').value,
                NS.lpdcExt('competentAuthorityLevel').value,
                NS.m8g('hasCompetentAuthority').value,
                NS.lpdcExt('executingAuthorityLevel').value,
                NS.lpdcExt('hasExecutingAuthority').value,
                NS.lpdcExt('publicationMedium').value,
                NS.lpdcExt('yourEuropeCategory').value,
                NS.dct('language').value,
                NS.dct('isVersionOf').value,
                NS.dct('spatial').value,
                NS.lpdcExt("conceptTag").value,
                NS.adms('status').value,
                NS.ext('hasVersionedSource').value,
                NS.dct('source').value,
            ],
            [
                NS.skos('Concept').value,
                NS.lpdcExt('ConceptDisplayConfiguration').value,
                NS.besluit('Bestuurseenheid').value,
                NS.m8g('PublicOrganisation').value,
                NS.lpdcExt('InstancePublicService').value,
                NS.lpdcExt('ConceptualPublicService').value,
                NS.lpdcExt('ConceptualPublicServiceSnapshot').value,
            ]);

        const mapper = new QuadsToDomainMapper(quads, instanceSnapshotGraph, this.doubleQuadReporter);

        return mapper.instanceSnapshot(id);
    }

    async findToProcessInstanceSnapshots(): Promise<{ bestuurseenheidId: Iri, instanceSnapshotGraph: Iri, instanceSnapshotId: Iri }[]> {
        const query = `
            SELECT ?instanceSnapshotIri ?createdBy ?instanceSnapshotGraph WHERE {
                GRAPH ?instanceSnapshotGraph {
                     ?instanceSnapshotIri a <https://productencatalogus.data.vlaanderen.be/ns/ipdc-lpdc#InstancePublicServiceSnapshot> .
                     ?instanceSnapshotIri <http://purl.org/pav/createdBy> ?createdBy .
                     ?instanceSnapshotIri <http://www.w3.org/ns/prov#generatedAtTime> ?generatedAtTime .
                }
                FILTER(STRSTARTS(STR(?instanceSnapshotGraph), "${INSTANCE_SNAPHOT_LDES_GRAPH()}"))
                FILTER NOT EXISTS {
                    GRAPH ?instanceSnapshotGraph {
                        <http://mu.semte.ch/lpdc/instancesnapshots-ldes-data> <http://mu.semte.ch/vocabularies/ext/processed> ?instanceSnapshotIri .
                    }
                }
            } ORDER BY ?generatedAtTime
        `;

        const result = await this.querying.list(query);

        return result.map(item => ({
            bestuurseenheidId: new Iri(item['createdBy'].value),
            instanceSnapshotGraph: new Iri(item['instanceSnapshotGraph'].value),
            instanceSnapshotId: new Iri(item['instanceSnapshotIri'].value)
        }));
    }

    async addToProcessedInstanceSnapshots(instanceSnapshotGraph: Iri, instanceSnapshotId: Iri): Promise<void> {
        this.errorIfNoInstanceSnapshotGraph(instanceSnapshotGraph);
        const query = `
            INSERT DATA {
                GRAPH ${sparqlEscapeUri(instanceSnapshotGraph)} {
                    <http://mu.semte.ch/lpdc/instancesnapshots-ldes-data> <http://mu.semte.ch/vocabularies/ext/processed> ${sparqlEscapeUri(instanceSnapshotId)} .
                }
            }
        `;
        await this.querying.insert(query);
    }

    async hasNewerProcessedInstanceSnapshot(instanceSnapshotGraph: Iri, instanceSnapshot: InstanceSnapshot): Promise<boolean> {
        this.errorIfNoInstanceSnapshotGraph(instanceSnapshotGraph);
        const query = `
            ASK WHERE {
                GRAPH ${sparqlEscapeUri(instanceSnapshotGraph)} {
                       ?instanceSnapshotIri a <https://productencatalogus.data.vlaanderen.be/ns/ipdc-lpdc#InstancePublicServiceSnapshot> .
                       ?instanceSnapshotIri <http://www.w3.org/ns/prov#generatedAtTime> ?generatedAtTime .
                       ?instanceSnapshotIri <http://purl.org/dc/terms/isVersionOf> ?instance.

               FILTER (?generatedAtTime > "${instanceSnapshot.generatedAtTime.value}"^^<http://www.w3.org/2001/XMLSchema#dateTime>)
               FILTER (?instanceSnapshotIri != ${sparqlEscapeUri(instanceSnapshot.id)})
               FILTER (?instance = ${sparqlEscapeUri(instanceSnapshot.isVersionOfInstance)})
               FILTER EXISTS {
                    GRAPH ${sparqlEscapeUri(instanceSnapshotGraph)} {
                            <http://mu.semte.ch/lpdc/instancesnapshots-ldes-data> <http://mu.semte.ch/vocabularies/ext/processed> ?instanceSnapshotIri .
                    }
               }
            }
            }
        `;

        return this.querying.ask(query);
    }

    errorIfNoInstanceSnapshotGraph(instanceSnapshotGraph: Iri): void {
        if(!instanceSnapshotGraph.value.startsWith(INSTANCE_SNAPHOT_LDES_GRAPH())) {
            throw new SystemError(`Kan Instance Snapshots niet opzoeken in graph <${instanceSnapshotGraph.value}>`);
        }
    }

}
