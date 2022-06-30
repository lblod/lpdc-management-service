import { sparqlEscapeString, sparqlEscapeUri, query } from 'mu';
import { querySudo } from '@lblod/mu-auth-sudo';
import fs from 'fs';
import fse from 'fs-extra';
import { bindingsToNT } from '../utils/bindingsToNT';
import { FORM_MAPPING, NESTED_PREDICATES } from '../config';

export async function retrieveForm(publicServiceId, formId) {
  const form = fs.readFileSync(`/config/${FORM_MAPPING[formId]}/form.ttl`, 'utf8');
  const metaFile = fse.readJsonSync(`/config/${FORM_MAPPING[formId]}/form.json`);
  const schemes = metaFile.meta.schemes;

  const nestedOperations = NESTED_PREDICATES.map((predicate) =>
    `
    UNION {
      ?service mu:uuid ?uuid ;
        ${sparqlEscapeUri(predicate)} ?s.
      ?s ?p ?o.
    }
    `
  );

  const sourceQuery = `
    PREFIX mu: <http://mu.semte.ch/vocabularies/core/>

    SELECT DISTINCT ?s ?p ?o
    WHERE {
      BIND( ${sparqlEscapeString(publicServiceId)} as ?uuid)
      {
        ?s mu:uuid ?uuid ;
        ?p ?o.
      }
      ${nestedOperations.join('\n')}
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

  return { form, meta, source };
}
