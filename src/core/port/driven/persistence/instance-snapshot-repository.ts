import {Bestuurseenheid} from "../../../domain/bestuurseenheid";
import {Iri} from "../../../domain/shared/iri";
import {InstanceSnapshot} from "../../../domain/instance-snapshot";

export interface InstanceSnapshotRepository {

    findById(bestuurseenheid: Bestuurseenheid, id: Iri): Promise<InstanceSnapshot>;

    findToProcessInstanceSnapshots(): Promise<{ bestuurseenheidId: Iri, instanceSnapshotId: Iri }[]>;

    addToProcessedInstanceSnapshots(bestuurseenheid: Bestuurseenheid, instanceSnapshotId: Iri): Promise<void>;

    hasNewerProcessedInstanceSnapshot(bestuurseenheid: Bestuurseenheid, instanceSnapshot: InstanceSnapshot): Promise<boolean>;

}
