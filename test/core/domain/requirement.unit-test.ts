import {
    aFullRequirement,
    aFullRequirementForInstance,
    aFullRequirementForInstanceSnapshot,
    aMinimalRequirementForInstance
} from "./requirement-test-builder";
import {Requirement, RequirementBuilder} from "../../../src/core/domain/requirement";
import {uuid} from "../../../mu-helper";
import {Evidence, EvidenceBuilder} from "../../../src/core/domain/evidence";
import {
    aFullEvidenceForInstance,
    aFullEvidenceForInstanceSnapshot,
    aMinimalEvidenceForInstance,
    EvidenceTestBuilder
} from "./evidence-test-builder";
import {aMinimalLanguageString} from "./language-string-test-builder";
import {Iri} from "../../../src/core/domain/shared/iri";
import {Language} from "../../../src/core/domain/language";
import {LanguageString} from "../../../src/core/domain/language-string";
import {InvariantError} from "../../../src/core/domain/shared/lpdc-error";


describe('forConcept', () => {

    test('Undefined id throws error', () => {
        const requirement = aFullRequirement().withId(undefined);
        expect(() => Requirement.forConcept(requirement.build())).toThrowWithMessage(InvariantError, 'id mag niet ontbreken');
    });

    test('Invalid iri id throws error', () => {
        expect(() => Requirement.forConcept(aFullRequirement().withId(new Iri('   ')).build())).toThrowWithMessage(InvariantError, 'iri mag niet leeg zijn');
    });

    test('Undefined uuid throws error', () => {
        const requirement = aFullRequirement().withUuid(undefined);
        expect(() => Requirement.forConcept(requirement.build())).toThrowWithMessage(InvariantError, 'uuid mag niet ontbreken');
    });

    test('Blank uuid throws error', () => {
        const requirement = aFullRequirement().withUuid('   ');
        expect(() => Requirement.forConcept(requirement.build())).toThrowWithMessage(InvariantError, 'uuid mag niet leeg zijn');
    });

    test('Undefined title throws error', () => {
        const requirement = aFullRequirement().withTitle(undefined);
        expect(() => Requirement.forConcept(requirement.build())).toThrowWithMessage(InvariantError, 'title mag niet ontbreken');
    });

    test('Undefined description throws error', () => {
        const requirement = aFullRequirement().withDescription(undefined);
        expect(() => Requirement.forConcept(requirement.build())).toThrowWithMessage(InvariantError, 'description mag niet ontbreken');
    });

    describe('evidence ', () => {
        test('valid evidence does not throw error', () => {
            const uuidValue = uuid();
            const validEvidence = Evidence.reconstitute(EvidenceBuilder.buildIri(uuidValue), uuidValue, aMinimalLanguageString(EvidenceTestBuilder.TITLE).build(),
                aMinimalLanguageString(EvidenceTestBuilder.DESCRIPTION).build());
            const requirement = aFullRequirement().withEvidence(validEvidence);
            expect(() => Requirement.forConcept(requirement.build())).not.toThrow();
        });

        test('invalid evidence does throw error', () => {
            const uuidValue = uuid();
            const invalidEvidence = Evidence.reconstitute(EvidenceBuilder.buildIri(uuidValue), uuidValue, undefined, undefined);
            const requirement = aFullRequirement().withEvidence(invalidEvidence);
            expect(() => Requirement.forConcept(requirement.build())).toThrow();
        });
    });

    test('Undefined order throws error', () => {
        expect(() => Requirement.forConcept(aFullRequirement().withOrder(undefined).build())).toThrowWithMessage(InvariantError, 'order mag niet ontbreken');
    });

});

