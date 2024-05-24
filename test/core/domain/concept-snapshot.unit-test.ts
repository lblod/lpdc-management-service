import {ConceptSnapshot, ConceptSnapshotBuilder} from "../../../src/core/domain/concept-snapshot";
import {uuid} from "../../../mu-helper";
import {
    aFullConceptSnapshot,
    aMinimalConceptSnapshot,
    ConceptSnapshotTestBuilder
} from "./concept-snapshot-test-builder";
import {LanguageString} from "../../../src/core/domain/language-string";
import {BestuurseenheidTestBuilder} from "./bestuurseenheid-test-builder";
import {
    aFullRequirement,
    aMinimalRequirementForConceptSnapshot,
    RequirementTestBuilder
} from "./requirement-test-builder";
import {aFullEvidence, aMinimalEvidenceForConceptSnapshot, EvidenceTestBuilder} from "./evidence-test-builder";
import {aFullProcedure, aMinimalProcedureForConceptSnapshot, ProcedureTestBuilder} from "./procedure-test-builder";
import {aFullWebsite, aMinimalWebsiteForConceptSnapshot, WebsiteTestBuilder} from "./website-test-builder";
import {aFullCost, aMinimalCostForConceptSnapshot, CostTestBuilder} from "./cost-test-builder";
import {
    aFullFinancialAdvantage,
    aMinimalFinancialAdvantageForConceptSnapshot,
    FinancialAdvantageTestBuilder
} from "./financial-advantage-test-builder";
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
import {Cost, CostBuilder} from "../../../src/core/domain/cost";
import {aMinimalLanguageString} from "./language-string-test-builder";
import {FinancialAdvantage, FinancialAdvantageBuilder} from "../../../src/core/domain/financial-advantage";
import {Requirement, RequirementBuilder} from "../../../src/core/domain/requirement";
import {Evidence, EvidenceBuilder} from "../../../src/core/domain/evidence";
import {Procedure, ProcedureBuilder} from "../../../src/core/domain/procedure";
import {Website, WebsiteBuilder} from "../../../src/core/domain/website";
import {Iri} from "../../../src/core/domain/shared/iri";
import {InvariantError} from "../../../src/core/domain/shared/lpdc-error";
import {
    aFullLegalResourceForConceptSnapshot,
    aMinimalLegalResourceForConceptSnapshot
} from "./legal-resource-test-builder";
import {LegalResource, LegalResourceBuilder} from "../../../src/core/domain/legal-resource";
import {ConceptTestBuilder} from "./concept-test-builder";
import {Language} from "../../../src/core/domain/language";

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
        expect(() => aFullConceptSnapshot().withId(undefined).build()).toThrowWithMessage(InvariantError, 'id mag niet ontbreken');
    });

    test('Invalid iri id throws error', () => {
        expect(() => aFullConceptSnapshot().withId(new Iri('   ')).build()).toThrowWithMessage(InvariantError, 'iri mag niet leeg zijn');
    });

    test('Undefined title throws error', () => {
        expect(() => aFullConceptSnapshot().withTitle(undefined).build()).toThrowWithMessage(InvariantError, 'title mag niet ontbreken');
    });

    test('Undefined description throws error', () => {
        expect(() => aFullConceptSnapshot().withDescription(undefined).build()).toThrowWithMessage(InvariantError, 'description mag niet ontbreken');
    });

    test('Undefined productId throws error', () => {
        expect(() => aFullConceptSnapshot().withProductId(undefined).build()).toThrowWithMessage(InvariantError, 'productId mag niet ontbreken');
    });

    test('Blank productId throws error', () => {
        expect(() => aFullConceptSnapshot().withProductId('   ').build()).toThrowWithMessage(InvariantError, 'productId mag niet leeg zijn');
    });

    test('TargetAudience with duplicates throws error', () => {
        const conceptTestBuilder = aFullConceptSnapshot().withTargetAudiences([TargetAudienceType.BURGER, TargetAudienceType.BURGER]);
        expect(() => conceptTestBuilder.build()).toThrowWithMessage(InvariantError, 'targetAudiences mag geen duplicaten bevatten');
    });

    test('Themes with duplicates throws error', () => {
        const conceptTestBuilder = aFullConceptSnapshot().withThemes([ThemeType.BOUWENWONEN, ThemeType.BOUWENWONEN]);
        expect(() => conceptTestBuilder.build()).toThrowWithMessage(InvariantError, 'themes mag geen duplicaten bevatten');
    });

    test('CompetentAuthorityLevels with duplicates throws error', () => {
        const conceptTestBuilder = aFullConceptSnapshot().withCompetentAuthorityLevels([CompetentAuthorityLevelType.EUROPEES, CompetentAuthorityLevelType.EUROPEES]);
        expect(() => conceptTestBuilder.build()).toThrowWithMessage(InvariantError, 'competentAuthorityLevels mag geen duplicaten bevatten');
    });

    test('CompetentAuthorities with duplicates throws error', () => {
        const conceptTestBuilder = aFullConceptSnapshot().withCompetentAuthorities([BestuurseenheidTestBuilder.PEPINGEN_IRI, BestuurseenheidTestBuilder.PEPINGEN_IRI]);
        expect(() => conceptTestBuilder.build()).toThrowWithMessage(InvariantError, 'competentAuthorities mag geen duplicaten bevatten');
    });

    test('ExecutingAuthorityLevels with duplicates throws error', () => {
        const conceptTestBuilder = aFullConceptSnapshot().withExecutingAuthorityLevels([ExecutingAuthorityLevelType.LOKAAL, ExecutingAuthorityLevelType.LOKAAL]);
        expect(() => conceptTestBuilder.build()).toThrowWithMessage(InvariantError, 'executingAuthorityLevels mag geen duplicaten bevatten');
    });

    test('ExecutingAuthorities with duplicates throws error', () => {
        const conceptTestBuilder = aFullConceptSnapshot().withExecutingAuthorities([BestuurseenheidTestBuilder.PEPINGEN_IRI, BestuurseenheidTestBuilder.PEPINGEN_IRI]);
        expect(() => conceptTestBuilder.build()).toThrowWithMessage(InvariantError, 'executingAuthorities mag geen duplicaten bevatten');
    });

    test('PublicationMedia with duplicates throws error', () => {
        const conceptTestBuilder = aFullConceptSnapshot().withPublicationMedia([PublicationMediumType.YOUREUROPE, PublicationMediumType.YOUREUROPE]);
        expect(() => conceptTestBuilder.build()).toThrowWithMessage(InvariantError, 'publicationMedia mag geen duplicaten bevatten');
    });

    test('YourEuropeCategories with duplicates throws error', () => {
        const conceptTestBuilder = aFullConceptSnapshot().withYourEuropeCategories([YourEuropeCategoryType.BEDRIJF, YourEuropeCategoryType.BEDRIJF]);
        expect(() => conceptTestBuilder.build()).toThrowWithMessage(InvariantError, 'yourEuropeCategories mag geen duplicaten bevatten');
    });

    test('keywords with duplicates throws error', () => {
        const conceptTestBuilder = aFullConceptSnapshot().withKeywords([LanguageString.of('overlijden'), LanguageString.of('overlijden')]);
        expect(() => conceptTestBuilder.build()).toThrowWithMessage(InvariantError, 'keywords mag geen duplicaten bevatten');
    });

    test('keywords with other nl language does not throws error', () => {
        const conceptTestBuilder = aFullConceptSnapshot().withKeywords([LanguageString.of(undefined, 'overlijden'), LanguageString.of(undefined, 'geboorte')]);
        expect(() => conceptTestBuilder.build()).not.toThrowWithMessage(InvariantError, 'De nl-taal verschilt van nl');
    });

    test('undefined isArchived duplicates throws error', () => {
        const conceptTestBuilder = aFullConceptSnapshot().withIsArchived(undefined);
        expect(() => conceptTestBuilder.build()).toThrowWithMessage(InvariantError, 'isArchived mag niet ontbreken');
    });

    describe('dateCreated', () => {

        test('Invalid dateCreated throws error', () => {
            expect(() => aFullConceptSnapshot().withDateCreated(FormatPreservingDate.of(undefined)).build()).toThrowWithMessage(InvariantError, 'dateCreated mag niet ontbreken');
        });

        test('Undefined dateCreated throws error', () => {
            expect(() => aFullConceptSnapshot().withDateCreated(undefined).build()).toThrowWithMessage(InvariantError, 'dateCreated mag niet ontbreken');
        });

        test('Blank dateCreated throws error', () => {
            expect(() => aFullConceptSnapshot().withDateCreated(FormatPreservingDate.of('')).build()).toThrowWithMessage(InvariantError, 'dateCreated mag niet ontbreken');
        });

    });

    describe('dateModified', () => {

        test('Invalid dateModified throws error', () => {
            expect(() => aFullConceptSnapshot().withDateModified(FormatPreservingDate.of(undefined)).build()).toThrowWithMessage(InvariantError, 'dateModified mag niet ontbreken');
        });

        test('Undefined dateModified throws error', () => {
            expect(() => aFullConceptSnapshot().withDateModified(undefined).build()).toThrowWithMessage(InvariantError, 'dateModified mag niet ontbreken');
        });

        test('Blank dateModified throws error', () => {
            expect(() => aFullConceptSnapshot().withDateModified(FormatPreservingDate.of('')).build()).toThrowWithMessage(InvariantError, 'dateModified mag niet ontbreken');
        });

    });

    describe('generatedAtTime', () => {

        test('Invalid generatedAtTime throws error', () => {
            expect(() => aFullConceptSnapshot().withGeneratedAtTime(FormatPreservingDate.of(undefined)).build()).toThrowWithMessage(InvariantError, 'generatedAtTime mag niet ontbreken');
        });

        test('Undefined generatedAtTime throws error', () => {
            expect(() => aFullConceptSnapshot().withGeneratedAtTime(undefined).build()).toThrowWithMessage(InvariantError, 'generatedAtTime mag niet ontbreken');
        });

        test('Blank generatedAtTime throws error', () => {
            expect(() => aFullConceptSnapshot().withGeneratedAtTime(FormatPreservingDate.of('')).build()).toThrowWithMessage(InvariantError, 'generatedAtTime mag niet ontbreken');
        });

    });

    test('conceptTags with duplicates throws error', () => {
        const conceptTestBuilder = aFullConceptSnapshot().withConceptTags([ConceptTagType.YOUREUROPEVERPLICHT, ConceptTagType.YOUREUROPEVERPLICHT]);
        expect(() => conceptTestBuilder.build()).toThrowWithMessage(InvariantError, 'conceptTags mag geen duplicaten bevatten');
    });

    describe('Legal Resource', () => {

        test('valid legal resource does not throw error', () => {
            const validLegalResource = LegalResource.reconstitute(LegalResourceBuilder.buildIri(uuid()), undefined, undefined, undefined,
                buildCodexVlaanderenIri('123').value, 1);

            expect(() => aFullConceptSnapshot().withLegalResources([validLegalResource]).build()).not.toThrow();
        });

        test('invalid legal resource does throw error', () => {
            const validLegalResource = LegalResource.reconstitute(LegalResourceBuilder.buildIri(uuid()), undefined, undefined, undefined,
                undefined, 1);

            expect(() => aFullConceptSnapshot().withLegalResources([validLegalResource]).build()).toThrow();
        });

        test('legal resources that dont have unique order throws error', () => {
            const legalResource1 =
                aMinimalLegalResourceForConceptSnapshot().withOrder(1).build();
            const legalResource2 =
                aMinimalLegalResourceForConceptSnapshot().withOrder(1).build();

            expect(() => aFullConceptSnapshot().withLegalResources([legalResource1, legalResource2]).build()).toThrowWithMessage(InvariantError, 'legalResources > order mag geen duplicaten bevatten');
        });

        test('legal resources that have unique order does not throw error', () => {
            const legalResource1 =
                aMinimalLegalResourceForConceptSnapshot().withOrder(1).build();
            const legalResource2 =
                aMinimalLegalResourceForConceptSnapshot().withOrder(2).build();

            expect(() => aFullConceptSnapshot().withLegalResources([legalResource1, legalResource2]).build()).not.toThrow();
        });

    });

    describe('cost ', () => {

        test('valid cost does not throw error', () => {
            const validCost = Cost.reconstitute(CostBuilder.buildIri(uuid()), undefined, aMinimalLanguageString(CostTestBuilder.TITLE).build(),
                aMinimalLanguageString(CostTestBuilder.DESCRIPTION).build(), 1);

            expect(() => aFullConceptSnapshot().withCosts([validCost]).build()).not.toThrow();
        });

        test('invalid cost does throw error', () => {
            const invalidCost = Cost.reconstitute(CostBuilder.buildIri(uuid()), undefined, undefined, undefined, 1);

            expect(() => aFullConceptSnapshot().withCosts([invalidCost]).build()).toThrow();
        });

        test('costs that dont have unique order throws error', () => {
            const cost1 =
                aMinimalCostForConceptSnapshot().withOrder(1).build();
            const cost2 =
                aMinimalCostForConceptSnapshot().withOrder(1).build();

            expect(() => aFullConceptSnapshot().withCosts([cost1, cost2]).build()).toThrowWithMessage(InvariantError, 'costs > order mag geen duplicaten bevatten');
        });

        test('costs that have unique order does not throw error', () => {
            const cost1 =
                aMinimalCostForConceptSnapshot().withOrder(1).build();
            const cost2 =
                aMinimalCostForConceptSnapshot().withOrder(2).build();

            expect(() => aFullConceptSnapshot().withCosts([cost1, cost2]).build()).not.toThrow();
        });

    });

    describe('financialAdvantage ', () => {

        test('valid financial advantage does not throw error', () => {
            const validFinancialAdvantage = FinancialAdvantage.reconstitute(FinancialAdvantageBuilder.buildIri(uuid()), undefined, aMinimalLanguageString(FinancialAdvantageTestBuilder.TITLE).build(),
                aMinimalLanguageString(FinancialAdvantageTestBuilder.DESCRIPTION).build(), 1);

            expect(() => aFullConceptSnapshot().withFinancialAdvantages([validFinancialAdvantage]).build()).not.toThrow();
        });

        test('invalid financial advantage does throw error', () => {
            const invalidFinancialAdvantage = FinancialAdvantage.reconstitute(FinancialAdvantageBuilder.buildIri(uuid()), undefined, undefined, undefined, 1);

            expect(() => aFullConceptSnapshot().withFinancialAdvantages([invalidFinancialAdvantage]).build()).toThrow();
        });

        test('financial advantages that dont have unique order throws error', () => {
            const financialAdvantage1 =
                aMinimalFinancialAdvantageForConceptSnapshot().withOrder(1).build();
            const financialAdvantage2 =
                aMinimalFinancialAdvantageForConceptSnapshot().withOrder(1).build();

            expect(() => aFullConceptSnapshot().withFinancialAdvantages([financialAdvantage1, financialAdvantage2]).build()).toThrowWithMessage(InvariantError, 'financial advantages > order mag geen duplicaten bevatten');
        });

        test('financial advantages that have unique order does not throw error', () => {
            const financialAdvantage1 =
                aMinimalFinancialAdvantageForConceptSnapshot().withOrder(1).build();
            const financialAdvantage2 =
                aMinimalFinancialAdvantageForConceptSnapshot().withOrder(2).build();

            expect(() => aFullConceptSnapshot().withFinancialAdvantages([financialAdvantage1, financialAdvantage2]).build()).not.toThrow();
        });

    });

    describe('procedure ', () => {

        test('valid procedure does not throw error', () => {
            const uuidValue = uuid();
            const validProcedure = Procedure.reconstitute(ProcedureBuilder.buildIri(uuidValue), uuidValue, aMinimalLanguageString(ProcedureTestBuilder.TITLE).build(),
                aMinimalLanguageString(ProcedureTestBuilder.DESCRIPTION).build(), 1, []);

            expect(() => aFullConceptSnapshot().withProcedures([validProcedure]).build()).not.toThrow();
        });

        test('invalid procedure does throw error', () => {
            const invalidProcedure = Procedure.reconstitute(ProcedureBuilder.buildIri(uuid()), undefined, undefined, undefined, 1, []);

            expect(() => aFullConceptSnapshot().withProcedures([invalidProcedure]).build()).toThrow();
        });

        test('procedures that dont have unique order throws error', () => {
            const procedure1 =
                aMinimalProcedureForConceptSnapshot().withOrder(1).build();
            const procedure2 =
                aMinimalProcedureForConceptSnapshot().withOrder(1).build();

            expect(() => aFullConceptSnapshot().withProcedures([procedure1, procedure2]).build()).toThrowWithMessage(InvariantError, 'procedures > order mag geen duplicaten bevatten');
        });

        test('procedures that have unique order does not throw error', () => {
            const procedure1 =
                aMinimalProcedureForConceptSnapshot().withOrder(1).build();
            const procedure2 =
                aMinimalProcedureForConceptSnapshot().withOrder(2).build();

            expect(() => aFullConceptSnapshot().withProcedures([procedure1, procedure2]).build()).not.toThrow();
        });

    });

    describe('website ', () => {

        test('valid website does not throw error', () => {
            const uuidValue = uuid();
            const validWebsite = Website.reconstitute(WebsiteBuilder.buildIri(uuidValue), uuidValue, aMinimalLanguageString(WebsiteTestBuilder.TITLE).build(),
                aMinimalLanguageString(WebsiteTestBuilder.DESCRIPTION).build(), 1, WebsiteTestBuilder.URL);

            expect(() => aFullConceptSnapshot().withWebsites([validWebsite]).build()).not.toThrow();
        });

        test('invalid website does throw error', () => {
            const invalidWebsite = Website.reconstitute(WebsiteBuilder.buildIri(uuid()), undefined, undefined, undefined, 1, WebsiteTestBuilder.URL);

            expect(() => aFullConceptSnapshot().withWebsites([invalidWebsite]).build()).toThrow();
        });

        test('websites that dont have unique order throws error', () => {
            const website1 =
                aMinimalWebsiteForConceptSnapshot().withOrder(1).build();
            const website2 =
                aMinimalWebsiteForConceptSnapshot().withOrder(1).build();

            expect(() => aFullConceptSnapshot().withWebsites([website1, website2]).build()).toThrowWithMessage(InvariantError, 'websites > order mag geen duplicaten bevatten');
        });

        test('websites that have unique order does not throw error', () => {
            const website1 =
                aMinimalWebsiteForConceptSnapshot().withOrder(1).build();
            const website2 =
                aMinimalWebsiteForConceptSnapshot().withOrder(2).build();


            expect(() => aFullConceptSnapshot().withWebsites([website1, website2]).build()).not.toThrow();
        });

    });

    describe('requirement ', () => {

        test('valid requirement does not throw error', () => {
            const uuidValue = uuid();
            const validRequirement = Requirement.reconstitute(RequirementBuilder.buildIri(uuidValue), undefined, aMinimalLanguageString(RequirementTestBuilder.TITLE).build(),
                aMinimalLanguageString(RequirementTestBuilder.DESCRIPTION).build(), 1, undefined);

            expect(() => aFullConceptSnapshot().withRequirements([validRequirement]).build()).not.toThrow();
        });

        test('invalid requirement does throw error', () => {
            const invalidRequirement = Requirement.reconstitute(RequirementBuilder.buildIri(uuid()), undefined, undefined, undefined, 1, undefined);

            expect(() => aFullConceptSnapshot().withRequirements([invalidRequirement]).build()).toThrow();
        });

        test('requirements that dont have unique order throws error', () => {
            const requirement1 =
                aMinimalRequirementForConceptSnapshot().withOrder(1).build();
            const requirement2 =
                aMinimalRequirementForConceptSnapshot().withOrder(1).build();

            expect(() => aFullConceptSnapshot().withRequirements([requirement1, requirement2]).build()).toThrowWithMessage(InvariantError, 'requirements > order mag geen duplicaten bevatten');
        });

        test('requirements that have unique order does not throw error', () => {
            const requirement1 =
                aMinimalRequirementForConceptSnapshot().withOrder(1).build();
            const requirement2 =
                aMinimalRequirementForConceptSnapshot().withOrder(2).build();

            expect(() => aFullConceptSnapshot().withRequirements([requirement1, requirement2]).build()).not.toThrow();
        });

        describe('evidence ', () => {

            test('valid evidence does not throw error', () => {
                const uuidValue = uuid();
                const validEvidence = Evidence.reconstitute(EvidenceBuilder.buildIri(uuidValue), uuidValue, aMinimalLanguageString(EvidenceTestBuilder.TITLE).build(),
                    aMinimalLanguageString(EvidenceTestBuilder.DESCRIPTION).build());
                const validRequirement = aFullRequirement().withEvidence(validEvidence).build();

                expect(() => aFullConceptSnapshot().withRequirements([validRequirement]).build()).not.toThrow();
            });

            test('invalid evidence does throw error', () => {
                const uuidValue = uuid();
                const invalidEvidence = Evidence.reconstitute(EvidenceBuilder.buildIri(uuidValue), uuidValue, undefined, undefined);
                const invalidRequirement = aFullRequirement().withEvidence(invalidEvidence).build();

                expect(() => aFullConceptSnapshot().withRequirements([invalidRequirement]).build()).toThrow();
            });

        });
    });
});

