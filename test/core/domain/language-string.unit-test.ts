import {LanguageString} from "../../../src/core/domain/language-string";

describe('constructing', () => {

    test('can build a full language string', () => {
        const languageString = LanguageString.of('text-en', 'text-nl', 'text-nl-formal', 'text-nl-informal', 'text-nl-generated-formal', 'text-nl-generated-informal');

        expect(languageString.en).toEqual('text-en');
        expect(languageString.nl).toEqual('text-nl');
        expect(languageString.nlFormal).toEqual('text-nl-formal');
        expect(languageString.nlInformal).toEqual('text-nl-informal');
        expect(languageString.nlGeneratedFormal).toEqual('text-nl-generated-formal');
        expect(languageString.nlGeneratedInformal).toEqual('text-nl-generated-informal');
    });

    test('can build a languageString with only en', () => {
        const languageString = LanguageString.of('text-en', undefined);

        expect(languageString.en).toEqual('text-en');
        expect(languageString.nl).toBeUndefined();
    });

    test('can build a languageString with only nl', () => {
        const languageString = LanguageString.of(undefined, 'text-nl');

        expect(languageString.en).toBeUndefined();
        expect(languageString.nl).toEqual('text-nl');
    });

    test('can build a languageString with only nl-formal', () => {
        const languageString = LanguageString.of(undefined, undefined, 'text-nl-formal');

        expect(languageString.nlFormal).toEqual('text-nl-formal');
    });

    test('can build a languageString with only nl-informal', () => {
        const languageString = LanguageString.of(undefined, undefined, undefined, 'text-nl-informal');

        expect(languageString.nlInformal).toEqual('text-nl-informal');
    });

    test('can build a languageString with only nl-generated-formal', () => {
        const languageString = LanguageString.of(undefined, undefined, undefined, undefined, 'text-nl-generated-formal');

        expect(languageString.nlGeneratedFormal).toEqual('text-nl-generated-formal');
    });

    test('can build a languageString with only nl-generated-informal', () => {
        const languageString = LanguageString.of(undefined, undefined, undefined, undefined, undefined, 'text-nl-generated-informal');

        expect(languageString.nlGeneratedInformal).toEqual('text-nl-generated-informal');
    });

    test('when no values specified, returns undefined', () => {
        const languageString = LanguageString.of();

        expect(languageString).toBeUndefined();
    });


});

