import {LanguageString} from "../../../src/core/domain/language-string";
import {aFullConcept} from "./concept-test-builder";

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
});