import {Iri} from "../../../src/core/domain/shared/iri";
import {LanguageString} from "../../../src/core/domain/language-string";
import {FormatPreservingDate} from "../../../src/core/domain/format-preserving-date";
import {
    CompetentAuthorityLevelType,
    ExecutingAuthorityLevelType,
    LanguageType,
    ProductType,
    PublicationMediumType,
    TargetAudienceType,
    ThemeType,
    YourEuropeCategoryType
} from "../../../src/core/domain/types";
import {Requirement} from "../../../src/core/domain/requirement";
import {Procedure} from "../../../src/core/domain/procedure";
import {Website} from "../../../src/core/domain/website";
import {Cost} from "../../../src/core/domain/cost";
import {FinancialAdvantage} from "../../../src/core/domain/financial-advantage";
import {ContactPoint} from "../../../src/core/domain/contact-point";
import {InstanceSnapshot} from "../../../src/core/domain/instance-snapshot";
import {uuid} from "../../../mu-helper";
import {
    buildBestuurseenheidIri,
    buildConceptIri,
    buildInstanceSnapshotIri,
    buildNutsCodeIri,
} from "./iri-test-builder";
import {BestuurseenheidTestBuilder} from "./bestuurseenheid-test-builder";
import {
    aFullRequirementForInstanceSnapshot,
    anotherFullRequirementForInstanceSnapshot
} from "./requirement-test-builder";
import {aFullEvidenceForInstanceSnapshot, anotherFullEvidenceForInstanceSnapshot} from "./evidence-test-builder";
import {aFullWebsiteForInstanceSnapshot, anotherFullWebsiteForInstanceSnapshot} from "./website-test-builder";
import {aFullProcedureForInstanceSnapshot, anotherFullProcedureForInstanceSnapshot} from "./procedure-test-builder";
import {aFullCostForInstanceSnapshot, anotherFullCostForInstanceSnapshot} from "./cost-test-builder";
import {
    aFullFinancialAdvantageForInstanceSnapshot,
    anotherFullFinancialAdvantageForInstanceSnapshot
} from "./financial-advantage-test-builder";
import {
    aFullContactPointForInstanceSnapshot,
    anotherFullContactPointForInstanceSnapshot
} from "./contact-point-test-builder";
import {LegalResource} from "../../../src/core/domain/legal-resource";
import {
    aFullLegalResourceForInstanceSnapshot,
    anotherFullLegalResourceForInstanceSnapshot
} from "./legal-resource-test-builder";
import {InstanceBuilder} from "../../../src/core/domain/instance";

export function aMinimalInstanceSnapshot(): InstanceSnapshotTestBuilder {
    const uniqueId = uuid();
    return new InstanceSnapshotTestBuilder()
        .withId(buildInstanceSnapshotIri(uniqueId))
        .withCreatedBy(buildBestuurseenheidIri(uuid()))
        .withIsVersionOfInstance(InstanceBuilder.buildIri(uuid()))
        .withTitle(
            LanguageString.of(
                undefined,
                undefined,
                InstanceSnapshotTestBuilder.TITLE_NL_INFORMAL))
        .withDescription(
            LanguageString.of(
                undefined,
                undefined,
                InstanceSnapshotTestBuilder.DESCRIPTION_NL_INFORMAL))
        .withDateCreated(InstanceSnapshotTestBuilder.DATE_CREATED)
        .withDateModified(InstanceSnapshotTestBuilder.DATE_MODIFIED)
        .withGeneratedAtTime(InstanceSnapshotTestBuilder.GENERATED_AT_TIME)
        .withCompetentAuthorities([InstanceSnapshotTestBuilder.COMPETENT_AUTHORITIES[0]])
        .withSpatials([InstanceSnapshotTestBuilder.SPATIALS[0]])
        .withIsArchived(false);
}

