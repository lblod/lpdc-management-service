import {aFullInstance} from "./instance-test-builder";
import {PublishedInstanceSnapshotBuilder} from "../../../src/core/domain/published-instance-snapshot";
import {InvariantError} from "../../../src/core/domain/shared/lpdc-error";
import {
    CompetentAuthorityLevelType,
    ExecutingAuthorityLevelType,
    LanguageType,
    PublicationMediumType,
    TargetAudienceType,
    ThemeType,
    YourEuropeCategoryType
} from "../../../src/core/domain/types";
import {buildBestuurseenheidIri, buildNutsCodeIri} from "./iri-test-builder";
import {BestuurseenheidTestBuilder} from "./bestuurseenheid-test-builder";
import {LanguageString} from "../../../src/core/domain/language-string";
import {FormatPreservingDate} from "../../../src/core/domain/format-preserving-date";
import {uuid} from "../../../mu-helper";
import {Requirement, RequirementBuilder} from "../../../src/core/domain/requirement";
import {aFullRequirementForInstanceSnapshot, aMinimalRequirementForInstanceSnapshot} from "./requirement-test-builder";
import {Evidence, EvidenceBuilder} from "../../../src/core/domain/evidence";
import {Procedure, ProcedureBuilder} from "../../../src/core/domain/procedure";
import {aMinimalProcedureForInstanceSnapshot} from "./procedure-test-builder";
import {aFullPublishedInstanceSnapshot} from "./published-instance-snapshot-test-builder";
import {Website, WebsiteBuilder} from "../../../src/core/domain/website";
import {aMinimalInformalLanguageString, aMinimalLanguageString} from "./language-string-test-builder";
import {aMinimalWebsiteForInstanceSnapshot, WebsiteTestBuilder} from "./website-test-builder";
import {Cost, CostBuilder} from "../../../src/core/domain/cost";
import {aMinimalCostForInstanceSnapshot, CostTestBuilder} from "./cost-test-builder";
import {FinancialAdvantage, FinancialAdvantageBuilder} from "../../../src/core/domain/financial-advantage";
import {
    aMinimalFinancialAdvantageForInstanceSnapshot,
    FinancialAdvantageTestBuilder
} from "./financial-advantage-test-builder";
import {ContactPoint, ContactPointBuilder} from "../../../src/core/domain/contact-point";
import {aMinimalContactPointForInstanceSnapshot, ContactPointTestBuilder} from "./contact-point-test-builder";
import {Address, AddressBuilder} from "../../../src/core/domain/address";
import {AddressTestBuilder} from "./address-test-builder";
import {LegalResource, LegalResourceBuilder} from "../../../src/core/domain/legal-resource";
import {aFullLegalResourceForInstanceSnapshot, LegalResourceTestBuilder} from "./legal-resource-test-builder";

