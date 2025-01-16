import { SparqlQuerying } from "../../../src/driven/persistence/sparql-querying";
import { Iri } from "../../../src/core/domain/shared/iri";
import { NS } from "../../../src/driven/persistence/namespaces";
import { DatastoreToQuadsRecursiveSparqlFetcher } from "../../../src/driven/persistence/datastore-to-quads-recursive-sparql-fetcher";
import { Bestuurseenheid } from "../../../src/core/domain/bestuurseenheid";

export class PublishedInstanceSnapshotSparqlTestRepository {
  protected readonly querying: SparqlQuerying;
  protected readonly fetcher: DatastoreToQuadsRecursiveSparqlFetcher;

  constructor(endpoint?: string) {
    this.querying = new SparqlQuerying(endpoint);
    this.fetcher = new DatastoreToQuadsRecursiveSparqlFetcher(endpoint);
  }

  async findByInstanceId(
    bestuurseenheid: Bestuurseenheid,
    instanceId: Iri,
  ): Promise<Iri[]> {
    const query = `
            SELECT ?publishedInstanceSnapshotIri WHERE {
                GRAPH <${bestuurseenheid.userGraph()}> {
                    ?publishedInstanceSnapshotIri a ${NS.lpdcExt("PublishedInstancePublicServiceSnapshot")} .
                    ?publishedInstanceSnapshotIri ${NS.lpdcExt("isPublishedVersionOf")} <${instanceId}> .
                }
            }
        `;
    const ids = (await this.querying.list(query)).map(
      (item) => item["publishedInstanceSnapshotIri"].value,
    );
    return ids.map((id) => new Iri(id));
  }

  async findById(bestuurseenheid: Bestuurseenheid, id: Iri) {
    return this.fetcher.fetch(
      bestuurseenheid.userGraph(),
      id,
      [],
      [
        NS.pav("createdBy").value,
        NS.dct("type").value,
        NS.lpdcExt("targetAudience").value,
        NS.m8g("thematicArea").value,
        NS.lpdcExt("competentAuthorityLevel").value,
        NS.m8g("hasCompetentAuthority").value,
        NS.lpdcExt("executingAuthorityLevel").value,
        NS.lpdcExt("hasExecutingAuthority").value,
        NS.lpdcExt("publicationMedium").value,
        NS.lpdcExt("yourEuropeCategory").value,
        NS.dct("language").value,
        NS.dct("isVersionOf").value,
        NS.dct("spatial").value,
        NS.lpdcExt("conceptTag").value,
        NS.adms("status").value,
        NS.ext("hasVersionedSource").value,
        NS.dct("source").value,
        NS.lpdcExt("isPublishedVersionOf").value,
      ],
      [
        NS.skos("Concept").value,
        NS.lpdcExt("ConceptDisplayConfiguration").value,
        NS.besluit("Bestuurseenheid").value,
        NS.m8g("PublicOrganisation").value,
        NS.lpdcExt("ConceptualPublicService").value,
        NS.lpdcExt("ConceptualPublicServiceSnapshot").value,
      ],
    );
  }
}
