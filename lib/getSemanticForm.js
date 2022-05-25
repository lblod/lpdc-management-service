import { querySudo as query, updateSudo as update } from '@lblod/mu-auth-sudo';
import parseResults from '../utils/parse-results';
import { uuid, sparqlEscapeString, sparqlEscapeDateTime, sparqlEscapeUri } from 'mu';

export async function getSemanticForm(conceptUri) {

  const publicServiceQuery = `
  PREFIX dcat: <http://www.w3.org/ns/dcat#> 
  PREFIX dct: <http://purl.org/dc/terms/> 
  PREFIX mu: <http://mu.semte.ch/vocabularies/core/> 
  PREFIX m8g: <http://data.europa.eu/m8g/> 
  PREFIX lpdc: <http://lblod.data.gift/vocabularies/lpdc-ipdc/> 
  PREFIX ps: <http://vocab.belgif.be/ns/publicservice#>
  PREFIX cspv: <http://purl.org/vocab/cpsv#>
  PREFIX xkos: <http://rdf-vocabulary.ddialliance.org/xkos#>
  PREFIX lpdcExt: <http://mu.semte.ch/vocabularies/lpdcExt/> 

  SELECT 
    ?identifier ?title ?description ?serviceType ?exception ?cost ?language ?competentAuthority ?thematicArea ?targetAudience  
    (GROUP_CONCAT(DISTINCT ?requirement; SEPARATOR = ',')  as ?requirements) 
    (GROUP_CONCAT(DISTINCT ?legalResource; SEPARATOR = ',')  as ?legalResources) 
    (GROUP_CONCAT(DISTINCT ?keyword; SEPARATOR = ',')  as ?keywords) 
  WHERE {
    graph <http://mu.semte.ch/graphs/public> {
      ${sparqlEscapeUri(conceptUri)}  a lpdc:ConceptualPublicService;
      mu:uuid ?uuid;
      dct:identifier ?identifier;
      dct:title ?title;
      dct:description ?description;
      dct:type ?serviceType;
      lpdcExt:exception ?exception;
      cspv:follows ?requirement;
      m8g:hasCost ?cost;
      dct:language ?language;
      m8g:hasLegalResource ?legalResource;
      m8g:hasCompetentAuthority ?competentAuthority;
      dcat:keyword ?keywords;
      m8g:thematicArea ?thematicArea;
      lpdcExt:targetAudience ?targetAudience.
    }
  } GROUP BY ?uuid ?title ?description ?identifier ?targetAudience ?thematicArea ?competentAuthority ?serviceType ?exception ?cost ?language 
  `

  
  const { 
    title, description, serviceType, exception, cost, language, competentAuthority, 
    keywords, thematicArea, targetAudience, requirements, legalResources
  } = parseResults(await query(publicServiceQuery));

  const now = new Date().toISOString();
  const newPublicServiceId = uuid();
  const newPublicServiceUri = `http://data.lblod.info/id/public-services/${newPublicServiceId}`;

  const requirementTriples = requirements.split(',').map(requirement => {
    return sparqlEscapeUri(requirement);
  }).toString();

  const legalResourceTriples = legalResources.split(',').map(legalResource => {
    return sparqlEscapeUri(legalResource);
  }).toString();

  const keywordTriples = keywords.split(',').map(keyword => {
    return sparqlEscapeString(keyword);
  }).toString();

  const newPublicServiceQuery = `
    PREFIX dcat: <http://www.w3.org/ns/dcat#> 
    PREFIX dct: <http://purl.org/dc/terms/> 
    PREFIX mu: <http://mu.semte.ch/vocabularies/core/> 
    PREFIX m8g: <http://data.europa.eu/m8g/> 
    PREFIX lpdc: <http://lblod.data.gift/vocabularies/lpdc-ipdc/> 
    PREFIX ps: <http://vocab.belgif.be/ns/publicservice#>
    PREFIX cspv: <http://purl.org/vocab/cpsv#>
    PREFIX xkos: <http://rdf-vocabulary.ddialliance.org/xkos#>
    PREFIX lpdcExt: <http://mu.semte.ch/vocabularies/lpdcExt/> 

    INSERT DATA {
      GRAPH <http://mu.semte.ch/graphs/public> {
        ${sparqlEscapeUri(newPublicServiceUri)} a <http://purl.org/vocab/cpsv#PublicService>;
        mu:uuid ${sparqlEscapeString(newPublicServiceId)};
        dct:type ${sparqlEscapeUri(serviceType)};
        dct:title ${sparqlEscapeString(title)};
        dct:description ${sparqlEscapeString(description)};
        m8g:hasCost ${sparqlEscapeUri(cost)};
        dct:language ${sparqlEscapeUri(language)};
        m8g:thematicArea ${sparqlEscapeUri(thematicArea)};
        lpdcExt:exception ${sparqlEscapeString(exception)};
        lpdcExt:targetAudience ${sparqlEscapeUri(targetAudience)};
        m8g:hasCompetentAuthority ${sparqlEscapeUri(competentAuthority)};

        dct:created ${sparqlEscapeDateTime(now)};
        dct:modified ${sparqlEscapeDateTime(now)};

        cspv:follows ${requirementTriples};
        m8g:hasLegalResource ${legalResourceTriples};
        dcat:keyword ${keywordTriples}.


        ${sparqlEscapeUri(conceptUri)} dct:source ${sparqlEscapeUri(newPublicServiceUri)} .
      }
    }
  `

  await update(newPublicServiceQuery);

  return {
    uuid: newPublicServiceId, 
    uri: newPublicServiceUri 
  }
}