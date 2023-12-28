# case 1: some concept snapshots websites have the a title with the same language (2 times nl, 2 times en) 

![case1.png](img%2Fcase1.png)

```
<http://mu.semte.ch/blank#2192c6c3-b88a-4a1e-b97d-85a5cda2ba4d> <http://purl.org/dc/terms/title> "Volmachtformulier"@en .
<http://mu.semte.ch/blank#2192c6c3-b88a-4a1e-b97d-85a5cda2ba4d> <http://purl.org/dc/terms/title> "Volmachtformulier"@nl .
```

=> **still to solve in the data**

# case 2: all legal resources are modeled incorrectly.

![case2.png](img%2Fcase2.png)

multiple entities are pointing to the same legal resource object in the database:
```
<https://ipdc.vlaanderen.be/id/conceptsnapshot/1c2f5cdd-32a0-4aef-b5e6-c91c0e161688> <http://data.europa.eu/m8g/hasLegalResource> <https://codex.vlaanderen.be/Zoeken/Document.aspx?DID=1000016&param=informatie> .
<https://ipdc.vlaanderen.be/id/conceptsnapshot/21824d30-8e83-4a9b-a4ae-1d73ec033e4e> <http://data.europa.eu/m8g/hasLegalResource> <https://codex.vlaanderen.be/Zoeken/Document.aspx?DID=1000016&param=informatie> .

<https://codex.vlaanderen.be/Zoeken/Document.aspx?DID=1000016&param=informatie> <http://www.w3.org/1999/02/22-rdf-syntax-ns#type> <http://data.europa.eu/eli/ontology/#LegalResource> .
<https://codex.vlaanderen.be/Zoeken/Document.aspx?DID=1000016&param=informatie> <http://www.w3.org/ns/shacl#order> "0"^^<http://www.w3.org/2001/XMLSchema#integer> .
<https://codex.vlaanderen.be/Zoeken/Document.aspx?DID=1000016&param=informatie> <http://www.w3.org/ns/shacl#order> "1"^^<http://www.w3.org/2001/XMLSchema#integer> .
```

This is off course not correct ... you see that there are multiple shacl orders linked to that as well ... 

=> **still to solve in the data**
+ we still need to load this in the data

# case 3: not all triples seem to be loaded, that are directly linked to a concept versie

one example is :

