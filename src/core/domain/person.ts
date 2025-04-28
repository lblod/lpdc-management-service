import { Iri } from "./shared/iri";
import { requiredValue } from "./shared/invariant";

export class Person {
  private readonly _id: Iri;
  private readonly _firstName?: string;
  private readonly _familyName?: string;

  constructor(
    id: Iri,
    firstName?: string,
    familyName?: string,
  ) {
    this._id = requiredValue(id, "id");
    this._firstName = firstName;
    this._familyName = familyName;
  }

  get id(): Iri {
    return this._id;
  }

  get firstName(): string | undefined {
    return this._firstName;
  }

  get familyName(): string | undefined {
    return this._familyName;
  }

  static reconstitute(
    id: Iri,
    firstName: string,
    familyName: string,
  ): Person {
    return new Person(id, firstName, familyName);
  }
}
