import {
    aFullCost,
    aFullCostForInstance,
    aFullCostForInstanceSnapshot,
    aMinimalCostForInstance,
    CostTestBuilder
} from "./cost-test-builder";
import {Cost, CostBuilder} from "../../../src/core/domain/cost";
import {Iri} from "../../../src/core/domain/shared/iri";
import {Language} from "../../../src/core/domain/language";
import {LanguageString} from "../../../src/core/domain/language-string";
import {uuid} from "../../../mu-helper";
import {InvariantError} from "../../../src/core/domain/shared/lpdc-error";

describe('forConcept', () => {

    test('Undefined id throws error', () => {
        const cost = aFullCost().withId(undefined);
        expect(() => Cost.forConcept(cost.build())).toThrowWithMessage(InvariantError, 'id mag niet ontbreken');
    });

    test('Invalid iri id throws error', () => {
        expect(() => Cost.forConcept(aFullCost().withId(new Iri('   ')).build())).toThrowWithMessage(InvariantError, 'iri mag niet leeg zijn');
    });

    test('Undefined uuid throws error', () => {
        const cost = aFullCost().withUuid(undefined);
        expect(() => Cost.forConcept(cost.build())).toThrowWithMessage(InvariantError, 'uuid mag niet ontbreken');
    });

    test('Blank uuid throws error', () => {
        const cost = aFullCost().withUuid('   ');
        expect(() => Cost.forConcept(cost.build())).toThrowWithMessage(InvariantError, 'uuid mag niet leeg zijn');
    });

    test('Undefined title throws error', () => {
        const cost = aFullCost().withTitle(undefined);
        expect(() => Cost.forConcept(cost.build())).toThrowWithMessage(InvariantError, 'title mag niet ontbreken');
    });

    test('Undefined description throws error', () => {
        const cost = aFullCost().withDescription(undefined);
        expect(() => Cost.forConcept(cost.build())).toThrowWithMessage(InvariantError, 'description mag niet ontbreken');
    });

    test('Undefined order throws error', () => {
        const cost = aFullCost().withOrder(undefined);
        expect(() => Cost.forConcept(cost.build())).toThrowWithMessage(InvariantError, 'order mag niet ontbreken');
    });

});

describe('forReconstituted', () => {

    test('Undefined order throws error', () => {
        expect(() => aFullCost().withOrder(undefined).build()).toThrowWithMessage(InvariantError, 'order mag niet ontbreken');
    });

});

describe('forConceptSnapshot', () => {

    test('Undefined id throws error', () => {
        const cost = aFullCost().withId(undefined);
        expect(() => Cost.forConceptSnapshot(cost.build())).toThrowWithMessage(InvariantError, 'id mag niet ontbreken');
    });

    test('Uuid is undefined ', () => {
        const cost = aFullCost().build();
        expect(Cost.forConceptSnapshot(cost).uuid).toBeUndefined();
    });

    test('Undefined title throws error', () => {
        const cost = aFullCost().withTitle(undefined).build();
        expect(() => Cost.forConceptSnapshot(cost)).toThrowWithMessage(InvariantError, 'title mag niet ontbreken');
    });

    test('Undefined description throws error', () => {
        const cost = aFullCost().withDescription(undefined).build();
        expect(() => Cost.forConceptSnapshot(cost)).toThrowWithMessage(InvariantError, 'description mag niet ontbreken');
    });

    test('Undefined order throws error', () => {
        expect(() => Cost.forConceptSnapshot(aFullCost().withOrder(undefined).build())).toThrowWithMessage(InvariantError, 'order mag niet ontbreken');
    });

});

