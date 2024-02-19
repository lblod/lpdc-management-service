import {
    aFullProcedure,
    aFullProcedureForInstance,
    aFullProcedureForInstanceSnapshot,
    aMinimalProcedureForInstance,
    aMinimalProcedureForInstanceSnapshot
} from "./procedure-test-builder";
import {Iri} from "../../../src/core/domain/shared/iri";
import {Procedure} from "../../../src/core/domain/procedure";
import {uuid} from "../../../mu-helper";
import {aMinimalLanguageString} from "./language-string-test-builder";
import {Website, WebsiteBuilder} from "../../../src/core/domain/website";
import {
    aFullWebsiteForInstance,
    aMinimalWebsiteForConcept,
    aMinimalWebsiteForConceptSnapshot,
    aMinimalWebsiteForInstance,
    aMinimalWebsiteForInstanceSnapshot,
    WebsiteTestBuilder
} from "./website-test-builder";
import {Language} from "../../../src/core/domain/language";
import {LanguageString} from "../../../src/core/domain/language-string";

describe('forConcept', () => {

    test('Undefined id throws error', () => {
        const procedure = aFullProcedure().withId(undefined);
        expect(() => Procedure.forConcept(procedure.build())).toThrow(new Error('id should not be absent'));
    });

    test('Invalid iri id throws error', () => {
        expect(() => Procedure.forConcept(aFullProcedure().withId(new Iri('   ')).build())).toThrow(new Error('iri should not be blank'));
    });

    test('Undefined uuid throws error', () => {
        const procedure = aFullProcedure().withUuid(undefined);
        expect(() => Procedure.forConcept(procedure.build())).toThrow(new Error('uuid should not be absent'));
    });

    test('Blank uuid throws error', () => {
        const procedure = aFullProcedure().withUuid('   ');
        expect(() => Procedure.forConcept(procedure.build())).toThrow(new Error('uuid should not be blank'));
    });

    test('Undefined title throws error', () => {
        const procedure = aFullProcedure().withTitle(undefined);
        expect(() => Procedure.forConcept(procedure.build())).toThrow(new Error('title should not be absent'));
    });

    test('Undefined description throws error', () => {
        const procedure = aFullProcedure().withDescription(undefined);
        expect(() => Procedure.forConcept(procedure.build())).toThrow(new Error('description should not be absent'));
    });

    describe('website ', () => {

        test('valid website does not throw error', () => {
            const uuidValue = uuid();
            const validWebsite = Website.reconstitute(WebsiteBuilder.buildIri(uuidValue), uuid(), aMinimalLanguageString(WebsiteTestBuilder.TITLE).build(),
                aMinimalLanguageString(WebsiteTestBuilder.DESCRIPTION).build(), 1, WebsiteTestBuilder.URL, undefined);
            const procedure = aFullProcedure().withWebsites([validWebsite]);
            expect(() => Procedure.forConcept(procedure.build())).not.toThrow();
        });

        test('invalid evidence does throw error', () => {
            const uuidValue = uuid();
            const validWebsite = Website.reconstitute(WebsiteBuilder.buildIri(uuidValue), undefined, aMinimalLanguageString(WebsiteTestBuilder.TITLE).build(),
                aMinimalLanguageString(WebsiteTestBuilder.DESCRIPTION).build(), 1, WebsiteTestBuilder.URL, undefined);
            const procedure = aFullProcedure().withWebsites([validWebsite]);
            expect(() => Procedure.forConcept(procedure.build())).toThrow();
        });

        test('websites that dont have unique order throws error', () => {
            const website1 =
                aMinimalWebsiteForConcept().withOrder(1).build();
            const website2 =
                aMinimalWebsiteForConcept().withOrder(1).build();

            expect(() => Procedure.forConcept(aFullProcedure().withWebsites([website1, website2]).build())).toThrow(new Error('websites > order should not contain duplicates'));
        });

        test('websites that have unique order does not throw error', () => {
            const website1 =
                aMinimalWebsiteForConcept().withOrder(1).build();
            const website2 =
                aMinimalWebsiteForConcept().withOrder(2).build();

            expect(() => Procedure.forConcept(aFullProcedure().withWebsites([website1, website2]).build())).not.toThrow();
        });

    });

    test('Undefined order throws error', () => {
        expect(() => Procedure.forConcept(aFullProcedure().withOrder(undefined).build())).toThrow(new Error('order should not be absent'));
    });
});

