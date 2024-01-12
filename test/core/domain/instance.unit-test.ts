import {aFullInstance} from "./instance-test-builder";
import {Iri} from "../../../src/core/domain/shared/iri";

describe('constructing', () => {
    test('Undefined id throws error', () => {
        expect(() => aFullInstance().withId(undefined).build()).toThrow(new Error('id should not be undefined'));
    });

    test('Invalid iri id throws error', () => {
        expect(() => aFullInstance().withId(new Iri('  ')).build()).toThrow(new Error('iri should not be blank'));
    });
    test('Undefined bestuurseenheidId throws error', () => {
        expect(() => aFullInstance().withBestuurseenheidId(undefined).build()).toThrow(new Error('bestuurseenheidId should not be undefined'));
    });

    test('Invalid iri bestuurseenheidId throws error', () => {
        expect(() => aFullInstance().withBestuurseenheidId(new Iri('  ')).build()).toThrow(new Error('iri should not be blank'));
    });

    test('Undefined uuid throws error', () => {
        expect(() => aFullInstance().withUuid(undefined).build()).toThrow(new Error('uuid should not be undefined'));
    });

    test('Blank uuid throws error', () => {
        expect(() => aFullInstance().withUuid('   ').build()).toThrow(new Error('uuid should not be blank'));
    });

});