import {BestuurseenheidRepository} from "../../core/port/driven/persistence/bestuurseenheid-repository";
import {Iri} from "../../core/domain/shared/iri";
import {Bestuurseenheid, BestuurseenheidClassificatieCode,} from "../../core/domain/bestuurseenheid";
import {sparqlEscapeUri} from "../../../mu-helper";
import {SparqlRepository} from "./sparql-repository";
import {PREFIX} from "../../../config";

export class BestuurseenheidSparqlRepository extends SparqlRepository implements BestuurseenheidRepository {

    constructor(endpoint?: string) {
        super(endpoint);
    }

    async findById(id: Iri): Promise<Bestuurseenheid> {
        const query = `
            ${PREFIX.skos}
            ${PREFIX.besluit}
            SELECT ?id ?prefLabel ?classificatieUri WHERE {
                GRAPH <http://mu.semte.ch/graphs/public> {
                    VALUES ?id {
                        ${sparqlEscapeUri(id)}
                    }
                    ?id a besluit:Bestuurseenheid .
                    ?id skos:prefLabel ?prefLabel .
                    ?id besluit:classificatie ?classificatieUri . 
                }
            }
        `;
        const result = await this.querySingleRow(query);

        if (!result) {
            throw new Error(`no bestuurseenheid found for iri: ${id}`);
        }

        return new Bestuurseenheid(
            result['id'].value,
            result['prefLabel'].value,
            this.mapBestuurseenheidClassificatieUriToCode(result['classificatieUri'].value)
        );
    }

    mapBestuurseenheidClassificatieUriToCode(classificatieCodeUri: BestuurseenheidClassificatieCodeUri): BestuurseenheidClassificatieCode {
        const key: string | undefined = Object.keys(BestuurseenheidClassificatieCodeUri)
            .find(key => BestuurseenheidClassificatieCodeUri[key] === classificatieCodeUri);

        const classificatieCode = BestuurseenheidClassificatieCode[key];

        if (!classificatieCode) {
            throw new Error(`No classification code found for: ${classificatieCodeUri}`);
        }
        return classificatieCode;
    }
}

export enum BestuurseenheidClassificatieCodeUri {
    PROVINCIE = "http://data.vlaanderen.be/id/concept/BestuurseenheidClassificatieCode/5ab0e9b8a3b2ca7c5e000000",
    GEMEENTE = "http://data.vlaanderen.be/id/concept/BestuurseenheidClassificatieCode/5ab0e9b8a3b2ca7c5e000001",
    OCMW = "http://data.vlaanderen.be/id/concept/BestuurseenheidClassificatieCode/5ab0e9b8a3b2ca7c5e000002",
    DISTRICT = "http://data.vlaanderen.be/id/concept/BestuurseenheidClassificatieCode/5ab0e9b8a3b2ca7c5e000003",
    INTERCOMMUNALE = "http://data.vlaanderen.be/id/concept/BestuurseenheidClassificatieCode/5ab0e9b8a3b2ca7c5e000004",
    INTERLOKAAL_SAMENWERKINGSVERBAND_ZONDER_RECHTSPERSOONLIJKHEID = "http://data.vlaanderen.be/id/concept/BestuurseenheidClassificatieCode/0657f97f-3ad2-4f72-a61c-abb10c206249",
    INTERGEMEENTELIJK_SAMENWERKINGSVERBAND_ZONDER_RECHTSPERSOONLIJKHEID = "http://data.vlaanderen.be/id/concept/BestuurseenheidClassificatieCode/a30f5e3f-7e6a-4352-a9da-57ea46a5e98d",
    AUTONOOM_GEMEENTEBEDRIJF = "http://data.vlaanderen.be/id/concept/BestuurseenheidClassificatieCode/36a82ba0-7ff1-4697-a9dd-2e94df73b721",
    AUTONOOM_PROVINCIEBEDRIJF = "http://data.vlaanderen.be/id/concept/BestuurseenheidClassificatieCode/80310756-ce0a-4a1b-9b8e-7c01b6cc7a2d",
    DIENSTVERLENENDE_VERENIGING = "http://data.vlaanderen.be/id/concept/BestuurseenheidClassificatieCode/d01bb1f6-2439-4e33-9c25-1fc295de2e71",
    HULPVERLENINGSZONE = "http://data.vlaanderen.be/id/concept/BestuurseenheidClassificatieCode/ea446861-2c51-45fa-afd3-4e4a37b71562",
    OPDRACHTHOUDENDE_VERENIGING = "http://data.vlaanderen.be/id/concept/BestuurseenheidClassificatieCode/cd93f147-3ece-4308-acab-5c5ada3ec63d",
    OPDRACHTHOUDENDE_VERENIGING_MET_PRIVATE_DEELNAME = "http://data.vlaanderen.be/id/concept/BestuurseenheidClassificatieCode/d46b2acb-4763-4532-9aff-fdede39e9520",
    WATERING = "http://data.vlaanderen.be/id/concept/BestuurseenheidClassificatieCode/293e5f58-9544-496e-88e0-734a137f6ebc",
    POLDERS = "http://data.vlaanderen.be/id/concept/BestuurseenheidClassificatieCode/d312c541-a263-4004-bca2-63eb991458c3",
    POLITIEZONE = "http://data.vlaanderen.be/id/concept/BestuurseenheidClassificatieCode/a3922c6d-425b-474f-9a02-ffb71a436bfc",
    PROJECTVERENIGING = "http://data.vlaanderen.be/id/concept/BestuurseenheidClassificatieCode/b156b67f-c5f4-4584-9b30-4c090be02fdc",
    WELZIJNSVERENIGING = "http://data.vlaanderen.be/id/concept/BestuurseenheidClassificatieCode/e8294b73-87c9-4fa2-9441-1937350763c9",
    OCMW_VERENIGING = "http://data.vlaanderen.be/id/concept/BestuurseenheidClassificatieCode/cc4e2d67-603b-4784-9b61-e50bac1ec089",
}