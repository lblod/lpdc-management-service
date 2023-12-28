import {ConceptRepository} from "../../core/port/driven/persistence/concept-repository";
import {SparqlQuerying} from "./sparql-querying";
import {DatastoreToQuadsRecursiveSparqlFetcher} from "./datastore-to-quads-recursive-sparql-fetcher";
import {Iri} from "../../core/domain/shared/iri";
import {Concept} from "../../core/domain/concept";
import {CONCEPT_GRAPH} from "../../../config";
import {QuadsToDomainMapper} from "./quads-to-domain-mapper";

export class ConceptSparqlRepository implements ConceptRepository {

    protected readonly querying: SparqlQuerying;
    protected readonly fetcher: DatastoreToQuadsRecursiveSparqlFetcher;

    constructor(endpoint?: string) {
        this.querying = new SparqlQuerying(endpoint);
        this.fetcher = new DatastoreToQuadsRecursiveSparqlFetcher(endpoint);
    }

    async findById(id: Iri): Promise<Concept> {
        //TODO LPDC-916: we should restrict querying in this graph on type / and or predicate (because in this public graph there is a lot of other stuff we don't want to query up) ...
        const quads = await this.fetcher.fetch(CONCEPT_GRAPH, id);

        const mapper = new QuadsToDomainMapper(quads, CONCEPT_GRAPH);

        return mapper.concept(id);
    }

}