import {TEST_SPARQL_ENDPOINT} from "../../test.config";
import {DirectDatabaseAccess} from "./direct-database-access";
import {sparqlEscapeUri, uuid} from "../../../mu-helper";
import {buildInstanceIri, buildInstanceSnapshotIri} from "../../core/domain/iri-test-builder";
import {aBestuurseenheid} from "../../core/domain/bestuurseenheid-test-builder";
import {
    aFullInstanceSnapshot,
    aMinimalInstanceSnapshot,
    InstanceSnapshotTestBuilder
} from "../../core/domain/instance-snapshot-test-builder";
import {BestuurseenheidSparqlTestRepository} from "./bestuurseenheid-sparql-test-repository";
import {InstanceSnapshotSparqlTestRepository} from "./instance-snapshot-sparql-test-repository";
import {LanguageString} from "../../../src/core/domain/language-string";
import {NS} from "../../../src/driven/persistence/namespaces";
import {
    CompetentAuthorityLevelType,
    ExecutingAuthorityLevelType,
    ProductType,
    PublicationMediumType,
    TargetAudienceType,
    ThemeType
} from "../../../src/core/domain/types";

describe('InstanceSnapshotRepository', () => {

    const repository = new InstanceSnapshotSparqlTestRepository(TEST_SPARQL_ENDPOINT);
    const bestuurseenheidRepository = new BestuurseenheidSparqlTestRepository(TEST_SPARQL_ENDPOINT);
    const directDatabaseAccess = new DirectDatabaseAccess(TEST_SPARQL_ENDPOINT);

    describe('findById', () => {

        test('When full instance snapshot exists with id, then return instance snapshot', async () => {
            const bestuurseenheid = aBestuurseenheid().build();
            const anotherBestuurseenheid = aBestuurseenheid().build();
            await bestuurseenheidRepository.save(bestuurseenheid);
            await bestuurseenheidRepository.save(anotherBestuurseenheid);

            const instanceSnapshot = aFullInstanceSnapshot().withCreatedBy(bestuurseenheid.id).build();
            await repository.save(bestuurseenheid, instanceSnapshot);

            const anotherInstanceSnapshot = aFullInstanceSnapshot().withCreatedBy(anotherBestuurseenheid.id).build();
            await repository.save(bestuurseenheid, anotherInstanceSnapshot);

            const actualInstance = await repository.findById(bestuurseenheid, instanceSnapshot.id);

            expect(actualInstance).toEqual(instanceSnapshot);

        });

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

        test('When instance snapshot does not exist with id, then throw error', async() => {
            const bestuurseenheid = aBestuurseenheid().build();
            await bestuurseenheidRepository.save(bestuurseenheid);

            const instanceSnapshot = aMinimalInstanceSnapshot().withCreatedBy(bestuurseenheid.id).build();
            await repository.save(bestuurseenheid, instanceSnapshot);

            const nonExistentInstanceSnapshotId = buildInstanceSnapshotIri('thisiddoesnotexist');

            await expect(repository.findById(bestuurseenheid, nonExistentInstanceSnapshotId)).rejects.toThrow(new Error(`Could not find <http://data.lblod.info/id/public-service-snapshot/thisiddoesnotexist> for type <http://purl.org/vocab/cpsv#PublicService> in graph <http://mu.semte.ch/graphs/lpdc/instancesnapshots-ldes-data/${bestuurseenheid.uuid}>`));

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

        test('Verify full mapping', async() => {
            const instanceUUID = uuid();
            const instanceId = buildInstanceIri(instanceUUID);
            const instanceSnapshotUUID = uuid();
            const instanceSnapshotId = buildInstanceSnapshotIri(instanceSnapshotUUID);

            const bestuurseenheid = aBestuurseenheid().build();

            const instanceSnapshot =
                aFullInstanceSnapshot()
                    .withId(instanceSnapshotId)
                    .withCreatedBy(bestuurseenheid.id)
                    .withIsVersionOfInstance(instanceId)
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
                    `${sparqlEscapeUri(instanceSnapshotId)} <https://productencatalogus.data.vlaanderen.be/ns/ipdc-lpdc#additionalDescription> """${InstanceSnapshotTestBuilder.ADDITIONAL_DESCRIPTION_EN}"""@en`,
                    `${sparqlEscapeUri(instanceSnapshotId)} <https://productencatalogus.data.vlaanderen.be/ns/ipdc-lpdc#additionalDescription> """${InstanceSnapshotTestBuilder.ADDITIONAL_DESCRIPTION_NL_INFORMAL}"""@nl-BE-x-informal`,
                    `${sparqlEscapeUri(instanceSnapshotId)} <https://productencatalogus.data.vlaanderen.be/ns/ipdc-lpdc#exception> """${InstanceSnapshotTestBuilder.EXCEPTION_EN}"""@en`,
                    `${sparqlEscapeUri(instanceSnapshotId)} <https://productencatalogus.data.vlaanderen.be/ns/ipdc-lpdc#exception> """${InstanceSnapshotTestBuilder.EXCEPTION_NL_INFORMAL}"""@nl-BE-x-informal`,
                    `${sparqlEscapeUri(instanceSnapshotId)} <https://productencatalogus.data.vlaanderen.be/ns/ipdc-lpdc#regulation> """${InstanceSnapshotTestBuilder.REGULATION_EN}"""@en`,
                    `${sparqlEscapeUri(instanceSnapshotId)} <https://productencatalogus.data.vlaanderen.be/ns/ipdc-lpdc#regulation> """${InstanceSnapshotTestBuilder.REGULATION_NL_INFORMAL}"""@nl-BE-x-informal`,
                    `${sparqlEscapeUri(instanceSnapshotId)} <http://schema.org/startDate> """${InstanceSnapshotTestBuilder.START_DATE.value}"""^^<http://www.w3.org/2001/XMLSchema#dateTime>`,
                    `${sparqlEscapeUri(instanceSnapshotId)} <http://schema.org/endDate> """${InstanceSnapshotTestBuilder.END_DATE.value}"""^^<http://www.w3.org/2001/XMLSchema#dateTime>`,
                    `${sparqlEscapeUri(instanceSnapshotId)} <http://purl.org/dc/terms/type> <${NS.dvc.type(InstanceSnapshotTestBuilder.TYPE).value}>`,
                    `${sparqlEscapeUri(instanceSnapshotId)} <https://productencatalogus.data.vlaanderen.be/ns/ipdc-lpdc#targetAudience> <${NS.dvc.doelgroep(InstanceSnapshotTestBuilder.TARGET_AUDIENCES[0]).value}>`,
                    `${sparqlEscapeUri(instanceSnapshotId)} <https://productencatalogus.data.vlaanderen.be/ns/ipdc-lpdc#targetAudience> <${NS.dvc.doelgroep(InstanceSnapshotTestBuilder.TARGET_AUDIENCES[1]).value}>`,
                    `${sparqlEscapeUri(instanceSnapshotId)} <https://productencatalogus.data.vlaanderen.be/ns/ipdc-lpdc#targetAudience> <${NS.dvc.doelgroep(InstanceSnapshotTestBuilder.TARGET_AUDIENCES[2]).value}>`,
                    `${sparqlEscapeUri(instanceSnapshotId)} <http://data.europa.eu/m8g/thematicArea> <${NS.dvc.thema(InstanceSnapshotTestBuilder.THEMES[0]).value}>`,
                    `${sparqlEscapeUri(instanceSnapshotId)} <http://data.europa.eu/m8g/thematicArea> <${NS.dvc.thema(InstanceSnapshotTestBuilder.THEMES[1]).value}>`,
                    `${sparqlEscapeUri(instanceSnapshotId)} <http://data.europa.eu/m8g/thematicArea> <${NS.dvc.thema(InstanceSnapshotTestBuilder.THEMES[2]).value}>`,
                    `${sparqlEscapeUri(instanceSnapshotId)} <https://productencatalogus.data.vlaanderen.be/ns/ipdc-lpdc#competentAuthorityLevel> <${NS.dvc.bevoegdBestuursniveau(InstanceSnapshotTestBuilder.COMPETENT_AUTHORITY_LEVELS[0]).value}>`,
                    `${sparqlEscapeUri(instanceSnapshotId)} <https://productencatalogus.data.vlaanderen.be/ns/ipdc-lpdc#competentAuthorityLevel> <${NS.dvc.bevoegdBestuursniveau(InstanceSnapshotTestBuilder.COMPETENT_AUTHORITY_LEVELS[1]).value}>`,
                    `${sparqlEscapeUri(instanceSnapshotId)} <https://productencatalogus.data.vlaanderen.be/ns/ipdc-lpdc#competentAuthorityLevel> <${NS.dvc.bevoegdBestuursniveau(InstanceSnapshotTestBuilder.COMPETENT_AUTHORITY_LEVELS[2]).value}>`,
                    `${sparqlEscapeUri(instanceSnapshotId)} <http://data.europa.eu/m8g/hasCompetentAuthority> <${InstanceSnapshotTestBuilder.COMPETENT_AUTHORITIES[0]}>`,
                    `${sparqlEscapeUri(instanceSnapshotId)} <http://data.europa.eu/m8g/hasCompetentAuthority> <${InstanceSnapshotTestBuilder.COMPETENT_AUTHORITIES[1]}>`,
                    `${sparqlEscapeUri(instanceSnapshotId)} <http://data.europa.eu/m8g/hasCompetentAuthority> <${InstanceSnapshotTestBuilder.COMPETENT_AUTHORITIES[2]}>`,
                    `${sparqlEscapeUri(instanceSnapshotId)} <https://productencatalogus.data.vlaanderen.be/ns/ipdc-lpdc#executingAuthorityLevel> <${NS.dvc.uitvoerendBestuursniveau(InstanceSnapshotTestBuilder.EXECUTING_AUTHORITY_LEVELS[0]).value}>`,
                    `${sparqlEscapeUri(instanceSnapshotId)} <https://productencatalogus.data.vlaanderen.be/ns/ipdc-lpdc#executingAuthorityLevel> <${NS.dvc.uitvoerendBestuursniveau(InstanceSnapshotTestBuilder.EXECUTING_AUTHORITY_LEVELS[1]).value}>`,
                    `${sparqlEscapeUri(instanceSnapshotId)} <https://productencatalogus.data.vlaanderen.be/ns/ipdc-lpdc#executingAuthorityLevel> <${NS.dvc.uitvoerendBestuursniveau(InstanceSnapshotTestBuilder.EXECUTING_AUTHORITY_LEVELS[2]).value}>`,
                    `${sparqlEscapeUri(instanceSnapshotId)} <https://productencatalogus.data.vlaanderen.be/ns/ipdc-lpdc#hasExecutingAuthority> <${InstanceSnapshotTestBuilder.EXECUTING_AUTHORITIES[0]}>`,
                    `${sparqlEscapeUri(instanceSnapshotId)} <https://productencatalogus.data.vlaanderen.be/ns/ipdc-lpdc#hasExecutingAuthority> <${InstanceSnapshotTestBuilder.EXECUTING_AUTHORITIES[1]}>`,
                    `${sparqlEscapeUri(instanceSnapshotId)} <https://productencatalogus.data.vlaanderen.be/ns/ipdc-lpdc#publicationMedium> <${NS.dvc.publicatieKanaal(InstanceSnapshotTestBuilder.PUBLICATION_MEDIA[0]).value}>`,
                    `${sparqlEscapeUri(instanceSnapshotId)} <https://productencatalogus.data.vlaanderen.be/ns/ipdc-lpdc#publicationMedium> <${NS.dvc.publicatieKanaal(InstanceSnapshotTestBuilder.PUBLICATION_MEDIA[1]).value}>`,
                    `${sparqlEscapeUri(instanceSnapshotId)} <http://purl.org/dc/terms/created> """${InstanceSnapshotTestBuilder.DATE_CREATED.value}"""^^<http://www.w3.org/2001/XMLSchema#dateTime>`,
                    `${sparqlEscapeUri(instanceSnapshotId)} <http://purl.org/dc/terms/created> """${InstanceSnapshotTestBuilder.DATE_CREATED.value}"""^^<http://www.w3.org/2001/XMLSchema#dateTime>`,
                    `${sparqlEscapeUri(instanceSnapshotId)} <http://purl.org/dc/terms/modified> """${InstanceSnapshotTestBuilder.DATE_MODIFIED.value}"""^^<http://www.w3.org/2001/XMLSchema#dateTime>`,
                    `${sparqlEscapeUri(instanceSnapshotId)} <http://www.w3.org/ns/prov#generatedAtTime> """${InstanceSnapshotTestBuilder.GENERATED_AT_TIME.value}"""^^<http://www.w3.org/2001/XMLSchema#dateTime>`,
                ]);

            const actualInstanceSnapshot = await repository.findById(bestuurseenheid, instanceSnapshotId);

            expect(actualInstanceSnapshot).toEqual(instanceSnapshot);

        });

        for (const type of Object.values(ProductType)) {
            test(`Product type ${type} can be mapped`, async () => {
                const bestuurseenheid = aBestuurseenheid().build();
                const instance = aMinimalInstanceSnapshot()
                    .withCreatedBy(bestuurseenheid.id)
                    .withType(type)
                    .build();

                await repository.save(bestuurseenheid, instance);

                const actualInstanceSnapshot = await repository.findById(bestuurseenheid, instance.id);

                expect(actualInstanceSnapshot).toEqual(instance);
            });
        }


        test('Unknown Product Type can not be mapped', async () => {
            const bestuurseenheid = aBestuurseenheid().build();
            const instanceSnapshotIri = buildInstanceSnapshotIri(uuid());

            await directDatabaseAccess.insertData(
                bestuurseenheid.instanceSnapshotsLdesDataGraph().value,
                [
                    `<${instanceSnapshotIri}> a <http://purl.org/vocab/cpsv#PublicService>`,
                    `<${instanceSnapshotIri}> <http://purl.org/dc/terms/type> <https://productencatalogus.data.vlaanderen.be/id/concept/Type/UnknownProductType>`,
                ]);

            await expect(repository.findById(bestuurseenheid, instanceSnapshotIri)).rejects.toThrow(new Error(`could not map <https://productencatalogus.data.vlaanderen.be/id/concept/Type/UnknownProductType> for iri: <${instanceSnapshotIri}>`));
        });

        for (const targetAudience of Object.values(TargetAudienceType)) {
            test(`TargetAudienceType ${targetAudience} can be mapped`, async () => {
                const bestuurseenheid = aBestuurseenheid().build();
                const instanceSnapshot = aMinimalInstanceSnapshot().withTargetAudiences([targetAudience]).build();
                await repository.save(bestuurseenheid, instanceSnapshot);

                const actualInstanceSnapshot = await repository.findById(bestuurseenheid, instanceSnapshot.id);

                expect(actualInstanceSnapshot).toEqual(instanceSnapshot);
            });
        }

        test('Unknown Target Audience Type can not be mapped', async () => {
            const bestuurseenheid = aBestuurseenheid().build();
            const instanceSnapshotIri = buildInstanceSnapshotIri(uuid());

            await directDatabaseAccess.insertData(
                bestuurseenheid.instanceSnapshotsLdesDataGraph().value,
                [`<${instanceSnapshotIri}> a <http://purl.org/vocab/cpsv#PublicService>`,
                    `<${instanceSnapshotIri}> <https://productencatalogus.data.vlaanderen.be/ns/ipdc-lpdc#targetAudience> <https://productencatalogus.data.vlaanderen.be/id/concept/Doelgroep/NonExistingTargetAudience>`,
                ]);

            await expect(repository.findById(bestuurseenheid, instanceSnapshotIri)).rejects.toThrow(new Error(`could not map <https://productencatalogus.data.vlaanderen.be/id/concept/Doelgroep/NonExistingTargetAudience> for iri: <${instanceSnapshotIri}>`));
        });

        for (const theme of Object.values(ThemeType)) {
            test(`ThemeType ${theme} can be mapped`, async () => {
                const bestuurseenheid = aBestuurseenheid().build();
                const instanceSnapshot = aMinimalInstanceSnapshot().withThemes([theme]).build();
                await repository.save(bestuurseenheid, instanceSnapshot);

                const actualInstanceSnapshot = await repository.findById(bestuurseenheid, instanceSnapshot.id);

                expect(actualInstanceSnapshot).toEqual(instanceSnapshot);
            });
        }

        test('Unknown Theme type can not be mapped', async () => {
            const instanceSnapshotIri = buildInstanceSnapshotIri(uuid());
            const bestuurseenheid = aBestuurseenheid().build();

            await directDatabaseAccess.insertData(
                bestuurseenheid.instanceSnapshotsLdesDataGraph().value,
                [`<${instanceSnapshotIri}> a <http://purl.org/vocab/cpsv#PublicService>`,
                    `<${instanceSnapshotIri}> <http://data.europa.eu/m8g/thematicArea> <https://productencatalogus.data.vlaanderen.be/id/concept/Thema/NonExistingTheme>`,
                ]);

            await expect(repository.findById(bestuurseenheid, instanceSnapshotIri)).rejects.toThrow(new Error(`could not map <https://productencatalogus.data.vlaanderen.be/id/concept/Thema/NonExistingTheme> for iri: <${instanceSnapshotIri}>`));
        });

        for (const competentAuthorityLevel of Object.values(CompetentAuthorityLevelType)) {
            test(`CompetentAuthorityLevelType ${competentAuthorityLevel} can be mapped`, async () => {
                const bestuurseenheid = aBestuurseenheid().build();
                const instanceSnapshot = aMinimalInstanceSnapshot().withCompetentAuthorityLevels([competentAuthorityLevel]).build();
                await repository.save(bestuurseenheid, instanceSnapshot);

                const actualInstanceSnapshot = await repository.findById(bestuurseenheid, instanceSnapshot.id);

                expect(actualInstanceSnapshot).toEqual(instanceSnapshot);
            });
        }

        test('Unknown Competent Authority Level type can not be mapped', async () => {
            const bestuurseenheid = aBestuurseenheid().build();
            const instanceSnapshotIri = buildInstanceSnapshotIri(uuid());

            await directDatabaseAccess.insertData(
                bestuurseenheid.instanceSnapshotsLdesDataGraph().value,
                [`<${instanceSnapshotIri}> a <http://purl.org/vocab/cpsv#PublicService>`,
                    `<${instanceSnapshotIri}> <https://productencatalogus.data.vlaanderen.be/ns/ipdc-lpdc#competentAuthorityLevel> <https://productencatalogus.data.vlaanderen.be/id/concept/BevoegdBestuursniveau/NonExistingCompetentAuthorityLevel>`,
                ]);

            await expect(repository.findById(bestuurseenheid, instanceSnapshotIri)).rejects.toThrow(new Error(`could not map <https://productencatalogus.data.vlaanderen.be/id/concept/BevoegdBestuursniveau/NonExistingCompetentAuthorityLevel> for iri: <${instanceSnapshotIri}>`));
        });

        for (const executingAuthorityLevel of Object.values(ExecutingAuthorityLevelType)) {
            test(`ExecutingAuthorityLevelType ${executingAuthorityLevel} can be mapped`, async () => {
                const bestuurseenheid = aBestuurseenheid().build();
                const instanceSnapshot = aMinimalInstanceSnapshot().withExecutingAuthorityLevels([executingAuthorityLevel]).build();
                await repository.save(bestuurseenheid, instanceSnapshot);

                const actualInstanceSnapshot = await repository.findById(bestuurseenheid, instanceSnapshot.id);

                expect(actualInstanceSnapshot).toEqual(instanceSnapshot);
            });
        }

        test('Unknown ExecutingAuthorityLevelType can not be mapped', async () => {
            const bestuurseenheid = aBestuurseenheid().build();
            const instanceSnapshotIri = buildInstanceSnapshotIri(uuid());

            await directDatabaseAccess.insertData(
                bestuurseenheid.instanceSnapshotsLdesDataGraph().value,
                [`<${instanceSnapshotIri}> a <http://purl.org/vocab/cpsv#PublicService>`,
                    `<${instanceSnapshotIri}> <https://productencatalogus.data.vlaanderen.be/ns/ipdc-lpdc#executingAuthorityLevel> <https://productencatalogus.data.vlaanderen.be/id/concept/UitvoerendBestuursniveau/NonExistingExecutingAuthorityLevel>`,
                ]);

            await expect(repository.findById(bestuurseenheid, instanceSnapshotIri)).rejects.toThrow(new Error(`could not map <https://productencatalogus.data.vlaanderen.be/id/concept/UitvoerendBestuursniveau/NonExistingExecutingAuthorityLevel> for iri: <${instanceSnapshotIri}>`));
        });

        for (const publicationMedium of Object.values(PublicationMediumType)) {
            test(`PublicationMediumType ${publicationMedium} can be mapped`, async () => {
                const bestuurseenheid = aBestuurseenheid().build();
                const instanceSnapshot = aMinimalInstanceSnapshot().withPublicationMedia([publicationMedium]).build();
                await repository.save(bestuurseenheid, instanceSnapshot);

                const actualInstanceSnapshot = await repository.findById(bestuurseenheid, instanceSnapshot.id);

                expect(actualInstanceSnapshot).toEqual(instanceSnapshot);
            });
        }

        test('Unknown PublicationMediumType can not be mapped', async () => {
            const bestuurseenheid = aBestuurseenheid().build();
            const instanceSnapshotId = buildInstanceSnapshotIri(uuid());

            await directDatabaseAccess.insertData(
                bestuurseenheid.instanceSnapshotsLdesDataGraph().value,
                [`<${instanceSnapshotId}> a <http://purl.org/vocab/cpsv#PublicService>`,
                    `<${instanceSnapshotId}> <https://productencatalogus.data.vlaanderen.be/ns/ipdc-lpdc#publicationMedium> <https://productencatalogus.data.vlaanderen.be/id/concept/PublicatieKanaal/NonExistingPublicationMedium>`,
                ]);

            await expect(repository.findById(bestuurseenheid, instanceSnapshotId)).rejects.toThrow(new Error(`could not map <https://productencatalogus.data.vlaanderen.be/id/concept/PublicatieKanaal/NonExistingPublicationMedium> for iri: <${instanceSnapshotId}>`));
        });



    });


});