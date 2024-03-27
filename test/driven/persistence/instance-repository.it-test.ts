import {TEST_SPARQL_ENDPOINT} from "../../test.config";
import {aFullInstance, aMinimalInstance, InstanceTestBuilder} from "../../core/domain/instance-test-builder";
import {BestuurseenheidSparqlTestRepository} from "./bestuurseenheid-sparql-test-repository";
import {aBestuurseenheid} from "../../core/domain/bestuurseenheid-test-builder";
import {sparqlEscapeUri, uuid} from "../../../mu-helper";
import {DirectDatabaseAccess} from "./direct-database-access";
import {
    buildConceptIri,
    buildConceptSnapshotIri,
    buildInstanceIri,
    buildSpatialRefNis2019Iri
} from "../../core/domain/iri-test-builder";
import {
    CompetentAuthorityLevelType,
    ExecutingAuthorityLevelType,
    InstancePublicationStatusType,
    InstanceStatusType,
    LanguageType,
    ProductType,
    PublicationMediumType,
    TargetAudienceType,
    ThemeType,
    YourEuropeCategoryType
} from "../../../src/core/domain/types";
import {NS} from "../../../src/driven/persistence/namespaces";
import {aMinimalRequirementForInstance} from "../../core/domain/requirement-test-builder";
import {aMinimalEvidenceForInstance} from "../../core/domain/evidence-test-builder";
import {aMinimalProcedureForInstance} from "../../core/domain/procedure-test-builder";
import {aMinimalWebsiteForInstance} from "../../core/domain/website-test-builder";
import {
    aFullContactPointForInstance,
    aMinimalContactPointForInstance
} from "../../core/domain/contact-point-test-builder";
import {
    AddressTestBuilder,
    aFullAddressForInstance,
    aMinimalAddressForInstance
} from "../../core/domain/address-test-builder";
import {SparqlQuerying} from "../../../src/driven/persistence/sparql-querying";
import {literal, namedNode, quad} from "rdflib";
import {InstanceBuilder} from "../../../src/core/domain/instance";
import {FormatPreservingDate} from "../../../src/core/domain/format-preserving-date";

import {InstanceSparqlRepository} from "../../../src/driven/persistence/instance-sparql-repository";
import {restoreRealTime, setFixedTime} from "../../fixed-time";
import {aMinimalLegalResourceForInstance} from "../../core/domain/legal-resource-test-builder";
import {ConcurrentUpdateError, NotFoundError, SystemError} from "../../../src/core/domain/shared/lpdc-error";
import {LanguageString} from "../../../src/core/domain/language-string";
import {aMinimalCostForInstance} from "../../core/domain/cost-test-builder";
import {aMinimalFinancialAdvantageForInstance} from "../../core/domain/financial-advantage-test-builder";

