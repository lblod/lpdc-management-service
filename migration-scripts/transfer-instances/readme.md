# Transfer Instances

## Optional: before first usage of scripts

Install the necessary dependencies:

```shell
  npm install
```

Create the folder to which the generated migrations are written:

```shell
  mkdir migration-results
```

Create a `.env` file like `.env-example` and fill in the **SPARQL_URL** && **ADRESSEN_REGISTER_API_KEY**

## Boot LPDC stack

Before executing any of the scripts, ensure at least LPDC's virtuoso service is running and accessible via the above **SPARQL_URL**.

## Generate migrations to transfer product instances to new authority

The [transfer-instances-script](transfer-instances-script.ts) generates migrations to copy product instances from one organisation to another. Note that it is allowed to use the same organisation as source and destination. The script generates two kinds of migrations:
- one TTL migration per source and destination organisation pair. Such migrations insert a deep copy of each (or a subset of) product instance(s) of the source organisation into the graph for the source organisation.
- if only a subset of product instances is transferred, a second migration is generated to disable the merger label for the source product instances.

### Usage

- Configure [transfer-instances-script](transfer-instances-script.ts) by adding a `Configuration` for each product instances transfer that should be generated. See the `Configuration` type definition in the script for more details.
- Execute the script by running the following command in this folder
```shell
  npm run transfer-instances
```
- Execute the generated migrations found in `./migration-results/`, by placing them in the app's migration folder and (re)starting the `migrations` service.

## Generate migrations to archive product instances

The [archive-instances-script](archive-instances-script.ts) generates SPARQL migrations that for a given organisation:
- marks all sent product instances as archived, such that this state can be forwarded to IPDC.
- deletes all product instances from the LPDC app.


### Usage
- Add a `Configuration` entry for each organisation for which the product instances must be archived. See the `Configuration` type and `archiveConfigurations` constant at the end of [archive-instances-script](archive-instances-script.ts) for more details.
- Execute the script by running the following command in this folder
```shell
  npm run archive-instances
```
- Execute the generated migrations found in `./migration-results/`, by placing them in the app's migration folder and (re)starting the `migrations` service.

## Update concept display

Follow the steps
in [display-configuratie-andere-besturen](https://github.com/lblod/app-lpdc-digitaal-loket/tree/development/migration-scripts/display-configuratie-andere-besturen)
to update the stores display configurations.
