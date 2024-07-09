# Transfer Instances

## Transfer instances to new authority

- create a .env file like .env-example and fill in the **SPARQL_URL** && **ADRESSEN_REGISTER_API_KEY**

- Execute [transfer-instances-script](transfer-instances-script.ts) by running the script
  - **FromAuthority**: The authority from which we transfer the instances
  - **ToAuthority**: The authority where we transfer the instances to
  - **onlyForMunicipalityMergerInstances**:
    - If true, only merge instances where the forMunicipalityMerger is true
    - If false, merge all instances

```shell
  npm run transfer-instances
```

- Upload the generated  [transfer-instances.ttl](migration-results/transfer-instances.ttl)

### Update concept display configurations

Follow the steps
in [display-configuratie-andere-besturen](https://github.com/lblod/app-lpdc-digitaal-loket/tree/development/migration-scripts/display-configuratie-andere-besturen)
in app-lpdc-digitaal-loket

## Archive initial instances

- Execute [archive-instances-script](archive-instances-script.ts)

```shell
  npm run archive-instances
```

- Execute generated [archive-instance](migration-results/archive-instances.sparql)

### Update concept display configurations

Follow the steps
in [display-configuratie-andere-besturen](https://github.com/lblod/app-lpdc-digitaal-loket/tree/development/migration-scripts/display-configuratie-andere-besturen)
in app-lpdc-digitaal-loket
