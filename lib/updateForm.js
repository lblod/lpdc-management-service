import { uuid, update, sparqlEscapeUri } from 'mu';
import { APPLICATION_GRAPH } from '../config';
import { Graph, RDFNode, parse } from '../utils/rdflib';

export async function updateForm(data) {
  if(data.removals) await mutate('DELETE', data.removals);
  if(data.additions) await mutate('INSERT', data.additions);
}

async function mutate(mutation_type, statements) {
  const store = new Graph();
  const graph = `http://mutate-graph/${uuid()}`;
  parse(statements, store, {graph});
  const parsed_statements = store.match(undefined, undefined, undefined, RDFNode(graph));

  if (parsed_statements.length > 0) {
    await update(`
      ${mutation_type} DATA {
        GRAPH ${sparqlEscapeUri(APPLICATION_GRAPH)} {
          ${parsed_statements.join('\n')}
        }
      }`
    );
  }
}
