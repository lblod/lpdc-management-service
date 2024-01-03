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
        const quads = await this.fetcher.fetch(
            CONCEPT_GRAPH,
            id,
            [
                NS.lpdcExt('hasConceptDisplayConfiguration').value,
            ],
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
            ],
            [
                NS.skos('Concept').value,
                NS.lpdcExt('ConceptDisplayConfiguration').value,
                NS.besluit('Bestuurseenheid').value,
                NS.m8g('PublicOrganisation').value,
                NS.eli('LegalResource').value,
                NS.eliIncorrectlyInDatabase('LegalResource').value,
            ]);
        const mapper = new QuadsToDomainMapper(quads, CONCEPT_GRAPH);

        return mapper.concept(id);
    }

}