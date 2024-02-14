import {aFullEvidence, aFullEvidenceForInstance} from "./evidence-test-builder";
import {Iri} from "../../../src/core/domain/shared/iri";
import {Evidence} from "../../../src/core/domain/evidence";
import {Language} from "../../../src/core/domain/language";
import {LanguageString} from "../../../src/core/domain/language-string";

describe('forConcept', () => {
    test('Undefined id throws error', () => {
        const evidence = aFullEvidence().withId(undefined);
        expect(() => Evidence.forConcept(evidence.build())).toThrow(new Error('id should not be absent'));
    });
    test('Invalid iri id throws error', () => {
        expect(() => Evidence.forConcept(aFullEvidence().withId(new Iri('   ')).build())).toThrow(new Error('iri should not be blank'));
    });

    test('Undefined uuid throws error', () => {
        const evidence = aFullEvidence().withUuid(undefined);
        expect(() => Evidence.forConcept(evidence.build())).toThrow(new Error('uuid should not be absent'));
    });
    test('Blank uuid throws error', () => {
        const evidence = aFullEvidence().withUuid('   ');
        expect(() => Evidence.forConcept(evidence.build())).toThrow(new Error('uuid should not be blank'));
    });

    test('Undefined title throws error', () => {
        const evidence = aFullEvidence().withTitle(undefined);
        expect(() => Evidence.forConcept(evidence.build())).toThrow(new Error('title should not be absent'));
    });

    test('Undefined description throws error', () => {
        const evidence = aFullEvidence().withDescription(undefined);
        expect(() => Evidence.forConcept(evidence.build())).toThrow(new Error('description should not be absent'));
    });

});

describe('forConceptSnapshot', () => {

    test('Undefined id throws error', () => {
        const evidence = aFullEvidence().withId(undefined);
        expect(() => Evidence.forConceptSnapshot(evidence.build())).toThrow(new Error('id should not be absent'));
    });
    test('Invalid iri id throws error', () => {
        expect(() => Evidence.forConceptSnapshot(aFullEvidence().withId(new Iri('   ')).build())).toThrow(new Error('iri should not be blank'));
    });
    test('Uuid is undefined ', () => {
        const evidence = aFullEvidence().build();
        expect(Evidence.forConceptSnapshot(evidence).uuid).toBeUndefined();
    });
    test('Undefined title throws error', () => {
        const evidence = aFullEvidence().withTitle(undefined).build();
        expect(() => Evidence.forConceptSnapshot(evidence)).toThrow(new Error('title should not be absent'));
    });
    test('Undefined description throws error', () => {
        const evidence = aFullEvidence().withDescription(undefined).build();
        expect(() => Evidence.forConceptSnapshot(evidence)).toThrow(new Error('description should not be absent'));
    });

});

describe('for instance',()=>{

    const validLanguages = [Language.NL, Language.FORMAL, Language.INFORMAL];
    const invalidLanguages = [Language.GENERATED_FORMAL, Language.GENERATED_INFORMAL];

    test('Undefined id throws error', () => {
        const evidence = aFullEvidenceForInstance().withId(undefined);
        expect(() => Evidence.forInstance(evidence.build())).toThrow(new Error('id should not be absent'));
    });
    test('Undefined Uuid throws error', () => {
        const evidence = aFullEvidenceForInstance().withUuid(undefined).build();
        expect(()=>Evidence.forInstance(evidence).uuid).toThrow(new Error('uuid should not be absent'));
    });

    test('If title and description have the same nl language evidence is created', () => {
        const langString = LanguageString.of('en', 'nl');
        const evidence = aFullEvidenceForInstance().withTitle(langString).withDescription(langString).build();
        expect(() => Evidence.forInstance(evidence)).not.toThrow(new Error());
    });
    test('If title and description are undefined evidence is created', () => {
        const evidence = aFullEvidenceForInstance().withTitle(undefined).withDescription(undefined).build();
        expect(() => Evidence.forInstance(evidence)).not.toThrow(new Error());
    });


    test('If title and description have different nl languages, throws error', () => {
        const title = LanguageString.of('en', 'nl', undefined);
        const description = LanguageString.of('en', undefined, 'nl-formal');
        const evidence = aFullEvidenceForInstance().withTitle(title).withDescription(description).build();

        expect(() => Evidence.forInstance(evidence)).toThrow(new Error('There is more than one Nl language present'));
    });

    test('If title has different nl languages, throws error', () => {
        const title = LanguageString.of('en', 'nl', 'nl-formal');
        const evidence = aFullEvidenceForInstance().withTitle(title).withDescription(undefined).build();

        expect(() => Evidence.forInstance(evidence)).toThrow(new Error('There is more than one Nl language present'));
    });
    test('If description has different nl languages, throws error', () => {
        const description = LanguageString.of('en', 'nl', 'nl-formal');
        const evidence = aFullEvidenceForInstance().withDescription(description).withTitle(undefined).build();

        expect(() => Evidence.forInstance(evidence)).toThrow(new Error('There is more than one Nl language present'));
    });

    for(const invalidLanguage of invalidLanguages){
        let valueInNlLanguage: LanguageString;
        if (invalidLanguage === Language.GENERATED_FORMAL) {
            valueInNlLanguage = LanguageString.of(`value en`, undefined, undefined, undefined, 'value in generated formal', undefined);
        } else if (invalidLanguage == Language.GENERATED_INFORMAL) {
            valueInNlLanguage = LanguageString.of(`value en`, undefined, undefined, undefined, undefined, 'value in generated formal');
        }

        test('If title contains invalid language, throws error', () => {
            const evidence = aFullEvidenceForInstance().withTitle(valueInNlLanguage).withDescription(undefined).build();
            expect(() => Evidence.forInstance(evidence)).toThrow(new Error(`The nl language differs from ${validLanguages.toString()}`));
        });

        test('If description contains invalid language, throws error', () => {
            const evidence = aFullEvidenceForInstance().withDescription(valueInNlLanguage).withTitle(undefined).build();
            expect(() => Evidence.forInstance(evidence)).toThrow(new Error(`The nl language differs from ${validLanguages.toString()}`));
        });
    }

    for(const validLanguage of validLanguages){
        let valueInNlLanguage: LanguageString;
        if (validLanguage === Language.NL) {
            valueInNlLanguage = LanguageString.of(`value en`, 'value nl', undefined, undefined, undefined, undefined);
        } else if (validLanguage == Language.FORMAL) {
            valueInNlLanguage = LanguageString.of(`value en`, undefined, 'value formal', undefined, undefined, undefined);
        }else if (validLanguage == Language.INFORMAL) {
            valueInNlLanguage = LanguageString.of(`value en`, undefined, undefined, 'value informal', undefined, undefined);
        }

        test('If title contains valid language, not throws error', () => {
            const evidence = aFullEvidenceForInstance().withTitle(valueInNlLanguage).withDescription(undefined).build();
            expect(() => Evidence.forInstance(evidence)).not.toThrow(new Error());
        });

        test('If description contains valid language, throws error', () => {
            const evidence = aFullEvidenceForInstance().withDescription(valueInNlLanguage).withTitle(undefined).build();
            expect(() => Evidence.forInstance(evidence)).not.toThrow(new Error());
        });
    }

});
