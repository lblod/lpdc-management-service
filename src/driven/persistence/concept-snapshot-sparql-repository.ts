import {SparqlQuerying} from "./sparql-querying";
import {ConceptSnapshotRepository} from "../../core/port/driven/persistence/concept-snapshot-repository";
import {ConceptSnapshot} from "../../core/domain/concept-snapshot";
import {Iri} from "../../core/domain/shared/iri";
import {DatastoreToQuadsRecursiveSparqlFetcher} from "./datastore-to-quads-recursive-sparql-fetcher";
import {QuadsToDomainMapper} from "./quads-to-domain-mapper";
import {NS} from "./namespaces";

export class ConceptSnapshotSparqlRepository implements ConceptSnapshotRepository {

    protected readonly querying: SparqlQuerying;
    protected readonly fetcher: DatastoreToQuadsRecursiveSparqlFetcher;

    constructor(endpoint?: string) {
        this.querying = new SparqlQuerying(endpoint);
        this.fetcher = new DatastoreToQuadsRecursiveSparqlFetcher(endpoint);
    }

    async findById(id: Iri): Promise<ConceptSnapshot> {
        const ldesDataGraph = 'http://mu.semte.ch/graphs/lpdc/ldes-data';

        const quads = await this.fetcher.fetch(
            ldesDataGraph,
            id,
            [],
            [
                NS.m8g('hasLegalResource').value,
            ],
            [
                NS.skos('Concept').value,
                NS.lpdcExt('ConceptDisplayConfiguration').value,
                NS.besluit('bestuurseenheid').value,
                NS.m8g('PublicOrganisation').value,
                NS.eli('LegalResource').value,
                NS.eliIncorrectlyInDatabase('LegalResource').value,
            ]);

        const mapper = new QuadsToDomainMapper(quads, ldesDataGraph);

        return mapper.conceptSnapshot(id);
    }

}
