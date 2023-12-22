import {
    loadCosts,
    loadEvidences,
    loadFinancialAdvantages,
    loadOnlineProcedureRules,
    loadPublicService,
    loadRequirements,
    loadRules,
    loadWebsites
} from "./commonQueries";
import {isEqual, sortBy} from "lodash";
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
        || isValueChangedInSet(currentSnapshotTriples, currentSnapshotUri, newSnapshotTriples, newSnapshotUri, Predicates.thematicArea)
        || isValueChangedInSet(currentSnapshotTriples, currentSnapshotUri, newSnapshotTriples, newSnapshotUri, Predicates.competentAuthorityLevel)
        || isValueChangedInSet(currentSnapshotTriples, currentSnapshotUri, newSnapshotTriples, newSnapshotUri, Predicates.hasCompetentAuthority)
        || isValueChangedInSet(currentSnapshotTriples, currentSnapshotUri, newSnapshotTriples, newSnapshotUri, Predicates.executingAuthorityLevel)
        || isValueChangedInSet(currentSnapshotTriples, currentSnapshotUri, newSnapshotTriples, newSnapshotUri, Predicates.hasExecutingAuthority)
        || isValueChangedInSet(currentSnapshotTriples, currentSnapshotUri, newSnapshotTriples, newSnapshotUri, Predicates.keywords)
        || isValueChangedInSet(currentSnapshotTriples, currentSnapshotUri, newSnapshotTriples, newSnapshotUri, Predicates.publicationMedium)
        || isValueChangedInSet(currentSnapshotTriples, currentSnapshotUri, newSnapshotTriples, newSnapshotUri, Predicates.yourEuropeCategory)
        || compareRequirement(currentSnapshotTriples, currentSnapshotUri, newSnapshotTriples, newSnapshotUri)
        || compareProcedure(currentSnapshotTriples, currentSnapshotUri, newSnapshotTriples, newSnapshotUri)
        || compareCost(currentSnapshotTriples, currentSnapshotUri, newSnapshotTriples, newSnapshotUri)
        || compareFinancialAdvantage(currentSnapshotTriples, currentSnapshotUri, newSnapshotTriples, newSnapshotUri)
        || compareMoreInfo(currentSnapshotTriples, currentSnapshotUri, newSnapshotTriples, newSnapshotUri);
}

function isValueChangedForAnyLanguage(currentSnapshotTriples: any[], currentSnapshotUri: string, newSnapshotTriples: any[], newSnapshotUri: string, predicate: string): boolean {
    const languages = ['nl', 'en'];
    return languages.some(language => {
        const triple1 = findTriples(currentSnapshotTriples, currentSnapshotUri, predicate, language)[0];
        const triple2 = findTriples(newSnapshotTriples, newSnapshotUri, predicate, language)[0];
        return triple1?.o?.value !== triple2?.o?.value;
    });
}

function isValueChangedInSet(currentSnapshotTriples: any[], currentSnapshotUri: string, newSnapshotTriples: any[], newSnapshotUri: string, predicate: string): boolean {
    const currentValues = findTriples(currentSnapshotTriples, currentSnapshotUri, predicate).map(triple => triple.o.value);
    const newValues = findTriples(newSnapshotTriples, newSnapshotUri, predicate).map(triple => triple.o.value);
    return !isEqual(currentValues.sort(), newValues.sort());
}

function isValueChanged(currentSnapshotTriples: any[], currentSnapshotUri: string, newSnapshotTriples: any[], newSnapshotUri: string, predicate: string): boolean {
    const triple1 = findTriples(currentSnapshotTriples, currentSnapshotUri, predicate)[0];
    const triple2 = findTriples(newSnapshotTriples, newSnapshotUri, predicate)[0];
    return triple1?.o?.value !== triple2?.o?.value;
}

