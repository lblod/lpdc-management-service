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
import {SystemError} from "../../../src/core/domain/shared/lpdc-error";

describe('recursively fetches a part of a datastore into a array of quads using sparql endpoint', () => {

    const directDatabaseAccess = new DirectDatabaseAccess(TEST_SPARQL_ENDPOINT);
    const fetcher = new DatastoreToQuadsRecursiveSparqlFetcher(TEST_SPARQL_ENDPOINT);

    test('Throws Error when endpoint cannot be reached', async () => {
        const fetcherWithIncorrectEndpoint = new DatastoreToQuadsRecursiveSparqlFetcher('thiscanotbereached');

        const startIri: Iri = new Iri(`http://example.com/ns#abc}`);

        await expect(fetcherWithIncorrectEndpoint.fetch(new Iri('http://some-test-graph'), startIri, [], [], [])).rejects.toThrowWithMessage(Error, 'All retries failed. Last error: Error: Invalid URI "thiscanotbereached"');
    });

    test('Can query non recursively all triples linked to an IRI', async () => {
        const startIri: Iri = new Iri(`http://example.com/ns#${uuid()}`);
        const graph: Iri = new Iri('http://some-test-graph');
        const aDateTime = new Date('2022-08-13T15:36:52Z');
        const aDate = new Date('2023-10-28');

        await directDatabaseAccess.insertData(
            graph.value,
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

        const otherStartIri: Iri = new Iri(`http://example.com/ns#${uuid()}`);
        await directDatabaseAccess.insertData(
            graph.value,
            [`<${otherStartIri}> a ex:anOtherType`,
            ],
            [PREFIX.ex]);


        const actualDataSet: Quad[] = await fetcher.fetch(new Iri('http://some-test-graph'), startIri, [], [], []);

        const expectedQuads = [
            quad(namedNode(startIri.value), namedNode('http://www.w3.org/1999/02/22-rdf-syntax-ns#type'), namedNode("http://example.com/ns#aType"), namedNode(graph.value)),
            quad(namedNode(startIri.value), namedNode('http://example.com/ns#aPredicate1'), literal('aStringValue', "http://www.w3.org/2001/XMLSchema#string"), namedNode(graph.value)),
            quad(namedNode(startIri.value), namedNode('http://example.com/ns#aPredicate2'), literal('aStringValue-no-lang', "http://www.w3.org/2001/XMLSchema#string"), namedNode(graph.value)),
            quad(namedNode(startIri.value), namedNode('http://example.com/ns#aPredicate2'), literal('aStringValue-nl', "nl"), namedNode(graph.value)),
            quad(namedNode(startIri.value), namedNode('http://example.com/ns#aPredicate2'), literal('aStringValue-en', "en"), namedNode(graph.value)),
            quad(namedNode(startIri.value), namedNode('http://example.com/ns#aPredicate3'), literal('2022-08-13T15:36:52Z', "http://www.w3.org/2001/XMLSchema#dateTime"), namedNode(graph.value)),
            quad(namedNode(startIri.value), namedNode('http://example.com/ns#aPredicate4'), literal('2023-10-28', "http://www.w3.org/2001/XMLSchema#date"), namedNode(graph.value)),
            quad(namedNode(startIri.value), namedNode('http://example.com/ns#aPredicate5'), literal('1200', "http://www.w3.org/2001/XMLSchema#integer"), namedNode(graph.value)),
        ];

        expect(actualDataSet).toEqual(expect.arrayContaining(expectedQuads));
        expect(actualDataSet).toHaveLength(expectedQuads.length);
    });

    test('Can query one level deep for a one-to-one relationship and retrieve all triples linked to an IRI', async () => {
        const startIri: Iri = new Iri(`http://example.com/ns#${uuid()}`);
        const nestedIri: Iri = new Iri(`http://example.com/ns#${uuid()}`);
        const graph: Iri = new Iri('http://some-test-graph');

        await directDatabaseAccess.insertData(
            graph.value,
            [`<${startIri}> a ex:aType`,
                `<${startIri}> ex:has-one-to-one <${nestedIri}>`,
                `<${nestedIri}> ex:aPredicate1 """aStringValue"""`,
            ],
            [PREFIX.ex]);

        const actualDataSet: Quad[] = await fetcher.fetch(new Iri('http://some-test-graph'), startIri, [], [], []);

        const expectedQuads = [
            quad(namedNode(startIri.value), namedNode('http://www.w3.org/1999/02/22-rdf-syntax-ns#type'), namedNode("http://example.com/ns#aType"), namedNode(graph.value)),
            quad(namedNode(startIri.value), namedNode('http://example.com/ns#has-one-to-one'), namedNode(nestedIri.value), namedNode(graph.value)),
            quad(namedNode(nestedIri.value), namedNode('http://example.com/ns#aPredicate1'), literal('aStringValue'), namedNode(graph.value)),
        ];
        expect(actualDataSet).toEqual(expect.arrayContaining(expectedQuads));
        expect(actualDataSet).toHaveLength(expectedQuads.length);
    });

    test('Can query one level deep for a one-to-many relationship and retrieve all triples linked to an IRI', async () => {
        const startIri: Iri = new Iri(`http://example.com/ns#${uuid()}`);
        const nestedIri: Iri = new Iri(`http://example.com/ns#${uuid()}`);
        const nestedIri2: Iri = new Iri(`http://example.com/ns#${uuid()}`);
        const graph: Iri = new Iri('http://some-test-graph');

        await directDatabaseAccess.insertData(
            graph.value,
            [`<${startIri}> a ex:aType`,
                `<${startIri}> ex:has-one-to-many <${nestedIri}>`,
                `<${nestedIri}> ex:aPredicate1 """aStringValue"""`,
                `<${startIri}> ex:has-one-to-many <${nestedIri2}>`,
                `<${nestedIri2}> ex:aPredicate2 """aStringValue2"""`,
            ],
            [PREFIX.ex]);

        const actualDataSet: Quad[] = await fetcher.fetch(new Iri('http://some-test-graph'), startIri, [], [], []);

        const expectedQuads = [
            quad(namedNode(startIri.value), namedNode('http://www.w3.org/1999/02/22-rdf-syntax-ns#type'), namedNode("http://example.com/ns#aType"), namedNode(graph.value)),
            quad(namedNode(startIri.value), namedNode('http://example.com/ns#has-one-to-many'), namedNode(nestedIri.value), namedNode(graph.value)),
            quad(namedNode(nestedIri.value), namedNode('http://example.com/ns#aPredicate1'), literal('aStringValue'), namedNode(graph.value)),
            quad(namedNode(startIri.value), namedNode('http://example.com/ns#has-one-to-many'), namedNode(nestedIri2.value), namedNode(graph.value)),
            quad(namedNode(nestedIri2.value), namedNode('http://example.com/ns#aPredicate2'), literal('aStringValue2'), namedNode(graph.value)),
        ];
        expect(actualDataSet).toEqual(expect.arrayContaining(expectedQuads));
        expect(actualDataSet).toHaveLength(expectedQuads.length);
    });

    test('Can query multiple levels deep for a one-to-one relationship and retrieve all triples linked to an IRI', async () => {
        const startIri: Iri = new Iri(`http://example.com/ns#${uuid()}`);
        const nestedIri: Iri = new Iri(`http://example.com/ns#${uuid()}`);
        const nestedNestedIri: Iri = new Iri(`http://example.com/ns#${uuid()}`);
        const graph: Iri = new Iri('http://some-test-graph');

        await directDatabaseAccess.insertData(
            graph.value,
            [`<${startIri}> a ex:aType`,
                `<${startIri}> ex:has-one-to-one <${nestedIri}>`,
                `<${nestedIri}> ex:aPredicate1 """aStringValue"""`,
                `<${nestedIri}> ex:has-other-one-to-one <${nestedNestedIri}>`,
                `<${nestedNestedIri}> ex:aPredicate2 """aStringValue2"""`,
            ],
            [PREFIX.ex]);

        const actualDataSet: Quad[] = await fetcher.fetch(new Iri('http://some-test-graph'), startIri, [], [], []);

        const expectedQuads = [
            quad(namedNode(startIri.value), namedNode('http://www.w3.org/1999/02/22-rdf-syntax-ns#type'), namedNode("http://example.com/ns#aType"), namedNode(graph.value)),
            quad(namedNode(startIri.value), namedNode('http://example.com/ns#has-one-to-one'), namedNode(nestedIri.value), namedNode(graph.value)),
            quad(namedNode(nestedIri.value), namedNode('http://example.com/ns#aPredicate1'), literal('aStringValue'), namedNode(graph.value)),
            quad(namedNode(nestedIri.value), namedNode('http://example.com/ns#has-other-one-to-one'), namedNode(nestedNestedIri.value), namedNode(graph.value)),
            quad(namedNode(nestedNestedIri.value), namedNode('http://example.com/ns#aPredicate2'), literal('aStringValue2'), namedNode(graph.value)),
        ];
        expect(actualDataSet).toEqual(expect.arrayContaining(expectedQuads));
        expect(actualDataSet).toHaveLength(expectedQuads.length);
    });

    test('Can query one level deep for a one-to-many relationship and retrieve all triples linked to an IRI', async () => {
        const startIri: Iri = new Iri(`http://example.com/ns#${uuid()}`);
        const nestedIri: Iri = new Iri(`http://example.com/ns#${uuid()}`);
        const nestedNestedIri: Iri = new Iri(`http://example.com/ns#${uuid()}`);
        const nested2NestedIri: Iri = new Iri(`http://example.com/ns#${uuid()}`);
        const nested2Iri: Iri = new Iri(`http://example.com/ns#${uuid()}`);
        const nestedNested2Iri: Iri = new Iri(`http://example.com/ns#${uuid()}`);
        const nested2nested2Iri: Iri = new Iri(`http://example.com/ns#${uuid()}`);
        const graph: Iri = new Iri('http://some-test-graph');

        await directDatabaseAccess.insertData(
            graph.value,
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

        const actualDataSet: Quad[] = await fetcher.fetch(new Iri('http://some-test-graph'), startIri, [], [], []);

        const expectedQuads = [
            quad(namedNode(startIri.value), namedNode('http://www.w3.org/1999/02/22-rdf-syntax-ns#type'), namedNode("http://example.com/ns#aType"), namedNode(graph.value)),
            quad(namedNode(startIri.value), namedNode('http://example.com/ns#has-one-to-many'), namedNode(nestedIri.value), namedNode(graph.value)),
            quad(namedNode(nestedIri.value), namedNode('http://example.com/ns#aPredicate1'), literal('aStringValue'), namedNode(graph.value)),
            quad(namedNode(nestedIri.value), namedNode('http://example.com/ns#has-other-one-to-many'), namedNode(nestedNestedIri.value), namedNode(graph.value)),
            quad(namedNode(nestedNestedIri.value), namedNode('http://example.com/ns#aPredicate1'), literal('aStringValue33'), namedNode(graph.value)),
            quad(namedNode(nestedIri.value), namedNode('http://example.com/ns#has-other-one-to-many'), namedNode(nested2NestedIri.value), namedNode(graph.value)),
            quad(namedNode(nested2NestedIri.value), namedNode('http://example.com/ns#aPredicate1'), literal('aStringValue64'), namedNode(graph.value)),
            quad(namedNode(startIri.value), namedNode('http://example.com/ns#has-one-to-many'), namedNode(nested2Iri.value), namedNode(graph.value)),
            quad(namedNode(nested2Iri.value), namedNode('http://example.com/ns#aPredicate2'), literal('aStringValue2'), namedNode(graph.value)),
            quad(namedNode(nested2Iri.value), namedNode('http://example.com/ns#has-other-other-one-to-many'), namedNode(nestedNested2Iri.value), namedNode(graph.value)),
            quad(namedNode(nestedNested2Iri.value), namedNode('http://example.com/ns#aPredicate1'), literal('aStringValue6687'), namedNode(graph.value)),
            quad(namedNode(nested2Iri.value), namedNode('http://example.com/ns#has-other-other-one-to-many'), namedNode(nested2nested2Iri.value), namedNode(graph.value)),
            quad(namedNode(nested2nested2Iri.value), namedNode('http://example.com/ns#aPredicate1'), literal('aStringValue67977'), namedNode(graph.value)),
        ];
        expect(actualDataSet).toEqual(expect.arrayContaining(expectedQuads));
        expect(actualDataSet).toHaveLength(expectedQuads.length);
    });

    test('Can query a start triple referencing its own', async () => {
        const startIri: Iri = new Iri(`http://example.com/ns#${uuid()}`);
        const graph: Iri = new Iri('http://some-test-graph');

        await directDatabaseAccess.insertData(
            graph.value,
            [`<${startIri}> a ex:aType`,
                `<${startIri}> ex:has-one-to-one <${startIri}>`,
            ],
            [PREFIX.ex]);

        const actualDataSet: Quad[] = await fetcher.fetch(new Iri('http://some-test-graph'), startIri, [], [], []);

        const expectedQuads = [
            quad(namedNode(startIri.value), namedNode('http://www.w3.org/1999/02/22-rdf-syntax-ns#type'), namedNode("http://example.com/ns#aType"), namedNode(graph.value)),
            quad(namedNode(startIri.value), namedNode('http://example.com/ns#has-one-to-one'), namedNode(startIri.value), namedNode(graph.value)),
        ];
        expect(actualDataSet).toEqual(expect.arrayContaining(expectedQuads));
        expect(actualDataSet).toHaveLength(expectedQuads.length);
    });

    test('Can query a loop', async () => {
        const startIri: Iri = new Iri(`http://example.com/ns#${uuid()}`);
        const nestedIri: Iri = new Iri(`http://example.com/ns#${uuid()}`);
        const nestedNestedIri: Iri = new Iri(`http://example.com/ns#${uuid()}`);
        const graph: Iri = new Iri('http://some-test-graph');

        await directDatabaseAccess.insertData(
            graph.value,
            [`<${startIri}> ex:has-one-to-one <${nestedIri}>`,
                `<${nestedIri}> ex:has-other-one-to-one <${nestedNestedIri}>`,
                `<${nestedNestedIri}> ex:has-other-other-one-to-one <${startIri}>`,
            ],
            [PREFIX.ex]);

        const actualDataSet: Quad[] = await fetcher.fetch(new Iri('http://some-test-graph'), startIri, [], [], []);

        const expectedQuads = [
            quad(namedNode(startIri.value), namedNode('http://example.com/ns#has-one-to-one'), namedNode(nestedIri.value), namedNode(graph.value)),
            quad(namedNode(nestedIri.value), namedNode('http://example.com/ns#has-other-one-to-one'), namedNode(nestedNestedIri.value), namedNode(graph.value)),
            quad(namedNode(nestedNestedIri.value), namedNode('http://example.com/ns#has-other-other-one-to-one'), namedNode(startIri.value), namedNode(graph.value)),
        ];
        expect(actualDataSet).toEqual(expect.arrayContaining(expectedQuads));
        expect(actualDataSet).toHaveLength(expectedQuads.length);
    });

    test('Stops at graph boundary', async () => {
        const startIri = new Iri(`http://example.com/ns#${uuid()}`);
        const nestedIri = new Iri(`http://example.com/ns#${uuid()}`);
        const nestedNestedIri = new Iri(`http://example.com/ns#${uuid()}`);
        const graph = new Iri('http://some-test-graph');
        const otherGraph = new Iri('http://some-other-test-graph');

        await directDatabaseAccess.insertData(
            graph.value,
            [`<${startIri}> ex:has-one-to-one <${nestedIri}>`,
                `<${nestedIri}> ex:has-other-one-to-one <${nestedNestedIri}>`,
            ],
            [PREFIX.ex]);

        await directDatabaseAccess.insertData(
            otherGraph.value,
            [`<${nestedNestedIri}> ex:has-other-other-one-to-one <${startIri}>`,
            ],
            [PREFIX.ex]);

        const actualDataSet: Quad[] = await fetcher.fetch(new Iri('http://some-test-graph'), startIri, [], [], []);

        const expectedQuads = [
            quad(namedNode(startIri.value), namedNode('http://example.com/ns#has-one-to-one'), namedNode(nestedIri.value), namedNode(graph.value)),
            quad(namedNode(nestedIri.value), namedNode('http://example.com/ns#has-other-one-to-one'), namedNode(nestedNestedIri.value), namedNode(graph.value)),
        ];
        expect(actualDataSet).toEqual(expect.arrayContaining(expectedQuads));
        expect(actualDataSet).toHaveLength(expectedQuads.length);
    });

    test('Stops at Predicates To Stop Recursion', async () => {
        const startIri = new Iri(`http://example.com/ns#${uuid()}`);
        const nestedIri = new Iri(`http://example.com/ns#${uuid()}`);
        const otherNestedIri = new Iri(`http://example.com/ns#${uuid()}`);
        const otherNestedNestedIri = new Iri(`http://example.com/ns#${uuid()}`);
        const nestedNestedIri = new Iri(`http://example.com/ns#${uuid()}`);
        const nestedNestedNestedIri = new Iri(`http://example.com/ns#${uuid()}`);
        const graph = new Iri('http://some-test-graph');

        await directDatabaseAccess.insertData(
            graph.value,
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

        const actualDataSet: Quad[] = await fetcher.fetch(new Iri('http://some-test-graph'), startIri, [], [NS.ex('predicate-to-stop-recursion').value, NS.ex('even-deeper-relation-to-stop-querying').value], [NS.skos('Concept').value]);

        const expectedQuads = [
            quad(namedNode(startIri.value), NS.ex('has-one-to-many'), namedNode(nestedIri.value), namedNode(graph.value)),
            quad(namedNode(startIri.value), NS.ex('predicate-to-stop-recursion'), namedNode(otherNestedIri.value), namedNode(graph.value)),
            quad(namedNode(nestedIri.value), NS.ex('has-one-to-one'), namedNode(nestedNestedIri.value), namedNode(graph.value)),
            quad(namedNode(nestedNestedIri.value), NS.rdf('type'), NS.ex('TypeToQueryOn'), namedNode(graph.value)),
            quad(namedNode(nestedNestedIri.value), NS.ex('a-value'), literal('abc'), namedNode(graph.value)),
            quad(namedNode(nestedNestedIri.value), NS.ex('even-deeper-relation-to-stop-querying'), namedNode(nestedNestedNestedIri.value), namedNode(graph.value)),
        ];

        expect(actualDataSet).toHaveLength(expectedQuads.length);
        expect(actualDataSet).toEqual(expect.arrayContaining(expectedQuads));
    });

    test('Does not query predicates that should not be queried', async () => {
        const startIri = new Iri(`http://example.com/ns#${uuid()}`);
        const nestedIri = new Iri(`http://example.com/ns#${uuid()}`);
        const otherNestedIri = new Iri(`http://example.com/ns#${uuid()}`);
        const graph = new Iri('http://some-test-graph');

        await directDatabaseAccess.insertData(
            graph.value,
            [`<${startIri}> ex:has-one-to-many <${nestedIri}>`,
                `<${startIri}> ex:predicate-to-not-query <${otherNestedIri}>`,
                `<${nestedIri}> a ex:AnotherType`,
                `<${nestedIri}> ex:predicate-to-query """a-string-value"""`,
                `<${nestedIri}> ex:another-predicate-to-not-query """another-string-value"""`,
            ],
            [PREFIX.ex]);

        const actualDataSet: Quad[] = await fetcher.fetch(new Iri('http://some-test-graph'), startIri, [NS.ex('predicate-to-not-query').value, NS.ex('another-predicate-to-not-query').value], [], []);

        const expectedQuads = [
            quad(namedNode(startIri.value), NS.ex('has-one-to-many'), namedNode(nestedIri.value), namedNode(graph.value)),
            quad(namedNode(nestedIri.value), NS.rdf('type'), NS.ex('AnotherType'), namedNode(graph.value)),
            quad(namedNode(nestedIri.value), NS.ex('predicate-to-query'), literal('a-string-value'), namedNode(graph.value)),
        ];

        expect(actualDataSet).toHaveLength(expectedQuads.length);
        expect(actualDataSet).toEqual(expect.arrayContaining(expectedQuads));
    });

    test('Recursing Into an illegal Type To Recurse Into throws error', async () => {
        const startIri = new Iri(`http://example.com/ns#${uuid()}`);
        const nestedIri = new Iri(`http://example.com/ns#${uuid()}`);
        const graph = new Iri('http://some-test-graph');

        await directDatabaseAccess.insertData(
            graph.value,
            [`<${startIri}> ex:has-one-to-many <${nestedIri}>`,
                `<${nestedIri}> a skos:Concept`,
            ],
            [PREFIX.ex, PREFIX.skos]);

        await expect(fetcher.fetch(graph, startIri, [], [], [NS.skos('Concept').value])).rejects.toThrowWithMessage(SystemError, `Recursie in <http://www.w3.org/2004/02/skos/core#Concept> vanuit <${nestedIri.value}> is niet toegestaan`);
    });


});