import {TaalString} from "../../../src/core/domain/taal-string";

describe('constructing', () => {

    test('can build a full taalstring', () => {
        const taalstring = TaalString.of('text-en', 'text-nl', 'text-nl-formal', 'text-nl-informal', 'text-nl-generated-formal', 'text-nl-generated-informal');

        expect(taalstring.en).toEqual('text-en');
        expect(taalstring.nl).toEqual('text-nl');
        expect(taalstring.nlFormal).toEqual('text-nl-formal');
        expect(taalstring.nlInformal).toEqual('text-nl-informal');
        expect(taalstring.nlGeneratedFormal).toEqual('text-nl-generated-formal');
        expect(taalstring.nlGeneratedInformal).toEqual('text-nl-generated-informal');
    });

    test('can build a taalstring with only en', () => {
        const taalstring = TaalString.of('text-en', undefined);

        expect(taalstring.en).toEqual('text-en');
        expect(taalstring.nl).toBeUndefined();
    });

    test('can build a taalstring with only nl', () => {
        const taalstring = TaalString.of(undefined, 'text-nl');

        expect(taalstring.en).toBeUndefined();
        expect(taalstring.nl).toEqual('text-nl');
    });

    test('can build a taalstring with only nl-formal', () => {
        const taalstring = TaalString.of(undefined, undefined, 'text-nl-formal');

        expect(taalstring.nlFormal).toEqual('text-nl-formal');
    });

    test('can build a taalstring with only nl-informal', () => {
        const taalstring = TaalString.of(undefined, undefined, undefined, 'text-nl-informal');

        expect(taalstring.nlInformal).toEqual('text-nl-informal');
    });

    test('can build a taalstring with only nl-generated-formal', () => {
        const taalstring = TaalString.of(undefined, undefined, undefined, undefined, 'text-nl-generated-formal');

        expect(taalstring.nlGeneratedFormal).toEqual('text-nl-generated-formal');
    });

    test('can build a taalstring with only nl-generated-informal', () => {
        const taalstring = TaalString.of(undefined, undefined, undefined, undefined, undefined, 'text-nl-generated-informal');

        expect(taalstring.nlGeneratedInformal).toEqual('text-nl-generated-informal');
    });

    test('when no values specified, returns undefined', () => {
        const taalstring = TaalString.of();

        expect(taalstring).toBeUndefined();
    });


});

describe('is functionally changed', () => {

    type TestCase = [string, TaalString | undefined, TaalString | undefined];

    const functionallyUnchangedTestCases: TestCase[]
        = [
        ['empty taalstrings',
            TaalString.of(),
            TaalString.of()],
        ['en equal',
            TaalString.of('text-en'),
            TaalString.of('text-en')],
        ['nl equal',
            TaalString.of(undefined, 'text-nl'),
            TaalString.of(undefined, 'text-nl')],
        ['en and nl equal',
            TaalString.of('text-en', 'text-nl'),
            TaalString.of('text-en', 'text-nl')],
        ['en and nl equal; nl formal not equal',
            TaalString.of('text-en', 'text-nl', 'abc', 'def', 'ghi', 'kjl'),
            TaalString.of('text-en', 'text-nl', 'abcd', 'def', 'ghi', 'kjl')],
        ['en and nl equal; nl informal not equal',
            TaalString.of('text-en', 'text-nl', 'abc', 'def', 'ghi', 'kjl'),
            TaalString.of('text-en', 'text-nl', 'abc', 'defd', 'ghi', 'kjl')],
        ['en and nl equal; nl generated formal not equal',
            TaalString.of('text-en', 'text-nl', 'abc', 'def', 'ghi', 'kjl'),
            TaalString.of('text-en', 'text-nl', 'abc', 'def', 'ghid', 'kjl')],
        ['en and nl equal; nl generated informal not equal',
            TaalString.of('text-en', 'text-nl', 'abc', 'def', 'ghi', 'kjl'),
            TaalString.of('text-en', 'text-nl', 'abc', 'def', 'ghi', 'kjld')],
        ['en and nl equal; other languages undefined ',
            TaalString.of('text-en', 'text-nl', 'abc', 'def', 'ghi', 'kjl'),
            TaalString.of('text-en', 'text-nl', undefined, undefined, undefined, undefined)],
        ['en and nl equal; this languages undefined',
            TaalString.of('text-en', 'text-nl', undefined, undefined, undefined, undefined),
            TaalString.of('text-en', 'text-nl', 'abc', 'def', 'ghi', 'kjl')]];

    for (const testCase of functionallyUnchangedTestCases) {
        test(`not functionally changed when ${testCase[0]}`, () => {
            expect(TaalString.isFunctionallyChanged(testCase[1], testCase[2])).toBeFalsy();
        });
    }

    const functionallyChangedTestCases: TestCase[]
        = [
        ['nl changed',
            TaalString.of('text-en', 'text-nl'),
            TaalString.of('text-en', 'text-nl-changed')],
        ['nl changed, en undefined',
            TaalString.of(undefined, 'text-nl'),
            TaalString.of(undefined, 'text-nl-changed')],
        ['en changed',
            TaalString.of('text-en', 'text-nl'),
            TaalString.of('text-en-changed', 'text-nl')],
        ['en changed, nl undefined',
            TaalString.of('text-en', undefined),
            TaalString.of('text-en-changed', undefined)],
        ['nl and en changed',
            TaalString.of('text-en', 'text-nl'),
            TaalString.of('text-en-changed', 'text-nl-changed')],
        ['one undefined, other nl defined',
            undefined,
            TaalString.of(undefined, 'text-nl')],
        ['one undefined, other en defined',
            undefined,
            TaalString.of('text-en', 'text-nl')],
        ['one nl defined, other undefined',
            TaalString.of(undefined, 'text-nl'),
            undefined],
        ['one en defined, other undefined',
            TaalString.of('text-en'),
            undefined],
        ['nl and nl defined mixed',
            TaalString.of('text-en', undefined),
            TaalString.of(undefined, 'text-nl')],

    ];
    for (const testCase of functionallyChangedTestCases) {
        test(`functionally changed when ${testCase[0]}`, () => {
            expect(TaalString.isFunctionallyChanged(testCase[1], testCase[2])).toBeTruthy();
        });
    }

});


