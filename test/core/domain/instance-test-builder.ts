import {Iri} from "../../../src/core/domain/shared/iri";
import {LanguageString} from "../../../src/core/domain/language-string";
import {Instance} from "../../../src/core/domain/instance";
import {
    buildBestuurseenheidIri, buildCodexVlaanderenIri,
    buildConceptIri,
    buildConceptSnapshotIri,
    buildInstanceIri,
    buildSpatialRefNis2019Iri,
    randomNumber
} from "./iri-test-builder";
import {uuid} from "../../../mu-helper";
import {FormatPreservingDate} from "../../../src/core/domain/format-preserving-date";
import {
    CompetentAuthorityLevelType,
    ExecutingAuthorityLevelType, InstancePublicationStatusType,
    InstanceReviewStatusType,
    InstanceStatusType,
    LanguageType,
    ProductType,
    PublicationMediumType,
    TargetAudienceType,
    ThemeType,
    YourEuropeCategoryType
} from "../../../src/core/domain/types";
import {BestuurseenheidTestBuilder} from "./bestuurseenheid-test-builder";
import {Requirement} from "../../../src/core/domain/requirement";
import {aFullRequirementForInstance, anotherFullRequirementForInstance} from "./requirement-test-builder";
import {aFullEvidenceForInstance, anotherFullEvidenceForInstance} from "./evidence-test-builder";
import {Procedure} from "../../../src/core/domain/procedure";
import {aFullProcedureForInstance, anotherFullProcedureForInstance} from "./procedure-test-builder";
import {aFullWebsiteForInstance, anotherFullWebsiteForInstance} from "./website-test-builder";
import {Website} from "../../../src/core/domain/website";
import {Cost} from "../../../src/core/domain/cost";
import {aFullCostForInstance, anotherFullCostForInstance} from "./cost-test-builder";
import {FinancialAdvantage} from "../../../src/core/domain/financial-advantage";
import {
    aFullFinancialAdvantageForInstance,
    anotherFullFinancialAdvantageForInstance
} from "./financial-advantage-test-builder";
import {ContactPoint} from "../../../src/core/domain/contactPoint";
import {aFullContactPoint, anotherFullContactPoint} from "./contactPoint-test-builder";

export function aMinimalInstance(): InstanceTestBuilder {
    const uniqueId = uuid();
    return new InstanceTestBuilder()
        .withId(buildInstanceIri(uniqueId))
        .withUuid(uniqueId)
        .withCreatedBy(buildBestuurseenheidIri(uuid()))
        .withDateCreated(InstanceTestBuilder.DATE_CREATED)
        .withDateModified(InstanceTestBuilder.DATE_MODIFIED)
        .withStatus(InstanceTestBuilder.STATUS);
}

