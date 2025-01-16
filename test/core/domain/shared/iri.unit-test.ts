import { Iri } from "../../../../src/core/domain/shared/iri";
import { InvariantError } from "../../../../src/core/domain/shared/lpdc-error";

describe("constructing", () => {
  test("creating success", () => {
    expect(() => new Iri("http://some-value")).not.toThrow();
    expect(() => new Iri("_:b1")).not.toThrow();
  });

  test("undefined throws error", () => {
    expect(() => new Iri(undefined)).toThrowWithMessage(
      InvariantError,
      "iri mag niet ontbreken",
    );
  });

  test("Blank id throws error", () => {
    expect(() => new Iri("")).toThrowWithMessage(
      InvariantError,
      "iri mag niet leeg zijn",
    );
  });

  test("Does not start with http or https throws error", () => {
    expect(() => new Iri("/some-value")).toThrowWithMessage(
      InvariantError,
      "iri begint niet met een van volgende waarden: [http://,https://,_:]",
    );
  });

  test("get value", () => {
    const iri = new Iri("http://some-value");
    expect(iri.value).toEqual("http://some-value");
  });
});
