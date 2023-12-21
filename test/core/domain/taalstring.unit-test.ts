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
        const taalstring = TaalString.of(undefined, undefined, undefined, undefined,'text-nl-generated-formal');

        expect(taalstring.nlGeneratedFormal).toEqual('text-nl-generated-formal');
    });

    test('can build a taalstring with only nl-generated-informal', () => {
        const taalstring = TaalString.of(undefined, undefined, undefined, undefined,undefined, 'text-nl-generated-informal');

        expect(taalstring.nlGeneratedInformal).toEqual('text-nl-generated-informal');
    });

    test('when no values specified, returns undefined', () => {
        const taalstring = TaalString.of();

        expect(taalstring).toBeUndefined();
    });


});