export function aFullInstanceSnapshot(): InstanceSnapshotTestBuilder {
    return aMinimalInstanceSnapshot()
        .withTitle(
            LanguageString.of(
                undefined,
                undefined,
                InstanceSnapshotTestBuilder.TITLE_NL_INFORMAL))
        .withDescription(
            LanguageString.of(
                undefined,
                undefined,
                InstanceSnapshotTestBuilder.DESCRIPTION_NL_INFORMAL))
        .withAdditionalDescription(
            LanguageString.of(
                undefined,
                undefined,
                InstanceSnapshotTestBuilder.ADDITIONAL_DESCRIPTION_NL_INFORMAL))
        .withException(
            LanguageString.of(
                undefined,
                undefined,
                InstanceSnapshotTestBuilder.EXCEPTION_NL_INFORMAL))
        .withRegulation(
            LanguageString.of(
                undefined,
                undefined,
                InstanceSnapshotTestBuilder.REGULATION_NL_INFORMAL))
        .withStartDate(InstanceSnapshotTestBuilder.START_DATE)
        .withEndDate(InstanceSnapshotTestBuilder.END_DATE)
        .withType(InstanceSnapshotTestBuilder.TYPE)
        .withTargetAudiences(InstanceSnapshotTestBuilder.TARGET_AUDIENCES)
        .withThemes(InstanceSnapshotTestBuilder.THEMES)
        .withCompetentAuthorityLevels(InstanceSnapshotTestBuilder.COMPETENT_AUTHORITY_LEVELS)
        .withCompetentAuthorities(InstanceSnapshotTestBuilder.COMPETENT_AUTHORITIES)
        .withExecutingAuthorityLevels(InstanceSnapshotTestBuilder.EXECUTING_AUTHORITY_LEVELS)
        .withExecutingAuthorities(InstanceSnapshotTestBuilder.EXECUTING_AUTHORITIES)
        .withPublicationMedia(InstanceSnapshotTestBuilder.PUBLICATION_MEDIA)
        .withYourEuropeCategories(InstanceSnapshotTestBuilder.YOUR_EUROPE_CATEGORIES)
        .withKeywords(InstanceSnapshotTestBuilder.KEYWORDS)
        .withLanguages(InstanceSnapshotTestBuilder.LANGUAGES)
        .withSpatials(InstanceSnapshotTestBuilder.SPATIALS)
        .withLegalResources(InstanceSnapshotTestBuilder.LEGAL_RESOURCES)
        .withConceptId(buildConceptIri(uuid()))
        .withRequirements(InstanceSnapshotTestBuilder.REQUIREMENTS)
        .withWebsites(InstanceSnapshotTestBuilder.WEBSITES)
        .withProcedures(InstanceSnapshotTestBuilder.PROCEDURES)
        .withCosts(InstanceSnapshotTestBuilder.COSTS)
        .withFinancialAdvantages(InstanceSnapshotTestBuilder.FINANCIAL_ADVANTAGES)
        .withContactPoints(InstanceSnapshotTestBuilder.CONTACT_POINTS);
}

export class InstanceSnapshotTestBuilder {

    public static readonly TITLE_NL = 'Instance Snapshot Title - nl';
    public static readonly TITLE_NL_FORMAL = 'Instance Title Snapshot - nl-formal';
    public static readonly TITLE_NL_INFORMAL = 'Instance Title Snapshot - nl-informal';

    public static readonly DESCRIPTION_NL = 'Instance Snapshot Description - nl';
    public static readonly DESCRIPTION_NL_FORMAL = 'Instance Snapshot Description - nl-formal';
    public static readonly DESCRIPTION_NL_INFORMAL = 'Instance Snapshot Description - nl-informal';

    public static readonly ADDITIONAL_DESCRIPTION_NL_FORMAL = 'Instance Snapshot Additional Description - nl-formal';
    public static readonly ADDITIONAL_DESCRIPTION_NL_INFORMAL = 'Instance Snapshot Additional Description - nl-informal';

    public static readonly EXCEPTION_NL_FORMAL = 'Instance Snapshot Exception - nl-formal';
    public static readonly EXCEPTION_NL_INFORMAL = 'Instance Snapshot Exception - nl-informal';

    public static readonly REGULATION_NL_FORMAL = 'Instance Snapshot Regulation - nl-formal';
    public static readonly REGULATION_NL_INFORMAL = 'Instance Snapshot Regulation - nl-informal';

    public static readonly START_DATE = FormatPreservingDate.of('2019-09-21T00:00:00.456Z');
    public static readonly END_DATE = FormatPreservingDate.of('2042-02-11T00:00:00.123Z');

    public static readonly TYPE = ProductType.FINANCIELEVERPLICHTING;

    public static readonly TARGET_AUDIENCES = [TargetAudienceType.LOKAALBESTUUR, TargetAudienceType.VLAAMSEOVERHEID, TargetAudienceType.BURGER];

    public static readonly THEMES = [ThemeType.ECONOMIEWERK, ThemeType.ONDERWIJSWETENSCHAP, ThemeType.BURGEROVERHEID];

    public static readonly COMPETENT_AUTHORITY_LEVELS = [CompetentAuthorityLevelType.FEDERAAL, CompetentAuthorityLevelType.PROVINCIAAL, CompetentAuthorityLevelType.VLAAMS];
    public static readonly COMPETENT_AUTHORITIES = [BestuurseenheidTestBuilder.ASSENEDE_IRI, BestuurseenheidTestBuilder.PEPINGEN_IRI, BestuurseenheidTestBuilder.HOUTHALEN_HELCHTEREN_IRI];
    public static readonly EXECUTING_AUTHORITY_LEVELS = [ExecutingAuthorityLevelType.DERDEN, ExecutingAuthorityLevelType.VLAAMS, ExecutingAuthorityLevelType.FEDERAAL];
    public static readonly EXECUTING_AUTHORITIES = [BestuurseenheidTestBuilder.BORGLOON_IRI, BestuurseenheidTestBuilder.OUD_HEVERLEE_IRI];

