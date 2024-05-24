import {ConceptRepository} from "../port/driven/persistence/concept-repository";
import {FormDefinitionRepository} from "../port/driven/persistence/form-definition-repository";
import {Iri} from "../domain/shared/iri";
import {CodeRepository} from "../port/driven/persistence/code-repository";
import {SelectConceptLanguageDomainService} from "../domain/select-concept-language-domain-service";
import {Bestuurseenheid} from "../domain/bestuurseenheid";
import {FormType} from "../domain/types";
import {InstanceRepository} from "../port/driven/persistence/instance-repository";
import {SemanticFormsMapper} from "../port/driven/persistence/semantic-forms-mapper";
import {validateForm} from '@lblod/submission-form-helpers';
import ForkingStore from "forking-store";
import {namedNode} from "rdflib";
import {FormalInformalChoiceRepository} from "../port/driven/persistence/formal-informal-choice-repository";
import {ConceptSnapshotRepository} from "../port/driven/persistence/concept-snapshot-repository";
import {uniq} from "lodash";
import {SystemError} from "../domain/shared/lpdc-error";
import {Language} from "../domain/language";

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
        this._selectConceptLanguageDomainService = selectConceptLanguageDomainService;
        this._semanticFormsMapper = semanticFormsMapper;
    }

    async loadConceptForm(bestuurseenheid: Bestuurseenheid, conceptId: Iri, formType: FormType): Promise<{
        form: string,
        meta: string,
        source: string,
        serviceUri: string
    }> {

        const concept = await this._conceptRepository.findById(conceptId);
        const formalInformalChoice = await this._formalInformalChoiceRepository.findByBestuurseenheid(bestuurseenheid);
        const languageForForm = this._selectConceptLanguageDomainService.selectAvailableLanguageUsingFormalInformalChoice(concept, formalInformalChoice);

        const formDefinition = this._formDefinitionRepository.loadFormDefinition(formType, languageForForm);

        const tailoredSchemes = formType === FormType.EIGENSCHAPPEN ? await this._codeRepository.loadIPDCOrganisatiesTailoredInTurtleFormat() : [];

        return {
            form: formDefinition,
            meta: tailoredSchemes.join("\r\n"),
            source: this._semanticFormsMapper.conceptAsTurtleFormat(concept).join("\r\n"),
            serviceUri: conceptId.value,
        };
    }

    async loadInstanceForm(bestuurseenheid: Bestuurseenheid, instanceId: Iri, latestConceptSnapshotId: Iri | undefined, formType: FormType): Promise<{
        form: string,
        meta: string,
        source: string,
        serviceUri: string
    }> {
        return this.doLoadInstanceForm(bestuurseenheid, instanceId, latestConceptSnapshotId, formType, true);
    }

    private async doLoadInstanceForm(bestuurseenheid: Bestuurseenheid, instanceId: Iri, latestConceptSnapshotId: Iri | undefined, formType: FormType, loadMetaData: boolean): Promise<{
        form: string,
        meta: string,
        source: string,
        serviceUri: string
    }> {

        const instance = await this._instanceRepository.findById(bestuurseenheid, instanceId);

        const formDefinition = this._formDefinitionRepository.loadFormDefinition(formType, instance.dutchLanguageVariant);

        let meta = [];
        if (loadMetaData) {
            if (formType === FormType.EIGENSCHAPPEN) {
                meta = [
                    ...meta,
                    ...(await this._codeRepository.loadIPDCOrganisatiesTailoredInTurtleFormat()),
                ];
            }

            if (instance.reviewStatus
                && instance.conceptSnapshotId) {

                if(!latestConceptSnapshotId) {
                    throw new SystemError(`latestConceptSnapshotId mag niet ontbreken`);
                }

                const latestConceptSnapshot = await this._conceptSnapshotRepository.findById(latestConceptSnapshotId);
                const instanceConceptSnapshot = await this._conceptSnapshotRepository.findById(instance.conceptSnapshotId);

                if(!latestConceptSnapshot.isVersionOfConcept.equals(instance.conceptId)) {
                    throw new SystemError(`latestConceptSnapshot hoort niet bij concept van instantie`);
                }

                if(!instanceConceptSnapshot.isVersionOfConcept.equals(instance.conceptId)) {
                    throw new SystemError(`concept snapshot van instantie hoort niet bij concept van instantie`);
                }

                const languageForLatestConceptSnapshot = this._selectConceptLanguageDomainService.selectAvailableLanguage(latestConceptSnapshot, instance.dutchLanguageVariant === Language.INFORMAL);
                const languageForInstanceConceptSnapshot = this._selectConceptLanguageDomainService.selectAvailableLanguage(instanceConceptSnapshot, instance.dutchLanguageVariant === Language.INFORMAL);

                meta = [
                    ...meta,
                    ...(this._semanticFormsMapper.conceptSnapshotAsTurtleFormat(latestConceptSnapshot.transformLanguage(languageForLatestConceptSnapshot, instance.dutchLanguageVariant))),
                    ...(this._semanticFormsMapper.conceptSnapshotAsTurtleFormat(instanceConceptSnapshot.transformLanguage(languageForInstanceConceptSnapshot, instance.dutchLanguageVariant))),
                ];
            }
        }

        return {
            form: formDefinition,
            meta: uniq(meta).join("\r\n"),
            source: this._semanticFormsMapper.instanceAsTurtleFormat(bestuurseenheid, instance).join("\r\n"),
            serviceUri: instanceId.value,
        };
    }

    async validateForms(instanceId: Iri, bestuurseenheid: Bestuurseenheid): Promise<ValidationError[]> {
        const errors = [];
        for (const formType of Object.values(FormType)) {
            const form = await this.doLoadInstanceForm(bestuurseenheid, instanceId, undefined, formType, false);

            const FORM_GRAPHS = {
                formGraph: namedNode('http://data.lblod.info/form'),
                metaGraph: namedNode('http://data.lblod.info/metagraph'),
                sourceGraph: namedNode(`http://data.lblod.info/sourcegraph`),
            };

            const formStore = new ForkingStore();
            formStore.parse(form.form, FORM_GRAPHS.formGraph, 'text/turtle');
            formStore.parse(form.source, FORM_GRAPHS.sourceGraph, 'text/turtle');

            const options = {
                ...FORM_GRAPHS,
                store: formStore,
                sourceNode: namedNode(instanceId.value)
            };

            const formUri = formStore.any(
                undefined,
                namedNode('http://www.w3.org/1999/02/22-rdf-syntax-ns#type'),
                namedNode('http://lblod.data.gift/vocabularies/forms/Form'),
                FORM_GRAPHS.formGraph
            );

            const isValid = validateForm(formUri, options);
            if (!isValid) {
                errors.push({
                    formId: formType,
                    message: `Er zijn fouten opgetreden in de tab "${formType}". Gelieve deze te verbeteren!`
                });
            }
        }
        return errors;
    }
}


export interface ValidationError {
    formId?: string,
    message: string,
}