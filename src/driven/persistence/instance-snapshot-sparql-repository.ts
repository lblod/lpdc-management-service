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

    errorIfNoInstanceSnapshotGraph(instanceSnapshotGraph: Iri): void {
        if(!instanceSnapshotGraph.value.startsWith(INSTANCE_SNAPHOT_LDES_GRAPH())) {
            throw new SystemError(`Kan Instance Snapshots niet opzoeken in graph <${instanceSnapshotGraph.value}>`);
        }
    }

}
