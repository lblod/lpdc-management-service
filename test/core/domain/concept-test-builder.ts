import {uuid} from "../../../mu-helper";
import {LanguageString} from "../../../src/core/domain/language-string";
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
import {BestuurseenheidTestBuilder} from "./bestuureenheid-test-builder";
import {aFullRequirement, anotherFullRequirement} from "./requirement-test-builder";
import {aFullProcedure, anotherFullProcedure} from "./procedure-test-builder";
import {aFullWebsite, anotherFullWebsite} from "./website-test-builder";
import {aFullCost, anotherFullCost} from "./cost-test-builder";
import {aFullFinancialAdvantage, anotherFullFinancialAdvantage} from "./financial-advantage-test-builder";
import {Iri} from "../../../src/core/domain/shared/iri";
import {Requirement} from "../../../src/core/domain/requirement";
import {Procedure} from "../../../src/core/domain/procedure";
import {Website} from "../../../src/core/domain/website";
import {Cost} from "../../../src/core/domain/cost";
import {FinancialAdvantage} from "../../../src/core/domain/financial-advantage";
import {Concept} from "../../../src/core/domain/concept";
import {buildCodexVlaanderenIri, buildConceptIri, buildConceptSnapshotIri} from "./iri-test-builder";
import {aFullEvidence, anotherFullEvidence} from "./evidence-test-builder";
import {aMinimalLanguageString} from "./language-string-test-builder";

export function aMinimalConcept(): ConceptTestBuilder {
    return new ConceptTestBuilder()
        .withId(buildConceptIri(uuid()))
        .withUuid(uuid())
        .withTitle(ConceptTestBuilder.MINIMAL_TITLE)
        .withDescription(aMinimalLanguageString('Concept Description').build())
        .withProductId(ConceptTestBuilder.PRODUCT_ID)
        .withLatestConceptSnapshot(buildConceptSnapshotIri(uuid()))
        .withLatestFunctionallyChangedConceptSnapshot(buildConceptSnapshotIri(uuid()));
}

