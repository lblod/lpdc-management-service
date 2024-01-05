import {aFullProcedure} from "./procedure-test-builder";

describe('constructing', () => {
    test('Undefined id throws error', () => {
        expect(() => aFullProcedure().withId(undefined).build()).toThrow(new Error('id should not be undefined'));
    });
    test('Blank id throws error', () => {
        expect(() => aFullProcedure().withId('   ').build()).toThrow(new Error('id should not be blank'));
    });
    test('Undefined title throws error', () => {
        expect(() => aFullProcedure().withTitle(undefined).build()).toThrow(new Error('title should not be undefined'));
    });
    test('Undefined description throws error', () => {
        expect(() => aFullProcedure().withDescription(undefined).build()).toThrow(new Error('description should not be undefined'));
    });
});