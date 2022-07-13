const FORM_STATUS_ACTIVE = 'http://data.lblod.info/id/concept/ipdc-thema/27d784f8-e7ea-4f18-88f8-02d427033009';
const FORM_STATUS_STOPPED = 'http://data.lblod.info/id/concept/ipdc-thema/12873bfb-d2cc-4cc5-9255-1bf0ca2747f9';
const FORM_STATUS_CONCEPT = 'http://lblod.data.gift/concepts/79a52da4-f491-4e2f-9374-89a13cde8ecd';
const APPLICATION_GRAPH = 'http://mu.semte.ch/graphs/application';

const FORM_MAPPING = {
  "cd0b5eba-33c1-45d9-aed9-75194c3728d3": "content",
  "149a7247-0294-44a5-a281-0a4d3782b4fd": "characteristics",
  "50592aa9-333f-4b51-af67-e53b4c183a9a": "translation"
};

const PREFIXES = `
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
    PREFIX locn: <http://www.w3.org/ns/locn>`;


export {
  FORM_STATUS_ACTIVE,
  FORM_STATUS_STOPPED,
  FORM_STATUS_CONCEPT,
  APPLICATION_GRAPH,
  FORM_MAPPING,
  PREFIXES
};
