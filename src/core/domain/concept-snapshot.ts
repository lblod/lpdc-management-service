import { Iri } from "./shared/iri";
import { LanguageString } from "./language-string";
import { isEqual } from "lodash";
import { Requirement } from "./requirement";
import { asSortedArray } from "./shared/collections-helper";
import { Procedure } from "./procedure";
import { Website } from "./website";
import { Cost } from "./cost";
import { FinancialAdvantage } from "./financial-advantage";
import { FormatPreservingDate } from "./format-preserving-date";
import {
  CompetentAuthorityLevelType,
  ConceptTagType,
  ExecutingAuthorityLevelType,
  ProductType,
  PublicationMediumType,
  TargetAudienceType,
  ThemeType,
  YourEuropeCategoryType,
} from "./types";
import { requiredValue, requireNoDuplicates } from "./shared/invariant";
import { LegalResource } from "./legal-resource";
import { Language } from "./language";
import { VersionedLdesSnapshot } from "./versioned-ldes-snapshot";

export class ConceptSnapshot extends VersionedLdesSnapshot {
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
  private readonly _dateCreated: FormatPreservingDate;
  private readonly _dateModified: FormatPreservingDate;
  private readonly _productId: string;
  private readonly _conceptTags: ConceptTagType[];
  private readonly _isArchived: boolean;
  private readonly _legalResources: LegalResource[];

