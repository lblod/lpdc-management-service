import {aBestuurseenheid} from "./bestuurseenheid-test-builder";
import {BestuurseenheidSparqlTestRepository} from "../../driven/persistence/bestuurseenheid-sparql-test-repository";
import {TEST_SPARQL_ENDPOINT} from "../../test.config";
import {aFullInstanceSnapshot} from "./instance-snapshot-test-builder";
import {InstanceSnapshotSparqlTestRepository} from "../../driven/persistence/instance-snapshot-sparql-test-repository";
import {
    InstanceSnapshotToInstanceMapperDomainService
} from "../../../src/core/domain/instance_snapshot_to_instance_mapper_domain_service";
import {InstanceSparqlRepository} from "../../../src/driven/persistence/instance-sparql-repository";
import {InstanceStatusType} from "../../../src/core/domain/types";
import {restoreRealTime, setFixedTime} from "../../fixed-time";
import {FormatPreservingDate} from "../../../src/core/domain/format-preserving-date";
import {ConceptSparqlRepository} from "../../../src/driven/persistence/concept-sparql-repository";
import {aFullConcept} from "./concept-test-builder";

describe('instanceSnapshotToInstanceMapperDomainService', () => {
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

    const bestuurseenheidRepository = new BestuurseenheidSparqlTestRepository(TEST_SPARQL_ENDPOINT);
    const instanceSnapshotRepository = new InstanceSnapshotSparqlTestRepository(TEST_SPARQL_ENDPOINT);
    const instanceRepository = new InstanceSparqlRepository(TEST_SPARQL_ENDPOINT);
    const conceptRepository = new ConceptSparqlRepository(TEST_SPARQL_ENDPOINT);
    const mapper = new InstanceSnapshotToInstanceMapperDomainService(instanceSnapshotRepository, instanceRepository, bestuurseenheidRepository, conceptRepository);

    beforeAll(() => setFixedTime());

    afterAll(() => restoreRealTime());

    test('When no instance exists for instanceSnapshot not linked to concept, then instance is created', async () => {
        const bestuurseenheid = aBestuurseenheid().build();
        await bestuurseenheidRepository.save(bestuurseenheid);

        const instanceSnapshot = aFullInstanceSnapshot().withConceptId(undefined).build();
        await instanceSnapshotRepository.save(bestuurseenheid, instanceSnapshot);

        const instanceExists = await instanceRepository.exits(bestuurseenheid, instanceSnapshot.isVersionOfInstance);
        expect(instanceExists).toEqual(false);

        await mapper.merge(bestuurseenheid.id, instanceSnapshot.id);

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
                //TODO LPDC-910: Fix expect.not.objectContaining to also be defined and correct format
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
    test('When no instance exists for full instanceSnapshot with linked to concept, then instance is created', async () => {
        const bestuurseenheid = aBestuurseenheid().build();
        await bestuurseenheidRepository.save(bestuurseenheid);

        const concept = aFullConcept().build();
        await conceptRepository.save(concept);

        const instanceSnapshot = aFullInstanceSnapshot().withConceptId(concept.id).build();
        await instanceSnapshotRepository.save(bestuurseenheid, instanceSnapshot);

        const instanceExists = await instanceRepository.exits(bestuurseenheid, instanceSnapshot.isVersionOfInstance);
        expect(instanceExists).toEqual(false);

        await mapper.merge(bestuurseenheid.id, instanceSnapshot.id);

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
                //TODO LPDC-910: Fix expect.not.objectContaining to also be defined and correct format
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
        expect(instanceAfterMerge.legalResources).toEqual(instanceSnapshot.legalResources);
    });


});