export function aFullInstance(): InstanceTestBuilder {
    const uniqueId = uuid();
    return new InstanceTestBuilder()
        .withId(buildInstanceIri(uniqueId))
        .withUuid(uniqueId)
        .withCreatedBy(buildBestuurseenheidIri(uuid()))
        .withTitle(
            LanguageString.of(
                InstanceTestBuilder.TITLE_EN,
                InstanceTestBuilder.TITLE_NL,
                InstanceTestBuilder.TITLE_NL_FORMAL,
                InstanceTestBuilder.TITLE_NL_INFORMAL,
                InstanceTestBuilder.TITLE_NL_GENERATED_FORMAL,
                InstanceTestBuilder.TITLE_NL_GENERATED_INFORMAL))
        .withDescription(
            LanguageString.of(
                InstanceTestBuilder.DESCRIPTION_EN,
                InstanceTestBuilder.DESCRIPTION_NL,
                InstanceTestBuilder.DESCRIPTION_NL_FORMAL,
                InstanceTestBuilder.DESCRIPTION_NL_INFORMAL,
                InstanceTestBuilder.DESCRIPTION_NL_GENERATED_FORMAL,
                InstanceTestBuilder.DESCRIPTION_NL_GENERATED_INFORMAL))
        .withAdditionalDescription(
            LanguageString.of(
                InstanceTestBuilder.ADDITIONAL_DESCRIPTION_EN,
                undefined,
                InstanceTestBuilder.ADDITIONAL_DESCRIPTION_NL_FORMAL))
        .withException(
            LanguageString.of(
                InstanceTestBuilder.EXCEPTION_EN,
                undefined,
                InstanceTestBuilder.EXCEPTION_NL_FORMAL))
        .withRegulation(
            LanguageString.of(
                InstanceTestBuilder.REGULATION_EN,
                undefined,
                InstanceTestBuilder.REGULATION_NL_FORMAL))
        .withStartDate(InstanceTestBuilder.START_DATE)
        .withEndDate(InstanceTestBuilder.END_DATE)
        .withType(InstanceTestBuilder.TYPE)
        .withTargetAudiences(InstanceTestBuilder.TARGET_AUDIENCES)
        .withThemes(InstanceTestBuilder.THEMES)
        .withCompetentAuthorityLevels(InstanceTestBuilder.COMPETENT_AUTHORITY_LEVELS)
        .withCompetentAuthorities(InstanceTestBuilder.COMPETENT_AUTHORITIES)
        .withExecutingAuthorityLevels(InstanceTestBuilder.EXECUTING_AUTHORITY_LEVELS)
        .withExecutingAuthorities(InstanceTestBuilder.EXECUTING_AUTHORITIES)
        .withPublicationMedia(InstanceTestBuilder.PUBLICATION_MEDIA)
        .withYourEuropeCategories(InstanceTestBuilder.YOUR_EUROPE_CATEGORIES)
        .withKeywords(InstanceTestBuilder.KEYWORDS)
        .withRequirements(InstanceTestBuilder.REQUIREMENTS)
        .withProcedures(InstanceTestBuilder.PROCEDURES)
        .withWebsites(InstanceTestBuilder.WEBSITES)
        .withCosts(InstanceTestBuilder.COSTS)
        .withFinancialAdvantages(InstanceTestBuilder.FINANCIAL_ADVANTAGES)
        .withContactPoints(InstanceTestBuilder.CONTACT_POINTS)
        .withSource(buildConceptIri(uuid()))
        .withVersionedSource(buildConceptSnapshotIri(uuid()))
        .withLanguages(InstanceTestBuilder.LANGUAGES)
        .withDateCreated(InstanceTestBuilder.DATE_CREATED)
        .withDateModified(InstanceTestBuilder.DATE_MODIFIED)
        .withStatus(InstanceTestBuilder.STATUS)
        .withReviewStatus(InstanceTestBuilder.REVIEW_STATUS)
        .withPublicationStatus(InstanceTestBuilder.PUBLICATION_STATUS)
        .withSpatials(InstanceTestBuilder.SPATIALS)
        .withLegalResources(InstanceTestBuilder.LEGAL_RESOURCES);
}

export class InstanceTestBuilder {

    public static readonly TITLE_EN = 'Instance Title - en';
    public static readonly TITLE_NL = 'Instance Title - nl';
    public static readonly TITLE_NL_FORMAL = 'Instance Title - nl-formal';
    public static readonly TITLE_NL_INFORMAL = 'Instance Title - nl-informal';
    public static readonly TITLE_NL_GENERATED_FORMAL = 'Instance Title - nl-generated-formal';
    public static readonly TITLE_NL_GENERATED_INFORMAL = 'Instance Title - nl-generated-informal';

    public static readonly DESCRIPTION_EN = 'Instance Description - en';
    public static readonly DESCRIPTION_NL = 'Instance Description - nl';
    public static readonly DESCRIPTION_NL_FORMAL = 'Instance Description - nl-formal';
    public static readonly DESCRIPTION_NL_INFORMAL = 'Instance Description - nl-informal';
    public static readonly DESCRIPTION_NL_GENERATED_FORMAL = 'Instance Description - nl-generated-formal';
    public static readonly DESCRIPTION_NL_GENERATED_INFORMAL = 'Instance Description - nl-generated-informal';

