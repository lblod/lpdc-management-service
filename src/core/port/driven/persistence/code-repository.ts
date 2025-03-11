import { Iri } from "../../../domain/shared/iri";

export interface CodeRepository {
  exists(schema: CodeSchema, id: Iri): Promise<boolean>;

  save(
    schema: CodeSchema,
    id: Iri,
    prefLabel: string,
    seeAlso: Iri,
  ): Promise<void>;

  loadIPDCOrganisatiesTailoredInTurtleFormat(): Promise<string[]>;

  getExecutionLevelForOvoCode(iri: Iri): Promise<string | undefined>;

  getCompetencyLevelForOvoCode(iri: Iri): Promise<string | undefined>;
}

export enum CodeSchema {
  IPDCOrganisaties = "IPDCOrganisaties",
}
