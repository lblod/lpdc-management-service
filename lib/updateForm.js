import { uuid, update, sparqlEscapeUri } from 'mu';
import { updateSudo } from '@lblod/mu-auth-sudo';
import { APPLICATION_GRAPH, PREFIXES } from '../config';
import { Graph, RDFNode, parse } from '../utils/rdflib';
import { bestuurseenheidForSession, isAllowdForLPDC } from '../utils/session-utils';
import { getScopedGraphsForStatement } from '../utils/common';

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
    if(mutationType == 'DELETE') {
      // This is one hell of a workaround for a bug in virtuoso.
      // the bug: https://github.com/openlink/virtuoso-opensource/issues/1055
      // Due to this bug, deleting can't be delegated to mu-auth in the following case:
      //  A session DELETING a triple with a langString, that has a type occuring
      //  in multiple mu-allowed-groups AND the session having matching mu-allowed-groups
      // (In short: when a langTyped triple needs to be removed from multiple graphs).
      // Hence, we'll have to do some extra work ourselves.
      // We first check if the session has LPDC-rights, because we end up in sudo-space
      // If allowed, we make very specific calls, we know work for virtuoso through mu-auth. (see implemenetation)
      // We do a best effort check, but it is NOT bullet proof.
      // No type checking is done (what mu-auth should do), so all triples of the organisation the session is linked to, can be removed.
      // That would be in case we have very smart (authenticated) users (their fault) OR
      //   if a triple also IS availible in another graph, the session is not allowed on (sorry if you'll ever have to debug this).
      // We expect these to be a mega-edge case, but warn here.
      // There is new version of mu-auth underway, which will easily shield us from virtuoso. Or maybe the bugfix from virtuoso is earlier.
      // Keep code in sync with deleteForm.js

      if(!(await isAllowdForLPDC(sessionUri))) {
          throw `Session ${sessionUri} is not an LPDC User`;
      }

      const { uuid } = await bestuurseenheidForSession(sessionUri);

      const source = parsedStatements.map(t => t.toNT());
      for(const statement of source ) {
        // The workaround: ensure mu-auth deletes one triple in one graph at a time. We know that works.
        const targetGraphPattern = `http://mu.semte.ch/graphs/organizations/${uuid}/`;
        const targetGraphs = await getScopedGraphsForStatement(statement, targetGraphPattern);

        for(const graph of targetGraphs) {
          await updateSudo(`
            DELETE DATA {
              GRAPH ${sparqlEscapeUri(graph)} {
                ${statement}
              }
            }`);
        }
      }
    }
    else {
      await update(`
        ${mutationType} DATA {
          GRAPH ${sparqlEscapeUri(APPLICATION_GRAPH)} {
            ${parsedStatements.join('\n')}
          }
        }`);
    }
  }
}
