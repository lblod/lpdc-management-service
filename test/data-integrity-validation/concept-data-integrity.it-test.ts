import {END2END_TEST_SPARQL_ENDPOINT} from "../test.config";
import {DirectDatabaseAccess} from "../driven/persistence/direct-database-access";
import {SparqlQuerying} from "../../src/driven/persistence/sparql-querying";
import {DomainToQuadsMapper} from "../../src/driven/persistence/domain-to-quads-mapper";
import {CONCEPT_GRAPH, PREFIX} from "../../config";
import {Statement} from "rdflib";
import {isEqual, shuffle, sortedUniq, uniq} from "lodash";
import {ConceptSnapshotSparqlRepository} from "../../src/driven/persistence/concept-snapshot-sparql-repository";
import {ConceptSparqlRepository} from "../../src/driven/persistence/concept-sparql-repository";
import {Iri} from "../../src/core/domain/shared/iri";
import {asSortedArray} from "../../src/core/domain/shared/collections-helper";
import {
    DatastoreToQuadsRecursiveSparqlFetcher
} from "../../src/driven/persistence/datastore-to-quads-recursive-sparql-fetcher";
import {NS} from "../../src/driven/persistence/namespaces";
import {sparqlEscapeUri} from "../../mu-helper";
import {Concept} from "../../src/core/domain/concept";
import {ConceptSnapshot} from "../../src/core/domain/concept-snapshot";
import {LanguageString} from "../../src/core/domain/language-string";
import {FormatPreservingDate} from "../../src/core/domain/format-preserving-date";
import {Requirement} from "../../src/core/domain/requirement";
import {Procedure} from "../../src/core/domain/procedure";
import {Website} from "../../src/core/domain/website";
import {Cost} from "../../src/core/domain/cost";
import {FinancialAdvantage} from "../../src/core/domain/financial-advantage";
import {LegalResource} from "../../src/core/domain/legal-resource";
import fs from "fs";

