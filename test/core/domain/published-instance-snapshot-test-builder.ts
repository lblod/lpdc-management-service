import {
  PublishedInstanceSnapshot,
  PublishedInstanceSnapshotBuilder,
} from "../../../src/core/domain/published-instance-snapshot";
import { Iri } from "../../../src/core/domain/shared/iri";
import { LanguageString } from "../../../src/core/domain/language-string";
import { FormatPreservingDate } from "../../../src/core/domain/format-preserving-date";
import {
  CompetentAuthorityLevelType,
  ExecutingAuthorityLevelType,
  LanguageType,
  ProductType,
  PublicationMediumType,
  TargetAudienceType,
  ThemeType,
  YourEuropeCategoryType,
} from "../../../src/core/domain/types";
import { Requirement } from "../../../src/core/domain/requirement";
import { Procedure } from "../../../src/core/domain/procedure";
import { Website } from "../../../src/core/domain/website";
import { Cost } from "../../../src/core/domain/cost";
import { FinancialAdvantage } from "../../../src/core/domain/financial-advantage";
import { ContactPoint } from "../../../src/core/domain/contact-point";
import { LegalResource } from "../../../src/core/domain/legal-resource";
import { InstanceBuilder } from "../../../src/core/domain/instance";
import {
  buildBestuurseenheidIri,
  buildConceptIri,
  buildNutsCodeIri,
} from "./iri-test-builder";
import { uuid } from "../../../mu-helper";
import { BestuurseenheidTestBuilder } from "./bestuurseenheid-test-builder";
import {
  aFullLegalResourceForInstanceSnapshot,
  anotherFullLegalResourceForInstanceSnapshot,
} from "./legal-resource-test-builder";
import {
  aFullRequirementForInstanceSnapshot,
  anotherFullRequirementForInstanceSnapshot,
} from "./requirement-test-builder";
import {
  aFullEvidenceForInstanceSnapshot,
  anotherFullEvidenceForInstanceSnapshot,
} from "./evidence-test-builder";
import {
  aFullWebsiteForInstanceSnapshot,
  anotherFullWebsiteForInstanceSnapshot,
} from "./website-test-builder";
import {
  aFullProcedureForInstanceSnapshot,
  anotherFullProcedureForInstanceSnapshot,
} from "./procedure-test-builder";
import {
  aFullCostForInstanceSnapshot,
  anotherFullCostForInstanceSnapshot,
} from "./cost-test-builder";
import {
  aFullFinancialAdvantageForInstanceSnapshot,
  anotherFullFinancialAdvantageForInstanceSnapshot,
} from "./financial-advantage-test-builder";
import {
  aFullContactPointForInstanceSnapshot,
  anotherFullContactPointForInstanceSnapshot,
} from "./contact-point-test-builder";

