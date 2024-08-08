import {Iri} from "../../../src/core/domain/shared/iri";
import {
    EnsureLinkedAuthoritiesExistAsCodeListDomainService
} from "../../../src/core/domain/ensure-linked-authorities-exist-as-code-list-domain-service";
import {PREFIX, PUBLIC_GRAPH} from "../../../config";
import {sparqlEscapeString, sparqlEscapeUri, uuid} from "mu";
import {NS} from "../../../src/driven/persistence/namespaces";
import {CodeSchema} from "../../../src/core/port/driven/persistence/code-repository";
import {buildBestuurseenheidIri} from "./iri-test-builder";
import {CodeSparqlRepository} from "../../../src/driven/persistence/code-sparql-repository";
import {TEST_SPARQL_ENDPOINT} from "../../test.config";
import {DirectDatabaseAccess} from "../../driven/persistence/direct-database-access";


describe('EnsureLinkedAuthoritiesExistAsCodeListDomainService', () => {

    const directDatabaseAccess = new DirectDatabaseAccess(TEST_SPARQL_ENDPOINT);
    const bestuurseenheidRegistrationCodeFetcher = {
        fetchOrgRegistryCodelistEntry: jest.fn().mockImplementation((uriEntry: Iri) => Promise.resolve({
            uri: uriEntry,
            prefLabel: `preferred label for: ${uriEntry}`
        }))
    };
    const codeRepository = new CodeSparqlRepository(TEST_SPARQL_ENDPOINT);
    const ensureLinkedAuthoritiesExistAsCodeListDomainService = new EnsureLinkedAuthoritiesExistAsCodeListDomainService(bestuurseenheidRegistrationCodeFetcher, codeRepository);

    test('insert codeList if not exists', async () => {

        const competentAuthority = buildBestuurseenheidIri(uuid());

        await directDatabaseAccess.insertData(
            PUBLIC_GRAPH,
            [
                `${sparqlEscapeUri(NS.dvcs(CodeSchema.IPDCOrganisaties).value)} a skos:ConceptScheme`,
                `${sparqlEscapeUri(competentAuthority)} a skos:Concept`,
                `${sparqlEscapeUri(competentAuthority)} skos:inScheme ${sparqlEscapeUri(NS.dvcs(CodeSchema.IPDCOrganisaties).value)}`,
                `${sparqlEscapeUri(competentAuthority)} skos:topConceptOf ${sparqlEscapeUri(NS.dvcs(CodeSchema.IPDCOrganisaties).value)}`,
                `${sparqlEscapeUri(competentAuthority)} skos:prefLabel ${sparqlEscapeString('prefLabel')}`,
                `${sparqlEscapeUri(competentAuthority)} mu:uuid ${sparqlEscapeString(uuid())}`,
                `${sparqlEscapeUri(competentAuthority)} rdfs:seeAlso ${sparqlEscapeUri('https://wegwijs.vlaanderen.be')}`,
            ],
            [
                PREFIX.skos,
                PREFIX.mu,
                PREFIX.rdfs
            ],
        );

        const executingAuthorityWithoutCodeList = buildBestuurseenheidIri(uuid());

        await ensureLinkedAuthoritiesExistAsCodeListDomainService.ensureLinkedAuthoritiesExistAsCodeList([competentAuthority, executingAuthorityWithoutCodeList]);

        const createdCompetentAuthorityCode = await codeRepository.exists(CodeSchema.IPDCOrganisaties, competentAuthority);
        expect(createdCompetentAuthorityCode).toBeTruthy();

        const createdExecutingAuthorityCode = await codeRepository.exists(CodeSchema.IPDCOrganisaties, executingAuthorityWithoutCodeList);
        expect(createdExecutingAuthorityCode).toBeTruthy();
    });

});
