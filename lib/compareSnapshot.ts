import {loadFinancialAdvantages, loadPublicService} from "./commonQueries";
import {sortBy} from "lodash";
import {ConceptVersieRepository} from "../src/core/port/driven/persistence/concept-versie-repository";
import {ConceptVersie} from "../src/core/domain/concept-versie";

export async function isConceptFunctionallyChanged(newSnapshotUri: string, currentSnapshotUri: string, conceptVersieRepository: ConceptVersieRepository): Promise<boolean> {
    if (newSnapshotUri === currentSnapshotUri) {
        return false;
    }
    const currentSnapshotTriples = await loadConceptSnapshot(currentSnapshotUri);
    const newSnapshotTriples = await loadConceptSnapshot(newSnapshotUri);

    const currentConceptVersie = await conceptVersieRepository.findById(currentSnapshotUri);
    const newConceptVersie = await conceptVersieRepository.findById(newSnapshotUri);

    return ConceptVersie.isFunctionallyChanged(currentConceptVersie, newConceptVersie)
        || compareFinancialAdvantage(currentSnapshotTriples, currentSnapshotUri, newSnapshotTriples, newSnapshotUri);
}

function isValueChangedForAnyLanguage(currentSnapshotTriples: any[], currentSnapshotUri: string, newSnapshotTriples: any[], newSnapshotUri: string, predicate: string): boolean {
    const languages = ['nl', 'en'];
    return languages.some(language => {
        const triple1 = findTriples(currentSnapshotTriples, currentSnapshotUri, predicate, language)[0];
        const triple2 = findTriples(newSnapshotTriples, newSnapshotUri, predicate, language)[0];
        return triple1?.o?.value !== triple2?.o?.value;
    });
}

function findTriples(snapshotTriples: any[], subject: string, predicate: string, language?: string): any[] {
    return snapshotTriples
        .filter(triple => triple.s.value === subject)
        .filter(triple => triple.p.value === predicate)
        .filter(triple => language ? triple.o['xml:lang'] === language : true);
}

function compareFinancialAdvantage(currentSnapshotTriples: any[], currentSnapshotUri: string, newSnapshotTriples: any[], newSnapshotUri: string): boolean {
    const currentFinancialAdvantageIds = findTriples(currentSnapshotTriples, currentSnapshotUri, Predicates.hasFinancialAdvantage).map(triple => triple.o.value);
    const currentSortedFinancialAdvantageIds = sortBy(currentFinancialAdvantageIds, costId => findTriples(currentSnapshotTriples, costId, Predicates.order)[0].o.value);

    const newFinancialAdvantageIds = findTriples(newSnapshotTriples, newSnapshotUri, Predicates.hasFinancialAdvantage).map(triple => triple.o.value);
    const newSortedFinancialAdvantageIds = sortBy(newFinancialAdvantageIds, costId => findTriples(newSnapshotTriples, costId, Predicates.order)[0].o.value);

    if (currentSortedFinancialAdvantageIds.length !== newSortedFinancialAdvantageIds.length) {
        return true;
    }
    const changes = [];
    for (let i = 0; i < currentSortedFinancialAdvantageIds.length; i++) {
        changes.push(
            isValueChangedForAnyLanguage(currentSnapshotTriples, currentSortedFinancialAdvantageIds[i], newSnapshotTriples, newSortedFinancialAdvantageIds[i], Predicates.title)
            || isValueChangedForAnyLanguage(currentSnapshotTriples, currentSortedFinancialAdvantageIds[i], newSnapshotTriples, newSortedFinancialAdvantageIds[i], Predicates.description)
        );
    }
    return changes.some(it => it);
}

async function loadConceptSnapshot(snapshotUri: string): Promise<any[]> {
    const type = 'lpdcExt:ConceptualPublicService';
    const graph = 'http://mu.semte.ch/graphs/lpdc/ldes-data';
    const sudo = true;
    const includeUuid = true;

    const results = [];
    results.push(await loadFinancialAdvantages(snapshotUri, {graph, type, includeUuid, sudo}));
    results.push(await loadPublicService(snapshotUri, {graph, type, includeUuid, sudo}));
    return results.reduce((acc, b) => [...acc, ...b]);
}

const Predicates = {
    title: 'http://purl.org/dc/terms/title',
    description: 'http://purl.org/dc/terms/description',
    order: 'http://www.w3.org/ns/shacl#order',
    hasFinancialAdvantage: 'http://purl.org/vocab/cpsv#produces',
};