```
<https://ipdc.vlaanderen.be/id/conceptsnapshot/00215468-5567-41a0-8e3b-3eb3ef62c33f> <http://data.europa.eu/m8g/thematicArea> <https://productencatalogus.data.vlaanderen.be/id/concept/Thema/WelzijnGezondheid> .
<https://ipdc.vlaanderen.be/id/conceptsnapshot/00215468-5567-41a0-8e3b-3eb3ef62c33f> <http://purl.org/dc/terms/isVersionOf> <https://ipdc.vlaanderen.be/id/concept/cae5e6b4-0b6b-4b3c-8ec6-755313f7fe8a> .
<https://ipdc.vlaanderen.be/id/conceptsnapshot/00215468-5567-41a0-8e3b-3eb3ef62c33f> <http://schema.org/dateCreated> "2022-10-05T13:00:42.074442Z"^^<http://www.w3.org/2001/XMLSchema#dateTime> .
<https://ipdc.vlaanderen.be/id/conceptsnapshot/00215468-5567-41a0-8e3b-3eb3ef62c33f> <http://schema.org/dateModified> "2023-09-12T20:00:20.242928Z"^^<http://www.w3.org/2001/XMLSchema#dateTime> .
<https://ipdc.vlaanderen.be/id/conceptsnapshot/00215468-5567-41a0-8e3b-3eb3ef62c33f> <http://schema.org/identifier> "00215468-5567-41a0-8e3b-3eb3ef62c33f" .
<https://ipdc.vlaanderen.be/id/conceptsnapshot/00215468-5567-41a0-8e3b-3eb3ef62c33f> <http://schema.org/productID> "159" .
<https://ipdc.vlaanderen.be/id/conceptsnapshot/00215468-5567-41a0-8e3b-3eb3ef62c33f> <http://www.w3.org/ns/prov#generatedAtTime> "2023-09-12T20:00:20.564313Z"^^<http://www.w3.org/2001/XMLSchema#dateTime> .
<https://ipdc.vlaanderen.be/id/conceptsnapshot/00215468-5567-41a0-8e3b-3eb3ef62c33f> <https://productencatalogus.data.vlaanderen.be/ns/ipdc-lpdc#competentAuthorityLevel> <https://productencatalogus.data.vlaanderen.be/id/concept/BevoegdBestuursniveau/Federaal> .
<https://ipdc.vlaanderen.be/id/conceptsnapshot/00215468-5567-41a0-8e3b-3eb3ef62c33f> <https://productencatalogus.data.vlaanderen.be/ns/ipdc-lpdc#conceptTag> <https://productencatalogus.data.vlaanderen.be/id/concept/ConceptTag/YourEuropeVerplicht> .
<https://ipdc.vlaanderen.be/id/conceptsnapshot/00215468-5567-41a0-8e3b-3eb3ef62c33f> <https://productencatalogus.data.vlaanderen.be/ns/ipdc-lpdc#executingAuthorityLevel> <https://productencatalogus.data.vlaanderen.be/id/concept/UitvoerendBestuursniveau/Lokaal> .
<https://ipdc.vlaanderen.be/id/conceptsnapshot/00215468-5567-41a0-8e3b-3eb3ef62c33f> <https://productencatalogus.data.vlaanderen.be/ns/ipdc-lpdc#publicationMedium> <https://productencatalogus.data.vlaanderen.be/id/concept/PublicatieKanaal/YourEurope> .
<https://ipdc.vlaanderen.be/id/conceptsnapshot/00215468-5567-41a0-8e3b-3eb3ef62c33f> <https://productencatalogus.data.vlaanderen.be/ns/ipdc-lpdc#snapshotType> <https://productencatalogus.data.vlaanderen.be/id/concept/SnapshotType/Update> .
<https://ipdc.vlaanderen.be/id/conceptsnapshot/00215468-5567-41a0-8e3b-3eb3ef62c33f> <https://productencatalogus.data.vlaanderen.be/ns/ipdc-lpdc#targetAudience> <https://productencatalogus.data.vlaanderen.be/id/concept/Doelgroep/Burger> .
<https://ipdc.vlaanderen.be/id/conceptsnapshot/00215468-5567-41a0-8e3b-3eb3ef62c33f> <https://productencatalogus.data.vlaanderen.be/ns/ipdc-lpdc#yourEuropeCategory> <https://productencatalogus.data.vlaanderen.be/id/concept/YourEuropeCategorie/VerblijfOverlijden> .
```

Running 'Load one concept versie and print quads' on this case gives:

conclusions:
- Thematic area is incorrectly saved as string, should be an iri => solved for all enums ... 
```
    -   "<https://ipdc.vlaanderen.be/id/conceptsnapshot/00215468-5567-41a0-8e3b-3eb3ef62c33f> <http://data.europa.eu/m8g/thematicArea> \"https://productencatalogus.data.vlaanderen.be/id/concept/Thema/WelzijnGezondheid\" .",
    +   "<https://ipdc.vlaanderen.be/id/conceptsnapshot/00215468-5567-41a0-8e3b-3eb3ef62c33f> <http://data.europa.eu/m8g/thematicArea> <https://productencatalogus.data.vlaanderen.be/id/concept/Thema/WelzijnGezondheid> .",
```
- All other fields are not mapped yet ; we should map them all.
  - http://purl.org/dc/terms/isVersionOf - ok
  - http://schema.org/dateCreated - ok (but only millisecond accuracy in javascript, no nanoseconds accuracy)
  - http://schema.org/dateModified - ok (but only millisecond accuracy in javascript, no nanoseconds accuracy
  - http://schema.org/identifier
  - http://schema.org/productID
  - http://www.w3.org/ns/prov#generatedAtTime
  - https://productencatalogus.data.vlaanderen.be/ns/ipdc-lpdc#conceptTag
  - https://productencatalogus.data.vlaanderen.be/ns/ipdc-lpdc#snapshotType