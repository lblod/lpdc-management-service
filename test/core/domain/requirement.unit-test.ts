import {aFullRequirement} from "./requirement-test-builder";

describe('constructing', () => {
    test('Undefined id throws error', () => {
        expect(() => aFullRequirement().withId(undefined).build()).toThrow(new Error('id should not be undefined'));
    });
    test('Blank id throws error', () => {
        expect(() => aFullRequirement().withId('   ').build()).toThrow(new Error('id should not be blank'));
    });

});