import {aFullWebsite, aFullWebsiteForInstance, aFullWebsiteForInstanceSnapshot} from "./website-test-builder";
import {Website} from "../../../src/core/domain/website";
import {Iri} from "../../../src/core/domain/shared/iri";
import {Language} from "../../../src/core/domain/language";
import {LanguageString} from "../../../src/core/domain/language-string";
import {InvariantError} from "../../../src/core/domain/shared/lpdc-error";


describe('forConcept', () => {

    test('Undefined id throws error', () => {
        const website = aFullWebsite().withId(undefined);
        expect(() => Website.forConcept(website.build())).toThrowWithMessage(InvariantError, 'id mag niet ontbreken');
    });

    test('Invalid iri id throws error', () => {
        expect(() => Website.forConcept(aFullWebsite().withId(new Iri('   ')).build())).toThrowWithMessage(InvariantError, 'iri mag niet leeg zijn');
    });

    test('Undefined uuid throws error', () => {
        const website = aFullWebsite().withUuid(undefined);
        expect(() => Website.forConcept(website.build())).toThrowWithMessage(InvariantError, 'uuid mag niet ontbreken');
    });

    test('Blank uuid throws error', () => {
        const website = aFullWebsite().withUuid('   ');
        expect(() => Website.forConcept(website.build())).toThrowWithMessage(InvariantError, 'uuid mag niet leeg zijn');
    });

    test('Undefined title throws error', () => {
        const website = aFullWebsite().withTitle(undefined);
        expect(() => Website.forConcept(website.build())).toThrowWithMessage(InvariantError, 'title mag niet ontbreken');
    });

    test('Undefined url throws error', () => {
        const website = aFullWebsite().withUrl(undefined);
        expect(() => Website.forConcept(website.build())).toThrowWithMessage(InvariantError, 'url mag niet ontbreken');
    });

    test('Blank url throws error', () => {
        const website = aFullWebsite().withUrl('   ');
        expect(() => Website.forConcept(website.build())).toThrowWithMessage(InvariantError, 'url mag niet leeg zijn');
    });

    test('Undefined order throws error', () => {
        expect(() => Website.forConcept(aFullWebsite().withOrder(undefined).build())).toThrowWithMessage(InvariantError, 'order mag niet ontbreken');
    });

});

describe('forConceptSnapshot', () => {

    test('Undefined id throws error', () => {
        const website = aFullWebsite().withId(undefined);
        expect(() => Website.forConceptSnapshot(website.build())).toThrowWithMessage(InvariantError, 'id mag niet ontbreken');
    });

    test('Invalid iri id throws error', () => {
        expect(() => Website.forConceptSnapshot(aFullWebsite().withId(new Iri('   ')).build())).toThrowWithMessage(InvariantError, 'iri mag niet leeg zijn');
    });

    test('Uuid is undefined ', () => {
        const website = aFullWebsite().build();
        expect(Website.forConceptSnapshot(website).uuid).toBeUndefined();
    });

    test('Undefined title throws error', () => {
        const website = aFullWebsite().withTitle(undefined).build();
        expect(() => Website.forConceptSnapshot(website)).toThrowWithMessage(InvariantError, 'title mag niet ontbreken');
    });

    test('Undefined url throws error', () => {
        const website = aFullWebsite().withUrl(undefined);
        expect(() => Website.forConceptSnapshot(website.build())).toThrowWithMessage(InvariantError, 'url mag niet ontbreken');
    });

    test('Blank url throws error', () => {
        const website = aFullWebsite().withUrl('   ');
        expect(() => Website.forConceptSnapshot(website.build())).toThrowWithMessage(InvariantError, 'url mag niet leeg zijn');
    });

    test('Undefined order throws error', () => {
        expect(() => Website.forConceptSnapshot(aFullWebsite().withOrder(undefined).build())).toThrowWithMessage(InvariantError, 'order mag niet ontbreken');
    });
});

