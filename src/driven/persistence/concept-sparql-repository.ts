import {ConceptRepository} from "../../core/port/driven/persistence/concept-repository";
import {SparqlQuerying} from "./sparql-querying";
import {DatastoreToQuadsRecursiveSparqlFetcher} from "./datastore-to-quads-recursive-sparql-fetcher";
import {Iri} from "../../core/domain/shared/iri";
import {Concept} from "../../core/domain/concept";
import {CONCEPT_GRAPH, PREFIX} from "../../../config";
import {LoggingDoubleQuadReporter, QuadsToDomainMapper} from "./quads-to-domain-mapper";
import {NS} from "./namespaces";
import {sparqlEscapeUri} from "../../../mu-helper";
import {DomainToQuadsMapper} from "./domain-to-quads-mapper";
import {Logger} from "../../../platform/logger";
import {isEqual} from "lodash";
import {SystemError} from "../../core/domain/shared/lpdc-error";

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
            ],
            [
                NS.skos('Concept').value,
                NS.lpdcExt('ConceptDisplayConfiguration').value,
                NS.besluit('Bestuurseenheid').value,
                NS.m8g('PublicOrganisation').value,
            ]);
        const mapper = new QuadsToDomainMapper(quads, new Iri(CONCEPT_GRAPH), new LoggingDoubleQuadReporter(new Logger('Concept-QuadsToDomainLogger')));

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
        const triples = new DomainToQuadsMapper(new Iri(CONCEPT_GRAPH)).conceptToQuads(concept).map(s => s.toNT());

        const query = `
            INSERT DATA { 
                GRAPH <${CONCEPT_GRAPH}> {
                    ${triples.join("\n")}
                }
            }
        `;

        await this.querying.insert(query);
    }

    async update(concept: Concept, old: Concept): Promise<void> {
        const oldTriples = new DomainToQuadsMapper(new Iri(CONCEPT_GRAPH)).conceptToQuads(old).map(s => s.toNT());
        const newTriples = new DomainToQuadsMapper(new Iri(CONCEPT_GRAPH)).conceptToQuads(concept).map(s => s.toNT());

        // Virtuoso bug: when triples/quads in delete part and insert part of query are exactly the same, virtuoso will only execute the delete, hence all data will be deleted.
        if (isEqual(oldTriples, newTriples)) {
            throw new SystemError('Geen wijzigingen');
        }

        const query = `
            WITH <${CONCEPT_GRAPH}>
            DELETE {
                ${[...oldTriples].join('\n')}
            }
            INSERT {
                ${[...newTriples].join('\n')}
            }
        `;

        await this.querying.deleteInsert(query);
    }
}