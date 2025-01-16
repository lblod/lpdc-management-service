import { uuid } from "../../../mu-helper";
import {
  buildBestuurseenheidIri,
  buildConceptDisplayConfigurationIri,
  buildConceptIri,
} from "./iri-test-builder";
import { ConceptDisplayConfigurationBuilder } from "../../../src/core/domain/concept-display-configuration";

export function aFullConceptDisplayConfiguration(): ConceptDisplayConfigurationBuilder {
  const id = uuid();
  return new ConceptDisplayConfigurationBuilder()
    .withId(buildConceptDisplayConfigurationIri(id))
    .withUuid(id)
    .withConceptIsNew(ConceptDisplayConfigurationTestBuilder.CONCEPT_IS_NEW)
    .withConceptIsInstantiated(
      ConceptDisplayConfigurationTestBuilder.CONCEPT_IS_INSTANTIATED,
    )
    .withBestuurseenheidId(buildBestuurseenheidIri(uuid()))
    .withConceptId(buildConceptIri(uuid()));
}

export class ConceptDisplayConfigurationTestBuilder {
  public static readonly CONCEPT_IS_NEW = true;
  public static readonly CONCEPT_IS_INSTANTIATED = false;
}
