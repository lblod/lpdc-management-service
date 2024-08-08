import {
    BestuurseenheidClassificatieCodeUri,
    BestuurseenheidSparqlRepository
} from "../../../src/driven/persistence/bestuurseenheid-sparql-repository";
import {Bestuurseenheid, BestuurseenheidClassificatieCode} from "../../../src/core/domain/bestuurseenheid";
import {PREFIX, PUBLIC_GRAPH} from "../../../config";
import {sparqlEscapeString, sparqlEscapeUri, uuid} from "mu";
import {buildWerkingsgebiedenIri} from "../../core/domain/iri-test-builder";
import {NotFoundError} from "../../../src/core/domain/shared/lpdc-error";

export class BestuurseenheidSparqlTestRepository extends BestuurseenheidSparqlRepository {

    constructor(endpoint?: string) {
        super(endpoint);
    }

    async save(bestuurseenheid: Bestuurseenheid): Promise<void> {
        const classificatieUri = this.mapBestuurseenheidClassificatieCodeToUri(bestuurseenheid.classificatieCode);

        const werkingsgebiedenSpatials = bestuurseenheid.spatials.map(sp => [sp, buildWerkingsgebiedenIri(uuid())]);

        const query = `
            ${PREFIX.skos}
            ${PREFIX.besluit}
            ${PREFIX.mu}
            ${PREFIX.skos}
            ${PREFIX.nutss}
            
            INSERT DATA { 
                GRAPH ${sparqlEscapeUri(PUBLIC_GRAPH)} {
                    ${sparqlEscapeUri(bestuurseenheid.id)} a besluit:Bestuurseenheid .
                    ${sparqlEscapeUri(bestuurseenheid.id)} skos:prefLabel ${sparqlEscapeString(bestuurseenheid.prefLabel)} .
                    ${classificatieUri ? `${sparqlEscapeUri(bestuurseenheid.id)} besluit:classificatie ${sparqlEscapeUri(classificatieUri)} .` : ''}
                    ${sparqlEscapeUri(bestuurseenheid.id)} mu:uuid ${sparqlEscapeString(bestuurseenheid.uuid)} .
                    ${werkingsgebiedenSpatials.flatMap(wgs => [
                        `${sparqlEscapeUri(bestuurseenheid.id)} besluit:werkingsgebied ${sparqlEscapeUri(wgs[1])}`,
                        `${sparqlEscapeUri(wgs[1])} skos:exactMatch ${sparqlEscapeUri(wgs[0])}`,
                        `${sparqlEscapeUri(wgs[0])} skos:inScheme nutss:2021`,
        ]).join(' .\n')} .
                }
            }
        `;
        await this.querying.insert(query);
    }

    mapBestuurseenheidClassificatieCodeToUri(classificatieCode: BestuurseenheidClassificatieCode | undefined): BestuurseenheidClassificatieCodeUri | undefined {
        if (!classificatieCode) {
            return undefined;
        }
        const key: string | undefined = Object.keys(BestuurseenheidClassificatieCode)
            .find(key => BestuurseenheidClassificatieCode[key] === classificatieCode);

        const classificatieCodeUri = BestuurseenheidClassificatieCodeUri[key];

        if (!classificatieCodeUri) {
            throw new NotFoundError(`No classification code uri found for: ${classificatieCode}`);
        }
        return classificatieCodeUri;
    }

}
