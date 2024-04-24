import {LanguageString} from "../../../src/core/domain/language-string";
import {Language} from "../../../src/core/domain/language";
import {InvariantError} from "../../../src/core/domain/shared/lpdc-error";

describe('constructing', () => {

    test('can build a full language string', () => {
        const languageString = LanguageString.of('text-nl', 'text-nl-formal', 'text-nl-informal', 'text-nl-generated-formal', 'text-nl-generated-informal');

        expect(languageString.nl).toEqual('text-nl');
        expect(languageString.nlFormal).toEqual('text-nl-formal');
        expect(languageString.nlInformal).toEqual('text-nl-informal');
        expect(languageString.nlGeneratedFormal).toEqual('text-nl-generated-formal');
        expect(languageString.nlGeneratedInformal).toEqual('text-nl-generated-informal');
    });

    test('can build a languageString with only nl', () => {
        const languageString = LanguageString.of('text-nl');

        expect(languageString.nl).toEqual('text-nl');
    });

    test('can build a languageString with only nl-formal', () => {
        const languageString = LanguageString.of(undefined, 'text-nl-formal');

        expect(languageString.nlFormal).toEqual('text-nl-formal');
    });

    test('can build a languageString with only nl-informal', () => {
        const languageString = LanguageString.of(undefined, undefined, 'text-nl-informal');

        expect(languageString.nlInformal).toEqual('text-nl-informal');
    });

    test('can build a languageString with only nl-generated-formal', () => {
        const languageString = LanguageString.of(undefined, undefined, undefined, 'text-nl-generated-formal');

        expect(languageString.nlGeneratedFormal).toEqual('text-nl-generated-formal');
    });

    test('can build a languageString with only nl-generated-informal', () => {
        const languageString = LanguageString.of(undefined, undefined, undefined, undefined, 'text-nl-generated-informal');

        expect(languageString.nlGeneratedInformal).toEqual('text-nl-generated-informal');
    });

    //TODO LPDC-968: re-enable when empty triples are fixed in data
    test.skip('when no values specified, throws error', () => {
        expect(() => LanguageString.of()).toThrow('language list does not contain one value');
    });


});

describe('get defined languages', () => {

    test('defined language - nl', () => {
        const languageString = LanguageString.of('nl');
        expect(languageString.definedLanguages).toEqual([Language.NL]);
    });

    test('defined language - formal', () => {
        const languageString = LanguageString.of(undefined, 'text-formal');
        expect(languageString.definedLanguages).toEqual([Language.FORMAL]);
    });

    test('defined language - informal', () => {
        const languageString = LanguageString.of(undefined, undefined, 'text-informal');
        expect(languageString.definedLanguages).toEqual([Language.INFORMAL]);
    });

    test('defined language - generatedFormal', () => {
        const languageString = LanguageString.of(undefined, undefined, undefined, 'text-generated-formal');
        expect(languageString.definedLanguages).toEqual([Language.GENERATED_FORMAL]);
    });

    test('defined language - generatedInFormal', () => {
        const languageString = LanguageString.of(undefined, undefined, undefined, undefined, 'text-generated-informal');
        expect(languageString.definedLanguages).toEqual([Language.GENERATED_INFORMAL]);
    });
});

