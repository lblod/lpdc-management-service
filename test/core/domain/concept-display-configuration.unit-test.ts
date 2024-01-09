import {aFullConceptDisplayConfiguration} from "./concept-display-configuration-test-builder";

describe('Concept Display Configuration', () => {

    test('Undefined id throws error', () => {
        expect(() => aFullConceptDisplayConfiguration().withId(undefined).build()).toThrow(new Error('id should not be undefined'));
    });

    test('Undefined uuid throws error', () => {
        expect(() => aFullConceptDisplayConfiguration().withUuid(undefined).build()).toThrow(new Error('uuid should not be undefined'));
    });

    test('Undefined conceptIsNew throws error', () => {
        expect(() => aFullConceptDisplayConfiguration().withConceptIsNew(undefined).build()).toThrow(new Error('conceptIsNew should not be undefined'));
    });

    test('Undefined conceptIsInstantiated throws error', () => {
        expect(() => aFullConceptDisplayConfiguration().withConceptIsInstantiated(undefined).build()).toThrow(new Error('conceptIsInstantiated should not be undefined'));
    });

    test('Undefined bestuurseenheidId throws error', () => {
        expect(() => aFullConceptDisplayConfiguration().withBestuurseenheidId(undefined).build()).toThrow(new Error('bestuurseenheidId should not be undefined'));
    });

    test('Undefined conceptId throws error', () => {
        expect(() => aFullConceptDisplayConfiguration().withConceptId(undefined).build()).toThrow(new Error('conceptId should not be undefined'));
    });


});