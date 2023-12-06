import {querySudo} from '@lblod/mu-auth-sudo';
import fs from 'fs';
import fse from 'fs-extra';
import {sparqlEscapeUri} from '../mu-helper';
import {FORM_MAPPING, PREFIXES} from '../config';
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
    getChosenForm, getLanguageVersionForInstance,
    selectLanguageVersionForConcept
} from "./formalInformalChoice";

export async function retrieveForm(publicServiceId: string, formId: string): Promise<{
    form: string,
    meta: string,
    source: string,
    serviceUri: string
}> {
    let form = fs.readFileSync(`./config/${FORM_MAPPING[formId]}/form.ttl`, 'utf8');
    const metaFile = fse.readJsonSync(`./config/${FORM_MAPPING[formId]}/form.json`);
    const schemes = metaFile.meta.schemes;

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
    ${PREFIXES}

    ASK {
      ${sparqlEscapeUri(serviceUri)} a ${type} ;
        <https://productencatalogus.data.vlaanderen.be/ns/ipdc-lpdc#publicationMedium> <https://productencatalogus.data.vlaanderen.be/id/concept/PublicatieKanaal/YourEurope> .
    }
  `;
    let isYourEurope = (await querySudo(publicationChannelQuery)).boolean;

  // If a user chooses "YourEurope" as their publication channel, load
  // the relevants snippets into the content form that render the English fields obligatory.
  if (FORM_MAPPING[formId] === "content" && isYourEurope) {
    const englishRequirementFormSnippets = fs.readFileSync(`./config/${FORM_MAPPING[formId]}/add-english-requirement.ttl`, 'utf8');
    form += englishRequirementFormSnippets;
  }

    const schemesQuery = `
    PREFIX skos: <http://www.w3.org/2004/02/skos/core#>

    SELECT DISTINCT ?s ?p ?o WHERE {

      VALUES ?scheme {
        ${schemes.map(scheme => sparqlEscapeUri(scheme)).join('\n')}
      }
      ?s skos:inScheme ?scheme .
      ?s ?p ?o .
    }
  `;

    const tailoredSchemes = await generateRuntimeConceptSchemes();
    const storeSchemes = await querySudo(schemesQuery);
    const meta = [...bindingsToNT(storeSchemes.results.bindings), ...tailoredSchemes].join("\r\n");
    const source = bindingsToNT(sourceBindings).join("\r\n");

    return {form, meta, source, serviceUri};
}

/*
 * Generate codelists for all bestuurseenheden at runtime for the
 * "Uitvoerende Overheid" and "Bevoegde Overheid" fields in the
 * "Eigenschappen" tab of an LPDC public service form.
 * For example, if "Gemeente Aalter" is the current user,
 * they will be able to add the various"Gemeenten", "OCMW" and
 * other organizations within app-digitaal-loket.
 */
async function generateRuntimeConceptSchemes(): Promise<any[]> {
    //spliting in two because faster
    const tailoredConceptQ = `
    ${PREFIXES}

    CONSTRUCT {
      ?bestuurseenheid a skos:Concept ;
        skos:inScheme <https://productencatalogus.data.vlaanderen.be/id/conceptscheme/IPDCOrganisaties/tailored> ;
        skos:prefLabel ?newLabel .
    }
    WHERE {
      ?bestuurseenheid a besluit:Bestuurseenheid ;
        skos:prefLabel ?bestuurseenheidLabel .

      ?bestuurseenheid besluit:classificatie ?bestuurseenheidClassificatie .
      ?bestuurseenheidClassificatie skos:prefLabel ?bestuurseenheidClassificatieLabel .

      BIND(CONCAT(?bestuurseenheidLabel, " (", ?bestuurseenheidClassificatieLabel, ")") as ?newLabel)
    }
  `;

    let tailoredConcept = await querySudo(tailoredConceptQ);
    tailoredConcept = bindingsToNT(tailoredConcept.results.bindings);

    const baseSchemeQ = `
    ${PREFIXES}

    CONSTRUCT {
      ?s ?p ?o ;
        skos:inScheme <https://productencatalogus.data.vlaanderen.be/id/conceptscheme/IPDCOrganisaties/tailored> .
    }
    WHERE {
      ?s a skos:Concept ;
        skos:inScheme dvcs:IPDCOrganisaties ;
        rdfs:seeAlso <https://wegwijs.vlaanderen.be> ;
        ?p ?o .
    }
  `;

    let baseScheme = await querySudo(baseSchemeQ);
    baseScheme = bindingsToNT(baseScheme.results.bindings);

    return [...baseScheme, ...tailoredConcept];
}

function adjustLanguageOfForm(form, newLanguage): string {
    return form.replaceAll(`form:language "<FORMAL_INFORMAL_LANGUAGE>"`, `form:language "${newLanguage}"`);
}