describe('for instance', () => {

    const validLanguages = [Language.NL, Language.FORMAL, Language.INFORMAL];
    const invalidLanguages = [Language.GENERATED_FORMAL, Language.GENERATED_INFORMAL];

    test('Undefined id throws error', () => {
        const website = aFullWebsiteForInstance().withId(undefined);
        expect(() => Website.forInstance(website.build())).toThrowWithMessage(InvariantError, 'id mag niet ontbreken');
    });

    test('Undefined Uuid throws error', () => {
        const website = aFullWebsiteForInstance().withUuid(undefined).build();
        expect(() => Website.forInstance(website).uuid).toThrowWithMessage(InvariantError, 'uuid mag niet ontbreken');
    });

    test('If title and description have the same nl language website is created', () => {
        const langString = LanguageString.of('en', 'nl');
        const website = aFullWebsiteForInstance().withTitle(langString).withDescription(langString).build();
        expect(() => Website.forInstance(website)).not.toThrow();
    });

    test('If title and description are undefined website is created', () => {
        const website = aFullWebsiteForInstance().withTitle(undefined).withDescription(undefined).build();
        expect(() => Website.forInstance(website)).not.toThrow();
    });

    test('If title and description have different nl languages, throws error', () => {
        const title = LanguageString.of('en', 'nl', undefined);
        const description = LanguageString.of('en', undefined, 'nl-formal');
        const website = aFullWebsiteForInstance().withTitle(title).withDescription(description).build();

        expect(() => Website.forInstance(website)).toThrowWithMessage(InvariantError, 'Er is meer dan een nl-taal aanwezig');
    });

    test('If title has different nl languages, throws error', () => {
        const title = LanguageString.of('en', 'nl', 'nl-formal');
        const website = aFullWebsiteForInstance().withTitle(title).withDescription(undefined).build();

        expect(() => Website.forInstance(website)).toThrowWithMessage(InvariantError, 'Er is meer dan een nl-taal aanwezig');
    });

    test('If description has different nl languages, throws error', () => {
        const description = LanguageString.of('en', 'nl', 'nl-formal');
        const website = aFullWebsiteForInstance().withDescription(description).withTitle(undefined).build();

        expect(() => Website.forInstance(website)).toThrowWithMessage(InvariantError, 'Er is meer dan een nl-taal aanwezig');
    });

    for (const invalidLanguage of invalidLanguages) {
        let valueInNlLanguage: LanguageString;
        if (invalidLanguage === Language.GENERATED_FORMAL) {
            valueInNlLanguage = LanguageString.of(`value en`, undefined, undefined, undefined, 'value in generated formal', undefined);
        } else if (invalidLanguage == Language.GENERATED_INFORMAL) {
            valueInNlLanguage = LanguageString.of(`value en`, undefined, undefined, undefined, undefined, 'value in generated formal');
        }

        test('If title contains invalid language, throws error', () => {
            const website = aFullWebsiteForInstance().withTitle(valueInNlLanguage).withDescription(undefined).build();
            expect(() => Website.forInstance(website)).toThrowWithMessage(InvariantError, `De nl-taal verschilt van ${validLanguages.toString()}`);
        });

        test('If description contains invalid language, throws error', () => {
            const website = aFullWebsiteForInstance().withDescription(valueInNlLanguage).withTitle(undefined).build();
            expect(() => Website.forInstance(website)).toThrowWithMessage(InvariantError, `De nl-taal verschilt van ${validLanguages.toString()}`);
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
            const website = aFullWebsiteForInstance().withTitle(valueInNlLanguage).withDescription(undefined).build();
            expect(() => Website.forInstance(website)).not.toThrow();
        });

        test('If description contains valid language, throws error', () => {
            const website = aFullWebsiteForInstance().withDescription(valueInNlLanguage).withTitle(undefined).build();
            expect(() => Website.forInstance(website)).not.toThrow();
        });
    }

    test('Undefined order throws error', () => {
        expect(() => Website.forInstance(aFullWebsiteForInstance().withOrder(undefined).build())).toThrowWithMessage(InvariantError, 'order mag niet ontbreken');
    });
});