export function aFullConcept(): ConceptTestBuilder {
    const id = uuid();
    return new ConceptTestBuilder()
        .withId(buildConceptIri(id))
        .withUuid(uuid())
        .withTitle(
            LanguageString.of(
                ConceptTestBuilder.TITLE_EN,
                ConceptTestBuilder.TITLE_NL,
                ConceptTestBuilder.TITLE_NL_FORMAL,
                ConceptTestBuilder.TITLE_NL_INFORMAL,
                ConceptTestBuilder.TITLE_NL_GENERATED_FORMAL,
                ConceptTestBuilder.TITLE_NL_GENERATED_INFORMAL))
        .withDescription(
            LanguageString.of(
                ConceptTestBuilder.DESCRIPTION_EN,
                ConceptTestBuilder.DESCRIPTION_NL,
                ConceptTestBuilder.DESCRIPTION_NL_FORMAL,
                ConceptTestBuilder.DESCRIPTION_NL_INFORMAL,
                ConceptTestBuilder.DESCRIPTION_NL_GENERATED_FORMAL,
                ConceptTestBuilder.DESCRIPTION_NL_GENERATED_INFORMAL))
        .withAdditionalDescription(
            LanguageString.of(
                ConceptTestBuilder.ADDITIONAL_DESCRIPTION_EN,
                ConceptTestBuilder.ADDITIONAL_DESCRIPTION_NL,
                ConceptTestBuilder.ADDITIONAL_DESCRIPTION_NL_FORMAL,
                ConceptTestBuilder.ADDITIONAL_DESCRIPTION_NL_INFORMAL,
                ConceptTestBuilder.ADDITIONAL_DESCRIPTION_NL_GENERATED_FORMAL,
                ConceptTestBuilder.ADDITIONAL_DESCRIPTION_NL_GENERATED_INFORMAL))
        .withException(
            LanguageString.of(
                ConceptTestBuilder.EXCEPTION_EN,
                ConceptTestBuilder.EXCEPTION_NL,
                ConceptTestBuilder.EXCEPTION_NL_FORMAL,
                ConceptTestBuilder.EXCEPTION_NL_INFORMAL,
                ConceptTestBuilder.EXCEPTION_NL_GENERATED_FORMAL,
                ConceptTestBuilder.EXCEPTION_NL_GENERATED_INFORMAL))
        .withRegulation(
            LanguageString.of(
                ConceptTestBuilder.REGULATION_EN,
                ConceptTestBuilder.REGULATION_NL,
                ConceptTestBuilder.REGULATION_NL_FORMAL,
                ConceptTestBuilder.REGULATION_NL_INFORMAL,
                ConceptTestBuilder.REGULATION_NL_GENERATED_FORMAL,
                ConceptTestBuilder.REGULATION_NL_GENERATED_INFORMAL))
        .withStartDate(ConceptTestBuilder.START_DATE)
        .withEndDate(ConceptTestBuilder.END_DATE)
        .withType(ConceptTestBuilder.TYPE)
        .withTargetAudiences(ConceptTestBuilder.TARGET_AUDIENCES)
        .withThemes(ConceptTestBuilder.THEMES)
        .withCompetentAuthorityLevels(ConceptTestBuilder.COMPETENT_AUTHORITY_LEVELS)
        .withCompetentAuthorities(ConceptTestBuilder.COMPETENT_AUTHORITIES)
        .withExecutingAuthorityLevels(ConceptTestBuilder.EXECUTING_AUTHORITY_LEVELS)
        .withExecutingAuthorities(ConceptTestBuilder.EXECUTING_AUTHORITIES)
        .withPublicationMedia(ConceptTestBuilder.PUBLICATION_MEDIA)
        .withYourEuropeCategories(ConceptTestBuilder.YOUR_EUROPE_CATEGORIES)
        .withKeywords(ConceptTestBuilder.KEYWORDS)
        .withRequirements(ConceptTestBuilder.REQUIREMENTS)
        .withProcedures(ConceptTestBuilder.PROCEDURES)
        .withWebsites(ConceptTestBuilder.WEBSITES)
        .withCosts(ConceptTestBuilder.COSTS)
        .withFinancialAdvantages(ConceptTestBuilder.FINANCIAL_ADVANTAGES)
        .withProductId(ConceptTestBuilder.PRODUCT_ID)
        .withLatestConceptSnapshot(buildConceptSnapshotIri(uuid()))
        .withPreviousConceptSnapshots([buildConceptSnapshotIri(uuid()), buildConceptSnapshotIri(uuid()), buildConceptSnapshotIri(uuid())])
        .withLatestFunctionallyChangedConceptSnapshot(buildConceptSnapshotIri(uuid()))
        .withConceptTags(ConceptTestBuilder.CONCEPT_TAGS)
        .withLegalResources(ConceptTestBuilder.LEGAL_RESOURCES);
}

export class ConceptTestBuilder {


    public static readonly TITLE_EN = 'Concept Title - en';
    public static readonly TITLE_NL = 'Concept Title - nl';
    public static readonly TITLE_NL_FORMAL = 'Concept Title - nl-formal';
    public static readonly TITLE_NL_INFORMAL = 'Concept Title - nl-informal';
    public static readonly TITLE_NL_GENERATED_FORMAL = 'Concept Title - nl-generated-formal';
    public static readonly TITLE_NL_GENERATED_INFORMAL = 'Concept Title - nl-generated-informal';
    public static readonly MINIMAL_TITLE = aMinimalLanguageString().withNl(ConceptTestBuilder.TITLE_NL).build();

    public static readonly DESCRIPTION_EN = 'Concept Description - en';
    public static readonly DESCRIPTION_NL = 'Concept Description - nl';
    public static readonly DESCRIPTION_NL_FORMAL = 'Concept Description - nl-formal';
    public static readonly DESCRIPTION_NL_INFORMAL = 'Concept Description - nl-informal';
    public static readonly DESCRIPTION_NL_GENERATED_FORMAL = 'Concept Description - nl-generated-formal';
    public static readonly DESCRIPTION_NL_GENERATED_INFORMAL = 'Concept Description - nl-generated-informal';

