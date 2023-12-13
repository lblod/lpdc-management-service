import _ from 'lodash';
import {query, sparqlEscapeDateTime, sparqlEscapeString, sparqlEscapeUri, update} from '../mu-helper';
import {v4 as uuid} from 'uuid';
import {APPLICATION_GRAPH, CONCEPTUAL_SERVICE_GRAPH, FORM_STATUS_CONCEPT, PREFIXES} from '../config';
import {bindingsToNT} from '../utils/bindingsToNT';
import {addUuidForSubject, groupBySubject, replaceType} from '../utils/common';
import {
    loadCosts,
    loadEvidences,
    loadFinancialAdvantages,
    loadFormalInformalChoice,
    loadOnlineProcedureRules,
    loadPublicService,
    loadRequirements,
    loadRules,
    loadWebsites
} from './commonQueries';
import {
    findDutchLanguageVersionsOfTriples,
    getChosenForm, getLanguageVersionForInstance,
    selectLanguageVersionForConcept
} from "./formalInformalChoice";
import {SessieSparqlRepository} from "../src/core/port/driven/persistence/sessie-sparql-repository";
import {BestuurseenheidSparqlRepository} from "../src/core/port/driven/persistence/bestuurseenheid-sparql-repository";

export async function createEmptyForm(sessionUri: string, sessionRepository: SessieSparqlRepository, bestuurseenheidRepository: BestuurseenheidSparqlRepository): Promise<{
    uuid: string,
    uri: string
}> {

    const sessie = await sessionRepository.findById(sessionUri);
    const bestuurseenheid = await bestuurseenheidRepository.findById(sessie.getBestuurseenheidId());


    const publicServiceId = uuid();
    const publicServiceUri = `http://data.lblod.info/id/public-service/${publicServiceId}`;

    const spatials = await getSpatialsForBestuurseenheidUri(bestuurseenheid.getId());
    const spatialsPreparedStatement = spatials.map(s => `dct:spatial ${sparqlEscapeUri(s)};`).join('\n');

    const now = new Date().toISOString();
    const query = `
  ${PREFIXES}
  INSERT DATA {
    GRAPH <http://mu.semte.ch/graphs/application> {
      ${sparqlEscapeUri(publicServiceUri)} a cpsv:PublicService ;
        dct:created ${sparqlEscapeDateTime(now)} ;
        dct:modified ${sparqlEscapeDateTime(now)} ;
        mu:uuid """${publicServiceId}""" ;
        adms:status <http://lblod.data.gift/concepts/79a52da4-f491-4e2f-9374-89a13cde8ecd> ;
        ${spatialsPreparedStatement.length ? spatialsPreparedStatement : ''}
        pav:createdBy ${sparqlEscapeUri(bestuurseenheid.getId())};
        m8g:hasCompetentAuthority ${sparqlEscapeUri(bestuurseenheid.getId())};
        lpdcExt:hasExecutingAuthority ${sparqlEscapeUri(bestuurseenheid.getId())}.
    }
  }`;

    await update(query);

    return {
        uuid: publicServiceId,
        uri: publicServiceUri
    };
}