describe('forConceptSnapshot', () => {

    test('Undefined id throws error', () => {
        const procedure = aFullProcedure().withId(undefined);
        expect(() => Procedure.forConceptSnapshot(procedure.build())).toThrow(new Error('id should not be absent'));
    });

    test('Invalid iri id throws error', () => {
        expect(() => Procedure.forConceptSnapshot(aFullProcedure().withId(new Iri('   ')).build())).toThrow(new Error('iri should not be blank'));
    });

    test('Uuid is undefined ', () => {
        const procedure = aFullProcedure().build();
        expect(Procedure.forConceptSnapshot(procedure).uuid).toBeUndefined();
    });

    test('Undefined title throws error', () => {
        const procedure = aFullProcedure().withTitle(undefined).build();
        expect(() => Procedure.forConceptSnapshot(procedure)).toThrow(new Error('title should not be absent'));
    });

    test('Undefined description throws error', () => {
        const procedure = aFullProcedure().withDescription(undefined).build();
        expect(() => Procedure.forConceptSnapshot(procedure)).toThrow(new Error('description should not be absent'));
    });

    describe('website ', () => {

        test('valid website does not throw error', () => {
            const uuidValue = uuid();
            const validWebsite = Website.reconstitute(
                WebsiteBuilder.buildIri(uuidValue),
                undefined,
                aMinimalLanguageString(WebsiteTestBuilder.TITLE).build(),
                aMinimalLanguageString(WebsiteTestBuilder.DESCRIPTION).build(),
                1,
                WebsiteTestBuilder.URL,
                undefined
            );
            const procedure = aFullProcedure().withWebsites([validWebsite]);
            expect(() => Procedure.forConceptSnapshot(procedure.build())).not.toThrow();
        });

        test('invalid evidence does throw error', () => {
            const uuidValue = uuid();
            const validWebsite = Website.reconstitute(
                WebsiteBuilder.buildIri(uuidValue),
                undefined,
                undefined,
                undefined,
                1,
                WebsiteTestBuilder.URL,
                undefined
            );
            const procedure = aFullProcedure().withWebsites([validWebsite]);
            expect(() => Procedure.forConceptSnapshot(procedure.build())).toThrow();
        });

        test('websites that dont have unique order throws error', () => {
            const website1 =
                aMinimalWebsiteForConceptSnapshot().withOrder(1).build();
            const website2 =
                aMinimalWebsiteForConceptSnapshot().withOrder(1).build();

            expect(() => Procedure.forConceptSnapshot(aFullProcedure().withWebsites([website1, website2]).build())).toThrow(new Error('websites > order should not contain duplicates'));
        });

        test('websites that have unique order does not throw error', () => {
            const website1 =
                aMinimalWebsiteForConceptSnapshot().withOrder(1).build();
            const website2 =
                aMinimalWebsiteForConceptSnapshot().withOrder(2).build();

            expect(() => Procedure.forConceptSnapshot(aFullProcedure().withWebsites([website1, website2]).build())).not.toThrow();
        });
    });

    test('Undefined order throws error', () => {
        expect(() => Procedure.forConceptSnapshot(aFullProcedure().withOrder(undefined).build())).toThrow(new Error('order should not be absent'));
    });

});