describe('compare', () => {

    test('Compare - en', () => {
        const firstLessThanSecond = LanguageString.compare(LanguageString.of('abc'), LanguageString.of('def'));
        const firstGreaterThanSecond = LanguageString.compare(LanguageString.of('def'), LanguageString.of('abc'));
        const firstEqualToSecond = LanguageString.compare(LanguageString.of('abc'), LanguageString.of('abc'));
        expect(firstLessThanSecond).toEqual(-1);
        expect(firstGreaterThanSecond).toEqual(1);
        expect(firstEqualToSecond).toEqual(0);
    });

    test('Compare - nl', () => {
        const firstLessThanSecond = LanguageString.compare(LanguageString.of(undefined,'abc'), LanguageString.of(undefined,'def'));
        const firstGreaterThanSecond = LanguageString.compare(LanguageString.of(undefined,'def'), LanguageString.of(undefined,'abc'));
        const firstEqualToSecond = LanguageString.compare(LanguageString.of(undefined,'abc'), LanguageString.of(undefined,'abc'));
        expect(firstLessThanSecond).toEqual(-1);
        expect(firstGreaterThanSecond).toEqual(1);
        expect(firstEqualToSecond).toEqual(0);
    });

    test('Compare - nlFormal', () => {
        const firstLessThanSecond = LanguageString.compare(LanguageString.of(undefined, undefined,'abc'), LanguageString.of(undefined, undefined,'def'));
        const firstGreaterThanSecond = LanguageString.compare(LanguageString.of(undefined, undefined,'def'), LanguageString.of(undefined, undefined,'abc'));
        const firstEqualToSecond = LanguageString.compare(LanguageString.of(undefined, undefined,'abc'), LanguageString.of(undefined, undefined,'abc'));
        expect(firstLessThanSecond).toEqual(-1);
        expect(firstGreaterThanSecond).toEqual(1);
        expect(firstEqualToSecond).toEqual(0);
    });

    test('Compare - nlInformal', () => {
        const firstLessThanSecond = LanguageString.compare(LanguageString.of(undefined, undefined, undefined,'abc'), LanguageString.of(undefined, undefined, undefined,'def'));
        const firstGreaterThanSecond = LanguageString.compare(LanguageString.of(undefined, undefined, undefined,'def'), LanguageString.of(undefined, undefined, undefined,'abc'));
        const firstEqualToSecond = LanguageString.compare(LanguageString.of(undefined, undefined, undefined,'abc'), LanguageString.of(undefined, undefined, undefined,'abc'));
        expect(firstLessThanSecond).toEqual(-1);
        expect(firstGreaterThanSecond).toEqual(1);
        expect(firstEqualToSecond).toEqual(0);
    });

    test('Compare - nlGeneratedFormal', () => {
        const firstLessThanSecond = LanguageString.compare(LanguageString.of(undefined, undefined, undefined, undefined,'abc'), LanguageString.of(undefined, undefined, undefined, undefined,'def'));
        const firstGreaterThanSecond = LanguageString.compare(LanguageString.of(undefined, undefined, undefined, undefined,'def'), LanguageString.of(undefined, undefined, undefined, undefined,'abc'));
        const firstEqualToSecond = LanguageString.compare(LanguageString.of(undefined, undefined, undefined, undefined,'abc'), LanguageString.of(undefined, undefined, undefined, undefined,'abc'));
        expect(firstLessThanSecond).toEqual(-1);
        expect(firstGreaterThanSecond).toEqual(1);
        expect(firstEqualToSecond).toEqual(0);
    });

    test('Compare - nlGeneratedInformal', () => {
        const firstLessThanSecond = LanguageString.compare(LanguageString.of(undefined,undefined, undefined, undefined, undefined,'abc'), LanguageString.of(undefined,undefined, undefined, undefined, undefined,'def'));
        const firstGreaterThanSecond = LanguageString.compare(LanguageString.of(undefined,undefined, undefined, undefined, undefined,'def'), LanguageString.of(undefined,undefined, undefined, undefined, undefined,'abc'));
        const firstEqualToSecond = LanguageString.compare(LanguageString.of(undefined,undefined, undefined, undefined, undefined,'abc'), LanguageString.of(undefined,undefined, undefined, undefined, undefined,'abc'));
        expect(firstLessThanSecond).toEqual(-1);
        expect(firstGreaterThanSecond).toEqual(1);
        expect(firstEqualToSecond).toEqual(0);
    });

    test('Compare - multiple languages - en', () => {
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

    test('Compare - multiple languages - nl', () => {
        const firstLessThanSecond = LanguageString.compare(
            LanguageString.of('1', undefined),
            LanguageString.of('1', '2'));
        const firstGreaterThanSecond = LanguageString.compare(
            LanguageString.of('1', '2'),
            LanguageString.of('1', undefined));
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
        ['empty language strings',
            LanguageString.of(),
            LanguageString.of()],
        ['en equal',
            LanguageString.of('text-en'),
            LanguageString.of('text-en')],
        ['nl equal',
            LanguageString.of(undefined, 'text-nl'),
            LanguageString.of(undefined, 'text-nl')],
        ['en and nl equal',
            LanguageString.of('text-en', 'text-nl'),
            LanguageString.of('text-en', 'text-nl')],
        ['en and nl equal; nl formal not equal',
            LanguageString.of('text-en', 'text-nl', 'abc', 'def', 'ghi', 'kjl'),
            LanguageString.of('text-en', 'text-nl', 'abcd', 'def', 'ghi', 'kjl')],
        ['en and nl equal; nl informal not equal',
            LanguageString.of('text-en', 'text-nl', 'abc', 'def', 'ghi', 'kjl'),
            LanguageString.of('text-en', 'text-nl', 'abc', 'defd', 'ghi', 'kjl')],
        ['en and nl equal; nl generated formal not equal',
            LanguageString.of('text-en', 'text-nl', 'abc', 'def', 'ghi', 'kjl'),
            LanguageString.of('text-en', 'text-nl', 'abc', 'def', 'ghid', 'kjl')],
        ['en and nl equal; nl generated informal not equal',
            LanguageString.of('text-en', 'text-nl', 'abc', 'def', 'ghi', 'kjl'),
            LanguageString.of('text-en', 'text-nl', 'abc', 'def', 'ghi', 'kjld')],
        ['en and nl equal; other languages undefined ',
            LanguageString.of('text-en', 'text-nl', 'abc', 'def', 'ghi', 'kjl'),
            LanguageString.of('text-en', 'text-nl', undefined, undefined, undefined, undefined)],
        ['en and nl equal; this languages undefined',
            LanguageString.of('text-en', 'text-nl', undefined, undefined, undefined, undefined),
            LanguageString.of('text-en', 'text-nl', 'abc', 'def', 'ghi', 'kjl')]];

    for (const testCase of functionallyUnchangedTestCases) {
        test(`not functionally changed when ${testCase[0]}`, () => {
            expect(LanguageString.isFunctionallyChanged(testCase[1], testCase[2])).toBeFalsy();
        });
    }

    const functionallyChangedTestCases: TestCase[]
        = [
        ['nl changed',
            LanguageString.of('text-en', 'text-nl'),
            LanguageString.of('text-en', 'text-nl-changed')],
        ['nl changed, en undefined',
            LanguageString.of(undefined, 'text-nl'),
            LanguageString.of(undefined, 'text-nl-changed')],
        ['en changed',
            LanguageString.of('text-en', 'text-nl'),
            LanguageString.of('text-en-changed', 'text-nl')],
        ['en changed, nl undefined',
            LanguageString.of('text-en', undefined),
            LanguageString.of('text-en-changed', undefined)],
        ['nl and en changed',
            LanguageString.of('text-en', 'text-nl'),
            LanguageString.of('text-en-changed', 'text-nl-changed')],
        ['one undefined, other nl defined',
            undefined,
            LanguageString.of(undefined, 'text-nl')],
        ['one undefined, other en defined',
            undefined,
            LanguageString.of('text-en', 'text-nl')],
        ['one nl defined, other undefined',
            LanguageString.of(undefined, 'text-nl'),
            undefined],
        ['one en defined, other undefined',
            LanguageString.of('text-en'),
            undefined],
        ['nl and nl defined mixed',
            LanguageString.of('text-en', undefined),
            LanguageString.of(undefined, 'text-nl')],

    ];
    for (const testCase of functionallyChangedTestCases) {
        test(`functionally changed when ${testCase[0]}`, () => {
            expect(LanguageString.isFunctionallyChanged(testCase[1], testCase[2])).toBeTruthy();
        });
    }

});