export async function createForm(conceptId: string, sessionUri: string, sessieRepository: SessieSparqlRepository, bestuurseenheidRepository: BestuurseenheidSparqlRepository): Promise<{
    uuid: string,
    uri: string
}> {
    const graph = CONCEPTUAL_SERVICE_GRAPH;
    const conceptUri = await getConceptUri(conceptId);

    const evidenceData = copySubjects(await loadEvidences(conceptUri, {graph}),
        'http://data.lblod.info/id/evidence/');
    const requirementData = copySubjects(await loadRequirements(conceptUri, {graph}),
        'http://data.lblod.info/id/requirement/');
    replaceObjectsWithCopiedChildren(requirementData, evidenceData);

    const onlineProcedureData = copySubjects(await loadOnlineProcedureRules(conceptUri, {graph}),
        'http://data.lblod.info/id/website/');
    const rulesData = copySubjects(await loadRules(conceptUri, {graph}),
        'http://data.lblod.info/id/rule/');
    replaceObjectsWithCopiedChildren(rulesData, onlineProcedureData);

    const costsData = copySubjects(await loadCosts(conceptUri, {graph}),
        'http://data.lblod.info/id/cost/');

    const financialAdvantageData = copySubjects(await loadFinancialAdvantages(conceptUri, {graph}),
        'http://data.lblod.info/id/financial-advantage/');

    const websitesData = copySubjects(await loadWebsites(conceptUri, {graph}),
        'http://data.lblod.info/id/website/');

    let result = await loadPublicService(conceptUri, {graph});
    result = replaceType(result,
        'https://productencatalogus.data.vlaanderen.be/ns/ipdc-lpdc#ConceptualPublicService',
        'http://purl.org/vocab/cpsv#PublicService');
    const publicServiceData = copySubjects(result,
        'http://data.lblod.info/id/public-service/');

    replaceObjectsWithCopiedChildren(publicServiceData,
        {
            ...requirementData,
            ...rulesData,
            ...websitesData,
            ...costsData,
            ...financialAdvantageData,
        });
    //some extra meta data is needed
    const newServiceUri = Object.values(publicServiceData)[0][0].s.value;
    const newServiceUuid = (Object.values(publicServiceData)[0] as any[])
        .find(triple => triple.p.value === 'http://mu.semte.ch/vocabularies/core/uuid').o.value;

    // Next lines is all about extracting the triple data so in can be injected in an insert.
    // TODO: this boilerplate could be more pretty
    let allTriples: any[] = [
        publicServiceData,
        evidenceData,
        onlineProcedureData,
        requirementData,
        rulesData,
        websitesData,
        costsData,
        financialAdvantageData,
    ].map(data => Object.values(data));
    allTriples = _.flattenDeep(allTriples);
    const chosenForm = getChosenForm(await loadFormalInformalChoice());
    allTriples = keepOnlyChosenLanguageVersion(newServiceUri, allTriples, chosenForm);
    allTriples = bindingsToNT(allTriples);

    // We need gradual insert, triple per triple, because contains LOOONG html
    // This also implies we have to set the types first, since else we migth confuse mu-auth
    const typeTriples = allTriples.filter(t => t.includes('http://www.w3.org/1999/02/22-rdf-syntax-ns#type'));
    const otherTriples = allTriples.filter(t => !t.includes('http://www.w3.org/1999/02/22-rdf-syntax-ns#type'));

    for (const statement of [...typeTriples, ...otherTriples]) {
        const newPublicServiceQuery = `
      INSERT DATA {
        GRAPH ${sparqlEscapeUri(APPLICATION_GRAPH)} {
          ${statement}
        }
      }
    `;
        await update(newPublicServiceQuery);
    }

    const now = new Date().toISOString();
    const sessie = await sessieRepository.findById(sessionUri);
    const bestuurseenheid = await bestuurseenheidRepository.findById(sessie.getBestuurseenheidId());
    const spatials = await getSpatialsForBestuurseenheidUri(bestuurseenheid.getId());
    const spatialsPreparedStatement = spatials.map(s => `dct:spatial ${sparqlEscapeUri(s)};`).join('\n');
    const extraDataQuery = `
    ${PREFIXES}

    INSERT {
      GRAPH ${sparqlEscapeUri(APPLICATION_GRAPH)} {
        ?service adms:status ${sparqlEscapeUri(FORM_STATUS_CONCEPT)};
          ${spatialsPreparedStatement.length ? spatialsPreparedStatement : ''}
          dct:created ${sparqlEscapeDateTime(now)};
          dct:modified ${sparqlEscapeDateTime(now)};
          pav:createdBy ${sparqlEscapeUri(bestuurseenheid.getId())};
          lpdcExt:hasExecutingAuthority ${sparqlEscapeUri(bestuurseenheid.getId())}.
      }
    }
    WHERE {
      BIND(${sparqlEscapeUri(newServiceUri)} as ?service)
      GRAPH ${sparqlEscapeUri(APPLICATION_GRAPH)} {
      ?service a cpsv:PublicService.
      }
    }
  `;

    await update(extraDataQuery);
    await updateConceptDisplayConfig(conceptUri);

    return {
        uuid: newServiceUuid,
        uri: newServiceUri
    };
}

/*
 * Helper function to execute a query and copy retreived resources into new resources.
 * It adds both a UUID and dct:source to the new resource too.
 * It returns an intermediate data structure. Which is easier to use when relations need
 * to be copied over.
 * Probably this function won't be used outside this file.
 *
 * @param {String}: CONSTRUCT query string
 * @param {String}: template for new URI
 *
 * @returns {'http://old/uri': [ {s: { {value: 'http://new/uri' } }, p: binding, o: binding } ] }
 */
function copySubjects(bindings: any[], uriTemplate: string): any {
    const copiedData = {};

    if (bindings.length) {
        const groupedBySubject = groupBySubject(bindings);

        for (const oldUri in groupedBySubject) {
            copiedData[oldUri] = copySubject(oldUri, groupedBySubject[oldUri], uriTemplate);
        }
    }
    return copiedData;
}

