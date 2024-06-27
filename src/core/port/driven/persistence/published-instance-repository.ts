import {Bestuurseenheid} from "../../../domain/bestuurseenheid";
import {PublishedInstance} from "../../../domain/published-instance";

export interface PublishedInstanceRepository {

    save(bestuurseenheid: Bestuurseenheid, publishedInstance: PublishedInstance): Promise<void>;

}