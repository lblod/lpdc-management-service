import {aFullInstance} from "./instance-test-builder";
import {PublishedInstanceSnapshotBuilder} from "../../../src/core/domain/published-instance-snapshot";
import {InvariantError} from "../../../src/core/domain/shared/lpdc-error";

describe('constructing', () => {

    test('undefined generatedAtTime throws error', () => {
        expect(() => PublishedInstanceSnapshotBuilder.from(aFullInstance().withDateSent(undefined).build()))
            .toThrowWithMessage(InvariantError, 'generatedAtTime mag niet ontbreken');
    });

});

describe('builder', () => {

    test('from instance, copies all fields and generates new ids', () => {
        const instance = aFullInstance().build();

        const publishedInstanceSnapshot = PublishedInstanceSnapshotBuilder.from(instance);

        expect(publishedInstanceSnapshot.id).not.toEqual(instance.id);
        expect(publishedInstanceSnapshot.generatedAtTime).toEqual(instance.dateSent);
        expect(publishedInstanceSnapshot.isPublishedVersionOf).toEqual(instance.id);
        expect(publishedInstanceSnapshot.createdBy).toEqual(instance.createdBy);
        expect(publishedInstanceSnapshot.title).toEqual(instance.title);
        expect(publishedInstanceSnapshot.description).toEqual(instance.description);
        expect(publishedInstanceSnapshot.additionalDescription).toEqual(instance.additionalDescription);
        expect(publishedInstanceSnapshot.exception).toEqual(instance.exception);
        expect(publishedInstanceSnapshot.regulation).toEqual(instance.regulation);
        expect(publishedInstanceSnapshot.startDate).toEqual(instance.startDate);
        expect(publishedInstanceSnapshot.endDate).toEqual(instance.endDate);
        expect(publishedInstanceSnapshot.type).toEqual(instance.type);
        expect(publishedInstanceSnapshot.targetAudiences).toEqual(instance.targetAudiences);
        expect(publishedInstanceSnapshot.themes).toEqual(instance.themes);
        expect(publishedInstanceSnapshot.competentAuthorityLevels).toEqual(instance.competentAuthorityLevels);
        expect(publishedInstanceSnapshot.competentAuthorities).toEqual(instance.competentAuthorities);
        expect(publishedInstanceSnapshot.executingAuthorityLevels).toEqual(instance.executingAuthorityLevels);
        expect(publishedInstanceSnapshot.executingAuthorities).toEqual(instance.executingAuthorities);
        expect(publishedInstanceSnapshot.executingAuthorityLevels).toEqual(instance.executingAuthorityLevels);
        expect(publishedInstanceSnapshot.publicationMedia).toEqual(instance.publicationMedia);
        expect(publishedInstanceSnapshot.yourEuropeCategories).toEqual(instance.yourEuropeCategories);
        expect(publishedInstanceSnapshot.keywords).toEqual(instance.keywords);
        expect(publishedInstanceSnapshot.requirements).toEqual(expect.arrayContaining([
            expect.objectContaining({
                _id: expect.not.objectContaining(instance.requirements[0].id),
                _uuid: undefined,
                _title: instance.requirements[0].title,
                _description: instance.requirements[0].description,
                _order: instance.requirements[0].order,
                _evidence: expect.objectContaining({
                    _id: expect.not.objectContaining(instance.requirements[0].evidence.id),
                    _uuid: undefined,
                    _title: instance.requirements[0].evidence.title,
                    _description: instance.requirements[0].evidence.description,
                }),
            }),
            expect.objectContaining({
                _id: expect.not.objectContaining(instance.requirements[1].id),
                _uuid: undefined,
                _title: instance.requirements[1].title,
                _description: instance.requirements[1].description,
                _order: instance.requirements[1].order,
                _evidence: expect.objectContaining({
                    _id: expect.not.objectContaining(instance.requirements[1].evidence.id),
                    _uuid: undefined,
                    _title: instance.requirements[1].evidence.title,
                    _description: instance.requirements[1].evidence.description,
                }),
            })]));
        expect(publishedInstanceSnapshot.procedures).toEqual(expect.arrayContaining([
            expect.objectContaining({
                _id: expect.not.objectContaining(instance.procedures[0].id),
                _uuid: undefined,
                _title: instance.procedures[0].title,
                _description: instance.procedures[0].description,
                _order: instance.procedures[0].order,
                _websites: expect.arrayContaining([
                    expect.objectContaining({
                        _id: expect.not.objectContaining(instance.procedures[0].websites[0].id),
                        _uuid: undefined,
                        _title: instance.procedures[0].websites[0].title,
                        _description: instance.procedures[0].websites[0].description,
                        _order: instance.procedures[0].websites[0].order,
                        _url: instance.procedures[0].websites[0].url,
                    }),
                    expect.objectContaining({
                        _id: expect.not.objectContaining(instance.procedures[0].websites[1].id),
                        _uuid: undefined,
                        _title: instance.procedures[0].websites[1].title,
                        _description: instance.procedures[0].websites[1].description,
                        _order: instance.procedures[0].websites[1].order,
                        _url: instance.procedures[0].websites[1].url,
                    })
                ])
            }),
            expect.objectContaining({
                _id: expect.not.objectContaining(instance.procedures[1].id),
                _uuid: undefined,
                _title: instance.procedures[1].title,
                _description: instance.procedures[1].description,
                _order: instance.procedures[1].order,
                _websites: expect.arrayContaining([
                    expect.objectContaining({
                        _id: expect.not.objectContaining(instance.procedures[1].websites[0].id),
                        _uuid: undefined,
                        _title: instance.procedures[1].websites[0].title,
                        _description: instance.procedures[1].websites[0].description,
                        _order: instance.procedures[1].websites[0].order,
                        _url: instance.procedures[1].websites[0].url,
                    }),
                    expect.objectContaining({
                        _id: expect.not.objectContaining(instance.procedures[1].websites[1].id),
                        _uuid: undefined,
                        _title: instance.procedures[1].websites[1].title,
                        _description: instance.procedures[1].websites[1].description,
                        _order: instance.procedures[1].websites[1].order,
                        _url: instance.procedures[1].websites[1].url,
                    })
                ])
            })
        ]));
        expect(publishedInstanceSnapshot.websites)
            .toEqual(expect.arrayContaining([
                expect.objectContaining({
                    _id: expect.not.objectContaining(instance.websites[0].id),
                    _uuid: undefined,
                    _title: instance.websites[0].title,
                    _description: instance.websites[0].description,
                    _order: instance.websites[0].order,
                    _url: instance.websites[0].url,
                }),
                expect.objectContaining({
                    _id: expect.not.objectContaining(instance.websites[1].id),
                    _uuid: undefined,
                    _title: instance.websites[1].title,
                    _description: instance.websites[1].description,
                    _order: instance.websites[1].order,
                    _url: instance.websites[1].url,
                })
            ]));
        expect(publishedInstanceSnapshot.costs)
            .toEqual(expect.arrayContaining([
                expect.objectContaining({
                    _id: expect.not.objectContaining(instance.costs[0].id),
                    _uuid: undefined,
                    _title: instance.costs[0].title,
                    _description: instance.costs[0].description,
                    _order: instance.costs[0].order
                }),
                expect.objectContaining({
                    _id: expect.not.objectContaining(instance.costs[1].id),
                    _uuid: undefined,
                    _title: instance.costs[1].title,
                    _description: instance.costs[1].description,
                    _order: instance.costs[1].order
                })
            ]));
        expect(publishedInstanceSnapshot.financialAdvantages)
            .toEqual(expect.arrayContaining([
                expect.objectContaining({
                    _id: expect.not.objectContaining(instance.financialAdvantages[0].id),
                    _uuid: undefined,
                    _title: instance.financialAdvantages[0].title,
                    _description: instance.financialAdvantages[0].description,
                    _order: instance.financialAdvantages[0].order
                }),
                expect.objectContaining({
                    _id: expect.not.objectContaining(instance.financialAdvantages[1].id),
                    _uuid: undefined,
                    _title: instance.financialAdvantages[1].title,
                    _description: instance.financialAdvantages[1].description,
                    _order: instance.financialAdvantages[1].order
                })
            ]));
        expect(publishedInstanceSnapshot.contactPoints)
            .toEqual(expect.arrayContaining([
                expect.objectContaining({
                    _id: expect.not.objectContaining(instance.contactPoints[0].id),
                    _uuid: undefined,
                    _url: instance.contactPoints[0].url,
                    _email: instance.contactPoints[0].email,
                    _telephone: instance.contactPoints[0].telephone,
                    _openingHours: instance.contactPoints[0].openingHours,
                    _address: expect.objectContaining({
                        _id: expect.not.objectContaining(instance.contactPoints[0].address.id),
                        _uuid: undefined,
                        _gemeentenaam: instance.contactPoints[0].address.gemeentenaam,
                        _land: instance.contactPoints[0].address.land,
                        _huisnummer: instance.contactPoints[0].address.huisnummer,
                        _busnummer: instance.contactPoints[0].address.busnummer,
                        _postcode: instance.contactPoints[0].address.postcode,
                        _straatnaam: instance.contactPoints[0].address.straatnaam,
                        _verwijstNaar: instance.contactPoints[0].address.verwijstNaar,
                    }),
                    _order: instance.contactPoints[0].order
                }),
                expect.objectContaining({
                    _id: expect.not.objectContaining(instance.contactPoints[1].id),
                    _uuid: undefined,
                    _url: instance.contactPoints[1].url,
                    _email: instance.contactPoints[1].email,
                    _telephone: instance.contactPoints[1].telephone,
                    _openingHours: instance.contactPoints[1].openingHours,
                    _address: expect.objectContaining({
                        _id: expect.not.objectContaining(instance.contactPoints[1].address.id),
                        _uuid: undefined,
                        _gemeentenaam: instance.contactPoints[1].address.gemeentenaam,
                        _land: instance.contactPoints[1].address.land,
                        _huisnummer: instance.contactPoints[1].address.huisnummer,
                        _busnummer: instance.contactPoints[1].address.busnummer,
                        _postcode: instance.contactPoints[1].address.postcode,
                        _straatnaam: instance.contactPoints[1].address.straatnaam,
                        _verwijstNaar: instance.contactPoints[1].address.verwijstNaar,
                    }),
                    _order: instance.contactPoints[1].order
                })
            ]));
        expect(publishedInstanceSnapshot.conceptId).toEqual(instance.conceptId);
        expect(publishedInstanceSnapshot.languages).toEqual(instance.languages);
        expect(publishedInstanceSnapshot.dateCreated).toEqual(instance.dateCreated);
        expect(publishedInstanceSnapshot.dateModified).toEqual(instance.dateModified);
        expect(publishedInstanceSnapshot.spatials).toEqual(instance.spatials);
        expect(publishedInstanceSnapshot.legalResources).toEqual(expect.arrayContaining([
            expect.objectContaining({
                _id: expect.not.objectContaining(instance.legalResources[0].id),
                _uuid: undefined,
                _title: instance.legalResources[0].title,
                _description: instance.legalResources[0].description,
                _url: instance.legalResources[0].url,
                _order: 1
            }),
            expect.objectContaining({
                _id: expect.not.objectContaining(instance.legalResources[1].id),
                _uuid: undefined,
                _title: instance.legalResources[1].title,
                _description: instance.legalResources[1].description,
                _url: instance.legalResources[1].url,
                _order: 2
            })]));
    });

});