import {Iri} from "../../../domain/shared/iri";
import {Instance} from "../../../domain/instance";
import {Bestuurseenheid} from "../../../domain/bestuurseenheid";

export interface InstanceRepository {

    findById(bestuurseenheid: Bestuurseenheid, id: Iri): Promise<Instance | undefined>;

    save(bestuurseenheid: Bestuurseenheid, instance: Instance): Promise<void>

    updateReviewStatusesForInstances(conceptId: Iri, isConceptFunctionallyChanged: boolean, isConceptArchived: boolean): Promise<void>;

}