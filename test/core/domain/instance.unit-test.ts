import {aFullInstance, aMinimalInstance, InstanceTestBuilder} from "./instance-test-builder";
import {Iri} from "../../../src/core/domain/shared/iri";
import {FormatPreservingDate} from "../../../src/core/domain/format-preserving-date";
import {
    buildConceptIri,
    buildConceptSnapshotIri,
    buildSpatialRefNis2019Iri,
    buildVerwijstNaarIri
} from "./iri-test-builder";
import {BestuurseenheidTestBuilder} from "./bestuurseenheid-test-builder";
import {
    CompetentAuthorityLevelType,
    ExecutingAuthorityLevelType,
    InstancePublicationStatusType,
    InstanceReviewStatusType,
    InstanceStatusType,
    LanguageType,
    PublicationMediumType,
    TargetAudienceType,
    ThemeType,
    YourEuropeCategoryType
} from "../../../src/core/domain/types";
import {LanguageString} from "../../../src/core/domain/language-string";
import {uuid} from "../../../mu-helper";
import {Requirement, RequirementBuilder} from "../../../src/core/domain/requirement";
import {aFullRequirementForInstance, aMinimalRequirementForInstance} from "./requirement-test-builder";
import {Evidence, EvidenceBuilder} from "../../../src/core/domain/evidence";
import {Procedure, ProcedureBuilder} from "../../../src/core/domain/procedure";
import {aMinimalProcedureForInstance, ProcedureTestBuilder} from "./procedure-test-builder";
import {aMinimalFormalLanguageString, aMinimalLanguageString} from "./language-string-test-builder";
import {Website, WebsiteBuilder} from "../../../src/core/domain/website";
import {aMinimalWebsiteForInstance, WebsiteTestBuilder} from "./website-test-builder";
import {Cost, CostBuilder} from "../../../src/core/domain/cost";
import {aMinimalCostForInstance, CostTestBuilder} from "./cost-test-builder";
import {FinancialAdvantage, FinancialAdvantageBuilder} from "../../../src/core/domain/financial-advantage";
import {aMinimalFinancialAdvantageForInstance, FinancialAdvantageTestBuilder} from "./financial-advantage-test-builder";
import {instanceLanguages, Language} from "../../../src/core/domain/language";
import {InstanceBuilder} from "../../../src/core/domain/instance";
import {restoreRealTime, setFixedTime} from "../../fixed-time";
import {aMinimalContactPointForInstance, ContactPointTestBuilder} from "./contact-point-test-builder";
import {ContactPoint, ContactPointBuilder} from "../../../src/core/domain/contact-point";
import {Address, AddressBuilder} from "../../../src/core/domain/address";
import {AddressTestBuilder, aFullAddressForInstance} from "./address-test-builder";
import {LegalResource, LegalResourceBuilder} from "../../../src/core/domain/legal-resource";
import {aFullLegalResourceForInstance, LegalResourceTestBuilder} from "./legal-resource-test-builder";
import {InvariantError} from "../../../src/core/domain/shared/lpdc-error";

beforeAll(() => setFixedTime());
afterAll(() => restoreRealTime());