    public static readonly ADDITIONAL_DESCRIPTION_EN = 'Concept Additional Description - en';
    public static readonly ADDITIONAL_DESCRIPTION_NL = 'Concept Additional Description - nl';
    public static readonly ADDITIONAL_DESCRIPTION_NL_FORMAL = 'Concept Additional Description - nl-formal';
    public static readonly ADDITIONAL_DESCRIPTION_NL_INFORMAL = 'Concept Additional Description - nl-informal';
    public static readonly ADDITIONAL_DESCRIPTION_NL_GENERATED_FORMAL = 'Concept Additional Description - nl-generated-formal';
    public static readonly ADDITIONAL_DESCRIPTION_NL_GENERATED_INFORMAL = 'Concept Additional Description - nl-generated-informal';

    public static readonly EXCEPTION_EN = 'Concept Exception - en';
    public static readonly EXCEPTION_NL = 'Concept Exception - nl';
    public static readonly EXCEPTION_NL_FORMAL = 'Concept Exception - nl-formal';
    public static readonly EXCEPTION_NL_INFORMAL = 'Concept Exception - nl-informal';
    public static readonly EXCEPTION_NL_GENERATED_FORMAL = 'Concept Exception - nl-generated-formal';
    public static readonly EXCEPTION_NL_GENERATED_INFORMAL = 'Concept Exception - nl-generated-informal';

    public static readonly REGULATION_EN = 'Concept Regulation - en';
    public static readonly REGULATION_NL = 'Concept Regulation - nl';
    public static readonly REGULATION_NL_FORMAL = 'Concept Regulation - nl-formal';
    public static readonly REGULATION_NL_INFORMAL = 'Concept Regulation - nl-informal';
    public static readonly REGULATION_NL_GENERATED_FORMAL = 'Concept Regulation - nl-generated-formal';
    public static readonly REGULATION_NL_GENERATED_INFORMAL = 'Concept Regulation - nl-generated-informal';

    public static readonly START_DATE = FormatPreservingDate.of('2023-10-21 00:00:00Z');
    public static readonly END_DATE = FormatPreservingDate.of('2027-09-17 00:00:00.000Z');

    public static readonly TYPE = ProductType.ADVIESBEGELEIDING;

    public static readonly TARGET_AUDIENCES = [TargetAudienceType.ONDERNEMING, TargetAudienceType.VERENIGING, TargetAudienceType.BURGER];

    public static readonly THEMES = [ThemeType.ECONOMIEWERK, ThemeType.BOUWENWONEN, ThemeType.MOBILITEITOPENBAREWERKEN];

    public static readonly COMPETENT_AUTHORITY_LEVELS = [CompetentAuthorityLevelType.LOKAAL, CompetentAuthorityLevelType.FEDERAAL, CompetentAuthorityLevelType.EUROPEES];
    public static readonly COMPETENT_AUTHORITIES = [BestuurseenheidTestBuilder.PEPINGEN_IRI, BestuurseenheidTestBuilder.HOUTHALEN_HELCHTEREN_IRI, BestuurseenheidTestBuilder.ASSENEDE_IRI];

    public static readonly EXECUTING_AUTHORITY_LEVELS = [ExecutingAuthorityLevelType.LOKAAL, ExecutingAuthorityLevelType.VLAAMS, ExecutingAuthorityLevelType.DERDEN];
    public static readonly EXECUTING_AUTHORITIES = [BestuurseenheidTestBuilder.PEPINGEN_IRI, BestuurseenheidTestBuilder.OUD_HEVERLEE_IRI, BestuurseenheidTestBuilder.BORGLOON_IRI];

