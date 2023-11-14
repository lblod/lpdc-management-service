import {findDutchLanguageVersionsOfTriples} from "./formalInformalChoice";
import {
    loadContactPoints,
    loadContactPointsAddresses,
    loadCosts,
    loadEvidences,
    loadFinancialAdvantages,
    loadOnlineProcedureRules,
    loadPublicService,
    loadRequirements,
    loadRules,
    loadWebsites,
    serviceUriForId
} from "./commonQueries";

export async function getLanguageVersionOfInstance(publicServiceId) {
    const triples = await getPublicServiceTriples(publicServiceId);
    const languageVersions = findDutchLanguageVersionsOfTriples(triples);
    if (languageVersions.length > 1) {
        console.error(`multiple language versions (${languageVersions.toString()}) found for instance ${publicServiceId}`)
    }
    return languageVersions[0];
}

async function getPublicServiceTriples(publicServiceUUID) {
    const publicServiceUri = await serviceUriForId(publicServiceUUID, 'cpsv:PublicService');
    const type = 'cpsv:PublicService';
    const results = [];
    results.push(await loadEvidences(publicServiceUri, {type}));
    results.push(await loadRequirements(publicServiceUri, {type}));
    results.push(await loadOnlineProcedureRules(publicServiceUri, {type}));
    results.push(await loadRules(publicServiceUri, {type}));
    results.push(await loadCosts(publicServiceUri, {type}));
    results.push(await loadFinancialAdvantages(publicServiceUri, {type}));
    results.push(await loadContactPointsAddresses(publicServiceUri, {type}));
    results.push(await loadContactPoints(publicServiceUri, {type}));
    results.push(await loadWebsites(publicServiceUri, {type}));
    results.push(await loadPublicService(publicServiceUri, {type}));

    return results.reduce((acc, b) => [...acc, ...b]);
}
