import {ConceptVersieRepository} from "../src/core/port/driven/persistence/concept-versie-repository";
import {ConceptVersie} from "../src/core/domain/concept-versie";

export async function isConceptFunctionallyChanged(newSnapshotUri: string, currentSnapshotUri: string, conceptVersieRepository: ConceptVersieRepository): Promise<boolean> {
    if (newSnapshotUri === currentSnapshotUri) {
        return false;
    }

    const currentConceptVersie = await conceptVersieRepository.findById(currentSnapshotUri);
    const newConceptVersie = await conceptVersieRepository.findById(newSnapshotUri);

    return ConceptVersie.isFunctionallyChanged(currentConceptVersie, newConceptVersie);
}
