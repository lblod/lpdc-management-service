import {
  FormApplicationService,
  ValidationError,
} from "./form-application-service";
import { Iri } from "../domain/shared/iri";
import { Bestuurseenheid } from "../domain/bestuurseenheid";
import { InstanceRepository } from "../port/driven/persistence/instance-repository";
import { InvariantError, NotFoundError } from "../domain/shared/lpdc-error";
import { Instance } from "../domain/instance";
import { ENABLE_ADDRESS_VALIDATION } from "../../../config";
import { BestuurseenheidRepository } from "../port/driven/persistence/bestuurseenheid-repository";

export const INACTIVE_AUTHORITY_ERROR_MESSAGE =
  "Het product dat je probeert te verzenden, is gelinkt aan een inactief bestuur. Kijk in de tab ‘eigenschappen’ de overheidsorganisatie na.";

export class ValidateInstanceForPublishApplicationService {
  private readonly _formApplicationService: FormApplicationService;
  private readonly _instanceRepository: InstanceRepository;
  private readonly _bestuurseenheidRepository: BestuurseenheidRepository;

  constructor(
    formApplicationService: FormApplicationService,
    instanceRepository: InstanceRepository,
    bestuurseenheidRepository: BestuurseenheidRepository,
  ) {
    this._formApplicationService = formApplicationService;
    this._instanceRepository = instanceRepository;
    this._bestuurseenheidRepository = bestuurseenheidRepository;
  }

  async validate(
    instanceId: Iri,
    bestuurseenheid: Bestuurseenheid,
  ): Promise<ValidationError[]> {
    const errorList = await this._formApplicationService.validateForms(
      instanceId,
      bestuurseenheid,
    );
    if (errorList.length) {
      return errorList;
    } else {
      const instance = await this._instanceRepository.findById(
        bestuurseenheid,
        instanceId,
      );

      // TODO: refactor to clean up code and avoid duplication
      try {
        const competentAuthorities = await Promise.all(
          instance.competentAuthorities.flatMap(
            async (uri) => await this._bestuurseenheidRepository.findById(uri),
          ),
        );

        const executingAuthorities = await Promise.all(
          instance.executingAuthorities.flatMap(
            async (uri) => await this._bestuurseenheidRepository.findById(uri),
          ),
        );

        const hasInvalidAuthority = competentAuthorities
          .concat(executingAuthorities)
          .some((authority) => !authority.isValidAuthority);

        if (hasInvalidAuthority) {
          return [{ message: INACTIVE_AUTHORITY_ERROR_MESSAGE }];
        }
      } catch (e) {
        if (e instanceof NotFoundError) {
          return [{ message: INACTIVE_AUTHORITY_ERROR_MESSAGE }];
        }
      }

      return this.tryValidateForPublish(instance);
    }
  }

  private tryValidateForPublish(instance: Instance): ValidationError[] {
    try {
      instance.validateForPublish(ENABLE_ADDRESS_VALIDATION);
      return [];
    } catch (e) {
      if (e instanceof InvariantError) {
        return [
          {
            message: e.message,
          },
        ];
      } else {
        throw e;
      }
    }
  }
}
