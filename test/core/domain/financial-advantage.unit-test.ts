import {aFullFinancialAdvantage, aMinimalFinancialAdvantageForInstance} from "./financial-advantage-test-builder";
import {FinancialAdvantage} from "../../../src/core/domain/financial-advantage";
import {Iri} from "../../../src/core/domain/shared/iri";
import {Language} from "../../../src/core/domain/language";
import {LanguageString} from "../../../src/core/domain/language-string";
import {uuid} from "../../../mu-helper";

describe('forConcept', () => {
    test('Undefined id throws error', () => {
        const financialAdvantage = aFullFinancialAdvantage().withId(undefined);
        expect(() => FinancialAdvantage.forConcept(financialAdvantage.build())).toThrow(new Error('id should not be undefined'));
    });
    test('Invalid iri id throws error', () => {
        expect(() => FinancialAdvantage.forConcept(aFullFinancialAdvantage().withId(new Iri('   ')).build())).toThrow(new Error('iri should not be blank'));
    });

    test('Undefined uuid throws error', () => {
        const financialAdvantage = aFullFinancialAdvantage().withUuid(undefined);
        expect(() => FinancialAdvantage.forConcept(financialAdvantage.build())).toThrow(new Error('uuid should not be undefined'));
    });
    test('Blank uuid throws error', () => {
        const financialAdvantage = aFullFinancialAdvantage().withUuid('   ');
        expect(() => FinancialAdvantage.forConcept(financialAdvantage.build())).toThrow(new Error('uuid should not be blank'));
    });

    test('Undefined title throws error', () => {
        const financialAdvantage = aFullFinancialAdvantage().withTitle(undefined);
        expect(() => FinancialAdvantage.forConcept(financialAdvantage.build())).toThrow(new Error('title should not be undefined'));
    });

    test('Undefined description throws error', () => {
        const financialAdvantage = aFullFinancialAdvantage().withDescription(undefined);
        expect(() => FinancialAdvantage.forConcept(financialAdvantage.build())).toThrow(new Error('description should not be undefined'));
    });
});

describe('forConceptSnapshot', () => {

    test('Undefined id throws error', () => {
        const financialAdvantage = aFullFinancialAdvantage().withId(undefined);
        expect(() => FinancialAdvantage.forConceptSnapshot(financialAdvantage.build())).toThrow(new Error('id should not be undefined'));
    });
    test('Invalid iri id throws error', () => {
        expect(() => FinancialAdvantage.forConceptSnapshot(aFullFinancialAdvantage().withId(new Iri('   ')).build())).toThrow(new Error('iri should not be blank'));
    });
    test('Uuid is undefined ', () => {
        const financialAdvantage = aFullFinancialAdvantage().build();
        expect(FinancialAdvantage.forConceptSnapshot(financialAdvantage).uuid).toBeUndefined();
    });
    test('Undefined title throws error', () => {
        const financialAdvantage = aFullFinancialAdvantage().withTitle(undefined).build();
        expect(() => FinancialAdvantage.forConceptSnapshot(financialAdvantage)).toThrow(new Error('title should not be undefined'));
    });
    test('Undefined description throws error', () => {
        const financialAdvantage = aFullFinancialAdvantage().withDescription(undefined).build();
        expect(() => FinancialAdvantage.forConceptSnapshot(financialAdvantage)).toThrow(new Error('description should not be undefined'));
    });

});

describe('nl language', () => {

    test('empty financial advantage has no nl language', () => {
        const financialAdvantage
            = aMinimalFinancialAdvantageForInstance()
            .withTitle(undefined)
            .withDescription(undefined)
            .build();
        expect(financialAdvantage.nlLanguage).toBeUndefined();
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
            const financialAdvantage
                = aMinimalFinancialAdvantageForInstance()
                .withTitle(valueInNlLanguage)
                .withDescription(undefined)
                .build();
            expect(financialAdvantage.nlLanguage).toEqual(nlLanguage);
        });


        test(`description has nl language ${nlLanguage}`, () => {
            const financialAdvantage
                = aMinimalFinancialAdvantageForInstance()
                .withTitle(undefined)
                .withDescription(valueInNlLanguage)
                .build();
            expect(financialAdvantage.nlLanguage).toEqual(nlLanguage);
        });


        test(`title, description have nl language ${nlLanguage}`, () => {
            const financialAdvantage
                = aMinimalFinancialAdvantageForInstance()
                .withTitle(valueInNlLanguage)
                .withDescription(valueInNlLanguage)
                .build();
            expect(financialAdvantage.nlLanguage).toEqual(nlLanguage);
        });

    }

});