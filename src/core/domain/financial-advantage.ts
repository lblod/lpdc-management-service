import {Iri} from "./shared/iri";
import {LanguageString} from "./language-string";
import _ from "lodash";

export class FinancialAdvantage {

    private readonly _id: Iri;
    private readonly _title: LanguageString | undefined;
    private readonly _description: LanguageString | undefined;

    constructor(id: Iri,
                title: LanguageString | undefined,
                description: LanguageString | undefined,
    ) {
        //TODO LPDC-916: add invariants
        this._id = id;
        this._title = title;
        this._description = description;
    }

    get id(): Iri {
        return this._id;
    }

    get title(): LanguageString | undefined {
        return this._title;
    }

    get description(): LanguageString | undefined {
        return this._description;
    }

    static isFunctionallyChanged(value: FinancialAdvantage[], other: FinancialAdvantage[]): boolean {
        return value.length !== other.length
            || _.zip(value, other).some((financialAdvantages: [FinancialAdvantage, FinancialAdvantage]) => {
                return LanguageString.isFunctionallyChanged(financialAdvantages[0].title, financialAdvantages[1].title)
                    || LanguageString.isFunctionallyChanged(financialAdvantages[0].description, financialAdvantages[1].description);
            });
    }

}