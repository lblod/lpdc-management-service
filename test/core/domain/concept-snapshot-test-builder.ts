import {Iri} from "../../../src/core/domain/shared/iri";
import {uuid} from "../../../mu-helper";
import {ConceptSnapshot} from "../../../src/core/domain/concept-snapshot";
import {LanguageString} from "../../../src/core/domain/language-string";
import {BestuurseenheidTestBuilder} from "./bestuurseenheid-test-builder";
import {Requirement} from "../../../src/core/domain/requirement";
import {aFullRequirement, anotherFullRequirement} from "./requirement-test-builder";
import {Procedure} from "../../../src/core/domain/procedure";
import {aFullProcedure, anotherFullProcedure} from "./procedure-test-builder";
import {anotherFullWebsite} from "./website-test-builder";
import {Website} from "../../../src/core/domain/website";
import {aFullCost, anotherFullCost} from "./cost-test-builder";
import {Cost} from "../../../src/core/domain/cost";
import {aFullFinancialAdvantage, anotherFullFinancialAdvantage} from "./financial-advantage-test-builder";
import {FinancialAdvantage} from "../../../src/core/domain/financial-advantage";
import {FormatPreservingDate} from "../../../src/core/domain/format-preserving-date";
import {
    CompetentAuthorityLevelType,
    ConceptTagType,
    ExecutingAuthorityLevelType,
    ProductType,
    PublicationMediumType,
    TargetAudienceType,
    ThemeType,
    YourEuropeCategoryType
} from "../../../src/core/domain/types";
import {buildConceptIri, buildConceptSnapshotIri} from "./iri-test-builder";
import {aMinimalLanguageString} from "./language-string-test-builder";
import {anotherFullLegalResourceForConceptSnapshot} from "./legal-resource-test-builder";
import {LegalResource} from "../../../src/core/domain/legal-resource";


export function aMinimalConceptSnapshot(): ConceptSnapshotTestBuilder {
    return new ConceptSnapshotTestBuilder()
        .withId(buildConceptSnapshotIri(uuid()))
        .withTitle(ConceptSnapshotTestBuilder.MINIMAL_TITLE)
        .withDescription(aMinimalLanguageString('Concept Snapshot Description').build())
        .withProductId(ConceptSnapshotTestBuilder.PRODUCT_ID)
        .withDateCreated(ConceptSnapshotTestBuilder.DATE_CREATED)
        .withDateModified(ConceptSnapshotTestBuilder.DATE_MODIFIED)
        .withGeneratedAtTime(ConceptSnapshotTestBuilder.GENERATED_AT_TIME)
        .withIsArchived(false)
        ;
}