describe('InstanceRepository', () => {

    const repository = new InstanceSparqlRepository(TEST_SPARQL_ENDPOINT);
    const bestuurseenheidRepository = new BestuurseenheidSparqlTestRepository(TEST_SPARQL_ENDPOINT);
    const directDatabaseAccess = new DirectDatabaseAccess(TEST_SPARQL_ENDPOINT);

    beforeAll(() => setFixedTime());

    afterAll(() => restoreRealTime());

    describe('findById', () => {

        test('When full instance exists with id, then return instance', async () => {
            const bestuurseenheid = aBestuurseenheid().build();
            const contactPoint = aFullContactPointForInstance().withAddress(aFullAddressForInstance().build()).build();

            const anotherBestuurseenheid = aBestuurseenheid().build();
            const anotherContactPoint = aFullContactPointForInstance().withAddress(aFullAddressForInstance().build()).build();
            await bestuurseenheidRepository.save(bestuurseenheid);
            await bestuurseenheidRepository.save(anotherBestuurseenheid);

            const instance = aFullInstance().withCreatedBy(bestuurseenheid.id).withContactPoints([contactPoint]).build();

            await repository.save(bestuurseenheid, instance);

            const anotherInstance = aFullInstance().withCreatedBy(anotherBestuurseenheid.id).withContactPoints([anotherContactPoint]).build();
            await repository.save(bestuurseenheid, anotherInstance);

            const actualInstance = await repository.findById(bestuurseenheid, instance.id);

            expect(actualInstance).toEqual(instance);
        });

        test('When minimal instance exists with id, then return instance', async () => {
            const bestuurseenheid = aBestuurseenheid().build();
            const anotherBestuurseenheid = aBestuurseenheid().build();
            await bestuurseenheidRepository.save(bestuurseenheid);
            await bestuurseenheidRepository.save(anotherBestuurseenheid);

            const instance = aMinimalInstance().withCreatedBy(bestuurseenheid.id).build();

            await repository.save(bestuurseenheid, instance);

            const anotherInstance = aMinimalInstance().withCreatedBy(anotherBestuurseenheid.id).build();
            await repository.save(bestuurseenheid, anotherInstance);

            const actualInstance = await repository.findById(bestuurseenheid, instance.id);

            expect(actualInstance).toEqual(instance);
        });

        test('When instance does not exist with id, then throw error', async () => {
            const bestuurseenheid = aBestuurseenheid().build();
            await bestuurseenheidRepository.save(bestuurseenheid);

            const instance = aMinimalInstance().withCreatedBy(bestuurseenheid.id).build();
            await repository.save(bestuurseenheid, instance);

            const nonExistentInstanceId = buildInstanceIri('thisiddoesnotexist');

            await expect(repository.findById(bestuurseenheid, nonExistentInstanceId)).rejects.toThrowWithMessage(NotFoundError, `Kan <http://data.lblod.info/id/public-service/thisiddoesnotexist> niet vinden voor type <https://productencatalogus.data.vlaanderen.be/ns/ipdc-lpdc#InstancePublicService> in graph <http://mu.semte.ch/graphs/organizations/${bestuurseenheid.uuid}/LoketLB-LPDCGebruiker>`);
        });
    });

    describe('update', () => {

        test('should update instance', async () => {
            const bestuurseenheid = aBestuurseenheid().build();
            const oldInstance = aFullInstance()
                .withCreatedBy(bestuurseenheid.id)
                .withDateModified(FormatPreservingDate.of('2023-10-20T00:00:00.657Z'))
                .build();
            await repository.save(bestuurseenheid, oldInstance);

            const newInstance = InstanceBuilder.from(oldInstance)
                .withDateModified(FormatPreservingDate.now())
                .build();

            await repository.update(bestuurseenheid, newInstance, oldInstance.dateModified);

            const actualInstance = await repository.findById(bestuurseenheid, newInstance.id);

            expect(actualInstance).toEqual(newInstance);
        });

        test('should throw error when old instance is equal to new instance', async () => {
            const bestuurseenheid = aBestuurseenheid().build();
            const oldInstance = aFullInstance().withCreatedBy(bestuurseenheid.id).build();
            await repository.save(bestuurseenheid, oldInstance);

            const newInstance = InstanceBuilder.from(oldInstance).build();

            expect(oldInstance).toEqual(newInstance);
            await expect(() => repository.update(bestuurseenheid, newInstance, oldInstance.dateModified)).rejects.toThrowWithMessage(SystemError, 'Geen wijzigingen');
        });

        test('should throw error when modified date of old instance is not the same as in db', async () => {
            const bestuurseenheid = aBestuurseenheid().build();
            const dbInstance = aFullInstance()
                .withCreatedBy(bestuurseenheid.id)
                .withDateModified(FormatPreservingDate.of('2023-10-30T00:00:00.657Z'))
                .build();
            await repository.save(bestuurseenheid, dbInstance);

            const oldInstance = InstanceBuilder.from(dbInstance)
                .withDateModified(FormatPreservingDate.of('2023-10-28T00:00:00.657Z'))
                .build();

            const newInstance = InstanceBuilder.from(dbInstance)
                .withDateModified(FormatPreservingDate.of('2023-10-31T00:00:00.657Z'))
                .build();

            await expect(() => repository.update(bestuurseenheid, newInstance, oldInstance.dateModified)).rejects.toThrowWithMessage(ConcurrentUpdateError, 'De productfiche is gelijktijdig aangepast door een andere gebruiker. Herlaad de pagina en geef je aanpassingen opnieuw in');

            const actualInstance = await repository.findById(bestuurseenheid, newInstance.id);
            expect(actualInstance).toEqual(dbInstance);
        });
    });

    describe('recreate', () => {

        test('if exists as tombstone (but no publication info), deletes tombstone, and inserts new instance data', async () => {
            const instanceUUID = uuid();
            const instanceId = buildInstanceIri(instanceUUID);
            const bestuurseenheid = aBestuurseenheid().build();
            const instanceDateCreated = InstanceTestBuilder.DATE_CREATED;
            const instanceDateModified = InstanceTestBuilder.DATE_MODIFIED;

            const instance =
                aMinimalInstance()
                    .withId(instanceId)
                    .withUuid(instanceUUID)
                    .withCreatedBy(bestuurseenheid.id)
                    .withDateCreated(instanceDateCreated)
                    .withDateModified(instanceDateModified)
                    .withStatus(InstanceStatusType.VERSTUURD)
                    .withDateSent(FormatPreservingDate.now())
                    .build();

            await directDatabaseAccess.insertData(
                `${bestuurseenheid.userGraph()}`,
                [
                    `<${instanceId}> a <https://www.w3.org/ns/activitystreams#Tombstone>`,
                    `<${instanceId}> <https://www.w3.org/ns/activitystreams#deleted> """${FormatPreservingDate.now().value}"""^^<http://www.w3.org/2001/XMLSchema#dateTime>`,
                    `<${instanceId}> <https://www.w3.org/ns/activitystreams#formerType> <https://productencatalogus.data.vlaanderen.be/ns/ipdc-lpdc#InstancePublicService>`,
                ]);

            await repository.recreate(bestuurseenheid, instance);

            const actualInstance = await repository.findById(bestuurseenheid, instanceId);

            expect(actualInstance).toEqual(instance);
        });

        test('if exists as tombstone (but te herpubliceren), deletes tombstone, and inserts new instance data', async () => {
            const instanceUUID = uuid();
            const instanceId = buildInstanceIri(instanceUUID);
            const bestuurseenheid = aBestuurseenheid().build();
            const instanceDateCreated = InstanceTestBuilder.DATE_CREATED;
            const instanceDateModified = InstanceTestBuilder.DATE_MODIFIED;

            const instance =
                aMinimalInstance()
                    .withId(instanceId)
                    .withUuid(instanceUUID)
                    .withCreatedBy(bestuurseenheid.id)
                    .withDateCreated(instanceDateCreated)
                    .withDateModified(instanceDateModified)
                    .withStatus(InstanceStatusType.VERSTUURD)
                    .withDateSent(FormatPreservingDate.now())
                    .build();

            await directDatabaseAccess.insertData(
                `${bestuurseenheid.userGraph()}`,
                [
                    `<${instanceId}> a <https://www.w3.org/ns/activitystreams#Tombstone>`,
                    `<${instanceId}> <https://www.w3.org/ns/activitystreams#deleted> """${FormatPreservingDate.now().value}"""^^<http://www.w3.org/2001/XMLSchema#dateTime>`,
                    `<${instanceId}> <https://www.w3.org/ns/activitystreams#formerType> <https://productencatalogus.data.vlaanderen.be/ns/ipdc-lpdc#InstancePublicService>`,
                    `<${instanceId}> <http://schema.org/publication> <http://lblod.data.gift/concepts/publication-status/te-herpubliceren>`,
                ]);

            await repository.recreate(bestuurseenheid, instance);

            const actualInstance = await repository.findById(bestuurseenheid, instanceId);

            expect(actualInstance).toEqual(instance);

        });

        test('if exists as tombstone (but gepubliceerd), deletes tombstone, and inserts new instance data', async () => {
            const instanceUUID = uuid();
            const instanceId = buildInstanceIri(instanceUUID);
            const bestuurseenheid = aBestuurseenheid().build();
            const instanceDateCreated = InstanceTestBuilder.DATE_CREATED;
            const instanceDateModified = InstanceTestBuilder.DATE_MODIFIED;

            const instance =
                aMinimalInstance()
                    .withId(instanceId)
                    .withUuid(instanceUUID)
                    .withCreatedBy(bestuurseenheid.id)
                    .withDateCreated(instanceDateCreated)
                    .withDateModified(instanceDateModified)
                    .withStatus(InstanceStatusType.VERSTUURD)
                    .withDateSent(FormatPreservingDate.now())
                    .build();

            await directDatabaseAccess.insertData(
                `${bestuurseenheid.userGraph()}`,
                [
                    `<${instanceId}> a <https://www.w3.org/ns/activitystreams#Tombstone>`,
                    `<${instanceId}> <https://www.w3.org/ns/activitystreams#deleted> """${FormatPreservingDate.now().value}"""^^<http://www.w3.org/2001/XMLSchema#dateTime>`,
                    `<${instanceId}> <https://www.w3.org/ns/activitystreams#formerType> <https://productencatalogus.data.vlaanderen.be/ns/ipdc-lpdc#InstancePublicService>`,
                    `<${instanceId}> <http://schema.org/publication> <http://lblod.data.gift/concepts/publication-status/gepubliceerd>`,
                    `<${instanceId}> <http://schema.org/datePublished> """${FormatPreservingDate.now().value}"""^^<http://www.w3.org/2001/XMLSchema#dateTime>`,
                ]);

            await repository.recreate(bestuurseenheid, instance);

            const actualInstance = await repository.findById(bestuurseenheid, instanceId);

            expect(actualInstance).toEqual(instance);

        });

    });

    describe('delete', () => {

        test('if exists with publicationStatus te-herpubliceren, Removes all triples related to the instance and create tombstone triples and publicationStatus te-herpubliceren ', async () => {

            const bestuurseenheid = aBestuurseenheid().build();
            const instance = aFullInstance().withPublicationStatus(InstancePublicationStatusType.TE_HERPUBLICEREN).build();

            await repository.save(bestuurseenheid, instance);
            await repository.delete(bestuurseenheid, instance.id);

            const query = `
            SELECT ?s ?p ?o WHERE {
                GRAPH ${sparqlEscapeUri(bestuurseenheid.userGraph())} {
                    VALUES ?s {
                        <${instance.id.value}>
                    }
                    ?s ?p ?o
                }
            }
        `;
            const queryResult = await directDatabaseAccess.list(query);
            const quads = new SparqlQuerying().asQuads(queryResult, bestuurseenheid.userGraph().value);

            expect(quads).toHaveLength(4);
            expect(quads).toEqual(expect.arrayContaining([
                quad(namedNode(instance.id.value), namedNode('http://www.w3.org/1999/02/22-rdf-syntax-ns#type'), namedNode('https://www.w3.org/ns/activitystreams#Tombstone'), namedNode(bestuurseenheid.userGraph().value)),
                quad(namedNode(instance.id.value), namedNode('https://www.w3.org/ns/activitystreams#deleted'), literal(FormatPreservingDate.now().value, 'http://www.w3.org/2001/XMLSchema#dateTime'), namedNode(bestuurseenheid.userGraph().value)),
                quad(namedNode(instance.id.value), namedNode('https://www.w3.org/ns/activitystreams#formerType'), namedNode('https://productencatalogus.data.vlaanderen.be/ns/ipdc-lpdc#InstancePublicService'), namedNode(bestuurseenheid.userGraph().value)),
                quad(namedNode(instance.id.value), namedNode('http://schema.org/publication'), namedNode('http://lblod.data.gift/concepts/publication-status/te-herpubliceren'), namedNode(bestuurseenheid.userGraph().value)),
            ]));
        });

        test('if exists without publicationStatus, Removes all triples related to the instance and does not create tombstone triples ', async () => {

            const bestuurseenheid = aBestuurseenheid().build();
            const instance = aFullInstance()
                .withPublicationStatus(undefined)
                .withDatePublished(undefined)
                .build();

            await repository.save(bestuurseenheid, instance);
            await repository.delete(bestuurseenheid, instance.id);

            const query = `
            SELECT ?s ?p ?o WHERE {
                GRAPH ${sparqlEscapeUri(bestuurseenheid.userGraph())} {
                    VALUES ?s {
                        <${instance.id.value}>
                    }
                    ?s ?p ?o
                }
            }
        `;
            const queryResult = await directDatabaseAccess.list(query);
            const quads = new SparqlQuerying().asQuads(queryResult, bestuurseenheid.userGraph().value);

            expect(quads).toEqual([]);
        });

        test('Only the requested instance is deleted', async () => {
            const bestuurseenheid = aBestuurseenheid().build();
            const instance = aFullInstance()
                .withPublicationStatus(undefined)
                .withDatePublished(undefined)
                .build();
            const anotherInstance = aMinimalInstance().build();

            await repository.save(bestuurseenheid, instance);
            await repository.save(bestuurseenheid, anotherInstance);

            await repository.delete(bestuurseenheid, instance.id);

            await expect(repository.findById(bestuurseenheid, instance.id)).rejects.toThrowWithMessage(NotFoundError,
                `Kan <${instance.id}> niet vinden voor type <https://productencatalogus.data.vlaanderen.be/ns/ipdc-lpdc#InstancePublicService> in graph <${bestuurseenheid.userGraph()}>`);
            expect(await repository.findById(bestuurseenheid, anotherInstance.id)).toEqual(anotherInstance);
        });

        test('When instance does not exist with id, then throw error', async () => {
            const bestuurseenheid = aBestuurseenheid().build();
            await bestuurseenheidRepository.save(bestuurseenheid);

            const instance = aMinimalInstance().withCreatedBy(bestuurseenheid.id).build();
            await repository.save(bestuurseenheid, instance);

            const nonExistentInstanceId = buildInstanceIri('thisiddoesnotexist');

            await expect(repository.delete(bestuurseenheid, nonExistentInstanceId)).rejects.toThrowWithMessage(NotFoundError,
                `Kan <${nonExistentInstanceId}> niet vinden voor type <https://productencatalogus.data.vlaanderen.be/ns/ipdc-lpdc#InstancePublicService> in graph <${bestuurseenheid.userGraph()}>`
            );
        });

        test('if instance exists, but for other bestuurseenheid, then does not remove and throws error', async () => {
            const bestuurseenheid = aBestuurseenheid().build();
            const anotherBestuurseenheid = aBestuurseenheid().build();
            const instance = aFullInstance().withCreatedBy(bestuurseenheid.id).build();
            const anotherInstance = aFullInstance().withCreatedBy(anotherBestuurseenheid.id).build();

            await repository.save(bestuurseenheid, instance);
            await repository.save(anotherBestuurseenheid, anotherInstance);

            await expect(repository.delete(bestuurseenheid, anotherInstance.id)).rejects.toThrowWithMessage(NotFoundError,
                `Kan <${anotherInstance.id}> niet vinden voor type <https://productencatalogus.data.vlaanderen.be/ns/ipdc-lpdc#InstancePublicService> in graph <${bestuurseenheid.userGraph()}>`
            );

            expect(await repository.findById(anotherBestuurseenheid, anotherInstance.id)).toEqual(anotherInstance);


        });
    });

    describe('exists', () => {

        test('When exists, then return true', async () => {
            const bestuurseenheid = aBestuurseenheid().build();
            const instance = aFullInstance().build();
            await repository.save(bestuurseenheid, instance);

            const actual = await repository.exists(bestuurseenheid, instance.id);

            expect(actual).toEqual(true);
        });

        test('When not exists, then return false', async () => {
            const bestuurseenheid = aBestuurseenheid().build();
            const instance = aFullInstance().build();

            const actual = await repository.exists(bestuurseenheid, instance.id);

            expect(actual).toEqual(false);
        });
    });

    describe('isDeleted', () => {
        test('When is deleted, then return true ', async () => {
            const bestuurseenheid = aBestuurseenheid().build();
            const instance = aFullInstance().build();
            await repository.save(bestuurseenheid, instance);
            await repository.delete(bestuurseenheid, instance.id);

            const actual = await repository.isDeleted(bestuurseenheid, instance.id);
            expect(actual).toEqual(true);
        });
        test('When is not deleted, then return false', async () => {
            const bestuurseenheid = aBestuurseenheid().build();
            const instance = aFullInstance().build();
            await repository.save(bestuurseenheid, instance);

            const actual = await repository.isDeleted(bestuurseenheid, instance.id);
            expect(actual).toEqual(false);
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
                    .withCreatedBy(bestuurseenheid.id)
                    .withDateCreated(instanceDateCreated)
                    .withDateModified(instanceDateModified)
                    .withStatus(InstanceStatusType.ONTWERP)
                    .build();

            await directDatabaseAccess.insertData(
                `${bestuurseenheid.userGraph()}`,
                [
                    `<${instanceId}> a <https://productencatalogus.data.vlaanderen.be/ns/ipdc-lpdc#InstancePublicService>`,
                    `<${instanceId}> <http://purl.org/pav/createdBy> <${bestuurseenheid.id.value}>`,
                    `<${instanceId}> <http://mu.semte.ch/vocabularies/core/uuid> """${instanceUUID}"""`,
                    `<${instanceId}> <http://schema.org/dateCreated> """${instanceDateCreated.value}"""^^<http://www.w3.org/2001/XMLSchema#dateTime>`,
                    `<${instanceId}> <http://schema.org/dateModified> """${instanceDateModified.value}"""^^<http://www.w3.org/2001/XMLSchema#dateTime>`,
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
                    .withCreatedBy(bestuurseenheid.id)
                    .withStatus(InstanceStatusType.VERSTUURD)
                    .withSpatials(
                        [
                            buildSpatialRefNis2019Iri(45700),
                            buildSpatialRefNis2019Iri(52000),
                            buildSpatialRefNis2019Iri(98786)]
                    )
                    .build();


            await directDatabaseAccess.insertData(
                `${bestuurseenheid.userGraph()}`,
                [
                    `<${instanceId}> a <https://productencatalogus.data.vlaanderen.be/ns/ipdc-lpdc#InstancePublicService>`,
                    `<${instanceId}> <http://purl.org/pav/createdBy> <${bestuurseenheid.id.value}>`,
                    `<${instanceId}> <http://mu.semte.ch/vocabularies/core/uuid> """${instanceUUID}"""`,
                    `<${instanceId}> <http://purl.org/dc/terms/title> """${InstanceTestBuilder.TITLE_EN}"""@EN`,
                    `<${instanceId}> <http://purl.org/dc/terms/title> """${InstanceTestBuilder.TITLE_NL_FORMAL}"""@nl-BE-x-formal`,
                    `<${instanceId}> <http://purl.org/dc/terms/description> """${InstanceTestBuilder.DESCRIPTION_EN}"""@EN`,
                    `<${instanceId}> <http://purl.org/dc/terms/description> """${InstanceTestBuilder.DESCRIPTION_NL_FORMAL}"""@nl-BE-x-formal`,
                    `<${instanceId}> <https://productencatalogus.data.vlaanderen.be/ns/ipdc-lpdc#additionalDescription> """${InstanceTestBuilder.ADDITIONAL_DESCRIPTION_EN}"""@en`,
                    `<${instanceId}> <https://productencatalogus.data.vlaanderen.be/ns/ipdc-lpdc#additionalDescription> """${InstanceTestBuilder.ADDITIONAL_DESCRIPTION_NL_FORMAL}"""@nl-BE-x-formal`,
                    `<${instanceId}> <https://productencatalogus.data.vlaanderen.be/ns/ipdc-lpdc#exception> """${InstanceTestBuilder.EXCEPTION_EN}"""@en`,
                    `<${instanceId}> <https://productencatalogus.data.vlaanderen.be/ns/ipdc-lpdc#exception> """${InstanceTestBuilder.EXCEPTION_NL_FORMAL}"""@nl-BE-x-formal`,
                    `<${instanceId}> <https://productencatalogus.data.vlaanderen.be/ns/ipdc-lpdc#regulation> """${InstanceTestBuilder.REGULATION_EN}"""@en`,
                    `<${instanceId}> <https://productencatalogus.data.vlaanderen.be/ns/ipdc-lpdc#regulation> """${InstanceTestBuilder.REGULATION_NL_FORMAL}"""@nl-BE-x-formal`,
                    `<${instanceId}> <http://schema.org/startDate> """${InstanceTestBuilder.START_DATE.value}"""^^<http://www.w3.org/2001/XMLSchema#dateTime>`,
                    `<${instanceId}> <http://schema.org/endDate> """${InstanceTestBuilder.END_DATE.value}"""^^<http://www.w3.org/2001/XMLSchema#dateTime>`,
                    `<${instanceId}> <http://purl.org/dc/terms/type> <${NS.dvc.type(InstanceTestBuilder.TYPE).value}>`,
                    `<${instanceId}> <https://productencatalogus.data.vlaanderen.be/ns/ipdc-lpdc#targetAudience> <${NS.dvc.doelgroep(InstanceTestBuilder.TARGET_AUDIENCES[0]).value}>`,
                    `<${instanceId}> <https://productencatalogus.data.vlaanderen.be/ns/ipdc-lpdc#targetAudience> <${NS.dvc.doelgroep(InstanceTestBuilder.TARGET_AUDIENCES[1]).value}>`,
                    `<${instanceId}> <https://productencatalogus.data.vlaanderen.be/ns/ipdc-lpdc#targetAudience> <${NS.dvc.doelgroep(InstanceTestBuilder.TARGET_AUDIENCES[2]).value}>`,
                    `<${instanceId}> <http://data.europa.eu/m8g/thematicArea> <${NS.dvc.thema(InstanceTestBuilder.THEMES[0]).value}>`,
                    `<${instanceId}> <http://data.europa.eu/m8g/thematicArea> <${NS.dvc.thema(InstanceTestBuilder.THEMES[1]).value}>`,
                    `<${instanceId}> <http://data.europa.eu/m8g/thematicArea> <${NS.dvc.thema(InstanceTestBuilder.THEMES[2]).value}>`,
                    `<${instanceId}> <https://productencatalogus.data.vlaanderen.be/ns/ipdc-lpdc#competentAuthorityLevel> <${NS.dvc.bevoegdBestuursniveau(InstanceTestBuilder.COMPETENT_AUTHORITY_LEVELS[0]).value}>`,
                    `<${instanceId}> <https://productencatalogus.data.vlaanderen.be/ns/ipdc-lpdc#competentAuthorityLevel> <${NS.dvc.bevoegdBestuursniveau(InstanceTestBuilder.COMPETENT_AUTHORITY_LEVELS[1]).value}>`,
                    `<${instanceId}> <https://productencatalogus.data.vlaanderen.be/ns/ipdc-lpdc#competentAuthorityLevel> <${NS.dvc.bevoegdBestuursniveau(InstanceTestBuilder.COMPETENT_AUTHORITY_LEVELS[2]).value}>`,
                    `<${instanceId}> <http://data.europa.eu/m8g/hasCompetentAuthority> <${InstanceTestBuilder.COMPETENT_AUTHORITIES[0]}>`,
                    `<${instanceId}> <http://data.europa.eu/m8g/hasCompetentAuthority> <${InstanceTestBuilder.COMPETENT_AUTHORITIES[1]}>`,
                    `<${instanceId}> <http://data.europa.eu/m8g/hasCompetentAuthority> <${InstanceTestBuilder.COMPETENT_AUTHORITIES[2]}>`,
                    `<${instanceId}> <https://productencatalogus.data.vlaanderen.be/ns/ipdc-lpdc#executingAuthorityLevel> <${NS.dvc.uitvoerendBestuursniveau(InstanceTestBuilder.EXECUTING_AUTHORITY_LEVELS[0]).value}>`,
                    `<${instanceId}> <https://productencatalogus.data.vlaanderen.be/ns/ipdc-lpdc#executingAuthorityLevel> <${NS.dvc.uitvoerendBestuursniveau(InstanceTestBuilder.EXECUTING_AUTHORITY_LEVELS[1]).value}>`,
                    `<${instanceId}> <https://productencatalogus.data.vlaanderen.be/ns/ipdc-lpdc#executingAuthorityLevel> <${NS.dvc.uitvoerendBestuursniveau(InstanceTestBuilder.EXECUTING_AUTHORITY_LEVELS[2]).value}>`,
                    `<${instanceId}> <https://productencatalogus.data.vlaanderen.be/ns/ipdc-lpdc#hasExecutingAuthority> <${InstanceTestBuilder.EXECUTING_AUTHORITIES[0]}>`,
                    `<${instanceId}> <https://productencatalogus.data.vlaanderen.be/ns/ipdc-lpdc#hasExecutingAuthority> <${InstanceTestBuilder.EXECUTING_AUTHORITIES[1]}>`,
                    `<${instanceId}> <https://productencatalogus.data.vlaanderen.be/ns/ipdc-lpdc#publicationMedium> <${NS.dvc.publicatieKanaal(InstanceTestBuilder.PUBLICATION_MEDIA[0]).value}>`,
                    `<${instanceId}> <https://productencatalogus.data.vlaanderen.be/ns/ipdc-lpdc#publicationMedium> <${NS.dvc.publicatieKanaal(InstanceTestBuilder.PUBLICATION_MEDIA[1]).value}>`,
                    `<${instanceId}> <https://productencatalogus.data.vlaanderen.be/ns/ipdc-lpdc#yourEuropeCategory> <${NS.dvc.yourEuropeCategorie(InstanceTestBuilder.YOUR_EUROPE_CATEGORIES[0]).value}>`,
                    `<${instanceId}> <https://productencatalogus.data.vlaanderen.be/ns/ipdc-lpdc#yourEuropeCategory> <${NS.dvc.yourEuropeCategorie(InstanceTestBuilder.YOUR_EUROPE_CATEGORIES[1]).value}>`,
                    `<${instanceId}> <https://productencatalogus.data.vlaanderen.be/ns/ipdc-lpdc#yourEuropeCategory> <${NS.dvc.yourEuropeCategorie(InstanceTestBuilder.YOUR_EUROPE_CATEGORIES[2]).value}>`,
                    `<${instanceId}> <http://www.w3.org/ns/dcat#keyword> """${InstanceTestBuilder.KEYWORDS[0].en}"""@en`,
                    `<${instanceId}> <http://www.w3.org/ns/dcat#keyword> """${InstanceTestBuilder.KEYWORDS[1].nl}"""@nl`,
                    `<${instanceId}> <http://www.w3.org/ns/dcat#keyword> """${InstanceTestBuilder.KEYWORDS[2].nl}"""@nl`,
                    `<${instanceId}> <http://www.w3.org/ns/dcat#keyword> """${InstanceTestBuilder.KEYWORDS[3].en}"""@en`,

                    `<${instanceId}> <http://vocab.belgif.be/ns/publicservice#hasRequirement> <${InstanceTestBuilder.REQUIREMENTS[1].id}>`,
                    `<${InstanceTestBuilder.REQUIREMENTS[1].id}> a <http://data.europa.eu/m8g/Requirement>`,
                    `<${InstanceTestBuilder.REQUIREMENTS[1].id}> <http://mu.semte.ch/vocabularies/core/uuid> """${InstanceTestBuilder.REQUIREMENTS[1].uuid}"""`,
                    `<${InstanceTestBuilder.REQUIREMENTS[1].id}> <http://purl.org/dc/terms/title> """${InstanceTestBuilder.REQUIREMENTS[1].title.en}"""@EN`,
                    `<${InstanceTestBuilder.REQUIREMENTS[1].id}> <http://purl.org/dc/terms/title> """${InstanceTestBuilder.REQUIREMENTS[1].title.nlFormal}"""@nl-BE-x-formal`,
                    `<${InstanceTestBuilder.REQUIREMENTS[1].id}> <http://purl.org/dc/terms/description> """${InstanceTestBuilder.REQUIREMENTS[1].description.en}"""@EN`,
                    `<${InstanceTestBuilder.REQUIREMENTS[1].id}> <http://purl.org/dc/terms/description> """${InstanceTestBuilder.REQUIREMENTS[1].description.nlFormal}"""@nl-BE-x-formal`,
                    `<${InstanceTestBuilder.REQUIREMENTS[1].id}> <http://www.w3.org/ns/shacl#order> """2"""^^<http://www.w3.org/2001/XMLSchema#integer>`,
                    `<${InstanceTestBuilder.REQUIREMENTS[1].id}> <http://data.europa.eu/m8g/hasSupportingEvidence> <${InstanceTestBuilder.REQUIREMENTS[1].evidence.id}>`,
                    `<${InstanceTestBuilder.REQUIREMENTS[1].evidence.id}> a <http://data.europa.eu/m8g/Evidence>`,
                    `<${InstanceTestBuilder.REQUIREMENTS[1].evidence.id}> <http://mu.semte.ch/vocabularies/core/uuid> """${InstanceTestBuilder.REQUIREMENTS[1].evidence.uuid}"""`,
                    `<${InstanceTestBuilder.REQUIREMENTS[1].evidence.id}> <http://purl.org/dc/terms/title> """${InstanceTestBuilder.REQUIREMENTS[1].evidence.title.en}"""@EN`,
                    `<${InstanceTestBuilder.REQUIREMENTS[1].evidence.id}> <http://purl.org/dc/terms/title> """${InstanceTestBuilder.REQUIREMENTS[1].evidence.title.nlFormal}"""@nl-BE-x-formal`,
                    `<${InstanceTestBuilder.REQUIREMENTS[1].evidence.id}> <http://purl.org/dc/terms/description> """${InstanceTestBuilder.REQUIREMENTS[1].evidence.description.en}"""@EN`,
                    `<${InstanceTestBuilder.REQUIREMENTS[1].evidence.id}> <http://purl.org/dc/terms/description> """${InstanceTestBuilder.REQUIREMENTS[1].evidence.description.nlFormal}"""@nl-BE-x-formal`,
                    `<${instanceId}> <http://vocab.belgif.be/ns/publicservice#hasRequirement> <${InstanceTestBuilder.REQUIREMENTS[0].id}>`,
                    `<${InstanceTestBuilder.REQUIREMENTS[0].id}> a <http://data.europa.eu/m8g/Requirement>`,
                    `<${InstanceTestBuilder.REQUIREMENTS[0].id}> <http://mu.semte.ch/vocabularies/core/uuid> """${InstanceTestBuilder.REQUIREMENTS[0].uuid}"""`,
                    `<${InstanceTestBuilder.REQUIREMENTS[0].id}> <http://purl.org/dc/terms/title> """${InstanceTestBuilder.REQUIREMENTS[0].title.en}"""@EN`,
                    `<${InstanceTestBuilder.REQUIREMENTS[0].id}> <http://purl.org/dc/terms/title> """${InstanceTestBuilder.REQUIREMENTS[0].title.nlFormal}"""@nl-BE-x-formal`,
                    `<${InstanceTestBuilder.REQUIREMENTS[0].id}> <http://purl.org/dc/terms/description> """${InstanceTestBuilder.REQUIREMENTS[0].description.en}"""@EN`,
                    `<${InstanceTestBuilder.REQUIREMENTS[0].id}> <http://purl.org/dc/terms/description> """${InstanceTestBuilder.REQUIREMENTS[0].description.nlFormal}"""@nl-BE-x-formal`,
                    `<${InstanceTestBuilder.REQUIREMENTS[0].id}> <http://www.w3.org/ns/shacl#order> """1"""^^<http://www.w3.org/2001/XMLSchema#integer>`,
                    `<${InstanceTestBuilder.REQUIREMENTS[0].id}> <http://data.europa.eu/m8g/hasSupportingEvidence> <${InstanceTestBuilder.REQUIREMENTS[0].evidence.id}>`,
                    `<${InstanceTestBuilder.REQUIREMENTS[0].evidence.id}> a <http://data.europa.eu/m8g/Evidence>`,
                    `<${InstanceTestBuilder.REQUIREMENTS[0].evidence.id}> <http://mu.semte.ch/vocabularies/core/uuid> """${InstanceTestBuilder.REQUIREMENTS[0].evidence.uuid}"""`,
                    `<${InstanceTestBuilder.REQUIREMENTS[0].evidence.id}> <http://purl.org/dc/terms/title> """${InstanceTestBuilder.REQUIREMENTS[0].evidence.title.en}"""@EN`,
                    `<${InstanceTestBuilder.REQUIREMENTS[0].evidence.id}> <http://purl.org/dc/terms/title> """${InstanceTestBuilder.REQUIREMENTS[0].evidence.title.nlFormal}"""@nl-BE-x-formal`,
                    `<${InstanceTestBuilder.REQUIREMENTS[0].evidence.id}> <http://purl.org/dc/terms/description> """${InstanceTestBuilder.REQUIREMENTS[0].evidence.description.en}"""@EN`,
                    `<${InstanceTestBuilder.REQUIREMENTS[0].evidence.id}> <http://purl.org/dc/terms/description> """${InstanceTestBuilder.REQUIREMENTS[0].evidence.description.nlFormal}"""@nl-BE-x-formal`,

                    `<${instanceId}> <http://purl.org/vocab/cpsv#follows> <${InstanceTestBuilder.PROCEDURES[1].id}>`,
                    `<${InstanceTestBuilder.PROCEDURES[1].id}> a <http://purl.org/vocab/cpsv#Rule>`,
                    `<${InstanceTestBuilder.PROCEDURES[1].id}> <http://mu.semte.ch/vocabularies/core/uuid> """${InstanceTestBuilder.PROCEDURES[1].uuid}"""`,
                    `<${InstanceTestBuilder.PROCEDURES[1].id}> <http://purl.org/dc/terms/title> """${InstanceTestBuilder.PROCEDURES[1].title.en}"""@EN`,
                    `<${InstanceTestBuilder.PROCEDURES[1].id}> <http://purl.org/dc/terms/title> """${InstanceTestBuilder.PROCEDURES[1].title.nlFormal}"""@nl-BE-x-formal`,
                    `<${InstanceTestBuilder.PROCEDURES[1].id}> <http://purl.org/dc/terms/description> """${InstanceTestBuilder.PROCEDURES[1].description.en}"""@EN`,
                    `<${InstanceTestBuilder.PROCEDURES[1].id}> <http://purl.org/dc/terms/description> """${InstanceTestBuilder.PROCEDURES[1].description.nlFormal}"""@nl-BE-x-formal`,
                    `<${InstanceTestBuilder.PROCEDURES[1].id}> <http://www.w3.org/ns/shacl#order> """2"""^^<http://www.w3.org/2001/XMLSchema#integer>`,
                    `<${InstanceTestBuilder.PROCEDURES[1].id}> <https://productencatalogus.data.vlaanderen.be/ns/ipdc-lpdc#hasWebsite> <${InstanceTestBuilder.PROCEDURES[1].websites[1].id}>`,
                    `<${InstanceTestBuilder.PROCEDURES[1].websites[1].id}> a <http://schema.org/WebSite>`,
                    `<${InstanceTestBuilder.PROCEDURES[1].websites[1].id}> <http://mu.semte.ch/vocabularies/core/uuid> """${InstanceTestBuilder.PROCEDURES[1].websites[1].uuid}"""`,
                    `<${InstanceTestBuilder.PROCEDURES[1].websites[1].id}> <http://purl.org/dc/terms/title> """${InstanceTestBuilder.PROCEDURES[1].websites[1].title.en}"""@EN`,
                    `<${InstanceTestBuilder.PROCEDURES[1].websites[1].id}> <http://purl.org/dc/terms/title> """${InstanceTestBuilder.PROCEDURES[1].websites[1].title.nlFormal}"""@nl-BE-x-formal`,
                    `<${InstanceTestBuilder.PROCEDURES[1].websites[1].id}> <http://purl.org/dc/terms/description> """${InstanceTestBuilder.PROCEDURES[1].websites[1].description.en}"""@EN`,
                    `<${InstanceTestBuilder.PROCEDURES[1].websites[1].id}> <http://purl.org/dc/terms/description> """${InstanceTestBuilder.PROCEDURES[1].websites[1].description.nlFormal}"""@nl-BE-x-formal`,
                    `<${InstanceTestBuilder.PROCEDURES[1].websites[1].id}> <http://schema.org/url> """${InstanceTestBuilder.PROCEDURES[1].websites[1].url}"""`,
                    `<${InstanceTestBuilder.PROCEDURES[1].websites[1].id}> <http://www.w3.org/ns/shacl#order> """2"""^^<http://www.w3.org/2001/XMLSchema#integer>`,
                    `<${InstanceTestBuilder.PROCEDURES[1].id}> <https://productencatalogus.data.vlaanderen.be/ns/ipdc-lpdc#hasWebsite> <${InstanceTestBuilder.PROCEDURES[1].websites[0].id}>`,
                    `<${InstanceTestBuilder.PROCEDURES[1].websites[0].id}> a <http://schema.org/WebSite>`,
                    `<${InstanceTestBuilder.PROCEDURES[1].websites[0].id}> <http://mu.semte.ch/vocabularies/core/uuid> """${InstanceTestBuilder.PROCEDURES[1].websites[0].uuid}"""`,
                    `<${InstanceTestBuilder.PROCEDURES[1].websites[0].id}> <http://purl.org/dc/terms/title> """${InstanceTestBuilder.PROCEDURES[1].websites[0].title.en}"""@EN`,
                    `<${InstanceTestBuilder.PROCEDURES[1].websites[0].id}> <http://purl.org/dc/terms/title> """${InstanceTestBuilder.PROCEDURES[1].websites[0].title.nlFormal}"""@nl-BE-x-formal`,
                    `<${InstanceTestBuilder.PROCEDURES[1].websites[0].id}> <http://purl.org/dc/terms/description> """${InstanceTestBuilder.PROCEDURES[1].websites[0].description.en}"""@EN`,
                    `<${InstanceTestBuilder.PROCEDURES[1].websites[0].id}> <http://purl.org/dc/terms/description> """${InstanceTestBuilder.PROCEDURES[1].websites[0].description.nlFormal}"""@nl-BE-x-formal`,
                    `<${InstanceTestBuilder.PROCEDURES[1].websites[0].id}> <http://schema.org/url> """${InstanceTestBuilder.PROCEDURES[1].websites[0].url}"""`,
                    `<${InstanceTestBuilder.PROCEDURES[1].websites[0].id}> <http://www.w3.org/ns/shacl#order> """1"""^^<http://www.w3.org/2001/XMLSchema#integer>`,
                    `<${instanceId}> <http://purl.org/vocab/cpsv#follows> <${InstanceTestBuilder.PROCEDURES[0].id}>`,
                    `<${InstanceTestBuilder.PROCEDURES[0].id}> a <http://purl.org/vocab/cpsv#Rule>`,
                    `<${InstanceTestBuilder.PROCEDURES[0].id}> <http://mu.semte.ch/vocabularies/core/uuid> """${InstanceTestBuilder.PROCEDURES[0].uuid}"""`,
                    `<${InstanceTestBuilder.PROCEDURES[0].id}> <http://purl.org/dc/terms/title> """${InstanceTestBuilder.PROCEDURES[0].title.en}"""@EN`,
                    `<${InstanceTestBuilder.PROCEDURES[0].id}> <http://purl.org/dc/terms/title> """${InstanceTestBuilder.PROCEDURES[0].title.nlFormal}"""@nl-BE-x-formal`,
                    `<${InstanceTestBuilder.PROCEDURES[0].id}> <http://purl.org/dc/terms/description> """${InstanceTestBuilder.PROCEDURES[0].description.en}"""@EN`,
                    `<${InstanceTestBuilder.PROCEDURES[0].id}> <http://purl.org/dc/terms/description> """${InstanceTestBuilder.PROCEDURES[0].description.nlFormal}"""@nl-BE-x-formal`,
                    `<${InstanceTestBuilder.PROCEDURES[0].id}> <http://www.w3.org/ns/shacl#order> """1"""^^<http://www.w3.org/2001/XMLSchema#integer>`,
                    `<${InstanceTestBuilder.PROCEDURES[0].id}> <https://productencatalogus.data.vlaanderen.be/ns/ipdc-lpdc#hasWebsite> <${InstanceTestBuilder.PROCEDURES[0].websites[1].id}>`,
                    `<${InstanceTestBuilder.PROCEDURES[0].websites[1].id}> a <http://schema.org/WebSite>`,
                    `<${InstanceTestBuilder.PROCEDURES[0].websites[1].id}> <http://mu.semte.ch/vocabularies/core/uuid> """${InstanceTestBuilder.PROCEDURES[0].websites[1].uuid}"""`,
                    `<${InstanceTestBuilder.PROCEDURES[0].websites[1].id}> <http://purl.org/dc/terms/title> """${InstanceTestBuilder.PROCEDURES[0].websites[1].title.en}"""@EN`,
                    `<${InstanceTestBuilder.PROCEDURES[0].websites[1].id}> <http://purl.org/dc/terms/title> """${InstanceTestBuilder.PROCEDURES[0].websites[1].title.nlFormal}"""@nl-BE-x-formal`,
                    `<${InstanceTestBuilder.PROCEDURES[0].websites[1].id}> <http://purl.org/dc/terms/description> """${InstanceTestBuilder.PROCEDURES[0].websites[1].description.en}"""@EN`,
                    `<${InstanceTestBuilder.PROCEDURES[0].websites[1].id}> <http://purl.org/dc/terms/description> """${InstanceTestBuilder.PROCEDURES[0].websites[1].description.nlFormal}"""@nl-BE-x-formal`,
                    `<${InstanceTestBuilder.PROCEDURES[0].websites[1].id}> <http://schema.org/url> """${InstanceTestBuilder.PROCEDURES[0].websites[1].url}"""`,
                    `<${InstanceTestBuilder.PROCEDURES[0].websites[1].id}> <http://www.w3.org/ns/shacl#order> """2"""^^<http://www.w3.org/2001/XMLSchema#integer>`,
                    `<${InstanceTestBuilder.PROCEDURES[0].id}> <https://productencatalogus.data.vlaanderen.be/ns/ipdc-lpdc#hasWebsite> <${InstanceTestBuilder.PROCEDURES[0].websites[0].id}>`,
                    `<${InstanceTestBuilder.PROCEDURES[0].websites[0].id}> a <http://schema.org/WebSite>`,
                    `<${InstanceTestBuilder.PROCEDURES[0].websites[0].id}> <http://mu.semte.ch/vocabularies/core/uuid> """${InstanceTestBuilder.PROCEDURES[0].websites[0].uuid}"""`,
                    `<${InstanceTestBuilder.PROCEDURES[0].websites[0].id}> <http://purl.org/dc/terms/title> """${InstanceTestBuilder.PROCEDURES[0].websites[0].title.en}"""@EN`,
                    `<${InstanceTestBuilder.PROCEDURES[0].websites[0].id}> <http://purl.org/dc/terms/title> """${InstanceTestBuilder.PROCEDURES[0].websites[0].title.nlFormal}"""@nl-BE-x-formal`,
                    `<${InstanceTestBuilder.PROCEDURES[0].websites[0].id}> <http://purl.org/dc/terms/description> """${InstanceTestBuilder.PROCEDURES[0].websites[0].description.en}"""@EN`,
                    `<${InstanceTestBuilder.PROCEDURES[0].websites[0].id}> <http://purl.org/dc/terms/description> """${InstanceTestBuilder.PROCEDURES[0].websites[0].description.nlFormal}"""@nl-BE-x-formal`,
                    `<${InstanceTestBuilder.PROCEDURES[0].websites[0].id}> <http://schema.org/url> """${InstanceTestBuilder.PROCEDURES[0].websites[0].url}"""`,
                    `<${InstanceTestBuilder.PROCEDURES[0].websites[0].id}> <http://www.w3.org/ns/shacl#order> """1"""^^<http://www.w3.org/2001/XMLSchema#integer>`,

                    `<${instanceId}> <http://www.w3.org/2000/01/rdf-schema#seeAlso> <${InstanceTestBuilder.WEBSITES[1].id}>`,
                    `<${InstanceTestBuilder.WEBSITES[1].id}> a <http://schema.org/WebSite>`,
                    `<${InstanceTestBuilder.WEBSITES[1].id}> <http://mu.semte.ch/vocabularies/core/uuid> """${InstanceTestBuilder.WEBSITES[1].uuid}"""`,
                    `<${InstanceTestBuilder.WEBSITES[1].id}> <http://purl.org/dc/terms/title> """${InstanceTestBuilder.WEBSITES[1].title.en}"""@EN`,
                    `<${InstanceTestBuilder.WEBSITES[1].id}> <http://purl.org/dc/terms/title> """${InstanceTestBuilder.WEBSITES[1].title.nlFormal}"""@nl-BE-x-formal`,
                    `<${InstanceTestBuilder.WEBSITES[1].id}> <http://purl.org/dc/terms/description> """${InstanceTestBuilder.WEBSITES[1].description.en}"""@EN`,
                    `<${InstanceTestBuilder.WEBSITES[1].id}> <http://purl.org/dc/terms/description> """${InstanceTestBuilder.WEBSITES[1].description.nlFormal}"""@nl-BE-x-formal`,
                    `<${InstanceTestBuilder.WEBSITES[1].id}> <http://schema.org/url> """${InstanceTestBuilder.WEBSITES[1].url}"""`,
                    `<${InstanceTestBuilder.WEBSITES[1].id}> <http://www.w3.org/ns/shacl#order> """2"""^^<http://www.w3.org/2001/XMLSchema#integer>`,
                    `<${instanceId}> <http://www.w3.org/2000/01/rdf-schema#seeAlso> <${InstanceTestBuilder.WEBSITES[0].id}>`,
                    `<${InstanceTestBuilder.WEBSITES[0].id}> a <http://schema.org/WebSite>`,
                    `<${InstanceTestBuilder.WEBSITES[0].id}> <http://mu.semte.ch/vocabularies/core/uuid> """${InstanceTestBuilder.WEBSITES[0].uuid}"""`,
                    `<${InstanceTestBuilder.WEBSITES[0].id}> <http://purl.org/dc/terms/title> """${InstanceTestBuilder.WEBSITES[0].title.en}"""@EN`,
                    `<${InstanceTestBuilder.WEBSITES[0].id}> <http://purl.org/dc/terms/title> """${InstanceTestBuilder.WEBSITES[0].title.nlFormal}"""@nl-BE-x-formal`,
                    `<${InstanceTestBuilder.WEBSITES[0].id}> <http://purl.org/dc/terms/description> """${InstanceTestBuilder.WEBSITES[0].description.en}"""@EN`,
                    `<${InstanceTestBuilder.WEBSITES[0].id}> <http://purl.org/dc/terms/description> """${InstanceTestBuilder.WEBSITES[0].description.nlFormal}"""@nl-BE-x-formal`,
                    `<${InstanceTestBuilder.WEBSITES[0].id}> <http://schema.org/url> """${InstanceTestBuilder.WEBSITES[0].url}"""`,
                    `<${InstanceTestBuilder.WEBSITES[0].id}> <http://www.w3.org/ns/shacl#order> """1"""^^<http://www.w3.org/2001/XMLSchema#integer>`,

                    `<${instanceId}> <http://data.europa.eu/m8g/hasCost> <${InstanceTestBuilder.COSTS[1].id}>`,
                    `<${InstanceTestBuilder.COSTS[1].id}> a <http://data.europa.eu/m8g/Cost>`,
                    `<${InstanceTestBuilder.COSTS[1].id}> <http://mu.semte.ch/vocabularies/core/uuid> """${InstanceTestBuilder.COSTS[1].uuid}"""`,
                    `<${InstanceTestBuilder.COSTS[1].id}> <http://purl.org/dc/terms/title> """${InstanceTestBuilder.COSTS[1].title.en}"""@EN`,
                    `<${InstanceTestBuilder.COSTS[1].id}> <http://purl.org/dc/terms/title> """${InstanceTestBuilder.COSTS[1].title.nlFormal}"""@nl-BE-x-formal`,
                    `<${InstanceTestBuilder.COSTS[1].id}> <http://purl.org/dc/terms/description> """${InstanceTestBuilder.COSTS[1].description.en}"""@EN`,
                    `<${InstanceTestBuilder.COSTS[1].id}> <http://purl.org/dc/terms/description> """${InstanceTestBuilder.COSTS[1].description.nlFormal}"""@nl-BE-x-formal`,
                    `<${InstanceTestBuilder.COSTS[1].id}> <http://www.w3.org/ns/shacl#order> """2"""^^<http://www.w3.org/2001/XMLSchema#integer>`,
                    `<${instanceId}> <http://data.europa.eu/m8g/hasCost> <${InstanceTestBuilder.COSTS[0].id}>`,
                    `<${InstanceTestBuilder.COSTS[0].id}> a <http://data.europa.eu/m8g/Cost>`,
                    `<${InstanceTestBuilder.COSTS[0].id}> <http://mu.semte.ch/vocabularies/core/uuid> """${InstanceTestBuilder.COSTS[0].uuid}"""`,
                    `<${InstanceTestBuilder.COSTS[0].id}> <http://purl.org/dc/terms/title> """${InstanceTestBuilder.COSTS[0].title.en}"""@EN`,
                    `<${InstanceTestBuilder.COSTS[0].id}> <http://purl.org/dc/terms/title> """${InstanceTestBuilder.COSTS[0].title.nlFormal}"""@nl-BE-x-formal`,
                    `<${InstanceTestBuilder.COSTS[0].id}> <http://purl.org/dc/terms/description> """${InstanceTestBuilder.COSTS[0].description.en}"""@EN`,
                    `<${InstanceTestBuilder.COSTS[0].id}> <http://purl.org/dc/terms/description> """${InstanceTestBuilder.COSTS[0].description.nlFormal}"""@nl-BE-x-formal`,
                    `<${InstanceTestBuilder.COSTS[0].id}> <http://www.w3.org/ns/shacl#order> """1"""^^<http://www.w3.org/2001/XMLSchema#integer>`,

                    `<${instanceId}> <http://purl.org/vocab/cpsv#produces> <${InstanceTestBuilder.FINANCIAL_ADVANTAGES[1].id}>`,
                    `<${InstanceTestBuilder.FINANCIAL_ADVANTAGES[1].id}> a <https://productencatalogus.data.vlaanderen.be/ns/ipdc-lpdc#FinancialAdvantage>`,
                    `<${InstanceTestBuilder.FINANCIAL_ADVANTAGES[1].id}> <http://mu.semte.ch/vocabularies/core/uuid> """${InstanceTestBuilder.FINANCIAL_ADVANTAGES[1].uuid}"""`,
                    `<${InstanceTestBuilder.FINANCIAL_ADVANTAGES[1].id}> <http://purl.org/dc/terms/title> """${InstanceTestBuilder.FINANCIAL_ADVANTAGES[1].title.en}"""@EN`,
                    `<${InstanceTestBuilder.FINANCIAL_ADVANTAGES[1].id}> <http://purl.org/dc/terms/title> """${InstanceTestBuilder.FINANCIAL_ADVANTAGES[1].title.nlFormal}"""@nl-BE-x-formal`,
                    `<${InstanceTestBuilder.FINANCIAL_ADVANTAGES[1].id}> <http://purl.org/dc/terms/description> """${InstanceTestBuilder.FINANCIAL_ADVANTAGES[1].description.en}"""@EN`,
                    `<${InstanceTestBuilder.FINANCIAL_ADVANTAGES[1].id}> <http://purl.org/dc/terms/description> """${InstanceTestBuilder.FINANCIAL_ADVANTAGES[1].description.nlFormal}"""@nl-BE-x-formal`,
                    `<${InstanceTestBuilder.FINANCIAL_ADVANTAGES[1].id}> <http://www.w3.org/ns/shacl#order> """2"""^^<http://www.w3.org/2001/XMLSchema#integer>`,
                    `<${instanceId}> <http://purl.org/vocab/cpsv#produces> <${InstanceTestBuilder.FINANCIAL_ADVANTAGES[0].id}>`,
                    `<${InstanceTestBuilder.FINANCIAL_ADVANTAGES[0].id}> a <https://productencatalogus.data.vlaanderen.be/ns/ipdc-lpdc#FinancialAdvantage>`,
                    `<${InstanceTestBuilder.FINANCIAL_ADVANTAGES[0].id}> <http://mu.semte.ch/vocabularies/core/uuid> """${InstanceTestBuilder.FINANCIAL_ADVANTAGES[0].uuid}"""`,
                    `<${InstanceTestBuilder.FINANCIAL_ADVANTAGES[0].id}> <http://purl.org/dc/terms/title> """${InstanceTestBuilder.FINANCIAL_ADVANTAGES[0].title.en}"""@EN`,
                    `<${InstanceTestBuilder.FINANCIAL_ADVANTAGES[0].id}> <http://purl.org/dc/terms/title> """${InstanceTestBuilder.FINANCIAL_ADVANTAGES[0].title.nlFormal}"""@nl-BE-x-formal`,
                    `<${InstanceTestBuilder.FINANCIAL_ADVANTAGES[0].id}> <http://purl.org/dc/terms/description> """${InstanceTestBuilder.FINANCIAL_ADVANTAGES[0].description.en}"""@EN`,
                    `<${InstanceTestBuilder.FINANCIAL_ADVANTAGES[0].id}> <http://purl.org/dc/terms/description> """${InstanceTestBuilder.FINANCIAL_ADVANTAGES[0].description.nlFormal}"""@nl-BE-x-formal`,
                    `<${InstanceTestBuilder.FINANCIAL_ADVANTAGES[0].id}> <http://www.w3.org/ns/shacl#order> """1"""^^<http://www.w3.org/2001/XMLSchema#integer>`,

                    `<${instanceId}> <http://data.europa.eu/m8g/hasContactPoint> <${InstanceTestBuilder.CONTACT_POINTS[1].id}>`,
                    `<${InstanceTestBuilder.CONTACT_POINTS[1].id}> a <http://schema.org/ContactPoint>`,
                    `<${InstanceTestBuilder.CONTACT_POINTS[1].id}> <http://mu.semte.ch/vocabularies/core/uuid> """${InstanceTestBuilder.CONTACT_POINTS[1].uuid}"""`,
                    `<${InstanceTestBuilder.CONTACT_POINTS[1].id}> <http://schema.org/url> """${InstanceTestBuilder.CONTACT_POINTS[1].url}"""`,
                    `<${InstanceTestBuilder.CONTACT_POINTS[1].id}> <http://schema.org/email> """${InstanceTestBuilder.CONTACT_POINTS[1].email}"""`,
                    `<${InstanceTestBuilder.CONTACT_POINTS[1].id}> <http://schema.org/telephone> """${InstanceTestBuilder.CONTACT_POINTS[1].telephone}"""`,
                    `<${InstanceTestBuilder.CONTACT_POINTS[1].id}> <http://schema.org/openingHours> """${InstanceTestBuilder.CONTACT_POINTS[1].openingHours}"""`,
                    `<${InstanceTestBuilder.CONTACT_POINTS[1].id}> <https://productencatalogus.data.vlaanderen.be/ns/ipdc-lpdc#address> <${InstanceTestBuilder.CONTACT_POINTS[1].address.id}>`,
                    `<${InstanceTestBuilder.CONTACT_POINTS[1].id}> <http://www.w3.org/ns/shacl#order> """2"""^^<http://www.w3.org/2001/XMLSchema#integer>`,
                    `<${InstanceTestBuilder.CONTACT_POINTS[1].address.id}> a <http://www.w3.org/ns/locn#Address>`,
                    `<${InstanceTestBuilder.CONTACT_POINTS[1].address.id}> <http://mu.semte.ch/vocabularies/core/uuid> """${InstanceTestBuilder.CONTACT_POINTS[1].address.uuid}"""`,
                    `<${InstanceTestBuilder.CONTACT_POINTS[1].address.id}> <https://data.vlaanderen.be/ns/adres#gemeentenaam> """${AddressTestBuilder.ANOTHER_GEMEENTENAAM}"""@NL`,
                    `<${InstanceTestBuilder.CONTACT_POINTS[1].address.id}> <https://data.vlaanderen.be/ns/adres#land> """${AddressTestBuilder.LAND_NL}"""@NL`,
                    `<${InstanceTestBuilder.CONTACT_POINTS[1].address.id}> <https://data.vlaanderen.be/ns/adres#Adresvoorstelling.huisnummer> """${AddressTestBuilder.ANOTHER_HUISNUMMER}"""`,
                    `<${InstanceTestBuilder.CONTACT_POINTS[1].address.id}> <https://data.vlaanderen.be/ns/adres#postcode> """${AddressTestBuilder.ANOTHER_POSTCODE}"""`,
                    `<${InstanceTestBuilder.CONTACT_POINTS[1].address.id}> <https://data.vlaanderen.be/ns/adres#Straatnaam> """${AddressTestBuilder.ANOTHER_STRAATNAAM}"""@NL`,
                    `<${InstanceTestBuilder.CONTACT_POINTS[1].address.id}> <https://data.vlaanderen.be/ns/adres#verwijstNaar> <${AddressTestBuilder.ANOTHER_VERWIJST_NAAR}>`,

                    `<${instanceId}> <http://data.europa.eu/m8g/hasContactPoint> <${InstanceTestBuilder.CONTACT_POINTS[0].id}>`,
                    `<${InstanceTestBuilder.CONTACT_POINTS[0].id}> a <http://schema.org/ContactPoint>`,
                    `<${InstanceTestBuilder.CONTACT_POINTS[0].id}> <http://mu.semte.ch/vocabularies/core/uuid> """${InstanceTestBuilder.CONTACT_POINTS[0].uuid}"""`,
                    `<${InstanceTestBuilder.CONTACT_POINTS[0].id}> <http://schema.org/url> """${InstanceTestBuilder.CONTACT_POINTS[0].url}"""`,
                    `<${InstanceTestBuilder.CONTACT_POINTS[0].id}> <http://schema.org/email> """${InstanceTestBuilder.CONTACT_POINTS[0].email}"""`,
                    `<${InstanceTestBuilder.CONTACT_POINTS[0].id}> <http://schema.org/telephone> """${InstanceTestBuilder.CONTACT_POINTS[0].telephone}"""`,
                    `<${InstanceTestBuilder.CONTACT_POINTS[0].id}> <http://schema.org/openingHours> """${InstanceTestBuilder.CONTACT_POINTS[0].openingHours}"""`,
                    `<${InstanceTestBuilder.CONTACT_POINTS[0].id}> <https://productencatalogus.data.vlaanderen.be/ns/ipdc-lpdc#address> <${InstanceTestBuilder.CONTACT_POINTS[0].address.id}>`,
                    `<${InstanceTestBuilder.CONTACT_POINTS[0].id}> <http://www.w3.org/ns/shacl#order> """1"""^^<http://www.w3.org/2001/XMLSchema#integer>`,
                    `<${InstanceTestBuilder.CONTACT_POINTS[0].address.id}> a <http://www.w3.org/ns/locn#Address>`,
                    `<${InstanceTestBuilder.CONTACT_POINTS[0].address.id}> <http://mu.semte.ch/vocabularies/core/uuid> """${InstanceTestBuilder.CONTACT_POINTS[0].address.uuid}"""`,
                    `<${InstanceTestBuilder.CONTACT_POINTS[0].address.id}> <https://data.vlaanderen.be/ns/adres#gemeentenaam> """${AddressTestBuilder.GEMEENTENAAM_NL}"""@NL`,
                    `<${InstanceTestBuilder.CONTACT_POINTS[0].address.id}> <https://data.vlaanderen.be/ns/adres#land> """${AddressTestBuilder.LAND_NL}"""@NL`,
                    `<${InstanceTestBuilder.CONTACT_POINTS[0].address.id}> <https://data.vlaanderen.be/ns/adres#Adresvoorstelling.huisnummer> """${AddressTestBuilder.HUISNUMMER}"""`,
                    `<${InstanceTestBuilder.CONTACT_POINTS[0].address.id}> <https://data.vlaanderen.be/ns/adres#Adresvoorstelling.busnummer> """${AddressTestBuilder.BUSNUMMER}"""`,
                    `<${InstanceTestBuilder.CONTACT_POINTS[0].address.id}> <https://data.vlaanderen.be/ns/adres#postcode> """${AddressTestBuilder.POSTCODE}"""`,
                    `<${InstanceTestBuilder.CONTACT_POINTS[0].address.id}> <https://data.vlaanderen.be/ns/adres#Straatnaam> """${AddressTestBuilder.STRAATNAAM_NL}"""@NL`,
                    `<${InstanceTestBuilder.CONTACT_POINTS[0].address.id}> <https://data.vlaanderen.be/ns/adres#verwijstNaar> <${AddressTestBuilder.VERWIJST_NAAR}>`,

                    `<${instanceId}> <http://purl.org/dc/terms/source> <${instance.conceptId.value}>`,
                    `<${instanceId}> <http://mu.semte.ch/vocabularies/ext/hasVersionedSource> <${instance.conceptSnapshotId.value}>`,
                    `<${instanceId}> <http://schema.org/productID> """${instance.productId}"""`,
                    `<${instanceId}> <http://purl.org/dc/terms/language> <http://publications.europa.eu/resource/authority/language/NLD>`,
                    `<${instanceId}> <http://purl.org/dc/terms/language> <http://publications.europa.eu/resource/authority/language/ENG>`,
                    `<${instanceId}> <http://schema.org/dateCreated> """${InstanceTestBuilder.DATE_CREATED.value}"""^^<http://www.w3.org/2001/XMLSchema#dateTime>`,
                    `<${instanceId}> <http://schema.org/dateModified> """${InstanceTestBuilder.DATE_MODIFIED.value}"""^^<http://www.w3.org/2001/XMLSchema#dateTime>`,
                    `<${instanceId}> <http://schema.org/dateSent> """${InstanceTestBuilder.DATE_SENT.value}"""^^<http://www.w3.org/2001/XMLSchema#dateTime>`,
                    `<${instanceId}> <http://schema.org/datePublished> """${InstanceTestBuilder.DATE_PUBLISHED.value}"""^^<http://www.w3.org/2001/XMLSchema#dateTime>`,
                    `<${instanceId}> <http://www.w3.org/ns/adms#status> <http://lblod.data.gift/concepts/instance-status/verstuurd>`,
                    `<${instanceId}> <http://mu.semte.ch/vocabularies/ext/reviewStatus> <http://lblod.data.gift/concepts/review-status/concept-gewijzigd>`,
                    `<${instanceId}> <http://schema.org/publication> <http://lblod.data.gift/concepts/publication-status/te-herpubliceren>`,
                    `<${instanceId}> <http://purl.org/dc/terms/spatial> <${instance.spatials[0].value}>`,
                    `<${instanceId}> <http://purl.org/dc/terms/spatial> <${instance.spatials[1].value}>`,
                    `<${instanceId}> <http://purl.org/dc/terms/spatial> <${instance.spatials[2].value}>`,

                    `<${instanceId}> <http://data.europa.eu/m8g/hasLegalResource> <${InstanceTestBuilder.LEGAL_RESOURCES[0].id}>`,
                    `<${InstanceTestBuilder.LEGAL_RESOURCES[0].id}> a <http://data.europa.eu/eli/ontology#LegalResource>`,
                    `<${InstanceTestBuilder.LEGAL_RESOURCES[0].id}> <http://mu.semte.ch/vocabularies/core/uuid> """${InstanceTestBuilder.LEGAL_RESOURCES[0].uuid}"""`,
                    `<${InstanceTestBuilder.LEGAL_RESOURCES[0].id}> <http://purl.org/dc/terms/title> """${InstanceTestBuilder.LEGAL_RESOURCES[0].title.en}"""@EN`,
                    `<${InstanceTestBuilder.LEGAL_RESOURCES[0].id}> <http://purl.org/dc/terms/title> """${InstanceTestBuilder.LEGAL_RESOURCES[0].title.nlFormal}"""@nl-BE-x-formal`,
                    `<${InstanceTestBuilder.LEGAL_RESOURCES[0].id}> <http://purl.org/dc/terms/description> """${InstanceTestBuilder.LEGAL_RESOURCES[0].description.en}"""@EN`,
                    `<${InstanceTestBuilder.LEGAL_RESOURCES[0].id}> <http://purl.org/dc/terms/description> """${InstanceTestBuilder.LEGAL_RESOURCES[0].description.nlFormal}"""@nl-BE-x-formal`,
                    `<${InstanceTestBuilder.LEGAL_RESOURCES[0].id}> <http://schema.org/url> """${InstanceTestBuilder.LEGAL_RESOURCES[0].url}"""`,
                    `<${InstanceTestBuilder.LEGAL_RESOURCES[0].id}> <http://www.w3.org/ns/shacl#order> """1"""^^<http://www.w3.org/2001/XMLSchema#integer>`,
                    `<${instanceId}> <http://data.europa.eu/m8g/hasLegalResource> <${InstanceTestBuilder.LEGAL_RESOURCES[1].id}>`,
                    `<${InstanceTestBuilder.LEGAL_RESOURCES[1].id}> a <http://data.europa.eu/eli/ontology#LegalResource>`,
                    `<${InstanceTestBuilder.LEGAL_RESOURCES[1].id}> <http://mu.semte.ch/vocabularies/core/uuid> """${InstanceTestBuilder.LEGAL_RESOURCES[1].uuid}"""`,
                    `<${InstanceTestBuilder.LEGAL_RESOURCES[1].id}> <http://purl.org/dc/terms/title> """${InstanceTestBuilder.LEGAL_RESOURCES[1].title.en}"""@EN`,
                    `<${InstanceTestBuilder.LEGAL_RESOURCES[1].id}> <http://purl.org/dc/terms/title> """${InstanceTestBuilder.LEGAL_RESOURCES[1].title.nlFormal}"""@nl-BE-x-formal`,
                    `<${InstanceTestBuilder.LEGAL_RESOURCES[1].id}> <http://purl.org/dc/terms/description> """${InstanceTestBuilder.LEGAL_RESOURCES[1].description.en}"""@EN`,
                    `<${InstanceTestBuilder.LEGAL_RESOURCES[1].id}> <http://purl.org/dc/terms/description> """${InstanceTestBuilder.LEGAL_RESOURCES[1].description.nlFormal}"""@nl-BE-x-formal`,
                    `<${InstanceTestBuilder.LEGAL_RESOURCES[1].id}> <http://schema.org/url> """${InstanceTestBuilder.LEGAL_RESOURCES[1].url}"""`,
                    `<${InstanceTestBuilder.LEGAL_RESOURCES[1].id}> <http://www.w3.org/ns/shacl#order> """2"""^^<http://www.w3.org/2001/XMLSchema#integer>`,
                ]);

            const actualInstance = await repository.findById(bestuurseenheid, instanceId);

            expect(actualInstance).toEqual(instance);
        });

        test('Verify minimal mappings - requirement without evidence', async () => {
            const bestuurseenheid = aBestuurseenheid().build();
            const requirement = aMinimalRequirementForInstance().withEvidence(undefined).build();

            const instance =
                aMinimalInstance()
                    .withCreatedBy(bestuurseenheid.id)
                    .withRequirements([requirement])
                    .build();

            await directDatabaseAccess.insertData(
                bestuurseenheid.userGraph().value,
                [
                    `<${instance.id}> a <https://productencatalogus.data.vlaanderen.be/ns/ipdc-lpdc#InstancePublicService>`,
                    `<${instance.id}> <http://mu.semte.ch/vocabularies/core/uuid> """${instance.uuid}"""`,
                    `<${instance.id}> <http://purl.org/pav/createdBy> <${bestuurseenheid.id.value}>`,
                    `<${instance.id}> <http://schema.org/dateCreated> """${InstanceTestBuilder.DATE_CREATED.value}"""^^<http://www.w3.org/2001/XMLSchema#dateTime>`,
                    `<${instance.id}> <http://schema.org/dateModified> """${InstanceTestBuilder.DATE_MODIFIED.value}"""^^<http://www.w3.org/2001/XMLSchema#dateTime>`,
                    `<${instance.id}> <http://www.w3.org/ns/adms#status> <http://lblod.data.gift/concepts/instance-status/ontwerp>`,
                    `<${instance.id}> <http://vocab.belgif.be/ns/publicservice#hasRequirement> <${requirement.id}>`,
                    `<${requirement.id}> a <http://data.europa.eu/m8g/Requirement>`,
                    `<${requirement.id}> <http://mu.semte.ch/vocabularies/core/uuid> """${requirement.uuid}"""`,
                    `<${requirement.id}> <http://www.w3.org/ns/shacl#order> """1"""^^<http://www.w3.org/2001/XMLSchema#integer>`,
                ]);

            const actualConceptSnapshot = await repository.findById(bestuurseenheid, instance.id);

            expect(actualConceptSnapshot).toEqual(instance);
        });

        test('Verify minimal mappings - requirement with minimal evidence', async () => {
            const bestuurseenheid = aBestuurseenheid().build();
            const evidence = aMinimalEvidenceForInstance().build();
            const requirement = aMinimalRequirementForInstance().withEvidence(evidence).build();

            const instance =
                aMinimalInstance()
                    .withCreatedBy(bestuurseenheid.id)
                    .withRequirements([requirement])
                    .build();

            await directDatabaseAccess.insertData(
                bestuurseenheid.userGraph().value,
                [
                    `<${instance.id}> a <https://productencatalogus.data.vlaanderen.be/ns/ipdc-lpdc#InstancePublicService>`,
                    `<${instance.id}> <http://mu.semte.ch/vocabularies/core/uuid> """${instance.uuid}"""`,
                    `<${instance.id}> <http://purl.org/pav/createdBy> <${bestuurseenheid.id.value}>`,
                    `<${instance.id}> <http://schema.org/dateCreated> """${InstanceTestBuilder.DATE_CREATED.value}"""^^<http://www.w3.org/2001/XMLSchema#dateTime>`,
                    `<${instance.id}> <http://schema.org/dateModified> """${InstanceTestBuilder.DATE_MODIFIED.value}"""^^<http://www.w3.org/2001/XMLSchema#dateTime>`,
                    `<${instance.id}> <http://www.w3.org/ns/adms#status> <http://lblod.data.gift/concepts/instance-status/ontwerp>`,
                    `<${instance.id}> <http://vocab.belgif.be/ns/publicservice#hasRequirement> <${requirement.id}>`,
                    `<${requirement.id}> a <http://data.europa.eu/m8g/Requirement>`,
                    `<${requirement.id}> <http://mu.semte.ch/vocabularies/core/uuid> """${requirement.uuid}"""`,
                    `<${requirement.id}> <http://www.w3.org/ns/shacl#order> """1"""^^<http://www.w3.org/2001/XMLSchema#integer>`,
                    `<${requirement.id}> <http://data.europa.eu/m8g/hasSupportingEvidence> <${evidence.id}>`,
                    `<${evidence.id}> a <http://data.europa.eu/m8g/Evidence>`,
                    `<${evidence.id}> <http://mu.semte.ch/vocabularies/core/uuid> """${evidence.uuid}"""`,
                ]);

            const actualConceptSnapshot = await repository.findById(bestuurseenheid, instance.id);

            expect(actualConceptSnapshot).toEqual(instance);
        });

        test('Verify minimal mappings - procedure without websites', async () => {
            const bestuurseenheid = aBestuurseenheid().build();
            const procedure = aMinimalProcedureForInstance().build();

            const instance = aMinimalInstance()
                .withCreatedBy(bestuurseenheid.id)
                .withProcedures([procedure])
                .build();

            await directDatabaseAccess.insertData(
                bestuurseenheid.userGraph().value,
                [
                    `<${instance.id}> a <https://productencatalogus.data.vlaanderen.be/ns/ipdc-lpdc#InstancePublicService>`,
                    `<${instance.id}> <http://mu.semte.ch/vocabularies/core/uuid> """${instance.uuid}"""`,
                    `<${instance.id}> <http://purl.org/pav/createdBy> <${bestuurseenheid.id.value}>`,
                    `<${instance.id}> <http://schema.org/dateCreated> """${InstanceTestBuilder.DATE_CREATED.value}"""^^<http://www.w3.org/2001/XMLSchema#dateTime>`,
                    `<${instance.id}> <http://schema.org/dateModified> """${InstanceTestBuilder.DATE_MODIFIED.value}"""^^<http://www.w3.org/2001/XMLSchema#dateTime>`,
                    `<${instance.id}> <http://www.w3.org/ns/adms#status> <http://lblod.data.gift/concepts/instance-status/ontwerp>`,
                    `<${instance.id}> <http://purl.org/vocab/cpsv#follows> <${procedure.id}>`,
                    `<${procedure.id}> a <http://purl.org/vocab/cpsv#Rule>`,
                    `<${procedure.id}> <http://mu.semte.ch/vocabularies/core/uuid> """${procedure.uuid}"""`,
                    `<${procedure.id}> <http://www.w3.org/ns/shacl#order> """1"""^^<http://www.w3.org/2001/XMLSchema#integer>`,
                ]);

            const actualInstance = await repository.findById(bestuurseenheid, instance.id);

            expect(actualInstance).toEqual(instance);
        });

        test('Verify minimal mappings - procedure with minimal website', async () => {
            const bestuurseenheid = aBestuurseenheid().build();
            const website = aMinimalWebsiteForInstance().build();
            const procedure = aMinimalProcedureForInstance().withWebsites([website]).build();

            const instance = aMinimalInstance()
                .withCreatedBy(bestuurseenheid.id)
                .withProcedures([procedure])
                .build();

            await directDatabaseAccess.insertData(
                bestuurseenheid.userGraph().value,
                [
                    `<${instance.id}> a <https://productencatalogus.data.vlaanderen.be/ns/ipdc-lpdc#InstancePublicService>`,
                    `<${instance.id}> <http://mu.semte.ch/vocabularies/core/uuid> """${instance.uuid}"""`,
                    `<${instance.id}> <http://purl.org/pav/createdBy> <${bestuurseenheid.id.value}>`,
                    `<${instance.id}> <http://schema.org/dateCreated> """${InstanceTestBuilder.DATE_CREATED.value}"""^^<http://www.w3.org/2001/XMLSchema#dateTime>`,
                    `<${instance.id}> <http://schema.org/dateModified> """${InstanceTestBuilder.DATE_MODIFIED.value}"""^^<http://www.w3.org/2001/XMLSchema#dateTime>`,
                    `<${instance.id}> <http://www.w3.org/ns/adms#status> <http://lblod.data.gift/concepts/instance-status/ontwerp>`,
                    `<${instance.id}> <http://purl.org/vocab/cpsv#follows> <${procedure.id}>`,
                    `<${procedure.id}> a <http://purl.org/vocab/cpsv#Rule>`,
                    `<${procedure.id}> <http://mu.semte.ch/vocabularies/core/uuid> """${procedure.uuid}"""`,
                    `<${procedure.id}> <http://www.w3.org/ns/shacl#order> """1"""^^<http://www.w3.org/2001/XMLSchema#integer>`,
                    `<${procedure.id}> <https://productencatalogus.data.vlaanderen.be/ns/ipdc-lpdc#hasWebsite> <${procedure.websites[0].id}>`,
                    `<${procedure.websites[0].id}> a <http://schema.org/WebSite>`,
                    `<${procedure.websites[0].id}> <http://mu.semte.ch/vocabularies/core/uuid> """${procedure.websites[0].uuid}"""`,
                    `<${procedure.websites[0].id}> <http://www.w3.org/ns/shacl#order> """1"""^^<http://www.w3.org/2001/XMLSchema#integer>`,
                ]);

            const actualInstance = await repository.findById(bestuurseenheid, instance.id);

            expect(actualInstance).toEqual(instance);
        });

        for (const type of Object.values(InstanceStatusType)) {
            test(`Instance Status type ${type} can be mapped`, async () => {
                const instance = aMinimalInstance().withStatus(type).withDateSent(InstanceTestBuilder.DATE_SENT).build();
                const bestuurseenheid = aBestuurseenheid().build();
                await repository.save(bestuurseenheid, instance);

                const actualInstance = await repository.findById(bestuurseenheid, instance.id);

                expect(actualInstance).toEqual(instance);
            });
        }

        test('Unknown Instance Status Type can not be mapped', async () => {
            const instanceId = buildInstanceIri(uuid());

            const bestuurseenheid = aBestuurseenheid().build();

            await directDatabaseAccess.insertData(
                bestuurseenheid.userGraph().value,
                [
                    `<${instanceId}> a <https://productencatalogus.data.vlaanderen.be/ns/ipdc-lpdc#InstancePublicService>`,
                    `<${instanceId}> <http://www.w3.org/ns/adms#status> <http://lblod.data.gift/concepts/instance-status/unknown-instance-status>`,
                ]);

            await expect(repository.findById(bestuurseenheid, instanceId)).rejects.toThrowWithMessage(SystemError, `Kan <http://lblod.data.gift/concepts/instance-status/unknown-instance-status> niet mappen voor Iri: <${instanceId}>`);
        });

        for (const type of Object.values(ProductType)) {
            test(`Product type ${type} can be mapped`, async () => {
                const bestuurseenheid = aBestuurseenheid().build();
                const instance = aMinimalInstance()
                    .withCreatedBy(bestuurseenheid.id)
                    .withType(type)
                    .build();

                await repository.save(bestuurseenheid, instance);

                const actualInstance = await repository.findById(bestuurseenheid, instance.id);

                expect(actualInstance).toEqual(instance);
            });
        }

        test('Unknown Product Type can not be mapped', async () => {
            const bestuurseenheid = aBestuurseenheid().build();
            const instanceIri = buildInstanceIri(uuid());

            await directDatabaseAccess.insertData(
                bestuurseenheid.userGraph().value,
                [
                    `<${instanceIri}> a <https://productencatalogus.data.vlaanderen.be/ns/ipdc-lpdc#InstancePublicService>`,
                    `<${instanceIri}> <http://purl.org/dc/terms/type> <https://productencatalogus.data.vlaanderen.be/id/concept/Type/UnknownProductType>`,
                ]);

            await expect(repository.findById(bestuurseenheid, instanceIri)).rejects.toThrowWithMessage(SystemError, `Kan <https://productencatalogus.data.vlaanderen.be/id/concept/Type/UnknownProductType> niet mappen voor Iri: <${instanceIri}>`);
        });

        for (const targetAudience of Object.values(TargetAudienceType)) {
            test(`TargetAudienceType ${targetAudience} can be mapped`, async () => {
                const bestuurseenheid = aBestuurseenheid().build();
                const instance = aMinimalInstance().withTargetAudiences([targetAudience]).build();
                await repository.save(bestuurseenheid, instance);

                const actualInstance = await repository.findById(bestuurseenheid, instance.id);

                expect(actualInstance).toEqual(instance);
            });
        }

        test('Unknown Target Audience Type can not be mapped', async () => {
            const bestuurseenheid = aBestuurseenheid().build();
            const instanceIri = buildInstanceIri(uuid());

            await directDatabaseAccess.insertData(
                bestuurseenheid.userGraph().value,
                [`<${instanceIri}> a <https://productencatalogus.data.vlaanderen.be/ns/ipdc-lpdc#InstancePublicService>`,
                    `<${instanceIri}> <https://productencatalogus.data.vlaanderen.be/ns/ipdc-lpdc#targetAudience> <https://productencatalogus.data.vlaanderen.be/id/concept/Doelgroep/NonExistingTargetAudience>`,
                ]);

            await expect(repository.findById(bestuurseenheid, instanceIri)).rejects.toThrowWithMessage(SystemError, `Kan <https://productencatalogus.data.vlaanderen.be/id/concept/Doelgroep/NonExistingTargetAudience> niet mappen voor Iri: <${instanceIri}>`);
        });

        for (const theme of Object.values(ThemeType)) {
            test(`ThemeType ${theme} can be mapped`, async () => {
                const bestuurseenheid = aBestuurseenheid().build();
                const instance = aMinimalInstance().withThemes([theme]).build();
                await repository.save(bestuurseenheid, instance);

                const actualInstance = await repository.findById(bestuurseenheid, instance.id);

                expect(actualInstance).toEqual(instance);
            });
        }

        test('Unknown Theme type can not be mapped', async () => {
            const instanceIri = buildInstanceIri(uuid());
            const bestuurseenheid = aBestuurseenheid().build();

            await directDatabaseAccess.insertData(
                bestuurseenheid.userGraph().value,
                [`<${instanceIri}> a <https://productencatalogus.data.vlaanderen.be/ns/ipdc-lpdc#InstancePublicService>`,
                    `<${instanceIri}> <http://data.europa.eu/m8g/thematicArea> <https://productencatalogus.data.vlaanderen.be/id/concept/Thema/NonExistingTheme>`,
                ]);

            await expect(repository.findById(bestuurseenheid, instanceIri)).rejects.toThrowWithMessage(SystemError, `Kan <https://productencatalogus.data.vlaanderen.be/id/concept/Thema/NonExistingTheme> niet mappen voor Iri: <${instanceIri}>`);
        });

        for (const competentAuthorityLevel of Object.values(CompetentAuthorityLevelType)) {
            test(`CompetentAuthorityLevelType ${competentAuthorityLevel} can be mapped`, async () => {
                const bestuurseenheid = aBestuurseenheid().build();
                const instance = aMinimalInstance().withCompetentAuthorityLevels([competentAuthorityLevel]).build();
                await repository.save(bestuurseenheid, instance);

                const actualInstance = await repository.findById(bestuurseenheid, instance.id);

                expect(actualInstance).toEqual(instance);
            });
        }

        test('Unknown Competent Authority Level type can not be mapped', async () => {
            const bestuurseenheid = aBestuurseenheid().build();
            const instanceIri = buildInstanceIri(uuid());

            await directDatabaseAccess.insertData(
                bestuurseenheid.userGraph().value,
                [`<${instanceIri}> a <https://productencatalogus.data.vlaanderen.be/ns/ipdc-lpdc#InstancePublicService>`,
                    `<${instanceIri}> <https://productencatalogus.data.vlaanderen.be/ns/ipdc-lpdc#competentAuthorityLevel> <https://productencatalogus.data.vlaanderen.be/id/concept/BevoegdBestuursniveau/NonExistingCompetentAuthorityLevel>`,
                ]);

            await expect(repository.findById(bestuurseenheid, instanceIri)).rejects.toThrowWithMessage(SystemError, `Kan <https://productencatalogus.data.vlaanderen.be/id/concept/BevoegdBestuursniveau/NonExistingCompetentAuthorityLevel> niet mappen voor Iri: <${instanceIri}>`);
        });

        for (const executingAuthorityLevel of Object.values(ExecutingAuthorityLevelType)) {
            test(`ExecutingAuthorityLevelType ${executingAuthorityLevel} can be mapped`, async () => {
                const bestuurseenheid = aBestuurseenheid().build();
                const instance = aMinimalInstance().withExecutingAuthorityLevels([executingAuthorityLevel]).build();
                await repository.save(bestuurseenheid, instance);

                const actualInstance = await repository.findById(bestuurseenheid, instance.id);

                expect(actualInstance).toEqual(instance);
            });
        }

        test('Unknown ExecutingAuthorityLevelType can not be mapped', async () => {
            const bestuurseenheid = aBestuurseenheid().build();
            const instanceIri = buildInstanceIri(uuid());

            await directDatabaseAccess.insertData(
                bestuurseenheid.userGraph().value,
                [`<${instanceIri}> a <https://productencatalogus.data.vlaanderen.be/ns/ipdc-lpdc#InstancePublicService>`,
                    `<${instanceIri}> <https://productencatalogus.data.vlaanderen.be/ns/ipdc-lpdc#executingAuthorityLevel> <https://productencatalogus.data.vlaanderen.be/id/concept/UitvoerendBestuursniveau/NonExistingExecutingAuthorityLevel>`,
                ]);

            await expect(repository.findById(bestuurseenheid, instanceIri)).rejects.toThrowWithMessage(SystemError, `Kan <https://productencatalogus.data.vlaanderen.be/id/concept/UitvoerendBestuursniveau/NonExistingExecutingAuthorityLevel> niet mappen voor Iri: <${instanceIri}>`);
        });

        for (const publicationMedium of Object.values(PublicationMediumType)) {
            test(`PublicationMediumType ${publicationMedium} can be mapped`, async () => {
                const bestuurseenheid = aBestuurseenheid().build();
                const instance = aMinimalInstance().withPublicationMedia([publicationMedium]).build();
                await repository.save(bestuurseenheid, instance);

                const actualInstance = await repository.findById(bestuurseenheid, instance.id);

                expect(actualInstance).toEqual(instance);
            });
        }

        test('Unknown PublicationMediumType can not be mapped', async () => {
            const bestuurseenheid = aBestuurseenheid().build();
            const instanceId = buildInstanceIri(uuid());

            await directDatabaseAccess.insertData(
                bestuurseenheid.userGraph().value,
                [`<${instanceId}> a <https://productencatalogus.data.vlaanderen.be/ns/ipdc-lpdc#InstancePublicService>`,
                    `<${instanceId}> <https://productencatalogus.data.vlaanderen.be/ns/ipdc-lpdc#publicationMedium> <https://productencatalogus.data.vlaanderen.be/id/concept/PublicatieKanaal/NonExistingPublicationMedium>`,
                ]);

            await expect(repository.findById(bestuurseenheid, instanceId)).rejects.toThrowWithMessage(SystemError, `Kan <https://productencatalogus.data.vlaanderen.be/id/concept/PublicatieKanaal/NonExistingPublicationMedium> niet mappen voor Iri: <${instanceId}>`);
        });

        for (const yourEuropeCategory of Object.values(YourEuropeCategoryType)) {
            test(`YourEuropeCategoryType ${yourEuropeCategory} can be mapped`, async () => {
                const bestuurseenheid = aBestuurseenheid().build();
                const instance = aMinimalInstance().withYourEuropeCategories([yourEuropeCategory]).build();
                await repository.save(bestuurseenheid, instance);

                const actualInstance = await repository.findById(bestuurseenheid, instance.id);

                expect(actualInstance).toEqual(instance);
            });
        }

        test('Unknown YourEuropeCategoryType can not be mapped', async () => {
            const bestuurseenheid = aBestuurseenheid().build();
            const instanceId = buildInstanceIri(uuid());

            await directDatabaseAccess.insertData(
                bestuurseenheid.userGraph().value,
                [`<${instanceId}> a <https://productencatalogus.data.vlaanderen.be/ns/ipdc-lpdc#InstancePublicService>`,
                    `<${instanceId}> <https://productencatalogus.data.vlaanderen.be/ns/ipdc-lpdc#yourEuropeCategory> <https://productencatalogus.data.vlaanderen.be/id/concept/YourEuropeCatagory/NonExistingYourEuropeCategory>`,
                ]);

            await expect(repository.findById(bestuurseenheid, instanceId)).rejects.toThrowWithMessage(SystemError, `Kan <https://productencatalogus.data.vlaanderen.be/id/concept/YourEuropeCatagory/NonExistingYourEuropeCategory> niet mappen voor Iri: <${instanceId}>`);
        });

        for (const languageType of Object.values(LanguageType)) {
            test(`LanguageType ${languageType} can be mapped`, async () => {
                const bestuurseenheid = aBestuurseenheid().build();
                const instance = aMinimalInstance().withLanguages([languageType]).build();
                await repository.save(bestuurseenheid, instance);

                const actualInstance = await repository.findById(bestuurseenheid, instance.id);

                expect(actualInstance).toEqual(instance);
            });
        }

        test('Unknown LanguageType can not be mapped', async () => {
            const bestuurseenheid = aBestuurseenheid().build();
            const instanceId = buildInstanceIri(uuid());

            await directDatabaseAccess.insertData(
                bestuurseenheid.userGraph().value,
                [`<${instanceId}> a <https://productencatalogus.data.vlaanderen.be/ns/ipdc-lpdc#InstancePublicService>`,
                    `<${instanceId}> <http://purl.org/dc/terms/language> <http://publications.europa.eu/resource/authority/language/NonExistingLanguageType>`,
                ]);

            await expect(repository.findById(bestuurseenheid, instanceId)).rejects.toThrowWithMessage(SystemError, `Kan <http://publications.europa.eu/resource/authority/language/NonExistingLanguageType> niet mappen voor Iri: <${instanceId}>`);
        });

        test('minimal legal resource', async () => {
            const bestuurseenheid = aBestuurseenheid().build();
            const legalResource = aMinimalLegalResourceForInstance().build();
            const instance = aFullInstance().withLegalResources([legalResource]).build();
            await repository.save(bestuurseenheid, instance);

            const savedInstance = await repository.findById(bestuurseenheid, instance.id);
            expect(savedInstance).toEqual(instance);
        });

        test('empty string fields', async () => {
            const bestuurseenheid = aBestuurseenheid().build();
            const instance = aMinimalInstance()
                .withTitle(LanguageString.of("", ""))
                .withDescription(LanguageString.of("", ""))
                .withAdditionalDescription(LanguageString.of("", ""))
                .withException(LanguageString.of("", ""))
                .withRegulation(LanguageString.of("", ""))
                .withStartDate(FormatPreservingDate.of(""))
                .withEndDate(FormatPreservingDate.of(""))
                .withKeywords([LanguageString.of(undefined, "")])
                .withRequirements([
                    aMinimalRequirementForInstance()
                        .withTitle(LanguageString.of("", ""))
                        .withDescription(LanguageString.of("", ""))
                        .withEvidence(aMinimalEvidenceForInstance()
                            .withTitle(LanguageString.of("", ""))
                            .withDescription(LanguageString.of("", ""))
                            .buildForInstance())
                        .buildForInstance()
                ])
                .withProcedures([
                    aMinimalProcedureForInstance()
                        .withTitle(LanguageString.of("", ""))
                        .withDescription(LanguageString.of("", ""))
                        .withWebsites([aMinimalWebsiteForInstance()
                            .withTitle(LanguageString.of("", ""))
                            .withDescription(LanguageString.of("", ""))
                            .withUrl("")
                            .buildForInstance()
                        ])
                        .buildForInstance()
                ])
                .withWebsites([aMinimalWebsiteForInstance()
                    .withTitle(LanguageString.of("", ""))
                    .withDescription(LanguageString.of("", ""))
                    .withUrl("")
                    .buildForInstance()
                ])
                .withCosts([
                    aMinimalCostForInstance()
                        .withTitle(LanguageString.of("", ""))
                        .withDescription(LanguageString.of("", ""))
                        .buildForInstance()
                ])
                .withFinancialAdvantages([
                    aMinimalFinancialAdvantageForInstance()
                        .withTitle(LanguageString.of("", ""))
                        .withDescription(LanguageString.of("", ""))
                        .buildForInstance()
                ])
                .withContactPoints([
                    aMinimalContactPointForInstance()
                        .withUrl("")
                        .withEmail("")
                        .withTelephone("")
                        .withOpeningHours("")
                        .withAddress(aMinimalAddressForInstance()
                            .withGemeentenaam(LanguageString.of(undefined, ""))
                            .withStraatnaam(LanguageString.of(undefined, ""))
                            .withHuisnummer("")
                            .withBusnummer("")
                            .withPostcode("")
                            .withLand(LanguageString.of(undefined,""))
                            .build()
                        )
                        .build()
                ])
                .withConceptId(buildConceptIri(uuid()))
                .withConceptSnapshotId(buildConceptSnapshotIri(uuid()))
                .withProductId("")
                .withLegalResources([
                    aMinimalLegalResourceForInstance()
                        .withTitle(LanguageString.of("", ""))
                        .withDescription(LanguageString.of("", ""))
                        .withUrl("")
                        .build()
                ])
                .build();

            await repository.save(bestuurseenheid, instance);
            const actualInstance = await repository.findById(bestuurseenheid, instance.id);
            expect(actualInstance).toEqual(instance);
        });

    });

});