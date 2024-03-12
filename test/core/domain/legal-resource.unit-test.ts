import {
    aFullLegalResourceForConcept,
    aFullLegalResourceForConceptSnapshot,
    aFullLegalResourceForInstance,
    aFullLegalResourceForInstanceSnapshot
} from "./legal-resource-test-builder";
import {LegalResource} from "../../../src/core/domain/legal-resource";
import {InvariantError} from "../../../src/core/domain/shared/lpdc-error";


describe('forConceptSnapshot', () => {

    test('undefined id throws error', () => {
        const legalResource = aFullLegalResourceForConceptSnapshot().withId(undefined);
        expect(() => LegalResource.forConceptSnapshot(legalResource.build())).toThrowWithMessage(InvariantError, 'id mag niet ontbreken');
    });

    test('undefined url throws error', () => {
        const legalResource = aFullLegalResourceForConceptSnapshot().withUrl(undefined);
        expect(() => LegalResource.forConceptSnapshot(legalResource.build())).toThrowWithMessage(InvariantError, 'url mag niet ontbreken');
    });

    test('blank url throws error', () => {
        const legalResource = aFullLegalResourceForConceptSnapshot().withUrl('    ');
        expect(() => LegalResource.forConceptSnapshot(legalResource.build())).toThrowWithMessage(InvariantError, 'url mag niet leeg zijn');
    });

    test('undefined order throws error', () => {
        const legalResource = aFullLegalResourceForConceptSnapshot().withOrder(undefined);
        expect(() => LegalResource.forConceptSnapshot(legalResource.build())).toThrowWithMessage(InvariantError, 'order mag niet ontbreken');
    });

});

describe('forConcept', () => {

    test('undefined id throws error', () => {
        const legalResource = aFullLegalResourceForConcept().withId(undefined);
        expect(() => LegalResource.forConcept(legalResource.build())).toThrowWithMessage(InvariantError, 'id mag niet ontbreken');
    });

    test('undefined uuid throws error', () => {
        const legalResource = aFullLegalResourceForConcept().withUuid(undefined);
        expect(() => LegalResource.forConcept(legalResource.build())).toThrowWithMessage(InvariantError, 'uuid mag niet ontbreken');
    });

    test('blank uuid throws error', () => {
        const legalResource = aFullLegalResourceForConcept().withUuid(' ');
        expect(() => LegalResource.forConcept(legalResource.build())).toThrowWithMessage(InvariantError, 'uuid mag niet leeg zijn');
    });

    test('undefined url throws error', () => {
        const legalResource = aFullLegalResourceForConcept().withUrl(undefined);
        expect(() => LegalResource.forConcept(legalResource.build())).toThrowWithMessage(InvariantError, 'url mag niet ontbreken');
    });

    test('blank url throws error', () => {
        const legalResource = aFullLegalResourceForConcept().withUrl('    ');
        expect(() => LegalResource.forConcept(legalResource.build())).toThrowWithMessage(InvariantError, 'url mag niet leeg zijn');
    });

    test('undefined order throws error', () => {
        const legalResource = aFullLegalResourceForConcept().withOrder(undefined);
        expect(() => LegalResource.forConcept(legalResource.build())).toThrowWithMessage(InvariantError, 'order mag niet ontbreken');
    });

});

describe('forInstance', () => {

    test('undefined id throws error', () => {
        const legalResource = aFullLegalResourceForInstance().withId(undefined);
        expect(() => LegalResource.forInstance(legalResource.build())).toThrowWithMessage(InvariantError, 'id mag niet ontbreken');
    });

    test('undefined uuid throws error', () => {
        const legalResource = aFullLegalResourceForInstance().withUuid(undefined);
        expect(() => LegalResource.forInstance(legalResource.build())).toThrowWithMessage(InvariantError, 'uuid mag niet ontbreken');
    });

    test('blank uuid throws error', () => {
        const legalResource = aFullLegalResourceForInstance().withUuid(' ');
        expect(() => LegalResource.forInstance(legalResource.build())).toThrowWithMessage(InvariantError, 'uuid mag niet leeg zijn');
    });

    test('undefined url does not error', () => {
        const legalResource = aFullLegalResourceForInstance().withUrl(undefined);
        expect(() => LegalResource.forInstance(legalResource.build())).not.toThrow();
    });

    test('blank url does not throws error', () => {
        const legalResource = aFullLegalResourceForInstance().withUrl('    ');
        expect(() => LegalResource.forInstance(legalResource.build())).not.toThrow();
    });

    test('undefined order throws error', () => {
        const legalResource = aFullLegalResourceForInstance().withOrder(undefined);
        expect(() => LegalResource.forInstance(legalResource.build())).toThrowWithMessage(InvariantError, 'order mag niet ontbreken');
    });

});