    public static readonly PUBLICATION_MEDIA = [PublicationMediumType.YOUREUROPE, PublicationMediumType.RECHTENVERKENNER];

    public static readonly YOUR_EUROPE_CATEGORIES = [YourEuropeCategoryType.PROCEDURESTARTENEXPLOITERENSLUITENBEDRIJFKENNISGEVING, YourEuropeCategoryType.BEDRIJFREGISTRATIEPROCEDURESRECHTSVORMEN, YourEuropeCategoryType.ONDERWIJSOFSTAGEONDERZOEK];

    public static readonly KEYWORDS = [LanguageString.of('geboorte'), LanguageString.of('administratie')];

    public static readonly LANGUAGES = [LanguageType.NLD, LanguageType.ENG, LanguageType.FRA];

    public static readonly SPATIALS = [buildNutsCodeIri(45700), buildNutsCodeIri(52000), buildNutsCodeIri(98786)];

    public static readonly LEGAL_RESOURCES = [aFullLegalResourceForInstanceSnapshot().withOrder(1).build(), anotherFullLegalResourceForInstanceSnapshot(uuid()).withOrder(2).build()];

    public static readonly REQUIREMENTS = [
        aFullRequirementForInstanceSnapshot().withEvidence(aFullEvidenceForInstanceSnapshot().build()).build(),
        anotherFullRequirementForInstanceSnapshot().withEvidence(anotherFullEvidenceForInstanceSnapshot().build()).build()
    ];

    public static readonly WEBSITES = [anotherFullWebsiteForInstanceSnapshot(uuid()).withOrder(1).build(), anotherFullWebsiteForInstanceSnapshot(uuid()).withOrder(2).build()];

    public static readonly PROCEDURES = [
        aFullProcedureForInstanceSnapshot().withWebsites([aFullWebsiteForInstanceSnapshot().withOrder(1).build(), anotherFullWebsiteForInstanceSnapshot(uuid()).withOrder(2).build()]).build(),
        anotherFullProcedureForInstanceSnapshot().withWebsites([anotherFullWebsiteForInstanceSnapshot(uuid()).withOrder(1).build(), anotherFullWebsiteForInstanceSnapshot(uuid()).withOrder(2).build()]).build()
    ];

    public static readonly COSTS = [aFullCostForInstanceSnapshot().build(), anotherFullCostForInstanceSnapshot().build()];

    public static readonly FINANCIAL_ADVANTAGES = [aFullFinancialAdvantageForInstanceSnapshot().build(), anotherFullFinancialAdvantageForInstanceSnapshot().build()];

    public static readonly CONTACT_POINTS = [aFullContactPointForInstanceSnapshot().build(), anotherFullContactPointForInstanceSnapshot().build()];

    public static readonly DATE_CREATED = FormatPreservingDate.of('2024-01-08T12:13:42.074442Z');
    public static readonly DATE_MODIFIED = FormatPreservingDate.of('2024-02-06T16:16:20.242928Z');

    public static readonly GENERATED_AT_TIME = FormatPreservingDate.of('2024-02-06T17:13:21.242924Z');

    private id: Iri;
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
    private languages: LanguageType[] = [];
    private isVersionOfInstance: Iri;
    private dateCreated: FormatPreservingDate;
    private dateModified: FormatPreservingDate;
    private generatedAtTime: FormatPreservingDate;
    private isArchived: boolean;
    private spatials: Iri[] = [];
    private legalResources: LegalResource[] = [];

    public withId(id: Iri): InstanceSnapshotTestBuilder {
        this.id = id;
        return this;
    }

    public withCreatedBy(createdBy: Iri): InstanceSnapshotTestBuilder {
        this.createdBy = createdBy;
        return this;
    }

    public withTitle(title: LanguageString): InstanceSnapshotTestBuilder {
        this.title = title;
        return this;
    }

    public withDescription(description: LanguageString): InstanceSnapshotTestBuilder {
        this.description = description;
        return this;
    }

    public withAdditionalDescription(additionalDescription: LanguageString): InstanceSnapshotTestBuilder {
        this.additionalDescription = additionalDescription;
        return this;
    }

    public withException(exception: LanguageString): InstanceSnapshotTestBuilder {
        this.exception = exception;
        return this;
    }

    public withRegulation(regulation: LanguageString): InstanceSnapshotTestBuilder {
        this.regulation = regulation;
        return this;
    }