    public static readonly DATE_CREATED = FormatPreservingDate.of('2022-10-01T13:00:42.074442Z');
    public static readonly DATE_MODIFIED = FormatPreservingDate.of('2023-10-02T20:00:20.242928Z');

    public static readonly STATUS = InstanceStatusType.ONTWERP;

    public static readonly SPATIALS = [buildSpatialRefNis2019Iri(randomNumber(10000, 19999)), buildSpatialRefNis2019Iri(randomNumber(20000, 29999))];

    public static readonly COMPETENT_AUTHORITIES = [BestuurseenheidTestBuilder.PEPINGEN_IRI, BestuurseenheidTestBuilder.HOUTHALEN_HELCHTEREN_IRI, BestuurseenheidTestBuilder.BORGLOON_IRI];

    public static readonly EXECUTING_AUTHORITIES = [BestuurseenheidTestBuilder.PEPINGEN_IRI, BestuurseenheidTestBuilder.OUD_HEVERLEE_IRI];

    public static readonly ADDITIONAL_DESCRIPTION_EN = 'Instance Additional Description - en';
    public static readonly ADDITIONAL_DESCRIPTION_NL_FORMAL = 'Instance Additional Description - nl-formal';
    public static readonly ADDITIONAL_DESCRIPTION_NL_INFORMAL = 'Instance Additional Description - nl-informal';

    public static readonly EXCEPTION_EN = 'Instance Exception - en';
    public static readonly EXCEPTION_NL_FORMAL = 'Instance Exception - nl-formal';
    public static readonly EXCEPTION_NL_INFORMAL = 'Instance Exception - nl-informal';

    public static readonly REGULATION_EN = 'Instance Regulation - en';
    public static readonly REGULATION_NL_FORMAL = 'Instance Regulation - nl-formal';
    public static readonly REGULATION_NL_INFORMAL = 'Instance Regulation - nl-informal';

    public static readonly START_DATE = FormatPreservingDate.of('2023-10-21T00:00:00.456Z');
    public static readonly END_DATE = FormatPreservingDate.of('2027-09-17T00:00:00.123Z');

    public static readonly TYPE = ProductType.BEWIJS;

    public static readonly TARGET_AUDIENCES = [TargetAudienceType.ORGANISATIE, TargetAudienceType.VERENIGING, TargetAudienceType.BURGER];

    public static readonly THEMES = [ThemeType.BOUWENWONEN, ThemeType.MILIEUENERGIE, ThemeType.WELZIJNGEZONDHEID];

    public static readonly COMPETENT_AUTHORITY_LEVELS = [CompetentAuthorityLevelType.LOKAAL, CompetentAuthorityLevelType.EUROPEES, CompetentAuthorityLevelType.FEDERAAL];
    public static readonly EXECUTING_AUTHORITY_LEVELS = [ExecutingAuthorityLevelType.LOKAAL, ExecutingAuthorityLevelType.EUROPEES, ExecutingAuthorityLevelType.FEDERAAL];

    public static readonly PUBLICATION_MEDIA = [PublicationMediumType.YOUREUROPE, PublicationMediumType.RECHTENVERKENNER];

    public static readonly YOUR_EUROPE_CATEGORIES = [YourEuropeCategoryType.WERKENPENSIONERING, YourEuropeCategoryType.PROCEDURESTARTENEXPLOITERENSLUITENBEDRIJFPENSIOENENVERZEKERINGSREGELINGENWERKGEVER, YourEuropeCategoryType.ONDERWIJSOFSTAGESTAGE];

    public static readonly KEYWORDS = [LanguageString.of('overlijden - en'), LanguageString.of(undefined, 'overlijden - nl'), LanguageString.of(undefined, 'goederen verhandelen'), LanguageString.of('sacrale activiteiten')];

