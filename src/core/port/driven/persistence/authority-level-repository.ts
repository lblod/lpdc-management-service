import { Iri } from '../../../domain/shared/iri';
import { CompetentAuthorityLevelType, ExecutingAuthorityLevelType } from '../../../domain/types';

export interface AuthorityLevelRepository {
  getAuthorityLevel(iri: Iri, typeLevel: "organisationExecutingLevel" | "organisationCompetencyLevel"): Promise<ExecutingAuthorityLevelType | CompetentAuthorityLevelType | undefined>;
}
