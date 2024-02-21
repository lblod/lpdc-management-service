import {FormType} from "./src/core/domain/types";

const APPLICATION_GRAPH = process.env.MU_APPLICATION_GRAPH;

const PUBLIC_GRAPH = 'http://mu.semte.ch/graphs/public';
const CONCEPT_SNAPSHOT_LDES_GRAPH = 'http://mu.semte.ch/graphs/lpdc/conceptsnapshots-ldes-data/ipdc';
const CONCEPT_GRAPH = 'http://mu.semte.ch/graphs/public';

const USER_SESSIONS_GRAPH = 'http://mu.semte.ch/graphs/sessions';

const QUEUE_POLL_INTERVAL = Number(process.env.QUEUE_POLL_INTERVAL) || 60000; //1min
const LOG_INCOMING_DELTA = process.env.LOG_INCOMING_DELTA == 'true' || false;
const ADRESSEN_REGISTER_API_KEY = process.env.ADRESSEN_REGISTER_API_KEY;

const ENABLE_ADDRESS_VALIDATION = (process.env.ENABLE_ADDRESS_VALIDATION ?? 'true') == 'true';

const INSTANCE_SNAPSHOT_PROCESSING_CRON_PATTERN = process.env.INSTANCE_SNAPSHOT_PROCESSING_CRON_PATTERN || "*/1 * * * *"; //or every minute

const FORM_ID_TO_TYPE_MAPPING = {
    "cd0b5eba-33c1-45d9-aed9-75194c3728d3": FormType.CONTENT,
    "149a7247-0294-44a5-a281-0a4d3782b4fd": FormType.CHARACTERISTICS,
};

const FORM_MAPPING_TRANSLATIONS = {
    "cd0b5eba-33c1-45d9-aed9-75194c3728d3": "inhoud",
    "149a7247-0294-44a5-a281-0a4d3782b4fd": "eigenschappen",
};

//TODO LPDC-894: use PREFIX object, and generate this list from it (make sure to add all needed to PREFIX)
const PREFIXES = `
  PREFIX rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#>
  PREFIX ns1: <http://data.lblod.info/vocabularies/lpdc-ipdc/>
  PREFIX skos: <http://www.w3.org/2004/02/skos/core#>
  PREFIX mu: <http://mu.semte.ch/vocabularies/core/>
  PREFIX pera: <http://publications.europa.eu/resource/authority/>
  PREFIX cpsv: <http://purl.org/vocab/cpsv#>
  PREFIX dct: <http://purl.org/dc/terms/>
  PREFIX lpdcExt: <https://productencatalogus.data.vlaanderen.be/ns/ipdc-lpdc#>
  PREFIX xkos: <http://rdf-vocabulary.ddialliance.org/xkos#>
  PREFIX m8g: <http://data.europa.eu/m8g/>
  PREFIX lblodLpdc: <http://data.lblod.info/id/public-services/>
  PREFIX lblodIpdcLpdc: <http://lblod.data.gift/vocabularies/lpdc-ipdc/>
  PREFIX dcat: <http://www.w3.org/ns/dcat#>
  PREFIX lang: <http://publications.europa.eu/resource/authority/language/>
  PREFIX lblodOrg: <http://data.lblod.info/id/concept/organisatie/>
  PREFIX lblodIpdcThema: <http://data.lblod.info/id/concept/ipdc-thema/>
  PREFIX belgif: <http://vocab.belgif.be/ns/publicservice#>
  PREFIX foaf: <http://xmlns.com/foaf/0.1/>
  PREFIX schema: <http://schema.org/>
  PREFIX adms: <http://www.w3.org/ns/adms#>
  PREFIX skos: <http://www.w3.org/2004/02/skos/core#>
  PREFIX ps: <http://vocab.belgif.be/ns/publicservice#>
  PREFIX locn: <http://www.w3.org/ns/locn#>
  PREFIX dvcs: <https://productencatalogus.data.vlaanderen.be/id/conceptscheme/>
  PREFIX eli: <http://data.europa.eu/eli/ontology#>
  PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#>
  PREFIX ext: <http://mu.semte.ch/vocabularies/ext/>
  PREFIX besluit: <http://data.vlaanderen.be/ns/besluit#>
  PREFIX pav: <http://purl.org/pav/>
  PREFIX adres: <https://data.vlaanderen.be/ns/adres#>
  PREFIX xsd:  <http://www.w3.org/2001/XMLSchema#>
  PREFIX as: <https://www.w3.org/ns/activitystreams#>
  PREFIX sh: <http://www.w3.org/ns/shacl#>
`;

