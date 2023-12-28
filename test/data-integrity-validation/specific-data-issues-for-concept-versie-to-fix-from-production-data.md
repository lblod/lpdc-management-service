# case 1: some concept snapshots websites have the a title with the same language (2 times nl, 2 times en)  (not solved)

![case1.png](img%2Fcase1.png)

```
<http://mu.semte.ch/blank#2192c6c3-b88a-4a1e-b97d-85a5cda2ba4d> <http://purl.org/dc/terms/title> "Volmachtformulier"@en .
<http://mu.semte.ch/blank#2192c6c3-b88a-4a1e-b97d-85a5cda2ba4d> <http://purl.org/dc/terms/title> "Volmachtformulier"@nl .
```

=> **still to solve in the data** 
But it seems that these two are the only incorrect ones ...

# case 2: all legal resources are modeled incorrectly. (not solved)

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

# case 3: not all triples seem to be loaded, that are directly linked to a concept versie (solved)

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
  - http://schema.org/dateCreated - ok 
  - http://schema.org/dateModified - ok
  - http://schema.org/identifier - ok
  - http://schema.org/productID - ok
  - http://www.w3.org/ns/prov#generatedAtTime - ok
  - https://productencatalogus.data.vlaanderen.be/ns/ipdc-lpdc#conceptTag - ok
  - https://productencatalogus.data.vlaanderen.be/ns/ipdc-lpdc#snapshotType - ok


# case 4: some enddates cannot be mapped (solved)

```
<https://ipdc.vlaanderen.be/id/conceptsnapshot/0d2a2f5a-7213-483d-9fb9-abe0cbac0348> <http://schema.org/endDate> "2020-12-09T12:00:00Z"^^<http://www.w3.org/2001/XMLSchema#dateTime> .
<https://ipdc.vlaanderen.be/id/conceptsnapshot/19bb6349-0976-4ce5-895a-28a6fd30787a> <http://schema.org/endDate> "2020-12-09T12:00:00Z"^^<http://www.w3.org/2001/XMLSchema#dateTime> .
<https://ipdc.vlaanderen.be/id/conceptsnapshot/202bf7d3-38bf-4910-81e6-f3a18dc46910> <http://schema.org/endDate> "2020-12-09T12:00:00Z"^^<http://www.w3.org/2001/XMLSchema#dateTime> .
```

is caused because the data in the database is exactly `"2020-12-09T12:00:00Z"` ; so no milliseconds specified ... 
=> use FormatPreservingDate to keep exact string format read from the database, but smartly compare taking into account nanos , millis, or none. -. ok


