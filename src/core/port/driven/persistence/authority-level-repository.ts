import { Iri } from '../../../domain/shared/iri';
import { CompetentAuthorityLevelType, ExecutingAuthorityLevelType } from '../../../domain/types';

export interface AuthorityLevelRepository {
  getAuthorityLevel(iri: Iri, typeLevel: "executionLevel" | "competencyLevel"): Promise<ExecutingAuthorityLevelType | CompetentAuthorityLevelType | undefined>;
}
