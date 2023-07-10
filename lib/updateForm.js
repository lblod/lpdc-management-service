import { uuid, update, sparqlEscapeUri } from 'mu';
import { APPLICATION_GRAPH } from '../config';
import { Graph, RDFNode, parse } from '../utils/rdflib';

export async function updateForm(data, sessionUri) {
  if(data.removals) await mutate('DELETE', data.removals, sessionUri);
  if(data.additions) await mutate('INSERT', data.additions);
}

async function mutate(mutationType, statements, sessionUri = null) {
  const store = new Graph();
  const graph = `http://mutate-graph/${uuid()}`;
  parse(statements, store, {graph});
  const parsedStatements = store.match(undefined, undefined, undefined, RDFNode(graph));

  if (parsedStatements.length > 0) {
    await update(`
      ${mutationType} DATA {
        GRAPH ${sparqlEscapeUri(APPLICATION_GRAPH)} {
          ${parsedStatements.join('\n')}
        }
      }`
    );
  }
}
