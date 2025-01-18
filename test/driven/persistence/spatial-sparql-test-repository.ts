import { PREFIX, PUBLIC_GRAPH } from "../../../config";
import { sparqlEscapeString, sparqlEscapeUri } from "../../../mu-helper";
import { Spatial } from "../../../src/core/domain/spatial";
import { SpatialSparqlRepository } from "../../../src/driven/persistence/spatial-sparql-repository";

export class SpatialSparqlTestRepository extends SpatialSparqlRepository {
  constructor(endpoint?: string) {
    super(endpoint);
  }

  async save(spatial: Spatial): Promise<void> {
    const dateString = spatial.endDate
      ? spatial.endDate.toLocaleDateString()
      : undefined;

    const query = `
    ${PREFIX.skos}
    ${PREFIX.nutss}
    ${PREFIX.time}
    ${PREFIX.mu}

    INSERT DATA {
      GRAPH ${sparqlEscapeUri(PUBLIC_GRAPH)} {
        ${sparqlEscapeUri(spatial.id)} a skos:Concept;
          mu:uuid ${sparqlEscapeString(spatial.uuid)};
          skos:prefLabel ${sparqlEscapeString(spatial.prefLabel)};
          skos:notation ${sparqlEscapeString(spatial.notation)};
          ${dateString ? `time:hasEnd ${sparqlEscapeString(dateString)};` : ""}
          skos:inScheme nutss:2024;
          skos:topConceptOf nutss:2024.
      }
    }
`;
    await this.querying.insert(query);
  }
}
