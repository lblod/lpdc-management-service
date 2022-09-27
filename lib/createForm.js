import _ from 'lodash';
import { query, sparqlEscapeDateTime, sparqlEscapeString, sparqlEscapeUri, update } from 'mu';
import { v4 as uuid } from 'uuid';
import { APPLICATION_GRAPH, CONCEPTUAL_SERVICE_GRAPH, FORM_STATUS_CONCEPT, PREFIXES } from '../config';
import { bindingsToNT } from '../utils/bindingsToNT';
import { addUuid, replaceType } from '../utils/common.js';
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
         loadAttachments
       } from './commonQueries';

export async function createEmptyForm(bestuurseenheid) {
  const publicServiceId = uuid();
  const publicServiceUri = `http://data.lblod.info/id/public-service/${publicServiceId}`;

  const spatials = await getSpatialForBestuurseenheid(bestuurseenheid);
  const spatialsPreparedStatement = spatials.map(s => `dct:spatial ${sparqlEscapeUri(s)};`).join('\n');

  const now = new Date().toISOString();
  const query = `
  ${PREFIXES}
  INSERT DATA {
    GRAPH <http://mu.semte.ch/graphs/application> {
      ${sparqlEscapeUri(publicServiceUri)} a cpsv:PublicService ;
        dct:created ${sparqlEscapeDateTime(now)} ;
        dct:modified ${sparqlEscapeDateTime(now)} ;
        mu:uuid """${publicServiceId}""" ;
        adms:status <http://lblod.data.gift/concepts/79a52da4-f491-4e2f-9374-89a13cde8ecd> ;
        ${spatialsPreparedStatement.length ? spatialsPreparedStatement : 'dct:spatial ?spatial;'}
        pav:createdBy ${sparqlEscapeUri(bestuurseenheid)}.
    }
  }`;

  await update(query);

  return {
    uuid: publicServiceId,
    uri: publicServiceUri
  };
}

export async function createForm(conceptId, bestuurseenheid) {
  const graph = CONCEPTUAL_SERVICE_GRAPH;
  const conceptUri = await getConceptUri(conceptId);

  const evidenceData = copySubjects(await loadEvidences(conceptUri, { graph }),
                                    'http://data.lblod.info/id/evidence/');
  const requirementData = copySubjects(await loadRequirements(conceptUri, { graph }),
                                       'http://data.lblod.info/id/requirement/');
  replaceObjectsWithCopiedChildren(requirementData, evidenceData);

  const onlineProcedureData = copySubjects(await loadOnlineProcedureRules(conceptUri, { graph }),
                                           'http://data.lblod.info/id/website/');
  const rulesData = copySubjects(await loadRules(conceptUri, { graph }),
                                 'http://data.lblod.info/id/rule/');
  replaceObjectsWithCopiedChildren(rulesData, onlineProcedureData);

  const costsData = copySubjects(await loadCosts(conceptUri,{ graph }),
                                 'http://data.lblod.info/id/cost/');

  const financialAdvantageData = copySubjects(await loadFinancialAdvantages(conceptUri, { graph }),
                                              'http://data.lblod.info/id/financial-advantage/');

  const contactPointAddressData = copySubjects(await loadContactPointsAddresses(conceptUri,{ graph }),
                                               'http://data.lblod.info/id/address/');
  const contactPointData = copySubjects(await loadContactPoints(conceptUri, { graph }),
                                        'http://data.lblod.info/id/contact-point/');
  replaceObjectsWithCopiedChildren(contactPointData, contactPointAddressData);

  const attachmentsData = copySubjects(await loadAttachments(conceptUri, { graph }),
                                       'http://data.lblod.info/id/attachment/');

  const websitesData = copySubjects(await loadWebsites(conceptUri, { graph }),
                                    'http://data.lblod.info/id/website/');

  let result = await loadPublicService(conceptUri, { graph });
  result = replaceType(result,
                       'https://productencatalogus.data.vlaanderen.be/ns/ipdc-lpdc#ConceptualPublicService',
                       'http://purl.org/vocab/cpsv#PublicService');
  const publicServiceData = copySubjects(result,
                                         'http://data.lblod.info/id/public-service/');

  replaceObjectsWithCopiedChildren(publicServiceData,
                                   {  ...requirementData,
                                      ...rulesData,
                                      ...websitesData,
                                      ...costsData,
                                      ...financialAdvantageData,
                                      ...contactPointData,
                                      ...attachmentsData
                                   });

  // Next lines is all about extracting the triple data so in can be injected in an insert.
  // TODO: this boilerplate could be more pretty
  let allTriples = [
    publicServiceData,
    evidenceData,
    onlineProcedureData,
    requirementData,
    rulesData,
    websitesData,
    costsData,
    financialAdvantageData,
    contactPointAddressData,
    contactPointData,
    attachmentsData
  ].map(data => Object.values(data));
  allTriples = _.flattenDeep(allTriples);
  allTriples = bindingsToNT(allTriples);

  // We need gradual insert, triple per triple, because contains LOOONG html
  // This also implies we have to set the types first, since else we migth confuse mu-auth
  const typeTriples = allTriples.filter(t => t.includes('http://www.w3.org/1999/02/22-rdf-syntax-ns#type'));
  const otherTriples = allTriples.filter(t => !t.includes('http://www.w3.org/1999/02/22-rdf-syntax-ns#type'));

  for(const statement of [ ...typeTriples, ...otherTriples ] ) {
    const newPublicServiceQuery = `
      INSERT DATA {
        GRAPH ${sparqlEscapeUri(APPLICATION_GRAPH)} {
          ${statement}
        }
      }
    `;
    await update(newPublicServiceQuery);
  }

  //some extra meta data is needed
  const newServiceUri = Object.values(publicServiceData)[0][0].s.value;
  const newServiceUuid = Object.values(publicServiceData)[0]
        .find(triple => triple.p.value == 'http://mu.semte.ch/vocabularies/core/uuid').o.value;

  const now = new Date().toISOString();
  const spatials = await getSpatialForBestuurseenheid(bestuurseenheid);
  const spatialsPreparedStatement = spatials.map(s => `dct:spatial ${sparqlEscapeUri(s)};`).join('\n');
  const extraDataQuery = `
    ${PREFIXES}

    INSERT {
      GRAPH ${sparqlEscapeUri(APPLICATION_GRAPH)} {
        ?service adms:status ${sparqlEscapeUri(FORM_STATUS_CONCEPT)};
          ${spatialsPreparedStatement.length ? spatialsPreparedStatement : ''}
          dct:created ${sparqlEscapeDateTime(now)};
          dct:modified ${sparqlEscapeDateTime(now)};
          pav:createdBy ${sparqlEscapeUri(bestuurseenheid)};
          lpdcExt:hasExecutingAuthority ${sparqlEscapeUri(bestuurseenheid)}.
      }
    }
    WHERE {
      BIND(${sparqlEscapeUri(newServiceUri)} as ?service)
      GRAPH ${sparqlEscapeUri(APPLICATION_GRAPH)} {
      ?service a cpsv:PublicService.
      }
    }
  `;

  await update(extraDataQuery);

  return {
    uuid: newServiceUuid,
    uri:newServiceUri
  };
}

