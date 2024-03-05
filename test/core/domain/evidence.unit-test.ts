import {aFullEvidence, aFullEvidenceForInstance, aFullEvidenceForInstanceSnapshot} from "./evidence-test-builder";
import {Iri} from "../../../src/core/domain/shared/iri";
import {Evidence} from "../../../src/core/domain/evidence";
import {Language} from "../../../src/core/domain/language";
import {LanguageString} from "../../../src/core/domain/language-string";
import {InvariantError} from "../../../src/core/domain/shared/lpdc-error";

describe('forConcept', () => {
    test('Undefined id throws error', () => {
        const evidence = aFullEvidence().withId(undefined);
        expect(() => Evidence.forConcept(evidence.build())).toThrowWithMessage(InvariantError, 'id should not be absent');
    });
    test('Invalid iri id throws error', () => {
        expect(() => Evidence.forConcept(aFullEvidence().withId(new Iri('   ')).build())).toThrowWithMessage(InvariantError, 'iri should not be blank');
    });

    test('Undefined uuid throws error', () => {
        const evidence = aFullEvidence().withUuid(undefined);
        expect(() => Evidence.forConcept(evidence.build())).toThrowWithMessage(InvariantError, 'uuid should not be absent');
    });
    test('Blank uuid throws error', () => {
        const evidence = aFullEvidence().withUuid('   ');
        expect(() => Evidence.forConcept(evidence.build())).toThrowWithMessage(InvariantError, 'uuid should not be blank');
    });

    test('Undefined title throws error', () => {
        const evidence = aFullEvidence().withTitle(undefined);
        expect(() => Evidence.forConcept(evidence.build())).toThrowWithMessage(InvariantError, 'title should not be absent');
    });

    test('Undefined description throws error', () => {
        const evidence = aFullEvidence().withDescription(undefined);
        expect(() => Evidence.forConcept(evidence.build())).toThrowWithMessage(InvariantError, 'description should not be absent');
    });

});

describe('forConceptSnapshot', () => {

    test('Undefined id throws error', () => {
        const evidence = aFullEvidence().withId(undefined);
        expect(() => Evidence.forConceptSnapshot(evidence.build())).toThrowWithMessage(InvariantError, 'id should not be absent');
    });
    test('Invalid iri id throws error', () => {
        expect(() => Evidence.forConceptSnapshot(aFullEvidence().withId(new Iri('   ')).build())).toThrowWithMessage(InvariantError, 'iri should not be blank');
    });
    test('Uuid is undefined ', () => {
        const evidence = aFullEvidence().build();
        expect(Evidence.forConceptSnapshot(evidence).uuid).toBeUndefined();
    });
    test('Undefined title throws error', () => {
        const evidence = aFullEvidence().withTitle(undefined).build();
        expect(() => Evidence.forConceptSnapshot(evidence)).toThrowWithMessage(InvariantError, 'title should not be absent');
    });
    test('Undefined description throws error', () => {
        const evidence = aFullEvidence().withDescription(undefined).build();
        expect(() => Evidence.forConceptSnapshot(evidence)).toThrowWithMessage(InvariantError, 'description should not be absent');
    });

});

