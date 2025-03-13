import { ConceptRepository } from "../port/driven/persistence/concept-repository";
import { FormDefinitionRepository } from "../port/driven/persistence/form-definition-repository";
import { Iri } from "../domain/shared/iri";
import { CodeRepository } from "../port/driven/persistence/code-repository";
import { SelectConceptLanguageDomainService } from "../domain/select-concept-language-domain-service";
import { Bestuurseenheid } from "../domain/bestuurseenheid";
import { FormType } from "../domain/types";
import { InstanceRepository } from "../port/driven/persistence/instance-repository";
import {
  ComparisonSource,
  SemanticFormsMapper,
} from "../port/driven/persistence/semantic-forms-mapper";
import { validateForm } from "@lblod/submission-form-helpers";
import ForkingStore from "forking-store";
import { namedNode } from "rdflib";
import { FormalInformalChoiceRepository } from "../port/driven/persistence/formal-informal-choice-repository";
import { ConceptSnapshotRepository } from "../port/driven/persistence/concept-snapshot-repository";
import { uniq, zip } from "lodash";
import { SystemError } from "../domain/shared/lpdc-error";
import { Language } from "../domain/language";
import { Instance } from "../domain/instance";
import { ConceptSnapshot } from "../domain/concept-snapshot";
import { Requirement } from "../domain/requirement";
import { Procedure } from "../domain/procedure";

export class FormApplicationService {
  private readonly _conceptRepository: ConceptRepository;
  private readonly _conceptSnapshotRepository: ConceptSnapshotRepository;
  private readonly _instanceRepository: InstanceRepository;
  private readonly _formDefinitionRepository: FormDefinitionRepository;
  private readonly _codeRepository: CodeRepository;
  private readonly _formalInformalChoiceRepository: FormalInformalChoiceRepository;
  private readonly _selectConceptLanguageDomainService: SelectConceptLanguageDomainService;
  private readonly _semanticFormsMapper: SemanticFormsMapper;

  constructor(
    conceptRepository: ConceptRepository,
    conceptSnapshotRepository: ConceptSnapshotRepository,
    instanceRepository: InstanceRepository,
    formDefinitionRepository: FormDefinitionRepository,
    codeRepository: CodeRepository,
    formalInformalChoiceRepository: FormalInformalChoiceRepository,
    selectConceptLanguageDomainService: SelectConceptLanguageDomainService,
    semanticFormsMapper: SemanticFormsMapper,
  ) {
    this._conceptRepository = conceptRepository;
    this._conceptSnapshotRepository = conceptSnapshotRepository;
    this._instanceRepository = instanceRepository;
    this._formDefinitionRepository = formDefinitionRepository;
    this._codeRepository = codeRepository;
    this._formalInformalChoiceRepository = formalInformalChoiceRepository;
    this._selectConceptLanguageDomainService =
      selectConceptLanguageDomainService;
    this._semanticFormsMapper = semanticFormsMapper;
  }

  async loadConceptForm(
    bestuurseenheid: Bestuurseenheid,
    conceptId: Iri,
    formType: FormType,
  ): Promise<{
    form: string;
    meta: string;
    source: string;
    serviceUri: string;
  }> {
    const concept = await this._conceptRepository.findById(conceptId);
    const formalInformalChoice =
      await this._formalInformalChoiceRepository.findByBestuurseenheid(
        bestuurseenheid,
      );
    const languageForForm =
      this._selectConceptLanguageDomainService.selectAvailableLanguageUsingFormalInformalChoice(
        concept,
        formalInformalChoice,
      );

    const formDefinition =
      this._formDefinitionRepository.loadConceptFormDefinition(
        formType,
        languageForForm,
      );

    const tailoredSchemes =
      formType === FormType.EIGENSCHAPPEN
        ? await this._codeRepository.loadIPDCOrganisatiesTailoredInTurtleFormat()
        : [];

    return {
      form: formDefinition,
      meta: tailoredSchemes.join("\r\n"),
      source: this._semanticFormsMapper
        .conceptAsTurtleFormat(concept)
        .join("\r\n"),
      serviceUri: conceptId.value,
    };
  }

  async loadInstanceForm(
    bestuurseenheid: Bestuurseenheid,
    instanceId: Iri,
    latestConceptSnapshotId: Iri | undefined,
    formType: FormType,
  ): Promise<{
    form: string;
    meta: string;
    source: string;
    serviceUri: string;
  }> {
    return this.doLoadInstanceForm(
      bestuurseenheid,
      instanceId,
      latestConceptSnapshotId,
      formType,
      true,
    );
  }

