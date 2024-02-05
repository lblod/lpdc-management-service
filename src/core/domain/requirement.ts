import {LanguageString} from "./language-string";
import {Iri} from "./shared/iri";
import {zip} from 'lodash';
import {Evidence} from "./evidence";
import {requiredValue} from "./shared/invariant";
import {instanceLanguages, Language} from "./language";

export class Requirement {

    private readonly _id: Iri;
    private readonly _uuid: string | undefined; //required for mu-cl-resources.
    private readonly _title: LanguageString | undefined;
    private readonly _description: LanguageString | undefined;
    private readonly _order: number;
    private readonly _evidence: Evidence | undefined;
    private readonly _conceptRequirementId: Iri | undefined;

    private constructor(id: Iri,
                        uuid: string | undefined,
                        title: LanguageString | undefined,
                        description: LanguageString | undefined,
                        order: number,
                        evidence: Evidence | undefined,
                        conceptRequirementId: Iri | undefined
    ) {
        this._id = requiredValue(id, 'id');
        this._uuid = uuid;
        this._title = title;
        this._description = description;
        this._order = requiredValue(order, 'order');
        this._evidence = evidence;
        this._conceptRequirementId = conceptRequirementId;
    }

    static forConcept(requirement: Requirement): Requirement {
        return new Requirement(
            requirement.id,
            requiredValue(requirement.uuid, 'uuid'),
            requiredValue(requirement.title, 'title'),
            requiredValue(requirement.description, 'description'),
            requirement.order,
            requirement.evidence ? Evidence.forConcept(requirement.evidence) : undefined,
            undefined
        );
    }

    static forConceptSnapshot(requirement: Requirement): Requirement {
        return new Requirement(
            requirement.id,
            undefined,
            requiredValue(requirement.title, 'title'),
            requiredValue(requirement.description, 'description'),
            requirement.order,
            requirement.evidence ? Evidence.forConceptSnapshot(requirement.evidence) : undefined,
            undefined
        );
    }

    static forInstance(requirement: Requirement): Requirement {
        LanguageString.validateUniqueAndCorrectLanguages(instanceLanguages,
            requirement.title,
            requirement.description,
            requirement.evidence?.title,
            requirement.evidence?.description);

        return new Requirement(
            requirement.id,
            requiredValue(requirement.uuid, 'uuid'),
            requirement.title,
            requirement.description,
            requirement.order,
            requirement.evidence ? Evidence.forInstance(requirement.evidence) : undefined,
            requirement.conceptRequirementId
        );
    }

    static reconstitute(id: Iri,
                        uuid: string | undefined,
                        title: LanguageString | undefined,
                        description: LanguageString | undefined,
                        order: number,
                        evidence: Evidence | undefined,
                        conceptRequirementId: Iri | undefined): Requirement {

        return new Requirement(id, uuid, title, description, order, evidence, conceptRequirementId);
    }

    get nlLanguage(): Language | undefined {
        return LanguageString.extractNlLanguages([this._title, this._description])[0] ?? this._evidence?.nlLanguage;
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

    get evidence(): Evidence | undefined {
        return this._evidence;
    }

    get conceptRequirementId(): Iri | undefined {
        return this._conceptRequirementId;
    }

    static isFunctionallyChanged(value: Requirement[], other: Requirement[]): boolean {
        return value.length !== other.length
            || zip(value, other).some((reqs: [Requirement, Requirement]) => {
                return LanguageString.isFunctionallyChanged(reqs[0].title, reqs[1].title)
                    || LanguageString.isFunctionallyChanged(reqs[0].description, reqs[1].description)
                    || Evidence.isFunctionallyChanged(reqs[0].evidence, reqs[1].evidence);
            });
    }
}

export class RequirementBuilder {

    private _id: Iri;
    private _uuid: string | undefined;
    private _title: LanguageString | undefined;
    private _description: LanguageString | undefined;
    private _order: number;
    private _evidence: Evidence | undefined;
    private _conceptRequirementId: Iri | undefined;

    static buildIri(uniqueId: string): Iri {
        return new Iri(`http://data.lblod.info/id/requirement/${uniqueId}`);
    }

    public withId(id: Iri): RequirementBuilder {
        this._id = id;
        return this;
    }

    public withUuid(uuid: string): RequirementBuilder {
        this._uuid = uuid;
        return this;
    }

    public withTitle(title: LanguageString): RequirementBuilder {
        this._title = title;
        return this;
    }

    public withDescription(description: LanguageString): RequirementBuilder {
        this._description = description;
        return this;
    }

    public withOrder(order: number): RequirementBuilder {
        this._order = order;
        return this;
    }

    public withEvidence(evidence: Evidence): RequirementBuilder {
        this._evidence = evidence;
        return this;
    }

    public withConceptRequirementId(conceptRequirementId: Iri): RequirementBuilder {
        this._conceptRequirementId = conceptRequirementId;
        return this;
    }

    public buildForInstance(): Requirement {
        return Requirement.forInstance(this.build());
    }

    public buildForConcept(): Requirement {
        return Requirement.forConcept(this.build());
    }

    public buildForConceptSnapshot(): Requirement {
        return Requirement.forConceptSnapshot(this.build());
    }

    public build(): Requirement {
        return Requirement.reconstitute(
            this._id,
            this._uuid,
            this._title,
            this._description,
            this._order,
            this._evidence,
            this._conceptRequirementId,
        );
    }
}