# Description

This service manages CRUD for lpdc-ipdc public services and their forms. There are 3 forms: 'content, properties & translation' (represented as tabs in the frontend).

# Docker-compose

```yaml
services:
  ...
  lpdc-management:
    image: lblod/lpdc-management-service:0.1.0
    volumes:
      - ./config/lpdc-management:/config
      - ./data/files/lpdc:/data
```

# Public Services

Public service templates, also called Conceptual Public Services (after this called Template) exist in the database under the type `<http://lblod.data.gift/vocabularies/lpdc-ipdc/ConceptualPublicService>`. When a user creates a new public service in the frontend, this service will create a new public-service from a template only changing the type to `<http://purl.org/vocab/cpsv#PublicService>`.

# Forms 

## Description
A form is a simple way to group relevant content together for the user to act on. As an example we can look at the 'Content' form. This form contains the 'main' fields of a Public service like the Title, Description & Contact Information, while the 'Properties Form' contains more secondary data like status, start-date & languages. **The structure of these forms is arbitrary**, meaning that you could also put the Title field in the 'Properties' form instead of the 'Content form' if you like. It just helps to group fields together to display to the user.

All forms act on the same object: public-service (not the template!). 

<sub>Note: At the moment this is not generic yet! the 3 forms are hard coded in this service.</sub>

## files

The ttl and json files for each form are located in the config/lpdc-management folder.

```
── config/
    └── lpdc-management/
        ├── content/
        │   ├── form.ttl
        │   └── form.json
        ├── characteristics/
        │   ├── form.ttl
        │   └── form.json
        └── translation/
            ├── form.ttl
            └── form.json
```

# API

<details>
  <summary><b>POST /public-services</b></summary>
  <h3> request body </h3>

  ```javascript
  {
    "data": {
      "type": "public-services",
      "relationships": {
        "concept": {
          "data": {
            "type": "conceptual-public-services", 
            "id": "{TemplateID}"
          }
        }
      }
    }
  }
  ```

  <strong>TemplateID</strong> is the id of the public service template that you want to use. <br>

To find which templates are available and their id, execute the following query:

  ```sql
  PREFIX mu:  <http://mu.semte.ch/vocabularies/core/> 
  PREFIX dct: <http://purl.org/dc/terms/>

  SELECT ?id ?title WHERE {
    ?template a <http://lblod.data.gift/vocabularies/lpdc-ipdc/ConceptualPublicService>;
      mu:uuid ?id;
      dct:title ?title.
  } LIMIT 10
  ```

  <h3>Response</h3>

  <h5> 201 Created </h5>

  ```javascript
  {
      "data": {
          "type": "public-service",
          "id": "{NewPublicServiceId}",
          "uri": "http://data.lblod.info/id/public-services/{NewPublicServiceId}"
      }
  }
  ```

  NewPublicServiceId: the ID of the newly created public service that is a duplicate of the template you used with the only difference being the type:`<http://purl.org/vocab/cpsv#PublicService>` instead of <http://lblod.data.gift/vocabularies/lpdc-ipdc/ConceptualPublicService>
    
<br><br></details>

<details>
 <summary><b>GET /semantic-forms/:publicServiceId/form/:formId</b></summary>
<h3>params</h3>
  <strong>publicServiceId</strong> the ID of the public service (not the template ID!) <br>
<strong>formId</strong> ID of the form that you want to retrieve (content, properties, translation) ID's can be found in de config.js file (FORM_MAPPING)

  <h3>Request body</h3>

N/A

<h3>Response<h3>

<h5> 200 OK </h5>

```javascript
{
   "form": {formTTL},
   "meta": {metaN3},
   "source": ${sourceTTL}
}
```
<strong>FormTTL</strong> contains the content of the form file (form.ttl) read form section above <br>
<strong>meta</strong> The triples of the code lists (concept-schemes) read meta section above <br>
<strong>source</strong> The whole public service object and its values as saved in the backend <br>

  <br><br></details> 

  
<details>
 <summary><b>PUT /semantic-forms/:publicServiceId/form/:formId</b></summary>

<h3>request body</h3>

```javascript
{
  "graph": {graph},
  "additions": {additions},
  "removals": {removals}
}
```

<strong>graph</strong> contains the original un-changed public service object <br>
  <strong> additions & removals </strong> contains added & removed triples from the public service object <br>

  <sub>note: ember-submission-form-fields takes care of this for you</sub>


<h3>Response</h3>

  <h5>200 OK</h5>
  
  <br><br></details> 
  
<details>
 <summary><b>DELETE /public-services/:publicServiceId</b></summary>

  <h3>request body</h3>

N/A

  <h3>Response</h3>

  <h5>204 No Content</h5>
  
  </details>
