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

}

export const requiredValue = (value: any, name: string = 'object'): any => {
    const invariant = Invariant.require(value, name);
    return invariant.to(invariant.notBeUndefined(), invariant.notBeBlank());
};
