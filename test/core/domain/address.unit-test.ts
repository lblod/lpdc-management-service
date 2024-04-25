import {Iri} from "../../../src/core/domain/shared/iri";
import {aFullAddressForInstance, aFullAddressForInstanceSnapshot} from "./address-test-builder";
import {LanguageString} from "../../../src/core/domain/language-string";
import {Address} from "../../../src/core/domain/address";
import {InvariantError} from "../../../src/core/domain/shared/lpdc-error";

describe('constructing', () => {

    describe('forInstance', () => {

        test('Undefined id throws error', () => {
            expect(() => Address.forInstance(aFullAddressForInstance().withId(undefined).build())).toThrowWithMessage(InvariantError, 'id mag niet ontbreken');
        });

        test('Invalid iri id throws error', () => {
            expect(() => Address.forInstance(aFullAddressForInstance().withId(new Iri('  ')).build())).toThrowWithMessage(InvariantError, 'iri mag niet leeg zijn');
        });

        test('Undefined uuid throws error', () => {
            expect(() => Address.forInstance(aFullAddressForInstance().withUuid(undefined).build())).toThrowWithMessage(InvariantError, 'uuid mag niet ontbreken');
        });

        test('Blank uuid throws error', () => {
            expect(() => Address.forInstance(aFullAddressForInstance().withUuid('   ').build())).toThrowWithMessage(InvariantError, 'uuid mag niet leeg zijn');
        });

        test('Invalid iri verwijst naar throws error', () => {
            expect(() => Address.forInstance(aFullAddressForInstance().withVerwijstNaar(new Iri('bad iri')).build())).toThrowWithMessage(InvariantError, 'iri begint niet met een van volgende waarden: [http://,https://,_:]');
        });

        describe('Gemeentenaam, land en straatnaam', () => {

            test('invalid gemeentenaam throws error', () => {
                expect(() => Address.forInstance(aFullAddressForInstance()
                    .withGemeentenaam(LanguageString.of('nl gemeentenaam', 'formal gemeentenaam'))
                    .build()))
                    .toThrowWithMessage(InvariantError, 'Er is meer dan een nl-taal aanwezig');
            });

            test('invalid land throws error', () => {
                expect(() => Address.forInstance(aFullAddressForInstance()
                    .withGemeentenaam(LanguageString.of('nl land', 'formal land'))
                    .build()))
                    .toThrowWithMessage(InvariantError, 'Er is meer dan een nl-taal aanwezig');
            });

            test('invalid straatnaam throws error', () => {
                expect(() => Address.forInstance(aFullAddressForInstance()
                    .withGemeentenaam(LanguageString.of('nl straatnaam', 'formal straatnaam'))
                    .build()))
                    .toThrowWithMessage(InvariantError, 'Er is meer dan een nl-taal aanwezig');
            });

            test('straatnaam, land and straatnaam should have nl languageString', () => {
                expect(() => Address.forInstance(aFullAddressForInstance()
                    .withGemeentenaam(LanguageString.of(undefined, 'formal gemeentenaam'))
                    .withLand(LanguageString.of(undefined, 'formal land'))
                    .withStraatnaam(LanguageString.of(undefined, 'formal straatnaam'))
                    .build()))
                    .toThrowWithMessage(InvariantError, 'De nl-taal verschilt van nl');
            });

            test('valid languages does not throw error', () => {
                expect(() => Address.forInstance(aFullAddressForInstance()
                    .withGemeentenaam(LanguageString.of('gemeente'))
                    .withLand(LanguageString.of('land'))
                    .withStraatnaam(LanguageString.of('straat'))
                    .build()))
                    .not.toThrow();
            });

            test('no gemeentenaam, land and straat does not throw error', () => {
                expect(() => Address.forInstance(aFullAddressForInstance()
                    .withGemeentenaam(undefined)
                    .withLand(undefined)
                    .withStraatnaam(undefined)
                    .build()))
                    .not.toThrow();
            });
        });

    });

    describe('forInstanceSnapshot', () => {

        test('Undefined id throws error', () => {
            expect(() => Address.forInstanceSnapshot(aFullAddressForInstanceSnapshot().withId(undefined).build())).toThrowWithMessage(InvariantError, 'id mag niet ontbreken');
        });

        test('Undefined uuid does not throw error', () => {
            expect(Address.forInstanceSnapshot(aFullAddressForInstanceSnapshot().withUuid(undefined).build()).uuid).toBeUndefined();
        });

        describe('Gemeentenaam, land en straatnaam', () => {

            test('invalid gemeentenaam throws error', () => {
                expect(() => Address.forInstanceSnapshot(aFullAddressForInstanceSnapshot()
                    .withGemeentenaam(LanguageString.of('nl', 'formal'))
                    .build()))
                    .toThrowWithMessage(InvariantError, 'Er is meer dan een nl-taal aanwezig');
            });

            test('invalid land throws error', () => {
                expect(() => Address.forInstanceSnapshot(aFullAddressForInstanceSnapshot()
                    .withGemeentenaam(LanguageString.of('nl', 'formal'))
                    .build()))
                    .toThrowWithMessage(InvariantError, 'Er is meer dan een nl-taal aanwezig');
            });

            test('invalid straatnaam throws error', () => {
                expect(() => Address.forInstanceSnapshot(aFullAddressForInstanceSnapshot()
                    .withGemeentenaam(LanguageString.of('nl', 'formal'))
                    .build()))
                    .toThrowWithMessage(InvariantError, 'Er is meer dan een nl-taal aanwezig');
            });

            test('valid languages does not throw error', () => {
                expect(() => Address.forInstanceSnapshot(aFullAddressForInstanceSnapshot()
                    .withGemeentenaam(LanguageString.of('gemeente'))
                    .withLand(LanguageString.of('land'))
                    .withStraatnaam(LanguageString.of('straat'))
                    .build()))
                    .not.toThrow();
            });

            test('no gemeentenaam, land and straat does not throw error', () => {
                expect(() => Address.forInstanceSnapshot(aFullAddressForInstanceSnapshot()
                    .withGemeentenaam(undefined)
                    .withLand(undefined)
                    .withStraatnaam(undefined)
                    .build()))
                    .not.toThrow();
            });
        });

    });

});
