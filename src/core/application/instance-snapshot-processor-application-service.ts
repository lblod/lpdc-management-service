import {
    InstanceSnapshotToInstanceMergerDomainService
} from "../domain/instance-snapshot-to-instance-merger-domain-service";
import {Logger} from "../../../platform/logger";
import {VersionedLdesSnapshotRepository} from "../port/driven/persistence/versioned-ldes-snapshot-repository";
import {Iri} from "../domain/shared/iri";
import {retry} from "ts-retry-promise";

export class InstanceSnapshotProcessorApplicationService {

    private readonly _instanceSnapshotToInstanceMerger: InstanceSnapshotToInstanceMergerDomainService;
    private readonly _versionedLdesSnapshotRepository: VersionedLdesSnapshotRepository;
    private readonly _logger: Logger = new Logger('InstanceSnapshotProcessor');

    constructor(instanceSnapshotToInstanceMerger: InstanceSnapshotToInstanceMergerDomainService,
                versionedLdesSnapshotRepository: VersionedLdesSnapshotRepository,
                logger?: Logger) {
        this._instanceSnapshotToInstanceMerger = instanceSnapshotToInstanceMerger;
        this._versionedLdesSnapshotRepository = versionedLdesSnapshotRepository;
        if (logger) {
            this._logger = logger;
        }
    }

    async process() {
        //TODO LPDC-1002: ask type to repo
        const toProcessInstanceSnapshots = await this._versionedLdesSnapshotRepository.findToProcessSnapshots(new Iri('https://productencatalogus.data.vlaanderen.be/ns/ipdc-lpdc#InstancePublicServiceSnapshot'));

        for (const {snapshotGraph, snapshotId} of toProcessInstanceSnapshots) {
            try {
                await retry(async () => {
                    await this._instanceSnapshotToInstanceMerger.merge(snapshotGraph, snapshotId, this._versionedLdesSnapshotRepository);
                    await this._versionedLdesSnapshotRepository.addToSuccessfullyProcessedSnapshots(snapshotGraph, snapshotId);
                }, {
                    retries: 9,
                    delay: 200,
                    backoff: "FIXED",
                    logger: (msg: string) => console.log(`Failed, but retrying [${msg}]`),
                });
            } catch (e) {
                this._logger.error(`Could not process ${snapshotId}`, e);
                await this._versionedLdesSnapshotRepository.addToFailedProcessedSnapshots(snapshotGraph, snapshotId);
            }
        }
    }
}