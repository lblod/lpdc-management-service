import { Iri } from "../../../domain/shared/iri";
import { Spatial } from "../../../domain/spatial";

export interface SpatialRepository {
  findById(id: Iri): Promise<Spatial>;
}
