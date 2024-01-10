import {Iri} from "./shared/iri";
import {LanguageString} from "./language-string";
import _ from 'lodash';
import {Requirement} from "./requirement";
import {asSortedArray} from "./shared/collections-helper";
import {Procedure} from "./procedure";
import {Website} from "./website";
import {Cost} from "./cost";
import {FinancialAdvantage} from "./financial-advantage";
import {FormatPreservingDate} from "./format-preserving-date";
import {
    CompetentAuthorityLevelType,
    ConceptTagType,
    ExecutingAuthorityLevelType,
    ProductType,
    PublicationMediumType,
    SnapshotType,
    TargetAudienceType,
    ThemeType,
    YourEuropeCategoryType
} from "./types";
import {requiredValue} from "./shared/invariant";

export class ConceptSnapshot {

    private readonly _id: Iri;
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
    private readonly _isVersionOfConcept: Iri | undefined;
    private readonly _dateCreated: FormatPreservingDate | undefined;
    private readonly _dateModified: FormatPreservingDate | undefined;
    private readonly _generatedAtTime: FormatPreservingDate | undefined;
    private readonly _productId: string;
    private readonly _snapshotType: SnapshotType | undefined;
    private readonly _conceptTags: ConceptTagType[];
    private readonly _legalResources: Iri[];

    constructor(id: Iri,
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
                isVersionOfConcept: Iri,
                dateCreated: FormatPreservingDate | undefined,
                dateModified: FormatPreservingDate | undefined,
                generatedAtTime: FormatPreservingDate | undefined,
                productId: string,
                snapshotType: SnapshotType | undefined,
                conceptTags: ConceptTagType[],
                legalResources: Iri[],
    ) {
        //TODO LPDC-917: enforce invariants ? + do safe copies ?
        this._id = requiredValue(id, 'id');
        requiredValue(title, 'title');
        requiredValue(title.nl, 'nl version in title');
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
        this._competentAuthorities = asSortedArray(competentAuthorities);
        this._executingAuthorityLevels = asSortedArray(executingAuthorityLevels);
        this._executingAuthorities = asSortedArray(executingAuthorities);
        this._publicationMedia = asSortedArray(publicationMedia);
        this._yourEuropeCategories = asSortedArray(yourEuropeCategories);
        this._keywords = asSortedArray(keywords, LanguageString.compare);
        this._requirements = [...requirements].map(Requirement.forConceptSnapshot);
        this._procedures = [...procedures].map(Procedure.forConceptSnapshot);
        this._websites = [...websites].map(Website.forConceptSnapshot);
        this._costs = [...costs].map(Cost.forConceptSnapshot);
        this._financialAdvantages = [...financialAdvantages].map(FinancialAdvantage.forConceptSnapshot);
        this._isVersionOfConcept = isVersionOfConcept;
        this._dateCreated = dateCreated;
        this._dateModified = dateModified;
        this._generatedAtTime = generatedAtTime;
        this._productId = requiredValue(productId, 'productId');
        this._snapshotType = snapshotType;
        this._conceptTags = asSortedArray(conceptTags);
        this._legalResources = asSortedArray(legalResources);
    }

    get id(): Iri {
        return this._id;
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

    get isVersionOfConcept(): Iri | undefined {
        return this._isVersionOfConcept;
    }

    get dateCreated(): FormatPreservingDate | undefined {
        return this._dateCreated;
    }

    get dateModified(): FormatPreservingDate | undefined {
        return this._dateModified;
    }

    get generatedAtTime(): FormatPreservingDate | undefined {
        return this._generatedAtTime;
    }

    get identifier(): string | undefined {
        return this.id.value.substring(this.id.value.lastIndexOf('/') + 1);
    }

    get productId(): string {
        return this._productId;
    }

    get snapshotType(): SnapshotType | undefined {
        return this._snapshotType;
    }

    get conceptTags(): ConceptTagType[] {
        return this._conceptTags;
    }

    get legalResources(): Iri[] {
        return this._legalResources;
    }

    static isFunctionallyChanged(value: ConceptSnapshot, other: ConceptSnapshot): boolean {
        return LanguageString.isFunctionallyChanged(value.title, other.title)
            || LanguageString.isFunctionallyChanged(value.description, other.description)
            || LanguageString.isFunctionallyChanged(value.additionalDescription, other.additionalDescription)
            || LanguageString.isFunctionallyChanged(value.exception, other.exception)
            || LanguageString.isFunctionallyChanged(value.regulation, other.regulation)
            || FormatPreservingDate.isFunctionallyChanged(value.startDate, other.startDate)
            || FormatPreservingDate.isFunctionallyChanged(value.endDate, other.endDate)
            || value.type !== other.type
            || !_.isEqual(value.targetAudiences, other.targetAudiences)
            || !_.isEqual(value.themes, other.themes)
            || !_.isEqual(value.competentAuthorityLevels, other.competentAuthorityLevels)
            || !_.isEqual(value.competentAuthorities, other.competentAuthorities)
            || !_.isEqual(value.executingAuthorityLevels, other.executingAuthorityLevels)
            || !_.isEqual(value.executingAuthorities, other.executingAuthorities)
            || !_.isEqual(value.publicationMedia, other.publicationMedia)
            || !_.isEqual(value.yourEuropeCategories, other.yourEuropeCategories)
            || !_.isEqual(value.keywords, other.keywords)
            || Requirement.isFunctionallyChanged(value.requirements, other.requirements)
            || Procedure.isFunctionallyChanged(value.procedures, other.procedures)
            || Website.isFunctionallyChanged(value.websites, other.websites)
            || Cost.isFunctionallyChanged(value.costs, other.costs)
            || FinancialAdvantage.isFunctionallyChanged(value.financialAdvantages, other.financialAdvantages);
    }

}

