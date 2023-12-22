import {
    CompetentAuthorityLevelType,
    ConceptVersie,
    ExecutingAuthorityLevelType,
    ProductType,
    PublicationMediumType,
    TargetAudienceType,
    ThemeType,
    YourEuropeCategoryType
} from "../../../src/core/domain/concept-versie";
import {uuid} from "../../../mu-helper";
import {ConceptVersieTestBuilder} from "./concept-versie-test-builder";
import {TaalString} from "../../../src/core/domain/taal-string";
import {BestuurseenheidTestBuilder} from "./bestuureenheid-test-builder";

describe('is functionally changed', () => {

    type TestCase = [string, ConceptVersie, ConceptVersie];

    const aConceptVersieUuid = uuid();
    const aConceptVersie =
        ConceptVersieTestBuilder
            .aFullConceptVersie()
            .build();

    const functionallyUnchangedTestCases: TestCase[]
        = [
        ['same data',
            aConceptVersie,
            aConceptVersie],
        ['equal data',
            ConceptVersieTestBuilder
                .aFullConceptVersie()
                .withId(aConceptVersieUuid)
                .build(),
            ConceptVersieTestBuilder
                .aFullConceptVersie()
                .withId(aConceptVersieUuid)
                .build()]
    ];

    for (const testCase of functionallyUnchangedTestCases) {
        test(`not functionally changed when ${testCase[0]}`, () => {
            expect(ConceptVersie.isFunctionallyChanged(testCase[1], testCase[2])).toBeFalsy();
        });
    }

    const functionallyChangedTestCases: TestCase[]
        = [
        ['title changed',
            ConceptVersieTestBuilder
                .aFullConceptVersie()
                .withTitle(TaalString.of("text-en"))
                .build(),
            ConceptVersieTestBuilder
                .aFullConceptVersie()
                .withTitle(TaalString.of("text-en-changed"))
                .build()],
        ['description changed',
            ConceptVersieTestBuilder
                .aFullConceptVersie()
                .withDescription(TaalString.of("text-en"))
                .build(),
            ConceptVersieTestBuilder
                .aFullConceptVersie()
                .withDescription(TaalString.of("text-en-changed"))
                .build()],
        ['additional description changed',
            ConceptVersieTestBuilder
                .aFullConceptVersie()
                .withAdditionalDescription(TaalString.of("text-en"))
                .build(),
            ConceptVersieTestBuilder
                .aFullConceptVersie()
                .withAdditionalDescription(TaalString.of("text-en-changed"))
                .build()],
        ['exception changed',
            ConceptVersieTestBuilder
                .aFullConceptVersie()
                .withException(TaalString.of("text-en"))
                .build(),
            ConceptVersieTestBuilder
                .aFullConceptVersie()
                .withException(TaalString.of("text-en-changed"))
                .build()],
        ['regulation changed',
            ConceptVersieTestBuilder
                .aFullConceptVersie()
                .withRegulation(TaalString.of("text-en"))
                .build(),
            ConceptVersieTestBuilder
                .aFullConceptVersie()
                .withRegulation(TaalString.of("text-en-changed"))
                .build()],
        ['start date changed',
            ConceptVersieTestBuilder
                .aFullConceptVersie()
                .withStartDate(new Date('2023-11-10'))
                .build(),
            ConceptVersieTestBuilder
                .aFullConceptVersie()
                .withStartDate(new Date('2023-11-09'))
                .build()],
        ['start date appeared',
            ConceptVersieTestBuilder
                .aFullConceptVersie()
                .withStartDate(undefined)
                .build(),
            ConceptVersieTestBuilder
                .aFullConceptVersie()
                .withStartDate(new Date('2023-11-09'))
                .build()],
        ['start date disappeared',
            ConceptVersieTestBuilder
                .aFullConceptVersie()
                .withStartDate(new Date('2023-11-09'))
                .build(),
            ConceptVersieTestBuilder
                .aFullConceptVersie()
                .withStartDate(undefined)
                .build()],
        ['end date changed',
            ConceptVersieTestBuilder
                .aFullConceptVersie()
                .withEndDate(new Date('2023-11-10'))
                .build(),
            ConceptVersieTestBuilder
                .aFullConceptVersie()
                .withEndDate(new Date('2023-11-09'))
                .build()],
        ['end date appeared',
            ConceptVersieTestBuilder
                .aFullConceptVersie()
                .withEndDate(undefined)
                .build(),
            ConceptVersieTestBuilder
                .aFullConceptVersie()
                .withEndDate(new Date('2023-11-09'))
                .build()],
        ['end date disappeared',
            ConceptVersieTestBuilder
                .aFullConceptVersie()
                .withEndDate(new Date('2023-11-09'))
                .build(),
            ConceptVersieTestBuilder
                .aFullConceptVersie()
                .withEndDate(undefined)
                .build()],
        ['type changed',
            ConceptVersieTestBuilder
                .aFullConceptVersie()
                .withType(ProductType.FINANCIEELVOORDEEL)
                .build(),
            ConceptVersieTestBuilder
                .aFullConceptVersie()
                .withType(ProductType.BEWIJS)
                .build()],
        ['type appeared',
            ConceptVersieTestBuilder
                .aFullConceptVersie()
                .withType(undefined)
                .build(),
            ConceptVersieTestBuilder
                .aFullConceptVersie()
                .withType(ProductType.FINANCIEELVOORDEEL)
                .build()],
        ['type disappeared',
            ConceptVersieTestBuilder
                .aFullConceptVersie()
                .withType(ProductType.FINANCIEELVOORDEEL)
                .build(),
            ConceptVersieTestBuilder
                .aFullConceptVersie()
                .withType(undefined)
                .build()],
        ['target audience updated',
            ConceptVersieTestBuilder
                .aFullConceptVersie()
                .withTargetAudiences(new Set([TargetAudienceType.BURGER]))
                .build(),
            ConceptVersieTestBuilder
                .aFullConceptVersie()
                .withTargetAudiences(new Set([TargetAudienceType.VLAAMSEOVERHEID]))
                .build()],
        ['target audience added',
            ConceptVersieTestBuilder
                .aFullConceptVersie()
                .withTargetAudiences(new Set([TargetAudienceType.BURGER]))
                .build(),
            ConceptVersieTestBuilder
                .aFullConceptVersie()
                .withTargetAudiences(new Set([TargetAudienceType.VLAAMSEOVERHEID, TargetAudienceType.BURGER]))
                .build()],
        ['target audience removed',
            ConceptVersieTestBuilder
                .aFullConceptVersie()
                .withTargetAudiences(new Set([TargetAudienceType.VLAAMSEOVERHEID, TargetAudienceType.BURGER]))
                .build(),
            ConceptVersieTestBuilder
                .aFullConceptVersie()
                .withTargetAudiences(new Set([TargetAudienceType.BURGER]))
                .build()],
        ['theme updated',
            ConceptVersieTestBuilder
                .aFullConceptVersie()
                .withThemes(new Set([ThemeType.WELZIJNGEZONDHEID]))
                .build(),
            ConceptVersieTestBuilder
                .aFullConceptVersie()
                .withThemes(new Set([ThemeType.CULTUURSPORTVRIJETIJD]))
                .build()],
        ['theme added',
            ConceptVersieTestBuilder
                .aFullConceptVersie()
                .withThemes(new Set([ThemeType.WELZIJNGEZONDHEID]))
                .build(),
            ConceptVersieTestBuilder
                .aFullConceptVersie()
                .withThemes(new Set([ThemeType.MOBILITEITOPENBAREWERKEN, ThemeType.WELZIJNGEZONDHEID]))
                .build()],
        ['theme removed',
            ConceptVersieTestBuilder
                .aFullConceptVersie()
                .withThemes(new Set([ThemeType.MOBILITEITOPENBAREWERKEN, ThemeType.WELZIJNGEZONDHEID]))
                .build(),
            ConceptVersieTestBuilder
                .aFullConceptVersie()
                .withThemes(new Set([ThemeType.WELZIJNGEZONDHEID]))
                .build()],
        ['competent Authority Level updated',
            ConceptVersieTestBuilder
                .aFullConceptVersie()
                .withCompetentAuthorityLevels(new Set([CompetentAuthorityLevelType.EUROPEES]))
                .build(),
            ConceptVersieTestBuilder
                .aFullConceptVersie()
                .withCompetentAuthorityLevels(new Set([CompetentAuthorityLevelType.LOKAAL]))
                .build()],
        ['competent Authority Level added',
            ConceptVersieTestBuilder
                .aFullConceptVersie()
                .withCompetentAuthorityLevels(new Set([CompetentAuthorityLevelType.LOKAAL]))
                .build(),
            ConceptVersieTestBuilder
                .aFullConceptVersie()
                .withCompetentAuthorityLevels(new Set([CompetentAuthorityLevelType.PROVINCIAAL, CompetentAuthorityLevelType.LOKAAL]))
                .build()],
        ['competent Authority Level removed',
            ConceptVersieTestBuilder
                .aFullConceptVersie()
                .withCompetentAuthorityLevels(new Set([CompetentAuthorityLevelType.PROVINCIAAL, CompetentAuthorityLevelType.FEDERAAL]))
                .build(),
            ConceptVersieTestBuilder
                .aFullConceptVersie()
                .withCompetentAuthorityLevels(new Set([CompetentAuthorityLevelType.FEDERAAL]))
                .build()],
        ['competent authorities updated',
            ConceptVersieTestBuilder
                .aFullConceptVersie()
                .withCompetentAuthorities(new Set([BestuurseenheidTestBuilder.BORGLOON_IRI]))
                .build(),
            ConceptVersieTestBuilder
                .aFullConceptVersie()
                .withCompetentAuthorities(new Set([BestuurseenheidTestBuilder.HOUTHALEN_HELCHTEREN_IRI]))
                .build()],
        ['competent authorities added',
            ConceptVersieTestBuilder
                .aFullConceptVersie()
                .withCompetentAuthorities(new Set([BestuurseenheidTestBuilder.BORGLOON_IRI]))
                .build(),
            ConceptVersieTestBuilder
                .aFullConceptVersie()
                .withCompetentAuthorities(new Set([BestuurseenheidTestBuilder.HOUTHALEN_HELCHTEREN_IRI, BestuurseenheidTestBuilder.BORGLOON_IRI]))
                .build()],
        ['competent authorities removed',
            ConceptVersieTestBuilder
                .aFullConceptVersie()
                .withCompetentAuthorities(new Set([BestuurseenheidTestBuilder.HOUTHALEN_HELCHTEREN_IRI, BestuurseenheidTestBuilder.BORGLOON_IRI]))
                .build(),
            ConceptVersieTestBuilder
                .aFullConceptVersie()
                .withCompetentAuthorities(new Set([BestuurseenheidTestBuilder.BORGLOON_IRI]))
                .build()],
        ['executing Authority Level updated',
            ConceptVersieTestBuilder
                .aFullConceptVersie()
                .withExecutingAuthorityLevels(new Set([ExecutingAuthorityLevelType.EUROPEES]))
                .build(),
            ConceptVersieTestBuilder
                .aFullConceptVersie()
                .withExecutingAuthorityLevels(new Set([ExecutingAuthorityLevelType.LOKAAL]))
                .build()],
        ['executing Authority Level added',
            ConceptVersieTestBuilder
                .aFullConceptVersie()
                .withExecutingAuthorityLevels(new Set([ExecutingAuthorityLevelType.LOKAAL]))
                .build(),
            ConceptVersieTestBuilder
                .aFullConceptVersie()
                .withExecutingAuthorityLevels(new Set([ExecutingAuthorityLevelType.PROVINCIAAL, ExecutingAuthorityLevelType.LOKAAL]))
                .build()],
        ['executing Authority Level removed',
            ConceptVersieTestBuilder
                .aFullConceptVersie()
                .withExecutingAuthorityLevels(new Set([ExecutingAuthorityLevelType.PROVINCIAAL, ExecutingAuthorityLevelType.DERDEN]))
                .build(),
            ConceptVersieTestBuilder
                .aFullConceptVersie()
                .withExecutingAuthorityLevels(new Set([ExecutingAuthorityLevelType.DERDEN]))
                .build()],
        ['executing authorities updated',
            ConceptVersieTestBuilder
                .aFullConceptVersie()
                .withExecutingAuthorities(new Set([BestuurseenheidTestBuilder.OUD_HEVERLEE_IRI]))
                .build(),
            ConceptVersieTestBuilder
                .aFullConceptVersie()
                .withExecutingAuthorities(new Set([BestuurseenheidTestBuilder.HOUTHALEN_HELCHTEREN_IRI]))
                .build()],
        ['executing authorities added',
            ConceptVersieTestBuilder
                .aFullConceptVersie()
                .withExecutingAuthorities(new Set([BestuurseenheidTestBuilder.HOUTHALEN_HELCHTEREN_IRI]))
                .build(),
            ConceptVersieTestBuilder
                .aFullConceptVersie()
                .withExecutingAuthorities(new Set([BestuurseenheidTestBuilder.ASSENEDE_IRI, BestuurseenheidTestBuilder.HOUTHALEN_HELCHTEREN_IRI]))
                .build()],
        ['executing authorities removed',
            ConceptVersieTestBuilder
                .aFullConceptVersie()
                .withExecutingAuthorities(new Set([BestuurseenheidTestBuilder.ASSENEDE_IRI, BestuurseenheidTestBuilder.OUD_HEVERLEE_IRI]))
                .build(),
            ConceptVersieTestBuilder
                .aFullConceptVersie()
                .withExecutingAuthorities(new Set([BestuurseenheidTestBuilder.OUD_HEVERLEE_IRI]))
                .build()],
        ['publication medium updated',
            ConceptVersieTestBuilder
                .aFullConceptVersie()
                .withPublicationMedia(new Set([PublicationMediumType.RECHTENVERKENNER]))
                .build(),
            ConceptVersieTestBuilder
                .aFullConceptVersie()
                .withPublicationMedia(new Set([PublicationMediumType.YOUREUROPE]))
                .build()],
        ['publication medium added',
            ConceptVersieTestBuilder
                .aFullConceptVersie()
                .withPublicationMedia(new Set([PublicationMediumType.RECHTENVERKENNER]))
                .build(),
            ConceptVersieTestBuilder
                .aFullConceptVersie()
                .withPublicationMedia(new Set([PublicationMediumType.YOUREUROPE, PublicationMediumType.RECHTENVERKENNER]))
                .build()],
        ['publication medium removed',
            ConceptVersieTestBuilder
                .aFullConceptVersie()
                .withPublicationMedia(new Set([PublicationMediumType.RECHTENVERKENNER, PublicationMediumType.YOUREUROPE]))
                .build(),
            ConceptVersieTestBuilder
                .aFullConceptVersie()
                .withPublicationMedia(new Set([PublicationMediumType.RECHTENVERKENNER]))
                .build()],
        ['your europe category updated',
            ConceptVersieTestBuilder
                .aFullConceptVersie()
                .withYourEuropeCategories(new Set([YourEuropeCategoryType.GOEDERENRECYCLAGE]))
                .build(),
            ConceptVersieTestBuilder
                .aFullConceptVersie()
                .withYourEuropeCategories(new Set([YourEuropeCategoryType.BEDRIJFINTELLECTUELEEIGENDOMSRECHTEN]))
                .build()],
        ['your europe category added',
            ConceptVersieTestBuilder
                .aFullConceptVersie()
                .withYourEuropeCategories(new Set([YourEuropeCategoryType.BEDRIJFKREDIETVERZEKERING]))
                .build(),
            ConceptVersieTestBuilder
                .aFullConceptVersie()
                .withYourEuropeCategories(new Set([YourEuropeCategoryType.BEDRIJFKREDIETVERZEKERING, YourEuropeCategoryType.GEZONDHEIDSZORG]))
                .build()],
        ['your europe category removed',
            ConceptVersieTestBuilder
                .aFullConceptVersie()
                .withYourEuropeCategories(new Set([YourEuropeCategoryType.PROCEDUREVERHUIZINGADRESWIJZIGING, YourEuropeCategoryType.ONDERWIJSOFSTAGESTAGE]))
                .build(),
            ConceptVersieTestBuilder
                .aFullConceptVersie()
                .withYourEuropeCategories(new Set([YourEuropeCategoryType.PROCEDUREVERHUIZINGADRESWIJZIGING]))
                .build()],

    ];

    for (const testCase of functionallyChangedTestCases) {
        test(`functionally changed when ${testCase[0]}`, () => {
            expect(ConceptVersie.isFunctionallyChanged(testCase[1], testCase[2])).toBeTruthy();
        });
    }


});