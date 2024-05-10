import {
    aFullLegalResourceForConcept,
    aFullLegalResourceForConceptSnapshot,
    aFullLegalResourceForInstance,
    aFullLegalResourceForInstanceSnapshot,
    aMinimalLegalResourceForInstance
} from "./legal-resource-test-builder";
import {LegalResource, LegalResourceBuilder} from "../../../src/core/domain/legal-resource";
import {InvariantError} from "../../../src/core/domain/shared/lpdc-error";
import {Language} from "../../../src/core/domain/language";
import {LanguageString} from "../../../src/core/domain/language-string";
import {uuid} from "../../../mu-helper";


describe('forConceptSnapshot', () => {

    test('undefined id throws error', () => {
        const legalResource = aFullLegalResourceForConceptSnapshot().withId(undefined);
        expect(() => LegalResource.forConceptSnapshot(legalResource.build())).toThrowWithMessage(InvariantError, 'id mag niet ontbreken');
    });

    test('undefined url throws error', () => {
        const legalResource = aFullLegalResourceForConceptSnapshot().withUrl(undefined);
        expect(() => LegalResource.forConceptSnapshot(legalResource.build())).toThrowWithMessage(InvariantError, 'url mag niet ontbreken');
    });

    test('blank url throws error', () => {
        const legalResource = aFullLegalResourceForConceptSnapshot().withUrl('    ');
        expect(() => LegalResource.forConceptSnapshot(legalResource.build())).toThrowWithMessage(InvariantError, 'url mag niet leeg zijn');
    });

    test('undefined order throws error', () => {
        const legalResource = aFullLegalResourceForConceptSnapshot().withOrder(undefined);
        expect(() => LegalResource.forConceptSnapshot(legalResource.build())).toThrowWithMessage(InvariantError, 'order mag niet ontbreken');
    });

});

describe('forConcept', () => {

    test('undefined id throws error', () => {
        const legalResource = aFullLegalResourceForConcept().withId(undefined);
        expect(() => LegalResource.forConcept(legalResource.build())).toThrowWithMessage(InvariantError, 'id mag niet ontbreken');
    });

    test('undefined uuid throws error', () => {
        const legalResource = aFullLegalResourceForConcept().withUuid(undefined);
        expect(() => LegalResource.forConcept(legalResource.build())).toThrowWithMessage(InvariantError, 'uuid mag niet ontbreken');
    });

    test('blank uuid throws error', () => {
        const legalResource = aFullLegalResourceForConcept().withUuid(' ');
        expect(() => LegalResource.forConcept(legalResource.build())).toThrowWithMessage(InvariantError, 'uuid mag niet leeg zijn');
    });

    test('undefined url throws error', () => {
        const legalResource = aFullLegalResourceForConcept().withUrl(undefined);
        expect(() => LegalResource.forConcept(legalResource.build())).toThrowWithMessage(InvariantError, 'url mag niet ontbreken');
    });

    test('blank url throws error', () => {
        const legalResource = aFullLegalResourceForConcept().withUrl('    ');
        expect(() => LegalResource.forConcept(legalResource.build())).toThrowWithMessage(InvariantError, 'url mag niet leeg zijn');
    });

    test('undefined order throws error', () => {
        const legalResource = aFullLegalResourceForConcept().withOrder(undefined);
        expect(() => LegalResource.forConcept(legalResource.build())).toThrowWithMessage(InvariantError, 'order mag niet ontbreken');
    });

});

