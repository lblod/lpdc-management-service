import {aFullEvidence} from "./evidence-test-builder";

describe('constructing', () => {
    test('Undefined id throws error', () => {
        expect(() => aFullEvidence().withId(undefined).build()).toThrow(new Error('id should not be undefined'));
    });
    test('Blank id throws error', () => {
        expect(() => aFullEvidence().withId('   ').build()).toThrow(new Error('id should not be blank'));
    });

});