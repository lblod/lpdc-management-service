import {Iri} from "../../../domain/shared/iri";
import {Instance} from "../../../domain/instance";
import {Bestuurseenheid} from "../../../domain/bestuurseenheid";

export interface InstanceRepository {

    findById(bestuurseenheid: Bestuurseenheid, id: Iri): Promise<Instance>;

    save(bestuurseenheid: Bestuurseenheid, instance: Instance): Promise<void>;

    update(bestuurseenheid: Bestuurseenheid, instance: Instance, old: Instance): Promise<void>;

    delete(bestuurseenheid: Bestuurseenheid, id: Iri): Promise<void>;

    updateReviewStatusesForInstances(conceptId: Iri, isConceptFunctionallyChanged: boolean, isConceptArchived: boolean): Promise<void>;

    exits(bestuurseenheid: Bestuurseenheid, instanceId: Iri): Promise<boolean>;

}