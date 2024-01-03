import {aFullCost} from "./cost-test-builder";

describe('constructing', () => {
    test('Undefined id throws error', () => {
        expect(() => aFullCost().withId(undefined).build()).toThrow(new Error('id should not be undefined'));
    });
    test('Blank id throws error', () => {
        expect(() => aFullCost().withId('   ').build()).toThrow(new Error('id should not be blank'));
    });
    
});