describe('is functionally changed', () => {

    type TestCase = [string, ConceptSnapshot, ConceptSnapshot, string?];

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
                .withStartDate(FormatPreservingDate.of('2027-09-16T00:00:00Z'))
                .build(),
            aFullConceptSnapshot()
                .withStartDate(FormatPreservingDate.of('2027-09-16T00:00:00.000Z'))
                .build()],
        ['end date the same except formatting',
            aFullConceptSnapshot()
                .withEndDate(FormatPreservingDate.of('2027-09-16T00:00:00Z'))
                .build(),
            aFullConceptSnapshot()
                .withEndDate(FormatPreservingDate.of('2027-09-16T00:00:00.000Z'))
                .build()],
        ['title formal changed',
            aFullConceptSnapshot()
                .withTitle(LanguageString.of("text-nl", "text-nl-formal"))
                .build(),
            aFullConceptSnapshot()
                .withTitle(LanguageString.of("text-nl", "text-nl-formal-veranderd"))
                .build()],
    ];

    for (const testCase of functionallyUnchangedTestCases) {
        test(`not functionally changed when ${testCase[0]}`, () => {
            expect(ConceptSnapshot.isFunctionallyChanged(testCase[1], testCase[2])).toEqual([]);
        });
    }

    const functionallyChangedTestCases: TestCase[]
        = [
        ['title changed',
            aFullConceptSnapshot()
                .withTitle(LanguageString.of("text-nl", "text-nl-formal"))
                .build(),
            aFullConceptSnapshot()
                .withTitle(LanguageString.of("text-nl-veranderd", "text-nl-formal-veranderd",))
                .build(),
            'basisinformatie'],
        ['description changed',
            aFullConceptSnapshot()
                .withDescription(LanguageString.of("text-nl",))
                .build(),
            aFullConceptSnapshot()
                .withDescription(LanguageString.of("text-nl-veranderd"))
                .build(),
            'basisinformatie'],
        ['additional description changed',
            aFullConceptSnapshot()
                .withAdditionalDescription(LanguageString.of("text-nl"))
                .build(),
            aFullConceptSnapshot()
                .withAdditionalDescription(LanguageString.of("text-nl-changed"))
                .build(),
            'basisinformatie'],
        ['exception changed',
            aFullConceptSnapshot()
                .withException(LanguageString.of("text-nl"))
                .build(),
            aFullConceptSnapshot()
                .withException(LanguageString.of("text-nl-changed"))
                .build(),
            'basisinformatie'],
        ['regulation changed',
            aFullConceptSnapshot()
                .withRegulation(LanguageString.of("text-nl"))
                .build(),
            aFullConceptSnapshot()
                .withRegulation(LanguageString.of("text-nl-changed"))
                .build(), 'regelgeving'],
        ['start date changed',
            aFullConceptSnapshot()
                .withStartDate(FormatPreservingDate.of('2023-11-10T00:00:00.000Z'))
                .build(),
            aFullConceptSnapshot()
                .withStartDate(FormatPreservingDate.of('2023-11-09T00:00:00.000Z'))
                .build(), 'algemene info (eigenschappen)'],
        ['start date appeared',
            aFullConceptSnapshot()
                .withStartDate(undefined)
                .build(),
            aFullConceptSnapshot()
                .withStartDate(FormatPreservingDate.of('2023-11-09T00:00:00.000Z'))
                .build(), 'algemene info (eigenschappen)'],
        ['start date disappeared',
            aFullConceptSnapshot()
                .withStartDate(FormatPreservingDate.of('2023-11-09T00:00:00.000Z'))
                .build(),
            aFullConceptSnapshot()
                .withStartDate(undefined)
                .build(), 'algemene info (eigenschappen)'],
        ['end date changed',
            aFullConceptSnapshot()
                .withEndDate(FormatPreservingDate.of('2023-11-10T00:00:00.000Z'))
                .build(),
            aFullConceptSnapshot()
                .withEndDate(FormatPreservingDate.of('2023-11-09T00:00:00.000Z'))
                .build(), 'algemene info (eigenschappen)'],
        ['end date appeared',
            aFullConceptSnapshot()
                .withEndDate(undefined)
                .build(),
            aFullConceptSnapshot()
                .withEndDate(FormatPreservingDate.of('2023-11-09T00:00:00.000Z'))
                .build(), 'algemene info (eigenschappen)'],
        ['end date disappeared',
            aFullConceptSnapshot()
                .withEndDate(FormatPreservingDate.of('2023-11-09T00:00:00.000Z'))
                .build(),
            aFullConceptSnapshot()
                .withEndDate(undefined)
                .build(), 'algemene info (eigenschappen)'],
        ['type changed',
            aFullConceptSnapshot()
                .withType(ProductType.FINANCIEELVOORDEEL)
                .build(),
            aFullConceptSnapshot()
                .withType(ProductType.BEWIJS)
                .build(), 'algemene info (eigenschappen)'],
        ['type appeared',
            aFullConceptSnapshot()
                .withType(undefined)
                .build(),
            aFullConceptSnapshot()
                .withType(ProductType.FINANCIEELVOORDEEL)
                .build(), 'algemene info (eigenschappen)'],
        ['type disappeared',
            aFullConceptSnapshot()
                .withType(ProductType.FINANCIEELVOORDEEL)
                .build(),
            aFullConceptSnapshot()
                .withType(undefined)
                .build(), 'algemene info (eigenschappen)'],
        ['target audience updated',
            aFullConceptSnapshot()
                .withTargetAudiences([TargetAudienceType.BURGER])
                .build(),
            aFullConceptSnapshot()
                .withTargetAudiences([TargetAudienceType.VLAAMSEOVERHEID])
                .build(), 'algemene info (eigenschappen)'],
        ['target audience added',
            aFullConceptSnapshot()
                .withTargetAudiences([TargetAudienceType.BURGER])
                .build(),
            aFullConceptSnapshot()
                .withTargetAudiences([TargetAudienceType.VLAAMSEOVERHEID, TargetAudienceType.BURGER])
                .build(), 'algemene info (eigenschappen)'],
        ['target audience removed',
            aFullConceptSnapshot()
                .withTargetAudiences([TargetAudienceType.VLAAMSEOVERHEID, TargetAudienceType.BURGER])
                .build(),
            aFullConceptSnapshot()
                .withTargetAudiences([TargetAudienceType.BURGER])
                .build(), 'algemene info (eigenschappen)'],
        ['theme updated',
            aFullConceptSnapshot()
                .withThemes([ThemeType.WELZIJNGEZONDHEID])
                .build(),
            aFullConceptSnapshot()
                .withThemes([ThemeType.CULTUURSPORTVRIJETIJD])
                .build(), 'algemene info (eigenschappen)'],
        ['theme added',
            aFullConceptSnapshot()
                .withThemes([ThemeType.WELZIJNGEZONDHEID])
                .build(),
            aFullConceptSnapshot()
                .withThemes([ThemeType.MOBILITEITOPENBAREWERKEN, ThemeType.WELZIJNGEZONDHEID])
                .build(), 'algemene info (eigenschappen)'],
        ['theme removed',
            aFullConceptSnapshot()
                .withThemes([ThemeType.MOBILITEITOPENBAREWERKEN, ThemeType.WELZIJNGEZONDHEID])
                .build(),
            aFullConceptSnapshot()
                .withThemes([ThemeType.WELZIJNGEZONDHEID])
                .build(), 'algemene info (eigenschappen)'],
        ['competent Authority Level updated',
            aFullConceptSnapshot()
                .withCompetentAuthorityLevels([CompetentAuthorityLevelType.EUROPEES])
                .build(),
            aFullConceptSnapshot()
                .withCompetentAuthorityLevels([CompetentAuthorityLevelType.LOKAAL])
                .build(), 'bevoegdheid (eigenschappen)'],
        ['competent Authority Level added',
            aFullConceptSnapshot()
                .withCompetentAuthorityLevels([CompetentAuthorityLevelType.LOKAAL])
                .build(),
            aFullConceptSnapshot()
                .withCompetentAuthorityLevels([CompetentAuthorityLevelType.PROVINCIAAL, CompetentAuthorityLevelType.LOKAAL])
                .build(), 'bevoegdheid (eigenschappen)'],
        ['competent Authority Level removed',
            aFullConceptSnapshot()
                .withCompetentAuthorityLevels([CompetentAuthorityLevelType.PROVINCIAAL, CompetentAuthorityLevelType.FEDERAAL])
                .build(),
            aFullConceptSnapshot()
                .withCompetentAuthorityLevels([CompetentAuthorityLevelType.FEDERAAL])
                .build(), 'bevoegdheid (eigenschappen)'],
        ['competent authorities updated',
            aFullConceptSnapshot()
                .withCompetentAuthorities([BestuurseenheidTestBuilder.BORGLOON_IRI])
                .build(),
            aFullConceptSnapshot()
                .withCompetentAuthorities([BestuurseenheidTestBuilder.HOUTHALEN_HELCHTEREN_IRI])
                .build(), 'bevoegdheid (eigenschappen)'],
        ['competent authorities added',
            aFullConceptSnapshot()
                .withCompetentAuthorities([BestuurseenheidTestBuilder.BORGLOON_IRI])
                .build(),
            aFullConceptSnapshot()
                .withCompetentAuthorities([BestuurseenheidTestBuilder.HOUTHALEN_HELCHTEREN_IRI, BestuurseenheidTestBuilder.BORGLOON_IRI])
                .build(), 'bevoegdheid (eigenschappen)'],
        ['competent authorities removed',
            aFullConceptSnapshot()
                .withCompetentAuthorities([BestuurseenheidTestBuilder.HOUTHALEN_HELCHTEREN_IRI, BestuurseenheidTestBuilder.BORGLOON_IRI])
                .build(),
            aFullConceptSnapshot()
                .withCompetentAuthorities([BestuurseenheidTestBuilder.BORGLOON_IRI])
                .build(), 'bevoegdheid (eigenschappen)'],
        ['executing Authority Level updated',
            aFullConceptSnapshot()
                .withExecutingAuthorityLevels([ExecutingAuthorityLevelType.EUROPEES])
                .build(),
            aFullConceptSnapshot()
                .withExecutingAuthorityLevels([ExecutingAuthorityLevelType.LOKAAL])
                .build(), 'bevoegdheid (eigenschappen)'],
        ['executing Authority Level added',
            aFullConceptSnapshot()
                .withExecutingAuthorityLevels([ExecutingAuthorityLevelType.LOKAAL])
                .build(),
            aFullConceptSnapshot()
                .withExecutingAuthorityLevels([ExecutingAuthorityLevelType.PROVINCIAAL, ExecutingAuthorityLevelType.LOKAAL])
                .build(), 'bevoegdheid (eigenschappen)'],
        ['executing Authority Level removed',
            aFullConceptSnapshot()
                .withExecutingAuthorityLevels([ExecutingAuthorityLevelType.PROVINCIAAL, ExecutingAuthorityLevelType.DERDEN])
                .build(),
            aFullConceptSnapshot()
                .withExecutingAuthorityLevels([ExecutingAuthorityLevelType.DERDEN])
                .build(), 'bevoegdheid (eigenschappen)'],
        ['executing authorities updated',
            aFullConceptSnapshot()
                .withExecutingAuthorities([BestuurseenheidTestBuilder.OUD_HEVERLEE_IRI])
                .build(),
            aFullConceptSnapshot()
                .withExecutingAuthorities([BestuurseenheidTestBuilder.HOUTHALEN_HELCHTEREN_IRI])
                .build(), 'bevoegdheid (eigenschappen)'],
        ['executing authorities added',
            aFullConceptSnapshot()
                .withExecutingAuthorities([BestuurseenheidTestBuilder.HOUTHALEN_HELCHTEREN_IRI])
                .build(),
            aFullConceptSnapshot()
                .withExecutingAuthorities([BestuurseenheidTestBuilder.ASSENEDE_IRI, BestuurseenheidTestBuilder.HOUTHALEN_HELCHTEREN_IRI])
                .build(), 'bevoegdheid (eigenschappen)'],
        ['executing authorities removed',
            aFullConceptSnapshot()
                .withExecutingAuthorities([BestuurseenheidTestBuilder.ASSENEDE_IRI, BestuurseenheidTestBuilder.OUD_HEVERLEE_IRI])
                .build(),
            aFullConceptSnapshot()
                .withExecutingAuthorities([BestuurseenheidTestBuilder.OUD_HEVERLEE_IRI])
                .build(), 'bevoegdheid (eigenschappen)'],
        ['publication medium updated',
            aFullConceptSnapshot()
                .withPublicationMedia([PublicationMediumType.RECHTENVERKENNER])
                .build(),
            aFullConceptSnapshot()
                .withPublicationMedia([PublicationMediumType.YOUREUROPE])
                .build(), 'gerelateerd (eigenschappen)'],
        ['publication medium added',
            aFullConceptSnapshot()
                .withPublicationMedia([PublicationMediumType.RECHTENVERKENNER])
                .build(),
            aFullConceptSnapshot()
                .withPublicationMedia([PublicationMediumType.YOUREUROPE, PublicationMediumType.RECHTENVERKENNER])
                .build(), 'gerelateerd (eigenschappen)'],
        ['publication medium removed',
            aFullConceptSnapshot()
                .withPublicationMedia([PublicationMediumType.RECHTENVERKENNER, PublicationMediumType.YOUREUROPE])
                .build(),
            aFullConceptSnapshot()
                .withPublicationMedia([PublicationMediumType.RECHTENVERKENNER])
                .build(), 'gerelateerd (eigenschappen)'],
        ['your europe category updated',
            aFullConceptSnapshot()
                .withYourEuropeCategories([YourEuropeCategoryType.GOEDERENRECYCLAGE])
                .build(),
            aFullConceptSnapshot()
                .withYourEuropeCategories([YourEuropeCategoryType.BEDRIJFINTELLECTUELEEIGENDOMSRECHTEN])
                .build(), 'gerelateerd (eigenschappen)'],
        ['your europe category added',
            aFullConceptSnapshot()
                .withYourEuropeCategories([YourEuropeCategoryType.BEDRIJFKREDIETVERZEKERING])
                .build(),
            aFullConceptSnapshot()
                .withYourEuropeCategories([YourEuropeCategoryType.BEDRIJFKREDIETVERZEKERING, YourEuropeCategoryType.GEZONDHEIDSZORG])
                .build(), 'gerelateerd (eigenschappen)'],
        ['your europe category removed',
            aFullConceptSnapshot()
                .withYourEuropeCategories([YourEuropeCategoryType.PROCEDUREVERHUIZINGADRESWIJZIGING, YourEuropeCategoryType.ONDERWIJSOFSTAGESTAGE])
                .build(),
            aFullConceptSnapshot()
                .withYourEuropeCategories([YourEuropeCategoryType.PROCEDUREVERHUIZINGADRESWIJZIGING])
                .build(), 'gerelateerd (eigenschappen)'],
        ['keyword updated - nl',
            aFullConceptSnapshot()
                .withKeywords([LanguageString.of('abc')])
                .build(),
            aFullConceptSnapshot()
                .withKeywords([LanguageString.of('def')])
                .build(), 'gerelateerd (eigenschappen)'],
        ['keyword added',
            aFullConceptSnapshot()
                .withKeywords([LanguageString.of('abc')])
                .build(),
            aFullConceptSnapshot()
                .withKeywords([LanguageString.of('abc'), LanguageString.of('def')])
                .build(), 'gerelateerd (eigenschappen)'],
        ['keyword removed',
            aFullConceptSnapshot()
                .withKeywords([LanguageString.of('abc'), LanguageString.of('def')])
                .build(),
            aFullConceptSnapshot()
                .withKeywords([LanguageString.of('abc')])
                .build(), 'gerelateerd (eigenschappen)'],
        ['requirement added',
            aFullConceptSnapshot()
                .withRequirements([])
                .build(),
            aFullConceptSnapshot()
                .withRequirements([aMinimalRequirementForConceptSnapshot().build()])
                .build(), 'voorwaarden'],
        ['requirement removed',
            aFullConceptSnapshot()
                .withRequirements([aMinimalRequirementForConceptSnapshot().build()])
                .build(),
            aFullConceptSnapshot()
                .withRequirements([])
                .build(), 'voorwaarden'],
        ['requirement order changed',
            aFullConceptSnapshot()
                .withRequirements([aMinimalRequirementForConceptSnapshot().withTitle(LanguageString.of('requirement-title-nl-1')).withOrder(1).build(),
                    aMinimalRequirementForConceptSnapshot().withTitle(LanguageString.of('requirement-title-nl-2')).withOrder(2).build()])
                .build(),
            aFullConceptSnapshot()
                .withRequirements([aMinimalRequirementForConceptSnapshot().withTitle(LanguageString.of('requirement-title-nl-2')).withOrder(1).build(),
                    aMinimalRequirementForConceptSnapshot().withTitle(LanguageString.of('requirement-title-nl-1')).withOrder(2).build()])
                .build(), 'voorwaarden'],
        ['requirement title updated: nl added',
            aFullConceptSnapshot()
                .withRequirements([aMinimalRequirementForConceptSnapshot().withTitle(LanguageString.of('requirement-title-nl')).build()])
                .build(),
            aFullConceptSnapshot()
                .withRequirements([aMinimalRequirementForConceptSnapshot().withTitle(LanguageString.of(undefined)).build()])
                .build(), 'voorwaarden'],
        ['requirement title updated: nl removed',
            aFullConceptSnapshot()
                .withRequirements([aMinimalRequirementForConceptSnapshot().withTitle(LanguageString.of('requirement-title-nl')).build()])
                .build(),
            aFullConceptSnapshot()
                .withRequirements([aMinimalRequirementForConceptSnapshot().withTitle(LanguageString.of(undefined)).build()])
                .build(), 'voorwaarden'],
        ['requirement title updated: nl changed',
            aFullConceptSnapshot()
                .withRequirements([aMinimalRequirementForConceptSnapshot().withTitle(LanguageString.of('requirement-title-nl')).build()])
                .build(),
            aFullConceptSnapshot()
                .withRequirements([aMinimalRequirementForConceptSnapshot().withTitle(LanguageString.of('requirement-title-changed')).build()])
                .build(), 'voorwaarden'],
        ['requirement description updated: nl added',
            aFullConceptSnapshot()
                .withRequirements([aMinimalRequirementForConceptSnapshot().withDescription(LanguageString.of()).build()])
                .build(),
            aFullConceptSnapshot()
                .withRequirements([aMinimalRequirementForConceptSnapshot().withDescription(LanguageString.of('requirement-description-nl')).build()])
                .build(), 'voorwaarden'],
        ['requirement description updated: nl removed',
            aFullConceptSnapshot()
                .withRequirements([aMinimalRequirementForConceptSnapshot().withDescription(LanguageString.of('requirement-description-nl')).build()])
                .build(),
            aFullConceptSnapshot()
                .withRequirements([aMinimalRequirementForConceptSnapshot().withDescription(LanguageString.of()).build()])
                .build(), 'voorwaarden'],
        ['requirement description updated: nl changed',
            aFullConceptSnapshot()
                .withRequirements([aMinimalRequirementForConceptSnapshot().withDescription(LanguageString.of('requirement-description-nl')).build()])
                .build(),
            aFullConceptSnapshot()
                .withRequirements([aMinimalRequirementForConceptSnapshot().withDescription(LanguageString.of('requirement-description-changed')).build()])
                .build(), 'voorwaarden'],
        ['requirement > evidence : added',
            aFullConceptSnapshot()
                .withRequirements([aMinimalRequirementForConceptSnapshot().withEvidence(undefined).build()])
                .build(),
            aFullConceptSnapshot()
                .withRequirements([aMinimalRequirementForConceptSnapshot().withEvidence(aFullEvidence().build()).build()])
                .build(), 'voorwaarden'],
        ['requirement > evidence : removed',
            aFullConceptSnapshot()
                .withRequirements([aMinimalRequirementForConceptSnapshot().withEvidence(aFullEvidence().build()).build()])
                .build(),
            aFullConceptSnapshot()
                .withRequirements([aMinimalRequirementForConceptSnapshot().withEvidence(undefined).build()])
                .build(), 'voorwaarden'],
        ['requirement > evidence title updated',
            aFullConceptSnapshot()
                .withRequirements([aMinimalRequirementForConceptSnapshot().withEvidence(aMinimalEvidenceForConceptSnapshot().withTitle(LanguageString.of('evidence title nl')).build()).build()])
                .build(),
            aFullConceptSnapshot()
                .withRequirements([aMinimalRequirementForConceptSnapshot().withEvidence(aMinimalEvidenceForConceptSnapshot().withTitle(LanguageString.of('evidence title nl updated')).build()).build()])
                .build(), 'voorwaarden'],
        ['requirement > evidence description updated',
            aFullConceptSnapshot()
                .withRequirements([aMinimalRequirementForConceptSnapshot().withEvidence(aMinimalEvidenceForConceptSnapshot().withDescription(LanguageString.of('evidence description nl')).build()).build()])
                .build(),
            aFullConceptSnapshot()
                .withRequirements([aMinimalRequirementForConceptSnapshot().withEvidence(aMinimalEvidenceForConceptSnapshot().withDescription(LanguageString.of('evidence description nl updated')).build()).build()])
                .build(), 'voorwaarden'],
        ['procedure added',
            aFullConceptSnapshot()
                .withProcedures([])
                .build(),
            aFullConceptSnapshot()
                .withProcedures([aFullProcedure().build()])
                .build(), 'procedure'],
        ['procedure removed',
            aFullConceptSnapshot()
                .withProcedures([aFullProcedure().build()])
                .build(),
            aFullConceptSnapshot()
                .withProcedures([])
                .build(), 'procedure'],
        ['procedure order changed',
            aFullConceptSnapshot()
                .withProcedures([aFullProcedure().withTitle(LanguageString.of('procedure title nl')).withOrder(1).build(),
                    aFullProcedure().withTitle(LanguageString.of('procedure title nl another')).withOrder(2).build()])
                .build(),
            aFullConceptSnapshot()
                .withProcedures([aFullProcedure().withTitle(LanguageString.of('procedure title nl another')).withOrder(1).build(),
                    aFullProcedure().withTitle(LanguageString.of('procedure title nl')).withOrder(2).build()])
                .build(), 'procedure'],
        ['procedure title updated',
            aFullConceptSnapshot()
                .withProcedures([aFullProcedure().withTitle(LanguageString.of('procedure title nl')).build()])
                .build(),
            aFullConceptSnapshot()
                .withProcedures([aFullProcedure().withTitle(LanguageString.of('procedure title nl updated')).build()])
                .build(), 'procedure'],
        ['procedure description updated',
            aFullConceptSnapshot()
                .withProcedures([aFullProcedure().withDescription(LanguageString.of('procedure description nl')).build()])
                .build(),
            aFullConceptSnapshot()
                .withProcedures([aFullProcedure().withDescription(LanguageString.of('procedure description nl updated')).build()])
                .build(), 'procedure'],
        ['procedure website title updated',
            aFullConceptSnapshot()
                .withProcedures([aFullProcedure().withWebsites([aMinimalWebsiteForConceptSnapshot().withTitle(LanguageString.of('procedure website title nl')).build()]).build()])
                .build(),
            aFullConceptSnapshot()
                .withProcedures([aFullProcedure().withWebsites([aMinimalWebsiteForConceptSnapshot().withTitle(LanguageString.of('procedure website title nl updated')).build()]).build()])
                .build(), 'procedure'],
        ['procedure website description updated',
            aFullConceptSnapshot()
                .withProcedures([aFullProcedure().withWebsites([aMinimalWebsiteForConceptSnapshot().withDescription(LanguageString.of('procedure website description nl')).build()]).build()])
                .build(),
            aFullConceptSnapshot()
                .withProcedures([aFullProcedure().withWebsites([aMinimalWebsiteForConceptSnapshot().withDescription(LanguageString.of('procedure website description nl updated')).build()]).build()])
                .build(), 'procedure'],
        ['procedure website description added',
            aFullConceptSnapshot()
                .withProcedures([aFullProcedure().withWebsites([aMinimalWebsiteForConceptSnapshot().withDescription(undefined).build()]).build()])
                .build(),
            aFullConceptSnapshot()
                .withProcedures([aFullProcedure().withWebsites([aMinimalWebsiteForConceptSnapshot().withDescription(LanguageString.of('procedure website description nl')).build()]).build()])
                .build(), 'procedure'],
        ['procedure website description removed',
            aFullConceptSnapshot()
                .withProcedures([aFullProcedure().withWebsites([aMinimalWebsiteForConceptSnapshot().withDescription(LanguageString.of('procedure website description nl')).build()]).build()])
                .build(),
            aFullConceptSnapshot()
                .withProcedures([aFullProcedure().withWebsites([aMinimalWebsiteForConceptSnapshot().withDescription(undefined).build()]).build()])
                .build(), 'procedure'],
        ['procedure website url updated',
            aFullConceptSnapshot()
                .withProcedures([aFullProcedure().withWebsites([aMinimalWebsiteForConceptSnapshot().withUrl('https://url1.com').build()]).build()])
                .build(),
            aFullConceptSnapshot()
                .withProcedures([aFullProcedure().withWebsites([aMinimalWebsiteForConceptSnapshot().withUrl('https://url2.com').build()]).build()])
                .build(), 'procedure'],
        ['procedure website added',
            aFullConceptSnapshot()
                .withProcedures([aFullProcedure().withWebsites([]).build()])
                .build(),
            aFullConceptSnapshot()
                .withProcedures([aFullProcedure().withWebsites([aFullWebsite().build()]).build()])
                .build(), 'procedure'],
        ['procedure website removed',
            aFullConceptSnapshot()
                .withProcedures([aFullProcedure().withWebsites([aFullWebsite().build()]).build()])
                .build(),
            aFullConceptSnapshot()
                .withProcedures([aFullProcedure().withWebsites([]).build()])
                .build(), 'procedure'],
        ['procedure website order changed',
            aFullConceptSnapshot()
                .withProcedures([aFullProcedure().withWebsites([aMinimalWebsiteForConceptSnapshot().withUrl('https://url1.com').withOrder(1).build(), aMinimalWebsiteForConceptSnapshot().withUrl('https://url2.com').withOrder(2).build()]).build()])
                .build(),
            aFullConceptSnapshot()
                .withProcedures([aFullProcedure().withWebsites([aMinimalWebsiteForConceptSnapshot().withUrl('https://url2.com').withOrder(1).build(), aMinimalWebsiteForConceptSnapshot().withUrl('https://url1.com').withOrder(2).build()]).build()])
                .build(), 'procedure'],
        ['website added',
            aFullConceptSnapshot()
                .withWebsites([])
                .build(),
            aFullConceptSnapshot()
                .withWebsites([aFullWebsite().build()])
                .build(), 'meer info'],
        ['website removed',
            aFullConceptSnapshot()
                .withWebsites([aFullWebsite().build()])
                .build(),
            aFullConceptSnapshot()
                .withWebsites([])
                .build(), 'meer info'],
        ['website title updated',
            aFullConceptSnapshot()
                .withWebsites([aMinimalWebsiteForConceptSnapshot().withTitle(LanguageString.of('website title nl')).build()])
                .build(),
            aFullConceptSnapshot()
                .withWebsites([aMinimalWebsiteForConceptSnapshot().withTitle(LanguageString.of('website title nl updated')).build()])
                .build(), 'meer info'],
        ['website description updated',
            aFullConceptSnapshot()
                .withWebsites([aMinimalWebsiteForConceptSnapshot().withDescription(LanguageString.of('website description nl')).build()])
                .build(),
            aFullConceptSnapshot()
                .withWebsites([aMinimalWebsiteForConceptSnapshot().withDescription(LanguageString.of('website description nl updated')).build()])
                .build(), 'meer info'],
        ['website description added',
            aFullConceptSnapshot()
                .withWebsites([aMinimalWebsiteForConceptSnapshot().withDescription(undefined).build()])
                .build(),
            aFullConceptSnapshot()
                .withWebsites([aMinimalWebsiteForConceptSnapshot().withDescription(LanguageString.of('website description nl')).build()])
                .build(), 'meer info'],
        ['website description removed',
            aFullConceptSnapshot()
                .withWebsites([aMinimalWebsiteForConceptSnapshot().withDescription(LanguageString.of('website description nl')).build()])
                .build(),
            aFullConceptSnapshot()
                .withWebsites([aMinimalWebsiteForConceptSnapshot().withDescription(undefined).build()])
                .build(), 'meer info'],
        ['website url updated',
            aFullConceptSnapshot()
                .withWebsites([aMinimalWebsiteForConceptSnapshot().withUrl('https://url1.com').build()])
                .build(),
            aFullConceptSnapshot()
                .withWebsites([aMinimalWebsiteForConceptSnapshot().withUrl('https://url2.com').build()])
                .build(), 'meer info'],
        ['website order changed',
            aFullConceptSnapshot()
                .withWebsites([aMinimalWebsiteForConceptSnapshot().withUrl('https://url1.com').withOrder(1).build(), aMinimalWebsiteForConceptSnapshot().withUrl('https://url2.com').withOrder(2).build()])
                .build(),
            aFullConceptSnapshot()
                .withWebsites([aMinimalWebsiteForConceptSnapshot().withUrl('https://url2.com').withOrder(1).build(), aMinimalWebsiteForConceptSnapshot().withUrl('https://url1.com').withOrder(2).build()])
                .build(), 'meer info'],
        ['cost added',
            aFullConceptSnapshot()
                .withCosts([])
                .build(),
            aFullConceptSnapshot()
                .withCosts([aFullCost().build()])
                .build(), 'kosten'],
        ['cost removed',
            aFullConceptSnapshot()
                .withCosts([aFullCost().build()])
                .build(),
            aFullConceptSnapshot()
                .withCosts([])
                .build(), 'kosten'],
        ['cost title updated',
            aFullConceptSnapshot()
                .withCosts([aFullCost().withTitle(LanguageString.of('cost title nl')).build()])
                .build(),
            aFullConceptSnapshot()
                .withCosts([aFullCost().withTitle(LanguageString.of('cost title nl updated')).build()])
                .build(), 'kosten'],
        ['cost description updated',
            aFullConceptSnapshot()
                .withCosts([aFullCost().withDescription(LanguageString.of('cost description nl')).build()])
                .build(),
            aFullConceptSnapshot()
                .withCosts([aFullCost().withDescription(LanguageString.of('cost description nl updated')).build()])
                .build(), 'kosten'],
        ['cost order changed',
            aFullConceptSnapshot()
                .withCosts([aFullCost().withTitle(LanguageString.of('cost title 1 nl')).withOrder(1).build(), aFullCost().withTitle(LanguageString.of('cost title 2 nl')).withOrder(2).build()])
                .build(),
            aFullConceptSnapshot()
                .withCosts([aFullCost().withTitle(LanguageString.of('cost title 2 nl')).withOrder(1).build(), aFullCost().withTitle(LanguageString.of('cost title 1 nl')).withOrder(2).build()])
                .build(), 'kosten'],
        ['financial advantage added',
            aFullConceptSnapshot()
                .withFinancialAdvantages([])
                .build(),
            aFullConceptSnapshot()
                .withFinancialAdvantages([aFullFinancialAdvantage().build()])
                .build(), 'financiële voordelen'],
        ['financial advantage removed',
            aFullConceptSnapshot()
                .withFinancialAdvantages([aFullFinancialAdvantage().build()])
                .build(),
            aFullConceptSnapshot()
                .withFinancialAdvantages([])
                .build(), 'financiële voordelen'],
        ['financial advantage title updated',
            aFullConceptSnapshot()
                .withFinancialAdvantages([aFullFinancialAdvantage().withTitle(LanguageString.of('financial advantage title nl')).build()])
                .build(),
            aFullConceptSnapshot()
                .withFinancialAdvantages([aFullFinancialAdvantage().withTitle(LanguageString.of('financial advantage title nl updated')).build()])
                .build(), 'financiële voordelen'],
        ['financial advantage description updated',
            aFullConceptSnapshot()
                .withFinancialAdvantages([aFullFinancialAdvantage().withDescription(LanguageString.of('financial advantage description nl')).build()])
                .build(),
            aFullConceptSnapshot()
                .withFinancialAdvantages([aFullFinancialAdvantage().withDescription(LanguageString.of('financial advantage description nl updated')).build()])
                .build(), 'financiële voordelen'],
        ['financial advantage order changed',
            aFullConceptSnapshot()
                .withFinancialAdvantages([aFullFinancialAdvantage().withTitle(LanguageString.of('financial advantage title 1 nl')).withOrder(1).build(), aFullFinancialAdvantage().withTitle(LanguageString.of('financial advantage title 2 nl')).withOrder(2).build()])
                .build(),
            aFullConceptSnapshot()
                .withFinancialAdvantages([aFullFinancialAdvantage().withTitle(LanguageString.of('financial advantage title 2 nl')).withOrder(1).build(), aFullFinancialAdvantage().withTitle(LanguageString.of('financial advantage title 1 nl')).withOrder(2).build()])
                .build(), 'financiële voordelen'],
        ['legal resource added',
            aFullConceptSnapshot()
                .withLegalResources([])
                .build(),
            aFullConceptSnapshot()
                .withLegalResources([aFullLegalResourceForConceptSnapshot().build()])
                .build(), 'regelgeving'],
        ['legal resource removed',
            aFullConceptSnapshot()
                .withLegalResources([aFullLegalResourceForConceptSnapshot().build()])
                .build(),
            aFullConceptSnapshot()
                .withLegalResources([])
                .build(), 'regelgeving'],
        ['legal resource title updated',
            aFullConceptSnapshot()
                .withLegalResources([aFullLegalResourceForConceptSnapshot().withTitle(LanguageString.of('legal resource title nl')).build()])
                .build(),
            aFullConceptSnapshot()
                .withLegalResources([aFullLegalResourceForConceptSnapshot().withTitle(LanguageString.of('legal resource title nl updated')).build()])
                .build(), 'regelgeving'],
        ['legal resource description updated',
            aFullConceptSnapshot()
                .withLegalResources([aFullLegalResourceForConceptSnapshot().withDescription(LanguageString.of('legal resource description nl')).build()])
                .build(),
            aFullConceptSnapshot()
                .withLegalResources([aFullLegalResourceForConceptSnapshot().withDescription(LanguageString.of('legal resource description nl updated')).build()])
                .build(), 'regelgeving'],
        ['legal resource url updated',
            aFullConceptSnapshot()
                .withLegalResources([aFullLegalResourceForConceptSnapshot().withUrl(buildCodexVlaanderenIri('1234').value).build()])
                .build(),
            aFullConceptSnapshot()
                .withLegalResources([aFullLegalResourceForConceptSnapshot().withUrl(buildCodexVlaanderenIri('12345').value).build()])
                .build(), 'regelgeving'],
        ['legal resource order changed',
            aFullConceptSnapshot()
                .withLegalResources([aFullLegalResourceForConceptSnapshot().withTitle(LanguageString.of('legal resource title 1')).withOrder(1).build(), aFullLegalResourceForConceptSnapshot().withTitle(LanguageString.of('legal resource title 2')).withOrder(2).build()])
                .build(),
            aFullConceptSnapshot()
                .withLegalResources([aFullLegalResourceForConceptSnapshot().withTitle(LanguageString.of('legal resource title 2')).withOrder(1).build(), aFullLegalResourceForConceptSnapshot().withTitle(LanguageString.of('legal resource title 1')).withOrder(2).build()])
                .build(), 'regelgeving'],
        ['is archived changed',
            aFullConceptSnapshot()
                .withIsArchived(false)
                .build(),
            aFullConceptSnapshot()
                .withIsArchived(true)
                .build(), 'gearchiveerd'],

    ];

    for (const testCase of functionallyChangedTestCases) {
        test(`functionally changed when ${testCase[0]}`, () => {
            expect(ConceptSnapshot.isFunctionallyChanged(testCase[1], testCase[2])).toEqual([testCase[3]]);
        });
    }

    test('functionally changed returns in a fixed order', () => {
        const conceptSnapshot = aFullConceptSnapshot()
            .withTitle(LanguageString.of("title-nl"))
            .withDescription(LanguageString.of("description-nl"))
            .withAdditionalDescription(LanguageString.of("additionalDescription-nl"))
            .withException(LanguageString.of("exception-nl"))
            .withRegulation(LanguageString.of("regulation-nl"))
            .withLegalResources([aFullLegalResourceForConceptSnapshot().build()])
            .withStartDate(FormatPreservingDate.of('2023-10-28T00:00:00.000Z'))
            .withEndDate(FormatPreservingDate.of('2023-10-28T00:00:00.002Z'))
            .withType(ProductType.FINANCIEELVOORDEEL)
            .withTargetAudiences([TargetAudienceType.BURGER])
            .withThemes([ThemeType.BOUWENWONEN])
            .withCompetentAuthorityLevels([CompetentAuthorityLevelType.EUROPEES])
            .withCompetentAuthorities([BestuurseenheidTestBuilder.PEPINGEN_IRI])
            .withExecutingAuthorityLevels([ExecutingAuthorityLevelType.VLAAMS])
            .withExecutingAuthorities([BestuurseenheidTestBuilder.ASSENEDE_IRI])
            .withPublicationMedia([PublicationMediumType.RECHTENVERKENNER])
            .withYourEuropeCategories([YourEuropeCategoryType.BEDRIJFAANSPRAKELIJKHEIDBESTUURDERS])
            .withKeywords([LanguageString.of('keyword')])
            .withRequirements([aFullRequirement().build()])
            .withProcedures([aFullProcedure().build()])
            .withWebsites([aFullWebsite().build()])
            .withCosts([aFullCost().build()])
            .withFinancialAdvantages([aFullFinancialAdvantage().build()])
            .withIsArchived(false)
            .build();

        const anotherConceptSnapshot = aFullConceptSnapshot()
            .withTitle(LanguageString.of("title-nl-changed"))
            .withDescription(LanguageString.of("description-nl-changed"))
            .withAdditionalDescription(LanguageString.of("additionalDescription-nl-changed"))
            .withException(LanguageString.of("exception-nl-changed"))
            .withRegulation(LanguageString.of("regulation-nl-changed"))
            .withLegalResources([])
            .withStartDate(FormatPreservingDate.of('2023-10-28T00:00:00.001Z'))
            .withEndDate(FormatPreservingDate.of('2023-10-28T00:00:00.003Z'))
            .withType(ProductType.BEWIJS)
            .withTargetAudiences([TargetAudienceType.ORGANISATIE])
            .withThemes([ThemeType.BURGEROVERHEID])
            .withCompetentAuthorityLevels([CompetentAuthorityLevelType.LOKAAL])
            .withCompetentAuthorities([BestuurseenheidTestBuilder.BORGLOON_IRI])
            .withExecutingAuthorityLevels([ExecutingAuthorityLevelType.FEDERAAL])
            .withExecutingAuthorities([BestuurseenheidTestBuilder.HOUTHALEN_HELCHTEREN_IRI])
            .withPublicationMedia([PublicationMediumType.YOUREUROPE])
            .withYourEuropeCategories([YourEuropeCategoryType.GEZONDHEIDVEILIGHEIDWERK])
            .withKeywords([LanguageString.of('keyword-changed')])
            .withRequirements([])
            .withProcedures([])
            .withWebsites([])
            .withCosts([])
            .withFinancialAdvantages([])
            .withIsArchived(true)
            .build();


        expect(ConceptSnapshot.isFunctionallyChanged(conceptSnapshot, anotherConceptSnapshot))
            .toEqual([
                'basisinformatie',
                'voorwaarden',
                'procedure',
                'kosten',
                'financiële voordelen',
                'regelgeving',
                'meer info',
                'algemene info (eigenschappen)',
                'bevoegdheid (eigenschappen)',
                'gerelateerd (eigenschappen)',
                'gearchiveerd'
            ]);

    });


});


