import {aFullInstance} from "./instance-test-builder";
import {Iri} from "../../../src/core/domain/shared/iri";
import {FormatPreservingDate} from "../../../src/core/domain/format-preserving-date";
import {buildSpatialRefNis2019Iri} from "./iri-test-builder";
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
import {Requirement} from "../../../src/core/domain/requirement";
import {aFullRequirement, RequirementTestBuilder} from "./requirement-test-builder";
import {Evidence} from "../../../src/core/domain/evidence";
import {EvidenceTestBuilder} from "./evidence-test-builder";
import {Procedure} from "../../../src/core/domain/procedure";
import {ProcedureTestBuilder} from "./procedure-test-builder";
import {aMinimalLanguageString} from "./language-string-test-builder";
import {Website} from "../../../src/core/domain/website";
import {WebsiteTestBuilder} from "./website-test-builder";
import {Cost} from "../../../src/core/domain/cost";
import {CostTestBuilder} from "./cost-test-builder";
import {FinancialAdvantage} from "../../../src/core/domain/financial-advantage";
import {FinancialAdvantageTestBuilder} from "./financial-advantage-test-builder";

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
                RequirementTestBuilder.buildIri(uuidValue),
                uuidValue,
                undefined,
                undefined,
                undefined);

            expect(() => aFullInstance().withRequirements([validRequirement]).build()).not.toThrow();
        });

        test('invalid financialAdvantage does throw error', () => {
            const invalidRequirement = Requirement.reconstitute(
                RequirementTestBuilder.buildIri(uuid()),
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
                    EvidenceTestBuilder.buildIri(uuidValue),
                    uuidValue,
                    undefined,
                    undefined,
                );
                const validRequirement = aFullRequirement().withEvidence(validEvidence).build();

                expect(() => aFullInstance().withRequirements([validRequirement]).build()).not.toThrow();
            });

            test('invalid evidence does throw error', () => {
                const uuidValue = uuid();
                const invalidEvidence = Evidence.reconstitute(
                    EvidenceTestBuilder.buildIri(uuidValue),
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
                ProcedureTestBuilder.buildIri(uuidValue),
                uuidValue,
                aMinimalLanguageString(ProcedureTestBuilder.TITLE).build(),
                aMinimalLanguageString(ProcedureTestBuilder.DESCRIPTION).build(),
                []
            );

            expect(() => aFullInstance().withProcedures([validProcedure]).build()).not.toThrow();
        });

        test('invalid procedure does throw error', () => {
            const invalidProcedure = Procedure.reconstitute(ProcedureTestBuilder.buildIri(uuid()), undefined, undefined, undefined, []);

            expect(() => aFullInstance().withProcedures([invalidProcedure]).build()).toThrow();
        });
    });

    describe('website ', () => {
        test('valid website does not throw error', () => {
            const uuidValue = uuid();
            const validWebsite = Website.reconstitute(
                WebsiteTestBuilder.buildIri(uuidValue),
                uuidValue,
                aMinimalLanguageString(WebsiteTestBuilder.TITLE).build(),
                aMinimalLanguageString(WebsiteTestBuilder.DESCRIPTION).build(),
                WebsiteTestBuilder.URL);

            expect(() => aFullInstance().withWebsites([validWebsite]).build()).not.toThrow();
        });

        test('invalid website does throw error', () => {
            const invalidWebsite = Website.reconstitute(WebsiteTestBuilder.buildIri(uuid()), undefined, undefined, undefined, undefined);

            expect(() => aFullInstance().withWebsites([invalidWebsite]).build()).toThrow();
        });
    });

    describe('cost ', () => {
        test('valid cost for concept does not throw error', () => {
            const uuidValue = uuid();
            const validCost = Cost.reconstitute(
                CostTestBuilder.buildIri(uuidValue),
                uuidValue,
                aMinimalLanguageString(CostTestBuilder.TITLE).build(),
                aMinimalLanguageString(CostTestBuilder.DESCRIPTION).build()
            );

            expect(() => aFullInstance().withCosts([validCost]).build()).not.toThrow();
        });

        test('invalid cost for concept does throw error', () => {
            const invalidCost = Cost.reconstitute(CostTestBuilder.buildIri(uuid()), undefined, undefined, undefined);

            expect(() => aFullInstance().withCosts([invalidCost]).build()).toThrow();
        });
    });

    describe('financialAdvantage ', () => {
        test('valid financialAdvantage for concept does not throw error', () => {
            const uuidValue = uuid();
            const validFinancialAdvantage = FinancialAdvantage.reconstitute(FinancialAdvantageTestBuilder.buildIri(uuidValue), uuidValue, aMinimalLanguageString(FinancialAdvantageTestBuilder.TITLE).build(),
                aMinimalLanguageString(FinancialAdvantageTestBuilder.DESCRIPTION).build());

            expect(() => aFullInstance().withFinancialAdvantages([validFinancialAdvantage]).build()).not.toThrow();
        });

        test('invalid financialAdvantage for concept does throw error', () => {
            const invalidFinancialAdvantage = FinancialAdvantage.reconstitute(FinancialAdvantageTestBuilder.buildIri(uuid()), undefined, undefined, undefined);

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

});