  private async doLoadInstanceForm(
    bestuurseenheid: Bestuurseenheid,
    instanceId: Iri,
    latestConceptSnapshotId: Iri | undefined,
    formType: FormType,
    loadMetaData: boolean,
  ): Promise<{
    form: string;
    meta: string;
    source: string;
    serviceUri: string;
  }> {
    const instance = await this._instanceRepository.findById(
      bestuurseenheid,
      instanceId,
    );

    const formDefinition =
      this._formDefinitionRepository.loadInstanceFormDefinition(
        formType,
        instance.dutchLanguageVariant,
      );

    let meta = [];
    if (loadMetaData) {
      if (formType === FormType.EIGENSCHAPPEN) {
        meta = [
          ...meta,
          ...(await this._codeRepository.loadIPDCOrganisatiesTailoredInTurtleFormat()),
        ];
      }

      if (instance.reviewStatus && instance.conceptSnapshotId) {
        if (!latestConceptSnapshotId) {
          throw new SystemError(`latestConceptSnapshotId mag niet ontbreken`);
        }

        const latestConceptSnapshot =
          await this._conceptSnapshotRepository.findById(
            latestConceptSnapshotId,
          );
        const instanceConceptSnapshot =
          await this._conceptSnapshotRepository.findById(
            instance.conceptSnapshotId,
          );

        if (!latestConceptSnapshot.isVersionOf.equals(instance.conceptId)) {
          throw new SystemError(
            `latestConceptSnapshot hoort niet bij concept van instantie`,
          );
        }

        if (!instanceConceptSnapshot.isVersionOf.equals(instance.conceptId)) {
          throw new SystemError(
            `concept snapshot van instantie hoort niet bij concept van instantie`,
          );
        }

        const languageForLatestConceptSnapshot =
          this._selectConceptLanguageDomainService.selectAvailableLanguage(
            latestConceptSnapshot,
            instance.dutchLanguageVariant === Language.INFORMAL,
          );
        const languageForInstanceConceptSnapshot =
          this._selectConceptLanguageDomainService.selectAvailableLanguage(
            instanceConceptSnapshot,
            instance.dutchLanguageVariant === Language.INFORMAL,
          );

        const currentComparisonSources: ComparisonSource[] =
          this.findComparisonSources(instance, instanceConceptSnapshot);
        const latestComparisonSources: ComparisonSource[] =
          this.findComparisonSources(instance, latestConceptSnapshot);

        meta = [
          ...meta,
          ...this._semanticFormsMapper.conceptSnapshotAsTurtleFormat(
            latestConceptSnapshot.transformLanguage(
              languageForLatestConceptSnapshot,
              instance.dutchLanguageVariant,
            ),
          ),
          ...this._semanticFormsMapper.conceptSnapshotAsTurtleFormat(
            instanceConceptSnapshot.transformLanguage(
              languageForInstanceConceptSnapshot,
              instance.dutchLanguageVariant,
            ),
          ),
          ...this._semanticFormsMapper.comparisonSourceAsTurtleFormat(
            currentComparisonSources,
            "current",
          ),
          ...this._semanticFormsMapper.comparisonSourceAsTurtleFormat(
            latestComparisonSources,
            "latest",
          ),
        ];
      }
    }

    return {
      form: formDefinition,
      meta: uniq(meta).join("\r\n"),
      source: this._semanticFormsMapper
        .instanceAsTurtleFormat(bestuurseenheid, instance)
        .join("\r\n"),
      serviceUri: instanceId.value,
    };
  }

  async validateForms(
    instanceId: Iri,
    bestuurseenheid: Bestuurseenheid,
  ): Promise<ValidationError[]> {
    const errors = [];
    for (const formType of Object.values(FormType)) {
      const form = await this.doLoadInstanceForm(
        bestuurseenheid,
        instanceId,
        undefined,
        formType,
        false,
      );

      const FORM_GRAPHS = {
        formGraph: namedNode("http://data.lblod.info/form"),
        metaGraph: namedNode("http://data.lblod.info/metagraph"),
        sourceGraph: namedNode(`http://data.lblod.info/sourcegraph`),
      };

      const formStore = new ForkingStore();
      formStore.parse(form.form, FORM_GRAPHS.formGraph, "text/turtle");
      formStore.parse(form.source, FORM_GRAPHS.sourceGraph, "text/turtle");

      const options = {
        ...FORM_GRAPHS,
        store: formStore,
        sourceNode: namedNode(instanceId.value),
      };

      const formUri = formStore.any(
        undefined,
        namedNode("http://www.w3.org/1999/02/22-rdf-syntax-ns#type"),
        namedNode("http://lblod.data.gift/vocabularies/forms/Form"),
        FORM_GRAPHS.formGraph,
      );

      const isValid = validateForm(formUri, options);
      if (!isValid) {
        errors.push({
          formId: formType,
          message: `Er zijn fouten opgetreden in de tab "${formType}". Gelieve deze te verbeteren!`,
        });
      }
    }
    return errors;
  }

  private findComparisonSources(
    instance: Instance,
    conceptSnapshot: ConceptSnapshot,
  ): ComparisonSource[] {
    const mapToComparisonSource = (
      a1: Identifiable[],
      a2: Identifiable[],
      extractNested: (
        a1: Identifiable,
        a2: Identifiable,
      ) => ComparisonSource[] = () => [],
    ) =>
      zip(a1, a2)
        .flatMap(([o1, o2]: [Identifiable, Identifiable]) => [
          { instanceSourceIri: o1?.id, conceptSnapshotSourceIri: o2?.id },
          ...extractNested(o1, o2),
        ])
        .filter(
          (cs: ComparisonSource) =>
            cs.instanceSourceIri && cs.conceptSnapshotSourceIri,
        );

    return [
      {
        instanceSourceIri: instance.id,
        conceptSnapshotSourceIri: conceptSnapshot.id,
      },
      ...mapToComparisonSource(
        instance.requirements,
        conceptSnapshot.requirements,
        (req1: Requirement, req2: Requirement) =>
          mapToComparisonSource([req1?.evidence], [req2?.evidence]),
      ),
      ...mapToComparisonSource(
        instance.procedures,
        conceptSnapshot.procedures,
        (proc1: Procedure, proc2: Procedure) =>
          mapToComparisonSource(proc1?.websites, proc2?.websites),
      ),
      ...mapToComparisonSource(instance.costs, conceptSnapshot.costs),
      ...mapToComparisonSource(
        instance.financialAdvantages,
        conceptSnapshot.financialAdvantages,
      ),
      ...mapToComparisonSource(instance.websites, conceptSnapshot.websites),
      ...mapToComparisonSource(
        instance.legalResources,
        conceptSnapshot.legalResources,
      ),
    ];
  }
}

type Identifiable = { id: Iri };

export interface ValidationError {
  formId?: string;
  message: string;
  isBlocking?: boolean;
}