describe('get not blank languages', () => {

    describe('nl', () => {

        test('get not blank language', () => {
            const languageString = LanguageString.of('text-nl');
            expect(languageString.notBlankLanguages).toEqual([Language.NL]);
        });

        test('get blank language', () => {
            const languageString = LanguageString.of('  ');
            expect(languageString.notBlankLanguages).toEqual([]);
        });

        test('get undefined language', () => {
            const languageString = LanguageString.of(undefined);
            expect(languageString.notBlankLanguages).toEqual([]);
        });

    });

    describe('nl formal', () => {

        test('get not blank language', () => {
            const languageString = LanguageString.of(undefined, 'text-nl-formal');
            expect(languageString.notBlankLanguages).toEqual([Language.FORMAL]);
        });

        test('get blank language', () => {
            const languageString = LanguageString.of(undefined, '');
            expect(languageString.notBlankLanguages).toEqual([]);
        });

        test('get undefined language', () => {
            const languageString = LanguageString.of(undefined, undefined);
            expect(languageString.notBlankLanguages).toEqual([]);
        });

    });

    describe('nl informal', () => {

        test('get not blank language', () => {
            const languageString = LanguageString.of(undefined, undefined, 'text-nl-informal');
            expect(languageString.notBlankLanguages).toEqual([Language.INFORMAL]);
        });

        test('get blank language', () => {
            const languageString = LanguageString.of(undefined, undefined, '');
            expect(languageString.notBlankLanguages).toEqual([]);
        });

        test('get undefined language', () => {
            const languageString = LanguageString.of(undefined, undefined, undefined);
            expect(languageString.notBlankLanguages).toEqual([]);
        });

    });

    describe('nl generated formal', () => {

        test('get not blank language', () => {
            const languageString = LanguageString.of(undefined, undefined, undefined, 'text-nl-generated-formal');
            expect(languageString.notBlankLanguages).toEqual([Language.GENERATED_FORMAL]);
        });

        test('get blank language', () => {
            const languageString = LanguageString.of(undefined, undefined, undefined, '');
            expect(languageString.notBlankLanguages).toEqual([]);
        });

        test('get undefined language', () => {
            const languageString = LanguageString.of(undefined, undefined, undefined, undefined);
            expect(languageString.notBlankLanguages).toEqual([]);
        });

    });

    describe('nl generated informal', () => {

        test('get not blank language', () => {
            const languageString = LanguageString.of(undefined, undefined, undefined, undefined, 'text-nl-generated-informal');
            expect(languageString.notBlankLanguages).toEqual([Language.GENERATED_INFORMAL]);
        });

        test('get blank language', () => {
            const languageString = LanguageString.of(undefined, undefined, undefined, undefined, '');
            expect(languageString.notBlankLanguages).toEqual([]);
        });

        test('get undefined language', () => {
            const languageString = LanguageString.of(undefined, undefined, undefined, undefined, undefined);
            expect(languageString.notBlankLanguages).toEqual([]);
        });

    });


});

describe('compare', () => {

    test('Compare - nl', () => {
        const firstLessThanSecond = LanguageString.compare(LanguageString.of('abc'), LanguageString.of('def'));
        const firstGreaterThanSecond = LanguageString.compare(LanguageString.of('def'), LanguageString.of('abc'));
        const firstEqualToSecond = LanguageString.compare(LanguageString.of('abc'), LanguageString.of('abc'));
        expect(firstLessThanSecond).toEqual(-1);
        expect(firstGreaterThanSecond).toEqual(1);
        expect(firstEqualToSecond).toEqual(0);
    });

    test('Compare - nlFormal', () => {
        const firstLessThanSecond = LanguageString.compare(LanguageString.of(undefined, 'abc'), LanguageString.of(undefined, 'def'));
        const firstGreaterThanSecond = LanguageString.compare(LanguageString.of(undefined, 'def'), LanguageString.of(undefined, 'abc'));
        const firstEqualToSecond = LanguageString.compare(LanguageString.of(undefined, 'abc'), LanguageString.of(undefined, 'abc'));
        expect(firstLessThanSecond).toEqual(-1);
        expect(firstGreaterThanSecond).toEqual(1);
        expect(firstEqualToSecond).toEqual(0);
    });

    test('Compare - nlInformal', () => {
        const firstLessThanSecond = LanguageString.compare(LanguageString.of(undefined, undefined, 'abc'), LanguageString.of(undefined, undefined, 'def'));
        const firstGreaterThanSecond = LanguageString.compare(LanguageString.of(undefined, undefined, 'def'), LanguageString.of(undefined, undefined, 'abc'));
        const firstEqualToSecond = LanguageString.compare(LanguageString.of(undefined, undefined, 'abc'), LanguageString.of(undefined, undefined, 'abc'));
        expect(firstLessThanSecond).toEqual(-1);
        expect(firstGreaterThanSecond).toEqual(1);
        expect(firstEqualToSecond).toEqual(0);
    });

    test('Compare - nlGeneratedFormal', () => {
        const firstLessThanSecond = LanguageString.compare(LanguageString.of(undefined, undefined, undefined, 'abc'), LanguageString.of(undefined, undefined, undefined, 'def'));
        const firstGreaterThanSecond = LanguageString.compare(LanguageString.of(undefined, undefined, undefined, 'def'), LanguageString.of(undefined, undefined, undefined, 'abc'));
        const firstEqualToSecond = LanguageString.compare(LanguageString.of(undefined, undefined, undefined, 'abc'), LanguageString.of(undefined, undefined, undefined, 'abc'));
        expect(firstLessThanSecond).toEqual(-1);
        expect(firstGreaterThanSecond).toEqual(1);
        expect(firstEqualToSecond).toEqual(0);
    });

    test('Compare - nlGeneratedInformal', () => {
        const firstLessThanSecond = LanguageString.compare(LanguageString.of(undefined, undefined, undefined, undefined, 'abc'), LanguageString.of(undefined, undefined, undefined, undefined, 'def'));
        const firstGreaterThanSecond = LanguageString.compare(LanguageString.of(undefined, undefined, undefined, undefined, 'def'), LanguageString.of(undefined, undefined, undefined, undefined, 'abc'));
        const firstEqualToSecond = LanguageString.compare(LanguageString.of(undefined, undefined, undefined, undefined, 'abc'), LanguageString.of(undefined, undefined, undefined, undefined, 'abc'));
        expect(firstLessThanSecond).toEqual(-1);
        expect(firstGreaterThanSecond).toEqual(1);
        expect(firstEqualToSecond).toEqual(0);
    });

    test('Compare - multiple languages - nl and nlFormal', () => {
        const firstLessThanSecond = LanguageString.compare(
            LanguageString.of(undefined, '2'),
            LanguageString.of('1', '2'));
        const firstGreaterThanSecond = LanguageString.compare(
            LanguageString.of('1', '2'),
            LanguageString.of(undefined, '2'));
        const firstEqualToSecond = LanguageString.compare(
            LanguageString.of('1', '2'),
            LanguageString.of('1', '2'));
        expect(firstLessThanSecond).toEqual(-1);
        expect(firstGreaterThanSecond).toEqual(1);
        expect(firstEqualToSecond).toEqual(0);
    });
});

