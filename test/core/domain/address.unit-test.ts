import {Iri} from "../../../src/core/domain/shared/iri";
import {aFullAddress} from "./address-test-builder";

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
});