import {Iri} from "./shared/iri";
import {LanguageString} from "./language-string";
import {requiredValue, requireNoDuplicates} from "./shared/invariant";
import {FormatPreservingDate} from "./format-preserving-date";
import {InstanceStatusType, ProductType} from "./types";
import {asSortedArray} from "./shared/collections-helper";

export class Instance {

    private readonly _id: Iri;
    private readonly _uuid: string; //required for mu-cl-resources.
    private readonly _createdBy: Iri;
    private readonly _title: LanguageString | undefined;
    private readonly _description: LanguageString | undefined;
    private readonly _additionalDescription: LanguageString | undefined;
    private readonly _exception: LanguageString | undefined;
    private readonly _regulation: LanguageString | undefined;
    private readonly _startDate: FormatPreservingDate | undefined;
    private readonly _endDate: FormatPreservingDate | undefined;
    private readonly _type: ProductType | undefined;
    private readonly _dateCreated: FormatPreservingDate;
    private readonly _dateModified: FormatPreservingDate;
    private readonly _status: InstanceStatusType;
    private readonly _spatials: Iri[];
    private readonly _competentAuthorities: Iri[];
    private readonly _executingAuthorities: Iri[];

    // TODO LPDC-917: title, description - languageStrings should contain only one language version and should be the same for all
    constructor(id: Iri,
                uuid: string,
                createdBy: Iri,
                title: LanguageString | undefined,
                description: LanguageString | undefined,
                additionalDescription: LanguageString | undefined,
                exception: LanguageString | undefined,
                regulation: LanguageString | undefined,
                startDate: FormatPreservingDate | undefined,
                endDate: FormatPreservingDate | undefined,
                type: ProductType | undefined,
                dateCreated: FormatPreservingDate,
                dateModified: FormatPreservingDate,
                status: InstanceStatusType,
                spatials: Iri[],
                competentAuthorities: Iri[],
                executingAuthorities: Iri[],

    ) {
        this._id = requiredValue(id, 'id');
        this._uuid = requiredValue(uuid, 'uuid');
        this._createdBy = requiredValue(createdBy, 'createdBy');
        this._title = title;
        this._description = description;
        this._additionalDescription = additionalDescription;
        this._exception = exception;
        this._regulation = regulation;
        this._startDate = startDate;
        this._endDate = endDate;
        this._type = type;
        this._dateCreated = requiredValue(dateCreated, 'dateCreated');
        this._dateModified = requiredValue(dateModified, 'dateModified');
        this._status = requiredValue(status, 'status');
        this._spatials = requireNoDuplicates(asSortedArray(spatials), 'spatials');
        this._competentAuthorities = requireNoDuplicates(asSortedArray(competentAuthorities), 'competentAuthorities');
        this._executingAuthorities = requireNoDuplicates(asSortedArray(executingAuthorities), 'executingAuthorities');
    }

    get id(): Iri {
        return this._id;
    }

    get uuid(): string {
        return this._uuid;
    }

    get createdBy(): Iri {
        return this._createdBy;
    }

    get title(): LanguageString | undefined {
        return this._title;
    }

    get description(): LanguageString | undefined {
        return this._description;
    }

    get additionalDescription(): LanguageString | undefined {
        return this._additionalDescription;
    }

    get exception(): LanguageString | undefined {
        return this._exception;
    }

    get regulation(): LanguageString | undefined {
        return this._regulation;
    }

    get startDate(): FormatPreservingDate | undefined {
        return this._startDate;
    }

    get endDate(): FormatPreservingDate | undefined {
        return this._endDate;
    }

    get type(): ProductType | undefined {
        return this._type;
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

    get spatials(): Iri[] {
        return [...this._spatials];
    }

    get competentAuthorities(): Iri[] {
        return [...this._competentAuthorities];
    }

    get executingAuthorities(): Iri[] {
        return [...this._executingAuthorities];
    }

}