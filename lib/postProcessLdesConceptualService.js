import { querySudo, updateSudo } from '@lblod/mu-auth-sudo';
import { sparqlEscapeUri } from 'mu';
import { CONCEPTUAL_SERVICE_GRAPH, PREFIXES } from '../config';
import { v4 as uuid } from 'uuid';
import { flatten } from 'lodash';
import { bindingsToNT } from '../utils/bindingsToNT';
import { addUuid } from '../utils/common.js';
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

export async function processLdesDelta(delta) {
  let versionedServices = flatten(delta.map(changeSet => changeSet.inserts));
  versionedServices = versionedServices.filter(t => t?.subject?.value
                                              && t?.predicate.value == 'http://purl.org/dc/terms/isVersionOf');

  const toProcess = [];

  for(const entry of versionedServices) {
    if(await isConceptualPublicService(entry.graph.value, entry.subject.value, entry.object.value)) {
      toProcess.push(entry);
    }
  }

  for(const entry of toProcess) {
    try {
      await updateNewLdesVersion(entry.graph.value, entry.subject.value, entry.object.value);
    } catch (e) {
      console.error(`Error processing: ${JSON.stringify(entry)}`);
      console.error(e);
    }
  }
}

async function isConceptualPublicService(vGraph, vService, service) {
  const queryStr = `
    ${PREFIXES}
    ASK {
     VALUES ?type {
       lpdcExt:ConceptualPublicService
     }
     BIND(${sparqlEscapeUri(vService)} as ?vService)
     BIND(${sparqlEscapeUri(service)} as ?service)
     ?vService a ?type;
        dct:isVersionOf ?service.
    }
  `;
  return (await querySudo(queryStr)).boolean;
}

async function updateNewLdesVersion( versionedServiceGraph, versionedService, conceptualService ) {
  let serviceId = (await querySudo(`
    ${PREFIXES}

    SELECT DISTINCT ?uuid
    WHERE {
      ${sparqlEscapeUri(conceptualService)} a lpdcExt:ConceptualPublicService;
        mu:uuid ?uuid.
    }
    LIMIT 1
  `)).results.bindings[0]?.uuid?.value;

  //TODO: we should/could refactor so we can roll back in case of problems
  if(serviceId) {
    await removeConceptualService(serviceId);
  }
  else {
    serviceId = uuid();
  }
  await updateConceptualService( versionedServiceGraph, versionedService, conceptualService, serviceId );

}

async function removeConceptualService( serviceId ) {
  const type = 'lpdcExt:ConceptualPublicService';
  const graph = CONCEPTUAL_SERVICE_GRAPH;

  const serviceUri = await serviceUriForId(serviceId, type);

  if(!serviceUri) {
    throw `Service URI not found for id ${serviceId}`;
  }

  const results = [];

  results.push(await loadEvidences(serviceUri, { graph, includeUuid: true }));
  results.push(await loadRequirements(serviceUri, { graph, includeUuid: true }));
  results.push(await loadOnlineProcedureRules(serviceUri, { graph, includeUuid: true }));
  results.push(await loadRules(serviceUri, { graph, includeUuid: true }));
  results.push(await loadCosts(serviceUri, { graph, includeUuid: true }));
  results.push(await loadFinancialAdvantages(serviceUri, { graph, includeUuid: true }));
  results.push(await loadContactPointsAddresses(serviceUri, { graph, includeUuid: true }));
  results.push(await loadContactPoints(serviceUri, { graph, includeUuid: true }));
  results.push(await loadWebsites(serviceUri, { graph, includeUuid: true }));
  results.push(await loadPublicService(serviceUri, { graph, includeUuid: true }));
  results.push(await loadAttachments(serviceUri, { graph, includeUuid: true }));

  const sourceBindings = results
        .map(r => r.results.bindings)
        .reduce((acc, b) => [...acc, ...b]);

  const source = bindingsToNT(sourceBindings);

  // Due to confirmed bug in virtuoso, we need to execute statements
  // separatly: https://github.com/openlink/virtuoso-opensource/issues/1055
  for(const statement of source ) {
      await updateSudo(`
        DELETE DATA {
          GRAPH ${sparqlEscapeUri(graph)} {
            ${statement}
          }
        }`);
  }
}

async function updateConceptualService( versionedServiceGraph, versionedServiceUri, serviceUri, serviceId ) {
  const graph = versionedServiceGraph;
  const sudo = true;

  const results = [];

  results.push(await loadEvidences(versionedServiceUri, { graph, sudo }));
  results.push(await loadRequirements(versionedServiceUri, { graph, sudo }));
  results.push(await loadOnlineProcedureRules(versionedServiceUri, { graph, sudo }));
  results.push(await loadRules(versionedServiceUri, { graph, sudo }));
  results.push(await loadCosts(versionedServiceUri, { graph, sudo }));
  results.push(await loadFinancialAdvantages(versionedServiceUri, { graph, sudo }));
  results.push(await loadContactPointsAddresses(versionedServiceUri, { graph, sudo }));
  results.push(await loadContactPoints(versionedServiceUri, { graph, sudo }));
  results.push(await loadWebsites(versionedServiceUri, { graph, sudo }));
  results.push(await loadAttachments(versionedServiceUri, { graph, sudo }));

  results.forEach(r => addUuid(r.results.bindings));

  const serviceResult = await loadPublicService(versionedServiceUri, { graph, sudo });
  addUuid(serviceResult.results.bindings, serviceId);
  for(const tripleData of serviceResult.results.bindings) {
      tripleData.s.value = serviceUri;
  }

  results.push(serviceResult);

  const sourceBindings = results
        .map(r => r.results.bindings)
        .reduce((acc, b) => [...acc, ...b]);

  const source = bindingsToNT(sourceBindings);

  //TODO: could be faster, but slow and steady?
  for(const statement of source ) {
      await updateSudo(`
        INSERT DATA {
          GRAPH ${sparqlEscapeUri(CONCEPTUAL_SERVICE_GRAPH)} {
            ${statement}
          }
        }`);
  }
}
