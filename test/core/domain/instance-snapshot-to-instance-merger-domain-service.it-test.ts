import {aBestuurseenheid} from "./bestuurseenheid-test-builder";
import {BestuurseenheidSparqlTestRepository} from "../../driven/persistence/bestuurseenheid-sparql-test-repository";
import {TEST_SPARQL_ENDPOINT} from "../../test.config";
import {aFullInstanceSnapshot, aMinimalInstanceSnapshot} from "./instance-snapshot-test-builder";
import {InstanceSnapshotSparqlTestRepository} from "../../driven/persistence/instance-snapshot-sparql-test-repository";
import {
    InstanceSnapshotToInstanceMergerDomainService
} from "../../../src/core/domain/instance-snapshot-to-instance-merger-domain-service";
import {InstanceSparqlRepository} from "../../../src/driven/persistence/instance-sparql-repository";
import {InstancePublicationStatusType, InstanceStatusType} from "../../../src/core/domain/types";
import {restoreRealTime, setFixedTime} from "../../fixed-time";
import {FormatPreservingDate} from "../../../src/core/domain/format-preserving-date";
import {ConceptSparqlRepository} from "../../../src/driven/persistence/concept-sparql-repository";
import {aFullConcept} from "./concept-test-builder";
import {aFullInstance} from "./instance-test-builder";
import {sparqlEscapeUri, uuid} from "../../../mu-helper";
import {SparqlQuerying} from "../../../src/driven/persistence/sparql-querying";
import {literal, namedNode, quad} from "rdflib";
import {DirectDatabaseAccess} from "../../driven/persistence/direct-database-access";
import {buildBestuurseenheidIri, buildConceptIri, buildInstanceIri} from "./iri-test-builder";
import {LanguageString} from "../../../src/core/domain/language-string";
import {
    ConceptDisplayConfigurationSparqlRepository
} from "../../../src/driven/persistence/concept-display-configuration-sparql-repository";
import {Iri} from "../../../src/core/domain/shared/iri";
import {PREFIX, PUBLIC_GRAPH} from "../../../config";
import {NS} from "../../../src/driven/persistence/namespaces";
import {CodeSchema} from "../../../src/core/port/driven/persistence/code-repository";
import {CodeSparqlRepository} from "../../../src/driven/persistence/code-sparql-repository";
import {
    EnsureLinkedAuthoritiesExistAsCodeListDomainService
} from "../../../src/core/domain/ensure-linked-authorities-exist-as-code-list-domain-service";
import {DeleteInstanceDomainService} from "../../../src/core/domain/delete-instance-domain-service";
import {Bestuurseenheid} from "../../../src/core/domain/bestuurseenheid";
import {Instance} from "../../../src/core/domain/instance";
import {InvariantError} from "../../../src/core/domain/shared/lpdc-error";
import {aFullContactPointForInstance} from "./contact-point-test-builder";
import {aFullAddressForInstance} from "./address-test-builder";

