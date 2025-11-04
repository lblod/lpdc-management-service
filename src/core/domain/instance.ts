import { Iri } from "./shared/iri";
import { LanguageString } from "./language-string";
import {
  requireAllPresentOrAllAbsent,
  requiredCanOnlyBePresentIfOtherValuePresent,
  requiredValue,
  requireNoDuplicates,
  requireShouldBePresentWhenOtherValueEquals,
  requireShouldEqualAcceptedValue,
} from "./shared/invariant";
import { FormatPreservingDate } from "./format-preserving-date";
import {
  CompetentAuthorityLevelType,
  ExecutingAuthorityLevelType,
  InstanceReviewStatusType,
  InstanceStatusType,
  LanguageType,
  ProductType,
  PublicationMediumType,
  TargetAudienceType,
  ThemeType,
  YourEuropeCategoryType,
} from "./types";
import {
  asSortedArray,
  iriArraysEqual,
  languageStringArraysFunctionallyChanged,
} from "./shared/collections-helper";
import { Requirement } from "./requirement";
import { Procedure } from "./procedure";
import { Website } from "./website";
import { Cost } from "./cost";
import { FinancialAdvantage } from "./financial-advantage";
import { ContactPoint } from "./contact-point";
import { instanceLanguages, Language } from "./language";
import { LegalResource } from "./legal-resource";
import { InvariantError } from "./shared/lpdc-error";
import { isEqual, uniq } from "lodash";
import { lastPartAfter } from "./shared/string-helper";

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
  private readonly _creator: Iri;
  private readonly _lastModifier: Iri;
  private readonly _dateSent: FormatPreservingDate | undefined;
  private readonly _status: InstanceStatusType;
  private readonly _reviewStatus: InstanceReviewStatusType | undefined;
  private readonly _spatials: Iri[];
  private readonly _legalResources: LegalResource[];
  private readonly _forMunicipalityMerger: boolean;
  private readonly _copyOf: Iri | undefined;

  constructor(
    id: Iri,
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
    creator: Iri,
    lastModifier: Iri,
    dateSent: FormatPreservingDate | undefined,
    status: InstanceStatusType,
    reviewStatus: InstanceReviewStatusType,
    spatials: Iri[],
    legalResources: LegalResource[],
    forMunicipalityMerger: boolean,
    copyOf: Iri | undefined,
  ) {
    this._id = requiredValue(id, "id");
    this._uuid = requiredValue(uuid, "uuid");

    requireShouldEqualAcceptedValue(this._uuid, "uuid", [
      lastPartAfter(this._id.value, "/"),
    ]);

    this._createdBy = requiredValue(createdBy, "createdBy");
    this._title = title;
    this._description = description;
    this._additionalDescription = additionalDescription;
    this._exception = exception;
    this._regulation = regulation;
    this._startDate = startDate;
    this._endDate = endDate;
    this._type = type;
    this._targetAudiences = requireNoDuplicates(
      asSortedArray(targetAudiences),
      "targetAudiences",
    );
    this._themes = requireNoDuplicates(asSortedArray(themes), "themes");
    this._competentAuthorityLevels = requireNoDuplicates(
      asSortedArray(competentAuthorityLevels),
      "competentAuthorityLevels",
    );
    this._competentAuthorities = requireNoDuplicates(
      asSortedArray(competentAuthorities, Iri.compare),
      "competentAuthorities",
    );
    this._executingAuthorityLevels = requireNoDuplicates(
      asSortedArray(executingAuthorityLevels),
      "executingAuthorityLevels",
    );
    this._executingAuthorities = requireNoDuplicates(
      asSortedArray(executingAuthorities, Iri.compare),
      "executingAuthorities",
    );
    this._publicationMedia = requireNoDuplicates(
      asSortedArray(publicationMedia),
      "publicationMedia",
    );
    this._yourEuropeCategories = requireNoDuplicates(
      asSortedArray(yourEuropeCategories),
      "yourEuropeCategories",
    );
    this._keywords = requireNoDuplicates(
      asSortedArray(keywords, LanguageString.compare),
      "keywords",
    );
    LanguageString.validateUniqueAndCorrectLanguages(
      [Language.NL],
      ...this._keywords,
    );
    this._requirements = [...requirements].map(Requirement.forInstance);
    requireNoDuplicates(
      this._requirements.map((r) => r.order),
      "requirements > order",
    );
    this._procedures = [...procedures].map(Procedure.forInstance);
    requireNoDuplicates(
      this._procedures.map((p) => p.order),
      "procedures > order",
    );
    this._websites = [...websites].map(Website.forInstance);
    requireNoDuplicates(
      this._websites.map((w) => w.order),
      "websites > order",
    );
    this._costs = [...costs].map(Cost.forInstance);
    requireNoDuplicates(
      this._costs.map((c) => c.order),
      "costs > order",
    );
    this._financialAdvantages = [...financialAdvantages].map(
      FinancialAdvantage.forInstance,
    );
    requireNoDuplicates(
      this._financialAdvantages.map((fa) => fa.order),
      "financial advantages > order",
    );
    this._contactPoints = [...contactPoints]
      .filter((cp) => !cp.isEmpty())
      .map((cp) => ContactPoint.forInstance(cp));
    requireNoDuplicates(
      this._contactPoints.map((cp) => cp.order),
      "contact points > order",
    );
    requireAllPresentOrAllAbsent(
      [conceptId, conceptSnapshotId, productId],
      "conceptId, conceptSnapshotId and productId",
    );
    this._conceptId = conceptId;
    this._conceptSnapshotId = conceptSnapshotId;
    this._productId = productId;
    this._languages = requireNoDuplicates(
      asSortedArray(languages),
      "languages",
    );
    this._dutchLanguageVariant = requireShouldEqualAcceptedValue(
      dutchLanguageVariant,
      "dutchLanguageVariant",
      instanceLanguages,
    );
    this._needsConversionFromFormalToInformal = requiredValue(
      needsConversionFromFormalToInformal,
      "needsConversionFromFormalToInformal",
    );
    this._dateCreated = requiredValue(dateCreated, "dateCreated");
    this._dateModified = requiredValue(dateModified, "dateModified");
    // No required values, because existing instances won't have a creator
    this._creator = creator;
    this._lastModifier = lastModifier;
    this._dateSent = requireShouldBePresentWhenOtherValueEquals(
      dateSent,
      "dateSent",
      InstanceStatusType.VERZONDEN,
      status,
      "status",
    );
    this._status = requiredValue(status, "status");
    this._reviewStatus = requiredCanOnlyBePresentIfOtherValuePresent(
      reviewStatus,
      "reviewStatus",
      conceptId,
      "concept",
    );
    this._spatials = requireNoDuplicates(
      asSortedArray(spatials, Iri.compare),
      "spatials",
    );
    this._legalResources = [...legalResources].map(LegalResource.forInstance);
    requireNoDuplicates(
      this.legalResources.map((lr) => lr.order),
      "legal resources > order",
    );
    this._forMunicipalityMerger = requiredValue(
      forMunicipalityMerger,
      "forMunicipalityMerger",
    );
    this._copyOf = copyOf;
    this.validateLanguages();
  }

  reopen(): Instance {
    if (this.status === InstanceStatusType.ONTWERP) {
      throw new InvariantError("Instantie is al in status ontwerp");
    }
    return InstanceBuilder.from(this)
      .withStatus(InstanceStatusType.ONTWERP)
      .build();
  }

  /**
   * Checks if 2 instances are functionally changed, ignoring
   * identifiers, creation- and modification dates.
   * @param value Instance to compare
   * @param other Instance to compare
   * @returns boolean
   */
  public static isFunctionallyChanged(value?: Instance, other?: Instance) {
    return (
      LanguageString.isFunctionallyChanged(value?._title, other?._title) ||
      LanguageString.isFunctionallyChanged(
        value?.description,
        other?.description,
      ) ||
      LanguageString.isFunctionallyChanged(
        value?.additionalDescription,
        other?.additionalDescription,
      ) ||
      LanguageString.isFunctionallyChanged(
        value?.exception,
        other?.exception,
      ) ||
      LanguageString.isFunctionallyChanged(
        value?.regulation,
        other?.regulation,
      ) ||
      FormatPreservingDate.isFunctionallyChanged(
        value?.startDate,
        other?.startDate,
      ) ||
      FormatPreservingDate.isFunctionallyChanged(
        value?.endDate,
        other?.endDate,
      ) ||
      value?._type !== other?._type ||
      !isEqual(value?.targetAudiences, other?.targetAudiences) ||
      !isEqual(value?.themes, other?.themes) ||
      !isEqual(
        value?.competentAuthorityLevels,
        other?.competentAuthorityLevels,
      ) ||
      !iriArraysEqual(
        value?.competentAuthorities,
        other?.competentAuthorities,
      ) ||
      !isEqual(
        value?.executingAuthorityLevels,
        other?.executingAuthorityLevels,
      ) ||
      !iriArraysEqual(
        value?.executingAuthorities,
        other?.executingAuthorities,
      ) ||
      !isEqual(value?.publicationMedia, other?.publicationMedia) ||
      !isEqual(
        value?.yourEuropeCategories,
        other?.yourEuropeCategories,
      ) ||
      languageStringArraysFunctionallyChanged(
        value?.keywords,
        other?.keywords,
      ) ||
      Requirement.isFunctionallyChanged(
        value?.requirements,
        other?.requirements,
      ) ||
      Procedure.isFunctionallyChanged(value?.procedures, other?.procedures) ||
      Website.isFunctionallyChanged(value?.websites, other?.websites) ||
      Cost.isFunctionallyChanged(value?.costs, other?.costs) ||
      FinancialAdvantage.isFunctionallyChanged(
        value?.financialAdvantages,
        other?.financialAdvantages,
      ) ||
      ContactPoint.isFunctionallyChanged(
        value?.contactPoints,
        other?.contactPoints,
      ) ||
      Iri.compare(value?.conceptId, other?.conceptId) !== 0 ||
      Iri.compare(value?.conceptSnapshotId, other?.conceptSnapshotId) !== 0 ||
      value?.productId !== other?.productId ||
      !isEqual(value?.languages, other?.languages) ||
      value?.dutchLanguageVariant !== other?.dutchLanguageVariant ||
      value?.needsConversionFromFormalToInformal !==
        other?.needsConversionFromFormalToInformal ||
      FormatPreservingDate.isFunctionallyChanged(
        value?.dateSent,
        other?.dateSent,
      ) ||
      value?.status !== other?.status ||
      value?.reviewStatus !== other?.reviewStatus ||
      !iriArraysEqual(value?.spatials, other?.spatials) ||
      LegalResource.isFunctionallyChanged(
        value?.legalResources,
        other?.legalResources,
      ) ||
      value?.forMunicipalityMerger !== other?.forMunicipalityMerger ||
      Iri.compare(value?.copyOf, other?.copyOf) !== 0
    );
  }

  public calculatedInstanceLanguages(): Language[] {
    const nlLanguage = LanguageString.extractLanguages([
      this._title,
      this._description,
      this._additionalDescription,
      this._exception,
      this._regulation,
    ]);
    const uniquelanguages = uniq(
      [
        ...nlLanguage,
        ...this._requirements.map((r) => r.nlLanguage),
        ...this._procedures.map((p) => p.nlLanguage),
        ...this._websites.map((w) => w.nlLanguage),
        ...this._costs.map((c) => c.nlLanguage),
        ...this._financialAdvantages.map((f) => f.nlLanguage),
        ...this._legalResources.map((l) => l.nlLanguage),
      ].filter((l) => l !== undefined),
    );

    return [...uniquelanguages];
  }

  private validateLanguages(): void {
    const values = [
      this._title,
      this._description,
      this._additionalDescription,
      this._exception,
      this._regulation,
    ];
    LanguageString.validateUniqueAndCorrectLanguages(
      instanceLanguages,
      ...values,
    );

    const calculatedInstanceLanguages = this.calculatedInstanceLanguages();

    if (calculatedInstanceLanguages.length > 1) {
      throw new InvariantError("Er is meer dan een nl-taal aanwezig");
    }

    if (
      calculatedInstanceLanguages.length != 0 &&
      calculatedInstanceLanguages[0] != this.dutchLanguageVariant
    ) {
      throw new InvariantError(
        "DutchLanguageVariant verschilt van de calculatedInstanceLanguages",
      );
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

  get creator(): Iri {
    return this._creator;
  }

  get lastModifier(): Iri {
    return this._lastModifier;
  }

  get dateSent(): FormatPreservingDate | undefined {
    return this._dateSent;
  }

  get status(): InstanceStatusType {
    return this._status;
  }

  get reviewStatus(): InstanceReviewStatusType {
    return this._reviewStatus;
  }

  get spatials(): Iri[] {
    return [...this._spatials];
  }

  get legalResources(): LegalResource[] {
    return [...this._legalResources];
  }

  get forMunicipalityMerger(): boolean {
    return this._forMunicipalityMerger;
  }

  get copyOf(): Iri | undefined {
    return this._copyOf;
  }

  transformToInformal(): Instance {
    if (this._dutchLanguageVariant == Language.INFORMAL) {
      throw new InvariantError("Instantie is reeds in de je-vorm");
    }
    if (!this._needsConversionFromFormalToInformal) {
      throw new InvariantError(
        "Instantie moet u naar je conversie nodig hebben",
      );
    }

    const from = this._dutchLanguageVariant;
    const to = Language.INFORMAL;

    return InstanceBuilder.from(this)
      .withDutchLanguageVariant(to)
      .withNeedsConversionFromFormalToInformal(false)
      .withTitle(this._title?.transformLanguage(from, to))
      .withDescription(this._description?.transformLanguage(from, to))
      .withAdditionalDescription(
        this._additionalDescription?.transformLanguage(from, to),
      )
      .withException(this._exception?.transformLanguage(from, to))
      .withRegulation(this._regulation?.transformLanguage(from, to))
      .withRequirements(
        this._requirements.map((req) => req.transformLanguage(from, to)),
      )
      .withProcedures(
        this._procedures.map((proc) => proc.transformLanguage(from, to)),
      )
      .withWebsites(this._websites.map((ws) => ws.transformLanguage(from, to)))
      .withCosts(this._costs.map((c) => c.transformLanguage(from, to)))
      .withFinancialAdvantages(
        this._financialAdvantages.map((fa) => fa.transformLanguage(from, to)),
      )
      .withLegalResources(
        this._legalResources.map((lr) => lr.transformLanguage(from, to)),
      )
      .build();
  }

  validateForPublish(checkAddress: boolean): void {
    if (
      !isEqual(this.title.notBlankLanguages, this.description.notBlankLanguages)
    ) {
      throw new InvariantError(
        "Binnen eenzelfde taal moeten titel en beschrijving beide ingevuld (of leeg) zijn",
      );
    }
    if (checkAddress) {
      const allAddressesValid = this.contactPoints
        .flatMap((cp) => cp.address)
        .filter((address) => !!address)
        .every((address) => address.isValid());

      if (!allAddressesValid) {
        throw new InvariantError(
          "Minstens één van de adresgegevens is niet geldig",
        );
      }
    }
  }

  publish(): Instance {
    if (this.status === InstanceStatusType.VERZONDEN) {
      throw new InvariantError("Instantie heeft reeds status verzonden");
    }
    return InstanceBuilder.from(this)
      .withStatus(InstanceStatusType.VERZONDEN)
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
  private creator: Iri;
  private lastModifier: Iri;
  private dateSent: FormatPreservingDate | undefined;
  private status: InstanceStatusType;
  private reviewStatus: InstanceReviewStatusType;
  private spatials: Iri[] = [];
  private legalResources: LegalResource[] = [];
  private forMunicipalityMerger: boolean;
  private copyOf: Iri | undefined;

  static buildIri(uniqueId: string): Iri {
    return new Iri(`http://data.lblod.info/id/public-service/${uniqueId}`);
  }

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
      .withNeedsConversionFromFormalToInformal(
        instance.needsConversionFromFormalToInformal,
      )
      .withDateCreated(instance.dateCreated)
      .withDateModified(instance.dateModified)
      .withCreator(instance.creator)
      .withLastModifier(instance.lastModifier)
      .withDateSent(instance.dateSent)
      .withStatus(instance.status)
      .withReviewStatus(instance.reviewStatus)
      .withSpatials(instance.spatials)
      .withLegalResources(instance.legalResources)
      .withForMunicipalityMerger(instance.forMunicipalityMerger)
      .withCopyOf(instance.copyOf);
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

  public withAdditionalDescription(
    additionalDescription: LanguageString,
  ): InstanceBuilder {
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

  public withTargetAudiences(
    targetAudiences: TargetAudienceType[],
  ): InstanceBuilder {
    this.targetAudiences = targetAudiences;
    return this;
  }

  public withThemes(themes: ThemeType[]): InstanceBuilder {
    this.themes = themes;
    return this;
  }

  public withCompetentAuthorityLevels(
    competentAuthorityLevels: CompetentAuthorityLevelType[],
  ): InstanceBuilder {
    this.competentAuthorityLevels = competentAuthorityLevels;
    return this;
  }

  public withCompetentAuthorities(
    competentAuthorities: Iri[],
  ): InstanceBuilder {
    this.competentAuthorities = competentAuthorities;
    return this;
  }

  public withExecutingAuthorityLevels(
    executingAuthorityLevels: ExecutingAuthorityLevelType[],
  ): InstanceBuilder {
    this.executingAuthorityLevels = executingAuthorityLevels;
    return this;
  }

  public withExecutingAuthorities(
    executingAuthorities: Iri[],
  ): InstanceBuilder {
    this.executingAuthorities = executingAuthorities;
    return this;
  }

  public withPublicationMedia(
    publicationMedia: PublicationMediumType[],
  ): InstanceBuilder {
    this.publicationMedia = publicationMedia;
    return this;
  }

  public withYourEuropeCategories(
    yourEuropeCategories: YourEuropeCategoryType[],
  ): InstanceBuilder {
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

  public withFinancialAdvantages(
    financialAdvantages: FinancialAdvantage[],
  ): InstanceBuilder {
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

  public withDutchLanguageVariant(
    dutchLanguageVariant: Language,
  ): InstanceBuilder {
    this.dutchLanguageVariant = dutchLanguageVariant;
    return this;
  }

  public withNeedsConversionFromFormalToInformal(
    needsConversionFromFormalToInformal: boolean,
  ) {
    this.needsConversionFromFormalToInformal =
      needsConversionFromFormalToInformal;
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

  public withCreator(user: Iri): InstanceBuilder {
    this.creator = user;
    return this;
  }

  public withLastModifier(user: Iri): InstanceBuilder {
    this.lastModifier = user;
    return this;
  }

  public withDateSent(dateSent: FormatPreservingDate): InstanceBuilder {
    this.dateSent = dateSent;
    return this;
  }

  public withStatus(status: InstanceStatusType): InstanceBuilder {
    this.status = status;
    return this;
  }

  public withReviewStatus(
    reviewStatus: InstanceReviewStatusType,
  ): InstanceBuilder {
    this.reviewStatus = reviewStatus;
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

  public withForMunicipalityMerger(
    forMunicipalityMerger: boolean,
  ): InstanceBuilder {
    this.forMunicipalityMerger = forMunicipalityMerger;
    return this;
  }

  public withCopyOf(copyOf: Iri): InstanceBuilder {
    this.copyOf = copyOf;
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
      this.creator,
      this.lastModifier,
      this.dateSent,
      this.status,
      this.reviewStatus,
      this.spatials,
      this.legalResources,
      this.forMunicipalityMerger,
      this.copyOf,
    );
  }
}