describe('forInstance', () => {

    test('undefined id throws error', () => {
        const legalResource = aFullLegalResourceForInstance().withId(undefined);
        expect(() => LegalResource.forInstance(legalResource.build())).toThrowWithMessage(InvariantError, 'id mag niet ontbreken');
    });

    test('undefined uuid throws error', () => {
        const legalResource = aFullLegalResourceForInstance().withUuid(undefined);
        expect(() => LegalResource.forInstance(legalResource.build())).toThrowWithMessage(InvariantError, 'uuid mag niet ontbreken');
    });

    test('blank uuid throws error', () => {
        const legalResource = aFullLegalResourceForInstance().withUuid(' ');
        expect(() => LegalResource.forInstance(legalResource.build())).toThrowWithMessage(InvariantError, 'uuid mag niet leeg zijn');
    });

    test('undefined url does not error', () => {
        const legalResource = aFullLegalResourceForInstance().withUrl(undefined);
        expect(() => LegalResource.forInstance(legalResource.build())).not.toThrow();
    });

    test('blank url does not throws error', () => {
        const legalResource = aFullLegalResourceForInstance().withUrl('    ');
        expect(() => LegalResource.forInstance(legalResource.build())).not.toThrow();
    });

    test('undefined order throws error', () => {
        const legalResource = aFullLegalResourceForInstance().withOrder(undefined);
        expect(() => LegalResource.forInstance(legalResource.build())).toThrowWithMessage(InvariantError, 'order mag niet ontbreken');
    });

});

describe('forInstanceSnapshot', () => {

    test('valid instanceSnapshot does not throw error', () => {
        const legalResource = aFullLegalResourceForInstanceSnapshot().withUuid(undefined);
        expect(() => LegalResource.forInstanceSnapshot(legalResource.build())).not.toThrow();
    });

    test('undefined id throws error', () => {
        const legalResource = aFullLegalResourceForInstanceSnapshot().withId(undefined);
        expect(() => LegalResource.forInstanceSnapshot(legalResource.build())).toThrowWithMessage(InvariantError, 'id mag niet ontbreken');
    });

    test('undefined url throws error', () => {
        const legalResource = aFullLegalResourceForInstanceSnapshot().withUrl(undefined);
        expect(() => LegalResource.forInstanceSnapshot(legalResource.build())).toThrowWithMessage(InvariantError, 'url mag niet ontbreken');
    });

    test('blank url throws error', () => {
        const legalResource = aFullLegalResourceForInstanceSnapshot().withUrl('    ');
        expect(() => LegalResource.forInstanceSnapshot(legalResource.build())).toThrowWithMessage(InvariantError, 'url mag niet leeg zijn');
    });

    test('undefined order throws error', () => {
        const legalResource = aFullLegalResourceForInstanceSnapshot().withOrder(undefined);
        expect(() => LegalResource.forInstanceSnapshot(legalResource.build())).toThrowWithMessage(InvariantError, 'order mag niet ontbreken');
    });

});

describe('isFunctionallyChanged', () => {

    test('when different amount of legalResources , then return true', () => {
        const legalResource1 = aFullLegalResourceForConcept().withUrl('https://url1.com').build();
        const legalResource2 = aFullLegalResourceForConcept().withUrl('https://url2.com').build();

        expect(LegalResource.isFunctionallyChanged([legalResource1, legalResource2], [legalResource2])).toBeTruthy();
    });

    test('when url is different, then return true', () => {
        const legalResource1 = aFullLegalResourceForConcept().withUrl('https://url1.com').build();
        const legalResource2 = aFullLegalResourceForConcept().withUrl('https://url2.com').build();

        expect(LegalResource.isFunctionallyChanged([legalResource1], [legalResource2])).toBeTruthy();

    });

    test('when url is the same, then return true', () => {
        const legalResource1 = aFullLegalResourceForConcept().withUrl('https://url1.com').build();
        const legalResource2 = aFullLegalResourceForConcept().withUrl('https://url1.com').build();

        expect(LegalResource.isFunctionallyChanged([legalResource1], [legalResource2])).toBeFalsy();
    });

    test('when urls are the same in same order, then return true', () => {
        const legalResource1 = aFullLegalResourceForConcept().withUrl('https://url1.com').build();
        const legalResource2 = aFullLegalResourceForConcept().withUrl('https://url1.com').build();
        const legalResource3 = aFullLegalResourceForConcept().withUrl('https://url2.com').build();
        const legalResource4 = aFullLegalResourceForConcept().withUrl('https://url2.com').build();

        expect(LegalResource.isFunctionallyChanged([legalResource1, legalResource3], [legalResource2, legalResource4])).toBeFalsy();
    });

    test('when urls are the same but in different order, then return true', () => {
        const legalResource1 = aFullLegalResourceForConcept().withUrl('https://url1.com').build();
        const legalResource2 = aFullLegalResourceForConcept().withUrl('https://url1.com').build();
        const legalResource3 = aFullLegalResourceForConcept().withUrl('https://url2.com').build();
        const legalResource4 = aFullLegalResourceForConcept().withUrl('https://url2.com').build();

        expect(LegalResource.isFunctionallyChanged([legalResource1, legalResource3], [legalResource4, legalResource2])).toBeTruthy();
    });

});

