import {Bestuurseenheid} from "../../core/domain/bestuurseenheid";
import {InstanceSnapshot} from "../../core/domain/instance-snapshot";
import {Iri} from "../../core/domain/shared/iri";
import {InstanceSnapshotRepository} from "../../core/port/driven/persistence/instance-snapshot-repository";
import {SparqlQuerying} from "./sparql-querying";
import {DatastoreToQuadsRecursiveSparqlFetcher} from "./datastore-to-quads-recursive-sparql-fetcher";
import {DoubleQuadReporter, LoggingDoubleQuadReporter, QuadsToDomainMapper} from "./quads-to-domain-mapper";
import {Logger} from "../../../platform/logger";
import {NS} from "./namespaces";

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

        return mapper.instanceSnapshot(id);
    }

}