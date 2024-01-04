import {Iri, requiredIri} from "./shared/iri";
import {LanguageString} from "./language-string";
import {FormatPreservingDate} from "./format-preserving-date";
import {Requirement} from "./requirement";
import {Procedure} from "./procedure";
import {Website} from "./website";
import {Cost} from "./cost";
import {FinancialAdvantage} from "./financial-advantage";
import {asSortedSet} from "./shared/collections-helper";
import {
    CompetentAuthorityLevelType,
    ConceptTagType,
    ExecutingAuthorityLevelType,
    ProductType,
    PublicationMediumType,
    TargetAudienceType,
    ThemeType,
    YourEuropeCategoryType
} from "./types";
import {Language} from "./language";
import {Invariant} from "./shared/invariant";

export class Concept {

    private readonly _id: Iri;
    private readonly _uuid: string | undefined; //required for mu-cl-resources.
    private readonly _title: LanguageString | undefined; //TODO: invariant nl present and cannot be blank or undefined and remove undefined
    private readonly _description: LanguageString | undefined; //TODO: invariant nl present and cannot be blank or undefined and remove undefined
    private readonly _additionalDescription: LanguageString | undefined;
    private readonly _exception: LanguageString | undefined;
    private readonly _regulation: LanguageString | undefined;
    private readonly _startDate: FormatPreservingDate | undefined;
    private readonly _endDate: FormatPreservingDate | undefined;
    private readonly _type: ProductType | undefined;
    private readonly _targetAudiences: Set<TargetAudienceType>;
    private readonly _themes: Set<ThemeType>;
    private readonly _competentAuthorityLevels: Set<CompetentAuthorityLevelType>;
    private readonly _competentAuthorities: Set<Iri>;
    private readonly _executingAuthorityLevels: Set<ExecutingAuthorityLevelType>;
    private readonly _executingAuthorities: Set<Iri>;
    private readonly _publicationMedia: Set<PublicationMediumType>;
    private readonly _yourEuropeCategories: Set<YourEuropeCategoryType>;
    private readonly _keywords: Set<LanguageString>;
    private readonly _requirements: Requirement[];
    private readonly _procedures: Procedure[];
    private readonly _websites: Website[]; //TODO: invariant id and title, url need to be present
    private readonly _costs: Cost[];
    private readonly _financialAdvantages: FinancialAdvantage[];
    private readonly _productId: string | undefined;
    private readonly _latestConceptSnapshot: Iri;
    private readonly _previousConceptSnapshots: Set<Iri>;
    private readonly _latestFunctionallyChangedConceptSnapshot: Iri;
    private readonly _conceptTags: Set<ConceptTagType>;
    private readonly _isArchived: boolean;
    private readonly _legalResources: Set<Iri>;

