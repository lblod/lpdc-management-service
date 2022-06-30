const FORM_STATUS_ACTIVE = 'http://data.lblod.info/id/concept/ipdc-thema/27d784f8-e7ea-4f18-88f8-02d427033009';
const FORM_STATUS_STOPPED = 'http://data.lblod.info/id/concept/ipdc-thema/12873bfb-d2cc-4cc5-9255-1bf0ca2747f9';
const FORM_STATUS_CONCEPT = 'http://lblod.data.gift/concepts/79a52da4-f491-4e2f-9374-89a13cde8ecd';
const APPLICATION_GRAPH = 'http://mu.semte.ch/graphs/application';

const NESTED_PREDICATES = [
  "http://vocab.belgif.be/ns/publicservice#hasRequirement",
  "http://data.europa.eu/m8g/hasCost",
  "http://purl.org/vocab/cpsv#follows",
  "http://data.europa.eu/m8g/hasContactPoint",
  "http://www.w3.org/2000/01/rdf-schema#seeAlso"
];

const FORM_MAPPING = {
  "cd0b5eba-33c1-45d9-aed9-75194c3728d3": "content",
  "149a7247-0294-44a5-a281-0a4d3782b4fd": "characteristics",
  "50592aa9-333f-4b51-af67-e53b4c183a9a": "translation"
};

export {
  FORM_STATUS_ACTIVE,
  FORM_STATUS_STOPPED,
  FORM_STATUS_CONCEPT,
  APPLICATION_GRAPH,
  NESTED_PREDICATES,
  FORM_MAPPING
};