export function aFullConceptSnapshot(): ConceptSnapshotTestBuilder {
    const id = uuid();
    return new ConceptSnapshotTestBuilder()
        .withId(buildConceptSnapshotIri(id))
        .withTitle(
            LanguageString.of(
                ConceptSnapshotTestBuilder.TITLE_EN,
                ConceptSnapshotTestBuilder.TITLE_NL,
                ConceptSnapshotTestBuilder.TITLE_NL_FORMAL,
                ConceptSnapshotTestBuilder.TITLE_NL_INFORMAL,
                ConceptSnapshotTestBuilder.TITLE_NL_GENERATED_FORMAL,
                ConceptSnapshotTestBuilder.TITLE_NL_GENERATED_INFORMAL))
        .withDescription(
            LanguageString.of(
                ConceptSnapshotTestBuilder.DESCRIPTION_EN,
                ConceptSnapshotTestBuilder.DESCRIPTION_NL,
                ConceptSnapshotTestBuilder.DESCRIPTION_NL_FORMAL,
                ConceptSnapshotTestBuilder.DESCRIPTION_NL_INFORMAL,
                ConceptSnapshotTestBuilder.DESCRIPTION_NL_GENERATED_FORMAL,
                ConceptSnapshotTestBuilder.DESCRIPTION_NL_GENERATED_INFORMAL))
        .withAdditionalDescription(
            LanguageString.of(
                ConceptSnapshotTestBuilder.ADDITIONAL_DESCRIPTION_EN,
                ConceptSnapshotTestBuilder.ADDITIONAL_DESCRIPTION_NL,
                ConceptSnapshotTestBuilder.ADDITIONAL_DESCRIPTION_NL_FORMAL,
                ConceptSnapshotTestBuilder.ADDITIONAL_DESCRIPTION_NL_INFORMAL,
                ConceptSnapshotTestBuilder.ADDITIONAL_DESCRIPTION_NL_GENERATED_FORMAL,
                ConceptSnapshotTestBuilder.ADDITIONAL_DESCRIPTION_NL_GENERATED_INFORMAL))
        .withException(
            LanguageString.of(
                ConceptSnapshotTestBuilder.EXCEPTION_EN,
                ConceptSnapshotTestBuilder.EXCEPTION_NL,
                ConceptSnapshotTestBuilder.EXCEPTION_NL_FORMAL,
                ConceptSnapshotTestBuilder.EXCEPTION_NL_INFORMAL,
                ConceptSnapshotTestBuilder.EXCEPTION_NL_GENERATED_FORMAL,
                ConceptSnapshotTestBuilder.EXCEPTION_NL_GENERATED_INFORMAL))
        .withRegulation(
            LanguageString.of(
                ConceptSnapshotTestBuilder.REGULATION_EN,
                ConceptSnapshotTestBuilder.REGULATION_NL,
                ConceptSnapshotTestBuilder.REGULATION_NL_FORMAL,
                ConceptSnapshotTestBuilder.REGULATION_NL_INFORMAL,
                ConceptSnapshotTestBuilder.REGULATION_NL_GENERATED_FORMAL,
                ConceptSnapshotTestBuilder.REGULATION_NL_GENERATED_INFORMAL))
        .withStartDate(ConceptSnapshotTestBuilder.START_DATE)
        .withEndDate(ConceptSnapshotTestBuilder.END_DATE)
        .withType(ConceptSnapshotTestBuilder.TYPE)
        .withTargetAudiences(ConceptSnapshotTestBuilder.TARGET_AUDIENCES)
        .withThemes(ConceptSnapshotTestBuilder.THEMES)
        .withCompetentAuthorityLevels(ConceptSnapshotTestBuilder.COMPETENT_AUTHORITY_LEVELS)
        .withCompetentAuthorities(ConceptSnapshotTestBuilder.COMPETENT_AUTHORITIES)
        .withExecutingAuthorityLevels(ConceptSnapshotTestBuilder.EXECUTING_AUTHORITY_LEVELS)
        .withExecutingAuthorities(ConceptSnapshotTestBuilder.EXECUTING_AUTHORITIES)
        .withPublicationMedia(ConceptSnapshotTestBuilder.PUBLICATION_MEDIA)
        .withYourEuropeCategories(ConceptSnapshotTestBuilder.YOUR_EUROPE_CATEGORIES)
        .withKeywords(ConceptSnapshotTestBuilder.KEYWORDS)
        .withRequirements(ConceptSnapshotTestBuilder.REQUIREMENTS)
        .withProcedures(ConceptSnapshotTestBuilder.PROCEDURES)
        .withWebsites(ConceptSnapshotTestBuilder.WEBSITES)
        .withCosts(ConceptSnapshotTestBuilder.COSTS)
        .withFinancialAdvantages(ConceptSnapshotTestBuilder.FINANCIAL_ADVANTAGES)
        .withIsVersionOfConcept(ConceptSnapshotTestBuilder.IS_VERSION_OF_CONCEPT)
        .withDateCreated(ConceptSnapshotTestBuilder.DATE_CREATED)
        .withDateModified(ConceptSnapshotTestBuilder.DATE_MODIFIED)
        .withGeneratedAtTime(ConceptSnapshotTestBuilder.GENERATED_AT_TIME)
        .withProductId(ConceptSnapshotTestBuilder.PRODUCT_ID)
        .withConceptTags(ConceptSnapshotTestBuilder.CONCEPT_TAGS)
        .withIsArchived(false)
        .withLegalResources(ConceptSnapshotTestBuilder.LEGAL_RESOURCES);
}

export class ConceptSnapshotTestBuilder {

