import { sparqlEscapeString, sparqlEscapeDateTime, sparqlEscapeUri, update, query } from 'mu';
import { APPLICATION_GRAPH, FORM_STATUS_CONCEPT, NESTED_PREDICATES, PREFIXES } from '../config';
import { bindingsToNT } from '../utils/bindingsToNT';
import { targetTriples } from '../utils/target-triples';
import { v4 as uuid } from 'uuid';


export async function createForm(conceptId) {
  const now = new Date().toISOString();
  const newPublicServiceId = uuid();
  const newPublicServiceUri = `http://data.lblod.info/id/public-services/${newPublicServiceId}`;

  let allTriples = [];
  const conceptUri = await getConceptUri(conceptId);

  const publicServiceQuery = `
    ${PREFIXES}

    CONSTRUCT  {
      ${sparqlEscapeUri(newPublicServiceUri)} a cpsv:PublicService;
        mu:uuid ${sparqlEscapeString(newPublicServiceId)};
        dct:identifier	?identifier ;
        dct:description	?description;
        dcat:keyword ?keywords;
        dct:language ?language;
        m8g:hasCompetentAuthority ?competentAuthority;
        lpdcExt:targetAudience	?targetAudience;
        m8g:thematicArea ?thematicArea;
        lpdcExt:exception ?exception;
        m8g:hasLegalResource ?legalResource;
        m8g:hasCost	?cost;
        belgif:hasRequirement ?requirement;
        dct:title	?title;
        dct:spatial ?spatial;
        cpsv:follows ?rule;
        dct:type ?type;
        ps:lifecycleStatus ${sparqlEscapeUri(FORM_STATUS_CONCEPT)};
        dct:created ${sparqlEscapeDateTime(now)};
        dct:modified ${sparqlEscapeDateTime(now)}.

        ${sparqlEscapeUri(conceptUri)} dct:source ${sparqlEscapeUri(newPublicServiceUri)} .
      }
    FROM ${sparqlEscapeUri(APPLICATION_GRAPH)}
    WHERE  {
      ${sparqlEscapeUri(conceptUri)} a lblodIpdcLpdc:ConceptualPublicService;
        dct:identifier	?identifier ;
        dct:description	?description;
        dcat:keyword ?keywords;
        dct:language ?language;
        m8g:hasCompetentAuthority ?competentAuthority;
        lpdcExt:targetAudience	?targetAudience;
        m8g:thematicArea ?thematicArea;
        lpdcExt:exception ?exception;
        m8g:hasLegalResource ?legalResource;
        m8g:hasCost	?cost;
        belgif:hasRequirement ?requirement;
        dct:title	?title;
        dct:spatial ?spatial;
        cpsv:follows ?rule;
        dct:type ?type.
      }
    `;

  let result = await query(publicServiceQuery);

  if(result.results) {
    allTriples = [...allTriples, ...result.results.bindings];
  }

  const requirementsQuery = `
    ${PREFIXES}
    CONSTRUCT {
      ?requirement ?reqPred ?reqObj.
    }
    FROM ${sparqlEscapeUri(APPLICATION_GRAPH)}
      WHERE  {
        BIND(${sparqlEscapeUri(conceptUri)} as ?publicService)
        ?publicService a lblodIpdcLpdc:ConceptualPublicService;
          belgif:hasRequirement ?requirement.

         ?requirement ?reqPred ?reqObj.
      }
  `;

  result = await query(requirementsQuery);

  if(result.results) {
    allTriples = [...allTriples, ...result.results.bindings];
  }

  const costsQuery = `
    ${PREFIXES}
    CONSTRUCT {
      ?cost ?costPred ?costObj.
    }
    FROM ${sparqlEscapeUri(APPLICATION_GRAPH)}
      WHERE  {
        BIND(${sparqlEscapeUri(conceptUri)} as ?publicService)
        ?publicService a lblodIpdcLpdc:ConceptualPublicService;
          m8g:hasCost	?cost.

         ?cost ?costPred ?costObj.
      }
  `;

  result = await query(costsQuery);

  if(result.results) {
    allTriples = [...allTriples, ...result.results.bindings];
  }

  const ruleQuery = `
    ${PREFIXES}
    CONSTRUCT {
       ?rule ?rulePred ?ruleObj.
    }
    FROM ${sparqlEscapeUri(APPLICATION_GRAPH)}
      WHERE  {
        BIND(${sparqlEscapeUri(conceptUri)} as ?publicService)
        ?publicService a lblodIpdcLpdc:ConceptualPublicService;
          cpsv:follows ?rule.

        ?rule ?rulePred ?ruleObj.
      }
  `;

  result = await query(ruleQuery);

  if(result.results) {
    allTriples = [...allTriples, ...result.results.bindings];
  }

  const newTriples = targetTriples(allTriples, NESTED_PREDICATES);

  const newPublicServiceQuery = `
    INSERT DATA {
      GRAPH ${sparqlEscapeUri(APPLICATION_GRAPH)} {
        ${bindingsToNT(newTriples).join("\r\n")}
      }
    }
  `;
  await update(newPublicServiceQuery);

  return {
    uuid: newPublicServiceId,
    uri: newPublicServiceUri
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
async function queryAndCopySubjects(queryStr, uriTemplate) {
  const copiedData = {};

  const result = await query(queryStr);
  if(result.results.bindings.length) {
    const bindings = result.results.bindings;

    const groupedBySubject = bindings.reduce((acc, triple) => {
      if(!acc[triple.s.value]) {
        acc[triple.s.value] = [ triple ];
      }
      else {
        acc[triple.s.value].push(triple);
      }
      return acc;
    }, {});

    for(const oldUri in groupedBySubject) {
      copiedData[oldUri] = copyResource(oldUri, groupedBySubject[oldUri], uriTemplate);
    }
    return copiedData;
  }
  else return copiedData;
}

function copyResource(oldUri, triplesData, uriTemplate) {
  const newUuid = uuid();
  const newSubject = uriTemplate + newUuid;

  if(triplesData.length){
    for(const tripleData of triplesData) {
      tripleData.s.value = newSubject;
    }

    triplesData.push(
      {
        s: { value: newSubject, type: 'uri' },
        p: { value: 'http://mu.semte.ch/vocabularies/core/uuid', type: 'uri'},
        o: { value: newUuid  }
      }
    );

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

/*
 * Replaces the children of a parent (i.e. relations) with new URI's
 * Probably this function won't be used outside this file.
 *
 * @param {Object}: {'http://old/uri': [ {s: { {value: 'http://new/uri' } }, p: binding, o: binding } ] }
 * @param {Object}: {'http://old/uri': [ {s: { {value: 'http://new/uri' } }, p: binding, o: binding } ] }
 *
 * @returns
 */
function replaceObjectsWithCopiedChildren(parentData, childrenData) {
  for(const tripleData of Object.values(parentData)){
    for(const triple of tripleData) {
      if(childrenData[triple.o.value]){
        triple.o.value = childrenData[triple.o.value][0].s.value;
      }
    }
  }
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
  else throw `No exact match found for lblodIpdcLpdc:ConceptualPublicService ${conceptUuid}`;
}
