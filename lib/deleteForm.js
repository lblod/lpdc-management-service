import { sparqlEscapeString, sparqlEscapeUri, update } from 'mu';
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

export async function deleteForm(serviceId) {
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

  const source = bindingsToNT(sourceBindings);

  //To not confuse mu-auth, we have to remove data in specific order (mu-auth needs to know the type to delete)
  const typeTriples = source.filter(t => t.includes('http://www.w3.org/1999/02/22-rdf-syntax-ns#type'));
  const otherTriples = source.filter(t => !t.includes('http://www.w3.org/1999/02/22-rdf-syntax-ns#type'));

  // Due to confirmed bug in virtuoso, we need to execute statements
  // separatly: https://github.com/openlink/virtuoso-opensource/issues/1055
  for(const statement of [ ...otherTriples, ...typeTriples ] ) {
      await update(`
        DELETE DATA {
          GRAPH ${sparqlEscapeUri(APPLICATION_GRAPH)} {
            ${statement}
          }
        }`);
  }
}
