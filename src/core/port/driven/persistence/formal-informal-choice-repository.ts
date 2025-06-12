import { Bestuurseenheid } from "../../../domain/bestuurseenheid";
import { FormalInformalChoice } from "../../../domain/formal-informal-choice";

export interface FormalInformalChoiceRepository {
  save(
    bestuurseenheid: Bestuurseenheid,
    formalInformalChoice: FormalInformalChoice,
  ): Promise<void>;

  findByBestuurseenheid(
    bestuurseenheid: Bestuurseenheid,
  ): Promise<FormalInformalChoice | undefined>;
}
