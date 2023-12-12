import {Iri} from "./shared/iri";
import {Bestuurseenheid} from "./bestuurseenheid";

export interface BestuurseenheidRepository {
    findById(id: Iri): Promise<Bestuurseenheid>;

    save(bestuurseenheid: Bestuurseenheid): Promise<void>;
}