import {aBestuurseenheid} from "./bestuurseenheid-test-builder";
import {BestuurseenheidSparqlTestRepository} from "../../driven/persistence/bestuurseenheid-sparql-test-repository";
import {TEST_SPARQL_ENDPOINT} from "../../test.config";
import {
    aFullInstanceSnapshot,
    aMinimalInstanceSnapshot,
    InstanceSnapshotTestBuilder
} from "./instance-snapshot-test-builder";
import {InstanceSnapshotSparqlTestRepository} from "../../driven/persistence/instance-snapshot-sparql-test-repository";
import {
    InstanceSnapshotToInstanceMergerDomainService
} from "../../../src/core/domain/instance-snapshot-to-instance-merger-domain-service";
import {InstanceStatusType} from "../../../src/core/domain/types";
import {restoreRealTime, setFixedTime} from "../../fixed-time";
import {FormatPreservingDate} from "../../../src/core/domain/format-preserving-date";
import {ConceptSparqlRepository} from "../../../src/driven/persistence/concept-sparql-repository";
import {aFullConcept} from "./concept-test-builder";
import {aFullInstance, aMinimalInstance} from "./instance-test-builder";
import {sparqlEscapeUri, uuid} from "../../../mu-helper";
import {SparqlQuerying} from "../../../src/driven/persistence/sparql-querying";
import {literal, namedNode, quad} from "rdflib";
import {DirectDatabaseAccess} from "../../driven/persistence/direct-database-access";
import {buildBestuurseenheidIri, buildConceptIri} from "./iri-test-builder";
import {LanguageString} from "../../../src/core/domain/language-string";
import {
    ConceptDisplayConfigurationSparqlRepository
} from "../../../src/driven/persistence/concept-display-configuration-sparql-repository";
import {Iri} from "../../../src/core/domain/shared/iri";
import {INSTANCE_SNAPHOT_LDES_GRAPH, PREFIX, PUBLIC_GRAPH} from "../../../config";
import {NS} from "../../../src/driven/persistence/namespaces";
import {CodeSchema} from "../../../src/core/port/driven/persistence/code-repository";
import {CodeSparqlRepository} from "../../../src/driven/persistence/code-sparql-repository";
import {
    EnsureLinkedAuthoritiesExistAsCodeListDomainService
} from "../../../src/core/domain/ensure-linked-authorities-exist-as-code-list-domain-service";
import {DeleteInstanceDomainService} from "../../../src/core/domain/delete-instance-domain-service";
import {Bestuurseenheid} from "../../../src/core/domain/bestuurseenheid";
import {Instance, InstanceBuilder} from "../../../src/core/domain/instance";
import {ForbiddenError, InvariantError} from "../../../src/core/domain/shared/lpdc-error";
import {aFullContactPointForInstance} from "./contact-point-test-builder";
import {aFullAddressForInstance} from "./address-test-builder";
import {Language} from "../../../src/core/domain/language";
import {
    InstanceSnapshotProcessingAuthorizationSparqlTestRepository
} from "../../driven/persistence/instance-snapshot-processing-authorization-sparql-test-repository";
import {
    VersionedLdesSnapshotSparqlRepository
} from "../../../src/driven/persistence/versioned-ldes-snapshot-sparql-repository";
import {InstanceSparqlTestRepository} from "../../driven/persistence/instance-sparql-test-repository";

