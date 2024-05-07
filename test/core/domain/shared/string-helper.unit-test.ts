import {lastPartAfter} from "../../../../src/core/domain/shared/string-helper";

describe('string helper tests', () => {

    test('lastPartAfter', () => {

        expect(lastPartAfter(undefined, '/')).toBeUndefined();
        expect(lastPartAfter('abc', '/')).toBeUndefined();
        expect(lastPartAfter('abc/def', '/')).toEqual('def');
        expect(lastPartAfter('abc/def/xyz', '/')).toEqual('xyz');
        expect(lastPartAfter('abc/def/', '/')).toEqual('');

    });

});