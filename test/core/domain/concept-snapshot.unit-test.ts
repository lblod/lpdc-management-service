import {ConceptSnapshot} from "../../../src/core/domain/concept-snapshot";
import {uuid} from "../../../mu-helper";
import {aFullConceptSnapshot} from "./concept-snapshot-test-builder";
import {LanguageString} from "../../../src/core/domain/language-string";
import {BestuurseenheidTestBuilder} from "./bestuurseenheid-test-builder";
import {
    aFullRequirement,
    aMinimalRequirementForConceptSnapshot,
    RequirementTestBuilder
} from "./requirement-test-builder";
import {aFullEvidence, aMinimalEvidenceForConceptSnapshot, EvidenceTestBuilder} from "./evidence-test-builder";
import {aFullProcedure, ProcedureTestBuilder} from "./procedure-test-builder";
import {aFullWebsite, aMinimalWebsiteForConceptSnapshot, WebsiteTestBuilder} from "./website-test-builder";
import {aFullCost, CostTestBuilder} from "./cost-test-builder";
import {aFullFinancialAdvantage, FinancialAdvantageTestBuilder} from "./financial-advantage-test-builder";
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
import {buildCodexVlaanderenIri, buildConceptSnapshotIri} from "./iri-test-builder";
import {Cost} from "../../../src/core/domain/cost";
import {aMinimalLanguageString} from "./language-string-test-builder";
import {FinancialAdvantage} from "../../../src/core/domain/financial-advantage";
import {Requirement} from "../../../src/core/domain/requirement";
import {Evidence} from "../../../src/core/domain/evidence";
import {Procedure} from "../../../src/core/domain/procedure";
import {Website} from "../../../src/core/domain/website";
import {Iri} from "../../../src/core/domain/shared/iri";

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
                .withKeywords([
                    LanguageString.of('def'),
                    LanguageString.of('abc')
                ])
                .build();

        expect(aConceptSnapshot.keywords).toEqual([
            LanguageString.of('abc'),
            LanguageString.of('def'),
        ]);
    });

    test('Undefined id throws error', () => {
        expect(() => aFullConceptSnapshot().withId(undefined).build()).toThrow(new Error('id should not be undefined'));
    });

    test('Invalid iri id throws error', () => {
        expect(() => aFullConceptSnapshot().withId(new Iri('   ')).build()).toThrow(new Error('iri should not be blank'));
    });

    test('Undefined title throws error', () => {
        expect(() => aFullConceptSnapshot().withTitle(undefined).build()).toThrow(new Error('title should not be undefined'));
    });

    test('NL not present in title throws error', () => {
        expect(() => aFullConceptSnapshot().withTitle(LanguageString.of('en', undefined)).build()).toThrow(new Error('nl version in title should not be undefined'));
    });

    test('Undefined description throws error', () => {
        expect(() => aFullConceptSnapshot().withDescription(undefined).build()).toThrow(new Error('description should not be undefined'));
    });

    test('NL not present in description throws error', () => {
        expect(() => aFullConceptSnapshot().withDescription(LanguageString.of('en', undefined)).build()).toThrow(new Error('nl version in description should not be undefined'));
    });

    test('Undefined productId throws error', () => {
        expect(() => aFullConceptSnapshot().withProductId(undefined).build()).toThrow(new Error('productId should not be undefined'));
    });

    test('Blank productId throws error', () => {
        expect(() => aFullConceptSnapshot().withProductId('   ').build()).toThrow(new Error('productId should not be blank'));
    });

    test('Undefined snapshotType throws error', () => {
        expect(() => aFullConceptSnapshot().withSnapshotType(undefined).build()).toThrow(new Error('snapshotType should not be undefined'));
    });

    test('TargetAudience with duplicates throws error', () => {
        const conceptTestBuilder = aFullConceptSnapshot().withTargetAudiences([TargetAudienceType.BURGER, TargetAudienceType.BURGER]);
        expect(() => conceptTestBuilder.build()).toThrow(new Error('targetAudiences should not contain duplicates'));
    });

    test('Themes with duplicates throws error', () => {
        const conceptTestBuilder = aFullConceptSnapshot().withThemes([ThemeType.BOUWENWONEN, ThemeType.BOUWENWONEN]);
        expect(() => conceptTestBuilder.build()).toThrow(new Error('themes should not contain duplicates'));
    });

    test('CompetentAuthorityLevels with duplicates throws error', () => {
        const conceptTestBuilder = aFullConceptSnapshot().withCompetentAuthorityLevels([CompetentAuthorityLevelType.EUROPEES, CompetentAuthorityLevelType.EUROPEES]);
        expect(() => conceptTestBuilder.build()).toThrow(new Error('competentAuthorityLevels should not contain duplicates'));
    });

    test('CompetentAuthorities with duplicates throws error', () => {
        const conceptTestBuilder = aFullConceptSnapshot().withCompetentAuthorities([BestuurseenheidTestBuilder.PEPINGEN_IRI, BestuurseenheidTestBuilder.PEPINGEN_IRI]);
        expect(() => conceptTestBuilder.build()).toThrow(new Error('competentAuthorities should not contain duplicates'));
    });

    test('ExecutingAuthorityLevels with duplicates throws error', () => {
        const conceptTestBuilder = aFullConceptSnapshot().withExecutingAuthorityLevels([ExecutingAuthorityLevelType.LOKAAL, ExecutingAuthorityLevelType.LOKAAL]);
        expect(() => conceptTestBuilder.build()).toThrow(new Error('executingAuthorityLevels should not contain duplicates'));
    });

    test('ExecutingAuthorities with duplicates throws error', () => {
        const conceptTestBuilder = aFullConceptSnapshot().withExecutingAuthorities([BestuurseenheidTestBuilder.PEPINGEN_IRI, BestuurseenheidTestBuilder.PEPINGEN_IRI]);
        expect(() => conceptTestBuilder.build()).toThrow(new Error('executingAuthorities should not contain duplicates'));
    });

    test('PublicationMedia with duplicates throws error', () => {
        const conceptTestBuilder = aFullConceptSnapshot().withPublicationMedia([PublicationMediumType.YOUREUROPE, PublicationMediumType.YOUREUROPE]);
        expect(() => conceptTestBuilder.build()).toThrow(new Error('publicationMedia should not contain duplicates'));
    });

    test('YourEuropeCategories with duplicates throws error', () => {
        const conceptTestBuilder = aFullConceptSnapshot().withYourEuropeCategories([YourEuropeCategoryType.BEDRIJF, YourEuropeCategoryType.BEDRIJF]);
        expect(() => conceptTestBuilder.build()).toThrow(new Error('yourEuropeCategories should not contain duplicates'));
    });

    test('keywords with duplicates throws error', () => {
        const conceptTestBuilder = aFullConceptSnapshot().withKeywords([LanguageString.of('overlijden'), LanguageString.of('overlijden')]);
        expect(() => conceptTestBuilder.build()).toThrow(new Error('keywords should not contain duplicates'));
    });

    describe('dateCreated', () => {

        test('Invalid dateCreated throws error', () => {
            expect(() => aFullConceptSnapshot().withDateCreated(FormatPreservingDate.of(undefined)).build()).toThrow(new Error('dateCreated should not be undefined'));
        });

        test('Undefined dateCreated throws error', () => {
            expect(() => aFullConceptSnapshot().withDateCreated(undefined).build()).toThrow(new Error('dateCreated should not be undefined'));
        });
        test('Blank dateCreated throws error', () => {
            expect(() => aFullConceptSnapshot().withDateCreated(FormatPreservingDate.of('')).build()).toThrow(new Error('dateCreated should not be undefined'));
        });
    });

    describe('dateModified', () => {

        test('Invalid dateModified throws error', () => {
            expect(() => aFullConceptSnapshot().withDateModified(FormatPreservingDate.of(undefined)).build()).toThrow(new Error('dateModified should not be undefined'));
        });

        test('Undefined dateModified throws error', () => {
            expect(() => aFullConceptSnapshot().withDateModified(undefined).build()).toThrow(new Error('dateModified should not be undefined'));
        });
        test('Blank dateModified throws error', () => {
            expect(() => aFullConceptSnapshot().withDateModified(FormatPreservingDate.of('')).build()).toThrow(new Error('dateModified should not be undefined'));
        });
    });

    describe('generatedAtTime', () => {

        test('Invalid generatedAtTime throws error', () => {
            expect(() => aFullConceptSnapshot().withGeneratedAtTime(FormatPreservingDate.of(undefined)).build()).toThrow(new Error('generatedAtTime should not be undefined'));
        });

        test('Undefined generatedAtTime throws error', () => {
            expect(() => aFullConceptSnapshot().withGeneratedAtTime(undefined).build()).toThrow(new Error('generatedAtTime should not be undefined'));
        });
        test('Blank generatedAtTime throws error', () => {
            expect(() => aFullConceptSnapshot().withGeneratedAtTime(FormatPreservingDate.of('')).build()).toThrow(new Error('generatedAtTime should not be undefined'));
        });
    });
    test('conceptTags with duplicates throws error', () => {
        const conceptTestBuilder = aFullConceptSnapshot().withConceptTags([ConceptTagType.YOUREUROPEVERPLICHT, ConceptTagType.YOUREUROPEVERPLICHT]);
        expect(() => conceptTestBuilder.build()).toThrow(new Error('conceptTags should not contain duplicates'));
    });

    test('legalResources with duplicates throws error', () => {
        const iri = uuid();
        const conceptTestBuilder = aFullConceptSnapshot().withLegalResources([buildCodexVlaanderenIri(iri), buildCodexVlaanderenIri(iri)]);
        expect(() => conceptTestBuilder.build()).toThrow(new Error('legalResources should not contain duplicates'));
    });
    
    describe('cost ', () => {
        test('valid cost does not throw error', () => {
            const validCost = Cost.reconstitute(CostTestBuilder.buildIri(uuid()), undefined, aMinimalLanguageString(CostTestBuilder.TITLE).build(),
                aMinimalLanguageString(CostTestBuilder.DESCRIPTION).build());

            expect(() => aFullConceptSnapshot().withCosts([validCost]).build()).not.toThrow();
        });

        test('invalid cost does throw error', () => {
            const invalidCost = Cost.reconstitute(CostTestBuilder.buildIri(uuid()), undefined, undefined, undefined);

            expect(() => aFullConceptSnapshot().withCosts([invalidCost]).build()).toThrow();
        });
    });

    describe('financialAdvantage ', () => {
        test('valid financial advantage does not throw error', () => {
            const validFinancialAdvantage = FinancialAdvantage.reconstitute(FinancialAdvantageTestBuilder.buildIri(uuid()), undefined, aMinimalLanguageString(FinancialAdvantageTestBuilder.TITLE).build(),
                aMinimalLanguageString(FinancialAdvantageTestBuilder.DESCRIPTION).build());

            expect(() => aFullConceptSnapshot().withFinancialAdvantages([validFinancialAdvantage]).build()).not.toThrow();
        });

        test('invalid financial advantage does throw error', () => {
            const invalidFinancialAdvantage = FinancialAdvantage.reconstitute(FinancialAdvantageTestBuilder.buildIri(uuid()), undefined, undefined, undefined);

            expect(() => aFullConceptSnapshot().withFinancialAdvantages([invalidFinancialAdvantage]).build()).toThrow();
        });
    });

    describe('procedure ', () => {
        test('valid procedure does not throw error', () => {
            const uuidValue = uuid();
            const validProcedure = Procedure.reconstitute(ProcedureTestBuilder.buildIri(uuidValue), uuidValue, aMinimalLanguageString(ProcedureTestBuilder.TITLE).build(),
                aMinimalLanguageString(ProcedureTestBuilder.DESCRIPTION).build(), []);

            expect(() => aFullConceptSnapshot().withProcedures([validProcedure]).build()).not.toThrow();
        });

        test('invalid procedure does throw error', () => {
            const invalidProcedure = Procedure.reconstitute(ProcedureTestBuilder.buildIri(uuid()), undefined, undefined, undefined, []);

            expect(() => aFullConceptSnapshot().withProcedures([invalidProcedure]).build()).toThrow();
        });
    });

    describe('website ', () => {
        test('valid website does not throw error', () => {
            const uuidValue = uuid();
            const validWebsite = Website.reconstitute(WebsiteTestBuilder.buildIri(uuidValue), uuidValue, aMinimalLanguageString(WebsiteTestBuilder.TITLE).build(),
                aMinimalLanguageString(WebsiteTestBuilder.DESCRIPTION).build(), WebsiteTestBuilder.URL);

            expect(() => aFullConceptSnapshot().withWebsites([validWebsite]).build()).not.toThrow();
        });

        test('invalid website does throw error', () => {
            const invalidWebsite = Website.reconstitute(WebsiteTestBuilder.buildIri(uuid()), undefined, undefined, undefined, WebsiteTestBuilder.URL);

            expect(() => aFullConceptSnapshot().withWebsites([invalidWebsite]).build()).toThrow();
        });
    });

    describe('requirement ', () => {
        test('valid requirement does not throw error', () => {
            const uuidValue = uuid();
            const validRequirement = Requirement.reconstitute(RequirementTestBuilder.buildIri(uuidValue), undefined, aMinimalLanguageString(RequirementTestBuilder.TITLE).build(),
                aMinimalLanguageString(RequirementTestBuilder.DESCRIPTION).build(), undefined);

            expect(() => aFullConceptSnapshot().withRequirements([validRequirement]).build()).not.toThrow();
        });

        test('invalid financialAdvantage does throw error', () => {
            const invalidRequirement = Requirement.reconstitute(RequirementTestBuilder.buildIri(uuid()), undefined, undefined, undefined, undefined);

            expect(() => aFullConceptSnapshot().withRequirements([invalidRequirement]).build()).toThrow();
        });
        describe('evidence ', () => {
            test('valid evidence does not throw error', () => {
                const uuidValue = uuid();
                const validEvidence = Evidence.reconstitute(EvidenceTestBuilder.buildIri(uuidValue), uuidValue, aMinimalLanguageString(EvidenceTestBuilder.TITLE).build(),
                    aMinimalLanguageString(EvidenceTestBuilder.DESCRIPTION).build());
                const validRequirement = aFullRequirement().withEvidence(validEvidence).build();

                expect(() => aFullConceptSnapshot().withRequirements([validRequirement]).build()).not.toThrow();
            });

            test('invalid evidence does throw error', () => {
                const uuidValue = uuid();
                const invalidEvidence = Evidence.reconstitute(EvidenceTestBuilder.buildIri(uuidValue), uuidValue, undefined, undefined);
                const invalidRequirement = aFullRequirement().withEvidence(invalidEvidence).build();

                expect(() => aFullConceptSnapshot().withRequirements([invalidRequirement]).build()).toThrow();
            });
        });
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
                .withTitle(LanguageString.of("text-en", "text-nl", "text-nl-formal"))
                .build(),
            aFullConceptSnapshot()
                .withTitle(LanguageString.of("text-en-changed", "text-nl-veranderd", "text-nl-formal-veranderd",))
                .build()],
        ['description changed',
            aFullConceptSnapshot()
                .withDescription(LanguageString.of("text-en", "text-nl",))
                .build(),
            aFullConceptSnapshot()
                .withDescription(LanguageString.of("text-en-changed", "text-nl-veranderd"))
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
                .withTargetAudiences([TargetAudienceType.BURGER])
                .build(),
            aFullConceptSnapshot()
                .withTargetAudiences([TargetAudienceType.VLAAMSEOVERHEID])
                .build()],
        ['target audience added',
            aFullConceptSnapshot()
                .withTargetAudiences([TargetAudienceType.BURGER])
                .build(),
            aFullConceptSnapshot()
                .withTargetAudiences([TargetAudienceType.VLAAMSEOVERHEID, TargetAudienceType.BURGER])
                .build()],
        ['target audience removed',
            aFullConceptSnapshot()
                .withTargetAudiences([TargetAudienceType.VLAAMSEOVERHEID, TargetAudienceType.BURGER])
                .build(),
            aFullConceptSnapshot()
                .withTargetAudiences([TargetAudienceType.BURGER])
                .build()],
        ['theme updated',
            aFullConceptSnapshot()
                .withThemes([ThemeType.WELZIJNGEZONDHEID])
                .build(),
            aFullConceptSnapshot()
                .withThemes([ThemeType.CULTUURSPORTVRIJETIJD])
                .build()],
        ['theme added',
            aFullConceptSnapshot()
                .withThemes([ThemeType.WELZIJNGEZONDHEID])
                .build(),
            aFullConceptSnapshot()
                .withThemes([ThemeType.MOBILITEITOPENBAREWERKEN, ThemeType.WELZIJNGEZONDHEID])
                .build()],
        ['theme removed',
            aFullConceptSnapshot()
                .withThemes([ThemeType.MOBILITEITOPENBAREWERKEN, ThemeType.WELZIJNGEZONDHEID])
                .build(),
            aFullConceptSnapshot()
                .withThemes([ThemeType.WELZIJNGEZONDHEID])
                .build()],
        ['competent Authority Level updated',
            aFullConceptSnapshot()
                .withCompetentAuthorityLevels([CompetentAuthorityLevelType.EUROPEES])
                .build(),
            aFullConceptSnapshot()
                .withCompetentAuthorityLevels([CompetentAuthorityLevelType.LOKAAL])
                .build()],
        ['competent Authority Level added',
            aFullConceptSnapshot()
                .withCompetentAuthorityLevels([CompetentAuthorityLevelType.LOKAAL])
                .build(),
            aFullConceptSnapshot()
                .withCompetentAuthorityLevels([CompetentAuthorityLevelType.PROVINCIAAL, CompetentAuthorityLevelType.LOKAAL])
                .build()],
        ['competent Authority Level removed',
            aFullConceptSnapshot()
                .withCompetentAuthorityLevels([CompetentAuthorityLevelType.PROVINCIAAL, CompetentAuthorityLevelType.FEDERAAL])
                .build(),
            aFullConceptSnapshot()
                .withCompetentAuthorityLevels([CompetentAuthorityLevelType.FEDERAAL])
                .build()],
        ['competent authorities updated',
            aFullConceptSnapshot()
                .withCompetentAuthorities([BestuurseenheidTestBuilder.BORGLOON_IRI])
                .build(),
            aFullConceptSnapshot()
                .withCompetentAuthorities([BestuurseenheidTestBuilder.HOUTHALEN_HELCHTEREN_IRI])
                .build()],
        ['competent authorities added',
            aFullConceptSnapshot()
                .withCompetentAuthorities([BestuurseenheidTestBuilder.BORGLOON_IRI])
                .build(),
            aFullConceptSnapshot()
                .withCompetentAuthorities([BestuurseenheidTestBuilder.HOUTHALEN_HELCHTEREN_IRI, BestuurseenheidTestBuilder.BORGLOON_IRI])
                .build()],
        ['competent authorities removed',
            aFullConceptSnapshot()
                .withCompetentAuthorities([BestuurseenheidTestBuilder.HOUTHALEN_HELCHTEREN_IRI, BestuurseenheidTestBuilder.BORGLOON_IRI])
                .build(),
            aFullConceptSnapshot()
                .withCompetentAuthorities([BestuurseenheidTestBuilder.BORGLOON_IRI])
                .build()],
        ['executing Authority Level updated',
            aFullConceptSnapshot()
                .withExecutingAuthorityLevels([ExecutingAuthorityLevelType.EUROPEES])
                .build(),
            aFullConceptSnapshot()
                .withExecutingAuthorityLevels([ExecutingAuthorityLevelType.LOKAAL])
                .build()],
        ['executing Authority Level added',
            aFullConceptSnapshot()
                .withExecutingAuthorityLevels([ExecutingAuthorityLevelType.LOKAAL])
                .build(),
            aFullConceptSnapshot()
                .withExecutingAuthorityLevels([ExecutingAuthorityLevelType.PROVINCIAAL, ExecutingAuthorityLevelType.LOKAAL])
                .build()],
        ['executing Authority Level removed',
            aFullConceptSnapshot()
                .withExecutingAuthorityLevels([ExecutingAuthorityLevelType.PROVINCIAAL, ExecutingAuthorityLevelType.DERDEN])
                .build(),
            aFullConceptSnapshot()
                .withExecutingAuthorityLevels([ExecutingAuthorityLevelType.DERDEN])
                .build()],
        ['executing authorities updated',
            aFullConceptSnapshot()
                .withExecutingAuthorities([BestuurseenheidTestBuilder.OUD_HEVERLEE_IRI])
                .build(),
            aFullConceptSnapshot()
                .withExecutingAuthorities([BestuurseenheidTestBuilder.HOUTHALEN_HELCHTEREN_IRI])
                .build()],
        ['executing authorities added',
            aFullConceptSnapshot()
                .withExecutingAuthorities([BestuurseenheidTestBuilder.HOUTHALEN_HELCHTEREN_IRI])
                .build(),
            aFullConceptSnapshot()
                .withExecutingAuthorities([BestuurseenheidTestBuilder.ASSENEDE_IRI, BestuurseenheidTestBuilder.HOUTHALEN_HELCHTEREN_IRI])
                .build()],
        ['executing authorities removed',
            aFullConceptSnapshot()
                .withExecutingAuthorities([BestuurseenheidTestBuilder.ASSENEDE_IRI, BestuurseenheidTestBuilder.OUD_HEVERLEE_IRI])
                .build(),
            aFullConceptSnapshot()
                .withExecutingAuthorities([BestuurseenheidTestBuilder.OUD_HEVERLEE_IRI])
                .build()],
        ['publication medium updated',
            aFullConceptSnapshot()
                .withPublicationMedia([PublicationMediumType.RECHTENVERKENNER])
                .build(),
            aFullConceptSnapshot()
                .withPublicationMedia([PublicationMediumType.YOUREUROPE])
                .build()],
        ['publication medium added',
            aFullConceptSnapshot()
                .withPublicationMedia([PublicationMediumType.RECHTENVERKENNER])
                .build(),
            aFullConceptSnapshot()
                .withPublicationMedia([PublicationMediumType.YOUREUROPE, PublicationMediumType.RECHTENVERKENNER])
                .build()],
        ['publication medium removed',
            aFullConceptSnapshot()
                .withPublicationMedia([PublicationMediumType.RECHTENVERKENNER, PublicationMediumType.YOUREUROPE])
                .build(),
            aFullConceptSnapshot()
                .withPublicationMedia([PublicationMediumType.RECHTENVERKENNER])
                .build()],
        ['your europe category updated',
            aFullConceptSnapshot()
                .withYourEuropeCategories([YourEuropeCategoryType.GOEDERENRECYCLAGE])
                .build(),
            aFullConceptSnapshot()
                .withYourEuropeCategories([YourEuropeCategoryType.BEDRIJFINTELLECTUELEEIGENDOMSRECHTEN])
                .build()],
        ['your europe category added',
            aFullConceptSnapshot()
                .withYourEuropeCategories([YourEuropeCategoryType.BEDRIJFKREDIETVERZEKERING])
                .build(),
            aFullConceptSnapshot()
                .withYourEuropeCategories([YourEuropeCategoryType.BEDRIJFKREDIETVERZEKERING, YourEuropeCategoryType.GEZONDHEIDSZORG])
                .build()],
        ['your europe category removed',
            aFullConceptSnapshot()
                .withYourEuropeCategories([YourEuropeCategoryType.PROCEDUREVERHUIZINGADRESWIJZIGING, YourEuropeCategoryType.ONDERWIJSOFSTAGESTAGE])
                .build(),
            aFullConceptSnapshot()
                .withYourEuropeCategories([YourEuropeCategoryType.PROCEDUREVERHUIZINGADRESWIJZIGING])
                .build()],
        ['keyword updated - en',
            aFullConceptSnapshot()
                .withKeywords([LanguageString.of('abc')])
                .build(),
            aFullConceptSnapshot()
                .withKeywords([LanguageString.of('def')])
                .build()],
        ['keyword updated - nl',
            aFullConceptSnapshot()
                .withKeywords([LanguageString.of(undefined, 'abc')])
                .build(),
            aFullConceptSnapshot()
                .withKeywords([LanguageString.of(undefined, 'def')])
                .build()],
        ['keyword updated - en became nl',
            aFullConceptSnapshot()
                .withKeywords([LanguageString.of('abc')])
                .build(),
            aFullConceptSnapshot()
                .withKeywords([LanguageString.of(undefined, 'abc')])
                .build()],
        ['keyword added',
            aFullConceptSnapshot()
                .withKeywords([LanguageString.of('abc')])
                .build(),
            aFullConceptSnapshot()
                .withKeywords([LanguageString.of('abc'), LanguageString.of('def')])
                .build()],
        ['keyword removed',
            aFullConceptSnapshot()
                .withKeywords([LanguageString.of('abc'), LanguageString.of('def')])
                .build(),
            aFullConceptSnapshot()
                .withKeywords([LanguageString.of('abc')])
                .build()],
        ['requirement added',
            aFullConceptSnapshot()
                .withRequirements([])
                .build(),
            aFullConceptSnapshot()
                .withRequirements([aMinimalRequirementForConceptSnapshot().build()])
                .build()],
        ['requirement removed',
            aFullConceptSnapshot()
                .withRequirements([aMinimalRequirementForConceptSnapshot().build()])
                .build(),
            aFullConceptSnapshot()
                .withRequirements([])
                .build()],
        ['requirement order changed',
            aFullConceptSnapshot()
                .withRequirements([aMinimalRequirementForConceptSnapshot().withTitle(LanguageString.of('requirement-title-en-1')).build(),
                    aMinimalRequirementForConceptSnapshot().withTitle(LanguageString.of('requirement-title-en-2')).build()])
                .build(),
            aFullConceptSnapshot()
                .withRequirements([aMinimalRequirementForConceptSnapshot().withTitle(LanguageString.of('requirement-title-en-2')).build(),
                    aMinimalRequirementForConceptSnapshot().withTitle(LanguageString.of('requirement-title-en-1')).build()])
                .build()],
        ['requirement title updated : en changed',
            aFullConceptSnapshot()
                .withRequirements([aMinimalRequirementForConceptSnapshot().withTitle(LanguageString.of('requirement-title-en')).build()])
                .build(),
            aFullConceptSnapshot()
                .withRequirements([aMinimalRequirementForConceptSnapshot().withTitle(LanguageString.of('requirement-title-en - updated')).build()])
                .build()],
        ['requirement title updated: nl added',
            aFullConceptSnapshot()
                .withRequirements([aMinimalRequirementForConceptSnapshot().withTitle(LanguageString.of('requirement-title-en')).build()])
                .build(),
            aFullConceptSnapshot()
                .withRequirements([aMinimalRequirementForConceptSnapshot().withTitle(LanguageString.of('requirement-title-en', 'requirement-title-nl')).build()])
                .build()],
        ['requirement title updated: nl removed',
            aFullConceptSnapshot()
                .withRequirements([aMinimalRequirementForConceptSnapshot().withTitle(LanguageString.of('requirement-title-en', 'requirement-title-nl')).build()])
                .build(),
            aFullConceptSnapshot()
                .withRequirements([aMinimalRequirementForConceptSnapshot().withTitle(LanguageString.of('requirement-title-en')).build()])
                .build()],
        ['requirement title updated : nl changed',
            aFullConceptSnapshot()
                .withRequirements([aMinimalRequirementForConceptSnapshot().withTitle(LanguageString.of('requirement-title-en', 'requirement-title-nl')).build()])
                .build(),
            aFullConceptSnapshot()
                .withRequirements([aMinimalRequirementForConceptSnapshot().withTitle(LanguageString.of('requirement-title-en', 'requirement-title-changed')).build()])
                .build()],
        ['requirement description updated : en changed',
            aFullConceptSnapshot()
                .withRequirements([aMinimalRequirementForConceptSnapshot().withDescription(LanguageString.of('requirement-description-en')).build()])
                .build(),
            aFullConceptSnapshot()
                .withRequirements([aMinimalRequirementForConceptSnapshot().withDescription(LanguageString.of('requirement-description-en - updated')).build()])
                .build()],
        ['requirement description updated: nl added',
            aFullConceptSnapshot()
                .withRequirements([aMinimalRequirementForConceptSnapshot().withDescription(LanguageString.of('requirement-description-en')).build()])
                .build(),
            aFullConceptSnapshot()
                .withRequirements([aMinimalRequirementForConceptSnapshot().withDescription(LanguageString.of('requirement-description-en', 'requirement-description-nl')).build()])
                .build()],
        ['requirement description updated: nl removed',
            aFullConceptSnapshot()
                .withRequirements([aMinimalRequirementForConceptSnapshot().withDescription(LanguageString.of('requirement-description-en', 'requirement-description-nl')).build()])
                .build(),
            aFullConceptSnapshot()
                .withRequirements([aMinimalRequirementForConceptSnapshot().withDescription(LanguageString.of('requirement-description-en')).build()])
                .build()],
        ['requirement description updated : nl changed',
            aFullConceptSnapshot()
                .withRequirements([aMinimalRequirementForConceptSnapshot().withDescription(LanguageString.of('requirement-description-en', 'requirement-description-nl')).build()])
                .build(),
            aFullConceptSnapshot()
                .withRequirements([aMinimalRequirementForConceptSnapshot().withDescription(LanguageString.of('requirement-description-en', 'requirement-description-changed')).build()])
                .build()],
        ['requirement > evidence : added',
            aFullConceptSnapshot()
                .withRequirements([aMinimalRequirementForConceptSnapshot().withEvidence(undefined).build()])
                .build(),
            aFullConceptSnapshot()
                .withRequirements([aMinimalRequirementForConceptSnapshot().withEvidence(aFullEvidence().build()).build()])
                .build()],
        ['requirement > evidence : removed',
            aFullConceptSnapshot()
                .withRequirements([aMinimalRequirementForConceptSnapshot().withEvidence(aFullEvidence().build()).build()])
                .build(),
            aFullConceptSnapshot()
                .withRequirements([aMinimalRequirementForConceptSnapshot().withEvidence(undefined).build()])
                .build()],
        ['requirement > evidence title updated',
            aFullConceptSnapshot()
                .withRequirements([aMinimalRequirementForConceptSnapshot().withEvidence(aMinimalEvidenceForConceptSnapshot().withTitle(LanguageString.of('evidence title en')).build()).build()])
                .build(),
            aFullConceptSnapshot()
                .withRequirements([aMinimalRequirementForConceptSnapshot().withEvidence(aMinimalEvidenceForConceptSnapshot().withTitle(LanguageString.of('evidence title en updated')).build()).build()])
                .build()],
        ['requirement > evidence description updated',
            aFullConceptSnapshot()
                .withRequirements([aMinimalRequirementForConceptSnapshot().withEvidence(aMinimalEvidenceForConceptSnapshot().withDescription(LanguageString.of('evidence description en')).build()).build()])
                .build(),
            aFullConceptSnapshot()
                .withRequirements([aMinimalRequirementForConceptSnapshot().withEvidence(aMinimalEvidenceForConceptSnapshot().withDescription(LanguageString.of('evidence description en updated')).build()).build()])
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
        ['procedure description updated',
            aFullConceptSnapshot()
                .withProcedures([aFullProcedure().withDescription(LanguageString.of('procedure description en')).build()])
                .build(),
            aFullConceptSnapshot()
                .withProcedures([aFullProcedure().withDescription(LanguageString.of('procedure description en updated')).build()])
                .build()],
        ['procedure website title updated',
            aFullConceptSnapshot()
                .withProcedures([aFullProcedure().withWebsites([aMinimalWebsiteForConceptSnapshot().withTitle(LanguageString.of('procedure website title en')).build()]).build()])
                .build(),
            aFullConceptSnapshot()
                .withProcedures([aFullProcedure().withWebsites([aMinimalWebsiteForConceptSnapshot().withTitle(LanguageString.of('procedure website title en updated')).build()]).build()])
                .build()],
        ['procedure website description updated',
            aFullConceptSnapshot()
                .withProcedures([aFullProcedure().withWebsites([aMinimalWebsiteForConceptSnapshot().withDescription(LanguageString.of('procedure website description en')).build()]).build()])
                .build(),
            aFullConceptSnapshot()
                .withProcedures([aFullProcedure().withWebsites([aMinimalWebsiteForConceptSnapshot().withDescription(LanguageString.of('procedure website description en updated')).build()]).build()])
                .build()],
        ['procedure website description added',
            aFullConceptSnapshot()
                .withProcedures([aFullProcedure().withWebsites([aMinimalWebsiteForConceptSnapshot().withDescription(undefined).build()]).build()])
                .build(),
            aFullConceptSnapshot()
                .withProcedures([aFullProcedure().withWebsites([aMinimalWebsiteForConceptSnapshot().withDescription(LanguageString.of('procedure website description en')).build()]).build()])
                .build()],
        ['procedure website description removed',
            aFullConceptSnapshot()
                .withProcedures([aFullProcedure().withWebsites([aMinimalWebsiteForConceptSnapshot().withDescription(LanguageString.of('procedure website description en')).build()]).build()])
                .build(),
            aFullConceptSnapshot()
                .withProcedures([aFullProcedure().withWebsites([aMinimalWebsiteForConceptSnapshot().withDescription(undefined).build()]).build()])
                .build()],
        ['procedure website url updated',
            aFullConceptSnapshot()
                .withProcedures([aFullProcedure().withWebsites([aMinimalWebsiteForConceptSnapshot().withUrl('https://url1.com').build()]).build()])
                .build(),
            aFullConceptSnapshot()
                .withProcedures([aFullProcedure().withWebsites([aMinimalWebsiteForConceptSnapshot().withUrl('https://url2.com').build()]).build()])
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
                .withProcedures([aFullProcedure().withWebsites([aMinimalWebsiteForConceptSnapshot().withUrl('https://url1.com').build(), aMinimalWebsiteForConceptSnapshot().withUrl('https://url2.com').build()]).build()])
                .build(),
            aFullConceptSnapshot()
                .withProcedures([aFullProcedure().withWebsites([aMinimalWebsiteForConceptSnapshot().withUrl('https://url2.com').build(), aMinimalWebsiteForConceptSnapshot().withUrl('https://url1.com').build()]).build()])
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
                .withWebsites([aMinimalWebsiteForConceptSnapshot().withTitle(LanguageString.of('website title en')).build()])
                .build(),
            aFullConceptSnapshot()
                .withWebsites([aMinimalWebsiteForConceptSnapshot().withTitle(LanguageString.of('website title en updated')).build()])
                .build()],
        ['website description updated',
            aFullConceptSnapshot()
                .withWebsites([aMinimalWebsiteForConceptSnapshot().withDescription(LanguageString.of('website description en')).build()])
                .build(),
            aFullConceptSnapshot()
                .withWebsites([aMinimalWebsiteForConceptSnapshot().withDescription(LanguageString.of('website description en updated')).build()])
                .build()],
        ['website description added',
            aFullConceptSnapshot()
                .withWebsites([aMinimalWebsiteForConceptSnapshot().withDescription(undefined).build()])
                .build(),
            aFullConceptSnapshot()
                .withWebsites([aMinimalWebsiteForConceptSnapshot().withDescription(LanguageString.of('website description en')).build()])
                .build()],
        ['website description removed',
            aFullConceptSnapshot()
                .withWebsites([aMinimalWebsiteForConceptSnapshot().withDescription(LanguageString.of('website description en')).build()])
                .build(),
            aFullConceptSnapshot()
                .withWebsites([aMinimalWebsiteForConceptSnapshot().withDescription(undefined).build()])
                .build()],
        ['website url updated',
            aFullConceptSnapshot()
                .withWebsites([aMinimalWebsiteForConceptSnapshot().withUrl('https://url1.com').build()])
                .build(),
            aFullConceptSnapshot()
                .withWebsites([aMinimalWebsiteForConceptSnapshot().withUrl('https://url2.com').build()])
                .build()],
        ['website order changed',
            aFullConceptSnapshot()
                .withWebsites([aMinimalWebsiteForConceptSnapshot().withUrl('https://url1.com').build(), aMinimalWebsiteForConceptSnapshot().withUrl('https://url2.com').build()])
                .build(),
            aFullConceptSnapshot()
                .withWebsites([aMinimalWebsiteForConceptSnapshot().withUrl('https://url2.com').build(), aMinimalWebsiteForConceptSnapshot().withUrl('https://url1.com').build()])
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
        ['cost description updated',
            aFullConceptSnapshot()
                .withCosts([aFullCost().withDescription(LanguageString.of('cost description en')).build()])
                .build(),
            aFullConceptSnapshot()
                .withCosts([aFullCost().withDescription(LanguageString.of('cost description en updated')).build()])
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
        ['financial advantage description updated',
            aFullConceptSnapshot()
                .withFinancialAdvantages([aFullFinancialAdvantage().withDescription(LanguageString.of('financial advantage description en')).build()])
                .build(),
            aFullConceptSnapshot()
                .withFinancialAdvantages([aFullFinancialAdvantage().withDescription(LanguageString.of('financial advantage description en updated')).build()])
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