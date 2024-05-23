import {uuid} from "../../../mu-helper";
import {ConceptSnapshotBuilder} from "../../../src/core/domain/concept-snapshot";
import {LanguageString} from "../../../src/core/domain/language-string";
import {BestuurseenheidTestBuilder} from "./bestuurseenheid-test-builder";
import {aFullRequirement, anotherFullRequirement} from "./requirement-test-builder";
import {aFullProcedure, anotherFullProcedure} from "./procedure-test-builder";
import {anotherFullWebsite} from "./website-test-builder";
import {aFullCost, anotherFullCost} from "./cost-test-builder";
import {aFullFinancialAdvantage, anotherFullFinancialAdvantage} from "./financial-advantage-test-builder";
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


export function aMinimalConceptSnapshot(): ConceptSnapshotBuilder {
    return new ConceptSnapshotBuilder()
        .withId(buildConceptSnapshotIri(uuid()))
        .withTitle(ConceptSnapshotTestBuilder.MINIMAL_TITLE)
        .withDescription(aMinimalLanguageString('Concept Snapshot Description').build())
        .withProductId(ConceptSnapshotTestBuilder.PRODUCT_ID)
        .withDateCreated(ConceptSnapshotTestBuilder.DATE_CREATED)
        .withDateModified(ConceptSnapshotTestBuilder.DATE_MODIFIED)
        .withGeneratedAtTime(ConceptSnapshotTestBuilder.GENERATED_AT_TIME)
        .withIsArchived(false);
}

export function aFullConceptSnapshot(): ConceptSnapshotBuilder {
    const id = uuid();
    return new ConceptSnapshotBuilder()
        .withId(buildConceptSnapshotIri(id))
        .withTitle(
            LanguageString.of(
                ConceptSnapshotTestBuilder.TITLE_NL,
                ConceptSnapshotTestBuilder.TITLE_NL_FORMAL,
                ConceptSnapshotTestBuilder.TITLE_NL_INFORMAL,
                ConceptSnapshotTestBuilder.TITLE_NL_GENERATED_FORMAL,
                ConceptSnapshotTestBuilder.TITLE_NL_GENERATED_INFORMAL))
        .withDescription(
            LanguageString.of(
                ConceptSnapshotTestBuilder.DESCRIPTION_NL,
                ConceptSnapshotTestBuilder.DESCRIPTION_NL_FORMAL,
                ConceptSnapshotTestBuilder.DESCRIPTION_NL_INFORMAL,
                ConceptSnapshotTestBuilder.DESCRIPTION_NL_GENERATED_FORMAL,
                ConceptSnapshotTestBuilder.DESCRIPTION_NL_GENERATED_INFORMAL))
        .withAdditionalDescription(
            LanguageString.of(
                ConceptSnapshotTestBuilder.ADDITIONAL_DESCRIPTION_NL,
                ConceptSnapshotTestBuilder.ADDITIONAL_DESCRIPTION_NL_FORMAL,
                ConceptSnapshotTestBuilder.ADDITIONAL_DESCRIPTION_NL_INFORMAL,
                ConceptSnapshotTestBuilder.ADDITIONAL_DESCRIPTION_NL_GENERATED_FORMAL,
                ConceptSnapshotTestBuilder.ADDITIONAL_DESCRIPTION_NL_GENERATED_INFORMAL))
        .withException(
            LanguageString.of(
                ConceptSnapshotTestBuilder.EXCEPTION_NL,
                ConceptSnapshotTestBuilder.EXCEPTION_NL_FORMAL,
                ConceptSnapshotTestBuilder.EXCEPTION_NL_INFORMAL,
                ConceptSnapshotTestBuilder.EXCEPTION_NL_GENERATED_FORMAL,
                ConceptSnapshotTestBuilder.EXCEPTION_NL_GENERATED_INFORMAL))
        .withRegulation(
            LanguageString.of(
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
    public static readonly TITLE_NL = 'Concept Snapshot Title - nl';
    public static readonly TITLE_NL_FORMAL = 'Concept Snapshot Title - nl-formal';
    public static readonly TITLE_NL_INFORMAL = 'Concept Snapshot Title - nl-informal';
    public static readonly TITLE_NL_GENERATED_FORMAL = 'Concept Snapshot Title - nl-generated-formal';
    public static readonly TITLE_NL_GENERATED_INFORMAL = 'Concept Snapshot Title - nl-generated-informal';
    public static readonly MINIMAL_TITLE = aMinimalLanguageString().withNl(ConceptSnapshotTestBuilder.TITLE_NL).build();

    public static readonly DESCRIPTION = 'Concept Snapshot Description';
    public static readonly DESCRIPTION_NL = 'Concept Snapshot Description - nl';
    public static readonly DESCRIPTION_NL_FORMAL = 'Concept Snapshot Description - nl-formal';
    public static readonly DESCRIPTION_NL_INFORMAL = 'Concept Snapshot Description - nl-informal';
    public static readonly DESCRIPTION_NL_GENERATED_FORMAL = 'Concept Snapshot Description - nl-generated-formal';
    public static readonly DESCRIPTION_NL_GENERATED_INFORMAL = 'Concept Snapshot Description - nl-generated-informal';

    public static readonly ADDITIONAL_DESCRIPTION_NL = 'Concept Snapshot Additional Description - nl';
    public static readonly ADDITIONAL_DESCRIPTION_NL_FORMAL = 'Concept Snapshot Additional Description - nl-formal';
    public static readonly ADDITIONAL_DESCRIPTION_NL_INFORMAL = 'Concept Snapshot Additional Description - nl-informal';
    public static readonly ADDITIONAL_DESCRIPTION_NL_GENERATED_FORMAL = 'Concept Snapshot Additional Description - nl-generated-formal';
    public static readonly ADDITIONAL_DESCRIPTION_NL_GENERATED_INFORMAL = 'Concept Snapshot Additional Description - nl-generated-informal';

    public static readonly EXCEPTION_NL = 'Concept Snapshot Exception - nl';
    public static readonly EXCEPTION_NL_FORMAL = 'Concept Snapshot Exception - nl-formal';
    public static readonly EXCEPTION_NL_INFORMAL = 'Concept Snapshot Exception - nl-informal';
    public static readonly EXCEPTION_NL_GENERATED_FORMAL = 'Concept Snapshot Exception - nl-generated-formal';
    public static readonly EXCEPTION_NL_GENERATED_INFORMAL = 'Concept Snapshot Exception - nl-generated-informal';

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

    public static readonly KEYWORDS = [LanguageString.of('buitenland'), LanguageString.of('levensloos')];

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

}