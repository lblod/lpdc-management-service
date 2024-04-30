import {LanguageString} from "../../../src/core/domain/language-string";
import {aFullConcept, ConceptTestBuilder} from "./concept-test-builder";
import {Language} from "../../../src/core/domain/language";
import {buildConceptSnapshotIri} from "./iri-test-builder";
import {uuid} from "../../../mu-helper";
import {aMinimalCostForConcept, CostTestBuilder} from "./cost-test-builder";
import {Cost, CostBuilder} from "../../../src/core/domain/cost";
import {aMinimalLanguageString} from "./language-string-test-builder";
import {FinancialAdvantage, FinancialAdvantageBuilder} from "../../../src/core/domain/financial-advantage";
import {aMinimalFinancialAdvantageForConcept, FinancialAdvantageTestBuilder} from "./financial-advantage-test-builder";
import {Requirement, RequirementBuilder} from "../../../src/core/domain/requirement";
import {aFullRequirement, aMinimalRequirementForConcept, RequirementTestBuilder} from "./requirement-test-builder";
import {Evidence, EvidenceBuilder} from "../../../src/core/domain/evidence";
import {EvidenceTestBuilder} from "./evidence-test-builder";
import {Procedure, ProcedureBuilder} from "../../../src/core/domain/procedure";
import {aMinimalProcedureForConcept, ProcedureTestBuilder} from "./procedure-test-builder";
import {Website, WebsiteBuilder} from "../../../src/core/domain/website";
import {aMinimalWebsiteForConcept, WebsiteTestBuilder} from "./website-test-builder";
import {Iri} from "../../../src/core/domain/shared/iri";
import {
    CompetentAuthorityLevelType,
    ConceptTagType,
    ExecutingAuthorityLevelType,
    PublicationMediumType,
    TargetAudienceType,
    ThemeType,
    YourEuropeCategoryType
} from "../../../src/core/domain/types";
import {BestuurseenheidTestBuilder} from "./bestuurseenheid-test-builder";
import {LegalResource, LegalResourceBuilder} from "../../../src/core/domain/legal-resource";
import {aFullLegalResourceForConcept, LegalResourceTestBuilder} from "./legal-resource-test-builder";
import {InvariantError} from "../../../src/core/domain/shared/lpdc-error";

