import {Iri} from "./shared/iri";
import {SessionRoleType} from "./session";
import {requiredValue, requireNoDuplicates} from "./shared/invariant";
import {asSortedArray} from "./shared/collections-helper";


export class Bestuurseenheid {

    public static readonly abb = new Iri('http://data.lblod.info/id/bestuurseenheden/141d9d6b-54af-4d17-b313-8d1c30bc3f5b');

    private readonly _id: Iri;
    private readonly _uuid: string;
    private readonly _prefLabel: string;
    private readonly _classificatieCode: BestuurseenheidClassificatieCode | undefined;
    private readonly _spatials: Iri[];

    constructor(id: Iri,
                uuid: string,
                prefLabel: string,
                classificatieCode: BestuurseenheidClassificatieCode | undefined,
                spatials: Iri[]) {
        this._id = requiredValue(id, 'id');
        this._uuid = requiredValue(uuid, 'uuid');
        this._prefLabel = requiredValue(prefLabel, 'prefLabel');
        this._classificatieCode = id.equals(Bestuurseenheid.abb) ? classificatieCode : requiredValue(classificatieCode, 'classificatieCode');
        this._spatials = requireNoDuplicates(asSortedArray(spatials, Iri.compare), 'spatials');
    }

    get id(): Iri {
        return this._id;
    }

    get uuid(): string {
        return this._uuid;
    }

    get prefLabel(): string {
        return this._prefLabel;
    }

    get classificatieCode(): BestuurseenheidClassificatieCode | undefined {
        return this._classificatieCode;
    }

    get spatials(): Iri[] {
        return [...this._spatials];
    }

    userGraph(): Iri {
        return new Iri(`http://mu.semte.ch/graphs/organizations/${this.uuid}/${SessionRoleType.LOKETLB_LPDCGEBRUIKER}`);
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