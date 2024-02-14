import {aFormalInformalChoice} from "./formal-informal-choice-test-builder";

describe('constructing', () => {

    test('Undefined id throws error', () => {
        expect(() => aFormalInformalChoice().withId(undefined).build()).toThrow(new Error('id should not be absent'));
    });

    test('Undefined uuid throws error', () => {
        expect(() => aFormalInformalChoice().withUuid(undefined).build()).toThrow(new Error('uuid should not be absent'));
    });

    test('Undefined dateCreated throws error', () => {
        expect(() => aFormalInformalChoice().withDateCreated(undefined).build()).toThrow(new Error('dateCreated should not be absent'));
    });

    test('Undefined chosenForm throws error', () => {
        expect(() => aFormalInformalChoice().withChosenForm(undefined).build()).toThrow(new Error('chosenForm should not be absent'));
    });

    test('Undefined bestuurseenheidId throws error', () => {
        expect(() => aFormalInformalChoice().withBestuurseenheidId(undefined).build()).toThrow(new Error('bestuurseenheidId should not be absent'));
    });


});