describe('constructing', () => {

    test('Undefined id throws error', () => {
        expect(() => aFullInstance().withId(undefined).build()).toThrowWithMessage(InvariantError, 'id mag niet ontbreken');
    });

    test('Invalid iri id throws error', () => {
        expect(() => aFullInstance().withId(new Iri('  ')).build()).toThrowWithMessage(InvariantError, 'iri mag niet leeg zijn');
    });

    test('Undefined createdBy throws error', () => {
        expect(() => aFullInstance().withCreatedBy(undefined).build()).toThrowWithMessage(InvariantError, 'createdBy mag niet ontbreken');
    });

    test('Invalid iri createdBy throws error', () => {
        expect(() => aFullInstance().withCreatedBy(new Iri('  ')).build()).toThrowWithMessage(InvariantError, 'iri mag niet leeg zijn');
    });

    test('Undefined uuid throws error', () => {
        expect(() => aFullInstance().withUuid(undefined).build()).toThrowWithMessage(InvariantError, 'uuid mag niet ontbreken');
    });

    test('Blank uuid throws error', () => {
        expect(() => aFullInstance().withUuid('   ').build()).toThrowWithMessage(InvariantError, 'uuid mag niet leeg zijn');
    });

    test('TargetAudience with duplicates throws error', () => {
        const instanceTestBuilder = aFullInstance().withTargetAudiences([TargetAudienceType.BURGER, TargetAudienceType.BURGER]);
        expect(() => instanceTestBuilder.build()).toThrowWithMessage(InvariantError, 'targetAudiences mag geen duplicaten bevatten');
    });

    test('Themes with duplicates throws error', () => {
        const instanceTestBuilder = aFullInstance().withThemes([ThemeType.WELZIJNGEZONDHEID, ThemeType.WELZIJNGEZONDHEID]);
        expect(() => instanceTestBuilder.build()).toThrowWithMessage(InvariantError, 'themes mag geen duplicaten bevatten');
    });

    test('CompetentAuthorityLevels with duplicates throws error', () => {
        const instanceTestBuilder = aFullInstance().withCompetentAuthorityLevels([CompetentAuthorityLevelType.LOKAAL, CompetentAuthorityLevelType.LOKAAL]);
        expect(() => instanceTestBuilder.build()).toThrowWithMessage(InvariantError, 'competentAuthorityLevels mag geen duplicaten bevatten');
    });

    test('CompetentAuthorities with duplicates throws error', () => {
        expect(() => aFullInstance().withCompetentAuthorities([BestuurseenheidTestBuilder.BORGLOON_IRI, BestuurseenheidTestBuilder.BORGLOON_IRI]).build()).toThrowWithMessage(InvariantError, 'competentAuthorities mag geen duplicaten bevatten');
    });

    test('ExecutingAuthorityLevels with duplicates throws error', () => {
        const instanceTestBuilder = aFullInstance().withExecutingAuthorityLevels([ExecutingAuthorityLevelType.LOKAAL, ExecutingAuthorityLevelType.LOKAAL]);
        expect(() => instanceTestBuilder.build()).toThrowWithMessage(InvariantError, 'executingAuthorityLevels mag geen duplicaten bevatten');
    });

    test('ExecutingAuthorities with duplicates throws error', () => {
        expect(() => aFullInstance().withExecutingAuthorities([BestuurseenheidTestBuilder.PEPINGEN_IRI, BestuurseenheidTestBuilder.PEPINGEN_IRI]).build()).toThrowWithMessage(InvariantError, 'executingAuthorities mag geen duplicaten bevatten');
    });

    test('PublicationMedia with duplicates throws error', () => {
        const instanceTestBuilder = aFullInstance().withPublicationMedia([PublicationMediumType.YOUREUROPE, PublicationMediumType.YOUREUROPE]);
        expect(() => instanceTestBuilder.build()).toThrowWithMessage(InvariantError, 'publicationMedia mag geen duplicaten bevatten');
    });

    test('YourEuropeCategories with duplicates throws error', () => {
        const instanceTestBuilder = aFullInstance().withYourEuropeCategories([YourEuropeCategoryType.BEDRIJF, YourEuropeCategoryType.BEDRIJF]);
        expect(() => instanceTestBuilder.build()).toThrowWithMessage(InvariantError, 'yourEuropeCategories mag geen duplicaten bevatten');
    });

    test('keywords with duplicates throws error', () => {
        const instanceTestBuilder = aFullInstance().withKeywords([LanguageString.of('overlijden'), LanguageString.of('overlijden')]);
        expect(() => instanceTestBuilder.build()).toThrowWithMessage(InvariantError, 'keywords mag geen duplicaten bevatten');
    });

    test('languages with duplicates throws error', () => {
        const instanceTestBuilder = aFullInstance().withLanguages([LanguageType.ENG, LanguageType.ENG]);
        expect(() => instanceTestBuilder.build()).toThrowWithMessage(InvariantError, 'languages mag geen duplicaten bevatten');
    });

    describe('dutchLanguageVariant', () => {
        const invalidLanguages = [Language.EN, Language.GENERATED_FORMAL, Language.GENERATED_INFORMAL];
        const validLanguages = instanceLanguages;

        test('Undefined dutchLanguageVariant throws error', () => {
            const instanceTestBuilder = aFullInstance().withDutchLanguageVariant(undefined);
            expect(() => instanceTestBuilder.build()).toThrowWithMessage(InvariantError, `dutchLanguageVariant moet gelijk zijn aan een van de volgende waardes: ${instanceLanguages}`);
        });

        for (const invalidLanguage of invalidLanguages) {
            test(`If instance language is ${invalidLanguage} then throws error`, () => {
                const instance = aFullInstance().withDutchLanguageVariant(invalidLanguage);
                expect(() => instance.build()).toThrowWithMessage(InvariantError, `dutchLanguageVariant moet gelijk zijn aan een van de volgende waardes: ${validLanguages}`);
            });
        }

        for (const validLanguage of validLanguages) {
            test(`If dutchLanguageVariant is ${validLanguage} then not throws error`, () => {
                const instance = aFullInstance().withDutchLanguageVariant(validLanguage);
                expect(() => instance.build()).not.toThrowWithMessage(InvariantError, `dutchLanguageVariant moet gelijk zijn aan een van de volgende waardes: ${validLanguages}`);
            });
        }

    });

    describe('requirement', () => {

        test('valid requirement does not throw error', () => {
            const uuidValue = uuid();
            const validRequirement = Requirement.reconstitute(
                RequirementBuilder.buildIri(uuidValue),
                uuidValue,
                undefined,
                undefined,
                1,
                undefined,
                undefined
            );

            expect(() => aFullInstance().withRequirements([validRequirement]).build()).not.toThrow();
        });

        test('invalid requirement does throw error', () => {
            const invalidRequirement = Requirement.reconstitute(
                RequirementBuilder.buildIri(uuid()),
                undefined,
                undefined,
                undefined,
                1,
                undefined,
                undefined
            );

            expect(() => aFullInstance().withRequirements([invalidRequirement]).build()).toThrow();
        });

        test('requirements that dont have unique order throws error', () => {
            const requirement1 =
                aMinimalRequirementForInstance().withOrder(1).build();
            const requirement2 =
                aMinimalRequirementForInstance().withOrder(1).build();

            expect(() => aFullInstance().withRequirements([requirement1, requirement2]).build()).toThrowWithMessage(InvariantError, 'requirements > order mag geen duplicaten bevatten');
        });

        test('requirements that have unique order does not throw error', () => {
            const requirement1 =
                aMinimalRequirementForInstance().withOrder(1).build();
            const requirement2 =
                aMinimalRequirementForInstance().withOrder(2).build();

            expect(() => aFullInstance().withRequirements([requirement1, requirement2]).build()).not.toThrow();
        });

        describe('evidence ', () => {

            test('valid evidence does not throw error', () => {
                const uuidValue = uuid();
                const validEvidence = Evidence.reconstitute(
                    EvidenceBuilder.buildIri(uuidValue),
                    uuidValue,
                    undefined,
                    undefined,
                    undefined
                );
                const validRequirement = aFullRequirementForInstance().withEvidence(validEvidence).build();

                expect(() => aFullInstance().withRequirements([validRequirement]).build()).not.toThrow();
            });

            test('invalid evidence does throw error', () => {
                const uuidValue = uuid();
                const invalidEvidence = Evidence.reconstitute(
                    EvidenceBuilder.buildIri(uuidValue),
                    undefined,
                    undefined,
                    undefined,
                    undefined);
                const invalidRequirement = aFullRequirementForInstance().withEvidence(invalidEvidence).build();

                expect(() => aFullInstance().withRequirements([invalidRequirement]).build()).toThrow();
            });

        });
    });

    describe('procedure ', () => {

        test('valid procedure does not throw error', () => {
            const uuidValue = uuid();
            const validProcedure = Procedure.reconstitute(
                ProcedureBuilder.buildIri(uuidValue),
                uuidValue,
                aMinimalFormalLanguageString(ProcedureTestBuilder.TITLE).build(),
                aMinimalFormalLanguageString(ProcedureTestBuilder.DESCRIPTION).build(),
                1,
                [],
                undefined
            );

            expect(() => aFullInstance().withProcedures([validProcedure]).build()).not.toThrow();
        });

        test('invalid procedure does throw error', () => {
            const invalidProcedure = Procedure.reconstitute(ProcedureBuilder.buildIri(uuid()), undefined, undefined, undefined, 1, [], undefined);

            expect(() => aFullInstance().withProcedures([invalidProcedure]).build()).toThrow();
        });

        test('procedures that dont have unique order throws error', () => {
            const procedure1 =
                aMinimalProcedureForInstance().withOrder(1).build();
            const procedure2 =
                aMinimalProcedureForInstance().withOrder(1).build();

            expect(() => aFullInstance().withProcedures([procedure1, procedure2]).build()).toThrowWithMessage(InvariantError, 'procedures > order mag geen duplicaten bevatten');
        });

        test('procedures that have unique order does not throw error', () => {
            const procedure1 =
                aMinimalProcedureForInstance().withOrder(1).build();
            const procedure2 =
                aMinimalProcedureForInstance().withOrder(2).build();

            expect(() => aFullInstance().withProcedures([procedure1, procedure2]).build()).not.toThrow();
        });

    });

    describe('website ', () => {

        test('valid website does not throw error', () => {
            const uuidValue = uuid();
            const validWebsite = Website.reconstitute(
                WebsiteBuilder.buildIri(uuidValue),
                uuidValue,
                aMinimalFormalLanguageString(WebsiteTestBuilder.TITLE).build(),
                aMinimalFormalLanguageString(WebsiteTestBuilder.DESCRIPTION).build(),
                1,
                WebsiteTestBuilder.URL,
                undefined
            );

            expect(() => aFullInstance().withWebsites([validWebsite]).build()).not.toThrow();
        });

        test('invalid website does throw error', () => {
            const invalidWebsite = Website.reconstitute(WebsiteBuilder.buildIri(uuid()), undefined, undefined, undefined, 1, undefined, undefined);

            expect(() => aFullInstance().withWebsites([invalidWebsite]).build()).toThrow();
        });

        test('websites that dont have unique order throws error', () => {
            const website1 =
                aMinimalWebsiteForInstance().withOrder(1).build();
            const website2 =
                aMinimalWebsiteForInstance().withOrder(1).build();

            expect(() => aFullInstance().withWebsites([website1, website2]).build()).toThrowWithMessage(InvariantError, 'websites > order mag geen duplicaten bevatten');
        });

        test('websites that have unique order does not throw error', () => {
            const website1 =
                aMinimalWebsiteForInstance().withOrder(1).build();
            const website2 =
                aMinimalWebsiteForInstance().withOrder(2).build();


            expect(() => aFullInstance().withWebsites([website1, website2]).build()).not.toThrow();
        });

    });

    describe('cost ', () => {

        test('valid cost for instance does not throw error', () => {
            const uuidValue = uuid();
            const validCost = Cost.reconstitute(
                CostBuilder.buildIri(uuidValue),
                uuidValue,
                aMinimalFormalLanguageString(CostTestBuilder.TITLE).build(),
                aMinimalFormalLanguageString(CostTestBuilder.DESCRIPTION).build(),
                1,
                undefined
            );

            expect(() => aFullInstance().withCosts([validCost]).build()).not.toThrow();
        });

        test('invalid cost for instance does throw error', () => {
            const invalidCost = Cost.reconstitute(CostBuilder.buildIri(uuid()), undefined, undefined, undefined, 1, undefined);

            expect(() => aFullInstance().withCosts([invalidCost]).build()).toThrow();
        });

        test('costs that dont have unique order throws error', () => {
            const cost1 =
                aMinimalCostForInstance().withOrder(1).build();
            const cost2 =
                aMinimalCostForInstance().withOrder(1).build();

            expect(() => aFullInstance().withCosts([cost1, cost2]).build()).toThrowWithMessage(InvariantError, 'costs > order mag geen duplicaten bevatten');
        });

        test('costs that have unique order does not throw error', () => {
            const cost1 =
                aMinimalCostForInstance().withOrder(1).build();
            const cost2 =
                aMinimalCostForInstance().withOrder(2).build();

            expect(() => aFullInstance().withCosts([cost1, cost2]).build()).not.toThrow();
        });

    });

    describe('financialAdvantage ', () => {

        test('valid financialAdvantage for instance does not throw error', () => {
            const uuidValue = uuid();
            const validFinancialAdvantage = FinancialAdvantage.reconstitute(FinancialAdvantageBuilder.buildIri(uuidValue), uuidValue, aMinimalFormalLanguageString(FinancialAdvantageTestBuilder.TITLE).build(),
                aMinimalFormalLanguageString(FinancialAdvantageTestBuilder.DESCRIPTION).build(), 1, undefined);

            expect(() => aFullInstance().withFinancialAdvantages([validFinancialAdvantage]).build()).not.toThrow();
        });

        test('invalid financialAdvantage for instance does throw error', () => {
            const invalidFinancialAdvantage = FinancialAdvantage.reconstitute(FinancialAdvantageBuilder.buildIri(uuid()), undefined, undefined, undefined, 1, undefined);

            expect(() => aFullInstance().withFinancialAdvantages([invalidFinancialAdvantage]).build()).toThrow();
        });

        test('financial advantages that dont have unique order throws error', () => {
            const financialAdvantage1 =
                aMinimalFinancialAdvantageForInstance().withOrder(1).build();
            const financialAdvantage2 =
                aMinimalFinancialAdvantageForInstance().withOrder(1).build();

            expect(() => aFullInstance().withFinancialAdvantages([financialAdvantage1, financialAdvantage2]).build()).toThrowWithMessage(InvariantError, 'financial advantages > order mag geen duplicaten bevatten');
        });

        test('financial advantages that have unique order does not throw error', () => {
            const financialAdvantage1 =
                aMinimalFinancialAdvantageForInstance().withOrder(1).build();
            const financialAdvantage2 =
                aMinimalFinancialAdvantageForInstance().withOrder(2).build();

            expect(() => aFullInstance().withFinancialAdvantages([financialAdvantage1, financialAdvantage2]).build()).not.toThrow();
        });
    });

    describe('contact points ', () => {

        test('valid contact point does not throw error', () => {
            const uuidValue = uuid();
            const validContactPoint = ContactPoint.reconstitute(ContactPointBuilder.buildIri(uuidValue), uuidValue, ContactPointTestBuilder.URL, ContactPointTestBuilder.EMAIL, ContactPointTestBuilder.TELEPHONE, ContactPointTestBuilder.OPENING_HOURS, 1, undefined);

            expect(() => aFullInstance().withContactPoints([validContactPoint]).build()).not.toThrow();
        });

        test('invalid contact point does throw error', () => {
            const invalidContactPoint = ContactPoint.reconstitute(ContactPointBuilder.buildIri(uuid()), undefined, undefined, undefined, undefined, undefined, 1, undefined);
            expect(() => aFullInstance().withContactPoints([invalidContactPoint]).build()).toThrow();
        });

        test('contact points that dont have unique order throws error', () => {
            const contactPoint1 =
                aMinimalContactPointForInstance().withOrder(1).build();
            const contactPoint2 =
                aMinimalContactPointForInstance().withOrder(1).build();

            expect(() => aFullInstance().withContactPoints([contactPoint1, contactPoint2]).build()).toThrowWithMessage(InvariantError, 'contact points > order mag geen duplicaten bevatten');
        });

        test('contact points that have unique order does not throw error', () => {
            const contactPoint1 =
                aMinimalContactPointForInstance().withOrder(1).build();
            const contactPoint2 =
                aMinimalContactPointForInstance().withOrder(2).build();

            expect(() => aFullInstance().withContactPoints([contactPoint1, contactPoint2]).build()).not.toThrow();
        });

        describe('address', () => {

            test('valid contact point with valid address does not throw error', () => {
                const uuidValue = uuid();
                const validContactPoint =
                    ContactPoint.reconstitute(ContactPointBuilder.buildIri(uuidValue), uuidValue, ContactPointTestBuilder.URL, ContactPointTestBuilder.EMAIL, ContactPointTestBuilder.TELEPHONE, ContactPointTestBuilder.OPENING_HOURS, 1,
                        Address.reconstitute(
                            AddressBuilder.buildIri(uuid()), uuid(),
                            aMinimalLanguageString(AddressTestBuilder.GEMEENTENAAM_NL).build(),
                            aMinimalLanguageString(AddressTestBuilder.LAND_NL).build(),
                            AddressTestBuilder.HUISNUMMER,
                            AddressTestBuilder.BUSNUMMER,
                            AddressTestBuilder.POSTCODE,
                            aMinimalLanguageString(AddressTestBuilder.STRAATNAAM_NL).build(),
                            AddressTestBuilder.VERWIJST_NAAR));

                expect(() => aFullInstance().withContactPoints([validContactPoint]).build()).not.toThrow();
            });

            test('valid contact point with invalid address does throw error', () => {
                const uuidValue = uuid();
                const invalidContactPoint = ContactPoint.reconstitute(ContactPointBuilder.buildIri(uuidValue), uuidValue, ContactPointTestBuilder.URL, ContactPointTestBuilder.EMAIL, ContactPointTestBuilder.TELEPHONE, ContactPointTestBuilder.OPENING_HOURS, 1,
                    Address.reconstitute(
                        AddressBuilder.buildIri(uuid()),
                        undefined,
                        undefined,
                        undefined,
                        undefined,
                        undefined,
                        undefined,
                        undefined,
                        undefined));
                expect(() => aFullInstance().withContactPoints([invalidContactPoint]).build()).toThrow();
            });

        });

    });

    describe('dateCreated', () => {

        test('Undefined dateCreated throws error', () => {
            expect(() => aFullInstance().withDateCreated(undefined).build()).toThrowWithMessage(InvariantError, 'dateCreated mag niet ontbreken');
        });

        test('Blank dateCreated throws error', () => {
            expect(() => aFullInstance().withDateCreated(FormatPreservingDate.of('')).build()).toThrowWithMessage(InvariantError, 'dateCreated mag niet ontbreken');
        });

    });

    describe('dateModified', () => {

        test('Undefined dateModified throws error', () => {
            expect(() => aFullInstance().withDateModified(undefined).build()).toThrowWithMessage(InvariantError, 'dateModified mag niet ontbreken');
        });

        test('Blank dateModified throws error', () => {
            expect(() => aFullInstance().withDateModified(FormatPreservingDate.of('')).build()).toThrowWithMessage(InvariantError, 'dateModified mag niet ontbreken');
        });

    });

    test('When status is verstuurd and dateSent is undefined should throw error', () => {
        const instanceTestBuilder = aFullInstance().withStatus(InstanceStatusType.VERSTUURD).withDateSent(undefined);

        expect(() => instanceTestBuilder.build()).toThrowWithMessage(InvariantError, 'dateSent moet aanwezig zijn wanneer status gelijk is aan verstuurd ');

    });

    test('When status is ontwerp and dateSent is undefined should not throw error', () => {
        const instanceTestBuilder = aFullInstance()
            .withStatus(InstanceStatusType.ONTWERP)
            .withDateSent(undefined)
            .withDatePublished(undefined)
            .withPublicationStatus(undefined);

        expect(() => instanceTestBuilder.build()).not.toThrow();

    });

    test('When datePublished is present and dateSent is undefined should throw error', () => {
        const instanceTestBuilder = aFullInstance().withDateSent(undefined).withDatePublished(InstanceTestBuilder.DATE_PUBLISHED);

        expect(() => instanceTestBuilder.build()).toThrowWithMessage(InvariantError, 'datePublished kan alleen aanwezig zijn wanneer dateSent aanwezig is');
    });

    test('conceptId, conceptSnapshotId and productId not all defined or all undefined should throw error', () => {
        const instanceTestBuilderWithConcept = aFullInstance()
            .withConceptId(buildConceptIri(uuid()))
            .withConceptSnapshotId(undefined)
            .withProductId(undefined);

        expect(() => instanceTestBuilderWithConcept.build()).toThrowWithMessage(InvariantError, 'conceptId, conceptSnapshotId and productId moeten allemaal aanwezig of afwezig zijn');

        const instanceTestBuilderWithConceptSnapshotId = aFullInstance()
            .withConceptId(undefined)
            .withConceptSnapshotId(buildConceptSnapshotIri(uuid()))
            .withProductId(undefined);

        expect(() => instanceTestBuilderWithConceptSnapshotId.build()).toThrowWithMessage(InvariantError, 'conceptId, conceptSnapshotId and productId moeten allemaal aanwezig of afwezig zijn');

        const instanceTestBuilderWithProductId = aFullInstance()
            .withConceptId(undefined)
            .withConceptSnapshotId(undefined)
            .withProductId('1300');

        expect(() => instanceTestBuilderWithProductId.build()).toThrowWithMessage(InvariantError, 'conceptId, conceptSnapshotId and productId moeten allemaal aanwezig of afwezig zijn');
    });

    test('conceptId, conceptSnapshotId and productId  both defined or undefined should not throw error', () => {
        const instanceTestBuilderWithConceptAndConceptSnapshot = aFullInstance()
            .withConceptId(buildConceptIri(uuid()))
            .withConceptSnapshotId(buildConceptSnapshotIri(uuid()))
            .withProductId('1300');

        expect(() => instanceTestBuilderWithConceptAndConceptSnapshot.build()).not.toThrow();

        const instanceTestBuilderWithoutConceptAndConceptSnapshot = aFullInstance()
            .withConceptId(undefined)
            .withConceptSnapshotId(undefined)
            .withProductId(undefined)
            .withReviewStatus(undefined);

        expect(() => instanceTestBuilderWithoutConceptAndConceptSnapshot.build()).not.toThrow();
    });

    test('Absent status throws error', () => {
        expect(() => aFullInstance().withStatus(undefined).build()).toThrowWithMessage(InvariantError, 'status mag niet ontbreken');
    });

    test('Spatials with duplicates throws error', () => {
        expect(() => aFullInstance().withSpatials([buildSpatialRefNis2019Iri(1), buildSpatialRefNis2019Iri(1)]).build()).toThrowWithMessage(InvariantError, 'spatials mag geen duplicaten bevatten');
    });

    test('reviewStatus present and conceptId present should not throw error', () => {
        const instance = aFullInstance()
            .withConceptId(buildConceptIri(uuid()))
            .withReviewStatus(InstanceReviewStatusType.CONCEPT_GEWIJZIGD);

        expect(() => instance.build()).not.toThrow();
    });

    test('reviewStatus and conceptId not present should not throw error', () => {
        const instance = aFullInstance()
            .withConceptId(undefined)
            .withConceptSnapshotId(undefined)
            .withProductId(undefined)
            .withReviewStatus(undefined);
        expect(() => instance.build()).not.toThrow();
    });

    test('reviewStatus present and conceptId not present throws error', () => {
        const instance = aFullInstance()
            .withConceptId(undefined)
            .withConceptSnapshotId(undefined)
            .withProductId(undefined)
            .withReviewStatus(InstanceReviewStatusType.CONCEPT_GEWIJZIGD);

        expect(() => instance.build()).toThrowWithMessage(InvariantError, 'reviewStatus kan alleen aanwezig zijn wanneer concept aanwezig is');
    });

    describe('legalResources', () => {

        test('valid legalResource does not throw error', () => {
            const uuidValue = uuid();
            const validLegalResource = LegalResource.reconstitute(
                LegalResourceBuilder.buildIri(uuidValue),
                uuidValue,
                undefined,
                undefined,
                LegalResourceTestBuilder.URL,
                1
            );
            expect(() => aFullInstance().withLegalResources([validLegalResource]).build()).not.toThrow();
        });

        test('invalid legalResource does throw error', () => {
            const invalidLegalResource = LegalResource.reconstitute(
                LegalResourceBuilder.buildIri(uuid()),
                undefined,
                undefined,
                undefined,
                LegalResourceTestBuilder.URL,
                1
            );

            expect(() => aFullInstance().withLegalResources([invalidLegalResource]).build()).toThrow();
        });

        test('legalResources that dont have unique order throws error', () => {
            const legalResource1 =
                aFullLegalResourceForInstance().withOrder(1).build();
            const legalResource2 =
                aFullLegalResourceForInstance().withOrder(1).build();

            expect(() => aFullInstance().withLegalResources([legalResource1, legalResource2]).build()).toThrowWithMessage(InvariantError, 'legal resources > order mag geen duplicaten bevatten');
        });

        test('legalResource that have unique order does not throw error', () => {
            const legalResource1 =
                aFullLegalResourceForInstance().withOrder(1).build();
            const legalResource2 =
                aFullLegalResourceForInstance().withOrder(2).build();

            expect(() => aFullInstance().withLegalResources([legalResource1, legalResource2]).build()).not.toThrow();
        });
    });

});

