import { sparqlEscapeString, sparqlEscapeUri, sparqlEscapeDateTime, update } from 'mu';
import { APPLICATION_GRAPH, PREFIXES } from '../config';
import { bindingsToNT } from '../utils/bindingsToNT';
import { loadEvidences,
         loadRequirements,
         loadOnlineProcedureRules,
         loadRules,
         loadCosts,
         loadFinancialAdvantages,
         loadContactPointsAddresses,
         loadContactPoints,
         loadWebsites,
         loadPublicService,
         loadAttachments,
         serviceUriForId
       } from './commonQueries';
import { bestuurseenheidForSession, isAllowdForLPDC } from '../utils/session-utils';
import { getScopedGraphsForStatement } from '../utils/common';
import { updateSudo } from '@lblod/mu-auth-sudo';

export async function deleteForm(serviceId, sessionUri) {
  const serviceUri = await serviceUriForId(serviceId);

  if(!serviceUri) {
    throw `Service URI not found for id ${serviceId}`;
  }

  const results = [];

  results.push(await loadEvidences(serviceUri, { type: 'cpsv:PublicService', includeUuid: true }));
  results.push(await loadRequirements(serviceUri, { type: 'cpsv:PublicService', includeUuid: true }));
  results.push(await loadOnlineProcedureRules(serviceUri, { type: 'cpsv:PublicService', includeUuid: true }));
  results.push(await loadRules(serviceUri, { type: 'cpsv:PublicService', includeUuid: true }));
  results.push(await loadCosts(serviceUri, { type: 'cpsv:PublicService', includeUuid: true }));
  results.push(await loadFinancialAdvantages(serviceUri, { type: 'cpsv:PublicService', includeUuid: true }));
  results.push(await loadContactPointsAddresses(serviceUri, { type: 'cpsv:PublicService', includeUuid: true }));
  results.push(await loadContactPoints(serviceUri, { type: 'cpsv:PublicService', includeUuid: true }));
  results.push(await loadWebsites(serviceUri, { type: 'cpsv:PublicService', includeUuid: true }));
  results.push(await loadPublicService(serviceUri, { type: 'cpsv:PublicService', includeUuid: true }));
  results.push(await loadAttachments(serviceUri, { type: 'cpsv:PublicService', includeUuid: true }));

  const sourceBindings = results
        .reduce((acc, b) => [...acc, ...b]);

  // Start workaround bug virtuoso and lang strings.
  // See updateForm.js for longer explanation.
  // Keep code in sync with updateForm.js
  const source = bindingsToNT(sourceBindings);

  if(!(await isAllowdForLPDC(sessionUri))) {
      throw `Session ${sessionUri} is not an LPDC User`;
  }

  const { uuid } = await bestuurseenheidForSession(sessionUri);
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
  // End workaround bug virtuoso and lang strings.

  // Since we want to keep track of the ones deleted and keep the LDES-feed
  // consistent, we mark these as:Tombstone
  const now = new Date();
  const insertTombstoneQuery = `
    ${PREFIXES}
    INSERT DATA {
      GRAPH ${sparqlEscapeUri(APPLICATION_GRAPH)} {
       ${sparqlEscapeUri(serviceUri)} a  as:Tombstone;
          as:formerType cpsv:PublicService;
          as:deleted ${sparqlEscapeDateTime(now)}.
      }
    }
  `;
  await update(insertTombstoneQuery);

}
