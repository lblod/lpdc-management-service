//only a simple wrapper to ensure that we can save exactly in the database what we queried.
import {Invariant} from "./shared/invariant";

export class FormatPreservingDate {

    private static readonly iso8601Regex = /^(\d{4}-\d{2}-\d{2})(T(\d{2}:\d{2}:\d{2})(\.\d{1,9})?(Z|[+-]\d{2}:\d{2})?)?$/;


    private readonly _value: string;


    private constructor(valueFormattedInIso8601WithNanosMillisOrSeconds: string) {
        this._value = valueFormattedInIso8601WithNanosMillisOrSeconds;
        const invariant = Invariant.require(this._value, 'value');
        invariant.to(invariant.notBeAbsent(), invariant.notBeBlank(), invariant.toMatchPattern(FormatPreservingDate.iso8601Regex));
    }

    public static of(valueFormattedInIso8601WithNanosMillisOrSeconds: string | undefined): FormatPreservingDate | undefined {
        return valueFormattedInIso8601WithNanosMillisOrSeconds ? new FormatPreservingDate(valueFormattedInIso8601WithNanosMillisOrSeconds) : undefined;
    }

    public static now(): FormatPreservingDate {
        return new FormatPreservingDate(new Date().toISOString());
    }

    get value(): string {
        return this._value;
    }

    before(other: FormatPreservingDate): boolean {
        return this.fullyPadded < other.fullyPadded;
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