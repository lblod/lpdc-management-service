import {aFullEvidence} from "./evidence-test-builder";
import {Iri} from "../../../src/core/domain/shared/iri";

describe('constructing', () => {
    test('Undefined id throws error', () => {
        expect(() => aFullEvidence().withId(undefined).build()).toThrow(new Error('id should not be undefined'));
    });
    test('Invalid iri id throws error', () => {
        expect(() => aFullEvidence().withId(new Iri('   ')).build()).toThrow(new Error('iri should not be blank'));
    });

    test('Undefined title throws error', () => {
        expect(() => aFullEvidence().withTitle(undefined).build()).toThrow(new Error('title should not be undefined'));
    });
    test('Undefined description throws error', () => {
        expect(() => aFullEvidence().withDescription(undefined).build()).toThrow(new Error('description should not be undefined'));
    });
});