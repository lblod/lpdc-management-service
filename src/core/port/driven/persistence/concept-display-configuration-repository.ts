import {Iri} from "../../../domain/shared/iri";
import {ConceptDisplayConfiguration} from "../../../domain/concept-display-configuration";
import {Bestuurseenheid} from "../../../domain/bestuurseenheid";

export interface ConceptDisplayConfigurationRepository {

    findById(bestuurseenheid: Bestuurseenheid, conceptDisplayConfigurationId: Iri): Promise<ConceptDisplayConfiguration>;

    findByConceptId(bestuurseenheid: Bestuurseenheid, conceptId: Iri): Promise<ConceptDisplayConfiguration>;

    syncInstantiatedFlag(bestuurseenheid: Bestuurseenheid, conceptId: Iri): Promise<void>;

    removeConceptIsNewFlag(bestuurseenheid: Bestuurseenheid, conceptDisplayConfigurationId: Iri): Promise<void>;

    ensureConceptDisplayConfigurationsForAllBestuurseenheden(conceptId: Iri): Promise<void>;

}