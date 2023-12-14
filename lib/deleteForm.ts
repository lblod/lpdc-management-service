import {query, sparqlEscapeDateTime, sparqlEscapeUri, update} from '../mu-helper';
import {APPLICATION_GRAPH, PREFIX} from '../config';
import {bindingsToNT} from '../utils/bindingsToNT';
import {
    loadAttachments,
    loadContactPoints,
    loadContactPointsAddresses,
    loadCosts,
    loadEvidences,
    loadFinancialAdvantages,
    loadOnlineProcedureRules,
    loadPublicService,
    loadRequirements,
    loadRules,
    loadWebsites,
    serviceUriForId
} from './commonQueries';
import {isAllowedForLPDC} from '../utils/session-utils';
import {getScopedGraphsForStatement} from '../utils/common';
import {updateSudo} from '@lblod/mu-auth-sudo';
import {SessieSparqlRepository} from "../src/driven/persistence/sessie-sparql-repository";
import {BestuurseenheidSparqlRepository} from "../src/driven/persistence/bestuurseenheid-sparql-repository";

export async function deleteForm(serviceId: string, sessionUri: string, sessieRepository: SessieSparqlRepository, bestuurseenheidRepository: BestuurseenheidSparqlRepository): Promise<void> {
    const serviceUri = await serviceUriForId(serviceId);

    if (!serviceUri) {
        throw `Service URI not found for id ${serviceId}`;
    }

    const conceptUri = await conceptUriForService(serviceUri);
    const hadConcept = Boolean(conceptUri);

    const results = [];

    results.push(await loadEvidences(serviceUri, {type: 'cpsv:PublicService', includeUuid: true}));
    results.push(await loadRequirements(serviceUri, {type: 'cpsv:PublicService', includeUuid: true}));
    results.push(await loadOnlineProcedureRules(serviceUri, {type: 'cpsv:PublicService', includeUuid: true}));
    results.push(await loadRules(serviceUri, {type: 'cpsv:PublicService', includeUuid: true}));
    results.push(await loadCosts(serviceUri, {type: 'cpsv:PublicService', includeUuid: true}));
    results.push(await loadFinancialAdvantages(serviceUri, {type: 'cpsv:PublicService', includeUuid: true}));
    results.push(await loadContactPointsAddresses(serviceUri, {type: 'cpsv:PublicService', includeUuid: true}));
    results.push(await loadContactPoints(serviceUri, {type: 'cpsv:PublicService', includeUuid: true}));
    results.push(await loadWebsites(serviceUri, {type: 'cpsv:PublicService', includeUuid: true}));
    results.push(await loadPublicService(serviceUri, {type: 'cpsv:PublicService', includeUuid: true}));
    results.push(await loadAttachments(serviceUri, {type: 'cpsv:PublicService', includeUuid: true}));
    results.push(await loadReviewStatus(serviceUri));

    const sourceBindings = results
        .reduce((acc, b) => [...acc, ...b]);

    // Start workaround bug virtuoso and lang strings.
    // See updateForm.js for longer explanation.
    // Keep code in sync with updateForm.js
    const source = bindingsToNT(sourceBindings);
    const sessie = await sessieRepository.findById(sessionUri);
    const bestuurseenheid = await bestuurseenheidRepository.findById(sessie.bestuurseenheidId);

    if (!(await isAllowedForLPDC(sessie.id))) {
        throw `Session ${sessie.id} is not an LPDC User`;
    }

    for (const statement of source) {
        // The workaround: ensure mu-auth deletes one triple in one graph at a time. We know that works.
        const targetGraphPattern = `http://mu.semte.ch/graphs/organizations/${bestuurseenheid.uuid}/`;
        const targetGraphs = await getScopedGraphsForStatement(statement, targetGraphPattern);

        for (const graph of targetGraphs) {
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
    ${PREFIX.as}
    ${PREFIX.cpsv}
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

async function conceptUriForService(serviceUri: string): Promise<string> {
    return (await query(`
      ${PREFIX.cpsv}
      ${PREFIX.dct}

      SELECT DISTINCT ?concept
      WHERE {
        BIND(${sparqlEscapeUri(serviceUri)} as ?service)
        ?service a cpsv:PublicService ;
          dct:source ?concept.
      }
      LIMIT 1
    `)).results.bindings[0]?.concept?.value;
}

async function conceptHasInstances(conceptUri: string): Promise<boolean> {
    const conceptHasInstancesQuery = `
    ${PREFIX.cpsv}
    ${PREFIX.dct}
    ASK WHERE {
      GRAPH ${sparqlEscapeUri(APPLICATION_GRAPH)} {
        ?instance a cpsv:PublicService ;
          dct:source ${sparqlEscapeUri(conceptUri)} .
      }
    }
  `;

    return (await query(conceptHasInstancesQuery)).boolean;
}

async function removeInstantiatedFlag(conceptUri: string): Promise<void> {
    const removeInstantiatedFlagQuery = `
    ${PREFIX.lpdcExt}

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

async function loadReviewStatus(serviceUri: string): Promise<any> {
    return (await query(`
      ${PREFIX.ext}
      ${PREFIX.cpsv}

      SELECT DISTINCT ?s ?p ?o
      WHERE {
        BIND(${sparqlEscapeUri(serviceUri)} as ?s)
        VALUES ?p {
            ext:reviewStatus
        }
        ?s a cpsv:PublicService.
        ?s ?p ?o .
      }
    `)).results.bindings;
}
