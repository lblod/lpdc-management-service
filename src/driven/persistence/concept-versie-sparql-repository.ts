import {SparqlQuerying} from "./sparql-querying";
import {ConceptVersieRepository} from "../../core/port/driven/persistence/concept-versie-repository";
import {ConceptVersie} from "../../core/domain/concept-versie";
import {Iri} from "../../core/domain/shared/iri";
import {DatastoreToQuadsRecursiveSparqlFetcher} from "./datastore-to-quads-recursive-sparql-fetcher";
import {QuadsToDomainMapper} from "./quads-to-domain-mapper";
import {NS} from "./namespaces";

export class ConceptVersieSparqlRepository implements ConceptVersieRepository {

    protected readonly querying: SparqlQuerying;
    protected readonly fetcher: DatastoreToQuadsRecursiveSparqlFetcher;

    constructor(endpoint?: string) {
        this.querying = new SparqlQuerying(endpoint);
        this.fetcher = new DatastoreToQuadsRecursiveSparqlFetcher(endpoint);
    }

    async findById(id: Iri): Promise<ConceptVersie> {
        const ldesDataGraph = 'http://mu.semte.ch/graphs/lpdc/ldes-data';

        const quads = await this.fetcher.fetch(
            ldesDataGraph,
            id,
            [],
            [],
            [
                NS.skos('Concept').value,
                NS.lpdcExt('ConceptDisplayConfiguration').value,
                NS.besluit('bestuurseenheid').value,
                NS.m8g('PublicOrganisation').value
            ]);

        const mapper = new QuadsToDomainMapper(quads, ldesDataGraph);

        return mapper.conceptVersie(id);
    }

}
