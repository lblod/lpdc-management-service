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

describe("isValidAuthorityIri", () => {
  test("it should return true for a valid OVO code IRI", () => {
    const iri = new Iri("https://data.vlaanderen.be/id/organisatie/OVO123456");
    expect(iri.isValidAuthorityIri).toBeTrue();
  });

  test("it should return false for an invalid OVO code URLs", () => {
    let iri = new Iri("https://data.be/id/organisatie/OVO123456");
    expect(iri.isValidAuthorityIri).toBeFalse();

    iri = new Iri("https://data,vlaanderen,be/id/organisatie/OVO123456");
    expect(iri.isValidAuthorityIri).toBeFalse();
  });

  test("it should return true for a valid administrative unit IRI", () => {
    const iri = new Iri(
      "http://data.lblod.info/id/bestuurseenheden/09f5b10fbd078fcb1e0e4910d32e47146a5eb31d8138dcbaec798309e64dd059",
    );
    expect(iri.isValidAuthorityIri).toBeTrue();
  });

  test("it should return false for a invalid administrative unit URLs", () => {
    let iri = new Iri(
      "http://data/id/bestuurseenheden/09f5b10fbd078fcb1e0e4910d32e47146a5eb31d8138dcbaec798309e64dd059",
    );
    expect(iri.isValidAuthorityIri).toBeFalse();

    iri = new Iri(
      "http://data!lblod+info/id/bestuurseenheden/09f5b10fbd078fcb1e0e4910d32e47146a5eb31d8138dcbaec798309e64dd059",
    );
    expect(iri.isValidAuthorityIri).toBeFalse();
  });

  test("it should return false for a administrative unit IRI with too short of an UUID", () => {
    const iri = new Iri("http://data.lblod.info/id/bestuurseenheden/OVO002949");
    expect(iri.isValidAuthorityIri).toBeFalse();
  });

  test("it should return false for an OVO code IRI with too few digits", () => {
    const iri = new Iri("https://data.vlaanderen.be/id/organisatie/OVO12");
    expect(iri.isValidAuthorityIri).toBeFalse();
  });

  test("it should return false for an OVO code IRI with too many digits", () => {
    const iri = new Iri(
      "https://data.vlaanderen.be/id/organisatie/OVO122456789",
    );
    expect(iri.isValidAuthorityIri).toBeFalse();
  });
});
