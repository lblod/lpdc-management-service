import {SparqlQuerying} from "./sparql-querying";
import {ConceptVersieRepository} from "../../core/port/driven/persistence/concept-versie-repository";
import {ConceptVersie} from "../../core/domain/concept-versie";
import {Iri} from "../../core/domain/shared/iri";
import {DatastoreToQuadsRecursiveSparqlFetcher} from "./datastore-to-quads-recursive-sparql-fetcher";
import {NAMESPACE, QuadsToDomainMapper} from "./quads-to-domain-mapper";
import {namedNode} from "rdflib";

export class ConceptVersieSparqlRepository implements ConceptVersieRepository {

    protected readonly querying: SparqlQuerying;
    protected readonly fetcher: DatastoreToQuadsRecursiveSparqlFetcher;

    constructor(endpoint?: string) {
        this.querying = new SparqlQuerying(endpoint);
        this.fetcher = new DatastoreToQuadsRecursiveSparqlFetcher(endpoint);
    }

    async findById(id: Iri): Promise<ConceptVersie> {
        const ldesDataGraph = 'http://mu.semte.ch/graphs/lpdc/ldes-data';

        const quads = await this.fetcher.fetch(ldesDataGraph, id);

        const mapper = new QuadsToDomainMapper(quads, ldesDataGraph);

        mapper.errorIfMissingOrIncorrectType(id, namedNode(NAMESPACE.lpdcExt('ConceptualPublicService').value));

        return new ConceptVersie(
            id,
            mapper.title(id),
            mapper.description(id),
            mapper.additionalDescription(id),
            mapper.exception(id),
            mapper.regulation(id),
            mapper.startDate(id),
            mapper.endDate(id),
            mapper.productType(id),
            mapper.targetAudiences(id),
            mapper.themes(id),
            mapper.competentAuthorityLevels(id),
            mapper.competentAuthorities(id),
            mapper.executingAuthorityLevels(id),
            mapper.executingAuthorities(id),
            mapper.publicationMedia(id),
            mapper.yourEuropeCategories(id),
            mapper.keywords(id),
            mapper.requirements(id),
            mapper.procedures(id),
            mapper.websites(id),
            mapper.costs(id),
            mapper.financialAdvantages(id),
        );
    }

}
