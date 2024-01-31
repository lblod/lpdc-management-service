import {isEqual, uniqWith} from "lodash";

type ValidationResult = string | null;
type InvariantType<V> = (value: V) => ValidationResult;

export class Invariant<V> {
    private readonly _value: V;
    private readonly _name: string;

    private constructor(value: V, name: string) {
        this._value = value;
        this._name = name;
    }

    static require(value: any, name?: string) {
        return new Invariant(value, name ?? 'name');
    }

    notBeUndefined(): InvariantType<V> {
        return () => !this.isUndefined(this._value) ? null : `${this._name} should not be undefined`;
    }

    notBeBlank(): InvariantType<V> {
        return () => !this.isBlank(this._value) ? null : `${this._name} should not be blank`;
    }

    haveAtLeastOneValuePresent(): InvariantType<V> {
        return () => {
            if ((this._value as any[]).find(value => (!this.isUndefined(value) && !this.isBlank(value))) !== undefined) {
                return null;
            }
            return `${this._name} does not contain one value`;
        };
    }

    haveAtLeastXAmountOfValues(amountOfPresentValues: number): InvariantType<V> {
        return () => {
            if ((this._value as any[]).filter(value => (!this.isUndefined(value) && !this.isBlank(value))).length >= amountOfPresentValues) {
                return null;
            }
            return `${this._name} does not contain at least ${amountOfPresentValues} values`;
        };
    }

    startsWith(...startValues: any[]): InvariantType<V> {
        return () => startValues.some(startValue => typeof this._value === 'string' && this._value.startsWith(startValue))
            ? null
            : `${this._name} does not start with one of [${startValues}]`;
    }

    noDuplicates(): InvariantType<V> {
        return () => uniqWith(this._value as any[], (a, b) => isEqual(a, b)).length === (this._value as any[]).length
            ? null
            : `${this._name} should not contain duplicates`;
    }

    allDefinedOrAllUndefined(): InvariantType<V> {
        return () => (this._value as any[]).every(a => a === undefined) || (this._value as any[]).every(a => a !== undefined)
            ? null
            : `${this._name} should all be defined or all be undefined`;
    }

    canBeOnlyBeDefinedIfOtherValuePresent(presentValue: any, presentName: string){
        return () => (presentValue !=undefined) || (presentValue === undefined && this._value ===undefined)
        ? null
        : `${this._name} can only be defined when ${presentName} is defined`;
    }

    toMatchPattern(pattern: RegExp): InvariantType<V> {
        return () => this.matchesPattern(this._value, pattern) ? null : `${this._name} does not match pattern`;
    }

    public to(...invariants: InvariantType<V>[]): V {
        const violations = invariants.map(invariant => invariant(this._value));
        const firstViolation = violations.find(violation => violation !== null);

        if (firstViolation !== undefined) {
            throw new Error(firstViolation);
        }

        return this._value;
    }

    private isUndefined(value: any): boolean {
        return value === undefined;
    }

    private isBlank(value: any): boolean {
        return (typeof value === 'string' && value.trim() === '');
    }

    private matchesPattern(value: any, pattern: RegExp): boolean {
        return (typeof value === 'string' && pattern.test(value));
    }

}

export const requiredValue = <T>(value: T, name: string = 'object'): T => {
    const invariant: Invariant<T> = Invariant.require(value, name);
    return invariant.to(invariant.notBeUndefined(), invariant.notBeBlank());
};

export const requireNoDuplicates = <T>(values: T[], name: string = 'list'): T[] => {
    const invariant: Invariant<T[]> = Invariant.require(values, name);
    return invariant.to(invariant.noDuplicates());
};

export const requireAllDefinedOrAllUndefined = <T>(values: T[], name: string = 'list'): T[] => {
    const invariant: Invariant<T[]> = Invariant.require(values, name);
    return invariant.to(invariant.allDefinedOrAllUndefined());
};

export const requiredCanBeOnlyBeDefinedIfOtherValuePresent = <T>(value: T, name: string = 'object', presentValue: any, presentName:string): T => {
    const invariant: Invariant<T> = Invariant.require(value, name);
    return invariant.to(invariant.canBeOnlyBeDefinedIfOtherValuePresent(presentValue,presentName));
};
