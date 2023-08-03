import {adjustConceptFormForFormalInformalChoice} from "../../lib/adjustConceptFormForFormalInformalChoice";
import fs from 'fs';

const conceptLanguages = {
    onlyNl: ['nl'],
    unknown: ['nl', 'nl-be-x-generated-informal', 'nl-be-x-generated-formal'],
    informal: ['nl', 'nl-be-x-informal', 'nl-be-x-generated-formal'],
    formal: ['nl', 'nl-be-x-formal', 'nl-be-x-generated-informal'],
    both: ['nl', 'nl-be-x-formal', 'nl-be-x-informal']
}

describe('Adjust form to formal informal choice', () => {

    it('When chosenForm informal and concept in informal version then formLanguage should be @nl-be-x-informal', () => {
        const originalForm = fs.readFileSync(`${__dirname}/form.ttl`, 'utf8');
        const formalInformalChoice = 'informal';

        const actual = adjustConceptFormForFormalInformalChoice(originalForm, formalInformalChoice, conceptLanguages.informal);

        const expectedForm = fs.readFileSync(`${__dirname}/form-informal.ttl`, 'utf8');
        expect(actual).toEqual(expectedForm);
    });

    it('When chosenForm informal and concept in formal version then formLanguage should be @nl-be-x-generated-informal', () => {
        const originalForm = fs.readFileSync(`${__dirname}/form.ttl`, 'utf8');
        const formalInformalChoice = 'informal';

        const actual = adjustConceptFormForFormalInformalChoice(originalForm, formalInformalChoice, conceptLanguages.formal);

        const expectedForm = fs.readFileSync(`${__dirname}/form-generated-informal.ttl`, 'utf8');
        expect(actual).toEqual(expectedForm);
    });

    it('When chosenForm informal and concept in unknown version then formLanguage should be @nl-be-x-generated-informal', () => {
        const originalForm = fs.readFileSync(`${__dirname}/form.ttl`, 'utf8');
        const formalInformalChoice = 'informal';

        const actual = adjustConceptFormForFormalInformalChoice(originalForm, formalInformalChoice, conceptLanguages.unknown);

        const expectedForm = fs.readFileSync(`${__dirname}/form-generated-informal.ttl`, 'utf8');
        expect(actual).toEqual(expectedForm);
    });

    it('When chosenForm informal and concept in both version then formLanguage should be @nl-be-x-informal', () => {
        const originalForm = fs.readFileSync(`${__dirname}/form.ttl`, 'utf8');
        const formalInformalChoice = 'informal';

        const actual = adjustConceptFormForFormalInformalChoice(originalForm, formalInformalChoice, conceptLanguages.both);

        const expectedForm = fs.readFileSync(`${__dirname}/form-informal.ttl`, 'utf8');
        expect(actual).toEqual(expectedForm);
    });

    it('When chosenForm informal and concept only in nl version then formLanguage should be @nl', () => {
        const originalForm = fs.readFileSync(`${__dirname}/form.ttl`, 'utf8');
        const formalInformalChoice = 'informal';

        const actual = adjustConceptFormForFormalInformalChoice(originalForm, formalInformalChoice, conceptLanguages.onlyNl);

        const expectedForm = fs.readFileSync(`${__dirname}/form.ttl`, 'utf8');
        expect(actual).toEqual(expectedForm);
    });

    it('When chosenForm formal and concept in formal version then formLanguage should be @nl-be-x-formal', () => {
        const originalForm = fs.readFileSync(`${__dirname}/form.ttl`, 'utf8');
        const formalInformalChoice = 'formal';

        const actual = adjustConceptFormForFormalInformalChoice(originalForm, formalInformalChoice, conceptLanguages.formal);

        const expectedForm = fs.readFileSync(`${__dirname}/form-formal.ttl`, 'utf8');
        expect(actual).toEqual(expectedForm);
    });

    it('When chosenForm formal and concept in informal version then formLanguage should be @nl-be-x-generated-formal', () => {
        const originalForm = fs.readFileSync(`${__dirname}/form.ttl`, 'utf8');
        const formalInformalChoice = 'formal';

        const actual = adjustConceptFormForFormalInformalChoice(originalForm, formalInformalChoice, conceptLanguages.informal);

        const expectedForm = fs.readFileSync(`${__dirname}/form-generated-formal.ttl`, 'utf8');
        expect(actual).toEqual(expectedForm);
    });

    it('When chosenForm formal and concept in unknown versions then formLanguage should be @nl-be-x-generated-formal', () => {
        const originalForm = fs.readFileSync(`${__dirname}/form.ttl`, 'utf8');
        const formalInformalChoice = 'formal';

        const actual = adjustConceptFormForFormalInformalChoice(originalForm, formalInformalChoice, conceptLanguages.unknown);

        const expectedForm = fs.readFileSync(`${__dirname}/form-generated-formal.ttl`, 'utf8');
        expect(actual).toEqual(expectedForm);
    });

    it('When chosenForm formal and concept in both versions then formLanguage should be @nl-be-x-formal', () => {
        const originalForm = fs.readFileSync(`${__dirname}/form.ttl`, 'utf8');
        const formalInformalChoice = 'formal';

        const actual = adjustConceptFormForFormalInformalChoice(originalForm, formalInformalChoice, conceptLanguages.both);

        const expectedForm = fs.readFileSync(`${__dirname}/form-formal.ttl`, 'utf8');
        expect(actual).toEqual(expectedForm);
    });

    it('When chosenForm formal and concept only in nl then formLanguage should be @nl', () => {
        const originalForm = fs.readFileSync(`${__dirname}/form.ttl`, 'utf8');
        const formalInformalChoice = 'formal';

        const actual = adjustConceptFormForFormalInformalChoice(originalForm, formalInformalChoice, conceptLanguages.onlyNl);

        const expectedForm = fs.readFileSync(`${__dirname}/form.ttl`, 'utf8');
        expect(actual).toEqual(expectedForm);
    });

    it('When no chosenForm and concept in formal version then formLanguage should be @nl-be-x-formal', () => {
        const originalForm = fs.readFileSync(`${__dirname}/form.ttl`, 'utf8');
        const formalInformalChoice = {};

        const actual = adjustConceptFormForFormalInformalChoice(originalForm, formalInformalChoice, conceptLanguages.formal);

        const expectedForm = fs.readFileSync(`${__dirname}/form-formal.ttl`, 'utf8');
        expect(actual).toEqual(expectedForm);
    });

    it('When no chosenForm and concept in informal version then formLanguage should be @nl-be-x-generated-formal', () => {
        const originalForm = fs.readFileSync(`${__dirname}/form.ttl`, 'utf8');
        const formalInformalChoice = {};

        const actual = adjustConceptFormForFormalInformalChoice(originalForm, formalInformalChoice, conceptLanguages.informal);

        const expectedForm = fs.readFileSync(`${__dirname}/form-generated-formal.ttl`, 'utf8');
        expect(actual).toEqual(expectedForm);
    });

    it('When no chosenForm and concept in unknown versions then formLanguage should be @nl-be-x-generated-formal', () => {
        const originalForm = fs.readFileSync(`${__dirname}/form.ttl`, 'utf8');
        const formalInformalChoice = {};

        const actual = adjustConceptFormForFormalInformalChoice(originalForm, formalInformalChoice, conceptLanguages.unknown);

        const expectedForm = fs.readFileSync(`${__dirname}/form-generated-formal.ttl`, 'utf8');
        expect(actual).toEqual(expectedForm);
    });

    it('When no chosenForm and concept in both versions then formLanguage should be @nl-be-x-formal', () => {
        const originalForm = fs.readFileSync(`${__dirname}/form.ttl`, 'utf8');
        const formalInformalChoice = {};

        const actual = adjustConceptFormForFormalInformalChoice(originalForm, formalInformalChoice, conceptLanguages.both);

        const expectedForm = fs.readFileSync(`${__dirname}/form-formal.ttl`, 'utf8');
        expect(actual).toEqual(expectedForm);
    });

    it('When no chosenForm and concept only in nl then formLanguage should be @nl', () => {
        const originalForm = fs.readFileSync(`${__dirname}/form.ttl`, 'utf8');
        const formalInformalChoice = {};

        const actual = adjustConceptFormForFormalInformalChoice(originalForm, formalInformalChoice, conceptLanguages.onlyNl);

        const expectedForm = fs.readFileSync(`${__dirname}/form.ttl`, 'utf8');
        expect(actual).toEqual(expectedForm);
    });
});
