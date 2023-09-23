import _ from 'lodash';


/**
 *
 * @param formalInformalChoice triples
 * @returns {*} 'formal' or 'informal or undefined
 */
export function getChosenForm(formalInformalChoice) {
    return formalInformalChoice
        .find(triple => triple.p.value === 'https://productencatalogus.data.vlaanderen.be/ns/ipdc-lpdc#chosenForm')
        ?.o?.value;
}

/**
 *
 * @param triples array of triples
 * @returns {array} of language versions
 */
export function findDutchLanguageVersionsOfTriples(triples) {
    const predicatesThatCanHaveFormalInformalLanguageVersion = [
        'http://purl.org/dc/terms/title',
        'http://purl.org/dc/terms/description',
        'https://productencatalogus.data.vlaanderen.be/ns/ipdc-lpdc#additionalDescription',
        'https://productencatalogus.data.vlaanderen.be/ns/ipdc-lpdc#exception',
        'https://productencatalogus.data.vlaanderen.be/ns/ipdc-lpdc#regulation'
    ];

    const languages = triples
        .filter(triple => !!triple.o['xml:lang'])
        .filter(triple => triple.o['xml:lang'] !== 'en')
        .filter(triple => predicatesThatCanHaveFormalInformalLanguageVersion.includes(triple.p.value))
        .map(triple => triple.o['xml:lang']);

    return _.uniq(languages);
}

/**
 *
 * @param chosenForm string informal or formal or undefined
 * @returns {string} the language version
 */

export function getLanguageVersionForInstance(chosenForm) {
    return chosenForm === 'informal' ? 'nl-be-x-informal' : 'nl-be-x-formal';
}

/**
 *
 * @param conceptLanguages array of language versions 'nl', 'nl-be-x-generated-informal', 'nl-be-x-generated-formal', 'nl-be-x-informal' or 'nl-be-x-formal'
 * @param chosenForm string informal or formal
 * @returns {string} language version of concept that corresponds to chosenForm
 */
export function selectLanguageVersionForConcept(conceptLanguages, chosenForm) {
    if (chosenForm === 'informal') {
        if (conceptLanguages.includes('nl-be-x-informal')) {
            return 'nl-be-x-informal';
        } else if (conceptLanguages.includes('nl-be-x-generated-informal')) {
            return 'nl-be-x-generated-informal';
        } else {
            return 'nl';
        }
    } else {
        if (conceptLanguages.includes('nl-be-x-formal')) {
            return 'nl-be-x-formal';
        } else if (conceptLanguages.includes('nl-be-x-generated-formal') && conceptLanguages.includes('nl-be-x-informal')) {
            return 'nl-be-x-generated-formal';
        } else {
            return 'nl';
        }
    }
}