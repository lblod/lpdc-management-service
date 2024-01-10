import {Iri} from "./shared/iri";
import {SessionRole} from "./session";
import {requiredValue} from "./shared/invariant";


export class Bestuurseenheid {

    public static readonly abb = new Iri('http://data.lblod.info/id/bestuurseenheden/141d9d6b-54af-4d17-b313-8d1c30bc3f5b');

    private readonly _id: Iri;
    //TODO LPDC-916: also map the uuid (as in other classes)
    private readonly _prefLabel: string;
    private readonly _classificatieCode: BestuurseenheidClassificatieCode | undefined;

    constructor(id: Iri,
                prefLabel: string,
                classificatieCode: BestuurseenheidClassificatieCode | undefined) {
        this._id = requiredValue(id, 'id');
        this._prefLabel = requiredValue(prefLabel, 'prefLabel');
        this._classificatieCode = id.equals(Bestuurseenheid.abb) ? classificatieCode : requiredValue(classificatieCode, 'classificatieCode');
    }

    get id(): Iri {
        return this._id;
    }

    get prefLabel(): string {
        return this._prefLabel;
    }

    get classificatieCode(): BestuurseenheidClassificatieCode | undefined {
        return this._classificatieCode;
    }

    get uuid(): string {
        const prefix = 'http://data.lblod.info/id/bestuurseenheden/';
        const regex = new RegExp(`^${prefix}(.*)$`);

        return this._id.value.match(regex)[1];
    }

    userGraph(): Iri {
        return new Iri(`http://mu.semte.ch/graphs/organizations/${this.uuid}/${SessionRole.LOKETLB_LPDCGEBRUIKER}`);
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
    OCMW_VERENIGING = "OCMW vereniging",
    VLAAMSE_GEMEENSCHAPSCOMMISSIE = "Vlaamse gemeenschapscommissie",
}