describe('Concept Data Integrity Validation', () => {

    const endPoint = END2END_TEST_SPARQL_ENDPOINT; //Note: replace by END2END_TEST_SPARQL_ENDPOINT to verify all

    const repository = new ConceptSparqlRepository(endPoint);
    const snapshotRepository = new ConceptSnapshotSparqlRepository(endPoint);
    const directDatabaseAccess = new DirectDatabaseAccess(endPoint);
    const sparqlQuerying = new SparqlQuerying(endPoint);
    const conceptGraph = new Iri(CONCEPT_GRAPH);
    const domainToQuadsMapper = new DomainToQuadsMapper(conceptGraph);

    test.skip('Load all concepts; print errors to console.log', async () => {

        const conceptIdsQuery = `
            ${PREFIX.lpdcExt}
            SELECT ?id WHERE {
                GRAPH ${sparqlEscapeUri(conceptGraph)} {
                    ?id a lpdcExt:ConceptualPublicService .
                }
            }
        `;
        const conceptIds = await directDatabaseAccess.list(conceptIdsQuery);

        const allTriplesOfGraphQuery = `
             ${PREFIX.lpdcExt}
            SELECT ?s ?p ?o WHERE {
                GRAPH ${sparqlEscapeUri(conceptGraph)} {
                    ?s ?p ?o
                }
            }
        `;

        const allTriplesOfGraph = await directDatabaseAccess.list(allTriplesOfGraphQuery);
        let allQuadsOfGraph: Statement[] = uniq(sparqlQuerying.asQuads(allTriplesOfGraph, conceptGraph.value));

        //filter out all triples linked to account subjects
        allQuadsOfGraph = allQuadsOfGraph.filter(q => !q.subject.value.startsWith('http://data.lblod.info/id/account/'));

        //filter out all triples linked to adressen subjects
        allQuadsOfGraph = allQuadsOfGraph.filter(q => !q.subject.value.startsWith('http://data.lblod.info/id/adressen/'));

        //filter out all triples linked to persoon subjects
        allQuadsOfGraph = allQuadsOfGraph.filter(q => !q.subject.value.startsWith('http://data.lblod.info/id/persoon/'));

        //filter out all triples linked to bestuurseenheden subjects
        allQuadsOfGraph = allQuadsOfGraph.filter(q => !q.subject.value.startsWith('http://data.lblod.info/id/bestuurseenheden/'));

        //filter out all triples linked to werkingsgebieden subjects
        allQuadsOfGraph = allQuadsOfGraph.filter(q => !q.subject.value.startsWith('http://data.lblod.info/id/werkingsgebieden/'));

        //filter out all triples linked to werkingsgebieden subjects
        allQuadsOfGraph = allQuadsOfGraph.filter(q => !q.subject.value.startsWith('http://data.lblod.info/werkingsgebieden/id/'));

        //filter out all triples linked to BestuurseenheidClassificatieCode subjects
        allQuadsOfGraph = allQuadsOfGraph.filter(q => !q.subject.value.startsWith('http://data.vlaanderen.be/id/concept/BestuurseenheidClassificatieCode/'));

        //filter out all triples linked to http://lblod.data.gift/concept-schemes/ subjects
        allQuadsOfGraph = allQuadsOfGraph.filter(q => !q.subject.value.startsWith('http://lblod.data.gift/concept-schemes/'));

        //filter out all triples linked to http://lblod.data.gift/concepts/ subjects
        allQuadsOfGraph = allQuadsOfGraph.filter(q => !q.subject.value.startsWith('http://lblod.data.gift/concepts/'));

        //filter out all triples linked to https://productencatalogus.data.vlaanderen.be/id/concept/ subjects
        allQuadsOfGraph = allQuadsOfGraph.filter(q => !q.subject.value.startsWith('https://productencatalogus.data.vlaanderen.be/id/concept/'));

        //filter out all triples linked to https://productencatalogus.data.vlaanderen.be/id/conceptscheme/ subjects
        allQuadsOfGraph = allQuadsOfGraph.filter(q => !q.subject.value.startsWith('https://productencatalogus.data.vlaanderen.be/id/conceptscheme/'));

        //filter out all triples linked to https://data.vlaanderen.be/id/organisatie/ subjects
        allQuadsOfGraph = allQuadsOfGraph.filter(q => !q.subject.value.startsWith('https://data.vlaanderen.be/id/organisatie/'));

        //filter out all triples linked to http://data.europa.eu/nuts/code/ subjects
        allQuadsOfGraph = allQuadsOfGraph.filter(q => !q.subject.value.startsWith('http://data.europa.eu/nuts/code/'));

        //filter out all triples linked to http://data.europa.eu/nuts/scheme/2021 concept scheme
        allQuadsOfGraph = allQuadsOfGraph.filter(q => !q.subject.value.startsWith('http://data.europa.eu/nuts/scheme/2021'));

        //filter out all triples linked to http://publications.europa.eu/resource/authority/language/ subjects
        allQuadsOfGraph = allQuadsOfGraph.filter(q => !q.subject.value.startsWith('http://publications.europa.eu/resource/authority/language/'));


        const alsoLoadRelatedConceptSnapshots = true;
        const averageTimes = [];
        const technicalErrors = [];
        const dataErrors = [];

        let quadsFromRequeriedConcepts: Statement[] = [];

        const before = new Date().valueOf();

        console.log(new Date().toISOString());

        const randomizedConceptIds = shuffle([...conceptIds]);

        for (const result of randomizedConceptIds) {
            const id = new Iri(result['id'].value);
            try {
                const conceptForId = await repository.findById(id);
                expect(conceptForId.id).toEqual(id);
                const quadsForConceptForId =
                    domainToQuadsMapper.conceptToQuads(conceptForId);
                quadsFromRequeriedConcepts =
                    [...quadsForConceptForId, ...quadsFromRequeriedConcepts];

                if (alsoLoadRelatedConceptSnapshots) {
                    const latestConceptSnapshot = await snapshotRepository.findById(conceptForId.latestConceptSnapshot);
                    expect(latestConceptSnapshot.id).toEqual(conceptForId.latestConceptSnapshot);
                    expect(latestConceptSnapshot.isVersionOfConcept).toEqual(id);

                    for (const eachPreviousConceptSnapshotId of conceptForId.previousConceptSnapshots) {
                        const previousConceptSnapshot = await snapshotRepository.findById(eachPreviousConceptSnapshotId);
                        expect(previousConceptSnapshot.id).toEqual(eachPreviousConceptSnapshotId);
                        expect(previousConceptSnapshot.isVersionOfConcept).toEqual(id);
                    }

                    const latestFunctionallyChangedConceptSnapshot = await snapshotRepository.findById((conceptForId.latestFunctionallyChangedConceptSnapshot));
                    expect(latestFunctionallyChangedConceptSnapshot.id).toEqual(conceptForId.latestFunctionallyChangedConceptSnapshot);
                    expect(latestFunctionallyChangedConceptSnapshot.isVersionOfConcept).toEqual(id);

                    validateThatConceptDataIsInSyncWithLatestConceptSnapshot(conceptForId, latestConceptSnapshot, latestFunctionallyChangedConceptSnapshot);
                }
            } catch (e) {
                console.error(`Error while verifying concept ${sparqlEscapeUri(id)}`, e);
                if (!e.message.startsWith('could not map')) {
                    console.error(e);
                    technicalErrors.push(e);
                } else {
                    dataErrors.push(e);
                }
            }
        }

        const quadsFromRequeriedConceptsAsStrings = quadsFromRequeriedConcepts.map(quad => quad.toString());

        const allRemainingQuadsOfGraphAsTurtle = allQuadsOfGraph
            .map(q => q.toString())
            .filter(q => !quadsFromRequeriedConceptsAsStrings.includes(q));

        //uncomment when running against END2END_TEST_SPARQL_ENDPOINT
        fs.writeFileSync(`/tmp/remaining-quads-concept.txt`, sortedUniq(allRemainingQuadsOfGraphAsTurtle).join('\n'));
        //expect(sortedUniq(allRemainingQuadsOfGraphAsTurtle)).toEqual([]);

        const averageTime = ((new Date().valueOf() - before) * conceptIds.length) / conceptIds.length;
        averageTimes.push(averageTime);

        console.log(`Verifying in total ${conceptIds.length} concept took on average ${averageTime} ms per concept`);
        // eslint-disable-next-line no-constant-condition

        const totalAverageTime = averageTimes.reduce((accumulator, currentValue) => {
            return accumulator + currentValue;
        }, 0) / averageTimes.length;
        console.log(`Total average time: ${totalAverageTime}`);
        console.log(`Technical Errors [${technicalErrors}]`);
        console.log(`Data Errors [${dataErrors}]`);

        if (conceptIds.length > 0) {
            expect(technicalErrors).toEqual([]);
            expect(totalAverageTime).toBeLessThan(250);
        }

    }, 60000 * 15 * 100 * 10);

    test.skip('Load one concept and print quads', async () => {
        const id = new Iri('https://ipdc.vlaanderen.be/id/concept/26bfa5c8-f099-44c8-8765-37b1ab095850');
        const fetcher = new DatastoreToQuadsRecursiveSparqlFetcher(endPoint);

        const allQuads = await fetcher.fetch(conceptGraph, id, [
                NS.lpdcExt('hasConceptDisplayConfiguration').value,
            ],
            [
                NS.lpdcExt('yourEuropeCategory').value,
                NS.lpdcExt('targetAudience').value,
                NS.m8g('thematicArea').value,
                NS.lpdcExt('competentAuthorityLevel').value,
                NS.m8g('hasCompetentAuthority').value,
                NS.lpdcExt('executingAuthorityLevel').value,
                NS.lpdcExt('hasExecutingAuthority').value,
                NS.lpdcExt('publicationMedium').value,
                NS.dct("type").value,
                NS.lpdcExt("conceptTag").value,
                NS.adms('status').value,
                NS.m8g('hasLegalResource').value,
            ],
            [
                NS.skos('Concept').value,
                NS.lpdcExt('ConceptDisplayConfiguration').value,
                NS.besluit('Bestuurseenheid').value,
                NS.m8g('PublicOrganisation').value,
            ]);
        console.log('recursive queries');
        const allQuadsAsStrings = asSortedArray(allQuads.map(q => q.toString()));
        console.log(allQuadsAsStrings.join('\n'));

        const concept = await repository.findById(id);
        const conceptToQuads = domainToQuadsMapper.conceptToQuads(concept);
        console.log('saving back');
        const allConceptsToQuadsAsStrings = asSortedArray(conceptToQuads.map(q => q.toString()));
        console.log(allConceptsToQuadsAsStrings.join('\n'));

        expect(allQuadsAsStrings).toEqual(allConceptsToQuadsAsStrings);

        const latestConceptSnapshot = await snapshotRepository.findById(concept.latestConceptSnapshot);
        const latestFunctionallyChangedConceptSnapshot = await snapshotRepository.findById(concept.latestFunctionallyChangedConceptSnapshot);

        validateThatConceptDataIsInSyncWithLatestConceptSnapshot(concept, latestConceptSnapshot, latestFunctionallyChangedConceptSnapshot);

    });

    function validateThatConceptDataIsInSyncWithLatestConceptSnapshot(concept: Concept, latestConceptSnapshot: ConceptSnapshot, latestFunctionallyChangedConceptSnapshot: ConceptSnapshot) {
        expect(isConceptFunctionallyChangedComparedToConceptSnapshot(concept, latestFunctionallyChangedConceptSnapshot)).toBeFalsy();
        expect(isConceptFunctionallyChangedComparedToConceptSnapshot(concept, latestConceptSnapshot)).toBeFalsy();
        expect(ConceptSnapshot.isFunctionallyChanged(latestConceptSnapshot, latestFunctionallyChangedConceptSnapshot)).toBeFalsy();
    }

    function isConceptFunctionallyChangedComparedToConceptSnapshot(value: Concept, other: ConceptSnapshot): boolean {
        return LanguageString.isFunctionallyChanged(value.title, other.title)
            || LanguageString.isFunctionallyChanged(value.description, other.description)
            || LanguageString.isFunctionallyChanged(value.additionalDescription, other.additionalDescription)
            || LanguageString.isFunctionallyChanged(value.exception, other.exception)
            || LanguageString.isFunctionallyChanged(value.regulation, other.regulation)
            || FormatPreservingDate.isFunctionallyChanged(value.startDate, other.startDate)
            || FormatPreservingDate.isFunctionallyChanged(value.endDate, other.endDate)
            || value.type !== other.type
            || !isEqual(value.targetAudiences, other.targetAudiences)
            || !isEqual(value.themes, other.themes)
            || !isEqual(value.competentAuthorityLevels, other.competentAuthorityLevels)
            || !isEqual(value.competentAuthorities, other.competentAuthorities)
            || !isEqual(value.executingAuthorityLevels, other.executingAuthorityLevels)
            || !isEqual(value.executingAuthorities, other.executingAuthorities)
            || !isEqual(value.publicationMedia, other.publicationMedia)
            || !isEqual(value.yourEuropeCategories, other.yourEuropeCategories)
            || !isEqual(value.keywords, other.keywords)
            || Requirement.isFunctionallyChanged(value.requirements, other.requirements)
            || Procedure.isFunctionallyChanged(value.procedures, other.procedures)
            || Website.isFunctionallyChanged(value.websites, other.websites)
            || Cost.isFunctionallyChanged(value.costs, other.costs)
            || FinancialAdvantage.isFunctionallyChanged(value.financialAdvantages, other.financialAdvantages)
            || LegalResource.isFunctionallyChanged(value.legalResources, other.legalResources);
    }

});