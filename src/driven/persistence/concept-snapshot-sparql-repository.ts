import {SparqlQuerying} from "./sparql-querying";
import {ConceptSnapshotRepository} from "../../core/port/driven/persistence/concept-snapshot-repository";
import {ConceptSnapshot} from "../../core/domain/concept-snapshot";
import {Iri} from "../../core/domain/shared/iri";
import {DatastoreToQuadsRecursiveSparqlFetcher} from "./datastore-to-quads-recursive-sparql-fetcher";
import {LoggingDoubleQuadReporter, QuadsToDomainMapper} from "../shared/quads-to-domain-mapper";
import {NS} from "./namespaces";
import {CONCEPT_SNAPSHOT_LDES_GRAPH} from "../../../config";
import {Logger} from "../../../platform/logger";

export class ConceptSnapshotSparqlRepository implements ConceptSnapshotRepository {

    protected readonly querying: SparqlQuerying;
    protected readonly fetcher: DatastoreToQuadsRecursiveSparqlFetcher;

    constructor(endpoint?: string) {
        this.querying = new SparqlQuerying(endpoint);
        this.fetcher = new DatastoreToQuadsRecursiveSparqlFetcher(endpoint);
    }

    async findById(id: Iri): Promise<ConceptSnapshot> {
        const ldesDataGraph = new Iri(CONCEPT_SNAPSHOT_LDES_GRAPH);

        const quads = await this.fetcher.fetch(
            ldesDataGraph,
            id,
            [],
            [],
            [
                NS.skos('Concept').value,
                NS.lpdcExt('ConceptDisplayConfiguration').value,
                NS.besluit('Bestuurseenheid').value,
                NS.m8g('PublicOrganisation').value,
            ]);

        const mapper = new QuadsToDomainMapper(quads, ldesDataGraph, new LoggingDoubleQuadReporter(new Logger('ConceptSnapshot-QuadsToDomainLogger')));

        return mapper.conceptSnapshot(id);
    }

}