export function aFullPublishedInstanceSnapshot(): PublishedInstanceSnapshotTestBuilder {
  const uniqueId = uuid();
  return new PublishedInstanceSnapshotTestBuilder()
    .withId(PublishedInstanceSnapshotBuilder.buildIri(uniqueId))
    .withGeneratedAtTime(PublishedInstanceSnapshotTestBuilder.GENERATED_AT_TIME)
    .withIsPublishedVersionOf(InstanceBuilder.buildIri(uuid()))
    .withCreatedBy(buildBestuurseenheidIri(uuid()))
    .withTitle(
      LanguageString.of(
        undefined,
        undefined,
        PublishedInstanceSnapshotTestBuilder.TITLE_NL_INFORMAL,
      ),
    )
    .withDescription(
      LanguageString.of(
        undefined,
        undefined,
        PublishedInstanceSnapshotTestBuilder.DESCRIPTION_NL_INFORMAL,
      ),
    )
    .withDescription(
      LanguageString.of(
        undefined,
        PublishedInstanceSnapshotTestBuilder.DESCRIPTION_NL_FORMAL,
      ),
    )
    .withAdditionalDescription(
      LanguageString.of(
        undefined,
        PublishedInstanceSnapshotTestBuilder.ADDITIONAL_DESCRIPTION_NL_FORMAL,
      ),
    )
    .withException(
      LanguageString.of(
        undefined,
        PublishedInstanceSnapshotTestBuilder.EXCEPTION_NL_FORMAL,
      ),
    )
    .withRegulation(
      LanguageString.of(
        undefined,
        PublishedInstanceSnapshotTestBuilder.REGULATION_NL_FORMAL,
      ),
    )
    .withStartDate(PublishedInstanceSnapshotTestBuilder.START_DATE)
    .withEndDate(PublishedInstanceSnapshotTestBuilder.END_DATE)
    .withType(PublishedInstanceSnapshotTestBuilder.TYPE)
    .withTargetAudiences(PublishedInstanceSnapshotTestBuilder.TARGET_AUDIENCES)
    .withThemes(PublishedInstanceSnapshotTestBuilder.THEMES)
    .withCompetentAuthorityLevels(
      PublishedInstanceSnapshotTestBuilder.COMPETENT_AUTHORITY_LEVELS,
    )
    .withCompetentAuthorities(
      PublishedInstanceSnapshotTestBuilder.COMPETENT_AUTHORITIES,
    )
    .withExecutingAuthorityLevels(
      PublishedInstanceSnapshotTestBuilder.EXECUTING_AUTHORITY_LEVELS,
    )
    .withExecutingAuthorities(
      PublishedInstanceSnapshotTestBuilder.EXECUTING_AUTHORITIES,
    )
    .withPublicationMedia(
      PublishedInstanceSnapshotTestBuilder.PUBLICATION_MEDIA,
    )
    .withYourEuropeCategories(
      PublishedInstanceSnapshotTestBuilder.YOUR_EUROPE_CATEGORIES,
    )
    .withKeywords(PublishedInstanceSnapshotTestBuilder.KEYWORDS)
    .withRequirements(PublishedInstanceSnapshotTestBuilder.REQUIREMENTS)
    .withProcedures(PublishedInstanceSnapshotTestBuilder.PROCEDURES)
    .withWebsites(PublishedInstanceSnapshotTestBuilder.WEBSITES)
    .withCosts(PublishedInstanceSnapshotTestBuilder.COSTS)
    .withFinancialAdvantages(
      PublishedInstanceSnapshotTestBuilder.FINANCIAL_ADVANTAGES,
    )
    .withContactPoints(PublishedInstanceSnapshotTestBuilder.CONTACT_POINTS)
    .withConceptId(buildConceptIri(uuid()))
    .withLanguages(PublishedInstanceSnapshotTestBuilder.LANGUAGES)
    .withDateCreated(PublishedInstanceSnapshotTestBuilder.DATE_CREATED)
    .withDateModified(PublishedInstanceSnapshotTestBuilder.DATE_MODIFIED)
    .withSpatials(PublishedInstanceSnapshotTestBuilder.SPATIALS)
    .withLegalResources(PublishedInstanceSnapshotTestBuilder.LEGAL_RESOURCES);
}

export class PublishedInstanceSnapshotTestBuilder extends PublishedInstanceSnapshotBuilder {
  public static readonly TITLE_NL = "Instance Snapshot Title - nl";
  public static readonly TITLE_NL_FORMAL =
    "Instance Title Snapshot - nl-formal";
  public static readonly TITLE_NL_INFORMAL =
    "Instance Title Snapshot - nl-informal";

  public static readonly DESCRIPTION_NL = "Instance Snapshot Description - nl";
  public static readonly DESCRIPTION_NL_FORMAL =
    "Instance Snapshot Description - nl-formal";
  public static readonly DESCRIPTION_NL_INFORMAL =
    "Instance Snapshot Description - nl-informal";

  public static readonly ADDITIONAL_DESCRIPTION_NL_FORMAL =
    "Instance Snapshot Additional Description - nl-formal";
  public static readonly ADDITIONAL_DESCRIPTION_NL_INFORMAL =
    "Instance Snapshot Additional Description - nl-informal";

  public static readonly EXCEPTION_NL_FORMAL =
    "Instance Snapshot Exception - nl-formal";
  public static readonly EXCEPTION_NL_INFORMAL =
    "Instance Snapshot Exception - nl-informal";

  public static readonly REGULATION_NL_FORMAL =
    "Instance Snapshot Regulation - nl-formal";
  public static readonly REGULATION_NL_INFORMAL =
    "Instance Snapshot Regulation - nl-informal";

