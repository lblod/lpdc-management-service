import {Namespace} from "rdflib";

const conceptNS = Namespace('https://productencatalogus.data.vlaanderen.be/id/concept/');

export const NS = {
    schema: Namespace('http://schema.org/'),
    dct: Namespace('http://purl.org/dc/terms/'),
    rdf: Namespace('http://www.w3.org/1999/02/22-rdf-syntax-ns#'),
    lpdcExt: Namespace('https://productencatalogus.data.vlaanderen.be/ns/ipdc-lpdc#'),
    m8g: Namespace('http://data.europa.eu/m8g/'),
    dcat: Namespace('http://www.w3.org/ns/dcat#'),
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
    concept: {
        type: Namespace(conceptNS('Type/').value),
        doelgroep: Namespace(conceptNS('Doelgroep/').value),
        thema: Namespace(conceptNS('Thema/').value),
        bevoegdBestuursniveau: Namespace(conceptNS('BevoegdBestuursniveau/').value),
        uitvoerendBestuursniveau: Namespace(conceptNS('UitvoerendBestuursniveau/').value),
        publicatieKanaal: Namespace(conceptNS('PublicatieKanaal/').value),
        yourEuropeCategorie: Namespace(conceptNS('YourEuropeCategorie/').value),
        snapshotType: Namespace(conceptNS('SnapshotType/').value),
        conceptTag: Namespace(conceptNS('ConceptTag/').value),
    },
    concepts: Namespace('http://lblod.data.gift/concepts/'),

};