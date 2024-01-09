import {aFullEvidence} from "./evidence-test-builder";
import {Iri} from "../../../src/core/domain/shared/iri";
import {Evidence} from "../../../src/core/domain/evidence";

describe('forConcept', () => {
    test('Undefined id throws error', () => {
        const evidence = aFullEvidence().withId(undefined);
        expect(() => Evidence.forConcept(evidence.build())).toThrow(new Error('id should not be undefined'));
    });
    test('Blank id throws error', () => {
        const evidence = aFullEvidence().withId('   ');
        expect(() => Evidence.forConcept(evidence.build())).toThrow(new Error('id should not be blank'));
    });

    test('Undefined uuid throws error', () => {
        const evidence = aFullEvidence().withUuid(undefined);
        expect(() => Evidence.forConcept(evidence.build())).toThrow(new Error('uuid should not be undefined'));
    });
    test('Blank uuid throws error', () => {
        const evidence = aFullEvidence().withUuid('   ');
        expect(() => Evidence.forConcept(evidence.build())).toThrow(new Error('uuid should not be blank'));
    });

    test('Undefined title throws error', () => {
        const evidence = aFullEvidence().withTitle(undefined);
        expect(() => Evidence.forConcept(evidence.build())).toThrow(new Error('title should not be undefined'));
    });

    test('Undefined description throws error', () => {
        const evidence = aFullEvidence().withDescription(undefined);
        expect(() => Evidence.forConcept(evidence.build())).toThrow(new Error('description should not be undefined'));
    });

});

describe('forConceptSnapshot', () => {

    test('Undefined id throws error', () => {
        const evidence = aFullEvidence().withId(undefined);
        expect(() => Evidence.forConceptSnapshot(evidence.build())).toThrow(new Error('id should not be undefined'));
    });
    test('Invalid iri id throws error', () => {
        const evidence = aFullEvidence().withId(new Iri('   '));
        expect(() => Evidence.forConceptSnapshot(evidence.build())).toThrow(new Error('iri should not be blank'));
    });
    test('Uuid is undefined ', () => {
        const evidence = aFullEvidence().build();
        expect(Evidence.forConceptSnapshot(evidence).uuid).toBeUndefined();
    });
    test('Undefined title throws error', () => {
        const evidence = aFullEvidence().withTitle(undefined).build();
        expect(() => Evidence.forConceptSnapshot(evidence)).toThrow(new Error('title should not be undefined'));
    });
    test('Undefined description throws error', () => {
        const evidence = aFullEvidence().withDescription(undefined).build();
        expect(() => Evidence.forConceptSnapshot(evidence)).toThrow(new Error('description should not be undefined'));
    });

});