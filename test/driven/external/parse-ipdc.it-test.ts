import {graph, parse, sym} from 'rdflib';

describe('Parse ipdc', () => {


    test('chat gpt example', async () => {
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
        });


    });

});