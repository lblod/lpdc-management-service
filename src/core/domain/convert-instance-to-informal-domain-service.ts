import { Bestuurseenheid } from "./bestuurseenheid";
import { Instance } from "./instance";
import { FormatPreservingDate } from "./format-preserving-date";
import { InstanceRepository } from "../port/driven/persistence/instance-repository";
import { FormalInformalChoiceRepository } from "../port/driven/persistence/formal-informal-choice-repository";
import { ChosenFormType } from "./types";
import { InvariantError } from "./shared/lpdc-error";
import { InstanceInformalLanguageStringsFetcher } from "../port/driven/external/instance-informal-language-strings-fetcher";
import { Language } from "./language";
import { Iri } from './shared/iri';

export class ConvertInstanceToInformalDomainService {
  private readonly _instanceRepository: InstanceRepository;
  private readonly _formalInformalChoiceRepository: FormalInformalChoiceRepository;
  private readonly _instanceInformalLanguageStringsFetcher: InstanceInformalLanguageStringsFetcher;

  constructor(
    instanceRepository: InstanceRepository,
    formalInformalChoiceRepository: FormalInformalChoiceRepository,
    instanceInformalLanguageStringsFetcher: InstanceInformalLanguageStringsFetcher,
  ) {
    this._instanceRepository = instanceRepository;
    this._formalInformalChoiceRepository = formalInformalChoiceRepository;
    this._instanceInformalLanguageStringsFetcher =
      instanceInformalLanguageStringsFetcher;
  }

  async confirmInstanceIsAlreadyInformal(
    bestuurseenheid: Bestuurseenheid,
    user: Iri,
    instance: Instance,
    instanceVersion: FormatPreservingDate,
  ): Promise<void> {
    await this.errorIfBestuurDidNotChooseInformal(bestuurseenheid);
    await this.errorIfLastVersionOfInstanceNotPublishedInIPDC(
      bestuurseenheid,
      instance,
    );

    const updatedInstance = instance.reopen().transformToInformal().publish();

    await this._instanceRepository.update(
      bestuurseenheid,
      user,
      updatedInstance,
      instanceVersion,
    );
  }

  async convertInstanceToInformal(
    bestuurseenheid: Bestuurseenheid,
    user: Iri,
    instance: Instance,
    instanceVersion: FormatPreservingDate,
  ): Promise<void> {
    await this.errorIfBestuurDidNotChooseInformal(bestuurseenheid);
    await this.errorIfLastVersionOfInstanceNotPublishedInIPDC(
      bestuurseenheid,
      instance,
    );
    this.errorInstanceReedsInformal(instance);

    const updatedInstance = (
      await this._instanceInformalLanguageStringsFetcher.fetchInstanceAndMap(
        bestuurseenheid,
        instance.reopen(),
      )
    ).transformToInformal();

    await this._instanceRepository.update(
      bestuurseenheid,
      user,
      updatedInstance,
      instanceVersion,
    );
  }

  private async errorIfBestuurDidNotChooseInformal(
    bestuurseenheid: Bestuurseenheid,
  ) {
    const formalInformalChoice =
      await this._formalInformalChoiceRepository.findByBestuurseenheid(
        bestuurseenheid,
      );
    if (formalInformalChoice?.chosenForm !== ChosenFormType.INFORMAL) {
      throw new InvariantError("Je moet gekozen hebben voor de je-vorm");
    }
  }

  private async errorIfLastVersionOfInstanceNotPublishedInIPDC(
    bestuurseenheid: Bestuurseenheid,
    instance: Instance,
  ) {
    if (
      !(await this._instanceRepository.isPublishedToIpdc(
        bestuurseenheid,
        instance,
      ))
    ) {
      throw new InvariantError("Instantie moet gepubliceerd zijn");
    }
  }

  private errorInstanceReedsInformal(instance: Instance) {
    if (instance.dutchLanguageVariant == Language.INFORMAL) {
      throw new InvariantError("Instantie is reeds in de je-vorm");
    }
  }
}
