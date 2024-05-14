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
import {requiredValue, requireNoDuplicates} from "./shared/invariant";
import {isEqual, uniqWith} from "lodash";
import {LegalResource} from "./legal-resource";

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
    private readonly _legalResources: LegalResource[];

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
                legalResources: LegalResource[],
    ) {
        this._id = requiredValue(id, 'id');
        this._uuid = requiredValue(uuid, 'uuid');

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
        this._keywords = requireNoDuplicates(asSortedArray(keywords, LanguageString.compare), 'keywords');
        LanguageString.validateUniqueAndCorrectLanguages([Language.NL], ...this._keywords);
        this._requirements = [...requirements].map(Requirement.forConcept);
        requireNoDuplicates(this._requirements.map(r => r.order), 'requirements > order');
        this._procedures = [...procedures].map(Procedure.forConcept);
        requireNoDuplicates(this._procedures.map(p => p.order), 'procedures > order');
        this._websites = [...websites].map(Website.forConcept);
        requireNoDuplicates(this._websites.map(w => w.order), 'websites > order');
        this._costs = [...costs].map(Cost.forConcept);
        requireNoDuplicates(this._costs.map(c => c.order), 'costs > order');
        this._financialAdvantages = [...financialAdvantages].map(FinancialAdvantage.forConcept);
        requireNoDuplicates(this._financialAdvantages.map(fa => fa.order), 'financial advantages > order');
        this._productId = requiredValue(productId, 'productId');
        this._latestConceptSnapshot = requiredValue(latestConceptSnapshot, 'latestConceptSnapshot');
        this._previousConceptSnapshots = requireNoDuplicates(asSortedArray(previousConceptSnapshots, Iri.compare), 'previousConceptSnapshots');
        this._latestFunctionallyChangedConceptSnapshot = requiredValue(latestFunctionallyChangedConceptSnapshot, 'latestFunctionallyChangedConceptSnapshot');
        this._conceptTags = requireNoDuplicates(asSortedArray(conceptTags), 'conceptTags');
        this._isArchived = requiredValue(isArchived, 'isArchived');
        this._legalResources = [...legalResources].map(LegalResource.forConcept);
        requireNoDuplicates(this.legalResources.map(lr => lr.order), 'legal resources > order');
    }

    get conceptLanguages(): Language[] {
        //TODO LPDC-1168: is it sufficient to just take the title?
        return [...this._title.definedLanguages];
    }

    get appliedConceptSnapshots(): Iri[] {
        return [...uniqWith([this._latestConceptSnapshot, ...this._previousConceptSnapshots], isEqual)];
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

    get productId(): string {
        return this._productId;
    }

    get latestConceptSnapshot(): Iri {
        return this._latestConceptSnapshot;
    }

    get previousConceptSnapshots(): Iri[] {
        return [...this._previousConceptSnapshots];
    }

    get latestFunctionallyChangedConceptSnapshot(): Iri {
        return this._latestFunctionallyChangedConceptSnapshot;
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

}