test('defined languages', () => {
    const aConceptSnapshot =
        aFullConceptSnapshot()
            .withTitle(
                LanguageString.of(
                    ConceptTestBuilder.TITLE_NL,
                    ConceptTestBuilder.TITLE_NL_FORMAL,
                    ConceptTestBuilder.TITLE_NL_INFORMAL,
                    ConceptTestBuilder.TITLE_NL_GENERATED_FORMAL,
                    ConceptTestBuilder.TITLE_NL_GENERATED_INFORMAL))
            .build();

    expect(aConceptSnapshot.definedLanguages).toEqual([
        Language.NL,
        Language.FORMAL,
        Language.INFORMAL,
        Language.GENERATED_FORMAL,
        Language.GENERATED_INFORMAL
    ]);
});

describe('builder', () => {

    test("from copies all fields", () => {
        const conceptSnapshot = aFullConceptSnapshot().build();
        const fromConceptSnapshot = ConceptSnapshotBuilder.from(conceptSnapshot).build();

        expect(fromConceptSnapshot).toEqual(conceptSnapshot);

    });
});

test('transform language for full concept snapshot', () => {
    const aConceptSnapshot =
        aFullConceptSnapshot()
            .build();

    expect(aConceptSnapshot.transformLanguage(Language.GENERATED_INFORMAL, Language.INFORMAL)).toEqual(
        ConceptSnapshotBuilder.from(aConceptSnapshot)
            .withTitle(LanguageString.ofValueInLanguage(ConceptSnapshotTestBuilder.TITLE_NL_GENERATED_INFORMAL, Language.INFORMAL))
            .withDescription(LanguageString.ofValueInLanguage(ConceptSnapshotTestBuilder.DESCRIPTION_NL_GENERATED_INFORMAL, Language.INFORMAL))
            .withAdditionalDescription(LanguageString.ofValueInLanguage(ConceptSnapshotTestBuilder.ADDITIONAL_DESCRIPTION_NL_GENERATED_INFORMAL, Language.INFORMAL))
            .withException(LanguageString.ofValueInLanguage(ConceptSnapshotTestBuilder.EXCEPTION_NL_GENERATED_INFORMAL, Language.INFORMAL))
            .withRegulation(LanguageString.ofValueInLanguage(ConceptSnapshotTestBuilder.REGULATION_NL_GENERATED_INFORMAL, Language.INFORMAL))
            .withRequirements(
                [0, 1].map(index => RequirementBuilder.from(aConceptSnapshot.requirements[index])
                    .withTitle(LanguageString.ofValueInLanguage(aConceptSnapshot.requirements[index].title.nlGeneratedInformal, Language.INFORMAL))
                    .withDescription(LanguageString.ofValueInLanguage(aConceptSnapshot.requirements[index].description.nlGeneratedInformal, Language.INFORMAL))
                    .withEvidence(EvidenceBuilder.from(aConceptSnapshot.requirements[index].evidence)
                        .withTitle(LanguageString.ofValueInLanguage(aConceptSnapshot.requirements[index].evidence.title.nlGeneratedInformal, Language.INFORMAL))
                        .withDescription(LanguageString.ofValueInLanguage(aConceptSnapshot.requirements[index].evidence.description.nlGeneratedInformal, Language.INFORMAL))
                        .build())
                    .build()))
            .withProcedures(
                [0, 1].map(index => ProcedureBuilder.from(aConceptSnapshot.procedures[index])
                    .withTitle(LanguageString.ofValueInLanguage(aConceptSnapshot.procedures[index].title.nlGeneratedInformal, Language.INFORMAL))
                    .withDescription(LanguageString.ofValueInLanguage(aConceptSnapshot.procedures[index].description.nlGeneratedInformal, Language.INFORMAL))
                    .withWebsites(
                        [0, 1].map(innerIndex => WebsiteBuilder.from(aConceptSnapshot.procedures[index].websites[innerIndex])
                            .withTitle(LanguageString.ofValueInLanguage(aConceptSnapshot.procedures[index].websites[innerIndex].title.nlGeneratedInformal, Language.INFORMAL))
                            .withDescription(LanguageString.ofValueInLanguage(aConceptSnapshot.procedures[index].websites[innerIndex].description.nlGeneratedInformal, Language.INFORMAL))
                            .build()))
                    .build()))
            .withWebsites(
                [0, 1].map(index => WebsiteBuilder.from(aConceptSnapshot.websites[index])
                    .withTitle(LanguageString.ofValueInLanguage(aConceptSnapshot.websites[index].title.nlGeneratedInformal, Language.INFORMAL))
                    .withDescription(LanguageString.ofValueInLanguage(aConceptSnapshot.websites[index].description.nlGeneratedInformal, Language.INFORMAL))
                    .build()))
            .withCosts(
                [0, 1].map(index => CostBuilder.from(aConceptSnapshot.costs[index])
                    .withTitle(LanguageString.ofValueInLanguage(aConceptSnapshot.costs[index].title.nlGeneratedInformal, Language.INFORMAL))
                    .withDescription(LanguageString.ofValueInLanguage(aConceptSnapshot.costs[index].description.nlGeneratedInformal, Language.INFORMAL))
                    .build()))
            .withFinancialAdvantages(
                [0, 1].map(index => FinancialAdvantageBuilder.from(aConceptSnapshot.financialAdvantages[index])
                    .withTitle(LanguageString.ofValueInLanguage(aConceptSnapshot.financialAdvantages[index].title.nlGeneratedInformal, Language.INFORMAL))
                    .withDescription(LanguageString.ofValueInLanguage(aConceptSnapshot.financialAdvantages[index].description.nlGeneratedInformal, Language.INFORMAL))
                    .build()))
            .withLegalResources(
                [0, 1].map(index => LegalResourceBuilder.from(aConceptSnapshot.legalResources[index])
                    .withTitle(LanguageString.ofValueInLanguage(aConceptSnapshot.legalResources[index].title.nlGeneratedInformal, Language.INFORMAL))
                    .withDescription(LanguageString.ofValueInLanguage(aConceptSnapshot.legalResources[index].description.nlGeneratedInformal, Language.INFORMAL))
                    .build()))
            .build());

});

