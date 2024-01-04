import {Invariant} from "../../../../src/core/domain/shared/invariant";

describe('notBeUndefined', () => {

    test('Returns null when value is not undefined  ', () => {

        const invariant: Invariant<any> = Invariant.require('not undefined');

        expect(invariant.to(invariant.notBeUndefined())).toBeNull();
    });

    test('Returns error when value is undefined  ', () => {
        const name = 'undefined value';
        const invariant: Invariant<any> = Invariant.require(undefined, name);

        expect(() => invariant.to(invariant.notBeUndefined())).toThrow(new Error(`${name} should not be undefined`));
    });

});

describe('notBeBlank', () => {

    test('Returns null when value is not blank  ', () => {

        const invariant: Invariant<any> = Invariant.require('not blank');

        expect(invariant.to(invariant.notBeBlank())).toBeNull();
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
    test('Returns null when one value is present', () => {
        const invariant: Invariant<any[]> = Invariant.require(['', undefined, 'correct value'], name);
        expect(invariant.to(invariant.haveAtLeastOneValuePresent())).toBeNull();
    });
    test('Returns null when one value is present and other is blank', () => {
        const invariant: Invariant<any[]> = Invariant.require(['', 'correct value'], name);
        expect(invariant.to(invariant.haveAtLeastOneValuePresent())).toBeNull();
    });
    test('Returns null when one value is present and other is undefined', () => {
        const invariant: Invariant<any[]> = Invariant.require([undefined, 'correct value'], name);
        expect(invariant.to(invariant.haveAtLeastOneValuePresent())).toBeNull();
    });
    test('Returns null when multiple values are present', () => {
        const invariant: Invariant<any> = Invariant.require(['correct value 1', '', 'correct value 2'], name);
        expect(invariant.to(invariant.haveAtLeastOneValuePresent())).toBeNull();
    });
});


describe('to', () => {
    test('returns first violation', () => {
        const name = 'name';
        const invariant: Invariant<any> = Invariant.require('', name);

        expect(() => invariant.to(invariant.notBeBlank(), invariant.notBeUndefined())).toThrow(new Error(`${name} should not be blank`));
        expect(() => invariant.to(invariant.notBeUndefined(), invariant.notBeBlank())).toThrow(new Error(`${name} should not be blank`));
    });

    test('returns null when there are no violations', () => {
        const name = 'name';
        const invariant: Invariant<any> = Invariant.require('value', name);

        expect(invariant.to(invariant.notBeBlank(), invariant.notBeUndefined())).toBeNull();
    });
});