import {Iri} from "../../core/domain/shared/iri";
import {VersionedLdesSnapshot} from "../../core/domain/versioned-ldes-snapshot";
import {
    SnapshotType,
    VersionedLdesSnapshotRepository
} from "../../core/port/driven/persistence/versioned-ldes-snapshot-repository";
import {sparqlEscapeString, sparqlEscapeUri, uuid} from "mu";
import {SparqlQuerying} from "./sparql-querying";
import {DirectDatabaseAccess} from "../../../test/driven/persistence/direct-database-access";
import {FormatPreservingDate} from "../../core/domain/format-preserving-date";


export class VersionedLdesSnapshotSparqlRepository implements VersionedLdesSnapshotRepository {

    private readonly directDatabaseAccess: DirectDatabaseAccess;
    private readonly querying: SparqlQuerying;

    constructor(endpoint?: string) {
        this.directDatabaseAccess = new DirectDatabaseAccess(endpoint);
        this.querying = new SparqlQuerying(endpoint);
    }

    async findToProcessSnapshots(snapshotType: SnapshotType): Promise<{ snapshotGraph: Iri; snapshotId: Iri; }[]> {
        const query = `
            SELECT ?snapshotGraph ?snapshotIri WHERE {
                GRAPH ?snapshotGraph {
                     ?snapshotIri a ${sparqlEscapeUri(snapshotType)} .
                     ?snapshotIri <http://www.w3.org/ns/prov#generatedAtTime> ?generatedAtTime .
                }
                FILTER NOT EXISTS {
                     GRAPH ?snapshotGraph {
                        ?marker a <https://productencatalogus.data.vlaanderen.be/ns/ipdc-lpdc#VersionedLdesSnapshotProcessedMarker> .
                        ?marker <http://mu.semte.ch/vocabularies/ext/processedSnapshot> ?snapshotIri .
                    }
                }
            } ORDER BY ?generatedAtTime
        `;

        const result = await this.querying.list(query);

        return result.map(item => ({
            snapshotGraph: new Iri(item['snapshotGraph'].value),
            snapshotId: new Iri(item['snapshotIri'].value)
        }));
    }

    async addToSuccessfullyProcessedSnapshots(snapshotGraph: Iri, snapshotId: Iri): Promise<void> {
        const markerId = new Iri(`http://data.lblod.info/id/versioned-ldes-snapshot-processed-marker/${uuid()}`);
        await this.directDatabaseAccess.insertData(snapshotGraph.value, [
            `${sparqlEscapeUri(markerId)} a <https://productencatalogus.data.vlaanderen.be/ns/ipdc-lpdc#VersionedLdesSnapshotProcessedMarker>`,
            `${sparqlEscapeUri(markerId)} <http://mu.semte.ch/vocabularies/ext/processedSnapshot> ${sparqlEscapeUri(snapshotId)}`,
            `${sparqlEscapeUri(markerId)} <http://schema.org/dateCreated> """${FormatPreservingDate.now().value}"""^^<http://www.w3.org/2001/XMLSchema#dateTime>`,
            `${sparqlEscapeUri(markerId)} <http://schema.org/status> "success"`,
        ], );
    }

    async addToFailedProcessedSnapshots(snapshotGraph: Iri, snapshotId: Iri, errorMessage: string): Promise<void> {
        const markerId = new Iri(`http://data.lblod.info/id/versioned-ldes-snapshot-processed-marker/${uuid()}`);
        await this.directDatabaseAccess.insertData(snapshotGraph.value, [
            `${sparqlEscapeUri(markerId)} a <https://productencatalogus.data.vlaanderen.be/ns/ipdc-lpdc#VersionedLdesSnapshotProcessedMarker>`,
            `${sparqlEscapeUri(markerId)} <http://mu.semte.ch/vocabularies/ext/processedSnapshot> ${sparqlEscapeUri(snapshotId)}`,
            `${sparqlEscapeUri(markerId)} <http://schema.org/dateCreated> """${FormatPreservingDate.now().value}"""^^<http://www.w3.org/2001/XMLSchema#dateTime>`,
            `${sparqlEscapeUri(markerId)} <http://schema.org/status> "failed"`,
            `${sparqlEscapeUri(markerId)} <http://schema.org/error> ${sparqlEscapeString(errorMessage)}`,
        ], );
    }

    async hasNewerProcessedSnapshot(snapshotGraph: Iri, snapshot: VersionedLdesSnapshot, snapshotType: SnapshotType): Promise<boolean> {
        const query = `
            ASK WHERE {
                GRAPH ${sparqlEscapeUri(snapshotGraph)} {
                       ?snapshotIri a ${sparqlEscapeUri(snapshotType)} .
                       ?snapshotIri <http://www.w3.org/ns/prov#generatedAtTime> ?generatedAtTime .
                       ?snapshotIri <http://purl.org/dc/terms/isVersionOf> ?resourceIri.

               FILTER (?generatedAtTime > "${snapshot.generatedAtTime.value}"^^<http://www.w3.org/2001/XMLSchema#dateTime>)
               FILTER (?snapshotIri != ${sparqlEscapeUri(snapshot.id)})
               FILTER (?resourceIri = ${sparqlEscapeUri(snapshot.isVersionOf)})
               FILTER EXISTS {
                    GRAPH ${sparqlEscapeUri(snapshotGraph)} {
                        ?marker a <https://productencatalogus.data.vlaanderen.be/ns/ipdc-lpdc#VersionedLdesSnapshotProcessedMarker> .
                        ?marker <http://mu.semte.ch/vocabularies/ext/processedSnapshot> ?snapshotIri .
                    }
               }
            }
            }
        `;

        return this.querying.ask(query);
    }

}