describe('instanceSnapshotToInstanceMapperDomainService', () => {
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

    const bestuurseenheidRepository = new BestuurseenheidSparqlTestRepository(TEST_SPARQL_ENDPOINT);
    const instanceSnapshotRepository = new InstanceSnapshotSparqlTestRepository(TEST_SPARQL_ENDPOINT);
    const instanceRepository = new InstanceSparqlRepository(TEST_SPARQL_ENDPOINT);
    const conceptRepository = new ConceptSparqlRepository(TEST_SPARQL_ENDPOINT);
    const bestuurseenheidRegistrationCodeFetcher = {
        fetchOrgRegistryCodelistEntry: jest.fn().mockReturnValue(Promise.resolve({}))
    };
    const codeRepository = new CodeSparqlRepository(TEST_SPARQL_ENDPOINT);
    const ensureLinkedAuthoritiesExistAsCodeListDomainService = new EnsureLinkedAuthoritiesExistAsCodeListDomainService(bestuurseenheidRegistrationCodeFetcher, codeRepository);
    const conceptDisplayConfigurationRepository = new ConceptDisplayConfigurationSparqlRepository(TEST_SPARQL_ENDPOINT);
    const deleteInstanceDomainService = new DeleteInstanceDomainService(instanceRepository, conceptDisplayConfigurationRepository);
    const mapperDomainService = new InstanceSnapshotToInstanceMergerDomainService(
        instanceSnapshotRepository,
        instanceRepository,
        conceptRepository,
        conceptDisplayConfigurationRepository,
        deleteInstanceDomainService,
        ensureLinkedAuthoritiesExistAsCodeListDomainService
    );
    const directDatabaseAccess = new DirectDatabaseAccess(TEST_SPARQL_ENDPOINT);

    beforeAll(() => setFixedTime());

    afterAll(() => restoreRealTime());

    describe('Instance does not exists', () => {

        test('Given a minimalistic instanceSnapshot, then instance is created', async () => {
            const bestuurseenheid = aBestuurseenheid().build();
            await bestuurseenheidRepository.save(bestuurseenheid);

            const instanceSnapshot = aMinimalInstanceSnapshot().withCreatedBy(bestuurseenheid.id).withConceptId(undefined).build();
            await instanceSnapshotRepository.save(bestuurseenheid, instanceSnapshot);

            const instanceExists = await instanceRepository.exists(bestuurseenheid, instanceSnapshot.isVersionOfInstance);
            expect(instanceExists).toEqual(false);

            await mapperDomainService.merge(bestuurseenheid, instanceSnapshot.id);

            const instanceAfterMerge = await instanceRepository.findById(bestuurseenheid, instanceSnapshot.isVersionOfInstance);
            expect(instanceAfterMerge.id).toEqual(instanceSnapshot.isVersionOfInstance);
            expect(instanceAfterMerge.uuid).toBeDefined();
            expect(instanceAfterMerge.createdBy).toEqual(bestuurseenheid.id);
            expect(instanceAfterMerge.title).toEqual(instanceSnapshot.title);
            expect(instanceAfterMerge.description).toEqual(instanceSnapshot.description);
            expect(instanceAfterMerge.additionalDescription).toEqual(instanceSnapshot.additionalDescription);
            expect(instanceAfterMerge.exception).toEqual(instanceSnapshot.exception);
            expect(instanceAfterMerge.regulation).toEqual(instanceSnapshot.regulation);
            expect(instanceAfterMerge.startDate).toEqual(instanceSnapshot.startDate);
            expect(instanceAfterMerge.endDate).toEqual(instanceSnapshot.endDate);
            expect(instanceAfterMerge.type).toEqual(instanceSnapshot.type);
            expect(instanceAfterMerge.targetAudiences).toEqual(instanceSnapshot.targetAudiences);
            expect(instanceAfterMerge.themes).toEqual(instanceSnapshot.themes);
            expect(instanceAfterMerge.competentAuthorityLevels).toEqual(instanceSnapshot.competentAuthorityLevels);
            expect(instanceAfterMerge.competentAuthorities).toEqual(instanceSnapshot.competentAuthorities);
            expect(instanceAfterMerge.executingAuthorityLevels).toEqual(instanceSnapshot.executingAuthorityLevels);
            expect(instanceAfterMerge.executingAuthorities).toEqual(instanceSnapshot.executingAuthorities);
            expect(instanceAfterMerge.publicationMedia).toEqual(instanceSnapshot.publicationMedia);
            expect(instanceAfterMerge.yourEuropeCategories).toEqual(instanceSnapshot.yourEuropeCategories);
            expect(instanceAfterMerge.keywords).toEqual(instanceSnapshot.keywords);
            expect(instanceAfterMerge.requirements).toEqual([]);
            expect(instanceAfterMerge.procedures).toEqual([]);
            expect(instanceAfterMerge.websites).toEqual([]);
            expect(instanceAfterMerge.costs).toEqual([]);
            expect(instanceAfterMerge.financialAdvantages).toEqual([]);
            expect(instanceAfterMerge.contactPoints).toEqual([]);
            expect(instanceAfterMerge.conceptId).toEqual(undefined);
            expect(instanceAfterMerge.conceptSnapshotId).toEqual(undefined);
            expect(instanceAfterMerge.productId).toEqual(undefined);
            expect(instanceAfterMerge.languages).toEqual(instanceSnapshot.languages);
            expect(instanceAfterMerge.dateCreated).toEqual(instanceSnapshot.dateCreated);
            expect(instanceAfterMerge.dateModified).toEqual(instanceSnapshot.dateModified);
            expect(instanceAfterMerge.dateSent).toEqual(FormatPreservingDate.now());
            expect(instanceAfterMerge.datePublished).toEqual(undefined);
            expect(instanceAfterMerge.status).toEqual(InstanceStatusType.VERSTUURD);
            expect(instanceAfterMerge.reviewStatus).toEqual(undefined);
            expect(instanceAfterMerge.publicationStatus).toEqual(undefined);
            expect(instanceAfterMerge.spatials).toEqual(instanceSnapshot.spatials);
            expect(instanceAfterMerge.legalResources).toEqual(instanceSnapshot.legalResources);
        });

        test('Given a full instanceSnapshot, then instance is created', async () => {
            const bestuurseenheid = aBestuurseenheid().build();
            await bestuurseenheidRepository.save(bestuurseenheid);

            const concept = aFullConcept().build();
            await conceptRepository.save(concept);
            await conceptDisplayConfigurationRepository.ensureConceptDisplayConfigurationsForAllBestuurseenheden(concept.id);

            const instanceSnapshot = aFullInstanceSnapshot().withCreatedBy(bestuurseenheid.id).withConceptId(concept.id).build();
            await instanceSnapshotRepository.save(bestuurseenheid, instanceSnapshot);

            const instanceExists = await instanceRepository.exists(bestuurseenheid, instanceSnapshot.isVersionOfInstance);
            expect(instanceExists).toEqual(false);

            await mapperDomainService.merge(bestuurseenheid, instanceSnapshot.id);

            const instanceAfterMerge = await instanceRepository.findById(bestuurseenheid, instanceSnapshot.isVersionOfInstance);
            expect(instanceAfterMerge.id).toEqual(instanceSnapshot.isVersionOfInstance);
            expect(instanceAfterMerge.uuid).toBeDefined();
            expect(instanceAfterMerge.createdBy).toEqual(bestuurseenheid.id);
            expect(instanceAfterMerge.title).toEqual(instanceSnapshot.title);
            expect(instanceAfterMerge.description).toEqual(instanceSnapshot.description);
            expect(instanceAfterMerge.additionalDescription).toEqual(instanceSnapshot.additionalDescription);
            expect(instanceAfterMerge.exception).toEqual(instanceSnapshot.exception);
            expect(instanceAfterMerge.regulation).toEqual(instanceSnapshot.regulation);
            expect(instanceAfterMerge.startDate).toEqual(instanceSnapshot.startDate);
            expect(instanceAfterMerge.endDate).toEqual(instanceSnapshot.endDate);
            expect(instanceAfterMerge.type).toEqual(instanceSnapshot.type);
            expect(instanceAfterMerge.targetAudiences).toEqual(instanceSnapshot.targetAudiences);
            expect(instanceAfterMerge.themes).toEqual(instanceSnapshot.themes);
            expect(instanceAfterMerge.competentAuthorityLevels).toEqual(instanceSnapshot.competentAuthorityLevels);
            expect(instanceAfterMerge.competentAuthorities).toEqual(instanceSnapshot.competentAuthorities);
            expect(instanceAfterMerge.executingAuthorityLevels).toEqual(instanceSnapshot.executingAuthorityLevels);
            expect(instanceAfterMerge.executingAuthorities).toEqual(instanceSnapshot.executingAuthorities);
            expect(instanceAfterMerge.publicationMedia).toEqual(instanceSnapshot.publicationMedia);
            expect(instanceAfterMerge.yourEuropeCategories).toEqual(instanceSnapshot.yourEuropeCategories);
            expect(instanceAfterMerge.keywords).toEqual(instanceSnapshot.keywords);
            expect(instanceAfterMerge.requirements).toEqual(expect.arrayContaining([
                expect.objectContaining({
                    _id: expect.not.objectContaining(instanceSnapshot.requirements[0].id),
                    _uuid: expect.stringMatching(uuidRegex),
                    _title: instanceSnapshot.requirements[0].title,
                    _description: instanceSnapshot.requirements[0].description,
                    _order: instanceSnapshot.requirements[0].order,
                    _evidence: expect.objectContaining({
                        _id: expect.not.objectContaining(instanceSnapshot.requirements[0].evidence.id),
                        _uuid: expect.stringMatching(uuidRegex),
                        _title: instanceSnapshot.requirements[0].evidence.title,
                        _description: instanceSnapshot.requirements[0].evidence.description,
                        _conceptEvidenceId: instanceSnapshot.requirements[0].evidence.conceptEvidenceId
                    }),
                    _conceptRequirementId: instanceSnapshot.requirements[0].conceptRequirementId
                }),
                expect.objectContaining({
                    _id: expect.not.objectContaining(instanceSnapshot.requirements[1].id),
                    _uuid: expect.stringMatching(uuidRegex),
                    _title: instanceSnapshot.requirements[1].title,
                    _description: instanceSnapshot.requirements[1].description,
                    _order: instanceSnapshot.requirements[1].order,
                    _evidence: expect.objectContaining({
                        _id: expect.not.objectContaining(instanceSnapshot.requirements[1].evidence.id),
                        _uuid: expect.stringMatching(uuidRegex),
                        _title: instanceSnapshot.requirements[1].evidence.title,
                        _description: instanceSnapshot.requirements[1].evidence.description,
                        _conceptEvidenceId: instanceSnapshot.requirements[0].evidence.conceptEvidenceId
                    }),
                    _conceptRequirementId: instanceSnapshot.requirements[1].conceptRequirementId
                })
            ]));
            expect(instanceAfterMerge.procedures)
                .toEqual(expect.arrayContaining([
                    expect.objectContaining({
                        _id: expect.not.objectContaining(instanceSnapshot.procedures[0].id),
                        _uuid: expect.stringMatching(uuidRegex),
                        _title: instanceSnapshot.procedures[0].title,
                        _description: instanceSnapshot.procedures[0].description,
                        _order: instanceSnapshot.procedures[0].order,
                        _websites: expect.arrayContaining([
                            expect.objectContaining({
                                _id: expect.not.objectContaining(instanceSnapshot.procedures[0].websites[0].id),
                                _uuid: expect.stringMatching(uuidRegex),
                                _title: instanceSnapshot.procedures[0].websites[0].title,
                                _description: instanceSnapshot.procedures[0].websites[0].description,
                                _order: instanceSnapshot.procedures[0].websites[0].order,
                                _url: instanceSnapshot.procedures[0].websites[0].url,
                                _conceptWebsiteId: instanceSnapshot.procedures[0].websites[0].conceptWebsiteId
                            }),
                            expect.objectContaining({
                                _id: expect.not.objectContaining(instanceSnapshot.procedures[0].websites[1].id),
                                _uuid: expect.stringMatching(uuidRegex),
                                _title: instanceSnapshot.procedures[0].websites[1].title,
                                _description: instanceSnapshot.procedures[0].websites[1].description,
                                _order: instanceSnapshot.procedures[0].websites[1].order,
                                _url: instanceSnapshot.procedures[0].websites[1].url,
                                _conceptWebsiteId: instanceSnapshot.procedures[0].websites[1].conceptWebsiteId
                            })
                        ]),
                        _conceptProcedureId: instanceSnapshot.procedures[0].conceptProcedureId

                    }),
                    expect.objectContaining({
                        _id: expect.not.objectContaining(instanceSnapshot.procedures[1].id),
                        _uuid: expect.stringMatching(uuidRegex),
                        _title: instanceSnapshot.procedures[1].title,
                        _description: instanceSnapshot.procedures[1].description,
                        _order: instanceSnapshot.procedures[1].order,
                        _websites: expect.arrayContaining([
                            expect.objectContaining({
                                _id: expect.not.objectContaining(instanceSnapshot.procedures[1].websites[0].id),
                                _uuid: expect.stringMatching(uuidRegex),
                                _title: instanceSnapshot.procedures[1].websites[0].title,
                                _description: instanceSnapshot.procedures[1].websites[0].description,
                                _order: instanceSnapshot.procedures[1].websites[0].order,
                                _url: instanceSnapshot.procedures[1].websites[0].url,
                                _conceptWebsiteId: instanceSnapshot.procedures[1].websites[0].conceptWebsiteId
                            }),
                            expect.objectContaining({
                                _id: expect.not.objectContaining(instanceSnapshot.procedures[1].websites[1].id),
                                _uuid: expect.stringMatching(uuidRegex),
                                _title: instanceSnapshot.procedures[1].websites[1].title,
                                _description: instanceSnapshot.procedures[1].websites[1].description,
                                _order: instanceSnapshot.procedures[1].websites[1].order,
                                _url: instanceSnapshot.procedures[1].websites[1].url,
                                _conceptWebsiteId: instanceSnapshot.procedures[1].websites[0].conceptWebsiteId
                            })
                        ]),
                        _conceptProcedureId: instanceSnapshot.procedures[1].conceptProcedureId
                    })
                ]));
            expect(instanceAfterMerge.websites)
                .toEqual(expect.arrayContaining([
                    expect.objectContaining({
                        _id: expect.not.objectContaining(instanceSnapshot.websites[0].id),
                        _uuid: expect.stringMatching(uuidRegex),
                        _title: instanceSnapshot.websites[0].title,
                        _description: instanceSnapshot.websites[0].description,
                        _order: instanceSnapshot.websites[0].order,
                        _url: instanceSnapshot.websites[0].url,
                        _conceptWebsiteId: instanceSnapshot.websites[0].conceptWebsiteId
                    }),
                    expect.objectContaining({
                        _id: expect.not.objectContaining(instanceSnapshot.websites[1].id),
                        _uuid: expect.stringMatching(uuidRegex),
                        _title: instanceSnapshot.websites[1].title,
                        _description: instanceSnapshot.websites[1].description,
                        _order: instanceSnapshot.websites[1].order,
                        _url: instanceSnapshot.websites[1].url,
                        _conceptWebsiteId: instanceSnapshot.websites[1].conceptWebsiteId
                    })
                ]));
            expect(instanceAfterMerge.costs)
                .toEqual(expect.arrayContaining([
                    expect.objectContaining({
                        _id: expect.not.objectContaining(instanceSnapshot.costs[0].id),
                        _uuid: expect.stringMatching(uuidRegex),
                        _title: instanceSnapshot.costs[0].title,
                        _description: instanceSnapshot.costs[0].description,
                        _order: instanceSnapshot.costs[0].order,
                        _conceptCostId: instanceSnapshot.costs[0].conceptCostId
                    }),
                    expect.objectContaining({
                        _id: expect.not.objectContaining(instanceSnapshot.costs[1].id),
                        _uuid: expect.stringMatching(uuidRegex),
                        _title: instanceSnapshot.costs[1].title,
                        _description: instanceSnapshot.costs[1].description,
                        _order: instanceSnapshot.costs[1].order,
                        _conceptCostId: instanceSnapshot.costs[1].conceptCostId
                    })
                ]));
            expect(instanceAfterMerge.financialAdvantages)
                .toEqual(expect.arrayContaining([
                    expect.objectContaining({
                        _id: expect.not.objectContaining(instanceSnapshot.financialAdvantages[0].id),
                        _uuid: expect.stringMatching(uuidRegex),
                        _title: instanceSnapshot.financialAdvantages[0].title,
                        _description: instanceSnapshot.financialAdvantages[0].description,
                        _order: instanceSnapshot.financialAdvantages[0].order,
                        _conceptFinancialAdvantageId: instanceSnapshot.financialAdvantages[0].conceptFinancialAdvantageId
                    }),
                    expect.objectContaining({
                        _id: expect.not.objectContaining(instanceSnapshot.financialAdvantages[1].id),
                        _uuid: expect.stringMatching(uuidRegex),
                        _title: instanceSnapshot.financialAdvantages[1].title,
                        _description: instanceSnapshot.financialAdvantages[1].description,
                        _order: instanceSnapshot.financialAdvantages[1].order,
                        _conceptFinancialAdvantageId: instanceSnapshot.financialAdvantages[1].conceptFinancialAdvantageId
                    })
                ]));
            expect(instanceAfterMerge.contactPoints)
                .toEqual(expect.arrayContaining([
                    expect.objectContaining({
                        _id: expect.not.objectContaining(instanceSnapshot.contactPoints[0].id),
                        _uuid: expect.stringMatching(uuidRegex),
                        _url: instanceSnapshot.contactPoints[0].url,
                        _email: instanceSnapshot.contactPoints[0].email,
                        _telephone: instanceSnapshot.contactPoints[0].telephone,
                        _openingHours: instanceSnapshot.contactPoints[0].openingHours,
                        _order: instanceSnapshot.contactPoints[0].order,
                        _address: expect.objectContaining({
                            _id: expect.not.objectContaining(instanceSnapshot.contactPoints[0].address.id),
                            _uuid: expect.stringMatching(uuidRegex),
                            _gemeentenaam: instanceSnapshot.contactPoints[0].address.gemeentenaam,
                            _land: instanceSnapshot.contactPoints[0].address.land,
                            _huisnummer: instanceSnapshot.contactPoints[0].address.huisnummer,
                            _busnummer: instanceSnapshot.contactPoints[0].address.busnummer,
                            _postcode: instanceSnapshot.contactPoints[0].address.postcode,
                            _straatnaam: instanceSnapshot.contactPoints[0].address.straatnaam,
                            _verwijstNaar: instanceSnapshot.contactPoints[0].address.verwijstNaar,
                        }),
                    }),
                    expect.objectContaining({
                        _id: expect.not.objectContaining(instanceSnapshot.contactPoints[1].id),
                        _uuid: expect.stringMatching(uuidRegex),
                        _url: instanceSnapshot.contactPoints[1].url,
                        _email: instanceSnapshot.contactPoints[1].email,
                        _telephone: instanceSnapshot.contactPoints[1].telephone,
                        _openingHours: instanceSnapshot.contactPoints[1].openingHours,
                        _order: instanceSnapshot.contactPoints[1].order,
                        _address: expect.objectContaining({
                            _id: expect.not.objectContaining(instanceSnapshot.contactPoints[1].address.id),
                            _uuid: expect.stringMatching(uuidRegex),
                            _gemeentenaam: instanceSnapshot.contactPoints[1].address.gemeentenaam,
                            _land: instanceSnapshot.contactPoints[1].address.land,
                            _huisnummer: instanceSnapshot.contactPoints[1].address.huisnummer,
                            _busnummer: instanceSnapshot.contactPoints[1].address.busnummer,
                            _postcode: instanceSnapshot.contactPoints[1].address.postcode,
                            _straatnaam: instanceSnapshot.contactPoints[1].address.straatnaam,
                            _verwijstNaar: instanceSnapshot.contactPoints[1].address.verwijstNaar,
                        }),
                    })
                ]));
            expect(instanceAfterMerge.conceptId).toEqual(concept.id);
            expect(instanceAfterMerge.conceptSnapshotId).toEqual(concept.latestConceptSnapshot);
            expect(instanceAfterMerge.productId).toEqual(concept.productId);
            expect(instanceAfterMerge.languages).toEqual(instanceSnapshot.languages);
            expect(instanceAfterMerge.dateCreated).toEqual(instanceSnapshot.dateCreated);
            expect(instanceAfterMerge.dateModified).toEqual(instanceSnapshot.dateModified);
            expect(instanceAfterMerge.dateSent).toEqual(FormatPreservingDate.now());
            expect(instanceAfterMerge.datePublished).toEqual(undefined);
            expect(instanceAfterMerge.status).toEqual(InstanceStatusType.VERSTUURD);
            expect(instanceAfterMerge.reviewStatus).toEqual(undefined);
            expect(instanceAfterMerge.publicationStatus).toEqual(undefined);
            expect(instanceAfterMerge.spatials).toEqual(instanceSnapshot.spatials);
            expect(instanceAfterMerge.legalResources).toEqual(expect.arrayContaining([
                expect.objectContaining({
                    _id: expect.not.objectContaining(instanceSnapshot.legalResources[0].id),
                    _uuid: expect.stringMatching(uuidRegex),
                    _title: instanceSnapshot.legalResources[0].title,
                    _description: instanceSnapshot.legalResources[0].description,
                    _url: instanceSnapshot.legalResources[0].url,
                    _order: instanceSnapshot.legalResources[0].order,
                }),
                expect.objectContaining({
                    _id: expect.not.objectContaining(instanceSnapshot.legalResources[1].id),
                    _uuid: expect.stringMatching(uuidRegex),
                    _title: instanceSnapshot.legalResources[1].title,
                    _description: instanceSnapshot.legalResources[1].description,
                    _url: instanceSnapshot.legalResources[1].url,
                    _order: instanceSnapshot.legalResources[1].order,
                })
            ]));
        });

        test('conceptDisplayConfiguration is updated', async () => {
            const bestuurseenheid = aBestuurseenheid().build();
            await bestuurseenheidRepository.save(bestuurseenheid);

            const concept = aFullConcept().build();
            await conceptRepository.save(concept);

            await conceptDisplayConfigurationRepository.ensureConceptDisplayConfigurationsForAllBestuurseenheden(concept.id);

            const instanceSnapshot = aFullInstanceSnapshot().withCreatedBy(bestuurseenheid.id).withConceptId(concept.id).build();
            await instanceSnapshotRepository.save(bestuurseenheid, instanceSnapshot);

            const instanceExists = await instanceRepository.exists(bestuurseenheid, instanceSnapshot.isVersionOfInstance);
            expect(instanceExists).toEqual(false);

            await mapperDomainService.merge(bestuurseenheid, instanceSnapshot.id);

            const conceptDisplayConfiguration = await conceptDisplayConfigurationRepository.findByConceptId(bestuurseenheid, concept.id);
            expect(conceptDisplayConfiguration.conceptIsNew).toEqual(false);
            expect(conceptDisplayConfiguration.conceptIsInstantiated).toEqual(true);
        });

        test('instance is validated for publish', async () => {
            const bestuurseenheid = aBestuurseenheid().build();
            await bestuurseenheidRepository.save(bestuurseenheid);

            const instanceSnapshot = aMinimalInstanceSnapshot()
                .withTitle(LanguageString.of('title', undefined, undefined, 'titel'))
                .withDescription(LanguageString.of(undefined, undefined, undefined, 'beschrijving'))
                .withCreatedBy(bestuurseenheid.id)
                .withConceptId(undefined)
                .build();
            await instanceSnapshotRepository.save(bestuurseenheid, instanceSnapshot);

            await expect(() => mapperDomainService.merge(bestuurseenheid, instanceSnapshot.id))
                .rejects.toThrowWithMessage(InvariantError, 'titel en beschrijving moeten dezelfde talen bevatten');
        });

        test('instance is validated for publish, adres can be invalid', async () => {
            const bestuurseenheid = aBestuurseenheid().build();
            await bestuurseenheidRepository.save(bestuurseenheid);

            const instanceSnapshot = aMinimalInstanceSnapshot()
                .withCreatedBy(bestuurseenheid.id)
                .withConceptId(undefined)
                .withContactPoints([aFullContactPointForInstance().withAddress(aFullAddressForInstance().withVerwijstNaar(undefined).build()).build()])
                .build();
            await instanceSnapshotRepository.save(bestuurseenheid, instanceSnapshot);

            await expect(mapperDomainService.merge(bestuurseenheid, instanceSnapshot.id)).resolves.not.toThrow();
        });

    });

    describe('Instance already exists', () => {

        describe('update', () => {

            test('Given a minimalistic instanceSnapshot, then existing instance is updated', async () => {
                const bestuurseenheid = aBestuurseenheid().build();
                await bestuurseenheidRepository.save(bestuurseenheid);

                const instance = aFullInstance().withCreatedBy(bestuurseenheid.id).build();
                await instanceRepository.save(bestuurseenheid, instance);
                await conceptDisplayConfigurationRepository.ensureConceptDisplayConfigurationsForAllBestuurseenheden(instance.conceptId);

                const instanceSnapshot = aMinimalInstanceSnapshot().withCreatedBy(bestuurseenheid.id).withIsVersionOfInstance(instance.id).withConceptId(undefined).build();
                await instanceSnapshotRepository.save(bestuurseenheid, instanceSnapshot);

                const instanceExists = await instanceRepository.exists(bestuurseenheid, instanceSnapshot.isVersionOfInstance);
                expect(instanceExists).toEqual(true);

                await mapperDomainService.merge(bestuurseenheid, instanceSnapshot.id);

                const instanceAfterMerge = await instanceRepository.findById(bestuurseenheid, instanceSnapshot.isVersionOfInstance);

                expect(instanceAfterMerge.id).toEqual(instanceSnapshot.isVersionOfInstance);
                expect(instanceAfterMerge.id).toEqual(instance.id);
                expect(instanceAfterMerge.uuid).toEqual(instance.uuid);
                expect(instanceAfterMerge.createdBy).toEqual(bestuurseenheid.id);
                expect(instanceAfterMerge.title).toEqual(instanceSnapshot.title);
                expect(instanceAfterMerge.description).toEqual(instanceSnapshot.description);
                expect(instanceAfterMerge.additionalDescription).toEqual(instanceSnapshot.additionalDescription);
                expect(instanceAfterMerge.exception).toEqual(instanceSnapshot.exception);
                expect(instanceAfterMerge.regulation).toEqual(instanceSnapshot.regulation);
                expect(instanceAfterMerge.startDate).toEqual(instanceSnapshot.startDate);
                expect(instanceAfterMerge.endDate).toEqual(instanceSnapshot.endDate);
                expect(instanceAfterMerge.type).toEqual(instanceSnapshot.type);
                expect(instanceAfterMerge.targetAudiences).toEqual(instanceSnapshot.targetAudiences);
                expect(instanceAfterMerge.themes).toEqual(instanceSnapshot.themes);
                expect(instanceAfterMerge.competentAuthorityLevels).toEqual(instanceSnapshot.competentAuthorityLevels);
                expect(instanceAfterMerge.competentAuthorities).toEqual(instanceSnapshot.competentAuthorities);
                expect(instanceAfterMerge.executingAuthorityLevels).toEqual(instanceSnapshot.executingAuthorityLevels);
                expect(instanceAfterMerge.executingAuthorities).toEqual(instanceSnapshot.executingAuthorities);
                expect(instanceAfterMerge.publicationMedia).toEqual(instanceSnapshot.publicationMedia);
                expect(instanceAfterMerge.yourEuropeCategories).toEqual(instanceSnapshot.yourEuropeCategories);
                expect(instanceAfterMerge.keywords).toEqual(instanceSnapshot.keywords);
                expect(instanceAfterMerge.requirements).toEqual([]);
                expect(instanceAfterMerge.procedures).toEqual([]);
                expect(instanceAfterMerge.websites).toEqual([]);
                expect(instanceAfterMerge.costs).toEqual([]);
                expect(instanceAfterMerge.financialAdvantages).toEqual([]);
                expect(instanceAfterMerge.contactPoints).toEqual([]);
                expect(instanceAfterMerge.conceptId).toEqual(undefined);
                expect(instanceAfterMerge.conceptSnapshotId).toEqual(undefined);
                expect(instanceAfterMerge.productId).toEqual(undefined);
                expect(instanceAfterMerge.languages).toEqual(instanceSnapshot.languages);
                expect(instanceAfterMerge.dateCreated).toEqual(instanceAfterMerge.dateCreated);
                expect(instanceAfterMerge.dateModified).toEqual(instanceSnapshot.dateModified);
                expect(instanceAfterMerge.dateSent).toEqual(FormatPreservingDate.now());
                expect(instanceAfterMerge.datePublished).toEqual(instance.datePublished);
                expect(instanceAfterMerge.status).toEqual(InstanceStatusType.VERSTUURD);
                expect(instanceAfterMerge.reviewStatus).toEqual(undefined);
                expect(instanceAfterMerge.publicationStatus).toEqual(InstancePublicationStatusType.TE_HERPUBLICEREN);
                expect(instanceAfterMerge.spatials).toEqual(instanceSnapshot.spatials);
                expect(instanceAfterMerge.legalResources).toEqual(instanceSnapshot.legalResources);

            });

            test('Given a full instanceSnapshot, then existing instance is updated', async () => {
                const bestuurseenheid = aBestuurseenheid().build();
                await bestuurseenheidRepository.save(bestuurseenheid);

                const instance = aFullInstance().withCreatedBy(bestuurseenheid.id).build();
                await instanceRepository.save(bestuurseenheid, instance);
                await conceptDisplayConfigurationRepository.ensureConceptDisplayConfigurationsForAllBestuurseenheden(instance.conceptId);

                const concept = aFullConcept().build();
                await conceptRepository.save(concept);
                await conceptDisplayConfigurationRepository.ensureConceptDisplayConfigurationsForAllBestuurseenheden(concept.id);

                const instanceSnapshot = aFullInstanceSnapshot().withCreatedBy(bestuurseenheid.id).withIsVersionOfInstance(instance.id).withConceptId(concept.id).build();
                await instanceSnapshotRepository.save(bestuurseenheid, instanceSnapshot);

                const instanceExists = await instanceRepository.exists(bestuurseenheid, instanceSnapshot.isVersionOfInstance);
                expect(instanceExists).toEqual(true);

                await mapperDomainService.merge(bestuurseenheid, instanceSnapshot.id);

                const instanceAfterMerge = await instanceRepository.findById(bestuurseenheid, instanceSnapshot.isVersionOfInstance);
                expect(instanceAfterMerge.id).toEqual(instanceSnapshot.isVersionOfInstance);
                expect(instanceAfterMerge.id).toEqual(instance.id);
                expect(instanceAfterMerge.uuid).toEqual(instance.uuid);
                expect(instanceAfterMerge.createdBy).toEqual(bestuurseenheid.id);
                expect(instanceAfterMerge.title).toEqual(instanceSnapshot.title);
                expect(instanceAfterMerge.description).toEqual(instanceSnapshot.description);
                expect(instanceAfterMerge.additionalDescription).toEqual(instanceSnapshot.additionalDescription);
                expect(instanceAfterMerge.exception).toEqual(instanceSnapshot.exception);
                expect(instanceAfterMerge.regulation).toEqual(instanceSnapshot.regulation);
                expect(instanceAfterMerge.startDate).toEqual(instanceSnapshot.startDate);
                expect(instanceAfterMerge.endDate).toEqual(instanceSnapshot.endDate);
                expect(instanceAfterMerge.type).toEqual(instanceSnapshot.type);
                expect(instanceAfterMerge.targetAudiences).toEqual(instanceSnapshot.targetAudiences);
                expect(instanceAfterMerge.themes).toEqual(instanceSnapshot.themes);
                expect(instanceAfterMerge.competentAuthorityLevels).toEqual(instanceSnapshot.competentAuthorityLevels);
                expect(instanceAfterMerge.competentAuthorities).toEqual(instanceSnapshot.competentAuthorities);
                expect(instanceAfterMerge.executingAuthorityLevels).toEqual(instanceSnapshot.executingAuthorityLevels);
                expect(instanceAfterMerge.executingAuthorities).toEqual(instanceSnapshot.executingAuthorities);
                expect(instanceAfterMerge.publicationMedia).toEqual(instanceSnapshot.publicationMedia);
                expect(instanceAfterMerge.yourEuropeCategories).toEqual(instanceSnapshot.yourEuropeCategories);
                expect(instanceAfterMerge.keywords).toEqual(instanceSnapshot.keywords);
                expect(instanceAfterMerge.requirements).toEqual(expect.arrayContaining([
                    expect.objectContaining({
                        _id: expect.not.objectContaining(instanceSnapshot.requirements[0].id),
                        _uuid: expect.stringMatching(uuidRegex),
                        _title: instanceSnapshot.requirements[0].title,
                        _description: instanceSnapshot.requirements[0].description,
                        _order: instanceSnapshot.requirements[0].order,
                        _evidence: expect.objectContaining({
                            _id: expect.not.objectContaining(instanceSnapshot.requirements[0].evidence.id),
                            _uuid: expect.stringMatching(uuidRegex),
                            _title: instanceSnapshot.requirements[0].evidence.title,
                            _description: instanceSnapshot.requirements[0].evidence.description,
                            _conceptEvidenceId: instanceSnapshot.requirements[0].evidence.conceptEvidenceId
                        }),
                        _conceptRequirementId: instanceSnapshot.requirements[0].conceptRequirementId
                    }),
                    expect.objectContaining({
                        _id: expect.not.objectContaining(instanceSnapshot.requirements[1].id),
                        _uuid: expect.stringMatching(uuidRegex),
                        _title: instanceSnapshot.requirements[1].title,
                        _description: instanceSnapshot.requirements[1].description,
                        _order: instanceSnapshot.requirements[1].order,
                        _evidence: expect.objectContaining({
                            _id: expect.not.objectContaining(instanceSnapshot.requirements[1].evidence.id),
                            _uuid: expect.stringMatching(uuidRegex),
                            _title: instanceSnapshot.requirements[1].evidence.title,
                            _description: instanceSnapshot.requirements[1].evidence.description,
                            _conceptEvidenceId: instanceSnapshot.requirements[0].evidence.conceptEvidenceId
                        }),
                        _conceptRequirementId: instanceSnapshot.requirements[1].conceptRequirementId
                    })
                ]));
                expect(instanceAfterMerge.procedures)
                    .toEqual(expect.arrayContaining([
                        expect.objectContaining({
                            _id: expect.not.objectContaining(instanceSnapshot.procedures[0].id),
                            _uuid: expect.stringMatching(uuidRegex),
                            _title: instanceSnapshot.procedures[0].title,
                            _description: instanceSnapshot.procedures[0].description,
                            _order: instanceSnapshot.procedures[0].order,
                            _websites: expect.arrayContaining([
                                expect.objectContaining({
                                    _id: expect.not.objectContaining(instanceSnapshot.procedures[0].websites[0].id),
                                    _uuid: expect.stringMatching(uuidRegex),
                                    _title: instanceSnapshot.procedures[0].websites[0].title,
                                    _description: instanceSnapshot.procedures[0].websites[0].description,
                                    _order: instanceSnapshot.procedures[0].websites[0].order,
                                    _url: instanceSnapshot.procedures[0].websites[0].url,
                                    _conceptWebsiteId: instanceSnapshot.procedures[0].websites[0].conceptWebsiteId
                                }),
                                expect.objectContaining({
                                    _id: expect.not.objectContaining(instanceSnapshot.procedures[0].websites[1].id),
                                    _uuid: expect.stringMatching(uuidRegex),
                                    _title: instanceSnapshot.procedures[0].websites[1].title,
                                    _description: instanceSnapshot.procedures[0].websites[1].description,
                                    _order: instanceSnapshot.procedures[0].websites[1].order,
                                    _url: instanceSnapshot.procedures[0].websites[1].url,
                                    _conceptWebsiteId: instanceSnapshot.procedures[0].websites[1].conceptWebsiteId
                                })
                            ]),
                            _conceptProcedureId: instanceSnapshot.procedures[0].conceptProcedureId

                        }),
                        expect.objectContaining({
                            _id: expect.not.objectContaining(instanceSnapshot.procedures[1].id),
                            _uuid: expect.stringMatching(uuidRegex),
                            _title: instanceSnapshot.procedures[1].title,
                            _description: instanceSnapshot.procedures[1].description,
                            _order: instanceSnapshot.procedures[1].order,
                            _websites: expect.arrayContaining([
                                expect.objectContaining({
                                    _id: expect.not.objectContaining(instanceSnapshot.procedures[1].websites[0].id),
                                    _uuid: expect.stringMatching(uuidRegex),
                                    _title: instanceSnapshot.procedures[1].websites[0].title,
                                    _description: instanceSnapshot.procedures[1].websites[0].description,
                                    _order: instanceSnapshot.procedures[1].websites[0].order,
                                    _url: instanceSnapshot.procedures[1].websites[0].url,
                                    _conceptWebsiteId: instanceSnapshot.procedures[1].websites[0].conceptWebsiteId
                                }),
                                expect.objectContaining({
                                    _id: expect.not.objectContaining(instanceSnapshot.procedures[1].websites[1].id),
                                    _uuid: expect.stringMatching(uuidRegex),
                                    _title: instanceSnapshot.procedures[1].websites[1].title,
                                    _description: instanceSnapshot.procedures[1].websites[1].description,
                                    _order: instanceSnapshot.procedures[1].websites[1].order,
                                    _url: instanceSnapshot.procedures[1].websites[1].url,
                                    _conceptWebsiteId: instanceSnapshot.procedures[1].websites[0].conceptWebsiteId
                                })
                            ]),
                            _conceptProcedureId: instanceSnapshot.procedures[1].conceptProcedureId
                        })
                    ]));
                expect(instanceAfterMerge.websites)
                    .toEqual(expect.arrayContaining([
                        expect.objectContaining({
                            _id: expect.not.objectContaining(instanceSnapshot.websites[0].id),
                            _uuid: expect.stringMatching(uuidRegex),
                            _title: instanceSnapshot.websites[0].title,
                            _description: instanceSnapshot.websites[0].description,
                            _order: instanceSnapshot.websites[0].order,
                            _url: instanceSnapshot.websites[0].url,
                            _conceptWebsiteId: instanceSnapshot.websites[0].conceptWebsiteId
                        }),
                        expect.objectContaining({
                            _id: expect.not.objectContaining(instanceSnapshot.websites[1].id),
                            _uuid: expect.stringMatching(uuidRegex),
                            _title: instanceSnapshot.websites[1].title,
                            _description: instanceSnapshot.websites[1].description,
                            _order: instanceSnapshot.websites[1].order,
                            _url: instanceSnapshot.websites[1].url,
                            _conceptWebsiteId: instanceSnapshot.websites[1].conceptWebsiteId
                        })
                    ]));
                expect(instanceAfterMerge.costs)
                    .toEqual(expect.arrayContaining([
                        expect.objectContaining({
                            _id: expect.not.objectContaining(instanceSnapshot.costs[0].id),
                            _uuid: expect.stringMatching(uuidRegex),
                            _title: instanceSnapshot.costs[0].title,
                            _description: instanceSnapshot.costs[0].description,
                            _order: instanceSnapshot.costs[0].order,
                            _conceptCostId: instanceSnapshot.costs[0].conceptCostId
                        }),
                        expect.objectContaining({
                            _id: expect.not.objectContaining(instanceSnapshot.costs[1].id),
                            _uuid: expect.stringMatching(uuidRegex),
                            _title: instanceSnapshot.costs[1].title,
                            _description: instanceSnapshot.costs[1].description,
                            _order: instanceSnapshot.costs[1].order,
                            _conceptCostId: instanceSnapshot.costs[1].conceptCostId
                        })
                    ]));
                expect(instanceAfterMerge.financialAdvantages)
                    .toEqual(expect.arrayContaining([
                        expect.objectContaining({
                            _id: expect.not.objectContaining(instanceSnapshot.financialAdvantages[0].id),
                            _uuid: expect.stringMatching(uuidRegex),
                            _title: instanceSnapshot.financialAdvantages[0].title,
                            _description: instanceSnapshot.financialAdvantages[0].description,
                            _order: instanceSnapshot.financialAdvantages[0].order,
                            _conceptFinancialAdvantageId: instanceSnapshot.financialAdvantages[0].conceptFinancialAdvantageId
                        }),
                        expect.objectContaining({
                            _id: expect.not.objectContaining(instanceSnapshot.financialAdvantages[1].id),
                            _uuid: expect.stringMatching(uuidRegex),
                            _title: instanceSnapshot.financialAdvantages[1].title,
                            _description: instanceSnapshot.financialAdvantages[1].description,
                            _order: instanceSnapshot.financialAdvantages[1].order,
                            _conceptFinancialAdvantageId: instanceSnapshot.financialAdvantages[1].conceptFinancialAdvantageId
                        })
                    ]));
                expect(instanceAfterMerge.contactPoints)
                    .toEqual(expect.arrayContaining([
                        expect.objectContaining({
                            _id: expect.not.objectContaining(instanceSnapshot.contactPoints[0].id),
                            _uuid: expect.stringMatching(uuidRegex),
                            _url: instanceSnapshot.contactPoints[0].url,
                            _email: instanceSnapshot.contactPoints[0].email,
                            _telephone: instanceSnapshot.contactPoints[0].telephone,
                            _openingHours: instanceSnapshot.contactPoints[0].openingHours,
                            _order: instanceSnapshot.contactPoints[0].order,
                            _address: expect.objectContaining({
                                _id: expect.not.objectContaining(instanceSnapshot.contactPoints[0].address.id),
                                _uuid: expect.stringMatching(uuidRegex),
                                _gemeentenaam: instanceSnapshot.contactPoints[0].address.gemeentenaam,
                                _land: instanceSnapshot.contactPoints[0].address.land,
                                _huisnummer: instanceSnapshot.contactPoints[0].address.huisnummer,
                                _busnummer: instanceSnapshot.contactPoints[0].address.busnummer,
                                _postcode: instanceSnapshot.contactPoints[0].address.postcode,
                                _straatnaam: instanceSnapshot.contactPoints[0].address.straatnaam,
                                _verwijstNaar: instanceSnapshot.contactPoints[0].address.verwijstNaar,
                            }),
                        }),
                        expect.objectContaining({
                            _id: expect.not.objectContaining(instanceSnapshot.contactPoints[1].id),
                            _uuid: expect.stringMatching(uuidRegex),
                            _url: instanceSnapshot.contactPoints[1].url,
                            _email: instanceSnapshot.contactPoints[1].email,
                            _telephone: instanceSnapshot.contactPoints[1].telephone,
                            _openingHours: instanceSnapshot.contactPoints[1].openingHours,
                            _order: instanceSnapshot.contactPoints[1].order,
                            _address: expect.objectContaining({
                                _id: expect.not.objectContaining(instanceSnapshot.contactPoints[1].address.id),
                                _uuid: expect.stringMatching(uuidRegex),
                                _gemeentenaam: instanceSnapshot.contactPoints[1].address.gemeentenaam,
                                _land: instanceSnapshot.contactPoints[1].address.land,
                                _huisnummer: instanceSnapshot.contactPoints[1].address.huisnummer,
                                _busnummer: instanceSnapshot.contactPoints[1].address.busnummer,
                                _postcode: instanceSnapshot.contactPoints[1].address.postcode,
                                _straatnaam: instanceSnapshot.contactPoints[1].address.straatnaam,
                                _verwijstNaar: instanceSnapshot.contactPoints[1].address.verwijstNaar,
                            }),
                        })
                    ]));
                expect(instanceAfterMerge.conceptId).toEqual(concept.id);
                expect(instanceAfterMerge.conceptSnapshotId).toEqual(concept.latestConceptSnapshot);
                expect(instanceAfterMerge.productId).toEqual(concept.productId);
                expect(instanceAfterMerge.languages).toEqual(instanceSnapshot.languages);
                expect(instanceAfterMerge.dateCreated).toEqual(instanceAfterMerge.dateCreated);
                expect(instanceAfterMerge.dateModified).toEqual(instanceSnapshot.dateModified);
                expect(instanceAfterMerge.dateSent).toEqual(FormatPreservingDate.now());
                expect(instanceAfterMerge.datePublished).toEqual(instance.datePublished);
                expect(instanceAfterMerge.status).toEqual(InstanceStatusType.VERSTUURD);
                expect(instanceAfterMerge.reviewStatus).toEqual(undefined);
                expect(instanceAfterMerge.publicationStatus).toEqual(InstancePublicationStatusType.TE_HERPUBLICEREN);
                expect(instanceAfterMerge.spatials).toEqual(instanceSnapshot.spatials);
                expect(instanceAfterMerge.legalResources).toEqual(expect.arrayContaining([
                    expect.objectContaining({
                        _id: expect.not.objectContaining(instanceSnapshot.legalResources[0].id),
                        _uuid: expect.stringMatching(uuidRegex),
                        _title: instanceSnapshot.legalResources[0].title,
                        _description: instanceSnapshot.legalResources[0].description,
                        _url: instanceSnapshot.legalResources[0].url,
                        _order: instanceSnapshot.legalResources[0].order,
                    }),
                    expect.objectContaining({
                        _id: expect.not.objectContaining(instanceSnapshot.legalResources[1].id),
                        _uuid: expect.stringMatching(uuidRegex),
                        _title: instanceSnapshot.legalResources[1].title,
                        _description: instanceSnapshot.legalResources[1].description,
                        _url: instanceSnapshot.legalResources[1].url,
                        _order: instanceSnapshot.legalResources[1].order,
                    })
                ]));
            });
        });

        describe('Delete', () => {
            test('Given a minimal instanceSnapshot with isArchived, then remove instance', async () => {
                const bestuurseenheid = aBestuurseenheid().build();
                await bestuurseenheidRepository.save(bestuurseenheid);

                const instance = aFullInstance().withCreatedBy(bestuurseenheid.id).build();
                await instanceRepository.save(bestuurseenheid, instance);
                await conceptDisplayConfigurationRepository.ensureConceptDisplayConfigurationsForAllBestuurseenheden(instance.conceptId);

                const instanceSnapshot = aMinimalInstanceSnapshot().withCreatedBy(bestuurseenheid.id).withIsVersionOfInstance(instance.id).withIsArchived(true).build();
                await instanceSnapshotRepository.save(bestuurseenheid, instanceSnapshot);

                const instanceExists = await instanceRepository.exists(bestuurseenheid, instanceSnapshot.isVersionOfInstance);
                expect(instanceExists).toEqual(true);

                await mapperDomainService.merge(bestuurseenheid, instanceSnapshot.id);

                expect(await instanceRepository.exists(bestuurseenheid, instanceSnapshot.isVersionOfInstance)).toBeFalsy();

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

            test('Given a full instanceSnapshot with isArchived, then remove instance', async () => {
                const bestuurseenheid = aBestuurseenheid().build();
                await bestuurseenheidRepository.save(bestuurseenheid);

                const concept = aFullConcept().build();
                await conceptRepository.save(concept);
                await conceptDisplayConfigurationRepository.ensureConceptDisplayConfigurationsForAllBestuurseenheden(concept.id);

                const instance = aFullInstance().withCreatedBy(bestuurseenheid.id).withConceptId(concept.id).build();
                await instanceRepository.save(bestuurseenheid, instance);

                const instanceSnapshot = aFullInstanceSnapshot().withCreatedBy(bestuurseenheid.id).withConceptId(concept.id).withIsVersionOfInstance(instance.id).withIsArchived(true).build();
                await instanceSnapshotRepository.save(bestuurseenheid, instanceSnapshot);

                const instanceExists = await instanceRepository.exists(bestuurseenheid, instanceSnapshot.isVersionOfInstance);
                expect(instanceExists).toEqual(true);

                await mapperDomainService.merge(bestuurseenheid, instanceSnapshot.id);

                expect(await instanceRepository.exists(bestuurseenheid, instanceSnapshot.isVersionOfInstance)).toBeFalsy();

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

            test('Given concept is removed in instance by new instanceSnapshot, then conceptDisplayConfiguration is updated', async () => {
                const bestuurseenheid = aBestuurseenheid().build();
                await bestuurseenheidRepository.save(bestuurseenheid);

                const concept = aFullConcept().build();
                await conceptRepository.save(concept);

                const instance = aFullInstance().withCreatedBy(bestuurseenheid.id).withConceptId(concept.id).build();
                await instanceRepository.save(bestuurseenheid, instance);

                await conceptDisplayConfigurationRepository.ensureConceptDisplayConfigurationsForAllBestuurseenheden(concept.id);

                const instanceSnapshot = aFullInstanceSnapshot().withCreatedBy(bestuurseenheid.id).withIsVersionOfInstance(instance.id).withConceptId(undefined).build();
                await instanceSnapshotRepository.save(bestuurseenheid, instanceSnapshot);
                await conceptDisplayConfigurationRepository.syncInstantiatedFlag(bestuurseenheid, concept.id);

                const instanceExists = await instanceRepository.exists(bestuurseenheid, instanceSnapshot.isVersionOfInstance);
                expect(instanceExists).toEqual(true);

                await mapperDomainService.merge(bestuurseenheid, instanceSnapshot.id);
                const conceptDisplayConfiguration = await conceptDisplayConfigurationRepository.findByConceptId(bestuurseenheid, concept.id);
                expect(conceptDisplayConfiguration.conceptIsInstantiated).toEqual(false);
            });
        });

        test('Given instance is linked to different concept, then conceptDisplayConfiguration is updated', async () => {
            const bestuurseenheid = aBestuurseenheid().build();
            await bestuurseenheidRepository.save(bestuurseenheid);

            const concept = aFullConcept().build();
            await conceptRepository.save(concept);
            await conceptDisplayConfigurationRepository.ensureConceptDisplayConfigurationsForAllBestuurseenheden(concept.id);

            const instance = aFullInstance().withCreatedBy(bestuurseenheid.id).withConceptId(concept.id).build();
            await instanceRepository.save(bestuurseenheid, instance);

            const concept2 = aFullConcept().build();
            await conceptRepository.save(concept2);
            await conceptDisplayConfigurationRepository.ensureConceptDisplayConfigurationsForAllBestuurseenheden(concept2.id);

            const instanceSnapshot = aFullInstanceSnapshot().withCreatedBy(bestuurseenheid.id).withIsVersionOfInstance(instance.id).withConceptId(concept2.id).build();
            await instanceSnapshotRepository.save(bestuurseenheid, instanceSnapshot);

            await conceptDisplayConfigurationRepository.syncInstantiatedFlag(bestuurseenheid, concept.id);
            await conceptDisplayConfigurationRepository.syncInstantiatedFlag(bestuurseenheid, concept2.id);

            const instanceExists = await instanceRepository.exists(bestuurseenheid, instanceSnapshot.isVersionOfInstance);
            expect(instanceExists).toEqual(true);

            await mapperDomainService.merge(bestuurseenheid, instanceSnapshot.id);

            const conceptDisplayConfiguration = await conceptDisplayConfigurationRepository.findByConceptId(bestuurseenheid, concept.id);
            expect(conceptDisplayConfiguration.conceptIsInstantiated).toEqual(false);

            const conceptDisplayConfiguration2 = await conceptDisplayConfigurationRepository.findByConceptId(bestuurseenheid, concept2.id);
            expect(conceptDisplayConfiguration2.conceptIsInstantiated).toEqual(true);
        });

        test('Dont merge instanceSnapshots if newer one is already processed for the same instance', async () => {
            const bestuurseenheid = aBestuurseenheid().build();
            await bestuurseenheidRepository.save(bestuurseenheid);


            const concept = aFullConcept().build();
            await conceptRepository.save(concept);
            await conceptDisplayConfigurationRepository.ensureConceptDisplayConfigurationsForAllBestuurseenheden(concept.id);
            const instanceId = buildInstanceIri(uuid());
            const otherInstanceId = buildInstanceIri(uuid());

            const instanceSnapshotForOtherInstance = aFullInstanceSnapshot()
                .withTitle(LanguageString.of('other snapshot', undefined, undefined, 'other snapshot'))
                .withGeneratedAtTime(FormatPreservingDate.of('2024-01-18T00:00:00.672Z'))
                .withCreatedBy(bestuurseenheid.id)
                .withIsVersionOfInstance(otherInstanceId)
                .withConceptId(concept.id)
                .build();

            const firstInstanceSnapshot = aFullInstanceSnapshot()
                .withTitle(LanguageString.of('snapshot 1', undefined, undefined, 'snapshot 1'))
                .withGeneratedAtTime(FormatPreservingDate.of('2024-01-16T00:00:00.672Z'))
                .withCreatedBy(bestuurseenheid.id)
                .withIsVersionOfInstance(instanceId)
                .withConceptId(concept.id)
                .build();
            const secondInstanceSnapshot = aFullInstanceSnapshot()
                .withTitle(LanguageString.of('snapshot 2', undefined, undefined, 'snapshot 2'))
                .withGeneratedAtTime(FormatPreservingDate.of('2024-01-17T00:00:00.672Z'))
                .withCreatedBy(bestuurseenheid.id)
                .withIsVersionOfInstance(instanceId)
                .withConceptId(concept.id)
                .build();

            await instanceSnapshotRepository.save(bestuurseenheid, instanceSnapshotForOtherInstance);
            await instanceSnapshotRepository.save(bestuurseenheid, secondInstanceSnapshot);
            await instanceSnapshotRepository.save(bestuurseenheid, firstInstanceSnapshot);

            await mapperDomainService.merge(bestuurseenheid, instanceSnapshotForOtherInstance.id);
            await instanceSnapshotRepository.addToProcessedInstanceSnapshots(bestuurseenheid, instanceSnapshotForOtherInstance.id);

            await mapperDomainService.merge(bestuurseenheid, secondInstanceSnapshot.id);
            await instanceSnapshotRepository.addToProcessedInstanceSnapshots(bestuurseenheid, secondInstanceSnapshot.id);

            await mapperDomainService.merge(bestuurseenheid, firstInstanceSnapshot.id);
            await instanceSnapshotRepository.addToProcessedInstanceSnapshots(bestuurseenheid, firstInstanceSnapshot.id);

            const actual = await instanceRepository.findById(bestuurseenheid, instanceId);
            expect(actual.title).toEqual(secondInstanceSnapshot.title);
        });

        test('instance is validated for publish', async () => {
            const bestuurseenheid = aBestuurseenheid().build();
            await bestuurseenheidRepository.save(bestuurseenheid);

            const instance = aFullInstance().withCreatedBy(bestuurseenheid.id).build();
            await instanceRepository.save(bestuurseenheid, instance);
            await conceptDisplayConfigurationRepository.ensureConceptDisplayConfigurationsForAllBestuurseenheden(instance.conceptId);

            const instanceSnapshot = aMinimalInstanceSnapshot()
                .withTitle(LanguageString.of('title', undefined, undefined, 'titel'))
                .withDescription(LanguageString.of(undefined, undefined, undefined, 'beschrijving'))
                .withCreatedBy(bestuurseenheid.id)
                .withConceptId(undefined)
                .withIsVersionOfInstance(instance.id)
                .build();
            await instanceSnapshotRepository.save(bestuurseenheid, instanceSnapshot);

            await expect(() => mapperDomainService.merge(bestuurseenheid, instanceSnapshot.id))
                .rejects.toThrowWithMessage(InvariantError, 'titel en beschrijving moeten dezelfde talen bevatten');
        });

        test('instance is validated for publish, adres can be invalid', async () => {
            const bestuurseenheid = aBestuurseenheid().build();
            await bestuurseenheidRepository.save(bestuurseenheid);

            const instance = aFullInstance().withCreatedBy(bestuurseenheid.id).build();
            await instanceRepository.save(bestuurseenheid, instance);
            await conceptDisplayConfigurationRepository.ensureConceptDisplayConfigurationsForAllBestuurseenheden(instance.conceptId);

            const instanceSnapshot = aMinimalInstanceSnapshot()
                .withCreatedBy(bestuurseenheid.id)
                .withConceptId(undefined)
                .withContactPoints([aFullContactPointForInstance().withAddress(aFullAddressForInstance().withVerwijstNaar(undefined).build()).build()])
                .withIsVersionOfInstance(instance.id)
                .build();
            await instanceSnapshotRepository.save(bestuurseenheid, instanceSnapshot);

            await expect(mapperDomainService.merge(bestuurseenheid, instanceSnapshot.id)).resolves.not.toThrow();
        });
    });

    test('Given a deleted Instance, when receiving a new snapshot, recreate the instance and remove tombstone', async () => {
        const bestuurseenheid = aBestuurseenheid().build();
        await bestuurseenheidRepository.save(bestuurseenheid);

        const instance = aFullInstance().withCreatedBy(bestuurseenheid.id).build();
        await instanceRepository.save(bestuurseenheid, instance);
        await conceptDisplayConfigurationRepository.ensureConceptDisplayConfigurationsForAllBestuurseenheden(instance.conceptId);
        await deleteInstanceDomainService.delete(bestuurseenheid, instance.id);

        const instanceExists = await instanceRepository.exists(bestuurseenheid, instance.id);
        expect(instanceExists).toEqual(false);

        const quadsBeforeRecreate = await getQuadsForInstance(bestuurseenheid, instance, directDatabaseAccess);

        expect(quadsBeforeRecreate).toHaveLength(4);
        expect(quadsBeforeRecreate).toEqual(expect.arrayContaining([
            quad(namedNode(instance.id.value), namedNode('http://www.w3.org/1999/02/22-rdf-syntax-ns#type'), namedNode('https://www.w3.org/ns/activitystreams#Tombstone'), namedNode(bestuurseenheid.userGraph().value)),
            quad(namedNode(instance.id.value), namedNode('https://www.w3.org/ns/activitystreams#deleted'), literal(FormatPreservingDate.now().value, 'http://www.w3.org/2001/XMLSchema#dateTime'), namedNode(bestuurseenheid.userGraph().value)),
            quad(namedNode(instance.id.value), namedNode('https://www.w3.org/ns/activitystreams#formerType'), namedNode('https://productencatalogus.data.vlaanderen.be/ns/ipdc-lpdc#InstancePublicService'), namedNode(bestuurseenheid.userGraph().value)),
            quad(namedNode(instance.id.value), namedNode('http://schema.org/publication'), namedNode('http://lblod.data.gift/concepts/publication-status/te-herpubliceren'), namedNode(bestuurseenheid.userGraph().value)),
        ]));

        const instanceSnapshot = aMinimalInstanceSnapshot().withCreatedBy(bestuurseenheid.id).withIsVersionOfInstance(instance.id).withIsArchived(false).build();
        await instanceSnapshotRepository.save(bestuurseenheid, instanceSnapshot);


        await mapperDomainService.merge(bestuurseenheid, instanceSnapshot.id);

        expect(await instanceRepository.exists(bestuurseenheid, instanceSnapshot.isVersionOfInstance)).toBeTruthy();
        const quadsBeforeAfterRecreate = await getQuadsForInstance(bestuurseenheid, instance, directDatabaseAccess);

        expect(quadsBeforeAfterRecreate).toEqual(expect.not.arrayContaining([
            quad(namedNode(instance.id.value), namedNode('http://www.w3.org/1999/02/22-rdf-syntax-ns#type'), namedNode('https://www.w3.org/ns/activitystreams#Tombstone'), namedNode(bestuurseenheid.userGraph().value)),
        ]));

        const instanceRecreated = await instanceRepository.findById(bestuurseenheid, instanceSnapshot.isVersionOfInstance);
        expect(instanceRecreated.id).toEqual(instanceSnapshot.isVersionOfInstance);
    });

    test('Given a deletedInstance, when receiving a new archive snapshot, update tombstone', async () => {
        const bestuurseenheid = aBestuurseenheid().build();
        await bestuurseenheidRepository.save(bestuurseenheid);

        const instance = aFullInstance().withCreatedBy(bestuurseenheid.id).build();
        await instanceRepository.save(bestuurseenheid, instance);
        await conceptDisplayConfigurationRepository.ensureConceptDisplayConfigurationsForAllBestuurseenheden(instance.conceptId);
        await deleteInstanceDomainService.delete(bestuurseenheid, instance.id);

        const instanceExists = await instanceRepository.exists(bestuurseenheid, instance.id);
        expect(instanceExists).toEqual(false);

        const quadsBeforeRecreate = await getQuadsForInstance(bestuurseenheid, instance, directDatabaseAccess);

        expect(quadsBeforeRecreate).toHaveLength(4);
        expect(quadsBeforeRecreate).toEqual(expect.arrayContaining([
            quad(namedNode(instance.id.value), namedNode('http://www.w3.org/1999/02/22-rdf-syntax-ns#type'), namedNode('https://www.w3.org/ns/activitystreams#Tombstone'), namedNode(bestuurseenheid.userGraph().value)),
            quad(namedNode(instance.id.value), namedNode('https://www.w3.org/ns/activitystreams#deleted'), literal(FormatPreservingDate.now().value, 'http://www.w3.org/2001/XMLSchema#dateTime'), namedNode(bestuurseenheid.userGraph().value)),
            quad(namedNode(instance.id.value), namedNode('https://www.w3.org/ns/activitystreams#formerType'), namedNode('https://productencatalogus.data.vlaanderen.be/ns/ipdc-lpdc#InstancePublicService'), namedNode(bestuurseenheid.userGraph().value)),
            quad(namedNode(instance.id.value), namedNode('http://schema.org/publication'), namedNode('http://lblod.data.gift/concepts/publication-status/te-herpubliceren'), namedNode(bestuurseenheid.userGraph().value)),
        ]));

        const instanceSnapshot = aMinimalInstanceSnapshot().withCreatedBy(bestuurseenheid.id).withIsVersionOfInstance(instance.id).withIsArchived(true).build();
        await instanceSnapshotRepository.save(bestuurseenheid, instanceSnapshot);

        await mapperDomainService.merge(bestuurseenheid, instanceSnapshot.id);

        expect(await instanceRepository.exists(bestuurseenheid, instanceSnapshot.isVersionOfInstance)).toBeFalsy();
        const quadsBeforeAfterArchivingAgain = await getQuadsForInstance(bestuurseenheid, instance, directDatabaseAccess);

        expect(quadsBeforeAfterArchivingAgain).toEqual(expect.arrayContaining([
            quad(namedNode(instance.id.value), namedNode('http://www.w3.org/1999/02/22-rdf-syntax-ns#type'), namedNode('https://www.w3.org/ns/activitystreams#Tombstone'), namedNode(bestuurseenheid.userGraph().value)),]));
    });

    test('Inserts Code Lists for competent and executing authorities if not existing', async () => {
        const bestuurseenheidRegistrationCodeFetcher = {
            fetchOrgRegistryCodelistEntry: jest.fn().mockImplementation((uriEntry: Iri) => Promise.resolve({
                uri: uriEntry,
                prefLabel: `preferred label for: ${uriEntry}`
            }))
        };
        const codeListDomainService = new EnsureLinkedAuthoritiesExistAsCodeListDomainService(
            bestuurseenheidRegistrationCodeFetcher,
            codeRepository
        );

        const merger = new InstanceSnapshotToInstanceMergerDomainService(
            instanceSnapshotRepository,
            instanceRepository,
            conceptRepository,
            conceptDisplayConfigurationRepository,
            deleteInstanceDomainService,
            codeListDomainService
        );

        await directDatabaseAccess.insertData(
            PUBLIC_GRAPH,
            [
                `${sparqlEscapeUri(NS.dvcs(CodeSchema.IPDCOrganisaties).value)} a skos:ConceptScheme`,
            ],
            [
                PREFIX.skos,
            ],
        );

        const competentAuthorityWithoutCodeList = buildBestuurseenheidIri(uuid());
        const executingAuthorityWithoutCodeList = buildBestuurseenheidIri(uuid());
        const bestuurseenheid = aBestuurseenheid().build();

        const isVersionOfInstanceId = buildConceptIri(uuid());
        const instanceSnapshot =
            aMinimalInstanceSnapshot()
                .withCreatedBy(bestuurseenheid.id)
                .withIsVersionOfInstance(isVersionOfInstanceId)
                .withCompetentAuthorities([competentAuthorityWithoutCodeList])
                .withExecutingAuthorities([executingAuthorityWithoutCodeList])
                .build();

        await instanceSnapshotRepository.save(bestuurseenheid, instanceSnapshot);

        await merger.merge(bestuurseenheid, instanceSnapshot.id);

        const createdInstance = await instanceRepository.findById(bestuurseenheid, isVersionOfInstanceId);
        expect(createdInstance.id).toEqual(isVersionOfInstanceId);
        expect(createdInstance.uuid).toMatch(uuidRegex);

        const createdCompetentAuthorityCode = await codeRepository.exists(CodeSchema.IPDCOrganisaties, competentAuthorityWithoutCodeList);
        expect(createdCompetentAuthorityCode).toBeTruthy();

        const createdExecutingAuthorityCode = await codeRepository.exists(CodeSchema.IPDCOrganisaties, executingAuthorityWithoutCodeList);
        expect(createdExecutingAuthorityCode).toBeTruthy();

    }, 10000);

});

async function getQuadsForInstance(bestuurseenheid: Bestuurseenheid, instance: Instance, directDatabaseAccess: DirectDatabaseAccess) {
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
    return new SparqlQuerying().asQuads(queryResult, bestuurseenheid.userGraph().value);
}