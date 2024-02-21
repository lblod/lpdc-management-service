import {Iri} from "../../../domain/shared/iri";
import {Concept} from "../../../domain/concept";

export interface ConceptRepository {

    findById(id: Iri): Promise<Concept>;

    exists(id: Iri): Promise<boolean>;

    save(concept: Concept): Promise<void>;

    update(concept: Concept, old: Concept): Promise<void>;
}