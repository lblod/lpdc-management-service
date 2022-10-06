import { querySudo, updateSudo } from '@lblod/mu-auth-sudo';
import { sparqlEscapeUri, sparqlEscapeString } from 'mu';
import { CONCEPTUAL_SERVICE_GRAPH, PREFIXES } from '../config';
import { v4 as uuid } from 'uuid';
import { flatten } from 'lodash';
import { bindingsToNT } from '../utils/bindingsToNT';
import { addUuidForSubject, addTypeForsubject, groupBySubject } from '../utils/common.js';
import fetch from 'node-fetch';
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

  //ensure unique:
  versionedServices = versionedServices.reduce((acc, t) => {
    acc[t?.subject?.value] = t;
    return acc;
  }, {});
  versionedServices = Object.values(versionedServices);

  const toProcess = [];

  for(const entry of versionedServices) {
    if(await isConceptualPublicService(entry.graph.value, entry.subject.value, entry.object.value)) {
      toProcess.push(entry);
    }
  }

  for(const entry of toProcess) {
    try {
      await updateNewLdesVersion(entry.graph.value, entry.subject.value, entry.object.value);
      await updatedVersionInformation(entry.subject.value, entry.object.value);
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
      GRAPH ${sparqlEscapeUri(vGraph)} {
        ${sparqlEscapeUri(vService)} a lpdcExt:ConceptualPublicService;
          dct:isVersionOf ${sparqlEscapeUri(service)};
          <http://www.w3.org/ns/prov#generatedAtTime> ?time.

         FILTER NOT EXISTS {
           ?otherVersion dct:isVersionOf ${sparqlEscapeUri(service)};
             <http://www.w3.org/ns/prov#generatedAtTime> ?otherTime.
           FILTER(?time < ?otherTime)
         }
       }
       FILTER NOT EXISTS {
         ${sparqlEscapeUri(service)} ext:hasVersionedSource ${sparqlEscapeUri(vService)}.
       }
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
  const sudo = true;

  const serviceUri = await serviceUriForId(serviceId, type);

  if(!serviceUri) {
    throw `Service URI not found for id ${serviceId}`;
  }

  const results = [];

  results.push(await loadEvidences(serviceUri, { graph, sudo, includeUuid: true }));
  results.push(await loadRequirements(serviceUri, { graph, sudo, includeUuid: true }));
  results.push(await loadOnlineProcedureRules(serviceUri, { graph, sudo, includeUuid: true }));
  results.push(await loadRules(serviceUri, { graph, sudo, includeUuid: true }));
  results.push(await loadCosts(serviceUri, { graph, sudo, includeUuid: true }));
  results.push(await loadFinancialAdvantages(serviceUri, { graph, sudo, includeUuid: true }));
  results.push(await loadContactPointsAddresses(serviceUri, { graph, sudo, includeUuid: true }));
  results.push(await loadContactPoints(serviceUri, { graph, sudo, includeUuid: true }));
  results.push(await loadWebsites(serviceUri, { graph, sudo, includeUuid: true }));
  results.push(await loadPublicService(serviceUri, { graph, sudo, includeUuid: true }));
  results.push(await loadAttachments(serviceUri, { graph, sudo, includeUuid: true }));

  const sourceBindings = results
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

  //Some code list entries might be missing in our DB we insert these here
  await ensureNewIpdcOrganisations(versionedServiceUri);

  const loadAndPostProcess = async (callBack, newType = null) => {
    let finalResults = [];
    const bindings = await callBack(versionedServiceUri, { graph, sudo });
    const bindingsPerSubject = groupBySubject(bindings);
    for(const bindings of Object.values(bindingsPerSubject)) {
      let updatedBindings = addUuidForSubject(bindings);
      if(newType) {
        updatedBindings = addTypeForsubject(updatedBindings, newType);
      }
      finalResults = [ ...finalResults, ...updatedBindings ];
    }
    return finalResults;
  };

  const results = [];

  //TODO: probably we will be able to get rid of these extra typings, once IPDC cleans the data
  results.push(await loadAndPostProcess(loadEvidences, 'http://data.europa.eu/m8g/Evidence'));
  results.push(await loadAndPostProcess(loadRequirements));
  results.push(await loadAndPostProcess(loadOnlineProcedureRules, 'http://schema.org/WebSite'));
  results.push(await loadAndPostProcess(loadRules));
  results.push(await loadAndPostProcess(loadCosts));
  results.push(await loadAndPostProcess(loadFinancialAdvantages));
  results.push(await loadAndPostProcess(loadContactPointsAddresses));
  results.push(await loadAndPostProcess(loadContactPoints));
  results.push(await loadAndPostProcess(loadWebsites));
  results.push(await loadAndPostProcess(loadAttachments));

  let serviceResultBindings = await loadPublicService(versionedServiceUri, { graph, sudo });
  serviceResultBindings = addUuidForSubject(serviceResultBindings, serviceId);
  for(const tripleData of serviceResultBindings) {
      tripleData.s.value = serviceUri;
  }

  results.push(serviceResultBindings);

  const sourceBindings = results
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

async function updatedVersionInformation( versionedResource, resource ) {
  const queryStr = `
   ${PREFIXES}
   INSERT {
     GRAPH ?g {
      ?s ext:hasVersionedSource ${sparqlEscapeUri(versionedResource)}.
     }
   }
   WHERE {
     BIND(${sparqlEscapeUri(resource)} as ?s)
     GRAPH ?g {
      ?s ?p ?o.
    }
   }
  `;
  await updateSudo(queryStr);
}

async function ensureNewIpdcOrganisations(service) {
  let codelistEntries = await getCodeListEntriesForPredicate(service, 'm8g:hasCompetentAuthority');
  codelistEntries = [...codelistEntries, ...await getCodeListEntriesForPredicate(service, 'lpdcExt:hasExecutingAuthority') ];
  for(const code of codelistEntries) {
    if(!await existingCode(code)) {
      const codeListData = await fetchOrgRegistryCodelistEntry(code);
      if (codeListData.prefLabel){
        console.log(`Inserting new codeList ${code}`);
        await insertCodeListData(codeListData);
      }
    }
  }
}

async function getCodeListEntriesForPredicate(service, predicate = 'm8g:hasCompetentAuthority') {
  const queryStr = `
    ${PREFIXES}
    SELECT DISTINCT ?codeListEntry {
      ${sparqlEscapeUri(service)} ${predicate} ?codeListEntry.
    }
  `;
  const result = await querySudo(queryStr);
  return result.results.bindings.map(r => r.codeListEntry.value);
}

async function existingCode(code, conceptScheme = 'dvcs:IPDCOrganisaties') {
  const queryStr = `
  ${PREFIXES}
  ASK {
    GRAPH ?g {
      ${sparqlEscapeUri(code)} a skos:Concept;
       skos:inScheme ${conceptScheme}.
    }
  }`;
  const queryData = await querySudo(queryStr);
  return queryData.boolean;
}

async function fetchOrgRegistryCodelistEntry(uriEntry) {
  const prefLabelUri = "http://www.w3.org/2004/02/skos/core#prefLabel";

  // The response is super nested, hence we make a little helper to extract it
  // A oneliner was even less readable.
  const parsePrefLabel = response => {
    if(response[uriEntry] && response[uriEntry][prefLabelUri]) {
      if(response[uriEntry][prefLabelUri].length) {
        return response[uriEntry][prefLabelUri][0].value;
      }
      else return null;
    }
    else return null;
  };

  const result = {};
  try {
    const response = await fetch(uriEntry, {
      headers: { 'Accept': 'application/json' }
    });
    if (response.ok) {
      const organisationObject = await response.json();
      result.uri = uriEntry;
      result.prefLabel = parsePrefLabel(organisationObject);
    }
  } catch (error) {
    //TODO: we suppress for now, but TBD with business how dramatic it would be to not have the entry
    console.log(`Unexpected error fetching ${uriEntry}`);
    console.log(error);
  }
  return result;
}

async function insertCodeListData(codeListData,
                                  seeAlso = 'https://wegwijs.vlaanderen.be',
                                  conceptScheme = 'dvcs:IPDCOrganisaties') {
  codeListData.uuid = uuid();
  const queryStr = `
    ${PREFIXES}
    INSERT {
      GRAPH ?g {
        ${sparqlEscapeUri(codeListData.uri)} a skos:Concept.
        ${sparqlEscapeUri(codeListData.uri)} skos:inScheme ${conceptScheme}.
        ${sparqlEscapeUri(codeListData.uri)} skos:topConceptOf ${conceptScheme}.
        ${sparqlEscapeUri(codeListData.uri)} skos:prefLabel ${sparqlEscapeString(codeListData.prefLabel)}.
        ${sparqlEscapeUri(codeListData.uri)} mu:uuid ${sparqlEscapeString(codeListData.uuid)}.
        ${sparqlEscapeUri(codeListData.uri)} rdfs:seeAlso ${sparqlEscapeUri(seeAlso)}.
      }
    } WHERE {
       GRAPH ?g {
         ${conceptScheme} a skos:ConceptScheme.
       }
    }
 `;
  const queryResult = await querySudo(queryStr);
}
