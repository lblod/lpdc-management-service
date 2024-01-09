import {aFullFinancialAdvantage} from "./financial-advantage-test-builder";
import {FinancialAdvantage} from "../../../src/core/domain/financial-advantage";
import {Iri} from "../../../src/core/domain/shared/iri";

describe('forConcept', () => {
    test('Undefined id throws error', () => {
        const financialAdvantage = aFullFinancialAdvantage().withId(undefined);
        expect(() => FinancialAdvantage.forConcept(financialAdvantage.build())).toThrow(new Error('id should not be undefined'));
    });
    test('Invalid iri id throws error', () => {
        const financialAdvantage = aFullFinancialAdvantage().withId(new Iri('   '));
        expect(() => FinancialAdvantage.forConcept(financialAdvantage.build())).toThrow(new Error('iri should not be blank'));
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
    test('Blank id throws error', () => {
        const financialAdvantage = aFullFinancialAdvantage().withId('   ');
        expect(() => FinancialAdvantage.forConceptSnapshot(financialAdvantage.build())).toThrow(new Error('id should not be blank'));
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