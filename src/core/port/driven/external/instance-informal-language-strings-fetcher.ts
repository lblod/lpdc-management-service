import { Bestuurseenheid } from "../../../domain/bestuurseenheid";
import { Instance } from "../../../domain/instance";

export interface InstanceInformalLanguageStringsFetcher {
  fetchInstanceAndMap(
    bestuurseenheid: Bestuurseenheid,
    initialInstance: Instance,
  ): Promise<Instance>;
}
