import {
    loadContactPoints,
    loadContactPointsAddresses,
    loadCosts,
    loadEvidences, loadFinancialAdvantages, loadFormalInformalChoice,
    loadOnlineProcedureRules,
    loadPublicService,
    loadRequirements, loadRules, loadWebsites,
    serviceUriForId
} from './commonQueries';
import {
    findDutchLanguageVersionsOfTriples,
    getChosenForm,
    selectLanguageVersionForConcept
} from "./formalInformalChoice";

export async function getLanguageVersionOfConcept(conceptUUID) {
    const triples = await getConceptTriples(conceptUUID);
    const conceptLanguages = findDutchLanguageVersionsOfTriples(triples);

    const formalInformalChoice = await loadFormalInformalChoice();
    const chosenForm = await getChosenForm(formalInformalChoice);

    return selectLanguageVersionForConcept(conceptLanguages, chosenForm);
}


async function getConceptTriples(conceptUUID) {
    const conceptUri = await serviceUriForId(conceptUUID, 'lpdcExt:ConceptualPublicService');
    const results = [];
    results.push(await loadEvidences(conceptUri));
    results.push(await loadRequirements(conceptUri));
    results.push(await loadOnlineProcedureRules(conceptUri));
    results.push(await loadRules(conceptUri));
    results.push(await loadCosts(conceptUri));
    results.push(await loadFinancialAdvantages(conceptUri));
    results.push(await loadContactPointsAddresses(conceptUri));
    results.push(await loadContactPoints(conceptUri));
    results.push(await loadWebsites(conceptUri));
    results.push(await loadPublicService(conceptUri));

    return results.reduce((acc, b) => [...acc, ...b]);
}
