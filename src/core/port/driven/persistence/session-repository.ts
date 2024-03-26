import {Iri} from "../../../domain/shared/iri";
import {Session} from "../../../domain/session";

export interface SessionRepository {

    findById(id: Iri): Promise<Session>;

    exists(id: Iri): Promise<boolean>;

}