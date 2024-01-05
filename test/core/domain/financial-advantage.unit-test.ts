import {aFullFinancialAdvantage} from "./financial-advantage-test-builder";

describe('constructing', () => {
    test('Undefined id throws error', () => {
        expect(() => aFullFinancialAdvantage().withId(undefined).build()).toThrow(new Error('id should not be undefined'));
    });
    test('Blank id throws error', () => {
        expect(() => aFullFinancialAdvantage().withId('   ').build()).toThrow(new Error('id should not be blank'));
    });
    test('Undefined title throws error', () => {
        expect(() => aFullFinancialAdvantage().withTitle(undefined).build()).toThrow(new Error('title should not be undefined'));
    });
    test('Undefined id throws error', () => {
        expect(() => aFullFinancialAdvantage().withDescription(undefined).build()).toThrow(new Error('description should not be undefined'));
    });
});