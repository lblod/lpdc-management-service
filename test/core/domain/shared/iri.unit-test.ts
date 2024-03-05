import {Iri} from "../../../../src/core/domain/shared/iri";
import {InvariantError} from "../../../../src/core/domain/shared/lpdc-error";

describe('constructing', () => {

    test('creating success', () => {
        expect(() => new Iri('http://some-value')).not.toThrow();
    });

    test('undefined throws error', () => {
        expect(() => new Iri(undefined)).toThrowWithMessage(InvariantError, 'iri should not be absent');
    });

    test('Blank id throws error', () => {
        expect(() => new Iri('')).toThrowWithMessage(InvariantError, 'iri should not be blank');
    });

    test('Does not start with http or https throws error', () => {
        expect(() => new Iri('/some-value')).toThrowWithMessage(InvariantError, 'iri does not start with one of [http://,https://]');
    });

    test('get value', () => {
        const iri = new Iri('http://some-value');
        expect(iri.value).toEqual('http://some-value');
    });

});
