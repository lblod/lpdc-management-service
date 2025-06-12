import {aBestuurseenheid} from "../../../../test/core/domain/bestuurseenheid-test-builder";
import {aFullInstance} from "../../../../test/core/domain/instance-test-builder";
import {sparqlEscapeUri} from "../../../../mu-helper";
import {SparqlQuerying} from "../../../../src/driven/persistence/sparql-querying";
import {literal, namedNode, quad} from "rdflib";
import {FormatPreservingDate} from "../../../../src/core/domain/format-preserving-date";
import {
    BestuurseenheidSparqlTestRepository
} from "../../../../test/driven/persistence/bestuurseenheid-sparql-test-repository";
import {TEST_SPARQL_ENDPOINT} from "../../../../test/test.config";
import {InstanceSparqlRepository} from "../../../../src/driven/persistence/instance-sparql-repository";
import {DirectDatabaseAccess} from "../../../../test/driven/persistence/direct-database-access";
import {restoreRealTime, setFixedTime} from "../../../../test/fixed-time";

describe('Archive instances', () => {
    const bestuurseenheidRepository = new BestuurseenheidSparqlTestRepository(TEST_SPARQL_ENDPOINT);
    const instanceRepository = new InstanceSparqlRepository(TEST_SPARQL_ENDPOINT);
    const directDatabaseAccess = new DirectDatabaseAccess(TEST_SPARQL_ENDPOINT);

    beforeAll(() => setFixedTime());

    afterAll(() => restoreRealTime());


    test('Create tombstone when instance was published', async () => {

        const bestuurseenheid = aBestuurseenheid().build();
        await bestuurseenheidRepository.save(bestuurseenheid);
        const instance = aFullInstance().withCreatedBy(bestuurseenheid.id).withDateSent(FormatPreservingDate.now()).build();

        await instanceRepository.save(bestuurseenheid, instance);
        const tombstoneId = await instanceRepository.delete(bestuurseenheid, instance.id);

        const instanceExists = await instanceRepository.exists(bestuurseenheid, instance.id);
        expect(instanceExists).toBeFalse();

        const query = `
            SELECT ?s ?p ?o WHERE {
                GRAPH ${sparqlEscapeUri(bestuurseenheid.userGraph())} {
                    VALUES ?s {
                        <${tombstoneId.value}>
                    }
                    ?s ?p ?o
                }
            }
        `;
        const instanceQuery = `
            SELECT ?s ?p ?o WHERE {
                GRAPH ${sparqlEscapeUri(bestuurseenheid.userGraph())} {
                    VALUES ?s {
                        <${instance.id.value}>
                    }
                    ?s ?p ?o
                }
            }
        `;
        const queryResult = await directDatabaseAccess.list(query);
        const instanceQueryResult = await directDatabaseAccess.list(instanceQuery);
        const quads = new SparqlQuerying().asQuads(queryResult, bestuurseenheid.userGraph().value);
        const instanceQuads = new SparqlQuerying().asQuads(instanceQueryResult, bestuurseenheid.userGraph().value);

        expect(quads).toHaveLength(5);
        expect(quads).toEqual(expect.arrayContaining([
            quad(namedNode(tombstoneId.value), namedNode('http://www.w3.org/1999/02/22-rdf-syntax-ns#type'), namedNode('https://www.w3.org/ns/activitystreams#Tombstone'), namedNode(bestuurseenheid.userGraph().value)),
            quad(namedNode(tombstoneId.value), namedNode('https://www.w3.org/ns/activitystreams#deleted'), literal(FormatPreservingDate.now().value, 'http://www.w3.org/2001/XMLSchema#dateTime'), namedNode(bestuurseenheid.userGraph().value)),
            quad(namedNode(tombstoneId.value), namedNode('http://www.w3.org/ns/prov#generatedAtTime'), literal(FormatPreservingDate.now().value, 'http://www.w3.org/2001/XMLSchema#dateTime'), namedNode(bestuurseenheid.userGraph().value)),
            quad(namedNode(tombstoneId.value), namedNode('https://www.w3.org/ns/activitystreams#formerType'), namedNode('https://productencatalogus.data.vlaanderen.be/ns/ipdc-lpdc#InstancePublicService'), namedNode(bestuurseenheid.userGraph().value)),
            quad(namedNode(tombstoneId.value), namedNode('https://productencatalogus.data.vlaanderen.be/ns/ipdc-lpdc#isPublishedVersionOf'), namedNode(instance.id.value), namedNode(bestuurseenheid.userGraph().value)),
        ]));


        expect(instanceQuads).toHaveLength(0);

    });
    test('Dont create tombstone when instance was not published', async () => {

        const bestuurseenheid = aBestuurseenheid().build();
        await bestuurseenheidRepository.save(bestuurseenheid);
        const instance = aFullInstance().withCreatedBy(bestuurseenheid.id).withDateSent(undefined).build();

        await instanceRepository.save(bestuurseenheid, instance);
        const tombstoneId = await instanceRepository.delete(bestuurseenheid, instance.id);

        expect(tombstoneId).toBeUndefined();

        const instanceExists = await instanceRepository.exists(bestuurseenheid, instance.id);
        expect(instanceExists).toBeFalse();

        const instanceQuery = `
            SELECT ?s ?p ?o WHERE {
                GRAPH ${sparqlEscapeUri(bestuurseenheid.userGraph())} {
                    VALUES ?s {
                        <${instance.id.value}>
                    }
                    ?s ?p ?o
                }
            }
        `;
        const instanceQueryResult = await directDatabaseAccess.list(instanceQuery);
        const instanceQuads = new SparqlQuerying().asQuads(instanceQueryResult, bestuurseenheid.userGraph().value);

        expect(instanceQuads).toHaveLength(0);
    });
});
