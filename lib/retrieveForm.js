import { querySudo } from '@lblod/mu-auth-sudo';
import fs from 'fs';
import fse from 'fs-extra';
import { query, sparqlEscapeString, sparqlEscapeUri } from 'mu';
import { FORM_MAPPING, PREFIXES } from '../config';
import { bindingsToNT } from '../utils/bindingsToNT';

export async function retrieveForm(publicServiceId, formId) {
  const form = fs.readFileSync(`/config/${FORM_MAPPING[formId]}/form.ttl`, 'utf8');
  const metaFile = fse.readJsonSync(`/config/${FORM_MAPPING[formId]}/form.json`);
  const schemes = metaFile.meta.schemes;

  const sourceQuery = `
    ${PREFIXES}

    SELECT DISTINCT ?s ?p ?o
    WHERE {
      BIND( ${sparqlEscapeString(publicServiceId)} as ?uuid)
      {
        ?s a cpsv:PublicService;
          mu:uuid ?uuid ;
          ?p ?o.
      }
      UNION {
        ?service a cpsv:PublicService;
          mu:uuid ?uuid;
          belgif:hasRequirement ?requirement.

        ?requirement a m8g:Requirement;
          m8g:hasSupportingEvidence ?s.

        ?s a m8g:Evidence;
          ?p ?o.
      }
      UNION {
        ?service a cpsv:PublicService;
          mu:uuid ?uuid;
          belgif:hasRequirement ?s.

        ?s a m8g:Requirement;
          ?p ?o.
      }
      UNION {
        ?service a cpsv:PublicService;
          mu:uuid ?uuid;
          cpsv:follows ?rule.

        ?rule a cpsv:Rule;
          lpdcExt:hasOnlineProcedure ?s.

        ?s a schema:Website;
          ?p ?o.
      }
      UNION {
        ?service a cpsv:PublicService;
          mu:uuid ?uuid;
          cpsv:follows ?s.

        ?s a cpsv:Rule;
          ?p ?o.
      }
      UNION {
        ?service a cpsv:PublicService;
          mu:uuid ?uuid;
          m8g:hasCost ?s.

         ?s a m8g:Cost;
          ?p ?o.
      }
      UNION {
        ?service a cpsv:PublicService;
          mu:uuid ?uuid;
          cpsv:produces ?s.

         ?s a lpdcExt:FinancialAdvantage;
          ?p ?o.
      }
      UNION {
        ?service a cpsv:PublicService;
          mu:uuid ?uuid;
          m8g:hasContactPoint ?s.

         ?s a schema:ContactPoint;
          ?p ?o.
      }
      UNION {
        ?service a cpsv:PublicService;
          mu:uuid ?uuid;
          lpdcExt:attachment ?s.

         ?s a foaf:Document;
          ?p ?o.
      }
      UNION {
        ?service a cpsv:PublicService;
          mu:uuid ?uuid;
          rdfs:seeAlso ?s.

        ?s a schema:Website;
          ?p ?o.
      }
    }
  `;

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


  const storeSchemes = await querySudo(schemesQuery);
  const storeSource = await query(sourceQuery);
  const meta = bindingsToNT(storeSchemes.results.bindings).join("\r\n");
  const source = bindingsToNT(storeSource.results.bindings).join("\r\n");

  // Get service uri for later use.
  const serviceUri = (await query(`
    ${PREFIXES}

    SELECT DISTINCT ?service
    WHERE {
      BIND( ${sparqlEscapeString(publicServiceId)} as ?uuid)
      ?service a cpsv:PublicService;
        mu:uuid ?uuid.
    }
    LIMIT 1
  `)).results.bindings[0]?.service?.value;

  return { form, meta, source, serviceUri };
}