  public static readonly START_DATE = FormatPreservingDate.of(
    "2019-09-21T00:00:00.456Z",
  );
  public static readonly END_DATE = FormatPreservingDate.of(
    "2042-02-11T00:00:00.123Z",
  );

  public static readonly TYPE = ProductType.FINANCIELEVERPLICHTING;

  public static readonly TARGET_AUDIENCES = [
    TargetAudienceType.LOKAALBESTUUR,
    TargetAudienceType.VLAAMSEOVERHEID,
    TargetAudienceType.BURGER,
  ];

  public static readonly THEMES = [
    ThemeType.ECONOMIEWERK,
    ThemeType.ONDERWIJSWETENSCHAP,
    ThemeType.BURGEROVERHEID,
  ];

  public static readonly COMPETENT_AUTHORITY_LEVELS = [
    CompetentAuthorityLevelType.FEDERAAL,
    CompetentAuthorityLevelType.PROVINCIAAL,
    CompetentAuthorityLevelType.VLAAMS,
  ];
  public static readonly COMPETENT_AUTHORITIES = [
    BestuurseenheidTestBuilder.ASSENEDE_IRI,
    BestuurseenheidTestBuilder.PEPINGEN_IRI,
    BestuurseenheidTestBuilder.HOUTHALEN_HELCHTEREN_IRI,
  ];
  public static readonly EXECUTING_AUTHORITY_LEVELS = [
    ExecutingAuthorityLevelType.DERDEN,
    ExecutingAuthorityLevelType.VLAAMS,
    ExecutingAuthorityLevelType.FEDERAAL,
  ];
  public static readonly EXECUTING_AUTHORITIES = [
    BestuurseenheidTestBuilder.BORGLOON_IRI,
    BestuurseenheidTestBuilder.OUD_HEVERLEE_IRI,
  ];

  public static readonly PUBLICATION_MEDIA = [
    PublicationMediumType.YOUREUROPE,
    PublicationMediumType.RECHTENVERKENNER,
  ];

  public static readonly YOUR_EUROPE_CATEGORIES = [
    YourEuropeCategoryType.PROCEDURESTARTENEXPLOITERENSLUITENBEDRIJFKENNISGEVING,
    YourEuropeCategoryType.BEDRIJFREGISTRATIEPROCEDURESRECHTSVORMEN,
    YourEuropeCategoryType.ONDERWIJSOFSTAGEONDERZOEK,
  ];

  public static readonly KEYWORDS = [
    LanguageString.of("geboorte"),
    LanguageString.of("administratie"),
  ];

  public static readonly LANGUAGES = [
    LanguageType.NLD,
    LanguageType.ENG,
    LanguageType.FRA,
  ];

  public static readonly SPATIALS = [
    buildNutsCodeIri(45700),
    buildNutsCodeIri(52000),
    buildNutsCodeIri(98786),
  ];

  public static readonly LEGAL_RESOURCES = [
    aFullLegalResourceForInstanceSnapshot().withOrder(1).build(),
    anotherFullLegalResourceForInstanceSnapshot(uuid()).withOrder(2).build(),
  ];

  public static readonly REQUIREMENTS = [
    aFullRequirementForInstanceSnapshot()
      .withEvidence(aFullEvidenceForInstanceSnapshot().build())
      .build(),
    anotherFullRequirementForInstanceSnapshot()
      .withEvidence(anotherFullEvidenceForInstanceSnapshot().build())
      .build(),
  ];

  public static readonly WEBSITES = [
    anotherFullWebsiteForInstanceSnapshot(uuid()).withOrder(1).build(),
    anotherFullWebsiteForInstanceSnapshot(uuid()).withOrder(2).build(),
  ];

  public static readonly PROCEDURES = [
    aFullProcedureForInstanceSnapshot()
      .withWebsites([
        aFullWebsiteForInstanceSnapshot().withOrder(1).build(),
        anotherFullWebsiteForInstanceSnapshot(uuid()).withOrder(2).build(),
      ])
      .build(),
    anotherFullProcedureForInstanceSnapshot()
      .withWebsites([
        anotherFullWebsiteForInstanceSnapshot(uuid()).withOrder(1).build(),
        anotherFullWebsiteForInstanceSnapshot(uuid()).withOrder(2).build(),
      ])
      .build(),
  ];