describe('forInstanceSnapshot', () => {

    test('valid instanceSnapshot does not throw error', () => {
        const legalResource = aFullLegalResourceForInstanceSnapshot().withUuid(undefined);
        expect(() => LegalResource.forInstanceSnapshot(legalResource.build())).not.toThrow();
    });

    test('undefined id throws error', () => {
        const legalResource = aFullLegalResourceForInstanceSnapshot().withId(undefined);
        expect(() => LegalResource.forInstanceSnapshot(legalResource.build())).toThrowWithMessage(InvariantError, 'id mag niet ontbreken');
    });

    test('undefined url throws error', () => {
        const legalResource = aFullLegalResourceForInstanceSnapshot().withUrl(undefined);
        expect(() => LegalResource.forInstanceSnapshot(legalResource.build())).toThrowWithMessage(InvariantError, 'url mag niet ontbreken');
    });

    test('blank url throws error', () => {
        const legalResource = aFullLegalResourceForInstanceSnapshot().withUrl('    ');
        expect(() => LegalResource.forInstanceSnapshot(legalResource.build())).toThrowWithMessage(InvariantError, 'url mag niet leeg zijn');
    });

    test('undefined order throws error', () => {
        const legalResource = aFullLegalResourceForInstanceSnapshot().withOrder(undefined);
        expect(() => LegalResource.forInstanceSnapshot(legalResource.build())).toThrowWithMessage(InvariantError, 'order mag niet ontbreken');
    });

});

describe('isFunctionallyChanged', () => {

    test('when different amount of legalResources , then return true', () => {
        const legalResource1 = aFullLegalResourceForConcept().withUrl('https://url1.com').build();
        const legalResource2 = aFullLegalResourceForConcept().withUrl('https://url2.com').build();

        expect(LegalResource.isFunctionallyChanged([legalResource1, legalResource2], [legalResource2])).toBeTruthy();
    });

    test('when url is different, then return true', () => {
        const legalResource1 = aFullLegalResourceForConcept().withUrl('https://url1.com').build();
        const legalResource2 = aFullLegalResourceForConcept().withUrl('https://url2.com').build();

        expect(LegalResource.isFunctionallyChanged([legalResource1], [legalResource2])).toBeTruthy();

    });

    test('when url is the same, then return true', () => {
        const legalResource1 = aFullLegalResourceForConcept().withUrl('https://url1.com').build();
        const legalResource2 = aFullLegalResourceForConcept().withUrl('https://url1.com').build();

        expect(LegalResource.isFunctionallyChanged([legalResource1], [legalResource2])).toBeFalsy();
    });

    test('when urls are the same in same order, then return true', () => {
        const legalResource1 = aFullLegalResourceForConcept().withUrl('https://url1.com').build();
        const legalResource2 = aFullLegalResourceForConcept().withUrl('https://url1.com').build();
        const legalResource3 = aFullLegalResourceForConcept().withUrl('https://url2.com').build();
        const legalResource4 = aFullLegalResourceForConcept().withUrl('https://url2.com').build();

        expect(LegalResource.isFunctionallyChanged([legalResource1, legalResource3], [legalResource2, legalResource4])).toBeFalsy();
    });

    test('when urls are the same but in different order, then return true', () => {
        const legalResource1 = aFullLegalResourceForConcept().withUrl('https://url1.com').build();
        const legalResource2 = aFullLegalResourceForConcept().withUrl('https://url1.com').build();
        const legalResource3 = aFullLegalResourceForConcept().withUrl('https://url2.com').build();
        const legalResource4 = aFullLegalResourceForConcept().withUrl('https://url2.com').build();

        expect(LegalResource.isFunctionallyChanged([legalResource1, legalResource3], [legalResource4, legalResource2])).toBeTruthy();
    });

});
