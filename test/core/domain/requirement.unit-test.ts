import {aFullRequirement} from "./requirement-test-builder";
import {Requirement} from "../../../src/core/domain/requirement";
import {Iri} from "../../../src/core/domain/shared/iri";


describe('forConcept', () => {
    test('Undefined id throws error', () => {
        const requirement = aFullRequirement().withId(undefined);
        expect(() => Requirement.forConcept(requirement.build())).toThrow(new Error('id should not be undefined'));
    });
    test('Blank id throws error', () => {
        const requirement = aFullRequirement().withId('   ');
        expect(() => Requirement.forConcept(requirement.build())).toThrow(new Error('id should not be blank'));
    });

    test('Undefined uuid throws error', () => {
        const requirement = aFullRequirement().withUuid(undefined);
        expect(() => Requirement.forConcept(requirement.build())).toThrow(new Error('uuid should not be undefined'));
    });
    test('Blank uuid throws error', () => {
        const requirement = aFullRequirement().withUuid('   ');
        expect(() => Requirement.forConcept(requirement.build())).toThrow(new Error('uuid should not be blank'));
    });

    test('Undefined title throws error', () => {
        const requirement = aFullRequirement().withTitle(undefined);
        expect(() => Requirement.forConcept(requirement.build())).toThrow(new Error('title should not be undefined'));
    });

    test('Undefined description throws error', () => {
        const requirement = aFullRequirement().withDescription(undefined);
        expect(() => Requirement.forConcept(requirement.build())).toThrow(new Error('description should not be undefined'));
    });

});

describe('forConceptSnapshot', () => {

    test('Undefined id throws error', () => {
        const requirement = aFullRequirement().withId(undefined);
        expect(() => Requirement.forConceptSnapshot(requirement.build())).toThrow(new Error('id should not be undefined'));
    });
    test('Invalid iri id throws error', () => {
        const requirement = aFullRequirement().withId(new Iri('   '));
        expect(() => Requirement.forConceptSnapshot(requirement.build())).toThrow(new Error('iri should not be blank'));
    });
    test('Uuid is undefined ', () => {
        const requirement = aFullRequirement().build();
        expect(Requirement.forConceptSnapshot(requirement).uuid).toBeUndefined();
    });
    test('Undefined title throws error', () => {
        const requirement = aFullRequirement().withTitle(undefined).build();
        expect(() => Requirement.forConceptSnapshot(requirement)).toThrow(new Error('title should not be undefined'));
    });
    test('Undefined description throws error', () => {
        const requirement = aFullRequirement().withDescription(undefined).build();
        expect(() => Requirement.forConceptSnapshot(requirement)).toThrow(new Error('description should not be undefined'));
    });

});