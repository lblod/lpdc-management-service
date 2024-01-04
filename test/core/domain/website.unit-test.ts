import {aFullWebsite} from "./website-test-builder";

describe('constructing', () => {

    test('Undefined id throws error', () => {
        expect(() => aFullWebsite().withId(undefined).build()).toThrow(new Error('id should not be undefined'));
    });
    test('Blank id throws error', () => {
        expect(() => aFullWebsite().withId('   ').build()).toThrow(new Error('id should not be blank'));
    });

    test('Undefined url throws error', () => {
        expect(() => aFullWebsite().withUrl(undefined).build()).toThrow(new Error('url should not be undefined'));
    });
    test('Blank url throws error', () => {
        expect(() => aFullWebsite().withUrl('   ').build()).toThrow(new Error('url should not be blank'));
    });

});