import {Iri} from "./shared/iri";
import {Sessie} from "./sessie";

export interface SessieRepository {
    findById(id: Iri): Promise<Sessie | undefined>;

    save(sessie: Sessie): Promise<void>;
}