    public static readonly PUBLICATION_MEDIA = [PublicationMediumType.YOUREUROPE, PublicationMediumType.RECHTENVERKENNER];

    public static readonly YOUR_EUROPE_CATEGORIES = [YourEuropeCategoryType.WERKENPENSIONERING, YourEuropeCategoryType.PROCEDURESTARTENEXPLOITERENSLUITENBEDRIJFPENSIOENENVERZEKERINGSREGELINGENWERKGEVER, YourEuropeCategoryType.ONDERWIJSOFSTAGESTAGE];

    public static readonly KEYWORDS = [LanguageString.of('overlijden - en'), LanguageString.of(undefined, 'overlijden - nl'), LanguageString.of(undefined, 'goederen verhandelen'), LanguageString.of('sacrale activiteiten')];

    public static readonly REQUIREMENTS = [
        aFullRequirement().withUuid(uuid()).withEvidence(aFullEvidence().withUuid(uuid()).build()).build(),
        anotherFullRequirement().withUuid(uuid()).withEvidence(anotherFullEvidence().withUuid(uuid()).build()).build()
    ];

    public static readonly PROCEDURES = [
        aFullProcedure().withUuid(uuid()).withWebsites([aFullWebsite().withUuid(uuid()).build(), anotherFullWebsite(uuid()).withUuid(uuid()).build()]).build(),
        anotherFullProcedure().withUuid(uuid()).withWebsites([anotherFullWebsite(uuid()).withUuid(uuid()).build(), anotherFullWebsite(uuid()).withUuid(uuid()).build()]).build()];

    public static readonly WEBSITES = [
        anotherFullWebsite(uuid()).withUuid(uuid()).build(),
        anotherFullWebsite(uuid()).withUuid(uuid()).build()];

    public static readonly COSTS = [aFullCost().withUuid(uuid()).build(), anotherFullCost().withUuid(uuid()).build()];

    public static readonly FINANCIAL_ADVANTAGES = [
        aFullFinancialAdvantage().withUuid(uuid()).build(),
        anotherFullFinancialAdvantage().withUuid(uuid()).build()];

    public static readonly PRODUCT_ID = "5468";

    public static readonly CONCEPT_TAGS = [ConceptTagType.YOUREUROPEAANBEVOLEN, ConceptTagType.YOUREUROPEVERPLICHT];

    public static readonly LEGAL_RESOURCES = [buildCodexVlaanderenIri(uuid()), buildCodexVlaanderenIri(uuid()), buildCodexVlaanderenIri(uuid())];

    private id: Iri;
    private uuid: string | undefined;
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
    private productId: string | undefined;
    private latestConceptSnapshot: Iri;
    private previousConceptSnapshots: Iri[] = []; //TODO LPDC-916: rename to previouslyAppliedConceptSnapshots
    private latestFunctionallyChangedConceptSnapshot: Iri;
    private conceptTags: ConceptTagType[] = [];
    private isArchived: boolean = false;
    private legalResources: Iri[] = [];

    public withId(id: Iri): ConceptTestBuilder {
        this.id = id;
        return this;
    }

    public withUuid(uuid: string): ConceptTestBuilder {
        this.uuid = uuid;
        return this;
    }

    public withTitle(title: LanguageString): ConceptTestBuilder {
        this.title = title;
        return this;
    }

    public withDescription(description: LanguageString): ConceptTestBuilder {
        this.description = description;
        return this;
    }

    public withAdditionalDescription(additionalDescription: LanguageString): ConceptTestBuilder {
        this.additionalDescription = additionalDescription;
        return this;
    }

    public withException(exception: LanguageString): ConceptTestBuilder {
        this.exception = exception;
        return this;
    }

    public withRegulation(regulation: LanguageString): ConceptTestBuilder {
        this.regulation = regulation;
        return this;
    }

    public withStartDate(startDate: FormatPreservingDate): ConceptTestBuilder {
        this.startDate = startDate;
        return this;
    }

