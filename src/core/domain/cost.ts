import {Iri} from "./shared/iri";
import {LanguageString} from "./language-string";
import {zip} from "lodash";
import {requiredValue} from "./shared/invariant";
import {instanceLanguages, Language} from "./language";

export class Cost {

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

    static forConcept(cost: Cost): Cost {
        return new Cost(
            cost.id,
            requiredValue(cost.uuid, 'uuid'),
            requiredValue(cost.title, 'title'),
            requiredValue(cost.description, 'description'),
            cost.order,
        );
    }

    static forConceptSnapshot(cost: Cost): Cost {
        return new Cost(
            cost.id,
            undefined,
            requiredValue(cost.title, 'title'),
            requiredValue(cost.description, 'description'),
            cost.order,
        );
    }

    static forInstance(cost: Cost): Cost {
        LanguageString.validateUniqueAndCorrectLanguages(instanceLanguages, cost.title, cost.description);

        return new Cost(
            cost.id,
            requiredValue(cost.uuid, 'uuid'),
            cost.title,
            cost.description,
            cost.order,
        );
    }

    static forInstanceSnapshot(cost: Cost): Cost {
        LanguageString.validateUniqueAndCorrectLanguages(instanceLanguages, cost.title, cost.description);

        return new Cost(
            cost.id,
            undefined,
            requiredValue(cost.title, 'title'),
            requiredValue(cost.description, 'description'),
            cost.order,
        );
    }

    static reconstitute(id: Iri,
                        uuid: string | undefined,
                        title: LanguageString | undefined,
                        description: LanguageString | undefined,
                        order: number): Cost {

        return new Cost(id, uuid, title, description, order);
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

    transformToInformal(): Cost {
        return CostBuilder.from(this)
            .withTitle(this.title?.transformToInformal())
            .withDescription(this.description?.transformToInformal())
            .build();
    }

    static isFunctionallyChanged(value: Cost[], other: Cost[]): boolean {
        return value.length !== other.length
            || zip(value, other).some((costs: [Cost, Cost]) => {
                return LanguageString.isFunctionallyChanged(costs[0].title, costs[1].title)
                    || LanguageString.isFunctionallyChanged(costs[0].description, costs[1].description);
            });
    }

    get nlLanguage(): Language | undefined {
        return LanguageString.extractNlLanguages([this._title, this._description])[0];
    }
}

export class CostBuilder {

    private id: Iri;
    private uuid: string | undefined;
    private title: LanguageString | undefined;
    private description: LanguageString | undefined;
    private order: number;

    static buildIri(uniqueId: string): Iri {
        return new Iri(`http://data.lblod.info/id/cost/${uniqueId}`);
    }

    static from(cost: Cost): CostBuilder {
        return new CostBuilder()
            .withId(cost.id)
            .withUuid(cost.uuid)
            .withTitle(cost.title)
            .withDescription(cost.description)
            .withOrder(cost.order);
    }

    public withId(id: Iri): CostBuilder {
        this.id = id;
        return this;
    }

    public withUuid(uuid: string): CostBuilder {
        this.uuid = uuid;
        return this;
    }

    public withTitle(title: LanguageString): CostBuilder {
        this.title = title;
        return this;
    }

    public withDescription(description: LanguageString): CostBuilder {
        this.description = description;
        return this;
    }

    public withOrder(order: number): CostBuilder {
        this.order = order;
        return this;
    }

    public buildForInstance(): Cost {
        return Cost.forInstance(this.build());
    }

    public buildForConcept(): Cost {
        return Cost.forConcept(this.build());
    }

    public buildForConceptSnapshot(): Cost {
        return Cost.forConceptSnapshot(this.build());
    }

    public build(): Cost {
        return Cost.reconstitute(
            this.id,
            this.uuid,
            this.title,
            this.description,
            this.order
        );
    }
}
