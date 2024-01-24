import {Iri} from "./shared/iri";
import {LanguageString} from "./language-string";
import _ from "lodash";
import {requiredValue} from "./shared/invariant";
import {Language} from "./language";

export class FinancialAdvantage {

    private readonly _id: Iri;
    private readonly _uuid: string | undefined; //required for mu-cl-resources.
    private readonly _title: LanguageString | undefined;
    private readonly _description: LanguageString | undefined;
    private readonly _conceptId: Iri | undefined;

    private constructor(id: Iri,
                        uuid: string | undefined,
                        title: LanguageString | undefined,
                        description: LanguageString | undefined,
                        conceptId: Iri | undefined
    ) {
        this._id = requiredValue(id, 'id');
        this._uuid = uuid;
        this._title = title;
        this._description = description;
        this._conceptId = conceptId;
    }

    static forConcept(financialAdvantage: FinancialAdvantage): FinancialAdvantage {
        return new FinancialAdvantage(
            financialAdvantage.id,
            requiredValue(financialAdvantage.uuid, 'uuid'),
            requiredValue(financialAdvantage.title, 'title'),
            requiredValue(financialAdvantage.description, 'description'),
            undefined
        );
    }

    static forConceptSnapshot(financialAdvantage: FinancialAdvantage): FinancialAdvantage {
        return new FinancialAdvantage(
            financialAdvantage.id,
            undefined,
            requiredValue(financialAdvantage.title, 'title'),
            requiredValue(financialAdvantage.description, 'description'),
            undefined
        );
    }

    static forInstance(financialAdvantage: FinancialAdvantage): FinancialAdvantage {
        return new FinancialAdvantage(
            financialAdvantage.id,
            requiredValue(financialAdvantage.uuid, 'uuid'),
            financialAdvantage.title,
            financialAdvantage.description,
            financialAdvantage.conceptId
        );
    }

    static reconstitute(id: Iri,
                        uuid: string | undefined,
                        title: LanguageString | undefined,
                        description: LanguageString | undefined,
                        conceptId: Iri | undefined): FinancialAdvantage {

        return new FinancialAdvantage(id, uuid, title, description, conceptId);
    }

    get nlLanguage(): Language | undefined {
        return LanguageString.extractNlLanguage([this._title, this._description]);
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

    get conceptId(): Iri | undefined {
        return this._conceptId;
    }

    static isFunctionallyChanged(value: FinancialAdvantage[], other: FinancialAdvantage[]): boolean {
        return value.length !== other.length
            || _.zip(value, other).some((financialAdvantages: [FinancialAdvantage, FinancialAdvantage]) => {
                return LanguageString.isFunctionallyChanged(financialAdvantages[0].title, financialAdvantages[1].title)
                    || LanguageString.isFunctionallyChanged(financialAdvantages[0].description, financialAdvantages[1].description);
            });
    }

}

export class FinancialAdvantageBuilder {
    private id: Iri;
    private uuid: string | undefined;
    private title: LanguageString | undefined;
    private description: LanguageString | undefined;
    private conceptId: Iri | undefined;

    static buildIri(uniqueId: string): Iri {
        return new Iri(`http://data.lblod.info/id/financial-advantage/${uniqueId}`);
    }

    public withId(id: Iri): FinancialAdvantageBuilder {
        this.id = id;
        return this;
    }

    public withUuid(uuid: string): FinancialAdvantageBuilder {
        this.uuid = uuid;
        return this;
    }

    public withTitle(title: LanguageString): FinancialAdvantageBuilder {
        this.title = title;
        return this;
    }

    public withDescription(description: LanguageString): FinancialAdvantageBuilder {
        this.description = description;
        return this;
    }

    public withConceptId(conceptId: Iri): FinancialAdvantageBuilder {
        this.conceptId = conceptId;
        return this;
    }

    public buildForInstance(): FinancialAdvantage {
        return FinancialAdvantage.forInstance(this.build());
    }

    public buildForConcept(): FinancialAdvantage {
        return FinancialAdvantage.forConcept(this.build());
    }

    public buildForConceptSnapshot(): FinancialAdvantage {
        return FinancialAdvantage.forConceptSnapshot(this.build());
    }

    public build(): FinancialAdvantage {
        return FinancialAdvantage.reconstitute(
            this.id,
            this.uuid,
            this.title,
            this.description,
            this.conceptId,
        );
    }
}