import {Iri} from "../../../../src/core/domain/shared/iri";

describe('constructing', () => {

    test('creating success', () => {
        expect(() => new Iri('http://some-value')).not.toThrow();
    });

    test('undefined throws error', () => {
        expect(() => new Iri(undefined)).toThrow(new Error('iri should not be absent'));
    });

    test('Blank id throws error', () => {
        expect(() => new Iri('')).toThrow(new Error('iri should not be blank'));
    });

    test('Does not start with http or https throws error', () => {
        expect(() => new Iri('/some-value')).toThrow(new Error('iri does not start with one of [http://,https://]'));
    });

    test('get value', () => {
        const iri = new Iri('http://some-value');
        expect(iri.value).toEqual('http://some-value');
    });

});
