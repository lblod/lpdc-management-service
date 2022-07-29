import _ from 'lodash';
import { query, sparqlEscapeDateTime, sparqlEscapeString, sparqlEscapeUri, update } from 'mu';
import { v4 as uuid } from 'uuid';
import { APPLICATION_GRAPH, FORM_STATUS_CONCEPT, PREFIXES } from '../config';
import { bindingsToNT } from '../utils/bindingsToNT';

export async function createEmptyForm() {
  const publicServiceId = uuid();
  const publicServiceUri = `http://data.lblod.info/id/public-service/${publicServiceId}`

  const now = new Date().toISOString();
  const query = `
  ${PREFIXES}
  INSERT DATA {
    GRAPH <http://mu.semte.ch/graphs/application> {
      ${sparqlEscapeUri(publicServiceUri)} a cpsv:PublicService ;
        dct:created ${sparqlEscapeDateTime(now)} ;
        dct:modified ${sparqlEscapeDateTime(now)} ;
        mu:uuid """${publicServiceId}""" ;
        adms:status <http://lblod.data.gift/concepts/79a52da4-f491-4e2f-9374-89a13cde8ecd> .
    }
  }`;

  await update(query);

  return {
    uuid: publicServiceId,
    uri: publicServiceUri
  };
}

export async function createForm(conceptId) {
  const conceptUri = await getConceptUri(conceptId);

  // Note: This might look verbose, but we want to be in control of what is copied.
  // To avoid unintended side effects.
  const evidenceQuery = `
    ${PREFIXES}

    CONSTRUCT {
      ?evidence a m8g:Evidence;
        dct:description ?description;
        dct:title ?title.
    }
    FROM ${sparqlEscapeUri(APPLICATION_GRAPH)}
      WHERE  {
        BIND(${sparqlEscapeUri(conceptUri)} as ?publicService)
        ?publicService a lblodIpdcLpdc:ConceptualPublicService;
          belgif:hasRequirement ?requirement.

        ?requirement a m8g:Requirement;
          m8g:hasSupportingEvidence ?evidence.

        ?evidence a m8g:Evidence;
          dct:description ?description;
          dct:title ?title.
      }
  `;

  const evidenceData = await queryAndCopySubjects(evidenceQuery, 'http://data.lblod.info/id/evidence/');

  const requirementsQuery = `
    ${PREFIXES}
    CONSTRUCT {
      ?requirement a m8g:Requirement;
        m8g:hasSupportingEvidence ?evidence;
        dct:description ?description;
        dct:title ?title.
    }
    FROM ${sparqlEscapeUri(APPLICATION_GRAPH)}
      WHERE  {
        BIND(${sparqlEscapeUri(conceptUri)} as ?publicService)
        ?publicService a lblodIpdcLpdc:ConceptualPublicService;
          belgif:hasRequirement ?requirement.

        ?requirement a m8g:Requirement;
          m8g:hasSupportingEvidence ?evidence;
          dct:description ?description;
          dct:title ?title.
      }
  `;

  const requirementData = await queryAndCopySubjects(requirementsQuery, 'http://data.lblod.info/id/requirement/');
  replaceObjectsWithCopiedChildren(requirementData, evidenceData);

  const onlineProcedureRuleQuery = `
    ${PREFIXES}
    CONSTRUCT {
      ?procedure a schema:Website;
        dct:description ?description;
        dct:title ?title;
        schema:url ?url.
    }
    FROM ${sparqlEscapeUri(APPLICATION_GRAPH)}
      WHERE  {
        BIND(${sparqlEscapeUri(conceptUri)} as ?publicService)
        ?publicService a lblodIpdcLpdc:ConceptualPublicService;
          cpsv:follows ?rule.

        ?rule a cpsv:Rule;
          lpdcExt:hasOnlineProcedure ?procedure.

        ?procedure a schema:Website;
          dct:description ?description;
          dct:title ?title;
          schema:url ?url.
      }
  `;

  const onlineProcedureData = await queryAndCopySubjects(onlineProcedureRuleQuery, 'http://data.lblod.info/id/website/');

  // Note: mind the avoidance of the bind statement here.
  //  Virtuoso spits weird errors combining construct, bind and optional.
  const rulesQuery = `
    ${PREFIXES}
    CONSTRUCT {
      ?rule a cpsv:Rule;
        dct:description ?description;
        dct:title ?title.

      ?rule lpdcExt:hasOnlineProcedure ?procedure.
    }
    FROM ${sparqlEscapeUri(APPLICATION_GRAPH)}
      WHERE  {
        ${sparqlEscapeUri(conceptUri)} a lblodIpdcLpdc:ConceptualPublicService;
          cpsv:follows ?rule.

        ?rule a cpsv:Rule;
          dct:description ?description;
          dct:title ?title.

        OPTIONAL {
          ?rule lpdcExt:hasOnlineProcedure ?procedure.
        }
      }
  `;

  const rulesData = await queryAndCopySubjects(rulesQuery, 'http://data.lblod.info/id/rule/');
  replaceObjectsWithCopiedChildren(rulesData, onlineProcedureData);

  const costsQuery = `
    ${PREFIXES}
    CONSTRUCT {
       ?cost a m8g:Cost;
         dct:description ?description;
         dct:title ?title.
    }
    FROM ${sparqlEscapeUri(APPLICATION_GRAPH)}
      WHERE  {
        BIND(${sparqlEscapeUri(conceptUri)} as ?publicService)
        ?publicService a lblodIpdcLpdc:ConceptualPublicService;
          m8g:hasCost ?cost.

         ?cost a m8g:Cost;
           dct:description ?description;
           dct:title ?title.
      }
  `;

  const costsData = await queryAndCopySubjects(costsQuery, 'http://data.lblod.info/id/cost/');

  const financialAdvantageQuery = `
    ${PREFIXES}
    CONSTRUCT {
       ?advantage a lpdcExt:FinancialAdvantage;
         dct:description ?description;
         dct:title ?title.
    }
    FROM ${sparqlEscapeUri(APPLICATION_GRAPH)}
      WHERE  {
        BIND(${sparqlEscapeUri(conceptUri)} as ?publicService)
        ?publicService a lblodIpdcLpdc:ConceptualPublicService;
          cpsv:produces ?advantage.

         ?advantage a lpdcExt:FinancialAdvantage;
           dct:description ?description;
           dct:title ?title.
      }
  `;

  const financialAdvantageData = await queryAndCopySubjects(financialAdvantageQuery,
                                                      'http://data.lblod.info/id/financial-advantage/');

  //TODO: we comment this bit out, as here we will need a refined flow because eli:LegalResource are URI's from
  //      VlaamseCodex. So copying them over is not really what we want.
  // const legalResoureQuery = `
  //   ${PREFIXES}
  //   CONSTRUCT {
  //      ?legal a eli:LegalResource;
  //        dct:description ?description;
  //        dct:title ?title.
  //   }
  //   FROM ${sparqlEscapeUri(APPLICATION_GRAPH)}
  //     WHERE  {
  //       BIND(${sparqlEscapeUri(conceptUri)} as ?publicService)
  //       ?publicService a lblodIpdcLpdc:ConceptualPublicService;
  //         m8g:hasLegalResource ?legal.

  //        ?legal a eli:LegalResource;
  //          dct:description ?description;
  //          dct:title ?title.
  //     }
  // `;

  // Note: mind the avoidance of the bind statement here.
  //  Virtuoso spits weird errors combining construct, bind and optional.
  const contactPointsQuery = `
    ${PREFIXES}
    CONSTRUCT {
         ?contact a schema:ContactPoint.
         ?contact locn:address ?address.
         ?contact schema:email ?email.
         ?contact schema:telephone ?phone.
         ?contact schema:openingHours ?hours.
         ?contact schema:url ?url.
    }
    FROM ${sparqlEscapeUri(APPLICATION_GRAPH)}
      WHERE  {
        ${sparqlEscapeUri(conceptUri)} a lblodIpdcLpdc:ConceptualPublicService;
          m8g:hasContactPoint ?contact.

         ?contact a schema:ContactPoint.
         OPTIONAL { ?contact locn:address ?address. }
         OPTIONAL { ?contact schema:email ?email. }
         OPTIONAL { ?contact schema:telephone ?phone. }
         OPTIONAL { ?contact schema:openingHours ?hours. }
         OPTIONAL { ?contact schema:url ?url. }
      }
  `;

  const contacPointData = await queryAndCopySubjects(contactPointsQuery, 'http://data.lblod.info/id/contact-point/');

  const attachmentsQuery = `
    ${PREFIXES}
    CONSTRUCT {
         ?attachment a foaf:Document;
           schema:url ?url;
           dct:description ?description;
           dct:title ?title.
    }
    FROM ${sparqlEscapeUri(APPLICATION_GRAPH)}
      WHERE  {
        BIND(${sparqlEscapeUri(conceptUri)} as ?publicService)
        ?publicService a lblodIpdcLpdc:ConceptualPublicService;
          lpdcExt:attachment ?attachment.

         ?attachment a foaf:Document;
           schema:url ?url;
           dct:description ?description;
           dct:title ?title.
      }
  `;

  const attachmentsData = await queryAndCopySubjects(attachmentsQuery, 'http://data.lblod.info/id/attachment/');

  const websitesQuery = `
    ${PREFIXES}
    CONSTRUCT {
        ?moreInfo a schema:Website;
          dct:description ?description;
          dct:title ?title;
          schema:url ?url.
    }
    FROM ${sparqlEscapeUri(APPLICATION_GRAPH)}
      WHERE  {
        BIND(${sparqlEscapeUri(conceptUri)} as ?publicService)
        ?publicService a lblodIpdcLpdc:ConceptualPublicService;
          rdfs:seeAlso ?moreInfo.

        ?moreInfo a schema:Website;
          dct:description ?description;
          dct:title ?title;
          schema:url ?url.
      }
  `;

  const websitesData = await queryAndCopySubjects(websitesQuery, 'http://data.lblod.info/id/website/');

  // Note: mind the avoidance of the bind statement here.
  //  Virtuoso spits weird errors combining construct, bind and optional.
  const now = new Date().toISOString();
  const publicServiceQuery = `
    ${PREFIXES}

    CONSTRUCT  {
      ${sparqlEscapeUri(conceptUri)} a cpsv:PublicService;
        adms:status ${sparqlEscapeUri(FORM_STATUS_CONCEPT)};
        dct:created ${sparqlEscapeDateTime(now)};
        dct:modified ${sparqlEscapeDateTime(now)};

        dct:description ?description;
        schema:endDate ?end;
        lpdcExt:exception ?exception;
        lpdcExt:excutingAuthorityLevel ?executingAuthorityLevel;
        cpsv:follows ?rule;
        lpdcExt:attachment ?attachment;
        m8g:hasCompetentAuthority ?competentAuthority;
        m8g:hasContactPoint ?contactpoint;
        m8g:hasCost ?cost;
        rdfs:seeAlso ?moreInfo;
        belgif:hasRequirement ?requirement;
        dcat:keyword ?keywords;
        dct:language ?language;
        dct:title ?title;
        cpsv:produces ?financialAdvantage;
        lpdcExt:regulation ?regulation;
        dct:spatial ?spatial;
        schema:startDate ?start;
        lpdcExt:targetAudience ?targetAudience;
        m8g:thematicArea ?thematicArea;
        dct:type ?type;
        ps:lifecycleStatus ?lifecycleStatus.
      }
    FROM ${sparqlEscapeUri(APPLICATION_GRAPH)}
    WHERE  {
      ${sparqlEscapeUri(conceptUri)} a lblodIpdcLpdc:ConceptualPublicService.

      OPTIONAL{ ${sparqlEscapeUri(conceptUri)} dct:description ?description. }
      OPTIONAL{ ${sparqlEscapeUri(conceptUri)} schema:endDate ?end. }
      OPTIONAL{ ${sparqlEscapeUri(conceptUri)} lpdcExt:exception ?exception. }
      OPTIONAL{ ${sparqlEscapeUri(conceptUri)} lpdcExt:excutingAuthorityLevel ?executingAuthorityLevel. }
      OPTIONAL{ ${sparqlEscapeUri(conceptUri)} cpsv:follows ?rule. }
      OPTIONAL{ ${sparqlEscapeUri(conceptUri)} lpdcExt:attachment ?attachment. }
      OPTIONAL{ ${sparqlEscapeUri(conceptUri)} m8g:hasCompetentAuthority ?competentAuthority. }
      OPTIONAL{ ${sparqlEscapeUri(conceptUri)} m8g:hasContactPoint ?contactpoint. }
      OPTIONAL{ ${sparqlEscapeUri(conceptUri)} m8g:hasCost ?cost. }
      OPTIONAL{ ${sparqlEscapeUri(conceptUri)} m8g:hasLegalResource ?legalResource. }
      OPTIONAL{ ${sparqlEscapeUri(conceptUri)} rdfs:seeAlso ?moreInfo. }
      OPTIONAL{ ${sparqlEscapeUri(conceptUri)} belgif:hasRequirement ?requirement. }
      OPTIONAL{ ${sparqlEscapeUri(conceptUri)} dcat:keyword ?keywords. }
      OPTIONAL{ ${sparqlEscapeUri(conceptUri)} dct:language ?language. }
      OPTIONAL{ ${sparqlEscapeUri(conceptUri)} dct:title ?title. }
      OPTIONAL{ ${sparqlEscapeUri(conceptUri)} cpsv:produces ?financialAdvantage. }
      OPTIONAL{ ${sparqlEscapeUri(conceptUri)} lpdcExt:regulation ?regulation. }
      OPTIONAL{ ${sparqlEscapeUri(conceptUri)} dct:spatial ?spatial. }
      OPTIONAL{ ${sparqlEscapeUri(conceptUri)} schema:startDate ?start. }
      OPTIONAL{ ${sparqlEscapeUri(conceptUri)} lpdcExt:targetAudience ?targetAudience. }
      OPTIONAL{ ${sparqlEscapeUri(conceptUri)} m8g:thematicArea ?thematicArea. }
      OPTIONAL{ ${sparqlEscapeUri(conceptUri)} dct:type ?type. }
      OPTIONAL{ ${sparqlEscapeUri(conceptUri)} ps:lifecycleStatus ?lifecycleStatus. }
    }
    `;

  const publicServiceData = await queryAndCopySubjects(publicServiceQuery, 'http://data.lblod.info/id/public-service/');
  replaceObjectsWithCopiedChildren(publicServiceData,
                                   {  ...requirementData,
                                      ...rulesData,
                                      ...websitesData,
                                      ...costsData,
                                      ...financialAdvantageData,
                                      ...contacPointData,
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
    contacPointData,
    attachmentsData
  ].map(data => Object.values(data));
  allTriples = _.flattenDeep(allTriples);

  const newPublicServiceQuery = `
    INSERT DATA {
      GRAPH ${sparqlEscapeUri(APPLICATION_GRAPH)} {
        ${bindingsToNT(allTriples).join("\r\n")}
      }
    }
  `;
  await update(newPublicServiceQuery);

  const newServiceUri = Object.values(publicServiceData)[0][0].s.value;
  const newServiceUuid = Object.values(publicServiceData)[0]
        .find(triple => triple.p.value == 'http://mu.semte.ch/vocabularies/core/uuid').o.value;

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
 * The input is the output of queryAndCopySubjects.
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
  else throw `No exact match found for lblodIpdcLpdc:ConceptualPublicService ${conceptUuid}`;
}
