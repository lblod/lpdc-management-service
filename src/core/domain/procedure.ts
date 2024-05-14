import {Iri} from "./shared/iri";
import {LanguageString} from "./language-string";
import {zip} from "lodash";
import {Website} from "./website";
import {requiredValue, requireNoDuplicates} from "./shared/invariant";
import {instanceLanguages, Language} from "./language";
import {uuid} from "../../../mu-helper";

export class Procedure {

    private readonly _id: Iri;
    private readonly _uuid: string | undefined; //required for mu-cl-resources.
    private readonly _title: LanguageString | undefined;
    private readonly _description: LanguageString | undefined;
    private readonly _order: number;
    private readonly _websites: Website[];

    private constructor(id: Iri,
                        uuid: string | undefined,
                        title: LanguageString | undefined,
                        description: LanguageString | undefined,
                        order: number,
                        websites: Website[],
    ) {
        this._id = requiredValue(id, 'id');
        this._uuid = uuid;
        this._title = title;
        this._description = description;
        this._order = requiredValue(order, 'order');
        this._websites = [...websites];
        requireNoDuplicates(this._websites.map(r => r.order), 'websites > order');
    }

    static forConcept(procedure: Procedure): Procedure {
        return new Procedure(
            procedure.id,
            requiredValue(procedure.uuid, 'uuid'),
            requiredValue(procedure.title, 'title'),
            requiredValue(procedure.description, 'description'),
            procedure.order,
            procedure.websites.map(Website.forConcept),
        );
    }

    static forConceptSnapshot(procedure: Procedure): Procedure {
        return new Procedure(
            procedure.id,
            undefined,
            requiredValue(procedure.title, 'title'),
            requiredValue(procedure.description, 'description'),
            procedure.order,
            procedure.websites.map(Website.forConceptSnapshot),
        );
    }

    static forInstance(procedure: Procedure): Procedure {
        const websiteLangs = procedure.websites.flatMap(website => website.title);
        websiteLangs.concat(procedure.websites.flatMap(website => website.description));

        LanguageString.validateUniqueAndCorrectLanguages(instanceLanguages, procedure.title, procedure.description, ...websiteLangs);

        return new Procedure(
            procedure.id,
            requiredValue(procedure.uuid, 'uuid'),
            procedure.title,
            procedure.description,
            procedure.order,
            procedure.websites.map(Website.forInstance),
        );
    }

    static forInstanceSnapshot(procedure: Procedure): Procedure {
        const websiteLangs = [
            ...procedure.websites.flatMap(website => website.title),
            ...procedure.websites.flatMap(website => website.description)];

        LanguageString.validateUniqueAndCorrectLanguages(instanceLanguages, procedure.title, procedure.description, ...websiteLangs);

        return new Procedure(
            procedure.id,
            undefined,
            requiredValue(procedure.title, 'title'),
            requiredValue(procedure.description, 'description'),
            procedure.order,
            procedure.websites.map(Website.forInstanceSnapshot),
        );
    }

    static reconstitute(id: Iri,
                        uuid: string | undefined,
                        title: LanguageString | undefined,
                        description: LanguageString | undefined,
                        order: number,
                        websites: Website[]): Procedure {

        return new Procedure(id, uuid, title, description, order, websites);
    }

    get nlLanguage(): Language | undefined {
        const languages = [LanguageString.extractLanguages([this._title, this._description])[0],
            ...this._websites.map(r => r.nlLanguage)]
            .filter(l => l !== undefined);

        return languages[0];
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

    get websites(): Website[] {
        return [...this._websites];
    }

    transformToInformal(): Procedure {
        return ProcedureBuilder.from(this)
            .withTitle(this.title?.transformToInformal())
            .withDescription(this.description?.transformToInformal())
            .withWebsites(this.websites.map(website => website.transformToInformal()))
            .build();
    }

    transformLanguage(from: Language, to: Language) {
        return ProcedureBuilder.from(this)
            .withTitle(this.title?.transformLanguage(from, to))
            .withDescription(this.description?.transformLanguage(from, to))
            .withWebsites(this._websites.map(ws => ws.transformLanguage(from, to)))
            .build();
    }

    transformWithNewId(): Procedure {
        const uniqueId = uuid();
        return ProcedureBuilder.from(this)
            .withId(ProcedureBuilder.buildIri(uniqueId))
            .withUuid(uniqueId)
            .withWebsites(this._websites.map(ws => ws.transformWithNewId()))
            .build();
    }

    static isFunctionallyChanged(value: Procedure[], other: Procedure[]): boolean {
        return value.length !== other.length
            || zip(value, other).some((procs: [Procedure, Procedure]) => {
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
    private order: number;
    private websites: Website[] = [];

    static buildIri(uniqueId: string): Iri {
        return new Iri(`http://data.lblod.info/id/rule/${uniqueId}`);
    }

    static from(procedure: Procedure): ProcedureBuilder {
        return new ProcedureBuilder()
            .withId(procedure.id)
            .withUuid(procedure.uuid)
            .withTitle(procedure.title)
            .withDescription(procedure.description)
            .withOrder(procedure.order)
            .withWebsites(procedure.websites);
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

    public withOrder(order: number): ProcedureBuilder {
        this.order = order;
        return this;
    }

    public withWebsites(websites: Website[]): ProcedureBuilder {
        this.websites = websites;
        return this;
    }

    public build(): Procedure {
        return Procedure.reconstitute(
            this.id,
            this.uuid,
            this.title,
            this.description,
            this.order,
            this.websites,
        );
    }
}
