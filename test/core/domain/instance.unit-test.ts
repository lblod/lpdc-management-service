import {aFullInstance, aMinimalInstance, InstanceTestBuilder} from "./instance-test-builder";
import {Iri} from "../../../src/core/domain/shared/iri";
import {FormatPreservingDate} from "../../../src/core/domain/format-preserving-date";
import {
    buildCodexVlaanderenIri,
    buildConceptIri,
    buildConceptSnapshotIri,
    buildSpatialRefNis2019Iri
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
import {aMinimalFormalLanguageString} from "./language-string-test-builder";
import {Website, WebsiteBuilder} from "../../../src/core/domain/website";
import {aFullWebsiteForInstance, aMinimalWebsiteForInstance, WebsiteTestBuilder} from "./website-test-builder";
import {Cost, CostBuilder} from "../../../src/core/domain/cost";
import {aMinimalCostForInstance, CostTestBuilder} from "./cost-test-builder";
import {FinancialAdvantage, FinancialAdvantageBuilder} from "../../../src/core/domain/financial-advantage";
import {aMinimalFinancialAdvantageForInstance, FinancialAdvantageTestBuilder} from "./financial-advantage-test-builder";
import {Language} from "../../../src/core/domain/language";
import {InstanceBuilder} from "../../../src/core/domain/instance";
import {restoreRealTime, setFixedTime} from "../../fixed-time";
import {aMinimalContactPoint} from "./contact-point-test-builder";

beforeAll(() => setFixedTime());
afterAll(() => restoreRealTime());

describe('constructing', () => {

    test('Undefined id throws error', () => {
        expect(() => aFullInstance().withId(undefined).build()).toThrow(new Error('id should not be absent'));
    });

    test('Invalid iri id throws error', () => {
        expect(() => aFullInstance().withId(new Iri('  ')).build()).toThrow(new Error('iri should not be blank'));
    });

    test('Undefined createdBy throws error', () => {
        expect(() => aFullInstance().withCreatedBy(undefined).build()).toThrow(new Error('createdBy should not be absent'));
    });

    test('Invalid iri createdBy throws error', () => {
        expect(() => aFullInstance().withCreatedBy(new Iri('  ')).build()).toThrow(new Error('iri should not be blank'));
    });

    test('Undefined uuid throws error', () => {
        expect(() => aFullInstance().withUuid(undefined).build()).toThrow(new Error('uuid should not be absent'));
    });

    test('Blank uuid throws error', () => {
        expect(() => aFullInstance().withUuid('   ').build()).toThrow(new Error('uuid should not be blank'));
    });

    test('TargetAudience with duplicates throws error', () => {
        const instanceTestBuilder = aFullInstance().withTargetAudiences([TargetAudienceType.BURGER, TargetAudienceType.BURGER]);
        expect(() => instanceTestBuilder.build()).toThrow(new Error('targetAudiences should not contain duplicates'));
    });

    test('Themes with duplicates throws error', () => {
        const instanceTestBuilder = aFullInstance().withThemes([ThemeType.WELZIJNGEZONDHEID, ThemeType.WELZIJNGEZONDHEID]);
        expect(() => instanceTestBuilder.build()).toThrow(new Error('themes should not contain duplicates'));
    });

    test('CompetentAuthorityLevels with duplicates throws error', () => {
        const instanceTestBuilder = aFullInstance().withCompetentAuthorityLevels([CompetentAuthorityLevelType.LOKAAL, CompetentAuthorityLevelType.LOKAAL]);
        expect(() => instanceTestBuilder.build()).toThrow(new Error('competentAuthorityLevels should not contain duplicates'));
    });

    test('CompetentAuthorities with duplicates throws error', () => {
        expect(() => aFullInstance().withCompetentAuthorities([BestuurseenheidTestBuilder.BORGLOON_IRI, BestuurseenheidTestBuilder.BORGLOON_IRI]).build()).toThrow(new Error('competentAuthorities should not contain duplicates'));
    });

    test('ExecutingAuthorityLevels with duplicates throws error', () => {
        const instanceTestBuilder = aFullInstance().withExecutingAuthorityLevels([ExecutingAuthorityLevelType.LOKAAL, ExecutingAuthorityLevelType.LOKAAL]);
        expect(() => instanceTestBuilder.build()).toThrow(new Error('executingAuthorityLevels should not contain duplicates'));
    });

    test('ExecutingAuthorities with duplicates throws error', () => {
        expect(() => aFullInstance().withExecutingAuthorities([BestuurseenheidTestBuilder.PEPINGEN_IRI, BestuurseenheidTestBuilder.PEPINGEN_IRI]).build()).toThrow(new Error('executingAuthorities should not contain duplicates'));
    });

    test('PublicationMedia with duplicates throws error', () => {
        const instanceTestBuilder = aFullInstance().withPublicationMedia([PublicationMediumType.YOUREUROPE, PublicationMediumType.YOUREUROPE]);
        expect(() => instanceTestBuilder.build()).toThrow(new Error('publicationMedia should not contain duplicates'));
    });

    test('YourEuropeCategories with duplicates throws error', () => {
        const instanceTestBuilder = aFullInstance().withYourEuropeCategories([YourEuropeCategoryType.BEDRIJF, YourEuropeCategoryType.BEDRIJF]);
        expect(() => instanceTestBuilder.build()).toThrow(new Error('yourEuropeCategories should not contain duplicates'));
    });

    test('keywords with duplicates throws error', () => {
        const instanceTestBuilder = aFullInstance().withKeywords([LanguageString.of('overlijden'), LanguageString.of('overlijden')]);
        expect(() => instanceTestBuilder.build()).toThrow(new Error('keywords should not contain duplicates'));
    });

    test('languages with duplicates throws error', () => {
        const instanceTestBuilder = aFullInstance().withLanguages([LanguageType.ENG, LanguageType.ENG]);
        expect(() => instanceTestBuilder.build()).toThrow(new Error('languages should not contain duplicates'));
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

            expect(() => aFullInstance().withRequirements([requirement1, requirement2]).build()).toThrow(new Error('requirements > order should not contain duplicates'));
        });

        test('requirements that have unique does not throw error', () => {
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

            expect(() => aFullInstance().withProcedures([procedure1, procedure2]).build()).toThrow(new Error('procedures > order should not contain duplicates'));
        });

        test('procedures that have unique does not throw error', () => {
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

            expect(() => aFullInstance().withWebsites([website1, website2]).build()).toThrow(new Error('websites > order should not contain duplicates'));
        });

        test('websites that have unique does not throw error', () => {
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

            expect(() => aFullInstance().withCosts([cost1, cost2]).build()).toThrow(new Error('costs > order should not contain duplicates'));
        });

        test('costs that have unique does not throw error', () => {
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

            expect(() => aFullInstance().withFinancialAdvantages([financialAdvantage1, financialAdvantage2]).build()).toThrow(new Error('financial advantages > order should not contain duplicates'));
        });

        test('financial advantages that have unique does not throw error', () => {
            const financialAdvantage1 =
                aMinimalFinancialAdvantageForInstance().withOrder(1).build();
            const financialAdvantage2 =
                aMinimalFinancialAdvantageForInstance().withOrder(2).build();

            expect(() => aFullInstance().withFinancialAdvantages([financialAdvantage1, financialAdvantage2]).build()).not.toThrow();
        });
    });

    describe('contact points ', () => {

        test('contact points that dont have unique order throws error', () => {
            const contactPoint1 =
                aMinimalContactPoint().withOrder(1).build();
            const contactPoint2 =
                aMinimalContactPoint().withOrder(1).build();

            expect(() => aFullInstance().withContactPoints([contactPoint1, contactPoint2]).build()).toThrow(new Error('contact points > order should not contain duplicates'));
        });

        test('contact points that have unique does not throw error', () => {
            const contactPoint1 =
                aMinimalContactPoint().withOrder(1).build();
            const contactPoint2 =
                aMinimalContactPoint().withOrder(2).build();

            expect(() => aFullInstance().withContactPoints([contactPoint1, contactPoint2]).build()).not.toThrow();
        });

    });

    describe('dateCreated', () => {

        test('Undefined dateCreated throws error', () => {
            expect(() => aFullInstance().withDateCreated(undefined).build()).toThrow(new Error('dateCreated should not be absent'));
        });

        test('Blank dateCreated throws error', () => {
            expect(() => aFullInstance().withDateCreated(FormatPreservingDate.of('')).build()).toThrow(new Error('dateCreated should not be absent'));
        });

    });

    describe('dateModified', () => {

        test('Undefined dateModified throws error', () => {
            expect(() => aFullInstance().withDateModified(undefined).build()).toThrow(new Error('dateModified should not be absent'));
        });

        test('Blank dateModified throws error', () => {
            expect(() => aFullInstance().withDateModified(FormatPreservingDate.of('')).build()).toThrow(new Error('dateModified should not be absent'));
        });

    });

    test('When status is verstuurd and dateSent is undefined should throw error', () => {
        const instanceTestBuilder = aFullInstance().withStatus(InstanceStatusType.VERSTUURD).withDateSent(undefined);

        expect(() => instanceTestBuilder.build()).toThrow(new Error('dateSent should be present when status equals verstuurd '));

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

        expect(() => instanceTestBuilder.build()).toThrow(new Error('datePublished can only be present when dateSent is present'));
    });


    test('conceptId, conceptSnapshotId and productId not all defined or all undefined should throw error', () => {
        const instanceTestBuilderWithConcept = aFullInstance()
            .withConceptId(buildConceptIri(uuid()))
            .withConceptSnapshotId(undefined)
            .withProductId(undefined);

        expect(() => instanceTestBuilderWithConcept.build()).toThrow(new Error('conceptId, conceptSnapshotId and productId should all be present or all be absent'));

        const instanceTestBuilderWithConceptSnapshotId = aFullInstance()
            .withConceptId(undefined)
            .withConceptSnapshotId(buildConceptSnapshotIri(uuid()))
            .withProductId(undefined);

        expect(() => instanceTestBuilderWithConceptSnapshotId.build()).toThrow(new Error('conceptId, conceptSnapshotId and productId should all be present or all be absent'));

        const instanceTestBuilderWithProductId = aFullInstance()
            .withConceptId(undefined)
            .withConceptSnapshotId(undefined)
            .withProductId('1300');

        expect(() => instanceTestBuilderWithProductId.build()).toThrow(new Error('conceptId, conceptSnapshotId and productId should all be present or all be absent'));
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
        expect(() => aFullInstance().withStatus(undefined).build()).toThrow(new Error('status should not be absent'));
    });

    test('Spatials with duplicates throws error', () => {
        expect(() => aFullInstance().withSpatials([buildSpatialRefNis2019Iri(1), buildSpatialRefNis2019Iri(1)]).build()).toThrow(new Error('spatials should not contain duplicates'));
    });

    test('legalResources with duplicates throws error', () => {
        const iri = uuid();
        const instanceTestBuilder = aFullInstance().withLegalResources([buildCodexVlaanderenIri(iri), buildCodexVlaanderenIri(iri)]);
        expect(() => instanceTestBuilder.build()).toThrow(new Error('legalResources should not contain duplicates'));
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

        expect(() => instance.build()).toThrow(new Error('reviewStatus can only be present when concept is present'));
    });

});

