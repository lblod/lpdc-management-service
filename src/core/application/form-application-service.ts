import {ConceptRepository} from "../port/driven/persistence/concept-repository";
import {FormDefinitionRepository} from "../port/driven/persistence/form-definition-repository";
import {Iri} from "../domain/shared/iri";
import {CodeRepository} from "../port/driven/persistence/code-repository";
import {SelectFormLanguageDomainService} from "../domain/select-form-language-domain-service";
import {Bestuurseenheid} from "../domain/bestuurseenheid";
import {FormType, PublicationMediumType} from "../domain/types";
import {InstanceRepository} from "../port/driven/persistence/instance-repository";
import {SemanticFormsMapper} from "../port/driven/persistence/semantic-forms-mapper";

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

        const tailoredSchemes =  formType === FormType.CHARACTERISTICS ? await this._codeRepository.loadIPDCOrganisatiesTailoredInTurtleFormat() : [];

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


}