/*
 * Helper function to execute a query and copy retreived resources into new resources.
 * It adds both a UUID and dct:source to the new resource too.
 * It returns an intermediate data structure. Which is easier to use when relations need
 * to be copied over.
 * Probably this function won't be used outside this file.
 *
 * @param {String}: CONSTRUCT query string
 * @param {String}: template for new URI
 *
 * @returns {'http://old/uri': [ {s: { {value: 'http://new/uri' } }, p: binding, o: binding } ] }
 */
function copySubjects(result, uriTemplate) {
  const copiedData = {};

  if(result.results.bindings.length) {
    const bindings = result.results.bindings;

    const groupedBySubject = groupBySubject(bindings);

    for(const oldUri in groupedBySubject) {
      copiedData[oldUri] = copySubject(oldUri, groupedBySubject[oldUri], uriTemplate);
    }
    return copiedData;
  }
  else return copiedData;
}

function copySubject(oldUri, triplesData, uriTemplate) {
  const newUuid = uuid();
  const newSubject = uriTemplate + newUuid;

  if(triplesData.length){
    for(const tripleData of triplesData) {
      tripleData.s.value = newSubject;
    }

    addUuid(triplesData);

    triplesData.push(
      {
        s: { value: newSubject, type: 'uri' },
        p: { value: 'http://purl.org/dc/terms/source', type: 'uri'},
        o: { value: oldUri, type: 'uri' }
      }
    );
  }

  return triplesData;
}

function groupBySubject(bindings) {
  const groupedBySubject = bindings.reduce((acc, triple) => {
    if(!acc[triple.s.value]) {
      acc[triple.s.value] = [ triple ];
    }
    else {
      acc[triple.s.value].push(triple);
    }
    return acc;
  }, {});
  return groupedBySubject;
}

/*
 * Replaces the children of a parent (i.e. relations) with new URI's
 * Probably this function won't be used outside this file.
 * The input is the output of copySubjects.
 *
 * @param {Object}: {'http://old/parent/uri': [ {s: binding, p: binding, o:  { {value: 'http://old/child' } } } ] }
 * @param {Object}: {'http://old/child': [ {s: { {value: 'http://new/child' } }, p: binding, o: binding } ] }
 *
 * @returns {Object}: {'http://old/parent/uri': [ {s: binding, p: binding, o:  { {value: 'http://new/child' } } } ] }
 */
function replaceObjectsWithCopiedChildren(parentData, childrenData) {
  for(const tripleData of Object.values(parentData)){
    for(const triple of tripleData) {
      if(childrenData[triple.o.value]){
        triple.o.value = childrenData[triple.o.value][0].s.value;
      }
    }
  }
  return parentData;
}

async function getConceptUri(conceptUuid) {
  const result = await query(`
    ${PREFIXES}

    SELECT DISTINCT ?conceptUri WHERE {
      GRAPH ${sparqlEscapeUri(APPLICATION_GRAPH)} {
       ?conceptUri mu:uuid ${sparqlEscapeString(conceptUuid)}.
      }
  }`);

  if(result.results.bindings.length == 1) {
    return result.results.bindings[0]['conceptUri'].value;
  }
  else throw `No exact match found for lpdcExt:ConceptualPublicService ${conceptUuid}`;
}

async function getSpatialForBestuurseenheid(bestuurseenheid) {
  const queryStr = `
    ${PREFIXES}

    SELECT DISTINCT ?spatial WHERE {
      VALUES ?werkingsGebiedP {
        <http://data.vlaanderen.be/ns/besluit#werkingsgebied>
      }

      ${sparqlEscapeUri(bestuurseenheid)} ?werkingsGebiedP ?werkingsgebied.

      ?werkingsgebied <http://www.w3.org/2004/02/skos/core#exactMatch> ?spatial.

      ?spatial <http://www.w3.org/2004/02/skos/core#inScheme> <http://lblod.data.gift/vocabularies/lpdc-ipdc/IPDCLocaties>
    }
  `;

  const results = (await query(queryStr)).results.bindings;

  return results.map(r => r.spatial.value);
}