    constructor(id: Iri,
                uuid: string | undefined,
                title: LanguageString | undefined,
                description: LanguageString | undefined,
                additionalDescription: LanguageString | undefined,
                exception: LanguageString | undefined,
                regulation: LanguageString | undefined,
                startDate: FormatPreservingDate | undefined,
                endDate: FormatPreservingDate | undefined,
                type: ProductType | undefined,
                targetAudiences: Set<TargetAudienceType>,
                themes: Set<ThemeType>,
                competentAuthorityLevels: Set<CompetentAuthorityLevelType>,
                competentAuthorities: Set<Iri>,
                executingAuthorityLevels: Set<ExecutingAuthorityLevelType>,
                executingAuthorities: Set<Iri>,
                publicationMedia: Set<PublicationMediumType>,
                yourEuropeCategories: Set<YourEuropeCategoryType>,
                keywords: Set<LanguageString>,
                requirements: Requirement[],
                procedures: Procedure[],
                websites: Website[],
                costs: Cost[],
                financialAdvantages: FinancialAdvantage[],
                productId: string | undefined,
                latestConceptSnapshot: Iri,
                previousConceptSnapshots: Set<Iri>,
                latestFunctionallyChangedConceptSnapshot: Iri,
                conceptTags: Set<ConceptTagType>,
                isArchived: boolean,
                legalResources: Set<Iri>,
    ) {
        //TODO LPDC-916: enforce invariants ? + do safe copies ?
        this._id = requiredIri(id, 'id');
        this._uuid = uuid;
        this._title = title;
        this._description = description;
        this._additionalDescription = additionalDescription;
        this._exception = exception;
        this._regulation = regulation;
        this._startDate = startDate;
        this._endDate = endDate;
        this._type = type;
        this._targetAudiences = asSortedSet(targetAudiences);
        this._themes = asSortedSet(themes);
        this._competentAuthorityLevels = asSortedSet(competentAuthorityLevels);
        this._competentAuthorities = asSortedSet(competentAuthorities);
        this._executingAuthorityLevels = asSortedSet(executingAuthorityLevels);
        this._executingAuthorities = asSortedSet(executingAuthorities);
        this._publicationMedia = asSortedSet(publicationMedia);
        this._yourEuropeCategories = asSortedSet(yourEuropeCategories);
        this._keywords = asSortedSet(keywords, LanguageString.compare);
        this._requirements = [...requirements];
        this._procedures = [...procedures];
        this._websites = [...websites];
        this._costs = [...costs];
        this._financialAdvantages = [...financialAdvantages];
        this._productId = productId;
        this._latestConceptSnapshot = latestConceptSnapshot;
        this._previousConceptSnapshots = asSortedSet(previousConceptSnapshots);
        this._latestFunctionallyChangedConceptSnapshot = latestFunctionallyChangedConceptSnapshot;
        this._conceptTags = asSortedSet(conceptTags);
        this._isArchived = isArchived;
        this._legalResources = asSortedSet(legalResources);
    }

    get conceptLanguages(): Set<Language> | undefined {
        //TODO LPDC-916 don't use the optional operator anymore + remove | undefined from return type
        return this._title?.definedLanguages;
        //TODO LPDC-916 validate title has 3 languageVersions
        //TODO LPDC-916 make title required
    }

    get appliedSnapshots(): Set<Iri> {
        return new Set([this._latestConceptSnapshot, ...this._previousConceptSnapshots]);
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

    get targetAudiences(): Set<TargetAudienceType> {
        return this._targetAudiences;
    }

    get themes(): Set<ThemeType> {
        return this._themes;
    }

    get competentAuthorityLevels(): Set<CompetentAuthorityLevelType> {
        return this._competentAuthorityLevels;
    }

    get competentAuthorities(): Set<Iri> {
        return this._competentAuthorities;
    }

    get executingAuthorityLevels(): Set<ExecutingAuthorityLevelType> {
        return this._executingAuthorityLevels;
    }

    get executingAuthorities(): Set<Iri> {
        return this._executingAuthorities;
    }

    get publicationMedia(): Set<PublicationMediumType> {
        return this._publicationMedia;
    }

    get yourEuropeCategories(): Set<YourEuropeCategoryType> {
        return this._yourEuropeCategories;
    }

    get keywords(): Set<LanguageString> {
        return this._keywords;
    }

    get requirements(): Requirement[] {
        return this._requirements;
    }

    get procedures(): Procedure[] {
        return this._procedures;
    }

    get websites(): Website[] {
        return this._websites;
    }

    get costs(): Cost[] {
        return this._costs;
    }

    get financialAdvantages(): FinancialAdvantage[] {
        return this._financialAdvantages;
    }

    get productId(): string | undefined {
        return this._productId;
    }

    get latestConceptSnapshot(): Iri {
        return this._latestConceptSnapshot;
    }

    get previousConceptSnapshots(): Set<Iri> {
        return this._previousConceptSnapshots;
    }

    get latestFunctionallyChangedConceptSnapshot(): Iri {
        return this._latestFunctionallyChangedConceptSnapshot;
    }

    get conceptTags(): Set<ConceptTagType> {
        return this._conceptTags;
    }

    get isArchived(): boolean {
        return this._isArchived;
    }

    get legalResources(): Set<Iri> {
        return this._legalResources;
    }

}