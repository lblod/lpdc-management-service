import {Bestuurseenheid} from "../../core/domain/bestuurseenheid";
import {Concept} from "../../core/domain/concept";
import {Instance} from "../../core/domain/instance";
import {Iri} from "../../core/domain/shared/iri";
import {SemanticFormsMapper} from "../../core/port/driven/persistence/semantic-forms-mapper";
import {DomainToQuadsMapper} from "./domain-to-quads-mapper";
import {CONCEPT_GRAPH} from "../../../config";
import {DoubleQuadReporter, LoggingDoubleQuadReporter, QuadsToDomainMapper} from "../external/quads-to-domain-mapper";
import {Logger} from "../../../platform/logger";
import {Quad} from "rdflib/lib/tf-types";
import {graph, namedNode, parse, quad} from 'rdflib';
import {uuid} from "../../../mu-helper";

export class SemanticFormsMapperImpl implements SemanticFormsMapper {

    protected doubleQuadReporter: DoubleQuadReporter = new LoggingDoubleQuadReporter(new Logger('Instance-QuadsToDomainLogger'));

    constructor(doubleQuadReporter?: DoubleQuadReporter) {
        if (doubleQuadReporter) {
            this.doubleQuadReporter = doubleQuadReporter;
        }
    }

    instanceAsTurtleFormat(bestuurseenheid: Bestuurseenheid, instance: Instance): string[] {
        return new DomainToQuadsMapper(bestuurseenheid.userGraph()).instanceToQuads(instance).map(s => s.toNT());
    }

    mergeInstance(bestuurseenheid: Bestuurseenheid, instance: Instance, removalsInTurtleFormat: string, additionsInTurtleFormat: string): Instance {
        const instanceQuads = new DomainToQuadsMapper(bestuurseenheid.userGraph()).instanceToQuads(instance);

        const removals = this.parseStatements(bestuurseenheid.userGraph(), removalsInTurtleFormat);
        const additions = this.parseStatements(bestuurseenheid.userGraph(), additionsInTurtleFormat);

        const mergedQuads =
            [...instanceQuads.filter(q => !removals.find(toRemoveQuad => toRemoveQuad.equals(q))),
                ...additions];

        return new QuadsToDomainMapper(mergedQuads, bestuurseenheid.userGraph(), this.doubleQuadReporter)
            .instance(instance.id);
    }

    conceptAsTurtleFormat(concept: Concept): string[] {
        return new DomainToQuadsMapper(new Iri(CONCEPT_GRAPH)).conceptToQuads(concept).map(s => s.toNT());
    }

    private parseStatements(aGraph: Iri, statements: string): Quad[] {
        const store = graph();
        const mutatingGraph = `http://mutate-graph/${uuid()}`;
        parse(statements, store, mutatingGraph, 'text/turtle');
        return store
            .match(undefined, undefined, undefined, namedNode(mutatingGraph))
            .map(q => quad(q.subject, q.predicate, q.object, namedNode(aGraph.value)));
    }


}
