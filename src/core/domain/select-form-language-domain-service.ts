import {Concept} from "./concept";
import {FormalInformalChoice} from "./formal-informal-choice";
import {Language} from "./language";
import {ChosenFormType} from "./types";

export class SelectFormLanguageDomainService {

    //TODO LPDC-917: we can move the loading for the formal informal choice in this service, and provide a bestuurseenheid instaed ... its better encapsulated then.
    public selectForConcept(concept: Concept, formalInformalChoice: FormalInformalChoice | undefined): Language {
        const conceptLanguages = concept.conceptDutchLanguages;
        if (formalInformalChoice?.chosenForm === ChosenFormType.INFORMAL) {
            if (conceptLanguages.includes(Language.INFORMAL)) {
                return Language.INFORMAL;
            } else if (conceptLanguages.includes(Language.GENERATED_INFORMAL)) {
                return Language.GENERATED_INFORMAL;
            }
            return Language.NL;
        } else {
            if (conceptLanguages.includes(Language.FORMAL)) {
                return Language.FORMAL;
            } else if (conceptLanguages.includes(Language.GENERATED_FORMAL)
                && conceptLanguages.includes(Language.INFORMAL)) {
                return Language.GENERATED_FORMAL;
            }
            return Language.NL;
        }
    }
}