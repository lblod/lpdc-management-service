import { Bestuurseenheid } from "../domain/bestuurseenheid";
import { Iri } from "../domain/shared/iri";
import { InstanceRepository } from "../port/driven/persistence/instance-repository";
import { FormatPreservingDate } from "../domain/format-preserving-date";
import { SemanticFormsMapper } from "../port/driven/persistence/semantic-forms-mapper";

export class UpdateInstanceApplicationService {
  private readonly _instanceRepository: InstanceRepository;
  private readonly _semanticFormsMapper: SemanticFormsMapper;

  constructor(
    instanceRepository: InstanceRepository,
    semanticFormsMapper: SemanticFormsMapper,
  ) {
    this._instanceRepository = instanceRepository;
    this._semanticFormsMapper = semanticFormsMapper;
  }

  //Note: the update instance application service is directly tied to semantic forms, hence that part of the input parameters are xxxAsTurtleFormat
  async update(
    bestuurseenheid: Bestuurseenheid,
    instanceId: Iri,
    instanceVersion: FormatPreservingDate | undefined,
    removalsAsTurtleFormat: string,
    additionsAsTurtleFormat: string,
  ): Promise<void> {
    const loadedInstance = await this._instanceRepository.findById(
      bestuurseenheid,
      instanceId,
    );

    const mergedInstance = this._semanticFormsMapper.mergeInstance(
      bestuurseenheid,
      loadedInstance,
      removalsAsTurtleFormat,
      additionsAsTurtleFormat,
    );

    await this._instanceRepository.update(
      bestuurseenheid,
      mergedInstance,
      instanceVersion,
    );
  }
}
