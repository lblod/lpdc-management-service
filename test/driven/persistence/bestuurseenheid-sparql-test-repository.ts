import {
    BestuurseenheidClassificatieCodeUri,
    BestuurseenheidSparqlRepository
} from "../../../src/driven/persistence/bestuurseenheid-sparql-repository";
import {Bestuurseenheid, BestuurseenheidClassificatieCode} from "../../../src/core/domain/bestuurseenheid";
import {PREFIX} from "../../../config";
import {sparqlEscapeString, sparqlEscapeUri} from "../../../mu-helper";

export class BestuurseenheidSparqlTestRepository extends BestuurseenheidSparqlRepository {

    constructor(endpoint?: string) {
        super(endpoint);
    }

    async save(bestuurseenheid: Bestuurseenheid): Promise<void> {
        const classificatieUri = this.mapBestuurseenheidClassificatieCodeToUri(bestuurseenheid.classificatieCode);
        const query = `
            ${PREFIX.skos}
            ${PREFIX.besluit}
            INSERT DATA { 
                GRAPH <http://mu.semte.ch/graphs/public> {
                    ${sparqlEscapeUri(bestuurseenheid.id)} a besluit:Bestuurseenheid .
                    ${sparqlEscapeUri(bestuurseenheid.id)} skos:prefLabel  ${sparqlEscapeString(bestuurseenheid.prefLabel)} .
                    ${sparqlEscapeUri(bestuurseenheid.id)} besluit:classificatie ${sparqlEscapeUri(classificatieUri)} .
                }
            }
        `;
        await this.update(query);
    }

    mapBestuurseenheidClassificatieCodeToUri(classificatieCode: BestuurseenheidClassificatieCode): BestuurseenheidClassificatieCodeUri {
        const key: string | undefined = Object.keys(BestuurseenheidClassificatieCode)
            .find(key => BestuurseenheidClassificatieCode[key] === classificatieCode);

        const classificatieCodeUri = BestuurseenheidClassificatieCodeUri[key];

        if (!classificatieCodeUri) {
            throw new Error(`No classification code uri found for: ${classificatieCode}`);
        }
        return classificatieCodeUri;


    }
}