import { Instance, InstanceBuilder } from "./instance";
import { InstanceRepository } from "../port/driven/persistence/instance-repository";
import { Bestuurseenheid } from "./bestuurseenheid";
import { FormatPreservingDate } from "./format-preserving-date";
import { Iri } from "./shared/iri";

export class MarkInstanceAsCurrentService {
  private readonly _instanceRepository: InstanceRepository;

  constructor(instanceRepository: InstanceRepository) {
    this._instanceRepository = instanceRepository;
  }

  // set the isYearOld flag to false and bump dateModified / lastModifier
  async markInstanceAsCurrent(
    bestuurseenheid: Bestuurseenheid,
    user: Iri,
    instance: Instance,
    instanceVersion: FormatPreservingDate,
  ): Promise<void> {
    const updatedInstance = InstanceBuilder.from(instance)
      .withLastModifier(user)
      .withDateModified(FormatPreservingDate.now())
      .withIsYearOld(false)
      .build();

    await this._instanceRepository.update(
      bestuurseenheid,
      user,
      updatedInstance,
      instanceVersion,
    );
  }
}
