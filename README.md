# LPDC (Lokale Producten- en Dienstencatalogus) - Management Service

_Note_: Documentation is structured using [The software guidebook by Simon Brown](https://leanpub.com/documenting-software-architecture).

LPDC Management Service is part of [LPDC - Digitaal loket](https://github.com/lblod/app-lpdc-digitaal-loket/tree/development). This contains general documentation. Specific documentation to be found in this project.

# 1. Context

## General

This service manages CRUD for lpdc-ipdc public services and their forms. 
There are 3 forms: 'content, properties & translation' (represented as tabs in the frontend).

## Public Services

Public service templates, also called Conceptual Public Services (after this called Template) exist in the database under the type `<https://productencatalogus.data.vlaanderen.be/ns/ipdc-lpdc#ConceptualPublicService>`. 
When a user creates a new public service in the frontend, this service will create a new public-service from a template only changing the type to `<https://productencatalogus.data.vlaanderen.be/ns/ipdc-lpdc#InstancePublicService>`.

It is also in charge of post-processing the LDES feed coming from IPDC.

# 2. Functional Overview

# 3. Quality Attributes

# 4. Constraints

# 5. Principles

# 6. Software Architecture

# 7. Code

## Forms

### Description
A form is a simple way to group relevant content together for the user to act on. As an example we can look at the 'Content' form. This form contains the 'main' fields of a Public service like the Title, Description & Contact Information, while the 'Properties Form' contains more secondary data like status, start-date & languages. **The structure of these forms is arbitrary**, meaning that you could also put the Title field in the 'Properties' form instead of the 'Content form' if you like. It just helps to group fields together to display to the user.

# 8. Data

# 9. Infrastructure Architecture

# 10. Deployment

## Docker-compose configuration

For using this service in a docker-compose stack, the following example can be used

```yaml
services:
  lpdc-management:
    image: lblod/lpdc-management-service:0.xx.0
    environment:
      MU_SPARQL_ENDPOINT: 'http://database:8890/sparql'
```

## Environment Variables

| Name                              | Description   |
| --------------------------------- | ------------- |
| `ENABLE_MUNICIPALITY_MERGER_FLAG` | Toggle fusies |

## Release a new version
We use [release-it](https://github.com/release-it/release-it/tree/main) to make a new release.

```shell
  npm run release
```

# 11. Operation and Support

# 12. Development Environment

To make sure every developer uses the same node version locally, [asdf](https://asdf-vm.com/) is used.
After installing asdf the node version specified in `.tool-versions` will be used when running the app locally.

# 13. Decision Log

