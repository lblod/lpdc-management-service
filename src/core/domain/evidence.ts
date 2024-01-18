import {Iri} from "./shared/iri";
import {LanguageString} from "./language-string";
import {requiredValue} from "./shared/invariant";

export class Evidence {

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

    static forConcept(evidence: Evidence): Evidence {
        return new Evidence(
            evidence.id,
            requiredValue(evidence.uuid, 'uuid'),
            requiredValue(evidence.title, 'title'),
            requiredValue(evidence.description, 'description')
        );
    }

    static forConceptSnapshot(evidence: Evidence): Evidence {
        return new Evidence(
            evidence.id,
            undefined,
            requiredValue(evidence.title, 'title'),
            requiredValue(evidence.description, 'description')
        );
    }

    static forInstance(evidence: Evidence): Evidence {
        return new Evidence(
            evidence.id,
            requiredValue(evidence.uuid, 'uuid'),
            evidence.title,
            evidence.description
        );
    }

    static reconstitute(id: Iri,
                        uuid: string | undefined,
                        title: LanguageString | undefined,
                        description: LanguageString | undefined): Evidence {

        return new Evidence(id, uuid, title, description);
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

    static isFunctionallyChanged(value: Evidence | undefined, other: Evidence | undefined): boolean {
        return LanguageString.isFunctionallyChanged(value?.title, other?.title)
            || LanguageString.isFunctionallyChanged(value?.description, other?.description);
    }

}