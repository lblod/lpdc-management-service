import {Iri} from "./shared/iri";

export class Bestuurseenheid {
    private id: Iri;
    private prefLabel: string;
    private classificatieCode: BestuurseenheidClassificatieCode;

    constructor(id: Iri, prefLabel: string, classificatieCode: BestuurseenheidClassificatieCode) {
        this.id = id;
        this.prefLabel = prefLabel;
        this.classificatieCode = classificatieCode;
    }

    getId(): Iri {
        return this.id;
    }

    getPrefLabel(): string {
        return this.prefLabel;
    }

    getClassificatieCode(): BestuurseenheidClassificatieCode {
        return this.classificatieCode;
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