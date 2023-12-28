
//only a simple wrapper to ensure that we can save exactly in the database what we queried.
export class PreciseDate {

    private readonly _value: string;

    private constructor(valueFormattedInIso8601WithNanos: string) {
        //TODO LPDC-916: add invariants
        this._value = valueFormattedInIso8601WithNanos;
    }

    public static of(valueFormattedInIso8601WithNanos: string | undefined): PreciseDate | undefined {
        return valueFormattedInIso8601WithNanos ? new PreciseDate(valueFormattedInIso8601WithNanos) : undefined;
    }

    public toISOString(): string {
        return this._value;
    }
}