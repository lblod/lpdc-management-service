import {ConceptSnapshot} from "../../../src/core/domain/concept-snapshot";
import {uuid} from "../../../mu-helper";
import {aFullConceptSnapshot} from "./concept-snapshot-test-builder";
import {LanguageString} from "../../../src/core/domain/language-string";
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
import {buildConceptSnapshotIri} from "./iri-test-builder";

describe('constructing', () => {

    test('identifier is extracted from id', () => {
        const aUUID = uuid();
        const id = buildConceptSnapshotIri(aUUID);
        const aConceptSnapshot =
            aFullConceptSnapshot()
                .withId(id)
                .build();

        expect(aConceptSnapshot.identifier).toEqual(aUUID);
    });

    test('keywords are sorted', () => {
        const aConceptSnapshot =
            aFullConceptSnapshot()
                .withKeywords(new Set([
                    LanguageString.of('def'),
                    LanguageString.of('abc')
                ]))
                .build();

        expect(Array.from(aConceptSnapshot.keywords)).toEqual([
            LanguageString.of('abc'),
            LanguageString.of('def'),
        ]);
    });

    test('Undefined id throws error', () => {
        expect(() => aFullConceptSnapshot().withId(undefined).build()).toThrow(new Error('id should not be undefined'));
    });
    test('Blank id throws error', () => {
        expect(() => aFullConceptSnapshot().withId('   ').build()).toThrow(new Error('id should not be blank'));
    });

});