describe('nl language', () => {

    test('empty legal resource has no nl language', () => {
        const legalResource
            = aMinimalLegalResourceForInstance()
            .withTitle(undefined)
            .withDescription(undefined)
            .build();
        expect(legalResource.nlLanguage).toBeUndefined();
    });


    for (const nlLanguage of [Language.NL, Language.FORMAL, Language.INFORMAL]) {

        let valueInNlLanguage: LanguageString;
        if (nlLanguage === Language.NL) {
            valueInNlLanguage = LanguageString.of(`value ${uuid()} in nl`, undefined, undefined, undefined);
        } else if (nlLanguage == Language.FORMAL) {
            valueInNlLanguage = LanguageString.of(undefined, `value ${uuid()} in nl formal`, undefined, undefined);
        } else if (nlLanguage == Language.INFORMAL) {
            valueInNlLanguage = LanguageString.of(undefined, undefined, `value ${uuid()} in nl informal`, undefined);
        }

        test(`title has nl language ${nlLanguage}`, () => {
            const legalResource
                = aMinimalLegalResourceForInstance()
                .withTitle(valueInNlLanguage)
                .withDescription(undefined)
                .build();
            expect(legalResource.nlLanguage).toEqual(nlLanguage);
        });


        test(`description has nl language ${nlLanguage}`, () => {
            const legalResource
                = aMinimalLegalResourceForInstance()
                .withTitle(undefined)
                .withDescription(valueInNlLanguage)
                .build();
            expect(legalResource.nlLanguage).toEqual(nlLanguage);
        });


        test(`title, description have nl language ${nlLanguage}`, () => {
            const legalResource
                = aMinimalLegalResourceForInstance()
                .withTitle(valueInNlLanguage)
                .withDescription(valueInNlLanguage)
                .build();
            expect(legalResource.nlLanguage).toEqual(nlLanguage);
        });

    }

});

describe('transformToInformal', () => {
    test('should transform legalResource with title, description to informal', () => {
        const legalResource = aFullLegalResourceForInstance()
            .withTitle(LanguageString.of(undefined, undefined, 'titel'))
            .withDescription(LanguageString.of(undefined, undefined, 'beschrijving'))
            .build();

        expect(legalResource.transformToInformal()).toEqual(LegalResourceBuilder
            .from(legalResource)
            .withTitle(LanguageString.of(undefined, undefined, 'titel'))
            .withDescription(LanguageString.of(undefined, undefined, 'beschrijving'))
            .build()
        );
    });

    test('should transform legalResource without title, description to informal', () => {
        const legalResource = aFullLegalResourceForInstance()
            .withTitle(undefined)
            .withDescription(undefined)
            .build();

        expect(legalResource.transformToInformal()).toEqual(legalResource);
    });

    test('concept legalResource can not be transformed', () => {
        const legalResource = aFullLegalResourceForConcept().build();

        expect(() => legalResource.transformToInformal()).toThrowWithMessage(InvariantError, 'voor omzetting naar je-vorm mag languageString maar 1 NL taal bevatten');

    });
});


describe('builder', () => {
    test('from copies all fields', () => {
        const legalResource = aFullLegalResourceForConcept().build();
        const fromLegalResource = LegalResourceBuilder.from(legalResource).build();

        expect(fromLegalResource).toEqual(legalResource);
    });
});
