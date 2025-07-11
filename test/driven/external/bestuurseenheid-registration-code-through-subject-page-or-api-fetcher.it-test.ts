import { BestuurseenheidRegistrationCodeThroughSubjectPageOrApiFetcher } from "../../../src/driven/external/bestuurseenheid-registration-code-through-subject-page-or-api-fetcher";
import {
  buildBestuurseenheidIri,
  buildOvoCodeIri,
} from "../../core/domain/iri-test-builder";

describe("BestuurseenheidRegistrationCodeThroughSubjectPageOrApiFetcher", () => {
  // NOTE (25/06/2025): Currently this test is expected to fail. The tested
  // functionality is broken as the Centrale Vindplaats is not intended to be
  // used this way. We opted not to fix as
  // - the functionality is rarely used, if at all; and
  // - the proper solution is to set up a sync with the OrganisatiePortaal app
  // - which is the master of this data.
  // See LPDC-1301 for more background
  test("it should return a preflabel for an existing administrative unit", async () => {
    const uriString = buildBestuurseenheidIri(
      "09f5b10fbd078fcb1e0e4910d32e47146a5eb31d8138dcbaec798309e64dd059",
    ).value;
    const fetcher =
      new BestuurseenheidRegistrationCodeThroughSubjectPageOrApiFetcher();
    const result = await fetcher.fetchOrgRegistryCodelistEntry(uriString);

    expect(result.prefLabel).toEqual("Genk");
  });

  test("it should return an empty result for a non-existing administrative unit", async () => {
    const uriString = buildBestuurseenheidIri(
      "an-administrative-unit-that-does-not-exist",
    ).value;
    const fetcher =
      new BestuurseenheidRegistrationCodeThroughSubjectPageOrApiFetcher();
    const result = await fetcher.fetchOrgRegistryCodelistEntry(uriString);
    expect(result).toBeUndefined;
  });

  test("it should return a preflabel for an existing OVO code", async () => {
    const uriString = buildOvoCodeIri("002949").value;
    const fetcher =
      new BestuurseenheidRegistrationCodeThroughSubjectPageOrApiFetcher();
    const result = await fetcher.fetchOrgRegistryCodelistEntry(uriString);

    expect(result.prefLabel).toEqual("agentschap Digitaal Vlaanderen");
  });

  test("it should return an empty result for a invalid OVO code", async () => {
    const uriString = buildOvoCodeIri("00").value;
    const fetcher =
      new BestuurseenheidRegistrationCodeThroughSubjectPageOrApiFetcher();
    const result = await fetcher.fetchOrgRegistryCodelistEntry(uriString);

    expect(result).toBeUndefined;
  });
});