    public static readonly TITLE = 'Concept Snapshot Title';
    public static readonly TITLE_EN = 'Concept Snapshot Title - en';
    public static readonly TITLE_NL = 'Concept Snapshot Title - nl';
    public static readonly TITLE_NL_FORMAL = 'Concept Snapshot Title - nl-formal';
    public static readonly TITLE_NL_INFORMAL = 'Concept Snapshot Title - nl-informal';
    public static readonly TITLE_NL_GENERATED_FORMAL = 'Concept Snapshot Title - nl-generated-formal';
    public static readonly TITLE_NL_GENERATED_INFORMAL = 'Concept Snapshot Title - nl-generated-informal';
    public static readonly MINIMAL_TITLE = aMinimalLanguageString().withNl(ConceptSnapshotTestBuilder.TITLE_NL).build();

    public static readonly DESCRIPTION = 'Concept Snapshot Description';
    public static readonly DESCRIPTION_EN = 'Concept Snapshot Description - en';
    public static readonly DESCRIPTION_NL = 'Concept Snapshot Description - nl';
    public static readonly DESCRIPTION_NL_FORMAL = 'Concept Snapshot Description - nl-formal';
    public static readonly DESCRIPTION_NL_INFORMAL = 'Concept Snapshot Description - nl-informal';
    public static readonly DESCRIPTION_NL_GENERATED_FORMAL = 'Concept Snapshot Description - nl-generated-formal';
    public static readonly DESCRIPTION_NL_GENERATED_INFORMAL = 'Concept Snapshot Description - nl-generated-informal';

    public static readonly ADDITIONAL_DESCRIPTION_EN = 'Concept Snapshot Additional Description - en';
    public static readonly ADDITIONAL_DESCRIPTION_NL = 'Concept Snapshot Additional Description - nl';
    public static readonly ADDITIONAL_DESCRIPTION_NL_FORMAL = 'Concept Snapshot Additional Description - nl-formal';
    public static readonly ADDITIONAL_DESCRIPTION_NL_INFORMAL = 'Concept Snapshot Additional Description - nl-informal';
    public static readonly ADDITIONAL_DESCRIPTION_NL_GENERATED_FORMAL = 'Concept Snapshot Additional Description - nl-generated-formal';
    public static readonly ADDITIONAL_DESCRIPTION_NL_GENERATED_INFORMAL = 'Concept Snapshot Additional Description - nl-generated-informal';

    public static readonly EXCEPTION_EN = 'Concept Snapshot Exception - en';
    public static readonly EXCEPTION_NL = 'Concept Snapshot Exception - nl';
    public static readonly EXCEPTION_NL_FORMAL = 'Concept Snapshot Exception - nl-formal';
    public static readonly EXCEPTION_NL_INFORMAL = 'Concept Snapshot Exception - nl-informal';
    public static readonly EXCEPTION_NL_GENERATED_FORMAL = 'Concept Snapshot Exception - nl-generated-formal';
    public static readonly EXCEPTION_NL_GENERATED_INFORMAL = 'Concept Snapshot Exception - nl-generated-informal';

    public static readonly REGULATION_EN = 'Concept Snapshot Regulation - en';
    public static readonly REGULATION_NL = 'Concept Snapshot Regulation - nl';
    public static readonly REGULATION_NL_FORMAL = 'Concept Snapshot Regulation - nl-formal';
    public static readonly REGULATION_NL_INFORMAL = 'Concept Snapshot Regulation - nl-informal';
    public static readonly REGULATION_NL_GENERATED_FORMAL = 'Concept Snapshot Regulation - nl-generated-formal';
    public static readonly REGULATION_NL_GENERATED_INFORMAL = 'Concept Snapshot Regulation - nl-generated-informal';

    public static readonly START_DATE = FormatPreservingDate.of('2023-10-28T00:00:00.657Z');
    public static readonly END_DATE = FormatPreservingDate.of('2027-09-16T00:00:00.672Z');

    public static readonly TYPE = ProductType.FINANCIEELVOORDEEL;

    public static readonly TARGET_AUDIENCES = [TargetAudienceType.BURGER, TargetAudienceType.VLAAMSEOVERHEID, TargetAudienceType.ORGANISATIE];