    public static readonly REQUIREMENTS = [
        aFullRequirementForInstance().withUuid(uuid()).withEvidence(aFullEvidenceForInstance().withUuid(uuid()).build()).build(),
        anotherFullRequirementForInstance().withUuid(uuid()).withEvidence(anotherFullEvidenceForInstance().withUuid(uuid()).build()).build()
    ];

    public static readonly PROCEDURES = [
        aFullProcedureForInstance().withUuid(uuid()).withWebsites([aFullWebsiteForInstance().withUuid(uuid()).build(), anotherFullWebsiteForInstance(uuid()).withUuid(uuid()).build()]).build(),
        anotherFullProcedureForInstance().withUuid(uuid()).withWebsites([anotherFullWebsiteForInstance(uuid()).withUuid(uuid()).build(), anotherFullWebsiteForInstance(uuid()).withUuid(uuid()).build()]).build()
    ];

    public static readonly WEBSITES = [anotherFullWebsiteForInstance(uuid()).build(), anotherFullWebsiteForInstance(uuid()).build()];

    public static readonly COSTS = [aFullCostForInstance().withUuid(uuid()).build(), anotherFullCostForInstance().withUuid(uuid()).build()];

    public static readonly FINANCIAL_ADVANTAGES = [aFullFinancialAdvantageForInstance().build(), anotherFullFinancialAdvantageForInstance().build()];

    public static readonly LANGUAGES = [LanguageType.NLD, LanguageType.ENG];

    public static readonly CONTACT_POINTS = [aFullContactPoint().build(), anotherFullContactPoint().build()];

    public static readonly REVIEW_STATUS = InstanceReviewStatusType.CONCEPT_GEWIJZIGD;
    public static readonly PUBLICATION_STATUS = InstancePublicationStatusType.GEPUBLICEERD;

    public static readonly LEGAL_RESOURCES = [buildCodexVlaanderenIri(uuid()), buildCodexVlaanderenIri(uuid()), buildCodexVlaanderenIri(uuid())];

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
    private source: Iri | undefined;
    private versionedSource: Iri | undefined;
    private languages: LanguageType[] = [];
    private dateCreated: FormatPreservingDate;
    private dateModified: FormatPreservingDate;
    private status: InstanceStatusType;
    private reviewStatus: InstanceReviewStatusType;
    private publicationStatus: InstancePublicationStatusType;
    private spatials: Iri[] = [];
    private legalResources: Iri[] = [];

    public withId(id: Iri): InstanceTestBuilder {
        this.id = id;
        return this;
    }

    public withUuid(uuid: string): InstanceTestBuilder {
        this.uuid = uuid;
        return this;
    }

    public withCreatedBy(createdBy: Iri): InstanceTestBuilder {
        this.createdBy = createdBy;
        return this;
    }

    public withTitle(title: LanguageString): InstanceTestBuilder {
        this.title = title;
        return this;
    }

    public withDescription(description: LanguageString): InstanceTestBuilder {
        this.description = description;
        return this;
    }

    public withAdditionalDescription(additionalDescription: LanguageString): InstanceTestBuilder {
        this.additionalDescription = additionalDescription;
        return this;
    }

    public withException(exception: LanguageString): InstanceTestBuilder {
        this.exception = exception;
        return this;
    }

    public withRegulation(regulation: LanguageString): InstanceTestBuilder {
        this.regulation = regulation;
        return this;
    }

    public withStartDate(startDate: FormatPreservingDate): InstanceTestBuilder {
        this.startDate = startDate;
        return this;
    }

    public withEndDate(endDate: FormatPreservingDate): InstanceTestBuilder {
        this.endDate = endDate;
        return this;
    }

    public withType(type: ProductType): InstanceTestBuilder {
        this.type = type;
        return this;
    }

