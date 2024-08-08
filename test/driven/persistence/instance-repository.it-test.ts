import {TEST_SPARQL_ENDPOINT} from "../../test.config";
import {aFullInstance, aMinimalInstance, InstanceTestBuilder} from "../../core/domain/instance-test-builder";
import {BestuurseenheidSparqlTestRepository} from "./bestuurseenheid-sparql-test-repository";
import {aBestuurseenheid} from "../../core/domain/bestuurseenheid-test-builder";
import {sparqlEscapeUri, uuid} from "../../../mu-helper";
import {DirectDatabaseAccess} from "./direct-database-access";
import {buildConceptIri, buildConceptSnapshotIri, buildNutsCodeIri,} from "../../core/domain/iri-test-builder";
import {
    ChosenFormType,
    CompetentAuthorityLevelType,
    ExecutingAuthorityLevelType,
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

import {restoreRealTime, setFixedTime} from "../../fixed-time";
import {aMinimalLegalResourceForInstance} from "../../core/domain/legal-resource-test-builder";
import {
    ConcurrentUpdateError,
    InvariantError,
    NotFoundError,
    SystemError
} from "../../../src/core/domain/shared/lpdc-error";
import {LanguageString} from "../../../src/core/domain/language-string";
import {aMinimalCostForInstance} from "../../core/domain/cost-test-builder";
import {aMinimalFinancialAdvantageForInstance} from "../../core/domain/financial-advantage-test-builder";
import {instanceLanguages, Language} from "../../../src/core/domain/language";
import {Iri} from "../../../src/core/domain/shared/iri";
import {PublishedInstanceSnapshotBuilder} from "../../../src/core/domain/published-instance-snapshot";
import {InstanceSparqlTestRepository} from "./instance-sparql-test-repository";
import {DomainToQuadsMapper} from "../../../src/driven/persistence/domain-to-quads-mapper";

describe('InstanceRepository', () => {

    const repository = new InstanceSparqlTestRepository(TEST_SPARQL_ENDPOINT);
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

            const nonExistentInstanceId = InstanceBuilder.buildIri('thisiddoesnotexist');

            await expect(repository.findById(bestuurseenheid, nonExistentInstanceId)).rejects.toThrowWithMessage(NotFoundError, `Kan <http://data.lblod.info/id/public-service/thisiddoesnotexist> niet vinden voor type <https://productencatalogus.data.vlaanderen.be/ns/ipdc-lpdc#InstancePublicService> in graph <http://mu.semte.ch/graphs/organizations/${bestuurseenheid.uuid}/LoketLB-LPDCGebruiker>`);
        });
    });

    describe('save', () => {

        test('should save instance', async () => {
            const bestuurseenheid = aBestuurseenheid().build();
            await bestuurseenheidRepository.save(bestuurseenheid);

            const instance = aFullInstance().withCreatedBy(bestuurseenheid.id).build();

            await repository.save(bestuurseenheid, instance);

            const actualInstance = await repository.findById(bestuurseenheid, instance.id);

            expect(actualInstance).toEqual(instance);
        });

        test('should create publishedInstanceSnapshot when instance has status verzonden', async () => {
            const bestuurseenheid = aBestuurseenheid().build();
            await bestuurseenheidRepository.save(bestuurseenheid);

            const instance = aFullInstance()
                .withCreatedBy(bestuurseenheid.id)
                .withStatus(InstanceStatusType.VERZONDEN)
                .build();

            await repository.save(bestuurseenheid, instance);
            const publishedInstanceSnapshotId = await repository.findPublishedInstanceSnapshotIdForInstance(bestuurseenheid, instance);
            const publishedInstanceSnapshotQuads = await repository.findPublishedInstanceSnapshot(bestuurseenheid, publishedInstanceSnapshotId);
            expect(publishedInstanceSnapshotQuads).toEqual(expect.arrayContaining([
                quad(namedNode(publishedInstanceSnapshotId.value), namedNode('http://www.w3.org/1999/02/22-rdf-syntax-ns#type'), namedNode('https://productencatalogus.data.vlaanderen.be/ns/ipdc-lpdc#PublishedInstancePublicServiceSnapshot'), namedNode(bestuurseenheid.userGraph().value)),
                quad(namedNode(publishedInstanceSnapshotId.value), namedNode('http://www.w3.org/ns/prov#generatedAtTime'), literal(instance.dateSent.value, 'http://www.w3.org/2001/XMLSchema#dateTime'), namedNode(bestuurseenheid.userGraph().value)),
                quad(namedNode(publishedInstanceSnapshotId.value), namedNode('https://productencatalogus.data.vlaanderen.be/ns/ipdc-lpdc#isPublishedVersionOf'), namedNode(instance.id.value), namedNode(bestuurseenheid.userGraph().value)),
                quad(namedNode(publishedInstanceSnapshotId.value), namedNode('http://purl.org/pav/createdBy'), namedNode(instance.createdBy.value), namedNode(bestuurseenheid.userGraph().value)),
            ]));
        });

        test('should NOT create publishedInstanceSnapshot when instance has status ontwerp', async () => {
            const bestuurseenheid = aBestuurseenheid().build();
            await bestuurseenheidRepository.save(bestuurseenheid);

            const instance = aFullInstance()
                .withCreatedBy(bestuurseenheid.id)
                .withStatus(InstanceStatusType.ONTWERP)
                .build();

            await repository.save(bestuurseenheid, instance);
            const publishedInstanceSnapshotId = await repository.findPublishedInstanceSnapshotIdForInstance(bestuurseenheid, instance);
            expect(publishedInstanceSnapshotId).toBeUndefined();
        });
    });

    describe('update', () => {

        test('should update instance', async () => {
            const bestuurseenheid = aBestuurseenheid().build();
            const oldInstance = aFullInstance()
                .withCreatedBy(bestuurseenheid.id)
                .withProductId('80')
                .withDateModified(FormatPreservingDate.of('2023-10-20T00:00:00.657Z'))
                .build();
            await repository.save(bestuurseenheid, oldInstance);

            const newInstance = InstanceBuilder.from(oldInstance)
                .withProductId('100')
                .build();

            await repository.update(bestuurseenheid, newInstance, oldInstance.dateModified);

            const actualInstance = await repository.findById(bestuurseenheid, newInstance.id);
            const expectedInstance = InstanceBuilder.from(newInstance).withDateModified(FormatPreservingDate.now()).build();


            expect(actualInstance).toEqual(expectedInstance);
        });

        test('should create and save published instance when instance has status verzonden', async () => {
            const bestuurseenheid = aBestuurseenheid().build();
            const oldInstance = aFullInstance()
                .withCreatedBy(bestuurseenheid.id)
                .withDateModified(FormatPreservingDate.of('2023-10-20T00:00:00.657Z'))
                .build();
            await repository.save(bestuurseenheid, oldInstance);

            const newInstance = InstanceBuilder.from(oldInstance)
                .withStatus(InstanceStatusType.VERZONDEN)
                .build();

            await repository.update(bestuurseenheid, newInstance, oldInstance.dateModified);

            const actualInstance = await repository.findById(bestuurseenheid, newInstance.id);
            const expectedInstance = InstanceBuilder.from(newInstance).withDateModified(FormatPreservingDate.now()).build();

            expect(actualInstance).toEqual(expectedInstance);

            const publishedInstanceSnapshotId = await repository.findPublishedInstanceSnapshotIdForInstance(bestuurseenheid, newInstance);
            const publishedInstanceSnapshotQuads = await repository.findPublishedInstanceSnapshot(bestuurseenheid, publishedInstanceSnapshotId);
            expect(publishedInstanceSnapshotQuads).toEqual(expect.arrayContaining([
                quad(namedNode(publishedInstanceSnapshotId.value), namedNode('http://www.w3.org/1999/02/22-rdf-syntax-ns#type'), namedNode('https://productencatalogus.data.vlaanderen.be/ns/ipdc-lpdc#PublishedInstancePublicServiceSnapshot'), namedNode(bestuurseenheid.userGraph().value)),
                quad(namedNode(publishedInstanceSnapshotId.value), namedNode('https://productencatalogus.data.vlaanderen.be/ns/ipdc-lpdc#isPublishedVersionOf'), namedNode(newInstance.id.value), namedNode(bestuurseenheid.userGraph().value)),
            ]));

        });

        test('should NOT create published instance when instance has status ontwerp', async () => {
            const bestuurseenheid = aBestuurseenheid().build();
            const oldInstance = aFullInstance()
                .withCreatedBy(bestuurseenheid.id)
                .withDateModified(FormatPreservingDate.of('2023-10-20T00:00:00.657Z'))
                .build();
            await repository.save(bestuurseenheid, oldInstance);

            const newInstance = InstanceBuilder.from(oldInstance)
                .withStatus(InstanceStatusType.ONTWERP)
                .build();

            await repository.update(bestuurseenheid, newInstance, oldInstance.dateModified);

            const actualInstance = await repository.findById(bestuurseenheid, newInstance.id);
            const expectedInstance = InstanceBuilder.from(newInstance).withDateModified(FormatPreservingDate.now()).build();

            expect(actualInstance).toEqual(expectedInstance);

            const publishedInstanceSnapshotId = await repository.findPublishedInstanceSnapshotIdForInstance(bestuurseenheid, newInstance);
            expect(publishedInstanceSnapshotId).toBeUndefined();
        });

        test('should throw error when old instance is equal to new instance', async () => {
            const bestuurseenheid = aBestuurseenheid().build();
            const oldInstance = aFullInstance().withCreatedBy(bestuurseenheid.id).withDateModified(FormatPreservingDate.now()).build();
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
                .build();

            await expect(() => repository.update(bestuurseenheid, newInstance, oldInstance.dateModified)).rejects.toThrowWithMessage(ConcurrentUpdateError, 'De productfiche is gelijktijdig aangepast door een andere gebruiker. Herlaad de pagina en geef je aanpassingen opnieuw in');

            const actualInstance = await repository.findById(bestuurseenheid, newInstance.id);
            expect(actualInstance).toEqual(dbInstance);
        });

        test('should not error when modified date of old instance is the same as in db, but exactly on the second', async () => {
            const bestuurseenheid = aBestuurseenheid().build();
            const dbInstance = aFullInstance()
                .withCreatedBy(bestuurseenheid.id)
                .withDateModified(FormatPreservingDate.of('2023-10-30T00:00:00.000Z'))
                .withTitle(LanguageString.ofValueInLanguage(uuid(), Language.FORMAL))
                .build();
            await repository.save(bestuurseenheid, dbInstance);

            const oldInstance = InstanceBuilder.from(dbInstance)
                .withDateModified(FormatPreservingDate.of('2023-10-30T00:00:00.000Z'))
                .build();

            const newInstance = InstanceBuilder.from(dbInstance)
                .build();

            await repository.update(bestuurseenheid, newInstance, oldInstance.dateModified);

            const actualInstance = await repository.findById(bestuurseenheid, newInstance.id);
            expect(actualInstance.dateModified).not.toEqual(dbInstance.dateModified);
            expect(actualInstance.title).toEqual(dbInstance.title);
        });

        test('should throw error when version undefined', async () => {
            const bestuurseenheid = aBestuurseenheid().build();
            const dbInstance = aFullInstance()
                .withCreatedBy(bestuurseenheid.id)
                .withDateModified(FormatPreservingDate.of('2023-10-30T00:00:00.657Z'))
                .build();
            await repository.save(bestuurseenheid, dbInstance);

            const newInstance = InstanceBuilder.from(dbInstance)
                .build();

            await expect(() => repository.update(bestuurseenheid, newInstance, undefined)).rejects.toThrowWithMessage(InvariantError, 'Instantie versie mag niet ontbreken');

        });
    });

    describe('delete', () => {

        test('if exists with dateSent, Removes all triples related to the instance and create tombstone triples', async () => {

            const bestuurseenheid = aBestuurseenheid().build();
            const instance = aFullInstance().build();

            await repository.save(bestuurseenheid, instance);
            const tombstoneId = await repository.delete(bestuurseenheid, instance.id);

            const instanceExists = await repository.exists(bestuurseenheid, instance.id);
            expect(instanceExists).toBeFalse();

            const query = `
            SELECT ?s ?p ?o WHERE {
                GRAPH ${sparqlEscapeUri(bestuurseenheid.userGraph())} {
                    VALUES ?s {
                        <${tombstoneId.value}>
                    }
                    ?s ?p ?o
                }
            }
        `;
            const queryResult = await directDatabaseAccess.list(query);
            const quads = new SparqlQuerying().asQuads(queryResult, bestuurseenheid.userGraph().value);

            expect(quads).toHaveLength(5);
            expect(quads).toEqual(expect.arrayContaining([
                quad(namedNode(tombstoneId.value), namedNode('http://www.w3.org/1999/02/22-rdf-syntax-ns#type'), namedNode('https://www.w3.org/ns/activitystreams#Tombstone'), namedNode(bestuurseenheid.userGraph().value)),
                quad(namedNode(tombstoneId.value), namedNode('https://www.w3.org/ns/activitystreams#deleted'), literal(FormatPreservingDate.now().value, 'http://www.w3.org/2001/XMLSchema#dateTime'), namedNode(bestuurseenheid.userGraph().value)),
                quad(namedNode(tombstoneId.value), namedNode('http://www.w3.org/ns/prov#generatedAtTime'), literal(FormatPreservingDate.now().value, 'http://www.w3.org/2001/XMLSchema#dateTime'), namedNode(bestuurseenheid.userGraph().value)),
                quad(namedNode(tombstoneId.value), namedNode('https://www.w3.org/ns/activitystreams#formerType'), namedNode('https://productencatalogus.data.vlaanderen.be/ns/ipdc-lpdc#InstancePublicService'), namedNode(bestuurseenheid.userGraph().value)),
                quad(namedNode(tombstoneId.value), namedNode('https://productencatalogus.data.vlaanderen.be/ns/ipdc-lpdc#isPublishedVersionOf'), namedNode(instance.id.value), namedNode(bestuurseenheid.userGraph().value)),
            ]));
        });

        test('if exists with dateSent, Removes all triples related to the instance and create tombstone triples using provided deletionDate', async () => {

            const bestuurseenheid = aBestuurseenheid().build();
            const instance = aFullInstance().build();

            await repository.save(bestuurseenheid, instance);
            const tombstoneId = await repository.delete(bestuurseenheid, instance.id, FormatPreservingDate.of('2025-08-21T00:00:00.456545Z'));

            const instanceExists = await repository.exists(bestuurseenheid, instance.id);
            expect(instanceExists).toBeFalse();

            const query = `
            SELECT ?s ?p ?o WHERE {
                GRAPH ${sparqlEscapeUri(bestuurseenheid.userGraph())} {
                    VALUES ?s {
                        <${tombstoneId.value}>
                    }
                    ?s ?p ?o
                }
            }
        `;
            const queryResult = await directDatabaseAccess.list(query);
            const quads = new SparqlQuerying().asQuads(queryResult, bestuurseenheid.userGraph().value);

            expect(quads).toHaveLength(5);
            expect(quads).toEqual(expect.arrayContaining([
                quad(namedNode(tombstoneId.value), namedNode('http://www.w3.org/1999/02/22-rdf-syntax-ns#type'), namedNode('https://www.w3.org/ns/activitystreams#Tombstone'), namedNode(bestuurseenheid.userGraph().value)),
                quad(namedNode(tombstoneId.value), namedNode('https://www.w3.org/ns/activitystreams#deleted'), literal(FormatPreservingDate.of('2025-08-21T00:00:00.456545Z').value, 'http://www.w3.org/2001/XMLSchema#dateTime'), namedNode(bestuurseenheid.userGraph().value)),
                quad(namedNode(tombstoneId.value), namedNode('http://www.w3.org/ns/prov#generatedAtTime'), literal(FormatPreservingDate.of('2025-08-21T00:00:00.456545Z').value, 'http://www.w3.org/2001/XMLSchema#dateTime'), namedNode(bestuurseenheid.userGraph().value)),
                quad(namedNode(tombstoneId.value), namedNode('https://www.w3.org/ns/activitystreams#formerType'), namedNode('https://productencatalogus.data.vlaanderen.be/ns/ipdc-lpdc#InstancePublicService'), namedNode(bestuurseenheid.userGraph().value)),
                quad(namedNode(tombstoneId.value), namedNode('https://productencatalogus.data.vlaanderen.be/ns/ipdc-lpdc#isPublishedVersionOf'), namedNode(instance.id.value), namedNode(bestuurseenheid.userGraph().value)),
            ]));
        });

        test('if exists without dateSent, Removes all triples related to the instance and does not create tombstone triples ', async () => {

            const bestuurseenheid = aBestuurseenheid().build();
            const instance = aFullInstance()
                .withDateSent(undefined)
                .build();

            await repository.save(bestuurseenheid, instance);
            const tombstoneId = await repository.delete(bestuurseenheid, instance.id);

            expect(tombstoneId).toBeUndefined();

            const instanceExists = await repository.exists(bestuurseenheid, instance.id);
            expect(instanceExists).toBeFalse();


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
                .withDateSent(undefined)
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

            const nonExistentInstanceId = InstanceBuilder.buildIri('thisiddoesnotexist');

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

        test('if a tombstone was once created, create a new tombstone, even if datesent is not set', async () => {

            const bestuurseenheid = aBestuurseenheid().build();
            const instance = aFullInstance().withDateSent(FormatPreservingDate.now()).withStatus(InstanceStatusType.VERZONDEN).build();

            await repository.save(bestuurseenheid, instance);
            const initialTombstoneId = await repository.delete(bestuurseenheid, instance.id);

            const instanceExists = await repository.exists(bestuurseenheid, instance.id);
            expect(instanceExists).toBeFalse();

            const query = (tombstoneId: Iri): string => `
            SELECT ?s ?p ?o WHERE {
                GRAPH ${sparqlEscapeUri(bestuurseenheid.userGraph())} {
                    VALUES ?s {
                        <${tombstoneId.value}>
                    }
                    ?s ?p ?o
                }
            }
        `;
            let queryResult = await directDatabaseAccess.list(query(initialTombstoneId));
            let quads = new SparqlQuerying().asQuads(queryResult, bestuurseenheid.userGraph().value);

            expect(quads).toHaveLength(5);

            const recreatedInstance = InstanceBuilder.from(instance).withDateSent(undefined).withStatus(InstanceStatusType.ONTWERP).build();
            await repository.save(bestuurseenheid, recreatedInstance);

            let recreatedInstanceExists = await repository.exists(bestuurseenheid, recreatedInstance.id);
            expect(recreatedInstanceExists).toBeTrue();

            expect(recreatedInstance.id).toEqual(instance.id);

            const nextTombstoneId = await repository.delete(bestuurseenheid, recreatedInstance.id);

            recreatedInstanceExists = await repository.exists(bestuurseenheid, recreatedInstance.id);
            expect(recreatedInstanceExists).toBeFalse();

            queryResult = await directDatabaseAccess.list(query(initialTombstoneId));
            quads = new SparqlQuerying().asQuads(queryResult, bestuurseenheid.userGraph().value);

            expect(quads).toHaveLength(5);

            queryResult = await directDatabaseAccess.list(query(nextTombstoneId));
            quads = new SparqlQuerying().asQuads(queryResult, bestuurseenheid.userGraph().value);

            expect(quads).toHaveLength(5);

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

    describe('syncNeedsConversionFromFormalToInformal', () => {

        test('given formal, nl and informal instance, when choose informal, then set needsConversionFromFormalToInformal on true for formal and nl instance of that bestuurseenheid', async () => {
            const bestuurseenheid = aBestuurseenheid().build();
            await bestuurseenheidRepository.save(bestuurseenheid);

            const anotherBestuurseenheid = aBestuurseenheid().build();
            await bestuurseenheidRepository.save(bestuurseenheid);

            const formalInstance = aMinimalInstance().withDutchLanguageVariant(Language.FORMAL).withCreatedBy(bestuurseenheid.id).build();
            const informalInstance = aMinimalInstance().withDutchLanguageVariant(Language.INFORMAL).withCreatedBy(bestuurseenheid.id).build();
            const nlInstance = aMinimalInstance().withDutchLanguageVariant(Language.NL).withCreatedBy(bestuurseenheid.id).build();


            const formalInstanceForOtherBestuurseenheid = aMinimalInstance().withDutchLanguageVariant(Language.FORMAL).withCreatedBy(anotherBestuurseenheid.id).build();
            const informalInstanceForOtherBestuurseenheid = aMinimalInstance().withDutchLanguageVariant(Language.INFORMAL).withCreatedBy(anotherBestuurseenheid.id).build();
            const nlInstanceForOtherBestuurseenheid = aMinimalInstance().withDutchLanguageVariant(Language.NL).withCreatedBy(anotherBestuurseenheid.id).build();

            await repository.save(bestuurseenheid, formalInstance);
            await repository.save(bestuurseenheid, informalInstance);
            await repository.save(bestuurseenheid, nlInstance);

            await repository.save(anotherBestuurseenheid, formalInstanceForOtherBestuurseenheid);
            await repository.save(anotherBestuurseenheid, informalInstanceForOtherBestuurseenheid);
            await repository.save(anotherBestuurseenheid, nlInstanceForOtherBestuurseenheid);

            await repository.syncNeedsConversionFromFormalToInformal(bestuurseenheid, ChosenFormType.INFORMAL);

            const actualFormalInstance = await repository.findById(bestuurseenheid, formalInstance.id);
            const actualInformalInstance = await repository.findById(bestuurseenheid, informalInstance.id);
            const actualNlInstance = await repository.findById(bestuurseenheid, nlInstance.id);

            const actualFormalInstanceForOtherBestuurseenheid = await repository.findById(anotherBestuurseenheid, formalInstanceForOtherBestuurseenheid.id);
            const actualInformalInstanceForOtherBestuurseenheid = await repository.findById(anotherBestuurseenheid, informalInstanceForOtherBestuurseenheid.id);
            const actualNlInstanceForOtherBestuurseenheid = await repository.findById(anotherBestuurseenheid, nlInstanceForOtherBestuurseenheid.id);


            expect(actualFormalInstance.needsConversionFromFormalToInformal).toBeTrue();
            expect(actualFormalInstance.dateModified).not.toEqual(InstanceTestBuilder.DATE_MODIFIED);
            expect(actualInformalInstance.needsConversionFromFormalToInformal).toBeFalse();
            expect(actualInformalInstance.dateModified).toEqual(InstanceTestBuilder.DATE_MODIFIED);
            expect(actualNlInstance.needsConversionFromFormalToInformal).toBeTrue();
            expect(actualNlInstance.dateModified).not.toEqual(InstanceTestBuilder.DATE_MODIFIED);

            expect(actualFormalInstanceForOtherBestuurseenheid.needsConversionFromFormalToInformal).toBeFalse();
            expect(actualFormalInstanceForOtherBestuurseenheid.dateModified).toEqual(InstanceTestBuilder.DATE_MODIFIED);
            expect(actualInformalInstanceForOtherBestuurseenheid.needsConversionFromFormalToInformal).toBeFalse();
            expect(actualInformalInstanceForOtherBestuurseenheid.dateModified).toEqual(InstanceTestBuilder.DATE_MODIFIED);
            expect(actualNlInstanceForOtherBestuurseenheid.needsConversionFromFormalToInformal).toBeFalse();
            expect(actualNlInstanceForOtherBestuurseenheid.dateModified).toEqual(InstanceTestBuilder.DATE_MODIFIED);
        });

        test('given formal, nl  and informal instance, when choose formal, then needsConversionFromFormalToInformal remains false', async () => {
            const bestuurseenheid = aBestuurseenheid().build();
            await bestuurseenheidRepository.save(bestuurseenheid);

            const anotherBestuurseenheid = aBestuurseenheid().build();
            await bestuurseenheidRepository.save(bestuurseenheid);

            const formalInstance = aMinimalInstance().withDutchLanguageVariant(Language.FORMAL).withCreatedBy(bestuurseenheid.id).build();
            const informalInstance = aMinimalInstance().withDutchLanguageVariant(Language.INFORMAL).withCreatedBy(bestuurseenheid.id).build();
            const nlInstance = aMinimalInstance().withDutchLanguageVariant(Language.NL).withCreatedBy(bestuurseenheid.id).build();

            const formalInstanceForOtherBestuurseenheid = aMinimalInstance().withDutchLanguageVariant(Language.FORMAL).withCreatedBy(anotherBestuurseenheid.id).build();
            const informalInstanceForOtherBestuurseenheid = aMinimalInstance().withDutchLanguageVariant(Language.INFORMAL).withCreatedBy(anotherBestuurseenheid.id).build();
            const nlInstanceForOtherBestuurseenheid = aMinimalInstance().withDutchLanguageVariant(Language.NL).withCreatedBy(anotherBestuurseenheid.id).build();

            await repository.save(bestuurseenheid, formalInstance);
            await repository.save(bestuurseenheid, informalInstance);
            await repository.save(bestuurseenheid, nlInstance);
            await repository.save(anotherBestuurseenheid, formalInstanceForOtherBestuurseenheid);
            await repository.save(anotherBestuurseenheid, informalInstanceForOtherBestuurseenheid);
            await repository.save(anotherBestuurseenheid, nlInstanceForOtherBestuurseenheid);

            await repository.syncNeedsConversionFromFormalToInformal(bestuurseenheid, ChosenFormType.FORMAL);

            const actualFormalInstance = await repository.findById(bestuurseenheid, formalInstance.id);
            const actualInformalInstance = await repository.findById(bestuurseenheid, informalInstance.id);
            const actualNlInstance = await repository.findById(bestuurseenheid, nlInstance.id);

            const actualFormalInstanceForOtherBestuurseenheid = await repository.findById(anotherBestuurseenheid, formalInstanceForOtherBestuurseenheid.id);
            const actualInformalInstanceForOtherBestuurseenheid = await repository.findById(anotherBestuurseenheid, informalInstanceForOtherBestuurseenheid.id);
            const actualNlInstanceForOtherBestuurseenheid = await repository.findById(anotherBestuurseenheid, nlInstanceForOtherBestuurseenheid.id);

            expect(actualFormalInstance.needsConversionFromFormalToInformal).toBeFalse();
            expect(actualFormalInstance.dateModified).toEqual(InstanceTestBuilder.DATE_MODIFIED);
            expect(actualInformalInstance.needsConversionFromFormalToInformal).toBeFalse();
            expect(actualInformalInstance.dateModified).toEqual(InstanceTestBuilder.DATE_MODIFIED);
            expect(actualNlInstance.needsConversionFromFormalToInformal).toBeFalse();
            expect(actualNlInstance.dateModified).toEqual(InstanceTestBuilder.DATE_MODIFIED);

            expect(actualFormalInstanceForOtherBestuurseenheid.needsConversionFromFormalToInformal).toBeFalse();
            expect(actualFormalInstanceForOtherBestuurseenheid.dateModified).toEqual(InstanceTestBuilder.DATE_MODIFIED);
            expect(actualInformalInstanceForOtherBestuurseenheid.needsConversionFromFormalToInformal).toBeFalse();
            expect(actualInformalInstanceForOtherBestuurseenheid.dateModified).toEqual(InstanceTestBuilder.DATE_MODIFIED);
            expect(actualNlInstanceForOtherBestuurseenheid.needsConversionFromFormalToInformal).toBeFalse();
            expect(actualNlInstanceForOtherBestuurseenheid.dateModified).toEqual(InstanceTestBuilder.DATE_MODIFIED);
        });

        test('when no triple exists for NeedsConversionFromFormalToInformal sync still inserts true triple', async () => {
            const instanceUUID = uuid();
            const bestuurseenheid = aBestuurseenheid().build();
            const instanceId = InstanceBuilder.buildIri(instanceUUID);

            await directDatabaseAccess.insertData(
                `${bestuurseenheid.userGraph()}`,
                [
                    `<${instanceId}> a <https://productencatalogus.data.vlaanderen.be/ns/ipdc-lpdc#InstancePublicService>`,
                    `<${instanceId}> <http://purl.org/pav/createdBy> <${bestuurseenheid.id.value}>`,
                    `<${instanceId}> <http://mu.semte.ch/vocabularies/core/uuid> """${instanceUUID}"""`,
                    `<${instanceId}> <http://schema.org/dateCreated> """${InstanceTestBuilder.DATE_CREATED.value}"""^^<http://www.w3.org/2001/XMLSchema#dateTime>`,
                    `<${instanceId}> <http://schema.org/dateModified> """${InstanceTestBuilder.DATE_MODIFIED.value}"""^^<http://www.w3.org/2001/XMLSchema#dateTime>`,
                    `<${instanceId}> <https://productencatalogus.data.vlaanderen.be/ns/ipdc-lpdc#dutchLanguageVariant> """${Language.FORMAL}"""`,
                    `<${instanceId}> <http://www.w3.org/ns/adms#status> <http://lblod.data.gift/concepts/instance-status/ontwerp>`
                ]
            );

            await repository.syncNeedsConversionFromFormalToInformal(bestuurseenheid, ChosenFormType.INFORMAL);
            const actualInstance = await repository.findById(bestuurseenheid, instanceId);

            expect(actualInstance.needsConversionFromFormalToInformal).toEqual(true);
            expect(actualInstance.dateModified).not.toEqual(InstanceTestBuilder.DATE_MODIFIED);
        });
    });

    describe('isPublishedToIpdc', () => {

        test('when multiple publishedInstanceSnapshots exists, and latest is published return true', async () => {
            const bestuurseenheid = aBestuurseenheid().build();
            await bestuurseenheidRepository.save(bestuurseenheid);

            const sentDate1 = FormatPreservingDate.of('2024-01-16T00:00:00.672Z');
            const datePublished1 = FormatPreservingDate.of('2024-01-16T00:01:00.672Z');
            const sentDate2 = FormatPreservingDate.of('2024-01-17T00:00:00.672Z');
            const datePublished2 = FormatPreservingDate.of('2024-01-17T00:01:00.672Z');

            const instance = aFullInstance()
                .withStatus(InstanceStatusType.VERZONDEN)
                .withDateSent(sentDate2)
                .build();

            const publishedInstanceId1 = PublishedInstanceSnapshotBuilder.buildIri(uuid());
            const publishedInstanceId2 = PublishedInstanceSnapshotBuilder.buildIri(uuid());

            await directDatabaseAccess.insertData(
                bestuurseenheid.userGraph().value,
                [
                    `<${publishedInstanceId1}> a ${NS.lpdcExt('PublishedInstancePublicServiceSnapshot')}`,
                    `<${publishedInstanceId1}> ${NS.lpdcExt('isPublishedVersionOf')} <${instance.id}> .`,
                    `<${publishedInstanceId1}> ${NS.prov('generatedAtTime')} "${sentDate1.value}"^^<http://www.w3.org/2001/XMLSchema#dateTime> .`,
                    `<${publishedInstanceId1}> ${NS.schema('datePublished')} "${datePublished1.value}"^^<http://www.w3.org/2001/XMLSchema#dateTime> .`,

                    `<${publishedInstanceId2}> a ${NS.lpdcExt('PublishedInstancePublicServiceSnapshot')}`,
                    `<${publishedInstanceId2}> ${NS.lpdcExt('isPublishedVersionOf')} <${instance.id}> .`,
                    `<${publishedInstanceId2}> ${NS.prov('generatedAtTime')} "${sentDate2.value}"^^<http://www.w3.org/2001/XMLSchema#dateTime> .`,
                    `<${publishedInstanceId2}> ${NS.schema('datePublished')} "${datePublished2.value}"^^<http://www.w3.org/2001/XMLSchema#dateTime> .`,
                ],
            );

            const actual = await repository.isPublishedToIpdc(bestuurseenheid, instance);
            expect(actual).toBeTrue();
        });

        test('when multiple publishedInstanceSnapshots exists, and latest is NOT published return false', async () => {
            const bestuurseenheid = aBestuurseenheid().build();
            await bestuurseenheidRepository.save(bestuurseenheid);

            const sentDate1 = FormatPreservingDate.of('2024-01-16T00:00:00.672Z');
            const datePublished1 = FormatPreservingDate.of('2024-01-16T00:01:00.672Z');
            const sentDate2 = FormatPreservingDate.of('2024-01-17T00:00:00.672Z');

            const instance = aFullInstance()
                .withStatus(InstanceStatusType.VERZONDEN)
                .withDateSent(sentDate2)
                .build();

            const publishedInstanceId1 = PublishedInstanceSnapshotBuilder.buildIri(uuid());
            const publishedInstanceId2 = PublishedInstanceSnapshotBuilder.buildIri(uuid());

            await directDatabaseAccess.insertData(
                bestuurseenheid.userGraph().value,
                [
                    `<${publishedInstanceId1}> a ${NS.lpdcExt('PublishedInstancePublicServiceSnapshot')}`,
                    `<${publishedInstanceId1}> ${NS.lpdcExt('isPublishedVersionOf')} <${instance.id}> .`,
                    `<${publishedInstanceId1}> ${NS.prov('generatedAtTime')} "${sentDate1.value}"^^<http://www.w3.org/2001/XMLSchema#dateTime> .`,
                    `<${publishedInstanceId1}> ${NS.schema('datePublished')} "${datePublished1.value}"^^<http://www.w3.org/2001/XMLSchema#dateTime> .`,

                    `<${publishedInstanceId2}> a ${NS.lpdcExt('PublishedInstancePublicServiceSnapshot')}`,
                    `<${publishedInstanceId2}> ${NS.lpdcExt('isPublishedVersionOf')} <${instance.id}> .`,
                    `<${publishedInstanceId2}> ${NS.prov('generatedAtTime')} "${sentDate2.value}"^^<http://www.w3.org/2001/XMLSchema#dateTime> .`,
                ],
            );

            const actual = await repository.isPublishedToIpdc(bestuurseenheid, instance);
            expect(actual).toBeFalse();
        });

        test('when no verzonden instance, return false', async () => {
            const bestuurseenheid = aBestuurseenheid().build();
            await bestuurseenheidRepository.save(bestuurseenheid);

            const instance = aFullInstance()
                .withStatus(InstanceStatusType.ONTWERP)
                .withDateSent(undefined)
                .build();

            const actual = await repository.isPublishedToIpdc(bestuurseenheid, instance);
            expect(actual).toBeFalse();
        });
    });

    describe('Verify ontology and mapping', () => {

        test('verify saved instance is same as loaded', async () => {
            const bestuurseenheid = aBestuurseenheid().build();
            const instance = aFullInstance()
                .withNeedsConversionFromFormalToInformal(true)
                .withForMunicipalityMerger(true)
                .build();

            await repository.save(bestuurseenheid, instance);
            const savedInstance = await repository.findById(bestuurseenheid, instance.id);
            expect(instance).toEqual(savedInstance);
        });

        test('Verify minimal mapping', async () => {
            const instanceUUID = uuid();
            const instanceId = InstanceBuilder.buildIri(instanceUUID);
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
                    .withDutchLanguageVariant(Language.INFORMAL)
                    .withNeedsConversionFromFormalToInformal(true)
                    .withStatus(InstanceStatusType.ONTWERP)
                    .withForMunicipalityMerger(true)
                    .build();

            await directDatabaseAccess.insertData(
                `${bestuurseenheid.userGraph()}`,
                [
                    `<${instanceId}> a <https://productencatalogus.data.vlaanderen.be/ns/ipdc-lpdc#InstancePublicService>`,
                    `<${instanceId}> <http://purl.org/pav/createdBy> <${bestuurseenheid.id.value}>`,
                    `<${instanceId}> <http://mu.semte.ch/vocabularies/core/uuid> """${instanceUUID}"""`,
                    `<${instanceId}> <http://schema.org/dateCreated> """${instanceDateCreated.value}"""^^<http://www.w3.org/2001/XMLSchema#dateTime>`,
                    `<${instanceId}> <http://schema.org/dateModified> """${instanceDateModified.value}"""^^<http://www.w3.org/2001/XMLSchema#dateTime>`,
                    `<${instanceId}> <https://productencatalogus.data.vlaanderen.be/ns/ipdc-lpdc#dutchLanguageVariant> """${Language.INFORMAL}"""`,
                    `<${instanceId}> <https://productencatalogus.data.vlaanderen.be/ns/ipdc-lpdc#needsConversionFromFormalToInformal> """true"""^^<http://www.w3.org/2001/XMLSchema#boolean>`,
                    `<${instanceId}> <http://www.w3.org/ns/adms#status> <http://lblod.data.gift/concepts/instance-status/ontwerp>`,
                    `<${instanceId}> <https://productencatalogus.data.vlaanderen.be/ns/ipdc-lpdc#forMunicipalityMerger> """true"""^^<http://www.w3.org/2001/XMLSchema#boolean>`,
                ]);


            const actualInstance = await repository.findById(bestuurseenheid, instanceId);

            expect(actualInstance).toEqual(instance);
        });

        test('Verify full mapping', async () => {
            const instanceUUID = uuid();
            const instanceId = InstanceBuilder.buildIri(instanceUUID);
            const bestuurseenheid = aBestuurseenheid().build();

            const instance =
                aFullInstance()
                    .withId(instanceId)
                    .withUuid(instanceUUID)
                    .withCreatedBy(bestuurseenheid.id)
                    .withStatus(InstanceStatusType.VERZONDEN)
                    .withSpatials(
                        [
                            buildNutsCodeIri(45700),
                            buildNutsCodeIri(52000),
                            buildNutsCodeIri(98786)]
                    ).withCopyOf(InstanceBuilder.buildIri(uuid()))
                    .build();


            await directDatabaseAccess.insertData(
                `${bestuurseenheid.userGraph()}`,
                [
                    `<${instanceId}> a <https://productencatalogus.data.vlaanderen.be/ns/ipdc-lpdc#InstancePublicService>`,
                    `<${instanceId}> <http://purl.org/pav/createdBy> <${bestuurseenheid.id.value}>`,
                    `<${instanceId}> <http://mu.semte.ch/vocabularies/core/uuid> """${instanceUUID}"""`,
                    `<${instanceId}> <http://purl.org/dc/terms/title> """${InstanceTestBuilder.TITLE_NL_FORMAL}"""@nl-BE-x-formal`,
                    `<${instanceId}> <http://purl.org/dc/terms/description> """${InstanceTestBuilder.DESCRIPTION_NL_FORMAL}"""@nl-BE-x-formal`,
                    `<${instanceId}> <https://productencatalogus.data.vlaanderen.be/ns/ipdc-lpdc#additionalDescription> """${InstanceTestBuilder.ADDITIONAL_DESCRIPTION_NL_FORMAL}"""@nl-BE-x-formal`,
                    `<${instanceId}> <https://productencatalogus.data.vlaanderen.be/ns/ipdc-lpdc#exception> """${InstanceTestBuilder.EXCEPTION_NL_FORMAL}"""@nl-BE-x-formal`,
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
                    `<${instanceId}> <http://www.w3.org/ns/dcat#keyword> """${InstanceTestBuilder.KEYWORDS[0].nl}"""@nl`,
                    `<${instanceId}> <http://www.w3.org/ns/dcat#keyword> """${InstanceTestBuilder.KEYWORDS[1].nl}"""@nl`,

                    `<${instanceId}> <http://vocab.belgif.be/ns/publicservice#hasRequirement> <${InstanceTestBuilder.REQUIREMENTS[1].id}>`,
                    `<${InstanceTestBuilder.REQUIREMENTS[1].id}> a <http://data.europa.eu/m8g/Requirement>`,
                    `<${InstanceTestBuilder.REQUIREMENTS[1].id}> <http://mu.semte.ch/vocabularies/core/uuid> """${InstanceTestBuilder.REQUIREMENTS[1].uuid}"""`,
                    `<${InstanceTestBuilder.REQUIREMENTS[1].id}> <http://purl.org/dc/terms/title> """${InstanceTestBuilder.REQUIREMENTS[1].title.nlFormal}"""@nl-BE-x-formal`,
                    `<${InstanceTestBuilder.REQUIREMENTS[1].id}> <http://purl.org/dc/terms/description> """${InstanceTestBuilder.REQUIREMENTS[1].description.nlFormal}"""@nl-BE-x-formal`,
                    `<${InstanceTestBuilder.REQUIREMENTS[1].id}> <http://www.w3.org/ns/shacl#order> """2"""^^<http://www.w3.org/2001/XMLSchema#integer>`,
                    `<${InstanceTestBuilder.REQUIREMENTS[1].id}> <http://data.europa.eu/m8g/hasSupportingEvidence> <${InstanceTestBuilder.REQUIREMENTS[1].evidence.id}>`,
                    `<${InstanceTestBuilder.REQUIREMENTS[1].evidence.id}> a <http://data.europa.eu/m8g/Evidence>`,
                    `<${InstanceTestBuilder.REQUIREMENTS[1].evidence.id}> <http://mu.semte.ch/vocabularies/core/uuid> """${InstanceTestBuilder.REQUIREMENTS[1].evidence.uuid}"""`,
                    `<${InstanceTestBuilder.REQUIREMENTS[1].evidence.id}> <http://purl.org/dc/terms/title> """${InstanceTestBuilder.REQUIREMENTS[1].evidence.title.nlFormal}"""@nl-BE-x-formal`,
                    `<${InstanceTestBuilder.REQUIREMENTS[1].evidence.id}> <http://purl.org/dc/terms/description> """${InstanceTestBuilder.REQUIREMENTS[1].evidence.description.nlFormal}"""@nl-BE-x-formal`,
                    `<${instanceId}> <http://vocab.belgif.be/ns/publicservice#hasRequirement> <${InstanceTestBuilder.REQUIREMENTS[0].id}>`,
                    `<${InstanceTestBuilder.REQUIREMENTS[0].id}> a <http://data.europa.eu/m8g/Requirement>`,
                    `<${InstanceTestBuilder.REQUIREMENTS[0].id}> <http://mu.semte.ch/vocabularies/core/uuid> """${InstanceTestBuilder.REQUIREMENTS[0].uuid}"""`,
                    `<${InstanceTestBuilder.REQUIREMENTS[0].id}> <http://purl.org/dc/terms/title> """${InstanceTestBuilder.REQUIREMENTS[0].title.nlFormal}"""@nl-BE-x-formal`,
                    `<${InstanceTestBuilder.REQUIREMENTS[0].id}> <http://purl.org/dc/terms/description> """${InstanceTestBuilder.REQUIREMENTS[0].description.nlFormal}"""@nl-BE-x-formal`,
                    `<${InstanceTestBuilder.REQUIREMENTS[0].id}> <http://www.w3.org/ns/shacl#order> """1"""^^<http://www.w3.org/2001/XMLSchema#integer>`,
                    `<${InstanceTestBuilder.REQUIREMENTS[0].id}> <http://data.europa.eu/m8g/hasSupportingEvidence> <${InstanceTestBuilder.REQUIREMENTS[0].evidence.id}>`,
                    `<${InstanceTestBuilder.REQUIREMENTS[0].evidence.id}> a <http://data.europa.eu/m8g/Evidence>`,
                    `<${InstanceTestBuilder.REQUIREMENTS[0].evidence.id}> <http://mu.semte.ch/vocabularies/core/uuid> """${InstanceTestBuilder.REQUIREMENTS[0].evidence.uuid}"""`,
                    `<${InstanceTestBuilder.REQUIREMENTS[0].evidence.id}> <http://purl.org/dc/terms/title> """${InstanceTestBuilder.REQUIREMENTS[0].evidence.title.nlFormal}"""@nl-BE-x-formal`,
                    `<${InstanceTestBuilder.REQUIREMENTS[0].evidence.id}> <http://purl.org/dc/terms/description> """${InstanceTestBuilder.REQUIREMENTS[0].evidence.description.nlFormal}"""@nl-BE-x-formal`,

                    `<${instanceId}> <http://purl.org/vocab/cpsv#follows> <${InstanceTestBuilder.PROCEDURES[1].id}>`,
                    `<${InstanceTestBuilder.PROCEDURES[1].id}> a <http://purl.org/vocab/cpsv#Rule>`,
                    `<${InstanceTestBuilder.PROCEDURES[1].id}> <http://mu.semte.ch/vocabularies/core/uuid> """${InstanceTestBuilder.PROCEDURES[1].uuid}"""`,
                    `<${InstanceTestBuilder.PROCEDURES[1].id}> <http://purl.org/dc/terms/title> """${InstanceTestBuilder.PROCEDURES[1].title.nlFormal}"""@nl-BE-x-formal`,
                    `<${InstanceTestBuilder.PROCEDURES[1].id}> <http://purl.org/dc/terms/description> """${InstanceTestBuilder.PROCEDURES[1].description.nlFormal}"""@nl-BE-x-formal`,
                    `<${InstanceTestBuilder.PROCEDURES[1].id}> <http://www.w3.org/ns/shacl#order> """2"""^^<http://www.w3.org/2001/XMLSchema#integer>`,
                    `<${InstanceTestBuilder.PROCEDURES[1].id}> <https://productencatalogus.data.vlaanderen.be/ns/ipdc-lpdc#hasWebsite> <${InstanceTestBuilder.PROCEDURES[1].websites[1].id}>`,
                    `<${InstanceTestBuilder.PROCEDURES[1].websites[1].id}> a <http://schema.org/WebSite>`,
                    `<${InstanceTestBuilder.PROCEDURES[1].websites[1].id}> <http://mu.semte.ch/vocabularies/core/uuid> """${InstanceTestBuilder.PROCEDURES[1].websites[1].uuid}"""`,
                    `<${InstanceTestBuilder.PROCEDURES[1].websites[1].id}> <http://purl.org/dc/terms/title> """${InstanceTestBuilder.PROCEDURES[1].websites[1].title.nlFormal}"""@nl-BE-x-formal`,
                    `<${InstanceTestBuilder.PROCEDURES[1].websites[1].id}> <http://purl.org/dc/terms/description> """${InstanceTestBuilder.PROCEDURES[1].websites[1].description.nlFormal}"""@nl-BE-x-formal`,
                    `<${InstanceTestBuilder.PROCEDURES[1].websites[1].id}> <http://schema.org/url> """${InstanceTestBuilder.PROCEDURES[1].websites[1].url}"""`,
                    `<${InstanceTestBuilder.PROCEDURES[1].websites[1].id}> <http://www.w3.org/ns/shacl#order> """2"""^^<http://www.w3.org/2001/XMLSchema#integer>`,
                    `<${InstanceTestBuilder.PROCEDURES[1].id}> <https://productencatalogus.data.vlaanderen.be/ns/ipdc-lpdc#hasWebsite> <${InstanceTestBuilder.PROCEDURES[1].websites[0].id}>`,
                    `<${InstanceTestBuilder.PROCEDURES[1].websites[0].id}> a <http://schema.org/WebSite>`,
                    `<${InstanceTestBuilder.PROCEDURES[1].websites[0].id}> <http://mu.semte.ch/vocabularies/core/uuid> """${InstanceTestBuilder.PROCEDURES[1].websites[0].uuid}"""`,
                    `<${InstanceTestBuilder.PROCEDURES[1].websites[0].id}> <http://purl.org/dc/terms/title> """${InstanceTestBuilder.PROCEDURES[1].websites[0].title.nlFormal}"""@nl-BE-x-formal`,
                    `<${InstanceTestBuilder.PROCEDURES[1].websites[0].id}> <http://purl.org/dc/terms/description> """${InstanceTestBuilder.PROCEDURES[1].websites[0].description.nlFormal}"""@nl-BE-x-formal`,
                    `<${InstanceTestBuilder.PROCEDURES[1].websites[0].id}> <http://schema.org/url> """${InstanceTestBuilder.PROCEDURES[1].websites[0].url}"""`,
                    `<${InstanceTestBuilder.PROCEDURES[1].websites[0].id}> <http://www.w3.org/ns/shacl#order> """1"""^^<http://www.w3.org/2001/XMLSchema#integer>`,
                    `<${instanceId}> <http://purl.org/vocab/cpsv#follows> <${InstanceTestBuilder.PROCEDURES[0].id}>`,
                    `<${InstanceTestBuilder.PROCEDURES[0].id}> a <http://purl.org/vocab/cpsv#Rule>`,
                    `<${InstanceTestBuilder.PROCEDURES[0].id}> <http://mu.semte.ch/vocabularies/core/uuid> """${InstanceTestBuilder.PROCEDURES[0].uuid}"""`,
                    `<${InstanceTestBuilder.PROCEDURES[0].id}> <http://purl.org/dc/terms/title> """${InstanceTestBuilder.PROCEDURES[0].title.nlFormal}"""@nl-BE-x-formal`,
                    `<${InstanceTestBuilder.PROCEDURES[0].id}> <http://purl.org/dc/terms/description> """${InstanceTestBuilder.PROCEDURES[0].description.nlFormal}"""@nl-BE-x-formal`,
                    `<${InstanceTestBuilder.PROCEDURES[0].id}> <http://www.w3.org/ns/shacl#order> """1"""^^<http://www.w3.org/2001/XMLSchema#integer>`,
                    `<${InstanceTestBuilder.PROCEDURES[0].id}> <https://productencatalogus.data.vlaanderen.be/ns/ipdc-lpdc#hasWebsite> <${InstanceTestBuilder.PROCEDURES[0].websites[1].id}>`,
                    `<${InstanceTestBuilder.PROCEDURES[0].websites[1].id}> a <http://schema.org/WebSite>`,
                    `<${InstanceTestBuilder.PROCEDURES[0].websites[1].id}> <http://mu.semte.ch/vocabularies/core/uuid> """${InstanceTestBuilder.PROCEDURES[0].websites[1].uuid}"""`,
                    `<${InstanceTestBuilder.PROCEDURES[0].websites[1].id}> <http://purl.org/dc/terms/title> """${InstanceTestBuilder.PROCEDURES[0].websites[1].title.nlFormal}"""@nl-BE-x-formal`,
                    `<${InstanceTestBuilder.PROCEDURES[0].websites[1].id}> <http://purl.org/dc/terms/description> """${InstanceTestBuilder.PROCEDURES[0].websites[1].description.nlFormal}"""@nl-BE-x-formal`,
                    `<${InstanceTestBuilder.PROCEDURES[0].websites[1].id}> <http://schema.org/url> """${InstanceTestBuilder.PROCEDURES[0].websites[1].url}"""`,
                    `<${InstanceTestBuilder.PROCEDURES[0].websites[1].id}> <http://www.w3.org/ns/shacl#order> """2"""^^<http://www.w3.org/2001/XMLSchema#integer>`,
                    `<${InstanceTestBuilder.PROCEDURES[0].id}> <https://productencatalogus.data.vlaanderen.be/ns/ipdc-lpdc#hasWebsite> <${InstanceTestBuilder.PROCEDURES[0].websites[0].id}>`,
                    `<${InstanceTestBuilder.PROCEDURES[0].websites[0].id}> a <http://schema.org/WebSite>`,
                    `<${InstanceTestBuilder.PROCEDURES[0].websites[0].id}> <http://mu.semte.ch/vocabularies/core/uuid> """${InstanceTestBuilder.PROCEDURES[0].websites[0].uuid}"""`,
                    `<${InstanceTestBuilder.PROCEDURES[0].websites[0].id}> <http://purl.org/dc/terms/title> """${InstanceTestBuilder.PROCEDURES[0].websites[0].title.nlFormal}"""@nl-BE-x-formal`,
                    `<${InstanceTestBuilder.PROCEDURES[0].websites[0].id}> <http://purl.org/dc/terms/description> """${InstanceTestBuilder.PROCEDURES[0].websites[0].description.nlFormal}"""@nl-BE-x-formal`,
                    `<${InstanceTestBuilder.PROCEDURES[0].websites[0].id}> <http://schema.org/url> """${InstanceTestBuilder.PROCEDURES[0].websites[0].url}"""`,
                    `<${InstanceTestBuilder.PROCEDURES[0].websites[0].id}> <http://www.w3.org/ns/shacl#order> """1"""^^<http://www.w3.org/2001/XMLSchema#integer>`,

                    `<${instanceId}> <http://www.w3.org/2000/01/rdf-schema#seeAlso> <${InstanceTestBuilder.WEBSITES[1].id}>`,
                    `<${InstanceTestBuilder.WEBSITES[1].id}> a <http://schema.org/WebSite>`,
                    `<${InstanceTestBuilder.WEBSITES[1].id}> <http://mu.semte.ch/vocabularies/core/uuid> """${InstanceTestBuilder.WEBSITES[1].uuid}"""`,
                    `<${InstanceTestBuilder.WEBSITES[1].id}> <http://purl.org/dc/terms/title> """${InstanceTestBuilder.WEBSITES[1].title.nlFormal}"""@nl-BE-x-formal`,
                    `<${InstanceTestBuilder.WEBSITES[1].id}> <http://purl.org/dc/terms/description> """${InstanceTestBuilder.WEBSITES[1].description.nlFormal}"""@nl-BE-x-formal`,
                    `<${InstanceTestBuilder.WEBSITES[1].id}> <http://schema.org/url> """${InstanceTestBuilder.WEBSITES[1].url}"""`,
                    `<${InstanceTestBuilder.WEBSITES[1].id}> <http://www.w3.org/ns/shacl#order> """2"""^^<http://www.w3.org/2001/XMLSchema#integer>`,
                    `<${instanceId}> <http://www.w3.org/2000/01/rdf-schema#seeAlso> <${InstanceTestBuilder.WEBSITES[0].id}>`,
                    `<${InstanceTestBuilder.WEBSITES[0].id}> a <http://schema.org/WebSite>`,
                    `<${InstanceTestBuilder.WEBSITES[0].id}> <http://mu.semte.ch/vocabularies/core/uuid> """${InstanceTestBuilder.WEBSITES[0].uuid}"""`,
                    `<${InstanceTestBuilder.WEBSITES[0].id}> <http://purl.org/dc/terms/title> """${InstanceTestBuilder.WEBSITES[0].title.nlFormal}"""@nl-BE-x-formal`,
                    `<${InstanceTestBuilder.WEBSITES[0].id}> <http://purl.org/dc/terms/description> """${InstanceTestBuilder.WEBSITES[0].description.nlFormal}"""@nl-BE-x-formal`,
                    `<${InstanceTestBuilder.WEBSITES[0].id}> <http://schema.org/url> """${InstanceTestBuilder.WEBSITES[0].url}"""`,
                    `<${InstanceTestBuilder.WEBSITES[0].id}> <http://www.w3.org/ns/shacl#order> """1"""^^<http://www.w3.org/2001/XMLSchema#integer>`,

                    `<${instanceId}> <http://data.europa.eu/m8g/hasCost> <${InstanceTestBuilder.COSTS[1].id}>`,
                    `<${InstanceTestBuilder.COSTS[1].id}> a <http://data.europa.eu/m8g/Cost>`,
                    `<${InstanceTestBuilder.COSTS[1].id}> <http://mu.semte.ch/vocabularies/core/uuid> """${InstanceTestBuilder.COSTS[1].uuid}"""`,
                    `<${InstanceTestBuilder.COSTS[1].id}> <http://purl.org/dc/terms/title> """${InstanceTestBuilder.COSTS[1].title.nlFormal}"""@nl-BE-x-formal`,
                    `<${InstanceTestBuilder.COSTS[1].id}> <http://purl.org/dc/terms/description> """${InstanceTestBuilder.COSTS[1].description.nlFormal}"""@nl-BE-x-formal`,
                    `<${InstanceTestBuilder.COSTS[1].id}> <http://www.w3.org/ns/shacl#order> """2"""^^<http://www.w3.org/2001/XMLSchema#integer>`,
                    `<${instanceId}> <http://data.europa.eu/m8g/hasCost> <${InstanceTestBuilder.COSTS[0].id}>`,
                    `<${InstanceTestBuilder.COSTS[0].id}> a <http://data.europa.eu/m8g/Cost>`,
                    `<${InstanceTestBuilder.COSTS[0].id}> <http://mu.semte.ch/vocabularies/core/uuid> """${InstanceTestBuilder.COSTS[0].uuid}"""`,
                    `<${InstanceTestBuilder.COSTS[0].id}> <http://purl.org/dc/terms/title> """${InstanceTestBuilder.COSTS[0].title.nlFormal}"""@nl-BE-x-formal`,
                    `<${InstanceTestBuilder.COSTS[0].id}> <http://purl.org/dc/terms/description> """${InstanceTestBuilder.COSTS[0].description.nlFormal}"""@nl-BE-x-formal`,
                    `<${InstanceTestBuilder.COSTS[0].id}> <http://www.w3.org/ns/shacl#order> """1"""^^<http://www.w3.org/2001/XMLSchema#integer>`,

                    `<${instanceId}> <http://purl.org/vocab/cpsv#produces> <${InstanceTestBuilder.FINANCIAL_ADVANTAGES[1].id}>`,
                    `<${InstanceTestBuilder.FINANCIAL_ADVANTAGES[1].id}> a <https://productencatalogus.data.vlaanderen.be/ns/ipdc-lpdc#FinancialAdvantage>`,
                    `<${InstanceTestBuilder.FINANCIAL_ADVANTAGES[1].id}> <http://mu.semte.ch/vocabularies/core/uuid> """${InstanceTestBuilder.FINANCIAL_ADVANTAGES[1].uuid}"""`,
                    `<${InstanceTestBuilder.FINANCIAL_ADVANTAGES[1].id}> <http://purl.org/dc/terms/title> """${InstanceTestBuilder.FINANCIAL_ADVANTAGES[1].title.nlFormal}"""@nl-BE-x-formal`,
                    `<${InstanceTestBuilder.FINANCIAL_ADVANTAGES[1].id}> <http://purl.org/dc/terms/description> """${InstanceTestBuilder.FINANCIAL_ADVANTAGES[1].description.nlFormal}"""@nl-BE-x-formal`,
                    `<${InstanceTestBuilder.FINANCIAL_ADVANTAGES[1].id}> <http://www.w3.org/ns/shacl#order> """2"""^^<http://www.w3.org/2001/XMLSchema#integer>`,
                    `<${instanceId}> <http://purl.org/vocab/cpsv#produces> <${InstanceTestBuilder.FINANCIAL_ADVANTAGES[0].id}>`,
                    `<${InstanceTestBuilder.FINANCIAL_ADVANTAGES[0].id}> a <https://productencatalogus.data.vlaanderen.be/ns/ipdc-lpdc#FinancialAdvantage>`,
                    `<${InstanceTestBuilder.FINANCIAL_ADVANTAGES[0].id}> <http://mu.semte.ch/vocabularies/core/uuid> """${InstanceTestBuilder.FINANCIAL_ADVANTAGES[0].uuid}"""`,
                    `<${InstanceTestBuilder.FINANCIAL_ADVANTAGES[0].id}> <http://purl.org/dc/terms/title> """${InstanceTestBuilder.FINANCIAL_ADVANTAGES[0].title.nlFormal}"""@nl-BE-x-formal`,
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
                    `<${InstanceTestBuilder.CONTACT_POINTS[1].address.id}> <https://data.vlaanderen.be/ns/adres#land> """${AddressTestBuilder.LAND}"""@NL`,
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
                    `<${InstanceTestBuilder.CONTACT_POINTS[0].address.id}> <https://data.vlaanderen.be/ns/adres#gemeentenaam> """${AddressTestBuilder.GEMEENTENAAM}"""@NL`,
                    `<${InstanceTestBuilder.CONTACT_POINTS[0].address.id}> <https://data.vlaanderen.be/ns/adres#land> """${AddressTestBuilder.LAND}"""@NL`,
                    `<${InstanceTestBuilder.CONTACT_POINTS[0].address.id}> <https://data.vlaanderen.be/ns/adres#Adresvoorstelling.huisnummer> """${AddressTestBuilder.HUISNUMMER}"""`,
                    `<${InstanceTestBuilder.CONTACT_POINTS[0].address.id}> <https://data.vlaanderen.be/ns/adres#Adresvoorstelling.busnummer> """${AddressTestBuilder.BUSNUMMER}"""`,
                    `<${InstanceTestBuilder.CONTACT_POINTS[0].address.id}> <https://data.vlaanderen.be/ns/adres#postcode> """${AddressTestBuilder.POSTCODE}"""`,
                    `<${InstanceTestBuilder.CONTACT_POINTS[0].address.id}> <https://data.vlaanderen.be/ns/adres#Straatnaam> """${AddressTestBuilder.STRAATNAAM}"""@NL`,
                    `<${InstanceTestBuilder.CONTACT_POINTS[0].address.id}> <https://data.vlaanderen.be/ns/adres#verwijstNaar> <${AddressTestBuilder.VERWIJST_NAAR}>`,

                    `<${instanceId}> <http://purl.org/dc/terms/source> <${instance.conceptId.value}>`,
                    `<${instanceId}> <http://mu.semte.ch/vocabularies/ext/hasVersionedSource> <${instance.conceptSnapshotId.value}>`,
                    `<${instanceId}> <http://schema.org/productID> """${instance.productId}"""`,
                    `<${instanceId}> <http://purl.org/dc/terms/language> <http://publications.europa.eu/resource/authority/language/NLD>`,
                    `<${instanceId}> <http://purl.org/dc/terms/language> <http://publications.europa.eu/resource/authority/language/ENG>`,
                    `<${instanceId}> <https://productencatalogus.data.vlaanderen.be/ns/ipdc-lpdc#dutchLanguageVariant> """${Language.FORMAL}"""`,
                    `<${instanceId}> <https://productencatalogus.data.vlaanderen.be/ns/ipdc-lpdc#needsConversionFromFormalToInformal> """false"""^^<http://www.w3.org/2001/XMLSchema#boolean>`,
                    `<${instanceId}> <http://schema.org/dateCreated> """${InstanceTestBuilder.DATE_CREATED.value}"""^^<http://www.w3.org/2001/XMLSchema#dateTime>`,
                    `<${instanceId}> <http://schema.org/dateModified> """${InstanceTestBuilder.DATE_MODIFIED.value}"""^^<http://www.w3.org/2001/XMLSchema#dateTime>`,
                    `<${instanceId}> <http://schema.org/dateSent> """${InstanceTestBuilder.DATE_SENT.value}"""^^<http://www.w3.org/2001/XMLSchema#dateTime>`,
                    `<${instanceId}> <http://www.w3.org/ns/adms#status> <http://lblod.data.gift/concepts/instance-status/verzonden>`,
                    `<${instanceId}> <http://mu.semte.ch/vocabularies/ext/reviewStatus> <http://lblod.data.gift/concepts/review-status/concept-gewijzigd>`,
                    `<${instanceId}> <http://schema.org/publication> <http://lblod.data.gift/concepts/publication-status/te-herpubliceren>`,
                    `<${instanceId}> <http://purl.org/dc/terms/spatial> <${instance.spatials[0].value}>`,
                    `<${instanceId}> <http://purl.org/dc/terms/spatial> <${instance.spatials[1].value}>`,
                    `<${instanceId}> <http://purl.org/dc/terms/spatial> <${instance.spatials[2].value}>`,

                    `<${instanceId}> <http://data.europa.eu/m8g/hasLegalResource> <${InstanceTestBuilder.LEGAL_RESOURCES[0].id}>`,
                    `<${InstanceTestBuilder.LEGAL_RESOURCES[0].id}> a <http://data.europa.eu/eli/ontology#LegalResource>`,
                    `<${InstanceTestBuilder.LEGAL_RESOURCES[0].id}> <http://mu.semte.ch/vocabularies/core/uuid> """${InstanceTestBuilder.LEGAL_RESOURCES[0].uuid}"""`,
                    `<${InstanceTestBuilder.LEGAL_RESOURCES[0].id}> <http://purl.org/dc/terms/title> """${InstanceTestBuilder.LEGAL_RESOURCES[0].title.nlFormal}"""@nl-BE-x-formal`,
                    `<${InstanceTestBuilder.LEGAL_RESOURCES[0].id}> <http://purl.org/dc/terms/description> """${InstanceTestBuilder.LEGAL_RESOURCES[0].description.nlFormal}"""@nl-BE-x-formal`,
                    `<${InstanceTestBuilder.LEGAL_RESOURCES[0].id}> <http://schema.org/url> """${InstanceTestBuilder.LEGAL_RESOURCES[0].url}"""`,
                    `<${InstanceTestBuilder.LEGAL_RESOURCES[0].id}> <http://www.w3.org/ns/shacl#order> """1"""^^<http://www.w3.org/2001/XMLSchema#integer>`,
                    `<${instanceId}> <http://data.europa.eu/m8g/hasLegalResource> <${InstanceTestBuilder.LEGAL_RESOURCES[1].id}>`,
                    `<${InstanceTestBuilder.LEGAL_RESOURCES[1].id}> a <http://data.europa.eu/eli/ontology#LegalResource>`,
                    `<${InstanceTestBuilder.LEGAL_RESOURCES[1].id}> <http://mu.semte.ch/vocabularies/core/uuid> """${InstanceTestBuilder.LEGAL_RESOURCES[1].uuid}"""`,
                    `<${InstanceTestBuilder.LEGAL_RESOURCES[1].id}> <http://purl.org/dc/terms/title> """${InstanceTestBuilder.LEGAL_RESOURCES[1].title.nlFormal}"""@nl-BE-x-formal`,
                    `<${InstanceTestBuilder.LEGAL_RESOURCES[1].id}> <http://purl.org/dc/terms/description> """${InstanceTestBuilder.LEGAL_RESOURCES[1].description.nlFormal}"""@nl-BE-x-formal`,
                    `<${InstanceTestBuilder.LEGAL_RESOURCES[1].id}> <http://schema.org/url> """${InstanceTestBuilder.LEGAL_RESOURCES[1].url}"""`,
                    `<${InstanceTestBuilder.LEGAL_RESOURCES[1].id}> <http://www.w3.org/ns/shacl#order> """2"""^^<http://www.w3.org/2001/XMLSchema#integer>`,

                    `<${instanceId}> <https://productencatalogus.data.vlaanderen.be/ns/ipdc-lpdc#forMunicipalityMerger> """false"""^^<http://www.w3.org/2001/XMLSchema#boolean>`,
                    `<${instanceId}> <https://productencatalogus.data.vlaanderen.be/ns/ipdc-lpdc#copyOf> <${instance.copyOf.value}>`,
                ]);

            const actualInstance = await repository.findById(bestuurseenheid, instanceId);

            expect(actualInstance).toEqual(instance);
        });

        test('Verify minimal mappings - invalid dutch language should throw error', async () => {
            const bestuurseenheid = aBestuurseenheid().build();

            const instanceUuid = uuid();
            const instanceId = InstanceBuilder.buildIri(instanceUuid);

            await directDatabaseAccess.insertData(
                bestuurseenheid.userGraph().value,
                [
                    `<${instanceId}> a <https://productencatalogus.data.vlaanderen.be/ns/ipdc-lpdc#InstancePublicService>`,
                    `<${instanceId}> <http://mu.semte.ch/vocabularies/core/uuid> """${instanceUuid}"""`,
                    `<${instanceId}> <http://purl.org/pav/createdBy> <${bestuurseenheid.id.value}>`,
                    `<${instanceId}> <http://schema.org/dateCreated> """${InstanceTestBuilder.DATE_CREATED.value}"""^^<http://www.w3.org/2001/XMLSchema#dateTime>`,
                    `<${instanceId}> <http://schema.org/dateModified> """${InstanceTestBuilder.DATE_MODIFIED.value}"""^^<http://www.w3.org/2001/XMLSchema#dateTime>`,
                    `<${instanceId}> <http://www.w3.org/ns/adms#status> <http://lblod.data.gift/concepts/instance-status/ontwerp>`,
                    `<${instanceId}> <https://productencatalogus.data.vlaanderen.be/ns/ipdc-lpdc#dutchLanguageVariant> """${Language.GENERATED_FORMAL}"""`,
                    `<${instanceId}> <https://productencatalogus.data.vlaanderen.be/ns/ipdc-lpdc#needsConversionFromFormalToInformal> """false"""^^<http://www.w3.org/2001/XMLSchema#boolean>`,
                ]);

            await expect(() => repository.findById(bestuurseenheid, instanceId)).rejects.toThrowWithMessage(InvariantError, `dutchLanguageVariant moet gelijk zijn aan een van de volgende waardes: ${instanceLanguages}`);
        });

        test('Verify minimal mappings - non-existing language as dutch language should throw error', async () => {
            const bestuurseenheid = aBestuurseenheid().build();

            const instanceId = InstanceBuilder.buildIri(uuid());

            await directDatabaseAccess.insertData(
                bestuurseenheid.userGraph().value,
                [
                    `<${instanceId}> a <https://productencatalogus.data.vlaanderen.be/ns/ipdc-lpdc#InstancePublicService>`,
                    `<${instanceId}> <http://mu.semte.ch/vocabularies/core/uuid> """${uuid()}"""`,
                    `<${instanceId}> <http://purl.org/pav/createdBy> <${bestuurseenheid.id.value}>`,
                    `<${instanceId}> <http://schema.org/dateCreated> """${InstanceTestBuilder.DATE_CREATED.value}"""^^<http://www.w3.org/2001/XMLSchema#dateTime>`,
                    `<${instanceId}> <http://schema.org/dateModified> """${InstanceTestBuilder.DATE_MODIFIED.value}"""^^<http://www.w3.org/2001/XMLSchema#dateTime>`,
                    `<${instanceId}> <http://www.w3.org/ns/adms#status> <http://lblod.data.gift/concepts/instance-status/ontwerp>`,
                    `<${instanceId}> <https://productencatalogus.data.vlaanderen.be/ns/ipdc-lpdc#dutchLanguageVariant> """blabla"""`,
                    `<${instanceId}> <https://productencatalogus.data.vlaanderen.be/ns/ipdc-lpdc#needsConversionFromFormalToInformal> """false"""^^<http://www.w3.org/2001/XMLSchema#boolean>`,

                ]);

            await expect(() => repository.findById(bestuurseenheid, instanceId)).rejects.toThrowWithMessage(SystemError, `Kan '<${instanceId}> <https://productencatalogus.data.vlaanderen.be/ns/ipdc-lpdc#dutchLanguageVariant> "blabla" .' niet mappen.`);
        });

        test('Verify minimal mappings - missing dutch language ', async () => {
            const bestuurseenheid = aBestuurseenheid().build();

            const instanceUuid = uuid();
            const instanceId = InstanceBuilder.buildIri(instanceUuid);

            await directDatabaseAccess.insertData(
                bestuurseenheid.userGraph().value,
                [
                    `<${instanceId}> a <https://productencatalogus.data.vlaanderen.be/ns/ipdc-lpdc#InstancePublicService>`,
                    `<${instanceId}> <http://mu.semte.ch/vocabularies/core/uuid> """${instanceUuid}"""`,
                    `<${instanceId}> <http://purl.org/pav/createdBy> <${bestuurseenheid.id.value}>`,
                    `<${instanceId}> <http://schema.org/dateCreated> """${InstanceTestBuilder.DATE_CREATED.value}"""^^<http://www.w3.org/2001/XMLSchema#dateTime>`,
                    `<${instanceId}> <http://schema.org/dateModified> """${InstanceTestBuilder.DATE_MODIFIED.value}"""^^<http://www.w3.org/2001/XMLSchema#dateTime>`,
                    `<${instanceId}> <http://www.w3.org/ns/adms#status> <http://lblod.data.gift/concepts/instance-status/ontwerp>`
                ]);

            await expect(() => repository.findById(bestuurseenheid, instanceId)).rejects.toThrowWithMessage(InvariantError, `dutchLanguageVariant moet gelijk zijn aan een van de volgende waardes: ${instanceLanguages}`);
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
                    `<${instance.id}> <https://productencatalogus.data.vlaanderen.be/ns/ipdc-lpdc#dutchLanguageVariant> """${Language.FORMAL}"""`,
                    `<${instance.id}> <https://productencatalogus.data.vlaanderen.be/ns/ipdc-lpdc#needsConversionFromFormalToInformal> """false"""^^<http://www.w3.org/2001/XMLSchema#boolean>`,
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
                    `<${instance.id}> <https://productencatalogus.data.vlaanderen.be/ns/ipdc-lpdc#dutchLanguageVariant> """${Language.FORMAL}"""`,
                    `<${instance.id}> <https://productencatalogus.data.vlaanderen.be/ns/ipdc-lpdc#needsConversionFromFormalToInformal> """false"""^^<http://www.w3.org/2001/XMLSchema#boolean>`,
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
                    `<${instance.id}> <https://productencatalogus.data.vlaanderen.be/ns/ipdc-lpdc#dutchLanguageVariant> """${Language.FORMAL}"""`,
                    `<${instance.id}> <https://productencatalogus.data.vlaanderen.be/ns/ipdc-lpdc#needsConversionFromFormalToInformal> """false"""^^<http://www.w3.org/2001/XMLSchema#boolean>`,
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
                    `<${instance.id}> <https://productencatalogus.data.vlaanderen.be/ns/ipdc-lpdc#dutchLanguageVariant> """${Language.FORMAL}"""`,
                    `<${instance.id}> <https://productencatalogus.data.vlaanderen.be/ns/ipdc-lpdc#needsConversionFromFormalToInformal> """false"""^^<http://www.w3.org/2001/XMLSchema#boolean>`,
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

        test('absent needsConversionFromFormalToInformal, maps to false', async () => {
            const instanceUUID = uuid();
            const instanceId = InstanceBuilder.buildIri(instanceUUID);
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
                    .withDutchLanguageVariant(Language.INFORMAL)
                    .withNeedsConversionFromFormalToInformal(false)
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
                    `<${instanceId}> <https://productencatalogus.data.vlaanderen.be/ns/ipdc-lpdc#dutchLanguageVariant> """${Language.INFORMAL}"""`,
                    `<${instanceId}> <http://www.w3.org/ns/adms#status> <http://lblod.data.gift/concepts/instance-status/ontwerp>`,
                ]);


            const actualInstance = await repository.findById(bestuurseenheid, instanceId);

            expect(actualInstance).toEqual(instance);
        });

        for (const type of Object.values(InstanceStatusType)) {
            test(`Instance Status type ${type} can be mapped`, async () => {
                const instance = aFullInstance().withStatus(type).withDateSent(InstanceTestBuilder.DATE_SENT).build();
                const bestuurseenheid = aBestuurseenheid().build();
                await repository.save(bestuurseenheid, instance);

                const actualInstance = await repository.findById(bestuurseenheid, instance.id);

                expect(actualInstance).toEqual(instance);
            });
        }

        test('Unknown Instance Status Type can not be mapped', async () => {
            const instanceId = InstanceBuilder.buildIri(uuid());

            const bestuurseenheid = aBestuurseenheid().build();

            await directDatabaseAccess.insertData(
                bestuurseenheid.userGraph().value,
                [
                    `<${instanceId}> a <https://productencatalogus.data.vlaanderen.be/ns/ipdc-lpdc#InstancePublicService>`,
                    `<${instanceId}> <http://www.w3.org/ns/adms#status> <http://lblod.data.gift/concepts/instance-status/unknown-instance-status>`,
                    `<${instanceId}> <https://productencatalogus.data.vlaanderen.be/ns/ipdc-lpdc#dutchLanguageVariant> """${Language.FORMAL}"""`,
                    `<${instanceId}> <https://productencatalogus.data.vlaanderen.be/ns/ipdc-lpdc#needsConversionFromFormalToInformal> """true"""^^<http://www.w3.org/2001/XMLSchema#boolean>`,
                ]);

            await expect(repository.findById(bestuurseenheid, instanceId)).rejects.toThrowWithMessage(SystemError, `Kan '<${instanceId}> <http://www.w3.org/ns/adms#status> <http://lblod.data.gift/concepts/instance-status/unknown-instance-status> .' niet mappen.`);
        });

        for (const type of Object.values(ProductType)) {
            test(`Producttype ${type} can be mapped`, async () => {
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

        test('Unknown ProductType can not be mapped', async () => {
            const bestuurseenheid = aBestuurseenheid().build();
            const instanceIri = InstanceBuilder.buildIri(uuid());

            await directDatabaseAccess.insertData(
                bestuurseenheid.userGraph().value,
                [
                    `<${instanceIri}> a <https://productencatalogus.data.vlaanderen.be/ns/ipdc-lpdc#InstancePublicService>`,
                    `<${instanceIri}> <http://purl.org/dc/terms/type> <https://productencatalogus.data.vlaanderen.be/id/concept/Type/UnknownProductType>`,
                ]);

            await expect(repository.findById(bestuurseenheid, instanceIri)).rejects.toThrowWithMessage(SystemError, `Kan '<${instanceIri}> <http://purl.org/dc/terms/type> <https://productencatalogus.data.vlaanderen.be/id/concept/Type/UnknownProductType> .' niet mappen.`);
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
            const instanceIri = InstanceBuilder.buildIri(uuid());

            await directDatabaseAccess.insertData(
                bestuurseenheid.userGraph().value,
                [`<${instanceIri}> a <https://productencatalogus.data.vlaanderen.be/ns/ipdc-lpdc#InstancePublicService>`,
                    `<${instanceIri}> <https://productencatalogus.data.vlaanderen.be/ns/ipdc-lpdc#targetAudience> <https://productencatalogus.data.vlaanderen.be/id/concept/Doelgroep/NonExistingTargetAudience>`,
                ]);

            await expect(repository.findById(bestuurseenheid, instanceIri)).rejects.toThrowWithMessage(SystemError, `Kan '<${instanceIri}> <https://productencatalogus.data.vlaanderen.be/ns/ipdc-lpdc#targetAudience> <https://productencatalogus.data.vlaanderen.be/id/concept/Doelgroep/NonExistingTargetAudience> .' niet mappen.`);
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
            const instanceIri = InstanceBuilder.buildIri(uuid());
            const bestuurseenheid = aBestuurseenheid().build();

            await directDatabaseAccess.insertData(
                bestuurseenheid.userGraph().value,
                [`<${instanceIri}> a <https://productencatalogus.data.vlaanderen.be/ns/ipdc-lpdc#InstancePublicService>`,
                    `<${instanceIri}> <http://data.europa.eu/m8g/thematicArea> <https://productencatalogus.data.vlaanderen.be/id/concept/Thema/NonExistingTheme>`,
                ]);

            await expect(repository.findById(bestuurseenheid, instanceIri)).rejects.toThrowWithMessage(SystemError, `Kan '<${instanceIri}> <http://data.europa.eu/m8g/thematicArea> <https://productencatalogus.data.vlaanderen.be/id/concept/Thema/NonExistingTheme> .' niet mappen.`);
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
            const instanceIri = InstanceBuilder.buildIri(uuid());

            await directDatabaseAccess.insertData(
                bestuurseenheid.userGraph().value,
                [`<${instanceIri}> a <https://productencatalogus.data.vlaanderen.be/ns/ipdc-lpdc#InstancePublicService>`,
                    `<${instanceIri}> <https://productencatalogus.data.vlaanderen.be/ns/ipdc-lpdc#competentAuthorityLevel> <https://productencatalogus.data.vlaanderen.be/id/concept/BevoegdBestuursniveau/NonExistingCompetentAuthorityLevel>`,
                ]);

            await expect(repository.findById(bestuurseenheid, instanceIri)).rejects.toThrowWithMessage(SystemError, `Kan '<${instanceIri}> <https://productencatalogus.data.vlaanderen.be/ns/ipdc-lpdc#competentAuthorityLevel> <https://productencatalogus.data.vlaanderen.be/id/concept/BevoegdBestuursniveau/NonExistingCompetentAuthorityLevel> .' niet mappen.`);
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
            const instanceIri = InstanceBuilder.buildIri(uuid());

            await directDatabaseAccess.insertData(
                bestuurseenheid.userGraph().value,
                [`<${instanceIri}> a <https://productencatalogus.data.vlaanderen.be/ns/ipdc-lpdc#InstancePublicService>`,
                    `<${instanceIri}> <https://productencatalogus.data.vlaanderen.be/ns/ipdc-lpdc#executingAuthorityLevel> <https://productencatalogus.data.vlaanderen.be/id/concept/UitvoerendBestuursniveau/NonExistingExecutingAuthorityLevel>`,
                ]);

            await expect(repository.findById(bestuurseenheid, instanceIri)).rejects.toThrowWithMessage(SystemError, `Kan '<${instanceIri}> <https://productencatalogus.data.vlaanderen.be/ns/ipdc-lpdc#executingAuthorityLevel> <https://productencatalogus.data.vlaanderen.be/id/concept/UitvoerendBestuursniveau/NonExistingExecutingAuthorityLevel> .' niet mappen.`);
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
            const instanceId = InstanceBuilder.buildIri(uuid());

            await directDatabaseAccess.insertData(
                bestuurseenheid.userGraph().value,
                [`<${instanceId}> a <https://productencatalogus.data.vlaanderen.be/ns/ipdc-lpdc#InstancePublicService>`,
                    `<${instanceId}> <https://productencatalogus.data.vlaanderen.be/ns/ipdc-lpdc#publicationMedium> <https://productencatalogus.data.vlaanderen.be/id/concept/PublicatieKanaal/NonExistingPublicationMedium>`,
                ]);

            await expect(repository.findById(bestuurseenheid, instanceId)).rejects.toThrowWithMessage(SystemError, `Kan '<${instanceId}> <https://productencatalogus.data.vlaanderen.be/ns/ipdc-lpdc#publicationMedium> <https://productencatalogus.data.vlaanderen.be/id/concept/PublicatieKanaal/NonExistingPublicationMedium> .' niet mappen.`);
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
            const instanceId = InstanceBuilder.buildIri(uuid());

            await directDatabaseAccess.insertData(
                bestuurseenheid.userGraph().value,
                [`<${instanceId}> a <https://productencatalogus.data.vlaanderen.be/ns/ipdc-lpdc#InstancePublicService>`,
                    `<${instanceId}> <https://productencatalogus.data.vlaanderen.be/ns/ipdc-lpdc#yourEuropeCategory> <https://productencatalogus.data.vlaanderen.be/id/concept/YourEuropeCatagory/NonExistingYourEuropeCategory>`,
                ]);

            await expect(repository.findById(bestuurseenheid, instanceId)).rejects.toThrowWithMessage(SystemError, `Kan '<${instanceId}> <https://productencatalogus.data.vlaanderen.be/ns/ipdc-lpdc#yourEuropeCategory> <https://productencatalogus.data.vlaanderen.be/id/concept/YourEuropeCatagory/NonExistingYourEuropeCategory> .' niet mappen.`);
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
            const instanceId = InstanceBuilder.buildIri(uuid());

            await directDatabaseAccess.insertData(
                bestuurseenheid.userGraph().value,
                [`<${instanceId}> a <https://productencatalogus.data.vlaanderen.be/ns/ipdc-lpdc#InstancePublicService>`,
                    `<${instanceId}> <http://purl.org/dc/terms/language> <http://publications.europa.eu/resource/authority/language/NonExistingLanguageType>`,
                ]);

            await expect(repository.findById(bestuurseenheid, instanceId)).rejects.toThrowWithMessage(SystemError, `Kan '<${instanceId}> <http://purl.org/dc/terms/language> <http://publications.europa.eu/resource/authority/language/NonExistingLanguageType> .' niet mappen.`);
        });

        for (const language of instanceLanguages) {
            test(`DutchLanguageVariant Language ${language} can be mapped`, async () => {
                const bestuurseenheid = aBestuurseenheid().build();
                const instance = aMinimalInstance().withDutchLanguageVariant(language).build();
                await repository.save(bestuurseenheid, instance);

                const actualInstance = await repository.findById(bestuurseenheid, instance.id);

                expect(actualInstance).toEqual(instance);
            });
        }

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
                .withDutchLanguageVariant(Language.NL)
                .withTitle(LanguageString.of(""))
                .withDescription(LanguageString.of(""))
                .withAdditionalDescription(LanguageString.of(""))
                .withException(LanguageString.of(""))
                .withRegulation(LanguageString.of(""))
                .withStartDate(FormatPreservingDate.of(""))
                .withEndDate(FormatPreservingDate.of(""))
                .withKeywords([LanguageString.of("")])
                .withRequirements([
                    aMinimalRequirementForInstance()
                        .withTitle(LanguageString.of(""))
                        .withDescription(LanguageString.of(""))
                        .withEvidence(aMinimalEvidenceForInstance()
                            .withTitle(LanguageString.of(""))
                            .withDescription(LanguageString.of(""))
                            .build())
                        .build()
                ])
                .withProcedures([
                    aMinimalProcedureForInstance()
                        .withTitle(LanguageString.of(""))
                        .withDescription(LanguageString.of(""))
                        .withWebsites([aMinimalWebsiteForInstance()
                            .withTitle(LanguageString.of(""))
                            .withDescription(LanguageString.of(""))
                            .withUrl("")
                            .build()
                        ])
                        .build()
                ])
                .withWebsites([aMinimalWebsiteForInstance()
                    .withTitle(LanguageString.of(""))
                    .withDescription(LanguageString.of(""))
                    .withUrl("")
                    .build()
                ])
                .withCosts([
                    aMinimalCostForInstance()
                        .withTitle(LanguageString.of(""))
                        .withDescription(LanguageString.of(""))
                        .build()
                ])
                .withFinancialAdvantages([
                    aMinimalFinancialAdvantageForInstance()
                        .withTitle(LanguageString.of(""))
                        .withDescription(LanguageString.of(""))
                        .build()
                ])
                .withContactPoints([
                    aMinimalContactPointForInstance()
                        .withUrl("")
                        .withEmail("")
                        .withTelephone("")
                        .withOpeningHours("")
                        .withAddress(aMinimalAddressForInstance()
                            .withGemeentenaam(LanguageString.of(""))
                            .withStraatnaam(LanguageString.of(""))
                            .withHuisnummer("")
                            .withBusnummer("")
                            .withPostcode("")
                            .withLand(LanguageString.of(""))
                            .build()
                        )
                        .build()
                ])
                .withConceptId(buildConceptIri(uuid()))
                .withConceptSnapshotId(buildConceptSnapshotIri(uuid()))
                .withProductId("")
                .withLegalResources([
                    aMinimalLegalResourceForInstance()
                        .withTitle(LanguageString.of(""))
                        .withDescription(LanguageString.of(""))
                        .withUrl("")
                        .build()
                ])
                .build();

            await repository.save(bestuurseenheid, instance);
            const actualInstance = await repository.findById(bestuurseenheid, instance.id);
            expect(actualInstance).toEqual(instance);
        });

        test('verify mapping publishedInstanceSnapshot', () => {
            const bestuurseenheid = aBestuurseenheid().build();
            const instance = aFullInstance()
                .withCreatedBy(bestuurseenheid.id)
                .withStatus(InstanceStatusType.VERZONDEN)
                .build();

            const publishedInstanceSnapshot = PublishedInstanceSnapshotBuilder.from(instance);
            const quads = new DomainToQuadsMapper(bestuurseenheid.userGraph()).publishedInstanceSnapshotToQuads(publishedInstanceSnapshot);
            const expectedQuads = [
                quad(namedNode(publishedInstanceSnapshot.id.value), namedNode('http://www.w3.org/1999/02/22-rdf-syntax-ns#type'), namedNode('https://productencatalogus.data.vlaanderen.be/ns/ipdc-lpdc#PublishedInstancePublicServiceSnapshot'), namedNode(bestuurseenheid.userGraph().value)),
                quad(namedNode(publishedInstanceSnapshot.id.value), namedNode('http://www.w3.org/ns/prov#generatedAtTime'), literal(publishedInstanceSnapshot.generatedAtTime.value, 'http://www.w3.org/2001/XMLSchema#dateTime'), namedNode(bestuurseenheid.userGraph().value)),
                quad(namedNode(publishedInstanceSnapshot.id.value), namedNode('https://productencatalogus.data.vlaanderen.be/ns/ipdc-lpdc#isPublishedVersionOf'), namedNode(instance.id.value), namedNode(bestuurseenheid.userGraph().value)),
                quad(namedNode(publishedInstanceSnapshot.id.value), namedNode('http://purl.org/pav/createdBy'), namedNode(publishedInstanceSnapshot.createdBy.value), namedNode(bestuurseenheid.userGraph().value)),
                quad(namedNode(publishedInstanceSnapshot.id.value), namedNode('http://purl.org/dc/terms/title'), literal(publishedInstanceSnapshot.title.nlFormal, Language.FORMAL), namedNode(bestuurseenheid.userGraph().value)),
                quad(namedNode(publishedInstanceSnapshot.id.value), namedNode('http://purl.org/dc/terms/description'), literal(publishedInstanceSnapshot.description.nlFormal, Language.FORMAL), namedNode(bestuurseenheid.userGraph().value)),
                quad(namedNode(publishedInstanceSnapshot.id.value), namedNode('https://productencatalogus.data.vlaanderen.be/ns/ipdc-lpdc#additionalDescription'), literal(publishedInstanceSnapshot.additionalDescription.nlFormal, Language.FORMAL), namedNode(bestuurseenheid.userGraph().value)),
                quad(namedNode(publishedInstanceSnapshot.id.value), namedNode('https://productencatalogus.data.vlaanderen.be/ns/ipdc-lpdc#exception'), literal(publishedInstanceSnapshot.exception.nlFormal, Language.FORMAL), namedNode(bestuurseenheid.userGraph().value)),
                quad(namedNode(publishedInstanceSnapshot.id.value), namedNode('https://productencatalogus.data.vlaanderen.be/ns/ipdc-lpdc#regulation'), literal(publishedInstanceSnapshot.regulation.nlFormal, Language.FORMAL), namedNode(bestuurseenheid.userGraph().value)),
                quad(namedNode(publishedInstanceSnapshot.id.value), namedNode('http://schema.org/startDate'), literal(publishedInstanceSnapshot.startDate.value, 'http://www.w3.org/2001/XMLSchema#dateTime'), namedNode(bestuurseenheid.userGraph().value)),
                quad(namedNode(publishedInstanceSnapshot.id.value), namedNode('http://schema.org/endDate'), literal(publishedInstanceSnapshot.endDate.value, 'http://www.w3.org/2001/XMLSchema#dateTime'), namedNode(bestuurseenheid.userGraph().value)),
                quad(namedNode(publishedInstanceSnapshot.id.value), namedNode('http://purl.org/dc/terms/type'), namedNode(NS.dvc.type(publishedInstanceSnapshot.type).value), namedNode(bestuurseenheid.userGraph().value)),
                quad(namedNode(publishedInstanceSnapshot.id.value), namedNode('https://productencatalogus.data.vlaanderen.be/ns/ipdc-lpdc#targetAudience'), namedNode(NS.dvc.doelgroep(publishedInstanceSnapshot.targetAudiences[0]).value), namedNode(bestuurseenheid.userGraph().value)),
                quad(namedNode(publishedInstanceSnapshot.id.value), namedNode('https://productencatalogus.data.vlaanderen.be/ns/ipdc-lpdc#targetAudience'), namedNode(NS.dvc.doelgroep(publishedInstanceSnapshot.targetAudiences[1]).value), namedNode(bestuurseenheid.userGraph().value)),
                quad(namedNode(publishedInstanceSnapshot.id.value), namedNode('https://productencatalogus.data.vlaanderen.be/ns/ipdc-lpdc#targetAudience'), namedNode(NS.dvc.doelgroep(publishedInstanceSnapshot.targetAudiences[2]).value), namedNode(bestuurseenheid.userGraph().value)),
                quad(namedNode(publishedInstanceSnapshot.id.value), namedNode('http://data.europa.eu/m8g/thematicArea'), namedNode(NS.dvc.thema(publishedInstanceSnapshot.themes[0]).value), namedNode(bestuurseenheid.userGraph().value)),
                quad(namedNode(publishedInstanceSnapshot.id.value), namedNode('http://data.europa.eu/m8g/thematicArea'), namedNode(NS.dvc.thema(publishedInstanceSnapshot.themes[1]).value), namedNode(bestuurseenheid.userGraph().value)),
                quad(namedNode(publishedInstanceSnapshot.id.value), namedNode('http://data.europa.eu/m8g/thematicArea'), namedNode(NS.dvc.thema(publishedInstanceSnapshot.themes[2]).value), namedNode(bestuurseenheid.userGraph().value)),
                quad(namedNode(publishedInstanceSnapshot.id.value), namedNode('https://productencatalogus.data.vlaanderen.be/ns/ipdc-lpdc#competentAuthorityLevel'), namedNode(NS.dvc.bevoegdBestuursniveau(publishedInstanceSnapshot.competentAuthorityLevels[0]).value), namedNode(bestuurseenheid.userGraph().value)),
                quad(namedNode(publishedInstanceSnapshot.id.value), namedNode('https://productencatalogus.data.vlaanderen.be/ns/ipdc-lpdc#competentAuthorityLevel'), namedNode(NS.dvc.bevoegdBestuursniveau(publishedInstanceSnapshot.competentAuthorityLevels[1]).value), namedNode(bestuurseenheid.userGraph().value)),
                quad(namedNode(publishedInstanceSnapshot.id.value), namedNode('https://productencatalogus.data.vlaanderen.be/ns/ipdc-lpdc#competentAuthorityLevel'), namedNode(NS.dvc.bevoegdBestuursniveau(publishedInstanceSnapshot.competentAuthorityLevels[2]).value), namedNode(bestuurseenheid.userGraph().value)),
                quad(namedNode(publishedInstanceSnapshot.id.value), namedNode('http://data.europa.eu/m8g/hasCompetentAuthority'), namedNode(publishedInstanceSnapshot.competentAuthorities[0].value), namedNode(bestuurseenheid.userGraph().value)),
                quad(namedNode(publishedInstanceSnapshot.id.value), namedNode('http://data.europa.eu/m8g/hasCompetentAuthority'), namedNode(publishedInstanceSnapshot.competentAuthorities[1].value), namedNode(bestuurseenheid.userGraph().value)),
                quad(namedNode(publishedInstanceSnapshot.id.value), namedNode('http://data.europa.eu/m8g/hasCompetentAuthority'), namedNode(publishedInstanceSnapshot.competentAuthorities[2].value), namedNode(bestuurseenheid.userGraph().value)),
                quad(namedNode(publishedInstanceSnapshot.id.value), namedNode('https://productencatalogus.data.vlaanderen.be/ns/ipdc-lpdc#executingAuthorityLevel'), namedNode(NS.dvc.uitvoerendBestuursniveau(publishedInstanceSnapshot.executingAuthorityLevels[0]).value), namedNode(bestuurseenheid.userGraph().value)),
                quad(namedNode(publishedInstanceSnapshot.id.value), namedNode('https://productencatalogus.data.vlaanderen.be/ns/ipdc-lpdc#executingAuthorityLevel'), namedNode(NS.dvc.uitvoerendBestuursniveau(publishedInstanceSnapshot.executingAuthorityLevels[1]).value), namedNode(bestuurseenheid.userGraph().value)),
                quad(namedNode(publishedInstanceSnapshot.id.value), namedNode('https://productencatalogus.data.vlaanderen.be/ns/ipdc-lpdc#executingAuthorityLevel'), namedNode(NS.dvc.uitvoerendBestuursniveau(publishedInstanceSnapshot.executingAuthorityLevels[2]).value), namedNode(bestuurseenheid.userGraph().value)),
                quad(namedNode(publishedInstanceSnapshot.id.value), namedNode('https://productencatalogus.data.vlaanderen.be/ns/ipdc-lpdc#hasExecutingAuthority'), namedNode(publishedInstanceSnapshot.executingAuthorities[0].value), namedNode(bestuurseenheid.userGraph().value)),
                quad(namedNode(publishedInstanceSnapshot.id.value), namedNode('https://productencatalogus.data.vlaanderen.be/ns/ipdc-lpdc#hasExecutingAuthority'), namedNode(publishedInstanceSnapshot.executingAuthorities[1].value), namedNode(bestuurseenheid.userGraph().value)),
                quad(namedNode(publishedInstanceSnapshot.id.value), namedNode('https://productencatalogus.data.vlaanderen.be/ns/ipdc-lpdc#publicationMedium'), namedNode(NS.dvc.publicatieKanaal(publishedInstanceSnapshot.publicationMedia[0]).value), namedNode(bestuurseenheid.userGraph().value)),
                quad(namedNode(publishedInstanceSnapshot.id.value), namedNode('https://productencatalogus.data.vlaanderen.be/ns/ipdc-lpdc#publicationMedium'), namedNode(NS.dvc.publicatieKanaal(publishedInstanceSnapshot.publicationMedia[1]).value), namedNode(bestuurseenheid.userGraph().value)),
                quad(namedNode(publishedInstanceSnapshot.id.value), namedNode('https://productencatalogus.data.vlaanderen.be/ns/ipdc-lpdc#yourEuropeCategory'), namedNode(NS.dvc.yourEuropeCategorie(publishedInstanceSnapshot.yourEuropeCategories[0]).value), namedNode(bestuurseenheid.userGraph().value)),
                quad(namedNode(publishedInstanceSnapshot.id.value), namedNode('https://productencatalogus.data.vlaanderen.be/ns/ipdc-lpdc#yourEuropeCategory'), namedNode(NS.dvc.yourEuropeCategorie(publishedInstanceSnapshot.yourEuropeCategories[1]).value), namedNode(bestuurseenheid.userGraph().value)),
                quad(namedNode(publishedInstanceSnapshot.id.value), namedNode('https://productencatalogus.data.vlaanderen.be/ns/ipdc-lpdc#yourEuropeCategory'), namedNode(NS.dvc.yourEuropeCategorie(publishedInstanceSnapshot.yourEuropeCategories[2]).value), namedNode(bestuurseenheid.userGraph().value)),
                quad(namedNode(publishedInstanceSnapshot.id.value), namedNode('http://www.w3.org/ns/dcat#keyword'), literal(publishedInstanceSnapshot.keywords[0].nl, Language.NL), namedNode(bestuurseenheid.userGraph().value)),
                quad(namedNode(publishedInstanceSnapshot.id.value), namedNode('http://www.w3.org/ns/dcat#keyword'), literal(publishedInstanceSnapshot.keywords[1].nl, Language.NL), namedNode(bestuurseenheid.userGraph().value)),

                quad(namedNode(publishedInstanceSnapshot.id.value), namedNode('http://vocab.belgif.be/ns/publicservice#hasRequirement'), namedNode(publishedInstanceSnapshot.requirements[0].id.value), namedNode(bestuurseenheid.userGraph().value)),
                quad(namedNode(publishedInstanceSnapshot.requirements[0].id.value), namedNode('http://www.w3.org/1999/02/22-rdf-syntax-ns#type'), namedNode('http://data.europa.eu/m8g/Requirement'), namedNode(bestuurseenheid.userGraph().value)),
                quad(namedNode(publishedInstanceSnapshot.requirements[0].id.value), namedNode('http://purl.org/dc/terms/title'), literal(publishedInstanceSnapshot.requirements[0].title.nlFormal, Language.FORMAL), namedNode(bestuurseenheid.userGraph().value)),
                quad(namedNode(publishedInstanceSnapshot.requirements[0].id.value), namedNode('http://purl.org/dc/terms/description'), literal(publishedInstanceSnapshot.requirements[0].description.nlFormal, Language.FORMAL), namedNode(bestuurseenheid.userGraph().value)),
                quad(namedNode(publishedInstanceSnapshot.requirements[0].id.value), namedNode('http://www.w3.org/ns/shacl#order'), literal(publishedInstanceSnapshot.requirements[0].order.toString(), 'http://www.w3.org/2001/XMLSchema#integer'), namedNode(bestuurseenheid.userGraph().value)),
                quad(namedNode(publishedInstanceSnapshot.requirements[0].id.value), namedNode('http://data.europa.eu/m8g/hasSupportingEvidence'), namedNode(publishedInstanceSnapshot.requirements[0].evidence.id.value), namedNode(bestuurseenheid.userGraph().value)),
                quad(namedNode(publishedInstanceSnapshot.requirements[0].evidence.id.value), namedNode('http://www.w3.org/1999/02/22-rdf-syntax-ns#type'), namedNode('http://data.europa.eu/m8g/Evidence'), namedNode(bestuurseenheid.userGraph().value)),
                quad(namedNode(publishedInstanceSnapshot.requirements[0].evidence.id.value), namedNode('http://purl.org/dc/terms/title'), literal(publishedInstanceSnapshot.requirements[0].evidence.title.nlFormal, Language.FORMAL), namedNode(bestuurseenheid.userGraph().value)),
                quad(namedNode(publishedInstanceSnapshot.requirements[0].evidence.id.value), namedNode('http://purl.org/dc/terms/description'), literal(publishedInstanceSnapshot.requirements[0].evidence.description.nlFormal, Language.FORMAL), namedNode(bestuurseenheid.userGraph().value)),
                quad(namedNode(publishedInstanceSnapshot.requirements[0].evidence.id.value), namedNode('http://www.w3.org/ns/shacl#order'), literal("1", 'http://www.w3.org/2001/XMLSchema#integer'), namedNode(bestuurseenheid.userGraph().value)),

                quad(namedNode(publishedInstanceSnapshot.id.value), namedNode('http://vocab.belgif.be/ns/publicservice#hasRequirement'), namedNode(publishedInstanceSnapshot.requirements[1].id.value), namedNode(bestuurseenheid.userGraph().value)),
                quad(namedNode(publishedInstanceSnapshot.requirements[1].id.value), namedNode('http://www.w3.org/1999/02/22-rdf-syntax-ns#type'), namedNode('http://data.europa.eu/m8g/Requirement'), namedNode(bestuurseenheid.userGraph().value)),
                quad(namedNode(publishedInstanceSnapshot.requirements[1].id.value), namedNode('http://purl.org/dc/terms/title'), literal(publishedInstanceSnapshot.requirements[1].title.nlFormal, Language.FORMAL), namedNode(bestuurseenheid.userGraph().value)),
                quad(namedNode(publishedInstanceSnapshot.requirements[1].id.value), namedNode('http://purl.org/dc/terms/description'), literal(publishedInstanceSnapshot.requirements[1].description.nlFormal, Language.FORMAL), namedNode(bestuurseenheid.userGraph().value)),
                quad(namedNode(publishedInstanceSnapshot.requirements[1].id.value), namedNode('http://www.w3.org/ns/shacl#order'), literal(publishedInstanceSnapshot.requirements[1].order.toString(), 'http://www.w3.org/2001/XMLSchema#integer'), namedNode(bestuurseenheid.userGraph().value)),
                quad(namedNode(publishedInstanceSnapshot.requirements[1].id.value), namedNode('http://data.europa.eu/m8g/hasSupportingEvidence'), namedNode(publishedInstanceSnapshot.requirements[1].evidence.id.value), namedNode(bestuurseenheid.userGraph().value)),
                quad(namedNode(publishedInstanceSnapshot.requirements[1].evidence.id.value), namedNode('http://www.w3.org/1999/02/22-rdf-syntax-ns#type'), namedNode('http://data.europa.eu/m8g/Evidence'), namedNode(bestuurseenheid.userGraph().value)),
                quad(namedNode(publishedInstanceSnapshot.requirements[1].evidence.id.value), namedNode('http://purl.org/dc/terms/title'), literal(publishedInstanceSnapshot.requirements[1].evidence.title.nlFormal, Language.FORMAL), namedNode(bestuurseenheid.userGraph().value)),
                quad(namedNode(publishedInstanceSnapshot.requirements[1].evidence.id.value), namedNode('http://purl.org/dc/terms/description'), literal(publishedInstanceSnapshot.requirements[1].evidence.description.nlFormal, Language.FORMAL), namedNode(bestuurseenheid.userGraph().value)),
                quad(namedNode(publishedInstanceSnapshot.requirements[1].evidence.id.value), namedNode('http://www.w3.org/ns/shacl#order'), literal("1", 'http://www.w3.org/2001/XMLSchema#integer'), namedNode(bestuurseenheid.userGraph().value)),

                quad(namedNode(publishedInstanceSnapshot.id.value), namedNode('http://purl.org/vocab/cpsv#follows'), namedNode(publishedInstanceSnapshot.procedures[0].id.value), namedNode(bestuurseenheid.userGraph().value)),
                quad(namedNode(publishedInstanceSnapshot.procedures[0].id.value), namedNode('http://www.w3.org/1999/02/22-rdf-syntax-ns#type'), namedNode('http://purl.org/vocab/cpsv#Rule'), namedNode(bestuurseenheid.userGraph().value)),
                quad(namedNode(publishedInstanceSnapshot.procedures[0].id.value), namedNode('http://purl.org/dc/terms/title'), literal(publishedInstanceSnapshot.procedures[0].title.nlFormal, Language.FORMAL), namedNode(bestuurseenheid.userGraph().value)),
                quad(namedNode(publishedInstanceSnapshot.procedures[0].id.value), namedNode('http://purl.org/dc/terms/description'), literal(publishedInstanceSnapshot.procedures[0].description.nlFormal, Language.FORMAL), namedNode(bestuurseenheid.userGraph().value)),
                quad(namedNode(publishedInstanceSnapshot.procedures[0].id.value), namedNode('http://www.w3.org/ns/shacl#order'), literal(publishedInstanceSnapshot.procedures[0].order.toString(), 'http://www.w3.org/2001/XMLSchema#integer'), namedNode(bestuurseenheid.userGraph().value)),
                quad(namedNode(publishedInstanceSnapshot.procedures[0].id.value), namedNode('https://productencatalogus.data.vlaanderen.be/ns/ipdc-lpdc#hasWebsite'), namedNode(publishedInstanceSnapshot.procedures[0].websites[0].id.value), namedNode(bestuurseenheid.userGraph().value)),
                quad(namedNode(publishedInstanceSnapshot.procedures[0].websites[0].id.value), namedNode('http://www.w3.org/1999/02/22-rdf-syntax-ns#type'), namedNode('http://schema.org/WebSite'), namedNode(bestuurseenheid.userGraph().value)),
                quad(namedNode(publishedInstanceSnapshot.procedures[0].websites[0].id.value), namedNode('http://purl.org/dc/terms/title'), literal(publishedInstanceSnapshot.procedures[0].websites[0].title.nlFormal, Language.FORMAL), namedNode(bestuurseenheid.userGraph().value)),
                quad(namedNode(publishedInstanceSnapshot.procedures[0].websites[0].id.value), namedNode('http://purl.org/dc/terms/description'), literal(publishedInstanceSnapshot.procedures[0].websites[0].description.nlFormal, Language.FORMAL), namedNode(bestuurseenheid.userGraph().value)),
                quad(namedNode(publishedInstanceSnapshot.procedures[0].websites[0].id.value), namedNode('http://schema.org/url'), literal(publishedInstanceSnapshot.procedures[0].websites[0].url), namedNode(bestuurseenheid.userGraph().value)),
                quad(namedNode(publishedInstanceSnapshot.procedures[0].websites[0].id.value), namedNode('http://www.w3.org/ns/shacl#order'), literal(publishedInstanceSnapshot.procedures[0].websites[0].order.toString(), 'http://www.w3.org/2001/XMLSchema#integer'), namedNode(bestuurseenheid.userGraph().value)),
                quad(namedNode(publishedInstanceSnapshot.procedures[0].id.value), namedNode('https://productencatalogus.data.vlaanderen.be/ns/ipdc-lpdc#hasWebsite'), namedNode(publishedInstanceSnapshot.procedures[0].websites[1].id.value), namedNode(bestuurseenheid.userGraph().value)),
                quad(namedNode(publishedInstanceSnapshot.procedures[0].websites[1].id.value), namedNode('http://www.w3.org/1999/02/22-rdf-syntax-ns#type'), namedNode('http://schema.org/WebSite'), namedNode(bestuurseenheid.userGraph().value)),
                quad(namedNode(publishedInstanceSnapshot.procedures[0].websites[1].id.value), namedNode('http://purl.org/dc/terms/title'), literal(publishedInstanceSnapshot.procedures[0].websites[1].title.nlFormal, Language.FORMAL), namedNode(bestuurseenheid.userGraph().value)),
                quad(namedNode(publishedInstanceSnapshot.procedures[0].websites[1].id.value), namedNode('http://purl.org/dc/terms/description'), literal(publishedInstanceSnapshot.procedures[0].websites[1].description.nlFormal, Language.FORMAL), namedNode(bestuurseenheid.userGraph().value)),
                quad(namedNode(publishedInstanceSnapshot.procedures[0].websites[1].id.value), namedNode('http://schema.org/url'), literal(publishedInstanceSnapshot.procedures[0].websites[1].url), namedNode(bestuurseenheid.userGraph().value)),
                quad(namedNode(publishedInstanceSnapshot.procedures[0].websites[1].id.value), namedNode('http://www.w3.org/ns/shacl#order'), literal(publishedInstanceSnapshot.procedures[0].websites[1].order.toString(), 'http://www.w3.org/2001/XMLSchema#integer'), namedNode(bestuurseenheid.userGraph().value)),

                quad(namedNode(publishedInstanceSnapshot.id.value), namedNode('http://purl.org/vocab/cpsv#follows'), namedNode(publishedInstanceSnapshot.procedures[1].id.value), namedNode(bestuurseenheid.userGraph().value)),
                quad(namedNode(publishedInstanceSnapshot.procedures[1].id.value), namedNode('http://www.w3.org/1999/02/22-rdf-syntax-ns#type'), namedNode('http://purl.org/vocab/cpsv#Rule'), namedNode(bestuurseenheid.userGraph().value)),
                quad(namedNode(publishedInstanceSnapshot.procedures[1].id.value), namedNode('http://purl.org/dc/terms/title'), literal(publishedInstanceSnapshot.procedures[1].title.nlFormal, Language.FORMAL), namedNode(bestuurseenheid.userGraph().value)),
                quad(namedNode(publishedInstanceSnapshot.procedures[1].id.value), namedNode('http://purl.org/dc/terms/description'), literal(publishedInstanceSnapshot.procedures[1].description.nlFormal, Language.FORMAL), namedNode(bestuurseenheid.userGraph().value)),
                quad(namedNode(publishedInstanceSnapshot.procedures[1].id.value), namedNode('http://www.w3.org/ns/shacl#order'), literal(publishedInstanceSnapshot.procedures[1].order.toString(), 'http://www.w3.org/2001/XMLSchema#integer'), namedNode(bestuurseenheid.userGraph().value)),
                quad(namedNode(publishedInstanceSnapshot.procedures[1].id.value), namedNode('https://productencatalogus.data.vlaanderen.be/ns/ipdc-lpdc#hasWebsite'), namedNode(publishedInstanceSnapshot.procedures[1].websites[0].id.value), namedNode(bestuurseenheid.userGraph().value)),
                quad(namedNode(publishedInstanceSnapshot.procedures[1].websites[0].id.value), namedNode('http://www.w3.org/1999/02/22-rdf-syntax-ns#type'), namedNode('http://schema.org/WebSite'), namedNode(bestuurseenheid.userGraph().value)),
                quad(namedNode(publishedInstanceSnapshot.procedures[1].websites[0].id.value), namedNode('http://purl.org/dc/terms/title'), literal(publishedInstanceSnapshot.procedures[1].websites[0].title.nlFormal, Language.FORMAL), namedNode(bestuurseenheid.userGraph().value)),
                quad(namedNode(publishedInstanceSnapshot.procedures[1].websites[0].id.value), namedNode('http://purl.org/dc/terms/description'), literal(publishedInstanceSnapshot.procedures[1].websites[0].description.nlFormal, Language.FORMAL), namedNode(bestuurseenheid.userGraph().value)),
                quad(namedNode(publishedInstanceSnapshot.procedures[1].websites[0].id.value), namedNode('http://schema.org/url'), literal(publishedInstanceSnapshot.procedures[1].websites[0].url), namedNode(bestuurseenheid.userGraph().value)),
                quad(namedNode(publishedInstanceSnapshot.procedures[1].websites[0].id.value), namedNode('http://www.w3.org/ns/shacl#order'), literal(publishedInstanceSnapshot.procedures[1].websites[0].order.toString(), 'http://www.w3.org/2001/XMLSchema#integer'), namedNode(bestuurseenheid.userGraph().value)),
                quad(namedNode(publishedInstanceSnapshot.procedures[1].id.value), namedNode('https://productencatalogus.data.vlaanderen.be/ns/ipdc-lpdc#hasWebsite'), namedNode(publishedInstanceSnapshot.procedures[1].websites[1].id.value), namedNode(bestuurseenheid.userGraph().value)),
                quad(namedNode(publishedInstanceSnapshot.procedures[1].websites[1].id.value), namedNode('http://www.w3.org/1999/02/22-rdf-syntax-ns#type'), namedNode('http://schema.org/WebSite'), namedNode(bestuurseenheid.userGraph().value)),
                quad(namedNode(publishedInstanceSnapshot.procedures[1].websites[1].id.value), namedNode('http://purl.org/dc/terms/title'), literal(publishedInstanceSnapshot.procedures[1].websites[1].title.nlFormal, Language.FORMAL), namedNode(bestuurseenheid.userGraph().value)),
                quad(namedNode(publishedInstanceSnapshot.procedures[1].websites[1].id.value), namedNode('http://purl.org/dc/terms/description'), literal(publishedInstanceSnapshot.procedures[1].websites[1].description.nlFormal, Language.FORMAL), namedNode(bestuurseenheid.userGraph().value)),
                quad(namedNode(publishedInstanceSnapshot.procedures[1].websites[1].id.value), namedNode('http://schema.org/url'), literal(publishedInstanceSnapshot.procedures[1].websites[1].url), namedNode(bestuurseenheid.userGraph().value)),
                quad(namedNode(publishedInstanceSnapshot.procedures[1].websites[1].id.value), namedNode('http://www.w3.org/ns/shacl#order'), literal(publishedInstanceSnapshot.procedures[1].websites[1].order.toString(), 'http://www.w3.org/2001/XMLSchema#integer'), namedNode(bestuurseenheid.userGraph().value)),

                quad(namedNode(publishedInstanceSnapshot.id.value), namedNode('http://www.w3.org/2000/01/rdf-schema#seeAlso'), namedNode(publishedInstanceSnapshot.websites[0].id.value), namedNode(bestuurseenheid.userGraph().value)),
                quad(namedNode(publishedInstanceSnapshot.websites[0].id.value), namedNode('http://www.w3.org/1999/02/22-rdf-syntax-ns#type'), namedNode('http://schema.org/WebSite'), namedNode(bestuurseenheid.userGraph().value)),
                quad(namedNode(publishedInstanceSnapshot.websites[0].id.value), namedNode('http://purl.org/dc/terms/title'), literal(publishedInstanceSnapshot.websites[0].title.nlFormal, Language.FORMAL), namedNode(bestuurseenheid.userGraph().value)),
                quad(namedNode(publishedInstanceSnapshot.websites[0].id.value), namedNode('http://purl.org/dc/terms/description'), literal(publishedInstanceSnapshot.websites[0].description.nlFormal, Language.FORMAL), namedNode(bestuurseenheid.userGraph().value)),
                quad(namedNode(publishedInstanceSnapshot.websites[0].id.value), namedNode('http://schema.org/url'), literal(publishedInstanceSnapshot.websites[0].url), namedNode(bestuurseenheid.userGraph().value)),
                quad(namedNode(publishedInstanceSnapshot.websites[0].id.value), namedNode('http://www.w3.org/ns/shacl#order'), literal(publishedInstanceSnapshot.websites[0].order.toString(), 'http://www.w3.org/2001/XMLSchema#integer'), namedNode(bestuurseenheid.userGraph().value)),

                quad(namedNode(publishedInstanceSnapshot.id.value), namedNode('http://www.w3.org/2000/01/rdf-schema#seeAlso'), namedNode(publishedInstanceSnapshot.websites[1].id.value), namedNode(bestuurseenheid.userGraph().value)),
                quad(namedNode(publishedInstanceSnapshot.websites[1].id.value), namedNode('http://www.w3.org/1999/02/22-rdf-syntax-ns#type'), namedNode('http://schema.org/WebSite'), namedNode(bestuurseenheid.userGraph().value)),
                quad(namedNode(publishedInstanceSnapshot.websites[1].id.value), namedNode('http://purl.org/dc/terms/title'), literal(publishedInstanceSnapshot.websites[1].title.nlFormal, Language.FORMAL), namedNode(bestuurseenheid.userGraph().value)),
                quad(namedNode(publishedInstanceSnapshot.websites[1].id.value), namedNode('http://purl.org/dc/terms/description'), literal(publishedInstanceSnapshot.websites[1].description.nlFormal, Language.FORMAL), namedNode(bestuurseenheid.userGraph().value)),
                quad(namedNode(publishedInstanceSnapshot.websites[1].id.value), namedNode('http://schema.org/url'), literal(publishedInstanceSnapshot.websites[1].url), namedNode(bestuurseenheid.userGraph().value)),
                quad(namedNode(publishedInstanceSnapshot.websites[1].id.value), namedNode('http://www.w3.org/ns/shacl#order'), literal(publishedInstanceSnapshot.websites[1].order.toString(), 'http://www.w3.org/2001/XMLSchema#integer'), namedNode(bestuurseenheid.userGraph().value)),

                quad(namedNode(publishedInstanceSnapshot.id.value), namedNode('http://data.europa.eu/m8g/hasCost'), namedNode(publishedInstanceSnapshot.costs[0].id.value), namedNode(bestuurseenheid.userGraph().value)),
                quad(namedNode(publishedInstanceSnapshot.costs[0].id.value), namedNode('http://www.w3.org/1999/02/22-rdf-syntax-ns#type'), namedNode('http://data.europa.eu/m8g/Cost'), namedNode(bestuurseenheid.userGraph().value)),
                quad(namedNode(publishedInstanceSnapshot.costs[0].id.value), namedNode('http://purl.org/dc/terms/title'), literal(publishedInstanceSnapshot.costs[0].title.nlFormal, Language.FORMAL), namedNode(bestuurseenheid.userGraph().value)),
                quad(namedNode(publishedInstanceSnapshot.costs[0].id.value), namedNode('http://purl.org/dc/terms/description'), literal(publishedInstanceSnapshot.costs[0].description.nlFormal, Language.FORMAL), namedNode(bestuurseenheid.userGraph().value)),
                quad(namedNode(publishedInstanceSnapshot.costs[0].id.value), namedNode('http://www.w3.org/ns/shacl#order'), literal(publishedInstanceSnapshot.costs[0].order.toString(), 'http://www.w3.org/2001/XMLSchema#integer'), namedNode(bestuurseenheid.userGraph().value)),
                quad(namedNode(publishedInstanceSnapshot.id.value), namedNode('http://data.europa.eu/m8g/hasCost'), namedNode(publishedInstanceSnapshot.costs[1].id.value), namedNode(bestuurseenheid.userGraph().value)),
                quad(namedNode(publishedInstanceSnapshot.costs[1].id.value), namedNode('http://www.w3.org/1999/02/22-rdf-syntax-ns#type'), namedNode('http://data.europa.eu/m8g/Cost'), namedNode(bestuurseenheid.userGraph().value)),
                quad(namedNode(publishedInstanceSnapshot.costs[1].id.value), namedNode('http://purl.org/dc/terms/title'), literal(publishedInstanceSnapshot.costs[1].title.nlFormal, Language.FORMAL), namedNode(bestuurseenheid.userGraph().value)),
                quad(namedNode(publishedInstanceSnapshot.costs[1].id.value), namedNode('http://purl.org/dc/terms/description'), literal(publishedInstanceSnapshot.costs[1].description.nlFormal, Language.FORMAL), namedNode(bestuurseenheid.userGraph().value)),
                quad(namedNode(publishedInstanceSnapshot.costs[1].id.value), namedNode('http://www.w3.org/ns/shacl#order'), literal(publishedInstanceSnapshot.costs[1].order.toString(), 'http://www.w3.org/2001/XMLSchema#integer'), namedNode(bestuurseenheid.userGraph().value)),

                quad(namedNode(publishedInstanceSnapshot.id.value), namedNode('http://purl.org/vocab/cpsv#produces'), namedNode(publishedInstanceSnapshot.financialAdvantages[0].id.value), namedNode(bestuurseenheid.userGraph().value)),
                quad(namedNode(publishedInstanceSnapshot.financialAdvantages[0].id.value), namedNode('http://www.w3.org/1999/02/22-rdf-syntax-ns#type'), namedNode('https://productencatalogus.data.vlaanderen.be/ns/ipdc-lpdc#FinancialAdvantage'), namedNode(bestuurseenheid.userGraph().value)),
                quad(namedNode(publishedInstanceSnapshot.financialAdvantages[0].id.value), namedNode('http://purl.org/dc/terms/title'), literal(publishedInstanceSnapshot.financialAdvantages[0].title.nlFormal, Language.FORMAL), namedNode(bestuurseenheid.userGraph().value)),
                quad(namedNode(publishedInstanceSnapshot.financialAdvantages[0].id.value), namedNode('http://purl.org/dc/terms/description'), literal(publishedInstanceSnapshot.financialAdvantages[0].description.nlFormal, Language.FORMAL), namedNode(bestuurseenheid.userGraph().value)),
                quad(namedNode(publishedInstanceSnapshot.financialAdvantages[0].id.value), namedNode('http://www.w3.org/ns/shacl#order'), literal(publishedInstanceSnapshot.financialAdvantages[0].order.toString(), 'http://www.w3.org/2001/XMLSchema#integer'), namedNode(bestuurseenheid.userGraph().value)),
                quad(namedNode(publishedInstanceSnapshot.id.value), namedNode('http://purl.org/vocab/cpsv#produces'), namedNode(publishedInstanceSnapshot.financialAdvantages[1].id.value), namedNode(bestuurseenheid.userGraph().value)),
                quad(namedNode(publishedInstanceSnapshot.financialAdvantages[1].id.value), namedNode('http://www.w3.org/1999/02/22-rdf-syntax-ns#type'), namedNode('https://productencatalogus.data.vlaanderen.be/ns/ipdc-lpdc#FinancialAdvantage'), namedNode(bestuurseenheid.userGraph().value)),
                quad(namedNode(publishedInstanceSnapshot.financialAdvantages[1].id.value), namedNode('http://purl.org/dc/terms/title'), literal(publishedInstanceSnapshot.financialAdvantages[1].title.nlFormal, Language.FORMAL), namedNode(bestuurseenheid.userGraph().value)),
                quad(namedNode(publishedInstanceSnapshot.financialAdvantages[1].id.value), namedNode('http://purl.org/dc/terms/description'), literal(publishedInstanceSnapshot.financialAdvantages[1].description.nlFormal, Language.FORMAL), namedNode(bestuurseenheid.userGraph().value)),
                quad(namedNode(publishedInstanceSnapshot.financialAdvantages[1].id.value), namedNode('http://www.w3.org/ns/shacl#order'), literal(publishedInstanceSnapshot.financialAdvantages[1].order.toString(), 'http://www.w3.org/2001/XMLSchema#integer'), namedNode(bestuurseenheid.userGraph().value)),

                quad(namedNode(publishedInstanceSnapshot.id.value), namedNode('http://data.europa.eu/m8g/hasContactPoint'), namedNode(publishedInstanceSnapshot.contactPoints[0].id.value), namedNode(bestuurseenheid.userGraph().value)),
                quad(namedNode(publishedInstanceSnapshot.contactPoints[0].id.value), namedNode('http://www.w3.org/1999/02/22-rdf-syntax-ns#type'), namedNode('http://schema.org/ContactPoint'), namedNode(bestuurseenheid.userGraph().value)),
                quad(namedNode(publishedInstanceSnapshot.contactPoints[0].id.value), namedNode('http://schema.org/url'), literal(publishedInstanceSnapshot.contactPoints[0].url), namedNode(bestuurseenheid.userGraph().value)),
                quad(namedNode(publishedInstanceSnapshot.contactPoints[0].id.value), namedNode('http://schema.org/email'), literal(publishedInstanceSnapshot.contactPoints[0].email), namedNode(bestuurseenheid.userGraph().value)),
                quad(namedNode(publishedInstanceSnapshot.contactPoints[0].id.value), namedNode('http://schema.org/telephone'), literal(publishedInstanceSnapshot.contactPoints[0].telephone), namedNode(bestuurseenheid.userGraph().value)),
                quad(namedNode(publishedInstanceSnapshot.contactPoints[0].id.value), namedNode('http://schema.org/openingHours'), literal(publishedInstanceSnapshot.contactPoints[0].openingHours), namedNode(bestuurseenheid.userGraph().value)),
                quad(namedNode(publishedInstanceSnapshot.contactPoints[0].id.value), namedNode('http://www.w3.org/ns/shacl#order'), literal(publishedInstanceSnapshot.contactPoints[0].order.toString(), 'http://www.w3.org/2001/XMLSchema#integer'), namedNode(bestuurseenheid.userGraph().value)),
                quad(namedNode(publishedInstanceSnapshot.contactPoints[0].id.value), namedNode('https://productencatalogus.data.vlaanderen.be/ns/ipdc-lpdc#address'), namedNode(publishedInstanceSnapshot.contactPoints[0].address.id.value), namedNode(bestuurseenheid.userGraph().value)),
                quad(namedNode(publishedInstanceSnapshot.contactPoints[0].address.id.value), namedNode('http://www.w3.org/1999/02/22-rdf-syntax-ns#type'), namedNode('http://www.w3.org/ns/locn#Address'), namedNode(bestuurseenheid.userGraph().value)),
                quad(namedNode(publishedInstanceSnapshot.contactPoints[0].address.id.value), namedNode('https://data.vlaanderen.be/ns/adres#gemeentenaam'), literal(publishedInstanceSnapshot.contactPoints[0].address.gemeentenaam.nl, Language.NL), namedNode(bestuurseenheid.userGraph().value)),
                quad(namedNode(publishedInstanceSnapshot.contactPoints[0].address.id.value), namedNode('https://data.vlaanderen.be/ns/adres#land'), literal(publishedInstanceSnapshot.contactPoints[0].address.land.nl, Language.NL), namedNode(bestuurseenheid.userGraph().value)),
                quad(namedNode(publishedInstanceSnapshot.contactPoints[0].address.id.value), namedNode('https://data.vlaanderen.be/ns/adres#Adresvoorstelling.huisnummer'), literal(publishedInstanceSnapshot.contactPoints[0].address.huisnummer), namedNode(bestuurseenheid.userGraph().value)),
                quad(namedNode(publishedInstanceSnapshot.contactPoints[0].address.id.value), namedNode('https://data.vlaanderen.be/ns/adres#Adresvoorstelling.busnummer'), literal(publishedInstanceSnapshot.contactPoints[0].address.busnummer), namedNode(bestuurseenheid.userGraph().value)),
                quad(namedNode(publishedInstanceSnapshot.contactPoints[0].address.id.value), namedNode('https://data.vlaanderen.be/ns/adres#postcode'), literal(publishedInstanceSnapshot.contactPoints[0].address.postcode), namedNode(bestuurseenheid.userGraph().value)),
                quad(namedNode(publishedInstanceSnapshot.contactPoints[0].address.id.value), namedNode('https://data.vlaanderen.be/ns/adres#Straatnaam'), literal(publishedInstanceSnapshot.contactPoints[0].address.straatnaam.nl, Language.NL), namedNode(bestuurseenheid.userGraph().value)),
                quad(namedNode(publishedInstanceSnapshot.contactPoints[0].address.id.value), namedNode('https://data.vlaanderen.be/ns/adres#verwijstNaar'), namedNode(publishedInstanceSnapshot.contactPoints[0].address.verwijstNaar.value), namedNode(bestuurseenheid.userGraph().value)),
                quad(namedNode(publishedInstanceSnapshot.contactPoints[0].address.id.value), namedNode('http://www.w3.org/ns/shacl#order'), literal("1", 'http://www.w3.org/2001/XMLSchema#integer'), namedNode(bestuurseenheid.userGraph().value)),

                quad(namedNode(publishedInstanceSnapshot.id.value), namedNode('http://data.europa.eu/m8g/hasContactPoint'), namedNode(publishedInstanceSnapshot.contactPoints[1].id.value), namedNode(bestuurseenheid.userGraph().value)),
                quad(namedNode(publishedInstanceSnapshot.contactPoints[1].id.value), namedNode('http://www.w3.org/1999/02/22-rdf-syntax-ns#type'), namedNode('http://schema.org/ContactPoint'), namedNode(bestuurseenheid.userGraph().value)),
                quad(namedNode(publishedInstanceSnapshot.contactPoints[1].id.value), namedNode('http://schema.org/url'), literal(publishedInstanceSnapshot.contactPoints[1].url), namedNode(bestuurseenheid.userGraph().value)),
                quad(namedNode(publishedInstanceSnapshot.contactPoints[1].id.value), namedNode('http://schema.org/email'), literal(publishedInstanceSnapshot.contactPoints[1].email), namedNode(bestuurseenheid.userGraph().value)),
                quad(namedNode(publishedInstanceSnapshot.contactPoints[1].id.value), namedNode('http://schema.org/telephone'), literal(publishedInstanceSnapshot.contactPoints[1].telephone), namedNode(bestuurseenheid.userGraph().value)),
                quad(namedNode(publishedInstanceSnapshot.contactPoints[1].id.value), namedNode('http://schema.org/openingHours'), literal(publishedInstanceSnapshot.contactPoints[1].openingHours), namedNode(bestuurseenheid.userGraph().value)),
                quad(namedNode(publishedInstanceSnapshot.contactPoints[1].id.value), namedNode('http://www.w3.org/ns/shacl#order'), literal(publishedInstanceSnapshot.contactPoints[1].order.toString(), 'http://www.w3.org/2001/XMLSchema#integer'), namedNode(bestuurseenheid.userGraph().value)),
                quad(namedNode(publishedInstanceSnapshot.contactPoints[1].id.value), namedNode('https://productencatalogus.data.vlaanderen.be/ns/ipdc-lpdc#address'), namedNode(publishedInstanceSnapshot.contactPoints[1].address.id.value), namedNode(bestuurseenheid.userGraph().value)),
                quad(namedNode(publishedInstanceSnapshot.contactPoints[1].address.id.value), namedNode('http://www.w3.org/1999/02/22-rdf-syntax-ns#type'), namedNode('http://www.w3.org/ns/locn#Address'), namedNode(bestuurseenheid.userGraph().value)),
                quad(namedNode(publishedInstanceSnapshot.contactPoints[1].address.id.value), namedNode('https://data.vlaanderen.be/ns/adres#gemeentenaam'), literal(publishedInstanceSnapshot.contactPoints[1].address.gemeentenaam.nl, Language.NL), namedNode(bestuurseenheid.userGraph().value)),
                quad(namedNode(publishedInstanceSnapshot.contactPoints[1].address.id.value), namedNode('https://data.vlaanderen.be/ns/adres#land'), literal(publishedInstanceSnapshot.contactPoints[1].address.land.nl, Language.NL), namedNode(bestuurseenheid.userGraph().value)),
                quad(namedNode(publishedInstanceSnapshot.contactPoints[1].address.id.value), namedNode('https://data.vlaanderen.be/ns/adres#Adresvoorstelling.huisnummer'), literal(publishedInstanceSnapshot.contactPoints[1].address.huisnummer), namedNode(bestuurseenheid.userGraph().value)),
                quad(namedNode(publishedInstanceSnapshot.contactPoints[1].address.id.value), namedNode('https://data.vlaanderen.be/ns/adres#postcode'), literal(publishedInstanceSnapshot.contactPoints[1].address.postcode), namedNode(bestuurseenheid.userGraph().value)),
                quad(namedNode(publishedInstanceSnapshot.contactPoints[1].address.id.value), namedNode('https://data.vlaanderen.be/ns/adres#Straatnaam'), literal(publishedInstanceSnapshot.contactPoints[1].address.straatnaam.nl, Language.NL), namedNode(bestuurseenheid.userGraph().value)),
                quad(namedNode(publishedInstanceSnapshot.contactPoints[1].address.id.value), namedNode('https://data.vlaanderen.be/ns/adres#verwijstNaar'), namedNode(publishedInstanceSnapshot.contactPoints[1].address.verwijstNaar.value), namedNode(bestuurseenheid.userGraph().value)),
                quad(namedNode(publishedInstanceSnapshot.contactPoints[1].address.id.value), namedNode('http://www.w3.org/ns/shacl#order'), literal("1", 'http://www.w3.org/2001/XMLSchema#integer'), namedNode(bestuurseenheid.userGraph().value)),

                quad(namedNode(publishedInstanceSnapshot.id.value), namedNode('http://purl.org/dc/terms/source'), namedNode(publishedInstanceSnapshot.conceptId.value), namedNode(bestuurseenheid.userGraph().value)),
                quad(namedNode(publishedInstanceSnapshot.id.value), namedNode('http://purl.org/dc/terms/language'), namedNode(NS.pera.languageType(publishedInstanceSnapshot.languages[0]).value), namedNode(bestuurseenheid.userGraph().value)),
                quad(namedNode(publishedInstanceSnapshot.id.value), namedNode('http://purl.org/dc/terms/language'), namedNode(NS.pera.languageType(publishedInstanceSnapshot.languages[1]).value), namedNode(bestuurseenheid.userGraph().value)),
                quad(namedNode(publishedInstanceSnapshot.id.value), namedNode('http://schema.org/dateCreated'), literal(publishedInstanceSnapshot.dateCreated.value, 'http://www.w3.org/2001/XMLSchema#dateTime'), namedNode(bestuurseenheid.userGraph().value)),
                quad(namedNode(publishedInstanceSnapshot.id.value), namedNode('http://schema.org/dateModified'), literal(publishedInstanceSnapshot.dateModified.value, 'http://www.w3.org/2001/XMLSchema#dateTime'), namedNode(bestuurseenheid.userGraph().value)),
                quad(namedNode(publishedInstanceSnapshot.id.value), namedNode('http://purl.org/dc/terms/spatial'), namedNode(publishedInstanceSnapshot.spatials[0].value), namedNode(bestuurseenheid.userGraph().value)),
                quad(namedNode(publishedInstanceSnapshot.id.value), namedNode('http://purl.org/dc/terms/spatial'), namedNode(publishedInstanceSnapshot.spatials[1].value), namedNode(bestuurseenheid.userGraph().value)),

                quad(namedNode(publishedInstanceSnapshot.id.value), namedNode('http://data.europa.eu/m8g/hasLegalResource'), namedNode(publishedInstanceSnapshot.legalResources[0].id.value), namedNode(bestuurseenheid.userGraph().value)),
                quad(namedNode(publishedInstanceSnapshot.legalResources[0].id.value), namedNode('http://www.w3.org/1999/02/22-rdf-syntax-ns#type'), namedNode('http://data.europa.eu/eli/ontology#LegalResource'), namedNode(bestuurseenheid.userGraph().value)),
                quad(namedNode(publishedInstanceSnapshot.legalResources[0].id.value), namedNode('http://purl.org/dc/terms/title'), literal(publishedInstanceSnapshot.legalResources[0].title.nlFormal, Language.FORMAL), namedNode(bestuurseenheid.userGraph().value)),
                quad(namedNode(publishedInstanceSnapshot.legalResources[0].id.value), namedNode('http://purl.org/dc/terms/description'), literal(publishedInstanceSnapshot.legalResources[0].description.nlFormal, Language.FORMAL), namedNode(bestuurseenheid.userGraph().value)),
                quad(namedNode(publishedInstanceSnapshot.legalResources[0].id.value), namedNode('http://schema.org/url'), literal(publishedInstanceSnapshot.legalResources[0].url), namedNode(bestuurseenheid.userGraph().value)),
                quad(namedNode(publishedInstanceSnapshot.legalResources[0].id.value), namedNode('http://www.w3.org/ns/shacl#order'), literal(publishedInstanceSnapshot.legalResources[0].order.toString(), 'http://www.w3.org/2001/XMLSchema#integer'), namedNode(bestuurseenheid.userGraph().value)),
                quad(namedNode(publishedInstanceSnapshot.id.value), namedNode('http://data.europa.eu/m8g/hasLegalResource'), namedNode(publishedInstanceSnapshot.legalResources[1].id.value), namedNode(bestuurseenheid.userGraph().value)),
                quad(namedNode(publishedInstanceSnapshot.legalResources[1].id.value), namedNode('http://www.w3.org/1999/02/22-rdf-syntax-ns#type'), namedNode('http://data.europa.eu/eli/ontology#LegalResource'), namedNode(bestuurseenheid.userGraph().value)),
                quad(namedNode(publishedInstanceSnapshot.legalResources[1].id.value), namedNode('http://purl.org/dc/terms/title'), literal(publishedInstanceSnapshot.legalResources[1].title.nlFormal, Language.FORMAL), namedNode(bestuurseenheid.userGraph().value)),
                quad(namedNode(publishedInstanceSnapshot.legalResources[1].id.value), namedNode('http://purl.org/dc/terms/description'), literal(publishedInstanceSnapshot.legalResources[1].description.nlFormal, Language.FORMAL), namedNode(bestuurseenheid.userGraph().value)),
                quad(namedNode(publishedInstanceSnapshot.legalResources[1].id.value), namedNode('http://schema.org/url'), literal(publishedInstanceSnapshot.legalResources[1].url), namedNode(bestuurseenheid.userGraph().value)),
                quad(namedNode(publishedInstanceSnapshot.legalResources[1].id.value), namedNode('http://www.w3.org/ns/shacl#order'), literal(publishedInstanceSnapshot.legalResources[1].order.toString(), 'http://www.w3.org/2001/XMLSchema#integer'), namedNode(bestuurseenheid.userGraph().value)),
            ];
            expect(quads).toIncludeSameMembers(expectedQuads);

        });

    });

});
