import {Iri} from "./shared/iri";
import {TaalString} from "./taal-string";
import {FormatPreservingDate} from "./format-preserving-date";
import {Requirement} from "./requirement";
import {Procedure} from "./procedure";
import {Website} from "./website";
import {Cost} from "./cost";
import {FinancialAdvantage} from "./financial-advantage";
import {asSortedArray, asSortedSet} from "./shared/collections-helper";
import {
    CompetentAuthorityLevelType,
    ExecutingAuthorityLevelType,
    ProductType,
    PublicationMediumType,
    TargetAudienceType,
    ThemeType,
    YourEuropeCategoryType
} from "./types";


export class Concept {

    private readonly _id: Iri;
    private readonly _title: TaalString | undefined;
    private readonly _description: TaalString | undefined;
    private readonly _additionalDescription: TaalString | undefined;
    private readonly _exception: TaalString | undefined;
    private readonly _regulation: TaalString | undefined;
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
    private readonly _keywords: TaalString[];
    private readonly _requirements: Requirement[];
    private readonly _procedures: Procedure[];
    private readonly _websites: Website[];
    private readonly _costs: Cost[];
    private readonly _financialAdvantages: FinancialAdvantage[];
    private readonly _productId: string | undefined;

    constructor(id: Iri,
                title: TaalString | undefined,
                description: TaalString | undefined,
                additionalDescription: TaalString | undefined,
                exception: TaalString | undefined,
                regulation: TaalString | undefined,
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
                keywords: TaalString[],
                requirements: Requirement[],
                procedures: Procedure[],
                websites: Website[],
                costs: Cost[],
                financialAdvantages: FinancialAdvantage[],
                productId: string | undefined,
    ) {
        //TODO LPDC-916: enforce invariants ? + do safe copies ?
        this._id = id;
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
        this._keywords = asSortedArray([...keywords], TaalString.compare);
        this._requirements = [...requirements];
        this._procedures = [...procedures];
        this._websites = [...websites];
        this._costs = [...costs];
        this._financialAdvantages = [...financialAdvantages];
        this._productId = productId;
    }

    get id(): Iri {
        return this._id;
    }

    get title(): TaalString | undefined {
        return this._title;
    }

    get description(): TaalString | undefined {
        return this._description;
    }

    get additionalDescription(): TaalString | undefined {
        return this._additionalDescription;
    }

    get exception(): TaalString | undefined {
        return this._exception;
    }

    get regulation(): TaalString | undefined {
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

    get keywords(): TaalString[] {
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

}