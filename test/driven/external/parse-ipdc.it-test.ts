import {graph, log, parse, sym} from 'rdflib';
import {aBestuurseenheid} from "../../core/domain/bestuurseenheid-test-builder";
import {
    DoubleQuadReporter,
    LoggingDoubleQuadReporter,
    QuadsToDomainMapper
} from "../../../src/driven/persistence/quads-to-domain-mapper";
import {Logger} from "../../../platform/logger";
import {Iri} from "../../../src/core/domain/shared/iri";

describe('Parse ipdc', () => {


    test('chat gpt example', async (done) => {
        // Example JSON-LD data
        const jsonldData = `
        {
          "@context": {
            "name": "http://xmlns.com/foaf/0.1/name",
            "homepage": {
              "@id": "http://xmlns.com/foaf/0.1/homepage",
              "@type": "@id"
            }
          },
          "@id": "http://example.org/person",
          "name": "John Doe",
          "homepage": "http://johndoe.com"
        }`;

        // Create an empty RDF graph
        const store = graph();

        // Define the MIME type for JSON-LD
        const contentType = 'application/ld+json';

        // Define a base URI for the data
        const baseUri = 'http://example.org/';

        // Parse the JSON-LD data into the graph
        parse(jsonldData, store, baseUri, contentType, callback =>  {
            console.log('callback called');
            // Querying the data to retrieve the name of the person
            const nameTerm = sym('http://example.org/person');
            const namePredicate = sym('http://xmlns.com/foaf/0.1/name');
            const name = store.any(nameTerm, namePredicate, undefined);

            console.log(`Name: ${name?.value}`);  // Output: Name: John Doe
            done();
        });
    });

    test('parse ipdc example', async (done) => {
        const bestuurseenheid = aBestuurseenheid().build();
        const res = await fetch('https://productencatalogus-v3.vlaanderen.be/doc/instantie/f7d287bf-7adb-434e-a33e-7fe28818fd99', {
            headers: {'Accept': 'application/ld+json'}
        });
        const jsonLdData = await res.json();

        const context = jsonLdData['@context'];
        const resContext = await fetch(context, {
            headers: {'Accept': 'application/ld+json'}
        });

        jsonLdData['@id'] = 'http://data.lblod.info/id/public-service/f7d287bf-7adb-434e-a33e-7fe28818fd99';
        jsonLdData['@context'] = (await resContext.json())['@context'];

        // const quads = await jsonld.toRDF(jsonLdData);
        const store = graph();
        const jsonLdDataAsString = JSON.stringify(jsonLdData);
        parse(jsonLdDataAsString, store, bestuurseenheid.userGraph().value, 'application/ld+json', (error: any, kb: any)  => {
            const doubleQuadReporter: DoubleQuadReporter = new LoggingDoubleQuadReporter(new Logger('Instance-QuadsToDomainLogger'));

            const quads = kb.statementsMatching();

            const instance = new QuadsToDomainMapper(quads, bestuurseenheid.userGraph(), doubleQuadReporter)
                .instance(new Iri('http://data.lblod.info/id/public-service/f7d287bf-7adb-434e-a33e-7fe28818fd99'));

            expect(instance.id).toEqual('http://data.lblod.info/id/public-service/f7d287bf-7adb-434e-a33e-7fe28818fd99');
            done();
            return;
        });

    });

});