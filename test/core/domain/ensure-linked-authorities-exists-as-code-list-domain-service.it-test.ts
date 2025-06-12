import { Iri } from "../../../src/core/domain/shared/iri";
import { EnsureLinkedAuthoritiesExistAsCodeListDomainService } from "../../../src/core/domain/ensure-linked-authorities-exist-as-code-list-domain-service";
import { PREFIX, PUBLIC_GRAPH, WEGWIJS_URL } from "../../../config";
import { sparqlEscapeString, sparqlEscapeUri, uuid } from "../../../mu-helper";
import { NS } from "../../../src/driven/persistence/namespaces";
import { CodeSchema } from "../../../src/core/port/driven/persistence/code-repository";
import { buildBestuurseenheidIri, buildOvoCodeIri } from "./iri-test-builder";
import { CodeSparqlRepository } from "../../../src/driven/persistence/code-sparql-repository";
import { TEST_SPARQL_ENDPOINT } from "../../test.config";
import { DirectDatabaseAccess } from "../../driven/persistence/direct-database-access";

describe("EnsureLinkedAuthoritiesExistAsCodeListDomainService", () => {
  const directDatabaseAccess = new DirectDatabaseAccess(TEST_SPARQL_ENDPOINT);
  const bestuurseenheidRegistrationCodeFetcher = {
    fetchOrgRegistryCodelistEntry: jest
      .fn()
      .mockImplementation((uriEntry: Iri) =>
        Promise.resolve({
          uri: uriEntry,
          prefLabel: `preferred label for: ${uriEntry}`,
        }),
      ),
  };
  const codeRepository = new CodeSparqlRepository(TEST_SPARQL_ENDPOINT);
  const testedService = new EnsureLinkedAuthoritiesExistAsCodeListDomainService(
    bestuurseenheidRegistrationCodeFetcher,
    codeRepository,
  );

  const knownAuthority = buildBestuurseenheidIri("an-administrative-unit");

  beforeEach(async () => {
    await directDatabaseAccess.insertData(
      PUBLIC_GRAPH,
      [
        `${sparqlEscapeUri(knownAuthority)} a skos:Concept`,
        `${sparqlEscapeUri(knownAuthority)} skos:inScheme ${sparqlEscapeUri(NS.dvcs(CodeSchema.IPDCOrganisaties).value)}`,
        `${sparqlEscapeUri(knownAuthority)} skos:topConceptOf ${sparqlEscapeUri(NS.dvcs(CodeSchema.IPDCOrganisaties).value)}`,
        `${sparqlEscapeUri(knownAuthority)} skos:prefLabel ${sparqlEscapeString("prefLabel")}`,
        `${sparqlEscapeUri(knownAuthority)} mu:uuid ${sparqlEscapeString(uuid())}`,
        `${sparqlEscapeUri(knownAuthority)} rdfs:seeAlso ${sparqlEscapeUri(WEGWIJS_URL)}`,
      ],
      [PREFIX.skos, PREFIX.mu, PREFIX.rdfs],
    );
  });

  afterEach(async () => {
    directDatabaseAccess.clearGraph(PUBLIC_GRAPH);
  });

  describe("getLinkedAuthority", () => {
    test("it returns an object with an IRI and label for a match", async () => {
      const iri = buildOvoCodeIri("123456");
      const result = await testedService.getLinkedAuthority(iri);

      expect(result).toEqual({
        uri: iri.value,
        prefLabel: `preferred label for: ${iri}`,
      });
    });
  });

  describe("addAuthoritiesToCodeList", () => {
    test("it inserts an unknown authority to the code list", async () => {
      const unknownAuthority = buildBestuurseenheidIri("an-unknown-authority");

      const before = await codeRepository.exists(
        CodeSchema.IPDCOrganisaties,
        unknownAuthority,
      );
      expect(before).toBeFalse;

      await testedService.addAuthoritiesToCodeList([
        { uri: unknownAuthority, prefLabel: "unknown-authority" },
      ]);

      const after = await codeRepository.exists(
        CodeSchema.IPDCOrganisaties,
        unknownAuthority,
      );
      expect(after).toBeTrue;
    });

    test("it does not change already existing authorities", async () => {
      const before = await codeRepository.exists(
        CodeSchema.IPDCOrganisaties,
        knownAuthority,
      );
      expect(before).toBeTrue();

      await testedService.addAuthoritiesToCodeList([
        { uri: knownAuthority, prefLabel: "known-authority" },
      ]);

      const after = await codeRepository.exists(
        CodeSchema.IPDCOrganisaties,
        knownAuthority,
      );
      expect(after).toBeTrue();
    });

    test("it does not add an authority without a URI", async () => {
      const unknownAuthority = buildBestuurseenheidIri("an-unknown-authority");
      await testedService.addAuthoritiesToCodeList([
        { prefLabel: "authority-without-uri" },
      ]);

      const after = await codeRepository.exists(
        CodeSchema.IPDCOrganisaties,
        unknownAuthority,
      );
      expect(after).toBeFalse();
    });

    test("it does not add an authority without a preflabel", async () => {
      const unknownAuthority = buildBestuurseenheidIri("an-unknown-authority");
      await testedService.addAuthoritiesToCodeList([{ uri: unknownAuthority }]);

      const after = await codeRepository.exists(
        CodeSchema.IPDCOrganisaties,
        unknownAuthority,
      );
      expect(after).toBeFalse();
    });
  });

  describe("ensureLinkedAuthoritiesExistsAsCodeList", () => {
    test("it inserts an unknown authority to the code list", async () => {
      const unknownAuthority = buildBestuurseenheidIri(uuid());

      const before = await codeRepository.exists(
        CodeSchema.IPDCOrganisaties,
        unknownAuthority,
      );
      expect(before).toBeFalse;

      await testedService.ensureLinkedAuthoritiesExistAsCodeList([
        unknownAuthority,
      ]);

      const after = await codeRepository.exists(
        CodeSchema.IPDCOrganisaties,
        unknownAuthority,
      );
      expect(after).toBeTrue;
    });

    test("it does not change already existing authorities", async () => {
      const before = await codeRepository.exists(
        CodeSchema.IPDCOrganisaties,
        knownAuthority,
      );
      expect(before).toBeTrue();

      await testedService.ensureLinkedAuthoritiesExistAsCodeList([
        knownAuthority,
      ]);

      const after = await codeRepository.exists(
        CodeSchema.IPDCOrganisaties,
        knownAuthority,
      );
      expect(after).toBeTrue();
    });

    test("it adds unknown authorities to the code list", async () => {
      const unknownAuthority = buildBestuurseenheidIri(uuid());

      const unknownBefore = await codeRepository.exists(
        CodeSchema.IPDCOrganisaties,
        unknownAuthority,
      );
      expect(unknownBefore).toBeFalse;

      const knownBefore = await codeRepository.exists(
        CodeSchema.IPDCOrganisaties,
        knownAuthority,
      );
      expect(knownBefore).toBeTrue();

      await testedService.ensureLinkedAuthoritiesExistAsCodeList([
        knownAuthority,
        unknownAuthority,
      ]);

      const unknownAfter = await codeRepository.exists(
        CodeSchema.IPDCOrganisaties,
        unknownAuthority,
      );
      expect(unknownAfter).toBeTrue;

      const knownAfter = await codeRepository.exists(
        CodeSchema.IPDCOrganisaties,
        knownAuthority,
      );
      expect(knownAfter).toBeTrue();
    });
  });
});
