import {Iri} from "./shared/iri";
import {LanguageString} from "./language-string";
import _ from "lodash";
import {requiredValue} from "./shared/invariant";
import {Language} from "./language";

export class Cost {

    private readonly _id: Iri;
    private readonly _uuid: string | undefined; //required for mu-cl-resources.
    private readonly _title: LanguageString | undefined;
    private readonly _description: LanguageString | undefined;
    private readonly _conceptId: Iri | undefined; //TODO LPDC-917: wijst dit naar de concept id ? of naar de cost die onder het concept hangt ? analoog voor andere?

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

    static forConcept(cost: Cost): Cost {
        return new Cost(
            cost.id,
            requiredValue(cost.uuid, 'uuid'),
            requiredValue(cost.title, 'title'),
            requiredValue(cost.description, 'description'),
            undefined
        );
    }

    static forConceptSnapshot(cost: Cost): Cost {
        return new Cost(
            cost.id,
            undefined,
            requiredValue(cost.title, 'title'),
            requiredValue(cost.description, 'description'),
            undefined
        );
    }

    static forInstance(cost: Cost): Cost {
        return new Cost(
            cost.id,
            requiredValue(cost.uuid, 'uuid'),
            cost.title,
            cost.description,
            cost.conceptId
        );
    }


    static reconstitute(id: Iri,
                        uuid: string | undefined,
                        title: LanguageString | undefined,
                        description: LanguageString | undefined,
                        conceptId: Iri | undefined): Cost {

        return new Cost(id, uuid, title, description, conceptId);
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

    static isFunctionallyChanged(value: Cost[], other: Cost[]): boolean {
        return value.length !== other.length
            || _.zip(value, other).some((costs: [Cost, Cost]) => {
                return LanguageString.isFunctionallyChanged(costs[0].title, costs[1].title)
                    || LanguageString.isFunctionallyChanged(costs[0].description, costs[1].description);
            });
    }

    get nlLanguage(): Language | undefined {
        return LanguageString.extractNlLanguage([this._title, this._description]);
    }

}

export class CostBuilder {

    private id: Iri;
    private uuid: string | undefined;
    private title: LanguageString | undefined;
    private description: LanguageString | undefined;
    private conceptId: Iri | undefined;

    static buildIri(uniqueId: string): Iri {
        return new Iri(`http://data.lblod.info/id/cost/${uniqueId}`);
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

    public withConceptId(conceptId: Iri): CostBuilder {
        this.conceptId = conceptId;
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
            this.conceptId
        );
    }
}