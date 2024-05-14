import {
    aFullEvidence,
    aFullEvidenceForInstance,
    aFullEvidenceForInstanceSnapshot,
    EvidenceTestBuilder
} from "./evidence-test-builder";
import {Iri} from "../../../src/core/domain/shared/iri";
import {Evidence, EvidenceBuilder} from "../../../src/core/domain/evidence";
import {Language} from "../../../src/core/domain/language";
import {LanguageString} from "../../../src/core/domain/language-string";
import {InvariantError} from "../../../src/core/domain/shared/lpdc-error";

describe('forConcept', () => {

    test('Undefined id throws error', () => {
        const evidence = aFullEvidence().withId(undefined);
        expect(() => Evidence.forConcept(evidence.build())).toThrowWithMessage(InvariantError, 'id mag niet ontbreken');
    });

    test('Invalid iri id throws error', () => {
        expect(() => Evidence.forConcept(aFullEvidence().withId(new Iri('   ')).build())).toThrowWithMessage(InvariantError, 'iri mag niet leeg zijn');
    });

    test('Undefined uuid throws error', () => {
        const evidence = aFullEvidence().withUuid(undefined);
        expect(() => Evidence.forConcept(evidence.build())).toThrowWithMessage(InvariantError, 'uuid mag niet ontbreken');
    });

    test('Blank uuid throws error', () => {
        const evidence = aFullEvidence().withUuid('   ');
        expect(() => Evidence.forConcept(evidence.build())).toThrowWithMessage(InvariantError, 'uuid mag niet leeg zijn');
    });

    test('Undefined title throws error', () => {
        const evidence = aFullEvidence().withTitle(undefined);
        expect(() => Evidence.forConcept(evidence.build())).toThrowWithMessage(InvariantError, 'title mag niet ontbreken');
    });

    test('Undefined description throws error', () => {
        const evidence = aFullEvidence().withDescription(undefined);
        expect(() => Evidence.forConcept(evidence.build())).toThrowWithMessage(InvariantError, 'description mag niet ontbreken');
    });

});

describe('forConceptSnapshot', () => {

    test('Undefined id throws error', () => {
        const evidence = aFullEvidence().withId(undefined);
        expect(() => Evidence.forConceptSnapshot(evidence.build())).toThrowWithMessage(InvariantError, 'id mag niet ontbreken');
    });

    test('Invalid iri id throws error', () => {
        expect(() => Evidence.forConceptSnapshot(aFullEvidence().withId(new Iri('   ')).build())).toThrowWithMessage(InvariantError, 'iri mag niet leeg zijn');
    });

    test('Uuid is undefined ', () => {
        const evidence = aFullEvidence().build();
        expect(Evidence.forConceptSnapshot(evidence).uuid).toBeUndefined();
    });

    test('Undefined title throws error', () => {
        const evidence = aFullEvidence().withTitle(undefined).build();
        expect(() => Evidence.forConceptSnapshot(evidence)).toThrowWithMessage(InvariantError, 'title mag niet ontbreken');
    });

    test('Undefined description throws error', () => {
        const evidence = aFullEvidence().withDescription(undefined).build();
        expect(() => Evidence.forConceptSnapshot(evidence)).toThrowWithMessage(InvariantError, 'description mag niet ontbreken');
    });

});

