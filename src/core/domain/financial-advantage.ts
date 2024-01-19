import {Iri} from "./shared/iri";
import {LanguageString} from "./language-string";
import _ from "lodash";
import {requiredValue} from "./shared/invariant";

export class FinancialAdvantage {

    private readonly _id: Iri;
    private readonly _uuid: string | undefined; //required for mu-cl-resources.
    private readonly _title: LanguageString | undefined;
    private readonly _description: LanguageString | undefined;

    private constructor(id: Iri,
                        uuid: string | undefined,
                        title: LanguageString | undefined,
                        description: LanguageString | undefined,
    ) {
        this._id = requiredValue(id, 'id');
        this._uuid = uuid;
        this._title = title;
        this._description = description;
    }

    static forConcept(financialAdvantage: FinancialAdvantage): FinancialAdvantage {
        return new FinancialAdvantage(
            financialAdvantage.id,
            requiredValue(financialAdvantage.uuid, 'uuid'),
            requiredValue(financialAdvantage.title, 'title'),
            requiredValue(financialAdvantage.description, 'description')
        );
    }

    static forConceptSnapshot(financialAdvantage: FinancialAdvantage): FinancialAdvantage {
        return new FinancialAdvantage(
            financialAdvantage.id,
            undefined,
            requiredValue(financialAdvantage.title, 'title'),
            requiredValue(financialAdvantage.description, 'description')
        );
    }

    static forInstance(financialAdvantage: FinancialAdvantage): FinancialAdvantage {
        return new FinancialAdvantage(
            financialAdvantage.id,
            requiredValue(financialAdvantage.uuid, 'uuid'),
            financialAdvantage.title,
            financialAdvantage.description
        );
    }

    static reconstitute(id: Iri,
                        uuid: string | undefined,
                        title: LanguageString | undefined,
                        description: LanguageString | undefined): FinancialAdvantage {

        return new FinancialAdvantage(id, uuid, title, description);
    }

    get id(): Iri {
        return this._id;
    }

    get uuid(): string | undefined {
        return this._uuid;
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