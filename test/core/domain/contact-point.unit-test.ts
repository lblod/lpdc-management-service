import {Iri} from "../../../src/core/domain/shared/iri";
import {aFullContactPointForInstance} from "./contact-point-test-builder";
import {aFullAddressForInstance} from "./address-test-builder";
import {ContactPoint} from "../../../src/core/domain/contact-point";

describe('constructing', () => {

    describe('forInstance', () => {

        test('Undefined id throws error', () => {
            expect(() => ContactPoint.forInstance(aFullContactPointForInstance().withId(undefined).build())).toThrow(new Error('id should not be absent'));
        });

        test('Invalid iri id throws error', () => {
            expect(() => ContactPoint.forInstance(aFullContactPointForInstance().withId(new Iri('  ')).build())).toThrow(new Error('iri should not be blank'));
        });

        test('Undefined uuid throws error', () => {
            expect(() => ContactPoint.forInstance(aFullContactPointForInstance().withUuid(undefined).build())).toThrow(new Error('uuid should not be absent'));
        });

        test('Blank uuid throws error', () => {
            expect(() => ContactPoint.forInstance(aFullContactPointForInstance().withUuid('   ').build())).toThrow(new Error('uuid should not be blank'));
        });

        test('Blank order throws error', () => {
            expect(() => ContactPoint.forInstance(aFullContactPointForInstance().withOrder(undefined).build())).toThrow(new Error('order should not be absent'));
        });

        describe('address ', () => {

            test('valid address does not throw error', () => {
                const validAddress = aFullAddressForInstance().build();
                const contactPoint = aFullContactPointForInstance().withAddress(validAddress);
                expect(() => ContactPoint.forInstance(contactPoint.build())).not.toThrow();
            });

            test('invalid address does throw error', () => {
                const invalidAddress = aFullAddressForInstance().withId(undefined);
                expect(() => ContactPoint.forInstance(aFullContactPointForInstance().withAddress(invalidAddress.build()).build())).toThrow();
            });

        });

    });

    describe('forInstanceSnapshot', () => {

        test('Undefined id throws error', () => {
            expect(() => ContactPoint.forInstanceSnapshot(aFullContactPointForInstance().withId(undefined).build())).toThrow(new Error('id should not be absent'));
        });

        test('Undefined uuid does not throw error', () => {
            expect(ContactPoint.forInstanceSnapshot(aFullContactPointForInstance().withUuid(undefined).build()).uuid).toBeUndefined();
        });

        test('Undefined order throws error', () => {
            expect(() => ContactPoint.forInstanceSnapshot(aFullContactPointForInstance().withOrder(undefined).build())).toThrow(new Error('order should not be absent'));
        });

        describe('address ', () => {

            test('valid address does not throw error', () => {
                const validAddress = aFullAddressForInstance().build();
                const contactPoint = aFullContactPointForInstance().withAddress(validAddress);
                expect(() => ContactPoint.forInstanceSnapshot(contactPoint.build())).not.toThrow();
            });

            test('invalid address does throw error', () => {
                const invalidAddress = aFullAddressForInstance().withId(undefined);
                expect(() => ContactPoint.forInstanceSnapshot(aFullContactPointForInstance().withAddress(invalidAddress.build()).build())).toThrow();
            });

        });

    });

});