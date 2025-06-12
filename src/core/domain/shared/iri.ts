import { Invariant } from "./invariant";

const ovoPattern =
  /^https:\/\/data\.vlaanderen\.be\/id\/organisatie\/OVO[0-9]{6}$/;

// NOTE (20/03/2025): require at least 12 characters in the UUID for an
// administrative unit. This is a bit arbitrary but allows to exclude URIs
// that contain too short UUIDs such as a OVO-code instead of an actual
// UUID. At the time of writing the shortest UUID in OP, which is master of
// this data, in 24 characters.
const unitPattern =
  /^http:\/\/data\.lblod\.info\/id\/bestuurseenheden\/[0-9a-zA-Z-]{12,}$/;

export class Iri {
  constructor(private _value: string) {
    const invariant = Invariant.require(_value, "iri");
    invariant.to(
      invariant.notBeAbsent(),
      invariant.notBeBlank(),
      invariant.startsWith("http://", "https://", "_:"),
    );
  }

  get value(): string {
    return this._value;
  }

  get isOvoCodeIri(): boolean {
    return this.value.startsWith(
      "https://data.vlaanderen.be/id/organisatie/OVO",
    );
  }

  get isAdministrativeUnitIri(): boolean {
    return this._value.startsWith(
      "http://data.lblod.info/id/bestuurseenheden/",
    );
  }

  get isValidAuthorityIri(): boolean {
    return ovoPattern.test(this._value) || unitPattern.test(this._value);
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
