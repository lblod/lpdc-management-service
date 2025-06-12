import { Bestuurseenheid } from "../../../domain/bestuurseenheid";

export interface ContactInfoOptionsRepository {
  contactPointOptions(
    bestuurseenheid: Bestuurseenheid,
    fieldName: string,
  ): Promise<any>;
}
