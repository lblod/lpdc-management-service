import {
    aFullFinancialAdvantage,
    aFullFinancialAdvantageForInstance,
    aFullFinancialAdvantageForInstanceSnapshot,
    aMinimalFinancialAdvantageForInstance
} from "./financial-advantage-test-builder";
import {FinancialAdvantage} from "../../../src/core/domain/financial-advantage";
import {Iri} from "../../../src/core/domain/shared/iri";
import {Language} from "../../../src/core/domain/language";
import {LanguageString} from "../../../src/core/domain/language-string";
import {uuid} from "../../../mu-helper";

describe('forConcept', () => {

    test('Undefined id throws error', () => {
        const financialAdvantage = aFullFinancialAdvantage().withId(undefined);
        expect(() => FinancialAdvantage.forConcept(financialAdvantage.build())).toThrow(new Error('id should not be absent'));
    });

    test('Invalid iri id throws error', () => {
        expect(() => FinancialAdvantage.forConcept(aFullFinancialAdvantage().withId(new Iri('   ')).build())).toThrow(new Error('iri should not be blank'));
    });

    test('Undefined uuid throws error', () => {
        const financialAdvantage = aFullFinancialAdvantage().withUuid(undefined);
        expect(() => FinancialAdvantage.forConcept(financialAdvantage.build())).toThrow(new Error('uuid should not be absent'));
    });

    test('Blank uuid throws error', () => {
        const financialAdvantage = aFullFinancialAdvantage().withUuid('   ');
        expect(() => FinancialAdvantage.forConcept(financialAdvantage.build())).toThrow(new Error('uuid should not be blank'));
    });

    test('Undefined title throws error', () => {
        const financialAdvantage = aFullFinancialAdvantage().withTitle(undefined);
        expect(() => FinancialAdvantage.forConcept(financialAdvantage.build())).toThrow(new Error('title should not be absent'));
    });

    test('Undefined description throws error', () => {
        const financialAdvantage = aFullFinancialAdvantage().withDescription(undefined);
        expect(() => FinancialAdvantage.forConcept(financialAdvantage.build())).toThrow(new Error('description should not be absent'));
    });

    test('Undefined order throws error', () => {
        expect(() => FinancialAdvantage.forConcept(aFullFinancialAdvantage().withOrder(undefined).build())).toThrow(new Error('order should not be absent'));
    });

});

describe('forConceptSnapshot', () => {

    test('Undefined id throws error', () => {
        const financialAdvantage = aFullFinancialAdvantage().withId(undefined);
        expect(() => FinancialAdvantage.forConceptSnapshot(financialAdvantage.build())).toThrow(new Error('id should not be absent'));
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
        expect(() => FinancialAdvantage.forConceptSnapshot(financialAdvantage)).toThrow(new Error('title should not be absent'));
    });

    test('Undefined description throws error', () => {
        const financialAdvantage = aFullFinancialAdvantage().withDescription(undefined).build();
        expect(() => FinancialAdvantage.forConceptSnapshot(financialAdvantage)).toThrow(new Error('description should not be absent'));
    });

    test('Undefined order throws error', () => {
        expect(() => FinancialAdvantage.forConceptSnapshot(aFullFinancialAdvantage().withOrder(undefined).build())).toThrow(new Error('order should not be absent'));
    });

});

