import {SparqlQuerying} from "./sparql-querying";
import {ConceptSnapshotRepository} from "../../core/port/driven/persistence/concept-snapshot-repository";
import {ConceptSnapshot} from "../../core/domain/concept-snapshot";
import {Iri} from "../../core/domain/shared/iri";
import {DatastoreToQuadsRecursiveSparqlFetcher} from "./datastore-to-quads-recursive-sparql-fetcher";
import {QuadsToDomainMapper} from "./quads-to-domain-mapper";
import {NS} from "./namespaces";
import {CONCEPT_SNAPSHOT_LDES_GRAPH, PREFIX} from "../../../config";
import {sparqlEscapeUri} from "../../../mu-helper";

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
            [
                NS.m8g('hasLegalResource').value,
            ],
            [
                NS.skos('Concept').value,
                NS.lpdcExt('ConceptDisplayConfiguration').value,
                NS.besluit('Bestuurseenheid').value,
                NS.m8g('PublicOrganisation').value,
                NS.eli('LegalResource').value,
                NS.eliIncorrectlyInDatabase('LegalResource').value,
            ]);

        const mapper = new QuadsToDomainMapper(quads, ldesDataGraph);

        return mapper.conceptSnapshot(id);
    }

    async exists(id: Iri): Promise<boolean> {
        const query = `
            ${PREFIX.lpdcExt}
            ASK WHERE {
                GRAPH ${sparqlEscapeUri(CONCEPT_SNAPSHOT_LDES_GRAPH)} {
                    ${sparqlEscapeUri(id)} a lpdcExt:ConceptualPublicService .
                }
            }
        `;
        return this.querying.ask(query);
    }


}
