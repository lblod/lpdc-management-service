import {Bestuurseenheid} from "../../../domain/bestuurseenheid";
import {Instance} from "../../../domain/instance";
import {Concept} from "../../../domain/concept";

export interface SemanticFormsMapper {

    instanceAsTurtleFormat(bestuurseenheid: Bestuurseenheid, instance: Instance): string[];

    mergeInstance(bestuurseenheid: Bestuurseenheid, instance: Instance, removalsInTurtleFormat: string, additionsInTurtleFormat: string): Instance;

    conceptAsTurtleFormat(concept: Concept): string[];

}