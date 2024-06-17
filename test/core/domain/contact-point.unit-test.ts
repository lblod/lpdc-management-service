import {Iri} from "../../../src/core/domain/shared/iri";
import {aFullContactPointForInstance} from "./contact-point-test-builder";
import {aFullAddressForInstance} from "./address-test-builder";
import {ContactPoint, ContactPointBuilder} from "../../../src/core/domain/contact-point";
import {InvariantError} from "../../../src/core/domain/shared/lpdc-error";

describe('constructing', () => {

    describe('forInstance', () => {

        test('Undefined id throws error', () => {
            expect(() => ContactPoint.forInstance(aFullContactPointForInstance().withId(undefined).build())).toThrowWithMessage(InvariantError, 'id mag niet ontbreken');
        });

        test('Invalid iri id throws error', () => {
            expect(() => ContactPoint.forInstance(aFullContactPointForInstance().withId(new Iri('  ')).build())).toThrowWithMessage(InvariantError, 'iri mag niet leeg zijn');
        });

        test('Undefined uuid throws error', () => {
            expect(() => ContactPoint.forInstance(aFullContactPointForInstance().withUuid(undefined).build())).toThrowWithMessage(InvariantError, 'uuid mag niet ontbreken');
        });

        test('Blank uuid throws error', () => {
            expect(() => ContactPoint.forInstance(aFullContactPointForInstance().withUuid('   ').build())).toThrowWithMessage(InvariantError, 'uuid mag niet leeg zijn');
        });

        test('Blank order throws error', () => {
            expect(() => ContactPoint.forInstance(aFullContactPointForInstance().withOrder(undefined).build())).toThrowWithMessage(InvariantError, 'order mag niet ontbreken');
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
            expect(() => ContactPoint.forInstanceSnapshot(aFullContactPointForInstance().withId(undefined).build())).toThrowWithMessage(InvariantError, 'id mag niet ontbreken');
        });

        test('Undefined uuid does not throw error', () => {
            expect(ContactPoint.forInstanceSnapshot(aFullContactPointForInstance().withUuid(undefined).build()).uuid).toBeUndefined();
        });

        test('Undefined order throws error', () => {
            expect(() => ContactPoint.forInstanceSnapshot(aFullContactPointForInstance().withOrder(undefined).build())).toThrowWithMessage(InvariantError, 'order mag niet ontbreken');
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

    test('copies in builder', () => {
       const aContactPoint = aFullContactPointForInstance().build();
       expect(ContactPointBuilder.from(aContactPoint).build()).toEqual(aContactPoint);
    });

});