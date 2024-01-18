import {ConceptRepository} from "../port/driven/persistence/concept-repository";
import {FormDefinitionRepository} from "../port/driven/persistence/form-definition-repository";
import {Iri} from "../domain/shared/iri";

export class FormApplicationService {

    private readonly _conceptRepository: ConceptRepository;
    private readonly _formRepository: FormDefinitionRepository;

    constructor(
        conceptRepository: ConceptRepository,
        formRepository: FormDefinitionRepository) {
        this._conceptRepository = conceptRepository;
        this._formRepository = formRepository;
    }

    async loadConceptForm(conceptId: Iri, formId: string): Promise<{
        form: string,
        meta: string,
        source: string,
        serviceUri: string
    }> {
        return undefined;
    }


}