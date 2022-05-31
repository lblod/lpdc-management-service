import { uuid, sparqlEscapeString, sparqlEscapeDateTime, sparqlEscapeUri, sparqlEscape } from 'mu';
import { querySudo as query } from '@lblod/mu-auth-sudo';
import fs from 'fs' 
import fse from 'fs-extra';
import { bindingsToNT } from '../utils/bindingsToNT';

const mapper = {
  "cd0b5eba-33c1-45d9-aed9-75194c3728d3": "content",
  "149a7247-0294-44a5-a281-0a4d3782b4fd": "characteristics",
  "50592aa9-333f-4b51-af67-e53b4c183a9a": "translation"
}

const formId = "149a7247-0294-44a5-a281-0a4d3782b4fd"

export async function getForm(publicServiceId) {
  const bundle = {
    form: "",
    source: "",
    meta: ""
  }
  const form = fs.readFileSync(`/config/${mapper[formId]}/form.ttl`, 'utf8');
  bundle.form = form;
  const meta = fse.readJsonSync(`/config/${mapper[formId]}/form.json`);
  const schemes = meta.meta.schemes

  

  const schemesQuery = `
    PREFIX rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#>
    PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#>
    PREFIX skos: <http://www.w3.org/2004/02/skos/core#>
    PREFIX qb: <http://purl.org/linked-data/cube#>
    
    SELECT DISTINCT ?s ?p ?o WHERE {
      
      VALUES ?scheme {
        ${schemes.map(scheme => sparqlEscapeUri(scheme)).join('\n')}
      }
      ?s skos:inScheme ?scheme .
      ?s ?p ?o .
    }
  `
  const result = await query(schemesQuery);
  const row = bindingsToNT(result.results.bindings).join("\r\n");
  bundle.meta = row;

  return bundle;     
}