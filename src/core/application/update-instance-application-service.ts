import {Bestuurseenheid} from "../domain/bestuurseenheid";
import {Iri} from "../domain/shared/iri";
import {InstanceRepository} from "../port/driven/persistence/instance-repository";
import {InstanceBuilder} from "../domain/instance";
import {FormatPreservingDate} from "../domain/format-preserving-date";

export class UpdateInstanceApplicationService {

    private readonly _instanceRepository: InstanceRepository;

    constructor(
        instanceRepository: InstanceRepository,
    ) {
        this._instanceRepository = instanceRepository;
    }

    //TODO LPDC-917: write tests
    async update(bestuurseenheid: Bestuurseenheid, instanceId: Iri, instanceAsTurtleFormat: string, removalsAsTurtleFormat: string, additionsAsTurtleFormat: string): Promise<void> {

        const parsedInstance = this._instanceRepository.fromTurtleFormat(bestuurseenheid, instanceId, instanceAsTurtleFormat);

        const loadedInstance =
            InstanceBuilder.from(
                await this._instanceRepository.findById(bestuurseenheid, instanceId))
                .withDateModified(parsedInstance.dateModified)
                .build();

        const mergedInstance =
            InstanceBuilder.from(this._instanceRepository.merge(bestuurseenheid, loadedInstance, removalsAsTurtleFormat, additionsAsTurtleFormat))
                .withDateModified(FormatPreservingDate.now())
                .build();

        await this._instanceRepository.update(bestuurseenheid, mergedInstance, loadedInstance);
    }

}