describe('for instance', () => {

    const validLanguages = [Language.NL, Language.FORMAL, Language.INFORMAL];
    const invalidLanguages = [Language.GENERATED_FORMAL, Language.GENERATED_INFORMAL];

    test('Undefined id throws error', () => {
        const procedure = aFullProcedureForInstance().withId(undefined);
        expect(() => Procedure.forInstance(procedure.build())).toThrow(new Error('id should not be absent'));
    });

    test('Undefined Uuid throws error', () => {
        const procedure = aFullProcedureForInstance().withUuid(undefined).build();
        expect(() => Procedure.forInstance(procedure).uuid).toThrow(new Error('uuid should not be absent'));
    });

    test('If title and description have the same nl language procedure is created', () => {
        const langString = LanguageString.of('en', 'nl');
        const procedure = aFullProcedureForInstance().withTitle(langString).withDescription(langString).withWebsites([]).build();
        expect(() => Procedure.forInstance(procedure)).not.toThrow();
    });

    test('If title and description are undefined procedure is created', () => {
        const procedure = aFullProcedureForInstance().withTitle(undefined).withDescription(undefined).build();
        expect(() => Procedure.forInstance(procedure)).not.toThrow();
    });

    test('If title and description have different nl languages, throws error', () => {
        const title = LanguageString.of('en', 'nl', undefined);
        const description = LanguageString.of('en', undefined, 'nl-formal');
        const procedure = aFullProcedureForInstance().withTitle(title).withDescription(description).build();

        expect(() => Procedure.forInstance(procedure)).toThrow(new Error('There is more than one Nl language present'));
    });

    test('If title has different nl languages, throws error', () => {
        const title = LanguageString.of('en', 'nl', 'nl-formal');
        const procedure = aFullProcedureForInstance().withTitle(title).withDescription(undefined).build();

        expect(() => Procedure.forInstance(procedure)).toThrow(new Error('There is more than one Nl language present'));
    });

    test('If description has different nl languages, throws error', () => {
        const description = LanguageString.of('en', 'nl', 'nl-formal');
        const procedure = aFullProcedureForInstance().withDescription(description).withTitle(undefined).build();

        expect(() => Procedure.forInstance(procedure)).toThrow(new Error('There is more than one Nl language present'));
    });

    test('If title description and all websites have the same nl language procedure is created', () => {
        const langString = LanguageString.of('en', undefined, 'nl');
        const website = aFullWebsiteForInstance().withTitle(LanguageString.of('en', undefined, 'nl-formal-website1')).withOrder(1).build();
        const anotherWebsite = aFullWebsiteForInstance().withTitle(LanguageString.of('en', undefined, 'nl-formal-website2')).withOrder(2).build();

        const procedure = aFullProcedureForInstance().withTitle(langString).withDescription(langString).withWebsites([website, anotherWebsite]).build();
        expect(() => Procedure.forInstance(procedure)).not.toThrow();
    });

    test('If a website has a different nl language than title or description, throws error', () => {
        const languageString = LanguageString.of('en', 'nl', undefined);
        const website = aFullWebsiteForInstance().withTitle(LanguageString.of('en', undefined, 'nl-formal')).build();
        const procedure = aFullProcedureForInstance().withDescription(languageString).withTitle(languageString).withWebsites([website]).build();
        expect(() => Procedure.forInstance(procedure)).toThrow(new Error('There is more than one Nl language present'));
    });

    test('websites that dont have unique order throws error', () => {
        const website1 =
            aMinimalWebsiteForInstance().withOrder(1).build();
        const website2 =
            aMinimalWebsiteForInstance().withOrder(1).build();

        expect(() => Procedure.forInstance(aMinimalProcedureForInstance().withWebsites([website1, website2]).build())).toThrow(new Error('websites > order should not contain duplicates'));
    });

    test('websites that have unique order does not throw error', () => {
        const website1 =
            aMinimalWebsiteForInstance().withOrder(1).build();
        const website2 =
            aMinimalWebsiteForInstance().withOrder(2).build();

        expect(() => Procedure.forInstance(aMinimalProcedureForInstance().withWebsites([website1, website2]).build())).not.toThrow();
    });

    for (const invalidLanguage of invalidLanguages) {
        let valueInNlLanguage: LanguageString;
        if (invalidLanguage === Language.GENERATED_FORMAL) {
            valueInNlLanguage = LanguageString.of(`value en`, undefined, undefined, undefined, 'value in generated formal', undefined);
        } else if (invalidLanguage == Language.GENERATED_INFORMAL) {
            valueInNlLanguage = LanguageString.of(`value en`, undefined, undefined, undefined, undefined, 'value in generated formal');
        }

        test('If title contains invalid language, throws error', () => {
            const procedure = aFullProcedureForInstance().withTitle(valueInNlLanguage).withDescription(undefined).withWebsites([]).build();
            expect(() => Procedure.forInstance(procedure)).toThrow(new Error(`The nl language differs from ${validLanguages.toString()}`));
        });

        test('If description contains invalid language, throws error', () => {
            const procedure = aFullProcedureForInstance().withDescription(valueInNlLanguage).withTitle(undefined).withWebsites([]).build();
            expect(() => Procedure.forInstance(procedure)).toThrow(new Error(`The nl language differs from ${validLanguages.toString()}`));
        });

        test('if a nested website title contains invalid language, throws error', () => {
            const website = aFullWebsiteForInstance().withTitle(valueInNlLanguage).withDescription(undefined).build();
            const procedure = aFullProcedureForInstance().withTitle(undefined).withDescription(undefined).withWebsites([website]).build();

            expect(() => Procedure.forInstance(procedure)).toThrow(new Error(`The nl language differs from ${validLanguages.toString()}`));
        });

        test('if a nested website description contains invalid language, throws error', () => {
            const website = aFullWebsiteForInstance().withTitle(undefined).withDescription(valueInNlLanguage).build();
            const procedure = aFullProcedureForInstance().withTitle(undefined).withDescription(undefined).withWebsites([website]).build();

            expect(() => Procedure.forInstance(procedure)).toThrow(new Error(`The nl language differs from ${validLanguages.toString()}`));
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

        test('If title contains valid language, does not throw error', () => {
            const procedure = aFullProcedureForInstance().withTitle(valueInNlLanguage).withDescription(undefined).withWebsites([]).build();
            expect(() => Procedure.forInstance(procedure)).not.toThrow();
        });

        test('If description contains valid language, does not throw error', () => {
            const procedure = aFullProcedureForInstance().withDescription(valueInNlLanguage).withTitle(undefined).withWebsites([]).build();
            expect(() => Procedure.forInstance(procedure)).not.toThrow();
        });

        test('if a nested website title contains valid language, does not throw error', () => {
            const website = aFullWebsiteForInstance().withTitle(valueInNlLanguage).withDescription(undefined).build();
            const procedure = aFullProcedureForInstance().withTitle(undefined).withDescription(undefined).withWebsites([website]).build();

            expect(() => Procedure.forInstance(procedure)).not.toThrow();
        });

        test('if a nested website description contains valid language, does not throw error', () => {
            const website = aFullWebsiteForInstance().withTitle(undefined).withDescription(valueInNlLanguage).build();
            const procedure = aFullProcedureForInstance().withTitle(undefined).withDescription(undefined).withWebsites([website]).build();

            expect(() => Procedure.forInstance(procedure)).not.toThrow();
        });
    }

    test('Undefined order throws error', () => {
        expect(() => Procedure.forInstance(aFullProcedureForInstance().withOrder(undefined).build())).toThrow(new Error('order should not be absent'));
    });

});

describe('for instance snapshot', () => {

    const validLanguages = [Language.NL, Language.FORMAL, Language.INFORMAL];
    const invalidLanguages = [Language.GENERATED_FORMAL, Language.GENERATED_INFORMAL];

    test('Undefined id throws error', () => {
        const procedure = aFullProcedureForInstanceSnapshot().withId(undefined);
        expect(() => Procedure.forInstanceSnapshot(procedure.build())).toThrow(new Error('id should not be absent'));
    });

    test('Undefined Uuid does not throw error', () => {
        const procedure = aFullProcedureForInstanceSnapshot().withUuid(undefined).build();
        expect(Procedure.forInstanceSnapshot(procedure).uuid).toBeUndefined();
    });

    test('Undefined title error', () => {
        const procedure = aFullProcedureForInstanceSnapshot().withTitle(undefined);
        expect(() => Procedure.forInstanceSnapshot(procedure.build())).toThrow(new Error('title should not be absent'));
    });

    test('Undefined description throws error', () => {
        const procedure = aFullProcedureForInstanceSnapshot().withDescription(undefined);
        expect(() => Procedure.forInstanceSnapshot(procedure.build())).toThrow(new Error('description should not be absent'));
    });

    test('If title and description have the same nl language procedure is created', () => {
        const langString = LanguageString.of('en', 'nl');
        const procedure = aFullProcedureForInstanceSnapshot().withTitle(langString).withDescription(langString).withWebsites([]).build();
        expect(() => Procedure.forInstanceSnapshot(procedure)).not.toThrow();
    });

    test('If title and description have different nl languages, throws error', () => {
        const title = LanguageString.of('en', 'nl', undefined);
        const description = LanguageString.of('en', undefined, 'nl-formal');
        const procedure = aFullProcedureForInstanceSnapshot().withTitle(title).withDescription(description).withWebsites([]).build();

        expect(() => Procedure.forInstanceSnapshot(procedure)).toThrow(new Error('There is more than one Nl language present'));
    });

    test('If title description and all websites have the same nl language procedure is created', () => {
        const langString = LanguageString.of('en', undefined, 'nl');
        const website = aFullWebsiteForInstance().withTitle(langString).withDescription(langString).withOrder(1).build();
        const anotherWebsite = aFullWebsiteForInstance().withTitle(langString).withDescription(langString).withOrder(2).build();

        const procedure = aFullProcedureForInstanceSnapshot().withTitle(langString).withDescription(langString).withWebsites([website, anotherWebsite]).build();
        expect(() => Procedure.forInstanceSnapshot(procedure)).not.toThrow();
    });

    test('If a website has a different nl language than title or description, throws error', () => {
        const languageString = LanguageString.of('en', 'nl', undefined);
        const anotherLanguageString = LanguageString.of('en', undefined, 'nl');
        const website = aFullWebsiteForInstance().withTitle(anotherLanguageString).withDescription(anotherLanguageString).build();
        const procedure = aFullProcedureForInstanceSnapshot().withDescription(languageString).withTitle(languageString).withWebsites([website]).build();
        expect(() => Procedure.forInstanceSnapshot(procedure)).toThrow(new Error('There is more than one Nl language present'));
    });

    test('websites that dont have unique order throws error', () => {
        const website1 =
            aMinimalWebsiteForInstanceSnapshot().withOrder(1).build();
        const website2 =
            aMinimalWebsiteForInstanceSnapshot().withOrder(1).build();

        expect(() => Procedure.forInstanceSnapshot(aMinimalProcedureForInstanceSnapshot().withWebsites([website1, website2]).build())).toThrow(new Error('websites > order should not contain duplicates'));
    });

    test('websites that have unique orderorder does not throw error', () => {
        const website1 =
            aMinimalWebsiteForInstanceSnapshot().withOrder(1).build();
        const website2 =
            aMinimalWebsiteForInstanceSnapshot().withOrder(2).build();

        expect(() => Procedure.forInstanceSnapshot(aMinimalProcedureForInstanceSnapshot().withWebsites([website1, website2]).build())).not.toThrow();
    });

    for (const invalidLanguage of invalidLanguages) {
        let valueInNlLanguage: LanguageString;
        if (invalidLanguage === Language.GENERATED_FORMAL) {
            valueInNlLanguage = LanguageString.of(`value en`, undefined, undefined, undefined, 'value in generated formal', undefined);
        } else if (invalidLanguage == Language.GENERATED_INFORMAL) {
            valueInNlLanguage = LanguageString.of(`value en`, undefined, undefined, undefined, undefined, 'value in generated formal');
        }

        test(`If title and description contains invalid language ${invalidLanguage}, throws error`, () => {
            const procedure = aFullProcedureForInstanceSnapshot().withTitle(valueInNlLanguage).withDescription(valueInNlLanguage).withWebsites([]).build();
            expect(() => Procedure.forInstanceSnapshot(procedure)).toThrow(new Error(`The nl language differs from ${validLanguages.toString()}`));
        });

        test(`if a nested website title contains invalid language ${invalidLanguage}, throws error`, () => {
            const website = aFullWebsiteForInstance().withTitle(valueInNlLanguage).withDescription(valueInNlLanguage).build();
            const procedure = aFullProcedureForInstanceSnapshot().withTitle(valueInNlLanguage).withDescription(valueInNlLanguage).withWebsites([website]).build();

            expect(() => Procedure.forInstanceSnapshot(procedure)).toThrow(new Error(`The nl language differs from ${validLanguages.toString()}`));
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
            const procedure = aFullProcedureForInstanceSnapshot().withTitle(valueInNlLanguage).withDescription(valueInNlLanguage).withWebsites([]).build();
            expect(() => Procedure.forInstanceSnapshot(procedure)).not.toThrow();
        });

        test(`if a nested website title contains valid language ${validLanguage}, does not throw error`, () => {
            const website = aFullWebsiteForInstance().withTitle(valueInNlLanguage).withDescription(valueInNlLanguage).build();
            const procedure = aFullProcedureForInstanceSnapshot().withTitle(valueInNlLanguage).withDescription(valueInNlLanguage).withWebsites([website]).build();

            expect(() => Procedure.forInstanceSnapshot(procedure)).not.toThrow();
        });
    }

    test('Undefined order throws error', () => {
        expect(() => Procedure.forInstanceSnapshot(aFullProcedureForInstanceSnapshot().withOrder(undefined).build()))
            .toThrow(new Error('order should not be absent'));
    });

});

describe('nl Language', () => {

    test('empty procedure has no nl language', () => {
        const procedure
            = aMinimalProcedureForInstance()
            .withTitle(undefined)
            .withDescription(undefined)
            .withWebsites([])
            .build();
        expect(procedure.nlLanguage).toBeUndefined();
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
            const procedure
                = aMinimalProcedureForInstance()
                .withTitle(valueInNlLanguage)
                .withDescription(undefined)
                .withWebsites([])
                .build();
            expect(procedure.nlLanguage).toEqual(nlLanguage);
        });


        test(`description has nl language ${nlLanguage}`, () => {
            const procedure
                = aMinimalProcedureForInstance()
                .withTitle(undefined)
                .withDescription(valueInNlLanguage)
                .withWebsites([])
                .build();
            expect(procedure.nlLanguage).toEqual(nlLanguage);
        });

        test(`website > title has nl language ${nlLanguage}`, () => {
            const procedure
                = aMinimalProcedureForInstance()
                .withTitle(undefined)
                .withDescription(undefined)
                .withWebsites([
                    aMinimalWebsiteForInstance()
                        .withTitle(valueInNlLanguage)
                        .withDescription(undefined)
                        .build()])
                .build();
            expect(procedure.nlLanguage).toEqual(nlLanguage);
        });

        test(`website > description has nl language ${nlLanguage}`, () => {
            const procedure
                = aMinimalProcedureForInstance()
                .withTitle(undefined)
                .withDescription(undefined)
                .withWebsites([
                    aMinimalWebsiteForInstance()
                        .withTitle(undefined)
                        .withDescription(valueInNlLanguage)
                        .build()])
                .build();
            expect(procedure.nlLanguage).toEqual(nlLanguage);
        });

        test(`title, description, website > title, website > description have nl language ${nlLanguage}`, () => {
            const procedure
                = aMinimalProcedureForInstance()
                .withTitle(valueInNlLanguage)
                .withDescription(valueInNlLanguage)
                .withWebsites([
                    aMinimalWebsiteForInstance()
                        .withTitle(valueInNlLanguage)
                        .withDescription(valueInNlLanguage)
                        .build()])
                .build();
            expect(procedure.nlLanguage).toEqual(nlLanguage);
        });

    }

});