describe('validateLanguages', () => {

    const validLanguages = [Language.NL, Language.FORMAL, Language.INFORMAL];
    const invalidLanguages = [Language.GENERATED_FORMAL, Language.GENERATED_INFORMAL];

    test('if values have different nl language strings, then throws error', () => {
        const title = LanguageString.of(undefined, 'nl', undefined);
        const description = LanguageString.of(undefined, undefined, 'nl-formal');

        const instance = aFullInstance().withTitle(title).withDescription(description);

        expect(() => instance.build()).toThrow(new Error('There is more than one Nl language present'));
    });
    test('if 1 value has different nl language strings, then throws error', () => {
        const title = LanguageString.of(undefined, 'nl', 'nl-formal');
        const description = LanguageString.of(undefined, undefined, undefined);

        const instance = aFullInstance().withTitle(title).withDescription(description);

        expect(() => instance.build()).toThrow(new Error('There is more than one Nl language present'));
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

    test('if a nested object contains a different nl version, then throws error', () => {
        const website = aFullWebsiteForInstance().withTitle(LanguageString.of(undefined, undefined, undefined, 'nl-informal')).build();
        const instance = aFullInstance().withWebsites([website]);

        expect(() => instance.build()).toThrow(new Error('There is more than one Nl language present'));
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
            expect(() => (instance.build())).toThrow(new Error(`The nl language differs from ${validLanguages.toString()}`));
        });
        test('If description contains invalid language, throws error', () => {
            const instance = aMinimalInstance().withDescription(valueInNlLanguage);
            expect(() => (instance.build())).toThrow(new Error(`The nl language differs from ${validLanguages.toString()}`));
        });
        test('If additionalDescription contains invalid language, throws error', () => {
            const instance = aMinimalInstance().withAdditionalDescription(valueInNlLanguage);
            expect(() => (instance.build())).toThrow(new Error(`The nl language differs from ${validLanguages.toString()}`));
        });
        test('If exception contains invalid language, throws error', () => {
            const instance = aMinimalInstance().withException(valueInNlLanguage);
            expect(() => (instance.build())).toThrow(new Error(`The nl language differs from ${validLanguages.toString()}`));
        });
        test('If regulation contains invalid language, throws error', () => {
            const instance = aMinimalInstance().withRegulation(valueInNlLanguage);
            expect(() => (instance.build())).toThrow(new Error(`The nl language differs from ${validLanguages.toString()}`));
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

describe('nl language version', () => {

    test('title, description, additional description, exception, regulation, requirements, procedures, websites missing, returns undefined', () => {
        const instance =
            aMinimalInstance()
                .withTitle(undefined)
                .withDescription(undefined)
                .withAdditionalDescription(undefined)
                .withException(undefined)
                .withRegulation(undefined)
                .withRequirements([])
                .withProcedures([])
                .withWebsites([])
                .withCosts([])
                .withFinancialAdvantages([])
                .build();
        expect(instance.instanceNlLanguage).toBeUndefined();
    });


    for (const nlLanguage of [Language.NL, Language.FORMAL, Language.INFORMAL]) {

        let valueInNlLanguage: LanguageString;
        if (nlLanguage === Language.NL) {
            valueInNlLanguage = LanguageString.of(`value ${uuid()} en`, `value ${uuid()} in nl`, undefined, undefined, undefined, undefined);
        } else if (nlLanguage == Language.FORMAL) {
            valueInNlLanguage = LanguageString.of(`value ${uuid()} en`, undefined, `value ${uuid()} in nl formal`, undefined, undefined, undefined);
        } else if (nlLanguage == Language.INFORMAL) {
            valueInNlLanguage = LanguageString.of(`value ${uuid()} en`, undefined, undefined, `value ${uuid()} in nl informal`, undefined, undefined);
        }


        test(`title has nl language ${nlLanguage}`, () => {
            const instance =
                aMinimalInstance()
                    .withTitle(valueInNlLanguage)
                    .withDescription(undefined)
                    .withAdditionalDescription(undefined)
                    .withException(undefined)
                    .withRegulation(undefined)
                    .build();
            expect(instance.instanceNlLanguage).toEqual(nlLanguage);
        });

        test(`description has nl language ${nlLanguage}`, () => {
            const instance =
                aMinimalInstance()
                    .withTitle(undefined)
                    .withDescription(valueInNlLanguage)
                    .withAdditionalDescription(undefined)
                    .withException(undefined)
                    .withRegulation(undefined)
                    .build();
            expect(instance.instanceNlLanguage).toEqual(nlLanguage);
        });

        test(`additional Description has nl language ${nlLanguage}`, () => {
            const instance =
                aMinimalInstance()
                    .withTitle(undefined)
                    .withDescription(undefined)
                    .withAdditionalDescription(valueInNlLanguage)
                    .withException(undefined)
                    .withRegulation(undefined)
                    .build();
            expect(instance.instanceNlLanguage).toEqual(nlLanguage);
        });


        test(`exception has nl language ${nlLanguage}`, () => {
            const instance =
                aMinimalInstance()
                    .withTitle(undefined)
                    .withDescription(undefined)
                    .withAdditionalDescription(undefined)
                    .withException(valueInNlLanguage)
                    .withRegulation(undefined)
                    .build();
            expect(instance.instanceNlLanguage).toEqual(nlLanguage);
        });

        test(`regulation has nl language ${nlLanguage}`, () => {
            const instance =
                aMinimalInstance()
                    .withTitle(undefined)
                    .withDescription(undefined)
                    .withAdditionalDescription(undefined)
                    .withException(undefined)
                    .withRegulation(valueInNlLanguage)
                    .build();
            expect(instance.instanceNlLanguage).toEqual(nlLanguage);
        });

        test(`requirement has nl language ${nlLanguage}`, () => {
            const instance =
                aMinimalInstance()
                    .withTitle(undefined)
                    .withDescription(undefined)
                    .withAdditionalDescription(undefined)
                    .withException(undefined)
                    .withRegulation(undefined)
                    .withRequirements(
                        [
                            aMinimalRequirementForInstance()
                                .withTitle(valueInNlLanguage)
                                .build()])
                    .build();
            expect(instance.instanceNlLanguage).toEqual(nlLanguage);
        });

        test(`procedure has nl language ${nlLanguage}`, () => {
            const instance =
                aMinimalInstance()
                    .withTitle(undefined)
                    .withDescription(undefined)
                    .withAdditionalDescription(undefined)
                    .withException(undefined)
                    .withRegulation(undefined)
                    .withProcedures(
                        [
                            aMinimalProcedureForInstance()
                                .withTitle(valueInNlLanguage)
                                .build()])
                    .build();
            expect(instance.instanceNlLanguage).toEqual(nlLanguage);
        });

        test(`website has nl language ${nlLanguage}`, () => {
            const instance =
                aMinimalInstance()
                    .withTitle(undefined)
                    .withDescription(undefined)
                    .withAdditionalDescription(undefined)
                    .withException(undefined)
                    .withRegulation(undefined)
                    .withWebsites(
                        [
                            aMinimalWebsiteForInstance()
                                .withTitle(valueInNlLanguage)
                                .build()])
                    .build();
            expect(instance.instanceNlLanguage).toEqual(nlLanguage);
        });


        test(`cost has nl language ${nlLanguage}`, () => {
            const instance =
                aMinimalInstance()
                    .withTitle(undefined)
                    .withDescription(undefined)
                    .withAdditionalDescription(undefined)
                    .withException(undefined)
                    .withRegulation(undefined)
                    .withCosts(
                        [
                            aMinimalCostForInstance()
                                .withTitle(valueInNlLanguage)
                                .build()
                        ]
                    )
                    .build();
            expect(instance.instanceNlLanguage).toEqual(nlLanguage);
        });

        test(`financial advantage has nl language ${nlLanguage}`, () => {
            const instance =
                aMinimalInstance()
                    .withTitle(undefined)
                    .withDescription(undefined)
                    .withAdditionalDescription(undefined)
                    .withException(undefined)
                    .withRegulation(undefined)
                    .withFinancialAdvantages(
                        [
                            aMinimalFinancialAdvantageForInstance()
                                .withTitle(valueInNlLanguage)
                                .build()
                        ]
                    )
                    .build();
            expect(instance.instanceNlLanguage).toEqual(nlLanguage);
        });


        test(`title, description, additional description, exception, regulation, requirement, procedure, website, cost, financial advantage all have nl Language ${nlLanguage}`, () => {
            const instance =
                aMinimalInstance()
                    .withTitle(valueInNlLanguage)
                    .withDescription(valueInNlLanguage)
                    .withAdditionalDescription(valueInNlLanguage)
                    .withException(valueInNlLanguage)
                    .withRegulation(valueInNlLanguage)
                    .withRequirements(
                        [
                            aMinimalRequirementForInstance()
                                .withTitle(valueInNlLanguage)
                                .build()])
                    .withProcedures(
                        [
                            aMinimalProcedureForInstance()
                                .withTitle(valueInNlLanguage)
                                .build()])
                    .withWebsites(
                        [
                            aMinimalWebsiteForInstance()
                                .withTitle(valueInNlLanguage)
                                .build()])
                    .withCosts(
                        [
                            aMinimalCostForInstance()
                                .withTitle(valueInNlLanguage)
                                .build()
                        ])
                    .withFinancialAdvantages(
                        [
                            aMinimalFinancialAdvantageForInstance()
                                .withTitle(valueInNlLanguage)
                                .build()
                        ])
                    .build();
            expect(instance.instanceNlLanguage).toEqual(nlLanguage);
        });

    }

});

describe('reopen', () => {

    test('should update status and modified date', () => {
        const instance = aFullInstance()
            .withStatus(InstanceStatusType.VERSTUURD)
            .withPublicationStatus(undefined)
            .withDatePublished(undefined)
            .build();

        const updatedInstance = instance.reopen();

        expect(updatedInstance).toEqual(InstanceBuilder.from(instance)
            .withStatus(InstanceStatusType.ONTWERP)
            .withDateModified(FormatPreservingDate.now())
            .build());
    });

    test('should throw error when instance status is ontwerp', () => {
        const instance = aFullInstance()
            .withStatus(InstanceStatusType.ONTWERP)
            .withPublicationStatus(undefined)
            .withDatePublished(undefined)
            .build();

        expect(() => instance.reopen()).toThrow(new Error('Instance status already in ontwerp'));
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
            .withDateModified(FormatPreservingDate.now())
            .build());
    });
});

describe('publish', () => {

    test('should update status and modified date', () => {
        const instance = aMinimalInstance()
            .withStatus(InstanceStatusType.ONTWERP)
            .build();

        const updatedInstance = instance.publish();

        expect(updatedInstance).toEqual(InstanceBuilder.from(instance)
            .withStatus(InstanceStatusType.VERSTUURD)
            .withDateModified(FormatPreservingDate.now())
            .withDateSent(FormatPreservingDate.now())
            .build());
    });

    test('should throw error when instance status is Verstuurd', () => {
        const instance = aFullInstance()
            .withStatus(InstanceStatusType.VERSTUURD)
            .build();

        expect(() => instance.publish()).toThrow(new Error('Instance status already has status verstuurd'));
    });

});

describe('builder', () => {

    test("from copies all fields", () => {
        const instance = aFullInstance().build();
        const fromInstance = InstanceBuilder.from(instance).build();

        expect(fromInstance).toEqual(instance);

    });
});