describe('for instance', () => {

    const validLanguages = [Language.NL, Language.FORMAL, Language.INFORMAL];
    const invalidLanguages = [Language.GENERATED_FORMAL, Language.GENERATED_INFORMAL];

    test('Undefined id throws error', () => {
        const cost = aFullCostForInstance().withId(undefined);
        expect(() => Cost.forInstance(cost.build())).toThrowWithMessage(InvariantError, 'id mag niet ontbreken');
    });

    test('Undefined Uuid throws error', () => {
        const cost = aFullCostForInstance().withUuid(undefined).build();
        expect(() => Cost.forInstance(cost).uuid).toThrowWithMessage(InvariantError, 'uuid mag niet ontbreken');
    });

    test('If title and description have the same nl language cost is created', () => {
        const langString = LanguageString.of('nl');
        const cost = aFullCostForInstance().withTitle(langString).withDescription(langString).build();
        expect(() => Cost.forInstance(cost)).not.toThrow();
    });

    test('If title and description are undefined cost is created', () => {
        const cost = aFullCostForInstance().withTitle(undefined).withDescription(undefined).build();
        expect(() => Cost.forInstance(cost)).not.toThrow();
    });

    test('If title and description have different nl languages, throws error', () => {
        const title = LanguageString.of('nl', undefined);
        const description = LanguageString.of(undefined, 'nl-formal');
        const cost = aFullCostForInstance().withTitle(title).withDescription(description).build();

        expect(() => Cost.forInstance(cost)).toThrowWithMessage(InvariantError, 'Er is meer dan een nl-taal aanwezig');
    });

    test('If title has multiple nl languages, throws error', () => {
        const title = LanguageString.of('nl', 'nl-formal');
        const cost = aFullCostForInstance().withTitle(title).withDescription(undefined).build();

        expect(() => Cost.forInstance(cost)).toThrowWithMessage(InvariantError, 'Er is meer dan een nl-taal aanwezig');
    });

    test('If description has different nl languages, throws error', () => {
        const description = LanguageString.of('nl', 'nl-formal');
        const cost = aFullCostForInstance().withDescription(description).withTitle(undefined).build();

        expect(() => Cost.forInstance(cost)).toThrowWithMessage(InvariantError, 'Er is meer dan een nl-taal aanwezig');
    });

    for (const invalidLanguage of invalidLanguages) {
        let valueInNlLanguage: LanguageString;
        if (invalidLanguage === Language.GENERATED_FORMAL) {
            valueInNlLanguage = LanguageString.of(undefined, undefined, undefined, 'value in generated formal', undefined);
        } else if (invalidLanguage == Language.GENERATED_INFORMAL) {
            valueInNlLanguage = LanguageString.of(undefined, undefined, undefined, undefined, 'value in generated formal');
        }
        test('If title contains invalid language, throws error', () => {
            const cost = aFullCostForInstance().withTitle(valueInNlLanguage).withDescription(undefined).build();
            expect(() => Cost.forInstance(cost)).toThrowWithMessage(InvariantError, `De nl-taal verschilt van ${validLanguages.toString()}`);
        });

        test('If description contains invalid language, throws error', () => {
            const cost = aFullCostForInstance().withDescription(valueInNlLanguage).withTitle(undefined).build();
            expect(() => Cost.forInstance(cost)).toThrowWithMessage(InvariantError, `De nl-taal verschilt van ${validLanguages.toString()}`);
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
        expect(() => Cost.forInstance(aFullCostForInstance().withOrder(undefined).build()).uuid).toThrowWithMessage(InvariantError, 'order mag niet ontbreken');
    });

});

describe('for instance snapshot', () => {

    const validLanguages = [Language.NL, Language.FORMAL, Language.INFORMAL];
    const invalidLanguages = [Language.GENERATED_FORMAL, Language.GENERATED_INFORMAL];

    test('Undefined id throws error', () => {
        const cost = aFullCostForInstanceSnapshot().withId(undefined);
        expect(() => Cost.forInstanceSnapshot(cost.build())).toThrowWithMessage(InvariantError, 'id mag niet ontbreken');
    });

    test('Undefined Uuid does not throw error', () => {
        const cost = aFullCostForInstanceSnapshot().withUuid(undefined).build();
        expect(Cost.forInstanceSnapshot(cost).uuid).toBeUndefined();
    });

    test('Undefined title throws error', () => {
        const cost = aFullCostForInstanceSnapshot().withTitle(undefined);
        expect(() => Cost.forInstanceSnapshot(cost.build())).toThrowWithMessage(InvariantError, 'title mag niet ontbreken');
    });

    test('Undefined description throws error', () => {
        const cost = aFullCostForInstanceSnapshot().withDescription(undefined);
        expect(() => Cost.forInstanceSnapshot(cost.build())).toThrowWithMessage(InvariantError, 'description mag niet ontbreken');
    });

    test('If title and description have the same nl language cost is created', () => {
        const langString = LanguageString.of('nl');
        const cost = aFullCostForInstanceSnapshot().withTitle(langString).withDescription(langString).build();
        expect(() => Cost.forInstanceSnapshot(cost)).not.toThrow();
    });

    test('If title and description have different nl languages, throws error', () => {
        const title = LanguageString.of('nl', undefined);
        const description = LanguageString.of(undefined, 'nl-formal');
        const cost = aFullCostForInstanceSnapshot().withTitle(title).withDescription(description).build();

        expect(() => Cost.forInstanceSnapshot(cost)).toThrowWithMessage(InvariantError, 'Er is meer dan een nl-taal aanwezig');
    });

    for (const invalidLanguage of invalidLanguages) {
        let valueInNlLanguage: LanguageString;
        if (invalidLanguage === Language.GENERATED_FORMAL) {
            valueInNlLanguage = LanguageString.of(undefined, undefined, undefined, 'value in generated formal', undefined);
        } else if (invalidLanguage == Language.GENERATED_INFORMAL) {
            valueInNlLanguage = LanguageString.of(undefined, undefined, undefined, undefined, 'value in generated formal');
        }

        test(`If title and description contains invalid language ${invalidLanguage}, throws error`, () => {
            const cost = aFullCostForInstanceSnapshot().withTitle(valueInNlLanguage).withDescription(valueInNlLanguage).build();
            expect(() => Cost.forInstanceSnapshot(cost)).toThrowWithMessage(InvariantError, `De nl-taal verschilt van ${validLanguages.toString()}`);
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

        test(`If title and description contains valid language ${validLanguage}, not throws error`, () => {
            const cost = aFullCostForInstanceSnapshot().withTitle(valueInNlLanguage).withDescription(valueInNlLanguage).build();
            expect(() => Cost.forInstanceSnapshot(cost)).not.toThrow();
        });
    }

    test('Undefined order throws error', () => {
        expect(() => Cost.forInstanceSnapshot(aFullCostForInstanceSnapshot().withOrder(undefined).build()))
            .toThrowWithMessage(InvariantError, 'order mag niet ontbreken');
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
            valueInNlLanguage = LanguageString.of(`value ${uuid()} in nl`, undefined, undefined, undefined, undefined);
        } else if (nlLanguage == Language.FORMAL) {
            valueInNlLanguage = LanguageString.of(undefined, `value ${uuid()} in nl formal`, undefined, undefined, undefined);
        } else if (nlLanguage == Language.INFORMAL) {
            valueInNlLanguage = LanguageString.of(undefined, undefined, `value ${uuid()} in nl informal`, undefined, undefined);
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

describe('transformToInformal', () => {

    test('should transform cost with title, description to informal', () => {
        const cost = aFullCostForInstance()
            .withTitle(LanguageString.of(undefined, 'titel'))
            .withDescription(LanguageString.of(undefined, 'beschrijving'))
            .build();

        expect(cost.transformToInformal()).toEqual(CostBuilder
            .from(cost)
            .withTitle(LanguageString.of(undefined, undefined, 'titel'))
            .withDescription(LanguageString.of(undefined, undefined, 'beschrijving'))
            .build()
        );
    });

    test('should transform cost without title, description to informal', () => {
        const cost = aFullCostForInstance()
            .withTitle(undefined)
            .withDescription(undefined)
            .build();

        expect(cost.transformToInformal()).toEqual(cost);
    });

    test('concept cost can not be transformed', () => {
        const cost = aFullCost().build();

        expect(() => cost.transformToInformal()).toThrowWithMessage(InvariantError, 'voor omzetting naar je-vorm mag languageString maar 1 NL taal bevatten');

    });

});

describe('transformLanguage', () => {

    test('should transform cost with title, description', () => {
        const cost = aFullCost()
            .build();

        expect(cost.transformLanguage(Language.FORMAL, Language.INFORMAL)).toEqual(CostBuilder
            .from(cost)
            .withTitle(LanguageString.ofValueInLanguage(CostTestBuilder.TITLE_NL_FORMAL, Language.INFORMAL))
            .withDescription(LanguageString.ofValueInLanguage(CostTestBuilder.DESCRIPTION_NL_FORMAL, Language.INFORMAL))
            .build()
        );

    });

    test('should transform cost without title, description', () => {
        const cost = aFullCost()
            .withTitle(undefined)
            .withDescription(undefined)
            .build();

        expect(cost.transformLanguage(Language.FORMAL, Language.INFORMAL)).toEqual(cost);
    });

});

describe('builder', () => {

    test("from copies all fields", () => {
        const cost = aFullCost().build();
        const fromCost = CostBuilder.from(cost).build();

        expect(fromCost).toEqual(cost);
    });
});