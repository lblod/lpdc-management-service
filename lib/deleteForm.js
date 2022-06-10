import { sparqlEscapeString, sparqlEscapeUri, update } from 'mu';
import { NESTED_PREDICATES } from '../config';

export async function deleteForm(serviceId) {

  const nestedOperations = NESTED_PREDICATES.map((predicate) => 
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