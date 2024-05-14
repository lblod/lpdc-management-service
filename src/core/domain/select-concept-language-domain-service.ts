import {Concept} from "./concept";
import {Language} from "./language";
import {ChosenFormType} from "./types";
import {FormalInformalChoice} from "./formal-informal-choice";
import {ConceptSnapshot} from "./concept-snapshot";

export class SelectConceptLanguageDomainService {

    public async select(conceptOrConceptSnapshot: Concept | ConceptSnapshot, formalInformalChoice: FormalInformalChoice | undefined): Promise<Language> {

        const conceptLanguages = conceptOrConceptSnapshot.definedLanguages;
        const chosenForm: ChosenFormType | undefined = formalInformalChoice?.chosenForm;

        if (chosenForm === ChosenFormType.INFORMAL) {
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
