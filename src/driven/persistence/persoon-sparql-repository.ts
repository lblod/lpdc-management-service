import { NUTS_VERSION, PREFIX, PUBLIC_GRAPH } from "../../../config";
import { extractResultsFromAllSettled } from "../../../platform/promises";
import { Iri } from "../../core/domain/shared/iri";
import { PersonRepository } from "../../core/port/driven/persistence/person-repository";
import { SparqlQuerying } from "./sparql-querying";
import { sparqlEscapeUri } from "../../../mu-helper";
import { NotFoundError } from "../../core/domain/shared/lpdc-error";
import { Person } from "../../core/domain/person";

export class SpatialSparqlRepository implements PersonRepository {
  protected readonly querying: SparqlQuerying;

  constructor(endpoint?: string) {
    this.querying = new SparqlQuerying(endpoint);
  }

  async findById(id: Iri): Promise<Person> {
    const query = `
      ${PREFIX.skos}
      ${PREFIX.time}
      ${PREFIX.mu}

      SELECT DISTINCT ?uri ?uuid ?prefLabel ?notation ?endDate
      WHERE {
        GRAPH ${sparqlEscapeUri(PUBLIC_GRAPH)} {
          ?uri a skos:Concept;
               skos:inScheme ${sparqlEscapeUri(NUTS_VERSION)};
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
      throw new NotFoundError(`No person found with URI: ${id}`);
    }


    return new Person(
      new Iri(queryResult["uri"].value),
      queryResult["uuid"].value,
    );
  }
}
