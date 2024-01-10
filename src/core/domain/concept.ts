import {Iri} from "./shared/iri";
import {LanguageString} from "./language-string";
import {FormatPreservingDate} from "./format-preserving-date";
import {Requirement} from "./requirement";
import {Procedure} from "./procedure";
import {Website} from "./website";
import {Cost} from "./cost";
import {FinancialAdvantage} from "./financial-advantage";
import {asSortedArray} from "./shared/collections-helper";
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
import {Invariant, requiredValue} from "./shared/invariant";
import {uniqBy} from "lodash";

export class Concept {

    private readonly _id: Iri;
    private readonly _uuid: string; //required for mu-cl-resources.
    private readonly _title: LanguageString;
    private readonly _description: LanguageString;
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
    private readonly _productId: string;
    private readonly _latestConceptSnapshot: Iri;
    private readonly _previousConceptSnapshots: Iri[];
    private readonly _latestFunctionallyChangedConceptSnapshot: Iri;
    private readonly _conceptTags: ConceptTagType[];
    private readonly _isArchived: boolean;
    private readonly _legalResources: Iri[];

    constructor(id: Iri,
                uuid: string,
                title: LanguageString,
                description: LanguageString,
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
                productId: string,
                latestConceptSnapshot: Iri,
                previousConceptSnapshots: Iri[],
                latestFunctionallyChangedConceptSnapshot: Iri,
                conceptTags: ConceptTagType[],
                isArchived: boolean,
                legalResources: Iri[],
    ) {
        //TODO LPDC-916: enforce invariants ? + do safe copies ? + list have only unique values
        this._id = requiredValue(id, 'id');
        this._uuid = requiredValue(uuid, 'uuid');

        requiredValue(title, 'title');
        requiredValue(title.nl, 'nl version in title');
        const invariant3ConceptLanguages = Invariant.require(title.definedLanguages, 'conceptLanguages');
        invariant3ConceptLanguages.to(invariant3ConceptLanguages.haveAtLeastXAmountOfValues(3));
        this._title = title;

        requiredValue(description, 'description');
        requiredValue(description.nl, 'nl version in description');
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
        this._competentAuthorities = asSortedArray(competentAuthorities, Iri.compare);
        this._executingAuthorityLevels = asSortedArray(executingAuthorityLevels);
        this._executingAuthorities = asSortedArray(executingAuthorities, Iri.compare);
        this._publicationMedia = asSortedArray(publicationMedia);
        this._yourEuropeCategories = asSortedArray(yourEuropeCategories);
        this._keywords = asSortedArray(keywords, LanguageString.compare);
        this._requirements = [...requirements].map(Requirement.forConcept);
        this._procedures = [...procedures].map(Procedure.forConcept);
        this._websites = [...websites].map(Website.forConcept);
        this._costs = [...costs].map(Cost.forConcept);
        this._financialAdvantages = [...financialAdvantages].map(FinancialAdvantage.forConcept);
        this._productId = requiredValue(productId, 'productId');
        this._latestConceptSnapshot = requiredValue(latestConceptSnapshot, 'latestConceptSnapshot');
        this._previousConceptSnapshots = asSortedArray(previousConceptSnapshots, Iri.compare);
        this._latestFunctionallyChangedConceptSnapshot = requiredValue(latestFunctionallyChangedConceptSnapshot, 'latestFunctionallyChangedConceptSnapshot');
        this._conceptTags = asSortedArray(conceptTags);
        this._isArchived = requiredValue(isArchived, 'isArchived');
        this._legalResources = asSortedArray(legalResources, Iri.compare);
    }

    get conceptLanguages(): Language[] {
        return this._title.definedLanguages;
    }

    get appliedSnapshots(): Iri[] {
        return uniqBy([this._latestConceptSnapshot, ...this._previousConceptSnapshots], (iri) => iri.value);
    }

    get id(): Iri {
        return this._id;
    }

    get uuid(): string {
        return this._uuid;
    }

    get title(): LanguageString {
        return this._title;
    }

    get description(): LanguageString {
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
        return this._targetAudiences;
    }

    get themes(): ThemeType[] {
        return this._themes;
    }

    get competentAuthorityLevels(): CompetentAuthorityLevelType[] {
        return this._competentAuthorityLevels;
    }

    get competentAuthorities(): Iri[] {
        return this._competentAuthorities;
    }

    get executingAuthorityLevels(): ExecutingAuthorityLevelType[] {
        return this._executingAuthorityLevels;
    }

    get executingAuthorities(): Iri[] {
        return this._executingAuthorities;
    }

    get publicationMedia(): PublicationMediumType[] {
        return this._publicationMedia;
    }

    get yourEuropeCategories(): YourEuropeCategoryType[] {
        return this._yourEuropeCategories;
    }

    get keywords(): LanguageString[] {
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

    get productId(): string {
        return this._productId;
    }

    get latestConceptSnapshot(): Iri {
        return this._latestConceptSnapshot;
    }

    get previousConceptSnapshots(): Iri[] {
        return this._previousConceptSnapshots;
    }

    get latestFunctionallyChangedConceptSnapshot(): Iri {
        return this._latestFunctionallyChangedConceptSnapshot;
    }

    get conceptTags(): ConceptTagType[] {
        return this._conceptTags;
    }

    get isArchived(): boolean {
        return this._isArchived;
    }

    get legalResources(): Iri[] {
        return this._legalResources;
    }

}