describe('for instance', () => {

    const validLanguages = [Language.NL, Language.FORMAL, Language.INFORMAL];
    const invalidLanguages = [Language.GENERATED_FORMAL, Language.GENERATED_INFORMAL];

    test('Undefined id throws error', () => {
        const financialAdvantage = aFullFinancialAdvantageForInstance().withId(undefined);
        expect(() => FinancialAdvantage.forInstance(financialAdvantage.build())).toThrow(new Error('id should not be absent'));
    });

    test('Undefined Uuid throws error', () => {
        const financialAdvantage = aFullFinancialAdvantageForInstance().withUuid(undefined).build();
        expect(() => FinancialAdvantage.forInstance(financialAdvantage).uuid).toThrow(new Error('uuid should not be absent'));
    });

    test('If title and description have the same nl language financial advantage is created', () => {
        const langString = LanguageString.of('en', 'nl');
        const financialAdvantage = aFullFinancialAdvantageForInstance().withTitle(langString).withDescription(langString).build();
        expect(() => FinancialAdvantage.forInstance(financialAdvantage)).not.toThrow();
    });

    test('If title and description are undefined financial advantage is created', () => {
        const financialAdvantage = aFullFinancialAdvantageForInstance().withTitle(undefined).withDescription(undefined).build();
        expect(() => FinancialAdvantage.forInstance(financialAdvantage)).not.toThrow();
    });

    test('If title and description have different nl languages, throws error', () => {
        const title = LanguageString.of('en', 'nl', undefined);
        const description = LanguageString.of('en', undefined, 'nl-formal');
        const financialAdvantage = aFullFinancialAdvantageForInstance().withTitle(title).withDescription(description).build();

        expect(() => FinancialAdvantage.forInstance(financialAdvantage)).toThrow(new Error('There is more than one Nl language present'));
    });

    test('If title has different nl languages, throws error', () => {
        const title = LanguageString.of('en', 'nl', 'nl-formal');
        const financialAdvantage = aFullFinancialAdvantageForInstance().withTitle(title).withDescription(undefined).build();

        expect(() => FinancialAdvantage.forInstance(financialAdvantage)).toThrow(new Error('There is more than one Nl language present'));
    });

    test('If description has different nl languages, throws error', () => {
        const description = LanguageString.of('en', 'nl', 'nl-formal');
        const financialAdvantage = aFullFinancialAdvantageForInstance().withDescription(description).withTitle(undefined).build();

        expect(() => FinancialAdvantage.forInstance(financialAdvantage)).toThrow(new Error('There is more than one Nl language present'));
    });

    for (const invalidLanguage of invalidLanguages) {
        let valueInNlLanguage: LanguageString;
        if (invalidLanguage === Language.GENERATED_FORMAL) {
            valueInNlLanguage = LanguageString.of(`value en`, undefined, undefined, undefined, 'value in generated formal', undefined);
        } else if (invalidLanguage == Language.GENERATED_INFORMAL) {
            valueInNlLanguage = LanguageString.of(`value en`, undefined, undefined, undefined, undefined, 'value in generated formal');
        }

        test('If title contains invalid language, throws error', () => {
            const financialAdvantage = aFullFinancialAdvantageForInstance().withTitle(valueInNlLanguage).withDescription(undefined).build();
            expect(() => FinancialAdvantage.forInstance(financialAdvantage)).toThrow(new Error(`The nl language differs from ${validLanguages.toString()}`));
        });

        test('If description contains invalid language, throws error', () => {
            const financialAdvantage = aFullFinancialAdvantageForInstance().withDescription(valueInNlLanguage).withTitle(undefined).build();
            expect(() => FinancialAdvantage.forInstance(financialAdvantage)).toThrow(new Error(`The nl language differs from ${validLanguages.toString()}`));
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

        test('If title contains valid language, not throws error', () => {
            const financialAdvantage = aFullFinancialAdvantageForInstance().withTitle(valueInNlLanguage).withDescription(undefined).build();
            expect(() => FinancialAdvantage.forInstance(financialAdvantage)).not.toThrow();
        });

        test('If description contains valid language, throws error', () => {
            const financialAdvantage = aFullFinancialAdvantageForInstance().withDescription(valueInNlLanguage).withTitle(undefined).build();
            expect(() => FinancialAdvantage.forInstance(financialAdvantage)).not.toThrow();
        });
    }

    test('Undefined order throws error', () => {
        expect(() => FinancialAdvantage.forInstance(aFullFinancialAdvantageForInstance().withOrder(undefined).build())).toThrow(new Error('order should not be absent'));
    });

});

describe('for instance snapshot', () => {

    const validLanguages = [Language.NL, Language.FORMAL, Language.INFORMAL];
    const invalidLanguages = [Language.GENERATED_FORMAL, Language.GENERATED_INFORMAL];

    test('Undefined id throws error', () => {
        const financialAdvantage = aFullFinancialAdvantageForInstanceSnapshot().withId(undefined);
        expect(() => FinancialAdvantage.forInstanceSnapshot(financialAdvantage.build())).toThrow(new Error('id should not be absent'));
    });

    test('Undefined Uuid does not throw error', () => {
        const financialAdvantage = aFullFinancialAdvantageForInstanceSnapshot().withUuid(undefined).build();
        expect(FinancialAdvantage.forInstanceSnapshot(financialAdvantage).uuid).toBeUndefined();
    });

    test('Undefined title throws error', () => {
        const financialAdvantage = aFullFinancialAdvantageForInstanceSnapshot().withTitle(undefined);
        expect(() => FinancialAdvantage.forInstanceSnapshot(financialAdvantage.build())).toThrow(new Error('title should not be absent'));
    });

    test('Undefined description throws error', () => {
        const financialAdvantage = aFullFinancialAdvantageForInstanceSnapshot().withDescription(undefined);
        expect(() => FinancialAdvantage.forInstanceSnapshot(financialAdvantage.build())).toThrow(new Error('description should not be absent'));
    });

    test('If title and description have the same nl language financial advantage is created', () => {
        const langString = LanguageString.of('en', 'nl');
        const financialAdvantage = aFullFinancialAdvantageForInstanceSnapshot().withTitle(langString).withDescription(langString).build();
        expect(() => FinancialAdvantage.forInstanceSnapshot(financialAdvantage)).not.toThrow();
    });

    test('If title and description have different nl languages, throws error', () => {
        const title = LanguageString.of('en', 'nl', undefined);
        const description = LanguageString.of('en', undefined, 'nl-formal');
        const financialAdvantage = aFullFinancialAdvantageForInstanceSnapshot().withTitle(title).withDescription(description).build();

        expect(() => FinancialAdvantage.forInstanceSnapshot(financialAdvantage)).toThrow(new Error('There is more than one Nl language present'));
    });

    for (const invalidLanguage of invalidLanguages) {
        let valueInNlLanguage: LanguageString;
        if (invalidLanguage === Language.GENERATED_FORMAL) {
            valueInNlLanguage = LanguageString.of(`value en`, undefined, undefined, undefined, 'value in generated formal', undefined);
        } else if (invalidLanguage == Language.GENERATED_INFORMAL) {
            valueInNlLanguage = LanguageString.of(`value en`, undefined, undefined, undefined, undefined, 'value in generated formal');
        }

        test(`If title or description contains invalid language ${invalidLanguage}, throws error`, () => {
            const financialAdvantage = aFullFinancialAdvantageForInstanceSnapshot().withTitle(valueInNlLanguage).withDescription(valueInNlLanguage).build();
            expect(() => FinancialAdvantage.forInstanceSnapshot(financialAdvantage)).toThrow(new Error(`The nl language differs from ${validLanguages.toString()}`));
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

        test(`If title and description contains valid language ${validLanguage}, not throws error`, () => {
            const financialAdvantage = aFullFinancialAdvantageForInstanceSnapshot().withTitle(valueInNlLanguage).withDescription(valueInNlLanguage).build();
            expect(() => FinancialAdvantage.forInstanceSnapshot(financialAdvantage)).not.toThrow();
        });

    }

    test('Undefined order throws error', () => {
        expect(() => FinancialAdvantage.forInstanceSnapshot(aFullFinancialAdvantageForInstanceSnapshot().withOrder(undefined).build()))
            .toThrow(new Error('order should not be absent'));
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