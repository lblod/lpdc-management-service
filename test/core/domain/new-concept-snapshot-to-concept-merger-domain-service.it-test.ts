import {TEST_SPARQL_ENDPOINT} from "../../test.config";
import {ConceptSnapshotSparqlTestRepository} from "../../driven/persistence/concept-snapshot-sparql-test-repository";
import {ConceptSparqlTestRepository} from "../../driven/persistence/concept-sparql-test-repository";
import {
    NewConceptSnapshotToConceptMergerDomainService
} from "../../../src/core/domain/new-concept-snapshot-to-concept-merger-domain-service";
import {aFullConceptSnapshot} from "./concept-snapshot-test-builder";
import {buildConceptIri} from "./iri-test-builder";
import {uuid} from "../../../mu-helper";

describe('merges a new concept snapshot into a concept', () => {

    const conceptSnapshotRepository = new ConceptSnapshotSparqlTestRepository(TEST_SPARQL_ENDPOINT);
    const conceptRepository = new ConceptSparqlTestRepository(TEST_SPARQL_ENDPOINT);

    const merger = new NewConceptSnapshotToConceptMergerDomainService(conceptSnapshotRepository, conceptRepository, TEST_SPARQL_ENDPOINT);

    test('Creates a new concept from a concept snapshot', async () => {
        const isVersionOfConceptId = buildConceptIri(uuid());
        const conceptSnapshot =
            aFullConceptSnapshot()
                .withIsVersionOfConcept(isVersionOfConceptId)
                .build();
        await conceptSnapshotRepository.save(conceptSnapshot);

        await merger.merge(conceptSnapshot.id);

        const newlyCreatedConcept = await conceptRepository.findById(isVersionOfConceptId);
        expect(newlyCreatedConcept.id).toEqual(isVersionOfConceptId);

    });

});