function findTriples(snapshotTriples: any[], subject: string, predicate: string, language?: string): any[] {
    return snapshotTriples
        .filter(triple => triple.s.value === subject)
        .filter(triple => triple.p.value === predicate)
        .filter(triple => language ? triple.o['xml:lang'] === language : true);
}

function compareRequirement(currentSnapshotTriples: any[], currentSnapshotUri: string, newSnapshotTriples: any[], newSnapshotUri: string): boolean {
    const currentRequirementIds = findTriples(currentSnapshotTriples, currentSnapshotUri, Predicates.hasRequirement).map(triple => triple.o.value);
    const currentSortedRequirementIds = sortBy(currentRequirementIds, requirementId => findTriples(currentSnapshotTriples, requirementId, Predicates.order)[0].o.value);

    const newRequirementIds = findTriples(newSnapshotTriples, newSnapshotUri, Predicates.hasRequirement).map(triple => triple.o.value);
    const newSortedRequirementIds = sortBy(newRequirementIds, requirementId => findTriples(newSnapshotTriples, requirementId, Predicates.order)[0].o.value);

    if (currentSortedRequirementIds.length !== newSortedRequirementIds.length) {
        return true;
    }
    const changes = [];
    for (let i = 0; i < currentSortedRequirementIds.length; i++) {
        const currentEvidenceUri = findTriples(currentSnapshotTriples, currentSortedRequirementIds[i], Predicates.hasSupportingEvidence)[0]?.o?.value;
        const newEvidenceUri = findTriples(newSnapshotTriples, newSortedRequirementIds[i], Predicates.hasSupportingEvidence)[0]?.o?.value;

        if (!!currentEvidenceUri !== !!newEvidenceUri) {
            return true;
        }

        changes.push(
            isValueChangedForAnyLanguage(currentSnapshotTriples, currentSortedRequirementIds[i], newSnapshotTriples, newSortedRequirementIds[i], Predicates.title)
            || isValueChangedForAnyLanguage(currentSnapshotTriples, currentSortedRequirementIds[i], newSnapshotTriples, newSortedRequirementIds[i], Predicates.description)
            || isValueChangedForAnyLanguage(currentSnapshotTriples, currentEvidenceUri, newSnapshotTriples, newEvidenceUri, Predicates.title)
            || isValueChangedForAnyLanguage(currentSnapshotTriples, currentEvidenceUri, newSnapshotTriples, newEvidenceUri, Predicates.description)
        );
    }
    return changes.some(it => it);
}

