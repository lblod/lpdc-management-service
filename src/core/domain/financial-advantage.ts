import {Iri} from "./shared/iri";
import {LanguageString} from "./language-string";
import {zip} from "lodash";
import {requiredValue} from "./shared/invariant";
import {instanceLanguages, Language} from "./language";
import {uuid} from "../../../mu-helper";

export class FinancialAdvantage {

    private readonly _id: Iri;
    private readonly _uuid: string | undefined; //required for mu-cl-resources.
    private readonly _title: LanguageString | undefined;
    private readonly _description: LanguageString | undefined;
    private readonly _order: number;

    private constructor(id: Iri,
                        uuid: string | undefined,
                        title: LanguageString | undefined,
                        description: LanguageString | undefined,
                        order: number,
    ) {
        this._id = requiredValue(id, 'id');
        this._uuid = uuid;
        this._title = title;
        this._description = description;
        this._order = requiredValue(order, 'order');
    }

    static forConcept(financialAdvantage: FinancialAdvantage): FinancialAdvantage {
        return new FinancialAdvantage(
            financialAdvantage.id,
            requiredValue(financialAdvantage.uuid, 'uuid'),
            requiredValue(financialAdvantage.title, 'title'),
            requiredValue(financialAdvantage.description, 'description'),
            financialAdvantage.order,
        );
    }

    static forConceptSnapshot(financialAdvantage: FinancialAdvantage): FinancialAdvantage {
        return new FinancialAdvantage(
            financialAdvantage.id,
            undefined,
            requiredValue(financialAdvantage.title, 'title'),
            requiredValue(financialAdvantage.description, 'description'),
            financialAdvantage.order,
        );
    }

    static forInstance(financialAdvantage: FinancialAdvantage): FinancialAdvantage {
        LanguageString.validateUniqueAndCorrectLanguages(instanceLanguages, financialAdvantage.title, financialAdvantage.description);

        return new FinancialAdvantage(
            financialAdvantage.id,
            requiredValue(financialAdvantage.uuid, 'uuid'),
            financialAdvantage.title,
            financialAdvantage.description,
            financialAdvantage.order,
        );
    }

    static forInstanceSnapshot(financialAdvantage: FinancialAdvantage): FinancialAdvantage {
        LanguageString.validateUniqueAndCorrectLanguages(instanceLanguages, financialAdvantage.title, financialAdvantage.description);

        return new FinancialAdvantage(
            financialAdvantage.id,
            undefined,
            requiredValue(financialAdvantage.title, 'title'),
            requiredValue(financialAdvantage.description, 'description'),
            financialAdvantage.order,
        );
    }

    static reconstitute(id: Iri,
                        uuid: string | undefined,
                        title: LanguageString | undefined,
                        description: LanguageString | undefined,
                        order: number): FinancialAdvantage {

        return new FinancialAdvantage(id, uuid, title, description, order);
    }

    get nlLanguage(): Language | undefined {
        return LanguageString.extractLanguages([this._title, this._description])[0];
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

    get order(): number {
        return this._order;
    }

    transformToInformal(): FinancialAdvantage {
        return FinancialAdvantageBuilder.from(this)
            .withTitle(this.title?.transformToInformal())
            .withDescription(this.description?.transformToInformal())
            .build();
    }

    transformLanguage(from: Language, to: Language): FinancialAdvantage {
        return FinancialAdvantageBuilder.from(this)
            .withTitle(this.title?.transformLanguage(from, to))
            .withDescription(this.description?.transformLanguage(from, to))
            .build();
    }

    transformWithNewId(): FinancialAdvantage {
        const uniqueId = uuid();
        return FinancialAdvantageBuilder.from(this)
            .withId(FinancialAdvantageBuilder.buildIri(uniqueId))
            .withUuid(uniqueId)
            .build();
    }

    static isFunctionallyChanged(value: FinancialAdvantage[], other: FinancialAdvantage[]): boolean {
        return value.length !== other.length
            || zip(value, other).some((financialAdvantages: [FinancialAdvantage, FinancialAdvantage]) => {
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
    private order: number;

    static buildIri(uniqueId: string): Iri {
        return new Iri(`http://data.lblod.info/id/financial-advantage/${uniqueId}`);
    }

    static from(financialAdvantage: FinancialAdvantage): FinancialAdvantageBuilder {
        return new FinancialAdvantageBuilder()
            .withId(financialAdvantage.id)
            .withUuid(financialAdvantage.uuid)
            .withTitle(financialAdvantage.title)
            .withDescription(financialAdvantage.description)
            .withOrder(financialAdvantage.order);
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

    public withOrder(order: number) {
        this.order = order;
        return this;
    }

    public build(): FinancialAdvantage {
        return FinancialAdvantage.reconstitute(
            this.id,
            this.uuid,
            this.title,
            this.description,
            this.order
        );
    }
}
