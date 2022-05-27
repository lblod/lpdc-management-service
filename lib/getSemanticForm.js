import { querySudo as query, updateSudo as update } from '@lblod/mu-auth-sudo';
import { uuid, sparqlEscapeString, sparqlEscapeDateTime, sparqlEscapeUri, sparqlEscape } from 'mu';
import { targetTriples } from '../utils/target-triples';

const replaceList = [
  "http://vocab.belgif.be/ns/publicservice#hasRequirement",
  "http://data.europa.eu/m8g/hasCost"
]

export async function getSemanticForm(conceptId) {

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

        dct:created ${sparqlEscapeDateTime(now)};
        dct:modified ${sparqlEscapeDateTime(now)}.

        ?requirement ?reqPred ?redObj.
        ?cost ?costPred ?costObj.

        ${sparqlEscapeUri(conceptUri)} dct:source ${sparqlEscapeUri(newPublicServiceUri)} .
      }
    FROM <http://mu.semte.ch/graphs/public> 
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
      }
    ` 

  const result = await query(publicServiceQuery)

  const newTriples = targetTriples(result, replaceList);

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
  `
  await update(newPublicServiceQuery);
  
  return {
    uuid: newPublicServiceId,
    uri: newPublicServiceUri
  }
}


function bindingsToNT(bindings) {
  return bindings.map(b => _bindingToNT(b['s'], b['p'], b['o']));
}

function _bindingToNT(s, p, o) {
  const subject = sparqlEscape(s.value, 'uri');
  const predicate = sparqlEscape(p.value, 'uri');
  let obj;
  if (o.type === 'uri') {
    obj = sparqlEscape(o.value, 'uri');
  } else {
    obj = `${sparqlEscape(o.value, 'string')}`;
    if (o.datatype)
      obj += `^^${sparqlEscape(o.datatype, 'uri')}`;
  }
  return `${subject} ${predicate} ${obj} .`;
}