import {InstanceRepository} from "../port/driven/persistence/instance-repository";
import {FormalInformalChoiceRepository} from "../port/driven/persistence/formal-informal-choice-repository";
import {Bestuurseenheid} from "./bestuurseenheid";
import {buildFormalInformalChoiceIri, FormalInformalChoice} from "./formal-informal-choice";
import {ChosenFormType} from "./types";
import {FormatPreservingDate} from "./format-preserving-date";
import {uuid} from "../../../mu-helper";

export class NewFormalInformalChoiceDomainService {
    private readonly _instanceRepository: InstanceRepository;
    private readonly _formalInformalChoiceRepository: FormalInformalChoiceRepository;

    constructor(formalInformalChoiceRepository: FormalInformalChoiceRepository, instanceRepository: InstanceRepository,) {
        this._instanceRepository = instanceRepository;
        this._formalInformalChoiceRepository = formalInformalChoiceRepository;
    }


    public async saveFormalInformalChoiceAndSyncInstances(bestuurseenheid: Bestuurseenheid, chosenForm: ChosenFormType): Promise<FormalInformalChoice> {
        const formalInformalChoose = await this.saveFormalInformalChoice(bestuurseenheid, chosenForm);
        await this._instanceRepository.syncNeedsConversionFromFormalToInformal(bestuurseenheid, formalInformalChoose.chosenForm);


        return formalInformalChoose;
    }


    private async saveFormalInformalChoice(bestuurseenheid: Bestuurseenheid, chosenForm: ChosenFormType): Promise<FormalInformalChoice> {
        const newUuid = uuid();
        const id = buildFormalInformalChoiceIri(newUuid);
        const formalInformalChoice = new FormalInformalChoice(
            id,
            newUuid,
            FormatPreservingDate.now(),
            chosenForm,
            bestuurseenheid.id);
        await this._formalInformalChoiceRepository.save(bestuurseenheid, formalInformalChoice);


        return formalInformalChoice;
    }

}