describe('validateLanguages', () => {

    const validLanguages = [Language.NL, Language.FORMAL, Language.INFORMAL];
    const invalidLanguages = [Language.GENERATED_FORMAL, Language.GENERATED_INFORMAL];

    test('if values have different nl language strings, then throws error', () => {
        const title = LanguageString.of(undefined, 'nl', undefined);
        const description = LanguageString.of(undefined, undefined, 'nl-formal');

        const instance = aFullInstance().withTitle(title).withDescription(description);

        expect(() => instance.build()).toThrowWithMessage(InvariantError, 'Er is meer dan een nl-taal aanwezig');
    });
    test('if 1 value has different nl language strings, then throws error', () => {
        const title = LanguageString.of(undefined, 'nl', 'nl-formal');
        const description = LanguageString.of(undefined, undefined, undefined);

        const instance = aFullInstance().withTitle(title).withDescription(description);

        expect(() => instance.build()).toThrowWithMessage(InvariantError, 'Er is meer dan een nl-taal aanwezig');
    });

    test('if values have no nl language strings, then no error is thrown', () => {
        const title = LanguageString.of(undefined, undefined, undefined);
        const description = LanguageString.of(undefined, undefined, undefined);

        const instance = aFullInstance().withTitle(title).withDescription(description);

        expect(() => instance.build()).not.toThrow();
    });

    test('if values have 1 nl language string but non-consistent en language strings, then no error is thrown', () => {
        const title = LanguageString.of(undefined, undefined, undefined);
        const description = LanguageString.of('en', undefined, undefined);

        const instance = aFullInstance().withTitle(title).withDescription(description);

        expect(() => instance.build()).not.toThrow();
    });

    test('if only 1 value has 1 nl language string, then no error is thrown', () => {
        const title = LanguageString.of(undefined, undefined, undefined);
        const description = LanguageString.of('en', 'nl', undefined);

        const instance = aMinimalInstance().withTitle(title).withDescription(description);

        expect(() => instance.build()).not.toThrow();
    });

    describe('nested objects', () => {

        test('if a requirement contains a different nl version, then throws error', () => {
            const requirement = aMinimalRequirementForInstance()
                .withTitle(LanguageString.of(undefined, undefined, undefined, 'nl-informal'))
                .withDescription(LanguageString.of(undefined, undefined, undefined, 'nl-informal'))
                .build();
            const instance = aMinimalInstance().withTitle(LanguageString.of(undefined, undefined, 'nl-formal')).withRequirements([requirement]);

            expect(() => instance.build()).toThrowWithMessage(InvariantError, 'Er is meer dan een nl-taal aanwezig');
        });

        test('if a procedure contains a different nl version, then throws error', () => {
            const procedure = aMinimalProcedureForInstance()
                .withTitle(LanguageString.of(undefined, undefined, undefined, 'nl-informal'))
                .withDescription(LanguageString.of(undefined, undefined, undefined, 'nl-informal'))
                .build();
            const instance = aMinimalInstance().withTitle(LanguageString.of(undefined, undefined, 'nl-formal')).withProcedures([procedure]);

            expect(() => instance.build()).toThrowWithMessage(InvariantError, 'Er is meer dan een nl-taal aanwezig');
        });

        test('if a website contains a different nl version, then throws error', () => {
            const website = aMinimalWebsiteForInstance()
                .withTitle(LanguageString.of(undefined, undefined, undefined, 'nl-informal'))
                .withDescription(LanguageString.of(undefined, undefined, undefined, 'nl-informal'))
                .build();
            const instance = aMinimalInstance().withTitle(LanguageString.of(undefined, undefined, 'nl-formal')).withWebsites([website]);

            expect(() => instance.build()).toThrowWithMessage(InvariantError, 'Er is meer dan een nl-taal aanwezig');
        });

        test('if a cost contains a different nl version, then throws error', () => {
            const cost = aMinimalCostForInstance()
                .withTitle(LanguageString.of(undefined, undefined, undefined, 'nl-informal'))
                .withDescription(LanguageString.of(undefined, undefined, undefined, 'nl-informal'))
                .build();
            const instance = aMinimalInstance().withTitle(LanguageString.of(undefined, undefined, 'nl-formal')).withCosts([cost]);

            expect(() => instance.build()).toThrowWithMessage(InvariantError, 'Er is meer dan een nl-taal aanwezig');
        });

        test('if a financial advantage contains a different nl version, then throws error', () => {
            const financialAdvantage = aMinimalFinancialAdvantageForInstance()
                .withTitle(LanguageString.of(undefined, undefined, undefined, 'nl-informal'))
                .withDescription(LanguageString.of(undefined, undefined, undefined, 'nl-informal'))
                .build();
            const instance = aMinimalInstance().withTitle(LanguageString.of(undefined, undefined, 'nl-formal')).withFinancialAdvantages([financialAdvantage]);

            expect(() => instance.build()).toThrowWithMessage(InvariantError, 'Er is meer dan een nl-taal aanwezig');
        });

    });

    test('an instance fully in formal nl languages does not throw', () => {
        expect(() => aFullInstance().build()).not.toThrow();
    });


    for (const invalidLanguage of invalidLanguages) {
        let valueInNlLanguage: LanguageString;
        if (invalidLanguage === Language.GENERATED_FORMAL) {
            valueInNlLanguage = LanguageString.of(`value en`, undefined, undefined, undefined, 'value in generated formal', undefined);
        } else if (invalidLanguage == Language.GENERATED_INFORMAL) {
            valueInNlLanguage = LanguageString.of(`value en`, undefined, undefined, undefined, undefined, 'value in generated formal');
        }

        test('If title contains invalid language, throws error', () => {
            const instance = aMinimalInstance().withTitle(valueInNlLanguage);
            expect(() => (instance.build())).toThrowWithMessage(InvariantError, `De nl-taal verschilt van ${validLanguages.toString()}`);
        });
        test('If description contains invalid language, throws error', () => {
            const instance = aMinimalInstance().withDescription(valueInNlLanguage);
            expect(() => (instance.build())).toThrowWithMessage(InvariantError, `De nl-taal verschilt van ${validLanguages.toString()}`);
        });
        test('If additionalDescription contains invalid language, throws error', () => {
            const instance = aMinimalInstance().withAdditionalDescription(valueInNlLanguage);
            expect(() => (instance.build())).toThrowWithMessage(InvariantError, `De nl-taal verschilt van ${validLanguages.toString()}`);
        });
        test('If exception contains invalid language, throws error', () => {
            const instance = aMinimalInstance().withException(valueInNlLanguage);
            expect(() => (instance.build())).toThrowWithMessage(InvariantError, `De nl-taal verschilt van ${validLanguages.toString()}`);
        });
        test('If regulation contains invalid language, throws error', () => {
            const instance = aMinimalInstance().withRegulation(valueInNlLanguage);
            expect(() => (instance.build())).toThrowWithMessage(InvariantError, `De nl-taal verschilt van ${validLanguages.toString()}`);
        });

    }

    for (const validLanguage of validLanguages) {
        let valueInNlLanguage: LanguageString;
        if (validLanguage === Language.NL) {
            valueInNlLanguage = LanguageString.of(`value en`, 'value nl', undefined, undefined, undefined, undefined);
        } else if (validLanguage == Language.FORMAL) {
            valueInNlLanguage = LanguageString.of(`value en`, undefined, 'value formal', undefined, undefined, undefined);
        } else if (validLanguage == Language.INFORMAL) {
            valueInNlLanguage = LanguageString.of(`value en`, undefined, undefined, 'value informal', undefined, undefined);
        }
        test('If title contains valid language, does not throws error', () => {
            const instance = aMinimalInstance().withTitle(valueInNlLanguage);
            expect(() => (instance.build())).not.toThrow();
        });
        test('If description contains valid language,does not throws error', () => {
            const instance = aMinimalInstance().withDescription(valueInNlLanguage);
            expect(() => (instance.build())).not.toThrow();
        });
        test('If additionalDescription contains valid language,does not throws error', () => {
            const instance = aMinimalInstance().withAdditionalDescription(valueInNlLanguage);
            expect(() => (instance.build())).not.toThrow();
        });
        test('If exception contains valid language,does not throws error', () => {
            const instance = aMinimalInstance().withException(valueInNlLanguage);
            expect(() => (instance.build())).not.toThrow();
        });
        test('If regulation contains valid language,does not throws error', () => {
            const instance = aMinimalInstance().withRegulation(valueInNlLanguage);
            expect(() => (instance.build())).not.toThrow();
        });

    }

});

