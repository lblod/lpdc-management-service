import {Iri} from "./shared/iri";
import {LanguageString} from "./language-string";
import {
    requireAllPresentOrAllAbsent,
    requiredCanOnlyBePresentIfOtherValuePresent,
    requiredValue,
    requireNoDuplicates,
    requireShouldBePresentWhenOtherValueEquals,
    requireShouldEqualAcceptedValue
} from "./shared/invariant";
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
import {ContactPoint} from "./contact-point";
import {instanceLanguages, Language} from "./language";
import {LegalResource} from "./legal-resource";
import {InvariantError} from "./shared/lpdc-error";
import {isEqual} from "lodash";
import {lastPartAfter} from "./shared/string-helper";

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
    private readonly _conceptId: Iri | undefined;
    private readonly _conceptSnapshotId: Iri | undefined;
    private readonly _productId: string | undefined; //required for search on productId
    private readonly _languages: LanguageType[];
    private readonly _dutchLanguageVariant: Language;
    private readonly _needsConversionFromFormalToInformal: boolean;
    private readonly _dateCreated: FormatPreservingDate;
    private readonly _dateModified: FormatPreservingDate;
    private readonly _dateSent: FormatPreservingDate | undefined;
    private readonly _datePublished: FormatPreservingDate | undefined;
    private readonly _status: InstanceStatusType;
    private readonly _reviewStatus: InstanceReviewStatusType | undefined;
    private readonly _publicationStatus: InstancePublicationStatusType | undefined;
    private readonly _spatials: Iri[];
    private readonly _legalResources: LegalResource[];

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
                conceptId: Iri | undefined,
                conceptSnapshotId: Iri | undefined,
                productId: string | undefined,
                languages: LanguageType[],
                dutchLanguageVariant: Language,
                needsConversionFromFormalToInformal: boolean,
                dateCreated: FormatPreservingDate,
                dateModified: FormatPreservingDate,
                dateSent: FormatPreservingDate | undefined,
                datePublished: FormatPreservingDate | undefined,
                status: InstanceStatusType,
                reviewStatus: InstanceReviewStatusType,
                publicationStatus: InstancePublicationStatusType,
                spatials: Iri[],
                legalResources: LegalResource[]
    ) {
        this._id = requiredValue(id, 'id');
        this._uuid = requiredValue(uuid, 'uuid');

        requireShouldEqualAcceptedValue(this._uuid, 'uuid', [lastPartAfter(this._id.value, '/')]);

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
        requireNoDuplicates(this._requirements.map(r => r.order), 'requirements > order');
        this._procedures = [...procedures].map(Procedure.forInstance);
        requireNoDuplicates(this._procedures.map(p => p.order), 'procedures > order');
        this._websites = [...websites].map(Website.forInstance);
        requireNoDuplicates(this._websites.map(w => w.order), 'websites > order');
        this._costs = [...costs].map(Cost.forInstance);
        requireNoDuplicates(this._costs.map(c => c.order), 'costs > order');
        this._financialAdvantages = [...financialAdvantages].map(FinancialAdvantage.forInstance);
        requireNoDuplicates(this._financialAdvantages.map(fa => fa.order), 'financial advantages > order');
        this._contactPoints = [...contactPoints].map(cp => ContactPoint.forInstance(cp));
        requireNoDuplicates(this._contactPoints.map(cp => cp.order), 'contact points > order');
        requireAllPresentOrAllAbsent([conceptId, conceptSnapshotId, productId], 'conceptId, conceptSnapshotId and productId');
        this._conceptId = conceptId;
        this._conceptSnapshotId = conceptSnapshotId;
        this._productId = productId;
        this._languages = requireNoDuplicates(asSortedArray(languages), 'languages');
        this._dutchLanguageVariant = requireShouldEqualAcceptedValue(dutchLanguageVariant, 'dutchLanguageVariant', instanceLanguages);
        this._needsConversionFromFormalToInformal = requiredValue(needsConversionFromFormalToInformal, 'needsConversionFromFormalToInformal');
        this._dateCreated = requiredValue(dateCreated, 'dateCreated');
        this._dateModified = requiredValue(dateModified, 'dateModified');
        this._dateSent = requireShouldBePresentWhenOtherValueEquals(dateSent, 'dateSent', InstanceStatusType.VERSTUURD, status, 'status');
        this._datePublished = requiredCanOnlyBePresentIfOtherValuePresent(datePublished, 'datePublished', dateSent, 'dateSent');
        this._status = requiredValue(status, 'status');
        this._reviewStatus = requiredCanOnlyBePresentIfOtherValuePresent(reviewStatus, 'reviewStatus', conceptId, 'concept');
        this._publicationStatus = publicationStatus;
        requireAllPresentOrAllAbsent([datePublished, publicationStatus], 'datePublished and publicationStatus');
        this._spatials = requireNoDuplicates(asSortedArray(spatials), 'spatials');
        this._legalResources = [...legalResources].map(LegalResource.forInstance);
        requireNoDuplicates(this.legalResources.map(lr => lr.order), 'legal resources > order');
        this.validateLanguages();
        this.validateStatuses();
    }

    reopen(): Instance {
        if (this.status === InstanceStatusType.ONTWERP) {
            throw new InvariantError('Instantie is al in status ontwerp');
        }
        const newPublicationStatus = this.publicationStatus === InstancePublicationStatusType.GEPUBLICEERD ?
            InstancePublicationStatusType.TE_HERPUBLICEREN
            : this.publicationStatus;

        return InstanceBuilder.from(this)
            .withStatus(InstanceStatusType.ONTWERP)
            .withPublicationStatus(newPublicationStatus)
            .build();
    }

    public calculatedInstanceNlLanguages(): Language[] {
        const nlLanguage =
            LanguageString.extractNlLanguages([
                this._title,
                this._description,
                this._additionalDescription,
                this._exception,
                this._regulation,
            ]);
        const uniquelanguages = new Set([
            ...nlLanguage,
            ...this._requirements.map(r => r.nlLanguage),
            ...this._procedures.map(p => p.nlLanguage),
            ...this._websites.map(w => w.nlLanguage),
            ...this._costs.map(c => c.nlLanguage),
            ...this._financialAdvantages.map(f => f.nlLanguage),
            ...this._legalResources.map(l => l.nlLanguage)
        ].filter(l => l !== undefined));


        return [...uniquelanguages];
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

        const calculatedInstanceNLLanguages = this.calculatedInstanceNlLanguages();

        if (calculatedInstanceNLLanguages.length > 1) {
            throw new InvariantError('Er is meer dan een nl-taal aanwezig');
        }

        if (calculatedInstanceNLLanguages.length != 0 && calculatedInstanceNLLanguages[0] != this.dutchLanguageVariant) {
            throw new InvariantError('DutchLanguageVariant verschilt van de calculatedInstanceNlLanguages');
        }
    }


    private validateStatuses(): void {
        if (this.status === InstanceStatusType.ONTWERP && (this.publicationStatus != InstancePublicationStatusType.TE_HERPUBLICEREN && this.publicationStatus != undefined)) {
            throw new InvariantError('Instantie kan niet in ontwerp staan en gepubliceerd zijn');
        }
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

    get conceptId(): Iri | undefined {
        return this._conceptId;
    }

    get conceptSnapshotId(): Iri | undefined {
        return this._conceptSnapshotId;
    }

    get productId(): string | undefined {
        return this._productId;
    }

    get languages(): LanguageType[] {
        return [...this._languages];
    }

    get dutchLanguageVariant(): Language {
        return this._dutchLanguageVariant;
    }

    get needsConversionFromFormalToInformal(): boolean {
        return this._needsConversionFromFormalToInformal;
    }

    get dateCreated(): FormatPreservingDate {
        return this._dateCreated;
    }

    get dateModified(): FormatPreservingDate {
        return this._dateModified;
    }

    get dateSent(): FormatPreservingDate | undefined {
        return this._dateSent;
    }

    get datePublished(): FormatPreservingDate | undefined {
        return this._datePublished;
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

    get legalResources(): LegalResource[] {
        return [...this._legalResources];
    }

    transformToInformal(): Instance {
        if (this.dutchLanguageVariant == Language.INFORMAL) {
            throw new InvariantError('Instantie is reeds in de je-vorm');
        }
        if (!this.needsConversionFromFormalToInformal) {
            throw new InvariantError('Instantie moet u naar je conversie nodig hebben');
        }
        return InstanceBuilder.from(this)
            .withDutchLanguageVariant(Language.INFORMAL)
            .withNeedsConversionFromFormalToInformal(false)
            .withTitle(this.title?.transformToInformal())
            .withDescription(this.description?.transformToInformal())
            .withAdditionalDescription(this.additionalDescription?.transformToInformal())
            .withException(this.exception?.transformToInformal())
            .withRegulation(this.regulation?.transformToInformal())
            .withRequirements(this.requirements.map(requirement => requirement.transformToInformal()))
            .withProcedures(this.procedures.map(procedure => procedure.transformToInformal()))
            .withWebsites(this.websites.map(website => website.transformToInformal()))
            .withCosts(this.costs.map(cost => cost.transformToInformal()))
            .withFinancialAdvantages(this.financialAdvantages.map(financialAdvantage => financialAdvantage.transformToInformal()))
            .withLegalResources(this.legalResources.map(legalResource => legalResource.transformToInformal()))
            .build();
    }

    validateForPublish(checkAddress: boolean): void {
        if (!isEqual(this.title.notBlankLanguages, this.description.notBlankLanguages)) {
            throw new InvariantError('Binnen eenzelfde taal moeten titel en beschrijving beide ingevuld (of leeg) zijn');
        }
        if (checkAddress) {
            const allAddressesValid = this.contactPoints
                .flatMap(cp => cp.address)
                .filter(address => !!address)
                .every(address => address.isValid());
            if (!allAddressesValid) {
                throw new InvariantError('Minstens één van de adresgegevens is niet geldig');
            }
        }
    }


    publish(): Instance {
        if (this.status === InstanceStatusType.VERSTUURD) {
            throw new InvariantError('Instantie heeft reeds status verstuurd');
        }
        return InstanceBuilder.from(this)
            .withStatus(InstanceStatusType.VERSTUURD)
            .withDateSent(FormatPreservingDate.now())
            .build();
    }

}

export class InstanceBuilder {
    private id: Iri;
    private uuid: string;
    private createdBy: Iri;
    private title: LanguageString | undefined;
    private description: LanguageString | undefined;
    private additionalDescription: LanguageString | undefined;
    private exception: LanguageString | undefined;
    private regulation: LanguageString | undefined;
    private startDate: FormatPreservingDate | undefined;
    private endDate: FormatPreservingDate | undefined;
    private type: ProductType | undefined;
    private targetAudiences: TargetAudienceType[] = [];
    private themes: ThemeType[] = [];
    private competentAuthorityLevels: CompetentAuthorityLevelType[] = [];
    private competentAuthorities: Iri[] = [];
    private executingAuthorityLevels: ExecutingAuthorityLevelType[] = [];
    private executingAuthorities: Iri[] = [];
    private publicationMedia: PublicationMediumType[] = [];
    private yourEuropeCategories: YourEuropeCategoryType[] = [];
    private keywords: LanguageString[] = [];
    private requirements: Requirement[] = [];
    private procedures: Procedure[] = [];
    private websites: Website[] = [];
    private costs: Cost[] = [];
    private financialAdvantages: FinancialAdvantage[] = [];
    private contactPoints: ContactPoint[] = [];
    private conceptId: Iri | undefined;
    private conceptSnapshotId: Iri | undefined;
    private productId: string | undefined;
    private languages: LanguageType[] = [];
    private dutchLanguageVariant: Language;
    private needsConversionFromFormalToInformal: boolean;
    private dateCreated: FormatPreservingDate;
    private dateModified: FormatPreservingDate;
    private dateSent: FormatPreservingDate | undefined;
    private datePublished: FormatPreservingDate | undefined;
    private status: InstanceStatusType;
    private reviewStatus: InstanceReviewStatusType;
    private publicationStatus: InstancePublicationStatusType;
    private spatials: Iri[] = [];
    private legalResources: LegalResource[] = [];

    public static from(instance: Instance): InstanceBuilder {
        return new InstanceBuilder()
            .withId(instance.id)
            .withUuid(instance.uuid)
            .withCreatedBy(instance.createdBy)
            .withTitle(instance.title)
            .withDescription(instance.description)
            .withAdditionalDescription(instance.additionalDescription)
            .withException(instance.exception)
            .withRegulation(instance.regulation)
            .withStartDate(instance.startDate)
            .withEndDate(instance.endDate)
            .withType(instance.type)
            .withTargetAudiences(instance.targetAudiences)
            .withThemes(instance.themes)
            .withCompetentAuthorityLevels(instance.competentAuthorityLevels)
            .withCompetentAuthorities(instance.competentAuthorities)
            .withExecutingAuthorityLevels(instance.executingAuthorityLevels)
            .withExecutingAuthorities(instance.executingAuthorities)
            .withPublicationMedia(instance.publicationMedia)
            .withYourEuropeCategories(instance.yourEuropeCategories)
            .withKeywords(instance.keywords)
            .withRequirements(instance.requirements)
            .withProcedures(instance.procedures)
            .withWebsites(instance.websites)
            .withCosts(instance.costs)
            .withFinancialAdvantages(instance.financialAdvantages)
            .withContactPoints(instance.contactPoints)
            .withConceptId(instance.conceptId)
            .withConceptSnapshotId(instance.conceptSnapshotId)
            .withProductId(instance.productId)
            .withLanguages(instance.languages)
            .withDutchLanguageVariant(instance.dutchLanguageVariant)
            .withNeedsConversionFromFormalToInformal(instance.needsConversionFromFormalToInformal)
            .withDateCreated(instance.dateCreated)
            .withDateModified(instance.dateModified)
            .withDateSent(instance.dateSent)
            .withDatePublished(instance.datePublished)
            .withStatus(instance.status)
            .withReviewStatus(instance.reviewStatus)
            .withPublicationStatus(instance.publicationStatus)
            .withSpatials(instance.spatials)
            .withLegalResources(instance.legalResources);
    }

    public withId(id: Iri): InstanceBuilder {
        this.id = id;
        return this;
    }

    public withUuid(uuid: string): InstanceBuilder {
        this.uuid = uuid;
        return this;
    }

    public withCreatedBy(createdBy: Iri): InstanceBuilder {
        this.createdBy = createdBy;
        return this;
    }

    public withTitle(title: LanguageString): InstanceBuilder {
        this.title = title;
        return this;
    }

    public withDescription(description: LanguageString): InstanceBuilder {
        this.description = description;
        return this;
    }

    public withAdditionalDescription(additionalDescription: LanguageString): InstanceBuilder {
        this.additionalDescription = additionalDescription;
        return this;
    }

    public withException(exception: LanguageString): InstanceBuilder {
        this.exception = exception;
        return this;
    }

    public withRegulation(regulation: LanguageString): InstanceBuilder {
        this.regulation = regulation;
        return this;
    }

    public withStartDate(startDate: FormatPreservingDate): InstanceBuilder {
        this.startDate = startDate;
        return this;
    }

    public withEndDate(endDate: FormatPreservingDate): InstanceBuilder {
        this.endDate = endDate;
        return this;
    }

    public withType(type: ProductType): InstanceBuilder {
        this.type = type;
        return this;
    }

    public withTargetAudiences(targetAudiences: TargetAudienceType[]): InstanceBuilder {
        this.targetAudiences = targetAudiences;
        return this;
    }

    public withThemes(themes: ThemeType[]): InstanceBuilder {
        this.themes = themes;
        return this;
    }

    public withCompetentAuthorityLevels(competentAuthorityLevels: CompetentAuthorityLevelType[]): InstanceBuilder {
        this.competentAuthorityLevels = competentAuthorityLevels;
        return this;
    }

    public withCompetentAuthorities(competentAuthorities: Iri[]): InstanceBuilder {
        this.competentAuthorities = competentAuthorities;
        return this;
    }

    public withExecutingAuthorityLevels(executingAuthorityLevels: ExecutingAuthorityLevelType[]): InstanceBuilder {
        this.executingAuthorityLevels = executingAuthorityLevels;
        return this;
    }

    public withExecutingAuthorities(executingAuthorities: Iri[]): InstanceBuilder {
        this.executingAuthorities = executingAuthorities;
        return this;
    }

    public withPublicationMedia(publicationMedia: PublicationMediumType[]): InstanceBuilder {
        this.publicationMedia = publicationMedia;
        return this;
    }

    public withYourEuropeCategories(yourEuropeCategories: YourEuropeCategoryType[]): InstanceBuilder {
        this.yourEuropeCategories = yourEuropeCategories;
        return this;
    }

    public withKeywords(keywords: LanguageString[]): InstanceBuilder {
        this.keywords = keywords;
        return this;
    }

    public withRequirements(requirements: Requirement[]): InstanceBuilder {
        this.requirements = requirements;
        return this;
    }

    public withProcedures(procedures: Procedure[]): InstanceBuilder {
        this.procedures = procedures;
        return this;
    }

    public withWebsites(websites: Website[]): InstanceBuilder {
        this.websites = websites;
        return this;
    }

    public withCosts(costs: Cost[]): InstanceBuilder {
        this.costs = costs;
        return this;
    }

    public withFinancialAdvantages(financialAdvantages: FinancialAdvantage[]): InstanceBuilder {
        this.financialAdvantages = financialAdvantages;
        return this;
    }

    public withContactPoints(contactPoinst: ContactPoint[]): InstanceBuilder {
        this.contactPoints = contactPoinst;
        return this;
    }

    public withConceptId(conceptId: Iri): InstanceBuilder {
        this.conceptId = conceptId;
        return this;
    }

    public withConceptSnapshotId(conceptSnapshotId: Iri): InstanceBuilder {
        this.conceptSnapshotId = conceptSnapshotId;
        return this;
    }

    public withProductId(productId: string): InstanceBuilder {
        this.productId = productId;
        return this;
    }

    public withLanguages(languages: LanguageType[]): InstanceBuilder {
        this.languages = languages;
        return this;
    }

    public withDutchLanguageVariant(dutchLanguageVariant: Language): InstanceBuilder {
        this.dutchLanguageVariant = dutchLanguageVariant;
        return this;
    }

    public withNeedsConversionFromFormalToInformal(needsConversionFromFormalToInformal: boolean) {
        this.needsConversionFromFormalToInformal = needsConversionFromFormalToInformal;
        return this;

    }

    public withDateCreated(dateCreated: FormatPreservingDate): InstanceBuilder {
        this.dateCreated = dateCreated;
        return this;
    }

    public withDateModified(dateModified: FormatPreservingDate): InstanceBuilder {
        this.dateModified = dateModified;
        return this;
    }

    public withDateSent(dateSent: FormatPreservingDate): InstanceBuilder {
        this.dateSent = dateSent;
        return this;
    }

    public withDatePublished(datePublished: FormatPreservingDate): InstanceBuilder {
        this.datePublished = datePublished;
        return this;
    }

    public withStatus(status: InstanceStatusType): InstanceBuilder {
        this.status = status;
        return this;
    }

    public withReviewStatus(reviewStatus: InstanceReviewStatusType): InstanceBuilder {
        this.reviewStatus = reviewStatus;
        return this;
    }

    public withPublicationStatus(publicationStatus: InstancePublicationStatusType) {
        this.publicationStatus = publicationStatus;
        return this;
    }

    public withSpatials(spatials: Iri[]): InstanceBuilder {
        this.spatials = spatials;
        return this;
    }
    public withLegalResources(legalResources: LegalResource[]): InstanceBuilder {
        this.legalResources = legalResources;
        return this;
    }

    public build(): Instance {
        return new Instance(
            this.id,
            this.uuid,
            this.createdBy,
            this.title,
            this.description,
            this.additionalDescription,
            this.exception,
            this.regulation,
            this.startDate,
            this.endDate,
            this.type,
            this.targetAudiences,
            this.themes,
            this.competentAuthorityLevels,
            this.competentAuthorities,
            this.executingAuthorityLevels,
            this.executingAuthorities,
            this.publicationMedia,
            this.yourEuropeCategories,
            this.keywords,
            this.requirements,
            this.procedures,
            this.websites,
            this.costs,
            this.financialAdvantages,
            this.contactPoints,
            this.conceptId,
            this.conceptSnapshotId,
            this.productId,
            this.languages,
            this.dutchLanguageVariant,
            this.needsConversionFromFormalToInformal,
            this.dateCreated,
            this.dateModified,
            this.dateSent,
            this.datePublished,
            this.status,
            this.reviewStatus,
            this.publicationStatus,
            this.spatials,
            this.legalResources
        );
    }
}
