import {Namespace} from "rdflib";

const dataVlaanderenConceptNS = Namespace('https://productencatalogus.data.vlaanderen.be/id/concept/');
const lblodConceptsNS = Namespace('http://lblod.data.gift/concepts/');

export const NS = {
    schema: Namespace('http://schema.org/'),
    dct: Namespace('http://purl.org/dc/terms/'),
    rdf: Namespace('http://www.w3.org/1999/02/22-rdf-syntax-ns#'),
    lpdcExt: Namespace('https://productencatalogus.data.vlaanderen.be/ns/ipdc-lpdc#'),
    m8g: Namespace('http://data.europa.eu/m8g/'),
    dcat: Namespace('http://www.w3.org/ns/dcat#'),
    pav: Namespace('http://purl.org/pav/'),
    sh: Namespace('http://www.w3.org/ns/shacl#'),
    cpsv: Namespace('http://purl.org/vocab/cpsv#'),
    rdfs: Namespace('http://www.w3.org/2000/01/rdf-schema#'),
    ps: Namespace('http://vocab.belgif.be/ns/publicservice#'),
    xsd: Namespace('http://www.w3.org/2001/XMLSchema#'),
    prov: Namespace('http://www.w3.org/ns/prov#'),
    ex: Namespace('http://example.com/ns#'),
    skos: Namespace('http://www.w3.org/2004/02/skos/core#'),
    besluit: Namespace('http://data.vlaanderen.be/ns/besluit#'),
    adms: Namespace('http://www.w3.org/ns/adms#'),
    mu: Namespace('http://mu.semte.ch/vocabularies/core/'),
    ext: Namespace('http://mu.semte.ch/vocabularies/ext/'),
    eli: Namespace('http://data.europa.eu/eli/ontology#'),
    eliIncorrectlyInDatabase: Namespace('http://data.europa.eu/eli/ontology/#'), //we need a clean up in ipdc and in our database to be able remove this hack ...
    dvc: {
        type: Namespace(dataVlaanderenConceptNS('Type/').value),
        doelgroep: Namespace(dataVlaanderenConceptNS('Doelgroep/').value),
        thema: Namespace(dataVlaanderenConceptNS('Thema/').value),
        bevoegdBestuursniveau: Namespace(dataVlaanderenConceptNS('BevoegdBestuursniveau/').value),
        uitvoerendBestuursniveau: Namespace(dataVlaanderenConceptNS('UitvoerendBestuursniveau/').value),
        publicatieKanaal: Namespace(dataVlaanderenConceptNS('PublicatieKanaal/').value),
        yourEuropeCategorie: Namespace(dataVlaanderenConceptNS('YourEuropeCategorie/').value),
        snapshotType: Namespace(dataVlaanderenConceptNS('SnapshotType/').value),
        conceptTag: Namespace(dataVlaanderenConceptNS('ConceptTag/').value),
    },
    dvcs: Namespace('https://productencatalogus.data.vlaanderen.be/id/conceptscheme/'),
    concepts: {
        identity: lblodConceptsNS,
        instanceStatus: Namespace(lblodConceptsNS('instance-status/').value),
    },
};