describe('reopen', () => {

    test('should update status', () => {
        const instance = aFullInstance()
            .withStatus(InstanceStatusType.VERSTUURD)
            .build();

        const updatedInstance = instance.reopen();

        expect(updatedInstance).toEqual(InstanceBuilder.from(instance)
            .withStatus(InstanceStatusType.ONTWERP)
            .build());
    });

    test('should throw error when instance status is ontwerp', () => {
        const instance = aFullInstance()
            .withStatus(InstanceStatusType.ONTWERP)
            .build();

        expect(() => instance.reopen()).toThrowWithMessage(InvariantError, 'Instantie is al in status ontwerp');
    });

    test('When instance publication state is published then publication state should be set to Te herpubliceren', () => {
        const instance = aFullInstance()
            .withStatus(InstanceStatusType.VERSTUURD)
            .withPublicationStatus(InstancePublicationStatusType.GEPUBLICEERD)
            .build();

        const updatedInstance = instance.reopen();

        expect(updatedInstance).toEqual(InstanceBuilder.from(instance)
            .withStatus(InstanceStatusType.ONTWERP)
            .withPublicationStatus(InstancePublicationStatusType.TE_HERPUBLICEREN)
            .build());
    });

    test('when publication status was verstuurd but never published', () => {
        const instance = aFullInstance()
            .withStatus(InstanceStatusType.VERSTUURD)
            .build();

        const updatedInstance = instance.reopen();

        expect(updatedInstance).toEqual(InstanceBuilder.from(instance)
            .withStatus(InstanceStatusType.ONTWERP)
            .build());
    });


    test('when publication status te-herpubliceren, and previously published', () => {
        const datePublished = FormatPreservingDate.now();
        const instance = aFullInstance()
            .withStatus(InstanceStatusType.VERSTUURD)
            .withPublicationStatus(InstancePublicationStatusType.TE_HERPUBLICEREN)
            .withDatePublished(datePublished)
            .build();

        const updatedInstance = instance.reopen();

        expect(updatedInstance).toEqual(InstanceBuilder.from(instance)
            .withStatus(InstanceStatusType.ONTWERP)
            .withPublicationStatus(InstancePublicationStatusType.TE_HERPUBLICEREN)
            .withDatePublished(datePublished)
            .build());
    });

    test('when publication status gepubliceerd', () => {
        const datePublished = FormatPreservingDate.now();
        const instance = aFullInstance()
            .withStatus(InstanceStatusType.VERSTUURD)
            .withPublicationStatus(InstancePublicationStatusType.GEPUBLICEERD)
            .withDatePublished(datePublished)
            .build();

        const updatedInstance = instance.reopen();

        expect(updatedInstance).toEqual(InstanceBuilder.from(instance)
            .withStatus(InstanceStatusType.ONTWERP)
            .withPublicationStatus(InstancePublicationStatusType.TE_HERPUBLICEREN)
            .withDatePublished(datePublished)
            .build());
    });
});

