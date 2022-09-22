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
  const parsedStatements = store.match(undefined, undefined, undefined, RDFNode(graph));

  if (parsedStatements.length > 0) {
    if(mutation_type == 'DELETE') {
      // Due to confirmed bug in virtuoso, we need to execute statements
      // separatly: https://github.com/openlink/virtuoso-opensource/issues/1055

      //To not confuse mu-auth, we have to remove data in specific order (mu-auth needs to know the type to delete)
      const source = parsedStatements.map(t => t.toNT());
      const typeTriples = source.filter(t => t.includes('http://www.w3.org/1999/02/22-rdf-syntax-ns#type'));
      const otherTriples = source.filter(t => !t.includes('http://www.w3.org/1999/02/22-rdf-syntax-ns#type'));

      for(const statement of [ ...otherTriples, ...typeTriples ] ) {
        await update(`
          DELETE DATA {
            GRAPH ${sparqlEscapeUri(APPLICATION_GRAPH)} {
              ${statement}
            }
          }`);
      }
    }
    else {
      await update(`
        ${mutation_type} DATA {
          GRAPH ${sparqlEscapeUri(APPLICATION_GRAPH)} {
            ${parsedStatements.join('\n')}
          }
        }`);
    }
  }
}
