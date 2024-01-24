import {aFullInstance, aMinimalInstance} from "./instance-test-builder";
import {Iri} from "../../../src/core/domain/shared/iri";
import {FormatPreservingDate} from "../../../src/core/domain/format-preserving-date";
import {buildCodexVlaanderenIri, buildSpatialRefNis2019Iri} from "./iri-test-builder";
import {BestuurseenheidTestBuilder} from "./bestuurseenheid-test-builder";
import {
    CompetentAuthorityLevelType,
    ExecutingAuthorityLevelType,
    LanguageType,
    PublicationMediumType,
    TargetAudienceType,
    ThemeType,
    YourEuropeCategoryType
} from "../../../src/core/domain/types";
import {LanguageString} from "../../../src/core/domain/language-string";
import {uuid} from "../../../mu-helper";
import {Requirement, RequirementBuilder} from "../../../src/core/domain/requirement";
import {aFullRequirement, aMinimalRequirementForInstance} from "./requirement-test-builder";
import {Evidence, EvidenceBuilder} from "../../../src/core/domain/evidence";
import {Procedure, ProcedureBuilder} from "../../../src/core/domain/procedure";
import {aMinimalProcedureForInstance, ProcedureTestBuilder} from "./procedure-test-builder";
import {aMinimalLanguageString} from "./language-string-test-builder";
import {Website, WebsiteBuilder} from "../../../src/core/domain/website";
import {aMinimalWebsiteForInstance, WebsiteTestBuilder} from "./website-test-builder";
import {Cost, CostBuilder} from "../../../src/core/domain/cost";
import {aMinimalCostForInstance, CostTestBuilder} from "./cost-test-builder";
import {FinancialAdvantage, FinancialAdvantageBuilder} from "../../../src/core/domain/financial-advantage";
import {aMinimalFinancialAdvantageForInstance, FinancialAdvantageTestBuilder} from "./financial-advantage-test-builder";
import {Language} from "../../../src/core/domain/language";

