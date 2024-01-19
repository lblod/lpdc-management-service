import {ConceptRepository} from "../port/driven/persistence/concept-repository";
import {FormDefinitionRepository} from "../port/driven/persistence/form-definition-repository";
import {Iri} from "../domain/shared/iri";
import {CodeRepository} from "../port/driven/persistence/code-repository";
import {SelectFormLanguageDomainService} from "../domain/select-form-language-domain-service";
import {FormalInformalChoiceRepository} from "../port/driven/persistence/formal-informal-choice-repository";
import {Bestuurseenheid} from "../domain/bestuurseenheid";
import {FormType, PublicationMediumType} from "../domain/types";

export class FormApplicationService {

    private readonly _conceptRepository: ConceptRepository;
    private readonly _formDefinitionRepository: FormDefinitionRepository;
    private readonly _codeRepository: CodeRepository;
    private readonly _selectFormLanguageDomainService: SelectFormLanguageDomainService;
    private readonly _formalInformalChoiceRepository: FormalInformalChoiceRepository;

    constructor(
        conceptRepository: ConceptRepository,
        formDefinitionRepository: FormDefinitionRepository,
        codeRepository: CodeRepository,
        selectFormLanguageDomainService: SelectFormLanguageDomainService,
        formalInformalChoiceRepository: FormalInformalChoiceRepository) {
        this._conceptRepository = conceptRepository;
        this._formDefinitionRepository = formDefinitionRepository;
        this._codeRepository = codeRepository;
        this._selectFormLanguageDomainService = selectFormLanguageDomainService;
        this._formalInformalChoiceRepository = formalInformalChoiceRepository;
    }

    async loadConceptForm(bestuurseenheid: Bestuurseenheid, conceptId: Iri, formType: FormType): Promise<{
        form: string,
        meta: string,
        source: string,
        serviceUri: string
    }> {

        const concept = await this._conceptRepository.findById(conceptId);
        const formalInformalChoice = await this._formalInformalChoiceRepository.findByBestuurseenheid(bestuurseenheid);
        const languageForForm = this._selectFormLanguageDomainService.selectForConcept(concept, formalInformalChoice);

        const isEnglishRequired = concept.publicationMedia.includes(PublicationMediumType.YOUREUROPE);
        const formDefinition = this._formDefinitionRepository.loadFormDefinition(formType, languageForForm, isEnglishRequired);

        const tailoredSchemes =  formType === FormType.CHARACTERISTICS ? await this._codeRepository.loadIPDCOrganisatiesTailoredInTurtleFormat() : [];

        return {
            form: formDefinition,
            meta: tailoredSchemes.join("\r\n"),
            source: this._conceptRepository.asTurtleFormat(concept).join("\r\n"),
            serviceUri: conceptId.value,
        };
    }


}