    public static readonly THEMES = [ThemeType.CULTUURSPORTVRIJETIJD, ThemeType.MOBILITEITOPENBAREWERKEN, ThemeType.WELZIJNGEZONDHEID];

    public static readonly COMPETENT_AUTHORITY_LEVELS = [CompetentAuthorityLevelType.LOKAAL, CompetentAuthorityLevelType.PROVINCIAAL, CompetentAuthorityLevelType.EUROPEES];
    public static readonly COMPETENT_AUTHORITIES = [BestuurseenheidTestBuilder.PEPINGEN_IRI, BestuurseenheidTestBuilder.HOUTHALEN_HELCHTEREN_IRI, BestuurseenheidTestBuilder.BORGLOON_IRI];

    public static readonly EXECUTING_AUTHORITY_LEVELS = [ExecutingAuthorityLevelType.LOKAAL, ExecutingAuthorityLevelType.PROVINCIAAL, ExecutingAuthorityLevelType.DERDEN];
    public static readonly EXECUTING_AUTHORITIES = [BestuurseenheidTestBuilder.PEPINGEN_IRI, BestuurseenheidTestBuilder.OUD_HEVERLEE_IRI, BestuurseenheidTestBuilder.ASSENEDE_IRI];

    public static readonly PUBLICATION_MEDIA = [PublicationMediumType.YOUREUROPE, PublicationMediumType.RECHTENVERKENNER];

    public static readonly YOUR_EUROPE_CATEGORIES = [YourEuropeCategoryType.BEDRIJFINSOLVENTIELIQUIDATIE, YourEuropeCategoryType.PROCEDUREPENSIONERING, YourEuropeCategoryType.GOEDERENRECYCLAGE];

    public static readonly KEYWORDS = [LanguageString.of('buitenland'), LanguageString.of(undefined, 'buitenland'), LanguageString.of(undefined, 'ambulante activiteit'), LanguageString.of('levensloos')];

    public static readonly REQUIREMENTS = [aFullRequirement().build(), anotherFullRequirement().build()];

    public static readonly PROCEDURES = [aFullProcedure().build(), anotherFullProcedure().build()];

    public static readonly WEBSITES = [anotherFullWebsite(uuid()).withOrder(1).build(), anotherFullWebsite(uuid()).withOrder(2).build()];

    public static readonly COSTS = [aFullCost().build(), anotherFullCost().build()];

    public static readonly FINANCIAL_ADVANTAGES = [aFullFinancialAdvantage().build(), anotherFullFinancialAdvantage().build()];

    public static readonly IS_VERSION_OF_CONCEPT = buildConceptIri(uuid());

    public static readonly DATE_CREATED = FormatPreservingDate.of('2022-10-05T13:00:42.074442Z');
    public static readonly DATE_MODIFIED = FormatPreservingDate.of('2023-09-12T20:00:20.242928Z');
    public static readonly GENERATED_AT_TIME = FormatPreservingDate.of('2023-09-12T20:00:20.564313Z');

    public static readonly PRODUCT_ID = "1502";

    public static readonly CONCEPT_TAGS = [ConceptTagType.YOUREUROPEAANBEVOLEN, ConceptTagType.YOUREUROPEVERPLICHT];

    public static readonly LEGAL_RESOURCES = [anotherFullLegalResourceForConceptSnapshot(uuid()).withOrder(1).build(), anotherFullLegalResourceForConceptSnapshot(uuid()).withOrder(2).build()];

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

    public withId(id: Iri): ConceptSnapshotTestBuilder {
        this.id = id;
        return this;
    }

    public withTitle(title: LanguageString): ConceptSnapshotTestBuilder {
        this.title = title;
        return this;
    }

    public withDescription(description: LanguageString): ConceptSnapshotTestBuilder {
        this.description = description;
        return this;
    }

    public withAdditionalDescription(additionalDescription: LanguageString): ConceptSnapshotTestBuilder {
        this.additionalDescription = additionalDescription;
        return this;
    }

    public withException(exception: LanguageString): ConceptSnapshotTestBuilder {
        this.exception = exception;
        return this;
    }

