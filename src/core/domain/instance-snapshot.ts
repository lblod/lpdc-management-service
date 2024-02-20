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
import {requiredAtLeastOneValuePresent, requiredValue, requireNoDuplicates} from "./shared/invariant";
import {instanceLanguages} from "./language";

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
        this._id = requiredValue(id, 'id');
        this._createdBy = requiredValue(createdBy, 'createdBy');
        this._title = requiredValue(title, 'title');
        this._description = requiredValue(description, 'description');
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
        this._requirements = [...requirements].map(r => Requirement.forInstanceSnapshot(r));
        requireNoDuplicates(this._requirements.map(r => r.order), 'requirements > order');
        this._procedures = [...procedures];
        requireNoDuplicates(this._procedures.map(r => r.order), 'procedures > order');
        this._websites = [...websites].map(w => Website.forInstanceSnapshot(w));
        requireNoDuplicates(this._websites.map(w => w.order), 'websites > order');
        this._costs = [...costs].map(c => Cost.forInstanceSnapshot(c));
        requireNoDuplicates(this._costs.map(w => w.order), 'costs > order');
        this._financialAdvantages = [...financialAdvantages].map(fa => FinancialAdvantage.forInstanceSnapshot(fa));
        requireNoDuplicates(this._financialAdvantages.map(fa => fa.order), 'financial advantages > order');
        this._contactPoints = [...contactPoints].map(cp => ContactPoint.forInstanceSnapshot(cp));
        requireNoDuplicates(this._contactPoints.map(cp => cp.order), 'contact points > order');
        this._conceptId = conceptId;
        this._languages = requireNoDuplicates(asSortedArray(languages), 'languages');
        this._isVersionOfInstance = requiredValue(isVersionOfInstance, 'isVersionOfInstance');
        this._dateCreated = requiredValue(dateCreated, 'dateCreated');
        this._dateModified = requiredValue(dateModified, 'dateModified');
        this._generatedAtTime = requiredValue(generatedAtTime, 'generatedAtTime');
        this._isArchived = requiredValue(isArchived, 'isArchived');
        this._spatials = requireNoDuplicates(asSortedArray(spatials), 'spatials');
        this._legalResources = requireNoDuplicates(asSortedArray(legalResources), 'legalResources');
        this.validateLanguages();
    }

    private validateLanguages(): void {
        const values = [
            this._title,
            this._description,
            this._additionalDescription,
            this._exception,
            this._regulation
        ];
        LanguageString.validateUniqueAndCorrectLanguages(instanceLanguages, ...values);

        requiredAtLeastOneValuePresent(LanguageString.extractNlLanguages(values), 'Fields in nl language');

        const nlLanguages = LanguageString.extractNlLanguages(values);
        const allNlLanguages = new Set([
            ...nlLanguages,
            ...this._requirements.map(r => r.nlLanguage),
            ...this._procedures.map(p => p.nlLanguage),
            ...this._websites.map(w => w.nlLanguage),
            ...this._costs.map(c => c.nlLanguage),
            ...this._financialAdvantages.map(fa => fa.nlLanguage),
        ].filter(ls => ls !== undefined));

        if (allNlLanguages.size > 1) {
            throw new Error('There is more than one Nl language present');
        }
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
        return [...this._languages];
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