import {Concept} from "./concept";
import {Language} from "./language";
import {ChosenFormType} from "./types";
import {FormalInformalChoiceRepository} from "../port/driven/persistence/formal-informal-choice-repository";
import {Bestuurseenheid} from "./bestuurseenheid";
import {FormalInformalChoice} from "./formal-informal-choice";

export class SelectFormLanguageDomainService {

    private readonly _formalInformalChoiceRepository: FormalInformalChoiceRepository;

    constructor(
        formalInformalChoiceRepository: FormalInformalChoiceRepository,
    ) {
        this._formalInformalChoiceRepository = formalInformalChoiceRepository;
    }

    public async selectForConcept(concept: Concept, bestuurseenheid: Bestuurseenheid): Promise<Language> {
        const formalInformalChoice: FormalInformalChoice | undefined = await this._formalInformalChoiceRepository.findByBestuurseenheid(bestuurseenheid);

        const conceptLanguages = concept.conceptLanguages;
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
