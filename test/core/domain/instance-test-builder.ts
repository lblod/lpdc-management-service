import {LanguageString} from "../../../src/core/domain/language-string";
import {InstanceBuilder} from "../../../src/core/domain/instance";
import {
    buildBestuurseenheidIri,
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
} from "../../../src/core/domain/types";
import {BestuurseenheidTestBuilder} from "./bestuurseenheid-test-builder";
import {aFullRequirementForInstance, anotherFullRequirementForInstance} from "./requirement-test-builder";
import {aFullEvidenceForInstance, anotherFullEvidenceForInstance} from "./evidence-test-builder";
import {aFullProcedureForInstance, anotherFullProcedureForInstance} from "./procedure-test-builder";
import {aFullWebsiteForInstance, anotherFullWebsiteForInstance} from "./website-test-builder";
import {aFullCostForInstance, anotherFullCostForInstance} from "./cost-test-builder";
import {
    aFullFinancialAdvantageForInstance,
    anotherFullFinancialAdvantageForInstance
} from "./financial-advantage-test-builder";
import {aFullContactPointForInstance, anotherFullContactPointForInstance} from "./contact-point-test-builder";
import {aFullLegalResourceForInstance, anotherFullLegalResourceForInstance} from "./legal-resource-test-builder";
import {Language} from "../../../src/core/domain/language";


export function aMinimalInstance(): InstanceBuilder {
    const uniqueId = uuid();
    return new InstanceBuilder()
        .withId(buildInstanceIri(uniqueId))
        .withUuid(uniqueId)
        .withCreatedBy(buildBestuurseenheidIri(uuid()))
        .withDateCreated(InstanceTestBuilder.DATE_CREATED)
        .withDateModified(InstanceTestBuilder.DATE_MODIFIED)
        .withDutchLanguageVariant(InstanceTestBuilder.DUTCH_LANGUAGE_VARIANT)
        .withStatus(InstanceTestBuilder.STATUS);
}

export function aFullInstance(): InstanceBuilder {
    return aMinimalInstance()
        .withTitle(
            LanguageString.of(
                InstanceTestBuilder.TITLE_EN,
                undefined,
                InstanceTestBuilder.TITLE_NL_FORMAL))
        .withDescription(
            LanguageString.of(
                InstanceTestBuilder.DESCRIPTION_EN,
                undefined,
                InstanceTestBuilder.DESCRIPTION_NL_FORMAL))
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
        .withConceptId(buildConceptIri(uuid()))
        .withConceptSnapshotId(buildConceptSnapshotIri(uuid()))
        .withProductId(InstanceTestBuilder.PRODUCT_ID)
        .withLanguages(InstanceTestBuilder.LANGUAGES)
        .withDutchLanguageVariant(InstanceTestBuilder.DUTCH_LANGUAGE_VARIANT)
        .withDateSent(InstanceTestBuilder.DATE_SENT)
        .withDatePublished(InstanceTestBuilder.DATE_PUBLISHED)
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

    public static readonly DESCRIPTION_EN = 'Instance Description - en';
    public static readonly DESCRIPTION_NL = 'Instance Description - nl';
    public static readonly DESCRIPTION_NL_FORMAL = 'Instance Description - nl-formal';
    public static readonly DESCRIPTION_NL_INFORMAL = 'Instance Description - nl-informal';

    public static readonly DATE_CREATED = FormatPreservingDate.of('2022-10-01T13:00:42.074442Z');
    public static readonly DATE_MODIFIED = FormatPreservingDate.of('2023-10-02T20:00:20.242928Z');

    public static readonly DATE_SENT = FormatPreservingDate.of('2023-10-03T20:10:45.242928Z');
    public static readonly DATE_PUBLISHED = FormatPreservingDate.of('2023-10-03T21:01:23.242928Z');

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
    public static readonly EXECUTING_AUTHORITY_LEVELS = [ExecutingAuthorityLevelType.DERDEN, ExecutingAuthorityLevelType.VLAAMS, ExecutingAuthorityLevelType.FEDERAAL];

    public static readonly PUBLICATION_MEDIA = [PublicationMediumType.YOUREUROPE, PublicationMediumType.RECHTENVERKENNER];

    public static readonly YOUR_EUROPE_CATEGORIES = [YourEuropeCategoryType.WERKENPENSIONERING, YourEuropeCategoryType.PROCEDURESTARTENEXPLOITERENSLUITENBEDRIJFPENSIOENENVERZEKERINGSREGELINGENWERKGEVER, YourEuropeCategoryType.ONDERWIJSOFSTAGESTAGE];

    public static readonly KEYWORDS = [LanguageString.of('overlijden - en'), LanguageString.of(undefined, 'overlijden - nl'), LanguageString.of(undefined, 'goederen verhandelen'), LanguageString.of('sacrale activiteiten')];

    public static readonly REQUIREMENTS = [
        aFullRequirementForInstance().withUuid(uuid()).withEvidence(aFullEvidenceForInstance().withUuid(uuid()).build()).build(),
        anotherFullRequirementForInstance().withUuid(uuid()).withEvidence(anotherFullEvidenceForInstance().withUuid(uuid()).build()).build()
    ];

    public static readonly PROCEDURES = [
        aFullProcedureForInstance().withUuid(uuid()).withWebsites([aFullWebsiteForInstance().withUuid(uuid()).withOrder(1).build(), anotherFullWebsiteForInstance(uuid()).withOrder(2).build()]).build(),
        anotherFullProcedureForInstance().withUuid(uuid()).withWebsites([anotherFullWebsiteForInstance(uuid()).withOrder(1).build(), anotherFullWebsiteForInstance(uuid()).withOrder(2).build()]).build()
    ];

    public static readonly WEBSITES = [anotherFullWebsiteForInstance(uuid()).withOrder(1).build(), anotherFullWebsiteForInstance(uuid()).withOrder(2).build()];

    public static readonly COSTS = [aFullCostForInstance().withUuid(uuid()).build(), anotherFullCostForInstance().withUuid(uuid()).build()];

    public static readonly FINANCIAL_ADVANTAGES = [aFullFinancialAdvantageForInstance().build(), anotherFullFinancialAdvantageForInstance().build()];

    public static readonly LANGUAGES = [LanguageType.NLD, LanguageType.ENG];
    public static readonly DUTCH_LANGUAGE_VARIANT = Language.FORMAL;

    public static readonly CONTACT_POINTS = [aFullContactPointForInstance().build(), anotherFullContactPointForInstance().build()];

    public static readonly PRODUCT_ID = "5468";

    public static readonly REVIEW_STATUS = InstanceReviewStatusType.CONCEPT_GEWIJZIGD;
    public static readonly PUBLICATION_STATUS = InstancePublicationStatusType.TE_HERPUBLICEREN;

    public static readonly LEGAL_RESOURCES = [aFullLegalResourceForInstance().withOrder(1).build(), anotherFullLegalResourceForInstance(uuid()).withOrder(2).build()];

}


