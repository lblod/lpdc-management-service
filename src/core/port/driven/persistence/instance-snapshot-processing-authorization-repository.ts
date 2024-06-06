import {Bestuurseenheid} from "../../../domain/bestuurseenheid";
import {Iri} from "../../../domain/shared/iri";

export interface InstanceSnapshotProcessingAuthorizationRepository {

    canPublishInstanceToGraph(bestuurseenheid: Bestuurseenheid, instanceSnapshotGraph: Iri): Promise<boolean>;

}