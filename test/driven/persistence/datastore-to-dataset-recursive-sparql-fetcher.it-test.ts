import {DirectDatabaseAccess} from "./direct-database-access";
import {TEST_SPARQL_ENDPOINT} from "../../test.config";
import {sparqlEscapeDate, sparqlEscapeDateTime, sparqlEscapeInt, uuid} from "../../../mu-helper";
import {PREFIX} from "../../../config";
import {
    DatastoreToDatasetRecursiveSparqlFetcher
} from "../../../src/driven/persistence/datastore-to-dataset-recursive-sparql-fetcher";
import {Iri} from "../../../src/core/domain/shared/iri";
import {literal, namedNode, quad} from 'rdflib';
import {Quad} from "rdflib/lib/tf-types";

describe('recursively fetches a part of a datastore into a dataset using sparql endpoint', () => {

    const directDatabaseAccess = new DirectDatabaseAccess(TEST_SPARQL_ENDPOINT);
    const fetcher = new DatastoreToDatasetRecursiveSparqlFetcher(TEST_SPARQL_ENDPOINT);

    test('Throws Error when endpoint cannot be reached', async () => {
        const fetcherWithIncorrectEndpoint = new DatastoreToDatasetRecursiveSparqlFetcher('thiscanotbereached');

        const startIri: Iri = `http://example.com/ns#abc}`;

        await expect(fetcherWithIncorrectEndpoint.fetch('http://some-test-graph', startIri)).rejects.toThrow('All retries failed. Last error: Error: Invalid URI "thiscanotbereached"');
    });

    test('Can query non recursively all triples linked to an IRI', async () => {
        const startIri: Iri = `http://example.com/ns#${uuid()}`;
        const graph: Iri = 'http://some-test-graph';
        const aDateTime = new Date('2022-08-13T15:36:52Z');
        const aDate = new Date('2023-10-28');

        await directDatabaseAccess.insertData(
            graph,
            [`<${startIri}> a ex:aType`,
                `<${startIri}> ex:aPredicate1 """aStringValue"""`,
                `<${startIri}> ex:aPredicate2 """aStringValue-no-lang"""`,
                `<${startIri}> ex:aPredicate2 """aStringValue-nl"""@nl`,
                `<${startIri}> ex:aPredicate2 """aStringValue-en"""@en`,
                `<${startIri}> ex:aPredicate3 ${sparqlEscapeDateTime(aDateTime.toISOString())}`,
                `<${startIri}> ex:aPredicate4 ${sparqlEscapeDate(aDate.toISOString())}`,
                `<${startIri}> ex:aPredicate5 ${sparqlEscapeInt(1200)}`,
            ],
            [PREFIX.ex]);

        const otherStartIri: Iri = `http://example.com/ns#${uuid()}`;
        await directDatabaseAccess.insertData(
            graph,
            [`<${otherStartIri}> a ex:anOtherType`,
            ],
            [PREFIX.ex]);


        const actualDataSet: Quad[] = await fetcher.fetch('http://some-test-graph', startIri);

        const expectedQuads = [
            quad(namedNode(startIri), namedNode('http://www.w3.org/1999/02/22-rdf-syntax-ns#type'), namedNode("http://example.com/ns#aType"), namedNode(graph)),
            quad(namedNode(startIri), namedNode('http://example.com/ns#aPredicate1'), literal('aStringValue', "http://www.w3.org/2001/XMLSchema#string"), namedNode(graph)),
            quad(namedNode(startIri), namedNode('http://example.com/ns#aPredicate2'), literal('aStringValue-no-lang', "http://www.w3.org/2001/XMLSchema#string"), namedNode(graph)),
            quad(namedNode(startIri), namedNode('http://example.com/ns#aPredicate2'), literal('aStringValue-nl', "nl"), namedNode(graph)),
            quad(namedNode(startIri), namedNode('http://example.com/ns#aPredicate2'), literal('aStringValue-en', "en"), namedNode(graph)),
            quad(namedNode(startIri), namedNode('http://example.com/ns#aPredicate3'), literal('2022-08-13T15:36:52Z', "http://www.w3.org/2001/XMLSchema#dateTime"), namedNode(graph)),
            quad(namedNode(startIri), namedNode('http://example.com/ns#aPredicate4'), literal('2023-10-28', "http://www.w3.org/2001/XMLSchema#date"), namedNode(graph)),
            quad(namedNode(startIri), namedNode('http://example.com/ns#aPredicate5'), literal('1200', "http://www.w3.org/2001/XMLSchema#integer"), namedNode(graph)),
        ];

        expect(actualDataSet).toEqual(expect.arrayContaining(expectedQuads));
        expect(actualDataSet).toHaveLength(expectedQuads.length);
    });

    test('Can query one level deep for a one-to-one relationship and retrieve all triples linked to an IRI', async () => {
        const startIri: Iri = `http://example.com/ns#${uuid()}`;
        const nestedIri: Iri = `http://example.com/ns#${uuid()}`;
        const graph: Iri = 'http://some-test-graph';

        await directDatabaseAccess.insertData(
            graph,
            [`<${startIri}> a ex:aType`,
                `<${startIri}> ex:has-one-to-one <${nestedIri}>`,
                `<${nestedIri}> ex:aPredicate1 """aStringValue"""`,
            ],
            [PREFIX.ex]);

        const actualDataSet: Quad[] = await fetcher.fetch('http://some-test-graph', startIri);

        const expectedQuads = [
            quad(namedNode(startIri), namedNode('http://www.w3.org/1999/02/22-rdf-syntax-ns#type'), namedNode("http://example.com/ns#aType"), namedNode(graph)),
            quad(namedNode(startIri), namedNode('http://example.com/ns#has-one-to-one'), namedNode(nestedIri), namedNode(graph)),
            quad(namedNode(nestedIri), namedNode('http://example.com/ns#aPredicate1'), literal('aStringValue'), namedNode(graph)),
        ];
        expect(actualDataSet).toEqual(expect.arrayContaining(expectedQuads));
        expect(actualDataSet).toHaveLength(expectedQuads.length);
    });

    test('Can query one level deep for a one-to-many relationship and retrieve all triples linked to an IRI', async () => {
        const startIri: Iri = `http://example.com/ns#${uuid()}`;
        const nestedIri: Iri = `http://example.com/ns#${uuid()}`;
        const nestedIri2: Iri = `http://example.com/ns#${uuid()}`;
        const graph: Iri = 'http://some-test-graph';

        await directDatabaseAccess.insertData(
            graph,
            [`<${startIri}> a ex:aType`,
                `<${startIri}> ex:has-one-to-many <${nestedIri}>`,
                `<${nestedIri}> ex:aPredicate1 """aStringValue"""`,
                `<${startIri}> ex:has-one-to-many <${nestedIri2}>`,
                `<${nestedIri2}> ex:aPredicate2 """aStringValue2"""`,
            ],
            [PREFIX.ex]);

        const actualDataSet: Quad[] = await fetcher.fetch('http://some-test-graph', startIri);

        const expectedQuads = [
            quad(namedNode(startIri), namedNode('http://www.w3.org/1999/02/22-rdf-syntax-ns#type'), namedNode("http://example.com/ns#aType"), namedNode(graph)),
            quad(namedNode(startIri), namedNode('http://example.com/ns#has-one-to-many'), namedNode(nestedIri), namedNode(graph)),
            quad(namedNode(nestedIri), namedNode('http://example.com/ns#aPredicate1'), literal('aStringValue'), namedNode(graph)),
            quad(namedNode(startIri), namedNode('http://example.com/ns#has-one-to-many'), namedNode(nestedIri2), namedNode(graph)),
            quad(namedNode(nestedIri2), namedNode('http://example.com/ns#aPredicate2'), literal('aStringValue2'), namedNode(graph)),
        ];
        expect(actualDataSet).toEqual(expect.arrayContaining(expectedQuads));
        expect(actualDataSet).toHaveLength(expectedQuads.length);
    });

    test('Can query multiple levels deep for a one-to-one relationship and retrieve all triples linked to an IRI', async () => {
        const startIri: Iri = `http://example.com/ns#${uuid()}`;
        const nestedIri: Iri = `http://example.com/ns#${uuid()}`;
        const nestedNestedIri: Iri = `http://example.com/ns#${uuid()}`;
        const graph: Iri = 'http://some-test-graph';

        await directDatabaseAccess.insertData(
            graph,
            [`<${startIri}> a ex:aType`,
                `<${startIri}> ex:has-one-to-one <${nestedIri}>`,
                `<${nestedIri}> ex:aPredicate1 """aStringValue"""`,
                `<${nestedIri}> ex:has-other-one-to-one <${nestedNestedIri}>`,
                `<${nestedNestedIri}> ex:aPredicate2 """aStringValue2"""`,
            ],
            [PREFIX.ex]);

        const actualDataSet: Quad[] = await fetcher.fetch('http://some-test-graph', startIri);

        const expectedQuads = [
            quad(namedNode(startIri), namedNode('http://www.w3.org/1999/02/22-rdf-syntax-ns#type'), namedNode("http://example.com/ns#aType"), namedNode(graph)),
            quad(namedNode(startIri), namedNode('http://example.com/ns#has-one-to-one'), namedNode(nestedIri), namedNode(graph)),
            quad(namedNode(nestedIri), namedNode('http://example.com/ns#aPredicate1'), literal('aStringValue'), namedNode(graph)),
            quad(namedNode(nestedIri), namedNode('http://example.com/ns#has-other-one-to-one'), namedNode(nestedNestedIri), namedNode(graph)),
            quad(namedNode(nestedNestedIri), namedNode('http://example.com/ns#aPredicate2'), literal('aStringValue2'), namedNode(graph)),
        ];
        expect(actualDataSet).toEqual(expect.arrayContaining(expectedQuads));
        expect(actualDataSet).toHaveLength(expectedQuads.length);
    });

    test('Can query one level deep for a one-to-many relationship and retrieve all triples linked to an IRI', async () => {
        const startIri: Iri = `http://example.com/ns#${uuid()}`;
        const nestedIri: Iri = `http://example.com/ns#${uuid()}`;
        const nestedNestedIri: Iri = `http://example.com/ns#${uuid()}`;
        const nested2NestedIri: Iri = `http://example.com/ns#${uuid()}`;
        const nested2Iri: Iri = `http://example.com/ns#${uuid()}`;
        const nestedNested2Iri: Iri = `http://example.com/ns#${uuid()}`;
        const nested2nested2Iri: Iri = `http://example.com/ns#${uuid()}`;
        const graph: Iri = 'http://some-test-graph';

        await directDatabaseAccess.insertData(
            graph,
            [`<${startIri}> a ex:aType`,
                `<${startIri}> ex:has-one-to-many <${nestedIri}>`,
                `<${nestedIri}> ex:aPredicate1 """aStringValue"""`,
                `<${nestedIri}> ex:has-other-one-to-many <${nestedNestedIri}>`,
                `<${nestedNestedIri}> ex:aPredicate1 """aStringValue33"""`,
                `<${nestedIri}> ex:has-other-one-to-many <${nested2NestedIri}>`,
                `<${nested2NestedIri}> ex:aPredicate1 """aStringValue64"""`,
                `<${startIri}> ex:has-one-to-many <${nested2Iri}>`,
                `<${nested2Iri}> ex:aPredicate2 """aStringValue2"""`,
                `<${nested2Iri}> ex:has-other-other-one-to-many <${nestedNested2Iri}>`,
                `<${nestedNested2Iri}> ex:aPredicate1 """aStringValue6687"""`,
                `<${nested2Iri}> ex:has-other-other-one-to-many <${nested2nested2Iri}>`,
                `<${nested2nested2Iri}> ex:aPredicate1 """aStringValue67977"""`,
            ],
            [PREFIX.ex]);

        const actualDataSet: Quad[] = await fetcher.fetch('http://some-test-graph', startIri);

        const expectedQuads = [
            quad(namedNode(startIri), namedNode('http://www.w3.org/1999/02/22-rdf-syntax-ns#type'), namedNode("http://example.com/ns#aType"), namedNode(graph)),
            quad(namedNode(startIri), namedNode('http://example.com/ns#has-one-to-many'), namedNode(nestedIri), namedNode(graph)),
            quad(namedNode(nestedIri), namedNode('http://example.com/ns#aPredicate1'), literal('aStringValue'), namedNode(graph)),
            quad(namedNode(nestedIri), namedNode('http://example.com/ns#has-other-one-to-many'), namedNode(nestedNestedIri), namedNode(graph)),
            quad(namedNode(nestedNestedIri), namedNode('http://example.com/ns#aPredicate1'), literal('aStringValue33'), namedNode(graph)),
            quad(namedNode(nestedIri), namedNode('http://example.com/ns#has-other-one-to-many'), namedNode(nested2NestedIri), namedNode(graph)),
            quad(namedNode(nested2NestedIri), namedNode('http://example.com/ns#aPredicate1'), literal('aStringValue64'), namedNode(graph)),
            quad(namedNode(startIri), namedNode('http://example.com/ns#has-one-to-many'), namedNode(nested2Iri), namedNode(graph)),
            quad(namedNode(nested2Iri), namedNode('http://example.com/ns#aPredicate2'), literal('aStringValue2'), namedNode(graph)),
            quad(namedNode(nested2Iri), namedNode('http://example.com/ns#has-other-other-one-to-many'), namedNode(nestedNested2Iri), namedNode(graph)),
            quad(namedNode(nestedNested2Iri), namedNode('http://example.com/ns#aPredicate1'), literal('aStringValue6687'), namedNode(graph)),
            quad(namedNode(nested2Iri), namedNode('http://example.com/ns#has-other-other-one-to-many'), namedNode(nested2nested2Iri), namedNode(graph)),
            quad(namedNode(nested2nested2Iri), namedNode('http://example.com/ns#aPredicate1'), literal('aStringValue67977'), namedNode(graph)),
        ];
        expect(actualDataSet).toEqual(expect.arrayContaining(expectedQuads));
        expect(actualDataSet).toHaveLength(expectedQuads.length);
    });

    test('Can query a start triple referencing its own', async () => {
        const startIri: Iri = `http://example.com/ns#${uuid()}`;
        const graph: Iri = 'http://some-test-graph';

        await directDatabaseAccess.insertData(
            graph,
            [`<${startIri}> a ex:aType`,
                    `<${startIri}> ex:has-one-to-one <${startIri}>`,
            ],
            [PREFIX.ex]);

        const actualDataSet: Quad[] = await fetcher.fetch('http://some-test-graph', startIri);

        const expectedQuads = [
            quad(namedNode(startIri), namedNode('http://www.w3.org/1999/02/22-rdf-syntax-ns#type'), namedNode("http://example.com/ns#aType"), namedNode(graph)),
            quad(namedNode(startIri), namedNode('http://example.com/ns#has-one-to-one'), namedNode(startIri), namedNode(graph)),
        ];
        expect(actualDataSet).toEqual(expect.arrayContaining(expectedQuads));
        expect(actualDataSet).toHaveLength(expectedQuads.length);
    });

    test('Can query a loop', async () => {
        const startIri: Iri = `http://example.com/ns#${uuid()}`;
        const nestedIri: Iri = `http://example.com/ns#${uuid()}`;
        const nestedNestedIri: Iri = `http://example.com/ns#${uuid()}`;
        const graph: Iri = 'http://some-test-graph';

        await directDatabaseAccess.insertData(
            graph,
            [`<${startIri}> ex:has-one-to-one <${nestedIri}>`,
                    `<${nestedIri}> ex:has-other-one-to-one <${nestedNestedIri}>`,
                    `<${nestedNestedIri}> ex:has-other-other-one-to-one <${startIri}>`,
            ],
            [PREFIX.ex]);

        const actualDataSet: Quad[] = await fetcher.fetch('http://some-test-graph', startIri);

        const expectedQuads = [
            quad(namedNode(startIri), namedNode('http://example.com/ns#has-one-to-one'), namedNode(nestedIri), namedNode(graph)),
            quad(namedNode(nestedIri), namedNode('http://example.com/ns#has-other-one-to-one'), namedNode(nestedNestedIri), namedNode(graph)),
            quad(namedNode(nestedNestedIri), namedNode('http://example.com/ns#has-other-other-one-to-one'), namedNode(startIri), namedNode(graph)),
        ];
        expect(actualDataSet).toEqual(expect.arrayContaining(expectedQuads));
        expect(actualDataSet).toHaveLength(expectedQuads.length);
    });

    test('Stops at graph boundary', async () => {
        const startIri: Iri = `http://example.com/ns#${uuid()}`;
        const nestedIri: Iri = `http://example.com/ns#${uuid()}`;
        const nestedNestedIri: Iri = `http://example.com/ns#${uuid()}`;
        const graph: Iri = 'http://some-test-graph';
        const otherGraph: Iri = 'http://some-other-test-graph';

        await directDatabaseAccess.insertData(
            graph,
            [`<${startIri}> ex:has-one-to-one <${nestedIri}>`,
                `<${nestedIri}> ex:has-other-one-to-one <${nestedNestedIri}>`,
            ],
            [PREFIX.ex]);

        await directDatabaseAccess.insertData(
            otherGraph,
            [`<${nestedNestedIri}> ex:has-other-other-one-to-one <${startIri}>`,
            ],
            [PREFIX.ex]);

        const actualDataSet: Quad[] = await fetcher.fetch('http://some-test-graph', startIri);

        const expectedQuads = [
            quad(namedNode(startIri), namedNode('http://example.com/ns#has-one-to-one'), namedNode(nestedIri), namedNode(graph)),
            quad(namedNode(nestedIri), namedNode('http://example.com/ns#has-other-one-to-one'), namedNode(nestedNestedIri), namedNode(graph)),
        ];
        expect(actualDataSet).toEqual(expect.arrayContaining(expectedQuads));
        expect(actualDataSet).toHaveLength(expectedQuads.length);
    });


});