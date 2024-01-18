import {querySudo} from '@lblod/mu-auth-sudo';
import fs from 'fs';
import {sparqlEscapeUri} from '../mu-helper';
import {FORM_MAPPING, PREFIX} from '../config';
import {bindingsToNT} from '../utils/bindingsToNT';
import {
    loadAttachments,
    loadContactPoints,
    loadContactPointsAddresses,
    loadCosts,
    loadEvidences,
    loadFinancialAdvantages,
    loadFormalInformalChoice,
    loadOnlineProcedureRules,
    loadPublicService,
    loadRequirements,
    loadRules,
    loadWebsites,
    serviceUriForId
} from './commonQueries';
import {
    findDutchLanguageVersionsOfTriples,
    getChosenForm,
    getLanguageVersionForInstance,
    selectLanguageVersionForConcept
} from "./formalInformalChoice";
import {CodeRepository} from "../src/core/port/driven/persistence/code-repository";

//TODO LPDC-917: 'split up', is now being used from 2 already split up app.ts resource calls (one for concepts, one for instances)
export async function retrieveForm(publicServiceId: string, formId: string, codeRepository: CodeRepository): Promise<{
    form: string,
    meta: string,
    source: string,
    serviceUri: string
}> {
    let form = fs.readFileSync(`./config/${FORM_MAPPING[formId]}/form.ttl`, 'utf8');

    let isConceptualPublicService = false;
    let serviceUri = await serviceUriForId(publicServiceId);

    if (!serviceUri) {
        serviceUri = await serviceUriForId(publicServiceId, 'lpdcExt:ConceptualPublicService');

        if (serviceUri) {
            isConceptualPublicService = true;
        } else {
            throw `Service URI not found for id ${publicServiceId}`;
        }
    }

    const type = isConceptualPublicService ? 'lpdcExt:ConceptualPublicService' : 'cpsv:PublicService';

    const results = [];
    results.push(await loadEvidences(serviceUri, {type}));
    results.push(await loadRequirements(serviceUri, {type}));
    results.push(await loadOnlineProcedureRules(serviceUri, {type}));
    results.push(await loadRules(serviceUri, {type}));
    results.push(await loadCosts(serviceUri, {type}));
    results.push(await loadFinancialAdvantages(serviceUri, {type}));
    results.push(await loadContactPointsAddresses(serviceUri, {type}));
    results.push(await loadContactPoints(serviceUri, {type}));
    results.push(await loadWebsites(serviceUri, {type}));
    results.push(await loadPublicService(serviceUri, {type}));
    results.push(await loadAttachments(serviceUri, {type}));

    const sourceBindings = results
        .reduce((acc, b) => [...acc, ...b]);

    const chosenForm = getChosenForm(await loadFormalInformalChoice());
    if (isConceptualPublicService) {
        const conceptLanguages = findDutchLanguageVersionsOfTriples(sourceBindings);
        const languageForChosenForm = selectLanguageVersionForConcept(conceptLanguages, chosenForm);
        form = adjustLanguageOfForm(form, languageForChosenForm);
    } else {
        const existingLanguage = findDutchLanguageVersionsOfTriples(sourceBindings)[0];
        form = adjustLanguageOfForm(form, existingLanguage ?? getLanguageVersionForInstance(chosenForm));
    }

    // Check whether a user chose "YourEurope" as their publication channel
    const publicationChannelQuery = `
    ${PREFIX.lpdcExt}
    ${PREFIX.cpsv}

    ASK {
      ${sparqlEscapeUri(serviceUri)} a ${type} ;
        <https://productencatalogus.data.vlaanderen.be/ns/ipdc-lpdc#publicationMedium> <https://productencatalogus.data.vlaanderen.be/id/concept/PublicatieKanaal/YourEurope> .
    }
  `;
    const isYourEurope = (await querySudo(publicationChannelQuery)).boolean;

    // If a user chooses "YourEurope" as their publication channel, load
    // the relevants snippets into the content form that render the English fields obligatory.
    if (FORM_MAPPING[formId] === "content" && isYourEurope) {
        const englishRequirementFormSnippets = fs.readFileSync(`./config/${FORM_MAPPING[formId]}/add-english-requirement.ttl`, 'utf8');
        form += englishRequirementFormSnippets;
    }

    const tailoredSchemes = FORM_MAPPING[formId] === "characteristics" ? await codeRepository.loadIPDCOrganisatiesTailoredInTurtleFormat() : [];
    const meta = tailoredSchemes.join("\r\n");
    const source = bindingsToNT(sourceBindings).join("\r\n");

    return {form, meta, source, serviceUri};
}

function adjustLanguageOfForm(form: string, newLanguage: string): string {
    return form.replaceAll(`form:language "<FORMAL_INFORMAL_LANGUAGE>"`, `form:language "${newLanguage}"`);
}