function compareProcedure(currentSnapshotTriples: any[], currentSnapshotUri: string, newSnapshotTriples: any[], newSnapshotUri: string): boolean {
    const currentProcedureIds = findTriples(currentSnapshotTriples, currentSnapshotUri, Predicates.hasProcedure).map(triple => triple.o.value);
    const currentSortedProcedureIds = sortBy(currentProcedureIds, procedureUri => findTriples(currentSnapshotTriples, procedureUri, Predicates.order)[0].o.value);

    const newProcedureIds = findTriples(newSnapshotTriples, newSnapshotUri, Predicates.hasProcedure).map(triple => triple.o.value);
    const newSortedProcedureIds = sortBy(newProcedureIds, procedureUri => findTriples(newSnapshotTriples, procedureUri, Predicates.order)[0].o.value);

    if (currentSortedProcedureIds.length !== newSortedProcedureIds.length) {
        return true;
    }
    const changes = [];
    for (let i = 0; i < currentSortedProcedureIds.length; i++) {
        const currentWebsiteUris = findTriples(currentSnapshotTriples, currentSortedProcedureIds[i], Predicates.hasWebsite).map(triple => triple.o.value);
        const sortedCurrentWebsiteUris = sortBy(currentWebsiteUris, websiteUri => findTriples(currentSnapshotTriples, websiteUri, Predicates.order)[0].o.value);

        const newWebsiteUris = findTriples(newSnapshotTriples, newSortedProcedureIds[i], Predicates.hasWebsite).map(triple => triple.o.value);
        const sortedNewWebsiteUris = sortBy(newWebsiteUris, websiteUri => findTriples(newSnapshotTriples, websiteUri, Predicates.order)[0].o.value);

        if (sortedCurrentWebsiteUris.length !== sortedNewWebsiteUris.length) {
            return true;
        }

        for (let i = 0; i < sortedCurrentWebsiteUris.length; i++) {
            changes.push(
                isValueChangedForAnyLanguage(currentSnapshotTriples, sortedCurrentWebsiteUris[i], newSnapshotTriples, sortedNewWebsiteUris[i], Predicates.title)
                || isValueChangedForAnyLanguage(currentSnapshotTriples, sortedCurrentWebsiteUris[i], newSnapshotTriples, sortedNewWebsiteUris[i], Predicates.description)
                || isValueChanged(currentSnapshotTriples, sortedCurrentWebsiteUris[i], newSnapshotTriples, sortedNewWebsiteUris[i], Predicates.url)
            );
        }

        changes.push(
            isValueChangedForAnyLanguage(currentSnapshotTriples, currentSortedProcedureIds[i], newSnapshotTriples, newSortedProcedureIds[i], Predicates.title)
            || isValueChangedForAnyLanguage(currentSnapshotTriples, currentSortedProcedureIds[i], newSnapshotTriples, newSortedProcedureIds[i], Predicates.description)
        );
    }
    return changes.some(it => it);
}

