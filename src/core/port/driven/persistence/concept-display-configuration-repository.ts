import {Iri} from "../../../domain/shared/iri";
import {ConceptDisplayConfiguration} from "../../../domain/concept-display-configuration";
import {Bestuurseenheid} from "../../../domain/bestuurseenheid";

export interface ConceptDisplayConfigurationRepository {

    //TODO LPDC-916: write an data-integrity-validation test to verify loading all ConceptDisplayConfigurations (for the cartesian product of each concept, and of each bestuurseenheid; we should find one)

    findByConceptId(bestuurseenheid: Bestuurseenheid, conceptId: Iri): Promise<ConceptDisplayConfiguration | undefined>;

    ensureConceptDisplayConfigurationsForAllBestuurseenheden(conceptId: Iri): Promise<void>;

}