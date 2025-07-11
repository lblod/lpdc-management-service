# LPDC (Lokale Producten- en Dienstencatalogus) - Management Service

LPDC Management Service is part of [LPDC - Digitaal loket](https://github.com/lblod/app-lpdc-digitaal-loket/tree/development). This contains general documentation. Specific documentation to be found in this project.

# Context

## General

This service manages CRUD for lpdc-ipdc public services and their forms.
There are 3 forms: 'content, properties & translation' (represented as tabs in the frontend).

## Public Services

Public service templates, also called Conceptual Public Services (after this called Template) exist in the database under the type `<https://productencatalogus.data.vlaanderen.be/ns/ipdc-lpdc#ConceptualPublicService>`.
When a user creates a new public service in the frontend, this service will create a new public-service from a template only changing the type to `<https://productencatalogus.data.vlaanderen.be/ns/ipdc-lpdc#InstancePublicService>`.

It is also in charge of post-processing the LDES feed coming from IPDC.

# Code

## Forms

### Description
A form is a simple way to group relevant content together for the user to act on. As an example we can look at the '[Content](https://github.com/lblod/lpdc-management-service/blob/master/src/driven/persistence/forms/inhoud/form.ttl)' form. This form contains the 'main' fields of a Public service like the Title, Description & Contact Information, while the 'Properties Form' contains more secondary data like status, start-date & languages. **The structure of these forms is arbitrary**, meaning that you could also put the Title field in the 'Properties' form instead of the 'Content form' if you like. It just helps to group fields together to display to the user.

# Testing

The `test` folder contains a fairly extensive set of tests for this service's functionality, as well as some of its external dependencies such as IPDC. To run all tests go to the `test`  folder and execute the `run-test.sh` script. Note that
- this will start and stop several docker containers;
- will take some time; and
- will spew a lot of output in your terminal.

It is advised to
- run these tests when modifying (core) functionality of this service to verify no other functionality was broken in the process; and
- add appropriate tests when adding new (core) functionality to this service.

# Deployment

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

| Name                                        | Description                                                       | Default      |
|---------------------------------------------|-------------------------------------------------------------------|--------------|
| `IPDC_API_ENDPOINT`                         | The endpoint via which to reache IPDC                             | None         |
| `IPDC_API_KEY`                              | The API key to attach to calls the the IPDC endpoint              | None         |
| `ENABLE_ADDRESS_VALIDATION`                 | Whether to validate addresses provided by the user                | `true`       |
| `ADRESSEN_REGISTER_API_KEY`                 | API key used to interact with basisregisters service              | None         |
| `ENABLE_MUNICIPALITY_MERGER_FLAG`           | Toggle fusies                                                     | `false`      |
| `INSTANCE_SNAPSHOT_PROCESSING_CRON_PATTERN` | How often to retrieve instance snapshots from integrating parties | Every minute |
| `CONCEPT_SNAPSHOT_PROCESSING_CRON_PATTERN`  | How often to retrieve concept snapshots from IPDC                 | Every minute |


## Release a new version
We use [release-it](https://github.com/release-it/release-it/tree/main) to make a new release.

```shell
  npm run release
```
