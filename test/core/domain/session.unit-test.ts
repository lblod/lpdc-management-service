import {aSession} from "./session-test-builder";
import {Iri} from "../../../src/core/domain/shared/iri";

describe('constructing', () => {
    test('Undefined id throws error', () => {
        expect(() => aSession().withId(undefined).build()).toThrow(new Error('id should not be undefined'));
    });
    test('Invalid iri id throws error', () => {
        expect(() => aSession().withId(new Iri('   ')).build()).toThrow(new Error('iri should not be blank'));
    });

    test('Undefined bestuurseenheidId throws error', () => {
        expect(() => aSession().withBestuurseenheidId(undefined).build()).toThrow(new Error('bestuurseenheidId should not be undefined'));
    });
    test('Invalid iri bestuurseenheidId throws error', () => {
        expect(() => aSession().withBestuurseenheidId(new Iri('   ')).build()).toThrow(new Error('iri should not be blank'));
    });

});