describe('is functionally changed', () => {

    type TestCase = [string, LanguageString | undefined, LanguageString | undefined];

    const functionallyUnchangedTestCases: TestCase[]
        = [
        ['nl equal',
            LanguageString.of('text-nl'),
            LanguageString.of('text-nl')],
        ['nl formal not equal',
            LanguageString.of('text-nl', 'abc', 'def', 'ghi', 'kjl'),
            LanguageString.of('text-nl', 'abcd', 'def', 'ghi', 'kjl')],
        ['nl informal not equal',
            LanguageString.of('text-nl', 'abc', 'def', 'ghi', 'kjl'),
            LanguageString.of('text-nl', 'abc', 'defd', 'ghi', 'kjl')],
        ['nl generated formal not equal',
            LanguageString.of('text-nl', 'abc', 'def', 'ghi', 'kjl'),
            LanguageString.of('text-nl', 'abc', 'def', 'ghid', 'kjl')],
        ['nl generated informal not equal',
            LanguageString.of('text-nl', 'abc', 'def', 'ghi', 'kjl'),
            LanguageString.of('text-nl', 'abc', 'def', 'ghi', 'kjld')],
        ['nl equal; other languages undefined ',
            LanguageString.of('text-nl', 'abc', 'def', 'ghi', 'kjl'),
            LanguageString.of('text-nl', undefined, undefined, undefined, undefined)],
        ['nl equal; this languages undefined',
            LanguageString.of('text-nl', undefined, undefined, undefined, undefined),
            LanguageString.of('text-nl', 'abc', 'def', 'ghi', 'kjl')]];

    for (const testCase of functionallyUnchangedTestCases) {
        test(`not functionally changed when ${testCase[0]}`, () => {
            expect(LanguageString.isFunctionallyChanged(testCase[1], testCase[2])).toBeFalsy();
        });
    }

    const functionallyChangedTestCases: TestCase[]
        = [
        ['nl changed',
            LanguageString.of('text-nl'),
            LanguageString.of('text-nl-changed')],
        ['one undefined, other defined',
            undefined,
            LanguageString.of('text-nl')],
        ['one defined, other undefined',
            LanguageString.of('text-nl'),
            undefined],
        ['one nl undefined and other nl defined',
            LanguageString.of(undefined),
            LanguageString.of('text-nl')],
        ['one nl undefined and other nl',
            LanguageString.of('text-nl'),
            LanguageString.of(undefined)],
    ];
    for (const testCase of functionallyChangedTestCases) {
        test(`functionally changed when ${testCase[0]}`, () => {
            expect(LanguageString.isFunctionallyChanged(testCase[1], testCase[2])).toBeTruthy();
        });
    }

});