  public static readonly COSTS = [
    aFullCostForInstanceSnapshot().build(),
    anotherFullCostForInstanceSnapshot().build(),
  ];

  public static readonly FINANCIAL_ADVANTAGES = [
    aFullFinancialAdvantageForInstanceSnapshot().build(),
    anotherFullFinancialAdvantageForInstanceSnapshot().build(),
  ];

  public static readonly CONTACT_POINTS = [
    aFullContactPointForInstanceSnapshot().build(),
    anotherFullContactPointForInstanceSnapshot().build(),
  ];

  public static readonly DATE_CREATED = FormatPreservingDate.of(
    "2024-01-08T12:13:42.074442Z",
  );
  public static readonly DATE_MODIFIED = FormatPreservingDate.of(
    "2024-02-06T16:16:20.242928Z",
  );

  public static readonly GENERATED_AT_TIME = FormatPreservingDate.of(
    "2024-02-06T17:13:21.242924Z",
  );

  private id: Iri;
  private generatedAtTime: FormatPreservingDate;
  private isPublishedVersionOf: Iri;
  private createdBy: Iri;
  private title: LanguageString;
  private description: LanguageString;
  private additionalDescription: LanguageString | undefined;
  private exception: LanguageString | undefined;
  private regulation: LanguageString | undefined;
  private startDate: FormatPreservingDate | undefined;
  private endDate: FormatPreservingDate | undefined;
  private type: ProductType | undefined;
  private targetAudiences: TargetAudienceType[];
  private themes: ThemeType[];
  private competentAuthorityLevels: CompetentAuthorityLevelType[];
  private competentAuthorities: Iri[];
  private executingAuthorityLevels: ExecutingAuthorityLevelType[];
  private executingAuthorities: Iri[];
  private publicationMedia: PublicationMediumType[];
  private yourEuropeCategories: YourEuropeCategoryType[];
  private keywords: LanguageString[];
  private requirements: Requirement[];
  private procedures: Procedure[];
  private websites: Website[];
  private costs: Cost[];
  private financialAdvantages: FinancialAdvantage[];
  private contactPoints: ContactPoint[];
  private conceptId: Iri | undefined;
  private languages: LanguageType[];
  private dateCreated: FormatPreservingDate;
  private dateModified: FormatPreservingDate;
  private spatials: Iri[];
  private legalResources: LegalResource[];

  withId(id: Iri): PublishedInstanceSnapshotTestBuilder {
    this.id = id;
    return this;
  }

  withGeneratedAtTime(
    generatedAtTime: FormatPreservingDate,
  ): PublishedInstanceSnapshotTestBuilder {
    this.generatedAtTime = generatedAtTime;
    return this;
  }

  withIsPublishedVersionOf(
    instanceId: Iri,
  ): PublishedInstanceSnapshotTestBuilder {
    this.isPublishedVersionOf = instanceId;
    return this;
  }

  withCreatedBy(createdBy: Iri): PublishedInstanceSnapshotTestBuilder {
    this.createdBy = createdBy;
    return this;
  }

  withTitle(title: LanguageString): PublishedInstanceSnapshotTestBuilder {
    this.title = title;
    return this;
  }

  withDescription(
    description: LanguageString,
  ): PublishedInstanceSnapshotTestBuilder {
    this.description = description;
    return this;
  }

  withAdditionalDescription(
    additionalDescription: LanguageString,
  ): PublishedInstanceSnapshotTestBuilder {
    this.additionalDescription = additionalDescription;
    return this;
  }

  withException(
    exception: LanguageString,
  ): PublishedInstanceSnapshotTestBuilder {
    this.exception = exception;
    return this;
  }

  withRegulation(
    regulation: LanguageString,
  ): PublishedInstanceSnapshotTestBuilder {
    this.regulation = regulation;
    return this;
  }

  withStartDate(
    startDate: FormatPreservingDate,
  ): PublishedInstanceSnapshotTestBuilder {
    this.startDate = startDate;
    return this;
  }

  withEndDate(
    endDate: FormatPreservingDate,
  ): PublishedInstanceSnapshotTestBuilder {
    this.endDate = endDate;
    return this;
  }

