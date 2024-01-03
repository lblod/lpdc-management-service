import {LanguageString} from "../../../src/core/domain/language-string";
import {aFullConcept, ConceptTestBuilder} from "./concept-test-builder";
import {Language} from "../../../src/core/domain/language";
import {buildConceptSnapshotIri} from "./iri-test-builder";
import {uuid} from "../../../mu-helper";

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


});