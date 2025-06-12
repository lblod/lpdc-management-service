import { Bestuurseenheid } from "../../core/domain/bestuurseenheid";
import { Concept } from "../../core/domain/concept";
import { Instance } from "../../core/domain/instance";
import { Iri } from "../../core/domain/shared/iri";
import {
  ComparisonSource,
  SemanticFormsMapper,
} from "../../core/port/driven/persistence/semantic-forms-mapper";
import { DomainToQuadsMapper } from "./domain-to-quads-mapper";
import { CONCEPT_GRAPH, CONCEPT_SNAPSHOT_LDES_GRAPH } from "../../../config";
import {
  DoubleQuadReporter,
  LoggingDoubleQuadReporter,
  QuadsToDomainMapper,
} from "../shared/quads-to-domain-mapper";
import { Logger } from "../../../platform/logger";
import { Quad } from "rdflib/lib/tf-types";
import {
  graph,
  literal,
  Literal,
  namedNode,
  parse,
  quad,
  Statement,
} from "rdflib";
import { uuid } from "../../../mu-helper";
import { ConceptSnapshot } from "../../core/domain/concept-snapshot";
import { NS } from "./namespaces";

export class SemanticFormsMapperImpl implements SemanticFormsMapper {
  protected doubleQuadReporter: DoubleQuadReporter =
    new LoggingDoubleQuadReporter(new Logger("Instance-QuadsToDomainLogger"));

  constructor(doubleQuadReporter?: DoubleQuadReporter) {
    if (doubleQuadReporter) {
      this.doubleQuadReporter = doubleQuadReporter;
    }
  }

  instanceAsTurtleFormat(
    bestuurseenheid: Bestuurseenheid,
    instance: Instance,
  ): string[] {
    return new DomainToQuadsMapper(bestuurseenheid.userGraph())
      .instanceToQuads(instance)
      .map((q) => this.parseBooleanQuad(q)) // rdflib serializer in ui needs booleans to be '0' or '1'
      .map((s) => s.toNT());
  }

  mergeInstance(
    bestuurseenheid: Bestuurseenheid,
    instance: Instance,
    removalsInTurtleFormat: string,
    additionsInTurtleFormat: string,
  ): Instance {
    const instanceQuads = new DomainToQuadsMapper(bestuurseenheid.userGraph())
      .instanceToQuads(instance)
      .map((q) => this.parseBooleanQuad(q)); // rdflib serializer in ui needs booleans to be '0' or '1'

    const removals = this.parseStatements(
      bestuurseenheid.userGraph(),
      removalsInTurtleFormat,
    );
    const additions = this.parseStatements(
      bestuurseenheid.userGraph(),
      additionsInTurtleFormat,
    );

    const mergedQuads = [
      ...instanceQuads.filter(
        (q) => !removals.find((toRemoveQuad) => toRemoveQuad.equals(q)),
      ),
      ...additions,
    ];

    return new QuadsToDomainMapper(
      mergedQuads,
      bestuurseenheid.userGraph(),
      this.doubleQuadReporter,
    ).instance(instance.id);
  }

  conceptAsTurtleFormat(concept: Concept): string[] {
    return new DomainToQuadsMapper(new Iri(CONCEPT_GRAPH))
      .conceptToQuads(concept)
      .map((q) => this.parseBooleanQuad(q))
      .map((s) => s.toNT());
  }

  conceptSnapshotAsTurtleFormat(conceptSnapshot: ConceptSnapshot): string[] {
    return new DomainToQuadsMapper(new Iri(CONCEPT_SNAPSHOT_LDES_GRAPH))
      .conceptSnapshotToQuads(conceptSnapshot)
      .map((q) => this.parseBooleanQuad(q))
      .map((s) => s.toNT());
  }

  comparisonSourceAsTurtleFormat(
    comparisonSources: ComparisonSource[],
    type: "current" | "latest",
  ): string[] {
    const predicate =
      type === "current"
        ? NS.ext("comparisonSourceCurrent").value
        : NS.ext("comparisonSourceLatest").value;
    return comparisonSources.map(
      (cs) =>
        `<${cs.instanceSourceIri}> <${predicate}> <${cs.conceptSnapshotSourceIri}> .`,
    );
  }

  private parseStatements(aGraph: Iri, statements: string): Quad[] {
    const store = graph();
    const mutatingGraph = `http://mutate-graph/${uuid()}`;
    parse(statements, store, mutatingGraph, "text/turtle");
    return store
      .match(undefined, undefined, undefined, namedNode(mutatingGraph))
      .map((q) =>
        quad(q.subject, q.predicate, q.object, namedNode(aGraph.value)),
      );
  }

  private parseBooleanQuad(statement: Statement): Statement {
    if (
      (statement.object as Literal).datatype?.value === NS.xsd("boolean").value
    ) {
      const value = statement.object.value;
      const booleanValue = value === "1" || value === "true";
      const booleanLiteral = literal(
        booleanValue ? "1" : "0",
        NS.xsd("boolean"),
      );
      return quad(
        statement.subject,
        statement.predicate,
        booleanLiteral,
        statement.graph,
      );
    }
    return statement;
  }
}
