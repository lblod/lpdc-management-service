import {Iri} from "./shared/iri";
import {LanguageString} from "./language-string";
import _ from "lodash";
import {Website} from "./website";
import {requiredValue} from "./shared/invariant";


export class Procedure {

    private readonly _id: Iri;
    private readonly _uuid: string | undefined; //required for mu-cl-resources.
    private readonly _title: LanguageString | undefined;
    private readonly _description: LanguageString | undefined;
    private readonly _websites: Website[];

    private constructor(id: Iri,
                        uuid: string | undefined,
                        title: LanguageString | undefined,
                        description: LanguageString | undefined,
                        websites: Website[],
    ) {
        this._id = requiredValue(id, 'id');
        this._uuid = uuid;
        this._title = title;
        this._description = description;
        this._websites = [...websites];
    }

    static forConcept(procedure: Procedure): Procedure {
        return new Procedure(
            procedure.id,
            requiredValue(procedure.uuid, 'uuid'),
            requiredValue(procedure.title, 'title'),
            requiredValue(procedure.description, 'description'),
            procedure.websites.map(Website.forConcept)
        );
    }

    static forConceptSnapshot(procedure: Procedure): Procedure {
        return new Procedure(
            procedure.id,
            undefined,
            requiredValue(procedure.title, 'title'),
            requiredValue(procedure.description, 'description'),
            procedure.websites.map(Website.forConceptSnapshot)
        );
    }

    static forInstance(procedure: Procedure): Procedure {
        return new Procedure(
            procedure.id,
            requiredValue(procedure.uuid, 'uuid'),
            procedure.title,
            procedure.description,
            procedure.websites.map(Website.forInstance)
        );
    }

    static reconstitute(id: Iri,
                        uuid: string | undefined,
                        title: LanguageString | undefined,
                        description: LanguageString | undefined,
                        websites: Website[]): Procedure {

        return new Procedure(id, uuid, title, description, websites);
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

    get websites(): Website[] {
        return [...this._websites];
    }

    static isFunctionallyChanged(value: Procedure[], other: Procedure[]): boolean {
        return value.length !== other.length
            || _.zip(value, other).some((procs: [Procedure, Procedure]) => {
                return LanguageString.isFunctionallyChanged(procs[0].title, procs[1].title)
                    || LanguageString.isFunctionallyChanged(procs[0].description, procs[1].description)
                    || Website.isFunctionallyChanged(procs[0].websites, procs[1].websites);
            });
    }
}