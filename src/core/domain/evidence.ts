import {Iri} from "./shared/iri";
import {LanguageString} from "./language-string";
import {requiredValue} from "./shared/invariant";
import {Language} from "./language";

export class Evidence {

    private readonly _id: Iri;
    private readonly _uuid: string | undefined; //required for mu-cl-resources.
    private readonly _title: LanguageString | undefined;
    private readonly _description: LanguageString | undefined;
    private readonly _conceptEvidenceId: Iri | undefined;

    private constructor(id: Iri,
                        uuid: string | undefined,
                        title: LanguageString | undefined,
                        description: LanguageString | undefined,
                        conceptEvidenceId: Iri | undefined
    ) {
        this._id = requiredValue(id, 'id');
        this._uuid = uuid;
        this._title = title;
        this._description = description;
        this._conceptEvidenceId = conceptEvidenceId;
    }

    static forConcept(evidence: Evidence): Evidence {
        return new Evidence(
            evidence.id,
            requiredValue(evidence.uuid, 'uuid'),
            requiredValue(evidence.title, 'title'),
            requiredValue(evidence.description, 'description'),
            undefined
        );
    }

    static forConceptSnapshot(evidence: Evidence): Evidence {
        return new Evidence(
            evidence.id,
            undefined,
            requiredValue(evidence.title, 'title'),
            requiredValue(evidence.description, 'description'),
            undefined
        );
    }

    static forInstance(evidence: Evidence): Evidence {
        return new Evidence(
            evidence.id,
            requiredValue(evidence.uuid, 'uuid'),
            evidence.title,
            evidence.description,
            evidence.conceptEvidenceId
        );
    }

    static reconstitute(id: Iri,
                        uuid: string | undefined,
                        title: LanguageString | undefined,
                        description: LanguageString | undefined,
                        conceptEvidenceId: Iri | undefined): Evidence {

        return new Evidence(id, uuid, title, description, conceptEvidenceId);
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

    get conceptEvidenceId(): Iri | undefined {
        return this._conceptEvidenceId;
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
    private conceptEvidenceId: Iri | undefined;

    static buildIri(uniqueId: string): Iri {
        return new Iri(`http://data.lblod.info/id/evidence/${uniqueId}`);
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

    public withConceptEvidenceId(conceptEvidenceId: Iri): EvidenceBuilder {
        this.conceptEvidenceId = conceptEvidenceId;
        return this;
    }

    public buildForInstance(): Evidence {
        return Evidence.forInstance(this.build());
    }

    public buildForConcept(): Evidence {
        return Evidence.forConcept(this.build());
    }

    public buildForConceptSnapshot(): Evidence {
        return Evidence.forConceptSnapshot(this.build());
    }

    public build(): Evidence {
        return Evidence.reconstitute(
            this.id,
            this.uuid,
            this.title,
            this.description,
            this.conceptEvidenceId
        );
    }
}