import {DirectDatabaseAccess} from "./direct-database-access";
import {TEST_SPARQL_ENDPOINT} from "../../test.config";
import {sparqlEscapeDate, sparqlEscapeDateTime, sparqlEscapeInt, uuid} from "../../../mu-helper";
import {PREFIX} from "../../../config";
import {
    DatastoreToQuadsRecursiveSparqlFetcher
} from "../../../src/driven/persistence/datastore-to-quads-recursive-sparql-fetcher";
import {Iri} from "../../../src/core/domain/shared/iri";
import {literal, namedNode, quad} from 'rdflib';
import {Quad} from "rdflib/lib/tf-types";
import {NS} from "../../../src/driven/persistence/namespaces";

describe('recursively fetches a part of a datastore into a array of quads using sparql endpoint', () => {

    const directDatabaseAccess = new DirectDatabaseAccess(TEST_SPARQL_ENDPOINT);
    const fetcher = new DatastoreToQuadsRecursiveSparqlFetcher(TEST_SPARQL_ENDPOINT);

    test('Throws Error when endpoint cannot be reached', async () => {
        const fetcherWithIncorrectEndpoint = new DatastoreToQuadsRecursiveSparqlFetcher('thiscanotbereached');

        const startIri: Iri = `http://example.com/ns#abc}`;

        await expect(fetcherWithIncorrectEndpoint.fetch('http://some-test-graph', startIri, [], [], [])).rejects.toThrow('All retries failed. Last error: Error: Invalid URI "thiscanotbereached"');
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


        const actualDataSet: Quad[] = await fetcher.fetch('http://some-test-graph', startIri, [], [], []);

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

        const actualDataSet: Quad[] = await fetcher.fetch('http://some-test-graph', startIri, [], [], []);

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

        const actualDataSet: Quad[] = await fetcher.fetch('http://some-test-graph', startIri, [], [], []);

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

        const actualDataSet: Quad[] = await fetcher.fetch('http://some-test-graph', startIri, [], [], []);

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

        const actualDataSet: Quad[] = await fetcher.fetch('http://some-test-graph', startIri, [], [], []);

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

        const actualDataSet: Quad[] = await fetcher.fetch('http://some-test-graph', startIri, [], [], []);

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

        const actualDataSet: Quad[] = await fetcher.fetch('http://some-test-graph', startIri, [], [], []);

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

        const actualDataSet: Quad[] = await fetcher.fetch('http://some-test-graph', startIri, [], [], []);

        const expectedQuads = [
            quad(namedNode(startIri), namedNode('http://example.com/ns#has-one-to-one'), namedNode(nestedIri), namedNode(graph)),
            quad(namedNode(nestedIri), namedNode('http://example.com/ns#has-other-one-to-one'), namedNode(nestedNestedIri), namedNode(graph)),
        ];
        expect(actualDataSet).toEqual(expect.arrayContaining(expectedQuads));
        expect(actualDataSet).toHaveLength(expectedQuads.length);
    });

    test('Stops at Predicates To Stop Recursion', async () => {
        const startIri: Iri = `http://example.com/ns#${uuid()}`;
        const nestedIri: Iri = `http://example.com/ns#${uuid()}`;
        const otherNestedIri: Iri = `http://example.com/ns#${uuid()}`;
        const otherNestedNestedIri: Iri = `http://example.com/ns#${uuid()}`;
        const nestedNestedIri: Iri = `http://example.com/ns#${uuid()}`;
        const nestedNestedNestedIri: Iri = `http://example.com/ns#${uuid()}`;
        const graph: Iri = 'http://some-test-graph';

        await directDatabaseAccess.insertData(
            graph,
            [`<${startIri}> ex:has-one-to-many <${nestedIri}>`,
                `<${startIri}> ex:predicate-to-stop-recursion <${otherNestedIri}>`,
                `<${nestedIri}> ex:has-one-to-one <${nestedNestedIri}>`,
                `<${nestedNestedIri}> a ex:TypeToQueryOn`,
                `<${nestedNestedIri}> ex:a-value "abc"`,
                `<${nestedNestedIri}> ex:even-deeper-relation-to-stop-querying <${nestedNestedNestedIri}>`,
                `<${nestedNestedNestedIri}> a ex:ATypeToStopRecursion`,
                `<${nestedNestedNestedIri}> ex:some-other-value "def"`,
                `<${otherNestedIri}> a ex:AnotherType`,
                `<${otherNestedIri}> ex:some-other-relation <${otherNestedNestedIri}>`,
            ],
            [PREFIX.ex]);

        const actualDataSet: Quad[] = await fetcher.fetch('http://some-test-graph', startIri, [], [NS.ex('predicate-to-stop-recursion').value, NS.ex('even-deeper-relation-to-stop-querying').value], [NS.skos('Concept').value]);

        const expectedQuads = [
            quad(namedNode(startIri), NS.ex('has-one-to-many'), namedNode(nestedIri), namedNode(graph)),
            quad(namedNode(startIri), NS.ex('predicate-to-stop-recursion'), namedNode(otherNestedIri), namedNode(graph)),
            quad(namedNode(nestedIri), NS.ex('has-one-to-one'), namedNode(nestedNestedIri), namedNode(graph)),
            quad(namedNode(nestedNestedIri), NS.rdf('type'), NS.ex('TypeToQueryOn'), namedNode(graph)),
            quad(namedNode(nestedNestedIri), NS.ex('a-value'), literal('abc'), namedNode(graph)),
            quad(namedNode(nestedNestedIri), NS.ex('even-deeper-relation-to-stop-querying'), namedNode(nestedNestedNestedIri), namedNode(graph)),
        ];

        expect(actualDataSet).toHaveLength(expectedQuads.length);
        expect(actualDataSet).toEqual(expect.arrayContaining(expectedQuads));
    });

    test('Does not query predicates that should not be queried', async () => {
        const startIri: Iri = `http://example.com/ns#${uuid()}`;
        const nestedIri: Iri = `http://example.com/ns#${uuid()}`;
        const otherNestedIri: Iri = `http://example.com/ns#${uuid()}`;
        const graph: Iri = 'http://some-test-graph';

        await directDatabaseAccess.insertData(
            graph,
            [`<${startIri}> ex:has-one-to-many <${nestedIri}>`,
                `<${startIri}> ex:predicate-to-not-query <${otherNestedIri}>`,
                `<${nestedIri}> a ex:AnotherType`,
                `<${nestedIri}> ex:predicate-to-query """a-string-value"""`,
                `<${nestedIri}> ex:another-predicate-to-not-query """another-string-value"""`,
            ],
            [PREFIX.ex]);

        const actualDataSet: Quad[] = await fetcher.fetch('http://some-test-graph', startIri, [NS.ex('predicate-to-not-query').value, NS.ex('another-predicate-to-not-query').value], [], []);

        const expectedQuads = [
            quad(namedNode(startIri), NS.ex('has-one-to-many'), namedNode(nestedIri), namedNode(graph)),
            quad(namedNode(nestedIri), NS.rdf('type'), NS.ex('AnotherType'), namedNode(graph)),
            quad(namedNode(nestedIri), NS.ex('predicate-to-query'), literal('a-string-value'), namedNode(graph)),
        ];

        expect(actualDataSet).toHaveLength(expectedQuads.length);
        expect(actualDataSet).toEqual(expect.arrayContaining(expectedQuads));
    });

    test('Recursing Into an illegal Type To Recurse Into throws error', async () => {
        const startIri: Iri = `http://example.com/ns#${uuid()}`;
        const nestedIri: Iri = `http://example.com/ns#${uuid()}`;
        const graph: Iri = 'http://some-test-graph';

        await directDatabaseAccess.insertData(
            graph,
            [`<${startIri}> ex:has-one-to-many <${nestedIri}>`,
                `<${nestedIri}> a skos:Concept`,
            ],
            [PREFIX.ex, PREFIX.skos]);

        await expect(fetcher.fetch(graph, startIri, [], [], [NS.skos('Concept').value])).rejects.toThrow(`Recursing into <http://www.w3.org/2004/02/skos/core#Concept> from <${nestedIri}> is not allowed`);
    });


});