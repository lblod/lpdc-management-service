import {Iri} from "../../../domain/shared/iri";
import {VersionedLdesSnapshot} from "../../../domain/versioned-ldes-snapshot";


export interface VersionedLdesSnapshotRepository {

    findToProcessSnapshots(snapshotType: Iri): Promise<{
        snapshotGraph: Iri,
        snapshotId: Iri
    }[]>;

    addToSuccessfullyProcessedSnapshots(snapshotGraph: Iri, snapshotId: Iri): Promise<void>;

    addToFailedProcessedSnapshots(snapshotGraph: Iri, snapshotId: Iri): Promise<void>;

    hasNewerProcessedSnapshot(snapshotGraph: Iri, snapshot: VersionedLdesSnapshot, snapshotType: Iri): Promise<boolean>;
}