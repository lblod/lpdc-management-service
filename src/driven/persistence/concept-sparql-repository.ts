import {ConceptRepository} from "../../core/port/driven/persistence/concept-repository";
import {SparqlQuerying} from "./sparql-querying";
import {DatastoreToQuadsRecursiveSparqlFetcher} from "./datastore-to-quads-recursive-sparql-fetcher";
import {Iri} from "../../core/domain/shared/iri";
import {Concept} from "../../core/domain/concept";
import {CONCEPT_GRAPH} from "../../../config";
import {QuadsToDomainMapper} from "./quads-to-domain-mapper";
import {NS} from "./namespaces";

export class ConceptSparqlRepository implements ConceptRepository {

    protected readonly querying: SparqlQuerying;
    protected readonly fetcher: DatastoreToQuadsRecursiveSparqlFetcher;

    constructor(endpoint?: string) {
        this.querying = new SparqlQuerying(endpoint);
        this.fetcher = new DatastoreToQuadsRecursiveSparqlFetcher(endpoint);
    }

    async findById(id: Iri): Promise<Concept> {
        //TODO LPDC-916: we should restrict querying in this graph on type / and or predicate (because in this public graph there is a lot of other stuff we don't want to query up) ...
        //TODO LPDC-916: add in the insertdata test, skos:Concepts for each of the relations (this will make the test fail)
        //TODO LPDC-916: then add here the stop recursions
        //TODO LPDC-916: same for https://productencatalogus.data.vlaanderen.be/ns/ipdc-lpdc#ConceptDisplayConfiguration
        const quads = await this.fetcher.fetch(CONCEPT_GRAPH,
            id,
            [],
            [
                NS.skos('Concept').value,
                NS.lpdcExt('ConceptDisplayConfiguration').value,
            ]);

        const mapper = new QuadsToDomainMapper(quads, CONCEPT_GRAPH);

        return mapper.concept(id);
    }

}