describe('constructing', () => {
    test('Undefined id throws error', () => {
        expect(() => aFullInstance().withId(undefined).build()).toThrow(new Error('id should not be undefined'));
    });

    test('Invalid iri id throws error', () => {
        expect(() => aFullInstance().withId(new Iri('  ')).build()).toThrow(new Error('iri should not be blank'));
    });

    test('Undefined createdBy throws error', () => {
        expect(() => aFullInstance().withCreatedBy(undefined).build()).toThrow(new Error('createdBy should not be undefined'));
    });

    test('Invalid iri createdBy throws error', () => {
        expect(() => aFullInstance().withCreatedBy(new Iri('  ')).build()).toThrow(new Error('iri should not be blank'));
    });

    test('Undefined uuid throws error', () => {
        expect(() => aFullInstance().withUuid(undefined).build()).toThrow(new Error('uuid should not be undefined'));
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

    describe('requirement ', () => {
        test('valid requirement does not throw error', () => {
            const uuidValue = uuid();
            const validRequirement = Requirement.reconstitute(
                RequirementBuilder.buildIri(uuidValue),
                uuidValue,
                undefined,
                undefined,
                undefined,
                undefined
            );

            expect(() => aFullInstance().withRequirements([validRequirement]).build()).not.toThrow();
        });

        test('invalid financialAdvantage does throw error', () => {
            const invalidRequirement = Requirement.reconstitute(
                RequirementBuilder.buildIri(uuid()),
                undefined,
                undefined,
                undefined,
                undefined,
                undefined
            );

            expect(() => aFullInstance().withRequirements([invalidRequirement]).build()).toThrow();
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
                const validRequirement = aFullRequirement().withEvidence(validEvidence).build();

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
                const invalidRequirement = aFullRequirement().withEvidence(invalidEvidence).build();

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
                aMinimalLanguageString(ProcedureTestBuilder.TITLE).build(),
                aMinimalLanguageString(ProcedureTestBuilder.DESCRIPTION).build(),
                [],
                undefined
            );

            expect(() => aFullInstance().withProcedures([validProcedure]).build()).not.toThrow();
        });

        test('invalid procedure does throw error', () => {
            const invalidProcedure = Procedure.reconstitute(ProcedureBuilder.buildIri(uuid()), undefined, undefined, undefined, [], undefined);

            expect(() => aFullInstance().withProcedures([invalidProcedure]).build()).toThrow();
        });
    });

    describe('website ', () => {
        test('valid website does not throw error', () => {
            const uuidValue = uuid();
            const validWebsite = Website.reconstitute(
                WebsiteBuilder.buildIri(uuidValue),
                uuidValue,
                aMinimalLanguageString(WebsiteTestBuilder.TITLE).build(),
                aMinimalLanguageString(WebsiteTestBuilder.DESCRIPTION).build(),
                WebsiteTestBuilder.URL,
                undefined
            );

            expect(() => aFullInstance().withWebsites([validWebsite]).build()).not.toThrow();
        });

        test('invalid website does throw error', () => {
            const invalidWebsite = Website.reconstitute(WebsiteBuilder.buildIri(uuid()), undefined, undefined, undefined, undefined, undefined);

            expect(() => aFullInstance().withWebsites([invalidWebsite]).build()).toThrow();
        });
    });

    describe('cost ', () => {
        test('valid cost for instance does not throw error', () => {
            const uuidValue = uuid();
            const validCost = Cost.reconstitute(
                CostBuilder.buildIri(uuidValue),
                uuidValue,
                aMinimalLanguageString(CostTestBuilder.TITLE).build(),
                aMinimalLanguageString(CostTestBuilder.DESCRIPTION).build(),
                undefined
            );

            expect(() => aFullInstance().withCosts([validCost]).build()).not.toThrow();
        });

        test('invalid cost for instance does throw error', () => {
            const invalidCost = Cost.reconstitute(CostBuilder.buildIri(uuid()), undefined, undefined, undefined, undefined);

            expect(() => aFullInstance().withCosts([invalidCost]).build()).toThrow();
        });
    });

    describe('financialAdvantage ', () => {
        test('valid financialAdvantage for instance does not throw error', () => {
            const uuidValue = uuid();
            const validFinancialAdvantage = FinancialAdvantage.reconstitute(FinancialAdvantageBuilder.buildIri(uuidValue), uuidValue, aMinimalLanguageString(FinancialAdvantageTestBuilder.TITLE).build(),
                aMinimalLanguageString(FinancialAdvantageTestBuilder.DESCRIPTION).build(), undefined);

            expect(() => aFullInstance().withFinancialAdvantages([validFinancialAdvantage]).build()).not.toThrow();
        });

        test('invalid financialAdvantage for instance does throw error', () => {
            const invalidFinancialAdvantage = FinancialAdvantage.reconstitute(FinancialAdvantageBuilder.buildIri(uuid()), undefined, undefined, undefined, undefined);

            expect(() => aFullInstance().withFinancialAdvantages([invalidFinancialAdvantage]).build()).toThrow();
        });
    });

    describe('dateCreated', () => {

        test('Invalid dateCreated throws error', () => {
            expect(() => aFullInstance().withDateCreated(FormatPreservingDate.of(undefined)).build()).toThrow(new Error('dateCreated should not be undefined'));
        });

        test('Undefined dateCreated throws error', () => {
            expect(() => aFullInstance().withDateCreated(undefined).build()).toThrow(new Error('dateCreated should not be undefined'));
        });
        test('Blank dateCreated throws error', () => {
            expect(() => aFullInstance().withDateCreated(FormatPreservingDate.of('')).build()).toThrow(new Error('dateCreated should not be undefined'));
        });
    });

    describe('dateModified', () => {

        test('Invalid dateModified throws error', () => {
            expect(() => aFullInstance().withDateModified(FormatPreservingDate.of(undefined)).build()).toThrow(new Error('dateModified should not be undefined'));
        });

        test('Undefined dateModified throws error', () => {
            expect(() => aFullInstance().withDateModified(undefined).build()).toThrow(new Error('dateModified should not be undefined'));
        });
        test('Blank dateModified throws error', () => {
            expect(() => aFullInstance().withDateModified(FormatPreservingDate.of('')).build()).toThrow(new Error('dateModified should not be undefined'));
        });
    });

    test('Absent status throws error', () => {
        expect(() => aFullInstance().withStatus(undefined).build()).toThrow(new Error('status should not be undefined'));
    });

    test('Spatials with duplicates throws error', () => {
        expect(() => aFullInstance().withSpatials([buildSpatialRefNis2019Iri(1), buildSpatialRefNis2019Iri(1)]).build()).toThrow(new Error('spatials should not contain duplicates'));
    });

    test('legalResources with duplicates throws error', () => {
        const iri = uuid();
        const instanceTestBuilder = aFullInstance().withLegalResources([buildCodexVlaanderenIri(iri), buildCodexVlaanderenIri(iri)]);
        expect(() => instanceTestBuilder.build()).toThrow(new Error('legalResources should not contain duplicates'));
    });


});

describe('validateLanguages',()=>{
    test('if values have different nl language strings, then throws error',()=>{
        const title = LanguageString.of(undefined,'nl',undefined);
        const description = LanguageString.of(undefined, undefined,'nl-formal');

        const instance = aFullInstance().withTitle(title).withDescription(description);

        expect(()=>instance.build()).toThrow(new Error('More then 1 nl-language is present'));
    });
    test('if 1 value has different nl language strings, then throws error',()=>{
        const title = LanguageString.of(undefined,'nl','nl-formal');
        const description = LanguageString.of(undefined, undefined,undefined);

        const instance = aFullInstance().withTitle(title).withDescription(description);

        expect(()=>instance.build()).toThrow(new Error('More then 1 nl-language is present'));
    });

    test('if values have no nl language strings, then no error is thrown',()=>{
        const title = LanguageString.of(undefined,undefined,undefined);
        const description = LanguageString.of(undefined, undefined,undefined);

        const instance = aFullInstance().withTitle(title).withDescription(description);

        expect(()=>instance.build()).not.toThrow(new Error());
    });

    test('if values have 1 nl language string but non-consistent en language strings, then no error is thrown',()=>{
        const title = LanguageString.of(undefined,undefined,undefined);
        const description = LanguageString.of('en', undefined,undefined);

        const instance = aFullInstance().withTitle(title).withDescription(description);

        expect(()=>instance.build()).not.toThrow(new Error());
    });

    test('if only 1 value has 1 nl language string, then no error is thrown',()=>{
        const title = LanguageString.of(undefined,undefined,undefined);
        const description = LanguageString.of('en', 'nl',undefined);

        const instance = aFullInstance().withTitle(title).withDescription(description);

        expect(()=>instance.build()).not.toThrow(new Error());
    });
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