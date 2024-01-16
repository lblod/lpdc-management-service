import {TEST_SPARQL_ENDPOINT} from "../../test.config";
import {aFullInstance, aMinimalInstance, InstanceTestBuilder} from "../../core/domain/instance-test-builder";
import {InstanceSparqlTestRepository} from "./instance-sparql-test-repository";
import {BestuurseenheidSparqlTestRepository} from "./bestuurseenheid-sparql-test-repository";
import {aBestuurseenheid} from "../../core/domain/bestuureenheid-test-builder";
import {uuid} from "../../../mu-helper";
import {DirectDatabaseAccess} from "./direct-database-access";
import {buildInstanceIri} from "../../core/domain/iri-test-builder";
import {InstanceStatusType} from "../../../src/core/domain/types";

describe('InstanceRepository', () => {

    const repository = new InstanceSparqlTestRepository(TEST_SPARQL_ENDPOINT);
    const bestuurseenheidRepository = new BestuurseenheidSparqlTestRepository(TEST_SPARQL_ENDPOINT);
    const directDatabaseAccess = new DirectDatabaseAccess(TEST_SPARQL_ENDPOINT);

    describe('findById', () => {

        test('When full instance exists with id, then return instance', async () => {
            const bestuurseenheid = aBestuurseenheid().build();
            const anotherBestuurseenheid = aBestuurseenheid().build();
            await bestuurseenheidRepository.save(bestuurseenheid);
            await bestuurseenheidRepository.save(anotherBestuurseenheid);

            const instance = aFullInstance().withBestuurseenheidId(bestuurseenheid.id).build();

            await repository.save(bestuurseenheid, instance);

            const anotherInstance = aFullInstance().withBestuurseenheidId(anotherBestuurseenheid.id).build();
            await repository.save(bestuurseenheid, anotherInstance);

            const actualConcept = await repository.findById(bestuurseenheid, instance.id);

            expect(actualConcept).toEqual(instance);
        });

        test('When minimal instance exists with id, then return instance', async () => {
            const bestuurseenheid = aBestuurseenheid().build();
            const anotherBestuurseenheid = aBestuurseenheid().build();
            await bestuurseenheidRepository.save(bestuurseenheid);
            await bestuurseenheidRepository.save(anotherBestuurseenheid);

            const instance = aMinimalInstance().withBestuurseenheidId(bestuurseenheid.id).build();

            await repository.save(bestuurseenheid, instance);

            const anotherInstance = aMinimalInstance().withBestuurseenheidId(anotherBestuurseenheid.id).build();
            await repository.save(bestuurseenheid, anotherInstance);

            const actualConcept = await repository.findById(bestuurseenheid, instance.id);

            expect(actualConcept).toEqual(instance);
        });


        test('When instance does not exist with id, then throw error', async () => {
            const bestuurseenheid = aBestuurseenheid().build();
            await bestuurseenheidRepository.save(bestuurseenheid);

            const instance = aMinimalInstance().withBestuurseenheidId(bestuurseenheid.id).build();
            await repository.save(bestuurseenheid, instance);

            const nonExistentInstanceId = buildInstanceIri('thisiddoesnotexist');

            await expect(repository.findById(bestuurseenheid, nonExistentInstanceId)).rejects.toThrow(new Error(`Could not find <http://data.lblod.info/id/public-service/thisiddoesnotexist> for type <http://purl.org/vocab/cpsv#PublicService> in graph <http://mu.semte.ch/graphs/organizations/${bestuurseenheid.uuid}/LoketLB-LPDCGebruiker>`));
        });
    });

    describe('Verify ontology and mapping', () => {

        test('Verify minimal mapping', async () => {
            const instanceUUID = uuid();
            const instanceId = buildInstanceIri(instanceUUID);
            const bestuurseenheid = aBestuurseenheid().build();
            const instanceDateCreated = InstanceTestBuilder.DATE_CREATED;
            const instanceDateModified = InstanceTestBuilder.DATE_MODIFIED;

            const instance =
                aMinimalInstance()
                    .withId(instanceId)
                    .withUuid(instanceUUID)
                    .withBestuurseenheidId(bestuurseenheid.id)
                    .withDateCreated(instanceDateCreated)
                    .withDateModified(instanceDateModified)
                    .withStatus(InstanceStatusType.ONTWERP)
                    .build();

            await directDatabaseAccess.insertData(
                `${bestuurseenheid.userGraph()}`,
                [
                    `<${instanceId}> a <http://purl.org/vocab/cpsv#PublicService>`,
                    `<${instanceId}> <http://purl.org/pav/createdBy> <${bestuurseenheid.id.value}>`,
                    `<${instanceId}> <http://mu.semte.ch/vocabularies/core/uuid> """${instanceUUID}"""`,
                    `<${instanceId}> <http://purl.org/dc/terms/created> """${instanceDateCreated.value}"""^^<http://www.w3.org/2001/XMLSchema#dateTime>`,
                    `<${instanceId}> <http://purl.org/dc/terms/modified> """${instanceDateModified.value}"""^^<http://www.w3.org/2001/XMLSchema#dateTime>`,
                    `<${instanceId}> <http://www.w3.org/ns/adms#status> <http://lblod.data.gift/concepts/instance-status/ontwerp>`,
                ]);


            const actualInstance = await repository.findById(bestuurseenheid, instanceId);

            expect(actualInstance).toEqual(instance);
        });

        test('Verify full mapping', async () => {
            const instanceUUID = uuid();
            const instanceId = buildInstanceIri(instanceUUID);
            const bestuurseenheid = aBestuurseenheid().build();

            const instance =
                aFullInstance()
                    .withId(instanceId)
                    .withUuid(instanceUUID)
                    .withBestuurseenheidId(bestuurseenheid.id)
                    .withStatus(InstanceStatusType.VERSTUURD)
                    .build();


            await directDatabaseAccess.insertData(
                `${bestuurseenheid.userGraph()}`,
                [
                    `<${instanceId}> a <http://purl.org/vocab/cpsv#PublicService>`,
                    `<${instanceId}> <http://purl.org/pav/createdBy> <${bestuurseenheid.id.value}>`,
                    `<${instanceId}> <http://mu.semte.ch/vocabularies/core/uuid> """${instanceUUID}"""`,
                    `<${instanceId}> <http://purl.org/dc/terms/title> """${InstanceTestBuilder.TITLE_EN}"""@EN`,
                    `<${instanceId}> <http://purl.org/dc/terms/title> """${InstanceTestBuilder.TITLE_NL}"""@NL`,
                    `<${instanceId}> <http://purl.org/dc/terms/title> """${InstanceTestBuilder.TITLE_NL_FORMAL}"""@nl-BE-x-formal`,
                    `<${instanceId}> <http://purl.org/dc/terms/title> """${InstanceTestBuilder.TITLE_NL_INFORMAL}"""@nl-BE-x-informal`,
                    `<${instanceId}> <http://purl.org/dc/terms/title> """${InstanceTestBuilder.TITLE_NL_GENERATED_FORMAL}"""@nl-BE-x-generated-formal`,
                    `<${instanceId}> <http://purl.org/dc/terms/title> """${InstanceTestBuilder.TITLE_NL_GENERATED_INFORMAL}"""@nl-BE-x-generated-informal`, `<${instanceId}> <http://purl.org/dc/terms/title> """${InstanceTestBuilder.TITLE_EN}"""@EN`,
                    `<${instanceId}> <http://purl.org/dc/terms/description> """${InstanceTestBuilder.DESCRIPTION_EN}"""@EN`,
                    `<${instanceId}> <http://purl.org/dc/terms/description> """${InstanceTestBuilder.DESCRIPTION_NL}"""@NL`,
                    `<${instanceId}> <http://purl.org/dc/terms/description> """${InstanceTestBuilder.DESCRIPTION_NL_FORMAL}"""@nl-BE-x-formal`,
                    `<${instanceId}> <http://purl.org/dc/terms/description> """${InstanceTestBuilder.DESCRIPTION_NL_INFORMAL}"""@nl-BE-x-informal`,
                    `<${instanceId}> <http://purl.org/dc/terms/description> """${InstanceTestBuilder.DESCRIPTION_NL_GENERATED_FORMAL}"""@nl-BE-x-generated-formal`,
                    `<${instanceId}> <http://purl.org/dc/terms/description> """${InstanceTestBuilder.DESCRIPTION_NL_GENERATED_INFORMAL}"""@nl-BE-x-generated-informal`,
                    `<${instanceId}> <http://purl.org/dc/terms/created> """${InstanceTestBuilder.DATE_CREATED.value}"""^^<http://www.w3.org/2001/XMLSchema#dateTime>`,
                    `<${instanceId}> <http://purl.org/dc/terms/modified> """${InstanceTestBuilder.DATE_MODIFIED.value}"""^^<http://www.w3.org/2001/XMLSchema#dateTime>`,
                    `<${instanceId}> <http://www.w3.org/ns/adms#status> <http://lblod.data.gift/concepts/instance-status/verstuurd>`,
                ]);


            const actualInstance = await repository.findById(bestuurseenheid, instanceId);

            expect(actualInstance).toEqual(instance);
        });
    });
});