describe('instanceSnapshotToInstanceMapperDomainService', () => {

    beforeEach(async () => {
        await instanceSnapshotRepository.clearAllInstanceSnapshotGraphs();
    });

    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

    const bestuurseenheidRepository = new BestuurseenheidSparqlTestRepository(TEST_SPARQL_ENDPOINT);
    const instanceSnapshotRepository = new InstanceSnapshotSparqlTestRepository(TEST_SPARQL_ENDPOINT);
    const instanceRepository = new InstanceSparqlTestRepository(TEST_SPARQL_ENDPOINT);
    const conceptRepository = new ConceptSparqlRepository(TEST_SPARQL_ENDPOINT);
    const bestuurseenheidRegistrationCodeFetcher = {
        fetchOrgRegistryCodelistEntry: jest.fn().mockReturnValue(Promise.resolve({}))
    };
    const codeRepository = new CodeSparqlRepository(TEST_SPARQL_ENDPOINT);
    const ensureLinkedAuthoritiesExistAsCodeListDomainService = new EnsureLinkedAuthoritiesExistAsCodeListDomainService(bestuurseenheidRegistrationCodeFetcher, codeRepository);
    const conceptDisplayConfigurationRepository = new ConceptDisplayConfigurationSparqlRepository(TEST_SPARQL_ENDPOINT);
    const deleteInstanceDomainService = new DeleteInstanceDomainService(instanceRepository, conceptDisplayConfigurationRepository);
    const instanceSnapshotProcessingAuthorizationRepository = new InstanceSnapshotProcessingAuthorizationSparqlTestRepository(TEST_SPARQL_ENDPOINT);
    const mergerDomainService = new InstanceSnapshotToInstanceMergerDomainService(
        instanceSnapshotRepository,
        instanceRepository,
        conceptRepository,
        conceptDisplayConfigurationRepository,
        deleteInstanceDomainService,
        ensureLinkedAuthoritiesExistAsCodeListDomainService,
        instanceSnapshotProcessingAuthorizationRepository,
        bestuurseenheidRepository,
    );
    const versionedLdesSnapshotRepository = new VersionedLdesSnapshotSparqlRepository(TEST_SPARQL_ENDPOINT);
    const directDatabaseAccess = new DirectDatabaseAccess(TEST_SPARQL_ENDPOINT);

    beforeAll(() => setFixedTime());

    afterAll(() => restoreRealTime());

    describe('Instance does not exists', () => {

        test('Given a minimalistic instanceSnapshot, then instance is created', async () => {
            const bestuurseenheid = aBestuurseenheid().build();
            await bestuurseenheidRepository.save(bestuurseenheid);

            const instanceSnapshot = aMinimalInstanceSnapshot().withCreatedBy(bestuurseenheid.id).withConceptId(undefined).build();

            const instanceSnapshotGraph = new Iri(INSTANCE_SNAPHOT_LDES_GRAPH('an-integrating-partner'));

            await instanceSnapshotRepository.save(instanceSnapshotGraph, instanceSnapshot);

            const instanceExists = await instanceRepository.exists(bestuurseenheid, instanceSnapshot.isVersionOf);
            expect(instanceExists).toEqual(false);

            await instanceSnapshotProcessingAuthorizationRepository.save(bestuurseenheid, instanceSnapshotGraph);

            await mergerDomainService.merge(instanceSnapshotGraph, instanceSnapshot.id, versionedLdesSnapshotRepository);

            const instanceAfterMerge = await instanceRepository.findById(bestuurseenheid, instanceSnapshot.isVersionOf);
            expect(instanceAfterMerge.id).toEqual(instanceSnapshot.isVersionOf);
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
            expect(instanceAfterMerge.dutchLanguageVariant).toEqual(Language.INFORMAL);
            expect(instanceAfterMerge.needsConversionFromFormalToInformal).toBeFalse();
            expect(instanceAfterMerge.dateCreated).toEqual(instanceSnapshot.dateCreated);
            expect(instanceAfterMerge.dateModified).toEqual(instanceSnapshot.dateModified);
            expect(instanceAfterMerge.dateSent).toEqual(FormatPreservingDate.now());
            expect(instanceAfterMerge.datePublished).toEqual(undefined);
            expect(instanceAfterMerge.status).toEqual(InstanceStatusType.VERZONDEN);
            expect(instanceAfterMerge.reviewStatus).toEqual(undefined);
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
            const instanceSnapshotGraph = new Iri(INSTANCE_SNAPHOT_LDES_GRAPH('an-integrating-partner'));
            await instanceSnapshotRepository.save(instanceSnapshotGraph, instanceSnapshot);

            const instanceExists = await instanceRepository.exists(bestuurseenheid, instanceSnapshot.isVersionOf);
            expect(instanceExists).toEqual(false);

            await instanceSnapshotProcessingAuthorizationRepository.save(bestuurseenheid, instanceSnapshotGraph);

            await mergerDomainService.merge(instanceSnapshotGraph, instanceSnapshot.id, versionedLdesSnapshotRepository);

            const instanceAfterMerge = await instanceRepository.findById(bestuurseenheid, instanceSnapshot.isVersionOf);
            expect(instanceAfterMerge.id).toEqual(instanceSnapshot.isVersionOf);
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
                    }),
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
                    }),
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
                            }),
                            expect.objectContaining({
                                _id: expect.not.objectContaining(instanceSnapshot.procedures[0].websites[1].id),
                                _uuid: expect.stringMatching(uuidRegex),
                                _title: instanceSnapshot.procedures[0].websites[1].title,
                                _description: instanceSnapshot.procedures[0].websites[1].description,
                                _order: instanceSnapshot.procedures[0].websites[1].order,
                                _url: instanceSnapshot.procedures[0].websites[1].url,

                            })
                        ]),


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
                            }),
                            expect.objectContaining({
                                _id: expect.not.objectContaining(instanceSnapshot.procedures[1].websites[1].id),
                                _uuid: expect.stringMatching(uuidRegex),
                                _title: instanceSnapshot.procedures[1].websites[1].title,
                                _description: instanceSnapshot.procedures[1].websites[1].description,
                                _order: instanceSnapshot.procedures[1].websites[1].order,
                                _url: instanceSnapshot.procedures[1].websites[1].url,
                            })
                        ]),
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
                    }),
                    expect.objectContaining({
                        _id: expect.not.objectContaining(instanceSnapshot.websites[1].id),
                        _uuid: expect.stringMatching(uuidRegex),
                        _title: instanceSnapshot.websites[1].title,
                        _description: instanceSnapshot.websites[1].description,
                        _order: instanceSnapshot.websites[1].order,
                        _url: instanceSnapshot.websites[1].url,
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
                    }),
                    expect.objectContaining({
                        _id: expect.not.objectContaining(instanceSnapshot.costs[1].id),
                        _uuid: expect.stringMatching(uuidRegex),
                        _title: instanceSnapshot.costs[1].title,
                        _description: instanceSnapshot.costs[1].description,
                        _order: instanceSnapshot.costs[1].order,
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
                    }),
                    expect.objectContaining({
                        _id: expect.not.objectContaining(instanceSnapshot.financialAdvantages[1].id),
                        _uuid: expect.stringMatching(uuidRegex),
                        _title: instanceSnapshot.financialAdvantages[1].title,
                        _description: instanceSnapshot.financialAdvantages[1].description,
                        _order: instanceSnapshot.financialAdvantages[1].order,
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
            expect(instanceAfterMerge.dutchLanguageVariant).toEqual(Language.INFORMAL);
            expect(instanceAfterMerge.needsConversionFromFormalToInformal).toBeFalse();
            expect(instanceAfterMerge.dateCreated).toEqual(instanceSnapshot.dateCreated);
            expect(instanceAfterMerge.dateModified).toEqual(instanceSnapshot.dateModified);
            expect(instanceAfterMerge.dateSent).toEqual(FormatPreservingDate.now());
            expect(instanceAfterMerge.datePublished).toEqual(undefined);
            expect(instanceAfterMerge.status).toEqual(InstanceStatusType.VERZONDEN);
            expect(instanceAfterMerge.reviewStatus).toEqual(undefined);
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

        test('Given a instanceSnapshot with informal languageStrings, then instance is created with informal dutchLanguageVersion', async () => {
            const bestuurseenheid = aBestuurseenheid().build();
            await bestuurseenheidRepository.save(bestuurseenheid);

            const concept = aFullConcept().build();
            await conceptRepository.save(concept);
            await conceptDisplayConfigurationRepository.ensureConceptDisplayConfigurationsForAllBestuurseenheden(concept.id);

            const instanceSnapshot = aMinimalInstanceSnapshot()
                .withTitle(
                    LanguageString.of(
                        undefined,
                        undefined,
                        InstanceSnapshotTestBuilder.TITLE_NL_INFORMAL))
                .withDescription(
                    LanguageString.of(
                        undefined,
                        undefined,
                        InstanceSnapshotTestBuilder.DESCRIPTION_NL_INFORMAL))
                .withCreatedBy(bestuurseenheid.id).withConceptId(concept.id).build();
            const instanceSnapshotGraph = new Iri(INSTANCE_SNAPHOT_LDES_GRAPH('an-integrating-partner'));

            await instanceSnapshotRepository.save(instanceSnapshotGraph, instanceSnapshot);

            const instanceExists = await instanceRepository.exists(bestuurseenheid, instanceSnapshot.isVersionOf);
            expect(instanceExists).toEqual(false);

            await instanceSnapshotProcessingAuthorizationRepository.save(bestuurseenheid, instanceSnapshotGraph);

            await mergerDomainService.merge(instanceSnapshotGraph, instanceSnapshot.id, versionedLdesSnapshotRepository);

            const instanceAfterMerge = await instanceRepository.findById(bestuurseenheid, instanceSnapshot.isVersionOf);
            expect(instanceAfterMerge.title).toEqual(instanceSnapshot.title);
            expect(instanceAfterMerge.description).toEqual(instanceSnapshot.description);
            expect(instanceAfterMerge.dutchLanguageVariant).toEqual(Language.INFORMAL);
        });

        test('Given a instanceSnapshot with formal languageStrings, then instance is created with formal dutchLanguageVersion', async () => {
            const bestuurseenheid = aBestuurseenheid().build();
            await bestuurseenheidRepository.save(bestuurseenheid);

            const concept = aFullConcept().build();
            await conceptRepository.save(concept);
            await conceptDisplayConfigurationRepository.ensureConceptDisplayConfigurationsForAllBestuurseenheden(concept.id);

            const instanceSnapshot = aMinimalInstanceSnapshot()
                .withTitle(
                    LanguageString.of(
                        undefined,
                        InstanceSnapshotTestBuilder.TITLE_NL_FORMAL,
                        undefined))
                .withDescription(
                    LanguageString.of(
                        undefined,
                        InstanceSnapshotTestBuilder.DESCRIPTION_NL_FORMAL,
                        undefined))
                .withCreatedBy(bestuurseenheid.id).withConceptId(concept.id).build();
            const instanceSnapshotGraph = new Iri(INSTANCE_SNAPHOT_LDES_GRAPH('an-integrating-partner'));

            await instanceSnapshotRepository.save(instanceSnapshotGraph, instanceSnapshot);

            const instanceExists = await instanceRepository.exists(bestuurseenheid, instanceSnapshot.isVersionOf);
            expect(instanceExists).toEqual(false);

            await instanceSnapshotProcessingAuthorizationRepository.save(bestuurseenheid, instanceSnapshotGraph);

            await mergerDomainService.merge(instanceSnapshotGraph, instanceSnapshot.id, versionedLdesSnapshotRepository);

            const instanceAfterMerge = await instanceRepository.findById(bestuurseenheid, instanceSnapshot.isVersionOf);
            expect(instanceAfterMerge.title).toEqual(instanceSnapshot.title);
            expect(instanceAfterMerge.description).toEqual(instanceSnapshot.description);
            expect(instanceAfterMerge.dutchLanguageVariant).toEqual(Language.FORMAL);
        });

        test('conceptDisplayConfiguration is updated', async () => {
            const bestuurseenheid = aBestuurseenheid().build();
            await bestuurseenheidRepository.save(bestuurseenheid);

            const concept = aFullConcept().build();
            await conceptRepository.save(concept);

            await conceptDisplayConfigurationRepository.ensureConceptDisplayConfigurationsForAllBestuurseenheden(concept.id);

            const instanceSnapshot = aFullInstanceSnapshot().withCreatedBy(bestuurseenheid.id).withConceptId(concept.id).build();
            const instanceSnapshotGraph = new Iri(INSTANCE_SNAPHOT_LDES_GRAPH('an-integrating-partner'));
            await instanceSnapshotRepository.save(instanceSnapshotGraph, instanceSnapshot);

            const instanceExists = await instanceRepository.exists(bestuurseenheid, instanceSnapshot.isVersionOf);
            expect(instanceExists).toEqual(false);

            await instanceSnapshotProcessingAuthorizationRepository.save(bestuurseenheid, instanceSnapshotGraph);

            await mergerDomainService.merge(instanceSnapshotGraph, instanceSnapshot.id, versionedLdesSnapshotRepository);

            const conceptDisplayConfiguration = await conceptDisplayConfigurationRepository.findByConceptId(bestuurseenheid, concept.id);
            expect(conceptDisplayConfiguration.conceptIsNew).toEqual(false);
            expect(conceptDisplayConfiguration.conceptIsInstantiated).toEqual(true);
        });

        test('instance is validated for publish', async () => {
            const bestuurseenheid = aBestuurseenheid().build();
            await bestuurseenheidRepository.save(bestuurseenheid);

            const instanceSnapshot = aMinimalInstanceSnapshot()
                .withTitle(LanguageString.of(undefined, undefined, 'titel'))
                .withDescription(LanguageString.of(undefined, undefined, ''))
                .withCreatedBy(bestuurseenheid.id)
                .withConceptId(undefined)
                .build();
            const instanceSnapshotGraph = new Iri(INSTANCE_SNAPHOT_LDES_GRAPH('an-integrating-partner'));
            await instanceSnapshotRepository.save(instanceSnapshotGraph, instanceSnapshot);

            await instanceSnapshotProcessingAuthorizationRepository.save(bestuurseenheid, instanceSnapshotGraph);

            await expect(() => mergerDomainService.merge(instanceSnapshotGraph, instanceSnapshot.id, versionedLdesSnapshotRepository))
                .rejects.toThrowWithMessage(InvariantError, 'Binnen eenzelfde taal moeten titel en beschrijving beide ingevuld (of leeg) zijn');
        });

        test('instance is validated for publish, adres can be invalid', async () => {
            const bestuurseenheid = aBestuurseenheid().build();
            await bestuurseenheidRepository.save(bestuurseenheid);

            const instanceSnapshot = aMinimalInstanceSnapshot()
                .withCreatedBy(bestuurseenheid.id)
                .withConceptId(undefined)
                .withContactPoints([aFullContactPointForInstance().withAddress(aFullAddressForInstance().withVerwijstNaar(undefined).build()).build()])
                .build();
            const instanceSnapshotGraph = new Iri(INSTANCE_SNAPHOT_LDES_GRAPH('an-integrating-partner'));
            await instanceSnapshotRepository.save(instanceSnapshotGraph, instanceSnapshot);

            await instanceSnapshotProcessingAuthorizationRepository.save(bestuurseenheid, instanceSnapshotGraph);

            await expect(mergerDomainService.merge(instanceSnapshotGraph, instanceSnapshot.id, versionedLdesSnapshotRepository)).resolves.not.toThrow();
        });

        test('unauthorized merging of bestuurseenheid for instance snapshot graph throws ForbiddenError', async () => {
            const bestuurseenheid = aBestuurseenheid().build();
            await bestuurseenheidRepository.save(bestuurseenheid);

            const instanceSnapshot = aMinimalInstanceSnapshot()
                .withCreatedBy(bestuurseenheid.id)
                .withConceptId(undefined)
                .withContactPoints([aFullContactPointForInstance().withAddress(aFullAddressForInstance().withVerwijstNaar(undefined).build()).build()])
                .build();
            const instanceSnapshotGraph = new Iri(INSTANCE_SNAPHOT_LDES_GRAPH('an-integrating-partner'));
            await instanceSnapshotRepository.save(instanceSnapshotGraph, instanceSnapshot);

            await expect(() => mergerDomainService.merge(instanceSnapshotGraph, instanceSnapshot.id, versionedLdesSnapshotRepository)).rejects.toThrowWithMessage(ForbiddenError, `Bestuur <${bestuurseenheid.id}> niet toegelaten voor instance snapshot graph <${instanceSnapshotGraph}>.`);
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
                const instanceSnapshotGraph = new Iri(INSTANCE_SNAPHOT_LDES_GRAPH('an-integrating-partner'));

                await instanceSnapshotRepository.save(instanceSnapshotGraph, instanceSnapshot);

                const instanceExists = await instanceRepository.exists(bestuurseenheid, instanceSnapshot.isVersionOf);
                expect(instanceExists).toEqual(true);

                await instanceSnapshotProcessingAuthorizationRepository.save(bestuurseenheid, instanceSnapshotGraph);

                await mergerDomainService.merge(instanceSnapshotGraph, instanceSnapshot.id, versionedLdesSnapshotRepository);

                const instanceAfterMerge = await instanceRepository.findById(bestuurseenheid, instanceSnapshot.isVersionOf);

                expect(instanceAfterMerge.id).toEqual(instanceSnapshot.isVersionOf);
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
                expect(instanceAfterMerge.dutchLanguageVariant).toEqual(Language.INFORMAL);
                expect(instanceAfterMerge.needsConversionFromFormalToInformal).toBeFalse();

                expect(instanceAfterMerge.dateCreated).toEqual(instanceSnapshot.dateCreated);
                expect(instanceAfterMerge.dateModified).toEqual(instanceSnapshot.dateModified);
                expect(instanceAfterMerge.dateSent).toEqual(FormatPreservingDate.now());
                expect(instanceAfterMerge.datePublished).toEqual(instance.datePublished);
                expect(instanceAfterMerge.status).toEqual(InstanceStatusType.VERZONDEN);
                expect(instanceAfterMerge.reviewStatus).toEqual(undefined);
                expect(instanceAfterMerge.spatials).toEqual(instanceSnapshot.spatials);
                expect(instanceAfterMerge.legalResources).toEqual(instanceSnapshot.legalResources);
            });

            test('Given a full instanceSnapshot, then existing instance is updated', async () => {
                const bestuurseenheid = aBestuurseenheid().build();
                await bestuurseenheidRepository.save(bestuurseenheid);

                const instance = aFullInstance()
                    .withCreatedBy(bestuurseenheid.id)
                    .withCopyOf(InstanceBuilder.buildIri(uuid()))
                    .withForMunicipalityMerger(true)
                    .build();
                await instanceRepository.save(bestuurseenheid, instance);
                await conceptDisplayConfigurationRepository.ensureConceptDisplayConfigurationsForAllBestuurseenheden(instance.conceptId);

                const concept = aFullConcept().build();
                await conceptRepository.save(concept);
                await conceptDisplayConfigurationRepository.ensureConceptDisplayConfigurationsForAllBestuurseenheden(concept.id);

                const instanceSnapshot = aFullInstanceSnapshot().withCreatedBy(bestuurseenheid.id).withIsVersionOfInstance(instance.id).withConceptId(concept.id).build();
                const instanceSnapshotGraph = new Iri(INSTANCE_SNAPHOT_LDES_GRAPH('an-integrating-partner'));

                await instanceSnapshotRepository.save(instanceSnapshotGraph, instanceSnapshot);

                const instanceExists = await instanceRepository.exists(bestuurseenheid, instanceSnapshot.isVersionOf);
                expect(instanceExists).toEqual(true);

                await instanceSnapshotProcessingAuthorizationRepository.save(bestuurseenheid, instanceSnapshotGraph);

                await mergerDomainService.merge(instanceSnapshotGraph, instanceSnapshot.id, versionedLdesSnapshotRepository);

                const instanceAfterMerge = await instanceRepository.findById(bestuurseenheid, instanceSnapshot.isVersionOf);
                expect(instanceAfterMerge.id).toEqual(instanceSnapshot.isVersionOf);
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
                        }),
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
                        }),
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
                                }),
                                expect.objectContaining({
                                    _id: expect.not.objectContaining(instanceSnapshot.procedures[0].websites[1].id),
                                    _uuid: expect.stringMatching(uuidRegex),
                                    _title: instanceSnapshot.procedures[0].websites[1].title,
                                    _description: instanceSnapshot.procedures[0].websites[1].description,
                                    _order: instanceSnapshot.procedures[0].websites[1].order,
                                    _url: instanceSnapshot.procedures[0].websites[1].url,
                                })
                            ]),

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
                                }),
                                expect.objectContaining({
                                    _id: expect.not.objectContaining(instanceSnapshot.procedures[1].websites[1].id),
                                    _uuid: expect.stringMatching(uuidRegex),
                                    _title: instanceSnapshot.procedures[1].websites[1].title,
                                    _description: instanceSnapshot.procedures[1].websites[1].description,
                                    _order: instanceSnapshot.procedures[1].websites[1].order,
                                    _url: instanceSnapshot.procedures[1].websites[1].url,
                                })
                            ]),
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
                        }),
                        expect.objectContaining({
                            _id: expect.not.objectContaining(instanceSnapshot.websites[1].id),
                            _uuid: expect.stringMatching(uuidRegex),
                            _title: instanceSnapshot.websites[1].title,
                            _description: instanceSnapshot.websites[1].description,
                            _order: instanceSnapshot.websites[1].order,
                            _url: instanceSnapshot.websites[1].url,
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
                        }),
                        expect.objectContaining({
                            _id: expect.not.objectContaining(instanceSnapshot.costs[1].id),
                            _uuid: expect.stringMatching(uuidRegex),
                            _title: instanceSnapshot.costs[1].title,
                            _description: instanceSnapshot.costs[1].description,
                            _order: instanceSnapshot.costs[1].order,
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
                        }),
                        expect.objectContaining({
                            _id: expect.not.objectContaining(instanceSnapshot.financialAdvantages[1].id),
                            _uuid: expect.stringMatching(uuidRegex),
                            _title: instanceSnapshot.financialAdvantages[1].title,
                            _description: instanceSnapshot.financialAdvantages[1].description,
                            _order: instanceSnapshot.financialAdvantages[1].order,
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
                expect(instanceAfterMerge.dutchLanguageVariant).toEqual(Language.INFORMAL);
                expect(instanceAfterMerge.needsConversionFromFormalToInformal).toBeFalse();
                expect(instanceAfterMerge.dateCreated).toEqual(instanceSnapshot.dateCreated);
                expect(instanceAfterMerge.dateModified).toEqual(instanceSnapshot.dateModified);
                expect(instanceAfterMerge.dateSent).toEqual(FormatPreservingDate.now());
                expect(instanceAfterMerge.datePublished).toEqual(instance.datePublished);
                expect(instanceAfterMerge.status).toEqual(InstanceStatusType.VERZONDEN);
                expect(instanceAfterMerge.reviewStatus).toEqual(undefined);
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
                expect(instanceAfterMerge.forMunicipalityMerger).toBeFalse();
                expect(instanceAfterMerge.copyOf).toBeUndefined();
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
                const instanceSnapshotGraph = new Iri(INSTANCE_SNAPHOT_LDES_GRAPH('an-integrating-partner'));

                await instanceSnapshotRepository.save(instanceSnapshotGraph, instanceSnapshot);

                const instanceExists = await instanceRepository.exists(bestuurseenheid, instanceSnapshot.isVersionOf);
                expect(instanceExists).toEqual(true);

                await instanceSnapshotProcessingAuthorizationRepository.save(bestuurseenheid, instanceSnapshotGraph);

                await mergerDomainService.merge(instanceSnapshotGraph, instanceSnapshot.id, versionedLdesSnapshotRepository);

                expect(await instanceRepository.exists(bestuurseenheid, instanceSnapshot.isVersionOf)).toBeFalsy();

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
                const instanceSnapshotGraph = new Iri(INSTANCE_SNAPHOT_LDES_GRAPH('an-integrating-partner'));

                await instanceSnapshotRepository.save(instanceSnapshotGraph, instanceSnapshot);

                const instanceExists = await instanceRepository.exists(bestuurseenheid, instanceSnapshot.isVersionOf);
                expect(instanceExists).toEqual(true);

                await instanceSnapshotProcessingAuthorizationRepository.save(bestuurseenheid, instanceSnapshotGraph);

                await mergerDomainService.merge(instanceSnapshotGraph, instanceSnapshot.id, versionedLdesSnapshotRepository);

                expect(await instanceRepository.exists(bestuurseenheid, instanceSnapshot.isVersionOf)).toBeFalsy();

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
                const instanceSnapshotGraph = new Iri(INSTANCE_SNAPHOT_LDES_GRAPH('an-integrating-partner'));

                await instanceSnapshotRepository.save(instanceSnapshotGraph, instanceSnapshot);
                await conceptDisplayConfigurationRepository.syncInstantiatedFlag(bestuurseenheid, concept.id);

                const instanceExists = await instanceRepository.exists(bestuurseenheid, instanceSnapshot.isVersionOf);
                expect(instanceExists).toEqual(true);

                await instanceSnapshotProcessingAuthorizationRepository.save(bestuurseenheid, instanceSnapshotGraph);

                await mergerDomainService.merge(instanceSnapshotGraph, instanceSnapshot.id, versionedLdesSnapshotRepository);
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
            const instanceSnapshotGraph = new Iri(INSTANCE_SNAPHOT_LDES_GRAPH('an-integrating-partner'));

            await instanceSnapshotRepository.save(instanceSnapshotGraph, instanceSnapshot);

            await conceptDisplayConfigurationRepository.syncInstantiatedFlag(bestuurseenheid, concept.id);
            await conceptDisplayConfigurationRepository.syncInstantiatedFlag(bestuurseenheid, concept2.id);

            const instanceExists = await instanceRepository.exists(bestuurseenheid, instanceSnapshot.isVersionOf);
            expect(instanceExists).toEqual(true);

            await instanceSnapshotProcessingAuthorizationRepository.save(bestuurseenheid, instanceSnapshotGraph);

            await mergerDomainService.merge(instanceSnapshotGraph, instanceSnapshot.id, versionedLdesSnapshotRepository);

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
            const instanceId = InstanceBuilder.buildIri(uuid());
            const otherInstanceId = InstanceBuilder.buildIri(uuid());

            const instanceSnapshotForOtherInstance = aFullInstanceSnapshot()
                .withTitle(LanguageString.of(undefined, undefined, 'other snapshot'))
                .withGeneratedAtTime(FormatPreservingDate.of('2024-01-18T00:00:00.672Z'))
                .withCreatedBy(bestuurseenheid.id)
                .withIsVersionOfInstance(otherInstanceId)
                .withConceptId(concept.id)
                .build();

            const firstInstanceSnapshot = aFullInstanceSnapshot()
                .withTitle(LanguageString.of(undefined, undefined, 'snapshot 1'))
                .withGeneratedAtTime(FormatPreservingDate.of('2024-01-16T00:00:00.672Z'))
                .withCreatedBy(bestuurseenheid.id)
                .withIsVersionOfInstance(instanceId)
                .withConceptId(concept.id)
                .build();
            const secondInstanceSnapshot = aFullInstanceSnapshot()
                .withTitle(LanguageString.of(undefined, undefined, 'snapshot 2'))
                .withGeneratedAtTime(FormatPreservingDate.of('2024-01-17T00:00:00.672Z'))
                .withCreatedBy(bestuurseenheid.id)
                .withIsVersionOfInstance(instanceId)
                .withConceptId(concept.id)
                .build();

            const instanceSnapshotGraph = new Iri(INSTANCE_SNAPHOT_LDES_GRAPH('an-integrating-partner'));

            await instanceSnapshotRepository.save(instanceSnapshotGraph, instanceSnapshotForOtherInstance);
            await instanceSnapshotRepository.save(instanceSnapshotGraph, secondInstanceSnapshot);
            await instanceSnapshotRepository.save(instanceSnapshotGraph, firstInstanceSnapshot);

            await instanceSnapshotProcessingAuthorizationRepository.save(bestuurseenheid, instanceSnapshotGraph);

            await mergerDomainService.merge(instanceSnapshotGraph, instanceSnapshotForOtherInstance.id, versionedLdesSnapshotRepository);
            await versionedLdesSnapshotRepository.addToSuccessfullyProcessedSnapshots(instanceSnapshotGraph, instanceSnapshotForOtherInstance.id);

            await mergerDomainService.merge(instanceSnapshotGraph, secondInstanceSnapshot.id, versionedLdesSnapshotRepository);
            await versionedLdesSnapshotRepository.addToSuccessfullyProcessedSnapshots(instanceSnapshotGraph, secondInstanceSnapshot.id);

            await mergerDomainService.merge(instanceSnapshotGraph, firstInstanceSnapshot.id, versionedLdesSnapshotRepository);
            await versionedLdesSnapshotRepository.addToSuccessfullyProcessedSnapshots(instanceSnapshotGraph, firstInstanceSnapshot.id);

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
                .withTitle(LanguageString.of(undefined, undefined, 'titel'))
                .withDescription(LanguageString.of(undefined, undefined, ''))
                .withCreatedBy(bestuurseenheid.id)
                .withConceptId(undefined)
                .withIsVersionOfInstance(instance.id)
                .build();
            const instanceSnapshotGraph = new Iri(INSTANCE_SNAPHOT_LDES_GRAPH('an-integrating-partner'));

            await instanceSnapshotRepository.save(instanceSnapshotGraph, instanceSnapshot);

            await instanceSnapshotProcessingAuthorizationRepository.save(bestuurseenheid, instanceSnapshotGraph);

            await expect(() => mergerDomainService.merge(instanceSnapshotGraph, instanceSnapshot.id, versionedLdesSnapshotRepository))
                .rejects.toThrowWithMessage(InvariantError, 'Binnen eenzelfde taal moeten titel en beschrijving beide ingevuld (of leeg) zijn');
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
            const instanceSnapshotGraph = new Iri(INSTANCE_SNAPHOT_LDES_GRAPH('an-integrating-partner'));

            await instanceSnapshotRepository.save(instanceSnapshotGraph, instanceSnapshot);

            await instanceSnapshotProcessingAuthorizationRepository.save(bestuurseenheid, instanceSnapshotGraph);

            await expect(mergerDomainService.merge(instanceSnapshotGraph, instanceSnapshot.id, versionedLdesSnapshotRepository)).resolves.not.toThrow();
        });

        test('Given a instanceSnapshot with formal languageStrings, then instance is merged with formal dutchLanguageVersion', async () => {
            const bestuurseenheid = aBestuurseenheid().build();
            await bestuurseenheidRepository.save(bestuurseenheid);

            const instance = aMinimalInstance().withCreatedBy(bestuurseenheid.id).build();
            await instanceRepository.save(bestuurseenheid, instance);

            const instanceSnapshot = aMinimalInstanceSnapshot()
                .withTitle(
                    LanguageString.of(
                        undefined,
                        InstanceSnapshotTestBuilder.TITLE_NL_FORMAL,
                        undefined))
                .withDescription(
                    LanguageString.of(
                        undefined,
                        InstanceSnapshotTestBuilder.DESCRIPTION_NL_FORMAL,
                        undefined))
                .withCreatedBy(bestuurseenheid.id).withIsVersionOfInstance(instance.id).withConceptId(undefined).build();
            const instanceSnapshotGraph = new Iri(INSTANCE_SNAPHOT_LDES_GRAPH('an-integrating-partner'));

            await instanceSnapshotRepository.save(instanceSnapshotGraph, instanceSnapshot);

            const instanceExists = await instanceRepository.exists(bestuurseenheid, instanceSnapshot.isVersionOf);
            expect(instanceExists).toEqual(true);

            await instanceSnapshotProcessingAuthorizationRepository.save(bestuurseenheid, instanceSnapshotGraph);

            await mergerDomainService.merge(instanceSnapshotGraph, instanceSnapshot.id, versionedLdesSnapshotRepository);

            const instanceAfterMerge = await instanceRepository.findById(bestuurseenheid, instanceSnapshot.isVersionOf);

            expect(instanceAfterMerge.id).toEqual(instanceSnapshot.isVersionOf);
            expect(instanceAfterMerge.title).toEqual(instanceSnapshot.title);
            expect(instanceAfterMerge.description).toEqual(instanceSnapshot.description);
            expect(instanceAfterMerge.dutchLanguageVariant).toEqual(Language.FORMAL);
        });

        test('Given a instanceSnapshot with informal languageStrings, then instance is merged with informal dutchLanguageVersion', async () => {
            const bestuurseenheid = aBestuurseenheid().build();
            await bestuurseenheidRepository.save(bestuurseenheid);

            const instance = aMinimalInstance().withCreatedBy(bestuurseenheid.id).build();
            await instanceRepository.save(bestuurseenheid, instance);

            const instanceSnapshot = aMinimalInstanceSnapshot()
                .withTitle(
                    LanguageString.of(
                        undefined,
                        undefined,
                        InstanceSnapshotTestBuilder.TITLE_NL_INFORMAL))
                .withDescription(
                    LanguageString.of(
                        undefined,
                        undefined,
                        InstanceSnapshotTestBuilder.DESCRIPTION_NL_INFORMAL))
                .withCreatedBy(bestuurseenheid.id).withIsVersionOfInstance(instance.id).withConceptId(undefined).build();
            const instanceSnapshotGraph = new Iri(INSTANCE_SNAPHOT_LDES_GRAPH('an-integrating-partner'));

            await instanceSnapshotRepository.save(instanceSnapshotGraph, instanceSnapshot);

            const instanceExists = await instanceRepository.exists(bestuurseenheid, instanceSnapshot.isVersionOf);
            expect(instanceExists).toEqual(true);

            await instanceSnapshotProcessingAuthorizationRepository.save(bestuurseenheid, instanceSnapshotGraph);

            await mergerDomainService.merge(instanceSnapshotGraph, instanceSnapshot.id, versionedLdesSnapshotRepository);

            const instanceAfterMerge = await instanceRepository.findById(bestuurseenheid, instanceSnapshot.isVersionOf);

            expect(instanceAfterMerge.id).toEqual(instanceSnapshot.isVersionOf);
            expect(instanceAfterMerge.title).toEqual(instanceSnapshot.title);
            expect(instanceAfterMerge.description).toEqual(instanceSnapshot.description);
            expect(instanceAfterMerge.dutchLanguageVariant).toEqual(Language.INFORMAL);
        });

        test('Given a instanceSnapshot with informal languageStrings and instance was formal, then instance is merged with informal dutchLanguageVersion', async () => {
            const bestuurseenheid = aBestuurseenheid().build();
            await bestuurseenheidRepository.save(bestuurseenheid);

            const instance = aMinimalInstance()
                .withTitle(
                    LanguageString.of(
                        undefined,
                        InstanceSnapshotTestBuilder.TITLE_NL_FORMAL,
                        undefined))
                .withDescription(
                    LanguageString.of(
                        undefined,
                        InstanceSnapshotTestBuilder.DESCRIPTION_NL_FORMAL,
                        undefined,))
                .withDutchLanguageVariant(Language.FORMAL)
                .withCreatedBy(bestuurseenheid.id).build();
            await instanceRepository.save(bestuurseenheid, instance);

            const instanceSnapshot = aMinimalInstanceSnapshot()
                .withTitle(
                    LanguageString.of(
                        undefined,
                        undefined,
                        InstanceSnapshotTestBuilder.DESCRIPTION_NL_INFORMAL))
                .withDescription(
                    LanguageString.of(
                        undefined,
                        undefined,
                        InstanceSnapshotTestBuilder.DESCRIPTION_NL_INFORMAL))
                .withCreatedBy(bestuurseenheid.id).withIsVersionOfInstance(instance.id).withConceptId(undefined).build();
            const instanceSnapshotGraph = new Iri(INSTANCE_SNAPHOT_LDES_GRAPH('an-integrating-partner'));

            await instanceSnapshotRepository.save(instanceSnapshotGraph, instanceSnapshot);

            const instanceExists = await instanceRepository.exists(bestuurseenheid, instanceSnapshot.isVersionOf);
            expect(instanceExists).toEqual(true);

            await instanceSnapshotProcessingAuthorizationRepository.save(bestuurseenheid, instanceSnapshotGraph);

            await mergerDomainService.merge(instanceSnapshotGraph, instanceSnapshot.id, versionedLdesSnapshotRepository);

            const instanceAfterMerge = await instanceRepository.findById(bestuurseenheid, instanceSnapshot.isVersionOf);

            expect(instanceAfterMerge.id).toEqual(instanceSnapshot.isVersionOf);
            expect(instanceAfterMerge.title).toEqual(instanceSnapshot.title);
            expect(instanceAfterMerge.description).toEqual(instanceSnapshot.description);
            expect(instanceAfterMerge.dutchLanguageVariant).toEqual(Language.INFORMAL);
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
        const instanceSnapshotGraph = new Iri(INSTANCE_SNAPHOT_LDES_GRAPH('an-integrating-partner'));

        await instanceSnapshotRepository.save(instanceSnapshotGraph, instanceSnapshot);

        await instanceSnapshotProcessingAuthorizationRepository.save(bestuurseenheid, instanceSnapshotGraph);

        await mergerDomainService.merge(instanceSnapshotGraph, instanceSnapshot.id, versionedLdesSnapshotRepository);

        expect(await instanceRepository.exists(bestuurseenheid, instanceSnapshot.isVersionOf)).toBeTruthy();
        const quadsBeforeAfterRecreate = await getQuadsForInstance(bestuurseenheid, instance, directDatabaseAccess);

        expect(quadsBeforeAfterRecreate).toEqual(expect.not.arrayContaining([
            quad(namedNode(instance.id.value), namedNode('http://www.w3.org/1999/02/22-rdf-syntax-ns#type'), namedNode('https://www.w3.org/ns/activitystreams#Tombstone'), namedNode(bestuurseenheid.userGraph().value)),
        ]));

        const instanceRecreated = await instanceRepository.findById(bestuurseenheid, instanceSnapshot.isVersionOf);
        expect(instanceRecreated.id).toEqual(instanceSnapshot.isVersionOf);
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
        const instanceSnapshotGraph = new Iri(INSTANCE_SNAPHOT_LDES_GRAPH('an-integrating-partner'));

        await instanceSnapshotRepository.save(instanceSnapshotGraph, instanceSnapshot);

        await instanceSnapshotProcessingAuthorizationRepository.save(bestuurseenheid, instanceSnapshotGraph);

        await mergerDomainService.merge(instanceSnapshotGraph, instanceSnapshot.id, versionedLdesSnapshotRepository);

        expect(await instanceRepository.exists(bestuurseenheid, instanceSnapshot.isVersionOf)).toBeFalsy();
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
            codeListDomainService,
            instanceSnapshotProcessingAuthorizationRepository,
            bestuurseenheidRepository
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

        await bestuurseenheidRepository.save(bestuurseenheid);

        const isVersionOfInstanceId = buildConceptIri(uuid());
        const instanceSnapshot =
            aMinimalInstanceSnapshot()
                .withCreatedBy(bestuurseenheid.id)
                .withIsVersionOfInstance(isVersionOfInstanceId)
                .withCompetentAuthorities([competentAuthorityWithoutCodeList])
                .withExecutingAuthorities([executingAuthorityWithoutCodeList])
                .build();
        const instanceSnapshotGraph = new Iri(INSTANCE_SNAPHOT_LDES_GRAPH('an-integrating-partner'));

        await instanceSnapshotRepository.save(instanceSnapshotGraph, instanceSnapshot);

        await instanceSnapshotProcessingAuthorizationRepository.save(bestuurseenheid, instanceSnapshotGraph);

        await merger.merge(instanceSnapshotGraph, instanceSnapshot.id, versionedLdesSnapshotRepository);

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
