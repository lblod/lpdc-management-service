import { uuid, update } from 'mu';
import { Graph, RDFNode, parse } from '../utils/rdflib';

export async function updateForm(delta) {
  // TODO Add check to see if form is already submitted
  mutate('DELETE', delta.removals)
  mutate('INSERT', delta.additions)
}


async function mutate(mutation_type, statements) {
  const store = new Graph();
  const graph = `http://mutate-graph/${uuid()}`;
  parse(statements, store, {graph});
  const parsed_statements = store.match(undefined, undefined, undefined, RDFNode(graph));

  if (parsed_statements.length > 0) {
    await update(`
      ${mutation_type} DATA {
        GRAPH <http://mu.semte.ch/graphs/public> {
          ${parsed_statements.join('\n')}
        }
      }`
    );
  }
}