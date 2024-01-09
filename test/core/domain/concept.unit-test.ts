import {LanguageString} from "../../../src/core/domain/language-string";
import {aFullConcept, ConceptTestBuilder} from "./concept-test-builder";
import {Language} from "../../../src/core/domain/language";
import {buildConceptSnapshotIri} from "./iri-test-builder";
import {uuid} from "../../../mu-helper";
import {CostTestBuilder} from "./cost-test-builder";
import {Cost} from "../../../src/core/domain/cost";
import {aMinimalLanguageString} from "./language-string-test-builder";
import {FinancialAdvantage} from "../../../src/core/domain/financial-advantage";
import {FinancialAdvantageTestBuilder} from "./financial-advantage-test-builder";
import {Requirement} from "../../../src/core/domain/requirement";
import {RequirementTestBuilder} from "./requirement-test-builder";
import {Evidence} from "../../../src/core/domain/evidence";
import {EvidenceTestBuilder} from "./evidence-test-builder";
import {aFullRequirement} from "./requirement-test-builder";
import {Procedure} from "../../../src/core/domain/procedure";
import {ProcedureTestBuilder} from "./procedure-test-builder";
import {Website} from "../../../src/core/domain/website";
import {WebsiteTestBuilder} from "./website-test-builder";
import {Iri} from "../../../src/core/domain/shared/iri";