describe('for instance', () => {

    const validLanguages = [Language.NL, Language.FORMAL, Language.INFORMAL];
    const invalidLanguages = [Language.GENERATED_FORMAL, Language.GENERATED_INFORMAL];

    test('Undefined id throws error', () => {
        const evidence = aFullEvidenceForInstance().withId(undefined);
        expect(() => Evidence.forInstance(evidence.build())).toThrowWithMessage(InvariantError, 'id mag niet ontbreken');
    });

    test('Undefined Uuid throws error', () => {
        const evidence = aFullEvidenceForInstance().withUuid(undefined).build();
        expect(() => Evidence.forInstance(evidence).uuid).toThrowWithMessage(InvariantError, 'uuid mag niet ontbreken');
    });

    test('If title and description have the same nl language evidence is created', () => {
        const langString = LanguageString.of('nl');
        const evidence = aFullEvidenceForInstance().withTitle(langString).withDescription(langString).build();
        expect(() => Evidence.forInstance(evidence)).not.toThrow();
    });

    test('If title and description are undefined evidence is created', () => {
        const evidence = aFullEvidenceForInstance().withTitle(undefined).withDescription(undefined).build();
        expect(() => Evidence.forInstance(evidence)).not.toThrow();
    });

    test('If title and description have different nl languages, throws error', () => {
        const title = LanguageString.of('nl', undefined);
        const description = LanguageString.of(undefined, 'nl-formal');
        const evidence = aFullEvidenceForInstance().withTitle(title).withDescription(description).build();

        expect(() => Evidence.forInstance(evidence)).toThrowWithMessage(InvariantError, 'Er is meer dan een nl-taal aanwezig');
    });

    test('If title has different nl languages, throws error', () => {
        const title = LanguageString.of('nl', 'nl-formal');
        const evidence = aFullEvidenceForInstance().withTitle(title).withDescription(undefined).build();

        expect(() => Evidence.forInstance(evidence)).toThrowWithMessage(InvariantError, 'Er is meer dan een nl-taal aanwezig');
    });

    test('If description has different nl languages, throws error', () => {
        const description = LanguageString.of('nl', 'nl-formal');
        const evidence = aFullEvidenceForInstance().withDescription(description).withTitle(undefined).build();

        expect(() => Evidence.forInstance(evidence)).toThrowWithMessage(InvariantError, 'Er is meer dan een nl-taal aanwezig');
    });

    for (const invalidLanguage of invalidLanguages) {
        let valueInNlLanguage: LanguageString;
        if (invalidLanguage === Language.GENERATED_FORMAL) {
            valueInNlLanguage = LanguageString.of(undefined, undefined, undefined, 'value in generated formal', undefined);
        } else if (invalidLanguage == Language.GENERATED_INFORMAL) {
            valueInNlLanguage = LanguageString.of(undefined, undefined, undefined, undefined, 'value in generated informal');
        }

        test('If title contains invalid language, throws error', () => {
            const evidence = aFullEvidenceForInstance().withTitle(valueInNlLanguage).withDescription(undefined).build();
            expect(() => Evidence.forInstance(evidence)).toThrowWithMessage(InvariantError, `De nl-taal verschilt van ${validLanguages.toString()}`);
        });

        test('If description contains invalid language, throws error', () => {
            const evidence = aFullEvidenceForInstance().withDescription(valueInNlLanguage).withTitle(undefined).build();
            expect(() => Evidence.forInstance(evidence)).toThrowWithMessage(InvariantError, `De nl-taal verschilt van ${validLanguages.toString()}`);
        });
    }

    for (const validLanguage of validLanguages) {
        let valueInNlLanguage: LanguageString;
        if (validLanguage === Language.NL) {
            valueInNlLanguage = LanguageString.of('value nl', undefined, undefined, undefined, undefined);
        } else if (validLanguage == Language.FORMAL) {
            valueInNlLanguage = LanguageString.of(undefined, 'value formal', undefined, undefined, undefined);
        } else if (validLanguage == Language.INFORMAL) {
            valueInNlLanguage = LanguageString.of(undefined, undefined, 'value informal', undefined, undefined);
        }

        test('If title contains valid language, not throws error', () => {
            const evidence = aFullEvidenceForInstance().withTitle(valueInNlLanguage).withDescription(undefined).build();
            expect(() => Evidence.forInstance(evidence)).not.toThrow();
        });

        test('If description contains valid language, throws error', () => {
            const evidence = aFullEvidenceForInstance().withDescription(valueInNlLanguage).withTitle(undefined).build();
            expect(() => Evidence.forInstance(evidence)).not.toThrow();
        });
    }

});

