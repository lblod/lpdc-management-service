import {aFullRequirement} from "./requirement-test-builder";

describe('constructing', () => {
    test('Undefined id throws error', () => {
        expect(() => aFullRequirement().withId(undefined).build()).toThrow(new Error('id should not be undefined'));
    });
    test('Blank id throws error', () => {
        expect(() => aFullRequirement().withId('   ').build()).toThrow(new Error('id should not be blank'));
    });
    test('Undefined title throws error', () => {
        expect(() => aFullRequirement().withTitle(undefined).build()).toThrow(new Error('title should not be undefined'));
    });
    test('Undefined description throws error', () => {
        expect(() => aFullRequirement().withDescription(undefined).build()).toThrow(new Error('description should not be undefined'));
    });
});