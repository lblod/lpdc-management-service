import {
    BestuurseenheidClassificatieCodeUri,
    BestuurseenheidSparqlRepository
} from "../../../src/driven/persistence/bestuurseenheid-sparql-repository";
import {Bestuurseenheid, BestuurseenheidClassificatieCode} from "../../../src/core/domain/bestuurseenheid";
import {PREFIX, PUBLIC_GRAPH} from "../../../config";
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
            ${PREFIX.mu}
            
            INSERT DATA { 
                GRAPH ${sparqlEscapeUri(PUBLIC_GRAPH)} {
                    ${sparqlEscapeUri(bestuurseenheid.id)} a besluit:Bestuurseenheid .
                    ${sparqlEscapeUri(bestuurseenheid.id)} skos:prefLabel ${sparqlEscapeString(bestuurseenheid.prefLabel)} .
                    ${classificatieUri ? `${sparqlEscapeUri(bestuurseenheid.id)} besluit:classificatie ${sparqlEscapeUri(classificatieUri)} .` : ''}
                    ${sparqlEscapeUri(bestuurseenheid.id)} mu:uuid ${sparqlEscapeString(bestuurseenheid.uuid)} .
                }
            }
        `;
        await this.querying.update(query);
    }

    mapBestuurseenheidClassificatieCodeToUri(classificatieCode: BestuurseenheidClassificatieCode | undefined): BestuurseenheidClassificatieCodeUri | undefined {
        if(!classificatieCode) {
            return undefined;
        }
        const key: string | undefined = Object.keys(BestuurseenheidClassificatieCode)
            .find(key => BestuurseenheidClassificatieCode[key] === classificatieCode);

        const classificatieCodeUri = BestuurseenheidClassificatieCodeUri[key];

        if (!classificatieCodeUri) {
            throw new Error(`No classification code uri found for: ${classificatieCode}`);
        }
        return classificatieCodeUri;
    }

}