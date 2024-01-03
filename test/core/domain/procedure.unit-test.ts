import {aFullProcedure} from "./procedure-test-builder";

describe('constructing', () => {
    test('Undefined id throws error', () => {
        expect(() => aFullProcedure().withId(undefined).build()).toThrow(new Error('id should not be undefined'));
    });
    test('Blank id throws error', () => {
        expect(() => aFullProcedure().withId('   ').build()).toThrow(new Error('id should not be blank'));
    });

});