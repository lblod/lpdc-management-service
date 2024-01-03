import {TEST_SPARQL_ENDPOINT} from "../../test.config";
import {ConceptSnapshotSparqlTestRepository} from "../../driven/persistence/concept-snapshot-sparql-test-repository";
import {ConceptSparqlTestRepository} from "../../driven/persistence/concept-sparql-test-repository";
import {
    NewConceptSnapshotToConceptMergerDomainService
} from "../../../src/core/domain/new-concept-snapshot-to-concept-merger-domain-service";
import {aFullConceptSnapshot} from "./concept-snapshot-test-builder";
import {buildConceptIri} from "./iri-test-builder";
import {uuid} from "../../../mu-helper";
import {DirectDatabaseAccess} from "../../driven/persistence/direct-database-access";
import {CONCEPT_GRAPH, PREFIX} from "../../../config";
import {NS} from "../../../src/driven/persistence/namespaces";
import {ConceptSnapshot} from "../../../src/core/domain/concept-snapshot";

describe('merges a new concept snapshot into a concept', () => {

    const conceptSnapshotRepository = new ConceptSnapshotSparqlTestRepository(TEST_SPARQL_ENDPOINT);
    const conceptRepository = new ConceptSparqlTestRepository(TEST_SPARQL_ENDPOINT);

    const directDatabaseAccess = new DirectDatabaseAccess(TEST_SPARQL_ENDPOINT);

    const merger = new NewConceptSnapshotToConceptMergerDomainService(conceptSnapshotRepository, conceptRepository, TEST_SPARQL_ENDPOINT);

    test('Creates a new concept from a concept snapshot', async () => {
        const isVersionOfConceptId = buildConceptIri(uuid());
        const conceptSnapshot =
            aFullConceptSnapshot()
                .withIsVersionOfConcept(isVersionOfConceptId)
                .build();
        await conceptSnapshotRepository.save(conceptSnapshot);

        insertAllConceptSchemeLinksToGoOverGraphBoundaryVerifyConceptSchemesOfEnums(conceptSnapshot);

        await merger.merge(conceptSnapshot.id);

        const newlyCreatedConcept = await conceptRepository.findById(isVersionOfConceptId);
        expect(newlyCreatedConcept.id).toEqual(isVersionOfConceptId);
        expect(newlyCreatedConcept.uuid).toBeDefined();
        expect(newlyCreatedConcept.title).toEqual(conceptSnapshot.title);
        expect(newlyCreatedConcept.description).toEqual(conceptSnapshot.description);
        expect(newlyCreatedConcept.additionalDescription).toEqual(conceptSnapshot.additionalDescription);
        expect(newlyCreatedConcept.exception).toEqual(conceptSnapshot.exception);
        expect(newlyCreatedConcept.regulation).toEqual(conceptSnapshot.regulation);
        expect(newlyCreatedConcept.startDate).toEqual(conceptSnapshot.startDate);
        expect(newlyCreatedConcept.endDate).toEqual(conceptSnapshot.endDate);
        expect(newlyCreatedConcept.type).toEqual(conceptSnapshot.type);
        expect(newlyCreatedConcept.targetAudiences).toEqual(conceptSnapshot.targetAudiences);
        expect(newlyCreatedConcept.themes).toEqual(conceptSnapshot.themes);
        expect(newlyCreatedConcept.competentAuthorityLevels).toEqual(conceptSnapshot.competentAuthorityLevels);
        expect(newlyCreatedConcept.competentAuthorities).toEqual(conceptSnapshot.competentAuthorities);
        expect(newlyCreatedConcept.executingAuthorityLevels).toEqual(conceptSnapshot.executingAuthorityLevels);
        expect(newlyCreatedConcept.executingAuthorities).toEqual(conceptSnapshot.executingAuthorities);
        expect(newlyCreatedConcept.publicationMedia).toEqual(conceptSnapshot.publicationMedia);
        expect(newlyCreatedConcept.yourEuropeCategories).toEqual(conceptSnapshot.yourEuropeCategories);
        expect(newlyCreatedConcept.keywords).toEqual(conceptSnapshot.keywords);
        //TODO LPDC-916: add _requirements
        //TODO LPDC-916: add _procedures
        //TODO LPDC-916: add _websites
        //TODO LPDC-916: add _costs
        //TODO LPDC-916: add _financialAdvantages
        expect(newlyCreatedConcept.productId).toEqual(conceptSnapshot.productId);
        expect(newlyCreatedConcept.latestConceptSnapshot).toEqual(conceptSnapshot.id);
        expect(newlyCreatedConcept.previousConceptSnapshots).toEqual(new Set());
        expect(newlyCreatedConcept.latestFunctionallyChangedConceptSnapshot).toEqual(conceptSnapshot.id);
        expect(newlyCreatedConcept.conceptTags).toEqual(conceptSnapshot.conceptTags);
        expect(newlyCreatedConcept.isArchived).toBeFalsy();
        expect(newlyCreatedConcept.legalResources).toEqual(conceptSnapshot.legalResources);
    });

    function insertAllConceptSchemeLinksToGoOverGraphBoundaryVerifyConceptSchemesOfEnums(conceptSnapshot: ConceptSnapshot) {
        directDatabaseAccess.insertData(
            CONCEPT_GRAPH,
            [
                `<${NS.concept.type(conceptSnapshot.type).value}> skos:inScheme <${NS.conceptscheme('Type').value}>`,
                ...Array.from(conceptSnapshot.targetAudiences)
                    .map(v => `<${NS.concept.doelgroep(v).value}> skos:inScheme <${NS.conceptscheme('Doelgroep').value}>`),
                ...Array.from(conceptSnapshot.themes)
                    .map(v => `<${NS.concept.thema(v).value}> skos:inScheme <${NS.conceptscheme('Thema').value}>`),
                ...Array.from(conceptSnapshot.competentAuthorityLevels)
                    .map(v => `<${NS.concept.bevoegdBestuursniveau(v).value}> skos:inScheme <${NS.conceptscheme('BevoegdBestuursniveau').value}>`),
                ...Array.from([...conceptSnapshot.competentAuthorities, ...conceptSnapshot.executingAuthorities])
                    .map(v => `<${v}> skos:inScheme <${NS.conceptscheme('IPDCOrganisaties').value}>`),
                ...Array.from(conceptSnapshot.executingAuthorityLevels)
                    .map(v => `<${NS.concept.uitvoerendBestuursniveau(v).value}> skos:inScheme <${NS.conceptscheme('UitvoerendBestuursniveau').value}>`),
                ...Array.from(conceptSnapshot.publicationMedia)
                    .map(v => `<${NS.concept.publicatieKanaal(v).value}> skos:inScheme <${NS.conceptscheme('PublicatieKanaal').value}>`),
                ...Array.from(conceptSnapshot.yourEuropeCategories)
                    .map(v => `<${NS.concept.yourEuropeCategorie(v).value}> skos:inScheme <${NS.conceptscheme('YourEuropeCategorie').value}>`),
                ...Array.from(conceptSnapshot.conceptTags)
                    .map(v => `<${NS.concept.conceptTag(v).value}> skos:inScheme <${NS.conceptscheme('ConceptTag').value}>`),
            ],
            [
                PREFIX.skos,
            ]
        );
    }

});