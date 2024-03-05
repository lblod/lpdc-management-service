import {aFullLegalResource} from "./legal-resource-test-builder";
import {LegalResource} from "../../../src/core/domain/legal-resource";
import {Iri} from "../../../src/core/domain/shared/iri";
import {InvariantError} from "../../../src/core/domain/shared/lpdc-error";


describe('forConcept', () => {

   test('undefined id throws error', () => {
       const legalResource = aFullLegalResource().withId(undefined);
       expect(() => LegalResource.forConcept(legalResource.build())).toThrowWithMessage(InvariantError, 'id should not be absent');
   });

    test('invalid iri throws error', () => {
        expect(() => LegalResource.forConcept(aFullLegalResource().withId(new Iri('  ')).build())).toThrowWithMessage(InvariantError, 'iri should not be blank');
    });

    test('undefined uuid throws error', () => {
        const legalResource = aFullLegalResource().withUuid(undefined);
        expect(() => LegalResource.forConcept(legalResource.build())).toThrowWithMessage(InvariantError, 'uuid should not be absent');
    });

    test('blank uuid throws error', () => {
        const legalResource = aFullLegalResource().withUuid(' ');
        expect(() => LegalResource.forConcept(legalResource.build())).toThrowWithMessage(InvariantError, 'uuid should not be blank');
    });

    test('undefined url throws error', () => {
        const legalResource = aFullLegalResource().withUrl(undefined);
        expect(() => LegalResource.forConcept(legalResource.build())).toThrowWithMessage(InvariantError, 'url should not be absent');
    });

    test('blank url throws error', () => {
        const legalResource = aFullLegalResource().withUrl('    ');
        expect(() => LegalResource.forConcept(legalResource.build())).toThrowWithMessage(InvariantError, 'url should not be blank');
    });

    test('undefined order throws error', () => {
        const legalResource = aFullLegalResource().withOrder(undefined);
        expect(() => LegalResource.forConcept(legalResource.build())).toThrowWithMessage(InvariantError, 'order should not be absent');
    });

});

describe('forInstance', () => {

    test('undefined id throws error', () => {
        const legalResource = aFullLegalResource().withId(undefined);
        expect(() => LegalResource.forInstance(legalResource.build())).toThrowWithMessage(InvariantError, 'id should not be absent');
    });

    test('invalid iri throws error', () => {
        expect(() => LegalResource.forInstance(aFullLegalResource().withId(new Iri('  ')).build())).toThrowWithMessage(InvariantError, 'iri should not be blank');
    });

    test('undefined uuid throws error', () => {
        const legalResource = aFullLegalResource().withUuid(undefined);
        expect(() => LegalResource.forInstance(legalResource.build())).toThrowWithMessage(InvariantError, 'uuid should not be absent');
    });

    test('blank uuid throws error', () => {
        const legalResource = aFullLegalResource().withUuid(' ');
        expect(() => LegalResource.forInstance(legalResource.build())).toThrowWithMessage(InvariantError, 'uuid should not be blank');
    });

    test('undefined url does not error', () => {
        const legalResource = aFullLegalResource().withUrl(undefined);
        expect(() => LegalResource.forInstance(legalResource.build())).not.toThrow();
    });

    test('blank url does not throws error', () => {
        const legalResource = aFullLegalResource().withUrl('    ');
        expect(() => LegalResource.forInstance(legalResource.build())).not.toThrow();
    });

    test('undefined order throws error', () => {
        const legalResource = aFullLegalResource().withOrder(undefined);
        expect(() => LegalResource.forInstance(legalResource.build())).toThrowWithMessage(InvariantError, 'order should not be absent');
    });

});

describe('forInstanceSnapshot', () => {

    test('valid instanceSnapshot does not throw error', () => {
        const legalResource = aFullLegalResource().withUuid(undefined);
        expect(() => LegalResource.forInstanceSnapshot(legalResource.build())).not.toThrow();
    });

    test('undefined id throws error', () => {
        const legalResource = aFullLegalResource().withId(undefined);
        expect(() => LegalResource.forInstanceSnapshot(legalResource.build())).toThrowWithMessage(InvariantError, 'id should not be absent');
    });

    test('invalid iri throws error', () => {
        expect(() => LegalResource.forInstanceSnapshot(aFullLegalResource().withId(new Iri('  ')).build())).toThrowWithMessage(InvariantError, 'iri should not be blank');
    });

    test('undefined url throws error', () => {
        const legalResource = aFullLegalResource().withUrl(undefined);
        expect(() => LegalResource.forInstanceSnapshot(legalResource.build())).toThrowWithMessage(InvariantError, 'url should not be absent');
    });

    test('blank url throws error', () => {
        const legalResource = aFullLegalResource().withUrl('    ');
        expect(() => LegalResource.forInstanceSnapshot(legalResource.build())).toThrowWithMessage(InvariantError, 'url should not be blank');
    });

    test('undefined order throws error', () => {
        const legalResource = aFullLegalResource().withOrder(undefined);
        expect(() => LegalResource.forInstanceSnapshot(legalResource.build())).toThrowWithMessage(InvariantError, 'order should not be absent');
    });

});

describe('isFunctionallyChanged', () => {

    test('when different amount of legalResources , then return true', () => {
        const legalResource1 = aFullLegalResource().withUrl('https://url1.com').build();
        const legalResource2 = aFullLegalResource().withUrl('https://url2.com').build();

        expect(LegalResource.isFunctionallyChanged([legalResource1, legalResource2], [legalResource2])).toBeTruthy();
    });

    test('when url is different, then return true', () => {
        const legalResource1 = aFullLegalResource().withUrl('https://url1.com').build();
        const legalResource2 = aFullLegalResource().withUrl('https://url2.com').build();

        expect(LegalResource.isFunctionallyChanged([legalResource1], [legalResource2])).toBeTruthy();

    });

    test('when url is the same, then return true', () => {
        const legalResource1 = aFullLegalResource().withUrl('https://url1.com').build();
        const legalResource2 = aFullLegalResource().withUrl('https://url1.com').build();

        expect(LegalResource.isFunctionallyChanged([legalResource1], [legalResource2])).toBeFalsy();
    });

    test('when urls are the same in same order, then return true', () => {
        const legalResource1 = aFullLegalResource().withUrl('https://url1.com').build();
        const legalResource2 = aFullLegalResource().withUrl('https://url1.com').build();
        const legalResource3 = aFullLegalResource().withUrl('https://url2.com').build();
        const legalResource4 = aFullLegalResource().withUrl('https://url2.com').build();

        expect(LegalResource.isFunctionallyChanged([legalResource1, legalResource3], [legalResource2, legalResource4])).toBeFalsy();
    });

    test('when urls are the same but in different order, then return true', () => {
        const legalResource1 = aFullLegalResource().withUrl('https://url1.com').build();
        const legalResource2 = aFullLegalResource().withUrl('https://url1.com').build();
        const legalResource3 = aFullLegalResource().withUrl('https://url2.com').build();
        const legalResource4 = aFullLegalResource().withUrl('https://url2.com').build();

        expect(LegalResource.isFunctionallyChanged([legalResource1, legalResource3], [legalResource4, legalResource2])).toBeTruthy();
    });

});
