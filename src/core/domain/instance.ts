import {Iri} from "./shared/iri";
import {LanguageString} from "./language-string";
import {requiredValue, requireNoDuplicates} from "./shared/invariant";
import {FormatPreservingDate} from "./format-preserving-date";
import {
    CompetentAuthorityLevelType,
    ExecutingAuthorityLevelType,
    InstancePublicationStatusType,
    InstanceReviewStatusType,
    InstanceStatusType,
    LanguageType,
    ProductType,
    PublicationMediumType,
    TargetAudienceType,
    ThemeType,
    YourEuropeCategoryType
} from "./types";
import {asSortedArray} from "./shared/collections-helper";
import {Requirement} from "./requirement";
import {Procedure} from "./procedure";
import {Website} from "./website";
import {Cost} from "./cost";
import {FinancialAdvantage} from "./financial-advantage";
import {ContactPoint} from "./contactPoint";
import {Language} from "./language";

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
    private readonly _source: Iri | undefined;
    private readonly _versionedSource: Iri | undefined;
    private readonly _languages: LanguageType[];
    private readonly _dateCreated: FormatPreservingDate;
    private readonly _dateModified: FormatPreservingDate;
    private readonly _status: InstanceStatusType;
    private readonly _reviewStatus: InstanceReviewStatusType | undefined;
    private readonly _publicationStatus: InstancePublicationStatusType | undefined;
    private readonly _spatials: Iri[];
    private readonly _legalResources: Iri[];

    // TODO LPDC-917: title, description - languageStrings should contain only one language version and should be the same for all (en, nl, nlFormal, nlInformal are allowed ...)
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
                source: Iri | undefined,
                versionedSource: Iri | undefined,
                languages: LanguageType[],
                dateCreated: FormatPreservingDate,
                dateModified: FormatPreservingDate,
                status: InstanceStatusType,
                reviewStatus: InstanceReviewStatusType,
                publicationStatus: InstancePublicationStatusType,
                spatials: Iri[],
                legalResources: Iri[]
    ) {
        this.validateLanguages(title,description);

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
        this._targetAudiences = requireNoDuplicates(asSortedArray(targetAudiences), 'targetAudiences');
        this._themes = requireNoDuplicates(asSortedArray(themes), 'themes');
        this._competentAuthorityLevels = requireNoDuplicates(asSortedArray(competentAuthorityLevels), 'competentAuthorityLevels');
        this._competentAuthorities = requireNoDuplicates(asSortedArray(competentAuthorities), 'competentAuthorities');
        this._executingAuthorityLevels = requireNoDuplicates(asSortedArray(executingAuthorityLevels), 'executingAuthorityLevels');
        this._executingAuthorities = requireNoDuplicates(asSortedArray(executingAuthorities), 'executingAuthorities');
        this._publicationMedia = requireNoDuplicates(asSortedArray(publicationMedia), 'publicationMedia');
        this._yourEuropeCategories = requireNoDuplicates(asSortedArray(yourEuropeCategories), 'yourEuropeCategories');
        this._keywords = requireNoDuplicates(asSortedArray(keywords, LanguageString.compare), 'keywords');
        this._requirements = [...requirements].map(Requirement.forInstance);
        this._procedures = [...procedures].map(Procedure.forInstance);
        this._websites = [...websites].map(Website.forInstance);
        this._costs = [...costs].map(Cost.forInstance);
        this._financialAdvantages = [...financialAdvantages].map(FinancialAdvantage.forInstance);
        this._contactPoints = [...contactPoints];
        this._source = source;
        this._versionedSource = versionedSource; //TODO LPDC-917: should be required when source is defined
        this._languages = requireNoDuplicates(asSortedArray(languages), 'languages');
        this._dateCreated = requiredValue(dateCreated, 'dateCreated');
        this._dateModified = requiredValue(dateModified, 'dateModified');
        this._status = requiredValue(status, 'status');
        this._reviewStatus = reviewStatus;
        this._publicationStatus = publicationStatus;
        this._spatials = requireNoDuplicates(asSortedArray(spatials), 'spatials');
        this._legalResources = requireNoDuplicates(asSortedArray(legalResources, Iri.compare), 'legalResources');
    }

    private validateLanguages(...values : LanguageString[]): void {
        const languages = new Set();

        values.filter(ls => ls !== undefined);
        values.forEach(val => languages.add(val.getDefinedNlLanguages()));

        if(languages.size>1){
            throw new Error('More then 1 nl-language is present');
        }
    }

    get instanceDutchLanguage(): Language | undefined {
        // TODO 917: Language can also be included in requirements, procedures, websites, costs, ...
        const dutchLanguages =
            [
                this._title,
                this._description,
                this._additionalDescription,
                this._exception,
                this._regulation,
            ]
                .filter(ls => ls !== undefined)
                .flatMap(ls => ls.definedLanguages)
                .filter(l => l !== Language.EN);
        return dutchLanguages[0];
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

    get source(): Iri | undefined {
        return this._source;
    }

    get versionedSource(): Iri |undefined{
        return this._versionedSource;
    }

    get languages(): LanguageType[] {
        return this._languages;
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

    get reviewStatus(): InstanceReviewStatusType {
        return this._reviewStatus;
    }

    get publicationStatus(): InstancePublicationStatusType {
        return this._publicationStatus;
    }

    get spatials(): Iri[] {
        return [...this._spatials];
    }

    get legalResources(): Iri[] {
        return [...this._legalResources];
    }
}