    public withStartDate(startDate: FormatPreservingDate): InstanceSnapshotTestBuilder {
        this.startDate = startDate;
        return this;
    }

    public withEndDate(endDate: FormatPreservingDate): InstanceSnapshotTestBuilder {
        this.endDate = endDate;
        return this;
    }

    public withType(type: ProductType): InstanceSnapshotTestBuilder {
        this.type = type;
        return this;
    }

    public withTargetAudiences(targetAudiences: TargetAudienceType[]): InstanceSnapshotTestBuilder {
        this.targetAudiences = targetAudiences;
        return this;
    }

    public withThemes(themes: ThemeType[]): InstanceSnapshotTestBuilder {
        this.themes = themes;
        return this;
    }

    public withCompetentAuthorityLevels(competentAuthorityLevels: CompetentAuthorityLevelType[]): InstanceSnapshotTestBuilder {
        this.competentAuthorityLevels = competentAuthorityLevels;
        return this;
    }

    public withCompetentAuthorities(competentAuthorities: Iri[]): InstanceSnapshotTestBuilder {
        this.competentAuthorities = competentAuthorities;
        return this;
    }

    public withExecutingAuthorityLevels(executingAuthorityLevels: ExecutingAuthorityLevelType[]): InstanceSnapshotTestBuilder {
        this.executingAuthorityLevels = executingAuthorityLevels;
        return this;
    }

    public withExecutingAuthorities(executingAuthorities: Iri[]): InstanceSnapshotTestBuilder {
        this.executingAuthorities = executingAuthorities;
        return this;
    }

    public withPublicationMedia(publicationMedia: PublicationMediumType[]): InstanceSnapshotTestBuilder {
        this.publicationMedia = publicationMedia;
        return this;
    }

    public withYourEuropeCategories(yourEuropeCategories: YourEuropeCategoryType[]): InstanceSnapshotTestBuilder {
        this.yourEuropeCategories = yourEuropeCategories;
        return this;
    }

    public withKeywords(keywords: LanguageString[]): InstanceSnapshotTestBuilder {
        this.keywords = keywords;
        return this;
    }

    public withRequirements(requirements: Requirement[]): InstanceSnapshotTestBuilder {
        this.requirements = requirements;
        return this;
    }

    public withProcedures(procedures: Procedure[]): InstanceSnapshotTestBuilder {
        this.procedures = procedures;
        return this;
    }

    public withWebsites(websites: Website[]): InstanceSnapshotTestBuilder {
        this.websites = websites;
        return this;
    }

    public withCosts(costs: Cost[]): InstanceSnapshotTestBuilder {
        this.costs = costs;
        return this;
    }

    public withFinancialAdvantages(financialAdvantages: FinancialAdvantage[]): InstanceSnapshotTestBuilder {
        this.financialAdvantages = financialAdvantages;
        return this;
    }

    public withContactPoints(contactPoints: ContactPoint[]): InstanceSnapshotTestBuilder {
        this.contactPoints = contactPoints;
        return this;
    }

    public withConceptId(conceptId: Iri): InstanceSnapshotTestBuilder {
        this.conceptId = conceptId;
        return this;
    }

    public withLanguages(languages: LanguageType[]): InstanceSnapshotTestBuilder {
        this.languages = languages;
        return this;
    }

    public withIsVersionOfInstance(isVersionOfInstance: Iri): InstanceSnapshotTestBuilder {
        this.isVersionOfInstance = isVersionOfInstance;
        return this;
    }

    public withDateCreated(dateCreated: FormatPreservingDate): InstanceSnapshotTestBuilder {
        this.dateCreated = dateCreated;
        return this;
    }

    public withDateModified(dateModified: FormatPreservingDate): InstanceSnapshotTestBuilder {
        this.dateModified = dateModified;
        return this;
    }

    public withGeneratedAtTime(generatedAtTime: FormatPreservingDate): InstanceSnapshotTestBuilder {
        this.generatedAtTime = generatedAtTime;
        return this;
    }

    public withIsArchived(isArchived: boolean): InstanceSnapshotTestBuilder {
        this.isArchived = isArchived;
        return this;
    }

    public withSpatials(spatials: Iri[]): InstanceSnapshotTestBuilder {
        this.spatials = spatials;
        return this;
    }

    public withLegalResources(legalResources: LegalResource[]): InstanceSnapshotTestBuilder {
        this.legalResources = legalResources;
        return this;
    }

    public build(): InstanceSnapshot {
        return new InstanceSnapshot(
            this.id,
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
            this.isVersionOfInstance,
            this.dateCreated,
            this.dateModified,
            this.generatedAtTime,
            this.isArchived,
            this.spatials,
            this.legalResources,
        );
    }

}