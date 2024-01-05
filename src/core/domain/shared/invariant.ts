import {Iri} from "./iri";

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


    public to(...invariants: InvariantType<V>[]): ValidationResult {
        const violations = invariants.map(invariant => invariant(this._value));
        const firstViolation = violations.find(violation => violation !== null);

        if (firstViolation !== undefined) {
            throw new Error(firstViolation);
        }

        return null;
    }

    private isUndefined(value: any): boolean {
        return value === undefined;
    }

    private isBlank(value: any): boolean {
        return (typeof value === 'string' && value.trim() === '');
    }

}

export const requiredValue = (value: any, name: string = 'object'): any => {
    const invariant = Invariant.require(value, name);
    invariant.to(invariant.notBeUndefined(), invariant.notBeBlank());

    return value;
};
