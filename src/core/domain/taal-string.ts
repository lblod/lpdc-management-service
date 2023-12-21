export class TaalString {

    private readonly _en: string | undefined;
    private readonly _nl: string | undefined;
    private readonly _nlFormal: string | undefined;
    private readonly _nlInformal: string | undefined;
    private readonly _nlGeneratedFormal: string | undefined;
    private readonly _nlGeneratedInformal: string | undefined;

    constructor(en: string | undefined,
                nl: string | undefined,
                nlFormal: string | undefined,
                nlInformal: string | undefined,
                nlGeneratedFormal: string | undefined,
                nlGeneratedInformal: string | undefined) {
        this._en = en;
        this._nl = nl;
        this._nlFormal = nlFormal;
        this._nlInformal = nlInformal;
        this._nlGeneratedFormal = nlGeneratedFormal;
        this._nlGeneratedInformal = nlGeneratedInformal;
    }

    public static of(
        en?: string | undefined,
        nl?: string | undefined,
        nlFormal?: string | undefined,
        nlInformal?: string | undefined,
        nlGeneratedFormal?: string | undefined,
        nlGeneratedInformal?: string | undefined): TaalString {
        if(!en && !nl && !nlFormal && !nlInformal && !nlGeneratedFormal && !nlGeneratedInformal) {
            return undefined;
        }
        return new TaalString(en, nl, nlFormal, nlInformal, nlGeneratedFormal, nlGeneratedInformal);
    }

    get en(): string | undefined {
        return this._en;
    }

    get nl(): string | undefined {
        return this._nl;
    }

    get nlFormal(): string | undefined {
        return this._nlFormal;
    }

    get nlInformal(): string | undefined {
        return this._nlInformal;
    }
    get nlGeneratedFormal(): string | undefined {
        return this._nlGeneratedFormal;
    }

    get nlGeneratedInformal(): string | undefined {
        return this._nlGeneratedInformal;
    }

}