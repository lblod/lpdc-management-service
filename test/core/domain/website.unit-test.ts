import {aFullWebsite} from "./website-test-builder";

describe('constructing', () => {
    test('Undefined id throws error', () => {
        expect(() => aFullWebsite().withId(undefined).build()).toThrow(new Error('id should not be undefined'));
    });
    test('Blank id throws error', () => {
        expect(() => aFullWebsite().withId('   ').build()).toThrow(new Error('id should not be blank'));
    });

});