function compareCost(currentSnapshotTriples: any[], currentSnapshotUri: string, newSnapshotTriples: any[], newSnapshotUri: string): boolean {
    const currentCostIds = findTriples(currentSnapshotTriples, currentSnapshotUri, Predicates.hasCost).map(triple => triple.o.value);
    const currentSortedCostIds = sortBy(currentCostIds, costId => findTriples(currentSnapshotTriples, costId, Predicates.order)[0].o.value);

    const newCostIds = findTriples(newSnapshotTriples, newSnapshotUri, Predicates.hasCost).map(triple => triple.o.value);
    const newSortedCostIds = sortBy(newCostIds, costId => findTriples(newSnapshotTriples, costId, Predicates.order)[0].o.value);

    if (currentSortedCostIds.length !== newSortedCostIds.length) {
        return true;
    }
    const changes = [];
    for (let i = 0; i < currentSortedCostIds.length; i++) {
        changes.push(
            isValueChangedForAnyLanguage(currentSnapshotTriples, currentSortedCostIds[i], newSnapshotTriples, newSortedCostIds[i], Predicates.title)
            || isValueChangedForAnyLanguage(currentSnapshotTriples, currentSortedCostIds[i], newSnapshotTriples, newSortedCostIds[i], Predicates.description)
        );
    }
    return changes.some(it => it);
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

function compareMoreInfo(currentSnapshotTriples: any[], currentSnapshotUri: string, newSnapshotTriples: any[], newSnapshotUri: string): boolean {
    const currentWebsiteIds = findTriples(currentSnapshotTriples, currentSnapshotUri, Predicates.hasMoreInfo).map(triple => triple.o.value);
    const currentSortedWebsiteIds = sortBy(currentWebsiteIds, costId => findTriples(currentSnapshotTriples, costId, Predicates.order)[0].o.value);

    const newWebsiteIds = findTriples(newSnapshotTriples, newSnapshotUri, Predicates.hasMoreInfo).map(triple => triple.o.value);
    const newSortedWebsiteIds = sortBy(newWebsiteIds, costId => findTriples(newSnapshotTriples, costId, Predicates.order)[0].o.value);

    if (currentSortedWebsiteIds.length !== newSortedWebsiteIds.length) {
        return true;
    }
    const changes = [];
    for (let i = 0; i < currentSortedWebsiteIds.length; i++) {
        changes.push(
            isValueChangedForAnyLanguage(currentSnapshotTriples, currentSortedWebsiteIds[i], newSnapshotTriples, newSortedWebsiteIds[i], Predicates.title)
            || isValueChangedForAnyLanguage(currentSnapshotTriples, currentSortedWebsiteIds[i], newSnapshotTriples, newSortedWebsiteIds[i], Predicates.description)
            || isValueChanged(currentSnapshotTriples, currentSortedWebsiteIds[i], newSnapshotTriples, newSortedWebsiteIds[i], Predicates.url)
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
    results.push(await loadEvidences(snapshotUri, {graph, type, includeUuid, sudo}));
    results.push(await loadRequirements(snapshotUri, {graph, type, includeUuid, sudo}));
    results.push(await loadOnlineProcedureRules(snapshotUri, {graph, type, includeUuid, sudo}));
    results.push(await loadRules(snapshotUri, {graph, type, includeUuid, sudo}));
    results.push(await loadCosts(snapshotUri, {graph, type, includeUuid, sudo}));
    results.push(await loadFinancialAdvantages(snapshotUri, {graph, type, includeUuid, sudo}));
    results.push(await loadWebsites(snapshotUri, {graph, type, includeUuid, sudo}));
    results.push(await loadPublicService(snapshotUri, {graph, type, includeUuid, sudo}));
    return results.reduce((acc, b) => [...acc, ...b]);
}

const Predicates = {
    title: 'http://purl.org/dc/terms/title',
    description: 'http://purl.org/dc/terms/description',
    additionalDescription: 'https://productencatalogus.data.vlaanderen.be/ns/ipdc-lpdc#additionalDescription',
    exception: 'https://productencatalogus.data.vlaanderen.be/ns/ipdc-lpdc#exception',
    regulation: 'https://productencatalogus.data.vlaanderen.be/ns/ipdc-lpdc#regulation',
    startDate: 'http://schema.org/startDate',
    endDate: 'http://schema.org/endDate',
    productType: 'http://purl.org/dc/terms/type',
    targetAudience: 'https://productencatalogus.data.vlaanderen.be/ns/ipdc-lpdc#targetAudience',
    thematicArea: 'http://data.europa.eu/m8g/thematicArea',
    competentAuthorityLevel: 'https://productencatalogus.data.vlaanderen.be/ns/ipdc-lpdc#competentAuthorityLevel',
    hasCompetentAuthority: 'http://data.europa.eu/m8g/hasCompetentAuthority',
    executingAuthorityLevel: 'https://productencatalogus.data.vlaanderen.be/ns/ipdc-lpdc#executingAuthorityLevel',
    hasExecutingAuthority: 'https://productencatalogus.data.vlaanderen.be/ns/ipdc-lpdc#hasExecutingAuthority',
    keywords: 'http://www.w3.org/ns/dcat#keyword',
    publicationMedium: 'https://productencatalogus.data.vlaanderen.be/ns/ipdc-lpdc#publicationMedium',
    yourEuropeCategory: 'https://productencatalogus.data.vlaanderen.be/ns/ipdc-lpdc#yourEuropeCategory',
    hasRequirement: 'http://vocab.belgif.be/ns/publicservice#hasRequirement',
    hasSupportingEvidence: 'http://data.europa.eu/m8g/hasSupportingEvidence',
    order: 'http://www.w3.org/ns/shacl#order',
    hasProcedure: 'http://purl.org/vocab/cpsv#follows',
    hasWebsite: 'https://productencatalogus.data.vlaanderen.be/ns/ipdc-lpdc#hasWebsite',
    url: 'http://schema.org/url',
    hasCost: 'http://data.europa.eu/m8g/hasCost',
    hasFinancialAdvantage: 'http://purl.org/vocab/cpsv#produces',
    hasMoreInfo: 'http://www.w3.org/2000/01/rdf-schema#seeAlso'
};