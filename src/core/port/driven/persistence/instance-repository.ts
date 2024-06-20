import {Iri} from "../../../domain/shared/iri";
import {Instance} from "../../../domain/instance";
import {Bestuurseenheid} from "../../../domain/bestuurseenheid";
import {FormatPreservingDate} from "../../../domain/format-preserving-date";
import {ChosenFormType} from "../../../domain/types";

export interface InstanceRepository {

    findById(bestuurseenheid: Bestuurseenheid, id: Iri): Promise<Instance>;

    save(bestuurseenheid: Bestuurseenheid, instance: Instance): Promise<void>;

    update(bestuurseenheid: Bestuurseenheid, instance: Instance, instanceVersion: FormatPreservingDate, dontUpdateDateModified?: boolean): Promise<void>;

    delete(bestuurseenheid: Bestuurseenheid, id: Iri): Promise<void>;

    updateReviewStatusesForInstances(conceptId: Iri, isConceptFunctionallyChanged: boolean, isConceptArchived: boolean): Promise<void>;

    exists(bestuurseenheid: Bestuurseenheid, instanceId: Iri): Promise<boolean>;

    isDeleted(bestuurseenheid: Bestuurseenheid, instanceId: Iri): Promise<boolean>;

    recreate(bestuurseenheid: Bestuurseenheid, instance: Instance): Promise<void>;

    syncNeedsConversionFromFormalToInformal(bestuurseenheid: Bestuurseenheid, choosenType: ChosenFormType): Promise<void>

}
