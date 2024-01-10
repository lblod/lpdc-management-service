import {loadFormalInformalChoice, serviceUriForId} from './commonQueries';
import {getChosenForm, selectLanguageVersionForConcept} from "./formalInformalChoice";
import {ConceptSparqlRepository} from "../src/driven/persistence/concept-sparql-repository";
import {Iri} from "../src/core/domain/shared/iri";

export async function getLanguageVersionOfConcept(conceptUUID: string, conceptRepository: ConceptSparqlRepository): Promise<string> {
    const conceptUri = await serviceUriForId(conceptUUID, 'lpdcExt:ConceptualPublicService');
    const concept = await conceptRepository.findById(new Iri(conceptUri));

    const formalInformalChoice = await loadFormalInformalChoice();
    const chosenForm = getChosenForm(formalInformalChoice);

    return selectLanguageVersionForConcept(concept.conceptLanguages, chosenForm);
}