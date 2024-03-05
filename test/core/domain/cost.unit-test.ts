import {
    aFullCost,
    aFullCostForInstance,
    aFullCostForInstanceSnapshot,
    aMinimalCostForInstance
} from "./cost-test-builder";
import {Cost} from "../../../src/core/domain/cost";
import {Iri} from "../../../src/core/domain/shared/iri";
import {Language} from "../../../src/core/domain/language";
import {LanguageString} from "../../../src/core/domain/language-string";
import {uuid} from "../../../mu-helper";
import {InvariantError} from "../../../src/core/domain/shared/lpdc-error";

describe('forConcept', () => {

    test('Undefined id throws error', () => {
        const cost = aFullCost().withId(undefined);
        expect(() => Cost.forConcept(cost.build())).toThrowWithMessage(InvariantError, 'id should not be absent');
    });

    test('Invalid iri id throws error', () => {
        expect(() => Cost.forConcept(aFullCost().withId(new Iri('   ')).build())).toThrowWithMessage(InvariantError, 'iri should not be blank');
    });

    test('Undefined uuid throws error', () => {
        const cost = aFullCost().withUuid(undefined);
        expect(() => Cost.forConcept(cost.build())).toThrowWithMessage(InvariantError, 'uuid should not be absent');
    });

    test('Blank uuid throws error', () => {
        const cost = aFullCost().withUuid('   ');
        expect(() => Cost.forConcept(cost.build())).toThrowWithMessage(InvariantError, 'uuid should not be blank');
    });

    test('Undefined title throws error', () => {
        const cost = aFullCost().withTitle(undefined);
        expect(() => Cost.forConcept(cost.build())).toThrowWithMessage(InvariantError, 'title should not be absent');
    });

    test('Undefined description throws error', () => {
        const cost = aFullCost().withDescription(undefined);
        expect(() => Cost.forConcept(cost.build())).toThrowWithMessage(InvariantError, 'description should not be absent');
    });

    test('Undefined order throws error', () => {
        const cost = aFullCost().withOrder(undefined);
        expect(() => Cost.forConcept(cost.build())).toThrowWithMessage(InvariantError, 'order should not be absent');
    });

});

describe('forReconstituted', () => {

    test('Undefined order throws error', () => {
        expect(() => aFullCost().withOrder(undefined).build()).toThrowWithMessage(InvariantError, 'order should not be absent');
    });

});

describe('forConceptSnapshot', () => {

    test('Undefined id throws error', () => {
        const cost = aFullCost().withId(undefined);
        expect(() => Cost.forConceptSnapshot(cost.build())).toThrowWithMessage(InvariantError, 'id should not be absent');
    });

    test('Uuid is undefined ', () => {
        const cost = aFullCost().build();
        expect(Cost.forConceptSnapshot(cost).uuid).toBeUndefined();
    });

    test('Undefined title throws error', () => {
        const cost = aFullCost().withTitle(undefined).build();
        expect(() => Cost.forConceptSnapshot(cost)).toThrowWithMessage(InvariantError, 'title should not be absent');
    });

    test('Undefined description throws error', () => {
        const cost = aFullCost().withDescription(undefined).build();
        expect(() => Cost.forConceptSnapshot(cost)).toThrowWithMessage(InvariantError, 'description should not be absent');
    });

    test('Undefined order throws error', () => {
        expect(() => Cost.forConceptSnapshot(aFullCost().withOrder(undefined).build())).toThrowWithMessage(InvariantError, 'order should not be absent');
    });

});