describe('validateForPublish', () => {

    test('when valid instance', () => {
        const instance = aFullInstance().build();

        expect(() => instance.validateForPublish(false)).not.toThrow();
    });

    test('when english title is defined, then english description should also be defined', () => {
        const instance = aMinimalInstance()
            .withTitle(LanguageString.of('english title', undefined, 'nederlandse titel'))
            .withDescription(LanguageString.of(undefined, undefined, 'nederlandse beschrijving'))
            .build();

        expect(() => instance.validateForPublish(false)).toThrowWithMessage(InvariantError, 'Binnen eenzelfde taal moeten titel en beschrijving beide ingevuld (of leeg) zijn');
    });

    test('when english description is defined, then english title should also be defined', () => {
        const instance = aMinimalInstance()
            .withTitle(LanguageString.of(undefined, undefined, 'nederlandse titel'))
            .withDescription(LanguageString.of('english description', undefined, 'nederlandse beschrijving'))
            .build();

        expect(() => instance.validateForPublish(false)).toThrowWithMessage(InvariantError, 'Binnen eenzelfde taal moeten titel en beschrijving beide ingevuld (of leeg) zijn');
    });

    test('When address should be checked and has addressId, instance is valid', () => {
        const instance = aFullInstance()
            .withContactPoints([aMinimalContactPointForInstance().withAddress(aFullAddressForInstance().withVerwijstNaar(buildVerwijstNaarIri('3357105')).build()).build()])
            .build();

        expect(() => instance.validateForPublish(true)).not.toThrow();
    });

    test('When address should be checked and has no addressId, instance is invalid', () => {
        const instance = aFullInstance()
            .withContactPoints([aMinimalContactPointForInstance().withAddress(aFullAddressForInstance().withVerwijstNaar(undefined).build()).build()])
            .build();

        expect(() => instance.validateForPublish(true)).toThrowWithMessage(InvariantError, 'Minstens één van de adresgegevens is niet geldig');
    });

    test('When address should be checked and one of the addresses is invalid, instance is invalid', () => {
        const instance = aFullInstance()
            .withContactPoints([
                aMinimalContactPointForInstance().withOrder(1).withAddress(aFullAddressForInstance().withVerwijstNaar(buildVerwijstNaarIri('3357105')).build()).build(),
                aMinimalContactPointForInstance().withOrder(2).withAddress(aFullAddressForInstance().withVerwijstNaar(undefined).build()).build()
            ])
            .build();

        expect(() => instance.validateForPublish(true)).toThrowWithMessage(InvariantError, 'Minstens één van de adresgegevens is niet geldig');
    });

    test('When address should be checked and one of contactPoints has no address and other address valid, instance is valid', () => {
        const instance = aFullInstance()
            .withContactPoints([
                aMinimalContactPointForInstance().withOrder(1).withAddress(aFullAddressForInstance().withVerwijstNaar(buildVerwijstNaarIri('3357105')).build()).build(),
                aMinimalContactPointForInstance().withOrder(2).withAddress(undefined).build()
            ])
            .build();

        expect(() => instance.validateForPublish(true)).not.toThrow();
    });

});

describe('publish', () => {

    test('should update status', () => {
        const instance = aMinimalInstance()
            .withStatus(InstanceStatusType.ONTWERP)
            .build();

        const updatedInstance = instance.publish();

        expect(updatedInstance).toEqual(InstanceBuilder.from(instance)
            .withStatus(InstanceStatusType.VERSTUURD)
            .withDateSent(FormatPreservingDate.now())
            .build());
    });

    test('should throw error when instance status is Verstuurd', () => {
        const instance = aFullInstance()
            .withStatus(InstanceStatusType.VERSTUURD)
            .build();

        expect(() => instance.publish()).toThrowWithMessage(InvariantError, 'Instantie heeft reeds status verstuurd');
    });

});

describe('builder', () => {

    test("from copies all fields", () => {
        const instance = aFullInstance().build();
        const fromInstance = InstanceBuilder.from(instance).build();

        expect(fromInstance).toEqual(instance);

    });
});
