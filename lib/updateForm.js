import { uuid, sparqlEscapeUri, sparqlEscapeString, update } from 'mu';
import { updateSudo, querySudo } from '@lblod/mu-auth-sudo';
import { Graph, RDFNode, parse } from '../utils/rdflib';
import parseResults from '../utils/parse-results';

export async function updateForm(serviceUuid, data) {
  // TODO Add check to see if form is already submitted
  mutate(serviceUuid, 'DELETE', data.removals || []);
  mutate(serviceUuid, 'INSERT', data.additions || []);
}
//TODO this is broken
async function mutate(serviceUuid, mutation_type, statements) {
  const store = new Graph();
  const graph = `http://mutate-graph/${uuid()}`;
  parse(statements, store, {graph});
  const parsed_statements = store.match(undefined, undefined, undefined, RDFNode(graph));

  if (parsed_statements.length > 0) {
    await update(`
      PREFIX mu:	<http://mu.semte.ch/vocabularies/core/>
      PREFIX cpsv:	<http://purl.org/vocab/cpsv#>
      ${mutation_type} {
        GRAPH <http://default> {
          ?service a cpsv:PublicService.

          ${parsed_statements.join('\n')}
        }
      }
       WHERE {
          GRAPH <http://default> {
            ?service a cpsv:PublicService;
              mu:uuid ${sparqlEscapeString(serviceUuid)}.
          }
       }`
    );
  }
}
