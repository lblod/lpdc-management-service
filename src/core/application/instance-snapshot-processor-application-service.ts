import {InstanceSnapshotRepository} from "../port/driven/persistence/instance-snapshot-repository";
import {
    InstanceSnapshotToInstanceMergerDomainService
} from "../domain/instance-snapshot-to-instance-merger-domain-service";
import {BestuurseenheidRepository} from "../port/driven/persistence/bestuurseenheid-repository";

export class InstanceSnapshotProcessorApplicationService {

    private readonly _instanceSnapshotRepository: InstanceSnapshotRepository;
    private readonly _instanceSnapshotToInstanceMerger: InstanceSnapshotToInstanceMergerDomainService;
    private readonly _bestuurseenheidRepository: BestuurseenheidRepository;

    constructor(instanceSnapshotRepository: InstanceSnapshotRepository,
                instanceSnapshotToInstanceMerger: InstanceSnapshotToInstanceMergerDomainService,
                bestuurseenheidRepository: BestuurseenheidRepository) {
        this._instanceSnapshotRepository = instanceSnapshotRepository;
        this._instanceSnapshotToInstanceMerger = instanceSnapshotToInstanceMerger;
        this._bestuurseenheidRepository = bestuurseenheidRepository;
    }

    async process() {
        const toProcessInstanceSnapshots = await this._instanceSnapshotRepository.findToProcessInstanceSnapshots();

        for (const {bestuurseenheidId, instanceSnapshotId} of toProcessInstanceSnapshots) {
            try {
                const bestuurseenheid = await this._bestuurseenheidRepository.findById(bestuurseenheidId);
                await this._instanceSnapshotToInstanceMerger.merge(bestuurseenheid, instanceSnapshotId);
                await this._instanceSnapshotRepository.addToProcessedInstanceSnapshots(bestuurseenheid, instanceSnapshotId);
            } catch (e) {
                console.error(`instanceSnapshotProcessor: could not process ${instanceSnapshotId}, ${e}`);
            }
        }
    }
}