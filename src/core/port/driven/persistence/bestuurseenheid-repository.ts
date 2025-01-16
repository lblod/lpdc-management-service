import { Iri } from "../../../domain/shared/iri";
import { Bestuurseenheid } from "../../../domain/bestuurseenheid";

export interface BestuurseenheidRepository {
  findById(id: Iri): Promise<Bestuurseenheid>;
}
