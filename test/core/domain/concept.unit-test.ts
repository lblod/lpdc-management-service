import {LanguageString} from "../../../src/core/domain/language-string";
import {aFullConcept, ConceptTestBuilder} from "./concept-test-builder";
import {Language} from "../../../src/core/domain/language";
import {buildConceptSnapshotIri} from "./iri-test-builder";
import {uuid} from "../../../mu-helper";
import {aFullCost, CostTestBuilder} from "./cost-test-builder";
import {Cost} from "../../../src/core/domain/cost";
import {aMinimalLanguageString} from "./language-string-test-builder";

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
    test('Blank id throws error', () => {
        expect(() => aFullConcept().withId('   ').build()).toThrow(new Error('id should not be blank'));
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
});