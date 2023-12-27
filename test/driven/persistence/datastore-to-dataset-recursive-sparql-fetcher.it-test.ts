import {DirectDatabaseAccess} from "./direct-database-access";
import {TEST_SPARQL_ENDPOINT} from "../../test.config";
import {uuid} from "../../../mu-helper";
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
        const anUUID = uuid();
        const startIri: Iri = `http://example.com/ns#${anUUID}`;
        const graph: Iri = 'http://some-test-graph';

        await directDatabaseAccess.insertData(
            graph,
            [`<${startIri}> a ex:aType`,
                `<${startIri}> ex:aPredicate1 """aStringValue"""`,
            ],
            [PREFIX.ex]);

        const actualDataSet: Quad[] = await fetcher.fetch('http://some-test-graph', startIri);

        expect(actualDataSet).toEqual([quad(namedNode(startIri), namedNode('http://www.w3.org/1999/02/22-rdf-syntax-ns#type'), namedNode("http://example.com/ns#aType"), namedNode(graph)),
                                                quad(namedNode(startIri), namedNode('http://example.com/ns#aPredicate1'), literal('aStringValue'), namedNode(graph))]);

    });

});