import {Bestuurseenheid} from "../../../domain/bestuurseenheid";
import {Iri} from "../../../domain/shared/iri";
import {InstanceSnapshot} from "../../../domain/instance-snapshot";

export interface InstanceSnapshotRepository {

    findById(bestuurseenheid: Bestuurseenheid, id: Iri): Promise<InstanceSnapshot>;

}