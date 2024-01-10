# case 1: some concept snapshots websites have a title with the same language (2 times nl, 2 times en)  (not solved)

![case1.png](img%2Fcase1.png)

```
<http://mu.semte.ch/blank#2192c6c3-b88a-4a1e-b97d-85a5cda2ba4d> <http://purl.org/dc/terms/title> "Volmachtformulier"@en .
<http://mu.semte.ch/blank#2192c6c3-b88a-4a1e-b97d-85a5cda2ba4d> <http://purl.org/dc/terms/title> "Volmachtformulier"@nl .
```

All of them occur in the ldes-data-graph; 
this website is referenced by http://mu.semte.ch/blank#9fb6164b-c967-4d77-bacd-cbaf86bb4d13 ; which is a http://purl.org/vocab/cpsv#Rule.
which is referenced by 	https://ipdc.vlaanderen.be/id/conceptsnapshot/635cfaf2-5de5-488b-82a5-3c16cd8cb2d1; which is a 	
https://productencatalogus.data.vlaanderen.be/ns/ipdc-lpdc#ConceptualPublicService . 

Verified in original data: 

```json
"procedures": [
    {
      "naam": {
        "en": "Procedure",
        "nl": "Procedure"
      },
      "beschrijving": {
        "en": "<p>First, you must fill in a <strong>proxy vote application form</strong>. You can download this form on the Verkiezingen.fgov.be website or request it free of charge from your local council.</p>\n\n<p>You must then give the completed proxy vote application form and the necessary documents in good time to a person entitled to vote who will vote on your behalf, i.e. the <strong>proxy</strong>.</p>\n\n<p>On election day, the proxy goes to the <strong>polling station stated on your polling card </strong>with the proxy vote form and the necessary documents.</p>\n\n<p>If you have not yet provided proof of absence during the voting, you must provide the Justice of the Peace with such proof as soon as possible after the elections.</p>\n\n<p>You will find more information on the evidence and certificates you must be able to submit on the Verkiezingen.fgov.be website.</p>",
        "nl": "<p>Eerst vult u een <strong>volmachtformulier</strong> in. U kunt het <a data-entity-substitution=\"canonical\" data-entity-type=\"node\" data-entity-uuid=\"f29de5f5-042e-43f0-a6a8-17d90888d6f3\" href=\"/node/4106\">volmachtformulier downloaden</a> op de website Verkiezingen.fgov.be of gratis aanvragen bij uw gemeentebestuur.</p>\n\n<p>Vervolgens geeft u het ingevulde volmachtformulier en de nodige documenten tijdig aan een kiesgerechtigde persoon die voor u zal stemmen, de <strong>volmachtkrijger</strong>.</p>\n\n<p>Op de dag van de verkiezingen gaat de volmachtkrijger met het volmachtformulier en de nodige documenten naar het <strong>stembureau dat op uw oproepingsbrief vermeld staat</strong>.</p>\n\n<p>Als u tijdens de stemming nog geen bewijs van afwezigheid hebt bezorgd, moet u dat bewijs zo snel mogelijk na de verkiezingen bezorgen aan de vrederechter.</p>\n\n<p>Op de website Verkiezingen.fgov.be vindt u <a data-entity-substitution=\"canonical\" data-entity-type=\"node\" data-entity-uuid=\"f29de5f5-042e-43f0-a6a8-17d90888d6f3\" href=\"/node/4106\">meer informatie over de bewijzen en attesten</a> die u moet kunnen voorleggen.</p>"
      },
      "websites": [
        {
          "naam": {
            "nl": "Meer info over de bewijzen en attesten",
            "en": "Volmachtformulier",
            "nl": "Volmachtformulier",
            "en": "Meer info over de bewijzen en attesten"
          },
          "url": "https://verkiezingen.fgov.be/kiezers-wat-als-men-niet-beschikbaar-is-op-de-dag-van-de-stemming/stemming-bij-volmacht",
          "@type": "website",
          "order": 0.0
        }
      ],
      "@type": "procedure",
      "order": 0.0
    }
  ],

```

-> reported a problem @ ipdc


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

# case 3: not all triples seem to be loaded, that are directly linked to a concept snapshot (solved)

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

Running 'Load one concept snapshot and print quads' on this case gives:

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


