import { sparqlEscapeString, sparqlEscapeUri, query } from 'mu';
import { querySudo } from '@lblod/mu-auth-sudo';
import fs from 'fs';
import fse from 'fs-extra';
import { bindingsToNT } from '../utils/bindingsToNT';

const mapper = {
  "cd0b5eba-33c1-45d9-aed9-75194c3728d3": "content",
  "149a7247-0294-44a5-a281-0a4d3782b4fd": "characteristics",
  "50592aa9-333f-4b51-af67-e53b4c183a9a": "translation"
};

export async function retrieveForm(publicServiceId, formId) {
  const form = fs.readFileSync(`/config/${mapper[formId]}/form.ttl`, 'utf8');
  const metaFile = fse.readJsonSync(`/config/${mapper[formId]}/form.json`);
  const schemes = metaFile.meta.schemes;

  // TODO:  this should be all triples inside ?source and converted to turtle
  // TODO: fetch more relations and be more specific in what to query for (i.e. the ?type)
  // TODO: this is sudo, it is not safe everyone can access
  const sourceQuery = `
    PREFIX mu: <http://mu.semte.ch/vocabularies/core/>
    PREFIX belgif: <http://vocab.belgif.be/ns/publicservice#>
    PREFIX m8g: <http://data.europa.eu/m8g/>
    PREFIX dct: <http://purl.org/dc/terms/>
    PREFIX cpsv: <http://purl.org/vocab/cpsv#>


    SELECT DISTINCT ?s ?p ?o
    WHERE {
      BIND( ${sparqlEscapeString(publicServiceId)} as ?uuid)
      {
        ?s mu:uuid ?uuid ;
        ?p ?o.
      }
      UNION {
        ?service mu:uuid ?uuid ;
          belgif:hasRequirement ?s.
        ?s ?p ?o.
      }
      UNION {
        ?service mu:uuid ?uuid ;
          dct:spatial ?s.
        ?s ?p ?o.
      }
      UNION {
        ?service mu:uuid ?uuid ;
          cpsv:follows ?s.
        ?s ?p ?o.
      }
      UNION {
        ?service mu:uuid ?uuid ;
          m8g:hasCost ?s.
        ?s ?p ?o.
      }
      UNION {
        ?service mu:uuid ?uuid ;
          m8g:hasContactPoint ?s.
        ?s ?p ?o.
      }
      UNION {
        ?service mu:uuid ?uuid ;
          rdfs:seeAlso ?s.
        ?s ?p ?o.
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
  return { form, meta, source };
}
