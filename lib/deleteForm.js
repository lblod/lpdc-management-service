import { sparqlEscapeUri, sparqlEscapeDateTime, update, query } from 'mu';
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

export async function deleteForm(serviceId, sessionUri) {
  const serviceUri = await serviceUriForId(serviceId);

  if(!serviceUri) {
    throw `Service URI not found for id ${serviceId}`;
  }

  const conceptUri = await conceptUriForService(serviceUri);
  const hadConcept = Boolean(conceptUri);

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

  await update(`
    DELETE DATA {
      GRAPH ${sparqlEscapeUri(APPLICATION_GRAPH)} {
        ${source.join('\n')}
      }
    }`
  );

  // Since we want to keep track of the deleted services and keep the LDES-feed
  // consistent, we mark these as "Tombstones".
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

  if (hadConcept && !(await conceptHasInstances(conceptUri))) {
    await removeInstantiatedFlag(conceptUri);
  }
}

async function conceptUriForService(serviceUri) {
  return (await query(`
      ${PREFIXES}

      SELECT DISTINCT ?concept
      WHERE {
        BIND(${sparqlEscapeUri(serviceUri)} as ?service)
        ?service a cpsv:PublicService ;
          dct:source ?concept.
      }
      LIMIT 1
    `)).results.bindings[0]?.concept?.value;
}

async function conceptHasInstances(conceptUri) {
  const conceptHasInstancesQuery = `
    ${PREFIXES}
    ASK WHERE {
      GRAPH ${sparqlEscapeUri(APPLICATION_GRAPH)} {
        ?instance a cpsv:PublicService ;
          dct:source ${sparqlEscapeUri(conceptUri)} .
      }
    }
  `;

  return (await query(conceptHasInstancesQuery)).boolean;
}

async function removeInstantiatedFlag(conceptUri) {
  const removeInstantiatedFlagQuery = `
    ${PREFIXES}

    DELETE {
      GRAPH ${sparqlEscapeUri(APPLICATION_GRAPH)} {
        ?config lpdcExt:conceptInstantiated ?oldIsInstantiated .
      }
    }
    INSERT {
      GRAPH ${sparqlEscapeUri(APPLICATION_GRAPH)} {
        ?config lpdcExt:conceptInstantiated "false"^^<http://mu.semte.ch/vocabularies/typed-literals/boolean> .
      }
    }
    WHERE {
      GRAPH ${sparqlEscapeUri(APPLICATION_GRAPH)} {
        ${sparqlEscapeUri(conceptUri)} lpdcExt:hasConceptDisplayConfiguration ?config .
        ?config lpdcExt:conceptInstantiated ?oldIsInstantiated .
      }
    }
  `;

  await update(removeInstantiatedFlagQuery);
}
