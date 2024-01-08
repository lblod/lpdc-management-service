import {Iri} from "../../../domain/shared/iri";
import {ConceptDisplayConfiguration} from "../../../domain/concept-display-configuration";
import {Bestuurseenheid} from "../../../domain/bestuurseenheid";

export interface ConceptDisplayConfigurationRepository {

    findByConceptId(bestuurseenheid: Bestuurseenheid, conceptId: Iri): Promise<ConceptDisplayConfiguration | undefined>;

    ensureConceptDisplayConfigurationsForAllBestuurseenheden(conceptId: Iri): Promise<void>;

}