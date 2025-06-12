import { PersoonRepository } from "../../core/port/driven/persistence/persoon-repository";
import { Iri } from "../../core/domain/shared/iri";
import { sparqlEscapeUri } from "../../../mu-helper";
import { SparqlQuerying } from "./sparql-querying";
import { PREFIX } from "../../../config";
import { NotFoundError } from "../../core/domain/shared/lpdc-error";

export class PersoonSparqlRepository implements PersoonRepository {
  protected readonly querying: SparqlQuerying;

  constructor(endpoint?: string) {
    this.querying = new SparqlQuerying(endpoint);
  }

  async findByAccountId(accountId: Iri, bestuurseenheidId: Iri): Promise<Iri> {
    const bestuurseenheidUuid = bestuurseenheidId.value.replace(
      "http://data.lblod.info/id/bestuurseenheden/",
      ""
    );
    const orgGraph = `http://mu.semte.ch/graphs/organizations/${bestuurseenheidUuid}`;

    const query = `
            ${PREFIX.foaf}

            SELECT ?persoon WHERE {
              GRAPH ${sparqlEscapeUri(orgGraph)} {
                ?persoon foaf:account ${sparqlEscapeUri(accountId.value)} .
              }
            }
        `;

    const results = await this.querying.singleRow(query);

    if (!results) {
      throw new NotFoundError(`Geen persoon gevonden voor iri: ${accountId}`);
    }

    return new Iri(results["persoon"].value);
  }
}