describe('extract nl languages', () => {

    test('if no nl lang is present, return empty list', () => {
        const languages = LanguageString.of();

        expect(LanguageString.extractNlLanguages([languages])).toEqual([]);
    });

    test('if only undefined is present, return empty list', () => {
        expect(LanguageString.extractNlLanguages([undefined])).toEqual([]);
    });

    test('if only undefined language string is present, return empty list', () => {
        expect(LanguageString.extractNlLanguages([LanguageString.of(undefined, undefined)])).toEqual([]);
    });

    test('if language versions are present, correctly return values ', () => {
        const langs1 = LanguageString.of('nl');
        const langs2 = LanguageString.of(undefined, 'nl-formal');
        const strings = [langs1, langs2];

        expect(LanguageString.extractNlLanguages(strings)).toEqual(expect.arrayContaining(['nl-be-x-formal', 'nl']));
    });

    test('if languages are filled in for multiple values return it only one time', () => {
        const langs1 = LanguageString.of(undefined, 'nl-formal');
        const langs2 = LanguageString.of(undefined, 'nl-formal');
        const strings = [langs1, langs2];

        expect(LanguageString.extractNlLanguages(strings)).toEqual(expect.arrayContaining(['nl-be-x-formal']));
    });
});

describe('validate unique nl language', () => {

    test('if no nl lang is present, do not throw', () => {
        const languages = LanguageString.of();

        expect(() => LanguageString.validateUniqueNlLanguage([languages])).not.toThrow();
    });

    test('if only undefined is present, do not throw', () => {
        expect(() => LanguageString.validateUniqueNlLanguage([undefined])).not.toThrow();
    });

    test('if only undefined language string is present, do not throw', () => {
        expect(() => LanguageString.validateUniqueNlLanguage([LanguageString.of(undefined, undefined)])).not.toThrow();
    });

    test('if a language versions is present, do not throw ', () => {
        const langs1 = LanguageString.of('nl');
        const langs2 = LanguageString.of(undefined);
        const strings = [langs1, langs2];

        expect(() => LanguageString.validateUniqueNlLanguage(strings)).not.toThrow();
    });

    test('if languages are filled in for multiple values, do not throw', () => {
        const langs1 = LanguageString.of(undefined, 'nl-formal');
        const langs2 = LanguageString.of(undefined, 'nl-formal');
        const strings = [langs1, langs2];

        expect(() => LanguageString.validateUniqueNlLanguage(strings)).not.toThrow();
    });

    test('if multiple nl values are present, throw error', () => {
        expect(() => LanguageString.validateUniqueNlLanguage([LanguageString.of('nl', 'nl-formal')])).toThrowWithMessage(InvariantError, "Er is meer dan een nl-taal aanwezig");
    });

    test('if multiple nl values are present throughout multiple values , throw error', () => {
        const langs1 = LanguageString.of(undefined, 'nl-formal');
        const langs2 = LanguageString.of('nl', 'nl-formal');
        const strings = [langs1, langs2];

        expect(() => LanguageString.validateUniqueNlLanguage(strings)).toThrowWithMessage(InvariantError, "Er is meer dan een nl-taal aanwezig");
    });

});

describe('transformToInformal', () => {

    test('When more then one dutch language, throw error', () => {
        const language = LanguageString.of('nl', 'formal');
        expect(() => language.transformToInformal()).toThrowWithMessage(InvariantError, 'voor omzetting naar je-vorm mag languageString maar 1 NL taal bevatten');
    });

    test('When formal set, transform to informal', () => {
        const language = LanguageString.of(undefined, 'formal');
        expect(language.transformToInformal()).toEqual(LanguageString.of(undefined, undefined, 'formal'));
    });

    test('When already informal set, keep informal', () => {
        const language = LanguageString.of( undefined, undefined, 'informal');
        expect(language.transformToInformal()).toEqual(LanguageString.of(undefined, undefined, 'informal'));
    });

    test('When no language set, nothing changes', () => {
        const language = LanguageString.of();
        expect(language.transformToInformal()).toEqual(LanguageString.of());
    });

});

