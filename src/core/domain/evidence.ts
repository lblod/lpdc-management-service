import {Iri} from "./shared/iri";
import {LanguageString} from "./language-string";
import {requiredValue} from "./shared/invariant";
import {instanceLanguages, Language} from "./language";

export class Evidence {

    private readonly _id: Iri;
    private readonly _uuid: string | undefined; //required for mu-cl-resources.
    private readonly _title: LanguageString | undefined;
    private readonly _description: LanguageString | undefined;


    private constructor(id: Iri,
                        uuid: string | undefined,
                        title: LanguageString | undefined,
                        description: LanguageString | undefined
    ) {
        this._id = requiredValue(id, 'id');
        this._uuid = uuid;
        this._title = title;
        this._description = description;
    }

    static forConcept(evidence: Evidence): Evidence {
        return new Evidence(
            evidence.id,
            requiredValue(evidence.uuid, 'uuid'),
            requiredValue(evidence.title, 'title'),
            requiredValue(evidence.description, 'description'),
        );
    }

    static forConceptSnapshot(evidence: Evidence): Evidence {
        return new Evidence(
            evidence.id,
            undefined,
            requiredValue(evidence.title, 'title'),
            requiredValue(evidence.description, 'description'),
        );
    }

    static forInstance(evidence: Evidence): Evidence {
        LanguageString.validateUniqueAndCorrectLanguages(instanceLanguages, evidence.title, evidence.description);

        return new Evidence(
            evidence.id,
            requiredValue(evidence.uuid, 'uuid'),
            evidence.title,
            evidence.description,
        );
    }

    static forInstanceSnapshot(evidence: Evidence): Evidence {
        LanguageString.validateUniqueAndCorrectLanguages(instanceLanguages, evidence.title, evidence.description);

        return new Evidence(
            evidence.id,
            undefined,
            requiredValue(evidence.title, 'title'),
            requiredValue(evidence.description, 'description'),
        );
    }

    static reconstitute(id: Iri,
                        uuid: string | undefined,
                        title: LanguageString | undefined,
                        description: LanguageString | undefined): Evidence {

        return new Evidence(id, uuid, title, description);
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

    transformToInformal(): Evidence {
        return EvidenceBuilder.from(this)
            .withTitle(this.title?.transformToInformal())
            .withDescription(this.description?.transformToInformal())
            .build();
    }

    static isFunctionallyChanged(value: Evidence | undefined, other: Evidence | undefined): boolean {
        return LanguageString.isFunctionallyChanged(value?.title, other?.title)
            || LanguageString.isFunctionallyChanged(value?.description, other?.description);
    }
}

export class EvidenceBuilder {
    private id: Iri;
    private uuid: string | undefined;
    private title: LanguageString | undefined;
    private description: LanguageString | undefined;

    static buildIri(uniqueId: string): Iri {
        return new Iri(`http://data.lblod.info/id/evidence/${uniqueId}`);
    }

    static from(evidence: Evidence): EvidenceBuilder {
        return new EvidenceBuilder()
            .withId(evidence.id)
            .withUuid(evidence.uuid)
            .withTitle(evidence.title)
            .withDescription(evidence.description);
    }

    public withId(id: Iri): EvidenceBuilder {
        this.id = id;
        return this;
    }

    public withUuid(uuid: string): EvidenceBuilder {
        this.uuid = uuid;
        return this;
    }

    public withTitle(title: LanguageString): EvidenceBuilder {
        this.title = title;
        return this;
    }

    public withDescription(description: LanguageString): EvidenceBuilder {
        this.description = description;
        return this;
    }
    
    public build(): Evidence {
        return Evidence.reconstitute(
            this.id,
            this.uuid,
            this.title,
            this.description
        );
    }
}
