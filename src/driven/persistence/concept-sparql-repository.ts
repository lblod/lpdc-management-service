import {ConceptRepository} from "../../core/port/driven/persistence/concept-repository";
import {SparqlQuerying} from "./sparql-querying";
import {DatastoreToQuadsRecursiveSparqlFetcher} from "./datastore-to-quads-recursive-sparql-fetcher";
import {Iri} from "../../core/domain/shared/iri";
import {Concept} from "../../core/domain/concept";
import {CONCEPT_GRAPH, PREFIX} from "../../../config";
import {QuadsToDomainMapper} from "./quads-to-domain-mapper";
import {NS} from "./namespaces";
import {sparqlEscapeUri} from "../../../mu-helper";
import {DomainToTriplesMapper} from "./domain-to-triples-mapper";

export class ConceptSparqlRepository implements ConceptRepository {

    protected readonly querying: SparqlQuerying;
    protected readonly fetcher: DatastoreToQuadsRecursiveSparqlFetcher;

    constructor(endpoint?: string) {
        this.querying = new SparqlQuerying(endpoint);
        this.fetcher = new DatastoreToQuadsRecursiveSparqlFetcher(endpoint);
    }

    async findById(id: Iri): Promise<Concept> {
        const quads = await this.fetcher.fetch(
            new Iri(CONCEPT_GRAPH),
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
            ],
            [
                NS.skos('Concept').value,
                NS.lpdcExt('ConceptDisplayConfiguration').value,
                NS.besluit('Bestuurseenheid').value,
                NS.m8g('PublicOrganisation').value,
                NS.eli('LegalResource').value,
                NS.eliIncorrectlyInDatabase('LegalResource').value,
            ]);
        const mapper = new QuadsToDomainMapper(quads, new Iri(CONCEPT_GRAPH));

        return mapper.concept(id);
    }

    async exists(id: Iri): Promise<boolean> {
        const query = `
            ${PREFIX.lpdcExt}
            ASK WHERE {
                GRAPH <${CONCEPT_GRAPH}> {
                    ${sparqlEscapeUri(id)} a lpdcExt:ConceptualPublicService .
                }
            }
        `;
        return this.querying.ask(query);
    }

    async save(concept: Concept): Promise<void> {
        const triples = new DomainToTriplesMapper(new Iri(CONCEPT_GRAPH)).conceptToTriples(concept).map(s => s.toNT());

        const query = `
            INSERT DATA { 
                GRAPH <${CONCEPT_GRAPH}> {
                    ${triples.join("\n")}
                }
            }
        `;

        await this.querying.update(query);
    }

    async update(concept: Concept, old: Concept): Promise<void> {
        const oldTriples = new DomainToTriplesMapper(new Iri(CONCEPT_GRAPH)).conceptToTriples(old).map(s => s.toNT());
        const newTriples = new DomainToTriplesMapper(new Iri(CONCEPT_GRAPH)).conceptToTriples(concept).map(s => s.toNT());

        const query = `
            WITH <${CONCEPT_GRAPH}>
            DELETE {
                ${[...oldTriples].join('\n')}
            }
            INSERT {
                ${[...newTriples].join('\n')}
            }
        `;

        await this.querying.update(query);
    }

    asTurtleFormat(concept: Concept): string[] {
        return new DomainToTriplesMapper(new Iri(CONCEPT_GRAPH)).conceptToTriples(concept).map(s => s.toNT());
    }

    async conceptHasInstancesInBestuurseenheid(conceptId: Iri, bestuurseenheidsGraph:Iri): Promise<boolean> {
        const query = `
    ${PREFIX.cpsv}
    ${PREFIX.dct}
    ASK WHERE {
      GRAPH ${sparqlEscapeUri(bestuurseenheidsGraph)} {
        ?instance a cpsv:PublicService ;
          dct:source ${sparqlEscapeUri(conceptId)} .
      }
    }
  `;

        return this.querying.ask(query);
    }
}