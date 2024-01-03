import {aSession} from "./session-test-builder";

describe('constructing', () => {
    test('Undefined id throws error', () => {
        expect(() => aSession().withId(undefined).build()).toThrow(new Error('id should not be undefined'));
    });
    test('Blank id throws error', () => {
        expect(() => aSession().withId('   ').build()).toThrow(new Error('id should not be blank'));
    });

});