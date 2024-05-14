import {
    aFullWebsite,
    aFullWebsiteForInstance,
    aFullWebsiteForInstanceSnapshot,
    aMinimalWebsiteForInstance,
    WebsiteTestBuilder
} from "./website-test-builder";
import {Website, WebsiteBuilder} from "../../../src/core/domain/website";
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
        const langString = LanguageString.of('nl');
        const website = aFullWebsiteForInstance().withTitle(langString).withDescription(langString).build();
        expect(() => Website.forInstance(website)).not.toThrow();
    });

    test('If title and description are undefined website is created', () => {
        const website = aFullWebsiteForInstance().withTitle(undefined).withDescription(undefined).build();
        expect(() => Website.forInstance(website)).not.toThrow();
    });

    test('If title and description have different nl languages, throws error', () => {
        const title = LanguageString.of('nl', undefined);
        const description = LanguageString.of(undefined, 'nl-formal');
        const website = aFullWebsiteForInstance().withTitle(title).withDescription(description).build();

        expect(() => Website.forInstance(website)).toThrowWithMessage(InvariantError, 'Er is meer dan een nl-taal aanwezig');
    });

    test('If title has different nl languages, throws error', () => {
        const title = LanguageString.of('nl', 'nl-formal');
        const website = aFullWebsiteForInstance().withTitle(title).withDescription(undefined).build();

        expect(() => Website.forInstance(website)).toThrowWithMessage(InvariantError, 'Er is meer dan een nl-taal aanwezig');
    });

    test('If description has different nl languages, throws error', () => {
        const description = LanguageString.of('nl', 'nl-formal');
        const website = aFullWebsiteForInstance().withDescription(description).withTitle(undefined).build();

        expect(() => Website.forInstance(website)).toThrowWithMessage(InvariantError, 'Er is meer dan een nl-taal aanwezig');
    });

    for (const invalidLanguage of invalidLanguages) {
        let valueInNlLanguage: LanguageString;
        if (invalidLanguage === Language.GENERATED_FORMAL) {
            valueInNlLanguage = LanguageString.of(undefined, undefined, undefined, 'value in generated formal', undefined);
        } else if (invalidLanguage == Language.GENERATED_INFORMAL) {
            valueInNlLanguage = LanguageString.of(undefined, undefined, undefined, undefined, 'value in generated formal');
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
            valueInNlLanguage = LanguageString.of('value nl', undefined, undefined, undefined, undefined);
        } else if (validLanguage == Language.FORMAL) {
            valueInNlLanguage = LanguageString.of(undefined, 'value formal', undefined, undefined, undefined);
        } else if (validLanguage == Language.INFORMAL) {
            valueInNlLanguage = LanguageString.of(undefined, undefined, 'value informal', undefined, undefined);
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
        const langString = LanguageString.of('nl');
        const website = aFullWebsiteForInstanceSnapshot().withTitle(langString).withDescription(langString).build();
        expect(() => Website.forInstanceSnapshot(website)).not.toThrow();
    });

    test('If title and description have different nl languages, throws error', () => {
        const title = LanguageString.of('nl', undefined);
        const description = LanguageString.of(undefined, 'nl-formal');
        const website = aFullWebsiteForInstanceSnapshot().withTitle(title).withDescription(description).build();

        expect(() => Website.forInstanceSnapshot(website)).toThrowWithMessage(InvariantError, 'Er is meer dan een nl-taal aanwezig');
    });

    for (const invalidLanguage of invalidLanguages) {
        let valueInNlLanguage: LanguageString;
        if (invalidLanguage === Language.GENERATED_FORMAL) {
            valueInNlLanguage = LanguageString.of(undefined, undefined, undefined, 'value in generated formal', undefined);
        } else if (invalidLanguage == Language.GENERATED_INFORMAL) {
            valueInNlLanguage = LanguageString.of(undefined, undefined, undefined, undefined, 'value in generated formal');
        }

        test(`If title or description contains invalid language ${invalidLanguage}, throws error`, () => {
            const website = aFullWebsiteForInstanceSnapshot().withTitle(valueInNlLanguage).withDescription(undefined).build();
            expect(() => Website.forInstanceSnapshot(website)).toThrowWithMessage(InvariantError, `De nl-taal verschilt van ${validLanguages.toString()}`);
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

        test(`If title and description contains valid language ${validLanguage}, does not throw error`, () => {
            const website = aFullWebsiteForInstanceSnapshot().withTitle(valueInNlLanguage).withDescription(valueInNlLanguage).build();
            expect(() => Website.forInstanceSnapshot(website)).not.toThrow();
        });

    }

    test('Undefined order throws error', () => {
        expect(() => Website.forInstanceSnapshot(aFullWebsiteForInstanceSnapshot().withOrder(undefined).build())).toThrowWithMessage(InvariantError, 'order mag niet ontbreken');
    });
});

describe('transformToInformal', () => {

    test('should transform website with title, description to informal', () => {
        const website = aFullWebsiteForInstance()
            .withTitle(LanguageString.of(undefined, 'titel'))
            .withDescription(LanguageString.of(undefined, 'beschrijving'))
            .build();

        expect(website.transformToInformal()).toEqual(WebsiteBuilder
            .from(website)
            .withTitle(LanguageString.of(undefined, undefined, 'titel'))
            .withDescription(LanguageString.of(undefined, undefined, 'beschrijving'))
            .build()
        );
    });

    test('should transform website without title, description to informal', () => {
        const website = aFullWebsiteForInstance()
            .withTitle(undefined)
            .withDescription(undefined)
            .build();

        expect(website.transformToInformal()).toEqual(website);
    });

    test('concept website can not be transformed', () => {
        const website = aFullWebsite().build();

        expect(() => website.transformToInformal()).toThrowWithMessage(InvariantError, 'voor omzetting naar je-vorm mag languageString maar 1 NL taal bevatten');

    });
});

describe('transformLanguage', () => {

    test('should transform website with title, description', () => {
        const website = aFullWebsite()
            .build();

        expect(website.transformLanguage(Language.FORMAL, Language.INFORMAL))
            .toEqual(WebsiteBuilder
                .from(website)
                .withTitle(LanguageString.ofValueInLanguage(WebsiteTestBuilder.TITLE_NL_FORMAL, Language.INFORMAL))
                .withDescription(LanguageString.ofValueInLanguage(WebsiteTestBuilder.DESCRIPTION_NL_FORMAL, Language.INFORMAL))
                .build()
            );
    });

    test('should transform website without title, description to informal', () => {
        const website = aMinimalWebsiteForInstance()
            .withTitle(undefined)
            .withDescription(undefined)
            .build();

        expect(website.transformLanguage(Language.FORMAL, Language.INFORMAL)).toEqual(website);
    });

});

describe('builder', () => {
    test('from copies all fields', () => {
        const website = aFullWebsite().build();
        const fromWebsite = WebsiteBuilder.from(website).build();

        expect(fromWebsite).toEqual(website);
    });
});
