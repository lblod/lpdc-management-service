import {restoreRealTime, setFixedTime} from "../../fixed-time";
import {aFullInstanceSnapshot, aMinimalInstanceSnapshot} from "./instance-snapshot-test-builder";
import {
    CompetentAuthorityLevelType,
    ExecutingAuthorityLevelType,
    LanguageType,
    PublicationMediumType,
    TargetAudienceType,
    ThemeType,
    YourEuropeCategoryType
} from "../../../src/core/domain/types";
import {BestuurseenheidTestBuilder} from "./bestuurseenheid-test-builder";
import {LanguageString} from "../../../src/core/domain/language-string";
import {FormatPreservingDate} from "../../../src/core/domain/format-preserving-date";
import {uuid} from "../../../mu-helper";
import {Requirement, RequirementBuilder} from "../../../src/core/domain/requirement";
import {aFullRequirementForInstanceSnapshot, aMinimalRequirementForInstanceSnapshot} from "./requirement-test-builder";
import {Evidence, EvidenceBuilder} from "../../../src/core/domain/evidence";
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
import {Language} from "../../../src/core/domain/language";
import {aMinimalProcedureForInstanceSnapshot} from "./procedure-test-builder";
import {Procedure, ProcedureBuilder} from "../../../src/core/domain/procedure";
import {LegalResource, LegalResourceBuilder} from "../../../src/core/domain/legal-resource";
import {
    aFullLegalResourceForInstanceSnapshot,
    aMinimalLegalResourceForInstanceSnapshot,
    LegalResourceTestBuilder
} from "./legal-resource-test-builder";
import {InvariantError} from "../../../src/core/domain/shared/lpdc-error";
import {buildBestuurseenheidIri, buildNutsCodeIri} from "./iri-test-builder";

beforeAll(() => setFixedTime());
afterAll(() => restoreRealTime());


