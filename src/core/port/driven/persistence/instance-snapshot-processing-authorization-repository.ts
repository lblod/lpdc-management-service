import {Bestuurseenheid} from "../../../domain/bestuurseenheid";
import {Iri} from "../../../domain/shared/iri";

export interface InstanceSnapshotProcessingAuthorizationRepository {

    canPublishInstancesToGraph(bestuurseenheid: Bestuurseenheid, instanceSnapshotGraph: Iri): Promise<boolean>;

}