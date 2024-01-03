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

        insertAllConceptSchemeLinksToKeepOriginalQueryHappy(conceptSnapshot);

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

    });

    //TODO LDPC-916: do this for all other fields that are concepts ... (See commonQueries.loadPublicService  - middle union)
    function insertAllConceptSchemeLinksToKeepOriginalQueryHappy(conceptSnapshot: ConceptSnapshot) {
        directDatabaseAccess.insertData(
            CONCEPT_GRAPH,
            [
                `<${NS.concept.type(conceptSnapshot.type).value}> skos:inScheme <${NS.conceptscheme('Type').value}>`,
            ],
            [
                PREFIX.skos,
            ]
        );
    }

});