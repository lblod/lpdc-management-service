import {Invariant} from "../../../../src/core/domain/shared/invariant";

describe('notBeAbsent', () => {

    test('Returns the value when value is not undefined  ', () => {

        const invariant: Invariant<any> = Invariant.require('not undefined');

        expect(invariant.to(invariant.notBeAbsent())).toEqual('not undefined');
    });

    test('Returns error when value is undefined  ', () => {
        const name = 'undefined value';
        const invariant: Invariant<any> = Invariant.require(undefined, name);

        expect(() => invariant.to(invariant.notBeAbsent())).toThrow(new Error(`${name} should not be absent`));
    });

});

describe('notBeBlank', () => {

    test('Returns the value when value is not blank  ', () => {

        const invariant: Invariant<any> = Invariant.require('not blank');

        expect(invariant.to(invariant.notBeBlank())).toEqual('not blank');
    });

    test('Returns error when value is blank  ', () => {
        const name = 'blank value';
        const invariant: Invariant<any> = Invariant.require('', name);

        expect(() => invariant.to(invariant.notBeBlank())).toThrow(new Error(`${name} should not be blank`));
    });

    test('Returns error when value is blank  ', () => {
        const name = 'undefined value';
        const invariant: Invariant<any> = Invariant.require("", name);

        expect(() => invariant.to(invariant.notBeBlank())).toThrow(new Error(`${name} should not be blank`));
    });
    test('Returns error when trimmed value is blank  ', () => {
        const name = 'undefined value';
        const invariant: Invariant<any> = Invariant.require("  ", name);

        expect(() => invariant.to(invariant.notBeBlank())).toThrow(new Error(`${name} should not be blank`));
    });

    test('Throws error when trimmed value contains newline or tab and is considered blank', () => {
        const name = 'undefined value';
        const invariant: Invariant<any> = Invariant.require("  \n  \t  ", name);

        expect(() => invariant.to(invariant.notBeBlank())).toThrow(new Error(`${name} should not be blank`));
    });

});

describe('haveAtLeastOneValuePresent', () => {

    const name = 'list';
    test('Throws error when no value is present', () => {

        const invariant: Invariant<any> = Invariant.require([undefined, '', "  \n  \t  "], name);
        expect(() => invariant.to(invariant.haveAtLeastOneValuePresent())).toThrow(new Error(`${name} does not contain one value`));
    });

    test('Returns all values when one value is present', () => {
        const invariant: Invariant<any[]> = Invariant.require(['', undefined, 'correct value'], name);
        expect(invariant.to(invariant.haveAtLeastOneValuePresent())).toEqual(['', undefined, 'correct value']);
    });

    test('Returns all values when one value is present and other is blank', () => {
        const invariant: Invariant<any[]> = Invariant.require(['', 'correct value'], name);
        expect(invariant.to(invariant.haveAtLeastOneValuePresent())).toEqual(['', 'correct value']);
    });

    test('Returns all values when one value is present and other is undefined', () => {
        const invariant: Invariant<any[]> = Invariant.require([undefined, 'correct value'], name);
        expect(invariant.to(invariant.haveAtLeastOneValuePresent())).toEqual([undefined, 'correct value']);
    });

    test('Returns the multiple values when multiple values are present', () => {
        const invariant: Invariant<any> = Invariant.require(['correct value 1', '', 'correct value 2'], name);
        expect(invariant.to(invariant.haveAtLeastOneValuePresent())).toEqual(['correct value 1', '', 'correct value 2']);
    });
});

describe('haveAtLeastXAmountOfValuesPresent', () => {
    const name = 'list';
    const expectedValues = 2;
    test('Throws error when no fewer values are present', () => {
        const invariant: Invariant<any> = Invariant.require([undefined, '', 'value 1', "  \n  \t  "], name);
        expect(() => invariant.to(invariant.haveAtLeastXAmountOfValues(expectedValues))).toThrow(new Error(`${name} does not contain at least ${expectedValues} values`));
    });

    test('Returns all values when amount of expected values and present values are the same', () => {
        const values = ['', undefined, 'value 1', undefined, 'value 2'];
        const invariant: Invariant<any[]> = Invariant.require(values, name);
        expect(invariant.to(invariant.haveAtLeastXAmountOfValues(expectedValues))).toEqual(values);
    });

    test('Returns all values when amount of present values is larger then expected values', () => {
        const values = ['', undefined, 'value 1', undefined, 'value 2', 'value 3', 'value 4'];
        const invariant: Invariant<any[]> = Invariant.require(values, name);
        expect(invariant.to(invariant.haveAtLeastXAmountOfValues(expectedValues))).toEqual(values);
    });
});

describe('startsWith', () => {

    const name = 'Starts with';

    test('Returns value when value starts with startValue', () => {
        const invariant: Invariant<any> = Invariant.require('abc', name);
        expect(invariant.to(invariant.startsWith('a'))).toEqual('abc');
    });

    test('Returns value when value starts with one of startValues', () => {
        const invariant: Invariant<any> = Invariant.require('abc', name);
        expect(invariant.to(invariant.startsWith('bc', 'ab'))).toEqual('abc');
    });

    test('throws error when value is not of type string', () => {
        const invariant: Invariant<any> = Invariant.require([], name);
        expect(() => invariant.to(invariant.startsWith('a'))).toThrow(new Error(`${name} does not start with one of [a]`));
    });

    test('throws error when value does not start with', () => {
        const invariant: Invariant<any> = Invariant.require('abc', name);
        expect(() => invariant.to(invariant.startsWith('b', 'c'))).toThrow(new Error(`${name} does not start with one of [b,c]`));
    });
});

