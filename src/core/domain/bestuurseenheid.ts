import {Iri, iriAsId} from "./shared/iri";


export class Bestuurseenheid {
    private readonly _id: Iri;
    private readonly _prefLabel: string;
    private readonly _classificatieCode: BestuurseenheidClassificatieCode;

    constructor(id: Iri, prefLabel: string, classificatieCode: BestuurseenheidClassificatieCode) {
        this._id = iriAsId(id);
        this._prefLabel = prefLabel;
        this._classificatieCode = classificatieCode;
    }

    get id(): Iri {
        return this._id;
    }

    get prefLabel(): string {
        return this._prefLabel;
    }

    get classificatieCode(): BestuurseenheidClassificatieCode {
        return this._classificatieCode;
    }

    get uuid(): string {
        const prefix = 'http://data.lblod.info/id/bestuurseenheden/';
        const regex = new RegExp(`^${prefix}(.*)$`);

        return this._id.match(regex)[1];
    }
}


export enum BestuurseenheidClassificatieCode {
    PROVINCIE = "Provincie",
    GEMEENTE = "Gemeente",
    OCMW = "OCMW",
    DISTRICT = "District",
    INTERCOMMUNALE = "Intercommunale",
    INTERLOKAAL_SAMENWERKINGSVERBAND_ZONDER_RECHTSPERSOONLIJKHEID = "Interlokaal samenwerkingsverband zonder rechtspersoonlijkheid",
    INTERGEMEENTELIJK_SAMENWERKINGSVERBAND_ZONDER_RECHTSPERSOONLIJKHEID = "(Intergemeentelijk) Samenwerkingsverband zonder rechtspersoonlijkheid",
    AUTONOOM_GEMEENTEBEDRIJF = "Autonoom gemeentebedrijf",
    AUTONOOM_PROVINCIEBEDRIJF = "Autonoom provinciebedrijf",
    DIENSTVERLENENDE_VERENIGING = "Dienstverlenende vereniging",
    HULPVERLENINGSZONE = "Hulpverleningszone",
    OPDRACHTHOUDENDE_VERENIGING = "Opdrachthoudende vereniging",
    OPDRACHTHOUDENDE_VERENIGING_MET_PRIVATE_DEELNAME = "Opdrachthoudende vereniging met private deelname",
    WATERING = "Watering",
    POLDERS = "Polders",
    POLITIEZONE = "Politiezone",
    PROJECTVERENIGING = "Projectvereniging",
    WELZIJNSVERENIGING = "Welzijnsvereniging",
    OCMW_VERENIGING = "OCMW vereniging"
}