import { PREFIX, PUBLIC_GRAPH } from "../../../config";
import { extractResultsFromAllSettled } from "../../../platform/promises";
import { Iri } from "../../core/domain/shared/iri";
import { SpatialRepository } from "../../core/port/driven/persistence/spatial-repository";
import { SparqlQuerying } from "./sparql-querying";
import { sparqlEscapeUri } from "../../../mu-helper";
import { Spatial } from "../../core/domain/spatial";
import { NotFoundError } from "../../core/domain/shared/lpdc-error";

export class SpatialSparqlRepository implements SpatialRepository {
  protected readonly querying: SparqlQuerying;

  constructor(endpoint?: string) {
    this.querying = new SparqlQuerying(endpoint);
  }

  async findById(id: Iri): Promise<Spatial> {
    const query = `
      ${PREFIX.skos}
      ${PREFIX.nutss}
      ${PREFIX.time}
      ${PREFIX.mu}

      SELECT DISTINCT ?uri ?uuid ?prefLabel ?notation ?endDate
      WHERE {
        GRAPH ${sparqlEscapeUri(PUBLIC_GRAPH)} {
          ?uri a skos:Concept;
               skos:inScheme nutss:2024;
               mu:uuid ?uuid;
               skos:prefLabel ?prefLabel;
               skos:notation ?notation.
          OPTIONAL {
            ?uri time:hasEnd ?endDate.
          }
        }
        VALUES ?uri {
          ${sparqlEscapeUri(id)}
        }
      }`;

    const [queryResult] = await extractResultsFromAllSettled([
      this.querying.singleRow(query),
    ]);

    if (!queryResult) {
      throw new NotFoundError(`No spatial resource found with URI: ${id}`);
    }

    const endDate = queryResult["endDate"]
      ? new Date(queryResult["endDate"].value)
      : undefined;

    return new Spatial(
      new Iri(queryResult["uri"].value),
      queryResult["uuid"].value,
      queryResult["prefLabel"].value,
      queryResult["notation"].value,
      endDate,
    );
  }
}
