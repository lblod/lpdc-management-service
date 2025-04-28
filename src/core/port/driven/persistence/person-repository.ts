import { Iri } from "../../../domain/shared/iri";
import { Person } from "../../../domain/person";

export interface PersonRepository {
  findById(id: Iri): Promise<Person>;
}