describe('forConceptSnapshot', () => {

    test('Undefined id throws error', () => {
        const requirement = aFullRequirement().withId(undefined);
        expect(() => Requirement.forConceptSnapshot(requirement.build())).toThrowWithMessage(InvariantError, 'id mag niet ontbreken');
    });

    test('Invalid iri id throws error', () => {
        expect(() => Requirement.forConceptSnapshot(aFullRequirement().withId(new Iri('   ')).build())).toThrowWithMessage(InvariantError, 'iri mag niet leeg zijn');
    });

    test('Uuid is undefined ', () => {
        const requirement = aFullRequirement().build();
        expect(Requirement.forConceptSnapshot(requirement).uuid).toBeUndefined();
    });

    test('Undefined title throws error', () => {
        const requirement = aFullRequirement().withTitle(undefined).build();
        expect(() => Requirement.forConceptSnapshot(requirement)).toThrowWithMessage(InvariantError, 'title mag niet ontbreken');
    });

    test('Undefined description throws error', () => {
        const requirement = aFullRequirement().withDescription(undefined).build();
        expect(() => Requirement.forConceptSnapshot(requirement)).toThrowWithMessage(InvariantError, 'description mag niet ontbreken');
    });

    describe('evidence ', () => {
        test('valid evidence does not throw error', () => {
            const uuidValue = uuid();
            const validEvidence = Evidence.reconstitute(EvidenceBuilder.buildIri(uuidValue), undefined, aMinimalLanguageString(EvidenceTestBuilder.TITLE).build(),
                aMinimalLanguageString(EvidenceTestBuilder.DESCRIPTION).build());
            const requirement = aFullRequirement().withEvidence(validEvidence);
            expect(() => Requirement.forConceptSnapshot(requirement.build())).not.toThrow();
        });

        test('invalid evidence does throw error', () => {
            const uuidValue = uuid();
            const invalidEvidence = Evidence.reconstitute(EvidenceBuilder.buildIri(uuidValue), undefined, undefined, undefined);
            const requirement = aFullRequirement().withEvidence(invalidEvidence);
            expect(() => Requirement.forConceptSnapshot(requirement.build())).toThrow();
        });
    });

    test('Undefined order throws error', () => {
        expect(() => Requirement.forConceptSnapshot(aFullRequirement().withOrder(undefined).build())).toThrowWithMessage(InvariantError, 'order mag niet ontbreken');
    });

});

