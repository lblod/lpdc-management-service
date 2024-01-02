import {Iri} from "../../../domain/shared/iri";
import {ConceptSnapshot} from "../../../domain/concept-snapshot";

export interface ConceptSnapshotRepository {

    findById(id: Iri): Promise<ConceptSnapshot>;

}