import {Iri} from "../../../src/core/domain/shared/iri";
import {aFullContactPoint} from "./contactPoint-test-builder";
import {aFullAddress} from "./address-test-builder";

describe('constructing', () => {
    test('Undefined id throws error', () => {
        expect(() => aFullContactPoint().withId(undefined).build()).toThrow(new Error('id should not be undefined'));
    });

    test('Invalid iri id throws error', () => {
        expect(() => aFullContactPoint().withId(new Iri('  ')).build()).toThrow(new Error('iri should not be blank'));
    });

    test('Undefined uuid throws error', () => {
        expect(() => aFullContactPoint().withUuid(undefined).build()).toThrow(new Error('uuid should not be undefined'));
    });

    test('Blank uuid throws error', () => {
        expect(() => aFullContactPoint().withUuid('   ').build()).toThrow(new Error('uuid should not be blank'));
    });

    describe('address ', () => {
        test('valid address does not throw error', () => {
            const validAddress = aFullAddress().build();
            const contactPoint = aFullContactPoint().withAddress(validAddress);
            expect(() => contactPoint.build()).not.toThrow();
        });

        test('invalid address does throw error', () => {
            const invalidAddress = aFullAddress().withId(undefined);
            expect(() => aFullContactPoint().withAddress(invalidAddress.build()).build()).toThrow();
        });
    });
});