describe('for instance snapshot', () => {

    const validLanguages = [Language.NL, Language.FORMAL, Language.INFORMAL];
    const invalidLanguages = [Language.GENERATED_FORMAL, Language.GENERATED_INFORMAL];

    test('Undefined id throws error', () => {
        const website = aFullWebsiteForInstanceSnapshot().withId(undefined);
        expect(() => Website.forInstanceSnapshot(website.build())).toThrowWithMessage(InvariantError, 'id mag niet ontbreken');
    });

    test('Undefined Uuid does not throw error', () => {
        const website = aFullWebsiteForInstanceSnapshot().withUuid(undefined).build();
        expect(Website.forInstanceSnapshot(website).uuid).toBeUndefined();
    });

    test('Undefined title throws error', () => {
        const website = aFullWebsiteForInstanceSnapshot().withTitle(undefined);
        expect(() => Website.forInstanceSnapshot(website.build())).toThrowWithMessage(InvariantError, 'title mag niet ontbreken');
    });

    test('Undefined description does not throw error', () => {
        const website = aFullWebsiteForInstanceSnapshot().withDescription(undefined).build();
        expect(Website.forInstanceSnapshot(website).description).toBeUndefined();
    });

    test('Undefined url throws error', () => {
        const website = aFullWebsiteForInstanceSnapshot().withUrl(undefined);
        expect(() => Website.forInstanceSnapshot(website.build())).toThrowWithMessage(InvariantError, 'url mag niet ontbreken');
    });

    test('If title and description have the same nl language website is created', () => {
        const langString = LanguageString.of('en', 'nl');
        const website = aFullWebsiteForInstanceSnapshot().withTitle(langString).withDescription(langString).build();
        expect(() => Website.forInstanceSnapshot(website)).not.toThrow();
    });

    test('If title and description have different nl languages, throws error', () => {
        const title = LanguageString.of('en', 'nl', undefined);
        const description = LanguageString.of('en', undefined, 'nl-formal');
        const website = aFullWebsiteForInstanceSnapshot().withTitle(title).withDescription(description).build();

        expect(() => Website.forInstanceSnapshot(website)).toThrowWithMessage(InvariantError, 'Er is meer dan een nl-taal aanwezig');
    });

    for (const invalidLanguage of invalidLanguages) {
        let valueInNlLanguage: LanguageString;
        if (invalidLanguage === Language.GENERATED_FORMAL) {
            valueInNlLanguage = LanguageString.of(`value en`, undefined, undefined, undefined, 'value in generated formal', undefined);
        } else if (invalidLanguage == Language.GENERATED_INFORMAL) {
            valueInNlLanguage = LanguageString.of(`value en`, undefined, undefined, undefined, undefined, 'value in generated formal');
        }

        test(`If title or description contains invalid language ${invalidLanguage}, throws error`, () => {
            const website = aFullWebsiteForInstanceSnapshot().withTitle(valueInNlLanguage).withDescription(undefined).build();
            expect(() => Website.forInstanceSnapshot(website)).toThrowWithMessage(InvariantError, `De nl-taal verschilt van ${validLanguages.toString()}`);
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

        test(`If title and description contains valid language ${validLanguage}, does not throw error`, () => {
            const website = aFullWebsiteForInstanceSnapshot().withTitle(valueInNlLanguage).withDescription(valueInNlLanguage).build();
            expect(() => Website.forInstanceSnapshot(website)).not.toThrow();
        });

    }

    test('Undefined order throws error', () => {
        expect(() => Website.forInstanceSnapshot(aFullWebsiteForInstanceSnapshot().withOrder(undefined).build())).toThrowWithMessage(InvariantError, 'order mag niet ontbreken');
    });
});