describe('constructing', () => {

    test('keywords are sorted', () => {
        const aConcept =
            aFullConcept()
                .withKeywords(new Set([
                    LanguageString.of('def'),
                    LanguageString.of('abc')
                ]))
                .build();

        expect(Array.from(aConcept.keywords)).toEqual([
            LanguageString.of('abc'),
            LanguageString.of('def')
        ]);
    });

    test('concept languages', () => {
        const aConcept =
            aFullConcept()
                .withTitle(
                    LanguageString.of(
                        ConceptTestBuilder.TITLE_EN,
                        ConceptTestBuilder.TITLE_NL,
                        ConceptTestBuilder.TITLE_NL_FORMAL,
                        ConceptTestBuilder.TITLE_NL_INFORMAL,
                        ConceptTestBuilder.TITLE_NL_GENERATED_FORMAL,
                        ConceptTestBuilder.TITLE_NL_GENERATED_INFORMAL))
                .build();

        expect(aConcept.conceptLanguages).toEqual(new Set([
            Language.EN,
            Language.NL,
            Language.FORMAL,
            Language.INFORMAL,
            Language.GENERATED_FORMAL,
            Language.GENERATED_INFORMAL
        ]));
    });

    test('applied snapshots', () => {
        const latestConceptSnapshot = buildConceptSnapshotIri(uuid());
        const previousConceptSnapshot1 = buildConceptSnapshotIri(uuid());
        const previousConceptSnapshot2 = buildConceptSnapshotIri(uuid());
        const aConcept =
            aFullConcept()
                .withLatestConceptSnapshot(latestConceptSnapshot)
                .withPreviousConceptSnapshots(new Set([previousConceptSnapshot1, previousConceptSnapshot2]))
                .build();

        expect(aConcept.appliedSnapshots).toEqual(new Set([latestConceptSnapshot, previousConceptSnapshot1, previousConceptSnapshot2]));
    });

    test('Undefined id throws error', () => {
        expect(() => aFullConcept().withId(undefined).build()).toThrow(new Error('id should not be undefined'));
    });

    test('Invalid iri id throws error', () => {
        expect(() => aFullConcept().withId(new Iri('  ')).build()).toThrow(new Error('iri should not be blank'));
    });

    test('Undefined uuid throws error', () => {
        expect(() => aFullConcept().withUuid(undefined).build()).toThrow(new Error('uuid should not be undefined'));
    });

    test('Blank uuid throws error', () => {
        expect(() => aFullConcept().withUuid('   ').build()).toThrow(new Error('uuid should not be blank'));
    });

    test('Undefined title throws error', () => {
        expect(() => aFullConcept().withTitle(undefined).build()).toThrow(new Error('title should not be undefined'));
    });

    test('NL not present in title throws error', () => {
        expect(() => aFullConcept().withTitle(LanguageString.of('en', undefined)).build()).toThrow(new Error('nl version in title should not be undefined'));
    });

    test('NL not present in title throws error', () => {
        expect(() => aFullConcept().withDescription(LanguageString.of('en', undefined)).build()).toThrow(new Error('nl version in description should not be undefined'));
    });

    test('Undefined description throws error', () => {
        expect(() => aFullConcept().withDescription(undefined).build()).toThrow(new Error('description should not be undefined'));
    });

    test('Undefined isArchived throws error', () => {
        expect(() => aFullConcept().withIsArchived(undefined).build()).toThrow(new Error('isArchived should not be undefined'));
    });

    describe('cost ', () => {
        test('valid cost for concept does not throw error', () => {
            const uuidValue = uuid();
            const validCost = Cost.reconstitute(CostTestBuilder.buildIri(uuidValue), uuidValue, aMinimalLanguageString(CostTestBuilder.TITLE).build(),
                aMinimalLanguageString(CostTestBuilder.DESCRIPTION).build());

            expect(() => aFullConcept().withCosts([validCost]).build()).not.toThrow();
        });

        test('invalid cost for concept does throw error', () => {
            const invalidCost = Cost.reconstitute(CostTestBuilder.buildIri(uuid()), undefined, undefined, undefined);

            expect(() => aFullConcept().withCosts([invalidCost]).build()).toThrow();
        });
    });
    describe('financialAdvantage ', () => {
        test('valid financialAdvantage for concept does not throw error', () => {
            const uuidValue = uuid();
            const validFinancialAdvantage = FinancialAdvantage.reconstitute(FinancialAdvantageTestBuilder.buildIri(uuidValue), uuidValue, aMinimalLanguageString(FinancialAdvantageTestBuilder.TITLE).build(),
                aMinimalLanguageString(FinancialAdvantageTestBuilder.DESCRIPTION).build());

            expect(() => aFullConcept().withFinancialAdvantages([validFinancialAdvantage]).build()).not.toThrow();
        });

        test('invalid financialAdvantage for concept does throw error', () => {
            const invalidFinancialAdvantage = FinancialAdvantage.reconstitute(FinancialAdvantageTestBuilder.buildIri(uuid()), undefined, undefined, undefined);

            expect(() => aFullConcept().withFinancialAdvantages([invalidFinancialAdvantage]).build()).toThrow();
        });
    });
    describe('procedure ', () => {
        test('valid procedure for concept does not throw error', () => {
            const uuidValue = uuid();
            const validProcedure = Procedure.reconstitute(ProcedureTestBuilder.buildIri(uuidValue), uuidValue, aMinimalLanguageString(ProcedureTestBuilder.TITLE).build(),
                aMinimalLanguageString(ProcedureTestBuilder.DESCRIPTION).build(), []);

            expect(() => aFullConcept().withProcedures([validProcedure]).build()).not.toThrow();
        });

        test('invalid procedure for concept does throw error', () => {
            const invalidProcedure = Procedure.reconstitute(ProcedureTestBuilder.buildIri(uuid()), undefined, undefined, undefined, []);

            expect(() => aFullConcept().withProcedures([invalidProcedure]).build()).toThrow();
        });
    });

    describe('website ', () => {
        test('valid website does not throw error', () => {
            const uuidValue = uuid();
            const validWebsite = Website.reconstitute(WebsiteTestBuilder.buildIri(uuidValue), uuidValue, aMinimalLanguageString(WebsiteTestBuilder.TITLE).build(),
                aMinimalLanguageString(WebsiteTestBuilder.DESCRIPTION).build(), WebsiteTestBuilder.URL);

            expect(() => aFullConcept().withWebsites([validWebsite]).build()).not.toThrow();
        });

        test('invalid website does throw error', () => {
            const invalidWebsite = Website.reconstitute(WebsiteTestBuilder.buildIri(uuid()), undefined, undefined, undefined, WebsiteTestBuilder.URL);

            expect(() => aFullConcept().withWebsites([invalidWebsite]).build()).toThrow();
        });
    });

    describe('requirement ', () => {
        test('valid requirement does not throw error', () => {
            const uuidValue = uuid();
            const validRequirement = Requirement.reconstitute(RequirementTestBuilder.buildIri(uuidValue), uuidValue, aMinimalLanguageString(RequirementTestBuilder.TITLE).build(),
                aMinimalLanguageString(RequirementTestBuilder.DESCRIPTION).build(), undefined);

            expect(() => aFullConcept().withRequirements([validRequirement]).build()).not.toThrow();
        });

        test('invalid requirement does throw error', () => {
            const invalidRequirement = Requirement.reconstitute(RequirementTestBuilder.buildIri(uuid()), undefined, undefined, undefined, undefined);

            expect(() => aFullConcept().withRequirements([invalidRequirement]).build()).toThrow();
        });
        describe('evidence ', () => {
            test('valid evidence does not throw error', () => {
                const uuidValue = uuid();
                const validEvidence = Evidence.reconstitute(EvidenceTestBuilder.buildIri(uuidValue), uuidValue, aMinimalLanguageString(EvidenceTestBuilder.TITLE).build(),
                    aMinimalLanguageString(EvidenceTestBuilder.DESCRIPTION).build());
                const validRequirement = aFullRequirement().withEvidence(validEvidence);

                expect(() => aFullConcept().withRequirements([validRequirement.build()])).not.toThrow();
            });

            test('invalid evidence does throw error', () => {
                const uuidValue = uuid();
                const invalidEvidence = Evidence.reconstitute(EvidenceTestBuilder.buildIri(uuidValue), uuidValue, undefined, undefined);
                const invalidRequirement = aFullRequirement().withEvidence(invalidEvidence).build();

                expect(() => aFullConcept().withRequirements([invalidRequirement]).build()).toThrow();
            });
        });
    });
});