describe('for instance', () => {

    const validLanguages = [Language.NL, Language.FORMAL, Language.INFORMAL];
    const invalidLanguages = [Language.GENERATED_FORMAL, Language.GENERATED_INFORMAL];

    test('Undefined id throws error', () => {
        const evidence = aFullEvidenceForInstance().withId(undefined);
        expect(() => Evidence.forInstance(evidence.build())).toThrowWithMessage(InvariantError, 'id should not be absent');
    });

    test('Undefined Uuid throws error', () => {
        const evidence = aFullEvidenceForInstance().withUuid(undefined).build();
        expect(() => Evidence.forInstance(evidence).uuid).toThrowWithMessage(InvariantError, 'uuid should not be absent');
    });

    test('If title and description have the same nl language evidence is created', () => {
        const langString = LanguageString.of('en', 'nl');
        const evidence = aFullEvidenceForInstance().withTitle(langString).withDescription(langString).build();
        expect(() => Evidence.forInstance(evidence)).not.toThrow();
    });

    test('If title and description are undefined evidence is created', () => {
        const evidence = aFullEvidenceForInstance().withTitle(undefined).withDescription(undefined).build();
        expect(() => Evidence.forInstance(evidence)).not.toThrow();
    });

    test('If title and description have different nl languages, throws error', () => {
        const title = LanguageString.of('en', 'nl', undefined);
        const description = LanguageString.of('en', undefined, 'nl-formal');
        const evidence = aFullEvidenceForInstance().withTitle(title).withDescription(description).build();

        expect(() => Evidence.forInstance(evidence)).toThrowWithMessage(InvariantError, 'There is more than one Nl language present');
    });

    test('If title has different nl languages, throws error', () => {
        const title = LanguageString.of('en', 'nl', 'nl-formal');
        const evidence = aFullEvidenceForInstance().withTitle(title).withDescription(undefined).build();

        expect(() => Evidence.forInstance(evidence)).toThrowWithMessage(InvariantError, 'There is more than one Nl language present');
    });
    test('If description has different nl languages, throws error', () => {
        const description = LanguageString.of('en', 'nl', 'nl-formal');
        const evidence = aFullEvidenceForInstance().withDescription(description).withTitle(undefined).build();

        expect(() => Evidence.forInstance(evidence)).toThrowWithMessage(InvariantError, 'There is more than one Nl language present');
    });

    for (const invalidLanguage of invalidLanguages) {
        let valueInNlLanguage: LanguageString;
        if (invalidLanguage === Language.GENERATED_FORMAL) {
            valueInNlLanguage = LanguageString.of(`value en`, undefined, undefined, undefined, 'value in generated formal', undefined);
        } else if (invalidLanguage == Language.GENERATED_INFORMAL) {
            valueInNlLanguage = LanguageString.of(`value en`, undefined, undefined, undefined, undefined, 'value in generated formal');
        }

        test('If title contains invalid language, throws error', () => {
            const evidence = aFullEvidenceForInstance().withTitle(valueInNlLanguage).withDescription(undefined).build();
            expect(() => Evidence.forInstance(evidence)).toThrowWithMessage(InvariantError, `The nl language differs from ${validLanguages.toString()}`);
        });

        test('If description contains invalid language, throws error', () => {
            const evidence = aFullEvidenceForInstance().withDescription(valueInNlLanguage).withTitle(undefined).build();
            expect(() => Evidence.forInstance(evidence)).toThrowWithMessage(InvariantError, `The nl language differs from ${validLanguages.toString()}`);
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
        expect(() => Evidence.forInstanceSnapshot(evidence.build())).toThrowWithMessage(InvariantError, 'id should not be absent');
    });

    test('Undefined Uuid is allowed', () => {
        const evidence = aFullEvidenceForInstanceSnapshot().withUuid(undefined).build();
        expect(Evidence.forInstanceSnapshot(evidence).uuid).toBeUndefined();
    });

    test('Undefined title throws error', () => {
        expect(() => Evidence.forInstanceSnapshot(aFullEvidenceForInstanceSnapshot().withTitle(undefined).build()))
            .toThrowWithMessage(InvariantError, 'title should not be absent');
    });

    test('Undefined description throws error', () => {
        expect(() => Evidence.forInstanceSnapshot(aFullEvidenceForInstanceSnapshot().withDescription(undefined).build()))
            .toThrowWithMessage(InvariantError, 'description should not be absent');
    });

    test('If title and description have the same nl language evidence is created', () => {
        const langString = LanguageString.of('en', 'nl');
        const evidence = aFullEvidenceForInstanceSnapshot().withTitle(langString).withDescription(langString).build();
        expect(() => Evidence.forInstanceSnapshot(evidence)).not.toThrow();
    });

    test('If title and description have different nl languages, throws error', () => {
        const title = LanguageString.of('en', 'nl', undefined);
        const description = LanguageString.of('en', undefined, 'nl-formal');
        const evidence = aFullEvidenceForInstanceSnapshot().withTitle(title).withDescription(description).build();

        expect(() => Evidence.forInstanceSnapshot(evidence)).toThrowWithMessage(InvariantError, 'There is more than one Nl language present');
    });

    test('If title has different nl languages, throws error', () => {
        const title = LanguageString.of('en', 'nl', 'nl-formal');
        const evidence = aFullEvidenceForInstanceSnapshot().withTitle(title).withDescription(undefined).build();

        expect(() => Evidence.forInstanceSnapshot(evidence)).toThrowWithMessage(InvariantError, 'There is more than one Nl language present');
    });
    test('If description has different nl languages, throws error', () => {
        const description = LanguageString.of('en', 'nl', 'nl-formal');
        const evidence = aFullEvidenceForInstanceSnapshot().withDescription(description).withTitle(undefined).build();

        expect(() => Evidence.forInstanceSnapshot(evidence)).toThrowWithMessage(InvariantError, 'There is more than one Nl language present');
    });

    for (const invalidLanguage of invalidLanguages) {
        let valueInNlLanguage: LanguageString;
        if (invalidLanguage === Language.GENERATED_FORMAL) {
            valueInNlLanguage = LanguageString.of(`value en`, undefined, undefined, undefined, 'value in generated formal', undefined);
        } else if (invalidLanguage == Language.GENERATED_INFORMAL) {
            valueInNlLanguage = LanguageString.of(`value en`, undefined, undefined, undefined, undefined, 'value in generated formal');
        }

        test('If title contains invalid language, throws error', () => {
            const evidence = aFullEvidenceForInstanceSnapshot().withTitle(valueInNlLanguage).withDescription(undefined).build();
            expect(() => Evidence.forInstanceSnapshot(evidence)).toThrowWithMessage(InvariantError, `The nl language differs from ${validLanguages.toString()}`);
        });

        test('If description contains invalid language, throws error', () => {
            const evidence = aFullEvidenceForInstanceSnapshot().withDescription(valueInNlLanguage).withTitle(undefined).build();
            expect(() => Evidence.forInstanceSnapshot(evidence)).toThrowWithMessage(InvariantError, `The nl language differs from ${validLanguages.toString()}`);
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

        test(`If fields contain valid language '${validLanguage}', not throws error`, () => {
            const evidence = aFullEvidenceForInstanceSnapshot().withTitle(valueInNlLanguage).withDescription(valueInNlLanguage).build();
            expect(() => Evidence.forInstanceSnapshot(evidence)).not.toThrow();
        });
    }

});