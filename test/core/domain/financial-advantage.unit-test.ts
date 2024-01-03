import {aFullFinancialAdvantage} from "./financial-advantage-test-builder";

describe('constructing', () => {
    test('Undefined id throws error', () => {
        expect(() => aFullFinancialAdvantage().withId(undefined).build()).toThrow(new Error('id should not be undefined'));
    });
    test('Blank id throws error', () => {
        expect(() => aFullFinancialAdvantage().withId('   ').build()).toThrow(new Error('id should not be blank'));
    });

});