describe('for instance snapshot', () => {

    const validLanguages = [Language.NL, Language.FORMAL, Language.INFORMAL];
    const invalidLanguages = [Language.GENERATED_FORMAL, Language.GENERATED_INFORMAL];

    test('Undefined id throws error', () => {
        const evidence = aFullEvidenceForInstanceSnapshot().withId(undefined);
        expect(() => Evidence.forInstanceSnapshot(evidence.build())).toThrowWithMessage(InvariantError, 'id mag niet ontbreken');
    });

    test('Undefined Uuid is allowed', () => {
        const evidence = aFullEvidenceForInstanceSnapshot().withUuid(undefined).build();
        expect(Evidence.forInstanceSnapshot(evidence).uuid).toBeUndefined();
    });

    test('Undefined title throws error', () => {
        expect(() => Evidence.forInstanceSnapshot(aFullEvidenceForInstanceSnapshot().withTitle(undefined).build()))
            .toThrowWithMessage(InvariantError, 'title mag niet ontbreken');
    });

    test('Undefined description throws error', () => {
        expect(() => Evidence.forInstanceSnapshot(aFullEvidenceForInstanceSnapshot().withDescription(undefined).build()))
            .toThrowWithMessage(InvariantError, 'description mag niet ontbreken');
    });

    test('If title and description have the same nl language evidence is created', () => {
        const langString = LanguageString.of('nl');
        const evidence = aFullEvidenceForInstanceSnapshot().withTitle(langString).withDescription(langString).build();
        expect(() => Evidence.forInstanceSnapshot(evidence)).not.toThrow();
    });

    test('If title and description have different nl languages, throws error', () => {
        const title = LanguageString.of('nl', undefined);
        const description = LanguageString.of(undefined, 'nl-formal');
        const evidence = aFullEvidenceForInstanceSnapshot().withTitle(title).withDescription(description).build();

        expect(() => Evidence.forInstanceSnapshot(evidence)).toThrowWithMessage(InvariantError, 'Er is meer dan een nl-taal aanwezig');
    });

    test('If title has different nl languages, throws error', () => {
        const title = LanguageString.of('nl', 'nl-formal');
        const evidence = aFullEvidenceForInstanceSnapshot().withTitle(title).withDescription(undefined).build();

        expect(() => Evidence.forInstanceSnapshot(evidence)).toThrowWithMessage(InvariantError, 'Er is meer dan een nl-taal aanwezig');
    });

    test('If description has different nl languages, throws error', () => {
        const description = LanguageString.of('nl', 'nl-formal');
        const evidence = aFullEvidenceForInstanceSnapshot().withDescription(description).withTitle(undefined).build();

        expect(() => Evidence.forInstanceSnapshot(evidence)).toThrowWithMessage(InvariantError, 'Er is meer dan een nl-taal aanwezig');
    });

    for (const invalidLanguage of invalidLanguages) {
        let valueInNlLanguage: LanguageString;
        if (invalidLanguage === Language.GENERATED_FORMAL) {
            valueInNlLanguage = LanguageString.of(undefined, undefined, undefined, 'value in generated formal', undefined);
        } else if (invalidLanguage == Language.GENERATED_INFORMAL) {
            valueInNlLanguage = LanguageString.of(undefined, undefined, undefined, undefined, 'value in generated informal');
        }

        test('If title contains invalid language, throws error', () => {
            const evidence = aFullEvidenceForInstanceSnapshot().withTitle(valueInNlLanguage).withDescription(undefined).build();
            expect(() => Evidence.forInstanceSnapshot(evidence)).toThrowWithMessage(InvariantError, `De nl-taal verschilt van ${validLanguages.toString()}`);
        });

        test('If description contains invalid language, throws error', () => {
            const evidence = aFullEvidenceForInstanceSnapshot().withDescription(valueInNlLanguage).withTitle(undefined).build();
            expect(() => Evidence.forInstanceSnapshot(evidence)).toThrowWithMessage(InvariantError, `De nl-taal verschilt van ${validLanguages.toString()}`);
        });
    }

    for (const validLanguage of validLanguages) {
        let valueInNlLanguage: LanguageString;
        if (validLanguage === Language.NL) {
            valueInNlLanguage = LanguageString.of('value nl', undefined, undefined, undefined, undefined);
        } else if (validLanguage == Language.FORMAL) {
            valueInNlLanguage = LanguageString.of(undefined, 'value formal', undefined, undefined, undefined);
        } else if (validLanguage == Language.INFORMAL) {
            valueInNlLanguage = LanguageString.of(undefined, undefined, 'value informal', undefined, undefined);
        }

        test(`If fields contain valid language '${validLanguage}', not throws error`, () => {
            const evidence = aFullEvidenceForInstanceSnapshot().withTitle(valueInNlLanguage).withDescription(valueInNlLanguage).build();
            expect(() => Evidence.forInstanceSnapshot(evidence)).not.toThrow();
        });
    }

});

describe('transformLanguage', () => {

    test('should transform Evidence with title, description', () => {
        const evidence = aFullEvidence()
            .build();

        expect(evidence.transformLanguage(Language.FORMAL, Language.INFORMAL)).toEqual(EvidenceBuilder
            .from(evidence)
            .withTitle(LanguageString.ofValueInLanguage(EvidenceTestBuilder.TITLE_NL_FORMAL, Language.INFORMAL))
            .withDescription(LanguageString.ofValueInLanguage(EvidenceTestBuilder.DESCRIPTION_NL_FORMAL, Language.INFORMAL))
            .build());

        expect(evidence.transformLanguage(Language.FORMAL, Language.FORMAL)).toEqual(EvidenceBuilder
            .from(evidence)
            .withTitle(LanguageString.ofValueInLanguage(EvidenceTestBuilder.TITLE_NL_FORMAL, Language.FORMAL))
            .withDescription(LanguageString.ofValueInLanguage(EvidenceTestBuilder.DESCRIPTION_NL_FORMAL, Language.FORMAL))
            .build());

        expect(evidence.transformLanguage(Language.NL, Language.FORMAL)).toEqual(EvidenceBuilder
            .from(evidence)
            .withTitle(LanguageString.ofValueInLanguage(EvidenceTestBuilder.TITLE_NL, Language.FORMAL))
            .withDescription(LanguageString.ofValueInLanguage(EvidenceTestBuilder.DESCRIPTION_NL, Language.FORMAL))
            .build());
    });

    test('should transform Evidence without title, description', () => {
        const evidence = aFullEvidenceForInstance()
            .withTitle(undefined)
            .withDescription(undefined)
            .build();

        expect(evidence.transformLanguage(Language.FORMAL, Language.INFORMAL)).toEqual(evidence);
    });

});

describe('builder', () => {
    test('from copies all fields', () => {
        const evidence = aFullEvidence().build();
        const fromEvidence = EvidenceBuilder.from(evidence).build();
        expect(fromEvidence).toEqual(evidence);
    });
});