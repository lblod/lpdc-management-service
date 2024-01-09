import {Iri} from "../../../domain/shared/iri";

export interface InstanceRepository {

    updateReviewStatusesForInstances(conceptId: Iri, isConceptFunctionallyChanged: boolean, isConceptArchived: boolean): Promise<void>;

}