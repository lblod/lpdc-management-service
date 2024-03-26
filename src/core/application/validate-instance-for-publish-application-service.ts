import {FormApplicationService, ValidationError} from "./form-application-service";
import {Iri} from "../domain/shared/iri";
import {Bestuurseenheid} from "../domain/bestuurseenheid";
import {InstanceRepository} from "../port/driven/persistence/instance-repository";
import {InvariantError} from "../domain/shared/lpdc-error";
import {Instance} from "../domain/instance";

export class ValidateInstanceForPublishApplicationService {

    private readonly _formApplicationService: FormApplicationService;
    private readonly _instanceRepository: InstanceRepository;

    constructor(formApplicationService: FormApplicationService,
                instanceRepository: InstanceRepository) {
        this._formApplicationService = formApplicationService;
        this._instanceRepository = instanceRepository;
    }

    async validate(instanceId: Iri, bestuurseenheid: Bestuurseenheid): Promise<ValidationError[]> {
        const errorList = await this._formApplicationService.validateForms(instanceId, bestuurseenheid);
        if (errorList.length) {
            return errorList;
        } else {
            const instance = await this._instanceRepository.findById(bestuurseenheid, instanceId);
            return this.tryValidateForPublish(instance);
        }
    }

    private tryValidateForPublish(instance: Instance): ValidationError[] {
        try {
            instance.validateForPublish(true);
            return [];
        } catch (e) {
            if (e instanceof InvariantError) {
                return [{
                    message: e.message
                }];
            } else {
                throw e;
            }
        }
    }

}
