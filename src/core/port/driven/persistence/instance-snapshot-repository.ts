import {Iri} from "../../../domain/shared/iri";
import {InstanceSnapshot} from "../../../domain/instance-snapshot";

export interface InstanceSnapshotRepository {

    findById(instanceSnapshotGraph: Iri, id: Iri): Promise<InstanceSnapshot>;

    findToProcessInstanceSnapshots(): Promise<{
        bestuurseenheidId: Iri,
        instanceSnapshotGraph: Iri,
        instanceSnapshotId: Iri
    }[]>;

    addToProcessedInstanceSnapshots(instanceSnapshotGraph: Iri, instanceSnapshotId: Iri): Promise<void>;

    hasNewerProcessedInstanceSnapshot(instanceSnapshotGraph: Iri, instanceSnapshot: InstanceSnapshot): Promise<boolean>;

}