describe('constructing', () => {

    test('undefined id throws error', () => {
        expect(() => aFullPublishedInstanceSnapshot().withId(undefined).build()).toThrowWithMessage(InvariantError, 'id mag niet ontbreken');
    });

    describe('generatedAtTime', () => {

        test('Undefined generatedAtTime throws error', () => {
            expect(() => aFullPublishedInstanceSnapshot().withGeneratedAtTime(undefined).build()).toThrowWithMessage(InvariantError, 'generatedAtTime mag niet ontbreken');
        });

        test('Blank generatedAtTime throws error', () => {
            expect(() => aFullPublishedInstanceSnapshot().withGeneratedAtTime(FormatPreservingDate.of('')).build()).toThrowWithMessage(InvariantError, 'generatedAtTime mag niet ontbreken');
        });
    });

    test('undefined isPublishedVersionOf throws error', () => {
        expect(() => aFullPublishedInstanceSnapshot().withIsPublishedVersionOf(undefined).build()).toThrowWithMessage(InvariantError, 'isPublishedVersionOf mag niet ontbreken');
    });

    test('undefined createdBy throws error', () => {
        expect(() => aFullPublishedInstanceSnapshot().withCreatedBy(undefined).build()).toThrowWithMessage(InvariantError, 'createdBy mag niet ontbreken');
    });

    test('undefined title throws error', () => {
        expect(() => aFullPublishedInstanceSnapshot().withTitle(undefined).build()).toThrowWithMessage(InvariantError, 'title mag niet ontbreken');
    });

    test('Undefined description throws error', () => {
        expect(() => aFullPublishedInstanceSnapshot().withDescription(undefined).build()).toThrowWithMessage(InvariantError, 'description mag niet ontbreken');
    });

    test('TargetAudience with duplicates throws error', () => {
        expect(() => aFullPublishedInstanceSnapshot().withTargetAudiences([TargetAudienceType.BURGER, TargetAudienceType.BURGER]).build())
            .toThrowWithMessage(InvariantError, 'targetAudiences mag geen duplicaten bevatten');
    });

    test('Themes with duplicates throws error', () => {
        expect(() => aFullPublishedInstanceSnapshot().withThemes([ThemeType.WELZIJNGEZONDHEID, ThemeType.WELZIJNGEZONDHEID]).build())
            .toThrowWithMessage(InvariantError, 'themes mag geen duplicaten bevatten');
    });

    test('CompetentAuthorityLevels with duplicates throws error', () => {
        expect(() => aFullPublishedInstanceSnapshot().withCompetentAuthorityLevels([CompetentAuthorityLevelType.LOKAAL, CompetentAuthorityLevelType.LOKAAL]).build())
            .toThrowWithMessage(InvariantError, 'competentAuthorityLevels mag geen duplicaten bevatten');
    });

    test('CompetentAuthorities with duplicates throws error', () => {
        expect(() => aFullPublishedInstanceSnapshot().withCompetentAuthorities([buildBestuurseenheidIri('abc'), buildBestuurseenheidIri('abc')]).build())
            .toThrowWithMessage(InvariantError, 'competentAuthorities mag geen duplicaten bevatten');
    });

    test('CompetentAuthorities with not at least one value throws error', () => {
        expect(() => aFullPublishedInstanceSnapshot().withCompetentAuthorities([]).build())
            .toThrowWithMessage(InvariantError, 'competentAuthorities moet minstens een waarde bevatten');
    });

    test('ExecutingAuthorityLevels with duplicates throws error', () => {
        expect(() => aFullPublishedInstanceSnapshot().withExecutingAuthorityLevels([ExecutingAuthorityLevelType.LOKAAL, ExecutingAuthorityLevelType.LOKAAL]).build())
            .toThrowWithMessage(InvariantError, 'executingAuthorityLevels mag geen duplicaten bevatten');
    });

    test('ExecutingAuthorities with duplicates throws error', () => {
        expect(() => aFullPublishedInstanceSnapshot().withExecutingAuthorities([BestuurseenheidTestBuilder.PEPINGEN_IRI, BestuurseenheidTestBuilder.PEPINGEN_IRI]).build())
            .toThrowWithMessage(InvariantError, 'executingAuthorities mag geen duplicaten bevatten');
    });

    test('PublicationMedia with duplicates throws error', () => {
        expect(() => aFullPublishedInstanceSnapshot().withPublicationMedia([PublicationMediumType.YOUREUROPE, PublicationMediumType.YOUREUROPE]).build())
            .toThrowWithMessage(InvariantError, 'publicationMedia mag geen duplicaten bevatten');
    });

    test('YourEuropeCategories with duplicates throws error', () => {
        expect(() => aFullPublishedInstanceSnapshot().withYourEuropeCategories([YourEuropeCategoryType.BEDRIJF, YourEuropeCategoryType.BEDRIJF]).build())
            .toThrowWithMessage(InvariantError, 'yourEuropeCategories mag geen duplicaten bevatten');
    });

    test('YourEuropeCategories with not at least one value throws error when publicationMedia includes yourEurope', () => {
        expect(() => aFullPublishedInstanceSnapshot()
            .withPublicationMedia([PublicationMediumType.YOUREUROPE])
            .withYourEuropeCategories([]).build())
            .toThrowWithMessage(InvariantError, 'yourEuropeCategories moet minstens een waarde bevatten');
    });

    test('keywords with duplicates throws error', () => {
        expect(() => aFullPublishedInstanceSnapshot().withKeywords([LanguageString.of('overlijden'), LanguageString.of('overlijden')]).build())
            .toThrowWithMessage(InvariantError, 'keywords mag geen duplicaten bevatten');
    });

    test('keywords with other nl language throws error', () => {
        const publishedInstanceSnapshotTestBuilder = aFullPublishedInstanceSnapshot().withKeywords([LanguageString.of(undefined, 'overlijden'), LanguageString.of(undefined, 'geboorte')]);
        expect(() => publishedInstanceSnapshotTestBuilder.build()).toThrowWithMessage(InvariantError, 'De nl-taal verschilt van nl');
    });

    test('languages with duplicates throws error', () => {
        expect(() => aFullPublishedInstanceSnapshot().withLanguages([LanguageType.ENG, LanguageType.ENG]).build())
            .toThrowWithMessage(InvariantError, 'languages mag geen duplicaten bevatten');
    });

    describe('dateCreated', () => {

        test('Undefined dateCreated throws error', () => {
            expect(() => aFullPublishedInstanceSnapshot().withDateCreated(undefined).build()).toThrowWithMessage(InvariantError, 'dateCreated mag niet ontbreken');
        });

        test('Blank dateCreated throws error', () => {
            expect(() => aFullPublishedInstanceSnapshot().withDateCreated(FormatPreservingDate.of('')).build()).toThrowWithMessage(InvariantError, 'dateCreated mag niet ontbreken');
        });

    });

    describe('dateModified', () => {

        test('Undefined dateModified throws error', () => {
            expect(() => aFullPublishedInstanceSnapshot().withDateModified(undefined).build()).toThrowWithMessage(InvariantError, 'dateModified mag niet ontbreken');
        });

        test('Blank dateModified throws error', () => {
            expect(() => aFullPublishedInstanceSnapshot().withDateModified(FormatPreservingDate.of('')).build()).toThrowWithMessage(InvariantError, 'dateModified mag niet ontbreken');
        });

    });

    test('Spatials with duplicates throws error', () => {
        expect(() => aFullPublishedInstanceSnapshot().withSpatials([buildNutsCodeIri(1), buildNutsCodeIri(1)]).build())
            .toThrowWithMessage(InvariantError, 'spatials mag geen duplicaten bevatten');
    });

    describe('requirement', () => {

        test('valid requirement does not throw error', () => {
            const uuidValue = uuid();
            const validRequirement = Requirement.reconstitute(
                RequirementBuilder.buildIri(uuidValue),
                undefined,
                LanguageString.of(undefined, undefined, 'title'),
                LanguageString.of(undefined, undefined, 'omschrijving'),
                1,
                undefined
            );

            expect(() => aFullPublishedInstanceSnapshot().withRequirements([validRequirement]).build()).not.toThrow();
        });

        test('invalid requirement does throw error', () => {
            const invalidRequirement = Requirement.reconstitute(
                RequirementBuilder.buildIri(uuid()),
                undefined,
                undefined,
                undefined,
                1,
                undefined
            );

            expect(() => aFullPublishedInstanceSnapshot().withRequirements([invalidRequirement]).build()).toThrow();
        });

        test('requirements that dont have unique order throws error', () => {
            const requirement1 =
                aMinimalRequirementForInstanceSnapshot().withOrder(1).build();
            const requirement2 =
                aMinimalRequirementForInstanceSnapshot().withOrder(1).build();

            expect(() => aFullPublishedInstanceSnapshot().withRequirements([requirement1, requirement2]).build()).toThrowWithMessage(InvariantError, 'requirements > order mag geen duplicaten bevatten');
        });

        test('requirements that have unique order does not throw error', () => {
            const requirement1 =
                aMinimalRequirementForInstanceSnapshot().withOrder(1).build();
            const requirement2 =
                aMinimalRequirementForInstanceSnapshot().withOrder(2).build();

            expect(() => aFullPublishedInstanceSnapshot().withRequirements([requirement1, requirement2]).build()).not.toThrow();
        });

        describe('evidence ', () => {

            test('valid evidence does not throw error', () => {
                const uuidValue = uuid();
                const validEvidence = Evidence.reconstitute(
                    EvidenceBuilder.buildIri(uuidValue),
                    undefined,
                    LanguageString.of(undefined, undefined, 'title'),
                    LanguageString.of(undefined, undefined, 'omschrijving')
                );
                const validRequirement = aFullRequirementForInstanceSnapshot().withEvidence(validEvidence).build();

                expect(() => aFullPublishedInstanceSnapshot().withRequirements([validRequirement]).build()).not.toThrow();
            });

            test('invalid evidence does throw error', () => {
                const uuidValue = uuid();
                const invalidEvidence = Evidence.reconstitute(
                    EvidenceBuilder.buildIri(uuidValue),
                    undefined,
                    undefined,
                    undefined
                );
                const invalidRequirement = aFullRequirementForInstanceSnapshot().withEvidence(invalidEvidence).build();

                expect(() => aFullPublishedInstanceSnapshot().withRequirements([invalidRequirement]).build()).toThrow();
            });

        });
    });

    describe('procedure', () => {

        test('valid procedure does not throw error', () => {
            const uuidValue = uuid();
            const validProcedure = Procedure.reconstitute(
                ProcedureBuilder.buildIri(uuidValue),
                undefined,
                LanguageString.of(undefined, undefined, 'title'),
                LanguageString.of(undefined, undefined, 'omschrijving'),
                1,
                []
            );

            expect(() => aFullPublishedInstanceSnapshot().withProcedures([validProcedure]).build()).not.toThrow();
        });

        test('invalid procedure does throw error', () => {
            const invalidProcedure = Procedure.reconstitute(
                RequirementBuilder.buildIri(uuid()),
                undefined,
                undefined,
                undefined,
                1,
                []
            );

            expect(() => aFullPublishedInstanceSnapshot().withProcedures([invalidProcedure]).build()).toThrow();
        });

        test('procedures that dont have unique order throws error', () => {
            const procedure1 =
                aMinimalProcedureForInstanceSnapshot().withOrder(1).build();
            const procedure2 =
                aMinimalProcedureForInstanceSnapshot().withOrder(1).build();

            expect(() => aFullPublishedInstanceSnapshot().withProcedures([procedure1, procedure2]).build()).toThrowWithMessage(InvariantError, 'procedures > order mag geen duplicaten bevatten');
        });

        test('procedures that have unique order does not throw error', () => {
            const procedure1 =
                aMinimalProcedureForInstanceSnapshot().withOrder(1).build();
            const procedure2 =
                aMinimalProcedureForInstanceSnapshot().withOrder(2).build();

            expect(() => aFullPublishedInstanceSnapshot().withProcedures([procedure1, procedure2]).build()).not.toThrow();
        });

        describe('evidence ', () => {

            test('valid evidence does not throw error', () => {
                const uuidValue = uuid();
                const validEvidence = Evidence.reconstitute(
                    EvidenceBuilder.buildIri(uuidValue),
                    undefined,
                    LanguageString.of(undefined, undefined, 'title'),
                    LanguageString.of(undefined, undefined, 'omschrijving')
                );
                const validRequirement = aFullRequirementForInstanceSnapshot().withEvidence(validEvidence).build();

                expect(() => aFullPublishedInstanceSnapshot().withRequirements([validRequirement]).build()).not.toThrow();
            });

            test('invalid evidence does throw error', () => {
                const uuidValue = uuid();
                const invalidEvidence = Evidence.reconstitute(
                    EvidenceBuilder.buildIri(uuidValue),
                    undefined,
                    undefined,
                    undefined
                );
                const invalidRequirement = aFullRequirementForInstanceSnapshot().withEvidence(invalidEvidence).build();

                expect(() => aFullPublishedInstanceSnapshot().withRequirements([invalidRequirement]).build()).toThrow();
            });

        });
    });

    describe('website ', () => {

        test('valid website does not throw error', () => {
            const uuidValue = uuid();
            const validWebsite = Website.reconstitute(
                WebsiteBuilder.buildIri(uuidValue),
                undefined,
                aMinimalInformalLanguageString(WebsiteTestBuilder.TITLE).build(),
                aMinimalInformalLanguageString(WebsiteTestBuilder.DESCRIPTION).build(),
                1,
                WebsiteTestBuilder.URL
            );

            expect(() => aFullPublishedInstanceSnapshot().withWebsites([validWebsite]).build()).not.toThrow();
        });

        test('invalid website does throw error', () => {
            const invalidWebsite = Website.reconstitute(WebsiteBuilder.buildIri(uuid()), undefined, undefined, undefined, 1, undefined);

            expect(() => aFullPublishedInstanceSnapshot().withWebsites([invalidWebsite]).build()).toThrow();
        });

        test('websites that dont have unique order throws error', () => {
            const website1 =
                aMinimalWebsiteForInstanceSnapshot().withOrder(1).build();
            const website2 =
                aMinimalWebsiteForInstanceSnapshot().withOrder(1).build();

            expect(() => aFullPublishedInstanceSnapshot().withWebsites([website1, website2]).build()).toThrowWithMessage(InvariantError, 'websites > order mag geen duplicaten bevatten');
        });

        test('websites that have unique order does not throw error', () => {
            const website1 =
                aMinimalWebsiteForInstanceSnapshot().withOrder(1).build();
            const website2 =
                aMinimalWebsiteForInstanceSnapshot().withOrder(2).build();


            expect(() => aFullPublishedInstanceSnapshot().withWebsites([website1, website2]).build()).not.toThrow();
        });

    });

    describe('cost ', () => {

        test('valid cost does not throw error', () => {
            const uuidValue = uuid();
            const validCost = Cost.reconstitute(
                CostBuilder.buildIri(uuidValue),
                undefined,
                aMinimalInformalLanguageString(CostTestBuilder.TITLE).build(),
                aMinimalInformalLanguageString(CostTestBuilder.DESCRIPTION).build(),
                1
            );

            expect(() => aFullPublishedInstanceSnapshot().withCosts([validCost]).build()).not.toThrow();
        });

        test('invalid cost does throw error', () => {
            const invalidCost = Cost.reconstitute(CostBuilder.buildIri(uuid()), undefined, undefined, undefined, 1);

            expect(() => aFullPublishedInstanceSnapshot().withCosts([invalidCost]).build()).toThrow();
        });

        test('costs that dont have unique order throws error', () => {
            const cost1 =
                aMinimalCostForInstanceSnapshot().withOrder(1).build();
            const cost2 =
                aMinimalCostForInstanceSnapshot().withOrder(1).build();

            expect(() => aFullPublishedInstanceSnapshot().withCosts([cost1, cost2]).build()).toThrowWithMessage(InvariantError, 'costs > order mag geen duplicaten bevatten');
        });

        test('costs that have unique order does not throw error', () => {
            const cost1 =
                aMinimalCostForInstanceSnapshot().withOrder(1).build();
            const cost2 =
                aMinimalCostForInstanceSnapshot().withOrder(2).build();

            expect(() => aFullPublishedInstanceSnapshot().withCosts([cost1, cost2]).build()).not.toThrow();
        });

    });

    describe('financialAdvantage ', () => {

        test('valid financialAdvantage does not throw error', () => {
            const uuidValue = uuid();
            const validFinancialAdvantage = FinancialAdvantage.reconstitute(
                FinancialAdvantageBuilder.buildIri(uuidValue),
                undefined,
                aMinimalInformalLanguageString(FinancialAdvantageTestBuilder.TITLE).build(),
                aMinimalInformalLanguageString(FinancialAdvantageTestBuilder.DESCRIPTION).build(),
                1
            );

            expect(() => aFullPublishedInstanceSnapshot().withFinancialAdvantages([validFinancialAdvantage]).build()).not.toThrow();
        });

        test('invalid financialAdvantage does throw error', () => {
            const invalidFinancialAdvantage = FinancialAdvantage.reconstitute(FinancialAdvantageBuilder.buildIri(uuid()), undefined, undefined, undefined, 1);

            expect(() => aFullPublishedInstanceSnapshot().withFinancialAdvantages([invalidFinancialAdvantage]).build()).toThrow();
        });

        test('financial advantages that dont have unique order throws error', () => {
            const financialAdvantage1 =
                aMinimalFinancialAdvantageForInstanceSnapshot().withOrder(1).build();
            const financialAdvantage2 =
                aMinimalFinancialAdvantageForInstanceSnapshot().withOrder(1).build();

            expect(() => aFullPublishedInstanceSnapshot().withFinancialAdvantages([financialAdvantage1, financialAdvantage2]).build())
                .toThrowWithMessage(InvariantError, 'financial advantages > order mag geen duplicaten bevatten');
        });

        test('financial advantages that have unique order does not throw error', () => {
            const financialAdvantage1 =
                aMinimalFinancialAdvantageForInstanceSnapshot().withOrder(1).build();
            const financialAdvantage2 =
                aMinimalFinancialAdvantageForInstanceSnapshot().withOrder(2).build();

            expect(() => aFullPublishedInstanceSnapshot().withFinancialAdvantages([financialAdvantage1, financialAdvantage2]).build()).not.toThrow();
        });
    });

    describe('contact points ', () => {

        test('valid contact point does not throw error', () => {
            const uuidValue = uuid();
            const validContactPoint = ContactPoint.reconstitute(ContactPointBuilder.buildIri(uuidValue), uuidValue, ContactPointTestBuilder.URL, ContactPointTestBuilder.EMAIL, ContactPointTestBuilder.TELEPHONE, ContactPointTestBuilder.OPENING_HOURS, 1, undefined);

            expect(() => aFullPublishedInstanceSnapshot().withContactPoints([validContactPoint]).build()).not.toThrow();
        });

        test('invalid contact point does throw error', () => {
            expect(() => aFullPublishedInstanceSnapshot().withContactPoints([
                ContactPoint.reconstitute(undefined, undefined, undefined, undefined, undefined, undefined, 1, undefined)]).build()).toThrow();
        });

        test('contact points that dont have unique order throws error', () => {
            const contactPoint1 =
                aMinimalContactPointForInstanceSnapshot().withOrder(1).build();
            const contactPoint2 =
                aMinimalContactPointForInstanceSnapshot().withOrder(1).build();

            expect(() => aFullPublishedInstanceSnapshot().withContactPoints([contactPoint1, contactPoint2]).build()).toThrowWithMessage(InvariantError, 'contact points > order mag geen duplicaten bevatten');
        });

        test('contact points that have unique order does not throw error', () => {
            const contactPoint1 =
                aMinimalContactPointForInstanceSnapshot().withOrder(1).build();
            const contactPoint2 =
                aMinimalContactPointForInstanceSnapshot().withOrder(2).build();

            expect(() => aFullPublishedInstanceSnapshot().withContactPoints([contactPoint1, contactPoint2]).build()).not.toThrow();
        });

        describe('address', () => {

            test('valid contact point with valid address does not throw error', () => {
                const uuidValue = uuid();
                const validContactPoint =
                    ContactPoint.reconstitute(ContactPointBuilder.buildIri(uuidValue), uuidValue, ContactPointTestBuilder.URL, ContactPointTestBuilder.EMAIL, ContactPointTestBuilder.TELEPHONE, ContactPointTestBuilder.OPENING_HOURS, 1,
                        Address.reconstitute(
                            AddressBuilder.buildIri(uuid()), uuid(),
                            aMinimalLanguageString(AddressTestBuilder.GEMEENTENAAM).build(),
                            aMinimalLanguageString(AddressTestBuilder.LAND).build(),
                            AddressTestBuilder.HUISNUMMER,
                            AddressTestBuilder.BUSNUMMER,
                            AddressTestBuilder.POSTCODE,
                            aMinimalLanguageString(AddressTestBuilder.STRAATNAAM).build(),
                            AddressTestBuilder.VERWIJST_NAAR));

                expect(() => aFullPublishedInstanceSnapshot().withContactPoints([validContactPoint]).build()).not.toThrow();
            });

            test('valid contact point with invalid address does throw error', () => {
                const uuidValue = uuid();
                expect(() => aFullPublishedInstanceSnapshot()
                    .withContactPoints([
                        ContactPoint.reconstitute(ContactPointBuilder.buildIri(uuidValue), uuidValue, ContactPointTestBuilder.URL, ContactPointTestBuilder.EMAIL, ContactPointTestBuilder.TELEPHONE, ContactPointTestBuilder.OPENING_HOURS, 1,
                            Address.reconstitute(
                                undefined,
                                undefined,
                                undefined,
                                undefined,
                                undefined,
                                undefined,
                                undefined,
                                undefined,
                                undefined))]).build()).toThrow();
            });

        });

    });

    describe('legalResources', () => {

        test('valid legalResource does not throw error', () => {
            const uuidValue = uuid();
            const validLegalResource = LegalResource.reconstitute(
                LegalResourceBuilder.buildIri(uuidValue),
                undefined,
                undefined,
                undefined,
                LegalResourceTestBuilder.URL,
                1
            );
            expect(() => aFullPublishedInstanceSnapshot().withLegalResources([validLegalResource]).build()).not.toThrow();
        });

        test('invalid legalResource does throw error', () => {
            expect(() => aFullPublishedInstanceSnapshot().withLegalResources([LegalResource.reconstitute(
                LegalResourceBuilder.buildIri(uuid()),
                undefined,
                undefined,
                undefined,
                undefined,
                0
            )]).build()).toThrow();
        });

        test('legalResources that dont have unique order throws error', () => {
            const legalResource1 =
                aFullLegalResourceForInstanceSnapshot().withOrder(1).build();
            const legalResource2 =
                aFullLegalResourceForInstanceSnapshot().withOrder(1).build();

            expect(() => aFullPublishedInstanceSnapshot().withLegalResources([legalResource1, legalResource2]).build()).toThrowWithMessage(InvariantError, 'legal resources > order mag geen duplicaten bevatten');
        });

        test('legalResource that have unique order does not throw error', () => {
            const legalResource1 =
                aFullLegalResourceForInstanceSnapshot().withOrder(1).build();
            const legalResource2 =
                aFullLegalResourceForInstanceSnapshot().withOrder(2).build();

            expect(() => aFullPublishedInstanceSnapshot().withLegalResources([legalResource1, legalResource2]).build()).not.toThrow();
        });
    });
});

describe('builder', () => {

    test('from instance without sent date throws error', () => {
        expect(() => PublishedInstanceSnapshotBuilder.from(aFullInstance().withDateSent(undefined).build()))
            .toThrowWithMessage(InvariantError, 'generatedAtTime mag niet ontbreken');
    });

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
