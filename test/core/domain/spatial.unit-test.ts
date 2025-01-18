import { Spatial } from "../../../src/core/domain/spatial";
import { uuid } from "../../../mu-helper";
import { Iri } from "../../../src/core/domain/shared/iri";
import { InvariantError } from "../../../src/core/domain/shared/lpdc-error";

describe("constructor", () => {
  test("throws an error for an undefined id", async () => {
    expect(
      () => new Spatial(undefined, uuid(), "Test", "1234", new Date()),
    ).toThrowWithMessage(InvariantError, "id mag niet ontbreken");
  });

  test("throws an error for an invalid iri id", async () => {
    expect(
      () => new Spatial(new Iri("   "), uuid(), "Test", "1234", new Date()),
    ).toThrowWithMessage(InvariantError, "iri mag niet leeg zijn");
  });

  test("throws an error for an undefined uuid", () => {
    expect(
      () =>
        new Spatial(
          new Iri("http://anIri"),
          undefined,
          "Test",
          "1234",
          new Date(),
        ),
    ).toThrowWithMessage(InvariantError, "uuid mag niet ontbreken");
  });

  test("throws an error for an undefined prefLabel", async () => {
    expect(
      () =>
        new Spatial(
          new Iri("http://anIri"),
          uuid(),
          undefined,
          "1234",
          new Date(),
        ),
    ).toThrowWithMessage(InvariantError, "prefLabel mag niet ontbreken");
  });

  test("throws an error for an undefined notation", async () => {
    expect(
      () =>
        new Spatial(
          new Iri("http://anIri"),
          uuid(),
          "Test",
          undefined,
          new Date(),
        ),
    ).toThrowWithMessage(InvariantError, "notation mag niet ontbreken");
  });

  test("does not throw an error for an undefined end date", async () => {
    expect(
      () =>
        new Spatial(new Iri("http://anIri"), uuid(), "Test", "1234", undefined),
    ).not.toBeUndefined();
  });

  test("does not throw an error for a missing end date", async () => {
    expect(
      () => new Spatial(new Iri("http://anIri"), uuid(), "Test", "1234"),
    ).not.toBeUndefined();
  });
});

describe("isExpired", () => {
  test("returns false for a spatial without end date", async () => {
    const spatial = new Spatial(
      new Iri("http://anIri"),
      uuid(),
      "Test",
      "1234",
    );
    expect(spatial.isExpired).toBeFalse;
  });

  test("returns false for a spatial with an end date in the future", async () => {
    const spatial = new Spatial(
      new Iri("http://anIri"),
      uuid(),
      "Test",
      "1234",
      new Date("2222-01-01"),
    );
    expect(spatial.isExpired).toBeFalse;
  });

  test("returns true for a spatial with an end date in the past", async () => {
    const spatial = new Spatial(
      new Iri("http://anIri"),
      uuid(),
      "Test",
      "1234",
      new Date("1999-01-01"),
    );
    expect(spatial.isExpired).toBeTrue;
  });
});