    public withRegulation(regulation: LanguageString): ConceptSnapshotTestBuilder {
        this.regulation = regulation;
        return this;
    }

    public withStartDate(startDate: FormatPreservingDate): ConceptSnapshotTestBuilder {
        this.startDate = startDate;
        return this;
    }

    public withEndDate(endDate: FormatPreservingDate): ConceptSnapshotTestBuilder {
        this.endDate = endDate;
        return this;
    }

    public withType(type: ProductType): ConceptSnapshotTestBuilder {
        this.type = type;
        return this;
    }

    public withTargetAudiences(targetAudiences: TargetAudienceType[]): ConceptSnapshotTestBuilder {
        this.targetAudiences = targetAudiences;
        return this;
    }

    public withThemes(themes: ThemeType[]): ConceptSnapshotTestBuilder {
        this.themes = themes;
        return this;
    }

    public withCompetentAuthorityLevels(competentAuthorityLevels: CompetentAuthorityLevelType[]): ConceptSnapshotTestBuilder {
        this.competentAuthorityLevels = competentAuthorityLevels;
        return this;
    }

    public withCompetentAuthorities(competentAuthorities: Iri[]): ConceptSnapshotTestBuilder {
        this.competentAuthorities = competentAuthorities;
        return this;
    }

    public withExecutingAuthorityLevels(executingAuthorityLevels: ExecutingAuthorityLevelType[]): ConceptSnapshotTestBuilder {
        this.executingAuthorityLevels = executingAuthorityLevels;
        return this;
    }

    public withExecutingAuthorities(executingAuthorities: Iri[]): ConceptSnapshotTestBuilder {
        this.executingAuthorities = executingAuthorities;
        return this;
    }

    public withPublicationMedia(publicationMedia: PublicationMediumType[]): ConceptSnapshotTestBuilder {
        this.publicationMedia = publicationMedia;
        return this;
    }

    public withYourEuropeCategories(yourEuropeCategories: YourEuropeCategoryType[]): ConceptSnapshotTestBuilder {
        this.yourEuropeCategories = yourEuropeCategories;
        return this;
    }

    public withKeywords(keywords: LanguageString[]): ConceptSnapshotTestBuilder {
        this.keywords = keywords;
        return this;
    }

    public withRequirements(requirements: Requirement[]): ConceptSnapshotTestBuilder {
        this.requirements = requirements;
        return this;
    }

    public withProcedures(procedures: Procedure[]): ConceptSnapshotTestBuilder {
        this.procedures = procedures;
        return this;
    }

    public withWebsites(websites: Website[]): ConceptSnapshotTestBuilder {
        this.websites = websites;
        return this;
    }

    public withCosts(costs: Cost[]): ConceptSnapshotTestBuilder {
        this.costs = costs;
        return this;
    }

    public withFinancialAdvantages(financialAdvantages: FinancialAdvantage[]): ConceptSnapshotTestBuilder {
        this.financialAdvantages = financialAdvantages;
        return this;
    }

    public withIsVersionOfConcept(isVersionOfConcept: Iri): ConceptSnapshotTestBuilder {
        this.isVersionOfConcept = isVersionOfConcept;
        return this;
    }

    public withDateCreated(dateCreated: FormatPreservingDate): ConceptSnapshotTestBuilder {
        this.dateCreated = dateCreated;
        return this;
    }

    public withDateModified(dateModified: FormatPreservingDate): ConceptSnapshotTestBuilder {
        this.dateModified = dateModified;
        return this;
    }

    public withGeneratedAtTime(generatedAtTime: FormatPreservingDate): ConceptSnapshotTestBuilder {
        this.generatedAtTime = generatedAtTime;
        return this;
    }

    public withProductId(productId: string): ConceptSnapshotTestBuilder {
        this.productId = productId;
        return this;
    }

    public withConceptTags(conceptTags: ConceptTagType[]): ConceptSnapshotTestBuilder {
        this.conceptTags = conceptTags;
        return this;
    }

    public withIsArchived(isArchived: boolean): ConceptSnapshotTestBuilder {
        this.isArchived = isArchived;
        return this;
    }

    public withLegalResources(legalResources: LegalResource[]): ConceptSnapshotTestBuilder {
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