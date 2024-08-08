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
import {LegalResource} from "./legal-resource";
import {Instance} from "./instance";
import {uuid} from "mu";
import {
    requireAtLeastOneValuePresentIfCondition,
    requiredAtLeastOneValuePresent,
    requiredValue,
    requireNoDuplicates
} from "./shared/invariant";
import {asSortedArray} from "./shared/collections-helper";
import {Language} from "./language";

export class PublishedInstanceSnapshot {

    private readonly _id: Iri;
    private readonly _generatedAtTime: FormatPreservingDate;
    private readonly _isPublishedVersionOf: Iri;
    private readonly _createdBy: Iri;
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
    private readonly _contactPoints: ContactPoint[];
    private readonly _conceptId: Iri | undefined;
    private readonly _languages: LanguageType[];
    private readonly _dateCreated: FormatPreservingDate;
    private readonly _dateModified: FormatPreservingDate;
    private readonly _spatials: Iri[];
    private readonly _legalResources: LegalResource[];

    constructor(id: Iri,
                generatedAtTime: FormatPreservingDate,
                isPublishedVersionOf: Iri,
                createdBy: Iri,
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
                contactPoints: ContactPoint[],
                conceptId: Iri | undefined,
                languages: LanguageType[],
                dateCreated: FormatPreservingDate,
                dateModified: FormatPreservingDate,
                spatials: Iri[],
                legalResources: LegalResource[],
                ) {
        this._id = requiredValue(id, 'id');
        this._generatedAtTime = requiredValue(generatedAtTime, 'generatedAtTime');
        this._isPublishedVersionOf = requiredValue(isPublishedVersionOf, 'isPublishedVersionOf');
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
        this._competentAuthorities = requireNoDuplicates(asSortedArray(competentAuthorities, Iri.compare), 'competentAuthorities');
        requiredAtLeastOneValuePresent(this._competentAuthorities, 'competentAuthorities');
        this._executingAuthorityLevels = requireNoDuplicates(asSortedArray(executingAuthorityLevels), 'executingAuthorityLevels');
        this._executingAuthorities = requireNoDuplicates(asSortedArray(executingAuthorities, Iri.compare), 'executingAuthorities');
        this._publicationMedia = requireNoDuplicates(asSortedArray(publicationMedia), 'publicationMedia');
        this._yourEuropeCategories = requireNoDuplicates(asSortedArray(yourEuropeCategories), 'yourEuropeCategories');
        requireAtLeastOneValuePresentIfCondition(this._yourEuropeCategories, 'yourEuropeCategories', () => publicationMedia.includes(PublicationMediumType.YOUREUROPE));
        this._keywords = requireNoDuplicates(asSortedArray(keywords, LanguageString.compare), 'keywords');
        LanguageString.validateUniqueAndCorrectLanguages([Language.NL], ...this._keywords);
        this._requirements = [...requirements].map(r => Requirement.forInstanceSnapshot(r));
        requireNoDuplicates(this._requirements.map(r => r.order), 'requirements > order');
        this._procedures = [...procedures].map(p => Procedure.forInstanceSnapshot(p));
        requireNoDuplicates(this._procedures.map(r => r.order), 'procedures > order');
        this._websites = [...websites].map(w => Website.forInstanceSnapshot(w));
        requireNoDuplicates(this._websites.map(w => w.order), 'websites > order');
        this._costs = [...costs].map(c => Cost.forInstanceSnapshot(c));
        requireNoDuplicates(this._costs.map(c => c.order), 'costs > order');
        this._financialAdvantages = [...financialAdvantages].map(fa => FinancialAdvantage.forInstanceSnapshot(fa));
        requireNoDuplicates(this._financialAdvantages.map(fa => fa.order), 'financial advantages > order');
        this._contactPoints = [...contactPoints].map(cp => ContactPoint.forInstanceSnapshot(cp));
        requireNoDuplicates(this._contactPoints.map(cp => cp.order), 'contact points > order');
        this._conceptId = conceptId;
        this._languages = requireNoDuplicates(asSortedArray(languages), 'languages');
        this._dateCreated = requiredValue(dateCreated, 'dateCreated');
        this._dateModified = requiredValue(dateModified, 'dateModified');
        this._spatials = requireNoDuplicates(asSortedArray(spatials, Iri.compare), 'spatials');
        requiredAtLeastOneValuePresent(this._spatials, 'spatials');
        this._legalResources =  [...legalResources].map(LegalResource.forInstanceSnapshot);
        requireNoDuplicates(this._legalResources.map(lr => lr.order), 'legal resources > order');
    }

    get id(): Iri {
        return this._id;
    }

    get generatedAtTime(): FormatPreservingDate {
        return this._generatedAtTime;
    }

    get isPublishedVersionOf(): Iri {
        return this._isPublishedVersionOf;
    }

    get createdBy(): Iri {
        return this._createdBy;
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

    get contactPoints(): ContactPoint[] {
        return [...this._contactPoints];
    }

    get conceptId(): Iri | undefined {
        return this._conceptId;
    }

    get languages(): LanguageType[] {
        return [...this._languages];
    }

    get dateCreated(): FormatPreservingDate {
        return this._dateCreated;
    }

    get dateModified(): FormatPreservingDate {
        return this._dateModified;
    }

    get spatials(): Iri[] {
        return [...this._spatials];
    }

    get legalResources(): LegalResource[] {
        return [...this._legalResources];
    }
}

export class PublishedInstanceSnapshotBuilder {

    static buildIri(uniqueId: string): Iri {
        return new Iri(`http://data.lblod.info/id/published-public-service/${uniqueId}`);
    }

    public static from(instance: Instance): PublishedInstanceSnapshot {
        const uniqueId = uuid();
        return new PublishedInstanceSnapshot(
            this.buildIri(uniqueId),
            instance.dateSent,
            instance.id,
            instance.createdBy,
            instance.title,
            instance.description,
            instance.additionalDescription,
            instance.exception,
            instance.regulation,
            instance.startDate,
            instance.endDate,
            instance.type,
            instance.targetAudiences,
            instance.themes,
            instance.competentAuthorityLevels,
            instance.competentAuthorities,
            instance.executingAuthorityLevels,
            instance.executingAuthorities,
            instance.publicationMedia,
            instance.yourEuropeCategories,
            instance.keywords,
            instance.requirements.map(req => Requirement.forInstanceSnapshot(req.transformWithNewId())),
            instance.procedures.map(proc => Procedure.forInstanceSnapshot(proc.transformWithNewId())),
            instance.websites.map(ws => Website.forInstanceSnapshot(ws.transformWithNewId())),
            instance.costs.map(c => Cost.forInstanceSnapshot(c.transformWithNewId())),
            instance.financialAdvantages.map(fa => FinancialAdvantage.forInstanceSnapshot(fa.transformWithNewId())),
            instance.contactPoints.map(cp => ContactPoint.forInstanceSnapshot(cp.transformWithNewId())),
            instance.conceptId,
            instance.languages,
            instance.dateCreated,
            instance.dateModified,
            instance.spatials,
            instance.legalResources.map(lr => LegalResource.forInstanceSnapshot(lr.transformWithNewId()))
        );
    }

}
