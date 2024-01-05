import {aFullCost} from "./cost-test-builder";

describe('constructing', () => {
    test('Undefined id throws error', () => {
        expect(() => aFullCost().withId(undefined).build()).toThrow(new Error('id should not be undefined'));
    });
    test('Blank id throws error', () => {
        expect(() => aFullCost().withId('   ').build()).toThrow(new Error('id should not be blank'));
    });
    
    test('Undefined title throws error', () => {
        expect(() => aFullCost().withTitle(undefined).build()).toThrow(new Error('title should not be undefined'));
    });
    test('Undefined description throws error', () => {
        expect(() => aFullCost().withDescription(undefined).build()).toThrow(new Error('description should not be undefined'));
    });
});