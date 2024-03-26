import {Bestuurseenheid} from "../../../domain/bestuurseenheid";
import {FormalInformalChoice} from "../../../domain/formal-informal-choice";

export interface FormalInformalChoiceRepository {

    findByBestuurseenheid(bestuurseenheid: Bestuurseenheid): Promise<FormalInformalChoice | undefined>;

}