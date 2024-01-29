import {QuadsToDomainMapper} from "../../../src/driven/persistence/quads-to-domain-mapper";
import {literal, namedNode, quad} from "rdflib";
import {buildBestuurseenheidIri, buildConceptSnapshotIri} from "../../core/domain/iri-test-builder";
import {uuid} from "../../../mu-helper";
import {Iri} from "../../../src/core/domain/shared/iri";
import {CONCEPT_GRAPH} from "../../../config";
import {Logger} from "../../../platform/logger";
import {NS} from "../../../src/driven/persistence/namespaces";
import {InstanceTestBuilder} from "../../core/domain/instance-test-builder";
import {Language} from "../../../src/core/domain/language";

describe('quads to domain mapper', () => {

    describe('logs integrity problems', () => {

        const logger = new Logger('QuadsToDomainMapper');

        const loggerSpy = jest.spyOn(logger, 'log');

        afterEach(() => {
            jest.clearAllMocks();
        });

        test('No data integrity issues results in no logging', () => {
            const instanceId = buildConceptSnapshotIri(uuid());
            const subject = namedNode(instanceId.value);
            const graph = namedNode(CONCEPT_GRAPH);

            const quads =
                [
                    quad(subject, NS.rdf('type'), NS.cpsv('PublicService'), graph),
                    quad(subject, NS.mu('uuid'), literal(uuid()), graph),
                    quad(subject, NS.pav('createdBy'), namedNode(buildBestuurseenheidIri(uuid()).value), graph),
                    quad(subject, NS.dct('created'), literal(InstanceTestBuilder.DATE_CREATED.value), graph),
                    quad(subject, NS.dct('modified'), literal(InstanceTestBuilder.DATE_MODIFIED.value), graph),
                    quad(subject, NS.adms('status'), NS.concepts.instanceStatus(InstanceTestBuilder.STATUS), graph),
                    quad(subject, NS.dct('title'), literal('title en', Language.EN), graph),
                    quad(subject, NS.dct('title'), literal('title nl', Language.NL), graph),
                ];

            new QuadsToDomainMapper(quads, new Iri(CONCEPT_GRAPH), logger)
                .instance(instanceId);

            expect(loggerSpy).not.toHaveBeenCalled();
            jest.clearAllMocks();
        });

        test('unique value contains more than one triple', () => {
            const instanceId = buildConceptSnapshotIri(uuid());
            const subject = namedNode(instanceId.value);
            const graph = namedNode(CONCEPT_GRAPH);

            const quads =
                [
                    quad(subject, NS.rdf('type'), NS.cpsv('PublicService'), graph),
                    quad(subject, NS.mu('uuid'), literal(uuid()), graph),
                    quad(subject, NS.mu('uuid'), literal(uuid()), graph),
                    quad(subject, NS.pav('createdBy'), namedNode(buildBestuurseenheidIri(uuid()).value), graph),
                    quad(subject, NS.dct('created'), literal(InstanceTestBuilder.DATE_CREATED.value), graph),
                    quad(subject, NS.dct('modified'), literal(InstanceTestBuilder.DATE_MODIFIED.value), graph),
                    quad(subject, NS.adms('status'), NS.concepts.instanceStatus(InstanceTestBuilder.STATUS), graph),
                ];

            new QuadsToDomainMapper(quads, new Iri(CONCEPT_GRAPH), logger)
                .instance(instanceId);

            expect(loggerSpy).toHaveBeenCalledWith(`Cardinality error: <${instanceId}> <http://mu.semte.ch/vocabularies/core/uuid> null : expecting 1, got 2`);
        });

        test('unique statement contains more than one triple', () => {
            const instanceId = buildConceptSnapshotIri(uuid());
            const subject = namedNode(instanceId.value);
            const graph = namedNode(CONCEPT_GRAPH);

            const quads =
                [
                    quad(subject, NS.rdf('type'), NS.cpsv('PublicService'), graph),
                    quad(subject, NS.mu('uuid'), literal(uuid()), graph),
                    quad(subject, NS.pav('createdBy'), namedNode(buildBestuurseenheidIri(uuid()).value), graph),
                    quad(subject, NS.pav('createdBy'), namedNode(buildBestuurseenheidIri(uuid()).value), graph),
                    quad(subject, NS.dct('created'), literal(InstanceTestBuilder.DATE_CREATED.value), graph),
                    quad(subject, NS.dct('modified'), literal(InstanceTestBuilder.DATE_MODIFIED.value), graph),
                    quad(subject, NS.adms('status'), NS.concepts.instanceStatus(InstanceTestBuilder.STATUS), graph),
                ];

            new QuadsToDomainMapper(quads, new Iri(CONCEPT_GRAPH), logger)
                .instance(instanceId);

            expect(loggerSpy).toHaveBeenCalledWith(`Cardinality error: <${instanceId}> <http://purl.org/pav/createdBy> null : expecting 1, got 2`);
        });

        test('language string contains more than one triple for same language', () => {
            const instanceId = buildConceptSnapshotIri(uuid());
            const subject = namedNode(instanceId.value);
            const graph = namedNode(CONCEPT_GRAPH);

            const quads =
                [
                    quad(subject, NS.rdf('type'), NS.cpsv('PublicService'), graph),
                    quad(subject, NS.mu('uuid'), literal(uuid()), graph),
                    quad(subject, NS.pav('createdBy'), namedNode(buildBestuurseenheidIri(uuid()).value), graph),
                    quad(subject, NS.dct('created'), literal(InstanceTestBuilder.DATE_CREATED.value), graph),
                    quad(subject, NS.dct('modified'), literal(InstanceTestBuilder.DATE_MODIFIED.value), graph),
                    quad(subject, NS.adms('status'), NS.concepts.instanceStatus(InstanceTestBuilder.STATUS), graph),
                    quad(subject, NS.dct('title'), literal('title nl', Language.NL), graph),
                    quad(subject, NS.dct('title'), literal('title nl another triple', Language.NL), graph),
                ];

            new QuadsToDomainMapper(quads, new Iri(CONCEPT_GRAPH), logger)
                .instance(instanceId);

            expect(loggerSpy).toHaveBeenCalledWith(`Cardinality error: <${instanceId}> <http://purl.org/dc/terms/title> null : expecting 1, got 2`);
        });


    });

});