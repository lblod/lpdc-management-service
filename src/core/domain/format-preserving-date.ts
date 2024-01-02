
//only a simple wrapper to ensure that we can save exactly in the database what we queried.
export class FormatPreservingDate {

    private readonly _value: string;

    private constructor(valueFormattedInIso8601WithNanosMillisOrSeconds: string) {
        //TODO LPDC-916: add invariants
        this._value = valueFormattedInIso8601WithNanosMillisOrSeconds;
    }

    public static of(valueFormattedInIso8601WithNanosMillisOrSeconds: string | undefined): FormatPreservingDate | undefined {
        return valueFormattedInIso8601WithNanosMillisOrSeconds ? new FormatPreservingDate(valueFormattedInIso8601WithNanosMillisOrSeconds) : undefined;
    }

    get value(): string {
        return this._value;
    }

    static isFunctionallyChanged(value: FormatPreservingDate | undefined, other: FormatPreservingDate | undefined): boolean {
        return value?.fullyPadded !== other?.fullyPadded;
    }

    private get fullyPadded(): string {
        if (this.value.length === 20) {
            return this.value.replace('Z', '.000000Z');
        }
        return this.value.slice(0, -1).padEnd(26, '0') + 'Z';
    }

}