describe('for instance', () => {

    const validLanguages = [Language.NL, Language.FORMAL, Language.INFORMAL];
    const invalidLanguages = [Language.GENERATED_FORMAL, Language.GENERATED_INFORMAL];

    test('Undefined id throws error', () => {
        const requirement = aFullRequirementForInstance().withId(undefined);
        expect(() => Requirement.forInstance(requirement.build())).toThrowWithMessage(InvariantError, 'id mag niet ontbreken');
    });

    test('Undefined Uuid throws error', () => {
        const requirement = aFullRequirementForInstance().withUuid(undefined).build();
        expect(() => Requirement.forInstance(requirement).uuid).toThrowWithMessage(InvariantError, 'uuid mag niet ontbreken');
    });

    test('If title and description have the same nl language requirement is created', () => {
        const langString = LanguageString.of('en', 'nl');
        const requirement = aFullRequirementForInstance().withTitle(langString).withDescription(langString).withEvidence(undefined).build();
        expect(() => Requirement.forInstance(requirement)).not.toThrow();
    });

    test('If title and description are undefined requirement is created', () => {
        const requirement = aFullRequirementForInstance().withTitle(undefined).withDescription(undefined).build();
        expect(() => Requirement.forInstance(requirement)).not.toThrow();
    });

    test('If title and description have different nl languages, throws error', () => {
        const title = LanguageString.of('en', 'nl', undefined);
        const description = LanguageString.of('en', undefined, 'nl-formal');
        const requirement = aFullRequirementForInstance().withTitle(title).withDescription(description).build();

        expect(() => Requirement.forInstance(requirement)).toThrowWithMessage(InvariantError, 'Er is meer dan een nl-taal aanwezig');
    });

    test('If title has different nl languages, throws error', () => {
        const title = LanguageString.of('en', 'nl', 'nl-formal');
        const requirement = aFullRequirementForInstance().withTitle(title).withDescription(undefined).build();

        expect(() => Requirement.forInstance(requirement)).toThrowWithMessage(InvariantError, 'Er is meer dan een nl-taal aanwezig');
    });

    test('If description has different nl languages, throws error', () => {
        const description = LanguageString.of('en', 'nl', 'nl-formal');
        const requirement = aFullRequirementForInstance().withDescription(description).withTitle(undefined).build();

        expect(() => Requirement.forInstance(requirement)).toThrowWithMessage(InvariantError, 'Er is meer dan een nl-taal aanwezig');
    });

    test('If title description and evidence have the same nl language requirement is created', () => {
        const langString = LanguageString.of('en', undefined, 'nl');
        const evidence = aFullEvidenceForInstance().withTitle(LanguageString.of('en', undefined, 'nl-formal-evidence1')).build();

        const requirement = aFullRequirementForInstance().withTitle(langString).withDescription(langString).withEvidence(evidence).build();
        expect(() => Requirement.forInstance(requirement)).not.toThrow();
    });

    test('If a evidence has a different nl language than title or description, throws error', () => {
        const languageString = LanguageString.of('en', 'nl', undefined);
        const evidence = aFullEvidenceForInstance().withTitle(LanguageString.of('en', undefined, 'nl-formal')).build();
        const requirement = aFullRequirementForInstance().withDescription(languageString).withTitle(languageString).withEvidence(evidence).build();
        expect(() => Requirement.forInstance(requirement)).toThrowWithMessage(InvariantError, 'Er is meer dan een nl-taal aanwezig');

    });

    for (const invalidLanguage of invalidLanguages) {
        let valueInNlLanguage: LanguageString;
        if (invalidLanguage === Language.GENERATED_FORMAL) {
            valueInNlLanguage = LanguageString.of(`value en`, undefined, undefined, undefined, 'value in generated formal', undefined);
        } else if (invalidLanguage == Language.GENERATED_INFORMAL) {
            valueInNlLanguage = LanguageString.of(`value en`, undefined, undefined, undefined, undefined, 'value in generated formal');
        }

        test('If title contains invalid language, throws error', () => {
            const requirement = aFullRequirementForInstance().withTitle(valueInNlLanguage).withDescription(undefined).withEvidence(undefined).build();
            expect(() => Requirement.forInstance(requirement)).toThrowWithMessage(InvariantError, `De nl-taal verschilt van ${validLanguages.toString()}`);
        });

        test('If description contains invalid language, throws error', () => {
            const requirement = aFullRequirementForInstance().withDescription(valueInNlLanguage).withTitle(undefined).withEvidence(undefined).build();
            expect(() => Requirement.forInstance(requirement)).toThrowWithMessage(InvariantError, `De nl-taal verschilt van ${validLanguages.toString()}`);
        });

        test('if a nested evidence title contains invalid language, throws error', () => {
            const evidence = aFullEvidenceForInstance().withTitle(valueInNlLanguage).withDescription(undefined).build();
            const requirement = aFullRequirementForInstance().withTitle(undefined).withDescription(undefined).withEvidence(evidence).build();

            expect(() => Requirement.forInstance(requirement)).toThrowWithMessage(InvariantError, `De nl-taal verschilt van ${validLanguages.toString()}`);
        });

        test('if a nested evidence description contains invalid language, throws error', () => {
            const evidence = aFullEvidenceForInstance().withTitle(undefined).withDescription(valueInNlLanguage).build();
            const requirement = aFullRequirementForInstance().withTitle(undefined).withDescription(undefined).withEvidence(evidence).build();

            expect(() => Requirement.forInstance(requirement)).toThrowWithMessage(InvariantError, `De nl-taal verschilt van ${validLanguages.toString()}`);
        });
    }

    for (const validLanguage of validLanguages) {
        let valueInNlLanguage: LanguageString;
        if (validLanguage === Language.NL) {
            valueInNlLanguage = LanguageString.of(`value en`, 'value nl', undefined, undefined, undefined, undefined);
        } else if (validLanguage == Language.FORMAL) {
            valueInNlLanguage = LanguageString.of(`value en`, undefined, 'value formal', undefined, undefined, undefined);
        } else if (validLanguage == Language.INFORMAL) {
            valueInNlLanguage = LanguageString.of(`value en`, undefined, undefined, 'value informal', undefined, undefined);
        }

        test('If title contains valid language, not throws error', () => {
            const requirement = aFullRequirementForInstance().withTitle(valueInNlLanguage).withDescription(undefined).withEvidence(undefined).build();
            expect(() => Requirement.forInstance(requirement)).not.toThrow();
        });

        test('If description contains valid language, throws error', () => {
            const requirement = aFullRequirementForInstance().withDescription(valueInNlLanguage).withTitle(undefined).withEvidence(undefined).build();
            expect(() => Requirement.forInstance(requirement)).not.toThrow();
        });

        test('if a nested evidence title contains valid language, throws error', () => {
            const evidence = aFullEvidenceForInstance().withTitle(valueInNlLanguage).withDescription(undefined).build();
            const requirement = aFullRequirementForInstance().withTitle(undefined).withDescription(undefined).withEvidence(evidence).build();

            expect(() => Requirement.forInstance(requirement)).not.toThrow();
        });

        test('if a nested evidence description contains valid language, throws error', () => {
            const evidence = aFullEvidenceForInstance().withTitle(undefined).withDescription(valueInNlLanguage).build();
            const requirement = aFullRequirementForInstance().withTitle(undefined).withDescription(undefined).withEvidence(evidence).build();

            expect(() => Requirement.forInstance(requirement)).not.toThrow();
        });
    }

    test('Undefined order throws error', () => {
        expect(() => Requirement.forInstance(aFullRequirementForInstance().withOrder(undefined).build()).uuid).toThrowWithMessage(InvariantError, 'order mag niet ontbreken');
    });

});

