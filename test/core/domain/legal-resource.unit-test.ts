import {aLegalResourceForConcept} from "./legal-resource-test-builder";
import {LegalResource} from "../../../src/core/domain/legal-resource";
import {Iri} from "../../../src/core/domain/shared/iri";


describe('forConcept', () => {

   test('undefined id throws error', () => {
       const legalResource = aLegalResourceForConcept().withId(undefined);
       expect(() => LegalResource.forConcept(legalResource.build())).toThrow(new Error('id should not be absent'));
   });

    test('invalid iri throws error', () => {
        expect(() => LegalResource.forConcept(aLegalResourceForConcept().withId(new Iri('  ')).build())).toThrow(new Error('iri should not be blank'));
    });

    test('undefined uuid throws error', () => {
        const legalResource = aLegalResourceForConcept().withUuid(undefined);
        expect(() => LegalResource.forConcept(legalResource.build())).toThrow(new Error('uuid should not be absent'));
    });

    test('blank uuid throws error', () => {
        const legalResource = aLegalResourceForConcept().withUuid(' ');
        expect(() => LegalResource.forConcept(legalResource.build())).toThrow(new Error('uuid should not be blank'));
    });

    test('undefined url throws error', () => {
        const legalResource = aLegalResourceForConcept().withUrl(undefined);
        expect(() => LegalResource.forConcept(legalResource.build())).toThrow(new Error('url should not be absent'));
    });

    test('blank url throws error', () => {
        const legalResource = aLegalResourceForConcept().withUrl('    ');
        expect(() => LegalResource.forConcept(legalResource.build())).toThrow(new Error('url should not be blank'));
    });

    test('undefined order throws error', () => {
        const legalResource = aLegalResourceForConcept().withOrder(undefined);
        expect(() => LegalResource.forConcept(legalResource.build())).toThrow(new Error('order should not be absent'));
    });


});