function copySubject(oldUri: string, triplesData: any[], uriTemplate: string): any[] {
    const newUuid = uuid();
    const newSubject = uriTemplate + newUuid;

    if (triplesData.length) {
        for (const tripleData of triplesData) {
            tripleData.s.value = newSubject;
        }

        addUuidForSubject(triplesData);

        triplesData.push(
            {
                s: {value: newSubject, type: 'uri'},
                p: {value: 'http://purl.org/dc/terms/source', type: 'uri'},
                o: {value: oldUri, type: 'uri'}
            }
        );
    }

    return triplesData;
}

/*
 * Replaces the children of a parent (i.e. relations) with new URI's
 * Probably this function won't be used outside this file.
 * The input is the output of copySubjects.
 *
 * @param {Object}: {'http://old/parent/uri': [ {s: binding, p: binding, o:  { {value: 'http://old/child' } } } ] }
 * @param {Object}: {'http://old/child': [ {s: { {value: 'http://new/child' } }, p: binding, o: binding } ] }
 *
 * @returns {Object}: {'http://old/parent/uri': [ {s: binding, p: binding, o:  { {value: 'http://new/child' } } } ] }
 */
function replaceObjectsWithCopiedChildren(parentData: any, childrenData: any): any[] {
    for (const tripleData of Object.values(parentData)) {
        for (const triple of tripleData as any[]) {
            if (childrenData[triple.o.value]) {
                triple.o.value = childrenData[triple.o.value][0].s.value;
            }
        }
    }
    return parentData;
}

async function getConceptUri(conceptUuid: string): Promise<string> {
    const result = await query(`
    ${PREFIXES}

    SELECT DISTINCT ?conceptUri WHERE {
      GRAPH ${sparqlEscapeUri(APPLICATION_GRAPH)} {
       ?conceptUri mu:uuid ${sparqlEscapeString(conceptUuid)}.
      }
  }`);

    if (result.results.bindings.length == 1) {
        return result.results.bindings[0]['conceptUri'].value;
    } else throw `No exact match found for lpdcExt:ConceptualPublicService ${conceptUuid}`;
}

async function getSpatialsForBestuurseenheidUri(bestuurseenheid: string): Promise<string[]> {
    const queryStr = `
    ${PREFIXES}

    SELECT DISTINCT ?spatial WHERE {
      VALUES ?werkingsGebiedP {
        <http://data.vlaanderen.be/ns/besluit#werkingsgebied>
      }

      ${sparqlEscapeUri(bestuurseenheid)} ?werkingsGebiedP ?werkingsgebied.

      ?werkingsgebied <http://www.w3.org/2004/02/skos/core#exactMatch> ?spatial.

      ?spatial <http://www.w3.org/2004/02/skos/core#inScheme> <http://lblod.data.gift/vocabularies/lpdc-ipdc/IPDCLocaties>
    }
  `;

    const results = (await query(queryStr)).results.bindings;

    return results.map(r => r.spatial.value);
}

async function updateConceptDisplayConfig(conceptUri: string): Promise<void> {
    // The fact the query is split up in pieces, is dueu to the
    // virtuoso bug: https://github.com/openlink/virtuoso-opensource/issues/1055
    // Once we have the latest version of virtuoso running, we can make it prettier.
    // Note: this doesn't fix the custom boolean data type, this needs to be carefully considered.
    await update(`
    ${PREFIXES}

    DELETE {
      GRAPH ${sparqlEscapeUri(APPLICATION_GRAPH)} {
        ?config lpdcExt:conceptIsNew ?oldIsNew.
      }
    }
    WHERE {
      GRAPH ${sparqlEscapeUri(APPLICATION_GRAPH)} {
        ${sparqlEscapeUri(conceptUri)} lpdcExt:hasConceptDisplayConfiguration ?config .
        ?config lpdcExt:conceptIsNew ?oldIsNew.
      }
    }
  `);

    await update(`
    ${PREFIXES}

    DELETE {
      GRAPH ${sparqlEscapeUri(APPLICATION_GRAPH)} {
        ?config lpdcExt:conceptInstantiated ?oldIsInstantiated .
      }
    }
    WHERE {
      GRAPH ${sparqlEscapeUri(APPLICATION_GRAPH)} {
        ${sparqlEscapeUri(conceptUri)} lpdcExt:hasConceptDisplayConfiguration ?config .
        ?config lpdcExt:conceptInstantiated ?oldIsInstantiated .
      }
    }
  `);

    await update(`
    ${PREFIXES}

    INSERT {
      GRAPH ${sparqlEscapeUri(APPLICATION_GRAPH)} {
        ?config lpdcExt:conceptIsNew "false"^^<http://mu.semte.ch/vocabularies/typed-literals/boolean> ;
          lpdcExt:conceptInstantiated "true"^^<http://mu.semte.ch/vocabularies/typed-literals/boolean> .
      }
    }
    WHERE {
      GRAPH ${sparqlEscapeUri(APPLICATION_GRAPH)} {
        ${sparqlEscapeUri(conceptUri)} lpdcExt:hasConceptDisplayConfiguration ?config .
      }
    }
  `);
}

