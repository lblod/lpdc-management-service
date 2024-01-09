import {aFullWebsite} from "./website-test-builder";
import {Iri} from "../../../src/core/domain/shared/iri";

describe('constructing', () => {

    test('Undefined id throws error', () => {
        expect(() => aFullWebsite().withId(undefined).build()).toThrow(new Error('id should not be undefined'));
    });
    test('Invalid iri id throws error', () => {
        expect(() => aFullWebsite().withId(new Iri('   ')).build()).toThrow(new Error('iri should not be blank'));
    });
    test('Undefined title throws error', () => {
        expect(() => aFullWebsite().withTitle(undefined).build()).toThrow(new Error('title should not be undefined'));
    });
    test('Undefined url throws error', () => {
        expect(() => aFullWebsite().withUrl(undefined).build()).toThrow(new Error('url should not be undefined'));
    });
    test('Blank url throws error', () => {
        expect(() => aFullWebsite().withUrl('   ').build()).toThrow(new Error('url should not be blank'));
    });

});