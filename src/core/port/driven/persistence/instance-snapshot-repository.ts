import {Iri} from "../../../domain/shared/iri";
import {InstanceSnapshot} from "../../../domain/instance-snapshot";

export interface InstanceSnapshotRepository {

    findById(instanceSnapshotGraph: Iri, id: Iri): Promise<InstanceSnapshot>;

}
