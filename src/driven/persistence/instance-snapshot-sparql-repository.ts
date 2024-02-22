import {Bestuurseenheid} from "../../core/domain/bestuurseenheid";
import {InstanceSnapshot} from "../../core/domain/instance-snapshot";
import {Iri} from "../../core/domain/shared/iri";
import {InstanceSnapshotRepository} from "../../core/port/driven/persistence/instance-snapshot-repository";
import {SparqlQuerying} from "./sparql-querying";
import {DatastoreToQuadsRecursiveSparqlFetcher} from "./datastore-to-quads-recursive-sparql-fetcher";
import {DoubleQuadReporter, LoggingDoubleQuadReporter, QuadsToDomainMapper} from "./quads-to-domain-mapper";
import {Logger} from "../../../platform/logger";
import {NS} from "./namespaces";
import {sparqlEscapeUri} from "../../../mu-helper";
import {FormatPreservingDate} from "../../core/domain/format-preserving-date";

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

    async findById(bestuurseenheid: Bestuurseenheid, id: Iri): Promise<InstanceSnapshot> {
        const quads = await this.fetcher.fetch(
            bestuurseenheid.instanceSnapshotsLdesDataGraph(),
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
                NS.dct('isVersionOf').value,
            ],
            [
                NS.skos('Concept').value,
                NS.lpdcExt('ConceptDisplayConfiguration').value,
                NS.besluit('Bestuurseenheid').value,
                NS.m8g('PublicOrganisation').value,
                NS.eli('LegalResource').value,
                NS.eliIncorrectlyInDatabase('LegalResource').value,
            ]);

        const mapper = new QuadsToDomainMapper(quads, bestuurseenheid.instanceSnapshotsLdesDataGraph(), this.doubleQuadReporter);
        //TODO LPDC-910: validate that the created by is equal to the bestuurseenheid

        // TODO LPDC-910 validate createdBy is same bestuurseenheid as graph

        return mapper.instanceSnapshot(id);
    }

    async findToProcessInstanceSnapshots(): Promise<{ bestuurseenheidId: Iri, instanceSnapshotId: Iri }[]> {
        const query = `
            SELECT ?instanceSnapshotIri ?createdBy WHERE {
                GRAPH ?graph {
                     ?instanceSnapshotIri a <http://purl.org/vocab/cpsv#PublicService> .
                     ?instanceSnapshotIri <http://purl.org/pav/createdBy> ?createdBy .
                     ?instanceSnapshotIri <http://www.w3.org/ns/prov#generatedAtTime> ?generatedAtTime .
                }
                FILTER(STRSTARTS(STR(?graph), "http://mu.semte.ch/graphs/lpdc/instancesnapshots-ldes-data/"))
                FILTER NOT EXISTS {
                    GRAPH ?graph {
                        <http://mu.semte.ch/lpdc/instancesnapshots-ldes-data> <http://mu.semte.ch/vocabularies/ext/processed> ?instanceSnapshotIri .
                    }
                }
            } ORDER BY ?generatedAtTime
        `;

        const result = await this.querying.list(query);

        return result.map(item => ({
            bestuurseenheidId: new Iri(item['createdBy'].value),
            instanceSnapshotId: new Iri(item['instanceSnapshotIri'].value)
        }));
    }

    async addToProcessedInstanceSnapshots(bestuurseenheid: Bestuurseenheid, instanceSnapshotId: Iri): Promise<void> {
        const query = `
            INSERT DATA {
                GRAPH <${bestuurseenheid.instanceSnapshotsLdesDataGraph()}> {
                    <http://mu.semte.ch/lpdc/instancesnapshots-ldes-data> <http://mu.semte.ch/vocabularies/ext/processed> ${sparqlEscapeUri(instanceSnapshotId)} .
                }
            }
        `;
        await this.querying.insert(query);
    }

    async hasNewerProcessedInstanceSnapshot(bestuurseenheid: Bestuurseenheid, instanceSnaphotId: Iri, generatedAtTime: FormatPreservingDate): Promise<boolean> {
        const query = `
            ASK WHERE {
                GRAPH <${bestuurseenheid.instanceSnapshotsLdesDataGraph()}> {
                       ?instanceSnapshotIri a <http://purl.org/vocab/cpsv#PublicService> .
                       ?instanceSnapshotIri <http://www.w3.org/ns/prov#generatedAtTime> ?generatedAtTime .

               FILTER (?generatedAtTime > "${generatedAtTime.value}"^^<http://www.w3.org/2001/XMLSchema#dateTime>)
               FILTER (?instanceSnapshotIri != <${instanceSnaphotId}>)
               FILTER EXISTS {
                    GRAPH <${bestuurseenheid.instanceSnapshotsLdesDataGraph()}> {
                            <http://mu.semte.ch/lpdc/instancesnapshots-ldes-data> <http://mu.semte.ch/vocabularies/ext/processed> ?instanceSnapshotIri .
                    }
               }
            }
            }
        `;

        return this.querying.ask(query);
    }
}