test('transform language for minimal concept snapshot', () => {

    const aMinimalConceptSnapshotInNLOnly = aMinimalConceptSnapshot().build();
    expect(aMinimalConceptSnapshotInNLOnly.transformLanguage(Language.GENERATED_INFORMAL, Language.INFORMAL)).toEqual(
        ConceptSnapshotBuilder.from(aMinimalConceptSnapshotInNLOnly)
            .withTitle(LanguageString.ofValueInLanguage(undefined, Language.INFORMAL))
            .withDescription(LanguageString.ofValueInLanguage(undefined, Language.INFORMAL))
            .build());

    const aMinimalConceptSnapshotInRequestedLanguage =
        aMinimalConceptSnapshot()
            .withTitle(LanguageString.ofValueInLanguage('title', Language.GENERATED_INFORMAL))
            .withDescription(LanguageString.ofValueInLanguage('description', Language.GENERATED_INFORMAL))
            .build();
    expect(aMinimalConceptSnapshotInRequestedLanguage.transformLanguage(Language.GENERATED_INFORMAL, Language.INFORMAL)).toEqual(
        ConceptSnapshotBuilder.from(aMinimalConceptSnapshotInRequestedLanguage)
            .withTitle(LanguageString.ofValueInLanguage('title', Language.INFORMAL))
            .withDescription(LanguageString.ofValueInLanguage('description', Language.INFORMAL))
            .build());

});

test('sanitized keywords', () => {
    const aConceptSnapshot = aMinimalConceptSnapshot()
        .withKeywords(
            [
                LanguageString.ofValueInLanguage('nl', Language.NL),
                LanguageString.ofValueInLanguage('nl-formal', Language.FORMAL),
                LanguageString.ofValueInLanguage('nl-informal', Language.INFORMAL),
                LanguageString.ofValueInLanguage('nl-generated-informal', Language.GENERATED_INFORMAL),
                LanguageString.ofValueInLanguage('nl-generated-formal', Language.GENERATED_FORMAL),
            ])
        .build();

    expect(aConceptSnapshot.keywords).toEqual([LanguageString.ofValueInLanguage('nl', Language.NL)]);
});