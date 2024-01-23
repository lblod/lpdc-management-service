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
    private readonly _source: Iri | undefined;

    private constructor(id: Iri,
                        uuid: string | undefined,
                        title: LanguageString | undefined,
                        description: LanguageString | undefined,
                        websites: Website[],
                        source: Iri | undefined
    ) {
        this._id = requiredValue(id, 'id');
        this._uuid = uuid;
        this._title = title;
        this._description = description;
        this._websites = [...websites];
        this._source = source;
    }

    static forConcept(procedure: Procedure): Procedure {
        return new Procedure(
            procedure.id,
            requiredValue(procedure.uuid, 'uuid'),
            requiredValue(procedure.title, 'title'),
            requiredValue(procedure.description, 'description'),
            procedure.websites.map(Website.forConcept),
            undefined
        );
    }

    static forConceptSnapshot(procedure: Procedure): Procedure {
        return new Procedure(
            procedure.id,
            undefined,
            requiredValue(procedure.title, 'title'),
            requiredValue(procedure.description, 'description'),
            procedure.websites.map(Website.forConceptSnapshot),
            undefined
        );
    }

    static forInstance(procedure: Procedure): Procedure {
        return new Procedure(
            procedure.id,
            requiredValue(procedure.uuid, 'uuid'),
            procedure.title,
            procedure.description,
            procedure.websites.map(Website.forInstance),
            procedure.source
        );
    }

    static reconstitute(id: Iri,
                        uuid: string | undefined,
                        title: LanguageString | undefined,
                        description: LanguageString | undefined,
                        websites: Website[],
                        source: Iri | undefined): Procedure {

        return new Procedure(id, uuid, title, description, websites, source);
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

    get source(): Iri | undefined {
        return this._source;
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

export class ProcedureBuilder {

    private id: Iri;
    private uuid: string | undefined;
    private title: LanguageString | undefined;
    private description: LanguageString | undefined;
    private websites: Website[] = [];
    private source: Iri | undefined;

    static buildIri(uniqueId: string): Iri {
        return new Iri(`http://data.lblod.info/id/rule/${uniqueId}`);
    }

    public withId(id: Iri): ProcedureBuilder {
        this.id = id;
        return this;
    }

    public withUuid(uuid: string): ProcedureBuilder {
        this.uuid = uuid;
        return this;
    }

    public withTitle(title: LanguageString): ProcedureBuilder {
        this.title = title;
        return this;
    }

    public withDescription(description: LanguageString): ProcedureBuilder {
        this.description = description;
        return this;
    }

    public withWebsites(websites: Website[]): ProcedureBuilder {
        this.websites = websites;
        return this;
    }

    withSource(source: Iri): ProcedureBuilder {
        this.source = source;
        return this;
    }

    public buildForInstance(): Procedure {
        return Procedure.forInstance(this.build());
    }

    public buildForConcept(): Procedure {
        return Procedure.forConcept(this.build());
    }

    public buildForConceptSnapshot(): Procedure {
        return Procedure.forConceptSnapshot(this.build());
    }

    public build(): Procedure {
        return Procedure.reconstitute(
            this.id,
            this.uuid,
            this.title,
            this.description,
            this.websites,
            this.source
        );
    }
}