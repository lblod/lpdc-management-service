import {ConceptRepository} from "../port/driven/persistence/concept-repository";
import {FormDefinitionRepository} from "../port/driven/persistence/form-definition-repository";
import {Iri} from "../domain/shared/iri";
import {CodeRepository} from "../port/driven/persistence/code-repository";
import {SelectFormLanguageDomainService} from "../domain/select-form-language-domain-service";
import {Bestuurseenheid} from "../domain/bestuurseenheid";
import {FormType, PublicationMediumType} from "../domain/types";
import {InstanceRepository} from "../port/driven/persistence/instance-repository";
import {SemanticFormsMapper} from "../port/driven/persistence/semantic-forms-mapper";
import {validateForm} from '@lblod/submission-form-helpers';
import ForkingStore from "forking-store";
import {namedNode} from "rdflib";
import {FORM_ID_TO_TYPE_MAPPING, FORM_MAPPING_TRANSLATIONS} from "../../../config";

export class FormApplicationService {

    private readonly _conceptRepository: ConceptRepository;
    private readonly _instanceRepository: InstanceRepository;
    private readonly _formDefinitionRepository: FormDefinitionRepository;
    private readonly _codeRepository: CodeRepository;
    private readonly _selectFormLanguageDomainService: SelectFormLanguageDomainService;
    private readonly _semanticFormsMapper: SemanticFormsMapper;

    constructor(
        conceptRepository: ConceptRepository,
        instanceRepository: InstanceRepository,
        formDefinitionRepository: FormDefinitionRepository,
        codeRepository: CodeRepository,
        selectFormLanguageDomainService: SelectFormLanguageDomainService,
        semanticFormsMapper: SemanticFormsMapper,
    ) {
        this._conceptRepository = conceptRepository;
        this._instanceRepository = instanceRepository;
        this._formDefinitionRepository = formDefinitionRepository;
        this._codeRepository = codeRepository;
        this._selectFormLanguageDomainService = selectFormLanguageDomainService;
        this._semanticFormsMapper = semanticFormsMapper;
    }

    async loadConceptForm(bestuurseenheid: Bestuurseenheid, conceptId: Iri, formType: FormType): Promise<{
        form: string,
        meta: string,
        source: string,
        serviceUri: string
    }> {

        const concept = await this._conceptRepository.findById(conceptId);
        const languageForForm = await this._selectFormLanguageDomainService.selectForConcept(concept, bestuurseenheid);

        const isEnglishRequired = concept.publicationMedia.includes(PublicationMediumType.YOUREUROPE);
        const formDefinition = this._formDefinitionRepository.loadFormDefinition(formType, languageForForm, isEnglishRequired);

        const tailoredSchemes = formType === FormType.CHARACTERISTICS ? await this._codeRepository.loadIPDCOrganisatiesTailoredInTurtleFormat() : [];

        return {
            form: formDefinition,
            meta: tailoredSchemes.join("\r\n"),
            source: this._semanticFormsMapper.conceptAsTurtleFormat(concept).join("\r\n"),
            serviceUri: conceptId.value,
        };
    }

    async loadInstanceForm(bestuurseenheid: Bestuurseenheid, instanceId: Iri, formType: FormType): Promise<{
        form: string,
        meta: string,
        source: string,
        serviceUri: string
    }> {

        const instance = await this._instanceRepository.findById(bestuurseenheid, instanceId);
        const languageForForm = await this._selectFormLanguageDomainService.selectForInstance(instance, bestuurseenheid);

        const isEnglishRequired = instance.publicationMedia.includes(PublicationMediumType.YOUREUROPE);
        const formDefinition = this._formDefinitionRepository.loadFormDefinition(formType, languageForForm, isEnglishRequired);

        const tailoredSchemes = formType === FormType.CHARACTERISTICS ? await this._codeRepository.loadIPDCOrganisatiesTailoredInTurtleFormat() : [];

        return {
            form: formDefinition,
            meta: tailoredSchemes.join("\r\n"),
            source: this._semanticFormsMapper.instanceAsTurtleFormat(bestuurseenheid, instance).join("\r\n"),
            serviceUri: instanceId.value,
        };
    }

    async validateForms(instanceId: Iri, bestuurseenheid: Bestuurseenheid): Promise<ValidationError[]> {
        const errors = [];
        for (const formId of Object.keys(FORM_ID_TO_TYPE_MAPPING)) {
            const form = await this.loadInstanceForm(bestuurseenheid, instanceId, FORM_ID_TO_TYPE_MAPPING[formId]);

            const FORM_GRAPHS = {
                formGraph: namedNode('http://data.lblod.info/form'),
                metaGraph: namedNode('http://data.lblod.info/metagraph'),
                sourceGraph: namedNode(`http://data.lblod.info/sourcegraph`),
            };

            const formStore = new ForkingStore();
            formStore.parse(form.form, FORM_GRAPHS.formGraph, 'text/turtle');
            formStore.parse(form.meta, FORM_GRAPHS.metaGraph, 'text/turtle');
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
                    formId: formId,
                    formUri: "http://data.lblod.info/id/forms/" + formId,
                    message: `Er zijn fouten opgetreden in de tab "${FORM_MAPPING_TRANSLATIONS[formId]}". Gelieve deze te verbeteren!`
                });
            }
        }
        return errors;
    }
}


export interface ValidationError {
    formId?: string,
    formUri?: string,
    message: string,
}