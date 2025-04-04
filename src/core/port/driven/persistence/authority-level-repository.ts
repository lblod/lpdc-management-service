import { Iri } from "../../../domain/shared/iri";
import {
  CompetentAuthorityLevelType,
  ExecutingAuthorityLevelType,
} from "../../../domain/types";

export interface AuthorityLevelRepository {
  getExecutingAuthorityLevel(
    iri: Iri
  ): Promise<ExecutingAuthorityLevelType | undefined>;
  getCompetentAuthorityLevel(
    iri: Iri
  ): Promise<CompetentAuthorityLevelType | undefined>;
}
