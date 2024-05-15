import {Concept} from "./concept";
import {Language} from "./language";
import {ConceptSnapshot} from "./concept-snapshot";
import {FormalInformalChoice} from "./formal-informal-choice";
import {ChosenFormType} from "./types";

export class SelectConceptLanguageDomainService {

    public selectAvailableLanguageUsingFormalInformalChoice(conceptOrConceptSnapshot: Concept | ConceptSnapshot, formalInformalChoice: FormalInformalChoice | undefined): Language {
        return this.selectAvailableLanguage(conceptOrConceptSnapshot, formalInformalChoice?.chosenForm === ChosenFormType.INFORMAL);
    }

    public selectAvailableLanguage(conceptOrConceptSnapshot: Concept | ConceptSnapshot, informalLanguageVariantRequired: boolean): Language {

        const conceptLanguages = conceptOrConceptSnapshot.definedLanguages;

        if (informalLanguageVariantRequired) {
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
