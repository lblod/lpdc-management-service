import {Iri} from "../../../src/core/domain/shared/iri";
import {aFullAddressForInstance, aFullAddressForInstanceSnapshot} from "./address-test-builder";
import {LanguageString} from "../../../src/core/domain/language-string";
import {Address} from "../../../src/core/domain/address";
import {InvariantError} from "../../../src/core/domain/shared/lpdc-error";

describe('constructing', () => {

    describe('forInstance', () => {

        test('Undefined id throws error', () => {
            expect(() => Address.forInstance(aFullAddressForInstance().withId(undefined).build())).toThrowWithMessage(InvariantError, 'id should not be absent');
        });

        test('Invalid iri id throws error', () => {
            expect(() => Address.forInstance(aFullAddressForInstance().withId(new Iri('  ')).build())).toThrowWithMessage(InvariantError, 'iri should not be blank');
        });

        test('Undefined uuid throws error', () => {
            expect(() => Address.forInstance(aFullAddressForInstance().withUuid(undefined).build())).toThrowWithMessage(InvariantError, 'uuid should not be absent');
        });

        test('Blank uuid throws error', () => {
            expect(() => Address.forInstance(aFullAddressForInstance().withUuid('   ').build())).toThrowWithMessage(InvariantError, 'uuid should not be blank');
        });

        test('Invalid iri verwijst naar throws error', () => {
            expect(() => Address.forInstance(aFullAddressForInstance().withVerwijstNaar(new Iri('bad iri')).build())).toThrowWithMessage(InvariantError, 'iri does not start with one of [http://,https://]');
        });

        describe('Gemeentenaam, land en straatnaam', () => {

            test('invalid gemeentenaam throws error', () => {
                expect(() => Address.forInstance(aFullAddressForInstance()
                    .withGemeentenaam(LanguageString.of('english', 'dutch'))
                    .build()))
                    .toThrowWithMessage(InvariantError, 'Address languagesStrings should only contain NL');
            });

            test('invalid land throws error', () => {
                expect(() => Address.forInstance(aFullAddressForInstance()
                    .withGemeentenaam(LanguageString.of('english', 'dutch'))
                    .build()))
                    .toThrowWithMessage(InvariantError, 'Address languagesStrings should only contain NL');
            });

            test('invalid straatnaam throws error', () => {
                expect(() => Address.forInstance(aFullAddressForInstance()
                    .withGemeentenaam(LanguageString.of('english', 'dutch'))
                    .build()))
                    .toThrowWithMessage(InvariantError, 'Address languagesStrings should only contain NL');
            });

            test('language EN and NL throws error', () => {
                expect(() => Address.forInstance(aFullAddressForInstance()
                    .withGemeentenaam(LanguageString.of('english', 'dutch'))
                    .build()))
                    .toThrowWithMessage(InvariantError, 'Address languagesStrings should only contain NL');
            });

            test('language NL and NL-FORMAL throws error', () => {
                expect(() => Address.forInstance(aFullAddressForInstance()
                    .withGemeentenaam(LanguageString.of(undefined, 'dutch', 'nl-formal'))
                    .build()))
                    .toThrowWithMessage(InvariantError, 'Address languagesStrings should only contain NL');
            });

            test('valid languages does not throw error', () => {
                expect(() => Address.forInstance(aFullAddressForInstance()
                    .withGemeentenaam(LanguageString.of(undefined, 'gemeente'))
                    .withLand(LanguageString.of(undefined, 'land'))
                    .withStraatnaam(LanguageString.of(undefined, 'straat'))
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
            expect(() => Address.forInstanceSnapshot(aFullAddressForInstanceSnapshot().withId(undefined).build())).toThrowWithMessage(InvariantError, 'id should not be absent');
        });

        test('Undefined uuid does not throw error', () => {
            expect(Address.forInstanceSnapshot(aFullAddressForInstanceSnapshot().withUuid(undefined).build()).uuid).toBeUndefined();
        });

        describe('Gemeentenaam, land en straatnaam', () => {

            test('invalid gemeentenaam throws error', () => {
                expect(() => Address.forInstanceSnapshot(aFullAddressForInstanceSnapshot()
                    .withGemeentenaam(LanguageString.of('english', 'dutch'))
                    .build()))
                    .toThrowWithMessage(InvariantError, 'Address languagesStrings should only contain NL');
            });

            test('invalid land throws error', () => {
                expect(() => Address.forInstanceSnapshot(aFullAddressForInstanceSnapshot()
                    .withGemeentenaam(LanguageString.of('english', 'dutch'))
                    .build()))
                    .toThrowWithMessage(InvariantError, 'Address languagesStrings should only contain NL');
            });

            test('invalid straatnaam throws error', () => {
                expect(() => Address.forInstanceSnapshot(aFullAddressForInstanceSnapshot()
                    .withGemeentenaam(LanguageString.of('english', 'dutch'))
                    .build()))
                    .toThrowWithMessage(InvariantError, 'Address languagesStrings should only contain NL');
            });

            test('language EN and NL throws error', () => {
                expect(() => Address.forInstanceSnapshot(aFullAddressForInstanceSnapshot()
                    .withGemeentenaam(LanguageString.of('english', 'dutch'))
                    .build()))
                    .toThrowWithMessage(InvariantError, 'Address languagesStrings should only contain NL');
            });

            test('language NL and NL-FORMAL throws error', () => {
                expect(() => Address.forInstanceSnapshot(aFullAddressForInstanceSnapshot()
                    .withGemeentenaam(LanguageString.of(undefined, 'dutch', 'nl-formal'))
                    .build()))
                    .toThrowWithMessage(InvariantError, 'Address languagesStrings should only contain NL');
            });

            test('valid languages does not throw error', () => {
                expect(() => Address.forInstanceSnapshot(aFullAddressForInstanceSnapshot()
                    .withGemeentenaam(LanguageString.of(undefined, 'gemeente'))
                    .withLand(LanguageString.of(undefined, 'land'))
                    .withStraatnaam(LanguageString.of(undefined, 'straat'))
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