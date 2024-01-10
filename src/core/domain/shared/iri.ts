import {Invariant} from "./invariant";

export class Iri {

    constructor(private _value: string) {
        const invariant = Invariant.require(_value, 'iri');
        invariant.to(invariant.notBeUndefined(), invariant.notBeBlank(), invariant.startsWith('http://', 'https://'));
    }

    get value(): string {
        return this._value;
    }

    toString(): string {
        return this.value;
    }

    equals(other: Iri): boolean {
        return this._value === other.value;
    }

    static compare(a: Iri, b: Iri): number {
        return a.value.localeCompare(b.value);
    }
}
