import {aFullCost, aMinimalCostForInstance} from "./cost-test-builder";
import {Cost} from "../../../src/core/domain/cost";
import {Iri} from "../../../src/core/domain/shared/iri";
import {Language} from "../../../src/core/domain/language";
import {LanguageString} from "../../../src/core/domain/language-string";
import {uuid} from "../../../mu-helper";

describe('forConcept', () => {
    test('Undefined id throws error', () => {
        const cost = aFullCost().withId(undefined);
        expect(() => Cost.forConcept(cost.build())).toThrow(new Error('id should not be undefined'));
    });
    test('Invalid iri id throws error', () => {
        expect(() => Cost.forConcept(aFullCost().withId(new Iri('   ')).build())).toThrow(new Error('iri should not be blank'));
    });

    test('Undefined uuid throws error', () => {
        const cost = aFullCost().withUuid(undefined);
        expect(() => Cost.forConcept(cost.build())).toThrow(new Error('uuid should not be undefined'));
    });
    test('Blank uuid throws error', () => {
        const cost = aFullCost().withUuid('   ');
        expect(() => Cost.forConcept(cost.build())).toThrow(new Error('uuid should not be blank'));
    });

    test('Undefined title throws error', () => {
        const cost = aFullCost().withTitle(undefined);
        expect(() => Cost.forConcept(cost.build())).toThrow(new Error('title should not be undefined'));
    });

    test('Undefined description throws error', () => {
        const cost = aFullCost().withDescription(undefined);
        expect(() => Cost.forConcept(cost.build())).toThrow(new Error('description should not be undefined'));
    });

});

describe('forConceptSnapshot', () => {

    test('Undefined id throws error', () => {
        const cost = aFullCost().withId(undefined);
        expect(() => Cost.forConceptSnapshot(cost.build())).toThrow(new Error('id should not be undefined'));
    });
    test('Uuid is undefined ', () => {
        const cost = aFullCost().build();
        expect(Cost.forConceptSnapshot(cost).uuid).toBeUndefined();
    });
    test('Undefined title throws error', () => {
        const cost = aFullCost().withTitle(undefined).build();
        expect(() => Cost.forConceptSnapshot(cost)).toThrow(new Error('title should not be undefined'));
    });
    test('Undefined description throws error', () => {
        const cost = aFullCost().withDescription(undefined).build();
        expect(() => Cost.forConceptSnapshot(cost)).toThrow(new Error('description should not be undefined'));
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