    public withEndDate(endDate: FormatPreservingDate): ConceptTestBuilder {
        this.endDate = endDate;
        return this;
    }

    public withType(type: ProductType): ConceptTestBuilder {
        this.type = type;
        return this;
    }

    public withTargetAudiences(targetAudiences: TargetAudienceType[]): ConceptTestBuilder {
        this.targetAudiences = targetAudiences;
        return this;
    }

    public withThemes(themes: ThemeType[]): ConceptTestBuilder {
        this.themes = themes;
        return this;
    }

    public withCompetentAuthorityLevels(competentAuthorityLevels: CompetentAuthorityLevelType[]): ConceptTestBuilder {
        this.competentAuthorityLevels = competentAuthorityLevels;
        return this;
    }

    public withCompetentAuthorities(competentAuthorities: Iri[]): ConceptTestBuilder {
        this.competentAuthorities = competentAuthorities;
        return this;
    }

    public withExecutingAuthorityLevels(executingAuthorityLevels: ExecutingAuthorityLevelType[]): ConceptTestBuilder {
        this.executingAuthorityLevels = executingAuthorityLevels;
        return this;
    }

    public withExecutingAuthorities(executingAuthorities: Iri[]): ConceptTestBuilder {
        this.executingAuthorities = executingAuthorities;
        return this;
    }

    public withPublicationMedia(publicationMedia: PublicationMediumType[]): ConceptTestBuilder {
        this.publicationMedia = publicationMedia;
        return this;
    }

    public withYourEuropeCategories(yourEuropeCategories: YourEuropeCategoryType[]): ConceptTestBuilder {
        this.yourEuropeCategories = yourEuropeCategories;
        return this;
    }

    public withKeywords(keywords: LanguageString[]): ConceptTestBuilder {
        this.keywords = keywords;
        return this;
    }

    public withRequirements(requirements: Requirement[]): ConceptTestBuilder {
        this.requirements = requirements;
        return this;
    }

    public withProcedures(procedures: Procedure[]): ConceptTestBuilder {
        this.procedures = procedures;
        return this;
    }

    public withWebsites(websites: Website[]): ConceptTestBuilder {
        this.websites = websites;
        return this;
    }

    public withCosts(costs: Cost[]): ConceptTestBuilder {
        this.costs = costs;
        return this;
    }

    public withFinancialAdvantages(financialAdvantages: FinancialAdvantage[]): ConceptTestBuilder {
        this.financialAdvantages = financialAdvantages;
        return this;
    }

    public withProductId(productId: string): ConceptTestBuilder {
        this.productId = productId;
        return this;
    }

    public withLatestConceptSnapshot(latestConceptSnapshot: Iri): ConceptTestBuilder {
        this.latestConceptSnapshot = latestConceptSnapshot;
        return this;
    }

    public withPreviousConceptSnapshots(previousConceptSnapshots: Iri[]): ConceptTestBuilder {
        this.previousConceptSnapshots = previousConceptSnapshots;
        return this;
    }

    public withLatestFunctionallyChangedConceptSnapshot(latestFunctionallyChangedConceptSnapshot: Iri): ConceptTestBuilder {
        this.latestFunctionallyChangedConceptSnapshot = latestFunctionallyChangedConceptSnapshot;
        return this;
    }

    public withConceptTags(conceptTags: ConceptTagType[]): ConceptTestBuilder {
        this.conceptTags = conceptTags;
        return this;
    }

    public withIsArchived(isArchived: boolean): ConceptTestBuilder {
        this.isArchived = isArchived;
        return this;
    }

    public withLegalResources(legalResources: Iri[]): ConceptTestBuilder {
        this.legalResources = legalResources;
        return this;
    }

    public build(): Concept {
        return new Concept(
            this.id,
            this.uuid,
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
            this.productId,
            this.latestConceptSnapshot,
            this.previousConceptSnapshots,
            this.latestFunctionallyChangedConceptSnapshot,
            this.conceptTags,
            this.isArchived,
            this.legalResources,
        );
    }

}