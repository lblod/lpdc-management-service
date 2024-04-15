import {Bestuurseenheid} from "./bestuurseenheid";
import {Instance} from "./instance";
import {FormatPreservingDate} from "./format-preserving-date";
import {InstanceRepository} from "../port/driven/persistence/instance-repository";
import {FormalInformalChoiceRepository} from "../port/driven/persistence/formal-informal-choice-repository";
import {ChosenFormType} from "./types";
import {InvariantError} from "./shared/lpdc-error";

export class ConfirmInstanceIsAlreadyInformalDomainService {

    private readonly _instanceRepository: InstanceRepository;
    private readonly _formalInformalChoiceRepository: FormalInformalChoiceRepository;

    constructor(
        instanceRepository: InstanceRepository,
        formalInformalChoiceRepository: FormalInformalChoiceRepository) {
        this._instanceRepository = instanceRepository;
        this._formalInformalChoiceRepository = formalInformalChoiceRepository;
    }

    async confirmInstanceIsAlreadyInformal(bestuurseenheid: Bestuurseenheid, instance: Instance, instanceVersion: FormatPreservingDate): Promise<void> {
        const formalInformalChoice = await this._formalInformalChoiceRepository.findByBestuurseenheid(bestuurseenheid);
        if (formalInformalChoice?.chosenForm !== ChosenFormType.INFORMAL) {
            throw new InvariantError('confirmInstanceIsAlreadyInformal: bestuurseenheid should have chosen for Informal');
        }

        const updatedInstance = instance
            .reopen()
            .transformToInformal()
            .publish();

        await this._instanceRepository.update(bestuurseenheid, updatedInstance, instanceVersion);

    }

}