describe('toMatchPattern', () => {

    const name = 'matches pattern';

    test('Returns value when value matches pattern', () => {
        const invariant: Invariant<any> = Invariant.require('1234', name);
        expect(invariant.to(invariant.toMatchPattern(/\d{4}/))).toEqual('1234');
    });

    test('throws error when value is not of type string', () => {
        const invariant: Invariant<any> = Invariant.require([], name);
        expect(() => invariant.to(invariant.toMatchPattern(/\d{4}/))).toThrow(new Error(`${name} does not match pattern`));
    });

    test('throws error when value does not match pattern', () => {
        const invariant: Invariant<any> = Invariant.require('abc', name);
        expect(() => invariant.to(invariant.toMatchPattern(/\d{4}/))).toThrow(new Error(`${name} does not match pattern`));
    });

});

describe('noDuplicates', () => {
    const name = 'list';

    test('Returns value when string list contains no duplicates', () => {
        const invariant: Invariant<any> = Invariant.require(['a', 'b'], name);
        expect(invariant.to(invariant.noDuplicates())).toEqual(['a', 'b']);
    });

    test('Returns value when object list contains no duplicates', () => {
        const invariant: Invariant<any> = Invariant.require([{a: 0}, {a: 1}], name);
        expect(invariant.to(invariant.noDuplicates())).toEqual([{a: 0}, {a: 1}]);
    });

    test('Returns value when object list contains different objects', () => {
        const invariant: Invariant<any> = Invariant.require([{a: 0}, {b: 0}], name);
        expect(invariant.to(invariant.noDuplicates())).toEqual([{a: 0}, {b: 0}]);
    });

    test('throws error when string list contains duplicates', () => {
        const invariant: Invariant<any> = Invariant.require(['a', 'a'], name);
        expect(() => invariant.to(invariant.noDuplicates())).toThrow(new Error(`${name} should not contain duplicates`));
    });

    test('throws error when object list contains duplicates', () => {
        const invariant: Invariant<any> = Invariant.require([{a: 0}, {a: 0}], name);
        expect(() => invariant.to(invariant.noDuplicates())).toThrow(new Error(`${name} should not contain duplicates`));
    });
});

describe('allPresentOrAllAbsent', () => {
    const name = 'fields';

    test('Returns value when all elements are defined', () => {
        const invariant: Invariant<any> = Invariant.require(['a', 'b', {a: 0}, {a: undefined}], name);
        expect(invariant.to(invariant.allPresentOrAllAbsent())).toEqual(['a', 'b', {a: 0}, {a: undefined}]);
    });

    test('Returns value when all elements are undefined', () => {
        const invariant: Invariant<any> = Invariant.require([undefined, undefined], name);
        expect(invariant.to(invariant.allPresentOrAllAbsent())).toEqual([undefined, undefined]);
    });

    test('throws error when some elements are defined and others undefined', () => {
        const invariant: Invariant<any> = Invariant.require(['a', {a: 0}, {a: 1}, undefined], name);
        expect(() => invariant.to(invariant.allPresentOrAllAbsent())).toThrow(new Error(`${name} should all be present or all be absent`));
    });
});


describe('canOnlyBePresentIfOtherValuePresent',()=>{
    const name ='field';
    const presentName = 'presentField';

    test('Returns value when presentValue and new value are undefined',()=>{
        const invariant: Invariant<any> = Invariant.require(undefined, name);
        expect(invariant.to(invariant.canOnlyBePresentIfOtherValuePresent(undefined,presentName))).toEqual(undefined);
    });

    test('Returns value when presentValue and new value are both present',()=>{
        const newValue = 'newValue';
        const presentValue ='presentValue';
        const invariant: Invariant<any> = Invariant.require(newValue, name);
        expect(invariant.to(invariant.canOnlyBePresentIfOtherValuePresent(presentValue,presentName))).toEqual(newValue);
    });

    test('Returns value when presentValue and new value are both present even though different types',()=>{
        const newValue = 'newValue';
        const presentValue =123456;
        const invariant: Invariant<any> = Invariant.require(newValue, name);
        expect(invariant.to(invariant.canOnlyBePresentIfOtherValuePresent(presentValue,presentName))).toEqual(newValue);
    });

    test('throws error when new value is defined and presentValue undefined', () => {
        const newValue = 'newValue';
        const invariant: Invariant<any> = Invariant.require(newValue, name);
        expect(() => invariant.to(invariant.canOnlyBePresentIfOtherValuePresent(undefined,presentName))).toThrow(new Error(`${name} can only be present when ${presentName} is present`));
    });
});

describe('to', () => {

    test('returns first violation', () => {
        const name = 'name';
        const invariant: Invariant<any> = Invariant.require('', name);

        expect(() => invariant.to(invariant.notBeBlank(), invariant.notBeAbsent())).toThrow(new Error(`${name} should not be blank`));
        expect(() => invariant.to(invariant.notBeAbsent(), invariant.notBeBlank())).toThrow(new Error(`${name} should not be blank`));
    });

    test('returns the value when there are no violations', () => {
        const name = 'name';
        const invariant: Invariant<any> = Invariant.require('value', name);

        expect(invariant.to(invariant.notBeBlank(), invariant.notBeAbsent())).toEqual('value');
    });
});