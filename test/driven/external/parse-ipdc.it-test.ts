import {graph, parse} from 'rdflib';
import {aBestuurseenheid} from "../../core/domain/bestuurseenheid-test-builder";
import {
    DoubleQuadReporter,
    LoggingDoubleQuadReporter,
    QuadsToDomainMapper
} from "../../../src/driven/persistence/quads-to-domain-mapper";
import {Logger} from "../../../platform/logger";
import {Iri} from "../../../src/core/domain/shared/iri";

describe('Parse ipdc', () => {


   test.skip('parse ipdc example', async (done) => {
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

            //don't use parsing to instance , use expose inner methods
            const instance = new QuadsToDomainMapper(quads, bestuurseenheid.userGraph(), doubleQuadReporter)
                .instance(new Iri('http://data.lblod.info/id/public-service/f7d287bf-7adb-434e-a33e-7fe28818fd99'));

            expect(instance.id).toEqual('http://data.lblod.info/id/public-service/f7d287bf-7adb-434e-a33e-7fe28818fd99');
            done();
            return;
        });

    });

});