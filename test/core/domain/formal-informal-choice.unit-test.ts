import {aFormalInformalChoice} from "./formal-informal-choice-test-builder";
import {InvariantError} from "../../../src/core/domain/shared/lpdc-error";

describe('constructing', () => {

    test('Undefined id throws error', () => {
        expect(() => aFormalInformalChoice().withId(undefined).build()).toThrowWithMessage(InvariantError, 'id should not be absent');
    });

    test('Undefined uuid throws error', () => {
        expect(() => aFormalInformalChoice().withUuid(undefined).build()).toThrowWithMessage(InvariantError, 'uuid should not be absent');
    });

    test('Undefined dateCreated throws error', () => {
        expect(() => aFormalInformalChoice().withDateCreated(undefined).build()).toThrowWithMessage(InvariantError, 'dateCreated should not be absent');
    });

    test('Undefined chosenForm throws error', () => {
        expect(() => aFormalInformalChoice().withChosenForm(undefined).build()).toThrowWithMessage(InvariantError, 'chosenForm should not be absent');
    });

    test('Undefined bestuurseenheidId throws error', () => {
        expect(() => aFormalInformalChoice().withBestuurseenheidId(undefined).build()).toThrowWithMessage(InvariantError, 'bestuurseenheidId should not be absent');
    });


});