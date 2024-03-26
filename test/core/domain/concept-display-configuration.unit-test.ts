import {aFullConceptDisplayConfiguration} from "./concept-display-configuration-test-builder";
import {ConceptDisplayConfigurationBuilder} from "../../../src/core/domain/concept-display-configuration";
import {InvariantError} from "../../../src/core/domain/shared/lpdc-error";

describe('Constructing', () => {

    test('Undefined id throws error', () => {
        expect(() => aFullConceptDisplayConfiguration().withId(undefined).build()).toThrowWithMessage(InvariantError, 'id mag niet ontbreken');
    });

    test('Undefined uuid throws error', () => {
        expect(() => aFullConceptDisplayConfiguration().withUuid(undefined).build()).toThrowWithMessage(InvariantError, 'uuid mag niet ontbreken');
    });

    test('Undefined conceptIsNew throws error', () => {
        expect(() => aFullConceptDisplayConfiguration().withConceptIsNew(undefined).build()).toThrowWithMessage(InvariantError, 'conceptIsNew mag niet ontbreken');
    });

    test('Undefined conceptIsInstantiated throws error', () => {
        expect(() => aFullConceptDisplayConfiguration().withConceptIsInstantiated(undefined).build()).toThrowWithMessage(InvariantError, 'conceptIsInstantiated mag niet ontbreken');
    });

    test('Undefined bestuurseenheidId throws error', () => {
        expect(() => aFullConceptDisplayConfiguration().withBestuurseenheidId(undefined).build()).toThrowWithMessage(InvariantError, 'bestuurseenheidId mag niet ontbreken');
    });

    test('Undefined conceptId throws error', () => {
        expect(() => aFullConceptDisplayConfiguration().withConceptId(undefined).build()).toThrowWithMessage(InvariantError, 'conceptId mag niet ontbreken');
    });

    test('when concept is new and concept is instantiated are equal, throws error',()=>{
        const conceptDisplayConfiguration = aFullConceptDisplayConfiguration().withConceptIsNew(true).withConceptIsInstantiated(true);
        expect(() => conceptDisplayConfiguration.build()).toThrowWithMessage(InvariantError, 'Concept kan niet zowel nieuw als toegevoegd zijn');
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
