import { Iri } from "../../../domain/shared/iri";
import { VersionedLdesSnapshot } from "../../../domain/versioned-ldes-snapshot";

export interface VersionedLdesSnapshotRepository {
  findToProcessSnapshots(snapshotType: SnapshotType): Promise<
    {
      snapshotGraph: Iri;
      snapshotId: Iri;
    }[]
  >;

  addToSuccessfullyProcessedSnapshots(
    snapshotGraph: Iri,
    snapshotId: Iri,
  ): Promise<void>;

  addToFailedProcessedSnapshots(
    snapshotGraph: Iri,
    snapshotId: Iri,
    errorMessage: string,
  ): Promise<void>;

  hasNewerProcessedSnapshot(
    snapshotGraph: Iri,
    snapshot: VersionedLdesSnapshot,
    snapshotType: SnapshotType,
  ): Promise<boolean>;
}

export enum SnapshotType {
  INSTANCE_SNAPSHOT = "https://productencatalogus.data.vlaanderen.be/ns/ipdc-lpdc#InstancePublicServiceSnapshot",
  CONCEPT_SNAPSHOT = "https://productencatalogus.data.vlaanderen.be/ns/ipdc-lpdc#ConceptualPublicServiceSnapshot",
}