describe('for instance', () => {

    const validLanguages = [Language.NL, Language.FORMAL, Language.INFORMAL];
    const invalidLanguages = [Language.GENERATED_FORMAL, Language.GENERATED_INFORMAL];

    test('Undefined id throws error', () => {
        const cost = aFullCostForInstance().withId(undefined);
        expect(() => Cost.forInstance(cost.build())).toThrowWithMessage(InvariantError, 'id should not be absent');
    });

    test('Undefined Uuid throws error', () => {
        const cost = aFullCostForInstance().withUuid(undefined).build();
        expect(() => Cost.forInstance(cost).uuid).toThrowWithMessage(InvariantError, 'uuid should not be absent');
    });

    test('If title and description have the same nl language cost is created', () => {
        const langString = LanguageString.of('en', 'nl');
        const cost = aFullCostForInstance().withTitle(langString).withDescription(langString).build();
        expect(() => Cost.forInstance(cost)).not.toThrow();
    });

    test('If title and description are undefined cost is created', () => {
        const cost = aFullCostForInstance().withTitle(undefined).withDescription(undefined).build();
        expect(() => Cost.forInstance(cost)).not.toThrow();
    });

    test('If title and description have different nl languages, throws error', () => {
        const title = LanguageString.of('en', 'nl', undefined);
        const description = LanguageString.of('en', undefined, 'nl-formal');
        const cost = aFullCostForInstance().withTitle(title).withDescription(description).build();

        expect(() => Cost.forInstance(cost)).toThrowWithMessage(InvariantError, 'There is more than one Nl language present');
    });

    test('If title has different nl languages, throws error', () => {
        const title = LanguageString.of('en', 'nl', 'nl-formal');
        const cost = aFullCostForInstance().withTitle(title).withDescription(undefined).build();

        expect(() => Cost.forInstance(cost)).toThrowWithMessage(InvariantError, 'There is more than one Nl language present');
    });

    test('If description has different nl languages, throws error', () => {
        const description = LanguageString.of('en', 'nl', 'nl-formal');
        const cost = aFullCostForInstance().withDescription(description).withTitle(undefined).build();

        expect(() => Cost.forInstance(cost)).toThrowWithMessage(InvariantError, 'There is more than one Nl language present');
    });

    for (const invalidLanguage of invalidLanguages) {
        let valueInNlLanguage: LanguageString;
        if (invalidLanguage === Language.GENERATED_FORMAL) {
            valueInNlLanguage = LanguageString.of(`value en`, undefined, undefined, undefined, 'value in generated formal', undefined);
        } else if (invalidLanguage == Language.GENERATED_INFORMAL) {
            valueInNlLanguage = LanguageString.of(`value en`, undefined, undefined, undefined, undefined, 'value in generated formal');
        }
        test('If title contains invalid language, throws error', () => {
            const cost = aFullCostForInstance().withTitle(valueInNlLanguage).withDescription(undefined).build();
            expect(() => Cost.forInstance(cost)).toThrowWithMessage(InvariantError, `The nl language differs from ${validLanguages.toString()}`);
        });

        test('If description contains invalid language, throws error', () => {
            const cost = aFullCostForInstance().withDescription(valueInNlLanguage).withTitle(undefined).build();
            expect(() => Cost.forInstance(cost)).toThrowWithMessage(InvariantError, `The nl language differs from ${validLanguages.toString()}`);
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
            const cost = aFullCostForInstance().withTitle(valueInNlLanguage).withDescription(undefined).build();
            expect(() => Cost.forInstance(cost)).not.toThrow();
        });

        test('If description contains valid language, throws error', () => {
            const cost = aFullCostForInstance().withDescription(valueInNlLanguage).withTitle(undefined).build();
            expect(() => Cost.forInstance(cost)).not.toThrow();
        });
    }

    test('Undefined order throws error', () => {
        expect(() => Cost.forInstance(aFullCostForInstance().withOrder(undefined).build()).uuid).toThrowWithMessage(InvariantError, 'order should not be absent');
    });

});

