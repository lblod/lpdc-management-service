import {Iri} from "../../../domain/shared/iri";
import {ConceptVersie} from "../../../domain/concept-versie";

export interface ConceptVersieRepository {

    findById(id: Iri): Promise<ConceptVersie>;

}