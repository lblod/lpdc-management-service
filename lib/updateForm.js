import { uuid, update } from 'mu';
import { Graph, RDFNode, parse } from '../utils/rdflib';

export async function updateForm(data) {
  // TODO Add check to see if form is already submitted
  if(data.removals) mutate('DELETE', data.removals);
  if(data.additions) mutate('INSERT', data.additions);
}

async function mutate(mutation_type, statements) {
  const store = new Graph();
  const graph = `http://mutate-graph/${uuid()}`;
  parse(statements, store, {graph});
  const parsed_statements = store.match(undefined, undefined, undefined, RDFNode(graph));

  if (parsed_statements.length > 0) {
    await update(`
      ${mutation_type} DATA {
        GRAPH <http://default> {
          ${parsed_statements.join('\n')}
        }
      }`
    );
  }
}
