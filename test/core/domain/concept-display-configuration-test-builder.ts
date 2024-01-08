import {uuid} from "../../../mu-helper";
import {buildBestuurseenheidIri, buildConceptDisplayConfigurationIri, buildConceptIri} from "./iri-test-builder";
import {Iri} from "../../../src/core/domain/shared/iri";
import {ConceptDisplayConfiguration} from "../../../src/core/domain/concept-display-configuration";

export function aFullConceptDisplayConfiguration(): ConceptDisplayConfigurationTestBuilder {
    const id = uuid();
    return new ConceptDisplayConfigurationTestBuilder()
        .withId(buildConceptDisplayConfigurationIri(id))
        .withUuid(id)
        .withConceptIsNew(ConceptDisplayConfigurationTestBuilder.CONCEPT_IS_NEW)
        .withConceptIsInstantiated(ConceptDisplayConfigurationTestBuilder.CONCEPT_IS_INSTANTIATED)
        .withBestuurseenheidId(buildBestuurseenheidIri(uuid()))
        .withConceptId(buildConceptIri(uuid()));
}

export class ConceptDisplayConfigurationTestBuilder {

    public static readonly CONCEPT_IS_NEW = true;
    public static readonly CONCEPT_IS_INSTANTIATED = true;

    private id: Iri;
    private uuid: string;
    private conceptIsNew: boolean;
    private conceptIsInstantiated: boolean;
    private bestuurseenheidId: Iri;
    private conceptId: Iri;

    public withId(id: Iri): ConceptDisplayConfigurationTestBuilder {
        this.id = id;
        return this;
    }

    public withUuid(uuid: string): ConceptDisplayConfigurationTestBuilder {
        this.uuid = uuid;
        return this;
    }

    public withConceptIsNew(conceptIsNew: boolean): ConceptDisplayConfigurationTestBuilder {
        this.conceptIsNew = conceptIsNew;
        return this;
    }

    public withConceptIsInstantiated(conceptIsInstantiated: boolean): ConceptDisplayConfigurationTestBuilder {
        this.conceptIsInstantiated = conceptIsInstantiated;
        return this;
    }

    public withBestuurseenheidId(bestuurseenheidId: Iri): ConceptDisplayConfigurationTestBuilder {
        this.bestuurseenheidId = bestuurseenheidId;
        return this;
    }

    public withConceptId(conceptId: Iri): ConceptDisplayConfigurationTestBuilder {
        this.conceptId = conceptId;
        return this;
    }

    public build(): ConceptDisplayConfiguration {
        return new ConceptDisplayConfiguration(
            this.id,
            this.uuid,
            this.conceptIsNew,
            this.conceptIsInstantiated,
            this.bestuurseenheidId,
            this.conceptId,
        );
    }
}