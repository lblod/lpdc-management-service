import {TEST_SPARQL_ENDPOINT} from "../../test.config";
import {DirectDatabaseAccess} from "./direct-database-access";
import {sparqlEscapeUri, uuid} from "../../../mu-helper";
import {buildInstanceIri, buildInstanceSnapshotIri} from "../../core/domain/iri-test-builder";
import {aBestuurseenheid} from "../../core/domain/bestuurseenheid-test-builder";
import {aMinimalInstanceSnapshot, InstanceSnapshotTestBuilder} from "../../core/domain/instance-snapshot-test-builder";
import {BestuurseenheidSparqlTestRepository} from "./bestuurseenheid-sparql-test-repository";
import {InstanceSnapshotSparqlTestRepository} from "./instance-snapshot-sparql-test-repository";
import {LanguageString} from "../../../src/core/domain/language-string";

describe('InstanceSnapshotRepository', () => {

    const repository = new InstanceSnapshotSparqlTestRepository(TEST_SPARQL_ENDPOINT);
    const bestuurseenheidRepository = new BestuurseenheidSparqlTestRepository(TEST_SPARQL_ENDPOINT);
    const directDatabaseAccess = new DirectDatabaseAccess(TEST_SPARQL_ENDPOINT);

    describe('findById', () => {

        test('When minimal instance snapshot exists with id, then return instance snapshot', async () => {
            const bestuurseenheid = aBestuurseenheid().build();
            const anotherBestuurseenheid = aBestuurseenheid().build();
            await bestuurseenheidRepository.save(bestuurseenheid);
            await bestuurseenheidRepository.save(anotherBestuurseenheid);

            const instanceSnapshot = aMinimalInstanceSnapshot().withCreatedBy(bestuurseenheid.id).build();
            await repository.save(bestuurseenheid, instanceSnapshot);

            const anotherInstanceSnapshot = aMinimalInstanceSnapshot().withCreatedBy(anotherBestuurseenheid.id).build();
            await repository.save(bestuurseenheid, anotherInstanceSnapshot);

            const actualInstance = await repository.findById(bestuurseenheid, instanceSnapshot.id);

            expect(actualInstance).toEqual(instanceSnapshot);

        });

    });

    describe('Verify ontology and mapping', () => {

        test('Verify minimal mapping', async () => {
            const instanceUUID = uuid();
            const instanceId = buildInstanceIri(instanceUUID);
            const instanceSnapshotUUID = uuid();
            const instanceSnapshotId = buildInstanceSnapshotIri(instanceSnapshotUUID);

            const bestuurseenheid = aBestuurseenheid().build();

            const instanceSnapshot =
                aMinimalInstanceSnapshot()
                    .withId(instanceSnapshotId)
                    .withCreatedBy(bestuurseenheid.id)
                    .withIsVersionOfInstance(instanceId)
                    .withTitle(LanguageString.of(
                        InstanceSnapshotTestBuilder.TITLE_EN,
                        undefined,
                        undefined,
                        InstanceSnapshotTestBuilder.TITLE_NL_INFORMAL))
                    .withDescription(
                        LanguageString.of(
                            InstanceSnapshotTestBuilder.DESCRIPTION_EN,
                            undefined,
                            undefined,
                            InstanceSnapshotTestBuilder.DESCRIPTION_NL_INFORMAL))
                    .withDateCreated(InstanceSnapshotTestBuilder.DATE_CREATED)
                    .withDateModified(InstanceSnapshotTestBuilder.DATE_MODIFIED)
                    .withGeneratedAtTime(InstanceSnapshotTestBuilder.GENERATED_AT_TIME)
                    .build();

            await directDatabaseAccess.insertData(
                `${bestuurseenheid.instanceSnapshotsLdesDataGraph()}`,
                [
                    `${sparqlEscapeUri(instanceSnapshotId)} a <http://purl.org/vocab/cpsv#PublicService>`,
                    `${sparqlEscapeUri(instanceSnapshotId)} <http://purl.org/pav/createdBy> ${sparqlEscapeUri(bestuurseenheid.id)}`,
                    `${sparqlEscapeUri(instanceSnapshotId)} <http://purl.org/dc/terms/isVersionOf> ${sparqlEscapeUri(instanceId)}`,
                    `${sparqlEscapeUri(instanceSnapshotId)} <http://purl.org/dc/terms/title> """${InstanceSnapshotTestBuilder.TITLE_EN}"""@EN`,
                    `${sparqlEscapeUri(instanceSnapshotId)} <http://purl.org/dc/terms/title> """${InstanceSnapshotTestBuilder.TITLE_NL_INFORMAL}"""@nl-BE-x-informal`,
                    `${sparqlEscapeUri(instanceSnapshotId)} <http://purl.org/dc/terms/description> """${InstanceSnapshotTestBuilder.DESCRIPTION_EN}"""@EN`,
                    `${sparqlEscapeUri(instanceSnapshotId)} <http://purl.org/dc/terms/description> """${InstanceSnapshotTestBuilder.DESCRIPTION_NL_INFORMAL}"""@nl-BE-x-informal`,
                    `${sparqlEscapeUri(instanceSnapshotId)} <http://purl.org/dc/terms/created> """${InstanceSnapshotTestBuilder.DATE_CREATED.value}"""^^<http://www.w3.org/2001/XMLSchema#dateTime>`,
                    `${sparqlEscapeUri(instanceSnapshotId)} <http://purl.org/dc/terms/created> """${InstanceSnapshotTestBuilder.DATE_CREATED.value}"""^^<http://www.w3.org/2001/XMLSchema#dateTime>`,
                    `${sparqlEscapeUri(instanceSnapshotId)} <http://purl.org/dc/terms/modified> """${InstanceSnapshotTestBuilder.DATE_MODIFIED.value}"""^^<http://www.w3.org/2001/XMLSchema#dateTime>`,
                    `${sparqlEscapeUri(instanceSnapshotId)} <http://www.w3.org/ns/prov#generatedAtTime> """${InstanceSnapshotTestBuilder.GENERATED_AT_TIME.value}"""^^<http://www.w3.org/2001/XMLSchema#dateTime>`,
                ]);

            const actualInstanceSnapshot = await repository.findById(bestuurseenheid, instanceSnapshotId);

            expect(actualInstanceSnapshot).toEqual(instanceSnapshot);
        });

    });


});