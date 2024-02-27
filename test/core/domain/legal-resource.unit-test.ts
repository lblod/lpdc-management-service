import {aLegalResource} from "./legal-resource-test-builder";
import {LegalResource} from "../../../src/core/domain/legal-resource";
import {Iri} from "../../../src/core/domain/shared/iri";


describe('forConcept', () => {

   test('undefined id throws error', () => {
       const legalResource = aLegalResource().withId(undefined);
       expect(() => LegalResource.forConcept(legalResource.build())).toThrow(new Error('id should not be absent'));
   });

    test('invalid iri throws error', () => {
        expect(() => LegalResource.forConcept(aLegalResource().withId(new Iri('  ')).build())).toThrow(new Error('iri should not be blank'));
    });

    test('undefined uuid throws error', () => {
        const legalResource = aLegalResource().withUuid(undefined);
        expect(() => LegalResource.forConcept(legalResource.build())).toThrow(new Error('uuid should not be absent'));
    });

    test('blank uuid throws error', () => {
        const legalResource = aLegalResource().withUuid(' ');
        expect(() => LegalResource.forConcept(legalResource.build())).toThrow(new Error('uuid should not be blank'));
    });

    test('undefined url throws error', () => {
        const legalResource = aLegalResource().withUrl(undefined);
        expect(() => LegalResource.forConcept(legalResource.build())).toThrow(new Error('url should not be absent'));
    });

    test('blank url throws error', () => {
        const legalResource = aLegalResource().withUrl('    ');
        expect(() => LegalResource.forConcept(legalResource.build())).toThrow(new Error('url should not be blank'));
    });

    test('undefined order throws error', () => {
        const legalResource = aLegalResource().withOrder(undefined);
        expect(() => LegalResource.forConcept(legalResource.build())).toThrow(new Error('order should not be absent'));
    });

});

describe('forInstance', () => {

    test('undefined id throws error', () => {
        const legalResource = aLegalResource().withId(undefined);
        expect(() => LegalResource.forInstance(legalResource.build())).toThrow(new Error('id should not be absent'));
    });

    test('invalid iri throws error', () => {
        expect(() => LegalResource.forInstance(aLegalResource().withId(new Iri('  ')).build())).toThrow(new Error('iri should not be blank'));
    });

    test('undefined uuid throws error', () => {
        const legalResource = aLegalResource().withUuid(undefined);
        expect(() => LegalResource.forInstance(legalResource.build())).toThrow(new Error('uuid should not be absent'));
    });

    test('blank uuid throws error', () => {
        const legalResource = aLegalResource().withUuid(' ');
        expect(() => LegalResource.forInstance(legalResource.build())).toThrow(new Error('uuid should not be blank'));
    });

    test('undefined url throws error', () => {
        const legalResource = aLegalResource().withUrl(undefined);
        expect(() => LegalResource.forInstance(legalResource.build())).toThrow(new Error('url should not be absent'));
    });

    test('blank url throws error', () => {
        const legalResource = aLegalResource().withUrl('    ');
        expect(() => LegalResource.forInstance(legalResource.build())).toThrow(new Error('url should not be blank'));
    });

    test('undefined order throws error', () => {
        const legalResource = aLegalResource().withOrder(undefined);
        expect(() => LegalResource.forInstance(legalResource.build())).toThrow(new Error('order should not be absent'));
    });

});

describe('forInstanceSnapshot', () => {

    test('valid instanceSnapshot does not throw error', () => {
        const legalResource = aLegalResource().withUuid(undefined);
        expect(() => LegalResource.forInstanceSnapshot(legalResource.build())).not.toThrow();
    });

    test('undefined id throws error', () => {
        const legalResource = aLegalResource().withId(undefined);
        expect(() => LegalResource.forInstanceSnapshot(legalResource.build())).toThrow(new Error('id should not be absent'));
    });

    test('invalid iri throws error', () => {
        expect(() => LegalResource.forInstanceSnapshot(aLegalResource().withId(new Iri('  ')).build())).toThrow(new Error('iri should not be blank'));
    });

    test('undefined url throws error', () => {
        const legalResource = aLegalResource().withUrl(undefined);
        expect(() => LegalResource.forInstanceSnapshot(legalResource.build())).toThrow(new Error('url should not be absent'));
    });

    test('blank url throws error', () => {
        const legalResource = aLegalResource().withUrl('    ');
        expect(() => LegalResource.forInstanceSnapshot(legalResource.build())).toThrow(new Error('url should not be blank'));
    });

    test('undefined order throws error', () => {
        const legalResource = aLegalResource().withOrder(undefined);
        expect(() => LegalResource.forInstanceSnapshot(legalResource.build())).toThrow(new Error('order should not be absent'));
    });

});