describe('constructing', () => {

    test('keywords are sorted', () => {
        const aConcept =
            aFullConcept()
                .withKeywords([
                    LanguageString.of('def'),
                    LanguageString.of('abc')
                ])
                .build();

        expect(aConcept.keywords).toEqual([
            LanguageString.of('abc'),
            LanguageString.of('def')
        ]);
    });

    test('concept nl languages', () => {
        const aConcept =
            aFullConcept()
                .withTitle(
                    LanguageString.of(
                        ConceptTestBuilder.TITLE_NL,
                        ConceptTestBuilder.TITLE_NL_FORMAL,
                        ConceptTestBuilder.TITLE_NL_INFORMAL,
                        ConceptTestBuilder.TITLE_NL_GENERATED_FORMAL,
                        ConceptTestBuilder.TITLE_NL_GENERATED_INFORMAL))
                .build();

        expect(aConcept.conceptLanguages).toEqual([
            Language.NL,
            Language.FORMAL,
            Language.INFORMAL,
            Language.GENERATED_FORMAL,
            Language.GENERATED_INFORMAL
        ]);
    });

    test('applied concept snapshots', () => {
        const latestConceptSnapshot = buildConceptSnapshotIri('a');
        const previousConceptSnapshot1 = buildConceptSnapshotIri('b');
        const previousConceptSnapshot2 = buildConceptSnapshotIri('c');
        const aConcept =
            aFullConcept()
                .withLatestConceptSnapshot(latestConceptSnapshot)
                .withPreviousConceptSnapshots([previousConceptSnapshot1, previousConceptSnapshot2])
                .build();

        expect(aConcept.appliedConceptSnapshots).toEqual([latestConceptSnapshot, previousConceptSnapshot1, previousConceptSnapshot2]);
    });

    test('Undefined id throws error', () => {
        expect(() => aFullConcept().withId(undefined).build()).toThrowWithMessage(InvariantError, 'id mag niet ontbreken');
    });

    test('Invalid iri id throws error', () => {
        expect(() => aFullConcept().withId(new Iri('  ')).build()).toThrowWithMessage(InvariantError, 'iri mag niet leeg zijn');
    });

    test('Undefined uuid throws error', () => {
        expect(() => aFullConcept().withUuid(undefined).build()).toThrowWithMessage(InvariantError, 'uuid mag niet ontbreken');
    });

    test('Blank uuid throws error', () => {
        expect(() => aFullConcept().withUuid('   ').build()).toThrowWithMessage(InvariantError, 'uuid mag niet leeg zijn');
    });

    test('Undefined title throws error', () => {
        expect(() => aFullConcept().withTitle(undefined).build()).toThrowWithMessage(InvariantError, 'title mag niet ontbreken');
    });

    test('Undefined description throws error', () => {
        expect(() => aFullConcept().withDescription(undefined).build()).toThrowWithMessage(InvariantError, 'description mag niet ontbreken');
    });

    test('Undefined isArchived throws error', () => {
        expect(() => aFullConcept().withIsArchived(undefined).build()).toThrowWithMessage(InvariantError, 'isArchived mag niet ontbreken');
    });

    test('Undefined productId throws error', () => {
        expect(() => aFullConcept().withProductId(undefined).build()).toThrowWithMessage(InvariantError, 'productId mag niet ontbreken');
    });

    test('Blank productId throws error', () => {
        expect(() => aFullConcept().withProductId('   ').build()).toThrowWithMessage(InvariantError, 'productId mag niet leeg zijn');
    });

    test('Undefined latestConceptSnapshot throws error', () => {
        expect(() => aFullConcept().withLatestConceptSnapshot(undefined).build()).toThrowWithMessage(InvariantError, 'latestConceptSnapshot mag niet ontbreken');
    });

    test('invalid Iri latestConceptSnapshot throws error', () => {
        expect(() => aFullConcept().withLatestConceptSnapshot(new Iri('   ')).build()).toThrowWithMessage(InvariantError, 'iri mag niet leeg zijn');
    });

    test('Undefined LatestFunctionallyChangedConceptSnapshot throws error', () => {
        expect(() => aFullConcept().withLatestFunctionallyChangedConceptSnapshot(undefined).build()).toThrowWithMessage(InvariantError, 'latestFunctionallyChangedConceptSnapshot mag niet ontbreken');
    });

    test('invalid Iri LatestFunctionallyChangedConceptSnapshot throws error', () => {
        expect(() => aFullConcept().withLatestFunctionallyChangedConceptSnapshot(new Iri('   ')).build()).toThrowWithMessage(InvariantError, 'iri mag niet leeg zijn');
    });

    test('TargetAudience with duplicates throws error', () => {
        const conceptTestBuilder = aFullConcept().withTargetAudiences([TargetAudienceType.BURGER, TargetAudienceType.BURGER]);
        expect(() => conceptTestBuilder.build()).toThrowWithMessage(InvariantError, 'targetAudiences mag geen duplicaten bevatten');
    });

    test('Themes with duplicates throws error', () => {
        const conceptTestBuilder = aFullConcept().withThemes([ThemeType.BOUWENWONEN, ThemeType.BOUWENWONEN]);
        expect(() => conceptTestBuilder.build()).toThrowWithMessage(InvariantError, 'themes mag geen duplicaten bevatten');
    });

    test('CompetentAuthorityLevels with duplicates throws error', () => {
        const conceptTestBuilder = aFullConcept().withCompetentAuthorityLevels([CompetentAuthorityLevelType.EUROPEES, CompetentAuthorityLevelType.EUROPEES]);
        expect(() => conceptTestBuilder.build()).toThrowWithMessage(InvariantError, 'competentAuthorityLevels mag geen duplicaten bevatten');
    });

    test('CompetentAuthorities with duplicates throws error', () => {
        const conceptTestBuilder = aFullConcept().withCompetentAuthorities([BestuurseenheidTestBuilder.PEPINGEN_IRI, BestuurseenheidTestBuilder.PEPINGEN_IRI]);
        expect(() => conceptTestBuilder.build()).toThrowWithMessage(InvariantError, 'competentAuthorities mag geen duplicaten bevatten');
    });

    test('ExecutingAuthorityLevels with duplicates throws error', () => {
        const conceptTestBuilder = aFullConcept().withExecutingAuthorityLevels([ExecutingAuthorityLevelType.LOKAAL, ExecutingAuthorityLevelType.LOKAAL]);
        expect(() => conceptTestBuilder.build()).toThrowWithMessage(InvariantError, 'executingAuthorityLevels mag geen duplicaten bevatten');
    });

    test('ExecutingAuthorities with duplicates throws error', () => {
        const conceptTestBuilder = aFullConcept().withExecutingAuthorities([BestuurseenheidTestBuilder.PEPINGEN_IRI, BestuurseenheidTestBuilder.PEPINGEN_IRI]);
        expect(() => conceptTestBuilder.build()).toThrowWithMessage(InvariantError, 'executingAuthorities mag geen duplicaten bevatten');
    });

    test('PublicationMedia with duplicates throws error', () => {
        const conceptTestBuilder = aFullConcept().withPublicationMedia([PublicationMediumType.YOUREUROPE, PublicationMediumType.YOUREUROPE]);
        expect(() => conceptTestBuilder.build()).toThrowWithMessage(InvariantError, 'publicationMedia mag geen duplicaten bevatten');
    });

    test('YourEuropeCategories with duplicates throws error', () => {
        const conceptTestBuilder = aFullConcept().withYourEuropeCategories([YourEuropeCategoryType.BEDRIJF, YourEuropeCategoryType.BEDRIJF]);
        expect(() => conceptTestBuilder.build()).toThrowWithMessage(InvariantError, 'yourEuropeCategories mag geen duplicaten bevatten');
    });

    test('keywords with duplicates throws error', () => {
        const conceptTestBuilder = aFullConcept().withKeywords([LanguageString.of('overlijden'), LanguageString.of('overlijden')]);
        expect(() => conceptTestBuilder.build()).toThrowWithMessage(InvariantError, 'keywords mag geen duplicaten bevatten');
    });

    test('keywords with other nl language throws error', () => {
        const conceptTestBuilder = aFullConcept().withKeywords([LanguageString.of(undefined, 'overlijden'), LanguageString.of(undefined, 'geboorte')]);
        expect(() => conceptTestBuilder.build()).toThrowWithMessage(InvariantError, 'De nl-taal verschilt van nl');
    });

    test('previousConceptSnapshots with duplicates throws error', () => {
        const iri = uuid();
        const conceptTestBuilder = aFullConcept().withPreviousConceptSnapshots([buildConceptSnapshotIri(iri), buildConceptSnapshotIri(iri)]);
        expect(() => conceptTestBuilder.build()).toThrowWithMessage(InvariantError, 'previousConceptSnapshots mag geen duplicaten bevatten');
    });

    test('conceptTags with duplicates throws error', () => {
        const conceptTestBuilder = aFullConcept().withConceptTags([ConceptTagType.YOUREUROPEVERPLICHT, ConceptTagType.YOUREUROPEVERPLICHT]);
        expect(() => conceptTestBuilder.build()).toThrowWithMessage(InvariantError, 'conceptTags mag geen duplicaten bevatten');
    });

    describe('cost ', () => {

        test('valid cost for concept does not throw error', () => {
            const uuidValue = uuid();
            const validCost = Cost.reconstitute(CostBuilder.buildIri(uuidValue), uuidValue, aMinimalLanguageString(CostTestBuilder.TITLE).build(),
                aMinimalLanguageString(CostTestBuilder.DESCRIPTION).build(), 1);

            expect(() => aFullConcept().withCosts([validCost]).build()).not.toThrow();
        });

        test('invalid cost for concept does throw error', () => {
            const invalidCost = Cost.reconstitute(CostBuilder.buildIri(uuid()), undefined, undefined, undefined, 1);

            expect(() => aFullConcept().withCosts([invalidCost]).build()).toThrow();
        });

        test('costs that dont have unique order throws error', () => {
            const cost1 =
                aMinimalCostForConcept().withOrder(1).build();
            const cost2 =
                aMinimalCostForConcept().withOrder(1).build();

            expect(() => aFullConcept().withCosts([cost1, cost2]).build()).toThrowWithMessage(InvariantError, 'costs > order mag geen duplicaten bevatten');
        });

        test('costs that have unique order does not throw error', () => {
            const cost1 =
                aMinimalCostForConcept().withOrder(1).build();
            const cost2 =
                aMinimalCostForConcept().withOrder(2).build();

            expect(() => aFullConcept().withCosts([cost1, cost2]).build()).not.toThrow();
        });
    });

    describe('financialAdvantage ', () => {

        test('valid financialAdvantage for concept does not throw error', () => {
            const uuidValue = uuid();
            const validFinancialAdvantage = FinancialAdvantage.reconstitute(FinancialAdvantageBuilder.buildIri(uuidValue), uuidValue, aMinimalLanguageString(FinancialAdvantageTestBuilder.TITLE).build(),
                aMinimalLanguageString(FinancialAdvantageTestBuilder.DESCRIPTION).build(), 1);

            expect(() => aFullConcept().withFinancialAdvantages([validFinancialAdvantage]).build()).not.toThrow();
        });

        test('invalid financialAdvantage for concept does throw error', () => {
            const invalidFinancialAdvantage = FinancialAdvantage.reconstitute(FinancialAdvantageBuilder.buildIri(uuid()), undefined, undefined, undefined, 1);

            expect(() => aFullConcept().withFinancialAdvantages([invalidFinancialAdvantage]).build()).toThrow();
        });

        test('financial advantages that dont have unique order throws error', () => {
            const financialAdvantage1 =
                aMinimalFinancialAdvantageForConcept().withOrder(1).build();
            const financialAdvantage2 =
                aMinimalFinancialAdvantageForConcept().withOrder(1).build();

            expect(() => aFullConcept().withFinancialAdvantages([financialAdvantage1, financialAdvantage2]).build()).toThrowWithMessage(InvariantError, 'financial advantages > order mag geen duplicaten bevatten');
        });

        test('financial advantages that have unique order does not throw error', () => {
            const financialAdvantage1 =
                aMinimalFinancialAdvantageForConcept().withOrder(1).build();
            const financialAdvantage2 =
                aMinimalFinancialAdvantageForConcept().withOrder(2).build();

            expect(() => aFullConcept().withFinancialAdvantages([financialAdvantage1, financialAdvantage2]).build()).not.toThrow();
        });
    });

    describe('procedure ', () => {

        test('valid procedure for concept does not throw error', () => {
            const uuidValue = uuid();
            const validProcedure = Procedure.reconstitute(ProcedureBuilder.buildIri(uuidValue), uuidValue, aMinimalLanguageString(ProcedureTestBuilder.TITLE).build(),
                aMinimalLanguageString(ProcedureTestBuilder.DESCRIPTION).build(), 1, []);

            expect(() => aFullConcept().withProcedures([validProcedure]).build()).not.toThrow();
        });

        test('invalid procedure for concept does throw error', () => {
            const invalidProcedure = Procedure.reconstitute(ProcedureBuilder.buildIri(uuid()), undefined, undefined, undefined, 1, []);

            expect(() => aFullConcept().withProcedures([invalidProcedure]).build()).toThrow();
        });

        test('procedures that dont have unique order throws error', () => {
            const procedure1 =
                aMinimalProcedureForConcept().withOrder(1).build();
            const procedure2 =
                aMinimalProcedureForConcept().withOrder(1).build();

            expect(() => aFullConcept().withProcedures([procedure1, procedure2]).build()).toThrowWithMessage(InvariantError, 'procedures > order mag geen duplicaten bevatten');
        });

        test('procedures that have unique order does not throw error', () => {
            const procedure1 =
                aMinimalProcedureForConcept().withOrder(1).build();
            const procedure2 =
                aMinimalProcedureForConcept().withOrder(2).build();

            expect(() => aFullConcept().withProcedures([procedure1, procedure2]).build()).not.toThrow();
        });
    });

    describe('website ', () => {

        test('valid website does not throw error', () => {
            const uuidValue = uuid();
            const validWebsite = Website.reconstitute(WebsiteBuilder.buildIri(uuidValue), uuidValue, aMinimalLanguageString(WebsiteTestBuilder.TITLE).build(),
                aMinimalLanguageString(WebsiteTestBuilder.DESCRIPTION).build(), 1, WebsiteTestBuilder.URL);

            expect(() => aFullConcept().withWebsites([validWebsite]).build()).not.toThrow();
        });

        test('invalid website does throw error', () => {
            const invalidWebsite = Website.reconstitute(WebsiteBuilder.buildIri(uuid()), undefined, undefined, undefined, 1, WebsiteTestBuilder.URL);

            expect(() => aFullConcept().withWebsites([invalidWebsite]).build()).toThrow();
        });

        test('websites that dont have unique order throws error', () => {
            const website1 =
                aMinimalWebsiteForConcept().withOrder(1).build();
            const website2 =
                aMinimalWebsiteForConcept().withOrder(1).build();

            expect(() => aFullConcept().withWebsites([website1, website2]).build()).toThrowWithMessage(InvariantError, 'websites > order mag geen duplicaten bevatten');
        });

        test('websites that have unique order does not throw error', () => {
            const website1 =
                aMinimalWebsiteForConcept().withOrder(1).build();
            const website2 =
                aMinimalWebsiteForConcept().withOrder(2).build();


            expect(() => aFullConcept().withWebsites([website1, website2]).build()).not.toThrow();
        });

    });

    describe('requirement ', () => {

        test('valid requirement does not throw error', () => {
            const uuidValue = uuid();
            const validRequirement = Requirement.reconstitute(RequirementBuilder.buildIri(uuidValue), uuidValue, aMinimalLanguageString(RequirementTestBuilder.TITLE).build(),
                aMinimalLanguageString(RequirementTestBuilder.DESCRIPTION).build(), 1, undefined);

            expect(() => aFullConcept().withRequirements([validRequirement]).build()).not.toThrow();
        });

        test('invalid requirement does throw error', () => {
            const invalidRequirement = Requirement.reconstitute(RequirementBuilder.buildIri(uuid()), undefined, undefined, undefined, 1, undefined);

            expect(() => aFullConcept().withRequirements([invalidRequirement]).build()).toThrow();
        });

        test('requirements that dont have unique order throws error', () => {
            const requirement1 =
                aMinimalRequirementForConcept().withOrder(1).build();
            const requirement2 =
                aMinimalRequirementForConcept().withOrder(1).build();

            expect(() => aFullConcept().withRequirements([requirement1, requirement2]).build()).toThrowWithMessage(InvariantError, 'requirements > order mag geen duplicaten bevatten');
        });

        test('requirements that have unique order does not throw error', () => {
            const requirement1 =
                aMinimalRequirementForConcept().withOrder(1).build();
            const requirement2 =
                aMinimalRequirementForConcept().withOrder(2).build();

            expect(() => aFullConcept().withRequirements([requirement1, requirement2]).build()).not.toThrow();
        });

        describe('evidence ', () => {

            test('valid evidence does not throw error', () => {
                const uuidValue = uuid();
                const validEvidence = Evidence.reconstitute(EvidenceBuilder.buildIri(uuidValue), uuidValue, aMinimalLanguageString(EvidenceTestBuilder.TITLE).build(),
                    aMinimalLanguageString(EvidenceTestBuilder.DESCRIPTION).build());
                const validRequirement = aFullRequirement().withEvidence(validEvidence);

                expect(() => aFullConcept().withRequirements([validRequirement.build()])).not.toThrow();
            });

            test('invalid evidence does throw error', () => {
                const uuidValue = uuid();
                const invalidEvidence = Evidence.reconstitute(EvidenceBuilder.buildIri(uuidValue), uuidValue, undefined, undefined);
                const invalidRequirement = aFullRequirement().withEvidence(invalidEvidence).build();

                expect(() => aFullConcept().withRequirements([invalidRequirement]).build()).toThrow();
            });

        });
    });

    describe('legalResources', () => {

        test('valid legalResource does not throw error', () => {
            const uuidValue = uuid();
            const validLegalResource = LegalResource.reconstitute(
                LegalResourceBuilder.buildIri(uuidValue),
                uuidValue,
                undefined,
                undefined,
                LegalResourceTestBuilder.URL,
                1
            );
            expect(() => aFullConcept().withLegalResources([validLegalResource]).build()).not.toThrow();
        });

        test('invalid legalResource does throw error', () => {
            const invalidLegalResource = LegalResource.reconstitute(
                LegalResourceBuilder.buildIri(uuid()),
                undefined,
                undefined,
                undefined,
                LegalResourceTestBuilder.URL,
                1
            );

            expect(() => aFullConcept().withLegalResources([invalidLegalResource]).build()).toThrow();
        });

        test('legalResources that dont have unique order throws error', () => {
            const legalResource1 =
                aFullLegalResourceForConcept().withOrder(1).build();
            const legalResource2 =
                aFullLegalResourceForConcept().withOrder(1).build();

            expect(() => aFullConcept().withLegalResources([legalResource1, legalResource2]).build()).toThrowWithMessage(InvariantError, 'legal resources > order mag geen duplicaten bevatten');
        });

        test('legalResource that have unique order does not throw error', () => {
            const legalResource1 =
                aFullLegalResourceForConcept().withOrder(1).build();
            const legalResource2 =
                aFullLegalResourceForConcept().withOrder(2).build();

            expect(() => aFullConcept().withLegalResources([legalResource1, legalResource2]).build()).not.toThrow();
        });
    });
});
