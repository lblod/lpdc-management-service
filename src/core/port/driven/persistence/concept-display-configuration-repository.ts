import {Iri} from "../../../domain/shared/iri";
import {ConceptDisplayConfiguration} from "../../../domain/concept-display-configuration";
import {Bestuurseenheid} from "../../../domain/bestuurseenheid";

export interface ConceptDisplayConfigurationRepository {

    findByConceptId(bestuurseenheid: Bestuurseenheid, conceptId: Iri): Promise<ConceptDisplayConfiguration | undefined>;

    removeInstantiatedFlag(bestuurseenheid: Bestuurseenheid, concept: Iri): Promise<void>;

    removeConceptIsNewFlagAndSetInstantiatedFlag(bestuurseenheid: Bestuurseenheid, conceptId: Iri): Promise<void>;

    ensureConceptDisplayConfigurationsForAllBestuurseenheden(conceptId: Iri): Promise<void>;

}