import {Iri} from "../../../domain/shared/iri";
import {Concept} from "../../../domain/concept";

export interface ConceptRepository {

    findById(id: Iri): Promise<Concept>;

}