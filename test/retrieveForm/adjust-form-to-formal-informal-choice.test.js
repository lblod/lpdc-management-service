import {selectLanguageVersionForChosenForm} from "../../lib/formalInformalChoice";

const conceptLanguages = {
    onlyNl: ['nl'],
    unknown: ['nl', 'nl-be-x-generated-informal', 'nl-be-x-generated-formal'],
    informal: ['nl', 'nl-be-x-informal', 'nl-be-x-generated-formal'],
    formal: ['nl', 'nl-be-x-formal', 'nl-be-x-generated-informal'],
    both: ['nl', 'nl-be-x-formal', 'nl-be-x-informal']
};

describe('Adjust form to formal informal choice', () => {

    it('When chosenForm informal and concept in informal version then formLanguage should be @nl-be-x-informal', () => {
        const actual = selectLanguageVersionForChosenForm(conceptLanguages.informal, 'informal');

        expect(actual).toEqual('nl-be-x-informal');
    });

    it('When chosenForm informal and concept in formal version then formLanguage should be @nl-be-x-generated-informal', () => {
        const actual = selectLanguageVersionForChosenForm(conceptLanguages.formal, 'informal',);

        expect(actual).toEqual('nl-be-x-generated-informal');
    });

    it('When chosenForm informal and concept in unknown version then formLanguage should be @nl-be-x-generated-informal', () => {
        const actual = selectLanguageVersionForChosenForm(conceptLanguages.unknown, 'informal');

        expect(actual).toEqual('nl-be-x-generated-informal');
    });

    it('When chosenForm informal and concept in both version then formLanguage should be @nl-be-x-informal', () => {
        const chosenForm = 'informal';

        const actual = selectLanguageVersionForChosenForm(conceptLanguages.both, chosenForm);

        expect(actual).toEqual('nl-be-x-informal');
    });

    it('When chosenForm informal and concept only in nl version then formLanguage should be @nl', () => {
        const actual = selectLanguageVersionForChosenForm(conceptLanguages.onlyNl, 'informal');

        expect(actual).toEqual('nl');
    });

    it('When chosenForm formal and concept in formal version then formLanguage should be @nl-be-x-formal', () => {
        const actual = selectLanguageVersionForChosenForm(conceptLanguages.formal, 'formal');

        expect(actual).toEqual('nl-be-x-formal');
    });

    it('When chosenForm formal and concept in informal version then formLanguage should be @nl-be-x-generated-formal', () => {
        const actual = selectLanguageVersionForChosenForm(conceptLanguages.informal, 'formal');

        expect(actual).toEqual('nl-be-x-generated-formal');
    });

    it('When chosenForm formal and concept in unknown versions then formLanguage should be @nl-be-x-generated-formal', () => {
        const actual = selectLanguageVersionForChosenForm(conceptLanguages.unknown, 'formal');

        expect(actual).toEqual('nl-be-x-generated-formal');
    });

    it('When chosenForm formal and concept in both versions then formLanguage should be @nl-be-x-formal', () => {
        const actual = selectLanguageVersionForChosenForm(conceptLanguages.both, 'formal');

        expect(actual).toEqual('nl-be-x-formal');
    });

    it('When chosenForm formal and concept only in nl then formLanguage should be @nl', () => {

        const actual = selectLanguageVersionForChosenForm(conceptLanguages.onlyNl, 'formal');

        expect(actual).toEqual('nl');
    });

    it('When no chosenForm and concept in formal version then formLanguage should be @nl-be-x-formal', () => {
        const actual = selectLanguageVersionForChosenForm(conceptLanguages.formal, undefined);

        expect(actual).toEqual('nl-be-x-formal');
    });

    it('When no chosenForm and concept in informal version then formLanguage should be @nl-be-x-generated-formal', () => {
        const actual = selectLanguageVersionForChosenForm(conceptLanguages.informal, undefined);

        expect(actual).toEqual('nl-be-x-generated-formal');
    });

    it('When no chosenForm and concept in unknown versions then formLanguage should be @nl-be-x-generated-formal', () => {
        const actual = selectLanguageVersionForChosenForm(conceptLanguages.unknown, undefined);

        expect(actual).toEqual('nl-be-x-generated-formal');
    });

    it('When no chosenForm and concept in both versions then formLanguage should be @nl-be-x-formal', () => {
        const actual = selectLanguageVersionForChosenForm(conceptLanguages.both, undefined);

        expect(actual).toEqual('nl-be-x-formal');
    });

    it('When no chosenForm and concept only in nl then formLanguage should be @nl', () => {
        const actual = selectLanguageVersionForChosenForm(conceptLanguages.onlyNl, undefined);

        expect(actual).toEqual('nl');
    });
});
