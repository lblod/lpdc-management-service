import { querySudo, updateSudo } from '@lblod/mu-auth-sudo';
import { sparqlEscapeUri } from 'mu';
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

/*
* check if a code is present in the triplestore
* TODO: change for a better query with triples below
*/
async function existingCode(code) {
  const queryStr = `
  ${PREFIXES}
  ASK {
    GRAPH ?g {
      ${sparqlEscapeUri(code)}  a skos:Concept;
       skos:inScheme dvcs:IPDCOrganisaties;
       skos:topConceptOf dvcs:IPDCOrganisaties.
    }
  }`;
  const queryData = await querySudo(queryStr);
  return queryData.boolean;
}

const labelURI  = "https://data.vlaanderen.be/id/concept/organisatieclassificatie/7847213d-dc31-29d0-5877-45a6b81100cc";
const uuidURI = "https://data.vlaanderen.be/id/concept/organisatieclassificatie/175898ff-4295-f9f4-e66f-0f64ebcbdcd5";

/*
*  fetch code list data and create a result object with fields of interest
*  a valid field is added in order to use the object afterwards
*/
async function fetchCodeListData(url_codelist){
  const response = await fetch(url_codelist, {
    headers: { 'Accept': 'application/json' } });
  const result = {}
  if (response.status == 200) {
    const organisationObject = await response.json();
    // verify condition
    if (organisationObject.hasOwnProperty(labelURI) && organisationObject.hasOwnProperty(uuidURI)){
      result.uri = {};
      result.uri.value = url_codelist;
      result.label = organisationObject[labelURI]["http://www.w3.org/2004/02/skos/core#prefLabel"][0];
      result.uuid = organisationObject[uuidURI]["http://mu.semte.ch/vocabularies/core/uuid"][0];
      result.valid = true;
      return result;
    }
  }
  result.valid = false;
  return result;
}


/**
  * insert new code list
  */
async function insertCodeListData(codeListData){
  const queryStr = `
  ${PREFIXES}
  INSERT {
    ${sparqlEscapeUri(codeListData.uri)} a skos:Concept.
    ${sparqlEscapeUri(codeListData.uri)} skos:inScheme dvcs:IPDCOrganisaties.
    ${sparqlEscapeUri(codeListData.uri)} skos:topConceptOf dvcs:IPDCOrganisaties.
    ${sparqlEscapeUri(codeListData.uri)} skos:prefLabel ${sparqlEscapeString(codeListData.label.value)}.
    ${sparqlEscapeUri(codeListData.uri)} mu:uuid ${sparqlEscapeString(codeListData.uuid.value)}.
  } `;
  const queryResult  = await querySudo(queryStr);
}

async function handleCodeList(code) {
  const alreadyExists = await existingCode(code);
  if (!alreadyExists){
    const codeListData = await fetchCodeListData(code);
    if (codeListData.valid){
      console.log(`Inserting new codeList ${code}`);
      insertCodeListData(codeListData);
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
