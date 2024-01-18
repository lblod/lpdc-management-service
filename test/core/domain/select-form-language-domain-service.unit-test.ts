import {aFormalInformalChoice} from "./formal-informal-choice-test-builder";
import {ChosenFormType} from "../../../src/core/domain/types";
import {aMinimalConcept} from "./concept-test-builder";
import {LanguageString} from "../../../src/core/domain/language-string";
import {SelectFormLanguageDomainService} from "../../../src/core/domain/select-form-language-domain-service";
import {Language} from "../../../src/core/domain/language";

describe('select form language for concept', () => {

    test('When chosenForm informal and concept in informal version then formLanguage should be @nl-be-x-informal', () => {
        const formalInformalChoice =
            aFormalInformalChoice()
                .withChosenForm(ChosenFormType.INFORMAL)
                .build();
        const concept =
            aMinimalConcept()
                .withTitle(
                    LanguageString.of(undefined, 'nl', undefined, 'nl informal', 'nl generated formal', undefined)
                )
                .build();

        const selectedLanguage = new SelectFormLanguageDomainService().selectForConcept(concept, formalInformalChoice);
        expect(selectedLanguage).toEqual(Language.INFORMAL);
    });

    test('When chosenForm informal and concept in formal version then formLanguage should be @nl-be-x-generated-informal', () => {
        const formalInformalChoice =
            aFormalInformalChoice()
                .withChosenForm(ChosenFormType.INFORMAL)
                .build();
        const concept =
            aMinimalConcept()
                .withTitle(
                    LanguageString.of(undefined, 'nl', 'nl formal', undefined, undefined, 'nl generated informal')
                )
                .build();

        const selectedLanguage = new SelectFormLanguageDomainService().selectForConcept(concept, formalInformalChoice);
        expect(selectedLanguage).toEqual(Language.GENERATED_INFORMAL);
    });

    test('When chosenForm informal and concept only generated languages then formLanguage should be @nl-be-x-generated-informal', () => {
        const formalInformalChoice =
            aFormalInformalChoice()
                .withChosenForm(ChosenFormType.INFORMAL)
                .build();
        const concept =
            aMinimalConcept()
                .withTitle(
                    LanguageString.of(undefined, 'nl', undefined, undefined, 'nl generated formal', 'nl generated informal')
                )
                .build();

        const selectedLanguage = new SelectFormLanguageDomainService().selectForConcept(concept, formalInformalChoice);
        expect(selectedLanguage).toEqual(Language.GENERATED_INFORMAL);
    });


    test('When chosenForm informal and concept both formal and informal then formLanguage should be @nl-be-x-informal', () => {
        const formalInformalChoice =
            aFormalInformalChoice()
                .withChosenForm(ChosenFormType.INFORMAL)
                .build();
        const concept =
            aMinimalConcept()
                .withTitle(
                    LanguageString.of(undefined, 'nl', 'nl formal', 'nl informal', undefined, undefined)
                )
                .build();

        const selectedLanguage = new SelectFormLanguageDomainService().selectForConcept(concept, formalInformalChoice);
        expect(selectedLanguage).toEqual(Language.INFORMAL);
    });

    test('When chosenForm informal and concept contains only nl then formLanguage should be @nl', () => {
        const formalInformalChoice =
            aFormalInformalChoice()
                .withChosenForm(ChosenFormType.INFORMAL)
                .build();
        const concept =
            aMinimalConcept()
                .withTitle(
                    LanguageString.of(undefined, 'nl', undefined, undefined, undefined, undefined)
                )
                .build();

        const selectedLanguage = new SelectFormLanguageDomainService().selectForConcept(concept, formalInformalChoice);
        expect(selectedLanguage).toEqual(Language.NL);
    });

    test('When chosenForm formal and concept in formal version then formLanguage should be @nl-be-x-formal', () => {
        const formalInformalChoice =
            aFormalInformalChoice()
                .withChosenForm(ChosenFormType.FORMAL)
                .build();
        const concept =
            aMinimalConcept()
                .withTitle(
                    LanguageString.of(undefined, 'nl', 'nl formal', undefined, undefined, 'nl generated informal')
                )
                .build();

        const selectedLanguage = new SelectFormLanguageDomainService().selectForConcept(concept, formalInformalChoice);
        expect(selectedLanguage).toEqual(Language.FORMAL);
    });

    test('When chosenForm formal and concept in informal version then formLanguage should be @nl-be-x-generated-formal', () => {
        const formalInformalChoice =
            aFormalInformalChoice()
                .withChosenForm(ChosenFormType.FORMAL)
                .build();
        const concept =
            aMinimalConcept()
                .withTitle(
                    LanguageString.of(undefined, 'nl', undefined, 'nl informal', 'nl generated formal', undefined)
                )
                .build();

        const selectedLanguage = new SelectFormLanguageDomainService().selectForConcept(concept, formalInformalChoice);
        expect(selectedLanguage).toEqual(Language.GENERATED_FORMAL);
    });

    test('When chosenForm formal and concept only generated languages then formLanguage should be @nl', () => {
        const formalInformalChoice =
            aFormalInformalChoice()
                .withChosenForm(ChosenFormType.FORMAL)
                .build();
        const concept =
            aMinimalConcept()
                .withTitle(
                    LanguageString.of(undefined, 'nl', undefined, undefined, 'nl generated formal', 'nl generated informal')
                )
                .build();

        const selectedLanguage = new SelectFormLanguageDomainService().selectForConcept(concept, formalInformalChoice);
        expect(selectedLanguage).toEqual(Language.NL);
    });

    test('When chosenForm formal and concept both formal and informal then formLanguage should be @nl-be-x-formal', () => {
        const formalInformalChoice =
            aFormalInformalChoice()
                .withChosenForm(ChosenFormType.FORMAL)
                .build();
        const concept =
            aMinimalConcept()
                .withTitle(
                    LanguageString.of(undefined, 'nl', 'nl formal', 'nl informal', undefined, undefined)
                )
                .build();

        const selectedLanguage = new SelectFormLanguageDomainService().selectForConcept(concept, formalInformalChoice);
        expect(selectedLanguage).toEqual(Language.FORMAL);
    });

    test('When chosenForm formal and concept only in nl then formLanguage should be @nl', () => {
        const formalInformalChoice =
            aFormalInformalChoice()
                .withChosenForm(ChosenFormType.FORMAL)
                .build();
        const concept =
            aMinimalConcept()
                .withTitle(
                    LanguageString.of(undefined, 'nl', undefined, undefined, undefined, undefined)
                )
                .build();

        const selectedLanguage = new SelectFormLanguageDomainService().selectForConcept(concept, formalInformalChoice);
        expect(selectedLanguage).toEqual(Language.NL);
    });

    test('When no chosenForm and concept in formal version then formLanguage should be @nl-be-x-formal', () => {
        const concept =
            aMinimalConcept()
                .withTitle(
                    LanguageString.of(undefined, 'nl', 'nl formal', undefined, undefined, 'nl generated informal')
                )
                .build();

        const selectedLanguage = new SelectFormLanguageDomainService().selectForConcept(concept, undefined);
        expect(selectedLanguage).toEqual(Language.FORMAL);
    });

    test('When no chosenForm and concept in informal version then formLanguage should be @nl-be-x-generated-formal', () => {
        const concept =
            aMinimalConcept()
                .withTitle(
                    LanguageString.of(undefined, 'nl', undefined, 'nl informal', 'nl generated formal', undefined)
                )
                .build();

        const selectedLanguage = new SelectFormLanguageDomainService().selectForConcept(concept, undefined);
        expect(selectedLanguage).toEqual(Language.GENERATED_FORMAL);
    });

    test('When no chosenForm and concept only generated languages then formLanguage should be @nl', () => {
        const concept =
            aMinimalConcept()
                .withTitle(
                    LanguageString.of(undefined, 'nl', undefined, undefined, 'nl generated formal', 'nl generated informal')
                )
                .build();

        const selectedLanguage = new SelectFormLanguageDomainService().selectForConcept(concept, undefined);
        expect(selectedLanguage).toEqual(Language.NL);
    });

    test('When no chosenForm and concept both formal and informal then formLanguage should be @nl-be-x-formal', () => {
        const concept =
            aMinimalConcept()
                .withTitle(
                    LanguageString.of(undefined, 'nl', 'nl formal', 'nl informal', undefined, undefined)
                )
                .build();

        const selectedLanguage = new SelectFormLanguageDomainService().selectForConcept(concept, undefined);
        expect(selectedLanguage).toEqual(Language.FORMAL);
    });

    test('When no chosenForm and concept only in nl then formLanguage should be @nl', () => {
        const concept =
            aMinimalConcept()
                .withTitle(
                    LanguageString.of(undefined, 'nl', undefined, undefined, undefined, undefined)
                )
                .build();

        const selectedLanguage = new SelectFormLanguageDomainService().selectForConcept(concept, undefined);
        expect(selectedLanguage).toEqual(Language.NL);
    });

});