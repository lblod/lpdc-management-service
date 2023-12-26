import {Iri} from "./shared/iri";
import {TaalString} from "./taal-string";
import _ from "lodash";

export class FinancialAdvantage {

    //TODO LPDC-916: should not be here ... accepted compromise ?
    private readonly _id: Iri;
    private readonly _title: TaalString | undefined;
    private readonly _description: TaalString | undefined;

    constructor(id: Iri,
                title: TaalString | undefined,
                description: TaalString | undefined,
    ) {
        this._id = id;
        this._title = title;
        this._description = description;
    }

    get id(): Iri {
        return this._id;
    }

    get title(): TaalString | undefined {
        return this._title;
    }

    get description(): TaalString | undefined {
        return this._description;
    }

    static isFunctionallyChanged(value: FinancialAdvantage[], other: FinancialAdvantage[]): boolean {
        return value.length !== other.length
            || _.zip(value, other).some((financialAdvantages: [FinancialAdvantage, FinancialAdvantage]) => {
                return TaalString.isFunctionallyChanged(financialAdvantages[0].title, financialAdvantages[1].title)
                    || TaalString.isFunctionallyChanged(financialAdvantages[0].description, financialAdvantages[1].description);
            });
    }

}