  constructor(
    id: Iri,
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
    super(id, generatedAtTime, isVersionOfConcept);
    requiredValue(title, "title");
    this._title = title;
    requiredValue(description, "description");
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
    ).filter((keyword) => !!keyword.getLanguageValue(Language.NL));
    this._requirements = [...requirements].map(Requirement.forConceptSnapshot);
    requireNoDuplicates(
      this._requirements.map((r) => r.order),
      "requirements > order",
    );
    this._procedures = [...procedures].map(Procedure.forConceptSnapshot);
    requireNoDuplicates(
      this._procedures.map((p) => p.order),
      "procedures > order",
    );
    this._websites = [...websites].map(Website.forConceptSnapshot);
    requireNoDuplicates(
      this._websites.map((w) => w.order),
      "websites > order",
    );
    this._costs = [...costs].map(Cost.forConceptSnapshot);
    requireNoDuplicates(
      this._costs.map((c) => c.order),
      "costs > order",
    );
    this._financialAdvantages = [...financialAdvantages].map(
      FinancialAdvantage.forConceptSnapshot,
    );
    requireNoDuplicates(
      this._financialAdvantages.map((fa) => fa.order),
      "financial advantages > order",
    );
    this._dateCreated = requiredValue(dateCreated, "dateCreated");
    this._dateModified = requiredValue(dateModified, "dateModified");
    this._productId = requiredValue(productId, "productId");
    this._conceptTags = requireNoDuplicates(
      asSortedArray(conceptTags),
      "conceptTags",
    );
    this._isArchived = requiredValue(isArchived, "isArchived");
    this._legalResources = [...legalResources].map(
      LegalResource.forConceptSnapshot,
    );
    requireNoDuplicates(
      this._legalResources.map((lr) => lr.order),
      "legalResources > order",
    );
  }

  get definedLanguages(): Language[] {
    return [...this._title.definedLanguages];
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

  get dateCreated(): FormatPreservingDate {
    return this._dateCreated;
  }

  get dateModified(): FormatPreservingDate {
    return this._dateModified;
  }

  get identifier(): string | undefined {
    return this.id.value.substring(this.id.value.lastIndexOf("/") + 1);
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

  transformLanguage(from: Language, to: Language): ConceptSnapshot {
    return ConceptSnapshotBuilder.from(this)
      .withTitle(this._title.transformLanguage(from, to))
      .withDescription(this._description.transformLanguage(from, to))
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

  static isFunctionallyChanged(
    value: ConceptSnapshot,
    other: ConceptSnapshot,
  ): string[] {
    const functionallyChanged: Map<string, boolean> = new Map();

    functionallyChanged.set(
      "basisinformatie",
      LanguageString.isFunctionallyChanged(value.title, other.title) ||
        LanguageString.isFunctionallyChanged(
          value.description,
          other.description,
        ) ||
        LanguageString.isFunctionallyChanged(
          value.additionalDescription,
          other.additionalDescription,
        ) ||
        LanguageString.isFunctionallyChanged(value.exception, other.exception),
    );

    functionallyChanged.set(
      "voorwaarden",
      Requirement.isFunctionallyChanged(value.requirements, other.requirements),
    );

    functionallyChanged.set(
      "procedure",
      Procedure.isFunctionallyChanged(value.procedures, other.procedures),
    );

    functionallyChanged.set(
      "kosten",
      Cost.isFunctionallyChanged(value.costs, other.costs),
    );

    functionallyChanged.set(
      "financiële voordelen",
      FinancialAdvantage.isFunctionallyChanged(
        value.financialAdvantages,
        other.financialAdvantages,
      ),
    );

    functionallyChanged.set(
      "regelgeving",
      LanguageString.isFunctionallyChanged(
        value.regulation,
        other.regulation,
      ) ||
        LegalResource.isFunctionallyChanged(
          value.legalResources,
          other.legalResources,
        ),
    );

    functionallyChanged.set(
      "meer info",
      Website.isFunctionallyChanged(value.websites, other.websites),
    );

    functionallyChanged.set(
      "algemene info (eigenschappen)",
      FormatPreservingDate.isFunctionallyChanged(
        value.startDate,
        other.startDate,
      ) ||
        FormatPreservingDate.isFunctionallyChanged(
          value.endDate,
          other.endDate,
        ) ||
        value.type !== other.type ||
        !isEqual(value.targetAudiences, other.targetAudiences) ||
        !isEqual(value.themes, other.themes),
    );

    functionallyChanged.set(
      "bevoegdheid (eigenschappen)",
      !isEqual(
        value.competentAuthorityLevels,
        other.competentAuthorityLevels,
      ) ||
        !isEqual(value.competentAuthorities, other.competentAuthorities) ||
        !isEqual(
          value.executingAuthorityLevels,
          other.executingAuthorityLevels,
        ) ||
        !isEqual(value.executingAuthorities, other.executingAuthorities),
    );

    functionallyChanged.set(
      "gerelateerd (eigenschappen)",
      !isEqual(value.keywords, other.keywords) ||
        !isEqual(value.publicationMedia, other.publicationMedia) ||
        !isEqual(value.yourEuropeCategories, other.yourEuropeCategories),
    );

    functionallyChanged.set(
      "gearchiveerd",
      !isEqual(value.isArchived, other.isArchived),
    );

    return Array.from(functionallyChanged.entries())
      .filter(([, value]) => value === true)
      .map(([key]) => key);
  }
}

export class ConceptSnapshotBuilder {
  private id: Iri;
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
  private isVersionOfConcept: Iri | undefined;
  private dateCreated: FormatPreservingDate | undefined;
  private dateModified: FormatPreservingDate | undefined;
  private generatedAtTime: FormatPreservingDate | undefined;
  private productId: string | undefined;
  private conceptTags: ConceptTagType[] = [];
  private isArchived: boolean;
  private legalResources: LegalResource[] = [];

  static from(conceptSnapshot: ConceptSnapshot): ConceptSnapshotBuilder {
    return new ConceptSnapshotBuilder()
      .withId(conceptSnapshot.id)
      .withTitle(conceptSnapshot.title)
      .withDescription(conceptSnapshot.description)
      .withAdditionalDescription(conceptSnapshot.additionalDescription)
      .withException(conceptSnapshot.exception)
      .withRegulation(conceptSnapshot.regulation)
      .withStartDate(conceptSnapshot.startDate)
      .withEndDate(conceptSnapshot.endDate)
      .withType(conceptSnapshot.type)
      .withTargetAudiences(conceptSnapshot.targetAudiences)
      .withThemes(conceptSnapshot.themes)
      .withCompetentAuthorityLevels(conceptSnapshot.competentAuthorityLevels)
      .withCompetentAuthorities(conceptSnapshot.competentAuthorities)
      .withExecutingAuthorityLevels(conceptSnapshot.executingAuthorityLevels)
      .withExecutingAuthorities(conceptSnapshot.executingAuthorities)
      .withPublicationMedia(conceptSnapshot.publicationMedia)
      .withYourEuropeCategories(conceptSnapshot.yourEuropeCategories)
      .withKeywords(conceptSnapshot.keywords)
      .withRequirements(conceptSnapshot.requirements)
      .withProcedures(conceptSnapshot.procedures)
      .withWebsites(conceptSnapshot.websites)
      .withCosts(conceptSnapshot.costs)
      .withFinancialAdvantages(conceptSnapshot.financialAdvantages)
      .withIsVersionOfConcept(conceptSnapshot.isVersionOf)
      .withDateCreated(conceptSnapshot.dateCreated)
      .withDateModified(conceptSnapshot.dateModified)
      .withGeneratedAtTime(conceptSnapshot.generatedAtTime)
      .withProductId(conceptSnapshot.productId)
      .withConceptTags(conceptSnapshot.conceptTags)
      .withIsArchived(conceptSnapshot.isArchived)
      .withLegalResources(conceptSnapshot.legalResources);
  }

  public withId(id: Iri): ConceptSnapshotBuilder {
    this.id = id;
    return this;
  }

  public withTitle(title: LanguageString): ConceptSnapshotBuilder {
    this.title = title;
    return this;
  }

  public withDescription(description: LanguageString): ConceptSnapshotBuilder {
    this.description = description;
    return this;
  }

  public withAdditionalDescription(
    additionalDescription: LanguageString,
  ): ConceptSnapshotBuilder {
    this.additionalDescription = additionalDescription;
    return this;
  }

  public withException(exception: LanguageString): ConceptSnapshotBuilder {
    this.exception = exception;
    return this;
  }

  public withRegulation(regulation: LanguageString): ConceptSnapshotBuilder {
    this.regulation = regulation;
    return this;
  }

  public withStartDate(
    startDate: FormatPreservingDate,
  ): ConceptSnapshotBuilder {
    this.startDate = startDate;
    return this;
  }

  public withEndDate(endDate: FormatPreservingDate): ConceptSnapshotBuilder {
    this.endDate = endDate;
    return this;
  }

  public withType(type: ProductType): ConceptSnapshotBuilder {
    this.type = type;
    return this;
  }

  public withTargetAudiences(
    targetAudiences: TargetAudienceType[],
  ): ConceptSnapshotBuilder {
    this.targetAudiences = targetAudiences;
    return this;
  }

  public withThemes(themes: ThemeType[]): ConceptSnapshotBuilder {
    this.themes = themes;
    return this;
  }

  public withCompetentAuthorityLevels(
    competentAuthorityLevels: CompetentAuthorityLevelType[],
  ): ConceptSnapshotBuilder {
    this.competentAuthorityLevels = competentAuthorityLevels;
    return this;
  }

  public withCompetentAuthorities(
    competentAuthorities: Iri[],
  ): ConceptSnapshotBuilder {
    this.competentAuthorities = competentAuthorities;
    return this;
  }

  public withExecutingAuthorityLevels(
    executingAuthorityLevels: ExecutingAuthorityLevelType[],
  ): ConceptSnapshotBuilder {
    this.executingAuthorityLevels = executingAuthorityLevels;
    return this;
  }

  public withExecutingAuthorities(
    executingAuthorities: Iri[],
  ): ConceptSnapshotBuilder {
    this.executingAuthorities = executingAuthorities;
    return this;
  }

  public withPublicationMedia(
    publicationMedia: PublicationMediumType[],
  ): ConceptSnapshotBuilder {
    this.publicationMedia = publicationMedia;
    return this;
  }

  public withYourEuropeCategories(
    yourEuropeCategories: YourEuropeCategoryType[],
  ): ConceptSnapshotBuilder {
    this.yourEuropeCategories = yourEuropeCategories;
    return this;
  }

  public withKeywords(keywords: LanguageString[]): ConceptSnapshotBuilder {
    this.keywords = keywords;
    return this;
  }

  public withRequirements(requirements: Requirement[]): ConceptSnapshotBuilder {
    this.requirements = requirements;
    return this;
  }

  public withProcedures(procedures: Procedure[]): ConceptSnapshotBuilder {
    this.procedures = procedures;
    return this;
  }

  public withWebsites(websites: Website[]): ConceptSnapshotBuilder {
    this.websites = websites;
    return this;
  }

  public withCosts(costs: Cost[]): ConceptSnapshotBuilder {
    this.costs = costs;
    return this;
  }

  public withFinancialAdvantages(
    financialAdvantages: FinancialAdvantage[],
  ): ConceptSnapshotBuilder {
    this.financialAdvantages = financialAdvantages;
    return this;
  }

  public withIsVersionOfConcept(
    isVersionOfConcept: Iri,
  ): ConceptSnapshotBuilder {
    this.isVersionOfConcept = isVersionOfConcept;
    return this;
  }

  public withDateCreated(
    dateCreated: FormatPreservingDate,
  ): ConceptSnapshotBuilder {
    this.dateCreated = dateCreated;
    return this;
  }

  public withDateModified(
    dateModified: FormatPreservingDate,
  ): ConceptSnapshotBuilder {
    this.dateModified = dateModified;
    return this;
  }

  public withGeneratedAtTime(
    generatedAtTime: FormatPreservingDate,
  ): ConceptSnapshotBuilder {
    this.generatedAtTime = generatedAtTime;
    return this;
  }

  public withProductId(productId: string): ConceptSnapshotBuilder {
    this.productId = productId;
    return this;
  }

  public withConceptTags(
    conceptTags: ConceptTagType[],
  ): ConceptSnapshotBuilder {
    this.conceptTags = conceptTags;
    return this;
  }

  public withIsArchived(isArchived: boolean): ConceptSnapshotBuilder {
    this.isArchived = isArchived;
    return this;
  }

  public withLegalResources(
    legalResources: LegalResource[],
  ): ConceptSnapshotBuilder {
    this.legalResources = legalResources;
    return this;
  }

  public build(): ConceptSnapshot {
    return new ConceptSnapshot(
      this.id,
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
      this.isVersionOfConcept,
      this.dateCreated,
      this.dateModified,
      this.generatedAtTime,
      this.productId,
      this.conceptTags,
      this.isArchived,
      this.legalResources,
    );
  }
}
