import { ConceptSnapshotToConceptMergerDomainService } from "../domain/concept-snapshot-to-concept-merger-domain-service";
import {
  SnapshotType,
  VersionedLdesSnapshotRepository,
} from "../port/driven/persistence/versioned-ldes-snapshot-repository";
import { Logger } from "../../../platform/logger";
import { retry } from "ts-retry-promise";

export class ConceptSnapshotProcessorApplicationService {
  private readonly _conceptSnapshotToConceptMergerDomainService: ConceptSnapshotToConceptMergerDomainService;
  private readonly _versionedLdesSnapshotRepository: VersionedLdesSnapshotRepository;
  private readonly _logger: Logger = new Logger("ConceptSnapshotProcessor");

  constructor(
    conceptSnapshotToConceptMergerDomainService: ConceptSnapshotToConceptMergerDomainService,
    versionedLdesSnapshotRepository: VersionedLdesSnapshotRepository,
    logger?: Logger,
  ) {
    this._conceptSnapshotToConceptMergerDomainService =
      conceptSnapshotToConceptMergerDomainService;
    this._versionedLdesSnapshotRepository = versionedLdesSnapshotRepository;
    if (logger) {
      this._logger = logger;
    }
  }

  async process() {
    const toProcessSnapshots =
      await this._versionedLdesSnapshotRepository.findToProcessSnapshots(
        SnapshotType.CONCEPT_SNAPSHOT,
      );

    for (const { snapshotGraph, snapshotId } of toProcessSnapshots) {
      try {
        await retry(
          async () => {
            await this._conceptSnapshotToConceptMergerDomainService.merge(
              snapshotId,
            );
            await this._versionedLdesSnapshotRepository.addToSuccessfullyProcessedSnapshots(
              snapshotGraph,
              snapshotId,
            );
          },
          {
            retries: 9,
            delay: 500,
            backoff: "FIXED",
            logger: (msg: string) =>
              console.log(
                `Failed <${snapshotId}> of <${snapshotGraph}> , but retrying [${msg}]`,
              ),
          },
        );
      } catch (e) {
        this._logger.error(`Could not process ${snapshotId}`, e);
        await this._versionedLdesSnapshotRepository.addToFailedProcessedSnapshots(
          snapshotGraph,
          snapshotId,
          e.message,
        );
      }
    }
  }
}
