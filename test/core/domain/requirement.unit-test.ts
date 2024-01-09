import {aFullRequirement} from "./requirement-test-builder";
import {Requirement} from "../../../src/core/domain/requirement";
import {uuid} from "../../../mu-helper";
import {Evidence} from "../../../src/core/domain/evidence";
import {EvidenceTestBuilder} from "./evidence-test-builder";
import {aMinimalLanguageString} from "./language-string-test-builder";
import {aFullConcept} from "./concept-test-builder";
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

    describe('evidence ', () => {
        test('valid evidence does not throw error', () => {
            const uuidValue = uuid();
            const validEvidence = Evidence.reconstitute(EvidenceTestBuilder.buildIri(uuidValue), uuidValue, aMinimalLanguageString(EvidenceTestBuilder.TITLE).build(),
                aMinimalLanguageString(EvidenceTestBuilder.DESCRIPTION).build());
            const requirement = aFullRequirement().withEvidence(validEvidence);
            expect(() => Requirement.forConcept(requirement.build())).not.toThrow();
        });

        test('invalid evidence does throw error', () => {
            const uuidValue = uuid();
            const invalidEvidence = Evidence.reconstitute(EvidenceTestBuilder.buildIri(uuidValue), uuidValue, undefined, undefined);
            const requirement = aFullRequirement().withEvidence(invalidEvidence);
            expect(() => Requirement.forConcept(requirement.build())).toThrow();
        });
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

    describe('evidence ', () => {
        test('valid evidence does not throw error', () => {
            const uuidValue = uuid();
            const validEvidence = Evidence.reconstitute(EvidenceTestBuilder.buildIri(uuidValue), undefined, aMinimalLanguageString(EvidenceTestBuilder.TITLE).build(),
                aMinimalLanguageString(EvidenceTestBuilder.DESCRIPTION).build());
            const requirement = aFullRequirement().withEvidence(validEvidence);
            expect(() => Requirement.forConceptSnapshot(requirement.build())).not.toThrow();
        });

        test('invalid evidence does throw error', () => {
            const uuidValue = uuid();
            const invalidEvidence = Evidence.reconstitute(EvidenceTestBuilder.buildIri(uuidValue), undefined, undefined, undefined);
            const requirement = aFullRequirement().withEvidence(invalidEvidence);
            expect(() => Requirement.forConceptSnapshot(requirement.build())).toThrow();
        });
    });
});