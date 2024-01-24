import {aFullRequirement, aMinimalRequirementForInstance} from "./requirement-test-builder";
import {Requirement} from "../../../src/core/domain/requirement";
import {uuid} from "../../../mu-helper";
import {Evidence, EvidenceBuilder} from "../../../src/core/domain/evidence";
import {aMinimalEvidenceForInstance, EvidenceTestBuilder} from "./evidence-test-builder";
import {aMinimalLanguageString} from "./language-string-test-builder";
import {Iri} from "../../../src/core/domain/shared/iri";
import {Language} from "../../../src/core/domain/language";
import {LanguageString} from "../../../src/core/domain/language-string";


describe('forConcept', () => {
    test('Undefined id throws error', () => {
        const requirement = aFullRequirement().withId(undefined);
        expect(() => Requirement.forConcept(requirement.build())).toThrow(new Error('id should not be undefined'));
    });
    test('Invalid iri id throws error', () => {
        expect(() => Requirement.forConcept(aFullRequirement().withId(new Iri('   ')).build())).toThrow(new Error('iri should not be blank'));
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
            const validEvidence = Evidence.reconstitute(EvidenceBuilder.buildIri(uuidValue), uuidValue, aMinimalLanguageString(EvidenceTestBuilder.TITLE).build(),
                aMinimalLanguageString(EvidenceTestBuilder.DESCRIPTION).build(), undefined);
            const requirement = aFullRequirement().withEvidence(validEvidence);
            expect(() => Requirement.forConcept(requirement.build())).not.toThrow();
        });

        test('invalid evidence does throw error', () => {
            const uuidValue = uuid();
            const invalidEvidence = Evidence.reconstitute(EvidenceBuilder.buildIri(uuidValue), uuidValue, undefined, undefined, undefined);
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
        expect(() => Requirement.forConceptSnapshot(aFullRequirement().withId(new Iri('   ')).build())).toThrow(new Error('iri should not be blank'));
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
            const validEvidence = Evidence.reconstitute(EvidenceBuilder.buildIri(uuidValue), undefined, aMinimalLanguageString(EvidenceTestBuilder.TITLE).build(),
                aMinimalLanguageString(EvidenceTestBuilder.DESCRIPTION).build(), undefined);
            const requirement = aFullRequirement().withEvidence(validEvidence);
            expect(() => Requirement.forConceptSnapshot(requirement.build())).not.toThrow();
        });

        test('invalid evidence does throw error', () => {
            const uuidValue = uuid();
            const invalidEvidence = Evidence.reconstitute(EvidenceBuilder.buildIri(uuidValue), undefined, undefined, undefined, undefined);
            const requirement = aFullRequirement().withEvidence(invalidEvidence);
            expect(() => Requirement.forConceptSnapshot(requirement.build())).toThrow();
        });
    });
});

describe('nl language', () => {

    test('empty requirement has no nl language', () => {
        const requirement
            = aMinimalRequirementForInstance()
            .withTitle(undefined)
            .withDescription(undefined)
            .withEvidence(undefined)
            .build();
        expect(requirement.nlLanguage).toBeUndefined();
    });


    for (const nlLanguage of [Language.NL, Language.FORMAL, Language.INFORMAL]) {

        let valueInNlLanguage: LanguageString;
        if (nlLanguage === Language.NL) {
            valueInNlLanguage = LanguageString.of(`value ${uuid()} en`, `value ${uuid()} in nl`, undefined, undefined, undefined, undefined);
        } else if (nlLanguage == Language.FORMAL) {
            valueInNlLanguage = LanguageString.of(`value ${uuid()} en`, undefined, `value ${uuid()} in nl formal`, undefined, undefined, undefined);
        } else if (nlLanguage == Language.INFORMAL) {
            valueInNlLanguage = LanguageString.of(`value ${uuid()} en`, undefined, undefined, `value ${uuid()} in nl informal`, undefined, undefined);
        }

        test(`title has nl language ${nlLanguage}`, () => {
            const requirement
                = aMinimalRequirementForInstance()
                .withTitle(valueInNlLanguage)
                .withDescription(undefined)
                .withEvidence(undefined)
                .build();
            expect(requirement.nlLanguage).toEqual(nlLanguage);
        });


        test(`description has nl language ${nlLanguage}`, () => {
            const requirement
                = aMinimalRequirementForInstance()
                .withTitle(undefined)
                .withDescription(valueInNlLanguage)
                .withEvidence(undefined)
                .build();
            expect(requirement.nlLanguage).toEqual(nlLanguage);
        });

        test(`evidence > title has nl language ${nlLanguage}`, () => {
            const requirement
                = aMinimalRequirementForInstance()
                .withTitle(undefined)
                .withDescription(undefined)
                .withEvidence(
                    aMinimalEvidenceForInstance()
                        .withTitle(valueInNlLanguage)
                        .withDescription(undefined)
                        .build())
                .build();
            expect(requirement.nlLanguage).toEqual(nlLanguage);
        });

        test(`evidence > description has nl language ${nlLanguage}`, () => {
            const requirement
                = aMinimalRequirementForInstance()
                .withTitle(undefined)
                .withDescription(undefined)
                .withEvidence(
                    aMinimalEvidenceForInstance()
                        .withTitle(undefined)
                        .withDescription(valueInNlLanguage)
                        .build())
                .build();
            expect(requirement.nlLanguage).toEqual(nlLanguage);
        });

        test(`title, description, evidence > title, evidence > description have nl language ${nlLanguage}`, () => {
            const requirement
                = aMinimalRequirementForInstance()
                .withTitle(valueInNlLanguage)
                .withDescription(valueInNlLanguage)
                .withEvidence(
                    aMinimalEvidenceForInstance()
                        .withTitle(valueInNlLanguage)
                        .withDescription(valueInNlLanguage)
                        .build())
                .build();
            expect(requirement.nlLanguage).toEqual(nlLanguage);
        });

    }

});