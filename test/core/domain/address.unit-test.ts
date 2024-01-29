import {Iri} from "../../../src/core/domain/shared/iri";
import {aFullAddress} from "./address-test-builder";
import {LanguageString} from "../../../src/core/domain/language-string";

describe('constructing', () => {
    test('Undefined id throws error', () => {
        expect(() => aFullAddress().withId(undefined).build()).toThrow(new Error('id should not be undefined'));
    });

    test('Invalid iri id throws error', () => {
        expect(() => aFullAddress().withId(new Iri('  ')).build()).toThrow(new Error('iri should not be blank'));
    });

    test('Undefined uuid throws error', () => {
        expect(() => aFullAddress().withUuid(undefined).build()).toThrow(new Error('uuid should not be undefined'));
    });

    test('Blank uuid throws error', () => {
        expect(() => aFullAddress().withUuid('   ').build()).toThrow(new Error('uuid should not be blank'));
    });

    test('Invalid iri verwijst naar throws error', () => {
        expect(() => aFullAddress().withVerwijstNaar(new Iri('bad iri')).build()).toThrow(new Error('iri does not start with one of [http://,https://]'));
    });

    describe('Gemeentenaam, land en straatnaam', () => {

        test('invalid gemeentenaam throws error', () => {
            expect(() => aFullAddress()
                .withGemeentenaam(LanguageString.of('english', 'dutch'))
                .build())
                .toThrow(new Error('Address languagesStrings should only contain NL'));
        });

        test('invalid land throws error', () => {
            expect(() => aFullAddress()
                .withGemeentenaam(LanguageString.of('english', 'dutch'))
                .build())
                .toThrow(new Error('Address languagesStrings should only contain NL'));
        });

        test('invalid straatnaam throws error', () => {
            expect(() => aFullAddress()
                .withGemeentenaam(LanguageString.of('english', 'dutch'))
                .build())
                .toThrow(new Error('Address languagesStrings should only contain NL'));
        });

        test('language EN and NL throws error', () => {
            expect(() => aFullAddress()
                .withGemeentenaam(LanguageString.of('english', 'dutch'))
                .build())
                .toThrow(new Error('Address languagesStrings should only contain NL'));
        });

        test('language NL and NL-FORMAL throws error', () => {
            expect(() => aFullAddress()
                .withGemeentenaam(LanguageString.of(undefined, 'dutch', 'nl-formal'))
                .build())
                .toThrow(new Error('Address languagesStrings should only contain NL'));
        });

        test('valid languages does not throw error', () => {
            expect(() => aFullAddress()
                .withGemeentenaam(LanguageString.of(undefined, 'gemeente'))
                .withLand(LanguageString.of(undefined, 'land'))
                .withStraatnaam(LanguageString.of(undefined, 'straat'))
                .build()
            )
                .not.toThrow();
        });

        test('no gemeentenaam, land and straat does not throw error', () => {
            expect(() => aFullAddress()
                .withGemeentenaam(undefined)
                .withLand(undefined)
                .withStraatnaam(undefined)
                .build()
            )
                .not.toThrow();
        });
    });


});