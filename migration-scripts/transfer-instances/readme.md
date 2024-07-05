# Transfer Instances

## Transfer instances to new authority

- Execute [transfer-instances-script](transfer-instances-script.ts)
    - **FromAuthority**: The authority from which we transfer the instances
    - **ToAuthority**: The authority where we transfer the instances to
    - **onlyForMunicipalityMergerInstances**:
        - If true, only merge instances where the forMunicipalityMerger is true
        - If false, merge all instances


- Upload the generated  [transfer-instances.ttl](migration-results/transfer-instances.ttl)

## Archive initial instances

- Execute [archive-instances-script](archive-instances-script.ts)
- Execute generated [archive-instance](migration-results/archive-instances.sparql)

## Update concept display configurations

- Execute
  the [add-concept-display-configurations](concept-display-configurations/add-concept-display-configurations.sparql) to
  sync the concept displays
  configuration


- If the authority created an instance from a concept when no display configuration existed, then the data inserted by
  the script will be wrong.
  The [fix-concept-display-configurations.sparql](concept-display-configurations/fix-concept-display-configurations.sparql)
  script will fix this.
