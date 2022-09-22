import { querySudo } from '@lblod/mu-auth-sudo';
import fs from 'fs';
import fse from 'fs-extra';
import { query, sparqlEscapeString, sparqlEscapeUri } from 'mu';
import { FORM_MAPPING, PREFIXES } from '../config';
import { bindingsToNT } from '../utils/bindingsToNT';
import { loadEvidences,
         loadRequirements,
         loadOnlineProcedureRules,
         loadRules,
         loadCosts,
         loadFinancialAdvantages,
         loadContactPointsAddresses,
         loadContactPoints,
         loadWebsites,
         loadPublicService,
         loadAttachments,
         serviceUriForId
       } from './commonQueries';

export async function retrieveForm(publicServiceId, formId, bestuurseenheid) {
  const form = fs.readFileSync(`/config/${FORM_MAPPING[formId]}/form.ttl`, 'utf8');
  const metaFile = fse.readJsonSync(`/config/${FORM_MAPPING[formId]}/form.json`);
  const schemes = metaFile.meta.schemes;
  const serviceUri = await serviceUriForId(publicServiceId);

  if(!serviceUri) {
    throw `Service URI not found for id ${publicServiceId}`;
  }

  const results = [];
  results.push(await loadEvidences(serviceUri, { type: 'cpsv:PublicService' }));
  results.push(await loadRequirements(serviceUri, { type: 'cpsv:PublicService' }));
  results.push(await loadOnlineProcedureRules(serviceUri, { type: 'cpsv:PublicService' }));
  results.push(await loadRules(serviceUri, { type: 'cpsv:PublicService' }));
  results.push(await loadCosts(serviceUri, { type: 'cpsv:PublicService' }));
  results.push(await loadFinancialAdvantages(serviceUri, { type: 'cpsv:PublicService' }));
  results.push(await loadContactPointsAddresses(serviceUri, { type: 'cpsv:PublicService' }));
  results.push(await loadContactPoints(serviceUri, { type: 'cpsv:PublicService' }));
  results.push(await loadWebsites(serviceUri, { type: 'cpsv:PublicService' }));
  results.push(await loadPublicService(serviceUri, { type: 'cpsv:PublicService' }));
  results.push(await loadAttachments(serviceUri, { type: 'cpsv:PublicService' }));

  const sourceBindings = results
        .map(r => r.results.bindings)
        .reduce((acc, b) => [...acc, ...b]);


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

  const tailoredSchemes = await generateRuntimeConceptSchemes(bestuurseenheid);
  const storeSchemes = await querySudo(schemesQuery);
  const meta = [ ...bindingsToNT(storeSchemes.results.bindings), ...tailoredSchemes ].join("\r\n");
  const source = bindingsToNT(sourceBindings).join("\r\n");

  return { form, meta, source, serviceUri };
}

/*
 * Some codelists need to be generated at runtime, since the content
 * varies in function of the bestuurseenheid who logged in.
 * Now it is uitvoerende and bevoegde overheid
 */
async function generateRuntimeConceptSchemes(bestuurseenheid) {
  //spliting in two because faster
  const tailoredConceptQ = `
    ${PREFIXES}
    CONSTRUCT {
       ?bestuurseenheid a skos:Concept;
         skos:inScheme <https://productencatalogus.data.vlaanderen.be/id/conceptscheme/IPDCOrganisaties/tailored>;
         skos:prefLabel ?newLabel.
    }
    WHERE {
        BIND(${sparqlEscapeUri(bestuurseenheid)} as ?bestuurseenheid)
        ?bestuurseenheid a besluit:Bestuurseenheid;
        skos:prefLabel ?bestuurseenheidLabel.

      ?bestuurseenheid besluit:classificatie ?bestuurseenheidClassificatie.
        ?bestuurseenheidClassificatie skos:prefLabel ?bestuurseenheidClassificatieLabel .

      BIND(CONCAT(?bestuurseenheidLabel, " (", ?bestuurseenheidClassificatieLabel, ")") as ?newLabel)
    }

  `;

  let tailoredConcept = await querySudo(tailoredConceptQ);
  tailoredConcept = bindingsToNT(tailoredConcept.results.bindings);

  const baseSchemeQ = `
    ${PREFIXES}
    CONSTRUCT {
       ?s ?p ?o;
         skos:inScheme <https://productencatalogus.data.vlaanderen.be/id/conceptscheme/IPDCOrganisaties/tailored>.
    }
    WHERE {
     ?s a skos:Concept;
       skos:inScheme dvcs:IPDCOrganisaties;
       rdfs:seeAlso <https://wegwijs.vlaanderen.be>;
       ?p ?o.
    }
  `;

  let baseScheme = await querySudo(baseSchemeQ);
  baseScheme = bindingsToNT(baseScheme.results.bindings);

  return [ ...baseScheme, ...tailoredConcept ];
}