describe('is functionally changed', () => {

    type TestCase = [string, ConceptSnapshot, ConceptSnapshot];

    const aConceptSnapshotId = buildConceptSnapshotIri(uuid());
    const aConceptSnapshot =
        aFullConceptSnapshot().build();

    const functionallyUnchangedTestCases: TestCase[]
        = [
        ['exactly the same data',
            aConceptSnapshot,
            aConceptSnapshot],
        ['equal data',
            aFullConceptSnapshot()
                .withId(aConceptSnapshotId)
                .build(),
            aFullConceptSnapshot()
                .withId(aConceptSnapshotId)
                .build()],
        ['start date the same except formatting',
            aFullConceptSnapshot()
                .withStartDate(FormatPreservingDate.of('2027-09-16 00:00:00Z'))
                .build(),
            aFullConceptSnapshot()
                .withStartDate(FormatPreservingDate.of('2027-09-16 00:00:00.000Z'))
                .build()],
        ['end date the same except formatting',
            aFullConceptSnapshot()
                .withEndDate(FormatPreservingDate.of('2027-09-16 00:00:00Z'))
                .build(),
            aFullConceptSnapshot()
                .withEndDate(FormatPreservingDate.of('2027-09-16 00:00:00.000Z'))
                .build()],];

    for (const testCase of functionallyUnchangedTestCases) {
        test(`not functionally changed when ${testCase[0]}`, () => {
            expect(ConceptSnapshot.isFunctionallyChanged(testCase[1], testCase[2])).toBeFalsy();
        });
    }

    const functionallyChangedTestCases: TestCase[]
        = [
        ['title changed',
            aFullConceptSnapshot()
                .withTitle(LanguageString.of("text-en"))
                .build(),
            aFullConceptSnapshot()
                .withTitle(LanguageString.of("text-en-changed"))
                .build()],
        ['description changed',
            aFullConceptSnapshot()
                .withDescription(LanguageString.of("text-en"))
                .build(),
            aFullConceptSnapshot()
                .withDescription(LanguageString.of("text-en-changed"))
                .build()],
        ['additional description changed',
            aFullConceptSnapshot()
                .withAdditionalDescription(LanguageString.of("text-en"))
                .build(),
            aFullConceptSnapshot()
                .withAdditionalDescription(LanguageString.of("text-en-changed"))
                .build()],
        ['exception changed',
            aFullConceptSnapshot()
                .withException(LanguageString.of("text-en"))
                .build(),
            aFullConceptSnapshot()
                .withException(LanguageString.of("text-en-changed"))
                .build()],
        ['regulation changed',
            aFullConceptSnapshot()
                .withRegulation(LanguageString.of("text-en"))
                .build(),
            aFullConceptSnapshot()
                .withRegulation(LanguageString.of("text-en-changed"))
                .build()],
        ['start date changed',
            aFullConceptSnapshot()
                .withStartDate(FormatPreservingDate.of('2023-11-10 00:00:00.000Z'))
                .build(),
            aFullConceptSnapshot()
                .withStartDate(FormatPreservingDate.of('2023-11-09 00:00:00.000Z'))
                .build()],
        ['start date appeared',
            aFullConceptSnapshot()
                .withStartDate(undefined)
                .build(),
            aFullConceptSnapshot()
                .withStartDate(FormatPreservingDate.of('2023-11-09 00:00:00.000Z'))
                .build()],
        ['start date disappeared',
            aFullConceptSnapshot()
                .withStartDate(FormatPreservingDate.of('2023-11-09 00:00:00.000Z'))
                .build(),
            aFullConceptSnapshot()
                .withStartDate(undefined)
                .build()],
        ['end date changed',
            aFullConceptSnapshot()
                .withEndDate(FormatPreservingDate.of('2023-11-10 00:00:00.000Z'))
                .build(),
            aFullConceptSnapshot()
                .withEndDate(FormatPreservingDate.of('2023-11-09 00:00:00.000Z'))
                .build()],
        ['end date appeared',
            aFullConceptSnapshot()
                .withEndDate(undefined)
                .build(),
            aFullConceptSnapshot()
                .withEndDate(FormatPreservingDate.of('2023-11-09 00:00:00.000Z'))
                .build()],
        ['end date disappeared',
            aFullConceptSnapshot()
                .withEndDate(FormatPreservingDate.of('2023-11-09 00:00:00.000Z'))
                .build(),
            aFullConceptSnapshot()
                .withEndDate(undefined)
                .build()],
        ['type changed',
            aFullConceptSnapshot()
                .withType(ProductType.FINANCIEELVOORDEEL)
                .build(),
            aFullConceptSnapshot()
                .withType(ProductType.BEWIJS)
                .build()],
        ['type appeared',
            aFullConceptSnapshot()
                .withType(undefined)
                .build(),
            aFullConceptSnapshot()
                .withType(ProductType.FINANCIEELVOORDEEL)
                .build()],
        ['type disappeared',
            aFullConceptSnapshot()
                .withType(ProductType.FINANCIEELVOORDEEL)
                .build(),
            aFullConceptSnapshot()
                .withType(undefined)
                .build()],
        ['target audience updated',
            aFullConceptSnapshot()
                .withTargetAudiences(new Set([TargetAudienceType.BURGER]))
                .build(),
            aFullConceptSnapshot()
                .withTargetAudiences(new Set([TargetAudienceType.VLAAMSEOVERHEID]))
                .build()],
        ['target audience added',
            aFullConceptSnapshot()
                .withTargetAudiences(new Set([TargetAudienceType.BURGER]))
                .build(),
            aFullConceptSnapshot()
                .withTargetAudiences(new Set([TargetAudienceType.VLAAMSEOVERHEID, TargetAudienceType.BURGER]))
                .build()],
        ['target audience removed',
            aFullConceptSnapshot()
                .withTargetAudiences(new Set([TargetAudienceType.VLAAMSEOVERHEID, TargetAudienceType.BURGER]))
                .build(),
            aFullConceptSnapshot()
                .withTargetAudiences(new Set([TargetAudienceType.BURGER]))
                .build()],
        ['theme updated',
            aFullConceptSnapshot()
                .withThemes(new Set([ThemeType.WELZIJNGEZONDHEID]))
                .build(),
            aFullConceptSnapshot()
                .withThemes(new Set([ThemeType.CULTUURSPORTVRIJETIJD]))
                .build()],
        ['theme added',
            aFullConceptSnapshot()
                .withThemes(new Set([ThemeType.WELZIJNGEZONDHEID]))
                .build(),
            aFullConceptSnapshot()
                .withThemes(new Set([ThemeType.MOBILITEITOPENBAREWERKEN, ThemeType.WELZIJNGEZONDHEID]))
                .build()],
        ['theme removed',
            aFullConceptSnapshot()
                .withThemes(new Set([ThemeType.MOBILITEITOPENBAREWERKEN, ThemeType.WELZIJNGEZONDHEID]))
                .build(),
            aFullConceptSnapshot()
                .withThemes(new Set([ThemeType.WELZIJNGEZONDHEID]))
                .build()],
        ['competent Authority Level updated',
            aFullConceptSnapshot()
                .withCompetentAuthorityLevels(new Set([CompetentAuthorityLevelType.EUROPEES]))
                .build(),
            aFullConceptSnapshot()
                .withCompetentAuthorityLevels(new Set([CompetentAuthorityLevelType.LOKAAL]))
                .build()],
        ['competent Authority Level added',
            aFullConceptSnapshot()
                .withCompetentAuthorityLevels(new Set([CompetentAuthorityLevelType.LOKAAL]))
                .build(),
            aFullConceptSnapshot()
                .withCompetentAuthorityLevels(new Set([CompetentAuthorityLevelType.PROVINCIAAL, CompetentAuthorityLevelType.LOKAAL]))
                .build()],
        ['competent Authority Level removed',
            aFullConceptSnapshot()
                .withCompetentAuthorityLevels(new Set([CompetentAuthorityLevelType.PROVINCIAAL, CompetentAuthorityLevelType.FEDERAAL]))
                .build(),
            aFullConceptSnapshot()
                .withCompetentAuthorityLevels(new Set([CompetentAuthorityLevelType.FEDERAAL]))
                .build()],
        ['competent authorities updated',
            aFullConceptSnapshot()
                .withCompetentAuthorities(new Set([BestuurseenheidTestBuilder.BORGLOON_IRI]))
                .build(),
            aFullConceptSnapshot()
                .withCompetentAuthorities(new Set([BestuurseenheidTestBuilder.HOUTHALEN_HELCHTEREN_IRI]))
                .build()],
        ['competent authorities added',
            aFullConceptSnapshot()
                .withCompetentAuthorities(new Set([BestuurseenheidTestBuilder.BORGLOON_IRI]))
                .build(),
            aFullConceptSnapshot()
                .withCompetentAuthorities(new Set([BestuurseenheidTestBuilder.HOUTHALEN_HELCHTEREN_IRI, BestuurseenheidTestBuilder.BORGLOON_IRI]))
                .build()],
        ['competent authorities removed',
            aFullConceptSnapshot()
                .withCompetentAuthorities(new Set([BestuurseenheidTestBuilder.HOUTHALEN_HELCHTEREN_IRI, BestuurseenheidTestBuilder.BORGLOON_IRI]))
                .build(),
            aFullConceptSnapshot()
                .withCompetentAuthorities(new Set([BestuurseenheidTestBuilder.BORGLOON_IRI]))
                .build()],
        ['executing Authority Level updated',
            aFullConceptSnapshot()
                .withExecutingAuthorityLevels(new Set([ExecutingAuthorityLevelType.EUROPEES]))
                .build(),
            aFullConceptSnapshot()
                .withExecutingAuthorityLevels(new Set([ExecutingAuthorityLevelType.LOKAAL]))
                .build()],
        ['executing Authority Level added',
            aFullConceptSnapshot()
                .withExecutingAuthorityLevels(new Set([ExecutingAuthorityLevelType.LOKAAL]))
                .build(),
            aFullConceptSnapshot()
                .withExecutingAuthorityLevels(new Set([ExecutingAuthorityLevelType.PROVINCIAAL, ExecutingAuthorityLevelType.LOKAAL]))
                .build()],
        ['executing Authority Level removed',
            aFullConceptSnapshot()
                .withExecutingAuthorityLevels(new Set([ExecutingAuthorityLevelType.PROVINCIAAL, ExecutingAuthorityLevelType.DERDEN]))
                .build(),
            aFullConceptSnapshot()
                .withExecutingAuthorityLevels(new Set([ExecutingAuthorityLevelType.DERDEN]))
                .build()],
        ['executing authorities updated',
            aFullConceptSnapshot()
                .withExecutingAuthorities(new Set([BestuurseenheidTestBuilder.OUD_HEVERLEE_IRI]))
                .build(),
            aFullConceptSnapshot()
                .withExecutingAuthorities(new Set([BestuurseenheidTestBuilder.HOUTHALEN_HELCHTEREN_IRI]))
                .build()],
        ['executing authorities added',
            aFullConceptSnapshot()
                .withExecutingAuthorities(new Set([BestuurseenheidTestBuilder.HOUTHALEN_HELCHTEREN_IRI]))
                .build(),
            aFullConceptSnapshot()
                .withExecutingAuthorities(new Set([BestuurseenheidTestBuilder.ASSENEDE_IRI, BestuurseenheidTestBuilder.HOUTHALEN_HELCHTEREN_IRI]))
                .build()],
        ['executing authorities removed',
            aFullConceptSnapshot()
                .withExecutingAuthorities(new Set([BestuurseenheidTestBuilder.ASSENEDE_IRI, BestuurseenheidTestBuilder.OUD_HEVERLEE_IRI]))
                .build(),
            aFullConceptSnapshot()
                .withExecutingAuthorities(new Set([BestuurseenheidTestBuilder.OUD_HEVERLEE_IRI]))
                .build()],
        ['publication medium updated',
            aFullConceptSnapshot()
                .withPublicationMedia(new Set([PublicationMediumType.RECHTENVERKENNER]))
                .build(),
            aFullConceptSnapshot()
                .withPublicationMedia(new Set([PublicationMediumType.YOUREUROPE]))
                .build()],
        ['publication medium added',
            aFullConceptSnapshot()
                .withPublicationMedia(new Set([PublicationMediumType.RECHTENVERKENNER]))
                .build(),
            aFullConceptSnapshot()
                .withPublicationMedia(new Set([PublicationMediumType.YOUREUROPE, PublicationMediumType.RECHTENVERKENNER]))
                .build()],
        ['publication medium removed',
            aFullConceptSnapshot()
                .withPublicationMedia(new Set([PublicationMediumType.RECHTENVERKENNER, PublicationMediumType.YOUREUROPE]))
                .build(),
            aFullConceptSnapshot()
                .withPublicationMedia(new Set([PublicationMediumType.RECHTENVERKENNER]))
                .build()],
        ['your europe category updated',
            aFullConceptSnapshot()
                .withYourEuropeCategories(new Set([YourEuropeCategoryType.GOEDERENRECYCLAGE]))
                .build(),
            aFullConceptSnapshot()
                .withYourEuropeCategories(new Set([YourEuropeCategoryType.BEDRIJFINTELLECTUELEEIGENDOMSRECHTEN]))
                .build()],
        ['your europe category added',
            aFullConceptSnapshot()
                .withYourEuropeCategories(new Set([YourEuropeCategoryType.BEDRIJFKREDIETVERZEKERING]))
                .build(),
            aFullConceptSnapshot()
                .withYourEuropeCategories(new Set([YourEuropeCategoryType.BEDRIJFKREDIETVERZEKERING, YourEuropeCategoryType.GEZONDHEIDSZORG]))
                .build()],
        ['your europe category removed',
            aFullConceptSnapshot()
                .withYourEuropeCategories(new Set([YourEuropeCategoryType.PROCEDUREVERHUIZINGADRESWIJZIGING, YourEuropeCategoryType.ONDERWIJSOFSTAGESTAGE]))
                .build(),
            aFullConceptSnapshot()
                .withYourEuropeCategories(new Set([YourEuropeCategoryType.PROCEDUREVERHUIZINGADRESWIJZIGING]))
                .build()],
        ['keyword updated - en',
            aFullConceptSnapshot()
                .withKeywords(new Set([LanguageString.of('abc')]))
                .build(),
            aFullConceptSnapshot()
                .withKeywords(new Set([LanguageString.of('def')]))
                .build()],
        ['keyword updated - nl',
            aFullConceptSnapshot()
                .withKeywords(new Set([LanguageString.of(undefined, 'abc')]))
                .build(),
            aFullConceptSnapshot()
                .withKeywords(new Set([LanguageString.of(undefined, 'def')]))
                .build()],
        ['keyword updated - en became nl',
            aFullConceptSnapshot()
                .withKeywords(new Set([LanguageString.of('abc')]))
                .build(),
            aFullConceptSnapshot()
                .withKeywords(new Set([LanguageString.of(undefined, 'abc')]))
                .build()],
        ['keyword added',
            aFullConceptSnapshot()
                .withKeywords(new Set([LanguageString.of('abc')]))
                .build(),
            aFullConceptSnapshot()
                .withKeywords(new Set([LanguageString.of('abc'), LanguageString.of('def')]))
                .build()],
        ['keyword removed',
            aFullConceptSnapshot()
                .withKeywords(new Set([LanguageString.of('abc'), LanguageString.of('def')]))
                .build(),
            aFullConceptSnapshot()
                .withKeywords(new Set([LanguageString.of('abc')]))
                .build()],
        ['requirement added',
            aFullConceptSnapshot()
                .withRequirements([])
                .build(),
            aFullConceptSnapshot()
                .withRequirements([aMinimalRequirement().build()])
                .build()],
        ['requirement removed',
            aFullConceptSnapshot()
                .withRequirements([aMinimalRequirement().build()])
                .build(),
            aFullConceptSnapshot()
                .withRequirements([])
                .build()],
        ['requirement order changed',
            aFullConceptSnapshot()
                .withRequirements([aMinimalRequirement().withTitle(LanguageString.of('requirement-title-en-1')).build(),
                    aMinimalRequirement().withTitle(LanguageString.of('requirement-title-en-2')).build()])
                .build(),
            aFullConceptSnapshot()
                .withRequirements([aMinimalRequirement().withTitle(LanguageString.of('requirement-title-en-2')).build(),
                    aMinimalRequirement().withTitle(LanguageString.of('requirement-title-en-1')).build()])
                .build()],
        ['requirement title updated : en changed',
            aFullConceptSnapshot()
                .withRequirements([aMinimalRequirement().withTitle(LanguageString.of('requirement-title-en')).build()])
                .build(),
            aFullConceptSnapshot()
                .withRequirements([aMinimalRequirement().withTitle(LanguageString.of('requirement-title-en - updated')).build()])
                .build()],
        ['requirement title updated: nl added',
            aFullConceptSnapshot()
                .withRequirements([aMinimalRequirement().withTitle(LanguageString.of('requirement-title-en')).build()])
                .build(),
            aFullConceptSnapshot()
                .withRequirements([aMinimalRequirement().withTitle(LanguageString.of('requirement-title-en', 'requirement-title-nl')).build()])
                .build()],
        ['requirement title updated: nl removed',
            aFullConceptSnapshot()
                .withRequirements([aMinimalRequirement().withTitle(LanguageString.of('requirement-title-en', 'requirement-title-nl')).build()])
                .build(),
            aFullConceptSnapshot()
                .withRequirements([aMinimalRequirement().withTitle(LanguageString.of('requirement-title-en')).build()])
                .build()],
        ['requirement title updated : nl changed',
            aFullConceptSnapshot()
                .withRequirements([aMinimalRequirement().withTitle(LanguageString.of('requirement-title-en', 'requirement-title-nl')).build()])
                .build(),
            aFullConceptSnapshot()
                .withRequirements([aMinimalRequirement().withTitle(LanguageString.of('requirement-title-en', 'requirement-title-changed')).build()])
                .build()],
        ['requirement description updated : en changed',
            aFullConceptSnapshot()
                .withRequirements([aMinimalRequirement().withDescription(LanguageString.of('requirement-description-en')).build()])
                .build(),
            aFullConceptSnapshot()
                .withRequirements([aMinimalRequirement().withDescription(LanguageString.of('requirement-description-en - updated')).build()])
                .build()],
        ['requirement description updated: nl added',
            aFullConceptSnapshot()
                .withRequirements([aMinimalRequirement().withDescription(LanguageString.of('requirement-description-en')).build()])
                .build(),
            aFullConceptSnapshot()
                .withRequirements([aMinimalRequirement().withDescription(LanguageString.of('requirement-description-en', 'requirement-description-nl')).build()])
                .build()],
        ['requirement description updated: nl removed',
            aFullConceptSnapshot()
                .withRequirements([aMinimalRequirement().withDescription(LanguageString.of('requirement-description-en', 'requirement-description-nl')).build()])
                .build(),
            aFullConceptSnapshot()
                .withRequirements([aMinimalRequirement().withDescription(LanguageString.of('requirement-description-en')).build()])
                .build()],
        ['requirement description updated : nl changed',
            aFullConceptSnapshot()
                .withRequirements([aMinimalRequirement().withDescription(LanguageString.of('requirement-description-en', 'requirement-description-nl')).build()])
                .build(),
            aFullConceptSnapshot()
                .withRequirements([aMinimalRequirement().withDescription(LanguageString.of('requirement-description-en', 'requirement-description-changed')).build()])
                .build()],
        ['requirement > evidence : added',
            aFullConceptSnapshot()
                .withRequirements([aMinimalRequirement().withEvidence(undefined).build()])
                .build(),
            aFullConceptSnapshot()
                .withRequirements([aMinimalRequirement().withEvidence(aFullEvidence().build()).build()])
                .build()],
        ['requirement > evidence : removed',
            aFullConceptSnapshot()
                .withRequirements([aMinimalRequirement().withEvidence(aFullEvidence().build()).build()])
                .build(),
            aFullConceptSnapshot()
                .withRequirements([aMinimalRequirement().withEvidence(undefined).build()])
                .build()],
        ['requirement > evidence title updated',
            aFullConceptSnapshot()
                .withRequirements([aMinimalRequirement().withEvidence(aMinimalEvidence().withTitle(LanguageString.of('evidence title en')).build()).build()])
                .build(),
            aFullConceptSnapshot()
                .withRequirements([aMinimalRequirement().withEvidence(aMinimalEvidence().withTitle(LanguageString.of('evidence title en updated')).build()).build()])
                .build()],
        ['requirement > evidence description updated',
            aFullConceptSnapshot()
                .withRequirements([aMinimalRequirement().withEvidence(aMinimalEvidence().withDescription(LanguageString.of('evidence description en')).build()).build()])
                .build(),
            aFullConceptSnapshot()
                .withRequirements([aMinimalRequirement().withEvidence(aMinimalEvidence().withDescription(LanguageString.of('evidence description en updated')).build()).build()])
                .build()],
        ['procedure added',
            aFullConceptSnapshot()
                .withProcedures([])
                .build(),
            aFullConceptSnapshot()
                .withProcedures([aFullProcedure().build()])
                .build()],
        ['procedure removed',
            aFullConceptSnapshot()
                .withProcedures([aFullProcedure().build()])
                .build(),
            aFullConceptSnapshot()
                .withProcedures([])
                .build()],
        ['procedure order changed',
            aFullConceptSnapshot()
                .withProcedures([aFullProcedure().withTitle(LanguageString.of('procedure title en')).build(),
                    aFullProcedure().withTitle(LanguageString.of('procedure title en another')).build()])
                .build(),
            aFullConceptSnapshot()
                .withProcedures([aFullProcedure().withTitle(LanguageString.of('procedure title en another')).build(),
                    aFullProcedure().withTitle(LanguageString.of('procedure title en')).build()])
                .build()],
        ['procedure title updated',
            aFullConceptSnapshot()
                .withProcedures([aFullProcedure().withTitle(LanguageString.of('procedure title en')).build()])
                .build(),
            aFullConceptSnapshot()
                .withProcedures([aFullProcedure().withTitle(LanguageString.of('procedure title en updated')).build()])
                .build()],
        ['procedure title added',
            aFullConceptSnapshot()
                .withProcedures([aFullProcedure().withTitle(undefined).build()])
                .build(),
            aFullConceptSnapshot()
                .withProcedures([aFullProcedure().withTitle(LanguageString.of('procedure title en updated')).build()])
                .build()],
        ['procedure title removed',
            aFullConceptSnapshot()
                .withProcedures([aFullProcedure().withTitle(LanguageString.of('procedure title en updated')).build()])
                .build(),
            aFullConceptSnapshot()
                .withProcedures([aFullProcedure().withTitle(undefined).build()])
                .build()],
        ['procedure description updated',
            aFullConceptSnapshot()
                .withProcedures([aFullProcedure().withDescription(LanguageString.of('procedure description en')).build()])
                .build(),
            aFullConceptSnapshot()
                .withProcedures([aFullProcedure().withDescription(LanguageString.of('procedure description en updated')).build()])
                .build()],
        ['procedure description added',
            aFullConceptSnapshot()
                .withProcedures([aFullProcedure().withDescription(undefined).build()])
                .build(),
            aFullConceptSnapshot()
                .withProcedures([aFullProcedure().withDescription(LanguageString.of('procedure description en updated')).build()])
                .build()],
        ['procedure description removed',
            aFullConceptSnapshot()
                .withProcedures([aFullProcedure().withDescription(LanguageString.of('procedure description en')).build()])
                .build(),
            aFullConceptSnapshot()
                .withProcedures([aFullProcedure().withDescription(undefined).build()])
                .build()],
        ['procedure website title updated',
            aFullConceptSnapshot()
                .withProcedures([aFullProcedure().withWebsites([aMinimalWebsite().withTitle(LanguageString.of('procedure website title en')).build()]).build()])
                .build(),
            aFullConceptSnapshot()
                .withProcedures([aFullProcedure().withWebsites([aMinimalWebsite().withTitle(LanguageString.of('procedure website title en updated')).build()]).build()])
                .build()],
        ['procedure website title added',
            aFullConceptSnapshot()
                .withProcedures([aFullProcedure().withWebsites([aMinimalWebsite().withTitle(undefined).build()]).build()])
                .build(),
            aFullConceptSnapshot()
                .withProcedures([aFullProcedure().withWebsites([aMinimalWebsite().withTitle(LanguageString.of('procedure website title en')).build()]).build()])
                .build()],
        ['procedure website title removed',
            aFullConceptSnapshot()
                .withProcedures([aFullProcedure().withWebsites([aMinimalWebsite().withTitle(LanguageString.of('procedure website title en')).build()]).build()])
                .build(),
            aFullConceptSnapshot()
                .withProcedures([aFullProcedure().withWebsites([aMinimalWebsite().withTitle(undefined).build()]).build()])
                .build()],
        ['procedure website description updated',
            aFullConceptSnapshot()
                .withProcedures([aFullProcedure().withWebsites([aMinimalWebsite().withDescription(LanguageString.of('procedure website description en')).build()]).build()])
                .build(),
            aFullConceptSnapshot()
                .withProcedures([aFullProcedure().withWebsites([aMinimalWebsite().withDescription(LanguageString.of('procedure website description en updated')).build()]).build()])
                .build()],
        ['procedure website description added',
            aFullConceptSnapshot()
                .withProcedures([aFullProcedure().withWebsites([aMinimalWebsite().withDescription(undefined).build()]).build()])
                .build(),
            aFullConceptSnapshot()
                .withProcedures([aFullProcedure().withWebsites([aMinimalWebsite().withDescription(LanguageString.of('procedure website description en')).build()]).build()])
                .build()],
        ['procedure website description removed',
            aFullConceptSnapshot()
                .withProcedures([aFullProcedure().withWebsites([aMinimalWebsite().withDescription(LanguageString.of('procedure website description en')).build()]).build()])
                .build(),
            aFullConceptSnapshot()
                .withProcedures([aFullProcedure().withWebsites([aMinimalWebsite().withDescription(undefined).build()]).build()])
                .build()],
        ['procedure website url updated',
            aFullConceptSnapshot()
                .withProcedures([aFullProcedure().withWebsites([aMinimalWebsite().withUrl('https://url1.com').build()]).build()])
                .build(),
            aFullConceptSnapshot()
                .withProcedures([aFullProcedure().withWebsites([aMinimalWebsite().withUrl('https://url2.com').build()]).build()])
                .build()],
        ['procedure website added',
            aFullConceptSnapshot()
                .withProcedures([aFullProcedure().withWebsites([]).build()])
                .build(),
            aFullConceptSnapshot()
                .withProcedures([aFullProcedure().withWebsites([aFullWebsite().build()]).build()])
                .build()],
        ['procedure website removed',
            aFullConceptSnapshot()
                .withProcedures([aFullProcedure().withWebsites([aFullWebsite().build()]).build()])
                .build(),
            aFullConceptSnapshot()
                .withProcedures([aFullProcedure().withWebsites([]).build()])
                .build()],
        ['procedure website order changed',
            aFullConceptSnapshot()
                .withProcedures([aFullProcedure().withWebsites([aMinimalWebsite().withUrl('https://url1.com').build(), aMinimalWebsite().withUrl('https://url2.com').build()]).build()])
                .build(),
            aFullConceptSnapshot()
                .withProcedures([aFullProcedure().withWebsites([aMinimalWebsite().withUrl('https://url2.com').build(), aMinimalWebsite().withUrl('https://url1.com').build()]).build()])
                .build()],
        ['website added',
            aFullConceptSnapshot()
                .withWebsites([])
                .build(),
            aFullConceptSnapshot()
                .withWebsites([aFullWebsite().build()])
                .build()],
        ['website removed',
            aFullConceptSnapshot()
                .withWebsites([aFullWebsite().build()])
                .build(),
            aFullConceptSnapshot()
                .withWebsites([])
                .build()],
        ['website title updated',
            aFullConceptSnapshot()
                .withWebsites([aMinimalWebsite().withTitle(LanguageString.of('website title en')).build()])
                .build(),
            aFullConceptSnapshot()
                .withWebsites([aMinimalWebsite().withTitle(LanguageString.of('website title en updated')).build()])
                .build()],
        ['website title added',
            aFullConceptSnapshot()
                .withWebsites([aMinimalWebsite().withTitle(undefined).build()])
                .build(),
            aFullConceptSnapshot()
                .withWebsites([aMinimalWebsite().withTitle(LanguageString.of('website title en')).build()])
                .build()],
        ['website title removed',
            aFullConceptSnapshot()
                .withWebsites([aMinimalWebsite().withTitle(LanguageString.of('website title en')).build()])
                .build(),
            aFullConceptSnapshot()
                .withWebsites([aMinimalWebsite().withTitle(undefined).build()])
                .build()],
        ['website description updated',
            aFullConceptSnapshot()
                .withWebsites([aMinimalWebsite().withDescription(LanguageString.of('website description en')).build()])
                .build(),
            aFullConceptSnapshot()
                .withWebsites([aMinimalWebsite().withDescription(LanguageString.of('website description en updated')).build()])
                .build()],
        ['website description added',
            aFullConceptSnapshot()
                .withWebsites([aMinimalWebsite().withDescription(undefined).build()])
                .build(),
            aFullConceptSnapshot()
                .withWebsites([aMinimalWebsite().withDescription(LanguageString.of('website description en')).build()])
                .build()],
        ['website description removed',
            aFullConceptSnapshot()
                .withWebsites([aMinimalWebsite().withDescription(LanguageString.of('website description en')).build()])
                .build(),
            aFullConceptSnapshot()
                .withWebsites([aMinimalWebsite().withDescription(undefined).build()])
                .build()],
        ['website url updated',
            aFullConceptSnapshot()
                .withWebsites([aMinimalWebsite().withUrl('https://url1.com').build()])
                .build(),
            aFullConceptSnapshot()
                .withWebsites([aMinimalWebsite().withUrl('https://url2.com').build()])
                .build()],
        ['website order changed',
            aFullConceptSnapshot()
                .withWebsites([aMinimalWebsite().withUrl('https://url1.com').build(), aMinimalWebsite().withUrl('https://url2.com').build()])
                .build(),
            aFullConceptSnapshot()
                .withWebsites([aMinimalWebsite().withUrl('https://url2.com').build(), aMinimalWebsite().withUrl('https://url1.com').build()])
                .build()],
        ['cost added',
            aFullConceptSnapshot()
                .withCosts([])
                .build(),
            aFullConceptSnapshot()
                .withCosts([aFullCost().build()])
                .build()],
        ['cost removed',
            aFullConceptSnapshot()
                .withCosts([aFullCost().build()])
                .build(),
            aFullConceptSnapshot()
                .withCosts([])
                .build()],
        ['cost title updated',
            aFullConceptSnapshot()
                .withCosts([aFullCost().withTitle(LanguageString.of('cost title en')).build()])
                .build(),
            aFullConceptSnapshot()
                .withCosts([aFullCost().withTitle(LanguageString.of('cost title en updated')).build()])
                .build()],
        ['cost title added',
            aFullConceptSnapshot()
                .withCosts([aFullCost().withTitle(undefined).build()])
                .build(),
            aFullConceptSnapshot()
                .withCosts([aFullCost().withTitle(LanguageString.of('cost title en')).build()])
                .build()],
        ['cost title removed',
            aFullConceptSnapshot()
                .withCosts([aFullCost().withTitle(LanguageString.of('cost title en')).build()])
                .build(),
            aFullConceptSnapshot()
                .withCosts([aFullCost().withTitle(undefined).build()])
                .build()],
        ['cost description updated',
            aFullConceptSnapshot()
                .withCosts([aFullCost().withDescription(LanguageString.of('cost description en')).build()])
                .build(),
            aFullConceptSnapshot()
                .withCosts([aFullCost().withDescription(LanguageString.of('cost description en updated')).build()])
                .build()],
        ['cost description added',
            aFullConceptSnapshot()
                .withCosts([aFullCost().withDescription(undefined).build()])
                .build(),
            aFullConceptSnapshot()
                .withCosts([aFullCost().withDescription(LanguageString.of('cost description en')).build()])
                .build()],
        ['cost description removed',
            aFullConceptSnapshot()
                .withCosts([aFullCost().withDescription(LanguageString.of('cost description en')).build()])
                .build(),
            aFullConceptSnapshot()
                .withCosts([aFullCost().withDescription(undefined).build()])
                .build()],
        ['cost order changed',
            aFullConceptSnapshot()
                .withCosts([aFullCost().withTitle(LanguageString.of('cost title 1 en')).build(), aFullCost().withTitle(LanguageString.of('cost title 2 en')).build()])
                .build(),
            aFullConceptSnapshot()
                .withCosts([aFullCost().withTitle(LanguageString.of('cost title 2 en')).build(), aFullCost().withTitle(LanguageString.of('cost title 1 en')).build()])
                .build()],
        ['financial advantage added',
            aFullConceptSnapshot()
                .withFinancialAdvantages([])
                .build(),
            aFullConceptSnapshot()
                .withFinancialAdvantages([aFullFinancialAdvantage().build()])
                .build()],
        ['financial advantage removed',
            aFullConceptSnapshot()
                .withFinancialAdvantages([aFullFinancialAdvantage().build()])
                .build(),
            aFullConceptSnapshot()
                .withFinancialAdvantages([])
                .build()],
        ['financial advantage title updated',
            aFullConceptSnapshot()
                .withFinancialAdvantages([aFullFinancialAdvantage().withTitle(LanguageString.of('financial advantage title en')).build()])
                .build(),
            aFullConceptSnapshot()
                .withFinancialAdvantages([aFullFinancialAdvantage().withTitle(LanguageString.of('financial advantage title en updated')).build()])
                .build()],
        ['financial advantage title added',
            aFullConceptSnapshot()
                .withFinancialAdvantages([aFullFinancialAdvantage().withTitle(undefined).build()])
                .build(),
            aFullConceptSnapshot()
                .withFinancialAdvantages([aFullFinancialAdvantage().withTitle(LanguageString.of('financial advantage title en')).build()])
                .build()],
        ['financial advantage title removed',
            aFullConceptSnapshot()
                .withFinancialAdvantages([aFullFinancialAdvantage().withTitle(LanguageString.of('financial advantage title en')).build()])
                .build(),
            aFullConceptSnapshot()
                .withFinancialAdvantages([aFullFinancialAdvantage().withTitle(undefined).build()])
                .build()],
        ['financial advantage description updated',
            aFullConceptSnapshot()
                .withFinancialAdvantages([aFullFinancialAdvantage().withDescription(LanguageString.of('financial advantage description en')).build()])
                .build(),
            aFullConceptSnapshot()
                .withFinancialAdvantages([aFullFinancialAdvantage().withDescription(LanguageString.of('financial advantage description en updated')).build()])
                .build()],
        ['financial advantage description added',
            aFullConceptSnapshot()
                .withFinancialAdvantages([aFullFinancialAdvantage().withDescription(undefined).build()])
                .build(),
            aFullConceptSnapshot()
                .withFinancialAdvantages([aFullFinancialAdvantage().withDescription(LanguageString.of('financial advantage description en')).build()])
                .build()],
        ['financial advantage description removed',
            aFullConceptSnapshot()
                .withFinancialAdvantages([aFullFinancialAdvantage().withDescription(LanguageString.of('financial advantage description en')).build()])
                .build(),
            aFullConceptSnapshot()
                .withFinancialAdvantages([aFullFinancialAdvantage().withDescription(undefined).build()])
                .build()],
        ['financial advantage order changed',
            aFullConceptSnapshot()
                .withFinancialAdvantages([aFullFinancialAdvantage().withTitle(LanguageString.of('financial advantage title 1 en')).build(), aFullFinancialAdvantage().withTitle(LanguageString.of('financial advantage title 2 en')).build()])
                .build(),
            aFullConceptSnapshot()
                .withFinancialAdvantages([aFullFinancialAdvantage().withTitle(LanguageString.of('financial advantage title 2 en')).build(), aFullFinancialAdvantage().withTitle(LanguageString.of('financial advantage title 1 en')).build()])
                .build()],

    ];

    for (const testCase of functionallyChangedTestCases) {
        test(`functionally changed when ${testCase[0]}`, () => {
            expect(ConceptSnapshot.isFunctionallyChanged(testCase[1], testCase[2])).toBeTruthy();
        });
    }


});