import {aFullWebsite, aFullWebsiteForInstance} from "./website-test-builder";
import {Website} from "../../../src/core/domain/website";
import {Iri} from "../../../src/core/domain/shared/iri";
import {Language} from "../../../src/core/domain/language";
import {LanguageString} from "../../../src/core/domain/language-string";


describe('forConcept', () => {
    test('Undefined id throws error', () => {
        const website = aFullWebsite().withId(undefined);
        expect(() => Website.forConcept(website.build())).toThrow(new Error('id should not be undefined'));
    });
    test('Invalid iri id throws error', () => {
        expect(() => Website.forConcept(aFullWebsite().withId(new Iri('   ')).build())).toThrow(new Error('iri should not be blank'));
    });

    test('Undefined uuid throws error', () => {
        const website = aFullWebsite().withUuid(undefined);
        expect(() => Website.forConcept(website.build())).toThrow(new Error('uuid should not be undefined'));
    });
    test('Blank uuid throws error', () => {
        const website = aFullWebsite().withUuid('   ');
        expect(() => Website.forConcept(website.build())).toThrow(new Error('uuid should not be blank'));
    });

    test('Undefined title throws error', () => {
        const website = aFullWebsite().withTitle(undefined);
        expect(() => Website.forConcept(website.build())).toThrow(new Error('title should not be undefined'));
    });

    test('Undefined url throws error', () => {
        const website = aFullWebsite().withUrl(undefined);
        expect(() => Website.forConcept(website.build())).toThrow(new Error('url should not be undefined'));
    });
    test('Blank url throws error', () => {
        const website = aFullWebsite().withUrl('   ');
        expect(() => Website.forConcept(website.build())).toThrow(new Error('url should not be blank'));
    });
});

describe('forConceptSnapshot', () => {

    test('Undefined id throws error', () => {
        const website = aFullWebsite().withId(undefined);
        expect(() => Website.forConceptSnapshot(website.build())).toThrow(new Error('id should not be undefined'));
    });
    test('Invalid iri id throws error', () => {
        expect(() => Website.forConceptSnapshot(aFullWebsite().withId(new Iri('   ')).build())).toThrow(new Error('iri should not be blank'));
    });
    test('Uuid is undefined ', () => {
        const website = aFullWebsite().build();
        expect(Website.forConceptSnapshot(website).uuid).toBeUndefined();
    });
    test('Undefined title throws error', () => {
        const website = aFullWebsite().withTitle(undefined).build();
        expect(() => Website.forConceptSnapshot(website)).toThrow(new Error('title should not be undefined'));
    });
    test('Undefined url throws error', () => {
        const website = aFullWebsite().withUrl(undefined);
        expect(() => Website.forConceptSnapshot(website.build())).toThrow(new Error('url should not be undefined'));
    });
    test('Blank url throws error', () => {
        const website = aFullWebsite().withUrl('   ');
        expect(() => Website.forConceptSnapshot(website.build())).toThrow(new Error('url should not be blank'));
    });
});

describe('for instance',()=>{

    const validLanguages = [Language.NL, Language.FORMAL, Language.INFORMAL];
    const invalidLanguages = [Language.GENERATED_FORMAL, Language.GENERATED_INFORMAL];

    test('Undefined id throws error', () => {
        const website = aFullWebsiteForInstance().withId(undefined);
        expect(() => Website.forInstance(website.build())).toThrow(new Error('id should not be undefined'));
    });
    test('Undefined Uuid throws error', () => {
        const website = aFullWebsiteForInstance().withUuid(undefined).build();
        expect(()=>Website.forInstance(website).uuid).toThrow(new Error('uuid should not be undefined'));
    });

    test('If title and description have the same nl language website is created', () => {
        const langString = LanguageString.of('en', 'nl');
        const website = aFullWebsiteForInstance().withTitle(langString).withDescription(langString).build();
        expect(() => Website.forInstance(website)).not.toThrow(new Error());
    });

    test('If title and description are undefined website is created', () => {
        const website = aFullWebsiteForInstance().withTitle(undefined).withDescription(undefined).build();
        expect(() => Website.forInstance(website)).not.toThrow(new Error());
    });

    test('If title and description have different nl languages, throws error', () => {
        const title = LanguageString.of('en', 'nl', undefined);
        const description = LanguageString.of('en', undefined, 'nl-formal');
        const website = aFullWebsiteForInstance().withTitle(title).withDescription(description).build();

        expect(() => Website.forInstance(website)).toThrow(new Error('There is more than one Nl language present'));
    });

    test('If title has different nl languages, throws error', () => {
        const title = LanguageString.of('en', 'nl', 'nl-formal');
        const website = aFullWebsiteForInstance().withTitle(title).withDescription(undefined).build();

        expect(() => Website.forInstance(website)).toThrow(new Error('There is more than one Nl language present'));
    });
    test('If description has different nl languages, throws error', () => {
        const description = LanguageString.of('en', 'nl', 'nl-formal');
        const website = aFullWebsiteForInstance().withDescription(description).withTitle(undefined).build();

        expect(() => Website.forInstance(website)).toThrow(new Error('There is more than one Nl language present'));
    });

    for(const invalidLanguage of invalidLanguages){
        let valueInNlLanguage: LanguageString;
        if (invalidLanguage === Language.GENERATED_FORMAL) {
            valueInNlLanguage = LanguageString.of(`value en`, undefined, undefined, undefined, 'value in generated formal', undefined);
        } else if (invalidLanguage == Language.GENERATED_INFORMAL) {
            valueInNlLanguage = LanguageString.of(`value en`, undefined, undefined, undefined, undefined, 'value in generated formal');
        }

        test('If title contains invalid language, throws error', () => {
            const website = aFullWebsiteForInstance().withTitle(valueInNlLanguage).withDescription(undefined).build();
            expect(() => Website.forInstance(website)).toThrow(new Error(`The nl language differs from ${validLanguages.toString()}`));
        });

        test('If description contains invalid language, throws error', () => {
            const website = aFullWebsiteForInstance().withDescription(valueInNlLanguage).withTitle(undefined).build();
            expect(() => Website.forInstance(website)).toThrow(new Error(`The nl language differs from ${validLanguages.toString()}`));
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
            const website = aFullWebsiteForInstance().withTitle(valueInNlLanguage).withDescription(undefined).build();
            expect(() => Website.forInstance(website)).not.toThrow(new Error());
        });

        test('If description contains valid language, throws error', () => {
            const website = aFullWebsiteForInstance().withDescription(valueInNlLanguage).withTitle(undefined).build();
            expect(() => Website.forInstance(website)).not.toThrow(new Error());
        });
    }

});
