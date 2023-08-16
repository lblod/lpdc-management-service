
export function getChosenForm(formalInformalChoice) {
    return formalInformalChoice
        .find(triple => triple.p.value === 'https://productencatalogus.data.vlaanderen.be/ns/ipdc-lpdc#chosenForm')
        ?.o?.value;
}

/**
 *
 * @param triples
 * @returns {array} of language versions
 */
export function findConceptOrInstanceLanguages(triples) {
    const serviceUri = triples
        .filter(triple => triple.p.value === 'http://www.w3.org/1999/02/22-rdf-syntax-ns#type')
        .find(triple => triple.o.value === 'http://purl.org/vocab/cpsv#PublicService' || triple.o.value === 'https://productencatalogus.data.vlaanderen.be/ns/ipdc-lpdc#ConceptualPublicService')
        .s.value;

    return triples
        .filter(triple => triple.s.value === serviceUri && triple.p.value === 'http://purl.org/dc/terms/title')
        .map(triple => triple.o['xml:lang']);
}

/**
 *
 * @param conceptLanguages array of language versions 'nl', 'nl-be-x-generated-informal', 'nl-be-x-generated-formal', 'nl-be-x-informal' or 'nl-be-x-formal'
 * @param chosenForm string informal or formal
 * @returns {string} language version of concept that corresponds to chosenForm
 */
export function selectLanguageVersionForChosenForm(conceptLanguages, chosenForm) {
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
        } else if (conceptLanguages.includes('nl-be-x-generated-formal')) {
            return 'nl-be-x-generated-formal';
        } else {
            return 'nl';
        }
    }
}