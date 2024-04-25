import {Bestuurseenheid} from "../../../domain/bestuurseenheid";
import {Instance} from "../../../domain/instance";

export interface InstanceInformalLanguageStringsFetcher {

    //TODO LPDC-1139: rename method?
    fetchIpdcInstanceAndMap(bestuurseenheid: Bestuurseenheid, initialInstance: Instance): Promise<Instance>;

}