describe('for instance snapshot', () => {

    const validLanguages = [Language.NL, Language.FORMAL, Language.INFORMAL];
    const invalidLanguages = [Language.GENERATED_FORMAL, Language.GENERATED_INFORMAL];

    test('Undefined id throws error', () => {
        const requirement = aFullRequirementForInstanceSnapshot().withId(undefined);
        expect(() => Requirement.forInstanceSnapshot(requirement.build())).toThrowWithMessage(InvariantError, 'id mag niet ontbreken');
    });

    test('Undefined Uuid throws error', () => {
        const requirement = aFullRequirementForInstanceSnapshot().withUuid(undefined).build();
        expect(Requirement.forInstanceSnapshot(requirement).uuid).toBeUndefined();
    });

    test('Undefined title throws error', () => {
        const requirement = aFullRequirementForInstanceSnapshot().withTitle(undefined);
        expect(() => Requirement.forInstanceSnapshot(requirement.build())).toThrowWithMessage(InvariantError, 'title mag niet ontbreken');
    });

    test('Undefined description throws error', () => {
        const requirement = aFullRequirementForInstanceSnapshot().withDescription(undefined);
        expect(() => Requirement.forInstanceSnapshot(requirement.build())).toThrowWithMessage(InvariantError, 'description mag niet ontbreken');
    });

    test('If title and description have the same nl language requirement is created', () => {
        const langString = LanguageString.of('en', 'nl');
        const requirement = aFullRequirementForInstanceSnapshot().withTitle(langString).withDescription(langString).withEvidence(undefined).build();
        expect(() => Requirement.forInstanceSnapshot(requirement)).not.toThrow();
    });

    test('If title and description have different nl languages, throws error', () => {
        const title = LanguageString.of('en', 'nl', undefined);
        const description = LanguageString.of('en', undefined, 'nl-formal');
        const requirement = aFullRequirementForInstanceSnapshot().withTitle(title).withDescription(description).withEvidence(undefined).build();

        expect(() => Requirement.forInstanceSnapshot(requirement)).toThrowWithMessage(InvariantError, 'Er is meer dan een nl-taal aanwezig');
    });

    test('If title, description and evidence title description have the same nl language requirement is created', () => {
        const langString = LanguageString.of('en', undefined, 'nl');

        const evidence = aFullEvidenceForInstanceSnapshot().withTitle(langString).withDescription(langString).build();
        const requirement = aFullRequirementForInstanceSnapshot().withTitle(langString).withDescription(langString).withEvidence(evidence).build();

        expect(() => Requirement.forInstanceSnapshot(requirement)).not.toThrow();
    });

    test('If a evidence title has a different nl language than title or description, throws error', () => {
        const langString = LanguageString.of('en', 'nl', undefined);
        const otherLangString = LanguageString.of('en', undefined, 'nl-formal');

        const evidence = aFullEvidenceForInstanceSnapshot().withTitle(otherLangString).withDescription(langString).build();
        const requirement = aFullRequirementForInstanceSnapshot().withDescription(langString).withTitle(langString).withEvidence(evidence).build();

        expect(() => Requirement.forInstanceSnapshot(requirement)).toThrowWithMessage(InvariantError, 'Er is meer dan een nl-taal aanwezig');
    });

    test('If a evidence description has a different nl language than title or description, throws error', () => {
        const langString = LanguageString.of('en', 'nl', undefined);
        const otherLangString = LanguageString.of('en', undefined, 'nl-formal');

        const evidence = aFullEvidenceForInstanceSnapshot().withTitle(langString).withDescription(otherLangString).build();
        const requirement = aFullRequirementForInstanceSnapshot().withDescription(langString).withTitle(langString).withEvidence(evidence).build();

        expect(() => Requirement.forInstanceSnapshot(requirement)).toThrowWithMessage(InvariantError, 'Er is meer dan een nl-taal aanwezig');
    });

    for (const invalidLanguage of invalidLanguages) {
        let invalidValueInNlLanguage: LanguageString;
        if (invalidLanguage === Language.GENERATED_FORMAL) {
            invalidValueInNlLanguage = LanguageString.of(`value en`, undefined, undefined, undefined, 'value in generated formal', undefined);
        } else if (invalidLanguage == Language.GENERATED_INFORMAL) {
            invalidValueInNlLanguage = LanguageString.of(`value en`, undefined, undefined, undefined, undefined, 'value in generated formal');
        }

        test(`If title or description contains invalid language ${invalidLanguage}, throws error`, () => {
            const requirement = aFullRequirementForInstanceSnapshot().withTitle(invalidValueInNlLanguage).withDescription(invalidValueInNlLanguage).withEvidence(undefined).build();
            expect(() => Requirement.forInstanceSnapshot(requirement)).toThrowWithMessage(InvariantError, `De nl-taal verschilt van ${validLanguages.toString()}`);
        });

        test(`if a nested evidence title and description contains invalid language ${invalidLanguage}, throws error`, () => {
            const evidence = aFullEvidenceForInstanceSnapshot().withTitle(invalidValueInNlLanguage).withDescription(invalidValueInNlLanguage).build();
            const requirement = aFullRequirementForInstanceSnapshot().withTitle(invalidValueInNlLanguage).withDescription(invalidValueInNlLanguage).withEvidence(evidence).build();

            expect(() => Requirement.forInstanceSnapshot(requirement)).toThrowWithMessage(InvariantError, `De nl-taal verschilt van ${validLanguages.toString()}`);
        });
    }

    for (const validLanguage of validLanguages) {
        let valueInNlLanguage: LanguageString;
        if (validLanguage === Language.NL) {
            valueInNlLanguage = LanguageString.of(`value en`, 'value nl', undefined, undefined, undefined, undefined);
        } else if (validLanguage == Language.FORMAL) {
            valueInNlLanguage = LanguageString.of(`value en`, undefined, 'value formal', undefined, undefined, undefined);
        } else if (validLanguage == Language.INFORMAL) {
            valueInNlLanguage = LanguageString.of(`value en`, undefined, undefined, 'value informal', undefined, undefined);
        }

        test(`If title and description contains valid language ${validLanguage}, not throws error`, () => {
            const requirement = aFullRequirementForInstanceSnapshot().withTitle(valueInNlLanguage).withDescription(valueInNlLanguage).withEvidence(undefined).build();
            expect(() => Requirement.forInstanceSnapshot(requirement)).not.toThrow();
        });

        test(`if a nested evidence title and description contains valid language ${validLanguage}, throws error`, () => {
            const evidence = aFullEvidenceForInstance().withTitle(valueInNlLanguage).withDescription(valueInNlLanguage).build();
            const requirement = aFullRequirementForInstanceSnapshot().withTitle(valueInNlLanguage).withDescription(valueInNlLanguage).withEvidence(evidence).build();

            expect(() => Requirement.forInstanceSnapshot(requirement)).not.toThrow();
        });
    }

    test('Undefined order throws error', () => {
        expect(() => Requirement.forInstanceSnapshot(aFullRequirementForInstance().withOrder(undefined).build()).uuid).toThrowWithMessage(InvariantError, 'order mag niet ontbreken');
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

describe('transformToInformal', () => {
    test('should transform requirement with title, description and evidence to informal', () => {
       const requirement = aFullRequirementForInstance()
           .withTitle(LanguageString.of(undefined, undefined, 'titel'))
           .withDescription(LanguageString.of(undefined, undefined, 'beschrijving'))
           .withEvidence(aFullEvidenceForInstance()
               .withTitle(LanguageString.of(undefined, undefined, 'titel'))
               .build())
           .build();

       const transformedRequirement = requirement.transformToInformal();

       expect(transformedRequirement.title).toEqual(LanguageString.of(undefined, undefined, undefined, 'titel'));
       expect(transformedRequirement.description).toEqual(LanguageString.of(undefined, undefined, undefined, 'beschrijving'));
       expect(transformedRequirement.evidence.title).toEqual(LanguageString.of(undefined, undefined, undefined, 'titel'));
    });

    test('should transform without title, description and evidence', () => {
        const requirement = aFullRequirementForInstance()
            .withTitle(undefined)
            .withDescription(undefined)
            .withEvidence(undefined)
            .build();

        expect(requirement.transformToInformal()).toEqual(requirement);

    });

    test('concept requirement can not be transformed', () => {
        const requirement = aFullRequirement().build();

        expect(() => requirement.transformToInformal()).toThrowWithMessage(InvariantError, 'voor omzetting naar je-vorm mag languageString maar 1 NL taal bevatten');

    });
});

describe('builder', () => {
    test("from copies all fields", () => {
        const requirement = aFullRequirement().build();
        const fromRequirement = RequirementBuilder.from(requirement).build();

        expect(fromRequirement).toEqual(requirement);

    });
});