const PREFIX = {
    rdf: 'PREFIX rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#>',
    ns1: 'PREFIX ns1: <http://data.lblod.info/vocabularies/lpdc-ipdc/>',
    skos: 'PREFIX skos: <http://www.w3.org/2004/02/skos/core#>',
    mu: 'PREFIX mu: <http://mu.semte.ch/vocabularies/core/>',
    pera: 'PREFIX pera: <http://publications.europa.eu/resource/authority/>',
    cpsv: 'PREFIX cpsv: <http://purl.org/vocab/cpsv#>',
    dct: 'PREFIX dct: <http://purl.org/dc/terms/>',
    lpdcExt: 'PREFIX lpdcExt: <https://productencatalogus.data.vlaanderen.be/ns/ipdc-lpdc#>',
    xkos: 'PREFIX xkos: <http://rdf-vocabulary.ddialliance.org/xkos#>',
    m8g: 'PREFIX m8g: <http://data.europa.eu/m8g/>',
    lblodLpdc: 'PREFIX lblodLpdc: <http://data.lblod.info/id/public-services/>',
    lblodIpdcLpdc: 'PREFIX lblodIpdcLpdc: <http://lblod.data.gift/vocabularies/lpdc-ipdc/>',
    dcat: 'PREFIX dcat: <http://www.w3.org/ns/dcat#>',
    lang: 'PREFIX lang: <http://publications.europa.eu/resource/authority/language/>',
    lblodOrg: 'PREFIX lblodOrg: <http://data.lblod.info/id/concept/organisatie/>',
    lblodIpdcThema: 'PREFIX lblodIpdcThema: <http://data.lblod.info/id/concept/ipdc-thema/>',
    belgif: 'PREFIX belgif: <http://vocab.belgif.be/ns/publicservice#>',
    foaf: 'PREFIX foaf: <http://xmlns.com/foaf/0.1/>',
    schema: 'PREFIX schema: <http://schema.org/>',
    adms: 'PREFIX adms: <http://www.w3.org/ns/adms#>',
    ps: 'PREFIX ps: <http://vocab.belgif.be/ns/publicservice#>',
    locn: 'PREFIX locn: <http://www.w3.org/ns/locn#>',
    dvcs: 'PREFIX dvcs: <https://productencatalogus.data.vlaanderen.be/id/conceptscheme/>',
    eli: 'PREFIX eli: <http://data.europa.eu/eli/ontology#>',
    rdfs: 'PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#>',
    ext: 'PREFIX ext: <http://mu.semte.ch/vocabularies/ext/>',
    besluit: 'PREFIX besluit: <http://data.vlaanderen.be/ns/besluit#>',
    pav: 'PREFIX pav: <http://purl.org/pav/>',
    adres: 'PREFIX adres: <https://data.vlaanderen.be/ns/adres#>',
    xsd: 'PREFIX xsd:  <http://www.w3.org/2001/XMLSchema#>',
    as: 'PREFIX as: <https://www.w3.org/ns/activitystreams#>',
    sh: 'PREFIX sh: <http://www.w3.org/ns/shacl#>',
    ex: 'PREFIX ex: <http://example.com/ns#>',
};

export {
    LOG_INCOMING_DELTA,
    QUEUE_POLL_INTERVAL,
    CONCEPT_GRAPH,
    PUBLIC_GRAPH,
    CONCEPT_SNAPSHOT_LDES_GRAPH,
    APPLICATION_GRAPH,
    USER_SESSIONS_GRAPH,
    FORM_ID_TO_TYPE_MAPPING,
    FORM_MAPPING_TRANSLATIONS,
    PREFIXES,
    PREFIX,
    ADRESSEN_REGISTER_API_KEY,
    ENABLE_ADDRESS_VALIDATION,
    INSTANCE_SNAPSHOT_PROCESSING_CRON_PATTERN
};