describe('for instance snapshot', () => {

    const validLanguages = [Language.NL, Language.FORMAL, Language.INFORMAL];
    const invalidLanguages = [Language.GENERATED_FORMAL, Language.GENERATED_INFORMAL];

    test('Undefined id throws error', () => {
        const cost = aFullCostForInstanceSnapshot().withId(undefined);
        expect(() => Cost.forInstanceSnapshot(cost.build())).toThrowWithMessage(InvariantError, 'id should not be absent');
    });

    test('Undefined Uuid does not throw error', () => {
        const cost = aFullCostForInstanceSnapshot().withUuid(undefined).build();
        expect(Cost.forInstanceSnapshot(cost).uuid).toBeUndefined();
    });

    test('Undefined title throws error', () => {
        const cost = aFullCostForInstanceSnapshot().withTitle(undefined);
        expect(() => Cost.forInstanceSnapshot(cost.build())).toThrowWithMessage(InvariantError, 'title should not be absent');
    });

    test('Undefined description throws error', () => {
        const cost = aFullCostForInstanceSnapshot().withDescription(undefined);
        expect(() => Cost.forInstanceSnapshot(cost.build())).toThrowWithMessage(InvariantError, 'description should not be absent');
    });

    test('If title and description have the same nl language cost is created', () => {
        const langString = LanguageString.of('en', 'nl');
        const cost = aFullCostForInstanceSnapshot().withTitle(langString).withDescription(langString).build();
        expect(() => Cost.forInstanceSnapshot(cost)).not.toThrow();
    });

    test('If title and description have different nl languages, throws error', () => {
        const title = LanguageString.of('en', 'nl', undefined);
        const description = LanguageString.of('en', undefined, 'nl-formal');
        const cost = aFullCostForInstanceSnapshot().withTitle(title).withDescription(description).build();

        expect(() => Cost.forInstanceSnapshot(cost)).toThrowWithMessage(InvariantError, 'There is more than one Nl language present');
    });

    for (const invalidLanguage of invalidLanguages) {
        let valueInNlLanguage: LanguageString;
        if (invalidLanguage === Language.GENERATED_FORMAL) {
            valueInNlLanguage = LanguageString.of(`value en`, undefined, undefined, undefined, 'value in generated formal', undefined);
        } else if (invalidLanguage == Language.GENERATED_INFORMAL) {
            valueInNlLanguage = LanguageString.of(`value en`, undefined, undefined, undefined, undefined, 'value in generated formal');
        }

        test(`If title and description contains invalid language ${invalidLanguage}, throws error`, () => {
            const cost = aFullCostForInstanceSnapshot().withTitle(valueInNlLanguage).withDescription(valueInNlLanguage).build();
            expect(() => Cost.forInstanceSnapshot(cost)).toThrowWithMessage(InvariantError, `The nl language differs from ${validLanguages.toString()}`);
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
            const cost = aFullCostForInstanceSnapshot().withTitle(valueInNlLanguage).withDescription(valueInNlLanguage).build();
            expect(() => Cost.forInstanceSnapshot(cost)).not.toThrow();
        });
    }

    test('Undefined order throws error', () => {
        expect(() => Cost.forInstanceSnapshot(aFullCostForInstanceSnapshot().withOrder(undefined).build()))
            .toThrowWithMessage(InvariantError, 'order should not be absent');
    });

});


describe('nl Language', () => {

    test('empty cost has no nl language', () => {
        const cost
            = aMinimalCostForInstance()
            .withTitle(undefined)
            .withDescription(undefined)
            .build();
        expect(cost.nlLanguage).toBeUndefined();
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
            const cost
                = aMinimalCostForInstance()
                .withTitle(valueInNlLanguage)
                .withDescription(undefined)
                .build();
            expect(cost.nlLanguage).toEqual(nlLanguage);
        });


        test(`description has nl language ${nlLanguage}`, () => {
            const cost
                = aMinimalCostForInstance()
                .withTitle(undefined)
                .withDescription(valueInNlLanguage)
                .build();
            expect(cost.nlLanguage).toEqual(nlLanguage);
        });


        test(`title, description have nl language ${nlLanguage}`, () => {
            const cost
                = aMinimalCostForInstance()
                .withTitle(valueInNlLanguage)
                .withDescription(valueInNlLanguage)
                .build();
            expect(cost.nlLanguage).toEqual(nlLanguage);
        });

    }

});