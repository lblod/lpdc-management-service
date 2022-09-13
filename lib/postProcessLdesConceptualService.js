import { querySudo, updateSudo } from '@lblod/mu-auth-sudo';
import { sparqlEscapeString, sparqlEscapeUri } from 'mu';
import { CONCEPTUAL_SERVICE_GRAPH, PREFIXES } from '../config';
import { v4 as uuid } from 'uuid';
import { flatten } from 'lodash';

export async function processLdesDelta(delta) {
  let versionedServices = flatten(delta.map(changeSet => changeSet.inserts));
  versionedServices = versionedServices.filter(t => t?.subject?.value
                                              && t?.predicate.value == 'http://purl.org/dc/terms/isVersionOf');

  const toProcess = [];

  for(const entry of versionedServices) {
    if(await isConceptualPublicService(entry.subject.value, entry.object.value)) {
      toProcess.push(entry);
    }
  }

  for(const entry of toProcess) {
    try {
      await updateNewLdesVersion(entry.subject.value, entry.object.value);
    } catch (e) {
      console.error(`Error processing: ${JSON.stringify(entry)}`);
      console.error(e);
    }
  }
}

async function isConceptualPublicService(vService, service) {
  //TODO: once IPDC fixes their data, only ask for lpdcExt:ConceptualPublicService
  const queryStr = `
    ${PREFIXES}
    ASK {
     VALUES ?type {
       cpsv:PublicService
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

async function updateNewLdesVersion( versionedService, conceptualService ) {
  let serviceId = (await querySudo(`
    ${PREFIXES}

    SELECT DISTINCT ?uuid
    WHERE {
      BIND( ${sparqlEscapeUri(conceptualService)} as ?service)
      ?service a lpdcExt:ConceptualPublicService;
        mu:uuid ?uuid.
    }
    LIMIT 1
  `)).results.bindings[0]?.uuid?.value;

  if(serviceId) {
    await removeConceptualService(serviceId);
  }
  else {
    serviceId = uuid();
  }
  await updateConceptualService( versionedService, conceptualService, serviceId );

}

async function removeConceptualService( serviceId ) {
  //TODO: a bit too agressive
  //TODO: probably we can make this more generic (i.e. with deleteForm)
  //TODO: for all related resources, currently we delete everything.
  //      IPDC has no intention of versioning the related resources
  const deleteQuery = `
    ${PREFIXES}

    DELETE {
       GRAPH ${sparqlEscapeUri(CONCEPTUAL_SERVICE_GRAPH)} {
         ?s ?p ?o.
       }
    }
    WHERE {
      BIND( ${sparqlEscapeString(serviceId)} as ?uuid)
      {
        ?s a lpdcExt:ConceptualPublicService;
          mu:uuid ?uuid ;
          ?p ?o.
      }
      UNION {
        ?service a lpdcExt:ConceptualPublicService;
          mu:uuid ?uuid;
          belgif:hasRequirement ?requirement.

        ?requirement a m8g:Requirement;
          m8g:hasSupportingEvidence ?s.

        ?s a m8g:Evidence;
          ?p ?o.
      }
      UNION {
        ?service a lpdcExt:ConceptualPublicService;
          mu:uuid ?uuid;
          belgif:hasRequirement ?s.

        ?s a m8g:Requirement;
          ?p ?o.
      }
      UNION {
        ?service a lpdcExt:ConceptualPublicService;
          mu:uuid ?uuid;
          cpsv:follows ?rule.

        ?rule a cpsv:Rule;
          lpdcExt:hasWebsite ?s.

        ?s a schema:Website;
          ?p ?o.
      }
      UNION {
        ?service a lpdcExt:ConceptualPublicService;
          mu:uuid ?uuid;
          cpsv:follows ?s.

        ?s a cpsv:Rule;
          ?p ?o.
      }
      UNION {
        ?service a lpdcExt:ConceptualPublicService;
          mu:uuid ?uuid;
          m8g:hasCost ?s.

         ?s a m8g:Cost;
          ?p ?o.
      }
      UNION {
        ?service a lpdcExt:ConceptualPublicService;
          mu:uuid ?uuid;
          cpsv:produces ?s.

         ?s a lpdcExt:FinancialAdvantage;
          ?p ?o.
      }
      UNION {
        ?service a lpdcExt:ConceptualPublicService;
          mu:uuid ?uuid;
          m8g:hasContactPoint ?s.

         ?s a schema:ContactPoint;
          ?p ?o.
      }
      UNION {
        ?service a lpdcExt:ConceptualPublicService;
          mu:uuid ?uuid;
          lpdcExt:hasAttachment ?s.

         ?s a foaf:Document;
          ?p ?o.
      }
      UNION {
        ?service a lpdcExt:ConceptualPublicService;
          mu:uuid ?uuid;
          rdfs:seeAlso ?s.

        ?s a schema:Website;
          ?p ?o.
      }
    }
    `;
  await updateSudo(deleteQuery);
}

async function updateConceptualService( versionedServiceUri, serviceUri, serviceId ) {
  //TODO: make import more restrictive (do not trust external data)
  const queryInsert = `
  ${PREFIXES}
  INSERT {
   GRAPH ${sparqlEscapeUri(CONCEPTUAL_SERVICE_GRAPH)} {
     ?serviceUri a lpdcExt:ConceptualPublicService;
       mu:uuid ${sparqlEscapeString(serviceId)}.

      ?service lpdcExt:yourEuropeCategory ?eucategory.
      ?service lpdcExt:publicationMedium ?medium.
      ?service lpdcExt:hasExecutingAuthority ?executingAuthority.
      ?service lpdcExt:executingAuthorityLevel ?executingAuthorityLevel.
      ?service lpdcExt:competentAuthorityLevel ?competentAuthorityLevel.
      ?service dct:description ?description.
      ?service schema:endDate ?end.
      ?service lpdcExt:exception ?exception.

      ?service cpsv:follows ?rule.
      ?rule a cpsv:Rule;
        mu:uuid ${sparqlEscapeString(uuid())}.
      ?rule ?ruleP ?ruleO.

      ?ruleWeb a schema:Website;
        mu:uuid ${sparqlEscapeString(uuid())}.
      ?ruleWeb ?ruleWebP ?ruleWebO.

      ?service lpdcExt:hasAttachment ?attachment.
      ?attachment a foaf:Document;
        mu:uuid ${sparqlEscapeString(uuid())}.
      ?attachment ?attachmentP ?attachmentO.

      ?service m8g:hasCompetentAuthority ?competentAuthority.

      ?service m8g:hasContactPoint ?contactpoint.
      ?contactpoint a schema:ContactPoint;
        mu:uuid ${sparqlEscapeString(uuid())}.
      ?contactpoint ?contactpointP ?contactpointO.

      ?service m8g:hasCost ?cost.
      ?cost a m8g:Cost;
        mu:uuid ${sparqlEscapeString(uuid())}.
      ?cost ?costP ?costO.

      ?service m8g:hasLegalResource ?legalResource.
      ?legalResource a eli:LegalResource;
        mu:uuid ${sparqlEscapeString(uuid())}.
      ?legalResource ?legalResourceP ?legalResourceO.

      ?service rdfs:seeAlso ?moreInfo.
      ?moreinfo a schema:Website;
        mu:uuid ${sparqlEscapeString(uuid())}.
      ?moreInfo ?moreInfoP ?moreInfoO.

      ?service belgif:hasRequirement ?requirement.
      ?requirement a m8g:Requirement;
        mu:uuid ${sparqlEscapeString(uuid())}.
      ?requirement ?requirementP ?requirementO.

      ?requirement m8g:hasSupportingEvidence ?evidence.
      ?evicence a m8g:Evidence;
        mu:uuid ${sparqlEscapeString(uuid())}.
      ?evidence ?evidenceP ?evidenceO.

      ?service dcat:keyword ?keywords.
      ?service dct:language ?language.
      ?service dct:title ?title.

      ?service cpsv:produces ?financialAdvantage.
      ?financialAdvantage a lpdcExt:FinancialAdvantage;
        mu:uuid ${sparqlEscapeString(uuid())}.
      ?financialAdvantage ?financialAdvantageP  ?financialAdvantageO.

      ?service lpdcExt:regulation ?regulation.
      ?service dct:spatial ?spatial.
      ?service schema:startDate ?start.
      ?service lpdcExt:targetAudience ?targetAudience.
      ?service m8g:thematicArea ?thematicArea.
      ?service dct:type ?type.
      ?service lpdcExt:conceptTag ?conTag.

   }
  }
  WHERE {
   BIND(${sparqlEscapeUri(versionedServiceUri)} as ?vService)
   BIND(${sparqlEscapeUri(serviceUri)} as ?service)

   ?vService <http://purl.org/dc/terms/isVersionOf> ?serviceUri.

   OPTIONAL{
     ?vService lpdcExt:yourEuropeCategory ?eucategory.
     ?eucategory skos:inScheme dvcs:YourEuropeCategorie.
   }
   OPTIONAL{
    ?vService lpdcExt:publicationMedium ?medium.
    ?medium skos:inScheme dvcs:PublicatieKanaal.
   }
   OPTIONAL{
    ?vService lpdcExt:hasExecutingAuthority ?executingAuthority.
    ?executingAuthority skos:inScheme dvcs:IPDCOrganisaties.
   }
   OPTIONAL{
    ?vService lpdcExt:executingAuthorityLevel ?executingAuthorityLevel.
    ?executingAuthorityLevel skos:inScheme dvcs:UitvoerendBestuursniveau.
   }
   OPTIONAL{
    ?vService lpdcExt:competentAuthorityLevel ?competentAuthorityLevel.
    ?competentAuthorityLevel skos:inScheme dvcs:BevoegdBestuursniveau.
   }
   OPTIONAL{
    ?vService dct:description ?description.
   }
   OPTIONAL{
    ?vService schema:endDate ?end.
    FILTER(DATATYPE(?end) = xsd:dateTime)
   }
   OPTIONAL{
    ?vService lpdcExt:exception ?exception.
   }
   OPTIONAL{
    ?vService cpsv:follows ?rule.
    ?rule ?ruleP ?ruleO.

    OPTIONAL {
     ?rule lpdcExt:hasWebsite ?ruleWeb.
     ?ruleWeb ?ruleWebP ?ruleWebO.
    }
   }
   OPTIONAL{
    ?vService lpdcExt:hasAttachment ?attachment.
    ?attachment ?attachmentP ?attachmentO.
   }
   OPTIONAL{
    ?vService m8g:hasCompetentAuthority ?competentAuthority.
    ?competentAuthority skos:inScheme dvcs:IPDCOrganisaties.
   }
   OPTIONAL{
    ?vService m8g:hasContactPoint ?contactpoint.
    ?contactpoint ?contactpointP ?contactpointO.
   }
   OPTIONAL{
    ?vService m8g:hasCost ?cost.
    ?cost ?costP ?costO.
   }
   OPTIONAL{
    ?vService m8g:hasLegalResource ?legalResource.
    ?legalResource ?legalResourceP ?legalResourceO.
   }
   OPTIONAL{
    ?vService rdfs:seeAlso ?moreInfo.
    ?moreInfo ?moreInfoP ?moreInfoO.
   }
   OPTIONAL{
    ?vService belgif:hasRequirement ?requirement.
    ?requirement ?requirementP ?requirementO.

    OPTIONAL {
     ?requirement m8g:hasSupportingEvidence ?evidence.
     ?evidence ?evidenceP ?evidenceO.
    }
   }
   OPTIONAL{
    ?vService dcat:keyword ?keywords.
   }
   OPTIONAL{
    ?vService dct:language ?language.
    ?language skos:inScheme dvcs:Taal.
   }
   OPTIONAL{
    ?vService dct:title ?title.
   }
   OPTIONAL{
    ?vService cpsv:produces ?financialAdvantage.
    ?financialAdvantage ?financialAdvantageP  ?financialAdvantageO.
   }
   OPTIONAL{
    ?vService lpdcExt:regulation ?regulation.
   }
   OPTIONAL{
    ?vService dct:spatial ?spatial.
    ?spatial skos:inScheme <http://lblod.data.gift/vocabularies/lpdc-ipdc/IPDCLocaties>.
   }
   OPTIONAL{
    ?vService schema:startDate ?start.
    FILTER(DATATYPE(?start) = xsd:dateTime)
   }
   OPTIONAL{
    ?vService lpdcExt:targetAudience ?targetAudience.
    ?targetAudience skos:inScheme dvcs:Doelgroep.
   }
   OPTIONAL{
    ?vService m8g:thematicArea ?thematicArea.
    ?thematicArea skos:inScheme dvcs:Thema.
   }
   OPTIONAL{
    ?vService dct:type ?type.
    ?type skos:inScheme dvcs:Type.
   }
   OPTIONAL {
     ?vService lpdcExt:conceptTag ?conTag.
     ?conTag skos:inScheme dvcs:ConceptTag.
   }
  }
  `;

  await updateSudo(queryInsert);
}