  withType(type: ProductType): PublishedInstanceSnapshotTestBuilder {
    this.type = type;
    return this;
  }

  withTargetAudiences(
    targetAudiences: TargetAudienceType[],
  ): PublishedInstanceSnapshotTestBuilder {
    this.targetAudiences = targetAudiences;
    return this;
  }

  withThemes(themes: ThemeType[]): PublishedInstanceSnapshotTestBuilder {
    this.themes = themes;
    return this;
  }

  withCompetentAuthorityLevels(
    competentAuthorityLevels: CompetentAuthorityLevelType[],
  ): PublishedInstanceSnapshotTestBuilder {
    this.competentAuthorityLevels = competentAuthorityLevels;
    return this;
  }

  withCompetentAuthorities(
    competentAuthorities: Iri[],
  ): PublishedInstanceSnapshotTestBuilder {
    this.competentAuthorities = competentAuthorities;
    return this;
  }

  withExecutingAuthorityLevels(
    executingAuthorityLevels: ExecutingAuthorityLevelType[],
  ): PublishedInstanceSnapshotTestBuilder {
    this.executingAuthorityLevels = executingAuthorityLevels;
    return this;
  }

  withExecutingAuthorities(
    executingAuthorities: Iri[],
  ): PublishedInstanceSnapshotTestBuilder {
    this.executingAuthorities = executingAuthorities;
    return this;
  }

  withPublicationMedia(
    publicationMedia: PublicationMediumType[],
  ): PublishedInstanceSnapshotTestBuilder {
    this.publicationMedia = publicationMedia;
    return this;
  }

  withYourEuropeCategories(
    yourEuropeCategories: YourEuropeCategoryType[],
  ): PublishedInstanceSnapshotTestBuilder {
    this.yourEuropeCategories = yourEuropeCategories;
    return this;
  }

  withKeywords(
    keywords: LanguageString[],
  ): PublishedInstanceSnapshotTestBuilder {
    this.keywords = keywords;
    return this;
  }

  withRequirements(
    requirements: Requirement[],
  ): PublishedInstanceSnapshotTestBuilder {
    this.requirements = requirements;
    return this;
  }

  withProcedures(
    procedures: Procedure[],
  ): PublishedInstanceSnapshotTestBuilder {
    this.procedures = procedures;
    return this;
  }

  withWebsites(websites: Website[]): PublishedInstanceSnapshotTestBuilder {
    this.websites = websites;
    return this;
  }

  withCosts(costs: Cost[]): PublishedInstanceSnapshotTestBuilder {
    this.costs = costs;
    return this;
  }

  withFinancialAdvantages(
    financialAdvantages: FinancialAdvantage[],
  ): PublishedInstanceSnapshotTestBuilder {
    this.financialAdvantages = financialAdvantages;
    return this;
  }

  withContactPoints(
    contactPoinst: ContactPoint[],
  ): PublishedInstanceSnapshotTestBuilder {
    this.contactPoints = contactPoinst;
    return this;
  }

  withConceptId(conceptId: Iri): PublishedInstanceSnapshotTestBuilder {
    this.conceptId = conceptId;
    return this;
  }

  withLanguages(
    languages: LanguageType[],
  ): PublishedInstanceSnapshotTestBuilder {
    this.languages = languages;
    return this;
  }

  withDateCreated(
    dateCreated: FormatPreservingDate,
  ): PublishedInstanceSnapshotTestBuilder {
    this.dateCreated = dateCreated;
    return this;
  }

  withDateModified(
    dateModified: FormatPreservingDate,
  ): PublishedInstanceSnapshotTestBuilder {
    this.dateModified = dateModified;
    return this;
  }

  withSpatials(spatials: Iri[]): PublishedInstanceSnapshotTestBuilder {
    this.spatials = spatials;
    return this;
  }

  withLegalResources(
    legalResources: LegalResource[],
  ): PublishedInstanceSnapshotTestBuilder {
    this.legalResources = legalResources;
    return this;
  }

  build(): PublishedInstanceSnapshot {
    return new PublishedInstanceSnapshot(
      this.id,
      this.generatedAtTime,
      this.isPublishedVersionOf,
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
      this.languages,
      this.dateCreated,
      this.dateModified,
      this.spatials,
      this.legalResources,
    );
  }
}
