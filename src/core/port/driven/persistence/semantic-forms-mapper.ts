import {Bestuurseenheid} from "../../../domain/bestuurseenheid";
import {Instance} from "../../../domain/instance";
import {Concept} from "../../../domain/concept";
import {ConceptSnapshot} from "../../../domain/concept-snapshot";
import {Iri} from "../../../domain/shared/iri";

export interface SemanticFormsMapper {

    instanceAsTurtleFormat(bestuurseenheid: Bestuurseenheid, instance: Instance): string[];

    mergeInstance(bestuurseenheid: Bestuurseenheid, instance: Instance, removalsInTurtleFormat: string, additionsInTurtleFormat: string): Instance;

    conceptAsTurtleFormat(concept: Concept): string[];

    conceptSnapshotAsTurtleFormat(conceptSnapshot: ConceptSnapshot): string[];

    comparisonSourceAsTurtleFormat(comparisonSources: ComparisonSource[], type: "current" | "latest"): string[];

}

export interface ComparisonSource {
    instanceSourceIri: Iri,
    conceptSnapshotSourceIri: Iri
}