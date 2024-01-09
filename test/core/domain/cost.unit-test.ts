import {aFullCost} from "./cost-test-builder";
import {Cost} from "../../../src/core/domain/cost";
import {Iri} from "../../../src/core/domain/shared/iri";

describe('forConcept', () => {
    test('Undefined id throws error', () => {
        const cost = aFullCost().withId(undefined);
        expect(() => Cost.forConcept(cost.build())).toThrow(new Error('id should not be undefined'));
    });
    test('Invalid iri id throws error', () => {
        expect(() => Cost.forConcept(aFullCost().withId(new Iri('   ')).build())).toThrow(new Error('iri should not be blank'));
    });

    test('Undefined uuid throws error', () => {
        const cost = aFullCost().withUuid(undefined);
        expect(() => Cost.forConcept(cost.build())).toThrow(new Error('uuid should not be undefined'));
    });
    test('Blank uuid throws error', () => {
        const cost = aFullCost().withUuid('   ');
        expect(() => Cost.forConcept(cost.build())).toThrow(new Error('uuid should not be blank'));
    });

    test('Undefined title throws error', () => {
        const cost = aFullCost().withTitle(undefined);
        expect(() => Cost.forConcept(cost.build())).toThrow(new Error('title should not be undefined'));
    });

    test('Undefined description throws error', () => {
        const cost = aFullCost().withDescription(undefined);
        expect(() => Cost.forConcept(cost.build())).toThrow(new Error('description should not be undefined'));
    });

});

describe('forConceptSnapshot', () => {

    test('Undefined id throws error', () => {
        const cost = aFullCost().withId(undefined);
        expect(() => Cost.forConceptSnapshot(cost.build())).toThrow(new Error('id should not be undefined'));
    });
    test('Uuid is undefined ', () => {
        const cost = aFullCost().build();
        expect(Cost.forConceptSnapshot(cost).uuid).toBeUndefined();
    });
    test('Undefined title throws error', () => {
        const cost = aFullCost().withTitle(undefined).build();
        expect(() => Cost.forConceptSnapshot(cost)).toThrow(new Error('title should not be undefined'));
    });
    test('Undefined description throws error', () => {
        const cost = aFullCost().withDescription(undefined).build();
        expect(() => Cost.forConceptSnapshot(cost)).toThrow(new Error('description should not be undefined'));
    });

});