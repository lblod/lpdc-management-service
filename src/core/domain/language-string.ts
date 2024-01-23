import {Language} from "./language";
import {uniq} from "lodash";

export class LanguageString {

    //TODO LPDC-917: embed the language string invariants in the invariants ...

    private readonly _en: string | undefined;
    private readonly _nl: string | undefined;
    private readonly _nlFormal: string | undefined;
    private readonly _nlInformal: string | undefined;
    private readonly _nlGeneratedFormal: string | undefined;
    private readonly _nlGeneratedInformal: string | undefined;

    private constructor(en: string | undefined,
                        nl: string | undefined,
                        nlFormal: string | undefined,
                        nlInformal: string | undefined,
                        nlGeneratedFormal: string | undefined,
                        nlGeneratedInformal: string | undefined) {

        //TODO LPDC-968: re-enable when empty triples are fixed in data
        // const invariant = Invariant.require([en, nl, nlFormal, nlInformal, nlGeneratedFormal, nlGeneratedInformal], 'language list');
        // invariant.to(invariant.haveAtLeastOneValuePresent());

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
        nlGeneratedInformal?: string | undefined): LanguageString {
        return new LanguageString(en, nl, nlFormal, nlInformal, nlGeneratedFormal, nlGeneratedInformal);
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

    get definedLanguages(): Language[] {
        const definedLanguages = [];
        if (this._en !== undefined) definedLanguages.push(Language.EN);
        if (this._nl !== undefined) definedLanguages.push(Language.NL);
        if (this._nlFormal !== undefined) definedLanguages.push(Language.FORMAL);
        if (this._nlInformal !== undefined) definedLanguages.push(Language.INFORMAL);
        if (this._nlGeneratedFormal !== undefined) definedLanguages.push(Language.GENERATED_FORMAL);
        if (this._nlGeneratedInformal !== undefined) definedLanguages.push(Language.GENERATED_INFORMAL);
        return uniq(definedLanguages);
    }

    getLanguageValue(language: Language): string | undefined {
        if (language === Language.EN) return this._en;
        if (language === Language.NL) return this._nl;
        if (language === Language.FORMAL) return this._nlFormal;
        if (language === Language.INFORMAL) return this._nlInformal;
        if (language === Language.GENERATED_FORMAL) return this._nlGeneratedFormal;
        if (language === Language.GENERATED_INFORMAL) return this._nlGeneratedInformal;
    }

    static isFunctionallyChanged(value: LanguageString | undefined, other: LanguageString | undefined): boolean {
        return value?.en !== other?.en
            || value?.nl !== other?.nl;
    }

    static compare(a: LanguageString, b: LanguageString): number {
        let comparison = LanguageString.compareValues(a._en, b._en);
        if (comparison !== 0) return comparison;

        comparison = LanguageString.compareValues(a._nl, b._nl);
        if (comparison !== 0) return comparison;

        comparison = LanguageString.compareValues(a._nlFormal, b._nlFormal);
        if (comparison !== 0) return comparison;

        comparison = LanguageString.compareValues(a._nlInformal, b._nlInformal);
        if (comparison !== 0) return comparison;

        comparison = LanguageString.compareValues(a._nlGeneratedFormal, b._nlGeneratedFormal);
        if (comparison !== 0) return comparison;

        comparison = LanguageString.compareValues(a._nlGeneratedInformal, b._nlGeneratedInformal);
        if (comparison !== 0) return comparison;

        return 0;
    }

    private static compareValues(a: string | undefined, b: string | undefined): number {
        const strA = a || "";
        const strB = b || "";
        return strA.localeCompare(strB);
    }

}