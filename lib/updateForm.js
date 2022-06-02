import { uuid, sparqlEscapeString, sparqlEscapeDateTime, sparqlEscapeUri, sparqlEscape } from 'mu';
import { querySudo as query, updateSudo as update } from '@lblod/mu-auth-sudo';
import { Graph, RDFNode } from '../utils/rdflib';
import { parse } from 'rdflib';

export async function updateForm(formId, delta) {

  const sourceQuery = `
    PREFIX mu: <http://mu.semte.ch/vocabularies/core/>
    PREFIX rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#>
    PREFIX adms: <http://www.w3.org/ns/adms#>
    PREFIX terms: <http://purl.org/dc/terms/>
    PREFIX dct: <http://purl.org/dc/terms/>

    SELECT ?graph ?uri ?source
    WHERE {
        GRAPH ?graph {
            ?uri mu:uuid ${sparqlEscapeString(formId)} ;
              dct:source ?source .
        }
    }`;

  const metaFile = fse.readJsonSync(`/config/${mapper[formId]}/form.json`);

  const response = await query(sourceQuery);
  const oldForm = response.results.bindings?.[0] || "";

  const store = new Graph();
  const graph = `http://mutate-graph/${uuid()}`;

  parse(delta.additions, store, {graph});

  
  
  // const formData = {
  //   graph: response.results.binding[0].graph.value,
  //   uri: response.results.binding[0].uri.value,
  //   uuid,
  //   status: response.results.binding[0].status.value,
  // }

  // console.log(formData)

  // console.log(oldForm)
  // mutate("INSERT", "http://mu.semte.ch/application", delta.additions)
}

function toNT(uri, source) {

  const triples = `
    @prefix mu: <http://mu.semte.ch/vocabularies/core/> .
    @prefix xsd: <http://www.w3.org/2001/XMLSchema#> .
    @prefix adms: <http://www.w3.org/ns/adms#>  .
    @prefix dct: <http://purl.org/dc/terms/> .

    ${sparqlEscapeUri(uri)} mu:uuid ${sparqlEscapeString(uuid)} ;
                            dct:source ${source}.
  `

  return triples;
}

function chunkStatements(statements, chunk = QUERY_CHUNK_SIZE) {
  let chunks = [];
  for (let i = 0; i < statements.length; i += chunk) {
    chunks.push(statements.slice(i, i + chunk));
  }
  return chunks;
}