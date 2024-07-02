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
import {uuid} from "../../../mu-helper";

// TODO LPDC-1236: rename to PublishedInstanceSnapshot
export class PublishedInstance {

    private readonly _id: Iri;
    private readonly _generatedAtTime: FormatPreservingDate;
    private readonly _isPublishedVersionOf: Iri;
    private readonly _uuid: string;
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

    //TODO LPDC-1236: take safe copies
    //TODO LPDC-1236: constructor validation
    constructor(id: Iri,
                generatedAtTime: FormatPreservingDate,
                isPublishedVersionOf: Iri,
                uuid: string,
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
        this._id = id;
        this._generatedAtTime = generatedAtTime;
        this._isPublishedVersionOf = isPublishedVersionOf;
        this._uuid = uuid;
        this._createdBy = createdBy;
        this._title = title;
        this._description = description;
        this._additionalDescription = additionalDescription;
        this._exception = exception;
        this._regulation = regulation;
        this._startDate = startDate;
        this._endDate = endDate;
        this._type = type;
        this._targetAudiences = targetAudiences;
        this._themes = themes;
        this._competentAuthorityLevels = competentAuthorityLevels;
        this._competentAuthorities = competentAuthorities;
        this._executingAuthorityLevels = executingAuthorityLevels;
        this._executingAuthorities = executingAuthorities;
        this._publicationMedia = publicationMedia;
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
        this._dateCreated = dateCreated;
        this._dateModified = dateModified;
        this._spatials = spatials;
        this._legalResources = legalResources;
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

    get uuid(): string {
        return this._uuid;
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

    get contactPoints(): ContactPoint[] {
        return this._contactPoints;
    }

    get conceptId(): Iri | undefined {
        return this._conceptId;
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

    get spatials(): Iri[] {
        return this._spatials;
    }

    get legalResources(): LegalResource[] {
        return this._legalResources;
    }
}

export class PublishedInstanceBuilder {

    static buildIri(uniqueId: string): Iri {
        return new Iri(`http://data.lblod.info/id/published-public-service/${uniqueId}`);
    }

    //TODO LPDC-1236: test the copy
    public static from(instance: Instance): PublishedInstance {
        const uniqueId = uuid();
        return new PublishedInstance(
            this.buildIri(uniqueId),
            instance.dateSent,
            instance.id,
            instance.uuid,
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
            instance.requirements.map(req => req.transformWithNewId()),
            instance.procedures.map(proc => proc.transformWithNewId()),
            instance.websites.map(ws => ws.transformWithNewId()),
            instance.costs.map(c => c.transformWithNewId()),
            instance.financialAdvantages.map(fa => fa.transformWithNewId()),
            instance.contactPoints.map(cp => cp.transformWithNewId()),
            instance.conceptId,
            instance.languages,
            instance.dateCreated,
            instance.dateModified,
            instance.spatials,
            instance.legalResources.map(lr => lr.transformWithNewId())
        );
    }

}
