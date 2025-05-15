import { Iri } from "../../../domain/shared/iri";

export interface PersoonRepository {
  findByAccountId(accountId: Iri, bestuurseenheidId: Iri): Promise<Iri>;
}
