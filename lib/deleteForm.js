import { sparqlEscapeString, sparqlEscapeUri, update } from 'mu';
import { APPLICATION_GRAPH, NESTED_PREDICATES } from '../config';

export async function deleteForm(serviceId) {

  const nestedOperations = NESTED_PREDICATES.map((predicate) =>
    `
    DELETE WHERE {
      GRAPH ${sparqlEscapeUri(APPLICATION_GRAPH)} {
        ?s mu:uuid ${sparqlEscapeString(serviceId)};
          ${sparqlEscapeUri(predicate)} ?nestedSubj.

          ?nestedSubj ?nestedPred ?nestedObj.
      }
    };
    `
  );

  const deleteQuery = `
    PREFIX mu: <http://mu.semte.ch/vocabularies/core/>

    ${nestedOperations.join('\n')}

    DELETE WHERE {
      GRAPH ${sparqlEscapeUri(APPLICATION_GRAPH)} {
          ?s mu:uuid ${sparqlEscapeString(serviceId)};
            ?p ?o.
        }
      }
    `;

  await update(deleteQuery);
}
