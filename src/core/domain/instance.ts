import {Iri} from "./shared/iri";
import {LanguageString} from "./language-string";
import {requiredValue} from "./shared/invariant";
import {FormatPreservingDate} from "./format-preserving-date";
import {InstanceStatusType} from "./types";

export class Instance {
    private readonly _id: Iri;
    private readonly _uuid: string; //required for mu-cl-resources.
    private readonly _bestuurseenheidId: Iri;
    private readonly _title: LanguageString | undefined;
    private readonly _description: LanguageString | undefined;
    private readonly _dateCreated: FormatPreservingDate;
    private readonly _dateModified: FormatPreservingDate;
    private readonly _status: InstanceStatusType;

    constructor(id: Iri,
                uuid: string,
                bestuurseenheidId: Iri,
                title: LanguageString | undefined,
                description: LanguageString | undefined,
                dateCreated: FormatPreservingDate,
                dateModified: FormatPreservingDate,
                status: InstanceStatusType,
    ) {
        this._id = requiredValue(id, 'id');
        this._uuid = requiredValue(uuid, 'uuid');
        this._bestuurseenheidId = requiredValue(bestuurseenheidId, 'bestuurseenheidId');
        this._title = title;
        this._description = description;
        this._dateCreated = requiredValue(dateCreated, 'dateCreated');
        this._dateModified = requiredValue(dateModified, 'dateModified');
        this._status = requiredValue(status, 'status');
    }

    get id(): Iri {
        return this._id;
    }

    get uuid(): string {
        return this._uuid;
    }

    get bestuurseenheidId(): Iri {
        return this._bestuurseenheidId;
    }

    get title(): LanguageString | undefined {
        return this._title;
    }

    get description(): LanguageString | undefined {
        return this._description;
    }

    get dateCreated(): FormatPreservingDate {
        return this._dateCreated;
    }

    get dateModified(): FormatPreservingDate {
        return this._dateModified;
    }

    get status(): InstanceStatusType {
        return this._status;
    }
}