function keepOnlyChosenLanguageVersion(publicServiceUri: string, allTriples: any[], chosenForm: string): any[] {
    const languageVersionsInConcept = findDutchLanguageVersionsOfTriples(allTriples);
    const languageVersionToKeep = selectLanguageVersionForConcept(languageVersionsInConcept, chosenForm);
    const fields = getFieldsWithLanguage(publicServiceUri, allTriples);
    let triples = allTriples;
    for (const field of fields) {
        const triplesForField = allTriples
            .filter(triple => triple.s.value === field.subject && triple.p.value === field.predicate)
            .filter(triple => triple.o['xml:lang'] !== 'en');
        if (triplesForField.length) {
            const tripleToKeep = triplesForField.find(triple => triple.o['xml:lang'] === languageVersionToKeep);
            if (tripleToKeep === undefined) {
                throw new Error(`Language version ${languageVersionToKeep} does not exist for ${JSON.stringify(triplesForField)}`);
            }
            tripleToKeep.o['xml:lang'] = getLanguageVersionForInstance(chosenForm);
            triples = _.without(triples, ...triplesForField);
            triples.push(tripleToKeep);
        }
    }
    return triples;
}

function getFieldsWithLanguage(publicServiceUri: string, triples: any[]): any[] {
    const requirementUris = getObjects(triples, 'http://vocab.belgif.be/ns/publicservice#hasRequirement');
    const evidenceUris = getObjects(triples, 'http://data.europa.eu/m8g/hasSupportingEvidence');
    const procedureUris = getObjects(triples, 'http://purl.org/vocab/cpsv#follows');
    const websiteUris = getObjects(triples, 'https://productencatalogus.data.vlaanderen.be/ns/ipdc-lpdc#hasWebsite');
    const seeAlsoWebsiteUris = getObjects(triples, 'http://www.w3.org/2000/01/rdf-schema#seeAlso');
    const costUris = getObjects(triples, 'http://data.europa.eu/m8g/hasCost');
    const financialAdvantageUris = getObjects(triples, 'http://purl.org/vocab/cpsv#produces');

    return [
        {subject: publicServiceUri, predicate: 'http://purl.org/dc/terms/title'},
        {subject: publicServiceUri, predicate: 'http://purl.org/dc/terms/description'},
        {
            subject: publicServiceUri,
            predicate: 'https://productencatalogus.data.vlaanderen.be/ns/ipdc-lpdc#additionalDescription'
        },
        {subject: publicServiceUri, predicate: 'https://productencatalogus.data.vlaanderen.be/ns/ipdc-lpdc#exception'},
        {subject: publicServiceUri, predicate: 'https://productencatalogus.data.vlaanderen.be/ns/ipdc-lpdc#regulation'},
        ...requirementUris.map(uri => ({subject: uri, predicate: 'http://purl.org/dc/terms/title'})),
        ...requirementUris.map(uri => ({subject: uri, predicate: 'http://purl.org/dc/terms/description'})),
        ...evidenceUris.map(uri => ({subject: uri, predicate: 'http://purl.org/dc/terms/title'})),
        ...evidenceUris.map(uri => ({subject: uri, predicate: 'http://purl.org/dc/terms/description'})),
        ...procedureUris.map(uri => ({subject: uri, predicate: 'http://purl.org/dc/terms/title'})),
        ...procedureUris.map(uri => ({subject: uri, predicate: 'http://purl.org/dc/terms/description'})),
        ...websiteUris.map(uri => ({subject: uri, predicate: 'http://purl.org/dc/terms/title'})),
        ...websiteUris.map(uri => ({subject: uri, predicate: 'http://purl.org/dc/terms/description'})),
        ...seeAlsoWebsiteUris.map(uri => ({subject: uri, predicate: 'http://purl.org/dc/terms/title'})),
        ...seeAlsoWebsiteUris.map(uri => ({subject: uri, predicate: 'http://purl.org/dc/terms/description'})),
        ...costUris.map(uri => ({subject: uri, predicate: 'http://purl.org/dc/terms/title'})),
        ...costUris.map(uri => ({subject: uri, predicate: 'http://purl.org/dc/terms/description'})),
        ...financialAdvantageUris.map(uri => ({subject: uri, predicate: 'http://purl.org/dc/terms/title'})),
        ...financialAdvantageUris.map(uri => ({subject: uri, predicate: 'http://purl.org/dc/terms/description'})),
    ];
}

function getObjects(triples: any[], predicate: string): any[] {
    return triples
        .filter(triple => triple.p.value === predicate)
        .map(triple => triple.o.value);
}
