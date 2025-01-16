const PUBLIC_GRAPH = "http://mu.semte.ch/graphs/public";

const CONCEPT_SNAPSHOT_LDES_GRAPH =
  "http://mu.semte.ch/graphs/lpdc/conceptsnapshots-ldes-data/ipdc";

const INSTANCE_SNAPHOT_LDES_GRAPH = (suffix: string = ""): string =>
  `http://mu.semte.ch/graphs/lpdc/instancesnapshots-ldes-data/${suffix}`;
const INSTANCE_SNAPHOT_LDES_AUTHORIZATION_GRAPH =
  INSTANCE_SNAPHOT_LDES_GRAPH("authorization");

const CONCEPT_GRAPH = "http://mu.semte.ch/graphs/public";

const USER_SESSIONS_GRAPH = "http://mu.semte.ch/graphs/sessions";

const ADRESSEN_REGISTER_API_KEY = process.env.ADRESSEN_REGISTER_API_KEY;
const ENABLE_ADDRESS_VALIDATION =
  (process.env.ENABLE_ADDRESS_VALIDATION ?? "true") == "true";

const INSTANCE_SNAPSHOT_PROCESSING_CRON_PATTERN =
  process.env.INSTANCE_SNAPSHOT_PROCESSING_CRON_PATTERN || "*/1 * * * *"; //or every minute
const CONCEPT_SNAPSHOT_PROCESSING_CRON_PATTERN =
  process.env.CONCEPT_SNAPSHOT_PROCESSING_CRON_PATTERN || "*/1 * * * *"; //or every minute

const IPDC_API_ENDPOINT = process.env.IPDC_API_ENDPOINT;
const IPDC_API_KEY = process.env.IPDC_API_KEY;

const PREFIX = {
  rdf: "PREFIX rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#>",
  skos: "PREFIX skos: <http://www.w3.org/2004/02/skos/core#>",
  mu: "PREFIX mu: <http://mu.semte.ch/vocabularies/core/>",
  pera: "PREFIX pera: <http://publications.europa.eu/resource/authority/>",
  cpsv: "PREFIX cpsv: <http://purl.org/vocab/cpsv#>",
  dct: "PREFIX dct: <http://purl.org/dc/terms/>",
  lpdcExt:
    "PREFIX lpdcExt: <https://productencatalogus.data.vlaanderen.be/ns/ipdc-lpdc#>",
  lpdc: "PREFIX lpdc: <http://data.lblod.info/vocabularies/lpdc/>",
  xkos: "PREFIX xkos: <http://rdf-vocabulary.ddialliance.org/xkos#>",
  m8g: "PREFIX m8g: <http://data.europa.eu/m8g/>",
  lblodLpdc: "PREFIX lblodLpdc: <http://data.lblod.info/id/public-services/>",
  lblodIpdcLpdc:
    "PREFIX lblodIpdcLpdc: <http://lblod.data.gift/vocabularies/lpdc-ipdc/>",
  dcat: "PREFIX dcat: <http://www.w3.org/ns/dcat#>",
  lblodOrg: "PREFIX lblodOrg: <http://data.lblod.info/id/concept/organisatie/>",
  lblodIpdcThema:
    "PREFIX lblodIpdcThema: <http://data.lblod.info/id/concept/ipdc-thema/>",
  belgif: "PREFIX belgif: <http://vocab.belgif.be/ns/publicservice#>",
  foaf: "PREFIX foaf: <http://xmlns.com/foaf/0.1/>",
  schema: "PREFIX schema: <http://schema.org/>",
  adms: "PREFIX adms: <http://www.w3.org/ns/adms#>",
  ps: "PREFIX ps: <http://vocab.belgif.be/ns/publicservice#>",
  locn: "PREFIX locn: <http://www.w3.org/ns/locn#>",
  dvcs: "PREFIX dvcs: <https://productencatalogus.data.vlaanderen.be/id/conceptscheme/>",
  eli: "PREFIX eli: <http://data.europa.eu/eli/ontology#>",
  rdfs: "PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#>",
  ext: "PREFIX ext: <http://mu.semte.ch/vocabularies/ext/>",
  besluit: "PREFIX besluit: <http://data.vlaanderen.be/ns/besluit#>",
  pav: "PREFIX pav: <http://purl.org/pav/>",
  adres: "PREFIX adres: <https://data.vlaanderen.be/ns/adres#>",
  xsd: "PREFIX xsd:  <http://www.w3.org/2001/XMLSchema#>",
  as: "PREFIX as: <https://www.w3.org/ns/activitystreams#>",
  sh: "PREFIX sh: <http://www.w3.org/ns/shacl#>",
  ex: "PREFIX ex: <http://example.com/ns#>",
  nutss: "PREFIX nutss: <http://data.europa.eu/nuts/scheme/>",
  prov: "PREFIX prov: <http://www.w3.org/ns/prov#>",
};

export {
  CONCEPT_GRAPH,
  PUBLIC_GRAPH,
  CONCEPT_SNAPSHOT_LDES_GRAPH,
  CONCEPT_SNAPSHOT_PROCESSING_CRON_PATTERN,
  INSTANCE_SNAPHOT_LDES_GRAPH,
  INSTANCE_SNAPHOT_LDES_AUTHORIZATION_GRAPH,
  USER_SESSIONS_GRAPH,
  PREFIX,
  ADRESSEN_REGISTER_API_KEY,
  ENABLE_ADDRESS_VALIDATION,
  INSTANCE_SNAPSHOT_PROCESSING_CRON_PATTERN,
  IPDC_API_ENDPOINT,
  IPDC_API_KEY,
};
