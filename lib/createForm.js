import { querySudo } from '@lblod/mu-auth-sudo';
import { sparqlEscapeString, sparqlEscapeDateTime, sparqlEscapeUri, update } from 'mu';
import { APPLICATION_GRAPH, FORM_STATUS_CONCEPT, NESTED_PREDICATES } from '../config';
import { bindingsToNT } from '../utils/bindingsToNT';
import { targetTriples } from '../utils/target-triples';
import { v4 as uuid } from 'uuid';


export async function createForm(conceptId) {
  const now = new Date().toISOString();
  const conceptUri = `http://data.lblod.info/id/public-services/${conceptId}`;
  const newPublicServiceId = uuid();
  const newPublicServiceUri = `http://data.lblod.info/id/public-services/${newPublicServiceId}`;

  const publicServiceQuery = `
    PREFIX rdf:	<http://www.w3.org/1999/02/22-rdf-syntax-ns#> 
    PREFIX ns1:	<http://data.lblod.info/vocabularies/lpdc-ipdc/> 
    PREFIX skos:	<http://www.w3.org/2004/02/skos/core#> 
    PREFIX mu:	<http://mu.semte.ch/vocabularies/core/> 
    PREFIX cpsv:	<http://purl.org/vocab/cpsv#> 
    PREFIX dct:	<http://purl.org/dc/terms/> 
    PREFIX lpdcExt:	<http://lblod.data.gift/vocabularies/lpdc-ipdc/> 
    PREFIX xkos:	<http://rdf-vocabulary.ddialliance.org/xkos#> 
    PREFIX m8g:	<http://data.europa.eu/m8g/> 
    PREFIX lblodLpdc:	<http://data.lblod.info/id/public-services/> 
    PREFIX lblodIpdcLpdc:	<http://lblod.data.gift/vocabularies/lpdc-ipdc/> 
    PREFIX dcat:	<http://www.w3.org/ns/dcat#> 
    PREFIX lang:	<http://publications.europa.eu/resource/authority/language/> 
    PREFIX lblodOrg:	<http://data.lblod.info/id/concept/organisatie/> 
    PREFIX lblodIpdcThema:	<http://data.lblod.info/id/concept/ipdc-thema/> 
    PREFIX belgif:	<http://vocab.belgif.be/ns/publicservice#> 
    PREFIX foaf: <http://xmlns.com/foaf/0.1/>
    PREFIX schema: <http://schema.org/>
    PREFIX adms: <http://www.w3.org/ns/adms#>
    PREFIX skos: <http://www.w3.org/2004/02/skos/core#> 
    PREFIX ps: <http://vocab.belgif.be/ns/publicservice#> 
    
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

        ?requirement ?reqPred ?redObj.
        ?cost ?costPred ?costObj.
        ?rule ?rulePred ?ruleObj.

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

        ?requirement ?reqPred ?redObj.
        ?cost ?costPred ?costObj.
        ?rule ?rulePred ?ruleObj.
      }
    `; 

  const result = await querySudo(publicServiceQuery);
  const newTriples = targetTriples(result, NESTED_PREDICATES);

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
        ${bindingsToNT(newTriples.results.bindings).join("\r\n")}
      }
    }
  `;
  await update(newPublicServiceQuery);

  return {
    uuid: newPublicServiceId,
    uri: newPublicServiceUri
  };
}