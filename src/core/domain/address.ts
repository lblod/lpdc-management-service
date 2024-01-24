import {Iri} from "./shared/iri";
import {requiredValue} from "./shared/invariant";
import {LanguageString} from "./language-string";

export class Address {

    private readonly _id: Iri;
    private readonly _uuid: string; //required for mu-cl-resources.
    private readonly _gemeentenaam: LanguageString | undefined;
    private readonly _land: LanguageString | undefined;
    private readonly _huisnummer: string | undefined;
    private readonly _busnummer: string | undefined;
    private readonly _postcode: string | undefined;
    private readonly _straatnaam: LanguageString | undefined;
    private readonly _verwijstNaar: Iri | undefined;

    constructor(id: Iri,
                uuid: string,
                gemeentenaam: LanguageString | undefined,
                land: LanguageString | undefined,
                huisnummer: string | undefined,
                busnummer: string | undefined,
                postcode: string | undefined,
                straatnaam: LanguageString | undefined,
                verwijstNaar: Iri) {

        // TODO LPDC-917: validate gemeentenaam, land en straatnaam should be only nl
        this._id = requiredValue(id, 'id');
        this._uuid = requiredValue(uuid, 'uuid');
        this._gemeentenaam = gemeentenaam;
        this._land = land;
        this._huisnummer = huisnummer;
        this._busnummer = busnummer;
        this._postcode = postcode;
        this._straatnaam = straatnaam;
        this._verwijstNaar = verwijstNaar;
    }

    get id(): Iri {
        return this._id;
    }

    get uuid(): string {
        return this._uuid;
    }

    get gemeentenaam(): LanguageString | undefined {
        return this._gemeentenaam;
    }

    get land(): LanguageString | undefined {
        return this._land;
    }

    get huisnummer(): string | undefined {
        return this._huisnummer;
    }

    get busnummer(): string | undefined {
        return this._busnummer;
    }

    get postcode(): string | undefined {
        return this._postcode;
    }

    get straatnaam(): LanguageString | undefined {
        return this._straatnaam;
    }

    get verwijstNaar(): Iri | undefined {
        return this._verwijstNaar;
    }
}