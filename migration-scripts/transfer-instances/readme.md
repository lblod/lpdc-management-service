# Transfer Instances

- Execute transfer-instance-script
    - **FromAuthority**: The authority from which we transfer the instances
    - **ToAuthority**: The authority where we transfer the instances to
    - **onlyForMunicipalityMergerInstances**:
        - If true, only merge instances where the forMunicipalityMerger is true
        - If false, merge all instances


- Upload the generated **migration-results/transfer-instances.ttl**


- Execute the **concept-display-configurations/add-concept-display-configurations.sparql** to sync the concept displays
  configuration


- If the authority created an instance from a concept when no display configuration existed, then the data inserted by
  the script will be wrong.
  The **add-concept-display-configurations.sparql** script will fix this.
