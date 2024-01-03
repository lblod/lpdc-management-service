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

    notBeUndefined(): InvariantType<boolean> {
        return () => this._value !== undefined ? null : `${this._name} should not be undefined`;
    }

    notBeBlank(): InvariantType<V> {
        return () => {
            if (typeof this._value === 'string' && this._value.trim() !== '') {
                return null;
            } else {
                return `${this._name} should not be blank`;
            }
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
}
