import {ConceptVersie} from "../../../src/core/domain/concept-versie";
import {uuid} from "../../../mu-helper";
import {aFullConceptVersie, ConceptVersieTestBuilder} from "./concept-versie-test-builder";
import {TaalString} from "../../../src/core/domain/taal-string";
import {BestuurseenheidTestBuilder} from "./bestuureenheid-test-builder";
import {aMinimalRequirement} from "./requirement-test-builder";
import {aFullEvidence, aMinimalEvidence} from "./evidence-test-builder";
import {aFullProcedure} from "./procedure-test-builder";
import {aFullWebsite, aMinimalWebsite} from "./website-test-builder";
import {aFullCost} from "./cost-test-builder";
import {aFullFinancialAdvantage} from "./financial-advantage-test-builder";
import {FormatPreservingDate} from "../../../src/core/domain/format-preserving-date";
import {
    CompetentAuthorityLevelType,
    ExecutingAuthorityLevelType,
    ProductType,
    PublicationMediumType,
    TargetAudienceType,
    ThemeType,
    YourEuropeCategoryType
} from "../../../src/core/domain/types";

describe('is functionally changed', () => {

    test('identifier is extracted from id', () => {
        const aUUID = uuid();
        const id = ConceptVersieTestBuilder.buildIri(aUUID);
        const aConceptVersie =
            aFullConceptVersie()
                .withId(id)
                .build();

        expect(aConceptVersie.identifier).toEqual(aUUID);
    });

    type TestCase = [string, ConceptVersie, ConceptVersie];

    const aConceptVersieId = ConceptVersieTestBuilder.buildIri(uuid());
    const aConceptVersie =
        aFullConceptVersie().build();

    const functionallyUnchangedTestCases: TestCase[]
        = [
        ['exactly the same data',
            aConceptVersie,
            aConceptVersie],
        ['equal data',
            aFullConceptVersie()
                .withId(aConceptVersieId)
                .build(),
            aFullConceptVersie()
                .withId(aConceptVersieId)
                .build()],
        ['start date the same except formatting',
            aFullConceptVersie()
                .withStartDate(FormatPreservingDate.of('2027-09-16 00:00:00Z'))
                .build(),
            aFullConceptVersie()
                .withStartDate(FormatPreservingDate.of('2027-09-16 00:00:00.000Z'))
                .build()],
        ['end date the same except formatting',
            aFullConceptVersie()
                .withEndDate(FormatPreservingDate.of('2027-09-16 00:00:00Z'))
                .build(),
            aFullConceptVersie()
                .withEndDate(FormatPreservingDate.of('2027-09-16 00:00:00.000Z'))
                .build()],    ];

    for (const testCase of functionallyUnchangedTestCases) {
        test(`not functionally changed when ${testCase[0]}`, () => {
            expect(ConceptVersie.isFunctionallyChanged(testCase[1], testCase[2])).toBeFalsy();
        });
    }

    const functionallyChangedTestCases: TestCase[]
        = [
        ['title changed',
            aFullConceptVersie()
                .withTitle(TaalString.of("text-en"))
                .build(),
            aFullConceptVersie()
                .withTitle(TaalString.of("text-en-changed"))
                .build()],
        ['description changed',
            aFullConceptVersie()
                .withDescription(TaalString.of("text-en"))
                .build(),
            aFullConceptVersie()
                .withDescription(TaalString.of("text-en-changed"))
                .build()],
        ['additional description changed',
            aFullConceptVersie()
                .withAdditionalDescription(TaalString.of("text-en"))
                .build(),
            aFullConceptVersie()
                .withAdditionalDescription(TaalString.of("text-en-changed"))
                .build()],
        ['exception changed',
            aFullConceptVersie()
                .withException(TaalString.of("text-en"))
                .build(),
            aFullConceptVersie()
                .withException(TaalString.of("text-en-changed"))
                .build()],
        ['regulation changed',
            aFullConceptVersie()
                .withRegulation(TaalString.of("text-en"))
                .build(),
            aFullConceptVersie()
                .withRegulation(TaalString.of("text-en-changed"))
                .build()],
        ['start date changed',
            aFullConceptVersie()
                .withStartDate(FormatPreservingDate.of('2023-11-10 00:00:00.000Z'))
                .build(),
            aFullConceptVersie()
                .withStartDate(FormatPreservingDate.of('2023-11-09 00:00:00.000Z'))
                .build()],
        ['start date appeared',
            aFullConceptVersie()
                .withStartDate(undefined)
                .build(),
            aFullConceptVersie()
                .withStartDate(FormatPreservingDate.of('2023-11-09 00:00:00.000Z'))
                .build()],
        ['start date disappeared',
            aFullConceptVersie()
                .withStartDate(FormatPreservingDate.of('2023-11-09 00:00:00.000Z'))
                .build(),
            aFullConceptVersie()
                .withStartDate(undefined)
                .build()],
        ['end date changed',
            aFullConceptVersie()
                .withEndDate(FormatPreservingDate.of('2023-11-10 00:00:00.000Z'))
                .build(),
            aFullConceptVersie()
                .withEndDate(FormatPreservingDate.of('2023-11-09 00:00:00.000Z'))
                .build()],
        ['end date appeared',
            aFullConceptVersie()
                .withEndDate(undefined)
                .build(),
            aFullConceptVersie()
                .withEndDate(FormatPreservingDate.of('2023-11-09 00:00:00.000Z'))
                .build()],
        ['end date disappeared',
            aFullConceptVersie()
                .withEndDate(FormatPreservingDate.of('2023-11-09 00:00:00.000Z'))
                .build(),
            aFullConceptVersie()
                .withEndDate(undefined)
                .build()],
        ['type changed',
            aFullConceptVersie()
                .withType(ProductType.FINANCIEELVOORDEEL)
                .build(),
            aFullConceptVersie()
                .withType(ProductType.BEWIJS)
                .build()],
        ['type appeared',
            aFullConceptVersie()
                .withType(undefined)
                .build(),
            aFullConceptVersie()
                .withType(ProductType.FINANCIEELVOORDEEL)
                .build()],
        ['type disappeared',
            aFullConceptVersie()
                .withType(ProductType.FINANCIEELVOORDEEL)
                .build(),
            aFullConceptVersie()
                .withType(undefined)
                .build()],
        ['target audience updated',
            aFullConceptVersie()
                .withTargetAudiences(new Set([TargetAudienceType.BURGER]))
                .build(),
            aFullConceptVersie()
                .withTargetAudiences(new Set([TargetAudienceType.VLAAMSEOVERHEID]))
                .build()],
        ['target audience added',
            aFullConceptVersie()
                .withTargetAudiences(new Set([TargetAudienceType.BURGER]))
                .build(),
            aFullConceptVersie()
                .withTargetAudiences(new Set([TargetAudienceType.VLAAMSEOVERHEID, TargetAudienceType.BURGER]))
                .build()],
        ['target audience removed',
            aFullConceptVersie()
                .withTargetAudiences(new Set([TargetAudienceType.VLAAMSEOVERHEID, TargetAudienceType.BURGER]))
                .build(),
            aFullConceptVersie()
                .withTargetAudiences(new Set([TargetAudienceType.BURGER]))
                .build()],
        ['theme updated',
            aFullConceptVersie()
                .withThemes(new Set([ThemeType.WELZIJNGEZONDHEID]))
                .build(),
            aFullConceptVersie()
                .withThemes(new Set([ThemeType.CULTUURSPORTVRIJETIJD]))
                .build()],
        ['theme added',
            aFullConceptVersie()
                .withThemes(new Set([ThemeType.WELZIJNGEZONDHEID]))
                .build(),
            aFullConceptVersie()
                .withThemes(new Set([ThemeType.MOBILITEITOPENBAREWERKEN, ThemeType.WELZIJNGEZONDHEID]))
                .build()],
        ['theme removed',
            aFullConceptVersie()
                .withThemes(new Set([ThemeType.MOBILITEITOPENBAREWERKEN, ThemeType.WELZIJNGEZONDHEID]))
                .build(),
            aFullConceptVersie()
                .withThemes(new Set([ThemeType.WELZIJNGEZONDHEID]))
                .build()],
        ['competent Authority Level updated',
            aFullConceptVersie()
                .withCompetentAuthorityLevels(new Set([CompetentAuthorityLevelType.EUROPEES]))
                .build(),
            aFullConceptVersie()
                .withCompetentAuthorityLevels(new Set([CompetentAuthorityLevelType.LOKAAL]))
                .build()],
        ['competent Authority Level added',
            aFullConceptVersie()
                .withCompetentAuthorityLevels(new Set([CompetentAuthorityLevelType.LOKAAL]))
                .build(),
            aFullConceptVersie()
                .withCompetentAuthorityLevels(new Set([CompetentAuthorityLevelType.PROVINCIAAL, CompetentAuthorityLevelType.LOKAAL]))
                .build()],
        ['competent Authority Level removed',
            aFullConceptVersie()
                .withCompetentAuthorityLevels(new Set([CompetentAuthorityLevelType.PROVINCIAAL, CompetentAuthorityLevelType.FEDERAAL]))
                .build(),
            aFullConceptVersie()
                .withCompetentAuthorityLevels(new Set([CompetentAuthorityLevelType.FEDERAAL]))
                .build()],
        ['competent authorities updated',
            aFullConceptVersie()
                .withCompetentAuthorities(new Set([BestuurseenheidTestBuilder.BORGLOON_IRI]))
                .build(),
            aFullConceptVersie()
                .withCompetentAuthorities(new Set([BestuurseenheidTestBuilder.HOUTHALEN_HELCHTEREN_IRI]))
                .build()],
        ['competent authorities added',
            aFullConceptVersie()
                .withCompetentAuthorities(new Set([BestuurseenheidTestBuilder.BORGLOON_IRI]))
                .build(),
            aFullConceptVersie()
                .withCompetentAuthorities(new Set([BestuurseenheidTestBuilder.HOUTHALEN_HELCHTEREN_IRI, BestuurseenheidTestBuilder.BORGLOON_IRI]))
                .build()],
        ['competent authorities removed',
            aFullConceptVersie()
                .withCompetentAuthorities(new Set([BestuurseenheidTestBuilder.HOUTHALEN_HELCHTEREN_IRI, BestuurseenheidTestBuilder.BORGLOON_IRI]))
                .build(),
            aFullConceptVersie()
                .withCompetentAuthorities(new Set([BestuurseenheidTestBuilder.BORGLOON_IRI]))
                .build()],
        ['executing Authority Level updated',
            aFullConceptVersie()
                .withExecutingAuthorityLevels(new Set([ExecutingAuthorityLevelType.EUROPEES]))
                .build(),
            aFullConceptVersie()
                .withExecutingAuthorityLevels(new Set([ExecutingAuthorityLevelType.LOKAAL]))
                .build()],
        ['executing Authority Level added',
            aFullConceptVersie()
                .withExecutingAuthorityLevels(new Set([ExecutingAuthorityLevelType.LOKAAL]))
                .build(),
            aFullConceptVersie()
                .withExecutingAuthorityLevels(new Set([ExecutingAuthorityLevelType.PROVINCIAAL, ExecutingAuthorityLevelType.LOKAAL]))
                .build()],
        ['executing Authority Level removed',
            aFullConceptVersie()
                .withExecutingAuthorityLevels(new Set([ExecutingAuthorityLevelType.PROVINCIAAL, ExecutingAuthorityLevelType.DERDEN]))
                .build(),
            aFullConceptVersie()
                .withExecutingAuthorityLevels(new Set([ExecutingAuthorityLevelType.DERDEN]))
                .build()],
        ['executing authorities updated',
            aFullConceptVersie()
                .withExecutingAuthorities(new Set([BestuurseenheidTestBuilder.OUD_HEVERLEE_IRI]))
                .build(),
            aFullConceptVersie()
                .withExecutingAuthorities(new Set([BestuurseenheidTestBuilder.HOUTHALEN_HELCHTEREN_IRI]))
                .build()],
        ['executing authorities added',
            aFullConceptVersie()
                .withExecutingAuthorities(new Set([BestuurseenheidTestBuilder.HOUTHALEN_HELCHTEREN_IRI]))
                .build(),
            aFullConceptVersie()
                .withExecutingAuthorities(new Set([BestuurseenheidTestBuilder.ASSENEDE_IRI, BestuurseenheidTestBuilder.HOUTHALEN_HELCHTEREN_IRI]))
                .build()],
        ['executing authorities removed',
            aFullConceptVersie()
                .withExecutingAuthorities(new Set([BestuurseenheidTestBuilder.ASSENEDE_IRI, BestuurseenheidTestBuilder.OUD_HEVERLEE_IRI]))
                .build(),
            aFullConceptVersie()
                .withExecutingAuthorities(new Set([BestuurseenheidTestBuilder.OUD_HEVERLEE_IRI]))
                .build()],
        ['publication medium updated',
            aFullConceptVersie()
                .withPublicationMedia(new Set([PublicationMediumType.RECHTENVERKENNER]))
                .build(),
            aFullConceptVersie()
                .withPublicationMedia(new Set([PublicationMediumType.YOUREUROPE]))
                .build()],
        ['publication medium added',
            aFullConceptVersie()
                .withPublicationMedia(new Set([PublicationMediumType.RECHTENVERKENNER]))
                .build(),
            aFullConceptVersie()
                .withPublicationMedia(new Set([PublicationMediumType.YOUREUROPE, PublicationMediumType.RECHTENVERKENNER]))
                .build()],
        ['publication medium removed',
            aFullConceptVersie()
                .withPublicationMedia(new Set([PublicationMediumType.RECHTENVERKENNER, PublicationMediumType.YOUREUROPE]))
                .build(),
            aFullConceptVersie()
                .withPublicationMedia(new Set([PublicationMediumType.RECHTENVERKENNER]))
                .build()],
        ['your europe category updated',
            aFullConceptVersie()
                .withYourEuropeCategories(new Set([YourEuropeCategoryType.GOEDERENRECYCLAGE]))
                .build(),
            aFullConceptVersie()
                .withYourEuropeCategories(new Set([YourEuropeCategoryType.BEDRIJFINTELLECTUELEEIGENDOMSRECHTEN]))
                .build()],
        ['your europe category added',
            aFullConceptVersie()
                .withYourEuropeCategories(new Set([YourEuropeCategoryType.BEDRIJFKREDIETVERZEKERING]))
                .build(),
            aFullConceptVersie()
                .withYourEuropeCategories(new Set([YourEuropeCategoryType.BEDRIJFKREDIETVERZEKERING, YourEuropeCategoryType.GEZONDHEIDSZORG]))
                .build()],
        ['your europe category removed',
            aFullConceptVersie()
                .withYourEuropeCategories(new Set([YourEuropeCategoryType.PROCEDUREVERHUIZINGADRESWIJZIGING, YourEuropeCategoryType.ONDERWIJSOFSTAGESTAGE]))
                .build(),
            aFullConceptVersie()
                .withYourEuropeCategories(new Set([YourEuropeCategoryType.PROCEDUREVERHUIZINGADRESWIJZIGING]))
                .build()],
        ['keyword updated - en',
            aFullConceptVersie()
                .withKeywords([TaalString.of('abc')])
                .build(),
            aFullConceptVersie()
                .withKeywords([TaalString.of('def')])
                .build()],
        ['keyword updated - nl',
            aFullConceptVersie()
                .withKeywords([TaalString.of(undefined, 'abc')])
                .build(),
            aFullConceptVersie()
                .withKeywords([TaalString.of(undefined, 'def')])
                .build()],
        ['keyword updated - en became nl',
            aFullConceptVersie()
                .withKeywords([TaalString.of('abc')])
                .build(),
            aFullConceptVersie()
                .withKeywords([TaalString.of(undefined, 'abc')])
                .build()],
        ['keyword added',
            aFullConceptVersie()
                .withKeywords([TaalString.of('abc')])
                .build(),
            aFullConceptVersie()
                .withKeywords([TaalString.of('abc'), TaalString.of('def')])
                .build()],
        ['keyword removed',
            aFullConceptVersie()
                .withKeywords([TaalString.of('abc'), TaalString.of('def')])
                .build(),
            aFullConceptVersie()
                .withKeywords([TaalString.of('abc')])
                .build()],
        ['requirement added',
            aFullConceptVersie()
                .withRequirements([])
                .build(),
            aFullConceptVersie()
                .withRequirements([aMinimalRequirement().build()])
                .build()],
        ['requirement removed',
            aFullConceptVersie()
                .withRequirements([aMinimalRequirement().build()])
                .build(),
            aFullConceptVersie()
                .withRequirements([])
                .build()],
        ['requirement order changed',
            aFullConceptVersie()
                .withRequirements([aMinimalRequirement().withTitle(TaalString.of('requirement-title-en-1')).build(),
                    aMinimalRequirement().withTitle(TaalString.of('requirement-title-en-2')).build()])
                .build(),
            aFullConceptVersie()
                .withRequirements([aMinimalRequirement().withTitle(TaalString.of('requirement-title-en-2')).build(),
                    aMinimalRequirement().withTitle(TaalString.of('requirement-title-en-1')).build()])
                .build()],
        ['requirement title updated : en changed',
            aFullConceptVersie()
                .withRequirements([aMinimalRequirement().withTitle(TaalString.of('requirement-title-en')).build()])
                .build(),
            aFullConceptVersie()
                .withRequirements([aMinimalRequirement().withTitle(TaalString.of('requirement-title-en - updated')).build()])
                .build()],
        ['requirement title updated: nl added',
            aFullConceptVersie()
                .withRequirements([aMinimalRequirement().withTitle(TaalString.of('requirement-title-en')).build()])
                .build(),
            aFullConceptVersie()
                .withRequirements([aMinimalRequirement().withTitle(TaalString.of('requirement-title-en', 'requirement-title-nl')).build()])
                .build()],
        ['requirement title updated: nl removed',
            aFullConceptVersie()
                .withRequirements([aMinimalRequirement().withTitle(TaalString.of('requirement-title-en', 'requirement-title-nl')).build()])
                .build(),
            aFullConceptVersie()
                .withRequirements([aMinimalRequirement().withTitle(TaalString.of('requirement-title-en')).build()])
                .build()],
        ['requirement title updated : nl changed',
            aFullConceptVersie()
                .withRequirements([aMinimalRequirement().withTitle(TaalString.of('requirement-title-en', 'requirement-title-nl')).build()])
                .build(),
            aFullConceptVersie()
                .withRequirements([aMinimalRequirement().withTitle(TaalString.of('requirement-title-en', 'requirement-title-changed')).build()])
                .build()],
        ['requirement description updated : en changed',
            aFullConceptVersie()
                .withRequirements([aMinimalRequirement().withDescription(TaalString.of('requirement-description-en')).build()])
                .build(),
            aFullConceptVersie()
                .withRequirements([aMinimalRequirement().withDescription(TaalString.of('requirement-description-en - updated')).build()])
                .build()],
        ['requirement description updated: nl added',
            aFullConceptVersie()
                .withRequirements([aMinimalRequirement().withDescription(TaalString.of('requirement-description-en')).build()])
                .build(),
            aFullConceptVersie()
                .withRequirements([aMinimalRequirement().withDescription(TaalString.of('requirement-description-en', 'requirement-description-nl')).build()])
                .build()],
        ['requirement description updated: nl removed',
            aFullConceptVersie()
                .withRequirements([aMinimalRequirement().withDescription(TaalString.of('requirement-description-en', 'requirement-description-nl')).build()])
                .build(),
            aFullConceptVersie()
                .withRequirements([aMinimalRequirement().withDescription(TaalString.of('requirement-description-en')).build()])
                .build()],
        ['requirement description updated : nl changed',
            aFullConceptVersie()
                .withRequirements([aMinimalRequirement().withDescription(TaalString.of('requirement-description-en', 'requirement-description-nl')).build()])
                .build(),
            aFullConceptVersie()
                .withRequirements([aMinimalRequirement().withDescription(TaalString.of('requirement-description-en', 'requirement-description-changed')).build()])
                .build()],
        ['requirement > evidence : added',
            aFullConceptVersie()
                .withRequirements([aMinimalRequirement().withEvidence(undefined).build()])
                .build(),
            aFullConceptVersie()
                .withRequirements([aMinimalRequirement().withEvidence(aFullEvidence().build()).build()])
                .build()],
        ['requirement > evidence : removed',
            aFullConceptVersie()
                .withRequirements([aMinimalRequirement().withEvidence(aFullEvidence().build()).build()])
                .build(),
            aFullConceptVersie()
                .withRequirements([aMinimalRequirement().withEvidence(undefined).build()])
                .build()],
        ['requirement > evidence title updated',
            aFullConceptVersie()
                .withRequirements([aMinimalRequirement().withEvidence(aMinimalEvidence().withTitle(TaalString.of('evidence title en')).build()).build()])
                .build(),
            aFullConceptVersie()
                .withRequirements([aMinimalRequirement().withEvidence(aMinimalEvidence().withTitle(TaalString.of('evidence title en updated')).build()).build()])
                .build()],
        ['requirement > evidence description updated',
            aFullConceptVersie()
                .withRequirements([aMinimalRequirement().withEvidence(aMinimalEvidence().withDescription(TaalString.of('evidence description en')).build()).build()])
                .build(),
            aFullConceptVersie()
                .withRequirements([aMinimalRequirement().withEvidence(aMinimalEvidence().withDescription(TaalString.of('evidence description en updated')).build()).build()])
                .build()],
        ['procedure added',
            aFullConceptVersie()
                .withProcedures([])
                .build(),
            aFullConceptVersie()
                .withProcedures([aFullProcedure().build()])
                .build()],
        ['procedure removed',
            aFullConceptVersie()
                .withProcedures([aFullProcedure().build()])
                .build(),
            aFullConceptVersie()
                .withProcedures([])
                .build()],
        ['procedure order changed',
            aFullConceptVersie()
                .withProcedures([aFullProcedure().withTitle(TaalString.of('procedure title en')).build(),
                    aFullProcedure().withTitle(TaalString.of('procedure title en another')).build()])
                .build(),
            aFullConceptVersie()
                .withProcedures([aFullProcedure().withTitle(TaalString.of('procedure title en another')).build(),
                    aFullProcedure().withTitle(TaalString.of('procedure title en')).build()])
                .build()],
        ['procedure title updated',
            aFullConceptVersie()
                .withProcedures([aFullProcedure().withTitle(TaalString.of('procedure title en')).build()])
                .build(),
            aFullConceptVersie()
                .withProcedures([aFullProcedure().withTitle(TaalString.of('procedure title en updated')).build()])
                .build()],
        ['procedure title added',
            aFullConceptVersie()
                .withProcedures([aFullProcedure().withTitle(undefined).build()])
                .build(),
            aFullConceptVersie()
                .withProcedures([aFullProcedure().withTitle(TaalString.of('procedure title en updated')).build()])
                .build()],
        ['procedure title removed',
            aFullConceptVersie()
                .withProcedures([aFullProcedure().withTitle(TaalString.of('procedure title en updated')).build()])
                .build(),
            aFullConceptVersie()
                .withProcedures([aFullProcedure().withTitle(undefined).build()])
                .build()],
        ['procedure description updated',
            aFullConceptVersie()
                .withProcedures([aFullProcedure().withDescription(TaalString.of('procedure description en')).build()])
                .build(),
            aFullConceptVersie()
                .withProcedures([aFullProcedure().withDescription(TaalString.of('procedure description en updated')).build()])
                .build()],
        ['procedure description added',
            aFullConceptVersie()
                .withProcedures([aFullProcedure().withDescription(undefined).build()])
                .build(),
            aFullConceptVersie()
                .withProcedures([aFullProcedure().withDescription(TaalString.of('procedure description en updated')).build()])
                .build()],
        ['procedure description removed',
            aFullConceptVersie()
                .withProcedures([aFullProcedure().withDescription(TaalString.of('procedure description en')).build()])
                .build(),
            aFullConceptVersie()
                .withProcedures([aFullProcedure().withDescription(undefined).build()])
                .build()],
        ['procedure website title updated',
            aFullConceptVersie()
                .withProcedures([aFullProcedure().withWebsites([aMinimalWebsite().withTitle(TaalString.of('procedure website title en')).build()]).build()])
                .build(),
            aFullConceptVersie()
                .withProcedures([aFullProcedure().withWebsites([aMinimalWebsite().withTitle(TaalString.of('procedure website title en updated')).build()]).build()])
                .build()],
        ['procedure website title added',
            aFullConceptVersie()
                .withProcedures([aFullProcedure().withWebsites([aMinimalWebsite().withTitle(undefined).build()]).build()])
                .build(),
            aFullConceptVersie()
                .withProcedures([aFullProcedure().withWebsites([aMinimalWebsite().withTitle(TaalString.of('procedure website title en')).build()]).build()])
                .build()],
        ['procedure website title removed',
            aFullConceptVersie()
                .withProcedures([aFullProcedure().withWebsites([aMinimalWebsite().withTitle(TaalString.of('procedure website title en')).build()]).build()])
                .build(),
            aFullConceptVersie()
                .withProcedures([aFullProcedure().withWebsites([aMinimalWebsite().withTitle(undefined).build()]).build()])
                .build()],
        ['procedure website description updated',
            aFullConceptVersie()
                .withProcedures([aFullProcedure().withWebsites([aMinimalWebsite().withDescription(TaalString.of('procedure website description en')).build()]).build()])
                .build(),
            aFullConceptVersie()
                .withProcedures([aFullProcedure().withWebsites([aMinimalWebsite().withDescription(TaalString.of('procedure website description en updated')).build()]).build()])
                .build()],
        ['procedure website description added',
            aFullConceptVersie()
                .withProcedures([aFullProcedure().withWebsites([aMinimalWebsite().withDescription(undefined).build()]).build()])
                .build(),
            aFullConceptVersie()
                .withProcedures([aFullProcedure().withWebsites([aMinimalWebsite().withDescription(TaalString.of('procedure website description en')).build()]).build()])
                .build()],
        ['procedure website description removed',
            aFullConceptVersie()
                .withProcedures([aFullProcedure().withWebsites([aMinimalWebsite().withDescription(TaalString.of('procedure website description en')).build()]).build()])
                .build(),
            aFullConceptVersie()
                .withProcedures([aFullProcedure().withWebsites([aMinimalWebsite().withDescription(undefined).build()]).build()])
                .build()],
        ['procedure website url updated',
            aFullConceptVersie()
                .withProcedures([aFullProcedure().withWebsites([aMinimalWebsite().withUrl('https://url1.com').build()]).build()])
                .build(),
            aFullConceptVersie()
                .withProcedures([aFullProcedure().withWebsites([aMinimalWebsite().withUrl('https://url2.com').build()]).build()])
                .build()],
        ['procedure website url added',
            aFullConceptVersie()
                .withProcedures([aFullProcedure().withWebsites([aMinimalWebsite().withUrl(undefined).build()]).build()])
                .build(),
            aFullConceptVersie()
                .withProcedures([aFullProcedure().withWebsites([aMinimalWebsite().withUrl('https://url1.com').build()]).build()])
                .build()],
        ['procedure website url removed',
            aFullConceptVersie()
                .withProcedures([aFullProcedure().withWebsites([aMinimalWebsite().withUrl('https://url1.com').build()]).build()])
                .build(),
            aFullConceptVersie()
                .withProcedures([aFullProcedure().withWebsites([aMinimalWebsite().withUrl(undefined).build()]).build()])
                .build()],
        ['procedure website added',
            aFullConceptVersie()
                .withProcedures([aFullProcedure().withWebsites([]).build()])
                .build(),
            aFullConceptVersie()
                .withProcedures([aFullProcedure().withWebsites([aFullWebsite().build()]).build()])
                .build()],
        ['procedure website removed',
            aFullConceptVersie()
                .withProcedures([aFullProcedure().withWebsites([aFullWebsite().build()]).build()])
                .build(),
            aFullConceptVersie()
                .withProcedures([aFullProcedure().withWebsites([]).build()])
                .build()],
        ['procedure website order changed',
            aFullConceptVersie()
                .withProcedures([aFullProcedure().withWebsites([aMinimalWebsite().withUrl('https://url1.com').build(), aMinimalWebsite().withUrl('https://url2.com').build()]).build()])
                .build(),
            aFullConceptVersie()
                .withProcedures([aFullProcedure().withWebsites([aMinimalWebsite().withUrl('https://url2.com').build(), aMinimalWebsite().withUrl('https://url1.com').build()]).build()])
                .build()],
        ['website added',
            aFullConceptVersie()
                .withWebsites([])
                .build(),
            aFullConceptVersie()
                .withWebsites([aFullWebsite().build()])
                .build()],
        ['website removed',
            aFullConceptVersie()
                .withWebsites([aFullWebsite().build()])
                .build(),
            aFullConceptVersie()
                .withWebsites([])
                .build()],
        ['website title updated',
            aFullConceptVersie()
                .withWebsites([aMinimalWebsite().withTitle(TaalString.of('website title en')).build()])
                .build(),
            aFullConceptVersie()
                .withWebsites([aMinimalWebsite().withTitle(TaalString.of('website title en updated')).build()])
                .build()],
        ['website title added',
            aFullConceptVersie()
                .withWebsites([aMinimalWebsite().withTitle(undefined).build()])
                .build(),
            aFullConceptVersie()
                .withWebsites([aMinimalWebsite().withTitle(TaalString.of('website title en')).build()])
                .build()],
        ['website title removed',
            aFullConceptVersie()
                .withWebsites([aMinimalWebsite().withTitle(TaalString.of('website title en')).build()])
                .build(),
            aFullConceptVersie()
                .withWebsites([aMinimalWebsite().withTitle(undefined).build()])
                .build()],
        ['website description updated',
            aFullConceptVersie()
                .withWebsites([aMinimalWebsite().withDescription(TaalString.of('website description en')).build()])
                .build(),
            aFullConceptVersie()
                .withWebsites([aMinimalWebsite().withDescription(TaalString.of('website description en updated')).build()])
                .build()],
        ['website description added',
            aFullConceptVersie()
                .withWebsites([aMinimalWebsite().withDescription(undefined).build()])
                .build(),
            aFullConceptVersie()
                .withWebsites([aMinimalWebsite().withDescription(TaalString.of('website description en')).build()])
                .build()],
        ['website description removed',
            aFullConceptVersie()
                .withWebsites([aMinimalWebsite().withDescription(TaalString.of('website description en')).build()])
                .build(),
            aFullConceptVersie()
                .withWebsites([aMinimalWebsite().withDescription(undefined).build()])
                .build()],
        ['website url updated',
            aFullConceptVersie()
                .withWebsites([aMinimalWebsite().withUrl('https://url1.com').build()])
                .build(),
            aFullConceptVersie()
                .withWebsites([aMinimalWebsite().withUrl('https://url2.com').build()])
                .build()],
        ['website url added',
            aFullConceptVersie()
                .withWebsites([aMinimalWebsite().withUrl(undefined).build()])
                .build(),
            aFullConceptVersie()
                .withWebsites([aMinimalWebsite().withUrl('https://url1.com').build()])
                .build()],
        ['website url removed',
            aFullConceptVersie()
                .withWebsites([aMinimalWebsite().withUrl('https://url1.com').build()])
                .build(),
            aFullConceptVersie()
                .withWebsites([aMinimalWebsite().withUrl(null).build()])
                .build()],
        ['website order changed',
            aFullConceptVersie()
                .withWebsites([aMinimalWebsite().withUrl('https://url1.com').build(), aMinimalWebsite().withUrl('https://url2.com').build()])
                .build(),
            aFullConceptVersie()
                .withWebsites([aMinimalWebsite().withUrl('https://url2.com').build(), aMinimalWebsite().withUrl('https://url1.com').build()])
                .build()],
        ['cost added',
            aFullConceptVersie()
                .withCosts([])
                .build(),
            aFullConceptVersie()
                .withCosts([aFullCost().build()])
                .build()],
        ['cost removed',
            aFullConceptVersie()
                .withCosts([aFullCost().build()])
                .build(),
            aFullConceptVersie()
                .withCosts([])
                .build()],
        ['cost title updated',
            aFullConceptVersie()
                .withCosts([aFullCost().withTitle(TaalString.of('cost title en')).build()])
                .build(),
            aFullConceptVersie()
                .withCosts([aFullCost().withTitle(TaalString.of('cost title en updated')).build()])
                .build()],
        ['cost title added',
            aFullConceptVersie()
                .withCosts([aFullCost().withTitle(undefined).build()])
                .build(),
            aFullConceptVersie()
                .withCosts([aFullCost().withTitle(TaalString.of('cost title en')).build()])
                .build()],
        ['cost title removed',
            aFullConceptVersie()
                .withCosts([aFullCost().withTitle(TaalString.of('cost title en')).build()])
                .build(),
            aFullConceptVersie()
                .withCosts([aFullCost().withTitle(undefined).build()])
                .build()],
        ['cost description updated',
            aFullConceptVersie()
                .withCosts([aFullCost().withDescription(TaalString.of('cost description en')).build()])
                .build(),
            aFullConceptVersie()
                .withCosts([aFullCost().withDescription(TaalString.of('cost description en updated')).build()])
                .build()],
        ['cost description added',
            aFullConceptVersie()
                .withCosts([aFullCost().withDescription(undefined).build()])
                .build(),
            aFullConceptVersie()
                .withCosts([aFullCost().withDescription(TaalString.of('cost description en')).build()])
                .build()],
        ['cost description removed',
            aFullConceptVersie()
                .withCosts([aFullCost().withDescription(TaalString.of('cost description en')).build()])
                .build(),
            aFullConceptVersie()
                .withCosts([aFullCost().withDescription(undefined).build()])
                .build()],
        ['cost order changed',
            aFullConceptVersie()
                .withCosts([aFullCost().withTitle(TaalString.of('cost title 1 en')).build(), aFullCost().withTitle(TaalString.of('cost title 2 en')).build()])
                .build(),
            aFullConceptVersie()
                .withCosts([aFullCost().withTitle(TaalString.of('cost title 2 en')).build(), aFullCost().withTitle(TaalString.of('cost title 1 en')).build()])
                .build()],
        ['financial advantage added',
            aFullConceptVersie()
                .withFinancialAdvantages([])
                .build(),
            aFullConceptVersie()
                .withFinancialAdvantages([aFullFinancialAdvantage().build()])
                .build()],
        ['financial advantage removed',
            aFullConceptVersie()
                .withFinancialAdvantages([aFullFinancialAdvantage().build()])
                .build(),
            aFullConceptVersie()
                .withFinancialAdvantages([])
                .build()],
        ['financial advantage title updated',
            aFullConceptVersie()
                .withFinancialAdvantages([aFullFinancialAdvantage().withTitle(TaalString.of('financial advantage title en')).build()])
                .build(),
            aFullConceptVersie()
                .withFinancialAdvantages([aFullFinancialAdvantage().withTitle(TaalString.of('financial advantage title en updated')).build()])
                .build()],
        ['financial advantage title added',
            aFullConceptVersie()
                .withFinancialAdvantages([aFullFinancialAdvantage().withTitle(undefined).build()])
                .build(),
            aFullConceptVersie()
                .withFinancialAdvantages([aFullFinancialAdvantage().withTitle(TaalString.of('financial advantage title en')).build()])
                .build()],
        ['financial advantage title removed',
            aFullConceptVersie()
                .withFinancialAdvantages([aFullFinancialAdvantage().withTitle(TaalString.of('financial advantage title en')).build()])
                .build(),
            aFullConceptVersie()
                .withFinancialAdvantages([aFullFinancialAdvantage().withTitle(undefined).build()])
                .build()],
        ['financial advantage description updated',
            aFullConceptVersie()
                .withFinancialAdvantages([aFullFinancialAdvantage().withDescription(TaalString.of('financial advantage description en')).build()])
                .build(),
            aFullConceptVersie()
                .withFinancialAdvantages([aFullFinancialAdvantage().withDescription(TaalString.of('financial advantage description en updated')).build()])
                .build()],
        ['financial advantage description added',
            aFullConceptVersie()
                .withFinancialAdvantages([aFullFinancialAdvantage().withDescription(undefined).build()])
                .build(),
            aFullConceptVersie()
                .withFinancialAdvantages([aFullFinancialAdvantage().withDescription(TaalString.of('financial advantage description en')).build()])
                .build()],
        ['financial advantage description removed',
            aFullConceptVersie()
                .withFinancialAdvantages([aFullFinancialAdvantage().withDescription(TaalString.of('financial advantage description en')).build()])
                .build(),
            aFullConceptVersie()
                .withFinancialAdvantages([aFullFinancialAdvantage().withDescription(undefined).build()])
                .build()],
        ['financial advantage order changed',
            aFullConceptVersie()
                .withFinancialAdvantages([aFullFinancialAdvantage().withTitle(TaalString.of('financial advantage title 1 en')).build(), aFullFinancialAdvantage().withTitle(TaalString.of('financial advantage title 2 en')).build()])
                .build(),
            aFullConceptVersie()
                .withFinancialAdvantages([aFullFinancialAdvantage().withTitle(TaalString.of('financial advantage title 2 en')).build(), aFullFinancialAdvantage().withTitle(TaalString.of('financial advantage title 1 en')).build()])
                .build()],

    ];

    for (const testCase of functionallyChangedTestCases) {
        test(`functionally changed when ${testCase[0]}`, () => {
            expect(ConceptVersie.isFunctionallyChanged(testCase[1], testCase[2])).toBeTruthy();
        });
    }


});