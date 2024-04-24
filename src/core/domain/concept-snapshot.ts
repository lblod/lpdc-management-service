import {Iri} from "./shared/iri";
import {LanguageString} from "./language-string";
import {isEqual} from 'lodash';
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
    TargetAudienceType,
    ThemeType,
    YourEuropeCategoryType
} from "./types";
import {requiredValue, requireNoDuplicates} from "./shared/invariant";
import {LegalResource} from "./legal-resource";

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
    private readonly _dateCreated: FormatPreservingDate;
    private readonly _dateModified: FormatPreservingDate;
    private readonly _generatedAtTime: FormatPreservingDate;
    private readonly _productId: string;
    private readonly _conceptTags: ConceptTagType[];
    private readonly _isArchived: boolean;
    private readonly _legalResources: LegalResource[];

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
                dateCreated: FormatPreservingDate,
                dateModified: FormatPreservingDate,
                generatedAtTime: FormatPreservingDate,
                productId: string,
                conceptTags: ConceptTagType[],
                isArchived: boolean,
                legalResources: LegalResource[],
    ) {
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
        this._targetAudiences = requireNoDuplicates(asSortedArray(targetAudiences), 'targetAudiences');
        this._themes = requireNoDuplicates(asSortedArray(themes), 'themes');
        this._competentAuthorityLevels = requireNoDuplicates(asSortedArray(competentAuthorityLevels), 'competentAuthorityLevels');
        this._competentAuthorities = requireNoDuplicates(asSortedArray(competentAuthorities, Iri.compare), 'competentAuthorities');
        this._executingAuthorityLevels = requireNoDuplicates(asSortedArray(executingAuthorityLevels), 'executingAuthorityLevels');
        this._executingAuthorities = requireNoDuplicates(asSortedArray(executingAuthorities, Iri.compare), 'executingAuthorities');
        this._publicationMedia = requireNoDuplicates(asSortedArray(publicationMedia), 'publicationMedia');
        this._yourEuropeCategories = requireNoDuplicates(asSortedArray(yourEuropeCategories), 'yourEuropeCategories');
        this._keywords = requireNoDuplicates(asSortedArray(keywords, LanguageString.compare), 'keywords'); //TODO LPDC-1151 should only contain nl keywords
        this._requirements = [...requirements].map(Requirement.forConceptSnapshot);
        requireNoDuplicates(this._requirements.map(r => r.order), 'requirements > order');
        this._procedures = [...procedures].map(Procedure.forConceptSnapshot);
        requireNoDuplicates(this._procedures.map(p => p.order), 'procedures > order');
        this._websites = [...websites].map(Website.forConceptSnapshot);
        requireNoDuplicates(this._websites.map(w => w.order), 'websites > order');
        this._costs = [...costs].map(Cost.forConceptSnapshot);
        requireNoDuplicates(this._costs.map(c => c.order), 'costs > order');
        this._financialAdvantages = [...financialAdvantages].map(FinancialAdvantage.forConceptSnapshot);
        requireNoDuplicates(this._financialAdvantages.map(fa => fa.order), 'financial advantages > order');
        this._isVersionOfConcept = isVersionOfConcept;
        this._dateCreated = requiredValue(dateCreated, 'dateCreated');
        this._dateModified = requiredValue(dateModified, 'dateModified');
        this._generatedAtTime = requiredValue(generatedAtTime, 'generatedAtTime');
        this._productId = requiredValue(productId, 'productId');
        this._conceptTags = requireNoDuplicates(asSortedArray(conceptTags), 'conceptTags');
        this._isArchived = requiredValue(isArchived, 'isArchived');
        this._legalResources = [...legalResources].map(LegalResource.forConceptSnapshot);
        requireNoDuplicates(this._legalResources.map(lr => lr.order), 'legalResources > order');
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

    get isVersionOfConcept(): Iri | undefined {
        return this._isVersionOfConcept;
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

    get identifier(): string | undefined {
        return this.id.value.substring(this.id.value.lastIndexOf('/') + 1);
    }

    get productId(): string {
        return this._productId;
    }

    get conceptTags(): ConceptTagType[] {
        return [...this._conceptTags];
    }

    get isArchived(): boolean {
        return this._isArchived;
    }

    get legalResources(): LegalResource[] {
        return [...this._legalResources];
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
            || !isEqual(value.targetAudiences, other.targetAudiences)
            || !isEqual(value.themes, other.themes)
            || !isEqual(value.competentAuthorityLevels, other.competentAuthorityLevels)
            || !isEqual(value.competentAuthorities, other.competentAuthorities)
            || !isEqual(value.executingAuthorityLevels, other.executingAuthorityLevels)
            || !isEqual(value.executingAuthorities, other.executingAuthorities)
            || !isEqual(value.publicationMedia, other.publicationMedia)
            || !isEqual(value.yourEuropeCategories, other.yourEuropeCategories)
            || !isEqual(value.keywords, other.keywords)
            || Requirement.isFunctionallyChanged(value.requirements, other.requirements)
            || Procedure.isFunctionallyChanged(value.procedures, other.procedures)
            || Website.isFunctionallyChanged(value.websites, other.websites)
            || Cost.isFunctionallyChanged(value.costs, other.costs)
            || FinancialAdvantage.isFunctionallyChanged(value.financialAdvantages, other.financialAdvantages)
            || LegalResource.isFunctionallyChanged(value.legalResources, other.legalResources)
            || !isEqual(value.isArchived, other.isArchived);
    }

}

