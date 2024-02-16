import {Iri} from "./shared/iri";
import {LanguageString} from "./language-string";
import {FormatPreservingDate} from "./format-preserving-date";
import {
    CompetentAuthorityLevelType,
    ExecutingAuthorityLevelType,
    LanguageType,
    ProductType,
    PublicationMediumType,
    TargetAudienceType,
    ThemeType,
    YourEuropeCategoryType
} from "./types";
import {Requirement} from "./requirement";
import {Procedure} from "./procedure";
import {Website} from "./website";
import {Cost} from "./cost";
import {FinancialAdvantage} from "./financial-advantage";
import {ContactPoint} from "./contact-point";
import {asSortedArray} from "./shared/collections-helper";

export class InstanceSnapshot {

    private readonly _id: Iri;
    private readonly _createdBy: Iri;
    private readonly _title: LanguageString | undefined;
    private readonly _description: LanguageString | undefined;
    private readonly _additionalDescription: LanguageString | undefined;
    private readonly _exception: LanguageString | undefined;
    private readonly _regulation: LanguageString | undefined;
    private readonly _startDate: FormatPreservingDate | undefined;
    private readonly _endDate: FormatPreservingDate | undefined;
    private readonly _type: ProductType | undefined;
    private readonly _targetAudiences: TargetAudienceType[];
    private readonly _themes: ThemeType[];
    private readonly _competentAuthorityLevels: CompetentAuthorityLevelType[];
    private readonly _competentAuthorities: Iri[];
    private readonly _executingAuthorityLevels: ExecutingAuthorityLevelType[];
    private readonly _executingAuthorities: Iri[];
    private readonly _publicationMedia: PublicationMediumType[];
    private readonly _yourEuropeCategories: YourEuropeCategoryType[];
    private readonly _keywords: LanguageString[];
    private readonly _requirements: Requirement[];
    private readonly _procedures: Procedure[];
    private readonly _websites: Website[];
    private readonly _costs: Cost[];
    private readonly _financialAdvantages: FinancialAdvantage[];
    private readonly _contactPoints: ContactPoint[];
    private readonly _conceptId: Iri | undefined;
    private readonly _languages: LanguageType[];
    private readonly _isVersionOfInstance: Iri;
    private readonly _dateCreated: FormatPreservingDate;
    private readonly _dateModified: FormatPreservingDate;
    private readonly _generatedAtTime: FormatPreservingDate;
    private readonly _isArchived: boolean;
    private readonly _spatials: Iri[];
    private readonly _legalResources: Iri[];

    constructor(id: Iri,
                createdBy: Iri,
                title: LanguageString | undefined,
                description: LanguageString | undefined,
                additionalDescription: LanguageString | undefined,
                exception: LanguageString | undefined,
                regulation: LanguageString | undefined,
                startDate: FormatPreservingDate | undefined,
                endDate: FormatPreservingDate | undefined,
                type: ProductType | undefined,
                targetAudiences: TargetAudienceType[],
                themes: ThemeType[],
                competentAuthorityLevels: CompetentAuthorityLevelType[],
                competentAuthorities: Iri[],
                executingAuthorityLevels: ExecutingAuthorityLevelType[],
                executingAuthorities: Iri[],
                publicationMedia: PublicationMediumType[],
                yourEuropeCategories: YourEuropeCategoryType[],
                keywords: LanguageString[],
                requirements: Requirement[],
                procedures: Procedure[],
                websites: Website[],
                costs: Cost[],
                financialAdvantages: FinancialAdvantage[],
                contactPoints: ContactPoint[],
                conceptId: Iri | undefined,
                languages: LanguageType[],
                isVersionOfInstance: Iri,
                dateCreated: FormatPreservingDate,
                dateModified: FormatPreservingDate,
                generatedAtTime: FormatPreservingDate,
                isArchived: boolean,
                spatials: Iri[],
                legalResources: Iri[]
    ) {
        //TODO LPDC-910: verify invariants
        //TODO LPDC-910: safe copy
        this._id = id;
        this._createdBy = createdBy;
        this._title = title;
        this._description = description;
        this._additionalDescription = additionalDescription;
        this._exception = exception;
        this._regulation = regulation;
        this._startDate = startDate;
        this._endDate = endDate;
        this._type = type;
        this._targetAudiences = asSortedArray(targetAudiences);
        this._themes = asSortedArray(themes);
        this._competentAuthorityLevels = asSortedArray(competentAuthorityLevels);
        this._competentAuthorities = asSortedArray(competentAuthorities);
        this._executingAuthorityLevels = asSortedArray(executingAuthorityLevels);
        this._executingAuthorities = asSortedArray(executingAuthorities);
        this._publicationMedia = asSortedArray(publicationMedia);
        this._yourEuropeCategories = yourEuropeCategories;
        this._keywords = keywords;
        this._requirements = requirements;
        this._procedures = procedures;
        this._websites = websites;
        this._costs = costs;
        this._financialAdvantages = financialAdvantages;
        this._contactPoints = contactPoints;
        this._conceptId = conceptId;
        this._languages = languages;
        this._isVersionOfInstance = isVersionOfInstance;
        this._dateCreated = dateCreated;
        this._dateModified = dateModified;
        this._generatedAtTime = generatedAtTime;
        this._isArchived = isArchived;
        this._spatials = spatials;
        this._legalResources = legalResources;
    }

    get id(): Iri {
        return this._id;
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

    get targetAudiences(): TargetAudienceType[] {
        return [...this._targetAudiences];
    }

    get themes(): ThemeType[] {
        return [...this._themes];
    }

    get competentAuthorityLevels(): CompetentAuthorityLevelType[] {
        return [...this._competentAuthorityLevels];
    }

    get competentAuthorities(): Iri[] {
        return [...this._competentAuthorities];
    }

    get executingAuthorityLevels(): ExecutingAuthorityLevelType[] {
        return [...this._executingAuthorityLevels];
    }

    get executingAuthorities(): Iri[] {
        return [...this._executingAuthorities];
    }

    get publicationMedia(): PublicationMediumType[] {
        return [...this._publicationMedia];
    }

    get yourEuropeCategories(): YourEuropeCategoryType[] {
        return [...this._yourEuropeCategories];
    }

    get keywords(): LanguageString[] {
        return [...this._keywords];
    }

    get requirements(): Requirement[] {
        return [...this._requirements];
    }

    get procedures(): Procedure[] {
        return [...this._procedures];
    }

    get websites(): Website[] {
        return [...this._websites];
    }

    get costs(): Cost[] {
        return [...this._costs];
    }

    get financialAdvantages(): FinancialAdvantage[] {
        return [...this._financialAdvantages];
    }

    get contactPoints(): ContactPoint[] {
        return [...this._contactPoints];
    }

    get conceptId(): Iri | undefined {
        return this._conceptId;
    }

    get languages(): LanguageType[] {
        return this._languages;
    }

    get isVersionOfInstance(): Iri {
        return this._isVersionOfInstance;
    }

    get dateCreated(): FormatPreservingDate {
        return this._dateCreated;
    }

    get dateModified(): FormatPreservingDate {
        return this._dateModified;
    }

    get generatedAtTime(): FormatPreservingDate {
        return this._generatedAtTime;
    }

    get isArchived(): boolean {
        return this._isArchived;
    }

    get spatials(): Iri[] {
        return [...this._spatials];
    }

    get legalResources(): Iri[] {
        return [...this._legalResources];
    }


}