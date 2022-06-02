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

export async function getForm(publicServiceId, formId) {
  const bundle = {
    form: "",
    source: "",
    meta: ""
  }
  const formFile = fs.readFileSync(`/config/${mapper[formId]}/form.ttl`, 'utf8');
  bundle.form = formFile;
  const metaFile = fse.readJsonSync(`/config/${mapper[formId]}/form.json`);
  const schemes = metaFile.meta.schemes

  // TODO  this should be all triples inside ?source and converted to turtle
  const sourceQuery = `
    PREFIX dct: <http://purl.org/dc/terms/>
    PREFIX mu: <http://mu.semte.ch/vocabularies/core/> 

    SELECT ?source
    WHERE {
        GRAPH ?graph {
            ?formUri mu:uuid ${sparqlEscapeString(formId)} ;
                    dct:source ?source.   
      }
    }
  `

  const schemesQuery = `
    PREFIX skos: <http://www.w3.org/2004/02/skos/core#>
    
    SELECT DISTINCT ?s ?p ?o WHERE {
      
      VALUES ?scheme {
        ${schemes.map(scheme => sparqlEscapeUri(scheme)).join('\n')}
      }
      ?s skos:inScheme ?scheme .
      ?s ?p ?o .
    }
  `
  const storeSchemes = await query(schemesQuery);
  const storeSource = await query(sourceQuery);

  const meta = bindingsToNT(storeSchemes.results.bindings).join("\r\n");
  const source = bindingsToNT(storeSource.results.bindings).join("\r\n");
  bundle.meta = meta;
  bundle.source = source;

  return bundle;     
}