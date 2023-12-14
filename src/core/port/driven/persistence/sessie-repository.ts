import {Iri} from "../../../domain/shared/iri";
import {Sessie} from "../../../domain/sessie";

export interface SessieRepository {
    findById(id: Iri): Promise<Sessie | undefined>;

    save(sessie: Sessie): Promise<void>;
}