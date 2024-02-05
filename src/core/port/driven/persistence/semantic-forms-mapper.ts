import {Bestuurseenheid} from "../../../domain/bestuurseenheid";
import {Instance} from "../../../domain/instance";
import {Concept} from "../../../domain/concept";
import {Iri} from "../../../domain/shared/iri";

export interface SemanticFormsMapper {

    instanceAsTurtleFormat(bestuurseenheid: Bestuurseenheid, instance: Instance): string[];

    instanceFromTurtleFormat(bestuurseenheid: Bestuurseenheid, instanceId: Iri, instanceInTurtleFormat: string): Instance;

    mergeInstance(bestuurseenheid: Bestuurseenheid, instance: Instance, removalsInTurtleFormat: string, additionsInTurtleFormat: string): Instance;

    conceptAsTurtleFormat(concept: Concept): string[];

}