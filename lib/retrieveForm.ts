import {querySudo} from '@lblod/mu-auth-sudo';
import {sparqlEscapeUri} from '../mu-helper';
import {PREFIX} from '../config';
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
import {FormDefinitionRepository} from "../src/core/port/driven/persistence/form-definition-repository";
import {FormType} from "../src/core/domain/types";

export async function retrieveForm(publicServiceId: string, formType: FormType, codeRepository: CodeRepository, formDefinitionRepository: FormDefinitionRepository): Promise<{
    form: string,
    meta: string,
    source: string,
    serviceUri: string
}> {

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

    const chosenForm: string | undefined = getChosenForm(await loadFormalInformalChoice());
    let languageForChosenForm: string;
    if (isConceptualPublicService) {
        const conceptLanguages = findDutchLanguageVersionsOfTriples(sourceBindings);
        languageForChosenForm = selectLanguageVersionForConcept(conceptLanguages, chosenForm);
    } else {
        const existingLanguage = findDutchLanguageVersionsOfTriples(sourceBindings)[0];
        languageForChosenForm = existingLanguage ?? getLanguageVersionForInstance(chosenForm);
    }

    const form = formDefinitionRepository.loadFormDefinition(formType, languageForChosenForm, isYourEurope);

    const tailoredSchemes = formType === FormType.CHARACTERISTICS ? await codeRepository.loadIPDCOrganisatiesTailoredInTurtleFormat() : [];
    const meta = tailoredSchemes.join("\r\n");
    const source = bindingsToNT(sourceBindings).join("\r\n");

    return {form, meta, source, serviceUri};
}

