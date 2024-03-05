import {aFullConceptDisplayConfiguration} from "./concept-display-configuration-test-builder";
import {ConceptDisplayConfigurationBuilder} from "../../../src/core/domain/concept-display-configuration";
import {InvariantError} from "../../../src/core/domain/shared/lpdc-error";

describe('Constructing', () => {

    test('Undefined id throws error', () => {
        expect(() => aFullConceptDisplayConfiguration().withId(undefined).build()).toThrowWithMessage(InvariantError, 'id should not be absent');
    });

    test('Undefined uuid throws error', () => {
        expect(() => aFullConceptDisplayConfiguration().withUuid(undefined).build()).toThrowWithMessage(InvariantError, 'uuid should not be absent');
    });

    test('Undefined conceptIsNew throws error', () => {
        expect(() => aFullConceptDisplayConfiguration().withConceptIsNew(undefined).build()).toThrowWithMessage(InvariantError, 'conceptIsNew should not be absent');
    });

    test('Undefined conceptIsInstantiated throws error', () => {
        expect(() => aFullConceptDisplayConfiguration().withConceptIsInstantiated(undefined).build()).toThrowWithMessage(InvariantError, 'conceptIsInstantiated should not be absent');
    });

    test('Undefined bestuurseenheidId throws error', () => {
        expect(() => aFullConceptDisplayConfiguration().withBestuurseenheidId(undefined).build()).toThrowWithMessage(InvariantError, 'bestuurseenheidId should not be absent');
    });

    test('Undefined conceptId throws error', () => {
        expect(() => aFullConceptDisplayConfiguration().withConceptId(undefined).build()).toThrowWithMessage(InvariantError, 'conceptId should not be absent');
    });

    test('when concept is new and concept is instantiated are equal, throws error',()=>{
        const conceptDisplayConfiguration = aFullConceptDisplayConfiguration().withConceptIsNew(true).withConceptIsInstantiated(true);
        expect(() => conceptDisplayConfiguration.build()).toThrowWithMessage(InvariantError, 'ConceptIsNew and conceptIsInstantiated cant both be true');
    });

    test('when concept is new and concept is instantiated are different, dont throws error',()=>{
        const conceptDisplayConfiguration = aFullConceptDisplayConfiguration().withConceptIsNew(true).withConceptIsInstantiated(false);
        expect(() => conceptDisplayConfiguration.build()).not.toThrow();
    });

});

describe('builder', () => {

    test("from copies all fields", () => {
       const conceptDisplayConfiguration = aFullConceptDisplayConfiguration().build();
       const fromConceptDisplayConfiguration = ConceptDisplayConfigurationBuilder.from(conceptDisplayConfiguration).build();

       expect(fromConceptDisplayConfiguration).toEqual(conceptDisplayConfiguration);

    });
});