describe('constructing', () => {

    test('undefined id throws error', () => {
        expect(() => aFullInstanceSnapshot().withId(undefined).build()).toThrowWithMessage(InvariantError, 'id mag niet ontbreken');
    });

    test('Undefined createdBy throws error', () => {
        expect(() => aFullInstanceSnapshot().withCreatedBy(undefined).build()).toThrowWithMessage(InvariantError, 'createdBy mag niet ontbreken');
    });

    test('Undefined title throws error', () => {
        expect(() => aFullInstanceSnapshot().withTitle(undefined).build()).toThrowWithMessage(InvariantError, 'title mag niet ontbreken');
    });

    test('Undefined description throws error', () => {
        expect(() => aFullInstanceSnapshot().withDescription(undefined).build()).toThrowWithMessage(InvariantError, 'description mag niet ontbreken');
    });

    test('TargetAudience with duplicates throws error', () => {
        expect(() => aFullInstanceSnapshot().withTargetAudiences([TargetAudienceType.BURGER, TargetAudienceType.BURGER]).build())
            .toThrowWithMessage(InvariantError, 'targetAudiences mag geen duplicaten bevatten');
    });

    test('Themes with duplicates throws error', () => {
        expect(() => aFullInstanceSnapshot().withThemes([ThemeType.WELZIJNGEZONDHEID, ThemeType.WELZIJNGEZONDHEID]).build())
            .toThrowWithMessage(InvariantError, 'themes mag geen duplicaten bevatten');
    });

    test('CompetentAuthorityLevels with duplicates throws error', () => {
        expect(() => aFullInstanceSnapshot().withCompetentAuthorityLevels([CompetentAuthorityLevelType.LOKAAL, CompetentAuthorityLevelType.LOKAAL]).build())
            .toThrowWithMessage(InvariantError, 'competentAuthorityLevels mag geen duplicaten bevatten');
    });

    test('CompetentAuthorities with duplicates throws error', () => {
        expect(() => aFullInstanceSnapshot().withCompetentAuthorities([buildBestuurseenheidIri('abc'), buildBestuurseenheidIri('abc')]).build())
            .toThrowWithMessage(InvariantError, 'competentAuthorities mag geen duplicaten bevatten');
    });

    test('CompetentAuthorities with not at least one value throws error', () => {
        expect(() => aFullInstanceSnapshot().withCompetentAuthorities([]).build())
            .toThrowWithMessage(InvariantError, 'competentAuthorities moet minstens een waarde bevatten');
    });

    test('ExecutingAuthorityLevels with duplicates throws error', () => {
        expect(() => aFullInstanceSnapshot().withExecutingAuthorityLevels([ExecutingAuthorityLevelType.LOKAAL, ExecutingAuthorityLevelType.LOKAAL]).build())
            .toThrowWithMessage(InvariantError, 'executingAuthorityLevels mag geen duplicaten bevatten');
    });

    test('ExecutingAuthorities with duplicates throws error', () => {
        expect(() => aFullInstanceSnapshot().withExecutingAuthorities([BestuurseenheidTestBuilder.PEPINGEN_IRI, BestuurseenheidTestBuilder.PEPINGEN_IRI]).build())
            .toThrowWithMessage(InvariantError, 'executingAuthorities mag geen duplicaten bevatten');
    });

    test('PublicationMedia with duplicates throws error', () => {
        expect(() => aFullInstanceSnapshot().withPublicationMedia([PublicationMediumType.YOUREUROPE, PublicationMediumType.YOUREUROPE]).build())
            .toThrowWithMessage(InvariantError, 'publicationMedia mag geen duplicaten bevatten');
    });

    test('YourEuropeCategories with duplicates throws error', () => {
        expect(() => aFullInstanceSnapshot().withYourEuropeCategories([YourEuropeCategoryType.BEDRIJF, YourEuropeCategoryType.BEDRIJF]).build())
            .toThrowWithMessage(InvariantError, 'yourEuropeCategories mag geen duplicaten bevatten');
    });

    test('YourEuropeCategories with not at least one value throws error when publicationMedia includes yourEurope', () => {
        expect(() => aFullInstanceSnapshot()
            .withPublicationMedia([PublicationMediumType.YOUREUROPE])
            .withYourEuropeCategories([]).build())
            .toThrowWithMessage(InvariantError, 'yourEuropeCategories moet minstens een waarde bevatten');
    });

    test('keywords with duplicates throws error', () => {
        expect(() => aFullInstanceSnapshot().withKeywords([LanguageString.of('overlijden'), LanguageString.of('overlijden')]).build())
            .toThrowWithMessage(InvariantError, 'keywords mag geen duplicaten bevatten');
    });

    test('keywords with other nl language throws error', () => {
        const instanceSnapshotTestBuilder = aFullInstanceSnapshot().withKeywords([LanguageString.of(undefined, 'overlijden'), LanguageString.of(undefined, 'geboorte')]);
        expect(() => instanceSnapshotTestBuilder.build()).toThrowWithMessage(InvariantError, 'De nl-taal verschilt van nl');
    });

    test('languages with duplicates throws error', () => {
        expect(() => aFullInstanceSnapshot().withLanguages([LanguageType.ENG, LanguageType.ENG]).build())
            .toThrowWithMessage(InvariantError, 'languages mag geen duplicaten bevatten');
    });

    test('Undefined isVersionOf throws error', () => {
        expect(() => aFullInstanceSnapshot().withIsVersionOfInstance(undefined).build()).toThrowWithMessage(InvariantError, 'isVersionOf mag niet ontbreken');
    });

    describe('dateCreated', () => {

        test('Undefined dateCreated throws error', () => {
            expect(() => aFullInstanceSnapshot().withDateCreated(undefined).build()).toThrowWithMessage(InvariantError, 'dateCreated mag niet ontbreken');
        });

        test('Blank dateCreated throws error', () => {
            expect(() => aFullInstanceSnapshot().withDateCreated(FormatPreservingDate.of('')).build()).toThrowWithMessage(InvariantError, 'dateCreated mag niet ontbreken');
        });

    });

    describe('dateModified', () => {

        test('Undefined dateModified throws error', () => {
            expect(() => aFullInstanceSnapshot().withDateModified(undefined).build()).toThrowWithMessage(InvariantError, 'dateModified mag niet ontbreken');
        });

        test('Blank dateModified throws error', () => {
            expect(() => aFullInstanceSnapshot().withDateModified(FormatPreservingDate.of('')).build()).toThrowWithMessage(InvariantError, 'dateModified mag niet ontbreken');
        });

    });

    describe('generatedAtTime', () => {

        test('Undefined generatedAtTime throws error', () => {
            expect(() => aFullInstanceSnapshot().withGeneratedAtTime(undefined).build()).toThrowWithMessage(InvariantError, 'generatedAtTime mag niet ontbreken');
        });

        test('Blank generatedAtTime throws error', () => {
            expect(() => aFullInstanceSnapshot().withGeneratedAtTime(FormatPreservingDate.of('')).build()).toThrowWithMessage(InvariantError, 'generatedAtTime mag niet ontbreken');
        });

    });

    test('Undefined isArchived throws error', () => {
        expect(() => aFullInstanceSnapshot().withIsArchived(undefined).build()).toThrowWithMessage(InvariantError, 'isArchived mag niet ontbreken');
    });

    test('Spatials with duplicates throws error', () => {
        expect(() => aFullInstanceSnapshot().withSpatials([buildNutsCodeIri(1), buildNutsCodeIri(1)]).build())
            .toThrowWithMessage(InvariantError, 'spatials mag geen duplicaten bevatten');
    });

    test('Spatials with not at least one value throws error', () => {
        expect(() => aFullInstanceSnapshot().withSpatials([]).build())
            .toThrowWithMessage(InvariantError, 'spatials moet minstens een waarde bevatten');
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

            expect(() => aFullInstanceSnapshot().withRequirements([validRequirement]).build()).not.toThrow();
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

            expect(() => aFullInstanceSnapshot().withRequirements([invalidRequirement]).build()).toThrow();
        });

        test('requirements that dont have unique order throws error', () => {
            const requirement1 =
                aMinimalRequirementForInstanceSnapshot().withOrder(1).build();
            const requirement2 =
                aMinimalRequirementForInstanceSnapshot().withOrder(1).build();

            expect(() => aFullInstanceSnapshot().withRequirements([requirement1, requirement2]).build()).toThrowWithMessage(InvariantError, 'requirements > order mag geen duplicaten bevatten');
        });

        test('requirements that have unique order does not throw error', () => {
            const requirement1 =
                aMinimalRequirementForInstanceSnapshot().withOrder(1).build();
            const requirement2 =
                aMinimalRequirementForInstanceSnapshot().withOrder(2).build();

            expect(() => aFullInstanceSnapshot().withRequirements([requirement1, requirement2]).build()).not.toThrow();
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

                expect(() => aFullInstanceSnapshot().withRequirements([validRequirement]).build()).not.toThrow();
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

                expect(() => aFullInstanceSnapshot().withRequirements([invalidRequirement]).build()).toThrow();
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

            expect(() => aFullInstanceSnapshot().withProcedures([validProcedure]).build()).not.toThrow();
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

            expect(() => aFullInstanceSnapshot().withProcedures([invalidProcedure]).build()).toThrow();
        });

        test('procedures that dont have unique order throws error', () => {
            const procedure1 =
                aMinimalProcedureForInstanceSnapshot().withOrder(1).build();
            const procedure2 =
                aMinimalProcedureForInstanceSnapshot().withOrder(1).build();

            expect(() => aFullInstanceSnapshot().withProcedures([procedure1, procedure2]).build()).toThrowWithMessage(InvariantError, 'procedures > order mag geen duplicaten bevatten');
        });

        test('procedures that have unique order does not throw error', () => {
            const procedure1 =
                aMinimalProcedureForInstanceSnapshot().withOrder(1).build();
            const procedure2 =
                aMinimalProcedureForInstanceSnapshot().withOrder(2).build();

            expect(() => aFullInstanceSnapshot().withProcedures([procedure1, procedure2]).build()).not.toThrow();
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

                expect(() => aFullInstanceSnapshot().withRequirements([validRequirement]).build()).not.toThrow();
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

                expect(() => aFullInstanceSnapshot().withRequirements([invalidRequirement]).build()).toThrow();
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

            expect(() => aFullInstanceSnapshot().withWebsites([validWebsite]).build()).not.toThrow();
        });

        test('invalid website does throw error', () => {
            const invalidWebsite = Website.reconstitute(WebsiteBuilder.buildIri(uuid()), undefined, undefined, undefined, 1, undefined);

            expect(() => aFullInstanceSnapshot().withWebsites([invalidWebsite]).build()).toThrow();
        });

        test('websites that dont have unique order throws error', () => {
            const website1 =
                aMinimalWebsiteForInstanceSnapshot().withOrder(1).build();
            const website2 =
                aMinimalWebsiteForInstanceSnapshot().withOrder(1).build();

            expect(() => aFullInstanceSnapshot().withWebsites([website1, website2]).build()).toThrowWithMessage(InvariantError, 'websites > order mag geen duplicaten bevatten');
        });

        test('websites that have unique order does not throw error', () => {
            const website1 =
                aMinimalWebsiteForInstanceSnapshot().withOrder(1).build();
            const website2 =
                aMinimalWebsiteForInstanceSnapshot().withOrder(2).build();


            expect(() => aFullInstanceSnapshot().withWebsites([website1, website2]).build()).not.toThrow();
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

            expect(() => aFullInstanceSnapshot().withCosts([validCost]).build()).not.toThrow();
        });

        test('invalid cost does throw error', () => {
            const invalidCost = Cost.reconstitute(CostBuilder.buildIri(uuid()), undefined, undefined, undefined, 1);

            expect(() => aFullInstanceSnapshot().withCosts([invalidCost]).build()).toThrow();
        });

        test('costs that dont have unique order throws error', () => {
            const cost1 =
                aMinimalCostForInstanceSnapshot().withOrder(1).build();
            const cost2 =
                aMinimalCostForInstanceSnapshot().withOrder(1).build();

            expect(() => aFullInstanceSnapshot().withCosts([cost1, cost2]).build()).toThrowWithMessage(InvariantError, 'costs > order mag geen duplicaten bevatten');
        });

        test('costs that have unique order does not throw error', () => {
            const cost1 =
                aMinimalCostForInstanceSnapshot().withOrder(1).build();
            const cost2 =
                aMinimalCostForInstanceSnapshot().withOrder(2).build();

            expect(() => aFullInstanceSnapshot().withCosts([cost1, cost2]).build()).not.toThrow();
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

            expect(() => aFullInstanceSnapshot().withFinancialAdvantages([validFinancialAdvantage]).build()).not.toThrow();
        });

        test('invalid financialAdvantage does throw error', () => {
            const invalidFinancialAdvantage = FinancialAdvantage.reconstitute(FinancialAdvantageBuilder.buildIri(uuid()), undefined, undefined, undefined, 1);

            expect(() => aFullInstanceSnapshot().withFinancialAdvantages([invalidFinancialAdvantage]).build()).toThrow();
        });

        test('financial advantages that dont have unique order throws error', () => {
            const financialAdvantage1 =
                aMinimalFinancialAdvantageForInstanceSnapshot().withOrder(1).build();
            const financialAdvantage2 =
                aMinimalFinancialAdvantageForInstanceSnapshot().withOrder(1).build();

            expect(() => aFullInstanceSnapshot().withFinancialAdvantages([financialAdvantage1, financialAdvantage2]).build())
                .toThrowWithMessage(InvariantError, 'financial advantages > order mag geen duplicaten bevatten');
        });

        test('financial advantages that have unique order does not throw error', () => {
            const financialAdvantage1 =
                aMinimalFinancialAdvantageForInstanceSnapshot().withOrder(1).build();
            const financialAdvantage2 =
                aMinimalFinancialAdvantageForInstanceSnapshot().withOrder(2).build();

            expect(() => aFullInstanceSnapshot().withFinancialAdvantages([financialAdvantage1, financialAdvantage2]).build()).not.toThrow();
        });
    });

    describe('contact points ', () => {

        test('valid contact point does not throw error', () => {
            const uuidValue = uuid();
            const validContactPoint = ContactPoint.reconstitute(ContactPointBuilder.buildIri(uuidValue), uuidValue, ContactPointTestBuilder.URL, ContactPointTestBuilder.EMAIL, ContactPointTestBuilder.TELEPHONE, ContactPointTestBuilder.OPENING_HOURS, 1, undefined);

            expect(() => aFullInstanceSnapshot().withContactPoints([validContactPoint]).build()).not.toThrow();
        });

        test('invalid contact point does throw error', () => {
            expect(() => aFullInstanceSnapshot().withContactPoints([
                ContactPoint.reconstitute(undefined, undefined, undefined, undefined, undefined, undefined, 1, undefined)]).build()).toThrow();
        });

        test('contact points that dont have unique order throws error', () => {
            const contactPoint1 =
                aMinimalContactPointForInstanceSnapshot().withOrder(1).build();
            const contactPoint2 =
                aMinimalContactPointForInstanceSnapshot().withOrder(1).build();

            expect(() => aFullInstanceSnapshot().withContactPoints([contactPoint1, contactPoint2]).build()).toThrowWithMessage(InvariantError, 'contact points > order mag geen duplicaten bevatten');
        });

        test('contact points that have unique order does not throw error', () => {
            const contactPoint1 =
                aMinimalContactPointForInstanceSnapshot().withOrder(1).build();
            const contactPoint2 =
                aMinimalContactPointForInstanceSnapshot().withOrder(2).build();

            expect(() => aFullInstanceSnapshot().withContactPoints([contactPoint1, contactPoint2]).build()).not.toThrow();
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

                expect(() => aFullInstanceSnapshot().withContactPoints([validContactPoint]).build()).not.toThrow();
            });

            test('valid contact point with invalid address does throw error', () => {
                const uuidValue = uuid();
                expect(() => aFullInstanceSnapshot()
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
            expect(() => aFullInstanceSnapshot().withLegalResources([validLegalResource]).build()).not.toThrow();
        });

        test('invalid legalResource does throw error', () => {
            expect(() => aFullInstanceSnapshot().withLegalResources([LegalResource.reconstitute(
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

            expect(() => aFullInstanceSnapshot().withLegalResources([legalResource1, legalResource2]).build()).toThrowWithMessage(InvariantError, 'legal resources > order mag geen duplicaten bevatten');
        });

        test('legalResource that have unique order does not throw error', () => {
            const legalResource1 =
                aFullLegalResourceForInstanceSnapshot().withOrder(1).build();
            const legalResource2 =
                aFullLegalResourceForInstanceSnapshot().withOrder(2).build();

            expect(() => aFullInstanceSnapshot().withLegalResources([legalResource1, legalResource2]).build()).not.toThrow();
        });
    });

});

describe('validateLanguages', () => {

    const validLanguages = [Language.NL, Language.FORMAL, Language.INFORMAL];
    const invalidLanguages = [Language.GENERATED_FORMAL, Language.GENERATED_INFORMAL];

    test('if values have different nl language strings, then throws error', () => {
        const title = LanguageString.of('nl', undefined);
        const description = LanguageString.of(undefined, 'nl-formal');

        const instanceSnapshot = aFullInstanceSnapshot().withTitle(title).withDescription(description);

        expect(() => instanceSnapshot.build()).toThrowWithMessage(InvariantError, 'Er is meer dan een nl-taal aanwezig');
    });

    test('if 1 value has different nl language strings, then throws error', () => {
        const title = LanguageString.of('nl', 'nl-formal');
        const description = LanguageString.of(undefined, undefined);

        const instanceSnapshot = aFullInstanceSnapshot().withTitle(title).withDescription(description);

        expect(() => instanceSnapshot.build()).toThrowWithMessage(InvariantError, 'Er is meer dan een nl-taal aanwezig');
    });

    test('if values have no nl language strings, then throws error', () => {
        const title = LanguageString.of(undefined, undefined);
        const description = LanguageString.of(undefined, undefined);

        const instanceSnapshot = aMinimalInstanceSnapshot().withTitle(title).withDescription(description);

        expect(() => instanceSnapshot.build()).toThrowWithMessage(InvariantError, 'Er is geen nl taal aanwezig');
    });

    test('if only 1 value has 1 nl language string, then throws error', () => {
        const title = LanguageString.of(undefined, undefined);
        const description = LanguageString.of('nl', undefined);

        const instanceSnapshot = aMinimalInstanceSnapshot().withTitle(title).withDescription(description);

        expect(() => instanceSnapshot.build()).not.toThrow();
    });

    describe('nested objects', () => {

        test('if a requirement contains a different nl version, then throws error', () => {
            const requirement = aMinimalRequirementForInstanceSnapshot()
                .withTitle(LanguageString.of(undefined, 'nl-formal', undefined))
                .withDescription(LanguageString.of(undefined, 'nl-formal', undefined))
                .build();
            const instanceSnapshot = aMinimalInstanceSnapshot()
                .withTitle(LanguageString.of(undefined, undefined, 'nl-informal'))
                .withDescription(LanguageString.of(undefined, undefined, 'nl-informal'))
                .withRequirements([requirement]);

            expect(() => instanceSnapshot.build()).toThrowWithMessage(InvariantError, 'Er is meer dan een nl-taal aanwezig');
        });

        test('if a procedure contains a different nl version, then throws error', () => {
            const procedure = aMinimalProcedureForInstanceSnapshot()
                .withTitle(LanguageString.of(undefined, 'nl-formal', undefined))
                .withDescription(LanguageString.of(undefined, 'nl-formal', undefined))
                .build();
            const instanceSnapshot = aMinimalInstanceSnapshot()
                .withTitle(LanguageString.of(undefined, undefined, 'nl-informal'))
                .withDescription(LanguageString.of(undefined, undefined, 'nl-informal'))
                .withProcedures([procedure]);

            expect(() => instanceSnapshot.build()).toThrowWithMessage(InvariantError, 'Er is meer dan een nl-taal aanwezig');
        });

        test('if a website contains a different nl version, then throws error', () => {
            const website = aMinimalWebsiteForInstanceSnapshot()
                .withTitle(LanguageString.of(undefined, 'nl-formal', undefined))
                .withDescription(LanguageString.of(undefined, 'nl-formal', undefined))
                .build();
            const instanceSnapshot = aMinimalInstanceSnapshot()
                .withTitle(LanguageString.of(undefined, undefined, 'nl-informal'))
                .withDescription(LanguageString.of(undefined, undefined, 'nl-informal'))
                .withWebsites([website]);

            expect(() => instanceSnapshot.build()).toThrowWithMessage(InvariantError, 'Er is meer dan een nl-taal aanwezig');
        });

        test('if a cost contains a different nl version, then throws error', () => {
            const cost = aMinimalCostForInstanceSnapshot()
                .withTitle(LanguageString.of(undefined, 'nl-formal', undefined))
                .withDescription(LanguageString.of(undefined, 'nl-formal', undefined))
                .build();
            const instanceSnapshot = aMinimalInstanceSnapshot()
                .withTitle(LanguageString.of(undefined, undefined, 'nl-informal'))
                .withDescription(LanguageString.of(undefined, undefined, 'nl-informal'))
                .withCosts([cost]);

            expect(() => instanceSnapshot.build()).toThrowWithMessage(InvariantError, 'Er is meer dan een nl-taal aanwezig');
        });

        test('if a financial advantage contains a different nl version, then throws error', () => {
            const financialAdvantage = aMinimalFinancialAdvantageForInstanceSnapshot()
                .withTitle(LanguageString.of(undefined, 'nl-formal', undefined))
                .withDescription(LanguageString.of(undefined, 'nl-formal', undefined))
                .build();
            const instanceSnapshot = aMinimalInstanceSnapshot()
                .withTitle(LanguageString.of(undefined, undefined, 'nl-informal'))
                .withDescription(LanguageString.of(undefined, undefined, 'nl-informal'))
                .withFinancialAdvantages([financialAdvantage]);

            expect(() => instanceSnapshot.build()).toThrowWithMessage(InvariantError, 'Er is meer dan een nl-taal aanwezig');
        });

        test('if a legal resource contains a different nl version, then throws error', () => {
            const legalResource = aMinimalLegalResourceForInstanceSnapshot()
                .withTitle(LanguageString.of(undefined, 'nl-formal', undefined))
                .withDescription(LanguageString.of(undefined, 'nl-formal', undefined))
                .build();
            const instanceSnapshot = aMinimalInstanceSnapshot()
                .withTitle(LanguageString.of(undefined, undefined, 'nl-informal'))
                .withDescription(LanguageString.of(undefined, undefined, 'nl-informal'))
                .withLegalResources([legalResource]);

            expect(() => instanceSnapshot.build()).toThrowWithMessage(InvariantError, 'Er is meer dan een nl-taal aanwezig');
        });

    });

    test('an instance snapshot fully in informal nl languages does not throw', () => {
        expect(() => aFullInstanceSnapshot().build()).not.toThrow();
    });

    for (const invalidLanguage of invalidLanguages) {
        let valueInNlLanguage: LanguageString;
        if (invalidLanguage === Language.GENERATED_FORMAL) {
            valueInNlLanguage = LanguageString.of(undefined, undefined, undefined, 'value in generated formal', undefined);
        } else if (invalidLanguage == Language.GENERATED_INFORMAL) {
            valueInNlLanguage = LanguageString.of(undefined, undefined, undefined, undefined, 'value in generated formal');
        }

        test(`If title and description contains invalid language ${invalidLanguage}, throws error`, () => {
            const instanceSnapshot = aMinimalInstanceSnapshot().withTitle(valueInNlLanguage).withDescription(valueInNlLanguage);
            expect(() => (instanceSnapshot.build())).toThrowWithMessage(InvariantError, `De nl-taal verschilt van ${validLanguages.toString()}`);
        });

        test(`If additionalDescription contains invalid language ${invalidLanguage}, throws error`, () => {
            const instanceSnapshot = aMinimalInstanceSnapshot().withTitle(valueInNlLanguage).withDescription(valueInNlLanguage).withAdditionalDescription(valueInNlLanguage);
            expect(() => (instanceSnapshot.build())).toThrowWithMessage(InvariantError, `De nl-taal verschilt van ${validLanguages.toString()}`);
        });

        test(`If exception contains invalid language ${invalidLanguage}, throws error`, () => {
            const instanceSnapshot = aMinimalInstanceSnapshot().withTitle(valueInNlLanguage).withDescription(valueInNlLanguage).withException(valueInNlLanguage);
            expect(() => (instanceSnapshot.build())).toThrowWithMessage(InvariantError, `De nl-taal verschilt van ${validLanguages.toString()}`);
        });

        test(`If regulation contains invalid language ${invalidLanguage}, throws error`, () => {
            const instanceSnapshot = aMinimalInstanceSnapshot().withTitle(valueInNlLanguage).withDescription(valueInNlLanguage).withRegulation(valueInNlLanguage);
            expect(() => (instanceSnapshot.build())).toThrowWithMessage(InvariantError, `De nl-taal verschilt van ${validLanguages.toString()}`);
        });

    }

    for (const validLanguage of validLanguages) {
        let valueInNlLanguage: LanguageString;
        if (validLanguage === Language.NL) {
            valueInNlLanguage = LanguageString.of('value nl', undefined, undefined, undefined, undefined);
        } else if (validLanguage == Language.FORMAL) {
            valueInNlLanguage = LanguageString.of(undefined, 'value formal', undefined, undefined, undefined);
        } else if (validLanguage == Language.INFORMAL) {
            valueInNlLanguage = LanguageString.of(undefined, undefined, 'value informal', undefined, undefined);
        }
        test(`If title and description contains valid language ${validLanguage}, does not throws error`, () => {
            const instanceSnapshot = aMinimalInstanceSnapshot().withTitle(valueInNlLanguage).withDescription(valueInNlLanguage);
            expect(() => (instanceSnapshot.build())).not.toThrow();
        });

        test(`If additionalDescription contains valid language ${validLanguage},does not throws error`, () => {
            const instanceSnapshot = aMinimalInstanceSnapshot().withTitle(valueInNlLanguage).withDescription(valueInNlLanguage).withAdditionalDescription(valueInNlLanguage);
            expect(() => (instanceSnapshot.build())).not.toThrow();
        });

        test(`If exception contains valid language ${validLanguage}, does not throws error`, () => {
            const instanceSnapshot = aMinimalInstanceSnapshot().withTitle(valueInNlLanguage).withDescription(valueInNlLanguage).withException(valueInNlLanguage);
            expect(() => (instanceSnapshot.build())).not.toThrow();
        });

        test(`If regulation contains valid language ${validLanguage}, does not throws error`, () => {
            const instanceSnapshot = aMinimalInstanceSnapshot().withTitle(valueInNlLanguage).withDescription(valueInNlLanguage).withRegulation(valueInNlLanguage);
            expect(() => (instanceSnapshot.build())).not.toThrow();
        });

    }

});

describe('dutch language variant', () => {

    for (const nlLanguage of [Language.NL, Language.FORMAL, Language.INFORMAL]) {

        let valueInNlLanguage: LanguageString;
        if (nlLanguage === Language.NL) {
            valueInNlLanguage = LanguageString.of(`value ${uuid()} in nl`, undefined, undefined, undefined, undefined);
        } else if (nlLanguage == Language.FORMAL) {
            valueInNlLanguage = LanguageString.of(undefined, `value ${uuid()} in nl formal`, undefined, undefined, undefined);
        } else if (nlLanguage == Language.INFORMAL) {
            valueInNlLanguage = LanguageString.of(undefined, undefined, `value ${uuid()} in nl informal`, undefined, undefined);
        }


        test(`title and description have nl language ${nlLanguage}`, () => {
            const instanceSnapshot =
                aMinimalInstanceSnapshot()
                    .withTitle(valueInNlLanguage)
                    .withDescription(valueInNlLanguage)
                    .withAdditionalDescription(undefined)
                    .withException(undefined)
                    .withRegulation(undefined)
                    .build();
            expect(instanceSnapshot.dutchLanguageVariant).toEqual(nlLanguage);
        });

        test(`title, description, additional description, exception, regulation, requirement, procedure, website, cost, financial advantage all have nl Language ${nlLanguage}`, () => {
            const instanceSnapshot =
                aMinimalInstanceSnapshot()
                    .withTitle(valueInNlLanguage)
                    .withDescription(valueInNlLanguage)
                    .withAdditionalDescription(valueInNlLanguage)
                    .withException(valueInNlLanguage)
                    .withRegulation(valueInNlLanguage)
                    .withRequirements(
                        [
                            aMinimalRequirementForInstanceSnapshot()
                                .withTitle(valueInNlLanguage)
                                .withDescription(valueInNlLanguage)
                                .build()])
                    .withProcedures(
                        [
                            aMinimalProcedureForInstanceSnapshot()
                                .withTitle(valueInNlLanguage)
                                .withDescription(valueInNlLanguage)
                                .build()])
                    .withWebsites(
                        [
                            aMinimalWebsiteForInstanceSnapshot()
                                .withTitle(valueInNlLanguage)
                                .withDescription(valueInNlLanguage)
                                .build()])
                    .withCosts(
                        [
                            aMinimalCostForInstanceSnapshot()
                                .withTitle(valueInNlLanguage)
                                .withDescription(valueInNlLanguage)
                                .build()
                        ])
                    .withFinancialAdvantages(
                        [
                            aMinimalFinancialAdvantageForInstanceSnapshot()
                                .withTitle(valueInNlLanguage)
                                .withDescription(valueInNlLanguage)
                                .build()
                        ])
                    .build();
            expect(instanceSnapshot.dutchLanguageVariant).toEqual(nlLanguage);
        });
    }

});
