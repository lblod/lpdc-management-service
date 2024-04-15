import {LoggingDoubleQuadReporter, QuadsToDomainMapper} from "../../../src/driven/persistence/quads-to-domain-mapper";
import {literal, namedNode, quad} from "rdflib";
import {buildBestuurseenheidIri, buildConceptSnapshotIri, buildInstanceIri} from "../../core/domain/iri-test-builder";
import {uuid} from "../../../mu-helper";
import {Iri} from "../../../src/core/domain/shared/iri";
import {CONCEPT_GRAPH} from "../../../config";
import {Logger} from "../../../platform/logger";
import {NS} from "../../../src/driven/persistence/namespaces";
import {InstanceTestBuilder} from "../../core/domain/instance-test-builder";
import {Language} from "../../../src/core/domain/language";
import {aBestuurseenheid} from "../../core/domain/bestuurseenheid-test-builder";
import {aMinimalCostForInstance} from "../../core/domain/cost-test-builder";
import {InvariantError, SystemError} from "../../../src/core/domain/shared/lpdc-error";

describe('quads to domain mapper', () => {

    const logger = new Logger('QuadsToDomainMapper');
    describe('logs integrity problems', () => {


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
                    quad(subject, NS.rdf('type'), NS.lpdcExt('InstancePublicService'), graph),
                    quad(subject, NS.mu('uuid'), literal(uuid()), graph),
                    quad(subject, NS.pav('createdBy'), namedNode(buildBestuurseenheidIri(uuid()).value), graph),
                    quad(subject, NS.schema('dateCreated'), literal(InstanceTestBuilder.DATE_CREATED.value), graph),
                    quad(subject, NS.schema('dateModified'), literal(InstanceTestBuilder.DATE_MODIFIED.value), graph),
                    quad(subject, NS.adms('status'), NS.concepts.instanceStatus(InstanceTestBuilder.STATUS), graph),
                    quad(subject, NS.lpdcExt('dutchLanguageVariant'), literal(Language.NL), graph),
                    quad(subject, NS.dct('title'), literal('title en', Language.EN), graph),
                    quad(subject, NS.dct('title'), literal('title nl', Language.NL), graph),
                ];

            new QuadsToDomainMapper(quads, new Iri(CONCEPT_GRAPH), new LoggingDoubleQuadReporter(logger)).instance(instanceId);

            expect(loggerSpy).not.toHaveBeenCalled();
            jest.clearAllMocks();
        });

        test('unique value contains more than one triple', () => {
            const instanceId = buildConceptSnapshotIri(uuid());
            const subject = namedNode(instanceId.value);
            const graph = namedNode(CONCEPT_GRAPH);
            const uuid1 = uuid();
            const uuid2 = uuid();

            const quads =
                [
                    quad(subject, NS.rdf('type'), NS.lpdcExt('InstancePublicService'), graph),
                    quad(subject, NS.mu('uuid'), literal(uuid1), graph),
                    quad(subject, NS.mu('uuid'), literal(uuid2), graph),
                    quad(subject, NS.pav('createdBy'), namedNode(buildBestuurseenheidIri(uuid()).value), graph),
                    quad(subject, NS.schema('dateCreated'), literal(InstanceTestBuilder.DATE_CREATED.value), graph),
                    quad(subject, NS.schema('dateModified'), literal(InstanceTestBuilder.DATE_MODIFIED.value), graph),
                    quad(subject, NS.adms('status'), NS.concepts.instanceStatus(InstanceTestBuilder.STATUS), graph),
                    quad(subject, NS.lpdcExt('dutchLanguageVariant'), literal(InstanceTestBuilder.DUTCH_LANGUAGE_VARIANT), graph),
                ];

            new QuadsToDomainMapper(quads, new Iri(CONCEPT_GRAPH), new LoggingDoubleQuadReporter(logger))
                .instance(instanceId);

            expect(loggerSpy).toHaveBeenCalledWith(`DoubleQuad|http://mu.semte.ch/graphs/public|${instanceId}|http://mu.semte.ch/vocabularies/core/uuid|undefined|1|2|"${uuid1}"|"${uuid2}"`);
        });

        test('unique statement contains more than one triple', () => {
            const instanceId = buildConceptSnapshotIri(uuid());
            const subject = namedNode(instanceId.value);
            const graph = namedNode(CONCEPT_GRAPH);
            const createdByIri1 = buildBestuurseenheidIri(uuid()).value;
            const createdByIri2 = buildBestuurseenheidIri(uuid()).value;

            const quads =
                [
                    quad(subject, NS.rdf('type'), NS.lpdcExt('InstancePublicService'), graph),
                    quad(subject, NS.mu('uuid'), literal(uuid()), graph),
                    quad(subject, NS.pav('createdBy'), namedNode(createdByIri1), graph),
                    quad(subject, NS.pav('createdBy'), namedNode(createdByIri2), graph),
                    quad(subject, NS.schema('dateCreated'), literal(InstanceTestBuilder.DATE_CREATED.value), graph),
                    quad(subject, NS.schema('dateModified'), literal(InstanceTestBuilder.DATE_MODIFIED.value), graph),
                    quad(subject, NS.adms('status'), NS.concepts.instanceStatus(InstanceTestBuilder.STATUS), graph),
                    quad(subject, NS.lpdcExt('dutchLanguageVariant'), literal(InstanceTestBuilder.DUTCH_LANGUAGE_VARIANT), graph),
                ];

            new QuadsToDomainMapper(quads, new Iri(CONCEPT_GRAPH), new LoggingDoubleQuadReporter(logger))
                .instance(instanceId);

            expect(loggerSpy).toHaveBeenCalledWith(`DoubleQuad|http://mu.semte.ch/graphs/public|${instanceId}|http://purl.org/pav/createdBy|undefined|1|2|<${createdByIri1}>|<${createdByIri2}>`);
        });

        test('language string contains more than one triple for same language', () => {
            const instanceId = buildInstanceIri(uuid());
            const subject = namedNode(instanceId.value);
            const graph = namedNode(CONCEPT_GRAPH);

            const quads =
                [
                    quad(subject, NS.rdf('type'), NS.lpdcExt('InstancePublicService'), graph),
                    quad(subject, NS.mu('uuid'), literal(uuid()), graph),
                    quad(subject, NS.pav('createdBy'), namedNode(buildBestuurseenheidIri(uuid()).value), graph),
                    quad(subject, NS.schema('dateCreated'), literal(InstanceTestBuilder.DATE_CREATED.value), graph),
                    quad(subject, NS.schema('dateModified'), literal(InstanceTestBuilder.DATE_MODIFIED.value), graph),
                    quad(subject, NS.adms('status'), NS.concepts.instanceStatus(InstanceTestBuilder.STATUS), graph),
                    quad(subject, NS.lpdcExt('dutchLanguageVariant'), literal(Language.NL), graph),
                    quad(subject, NS.dct('title'), literal('title nl', Language.NL), graph),
                    quad(subject, NS.dct('title'), literal('title nl another triple', Language.NL), graph),
                    quad(subject, NS.dct('title'), literal('title nl yet another triple', Language.NL), graph),
                ];

            new QuadsToDomainMapper(quads, new Iri(CONCEPT_GRAPH), new LoggingDoubleQuadReporter(logger))
                .instance(instanceId);

            expect(loggerSpy).toHaveBeenCalledWith(`DoubleQuad|http://mu.semte.ch/graphs/public|${instanceId}|http://purl.org/dc/terms/title|undefined|1|3|"title nl"@nl|"title nl another triple"@nl|"title nl yet another triple"@nl`);
        });

    });
    describe('sort', () => {
        const instanceId = buildInstanceIri(uuid());
        const bestuurseenheid = aBestuurseenheid().build();
        const cost1 = aMinimalCostForInstance().build();
        const subjectCost1 = namedNode(cost1.id.value);
        const cost2 = aMinimalCostForInstance().build();
        const subjectCost2 = namedNode(cost2.id.value);
        const subject = namedNode(instanceId.value);
        const graph = namedNode(bestuurseenheid.userGraph().value);

        test('When not all orders are unique, throw error', () => {
            const quads =
                [
                    quad(subject, NS.rdf('type'), NS.lpdcExt('InstancePublicService'), graph),
                    quad(subject, NS.mu('uuid'), literal(uuid()), graph),
                    quad(subject, NS.pav('createdBy'), namedNode(bestuurseenheid.id.value), graph),
                    quad(subject, NS.schema('dateCreated'), literal(InstanceTestBuilder.DATE_CREATED.value), graph),
                    quad(subject, NS.schema('dateModified'), literal(InstanceTestBuilder.DATE_MODIFIED.value), graph),
                    quad(subject, NS.adms('status'), NS.concepts.instanceStatus(InstanceTestBuilder.STATUS), graph),
                    quad(subject, NS.lpdcExt('dutchLanguageVariant'), literal(InstanceTestBuilder.DUTCH_LANGUAGE_VARIANT), graph),

                    quad(subject, NS.m8g('hasCost'), subjectCost1, graph),
                    quad(subjectCost1, NS.rdf('type'), NS.m8g('Cost'), graph),
                    quad(subjectCost1, NS.mu('uuid'), literal(uuid()), graph),
                    quad(subjectCost1, NS.dct('title'), literal('title 1', Language.NL), graph),
                    quad(subjectCost1, NS.dct('description'), literal('description 1', Language.NL), graph),
                    quad(subjectCost1, NS.sh('order'), literal('1', NS.xsd('integer')), graph),

                    quad(subject, NS.m8g('hasCost'), subjectCost2, graph),
                    quad(subjectCost2, NS.rdf('type'), NS.m8g('Cost'), graph),
                    quad(subjectCost2, NS.mu('uuid'), literal(uuid()), graph),
                    quad(subjectCost2, NS.dct('title'), literal('title 2', Language.NL), graph),
                    quad(subjectCost2, NS.dct('description'), literal('description 2', Language.NL), graph),
                    quad(subjectCost2, NS.sh('order'), literal('1', NS.xsd('integer')), graph),
                ];

            const domainMapper = new QuadsToDomainMapper(quads, bestuurseenheid.userGraph(), new LoggingDoubleQuadReporter(logger));
            expect(() => domainMapper.instance(instanceId)).toThrowWithMessage(SystemError, 'Not all orders are unique');


        });
        test('When all orders are unique, dont throw error', () => {
            const quads =
                [
                    quad(subject, NS.rdf('type'), NS.lpdcExt('InstancePublicService'), graph),
                    quad(subject, NS.mu('uuid'), literal(uuid()), graph),
                    quad(subject, NS.pav('createdBy'), namedNode(bestuurseenheid.id.value), graph),
                    quad(subject, NS.schema('dateCreated'), literal(InstanceTestBuilder.DATE_CREATED.value), graph),
                    quad(subject, NS.schema('dateModified'), literal(InstanceTestBuilder.DATE_MODIFIED.value), graph),
                    quad(subject, NS.adms('status'), NS.concepts.instanceStatus(InstanceTestBuilder.STATUS), graph),
                    quad(subject, NS.lpdcExt('dutchLanguageVariant'), literal(Language.NL), graph),

                    quad(subject, NS.m8g('hasCost'), subjectCost1, graph),
                    quad(subjectCost1, NS.rdf('type'), NS.m8g('Cost'), graph),
                    quad(subjectCost1, NS.mu('uuid'), literal(uuid()), graph),
                    quad(subjectCost1, NS.dct('title'), literal('title 1', Language.NL), graph),
                    quad(subjectCost1, NS.dct('description'), literal('description 1', Language.NL), graph),
                    quad(subjectCost1, NS.sh('order'), literal('0', NS.xsd('integer')), graph),

                    quad(subject, NS.m8g('hasCost'), subjectCost2, graph),
                    quad(subjectCost2, NS.rdf('type'), NS.m8g('Cost'), graph),
                    quad(subjectCost2, NS.mu('uuid'), literal(uuid()), graph),
                    quad(subjectCost2, NS.dct('title'), literal('title 2', Language.NL), graph),
                    quad(subjectCost2, NS.dct('description'), literal('description 2', Language.NL), graph),
                    quad(subjectCost2, NS.sh('order'), literal('1', NS.xsd('integer')), graph),
                ];

            const domainMapper = new QuadsToDomainMapper(quads, bestuurseenheid.userGraph(), new LoggingDoubleQuadReporter(logger));
            expect(() => domainMapper.instance(instanceId)).not.toThrow();
        });

        test('When correctly no orders are present, dont throw error', () => {
            const quads =
                [
                    quad(subject, NS.rdf('type'), NS.lpdcExt('InstancePublicService'), graph),
                    quad(subject, NS.mu('uuid'), literal(uuid()), graph),
                    quad(subject, NS.pav('createdBy'), namedNode(bestuurseenheid.id.value), graph),
                    quad(subject, NS.schema('dateCreated'), literal(InstanceTestBuilder.DATE_CREATED.value), graph),
                    quad(subject, NS.schema('dateModified'), literal(InstanceTestBuilder.DATE_MODIFIED.value), graph),
                    quad(subject, NS.adms('status'), NS.concepts.instanceStatus(InstanceTestBuilder.STATUS), graph),
                    quad(subject, NS.lpdcExt('dutchLanguageVariant'), literal(InstanceTestBuilder.DUTCH_LANGUAGE_VARIANT), graph),
                ];

            const domainMapper = new QuadsToDomainMapper(quads, bestuurseenheid.userGraph(), new LoggingDoubleQuadReporter(logger));
            expect(() => domainMapper.instance(instanceId)).not.toThrow();
        });

        test('When a order is missing, throw error', () => {
            const quads =
                [
                    quad(subject, NS.rdf('type'), NS.lpdcExt('InstancePublicService'), graph),
                    quad(subject, NS.mu('uuid'), literal(uuid()), graph),
                    quad(subject, NS.pav('createdBy'), namedNode(bestuurseenheid.id.value), graph),
                    quad(subject, NS.schema('dateCreated'), literal(InstanceTestBuilder.DATE_CREATED.value), graph),
                    quad(subject, NS.schema('dateModified'), literal(InstanceTestBuilder.DATE_MODIFIED.value), graph),
                    quad(subject, NS.adms('status'), NS.concepts.instanceStatus(InstanceTestBuilder.STATUS), graph),
                    quad(subject, NS.lpdcExt('dutchLanguageVariant'), literal(InstanceTestBuilder.DUTCH_LANGUAGE_VARIANT), graph),

                    quad(subject, NS.m8g('hasCost'), subjectCost1, graph),
                    quad(subjectCost1, NS.rdf('type'), NS.m8g('Cost'), graph),
                    quad(subjectCost1, NS.mu('uuid'), literal(uuid()), graph),
                    quad(subjectCost1, NS.dct('title'), literal('title 1', Language.NL), graph),
                    quad(subjectCost1, NS.dct('description'), literal('description 1', Language.NL), graph),

                    quad(subject, NS.m8g('hasCost'), subjectCost2, graph),
                    quad(subjectCost2, NS.rdf('type'), NS.m8g('Cost'), graph),
                    quad(subjectCost2, NS.mu('uuid'), literal(uuid()), graph),
                    quad(subjectCost2, NS.dct('title'), literal('title 2', Language.NL), graph),
                    quad(subjectCost2, NS.dct('description'), literal('description 2', Language.NL), graph),
                    quad(subjectCost2, NS.sh('order'), literal('1', NS.xsd('integer')), graph),
                ];

            const domainMapper = new QuadsToDomainMapper(quads, bestuurseenheid.userGraph(), new LoggingDoubleQuadReporter(logger));
            expect(() => domainMapper.instance(instanceId)).toThrowWithMessage(InvariantError, `order mag niet ontbreken`);
        });

        test('When 2 orders have same order, throw error', () => {
            const quads =
                [
                    quad(subject, NS.rdf('type'), NS.lpdcExt('InstancePublicService'), graph),
                    quad(subject, NS.mu('uuid'), literal(uuid()), graph),
                    quad(subject, NS.pav('createdBy'), namedNode(bestuurseenheid.id.value), graph),
                    quad(subject, NS.schema('dateCreated'), literal(InstanceTestBuilder.DATE_CREATED.value), graph),
                    quad(subject, NS.schema('dateModified'), literal(InstanceTestBuilder.DATE_MODIFIED.value), graph),
                    quad(subject, NS.adms('status'), NS.concepts.instanceStatus(InstanceTestBuilder.STATUS), graph),
                    quad(subject, NS.lpdcExt('dutchLanguageVariant'), literal(InstanceTestBuilder.DUTCH_LANGUAGE_VARIANT), graph),

                    quad(subject, NS.m8g('hasCost'), subjectCost1, graph),
                    quad(subjectCost1, NS.rdf('type'), NS.m8g('Cost'), graph),
                    quad(subjectCost1, NS.mu('uuid'), literal(uuid()), graph),
                    quad(subjectCost1, NS.dct('title'), literal('title 1', Language.NL), graph),
                    quad(subjectCost1, NS.dct('description'), literal('description 1', Language.NL), graph),
                    quad(subjectCost1, NS.sh('order'), literal('1', NS.xsd('integer')), graph),

                    quad(subject, NS.m8g('hasCost'), subjectCost2, graph),
                    quad(subjectCost2, NS.rdf('type'), NS.m8g('Cost'), graph),
                    quad(subjectCost2, NS.mu('uuid'), literal(uuid()), graph),
                    quad(subjectCost2, NS.dct('title'), literal('title 2', Language.NL), graph),
                    quad(subjectCost2, NS.dct('description'), literal('description 2', Language.NL), graph),
                    quad(subjectCost2, NS.sh('order'), literal('1', NS.xsd('integer')), graph),
                ];

            const domainMapper = new QuadsToDomainMapper(quads, bestuurseenheid.userGraph(), new LoggingDoubleQuadReporter(logger));
            expect(() => domainMapper.instance(instanceId)).toThrowWithMessage(SystemError, `Not all orders are unique`);
        });
    });
});
