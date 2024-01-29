import {TEST_SPARQL_ENDPOINT} from "../../test.config";
import {aFullInstance, aMinimalInstance, InstanceTestBuilder} from "../../core/domain/instance-test-builder";
import {InstanceSparqlTestRepository} from "./instance-sparql-test-repository";
import {BestuurseenheidSparqlTestRepository} from "./bestuurseenheid-sparql-test-repository";
import {aBestuurseenheid} from "../../core/domain/bestuurseenheid-test-builder";
import {sparqlEscapeUri, uuid} from "../../../mu-helper";
import {DirectDatabaseAccess} from "./direct-database-access";
import {buildInstanceIri, buildSpatialRefNis2019Iri} from "../../core/domain/iri-test-builder";
import {
    CompetentAuthorityLevelType,
    ExecutingAuthorityLevelType,
    InstancePublicationStatusType,
    InstanceStatusType,
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
import {aFullContactPoint} from "../../core/domain/contactPoint-test-builder";
import {AddressTestBuilder, aFullAddress} from "../../core/domain/address-test-builder";
import {SparqlQuerying} from "../../../src/driven/persistence/sparql-querying";
import {literal, namedNode, quad} from "rdflib";

describe('InstanceRepository', () => {

    const repository = new InstanceSparqlTestRepository(TEST_SPARQL_ENDPOINT);
    const bestuurseenheidRepository = new BestuurseenheidSparqlTestRepository(TEST_SPARQL_ENDPOINT);
    const directDatabaseAccess = new DirectDatabaseAccess(TEST_SPARQL_ENDPOINT);

    describe('findById', () => {

        test('When full instance exists with id, then return instance', async () => {
            const bestuurseenheid = aBestuurseenheid().build();
            const contactPoint = aFullContactPoint().withAddress(aFullAddress().build()).build();

            const anotherBestuurseenheid = aBestuurseenheid().build();
            const anotherContactPoint = aFullContactPoint().withAddress(aFullAddress().build()).build();
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

            await expect(repository.findById(bestuurseenheid, nonExistentInstanceId)).rejects.toThrow(new Error(`Could not find <http://data.lblod.info/id/public-service/thisiddoesnotexist> for type <http://purl.org/vocab/cpsv#PublicService> in graph <http://mu.semte.ch/graphs/organizations/${bestuurseenheid.uuid}/LoketLB-LPDCGebruiker>`));
        });
    });

    describe('delete', () => {
            const fixedToday = '2023-12-13T14:23:54.768Z';
        beforeAll(() => {
            jest.useFakeTimers();
            const fixedTodayAsDate = new Date(fixedToday);
            jest.spyOn(global, 'Date').mockImplementation(() => fixedTodayAsDate);
        });

        afterAll(() => {
            jest.clearAllTimers();
            jest.useRealTimers();
            jest.restoreAllMocks();
        });

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
                quad(namedNode(instance.id.value), namedNode('https://www.w3.org/ns/activitystreams#deleted'), literal(fixedToday, 'http://www.w3.org/2001/XMLSchema#dateTime'), namedNode(bestuurseenheid.userGraph().value)),
                quad(namedNode(instance.id.value), namedNode('https://www.w3.org/ns/activitystreams#formerType'), namedNode('http://purl.org/vocab/cpsv#PublicService'), namedNode(bestuurseenheid.userGraph().value)),
                quad(namedNode(instance.id.value), namedNode('http://schema.org/publication'), namedNode('http://lblod.data.gift/concepts/publication-status/te-herpubliceren'), namedNode(bestuurseenheid.userGraph().value)),
            ]));
        });
        test('if exists without publicationStatus, Removes all triples related to the instance and does not create tombstone triples ', async () => {

            const bestuurseenheid = aBestuurseenheid().build();
            const instance = aFullInstance().withPublicationStatus(undefined).build();

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

        test('if exists with publicationStatus gepubliceerd, throws error', async () => {

            const bestuurseenheid = aBestuurseenheid().build();
            const instance = aFullInstance().withPublicationStatus(InstancePublicationStatusType.GEPUBLICEERD).build();

            await repository.save(bestuurseenheid, instance);
          await expect(()=>  repository.delete(bestuurseenheid, instance.id)).rejects.toThrow(new Error('Cant delete a published instance'));

        });

        test('Only the requested instance is deleted', async () => {
            const bestuurseenheid = aBestuurseenheid().build();
            const instance = aFullInstance().withPublicationStatus(undefined).build();
            const anotherInstance = aMinimalInstance().build();

            await repository.save(bestuurseenheid, instance);
            await repository.save(bestuurseenheid, anotherInstance);

            await repository.delete(bestuurseenheid, instance.id);

            await expect(repository.findById(bestuurseenheid, instance.id)).rejects.toThrow();
            expect(await repository.findById(bestuurseenheid, anotherInstance.id)).toEqual(anotherInstance);
        });

        test('When instance does not exist with id, then throw error', async () => {
            const bestuurseenheid = aBestuurseenheid().build();
            await bestuurseenheidRepository.save(bestuurseenheid);

            const instance = aMinimalInstance().withCreatedBy(bestuurseenheid.id).build();
            await repository.save(bestuurseenheid, instance);

            const nonExistentInstanceId = buildInstanceIri('thisiddoesnotexist');

            await expect(repository.delete(bestuurseenheid, nonExistentInstanceId)).rejects.toThrow(new Error(`Could not find <http://data.lblod.info/id/public-service/thisiddoesnotexist> for type <http://purl.org/vocab/cpsv#PublicService> in graph <http://mu.semte.ch/graphs/organizations/${bestuurseenheid.uuid}/LoketLB-LPDCGebruiker>`));
        });

        test('if instance exists, but for other bestuurseenheid, then does not remove and throws error', async () => {
            const bestuurseenheid = aBestuurseenheid().build();
            const anotherBestuurseenheid = aBestuurseenheid().build();
            const instance = aFullInstance().withCreatedBy(bestuurseenheid.id).build();
            const anotherInstance = aFullInstance().withCreatedBy(anotherBestuurseenheid.id).build();

            await repository.save(bestuurseenheid, instance);
            await repository.save(anotherBestuurseenheid, anotherInstance);

            await expect(repository.delete(bestuurseenheid, anotherInstance.id)).rejects.toThrow();

            expect(await repository.findById(anotherBestuurseenheid, anotherInstance.id)).toEqual(anotherInstance);


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
                    `<${instanceId}> a <http://purl.org/vocab/cpsv#PublicService>`,
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
                    `<${InstanceTestBuilder.COMPETENT_AUTHORITIES[0]}> a <http://data.vlaanderen.be/ns/besluit#Bestuurseenheid>`,
                    `<${instanceId}> <http://data.europa.eu/m8g/hasCompetentAuthority> <${InstanceTestBuilder.COMPETENT_AUTHORITIES[1]}>`,
                    `<${InstanceTestBuilder.COMPETENT_AUTHORITIES[1]}> a <http://data.vlaanderen.be/ns/besluit#Bestuurseenheid>`,
                    `<${instanceId}> <http://data.europa.eu/m8g/hasCompetentAuthority> <${InstanceTestBuilder.COMPETENT_AUTHORITIES[2]}>`,
                    `<${InstanceTestBuilder.COMPETENT_AUTHORITIES[2]}> a <http://data.europa.eu/m8g/PublicOrganisation>`,
                    `<${instanceId}> <https://productencatalogus.data.vlaanderen.be/ns/ipdc-lpdc#executingAuthorityLevel> <${NS.dvc.uitvoerendBestuursniveau(InstanceTestBuilder.EXECUTING_AUTHORITY_LEVELS[0]).value}>`,
                    `<${instanceId}> <https://productencatalogus.data.vlaanderen.be/ns/ipdc-lpdc#executingAuthorityLevel> <${NS.dvc.uitvoerendBestuursniveau(InstanceTestBuilder.EXECUTING_AUTHORITY_LEVELS[1]).value}>`,
                    `<${instanceId}> <https://productencatalogus.data.vlaanderen.be/ns/ipdc-lpdc#executingAuthorityLevel> <${NS.dvc.uitvoerendBestuursniveau(InstanceTestBuilder.EXECUTING_AUTHORITY_LEVELS[2]).value}>`,
                    `<${instanceId}> <https://productencatalogus.data.vlaanderen.be/ns/ipdc-lpdc#hasExecutingAuthority> <${InstanceTestBuilder.EXECUTING_AUTHORITIES[0]}>`,
                    `<${InstanceTestBuilder.EXECUTING_AUTHORITIES[0]}> a <http://data.vlaanderen.be/ns/besluit#Bestuurseenheid>`,
                    `<${instanceId}> <https://productencatalogus.data.vlaanderen.be/ns/ipdc-lpdc#hasExecutingAuthority> <${InstanceTestBuilder.EXECUTING_AUTHORITIES[1]}>`,
                    `<${InstanceTestBuilder.EXECUTING_AUTHORITIES[1]}> a <http://data.europa.eu/m8g/PublicOrganisation>`,
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
                    `<${InstanceTestBuilder.REQUIREMENTS[1].id}> <http://www.w3.org/ns/shacl#order> """1"""^^<http://www.w3.org/2001/XMLSchema#integer>`,
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
                    `<${InstanceTestBuilder.REQUIREMENTS[0].id}> <http://www.w3.org/ns/shacl#order> """0"""^^<http://www.w3.org/2001/XMLSchema#integer>`,
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
                    `<${InstanceTestBuilder.PROCEDURES[1].id}> <http://www.w3.org/ns/shacl#order> """1"""^^<http://www.w3.org/2001/XMLSchema#integer>`,
                    `<${InstanceTestBuilder.PROCEDURES[1].id}> <https://productencatalogus.data.vlaanderen.be/ns/ipdc-lpdc#hasWebsite> <${InstanceTestBuilder.PROCEDURES[1].websites[1].id}>`,
                    `<${InstanceTestBuilder.PROCEDURES[1].websites[1].id}> a <http://schema.org/WebSite>`,
                    `<${InstanceTestBuilder.PROCEDURES[1].websites[1].id}> <http://mu.semte.ch/vocabularies/core/uuid> """${InstanceTestBuilder.PROCEDURES[1].websites[1].uuid}"""`,
                    `<${InstanceTestBuilder.PROCEDURES[1].websites[1].id}> <http://purl.org/dc/terms/title> """${InstanceTestBuilder.PROCEDURES[1].websites[1].title.en}"""@EN`,
                    `<${InstanceTestBuilder.PROCEDURES[1].websites[1].id}> <http://purl.org/dc/terms/title> """${InstanceTestBuilder.PROCEDURES[1].websites[1].title.nlFormal}"""@nl-BE-x-formal`,
                    `<${InstanceTestBuilder.PROCEDURES[1].websites[1].id}> <http://purl.org/dc/terms/description> """${InstanceTestBuilder.PROCEDURES[1].websites[1].description.en}"""@EN`,
                    `<${InstanceTestBuilder.PROCEDURES[1].websites[1].id}> <http://purl.org/dc/terms/description> """${InstanceTestBuilder.PROCEDURES[1].websites[1].description.nlFormal}"""@nl-BE-x-formal`,
                    `<${InstanceTestBuilder.PROCEDURES[1].websites[1].id}> <http://schema.org/url> """${InstanceTestBuilder.PROCEDURES[1].websites[1].url}"""`,
                    `<${InstanceTestBuilder.PROCEDURES[1].websites[1].id}> <http://www.w3.org/ns/shacl#order> """1"""^^<http://www.w3.org/2001/XMLSchema#integer>`,
                    `<${InstanceTestBuilder.PROCEDURES[1].id}> <https://productencatalogus.data.vlaanderen.be/ns/ipdc-lpdc#hasWebsite> <${InstanceTestBuilder.PROCEDURES[1].websites[0].id}>`,
                    `<${InstanceTestBuilder.PROCEDURES[1].websites[0].id}> a <http://schema.org/WebSite>`,
                    `<${InstanceTestBuilder.PROCEDURES[1].websites[0].id}> <http://mu.semte.ch/vocabularies/core/uuid> """${InstanceTestBuilder.PROCEDURES[1].websites[0].uuid}"""`,
                    `<${InstanceTestBuilder.PROCEDURES[1].websites[0].id}> <http://purl.org/dc/terms/title> """${InstanceTestBuilder.PROCEDURES[1].websites[0].title.en}"""@EN`,
                    `<${InstanceTestBuilder.PROCEDURES[1].websites[0].id}> <http://purl.org/dc/terms/title> """${InstanceTestBuilder.PROCEDURES[1].websites[0].title.nlFormal}"""@nl-BE-x-formal`,
                    `<${InstanceTestBuilder.PROCEDURES[1].websites[0].id}> <http://purl.org/dc/terms/description> """${InstanceTestBuilder.PROCEDURES[1].websites[0].description.en}"""@EN`,
                    `<${InstanceTestBuilder.PROCEDURES[1].websites[0].id}> <http://purl.org/dc/terms/description> """${InstanceTestBuilder.PROCEDURES[1].websites[0].description.nlFormal}"""@nl-BE-x-formal`,
                    `<${InstanceTestBuilder.PROCEDURES[1].websites[0].id}> <http://schema.org/url> """${InstanceTestBuilder.PROCEDURES[1].websites[0].url}"""`,
                    `<${InstanceTestBuilder.PROCEDURES[1].websites[0].id}> <http://www.w3.org/ns/shacl#order> """0"""^^<http://www.w3.org/2001/XMLSchema#integer>`,
                    `<${instanceId}> <http://purl.org/vocab/cpsv#follows> <${InstanceTestBuilder.PROCEDURES[0].id}>`,
                    `<${InstanceTestBuilder.PROCEDURES[0].id}> a <http://purl.org/vocab/cpsv#Rule>`,
                    `<${InstanceTestBuilder.PROCEDURES[0].id}> <http://mu.semte.ch/vocabularies/core/uuid> """${InstanceTestBuilder.PROCEDURES[0].uuid}"""`,
                    `<${InstanceTestBuilder.PROCEDURES[0].id}> <http://purl.org/dc/terms/title> """${InstanceTestBuilder.PROCEDURES[0].title.en}"""@EN`,
                    `<${InstanceTestBuilder.PROCEDURES[0].id}> <http://purl.org/dc/terms/title> """${InstanceTestBuilder.PROCEDURES[0].title.nlFormal}"""@nl-BE-x-formal`,
                    `<${InstanceTestBuilder.PROCEDURES[0].id}> <http://purl.org/dc/terms/description> """${InstanceTestBuilder.PROCEDURES[0].description.en}"""@EN`,
                    `<${InstanceTestBuilder.PROCEDURES[0].id}> <http://purl.org/dc/terms/description> """${InstanceTestBuilder.PROCEDURES[0].description.nlFormal}"""@nl-BE-x-formal`,
                    `<${InstanceTestBuilder.PROCEDURES[0].id}> <http://www.w3.org/ns/shacl#order> """0"""^^<http://www.w3.org/2001/XMLSchema#integer>`,
                    `<${InstanceTestBuilder.PROCEDURES[0].id}> <https://productencatalogus.data.vlaanderen.be/ns/ipdc-lpdc#hasWebsite> <${InstanceTestBuilder.PROCEDURES[0].websites[1].id}>`,
                    `<${InstanceTestBuilder.PROCEDURES[0].websites[1].id}> a <http://schema.org/WebSite>`,
                    `<${InstanceTestBuilder.PROCEDURES[0].websites[1].id}> <http://mu.semte.ch/vocabularies/core/uuid> """${InstanceTestBuilder.PROCEDURES[0].websites[1].uuid}"""`,
                    `<${InstanceTestBuilder.PROCEDURES[0].websites[1].id}> <http://purl.org/dc/terms/title> """${InstanceTestBuilder.PROCEDURES[0].websites[1].title.en}"""@EN`,
                    `<${InstanceTestBuilder.PROCEDURES[0].websites[1].id}> <http://purl.org/dc/terms/title> """${InstanceTestBuilder.PROCEDURES[0].websites[1].title.nlFormal}"""@nl-BE-x-formal`,
                    `<${InstanceTestBuilder.PROCEDURES[0].websites[1].id}> <http://purl.org/dc/terms/description> """${InstanceTestBuilder.PROCEDURES[0].websites[1].description.en}"""@EN`,
                    `<${InstanceTestBuilder.PROCEDURES[0].websites[1].id}> <http://purl.org/dc/terms/description> """${InstanceTestBuilder.PROCEDURES[0].websites[1].description.nlFormal}"""@nl-BE-x-formal`,
                    `<${InstanceTestBuilder.PROCEDURES[0].websites[1].id}> <http://schema.org/url> """${InstanceTestBuilder.PROCEDURES[0].websites[1].url}"""`,
                    `<${InstanceTestBuilder.PROCEDURES[0].websites[1].id}> <http://www.w3.org/ns/shacl#order> """1"""^^<http://www.w3.org/2001/XMLSchema#integer>`,
                    `<${InstanceTestBuilder.PROCEDURES[0].id}> <https://productencatalogus.data.vlaanderen.be/ns/ipdc-lpdc#hasWebsite> <${InstanceTestBuilder.PROCEDURES[0].websites[0].id}>`,
                    `<${InstanceTestBuilder.PROCEDURES[0].websites[0].id}> a <http://schema.org/WebSite>`,
                    `<${InstanceTestBuilder.PROCEDURES[0].websites[0].id}> <http://mu.semte.ch/vocabularies/core/uuid> """${InstanceTestBuilder.PROCEDURES[0].websites[0].uuid}"""`,
                    `<${InstanceTestBuilder.PROCEDURES[0].websites[0].id}> <http://purl.org/dc/terms/title> """${InstanceTestBuilder.PROCEDURES[0].websites[0].title.en}"""@EN`,
                    `<${InstanceTestBuilder.PROCEDURES[0].websites[0].id}> <http://purl.org/dc/terms/title> """${InstanceTestBuilder.PROCEDURES[0].websites[0].title.nlFormal}"""@nl-BE-x-formal`,
                    `<${InstanceTestBuilder.PROCEDURES[0].websites[0].id}> <http://purl.org/dc/terms/description> """${InstanceTestBuilder.PROCEDURES[0].websites[0].description.en}"""@EN`,
                    `<${InstanceTestBuilder.PROCEDURES[0].websites[0].id}> <http://purl.org/dc/terms/description> """${InstanceTestBuilder.PROCEDURES[0].websites[0].description.nlFormal}"""@nl-BE-x-formal`,
                    `<${InstanceTestBuilder.PROCEDURES[0].websites[0].id}> <http://schema.org/url> """${InstanceTestBuilder.PROCEDURES[0].websites[0].url}"""`,
                    `<${InstanceTestBuilder.PROCEDURES[0].websites[0].id}> <http://www.w3.org/ns/shacl#order> """0"""^^<http://www.w3.org/2001/XMLSchema#integer>`,
                    `<${instanceId}> <http://www.w3.org/2000/01/rdf-schema#seeAlso> <${InstanceTestBuilder.WEBSITES[1].id}>`,
                    `<${InstanceTestBuilder.WEBSITES[1].id}> a <http://schema.org/WebSite>`,
                    `<${InstanceTestBuilder.WEBSITES[1].id}> <http://mu.semte.ch/vocabularies/core/uuid> """${InstanceTestBuilder.WEBSITES[1].uuid}"""`,
                    `<${InstanceTestBuilder.WEBSITES[1].id}> <http://purl.org/dc/terms/title> """${InstanceTestBuilder.WEBSITES[1].title.en}"""@EN`,
                    `<${InstanceTestBuilder.WEBSITES[1].id}> <http://purl.org/dc/terms/title> """${InstanceTestBuilder.WEBSITES[1].title.nlFormal}"""@nl-BE-x-formal`,
                    `<${InstanceTestBuilder.WEBSITES[1].id}> <http://purl.org/dc/terms/description> """${InstanceTestBuilder.WEBSITES[1].description.en}"""@EN`,
                    `<${InstanceTestBuilder.WEBSITES[1].id}> <http://purl.org/dc/terms/description> """${InstanceTestBuilder.WEBSITES[1].description.nlFormal}"""@nl-BE-x-formal`,
                    `<${InstanceTestBuilder.WEBSITES[1].id}> <http://schema.org/url> """${InstanceTestBuilder.WEBSITES[1].url}"""`,
                    `<${InstanceTestBuilder.WEBSITES[1].id}> <http://www.w3.org/ns/shacl#order> """1"""^^<http://www.w3.org/2001/XMLSchema#integer>`,
                    `<${instanceId}> <http://www.w3.org/2000/01/rdf-schema#seeAlso> <${InstanceTestBuilder.WEBSITES[0].id}>`,
                    `<${InstanceTestBuilder.WEBSITES[0].id}> a <http://schema.org/WebSite>`,
                    `<${InstanceTestBuilder.WEBSITES[0].id}> <http://mu.semte.ch/vocabularies/core/uuid> """${InstanceTestBuilder.WEBSITES[0].uuid}"""`,
                    `<${InstanceTestBuilder.WEBSITES[0].id}> <http://purl.org/dc/terms/title> """${InstanceTestBuilder.WEBSITES[0].title.en}"""@EN`,
                    `<${InstanceTestBuilder.WEBSITES[0].id}> <http://purl.org/dc/terms/title> """${InstanceTestBuilder.WEBSITES[0].title.nlFormal}"""@nl-BE-x-formal`,
                    `<${InstanceTestBuilder.WEBSITES[0].id}> <http://purl.org/dc/terms/description> """${InstanceTestBuilder.WEBSITES[0].description.en}"""@EN`,
                    `<${InstanceTestBuilder.WEBSITES[0].id}> <http://purl.org/dc/terms/description> """${InstanceTestBuilder.WEBSITES[0].description.nlFormal}"""@nl-BE-x-formal`,
                    `<${InstanceTestBuilder.WEBSITES[0].id}> <http://schema.org/url> """${InstanceTestBuilder.WEBSITES[0].url}"""`,
                    `<${InstanceTestBuilder.WEBSITES[0].id}> <http://www.w3.org/ns/shacl#order> """0"""^^<http://www.w3.org/2001/XMLSchema#integer>`,
                    `<${instanceId}> <http://data.europa.eu/m8g/hasCost> <${InstanceTestBuilder.COSTS[1].id}>`,
                    `<${InstanceTestBuilder.COSTS[1].id}> a <http://data.europa.eu/m8g/Cost>`,
                    `<${InstanceTestBuilder.COSTS[1].id}> <http://mu.semte.ch/vocabularies/core/uuid> """${InstanceTestBuilder.COSTS[1].uuid}"""`,
                    `<${InstanceTestBuilder.COSTS[1].id}> <http://purl.org/dc/terms/title> """${InstanceTestBuilder.COSTS[1].title.en}"""@EN`,
                    `<${InstanceTestBuilder.COSTS[1].id}> <http://purl.org/dc/terms/title> """${InstanceTestBuilder.COSTS[1].title.nlFormal}"""@nl-BE-x-formal`,
                    `<${InstanceTestBuilder.COSTS[1].id}> <http://purl.org/dc/terms/description> """${InstanceTestBuilder.COSTS[1].description.en}"""@EN`,
                    `<${InstanceTestBuilder.COSTS[1].id}> <http://purl.org/dc/terms/description> """${InstanceTestBuilder.COSTS[1].description.nlFormal}"""@nl-BE-x-formal`,
                    `<${InstanceTestBuilder.COSTS[1].id}> <http://www.w3.org/ns/shacl#order> """1"""^^<http://www.w3.org/2001/XMLSchema#integer>`,
                    `<${instanceId}> <http://data.europa.eu/m8g/hasCost> <${InstanceTestBuilder.COSTS[0].id}>`,
                    `<${InstanceTestBuilder.COSTS[0].id}> a <http://data.europa.eu/m8g/Cost>`,
                    `<${InstanceTestBuilder.COSTS[0].id}> <http://mu.semte.ch/vocabularies/core/uuid> """${InstanceTestBuilder.COSTS[0].uuid}"""`,
                    `<${InstanceTestBuilder.COSTS[0].id}> <http://purl.org/dc/terms/title> """${InstanceTestBuilder.COSTS[0].title.en}"""@EN`,
                    `<${InstanceTestBuilder.COSTS[0].id}> <http://purl.org/dc/terms/title> """${InstanceTestBuilder.COSTS[0].title.nlFormal}"""@nl-BE-x-formal`,
                    `<${InstanceTestBuilder.COSTS[0].id}> <http://purl.org/dc/terms/description> """${InstanceTestBuilder.COSTS[0].description.en}"""@EN`,
                    `<${InstanceTestBuilder.COSTS[0].id}> <http://purl.org/dc/terms/description> """${InstanceTestBuilder.COSTS[0].description.nlFormal}"""@nl-BE-x-formal`,
                    `<${InstanceTestBuilder.COSTS[0].id}> <http://www.w3.org/ns/shacl#order> """0"""^^<http://www.w3.org/2001/XMLSchema#integer>`,
                    `<${instanceId}> <http://purl.org/vocab/cpsv#produces> <${InstanceTestBuilder.FINANCIAL_ADVANTAGES[1].id}>`,
                    `<${InstanceTestBuilder.FINANCIAL_ADVANTAGES[1].id}> a <https://productencatalogus.data.vlaanderen.be/ns/ipdc-lpdc#FinancialAdvantage>`,
                    `<${InstanceTestBuilder.FINANCIAL_ADVANTAGES[1].id}> <http://mu.semte.ch/vocabularies/core/uuid> """${InstanceTestBuilder.FINANCIAL_ADVANTAGES[1].uuid}"""`,
                    `<${InstanceTestBuilder.FINANCIAL_ADVANTAGES[1].id}> <http://purl.org/dc/terms/title> """${InstanceTestBuilder.FINANCIAL_ADVANTAGES[1].title.en}"""@EN`,
                    `<${InstanceTestBuilder.FINANCIAL_ADVANTAGES[1].id}> <http://purl.org/dc/terms/title> """${InstanceTestBuilder.FINANCIAL_ADVANTAGES[1].title.nlFormal}"""@nl-BE-x-formal`,
                    `<${InstanceTestBuilder.FINANCIAL_ADVANTAGES[1].id}> <http://purl.org/dc/terms/description> """${InstanceTestBuilder.FINANCIAL_ADVANTAGES[1].description.en}"""@EN`,
                    `<${InstanceTestBuilder.FINANCIAL_ADVANTAGES[1].id}> <http://purl.org/dc/terms/description> """${InstanceTestBuilder.FINANCIAL_ADVANTAGES[1].description.nlFormal}"""@nl-BE-x-formal`,
                    `<${InstanceTestBuilder.FINANCIAL_ADVANTAGES[1].id}> <http://www.w3.org/ns/shacl#order> """1"""^^<http://www.w3.org/2001/XMLSchema#integer>`,
                    `<${instanceId}> <http://purl.org/vocab/cpsv#produces> <${InstanceTestBuilder.FINANCIAL_ADVANTAGES[0].id}>`,
                    `<${InstanceTestBuilder.FINANCIAL_ADVANTAGES[0].id}> a <https://productencatalogus.data.vlaanderen.be/ns/ipdc-lpdc#FinancialAdvantage>`,
                    `<${InstanceTestBuilder.FINANCIAL_ADVANTAGES[0].id}> <http://mu.semte.ch/vocabularies/core/uuid> """${InstanceTestBuilder.FINANCIAL_ADVANTAGES[0].uuid}"""`,
                    `<${InstanceTestBuilder.FINANCIAL_ADVANTAGES[0].id}> <http://purl.org/dc/terms/title> """${InstanceTestBuilder.FINANCIAL_ADVANTAGES[0].title.en}"""@EN`,
                    `<${InstanceTestBuilder.FINANCIAL_ADVANTAGES[0].id}> <http://purl.org/dc/terms/title> """${InstanceTestBuilder.FINANCIAL_ADVANTAGES[0].title.nlFormal}"""@nl-BE-x-formal`,
                    `<${InstanceTestBuilder.FINANCIAL_ADVANTAGES[0].id}> <http://purl.org/dc/terms/description> """${InstanceTestBuilder.FINANCIAL_ADVANTAGES[0].description.en}"""@EN`,
                    `<${InstanceTestBuilder.FINANCIAL_ADVANTAGES[0].id}> <http://purl.org/dc/terms/description> """${InstanceTestBuilder.FINANCIAL_ADVANTAGES[0].description.nlFormal}"""@nl-BE-x-formal`,
                    `<${InstanceTestBuilder.FINANCIAL_ADVANTAGES[0].id}> <http://www.w3.org/ns/shacl#order> """0"""^^<http://www.w3.org/2001/XMLSchema#integer>`,

                    `<${instanceId}> <http://data.europa.eu/m8g/hasContactPoint> <${InstanceTestBuilder.CONTACT_POINTS[1].id}>`,
                    `<${InstanceTestBuilder.CONTACT_POINTS[1].id}> a <http://schema.org/ContactPoint>`,
                    `<${InstanceTestBuilder.CONTACT_POINTS[1].id}> <http://mu.semte.ch/vocabularies/core/uuid> """${InstanceTestBuilder.CONTACT_POINTS[1].uuid}"""`,
                    `<${InstanceTestBuilder.CONTACT_POINTS[1].id}> <http://schema.org/url> """${InstanceTestBuilder.CONTACT_POINTS[1].url}"""`,
                    `<${InstanceTestBuilder.CONTACT_POINTS[1].id}> <http://schema.org/email> """${InstanceTestBuilder.CONTACT_POINTS[1].email}"""`,
                    `<${InstanceTestBuilder.CONTACT_POINTS[1].id}> <http://schema.org/telephone> """${InstanceTestBuilder.CONTACT_POINTS[1].telephone}"""`,
                    `<${InstanceTestBuilder.CONTACT_POINTS[1].id}> <http://schema.org/openingHours> """${InstanceTestBuilder.CONTACT_POINTS[1].openingHours}"""`,
                    `<${InstanceTestBuilder.CONTACT_POINTS[1].id}> <https://productencatalogus.data.vlaanderen.be/ns/ipdc-lpdc#address> <${InstanceTestBuilder.CONTACT_POINTS[1].address.id}>`,
                    `<${InstanceTestBuilder.CONTACT_POINTS[1].id}> <http://www.w3.org/ns/shacl#order> """1"""^^<http://www.w3.org/2001/XMLSchema#integer>`,
                    `<${InstanceTestBuilder.CONTACT_POINTS[1].address.id}> a <http://www.w3.org/ns/locn#Address>`,
                    `<${InstanceTestBuilder.CONTACT_POINTS[1].address.id}> <http://mu.semte.ch/vocabularies/core/uuid> """${InstanceTestBuilder.CONTACT_POINTS[1].address.uuid}"""`,
                    `<${InstanceTestBuilder.CONTACT_POINTS[1].address.id}> <https://data.vlaanderen.be/ns/adres#gemeentenaam> """${AddressTestBuilder.ANOTHER_GEMEENTENAAM}"""@NL`,
                    `<${InstanceTestBuilder.CONTACT_POINTS[1].address.id}> <https://data.vlaanderen.be/ns/adres#land> """${AddressTestBuilder.LAND_NL}"""@NL`,
                    `<${InstanceTestBuilder.CONTACT_POINTS[1].address.id}> <https://data.vlaanderen.be/ns/adres#Adresvoorstelling.huisnummer> """${AddressTestBuilder.ANTOHER_HUISNUMMER}"""`,
                    `<${InstanceTestBuilder.CONTACT_POINTS[1].address.id}> <https://data.vlaanderen.be/ns/adres#postcode> """${AddressTestBuilder.ANOTHER_POSTCODE}"""`,
                    `<${InstanceTestBuilder.CONTACT_POINTS[1].address.id}> <https://data.vlaanderen.be/ns/adres#Straatnaam> """${AddressTestBuilder.ANTOHER_STRAATNAAM}"""@NL`,
                    `<${InstanceTestBuilder.CONTACT_POINTS[1].address.id}> <https://data.vlaanderen.be/ns/adres#verwijstNaar> <${AddressTestBuilder.ANOTHER_VERWIJST_NAAR}>`,

                    `<${instanceId}> <http://data.europa.eu/m8g/hasContactPoint> <${InstanceTestBuilder.CONTACT_POINTS[0].id}>`,
                    `<${InstanceTestBuilder.CONTACT_POINTS[0].id}> a <http://schema.org/ContactPoint>`,
                    `<${InstanceTestBuilder.CONTACT_POINTS[0].id}> <http://mu.semte.ch/vocabularies/core/uuid> """${InstanceTestBuilder.CONTACT_POINTS[0].uuid}"""`,
                    `<${InstanceTestBuilder.CONTACT_POINTS[0].id}> <http://schema.org/url> """${InstanceTestBuilder.CONTACT_POINTS[0].url}"""`,
                    `<${InstanceTestBuilder.CONTACT_POINTS[0].id}> <http://schema.org/email> """${InstanceTestBuilder.CONTACT_POINTS[0].email}"""`,
                    `<${InstanceTestBuilder.CONTACT_POINTS[0].id}> <http://schema.org/telephone> """${InstanceTestBuilder.CONTACT_POINTS[0].telephone}"""`,
                    `<${InstanceTestBuilder.CONTACT_POINTS[0].id}> <http://schema.org/openingHours> """${InstanceTestBuilder.CONTACT_POINTS[0].openingHours}"""`,
                    `<${InstanceTestBuilder.CONTACT_POINTS[0].id}> <https://productencatalogus.data.vlaanderen.be/ns/ipdc-lpdc#address> <${InstanceTestBuilder.CONTACT_POINTS[0].address.id}>`,
                    `<${InstanceTestBuilder.CONTACT_POINTS[0].id}> <http://www.w3.org/ns/shacl#order> """0"""^^<http://www.w3.org/2001/XMLSchema#integer>`,
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
                    `<${instanceId}> <http://publications.europa.eu/resource/authority/language> <http://publications.europa.eu/resource/authority/language/NLD>`,
                    `<${instanceId}> <http://publications.europa.eu/resource/authority/language> <http://publications.europa.eu/resource/authority/language/ENG>`,
                    `<${instanceId}> <http://purl.org/dc/terms/created> """${InstanceTestBuilder.DATE_CREATED.value}"""^^<http://www.w3.org/2001/XMLSchema#dateTime>`,
                    `<${instanceId}> <http://purl.org/dc/terms/modified> """${InstanceTestBuilder.DATE_MODIFIED.value}"""^^<http://www.w3.org/2001/XMLSchema#dateTime>`,
                    `<${instanceId}> <http://www.w3.org/ns/adms#status> <http://lblod.data.gift/concepts/instance-status/verstuurd>`,
                    `<${instanceId}> <http://mu.semte.ch/vocabularies/ext/reviewStatus> <http://lblod.data.gift/concepts/review-status/concept-gewijzigd>`,
                    `<${instanceId}> <http://schema.org/publication> <http://lblod.data.gift/concepts/publication-status/te-herpubliceren>`,
                    `<${instanceId}> <http://purl.org/dc/terms/spatial> <${instance.spatials[0].value}>`,
                    `<${instanceId}> <http://purl.org/dc/terms/spatial> <${instance.spatials[1].value}>`,
                    `<${instanceId}> <http://purl.org/dc/terms/spatial> <${instance.spatials[2].value}>`,
                    `<${instanceId}> <http://purl.org/dc/terms/spatial> <${instance.spatials[2].value}>`,
                    `<${instanceId}> <http://data.europa.eu/m8g/hasLegalResource> <${InstanceTestBuilder.LEGAL_RESOURCES[0]}>`,
                    `<${instanceId}> <http://data.europa.eu/m8g/hasLegalResource> <${InstanceTestBuilder.LEGAL_RESOURCES[1]}>`,
                    `<${instanceId}> <http://data.europa.eu/m8g/hasLegalResource> <${InstanceTestBuilder.LEGAL_RESOURCES[2]}>`,
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
                    `<${instance.id}> a <http://purl.org/vocab/cpsv#PublicService>`,
                    `<${instance.id}> <http://mu.semte.ch/vocabularies/core/uuid> """${instance.uuid}"""`,
                    `<${instance.id}> <http://purl.org/pav/createdBy> <${bestuurseenheid.id.value}>`,
                    `<${instance.id}> <http://purl.org/dc/terms/created> """${InstanceTestBuilder.DATE_CREATED.value}"""^^<http://www.w3.org/2001/XMLSchema#dateTime>`,
                    `<${instance.id}> <http://purl.org/dc/terms/modified> """${InstanceTestBuilder.DATE_MODIFIED.value}"""^^<http://www.w3.org/2001/XMLSchema#dateTime>`,
                    `<${instance.id}> <http://www.w3.org/ns/adms#status> <http://lblod.data.gift/concepts/instance-status/ontwerp>`,
                    `<${instance.id}> <http://vocab.belgif.be/ns/publicservice#hasRequirement> <${requirement.id}>`,
                    `<${requirement.id}> a <http://data.europa.eu/m8g/Requirement>`,
                    `<${requirement.id}> <http://mu.semte.ch/vocabularies/core/uuid> """${requirement.uuid}"""`,
                    `<${requirement.id}> <http://www.w3.org/ns/shacl#order> """0"""^^<http://www.w3.org/2001/XMLSchema#integer>`,
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
                    `<${instance.id}> a <http://purl.org/vocab/cpsv#PublicService>`,
                    `<${instance.id}> <http://mu.semte.ch/vocabularies/core/uuid> """${instance.uuid}"""`,
                    `<${instance.id}> <http://purl.org/pav/createdBy> <${bestuurseenheid.id.value}>`,
                    `<${instance.id}> <http://purl.org/dc/terms/created> """${InstanceTestBuilder.DATE_CREATED.value}"""^^<http://www.w3.org/2001/XMLSchema#dateTime>`,
                    `<${instance.id}> <http://purl.org/dc/terms/modified> """${InstanceTestBuilder.DATE_MODIFIED.value}"""^^<http://www.w3.org/2001/XMLSchema#dateTime>`,
                    `<${instance.id}> <http://www.w3.org/ns/adms#status> <http://lblod.data.gift/concepts/instance-status/ontwerp>`,
                    `<${instance.id}> <http://vocab.belgif.be/ns/publicservice#hasRequirement> <${requirement.id}>`,
                    `<${requirement.id}> a <http://data.europa.eu/m8g/Requirement>`,
                    `<${requirement.id}> <http://mu.semte.ch/vocabularies/core/uuid> """${requirement.uuid}"""`,
                    `<${requirement.id}> <http://www.w3.org/ns/shacl#order> """0"""^^<http://www.w3.org/2001/XMLSchema#integer>`,
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
                    `<${instance.id}> a <http://purl.org/vocab/cpsv#PublicService>`,
                    `<${instance.id}> <http://mu.semte.ch/vocabularies/core/uuid> """${instance.uuid}"""`,
                    `<${instance.id}> <http://purl.org/pav/createdBy> <${bestuurseenheid.id.value}>`,
                    `<${instance.id}> <http://purl.org/dc/terms/created> """${InstanceTestBuilder.DATE_CREATED.value}"""^^<http://www.w3.org/2001/XMLSchema#dateTime>`,
                    `<${instance.id}> <http://purl.org/dc/terms/modified> """${InstanceTestBuilder.DATE_MODIFIED.value}"""^^<http://www.w3.org/2001/XMLSchema#dateTime>`,
                    `<${instance.id}> <http://www.w3.org/ns/adms#status> <http://lblod.data.gift/concepts/instance-status/ontwerp>`,
                    `<${instance.id}> <http://purl.org/vocab/cpsv#follows> <${procedure.id}>`,
                    `<${procedure.id}> a <http://purl.org/vocab/cpsv#Rule>`,
                    `<${procedure.id}> <http://mu.semte.ch/vocabularies/core/uuid> """${procedure.uuid}"""`,
                    `<${procedure.id}> <http://www.w3.org/ns/shacl#order> """0"""^^<http://www.w3.org/2001/XMLSchema#integer>`,
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
                    `<${instance.id}> a <http://purl.org/vocab/cpsv#PublicService>`,
                    `<${instance.id}> <http://mu.semte.ch/vocabularies/core/uuid> """${instance.uuid}"""`,
                    `<${instance.id}> <http://purl.org/pav/createdBy> <${bestuurseenheid.id.value}>`,
                    `<${instance.id}> <http://purl.org/dc/terms/created> """${InstanceTestBuilder.DATE_CREATED.value}"""^^<http://www.w3.org/2001/XMLSchema#dateTime>`,
                    `<${instance.id}> <http://purl.org/dc/terms/modified> """${InstanceTestBuilder.DATE_MODIFIED.value}"""^^<http://www.w3.org/2001/XMLSchema#dateTime>`,
                    `<${instance.id}> <http://www.w3.org/ns/adms#status> <http://lblod.data.gift/concepts/instance-status/ontwerp>`,
                    `<${instance.id}> <http://purl.org/vocab/cpsv#follows> <${procedure.id}>`,
                    `<${procedure.id}> a <http://purl.org/vocab/cpsv#Rule>`,
                    `<${procedure.id}> <http://mu.semte.ch/vocabularies/core/uuid> """${procedure.uuid}"""`,
                    `<${procedure.id}> <http://www.w3.org/ns/shacl#order> """0"""^^<http://www.w3.org/2001/XMLSchema#integer>`,
                    `<${procedure.id}> <https://productencatalogus.data.vlaanderen.be/ns/ipdc-lpdc#hasWebsite> <${procedure.websites[0].id}>`,
                    `<${procedure.websites[0].id}> a <http://schema.org/WebSite>`,
                    `<${procedure.websites[0].id}> <http://mu.semte.ch/vocabularies/core/uuid> """${procedure.websites[0].uuid}"""`,
                    `<${procedure.websites[0].id}> <http://www.w3.org/ns/shacl#order> """0"""^^<http://www.w3.org/2001/XMLSchema#integer>`,
                ]);

            const actualInstance = await repository.findById(bestuurseenheid, instance.id);

            expect(actualInstance).toEqual(instance);
        });

        for (const type of Object.values(InstanceStatusType)) {
            test(`Instance Status type ${type} can be mapped`, async () => {
                const instance = aMinimalInstance().withStatus(type).build();
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
                    `<${instanceId}> a <http://purl.org/vocab/cpsv#PublicService>`,
                    `<${instanceId}> <http://www.w3.org/ns/adms#status> <http://lblod.data.gift/concepts/instance-status/unknown-instance-status>`,
                ]);

            await expect(repository.findById(bestuurseenheid, instanceId)).rejects.toThrow(new Error(`could not map <http://lblod.data.gift/concepts/instance-status/unknown-instance-status> for iri: <${instanceId}>`));
        });

        for (const type of Object.values(ProductType)) {
            test(`Product type ${type} can be mapped`, async () => {
                const bestuurseenheid = aBestuurseenheid().build();
                const instance = aMinimalInstance()
                    .withCreatedBy(bestuurseenheid.id)
                    .withType(type)
                    .build();

                await repository.save(bestuurseenheid, instance);

                const actualConceptSnapshot = await repository.findById(bestuurseenheid, instance.id);

                expect(actualConceptSnapshot).toEqual(instance);
            });
        }

        test('Unknown Product Type can not be mapped', async () => {
            const bestuurseenheid = aBestuurseenheid().build();
            const instanceIri = buildInstanceIri(uuid());

            await directDatabaseAccess.insertData(
                bestuurseenheid.userGraph().value,
                [
                    `<${instanceIri}> a <http://purl.org/vocab/cpsv#PublicService>`,
                    `<${instanceIri}> <http://purl.org/dc/terms/type> <https://productencatalogus.data.vlaanderen.be/id/concept/Type/UnknownProductType>`,
                ]);

            await expect(repository.findById(bestuurseenheid, instanceIri)).rejects.toThrow(new Error(`could not map <https://productencatalogus.data.vlaanderen.be/id/concept/Type/UnknownProductType> for iri: <${instanceIri}>`));
        });

        for (const targetAudience of Object.values(TargetAudienceType)) {
            test(`TargetAudienceType ${targetAudience} can be mapped`, async () => {
                const bestuurseenheid = aBestuurseenheid().build();
                const instance = aMinimalInstance().withTargetAudiences([targetAudience]).build();
                await repository.save(bestuurseenheid, instance);

                const actualConceptSnapshot = await repository.findById(bestuurseenheid, instance.id);

                expect(actualConceptSnapshot).toEqual(instance);
            });
        }

        test('Unknown Target Audience Type can not be mapped', async () => {
            const bestuurseenheid = aBestuurseenheid().build();
            const instanceIri = buildInstanceIri(uuid());

            await directDatabaseAccess.insertData(
                bestuurseenheid.userGraph().value,
                [`<${instanceIri}> a <http://purl.org/vocab/cpsv#PublicService>`,
                    `<${instanceIri}> <https://productencatalogus.data.vlaanderen.be/ns/ipdc-lpdc#targetAudience> <https://productencatalogus.data.vlaanderen.be/id/concept/Doelgroep/NonExistingTargetAudience>`,
                ]);

            await expect(repository.findById(bestuurseenheid, instanceIri)).rejects.toThrow(new Error(`could not map <https://productencatalogus.data.vlaanderen.be/id/concept/Doelgroep/NonExistingTargetAudience> for iri: <${instanceIri}>`));
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
                [`<${instanceIri}> a <http://purl.org/vocab/cpsv#PublicService>`,
                    `<${instanceIri}> <http://data.europa.eu/m8g/thematicArea> <https://productencatalogus.data.vlaanderen.be/id/concept/Thema/NonExistingTheme>`,
                ]);

            await expect(repository.findById(bestuurseenheid, instanceIri)).rejects.toThrow(new Error(`could not map <https://productencatalogus.data.vlaanderen.be/id/concept/Thema/NonExistingTheme> for iri: <${instanceIri}>`));
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
                [`<${instanceIri}> a <http://purl.org/vocab/cpsv#PublicService>`,
                    `<${instanceIri}> <https://productencatalogus.data.vlaanderen.be/ns/ipdc-lpdc#competentAuthorityLevel> <https://productencatalogus.data.vlaanderen.be/id/concept/BevoegdBestuursniveau/NonExistingCompetentAuthorityLevel>`,
                ]);

            await expect(repository.findById(bestuurseenheid, instanceIri)).rejects.toThrow(new Error(`could not map <https://productencatalogus.data.vlaanderen.be/id/concept/BevoegdBestuursniveau/NonExistingCompetentAuthorityLevel> for iri: <${instanceIri}>`));
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
                [`<${instanceIri}> a <http://purl.org/vocab/cpsv#PublicService>`,
                    `<${instanceIri}> <https://productencatalogus.data.vlaanderen.be/ns/ipdc-lpdc#executingAuthorityLevel> <https://productencatalogus.data.vlaanderen.be/id/concept/UitvoerendBestuursniveau/NonExistingExecutingAuthorityLevel>`,
                ]);

            await expect(repository.findById(bestuurseenheid, instanceIri)).rejects.toThrow(new Error(`could not map <https://productencatalogus.data.vlaanderen.be/id/concept/UitvoerendBestuursniveau/NonExistingExecutingAuthorityLevel> for iri: <${instanceIri}>`));
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
                [`<${instanceId}> a <http://purl.org/vocab/cpsv#PublicService>`,
                    `<${instanceId}> <https://productencatalogus.data.vlaanderen.be/ns/ipdc-lpdc#publicationMedium> <https://productencatalogus.data.vlaanderen.be/id/concept/PublicatieKanaal/NonExistingPublicationMedium>`,
                ]);

            await expect(repository.findById(bestuurseenheid, instanceId)).rejects.toThrow(new Error(`could not map <https://productencatalogus.data.vlaanderen.be/id/concept/PublicatieKanaal/NonExistingPublicationMedium> for iri: <${instanceId}>`));
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
                [`<${instanceId}> a <http://purl.org/vocab/cpsv#PublicService>`,
                    `<${instanceId}> <https://productencatalogus.data.vlaanderen.be/ns/ipdc-lpdc#yourEuropeCategory> <https://productencatalogus.data.vlaanderen.be/id/concept/YourEuropeCatagory/NonExistingYourEuropeCategory>`,
                ]);

            await expect(repository.findById(bestuurseenheid, instanceId)).rejects.toThrow(new Error(`could not map <https://productencatalogus.data.vlaanderen.be/id/concept/YourEuropeCatagory/NonExistingYourEuropeCategory> for iri: <${instanceId}>`));
        });
    });
});