import { uuid, sparqlEscapeString, sparqlEscapeDateTime, sparqlEscapeUri, sparqlEscape, update } from 'mu';

const nestedList = [
  "http://vocab.belgif.be/ns/publicservice#hasRequirement",
  "http://data.europa.eu/m8g/hasCost",
  "http://purl.org/vocab/cpsv#follows",
  "http://data.europa.eu/m8g/hasContactPoint",
  "http://www.w3.org/2000/01/rdf-schema#seeAlso"
];

export async function deleteForm(serviceId) {

  const nestedOperations = nestedList.map((predicate) => 
    `
      DELETE WHERE {
        GRAPH <http://default> {
          ?s mu:uuid ${sparqlEscapeString(serviceId)};
            ${sparqlEscapeUri(predicate)} ?nestedSubj.

            ?nestedSubj ?nestedPred ?nestedObj.
        }
      };
    `
  )

  const deleteQuery = `
    PREFIX mu: <http://mu.semte.ch/vocabularies/core/>

    ${nestedOperations.join('\n')}

    DELETE WHERE {
  		GRAPH <http://default> {
          ?s mu:uuid ${sparqlEscapeString(serviceId)};
            ?p ?o.
        } 
      }
    ` 
  await update(deleteQuery);
}