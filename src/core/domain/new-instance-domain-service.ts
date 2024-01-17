import {InstanceRepository} from "../port/driven/persistence/instance-repository";
import {Bestuurseenheid} from "./bestuurseenheid";
import {Instance} from "./instance";
import {uuid} from "../../../mu-helper";
import {FormatPreservingDate} from "./format-preserving-date";
import {InstanceStatusType} from "./types";
import {Iri} from "./shared/iri";

export class NewInstanceDomainService {

    private readonly _instanceRepository: InstanceRepository;

    constructor(instanceRepository: InstanceRepository) {
        this._instanceRepository = instanceRepository;
    }

    public async createNewEmpty(bestuurseenheid: Bestuurseenheid): Promise<Instance> {
        const instanceUuid = uuid();
        const instanceId = new Iri(`http://data.lblod.info/id/public-service/${instanceUuid}`);

        const now = FormatPreservingDate.of(new Date().toISOString());

        const newInstance =
            new Instance(
                instanceId,
                instanceUuid,
                bestuurseenheid.id,
                undefined,
                undefined,
                now,
                now,
                InstanceStatusType.ONTWERP,
                bestuurseenheid.spatials,
                [bestuurseenheid.id],
                [bestuurseenheid.id]
            );

        await this._instanceRepository.save(bestuurseenheid, newInstance);

        return newInstance;
    }

}