    public withTargetAudiences(targetAudiences: TargetAudienceType[]): InstanceTestBuilder {
        this.targetAudiences = targetAudiences;
        return this;
    }

    public withThemes(themes: ThemeType[]): InstanceTestBuilder {
        this.themes = themes;
        return this;
    }

    public withCompetentAuthorityLevels(competentAuthorityLevels: CompetentAuthorityLevelType[]): InstanceTestBuilder {
        this.competentAuthorityLevels = competentAuthorityLevels;
        return this;
    }

    public withCompetentAuthorities(competentAuthorities: Iri[]): InstanceTestBuilder {
        this.competentAuthorities = competentAuthorities;
        return this;
    }

    public withExecutingAuthorityLevels(executingAuthorityLevels: ExecutingAuthorityLevelType[]): InstanceTestBuilder {
        this.executingAuthorityLevels = executingAuthorityLevels;
        return this;
    }

    public withExecutingAuthorities(executingAuthorities: Iri[]): InstanceTestBuilder {
        this.executingAuthorities = executingAuthorities;
        return this;
    }

    public withPublicationMedia(publicationMedia: PublicationMediumType[]): InstanceTestBuilder {
        this.publicationMedia = publicationMedia;
        return this;
    }

    public withYourEuropeCategories(yourEuropeCategories: YourEuropeCategoryType[]): InstanceTestBuilder {
        this.yourEuropeCategories = yourEuropeCategories;
        return this;
    }

    public withKeywords(keywords: LanguageString[]): InstanceTestBuilder {
        this.keywords = keywords;
        return this;
    }

    public withRequirements(requirements: Requirement[]): InstanceTestBuilder {
        this.requirements = requirements;
        return this;
    }

    public withProcedures(procedures: Procedure[]): InstanceTestBuilder {
        this.procedures = procedures;
        return this;
    }

    public withWebsites(websites: Website[]): InstanceTestBuilder {
        this.websites = websites;
        return this;
    }

    public withCosts(costs: Cost[]): InstanceTestBuilder {
        this.costs = costs;
        return this;
    }

    public withFinancialAdvantages(financialAdvantages: FinancialAdvantage[]): InstanceTestBuilder {
        this.financialAdvantages = financialAdvantages;
        return this;
    }

    public withContactPoints(contactPoinst: ContactPoint[]): InstanceTestBuilder {
        this.contactPoints = contactPoinst;
        return this;
    }

    public withSource(conceptId: Iri): InstanceTestBuilder {
        this.source = conceptId;
        return this;
    }

    public withVersionedSource(conceptSnapshotId: Iri): InstanceTestBuilder {
        this.versionedSource = conceptSnapshotId;
        return this;
    }

    public withLanguages(languages: LanguageType[]): InstanceTestBuilder {
        this.languages = languages;
        return this;
    }

    public withDateCreated(dateCreated: FormatPreservingDate): InstanceTestBuilder {
        this.dateCreated = dateCreated;
        return this;
    }

    public withDateModified(dateModified: FormatPreservingDate): InstanceTestBuilder {
        this.dateModified = dateModified;
        return this;
    }

    public withStatus(status: InstanceStatusType): InstanceTestBuilder {
        this.status = status;
        return this;
    }

    public withReviewStatus(reviewStatus: InstanceReviewStatusType): InstanceTestBuilder {
        this.reviewStatus = reviewStatus;
        return this;
    }

    public withPublicationStatus(publicationStatus: InstancePublicationStatusType) {
        this.publicationStatus = publicationStatus;
        return this;
    }

    public withSpatials(spatials: Iri[]): InstanceTestBuilder {
        this.spatials = spatials;
        return this;
    }

    public withLegalResources(legalResources: Iri[]): InstanceTestBuilder {
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
            this.source,
            this.versionedSource,
            this.languages,
            this.dateCreated,
            this.dateModified,
            this.status,
            this.reviewStatus,
            this.publicationStatus,
            this.spatials,
            this.legalResources
        );
    }
}


